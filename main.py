import json
from pipeline.run_pipeline import run_pipeline


if __name__ == "__main__":
    result = run_pipeline()
    print(json.dumps(result, indent=2, ensure_ascii=False))