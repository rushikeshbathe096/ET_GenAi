"""
M3 (Decision + Explanation) pipeline validation.

Loads latest input from either:
1) data/signals/*.json (preferred M2 output)
2) data/parsed/*.json  (fallback raw parsed input)

Then runs:
- decision_agent.run_decision_pipeline
- explanation_agent.enrich_explanations
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, List

import pytest


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from agents.decision_agent import run_decision_pipeline  # noqa: E402
from agents.explanation_agent import enrich_explanations  # noqa: E402


OUTPUT_PATH = PROJECT_ROOT / "data" / "cache" / "today.json"


def _latest_json(dir_path: Path) -> Path | None:
    files = sorted([p for p in dir_path.glob("*.json") if p.name != "mock.json"])
    if not files:
        return None
    return files[-1]


def resolve_input_path() -> Path:
    signals_path = _latest_json(PROJECT_ROOT / "data" / "signals")
    if signals_path is not None:
        return signals_path

    parsed_path = _latest_json(PROJECT_ROOT / "data" / "parsed")
    if parsed_path is not None:
        return parsed_path

    fallback_signals = PROJECT_ROOT / "data" / "signals" / "mock.json"
    if fallback_signals.exists():
        return fallback_signals

    raise FileNotFoundError("No input found in data/signals or data/parsed")


def load_input_signals() -> List[Dict[str, Any]]:
    input_path = resolve_input_path()
    with open(input_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    if not isinstance(payload, list):
        raise ValueError(f"Input file is not a JSON list: {input_path}")

    return payload


def run_m3_pipeline() -> List[Dict[str, Any]]:
    input_path = resolve_input_path()

    decision_rows = run_decision_pipeline(input_path=input_path, output_path=OUTPUT_PATH, k=3)
    final_rows = enrich_explanations(decision_rows)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(final_rows, f, indent=2)

    return final_rows


def _required_output_keys(row: Dict[str, Any]) -> List[str]:
    required = [
        "ticker",
        "decision",
        "confidence",
        "confluence_score",
        "why_now",
        "signals",
    ]
    return [k for k in required if k not in row]


@pytest.fixture(scope="module")
def signals() -> List[Dict[str, Any]]:
    return load_input_signals()


@pytest.fixture(scope="module")
def final_rows() -> List[Dict[str, Any]]:
    return run_m3_pipeline()


def test_load_input(signals: List[Dict[str, Any]]) -> None:
    assert isinstance(signals, list)
    assert len(signals) > 0


def test_m3_output_shape(final_rows: List[Dict[str, Any]]) -> None:
    assert isinstance(final_rows, list)
    assert len(final_rows) > 0

    for idx, row in enumerate(final_rows):
        missing = _required_output_keys(row)
        assert not missing, f"Row {idx} missing keys: {missing}"


def test_m3_stability_with_sparse_input() -> None:
    sparse_row: Dict[str, Any] = {
        "ticker": "TEST",
        "company": "Test Co",
        "filing_signals": [{"deal_type": "bulk_deal", "score": 0.7, "score_reason": "Sample"}],
        "technical_patterns": [],
        "confluence_score": 1.0,
        "why_now": "",
    }

    from agents.decision_agent import enrich_signal  # local import keeps test isolation

    enriched = enrich_signal(sparse_row)
    assert "decision" in enriched
    assert "confidence" in enriched
    assert "signals" in enriched


def main() -> None:
    print("=" * 80)
    print("M3 PIPELINE CHECK")
    print("=" * 80)

    input_path = resolve_input_path()
    print(f"Input file: {input_path}")

    rows = run_m3_pipeline()
    print(f"Output file: {OUTPUT_PATH}")
    print(f"Processed rows: {len(rows)}")

    if rows:
        print("\nSample row:")
        print(json.dumps(rows[0], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
