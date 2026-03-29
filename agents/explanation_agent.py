from __future__ import annotations
import os
import re
from groq import Groq

import json
import sys
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv
load_dotenv()
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
	sys.path.insert(0, str(PROJECT_ROOT))

from agents.decision_agent import run_decision_pipeline  # noqa: E402


INPUT_PATH = PROJECT_ROOT / "data" / "signals" / "mock.json"
OUTPUT_PATH = PROJECT_ROOT / "data" / "cache" / "today.json"


def call_llm(prompt: str) -> str:
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return ""
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior equity analyst at a top Indian brokerage. Write concise, plain-English stock analysis for retail investors. Never use jargon. Always mention what smart money (insiders, institutions) is doing. End with a disclaimer that this is not SEBI-registered investment advice."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=300,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq LLM failed: {e}")
        return ""


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


def _aligned_signals(signal: Dict[str, Any]) -> List[str]:
	aligned: List[str] = []
	for item in signal.get("filing_signals", []):
		if not isinstance(item, dict):
			continue
		deal_type = str(item.get("deal_type", "")).lower()
		transaction = str(item.get("transaction", "")).lower()
		role = str(item.get("person_role", "")).lower()
		score = float(item.get("score", 0.0))

		if deal_type == "insider_trade" and transaction == "buy" and "promoter" in role:
			aligned.append("promoter buying")
		elif deal_type == "insider_trade" and transaction == "buy":
			aligned.append("insider accumulation")
		elif deal_type == "bulk_deal" and score > 0:
			aligned.append("institutional bulk activity")
		elif deal_type == "news_sentiment" and score > 0.3:
			aligned.append("positive sentiment")

	tech = signal.get("technical_patterns", [])
	if isinstance(tech, list) and tech:
		aligned.append("technical confirmation")

	if not aligned:
		return ["mixed filing signals"]

	seen = set()
	ordered = []
	for item in aligned:
		if item not in seen:
			ordered.append(item)
			seen.add(item)
	return ordered


def _setup_strength(confluence_score: Any) -> str:
	try:
		score = float(confluence_score)
	except Exception:
		score = 0.0

	if score >= 7.0:
		return "strong"
	if score >= 4.0:
		return "constructive"
	return "early"


def _build_reasoning_card(signal: Dict[str, Any]) -> List[str]:
	ticker = str(signal.get("ticker", "This stock"))
	why_now = str(signal.get("why_now", "")).strip() or "Recent filings and news flow suggest activity worth tracking"
	historical_base_rate = str(signal.get("historical_base_rate", "0/0 events gave >10% return"))
	hist_strength = _historical_strength(historical_base_rate)
	alignment = _aligned_signals(signal)
	alignment_text = ", ".join(alignment[:3])
	strength = _setup_strength(signal.get("confluence_score", 0.0))
	confidence = str(signal.get("confidence", "MEDIUM"))
	has_conflict = bool(signal.get("signal_conflict", False))
	decision = str(signal.get("decision", "HOLD"))

	bias = "balanced"
	if decision in {"STRONG_BUY", "BUY"}:
		bias = "bullish"
	elif decision in {"STRONG_SELL", "SELL"}:
		bias = "bearish"

	similar_events = signal.get("similar_events", [])
	top_event = similar_events[0] if isinstance(similar_events, list) and similar_events else {}
	top_event_company = str(top_event.get("company", "comparable names"))

	prompt = (
		f"Create simple explanation for {ticker} with setup strength {strength}, "
		f"base rate {historical_base_rate}, top match {top_event_company}, and why now {why_now}."
	)
	_ = call_llm(prompt)

	sentence_1 = f"{ticker} is showing a {strength} and {bias} setup, supported by {alignment_text}."
	sentence_2 = f"This matters now because {why_now}"
	if has_conflict:
		sentence_2 += " Signal directions are mixed, so conviction is tempered."
	else:
		sentence_2 += "."
	sentence_3 = f"Confidence is {confidence.lower()}, and historical support is {hist_strength} ({historical_base_rate}), so confirmation remains important."

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
		"actionability": str(signal.get("actionability", "Setup is being monitored with mixed conviction")),
		"decision": str(signal.get("decision", "HOLD")),
		"confidence": str(signal.get("confidence", "MEDIUM")),
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
		"decision",
		"confidence",
		"confluence_score",
		"why_now",
		"signals",
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


def generate_explanation(decision: Dict[str, Any], signals: List[Dict[str, Any]]) -> Dict[str, Any]:
    # 1. Rule-based explanation generation (as fallback/base)
    signal_rows = signals if isinstance(signals, list) else []
    positives: List[Dict[str, Any]] = []
    negatives: List[Dict[str, Any]] = []

    for item in signal_rows:
        if not isinstance(item, dict):
            continue
        try:
            score = float(item.get("score", 0.0))
        except (TypeError, ValueError):
            score = 0.0
        reason = str(item.get("reason") or "").strip()
        if not reason:
            continue
        entry = {
            "type": str(item.get("type", "signal")).replace("_", " ").title(),
            "reason": reason,
            "strength": abs(score),
        }
        if score > 0:
            positives.append(entry)
        elif score < 0:
            negatives.append(entry)

    positives.sort(key=lambda x: x["strength"], reverse=True)
    negatives.sort(key=lambda x: x["strength"], reverse=True)
    
    # Meaningful drivers for fallback
    p_drivers = [r for r in positives if r["strength"] >= 0.25 and len(r["reason"].strip()) >= 10]
    n_drivers = [r for r in negatives if r["strength"] >= 0.25 and len(r["reason"].strip()) >= 10]

    dec_label = str(decision.get("decision", "HOLD")).upper()
    rule_lines: List[str] = []
    
    if p_drivers:
        lead = p_drivers[0]
        if len(p_drivers) > 1:
            rule_lines.append(f"{dec_label} is driven by {lead['type']} and {p_drivers[1]['type']} ({lead['reason']}).")
        else:
            rule_lines.append(f"{dec_label} is mainly supported by {lead['type']} ({lead['reason']}).")
    if n_drivers:
        rule_lines.append(f"Key downside driver is {n_drivers[0]['type']} ({n_drivers[0]['reason']}).")
    
    fallback_why_now = "\n".join(rule_lines[:3]) if rule_lines else f"{dec_label} setup based on technical and filing signals."
    
    risks: List[str] = []
    seen = set()
    for item in n_drivers:
        reason = item["reason"]
        if reason not in seen:
            risks.append(reason)
            seen.add(reason)

    # 2. LLM-based explanation generation
    company = "this stock"
    symbol = ""
    price = "current market price"
    change_pct = "N/A"
    
    # Try to extract metadata from symbols if possible
    # In run_pipeline, price_movement signal has change_pct in its reason
    for s in signals:
        if s.get("type") == "price_movement":
            reason_text = s.get("reason", "")
            match = re.search(r"(-?\d+\.?\d*)%", reason_text)
            if match:
                change_pct = match.group(1)

    signals_text = "\n".join([f"- {s.get('type', 'Signal').replace('_', ' ').title()}: {s.get('reason', 'N/A')}" for s in signals])
    
    prompt = f"""
Analyze {company} {symbol}. 
Decision: {dec_label} with {decision.get('confidence', 0)}% confidence.

Signals detected:
{signals_text}

Current price: Rs {price}, change: {change_pct}%

Write 3-4 sentences explaining WHY this is a {dec_label} 
right now. Focus on what the data shows, not generic advice.
Then list 2-3 specific risks as bullet points.
"""

    llm_output = call_llm(prompt)
    if llm_output:
        try:
            lines = llm_output.split('\n')
            why_lines = []
            risk_lines = []
            in_risks = False

            for line in lines:
                line_text = line.strip()
                if not line_text:
                    continue
                
                # Check for risk/disclaimer transition
                if any(keyword in line_text.lower() for keyword in ['risk', 'disclaimer']):
                    in_risks = True
                    continue # Skip the header line itself
                
                if in_risks:
                    # Capture bullet points (supporting * or -)
                    if line_text.startswith('*') or line_text.startswith('-'):
                        risk = line_text.lstrip('* -').strip()
                        if risk:
                            risk_lines.append(risk)
                else:
                    why_lines.append(line_text)

            if why_lines:
                return {
                    "why_now": ' '.join(why_lines),
                    "risks": risk_lines if risk_lines else risks # Use parsed risks if any, else rule-based
                }
        except Exception:
            pass
            
        return {
            "why_now": llm_output,
            "risks": risks,
        }

    return {
        "why_now": fallback_why_now,
        "risks": risks,
    }


if __name__ == "__main__":
	test_explanation_agent()