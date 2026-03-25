import os
import json

def load_latest_data():
    base_path = "data/parsed"
    files = sorted(os.listdir(base_path), reverse=True)

    if not files:
        raise Exception("No parsed data found")

    latest_file = os.path.join(base_path, files[0])

    with open(latest_file) as f:
        return json.load(f)