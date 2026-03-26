from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, List


PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
	sys.path.insert(0, str(PROJECT_ROOT))

from rag.build_index import build_index, get_similar_events  # noqa: E402


INPUT_PATH = PROJECT_ROOT / "data" / "signals" / "mock.json"
OUTPUT_PATH = PROJECT_ROOT / "data" / "cache" / "today.json"


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

	wins = sum(1 for e in similar_events if float(e.get("outcome_pct_30d", 0.0)) > 10.0)
	return f"{wins}/{total} events gave >10% return"


def _driver_tags(signal: Dict[str, Any]) -> List[str]:
	tags: List[str] = []
	for item in signal.get("filing_signals", []):
		if not isinstance(item, dict):
			continue
		deal_type = str(item.get("deal_type", "")).lower()
		transaction = str(item.get("transaction", "")).lower()
		role = str(item.get("person_role", "")).lower()
		score = float(item.get("score", 0.0))

		if deal_type == "insider_trade" and transaction == "buy" and "promoter" in role:
			tags.append("promoter buying")
		elif deal_type == "insider_trade" and transaction == "buy":
			tags.append("insider accumulation")
		elif deal_type == "bulk_deal" and score > 0:
			tags.append("institutional bulk activity")
		elif deal_type == "news_sentiment" and score > 0.3:
			tags.append("positive sentiment")
		elif deal_type == "announcement":
			tags.append("fresh company disclosure")

	tech_patterns = signal.get("technical_patterns", [])
	if isinstance(tech_patterns, list) and len(tech_patterns) > 0:
		tags.append("technical confirmation")

	seen = set()
	ordered = []
	for tag in tags:
		if tag not in seen:
			ordered.append(tag)
			seen.add(tag)
	return ordered


def _risk_tags(signal: Dict[str, Any], similar_events: List[Dict[str, Any]], confluence_score: float) -> List[str]:
	risks: List[str] = []
	for item in signal.get("filing_signals", []):
		if not isinstance(item, dict):
			continue
		if str(item.get("deal_type", "")).lower() == "news_sentiment" and float(item.get("score", 0.0)) < -0.3:
			risks.append("negative sentiment could cap upside")

	if confluence_score < 5.0:
		risks.append("signal strength is still weak")

	wins = sum(1 for e in similar_events if float(e.get("outcome_pct_30d", 0.0)) > 10.0)
	total = len(similar_events)
	if total == 0 or wins == 0:
		risks.append("historical hit-rate support is limited")

	if not isinstance(signal.get("technical_patterns"), list) or len(signal.get("technical_patterns", [])) == 0:
		risks.append("technical confirmation is not yet visible")

	seen = set()
	ordered = []
	for risk in risks:
		if risk not in seen:
			ordered.append(risk)
			seen.add(risk)
	return ordered


def _descriptive_decision(signal: Dict[str, Any], similar_events: List[Dict[str, Any]], confluence_score: float) -> str:
	if confluence_score >= 8:
		strength = "High-conviction setup"
	elif confluence_score >= 6:
		strength = "Constructive setup"
	elif confluence_score >= 4:
		strength = "Balanced setup"
	else:
		strength = "Early-stage setup"

	drivers = _driver_tags(signal)
	if drivers:
		driver_text = ", ".join(drivers[:3])
	else:
		driver_text = "limited driver alignment"

	risks = _risk_tags(signal, similar_events, confluence_score)
	risk_text = risks[0] if risks else "confirmation is still required"

	return f"{strength}: drivers include {driver_text}. Risk: {risk_text}."


def enrich_signal(signal: Dict[str, Any], k: int = 3) -> Dict[str, Any]:
	query = _build_query(signal)
	try:
		similar_events = get_similar_events(query, k=k)
		if not isinstance(similar_events, list):
			similar_events = []
	except Exception:
		similar_events = []

	base_rate = _compute_historical_base_rate(similar_events)
	confluence_score = float(signal.get("confluence_score", 0.0))

	enriched = dict(signal)
	enriched["similar_events"] = similar_events
	enriched["historical_base_rate"] = base_rate
	enriched["actionability"] = _descriptive_decision(signal, similar_events, confluence_score)
	return enriched


def run_decision_pipeline(
	input_path: Path = INPUT_PATH,
	output_path: Path = OUTPUT_PATH,
	k: int = 3,
) -> List[Dict[str, Any]]:
	with open(input_path, "r", encoding="utf-8") as f:
		signals = json.load(f)

	if not isinstance(signals, list):
		raise ValueError("Input mock.json must be a JSON list")

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


if __name__ == "__main__":
	test_decision_agent()
