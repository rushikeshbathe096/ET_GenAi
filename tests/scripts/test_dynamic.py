import os

# Allow running this diagnostic test without requiring external LLM keys.
if not (
    os.getenv("GROQ_API_KEY")
    or os.getenv("GEMINI_API_KEY")
    or os.getenv("ANTHROPIC_API_KEY")
):
    os.environ.setdefault("DEMO_MODE", "true")

from pipeline.run_pipeline import analyze_stock

from nsepython import nse_get_top_gainers, nse_get_top_losers
import pandas as pd

def get_test_tickers() -> list[str]:
    tickers = []
    try:
        gainers = nse_get_top_gainers()
        if isinstance(gainers, pd.DataFrame) and not gainers.empty:
            col = next((c for c in gainers.columns 
                       if "symbol" in c.lower()), None)
            if col:
                tickers += gainers[col].str.strip().str.upper().tolist()[:3]
    except Exception as e:
        print(f"Gainers fetch failed: {e}")

    try:
        losers = nse_get_top_losers()
        if isinstance(losers, pd.DataFrame) and not losers.empty:
            col = next((c for c in losers.columns 
                       if "symbol" in c.lower()), None)
            if col:
                tickers += losers[col].str.strip().str.upper().tolist()[:3]
    except Exception as e:
        print(f"Losers fetch failed: {e}")

    if not tickers:
        tickers = ["TCS", "INFY", "HDFCBANK"]

    return list(dict.fromkeys(tickers))

for stock in get_test_tickers():
    print("\n==============================")
    print(f"Testing: {stock}")

    try:
        result = analyze_stock(stock)

        print("Company:", result.get("company"))
        print("Price:", result.get("price"))
        print("Change %:", result.get("change_pct"))
        print("Volume:", result.get("volume"))
        print("Decision:", result.get("decision"))
        print("Confidence:", result.get("confidence"))
        print("Why:", result.get("why_now", "N/A"))
        print("Risks:", result.get("risks", []))
        print("Signals count:", len(result.get("signals", [])))

    except Exception as e:
        print("ERROR:", e)