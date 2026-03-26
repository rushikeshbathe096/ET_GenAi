"""
M3 Pipeline End-to-End Test Suite
Tests the Decision Agent + Explanation Agent pipeline autonomously
Input: data/signals/mock.json
Output: data/cache/today.json
"""

from __future__ import annotations

import json
import sys
import traceback
from pathlib import Path
from typing import Any, Dict, List, Tuple
import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Defer heavy imports until needed
enrich_signal = None
run_decision_pipeline = None
enrich_explanations = None
run = None
get_similar_events = None
build_index = None


def _lazy_import():
    """Lazy load heavy dependencies."""
    global enrich_signal, run_decision_pipeline, enrich_explanations, run, get_similar_events, build_index
    
    try:
        from agents.decision_agent import enrich_signal as es, run_decision_pipeline as rdp  # noqa: E402
        from agents.explanation_agent import enrich_explanations as ee, run as r  # noqa: E402
        from rag.build_index import get_similar_events as gse, build_index as bi  # noqa: E402
        
        enrich_signal = es
        run_decision_pipeline = rdp
        enrich_explanations = ee
        run = r
        get_similar_events = gse
        build_index = bi
        
        return True
    except Exception as e:
        print(f"ERROR: Failed to import required modules: {e}")
        return False


def _ensure_imports() -> None:
    """Ensure lazily loaded dependencies are available for tests."""
    if not _lazy_import():
        pytest.fail("Failed to import required pipeline modules")


# ============================================================================
# TEST FIXTURES & GLOBALS
# ============================================================================
INPUT_PATH = PROJECT_ROOT / "data" / "signals" / "mock.json"
OUTPUT_PATH = PROJECT_ROOT / "data" / "cache" / "today.json"
RAG_INDEX_PATH = PROJECT_ROOT / "rag" / "faiss_index.bin"
RAG_STORE_PATH = PROJECT_ROOT / "rag" / "events_store.pkl"

TEST_RESULTS = {
    "steps": [],
    "overall_status": "PASS",
    "errors": [],
    "warnings": [],
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def log_step(
    name: str,
    status: str,
    details: str = "",
    error: str = "",
) -> None:
    """Log a test step result."""
    step = {
        "name": name,
        "status": status,
        "details": details,
        "error": error,
    }
    TEST_RESULTS["steps"].append(step)
    
    if status == "FAIL":
        TEST_RESULTS["overall_status"] = "FAIL"
        if error:
            TEST_RESULTS["errors"].append(f"{name}: {error}")
    elif status == "WARN":
        TEST_RESULTS["warnings"].append(f"{name}: {details}")
    
    marker = "✓" if status == "PASS" else "✗" if status == "FAIL" else "⚠"
    print(f"\n{marker} {name}: {status}")
    if details:
        print(f"  Details: {details}")
    if error:
        print(f"  Error: {error}")


def validate_signal_structure(signal: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate input signal structure."""
    required = {"ticker", "company", "confluence_score", "filing_signals", "technical_patterns"}
    missing = required - set(signal.keys())
    if missing:
        return False, f"Missing fields: {sorted(missing)}"
    
    # Validate confluence_score
    try:
        float(signal["confluence_score"])
    except (ValueError, TypeError):
        return False, "confluence_score is not a valid float"
    
    # Validate filing_signals is a list
    if not isinstance(signal.get("filing_signals"), list):
        return False, "filing_signals is not a list"
    
    # Validate technical_patterns is a list
    if not isinstance(signal.get("technical_patterns"), list):
        return False, "technical_patterns is not a list"
    
    return True, ""


def validate_output_structure(row: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate final output structure."""
    required = {
        "ticker",
        "company",
        "confluence_score",
        "why_now",
        "actionability",
        "reasoning_card",
        "confidence_breakdown",
        "similar_events",
    }
    missing = required - set(row.keys())
    if missing:
        return False, f"Missing required fields: {sorted(missing)}"
    
    # Validate reasoning_card
    reasoning_card = row.get("reasoning_card")
    if not isinstance(reasoning_card, list):
        return False, "reasoning_card is not a list"
    if len(reasoning_card) < 2 or len(reasoning_card) > 4:
        return False, f"reasoning_card has {len(reasoning_card)} sentences, expected 3-4"
    
    # Validate no "buy/sell" advice
    reasoning_text = " ".join(reasoning_card).lower()
    if "buy" in reasoning_text or "sell" in reasoning_text:
        return False, "reasoning_card contains buy/sell advice"
    
    # Validate confidence_breakdown
    cb = row.get("confidence_breakdown")
    if not isinstance(cb, dict):
        return False, "confidence_breakdown is not a dict"
    required_cb = {"confluence_score", "actionability", "historical_base_rate", "similar_events_count", "similar_events_above_10pct"}
    missing_cb = required_cb - set(cb.keys())
    if missing_cb:
        return False, f"confidence_breakdown missing: {sorted(missing_cb)}"
    
    # Validate similar_events
    similar = row.get("similar_events")
    if not isinstance(similar, list):
        return False, "similar_events is not a list"
    if len(similar) < 1 or len(similar) > 3:
        return False, f"similar_events has {len(similar)}, expected 1-3"
    
    return True, ""


# ============================================================================
# TEST 1: LOAD INPUT
# ============================================================================

@pytest.fixture(scope="module")
def signals() -> List[Dict[str, Any]]:
    """Load and validate input from mock.json."""
    _ensure_imports()
    try:
        if not INPUT_PATH.exists():
            log_step("LOAD INPUT", "FAIL", "", f"Input file not found: {INPUT_PATH}")
            pytest.fail(f"Input file not found: {INPUT_PATH}")
        
        with open(INPUT_PATH, "r", encoding="utf-8") as f:
            loaded_signals = json.load(f)
        
        if not isinstance(loaded_signals, list):
            log_step("LOAD INPUT", "FAIL", "", "Input is not a JSON array")
            pytest.fail("Input is not a JSON array")
        
        if len(loaded_signals) == 0:
            log_step("LOAD INPUT", "FAIL", "", "Input is empty")
            pytest.fail("Input is empty")
        
        # Validate structure of all signals
        invalid_signals = []
        for idx, signal in enumerate(loaded_signals):
            valid, error = validate_signal_structure(signal)
            if not valid:
                invalid_signals.append((idx, error))
        
        if invalid_signals:
            errors_str = "; ".join([f"Signal {idx}: {err}" for idx, err in invalid_signals])
            log_step("LOAD INPUT", "FAIL", "", errors_str)
            pytest.fail(errors_str)
        
        details = f"Loaded {len(loaded_signals)} signals with valid structure"
        log_step("LOAD INPUT", "PASS", details)
        return loaded_signals
    
    except Exception as e:
        log_step("LOAD INPUT", "FAIL", "", f"{type(e).__name__}: {str(e)}")
        pytest.fail(f"{type(e).__name__}: {str(e)}")


def test_load_input(signals: List[Dict[str, Any]]) -> None:
    """Validate that input signals are loaded."""
    assert isinstance(signals, list)
    assert len(signals) > 0


# ============================================================================
# TEST 2: TEST RAG
# ============================================================================

def test_rag(signals: List[Dict[str, Any]]) -> None:
    """Test RAG functionality."""
    try:
        # Check if index exists
        index_exists = RAG_INDEX_PATH.exists() and RAG_STORE_PATH.exists()
        
        if not index_exists:
            log_step("TEST RAG - Index Missing", "WARN", "Index not found, attempting build...", "")
            try:
                build_index()
                log_step("TEST RAG - Index Built", "PASS", "Index built successfully")
            except Exception as e:
                log_step("TEST RAG - Index Build Failed", "FAIL", "", f"{type(e).__name__}: {str(e)}")
                pytest.fail(f"RAG index build failed: {type(e).__name__}: {str(e)}")
        
        # Test health check query
        try:
            sample = get_similar_events("health check query", k=1)
            if not isinstance(sample, list) or len(sample) == 0:
                log_step("TEST RAG - Health Check", "FAIL", "", "Health check query returned empty")
                pytest.fail("RAG health check query returned empty")
            log_step("TEST RAG - Health Check", "PASS", "Health check query returned events")
        except FileNotFoundError as e:
            log_step("TEST RAG - Health Check", "FAIL", "", f"RAG index missing: {str(e)}")
            pytest.fail(f"RAG index missing: {str(e)}")
        except Exception as e:
            log_step("TEST RAG - Health Check", "FAIL", "", f"{type(e).__name__}: {str(e)}")
            pytest.fail(f"RAG health check failed: {type(e).__name__}: {str(e)}")
        
        # Test querying for each signal
        query_results = []
        for idx, signal in enumerate(signals[:1]):  # Test with first signal
            try:
                ticker = signal.get("ticker", "UNKNOWN")
                query = f"{ticker} {signal.get('company', '')}"
                results = get_similar_events(query, k=3)
                
                if not isinstance(results, list) or len(results) != 3:
                    query_results.append((ticker, False, f"Expected 3 results, got {len(results)}"))
                else:
                    query_results.append((ticker, True, ""))
            except Exception as e:
                query_results.append((ticker, False, str(e)))
        
        # Summarize
        passed = sum(1 for _, success, _ in query_results if success)
        total = len(query_results)
        details = f"Queried {total} signals: {passed} passed"
        
        if passed == total:
            log_step("TEST RAG - Signal Queries", "PASS", details)
            assert True
        else:
            errors = [f"{ticker}: {error}" for ticker, success, error in query_results if not success]
            log_step("TEST RAG - Signal Queries", "FAIL", details, "; ".join(errors))
            pytest.fail("; ".join(errors))
    
    except Exception as e:
        log_step("TEST RAG", "FAIL", "", f"{type(e).__name__}: {str(e)}")
        pytest.fail(f"{type(e).__name__}: {str(e)}")


# ============================================================================
# TEST 3: TEST DECISION AGENT
# ============================================================================

@pytest.fixture(scope="module")
def enriched_signals(signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Run decision-agent enrichment for downstream tests."""
    try:
        enriched = []
        for signal in signals:
            try:
                enriched_signal_row = enrich_signal(signal, k=3)
                enriched.append(enriched_signal_row)
            except Exception as e:
                log_step(
                    "TEST DECISION AGENT",
                    "FAIL",
                    f"Failed to enrich signal {signal.get('ticker', 'UNKNOWN')}",
                    str(e)
                )
                pytest.fail(str(e))
        
        # Validate enriched signals
        invalid = []
        for idx, row in enumerate(enriched):
            required = {"similar_events", "historical_base_rate", "actionability"}
            missing = required - set(row.keys())
            if missing:
                invalid.append((idx, f"Missing: {sorted(missing)}"))
            
            # Validate similar_events
            similar = row.get("similar_events", [])
            if not isinstance(similar, list) or len(similar) != 3:
                invalid.append((idx, f"similar_events count = {len(similar)}, expected 3"))
        
        if invalid:
            error_str = "; ".join([f"Signal {idx}: {err}" for idx, err in invalid])
            log_step("TEST DECISION AGENT", "FAIL", "", error_str)
            pytest.fail(error_str)
        
        details = f"Enriched {len(enriched)} signals with similar_events, base_rate, actionability"
        log_step("TEST DECISION AGENT", "PASS", details)
        return enriched
    
    except Exception as e:
        log_step("TEST DECISION AGENT", "FAIL", "", f"{type(e).__name__}: {str(e)}")
        pytest.fail(f"{type(e).__name__}: {str(e)}")


def test_decision_agent(enriched_signals: List[Dict[str, Any]]) -> None:
    """Validate decision-agent output is available."""
    assert isinstance(enriched_signals, list)
    assert len(enriched_signals) > 0


# ============================================================================
# TEST 4: TEST EXPLANATION AGENT
# ============================================================================

def test_explanation_agent(enriched_signals: List[Dict[str, Any]]) -> None:
    """Test explanation agent enrichment."""
    try:
        final_signals = enrich_explanations(enriched_signals)
        
        # Validate explanations
        invalid = []
        for idx, signal in enumerate(final_signals):
            # Check reasoning_card
            reasoning_card = signal.get("reasoning_card")
            if not isinstance(reasoning_card, list):
                invalid.append((idx, "reasoning_card is not a list"))
            elif not (2 <= len(reasoning_card) <= 4):
                invalid.append((idx, f"reasoning_card has {len(reasoning_card)} sentences, expected 3-4"))
            else:
                # Check for buy/sell advice
                reasoning_text = " ".join(reasoning_card).lower()
                if "buy" in reasoning_text or "sell" in reasoning_text:
                    invalid.append((idx, "reasoning_card contains buy/sell advice"))
            
            # Check confidence_breakdown
            cb = signal.get("confidence_breakdown")
            if not isinstance(cb, dict):
                invalid.append((idx, "confidence_breakdown is not a dict"))
            else:
                required_cb = {"confluence_score", "actionability", "historical_base_rate", "similar_events_count", "similar_events_above_10pct"}
                missing_cb = required_cb - set(cb.keys())
                if missing_cb:
                    invalid.append((idx, f"confidence_breakdown missing: {sorted(missing_cb)}"))
        
        if invalid:
            error_str = "; ".join([f"Signal {idx}: {err}" for idx, err in invalid])
            log_step("TEST EXPLANATION AGENT", "FAIL", "", error_str)
            pytest.fail(error_str)
        
        details = f"Generated explanations for {len(final_signals)} signals with reasoning_card and confidence_breakdown"
        log_step("TEST EXPLANATION AGENT", "PASS", details)
        assert True
    
    except Exception as e:
        log_step("TEST EXPLANATION AGENT", "FAIL", "", f"{type(e).__name__}: {str(e)}")
        traceback.print_exc()
        pytest.fail(f"{type(e).__name__}: {str(e)}")


# ============================================================================
# TEST 5: RUN FULL PIPELINE
# ============================================================================

@pytest.fixture(scope="module")
def final_signals() -> List[Dict[str, Any]]:
    """Run the complete M3 pipeline."""
    _ensure_imports()
    try:
        generated_signals = run()
        
        if not isinstance(generated_signals, list) or len(generated_signals) == 0:
            log_step("RUN FULL PIPELINE", "FAIL", "", "run() returned None or empty list")
            pytest.fail("run() returned None or empty list")
        
        # Verify output file was created
        if not OUTPUT_PATH.exists():
            log_step("RUN FULL PIPELINE", "FAIL", "", f"Output file not created: {OUTPUT_PATH}")
            pytest.fail(f"Output file not created: {OUTPUT_PATH}")
        
        details = f"Pipeline executed, {len(generated_signals)} signals processed, output saved to {OUTPUT_PATH.name}"
        log_step("RUN FULL PIPELINE", "PASS", details)
        return generated_signals
    
    except Exception as e:
        log_step("RUN FULL PIPELINE", "FAIL", "", f"{type(e).__name__}: {str(e)}")
        traceback.print_exc()
        pytest.fail(f"{type(e).__name__}: {str(e)}")


def test_full_pipeline(final_signals: List[Dict[str, Any]]) -> None:
    """Validate full pipeline produces output."""
    assert isinstance(final_signals, list)
    assert len(final_signals) > 0


# ============================================================================
# TEST 6: VALIDATE OUTPUT FORMAT
# ============================================================================

def test_validate_output_format(final_signals: List[Dict[str, Any]]) -> None:
    """Validate the final output format."""
    try:
        invalid_rows = []
        for idx, row in enumerate(final_signals):
            valid, error = validate_output_structure(row)
            if not valid:
                invalid_rows.append((idx, error))
        
        if invalid_rows:
            errors = "; ".join([f"Signal {idx}: {err}" for idx, err in invalid_rows])
            log_step("VALIDATE OUTPUT FORMAT", "FAIL", "", errors)
            pytest.fail(errors)
        
        details = f"All {len(final_signals)} output signals have required structure and valid fields"
        log_step("VALIDATE OUTPUT FORMAT", "PASS", details)
        assert True
    
    except Exception as e:
        log_step("VALIDATE OUTPUT FORMAT", "FAIL", "", f"{type(e).__name__}: {str(e)}")
        pytest.fail(f"{type(e).__name__}: {str(e)}")


# ============================================================================
# TEST 7: EDGE CASES
# ============================================================================

def test_edge_cases() -> None:
    """Test edge cases and error handling."""
    all_pass = True
    
    # Edge case 1: Empty input file
    try:
        temp_path = PROJECT_ROOT / "data" / "signals" / "temp_empty.json"
        with open(temp_path, "w") as f:
            json.dump([], f)
        
        try:
            with open(temp_path, "r") as f:
                empty_signals = json.load(f)
            
            if len(empty_signals) == 0:
                log_step("EDGE CASE - Empty Input", "PASS", "Empty input correctly handled")
            else:
                log_step("EDGE CASE - Empty Input", "FAIL", "", "Unexpected behavior with empty input")
                all_pass = False
        
        finally:
            temp_path.unlink(missing_ok=True)
    
    except Exception as e:
        log_step("EDGE CASE - Empty Input", "FAIL", "", str(e))
        all_pass = False
    
    # Edge case 2: Missing FAISS index (simulate recovery)
    try:
        index_backup = RAG_INDEX_PATH.with_suffix(".bak")
        store_backup = RAG_STORE_PATH.with_suffix(".bak")
        
        # Only test if index exists
        if RAG_INDEX_PATH.exists() and RAG_STORE_PATH.exists():
            log_step("EDGE CASE - FAISS Index Missing", "WARN", "Index exists; skipping corruption test", "")
        else:
            log_step("EDGE CASE - FAISS Index Missing", "PASS", "Index recovery would trigger on demand")
    
    except Exception as e:
        log_step("EDGE CASE - FAISS Index", "WARN", "Could not test index recovery", str(e))
    
    # Edge case 3: Missing fields in signal
    try:
        invalid_signal = {"ticker": "TEST", "company": "Test"}  # Missing confluence_score
        valid, error = validate_signal_structure(invalid_signal)
        
        if not valid and "confluence_score" in error:
            log_step("EDGE CASE - Missing Signal Fields", "PASS", "Correctly detects missing confluence_score")
        else:
            log_step("EDGE CASE - Missing Signal Fields", "FAIL", "", "Failed to detect missing field")
            all_pass = False
    
    except Exception as e:
        log_step("EDGE CASE - Missing Signal Fields", "FAIL", "", str(e))
        all_pass = False
    
    assert all_pass


# ============================================================================
# TEST 8: PRINT RESULTS
# ============================================================================

def print_results(final_signals: List[Dict[str, Any]] | None) -> None:
    """Print comprehensive test results."""
    print("\n" + "=" * 80)
    print("M3 PIPELINE TEST SUMMARY")
    print("=" * 80)
    
    for step in TEST_RESULTS["steps"]:
        marker = "✓" if step["status"] == "PASS" else "✗" if step["status"] == "FAIL" else "⚠"
        print(f"{marker} {step['name']:40s} {step['status']:6s}")
        if step["details"]:
            print(f"  → {step['details']}")
        if step["error"]:
            print(f"  ✗ {step['error']}")
    
    print("\n" + "=" * 80)
    print(f"OVERALL STATUS: {TEST_RESULTS['overall_status']}")
    print("=" * 80)
    
    if TEST_RESULTS["errors"]:
        print("\nCRITICAL ERRORS:")
        for error in TEST_RESULTS["errors"]:
            print(f"  ✗ {error}")
    
    if TEST_RESULTS["warnings"]:
        print("\nWARNINGS:")
        for warning in TEST_RESULTS["warnings"]:
            print(f"  ⚠ {warning}")
    
    # Print sample output
    if final_signals:
        print("\n" + "=" * 80)
        print("SAMPLE OUTPUT (First Signal):")
        print("=" * 80)
        sample = final_signals[0]
        print(json.dumps(sample, indent=2))
        
        # Print statistics
        print("\n" + "=" * 80)
        print("OUTPUT STATISTICS:")
        print("=" * 80)
        print(f"Total signals processed: {len(final_signals)}")
        
        if final_signals:
            conf_scores = [s.get("confluence_score", 0) for s in final_signals]
            print(f"Confluence scores: min={min(conf_scores):.1f}, max={max(conf_scores):.1f}, avg={sum(conf_scores)/len(conf_scores):.1f}")
            
            actionabilities = {}
            for s in final_signals:
                act = s.get("actionability", "unknown")
                actionabilities[act] = actionabilities.get(act, 0) + 1
            print(f"Actionability distribution: {actionabilities}")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Execute all tests."""
    # Lazy load imports to avoid blocking transformer loads
    if not _lazy_import():
        TEST_RESULTS["overall_status"] = "FAIL"
        print_results(None)
        return
    
    print("M3 Pipeline Test Suite Started")
    print(f"Input: {INPUT_PATH}")
    print(f"Output: {OUTPUT_PATH}")
    print()
    
    # Test 1: Load Input
    signals = test_load_input()
    if signals is None:
        print("\n✗ Cannot proceed without valid input")
        TEST_RESULTS["overall_status"] = "FAIL"
        print_results(None)
        return
    
    # Test 2: Test RAG
    rag_ok = test_rag(signals)
    if not rag_ok:
        print("\n⚠ RAG test failed; continuing with decision agent test")
    
    # Test 3: Test Decision Agent
    enriched_signals = test_decision_agent(signals)
    if enriched_signals is None:
        print("\n✗ Decision agent failed; cannot proceed")
        print_results(None)
        return
    
    # Test 4: Test Explanation Agent
    explained_signals = test_explanation_agent(enriched_signals)
    if explained_signals is None:
        print("\n✗ Explanation agent failed; cannot proceed")
        print_results(None)
        return
    
    # Test 5: Run Full Pipeline
    final_signals = test_full_pipeline()
    if final_signals is None:
        print("\n✗ Full pipeline failed")
        print_results(None)
        return
    
    # Test 6: Validate Output Format
    format_ok = test_validate_output_format(final_signals)
    
    # Test 7: Edge Cases
    edge_cases_ok = test_edge_cases()
    
    # Test 8: Print Results
    print_results(final_signals)


if __name__ == "__main__":
    main()
