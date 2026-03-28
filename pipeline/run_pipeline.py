from datetime import date
from typing import Any, Dict, List

from agents.analysis_agent import compute_signals
from agents.decision_agent import generate_decision
from agents.explanation_agent import generate_explanation
from agents.sources.news import fetch_news_sentiment
from agents.sources.nse_source import fetch_price_data, fetch_bulk_deals, fetch_insider_trades
from nsepython import nse_get_top_gainers, nse_get_top_losers


def _normalize_symbol(symbol: str) -> str:
    normalized = str(symbol or "").strip().upper()
    if not normalized:
        raise ValueError("symbol is required")
    return normalized

def get_market_tickers() -> list[str]:
    import pandas as pd
    tickers = []
    try:
        gainers = nse_get_top_gainers()
        if isinstance(gainers, pd.DataFrame) and not gainers.empty:
            tickers += gainers["symbol"].str.strip().str.upper().tolist()[:5]
    except Exception:
        pass
    try:
        losers = nse_get_top_losers()
        if isinstance(losers, pd.DataFrame) and not losers.empty:
            tickers += losers["symbol"].str.strip().str.upper().tolist()[:5]
    except Exception:
        pass
    if not tickers:
        tickers = ["TCS", "INFY", "HDFCBANK"]
    return list(dict.fromkeys(tickers))


def _sanitize_output(payload: Dict[str, Any]) -> Dict[str, Any]:
    decision = str(payload.get("decision") or "HOLD").upper()
    if decision not in {"BUY", "SELL", "HOLD"}:
        decision = "HOLD"

    try:
        confidence = int(payload.get("confidence", 0))
    except (TypeError, ValueError):
        confidence = 0
    confidence = max(0, min(100, confidence))

    risks = payload.get("risks", [])
    if not isinstance(risks, list):
        risks = [str(risks)] if risks is not None else []

    signals = payload.get("signals", [])
    if not isinstance(signals, list):
        signals = []

    price = payload.get("price", None)
    try:
        price = float(price) if price is not None else None
    except (TypeError, ValueError):
        price = None

    change_pct = payload.get("change_pct", None)
    try:
        change_pct = float(change_pct) if change_pct is not None else None
    except (TypeError, ValueError):
        change_pct = None

    volume = payload.get("volume", None)
    try:
        volume = float(volume) if volume is not None else None
    except (TypeError, ValueError):
        volume = None

    price_data = payload.get("price_data", {}) if isinstance(payload.get("price_data", {}), dict) else {}

    return {
        "symbol": str(payload.get("symbol") or ""),
        "company": str(payload.get("company") or ""),
        "decision": decision,
        "confidence": confidence,
        "why_now": str(payload.get("why_now") or payload.get("why") or ""),
        "why": str(payload.get("why_now") or payload.get("why") or ""),
        "risks": risks,
        "signals": signals,
        "news": payload.get("news", {}),
        "price_data": payload.get("price_data", {}),
        "price": price_data.get("price"),
        "change_pct": price_data.get("change_pct"),
        "volume": price_data.get("volume"),
        "current_price": payload.get("current_price"),
        "date": payload.get("date"),
        "disclaimer": payload.get("disclaimer"),
        "actionability": payload.get("actionability", {}),
        "confidence_breakdown": payload.get("confidence_breakdown", []),
    }


def fetch_data(symbol: str) -> Dict[str, Any]:
    normalized = _normalize_symbol(symbol)

    price_data = fetch_price_data(normalized)
    insider_data = fetch_insider_trades(normalized)
    bulk_deals = fetch_bulk_deals(normalized)

    company = str(price_data.get("company") or normalized)
    news = fetch_news_sentiment(company)

    return {
        "symbol": normalized,
        "company": company,
        "price_data": price_data,
        "insider_data": insider_data if isinstance(insider_data, list) else [],
        "bulk_deals": bulk_deals if isinstance(bulk_deals, list) else [],
        "news": news if isinstance(news, dict) else {},
    }


def _build_actionability(decision: str, confidence: int) -> dict:
    if decision in ("BUY", "STRONG_BUY"):
        color = "green"
    elif decision in ("SELL", "STRONG_SELL"):
        color = "red"
    else:
        color = "yellow"
    
    if confidence >= 70:
        risk_level = "Low"
    elif confidence >= 45:
        risk_level = "Medium"
    else:
        risk_level = "High"
    
    return {
        "confidence_pct": f"{confidence}%",
        "risk_level": risk_level,
        "time_horizon": "Short-term (2-4 weeks)",
        "color": color
    }


def _build_confidence_breakdown(signals: list) -> list:
    total_score = sum(abs(s.get("score", 0)) for s in signals)
    breakdown = []
    for s in signals:
        if total_score == 0:
            pct = 0
        else:
            pct = round((abs(s.get("score", 0)) / total_score) * 100)
        breakdown.append({
            "label": s.get("reason", s.get("type", "signal")),
            "contribution_pct": pct
        })
    return breakdown

def analyze_stock(symbol: str) -> Dict[str, Any]:
    normalized = _normalize_symbol(symbol)
    price_data = fetch_price_data(normalized)
    company = price_data.get("company", normalized)
    payload = {
        "symbol": normalized,
        "company": company,
        "price_data": {
            "change_pct": price_data.get("change_pct", 0.0),
            "price": price_data.get("price"),
            "volume": price_data.get("volume"),
        },
        "bulk_deals": fetch_bulk_deals(normalized),
        "insider_data": fetch_insider_trades(normalized),
        "news": fetch_news_sentiment(company)
    }

    signals = compute_signals(payload)
    decision = generate_decision(signals)
    explanation = generate_explanation(decision, signals)

    computed_decision = str(decision.get("decision", "HOLD")).upper()
    try:
        computed_confidence = int(decision.get("confidence", 0))
    except (TypeError, ValueError):
        computed_confidence = 0

    output = {
        "symbol": payload["symbol"],
        "company": payload["company"],
        "price_data": payload["price_data"],
        "decision": computed_decision,
        "confidence": computed_confidence,
        "why": explanation.get("why_now", decision.get("why_now", "")),
        "risks": explanation.get("risks", decision.get("risks", [])),
        "signals": signals,
        "news": payload["news"],
        "current_price": payload["price_data"].get("price"),
        "date": date.today().strftime("%Y-%m-%d"),
        "disclaimer": "Educational analysis only. Not SEBI-registered investment advice.",
        "actionability": _build_actionability(computed_decision, computed_confidence),
        "confidence_breakdown": _build_confidence_breakdown(signals),
    }

    return _sanitize_output(output)


def run_pipeline(symbols: List[str]) -> List[Dict[str, Any]]:
    results = []
    for symbol in symbols:
        try:
            results.append(analyze_stock(symbol))
        except Exception:
            continue
    return results


def run_market_pipeline() -> list[dict]:
    tickers = get_market_tickers()
    results = []
    for ticker in tickers:
        try:
            result = analyze_stock(ticker)
            if result:
                results.append(result)
        except Exception as e:
            print(f"Failed for {ticker}: {e}")
    return results


__all__ = ["analyze_stock", "run_pipeline", "run_market_pipeline", "get_market_tickers"]
