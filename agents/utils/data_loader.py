import json
import os


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PARSED_DIR = os.path.join(PROJECT_ROOT, "data", "parsed")


def _list_parsed_files() -> list[str]:
    if not os.path.isdir(PARSED_DIR):
        return []

    files = []
    for name in os.listdir(PARSED_DIR):
        if not name.endswith(".json"):
            continue
        if name == "mock.json":
            continue
        files.append(os.path.join(PARSED_DIR, name))

    return sorted(files)


def load_parsed_data(run_date: str) -> list[dict]:
    file_path = os.path.join(PARSED_DIR, f"{run_date}.json")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Parsed file not found for date {run_date}: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError(f"Parsed payload must be a list: {file_path}")

    return data


def load_latest_data() -> list[dict]:
    files = _list_parsed_files()

    if not files:
        raise FileNotFoundError("No parsed data found")

    latest_file = files[-1]
    with open(latest_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError(f"Parsed payload must be a list: {latest_file}")

    return data