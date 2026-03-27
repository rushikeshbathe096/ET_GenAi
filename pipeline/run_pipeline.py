from datetime import date as date_cls
from typing import Any, Dict, List

from agents.analysis_agent import compute_signals
from agents.decision_agent import enrich_signal
from agents.utils.data_loader import load_parsed_data


def _signal_label(signal_type: str) -> str:
    return str(signal_type).replace("_", " ").strip().title()


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)


def _decision_and_confidence(signal_summary: List[Dict[str, Any]]) -> tuple[str, int, float, float, bool]:
    positive_weight = 0.0
    negative_weight = 0.0

    for item in signal_summary:
        if not isinstance(item, dict):
            continue
        score = _safe_float(item.get("score"), 0.0)
        weight = _safe_float(item.get("weight"), 1.0)
        weighted = score * weight

        if weighted > 0:
            positive_weight += weighted
        elif weighted < 0:
            negative_weight += abs(weighted)

    conflict = positive_weight > 0 and negative_weight > 0
    total_strength = positive_weight + negative_weight

    if conflict:
        decision = "HOLD"
    elif positive_weight > negative_weight and positive_weight >= 1.0:
        decision = "BUY"
    elif negative_weight > positive_weight and negative_weight >= 1.0:
        decision = "SELL"
    else:
        decision = "HOLD"

    if decision == "HOLD":
        if total_strength < 0.8:
            confidence = 24
        elif conflict:
            confidence = 45
        else:
            confidence = 58
    else:
        dominance = abs(positive_weight - negative_weight)
        confidence = int(round(70 + min(30, dominance * 10)))
        confidence = max(70, min(100, confidence))

    # Guardrail requested: very high confidence should never stay HOLD.
    if decision == "HOLD" and confidence > 75:
        confidence = 60

    return decision, confidence, positive_weight, negative_weight, conflict


def _build_why_now(signal_summary: List[Dict[str, Any]], decision: str, conflict: bool) -> str:
    positives = []
    negatives = []

    for item in signal_summary:
        if not isinstance(item, dict):
            continue

        score = _safe_float(item.get("score"), 0.0)
        weight = _safe_float(item.get("weight"), 1.0)
        weighted = score * weight
        reason = str(item.get("reason") or _signal_label(item.get("type", "signal"))).strip()
        signal_name = _signal_label(item.get("type", "signal"))

        entry = {
            "name": signal_name,
            "reason": reason,
            "strength": abs(weighted),
        }

        if weighted > 0:
            positives.append(entry)
        elif weighted < 0:
            negatives.append(entry)

    positives.sort(key=lambda row: row["strength"], reverse=True)
    negatives.sort(key=lambda row: row["strength"], reverse=True)

    if decision == "BUY":
        if len(positives) >= 2:
            return (
                f"{positives[0]['name']} and {positives[1]['name']} are driving the bullish setup, "
                f"with {positives[0]['reason'].lower()}."
            )
        if positives:
            return f"{positives[0]['name']} is the key upside driver, supported by {positives[0]['reason'].lower()}."
        return "Positive setup is emerging, but additional confirmation would strengthen conviction."

    if decision == "SELL":
        if len(negatives) >= 2:
            return (
                f"{negatives[0]['name']} and {negatives[1]['name']} are putting pressure on the setup, "
                f"with {negatives[0]['reason'].lower()}."
            )
        if negatives:
            return f"{negatives[0]['name']} is the main downside driver, highlighted by {negatives[0]['reason'].lower()}."
        return "Downside risk is elevated, though additional bearish confirmation is still useful."

    if conflict and positives and negatives:
        return (
            f"Signals are split: {positives[0]['name']} supports upside while {negatives[0]['name']} adds downside risk, "
            f"with bullish context from {positives[0]['reason'].lower()} and caution from {negatives[0]['reason'].lower()}."
        )

    if positives:
        return f"Constructive signals exist, led by {positives[0]['name']}, but conviction is not strong enough for a buy call."
    if negatives:
        return f"Risk signals are present, led by {negatives[0]['name']}, but not broad enough for a full sell call."
    return "Signal set is currently neutral, so no immediate directional edge is visible."


def generate_decision(signals: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not signals:
        return {
            "decision": "HOLD",
            "confidence": 20,
            "why_now": "No signals available for this stock.",
            "risks": ["No signal data available"],
            "signals": [],
        }

    enriched = enrich_signal(signals[0])
    signal_summary = enriched.get("signals", [])
    if not isinstance(signal_summary, list):
        signal_summary = []

    decision, confidence, _, _, conflict = _decision_and_confidence(signal_summary)

    why_now = _build_why_now(signal_summary, decision, conflict)

    risks: List[str] = []
    for item in signal_summary:
        if not isinstance(item, dict):
            continue
        if item.get("direction") == "negative":
            reason = item.get("reason") or item.get("type") or "Negative signal"
            risks.append(str(reason))

    if conflict:
        risks.append("Conflicting bullish and bearish signals")

    return {
        "decision": decision,
        "confidence": confidence,
        "why_now": why_now,
        "risks": risks,
        "signals": signal_summary,
    }


def run_pipeline() -> Dict[str, Any]:
    today = date_cls.today().isoformat()
    parsed_data = load_parsed_data(today)

    opportunities: List[Dict[str, Any]] = []

    for stock in parsed_data:
        if not isinstance(stock, dict):
            continue

        stock_signals = compute_signals([stock])
        stock_decision = generate_decision(stock_signals)

        opportunities.append(
            {
                "symbol": str(stock.get("ticker", "")),
                "company": str(stock.get("company", "")),
                "decision": stock_decision["decision"],
                "confidence": stock_decision["confidence"],
                "why_now": stock_decision["why_now"],
                "risks": stock_decision["risks"],
                "signals": stock_decision["signals"],
            }
        )

    opportunities.sort(key=lambda item: int(item.get("confidence", 0)), reverse=True)

    ranked_opportunities: List[Dict[str, Any]] = []
    for idx, item in enumerate(opportunities, start=1):
        ranked_opportunities.append(
            {
                "rank": idx,
                "symbol": item.get("symbol", ""),
                "company": item.get("company", ""),
                "decision": item.get("decision", "HOLD"),
                "confidence": int(item.get("confidence", 0)),
                "why_now": item.get("why_now", ""),
                "risks": item.get("risks", []),
                "signals": item.get("signals", []),
            }
        )

    return {
        "date": today,
        "opportunities": ranked_opportunities,
    }


__all__ = ["run_pipeline", "generate_decision", "compute_signals", "load_parsed_data"]