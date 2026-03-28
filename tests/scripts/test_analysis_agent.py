import json
import os
import sys

print("STARTING TEST")

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from agents.analysis_agent import compute_signals  # adjust if needed

parsed_dir = os.path.join(PROJECT_ROOT, "data", "parsed")
files = sorted(
    [name for name in os.listdir(parsed_dir) if name.endswith(".json") and name != "mock.json"],
    reverse=True,
)

if not files:
    raise FileNotFoundError("No parsed JSON files found in data/parsed")

latest_file = os.path.join(parsed_dir, files[0])
print("Using file:", latest_file)

with open(latest_file) as f:
    data = json.load(f)

print("DATA LOADED")
print("Companies:", len(data))

result = compute_signals(data)

print("FUNCTION EXECUTED")

print("Result type:", type(result))

if result:
    print("Sample output:")
    print(result[:2])
else:
    print("Result is empty")