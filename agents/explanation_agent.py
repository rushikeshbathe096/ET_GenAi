from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, List


PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
	sys.path.insert(0, str(PROJECT_ROOT))

from agents.decision_agent import run_decision_pipeline  # noqa: E402


INPUT_PATH = PROJECT_ROOT / "data" / "signals" / "mock.json"
OUTPUT_PATH = PROJECT_ROOT / "data" / "cache" / "today.json"


def call_llm(prompt: str) -> str:
	# Mock only: replace with real LLM call in a later phase.
	return f"Mock explanation generated for: {prompt[:140]}"


def _historical_strength(historical_base_rate: str) -> str:
	try:
		left = historical_base_rate.split(" events")[0]
		wins, total = left.split("/")
		wins_i = int(wins)
		total_i = int(total)
	except Exception:
		return "mixed"

	if total_i == 0:
		return "mixed"

	ratio = wins_i / total_i
	if ratio >= 0.67:
		return "strong"
	if ratio >= 0.34:
		return "moderate"
	return "weak"


def _build_reasoning_card(signal: Dict[str, Any]) -> List[str]:
	ticker = str(signal.get("ticker", "Unknown"))
	actionability = str(signal.get("actionability", "low"))
	why_now = str(signal.get("why_now", "")).strip() or "Recent filings and patterns are being tracked"
	historical_base_rate = str(signal.get("historical_base_rate", "0/0 events gave >10% return"))
	hist_strength = _historical_strength(historical_base_rate)

	similar_events = signal.get("similar_events", [])
	top_event = similar_events[0] if isinstance(similar_events, list) and similar_events else {}
	top_event_company = str(top_event.get("company", "similar companies"))

	prompt = (
		f"Create simple explanation for {ticker} with actionability {actionability}, "
		f"base rate {historical_base_rate}, top match {top_event_company}, and why now {why_now}."
	)
	_ = call_llm(prompt)

	sentence_1 = f"{ticker} is marked as {actionability} confidence due to multiple supporting signals in the current setup."
	sentence_2 = f"Why now: {why_now}."
	sentence_3 = (
		f"Historical precedent shows {hist_strength} outcomes ({historical_base_rate}). This is presented as analytical data only."
	)

	return [sentence_1, sentence_2, sentence_3]


def _build_confidence_breakdown(signal: Dict[str, Any]) -> Dict[str, Any]:
	similar_events = signal.get("similar_events", [])
	outcomes = []
	if isinstance(similar_events, list):
		outcomes = [float(e.get("outcome_pct_30d", 0.0)) for e in similar_events if isinstance(e, dict)]

	positive_10 = sum(1 for o in outcomes if o > 10.0)
	total = len(outcomes)

	return {
		"confluence_score": float(signal.get("confluence_score", 0.0)),
		"actionability": str(signal.get("actionability", "low")),
		"historical_base_rate": str(signal.get("historical_base_rate", "0/0 events gave >10% return")),
		"similar_events_count": total,
		"similar_events_above_10pct": positive_10,
	}


def enrich_explanations(signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
	enriched: List[Dict[str, Any]] = []
	for signal in signals:
		row = dict(signal)
		row["reasoning_card"] = _build_reasoning_card(row)
		row["confidence_breakdown"] = _build_confidence_breakdown(row)
		enriched.append(row)
	return enriched


def run_explanation_pipeline(
	input_path: Path = INPUT_PATH,
	output_path: Path = OUTPUT_PATH,
) -> List[Dict[str, Any]]:
	with open(input_path, "r", encoding="utf-8") as f:
		signals = json.load(f)

	if not isinstance(signals, list):
		raise ValueError("Input must be a JSON list of enriched signals")

	final_signals = enrich_explanations(signals)

	output_path.parent.mkdir(parents=True, exist_ok=True)
	with open(output_path, "w", encoding="utf-8") as f:
		json.dump(final_signals, f, indent=2)

	return final_signals


def run() -> List[Dict[str, Any]]:
	# Step 1: decision enrichment from raw mock signals.
	decision_output = run_decision_pipeline(input_path=INPUT_PATH, output_path=OUTPUT_PATH, k=3)

	# Step 2: explanation enrichment over decision output.
	final_signals = enrich_explanations(decision_output)

	# Keep fields required by the contract while preserving all original fields.
	required_fields = {
		"ticker",
		"company",
		"confluence_score",
		"actionability",
		"reasoning_card",
		"confidence_breakdown",
		"similar_events",
	}
	for row in final_signals:
		missing = required_fields - set(row.keys())
		if missing:
			raise ValueError(f"Missing required output fields: {sorted(missing)}")

	OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
	with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
		json.dump(final_signals, f, indent=2)

	return final_signals


def test_explanation_agent() -> None:
	results = run()
	for row in results:
		ticker = row.get("ticker", "UNKNOWN")
		print(f"Ticker: {ticker}")
		for sentence in row.get("reasoning_card", []):
			print(f"- {sentence}")
		print()

	if results:
		print("First object:")
		print(json.dumps(results[0], indent=2))


if __name__ == "__main__":
	test_explanation_agent()
