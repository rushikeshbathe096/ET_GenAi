import json
import os
from agents.analysis_agent import compute_signals

def load_latest_file():
    base_path = "data/parsed"
    files = sorted(os.listdir(base_path), reverse=True)

    if not files:
        raise Exception("No parsed data found")

    return os.path.join(base_path, files[0])

def run_test():
    file_path = load_latest_file()
    print("Using file:", file_path)

    with open(file_path) as f:
        data = json.load(f)

    print("Data loaded. Records:", len(data))

    result = compute_signals(data)

    print("\n=== SIGNAL OUTPUT ===")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    run_test()