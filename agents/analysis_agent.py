import json
import glob
import os
from datetime import date
import yfinance as yf


# =========================
# STEP 1 — Filing Signal Scorer
# =========================
def score_filing_event(event: dict) -> dict:
    deal_type = event.get('deal_type', '')

    if deal_type == 'insider_trade' and event.get('transaction') == 'buy':
        role = event.get('person_role', '')
        value = event.get('value', 0)

        base = 3.0 if 'promoter' in role.lower() else \
               2.0 if 'director' in role.lower() else 1.0

        score = min(base, base * (value / 10_000_000))

        return {
            'score': round(score, 2),
            'score_reason': f'{role.title()} bought shares — Rs {value/1e7:.1f}Cr'
        }

    elif deal_type == 'bulk_deal':
        qty = event.get('quantity', 0)
        score = min(2.0, qty / 500_000)

        return {
            'score': round(score, 2),
            'score_reason': f'Institutional bulk deal — {qty:,} shares'
        }

    elif deal_type == 'announcement' and 'result' in event.get('title', '').lower():
        return {
            'score': 1.5,
            'score_reason': 'Quarterly results filed'
        }

    elif deal_type == 'regulatory_change':
        return {
            'score': 1.0,
            'score_reason': 'SEBI regulatory change'
        }

    elif deal_type == 'news_sentiment':
        s = event.get('score', 0)

        if s > 0.3:
            return {'score': 1.0, 'score_reason': 'Positive news sentiment'}
        elif s < -0.3:
            return {'score': -1.0, 'score_reason': 'Negative news — caution'}
        else:
            return {'score': 0.0, 'score_reason': 'Neutral news'}

    return {'score': 0.0, 'score_reason': 'No signal'}


# =========================
# STEP 2 — Why Now Engine
# =========================
def generate_why_now(ticker: str, events: list, news_score: float) -> str:
    parts = []

    promoter_buy = any(
        e.get('deal_type') == 'insider_trade' and
        e.get('person_role', '').lower() == 'promoter' and
        e.get('transaction') == 'buy'
        for e in events
    )

    has_bulk = any(e.get('deal_type') == 'bulk_deal' for e in events)

    has_result = any(
        'result' in e.get('title', '').lower()
        for e in events
    )

    if promoter_buy:
        parts.append('Promoter spending personal capital')

    if has_bulk and promoter_buy:
        parts.append('combined with institutional accumulation')

    if has_result:
        parts.append('earnings results filed this week')

    if news_score > 0.3:
        parts.append('positive news sentiment')

    if news_score < -0.3:
        parts.append('WARNING: negative news — review carefully')

    return ' + '.join(parts) if parts else ''


# =========================
# STEP 3 — Technical Patterns
# =========================
def check_technical_patterns(ticker: str) -> list[dict]:
    try:
        hist = yf.Ticker(f'{ticker}.NS').history(period='1y')

        if len(hist) < 50:
            return []

        patterns = []

        # 1. 200-day MA breakout
        ma200 = hist['Close'].rolling(200).mean()
        current = hist['Close'].iloc[-1]
        prev = hist['Close'].iloc[-2]

        if prev < ma200.iloc[-2] and current > ma200.iloc[-1]:
            patterns.append({
                'type': 'ma_breakout',
                'score_add': 1.0,
                'reason': 'Price crossed 200-day MA today'
            })

        # 2. Volume spike
        avg_vol = hist['Volume'].rolling(20).mean().iloc[-1]
        today_vol = hist['Volume'].iloc[-1]

        if today_vol > 2 * avg_vol:
            ratio = round(today_vol / avg_vol, 1)
            patterns.append({
                'type': 'volume_spike',
                'score_add': 1.0,
                'reason': f'Volume {ratio}x above 20-day average'
            })

        # 3. 52-week high proximity
        high_52w = hist['High'].max()

        if current >= 0.97 * high_52w:
            patterns.append({
                'type': '52w_high',
                'score_add': 1.0,
                'reason': f'Price near 52-week high of Rs {high_52w:.0f}'
            })

        return patterns

    except Exception:
        return []  # NEVER crash


# =========================
# STEP 4 — Contribution %
# =========================
def add_contribution_pct(signals: list) -> list:
    total = sum(max(0, s.get('score', 0)) for s in signals)

    if total == 0:
        return signals

    for s in signals:
        score = max(0, s.get('score', 0))
        pct = (score / total) * 100
        s['contribution_pct'] = round(pct)

    return signals


# =========================
# STEP 5 — Confluence Scoring
# =========================
def compute_confluence(company_data: dict) -> dict:
    events = company_data.get('events', [])
    news = company_data.get('news', {})
    ticker = company_data.get('ticker', '')

    # Score all filing events
    scored_events = []

    for event in events:
        result = score_filing_event(event)
        scored_events.append({**event, **result})

    # Add news as event
    news_event = {**news, 'deal_type': 'news_sentiment'}
    news_result = score_filing_event(news_event)
    scored_events.append({**news_event, **news_result})

    # Add contribution %
    scored_events = add_contribution_pct(scored_events)

    # Technical patterns
    tech_patterns = check_technical_patterns(ticker)
    tech_score = sum(p['score_add'] for p in tech_patterns)

    # Filing score (only positive)
    filing_score = sum(max(0, e.get('score', 0)) for e in scored_events)

    raw_total = filing_score + tech_score
    normalized = round(min(10.0, raw_total), 1)

    # Why Now
    why_now = generate_why_now(ticker, events, news.get('score', 0))

    return {
        **company_data,
        'filing_signals': scored_events,
        'technical_patterns': tech_patterns,
        'confluence_score': normalized,
        'why_now': why_now,
    }

def compute_signals(data):
    results = [compute_confluence(c) for c in data]

    results.sort(key=lambda x: x['confluence_score'], reverse=True)

    return results
# =========================
# STEP 6 — MAIN RUN
# =========================
def run(input_path='data/parsed', output_path='data/signals'):
    files = sorted(glob.glob(f'{input_path}/*.json'))

    if not files:
        raise Exception("❌ No input files found in data/parsed")

    latest_file = files[-1]

    with open(latest_file) as f:
        data = json.load(f)

    results = [compute_confluence(c) for c in data]

    # Sort by score descending
    results.sort(key=lambda x: x['confluence_score'], reverse=True)

    # Top 10 only
    results = results[:10]

    os.makedirs(output_path, exist_ok=True)

    output_file = f'{output_path}/{date.today()}.json'

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f'✅ Top 10 signals written to {output_file}')


# =========================
# ENTRY POINT
# =========================
if __name__ == "__main__":
    run()