import os
import sys
import json

# Ensure the root project directory is in the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Adjusting names based on the existing modules in the project
from agents.planner_agent import run_pipeline as run_orchestrator
from pipeline.run_pipeline import run_market_pipeline

def run_parser():
    """
    Adjusted parser step:
    In the current project architecture, parsing is dynamically handled 
    by `agents.sources.parser` and various `data_loader` utilities.
    If you have a dedicated data extraction step, it can be integrated here.
    """
    print("--> Executing data parsing & consolidation (handled internally by sources)...")

def run_all():
    print("====================================")
    print("Running parser...")
    print("====================================")
    run_parser()
    print("\n")

    print("====================================")
    print("Running pipeline...")
    print("====================================")
    # The planner_agent runs the system design sequence (Data -> Analysis -> Decision -> Explanation)
    run_orchestrator()

    # The actual data generation for the market
    print("\n--> Fetching top tickers and running end-to-end analysis...")
    result = run_market_pipeline()

    print("\nDone!")
    return result

if __name__ == "__main__":
    results = run_all()
    
    print("\n" + "="*40)
    print(" PIPELINE RESULTS ")
    print("="*40)
    
    if not results:
        print("No results returned by the pipeline.")
    else:
        for res in results:
            symbol = res.get('symbol', 'UNKNOWN')
            company = res.get('company', '')
            decision = res.get('decision', 'N/A')
            confidence = res.get('confidence', 0)
            print(f"[{symbol}] {company} | Decision: {decision} | Confidence: {confidence}%")
            
        print("\n(Tip: Uncomment the json.dumps line in run_all.py to see the full data structure)")
        # print(json.dumps(results, indent=2))
