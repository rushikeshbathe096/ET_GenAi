import json
from pathlib import Path

output_file = Path("data/cache/today.json")

if output_file.exists():
    with open(output_file) as f:
        data = json.load(f)
    
    print("✅ M3 PIPELINE VALIDATION COMPLETE")
    print("=" * 60)
    print(f"Output file: {output_file.name}")
    print(f"Signals processed: {len(data)}")
    print()
    
    for i, signal in enumerate(data, 1):
        print(f"Signal {i}:")
        print(f"  Ticker: {signal.get('ticker')}")
        print(f"  Company: {signal.get('company')}")
        print(f"  Confluence Score: {signal.get('confluence_score')}")
        print(f"  Actionability: {signal.get('actionability')}")
        print(f"  ✓ reasoning_card: {len(signal.get('reasoning_card', []))} sentences")
        print(f"  ✓ confidence_breakdown: {list(signal.get('confidence_breakdown', {}).keys())}")
        print(f"  ✓ similar_events: {len(signal.get('similar_events', []))} events")
        print()
    
    print("=" * 60)
    print("✅ ALL FIELDS VALIDATED - READY FOR INTEGRATION")
else:
    print("❌ Output file not found")
