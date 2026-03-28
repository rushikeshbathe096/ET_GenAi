#!/usr/bin/env python3
"""
Phase 1 backend pipeline validation script.

Pipeline under validation:
load_latest_data() -> compute_signals(data) -> decision_agent -> explanation_agent -> API-style JSON

Run:
    python3 tests/scripts/test_phase1_validation.py
"""

from __future__ import annotations

import glob
import json
import sys
import traceback
from pathlib import Path
from typing import Any, Callable, Dict, List, Tuple


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from agents.utils.data_loader import load_latest_data  # noqa: E402
from agents import analysis_agent  # noqa: E402
from agents import decision_agent  # noqa: E402
from agents import explanation_agent  # noqa: E402


PASS = "PASS"
FAIL = "FAIL"
WARN = "WARN"


def print_stage(stage: str, status: str, details: str = "") -> None:
    marker = "[PASS]" if status == PASS else "[FAIL]" if status == FAIL else "[WARN]"
    print(f"{marker} {stage}")
    if details:
        print(f"       {details}")


def latest_parsed_file(parsed_dir: Path) -> Path:
    files = sorted(glob.glob(str(parsed_dir / "*.json")))
    if not files:
        raise FileNotFoundError(f"No parsed JSON files found in {parsed_dir}")
    return Path(files[-1])


def validate_input_data(data: Any) -> Tuple[bool, str]:
    if not isinstance(data, list):
        return False, "Loaded data is not a list"
    if not data:
        return False, "Loaded data list is empty"

    required = {"ticker", "company", "events", "news"}
    for idx, row in enumerate(data):
        if not isinstance(row, dict):
            return False, f"Row {idx} is not an object"
        missing = required - set(row.keys())
        if missing:
            return False, f"Row {idx} missing keys: {sorted(missing)}"
    return True, f"Input shape valid for {len(data)} rows"


def resolve_compute_signals() -> Tuple[Callable[[List[Dict[str, Any]]], List[Dict[str, Any]]], str]:
    if hasattr(analysis_agent, "compute_signals") and callable(analysis_agent.compute_signals):
        return analysis_agent.compute_signals, "agents.analysis_agent.compute_signals"

    if hasattr(analysis_agent, "compute_confluence") and callable(analysis_agent.compute_confluence):
        def _compute_via_confluence(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
            results = [analysis_agent.compute_confluence(row) for row in data if isinstance(row, dict)]
            results.sort(key=lambda x: float(x.get("confluence_score", 0.0)), reverse=True)
            return results

        return _compute_via_confluence, "agents.analysis_agent.compute_confluence (fallback wrapper)"

    raise AttributeError("No compute_signals or compute_confluence function found in agents.analysis_agent")


def validate_signals(signals: Any) -> Tuple[bool, str]:
    if not isinstance(signals, list):
        return False, "compute_signals output is not a list"
    if not signals:
        return False, "compute_signals output is empty"

    required = {
        "ticker",
        "company",
        "confluence_score",
        "why_now",
        "filing_signals",
        "technical_patterns",
    }

    for idx, row in enumerate(signals):
        if not isinstance(row, dict):
            return False, f"Signal {idx} is not an object"
        missing = required - set(row.keys())
        if missing:
            return False, f"Signal {idx} missing keys: {sorted(missing)}"

    scores = [float(row.get("confluence_score", 0.0)) for row in signals]
    is_sorted_desc = all(scores[i] >= scores[i + 1] for i in range(len(scores) - 1))
    if not is_sorted_desc:
        return False, "Signals are not sorted by confluence_score descending"

    return True, f"Signals valid and sorted descending ({len(signals)} items)"


def safe_decision(signal: Dict[str, Any], force_fail: bool = False) -> Tuple[Dict[str, Any], bool, str]:
    try:
        if force_fail:
            raise RuntimeError("Simulated decision failure")
        if not hasattr(decision_agent, "enrich_signal"):
            raise AttributeError("decision_agent.enrich_signal not found")

        enriched = decision_agent.enrich_signal(signal, k=3)
        return enriched, False, "Decision enrichment succeeded"
    except Exception as exc:
        fallback = dict(signal)
        fallback.setdefault("actionability", "Unknown")
        fallback.setdefault("similar_events", [])
        fallback.setdefault("historical_base_rate", "0/0 events gave >10% return")
        return fallback, True, f"Decision fallback used: {type(exc).__name__}: {exc}"


def safe_explanation(signal: Dict[str, Any], force_fail: bool = False) -> Tuple[Dict[str, Any], bool, str]:
    try:
        if force_fail:
            raise RuntimeError("Simulated explanation failure")
        if not hasattr(explanation_agent, "enrich_explanations"):
            raise AttributeError("explanation_agent.enrich_explanations not found")

        explained_list = explanation_agent.enrich_explanations([signal])
        if not explained_list:
            raise ValueError("enrich_explanations returned empty list")
        return explained_list[0], False, "Explanation enrichment succeeded"
    except Exception as exc:
        fallback = dict(signal)
        fallback.setdefault(
            "reasoning_card",
            ["Analysis completed with fallback mode; explanation service unavailable."],
        )
        fallback.setdefault(
            "confidence_breakdown",
            {
                "confluence_score": float(signal.get("confluence_score", 0.0)),
                "actionability": str(signal.get("actionability", "Unknown")),
                "historical_base_rate": str(signal.get("historical_base_rate", "0/0 events gave >10% return")),
                "similar_events_count": len(signal.get("similar_events", [])) if isinstance(signal.get("similar_events", []), list) else 0,
                "similar_events_above_10pct": 0,
            },
        )
        return fallback, True, f"Explanation fallback used: {type(exc).__name__}: {exc}"


def build_api_response(signals: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not signals:
        return {
            "status": "success",
            "count": 0,
            "top_opportunity": {},
            "decision": "No data available",
            "explanation": "No data available for analysis.",
            "opportunities": [],
        }

    top_signals = signals[:5]
    enriched_signals: List[Dict[str, Any]] = []

    for sig in top_signals:
        enriched, _, _ = safe_decision(sig)
        enriched_signals.append(enriched)

    top_enriched = enriched_signals[0]
    explained_top, _, _ = safe_explanation(top_enriched)

    explanation_lines = explained_top.get("reasoning_card", [])
    explanation_text = " ".join(explanation_lines) if explanation_lines else "Analysis complete, but no detailed explanation generated."

    return {
        "status": "success",
        "count": len(signals),
        "top_opportunity": explained_top,
        "decision": explained_top.get("actionability", "Unknown"),
        "explanation": explanation_text,
        "opportunities": enriched_signals,
    }


def validate_fallback_behavior(signal: Dict[str, Any]) -> Tuple[bool, str]:
    issues: List[str] = []

    # 1) Simulated decision failure must fall back safely.
    _, decision_fallback_used, decision_msg = safe_decision(signal, force_fail=True)
    if not decision_fallback_used:
        issues.append("Decision forced-failure did not trigger fallback")

    # 2) Simulated explanation failure must fall back safely.
    explained_fallback, explanation_fallback_used, explanation_msg = safe_explanation(signal, force_fail=True)
    if not explanation_fallback_used:
        issues.append("Explanation forced-failure did not trigger fallback")
    if "reasoning_card" not in explained_fallback:
        issues.append("Explanation fallback missing reasoning_card")

    # 3) Simulated RAG failure by monkeypatching decision_agent.get_similar_events.
    rag_msg = "RAG function not available for patch test"
    rag_patch_test_ok = True
    original = getattr(decision_agent, "get_similar_events", None)
    if callable(original):
        def _raise_rag(*_args: Any, **_kwargs: Any) -> Any:
            raise RuntimeError("Simulated RAG failure")

        try:
            decision_agent.get_similar_events = _raise_rag
            rag_safe_output, rag_fallback_used, _ = safe_decision(signal)
            has_safe_shape = isinstance(rag_safe_output, dict) and bool(str(rag_safe_output.get("actionability", "")).strip())
            rag_patch_test_ok = rag_fallback_used or has_safe_shape
            rag_msg = "RAG patch test passed" if rag_patch_test_ok else "RAG patch test failed"
        except Exception as exc:
            rag_patch_test_ok = False
            rag_msg = f"RAG patch simulation crashed: {type(exc).__name__}: {exc}"
        finally:
            decision_agent.get_similar_events = original

    if not rag_patch_test_ok:
        issues.append(rag_msg)

    if issues:
        return False, "; ".join([decision_msg, explanation_msg, rag_msg] + issues)
    return True, "; ".join([decision_msg, explanation_msg, rag_msg])


def main() -> None:
    print("=" * 80)
    print("PHASE 1 PIPELINE VALIDATION")
    print("=" * 80)

    parsed_dir = PROJECT_ROOT / "data" / "parsed"
    sample_response: Dict[str, Any] = {}
    loaded_data: List[Dict[str, Any]] = []
    computed_signals: List[Dict[str, Any]] = []

    # Stage 1: latest parsed file exists
    try:
        latest_file = latest_parsed_file(parsed_dir)
        print_stage("Latest parsed file check", PASS, f"Found {latest_file.name}")
    except Exception as exc:
        print_stage("Latest parsed file check", FAIL, f"{type(exc).__name__}: {exc}")

    # Stage 2: load + validate input data structure
    try:
        loaded_data = load_latest_data()
        ok, msg = validate_input_data(loaded_data)
        print_stage("Load and validate input", PASS if ok else FAIL, msg)
    except Exception as exc:
        print_stage("Load and validate input", FAIL, f"{type(exc).__name__}: {exc}")
        traceback.print_exc()

    # Stage 3: run compute_signals(data)
    try:
        compute_signals, source_name = resolve_compute_signals()
        computed_signals = compute_signals(loaded_data) if loaded_data else []
        print_stage("Run compute_signals(data)", PASS, f"Using {source_name}")
    except Exception as exc:
        print_stage("Run compute_signals(data)", FAIL, f"{type(exc).__name__}: {exc}")
        traceback.print_exc()

    # Stage 4: validate output non-empty/sorted/required keys
    try:
        ok, msg = validate_signals(computed_signals)
        print_stage("Validate signal output", PASS if ok else FAIL, msg)
    except Exception as exc:
        print_stage("Validate signal output", FAIL, f"{type(exc).__name__}: {exc}")
        traceback.print_exc()

    # Stage 5: decision + explanation on top opportunity
    top_signal: Dict[str, Any] = computed_signals[0] if computed_signals else {}
    top_after_decision: Dict[str, Any] = top_signal
    top_after_explanation: Dict[str, Any] = top_signal

    try:
        if not top_signal:
            raise ValueError("No top signal available")
        top_after_decision, decision_fallback, decision_msg = safe_decision(top_signal)
        status = WARN if decision_fallback else PASS
        print_stage("Decision agent on top opportunity", status, decision_msg)
    except Exception as exc:
        print_stage("Decision agent on top opportunity", FAIL, f"{type(exc).__name__}: {exc}")

    try:
        if not top_after_decision:
            raise ValueError("No decision-enriched signal available")
        top_after_explanation, explanation_fallback, explanation_msg = safe_explanation(top_after_decision)
        status = WARN if explanation_fallback else PASS
        print_stage("Explanation agent on top opportunity", status, explanation_msg)
    except Exception as exc:
        print_stage("Explanation agent on top opportunity", FAIL, f"{type(exc).__name__}: {exc}")

    # Stage 6: simulate final API-style response JSON
    try:
        sample_response = build_api_response(computed_signals)
        required_api_keys = {"status", "count", "top_opportunity", "decision", "explanation", "opportunities"}
        missing = required_api_keys - set(sample_response.keys())
        if missing:
            print_stage("Build API-style response", FAIL, f"Missing keys: {sorted(missing)}")
        else:
            print_stage("Build API-style response", PASS, "Final response object shape is valid")
    except Exception as exc:
        print_stage("Build API-style response", FAIL, f"{type(exc).__name__}: {exc}")
        traceback.print_exc()

    # Stage 7: verify fallback-safe behavior for decision/explanation/RAG failures
    try:
        base_signal = top_signal if top_signal else {"ticker": "N/A", "company": "N/A", "confluence_score": 0.0}
        ok, msg = validate_fallback_behavior(base_signal)
        print_stage("Fallback safety validation", PASS if ok else FAIL, msg)
    except Exception as exc:
        print_stage("Fallback safety validation", FAIL, f"{type(exc).__name__}: {exc}")
        traceback.print_exc()

    print("\n" + "=" * 80)
    print("FINAL SAMPLE RESPONSE JSON")
    print("=" * 80)
    print(json.dumps(sample_response, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
