from pipeline.run_pipeline import get_analytics_summary
import json

try:
    print("Testing get_analytics_summary()...")
    res = get_analytics_summary()
    print("Success!")
    print(json.dumps(res, indent=2))
except Exception as e:
    import traceback
    traceback.print_exc()
