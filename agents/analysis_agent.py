import json
import glob
import os
from datetime import date
import yfinance as yf
import requests

# Shared session and User-Agent for Yahoo calls.
session = requests.Session()
session.headers['User-agent'] = 'Mozilla/5.0'


def _to_float(value, default=0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)


def _safe_lower(value) -> str:
    if value is None:
        return ""
    return str(value).lower()


# =========================
# STEP 1 — Filing Signal Scorer
# =========================
def score_filing_event(event: dict) -> dict:
    deal_type = event.get('deal_type', '')

    if deal_type == 'insider_trade' and event.get('transaction') == 'buy':
        role = event.get('person_role', '')
        value = event.get('value', 0)

        role_lower = _safe_lower(role)
        base = 3.0 if 'promoter' in role_lower else \
               2.0 if 'director' in role_lower else 1.0

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

    elif deal_type == 'announcement' and 'result' in _safe_lower(event.get('title')):
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

    elif deal_type == 'price_movement':
        change_pct = _to_float(event.get('change_pct'), 0.0)

        if change_pct > 3:
            return {'score': 2.0, 'score_reason': 'Strong positive price momentum'}
        elif change_pct > 1:
            return {'score': 1.0, 'score_reason': 'Moderate upward movement'}
        elif change_pct < -2:
            return {'score': -2.0, 'score_reason': 'Strong negative momentum'}
        elif change_pct < -1:
            return {'score': -1.0, 'score_reason': 'Weak price decline'}
        return {'score': 0.0, 'score_reason': 'Flat price movement'}

    return {'score': 0.0, 'score_reason': 'No signal'}


# =========================
# STEP 2 — Why Now Engine
# =========================
def generate_why_now(ticker: str, events: list, news_score: float) -> str:
    parts = []

    promoter_buy = any(
        e.get('deal_type') == 'insider_trade' and
        _safe_lower(e.get('person_role')) == 'promoter' and
        e.get('transaction') == 'buy'
        for e in events
    )

    has_bulk = any(e.get('deal_type') == 'bulk_deal' for e in events)

    has_result = any(
        'result' in _safe_lower(e.get('title'))
        for e in events
    )

    price_event = next(
        (e for e in events if e.get('deal_type') == 'price_movement'),
        None
    )

    if promoter_buy:
        parts.append('Promoter spending personal capital')

    if has_bulk and promoter_buy:
        parts.append('combined with institutional accumulation')

    if has_result:
        parts.append('earnings results filed this week')

    if price_event:
        change_pct = _to_float(price_event.get('change_pct'), 0.0)
        if change_pct > 1:
            momentum = f'Stock is gaining momentum with +{change_pct:.1f}% move'
            if promoter_buy:
                momentum = f'{momentum} supported by insider buying'
            parts.append(momentum)
        elif change_pct < -1:
            parts.append(f'Stock is under pressure with {change_pct:.1f}% move')

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
        hist = yf.Ticker(f'{ticker}.NS', session=session).history(period='1y', interval='1d')

        if len(hist) < 50:
            return [
                {
                    "type": "technical_unavailable",
                    "reason": "Technical data not available, decision based on fundamentals and sentiment"
                }
            ]

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

        if not patterns:
            return [
                {
                    "type": "technical_unavailable",
                    "reason": "Technical data not available, decision based on fundamentals and sentiment"
                }
            ]

        return patterns

    except Exception:
        return [
            {
                "type": "technical_unavailable",
                "reason": "Technical data not available, decision based on fundamentals and sentiment"
            }
        ]  # NEVER crash


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
    tech_score = sum(float(p.get('score_add', 0.0)) for p in tech_patterns)

    # Filing score includes downside momentum and negative sentiment.
    filing_score = sum(float(e.get('score', 0.0)) for e in scored_events)

    raw_total = filing_score + tech_score
    normalized = round(max(0.0, min(10.0, raw_total)), 1)

    # Why Now
    why_now = generate_why_now(ticker, events, news.get('score', 0))

    return {
        **company_data,
        'filing_signals': scored_events,
        'technical_patterns': tech_patterns,
        'confluence_score': normalized,
        'why_now': why_now,
    }


def compute_signals(data: dict | list[dict]) -> list:
    # Single-stock mode: returns list of normalized signal objects.
    if isinstance(data, dict):
        return _compute_signals_for_stock(data)

    # Backward-compatible batch mode for existing scripts.
    if not isinstance(data, list):
        return []

    results = []
    for company_data in data:
        if not isinstance(company_data, dict):
            continue

        try:
            enriched = compute_confluence(company_data)
        except Exception:
            continue

        filing_signals = enriched.get("filing_signals", [])
        technical_patterns = enriched.get("technical_patterns", [])
        normalized_signals = _normalize_signal_rows(filing_signals, technical_patterns)

        if not normalized_signals:
            continue

        enriched["signals"] = normalized_signals
        results.append(enriched)

    results.sort(key=lambda x: x.get('confluence_score', 0.0), reverse=True)
    return results


def _compute_signals_for_stock(data: dict) -> list[dict]:
    symbol = str(data.get("symbol") or data.get("ticker") or "").strip().upper()
    weak_threshold = 0.25

    signal_map: dict[str, dict] = {}

    for item in data.get("insider_data", []):
        if not isinstance(item, dict):
            continue
        if bool(item.get("is_fallback", False)):
            continue
        txn = str(item.get("transaction") or "").strip().lower()
        role = str(item.get("person_role") or "insider").strip().lower()
        value = _to_float(item.get("value"), 0.0)
        if value <= 0:
            continue

        sign = 1.0 if txn == "buy" else -1.0 if txn == "sell" else 0.0
        if sign == 0.0:
            continue

        cr = value / 10_000_000.0
        base_score = min(3.0, max(0.3, cr))
        if "promoter" in role:
            base_score *= 1.2

        signed_score = round(sign * base_score, 2)
        if abs(signed_score) < weak_threshold:
            continue

        direction = "positive" if sign > 0 else "negative"
        action_text = "bought" if sign > 0 else "sold"
        reason = f"{role.title()} {action_text} shares worth Rs {cr:.1f}Cr".strip()
        if len(reason) < 10:
            continue
        candidate = {
            "type": "insider_trade",
            "score": signed_score,
            "weight": _signal_weight("insider_trade"),
            "direction": direction,
            "reason": reason,
        }
        existing = signal_map.get("insider_trade")
        if not existing or abs(candidate["score"]) > abs(existing.get("score", 0.0)):
            signal_map["insider_trade"] = candidate

    for item in data.get("bulk_deals", []):
        if not isinstance(item, dict):
            continue
        if bool(item.get("is_fallback", False)):
            continue
        qty = _to_float(item.get("quantity"), 0.0)
        if qty <= 0:
            continue

        score = min(2.0, max(0.2, qty / 500_000.0))
        if abs(score) < weak_threshold:
            continue
        reason = f"Bulk deal activity of {int(qty):,} shares"
        if len(reason.strip()) < 10:
            continue
        candidate = {
            "type": "bulk_deal",
            "score": round(score, 2),
            "weight": _signal_weight("bulk_deal"),
            "direction": "positive",
            "reason": reason,
        }
        existing = signal_map.get("bulk_deal")
        if not existing or abs(candidate["score"]) > abs(existing.get("score", 0.0)):
            signal_map["bulk_deal"] = candidate

    price_row = data.get("price_data", {})
    if isinstance(price_row, dict):
        change_pct = _to_float(price_row.get("change_pct"), 0.0)
        # Ignore weak movement (<1%), classify moderate and strong moves.
        if abs(change_pct) > 1.0:
            if change_pct > 2.0:
                score = 2.0
                direction = "positive"
                reason = f"Strong positive move of {change_pct:.2f}%"
            elif change_pct > 1.0:
                score = 1.0
                direction = "positive"
                reason = f"Moderate positive move of {change_pct:.2f}%"
            elif change_pct < -2.0:
                score = -2.0
                direction = "negative"
                reason = f"Strong negative move of {abs(change_pct):.2f}%"
            else:
                score = -1.0
                direction = "negative"
                reason = f"Moderate negative move of {abs(change_pct):.2f}%"

            if abs(score) >= weak_threshold and len(reason.strip()) >= 10:
                signal_map["price_movement"] = {
                    "type": "price_movement",
                    "score": round(score, 2),
                    "weight": _signal_weight("price_movement"),
                    "direction": direction,
                    "reason": reason,
                }

    news_row = data.get("news", {})
    if isinstance(news_row, dict):
        if bool(news_row.get("is_fallback", False)):
            news_row = {}

    if isinstance(news_row, dict) and news_row:
        news_score = _to_float(news_row.get("score"), 0.0)
        has_real_headline = bool(news_row.get("headlines"))
        if abs(news_score) >= 0.2 and has_real_headline:
            direction = "positive" if news_score > 0 else "negative"
            reason = f"News sentiment score is {news_score:.2f} for {symbol}"
            if len(reason.strip()) < 10:
                return list(signal_map.values())
            signal_map["news_sentiment"] = {
                "type": "news_sentiment",
                "score": round(news_score, 2),
                "weight": _signal_weight("news_sentiment"),
                "direction": direction,
                "reason": reason,
            }

    # At most 4 signal types by design: insider, bulk, price, news.
    return list(signal_map.values())


def _signal_weight(signal_type: str) -> float:
    weights = {
        "insider_trade": 1.6,
        "bulk_deal": 1.1,
        "announcement": 0.8,
        "regulatory_change": 0.8,
        "news_sentiment": 0.6,
        "price_movement": 1.0,
        "technical_pattern": 0.9,
        "ma_breakout": 0.9,
        "volume_spike": 0.8,
        "52w_high": 0.7,
    }
    return float(weights.get(str(signal_type or "").strip(), 0.7))


def _build_signal_obj(signal_type: str, score: float, reason: str) -> dict | None:
    normalized_type = str(signal_type or "").strip()
    normalized_reason = str(reason or "").strip()
    normalized_score = _to_float(score, 0.0)

    if not normalized_type:
        return None

    if normalized_score == 0.0:
        return None

    if normalized_reason.lower() in {"no signal", "neutral news", "flat price movement"}:
        return None

    return {
        "type": normalized_type,
        "score": round(normalized_score, 2),
        "weight": _signal_weight(normalized_type),
        "direction": "positive" if normalized_score > 0 else "negative",
        "reason": normalized_reason or normalized_type.replace("_", " ").title(),
    }


def _normalize_signal_rows(filing_signals: list, technical_patterns: list) -> list[dict]:
    normalized = []

    for item in filing_signals:
        if not isinstance(item, dict):
            continue

        row = _build_signal_obj(
            signal_type=str(item.get("deal_type", "unknown")),
            score=_to_float(item.get("score"), 0.0),
            reason=str(item.get("score_reason", "")),
        )

        if row:
            normalized.append(row)

    for pattern in technical_patterns:
        if not isinstance(pattern, dict):
            continue

        row = _build_signal_obj(
            signal_type=str(pattern.get("type", "technical_pattern")),
            score=_to_float(pattern.get("score_add"), 0.0),
            reason=str(pattern.get("reason", "")),
        )

        if row:
            normalized.append(row)

    return normalized


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

    results = compute_signals(data)

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