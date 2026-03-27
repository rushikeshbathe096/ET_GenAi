from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple


PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from rag.build_index import build_index, get_similar_events  # noqa: E402
from agents.analysis_agent import compute_signals  # noqa: E402


INPUT_PATH = PROJECT_ROOT / "data" / "signals" / "mock.json"
OUTPUT_PATH = PROJECT_ROOT / "data" / "cache" / "today.json"


WEIGHTS: Dict[str, float] = {
    "insider_trade": 1.6,
    "bulk_deal": 1.1,
    "price_movement": 1.0,
    "news_sentiment": 0.6,
    "announcement": 0.8,
    "regulatory_change": 0.8,
    "technical_pattern": 0.9,
}

DECISION_ORDER = ["STRONG_SELL", "SELL", "HOLD", "BUY", "STRONG_BUY"]


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)


def _build_query(signal: Dict[str, Any]) -> str:
    filing_parts = []
    for item in signal.get("filing_signals", []):
        if isinstance(item, dict):
            deal_type = item.get("deal_type", "")
            reason = item.get("score_reason", "")
            filing_parts.append(f"{deal_type} {reason}".strip())
        else:
            filing_parts.append(str(item))

    pattern_parts = []
    for item in signal.get("technical_patterns", []):
        if isinstance(item, dict):
            pattern_parts.append(str(item.get("type", "")))
        else:
            pattern_parts.append(str(item))

    core = [
        str(signal.get("ticker", "")),
        str(signal.get("company", "")),
        str(signal.get("why_now", "")),
        " ".join(filing_parts),
        " ".join(pattern_parts),
    ]
    return " ".join([part for part in core if part]).strip()


def _compute_historical_base_rate(similar_events: List[Dict[str, Any]]) -> str:
    total = len(similar_events)
    if total == 0:
        return "0/0 events gave >10% return"

    wins = sum(1 for e in similar_events if _safe_float(e.get("outcome_pct_30d"), 0.0) > 10.0)
    return f"{wins}/{total} events gave >10% return"


def _decision_from_total(total_score: float) -> str:
    if total_score >= 2.5:
        return "STRONG_BUY"
    if total_score >= 1.0:
        return "BUY"
    if total_score > -1.0:
        return "HOLD"
    if total_score > -2.5:
        return "SELL"
    return "STRONG_SELL"


def _downgrade_towards_hold(decision: str) -> str:
    if decision not in DECISION_ORDER:
        return "HOLD"

    idx = DECISION_ORDER.index(decision)
    hold_idx = DECISION_ORDER.index("HOLD")

    if idx > hold_idx:
        return DECISION_ORDER[idx - 1]
    if idx < hold_idx:
        return DECISION_ORDER[idx + 1]
    return "HOLD"


def _signal_weight(signal_type: str) -> float:
    return WEIGHTS.get(signal_type, 0.7)


def _extract_signal_components(signal: Dict[str, Any]) -> List[Dict[str, Any]]:
    components: List[Dict[str, Any]] = []

    for item in signal.get("filing_signals", []):
        if not isinstance(item, dict):
            continue
        signal_type = str(item.get("deal_type", "unknown"))
        score = _safe_float(item.get("score"), 0.0)
        weight = _signal_weight(signal_type)
        components.append(
            {
                "type": signal_type,
                "score": score,
                "weight": weight,
                "weighted_score": score * weight,
                "score_reason": str(item.get("score_reason", "")).strip(),
            }
        )

    for pattern in signal.get("technical_patterns", []):
        if not isinstance(pattern, dict):
            continue
        score = _safe_float(pattern.get("score_add"), 0.0)
        if score == 0.0:
            continue
        components.append(
            {
                "type": "technical_pattern",
                "score": score,
                "weight": _signal_weight("technical_pattern"),
                "weighted_score": score * _signal_weight("technical_pattern"),
                "score_reason": str(pattern.get("reason", "")).strip(),
            }
        )

    return components


def _compute_confluence(components: List[Dict[str, Any]]) -> Tuple[float, float]:
    if not components:
        return 0.0, 2.5

    raw_total = sum(_safe_float(item.get("score"), 0.0) for item in components)
    weighted_total = sum(_safe_float(item.get("weighted_score"), 0.0) for item in components)
    max_abs = sum(abs(_safe_float(item.get("score"), 0.0) * _safe_float(item.get("weight"), 0.0)) for item in components)

    if max_abs == 0:
        confluence_score = 2.5
    else:
        normalized = weighted_total / max_abs  # [-1, 1]
        confluence_score = round(((normalized + 1.0) / 2.0) * 5.0, 2)

    return raw_total, confluence_score


def _detect_conflict(components: List[Dict[str, Any]]) -> bool:
    positives = [item for item in components if _safe_float(item.get("score"), 0.0) > 0.25]
    negatives = [item for item in components if _safe_float(item.get("score"), 0.0) < -0.25]
    return bool(positives and negatives)


def _confidence(total_score: float, has_conflict: bool) -> str:
    if has_conflict:
        return "LOW"

    if abs(total_score) >= 2.5:
        return "HIGH"
    if abs(total_score) >= 1.0:
        return "MEDIUM"
    return "LOW"


def _build_signal_summary(components: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    summary = []
    for item in components:
        score = _safe_float(item.get("score"), 0.0)
        summary.append(
            {
                "type": str(item.get("type", "unknown")),
                "score": round(score, 2),
                "weight": _safe_float(item.get("weight"), 0.0),
                "direction": "positive" if score > 0 else "negative" if score < 0 else "neutral",
                "reason": str(item.get("score_reason", "")).strip() or None,
            }
        )
    return summary


def _meaningful_why_now(components: List[Dict[str, Any]], has_conflict: bool) -> str:
    if not components:
        return "Signals are limited, so this setup should be monitored until clearer confirmation appears."

    sorted_components = sorted(
        components,
        key=lambda item: abs(_safe_float(item.get("weighted_score"), 0.0)),
        reverse=True,
    )

    top_positive = next((item for item in sorted_components if _safe_float(item.get("score"), 0.0) > 0), None)
    top_negative = next((item for item in sorted_components if _safe_float(item.get("score"), 0.0) < 0), None)

    positives = [item for item in sorted_components if _safe_float(item.get("score"), 0.0) > 0][:2]
    negatives = [item for item in sorted_components if _safe_float(item.get("score"), 0.0) < 0][:2]

    if top_positive and top_negative:
        pos_name = str(top_positive.get("type", "positive signal")).replace("_", " ")
        neg_name = str(top_negative.get("type", "negative signal")).replace("_", " ")
        base = f"{pos_name.title()} is supportive, but {neg_name} is acting as a drag."
        if has_conflict:
            return base + " Mixed direction across signals reduces conviction."
        return base

    if len(positives) >= 2:
        left = str(positives[0].get("type", "signal")).replace("_", " ")
        right = str(positives[1].get("type", "signal")).replace("_", " ")
        return f"{left.title()} and {right} both point to positive momentum in this setup."

    if len(negatives) >= 2:
        left = str(negatives[0].get("type", "signal")).replace("_", " ")
        right = str(negatives[1].get("type", "signal")).replace("_", " ")
        return f"{left.title()} and {right} both indicate downside pressure in the current setup."

    single = sorted_components[0]
    single_name = str(single.get("type", "signal")).replace("_", " ")
    direction = "positive" if _safe_float(single.get("score"), 0.0) > 0 else "negative" if _safe_float(single.get("score"), 0.0) < 0 else "neutral"
    return f"{single_name.title()} is the primary {direction} driver, while other signals remain limited."


def _prepare_signals_from_file(input_path: Path) -> List[Dict[str, Any]]:
    with open(input_path, "r", encoding="utf-8") as f:
        rows = json.load(f)

    if not isinstance(rows, list):
        raise ValueError("Input must be a JSON list")

    if rows and isinstance(rows[0], dict) and "filing_signals" in rows[0]:
        return rows

    # If parsed rows are provided directly, generate M2 signals first.
    return compute_signals(rows)


def _resolve_input_path(explicit_input: Path | None = None) -> Path:
    if explicit_input and explicit_input.exists():
        return explicit_input

    signals_dir = PROJECT_ROOT / "data" / "signals"
    parsed_dir = PROJECT_ROOT / "data" / "parsed"

    signal_files = sorted([p for p in signals_dir.glob("*.json") if p.name != "mock.json"])
    if signal_files:
        return signal_files[-1]

    parsed_files = sorted([p for p in parsed_dir.glob("*.json") if p.name != "mock.json"])
    if parsed_files:
        return parsed_files[-1]

    if INPUT_PATH.exists():
        return INPUT_PATH

    raise FileNotFoundError("No signal or parsed input file found")


def enrich_signal(signal: Dict[str, Any], k: int = 3) -> Dict[str, Any]:
    query = _build_query(signal)
    try:
        similar_events = get_similar_events(query, k=k)
        if not isinstance(similar_events, list):
            similar_events = []
    except Exception:
        similar_events = []

    components = _extract_signal_components(signal)
    total_score, confluence_score = _compute_confluence(components)
    conflict = _detect_conflict(components)

    decision = _decision_from_total(total_score)
    if conflict:
        decision = _downgrade_towards_hold(decision)

    confidence = _confidence(total_score, conflict)
    why_now = _meaningful_why_now(components, conflict)

    enriched = dict(signal)
    enriched["total_score"] = round(total_score, 2)
    enriched["confluence_score"] = confluence_score
    enriched["decision"] = decision
    enriched["confidence"] = confidence
    enriched["why_now"] = why_now
    enriched["signals"] = _build_signal_summary(components)
    enriched["signal_conflict"] = conflict

    # Backward-compatible fields retained for current API and tests.
    enriched["similar_events"] = similar_events
    enriched["historical_base_rate"] = _compute_historical_base_rate(similar_events)
    enriched["actionability"] = decision

    return enriched


def run_decision_pipeline(
    input_path: Path = INPUT_PATH,
    output_path: Path = OUTPUT_PATH,
    k: int = 3,
) -> List[Dict[str, Any]]:
    resolved_input = _resolve_input_path(input_path)
    signals = _prepare_signals_from_file(resolved_input)

    if not isinstance(signals, list):
        raise ValueError("Input must resolve to a JSON list of signals")

    try:
        sample = get_similar_events("health check query", k=1)
        if not isinstance(sample, list):
            raise ValueError("RAG retrieval health check failed")
    except FileNotFoundError:
        build_index()

    enriched_signals = [enrich_signal(signal, k=k) for signal in signals]

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(enriched_signals, f, indent=2)

    return enriched_signals


def test_decision_agent() -> None:
    enriched = run_decision_pipeline()
    print(json.dumps(enriched, indent=2))


def generate_decision(signals: List[Dict[str, Any]]) -> Dict[str, Any]:
    signal_rows = signals if isinstance(signals, list) else []

    if not signal_rows:
        return {
            "decision": "HOLD",
            "confidence": 15,
            "reasoning_summary": "No valid signals were available.",
        }

    positive_weight = 0.0
    negative_weight = 0.0
    pos_count = 0
    neg_count = 0

    for item in signal_rows:
        if not isinstance(item, dict):
            continue

        score = _safe_float(item.get("score"), 0.0)
        weight = _safe_float(item.get("weight"), 1.0)
        weighted_score = score * weight

        if weighted_score > 0:
            positive_weight += weighted_score
            pos_count += 1
        elif weighted_score < 0:
            negative_weight += abs(weighted_score)
            neg_count += 1

    total_strength = positive_weight + negative_weight
    net_strength = positive_weight - negative_weight
    conflict = positive_weight > 0 and negative_weight > 0

    if total_strength == 0:
        decision = "HOLD"
        confidence = 15
    else:
        dominance = abs(net_strength) / total_strength
        base_conf = int(round(max(0.0, min(1.0, dominance)) * 100))

        total_signals = pos_count + neg_count
        if total_signals == 1:
            base_conf = min(base_conf, 50)
        elif total_signals == 2:
            base_conf = min(base_conf, 65)
        elif total_signals == 3:
            base_conf = min(base_conf, 80)
        # 4+ signals: no cap, formula runs freely

        if conflict and dominance < 0.35:
            decision = "HOLD"
        elif net_strength > 0:
            decision = "BUY"
        elif net_strength < 0:
            decision = "SELL"
        else:
            decision = "HOLD"

        # Penalize conflicts and boost alignment while avoiding overconfidence.
        if conflict:
            confidence = base_conf - 20
            if decision != "HOLD":
                confidence -= 10
        else:
            confidence = base_conf + 10

        if decision == "HOLD":
            confidence = min(confidence, 60)
        if conflict:
            confidence = min(confidence, 80)

        confidence = max(10, min(100, confidence))

    reasoning_summary = (
        f"Weighted score +{round(positive_weight, 2)} / -{round(negative_weight, 2)}; "
        f"positive={pos_count}, negative={neg_count}."
    )

    return {
        "decision": decision,
        "confidence": int(max(0, min(100, confidence))),
        "reasoning_summary": reasoning_summary,
    }


if __name__ == "__main__":
    test_decision_agent()
