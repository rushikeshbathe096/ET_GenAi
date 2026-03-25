import os
import glob
import json

def verify_output():
    # 1. Find the latest JSON file in data/parsed/ (ignore mock.json)
    try:
        files = [f for f in glob.glob("data/parsed/*.json") if "mock.json" not in os.path.basename(f)]
        if not files:
            print("FAIL: No parsed output files found in data/parsed/. Please run the pipeline first.")
            return

        # Sort by modification time to get the latest
        files.sort(key=os.path.getmtime)
        latest_file = files[-1]
        print(f"Verifying latest file: {latest_file}\n")
    except Exception as e:
        print(f"FAIL: Error finding files: {e}")
        return

    # 2. Load the latest file and mock.json
    try:
        with open(latest_file, "r") as f:
            latest_data = json.load(f)
            
        mock_path = "data/parsed/mock.json"
        if os.path.exists(mock_path):
            with open(mock_path, "r") as f:
                mock_data = json.load(f)
        else:
            print("WARNING: mock.json not found in data/parsed/.")
            
    except json.JSONDecodeError as e:
        print(f"FAIL: JSON parsing error: {e}")
        return
    except Exception as e:
        print(f"FAIL: Error reading JSON files: {e}")
        return

    # Check if latest data is valid array format
    if not isinstance(latest_data, list) or len(latest_data) == 0:
        print("FAIL: Latest data is missing, empty, or not a list.")
        return

    # Using a helper to track passes/fails
    all_passed = True

    def check(condition, success_msg, fail_msg):
        nonlocal all_passed
        if condition:
            print(f"PASS: {success_msg}")
        else:
            print(f"FAIL: {fail_msg}")
            all_passed = False

    # 3. Get the first item in the latest file
    item = latest_data[0]

    check("ticker" in item, "ticker field present", "ticker field missing")
    check("company" in item, "company field present", "company field missing")
    check("events" in item and isinstance(item["events"], list), "events exists and is a list", "events missing or not a list")
    check("news" in item and isinstance(item["news"], dict), "news exists and is a dict", "news missing or not a dict")
    check("date" in item, "date field present", "date field missing")

    # 4. Check events
    if "events" in item and isinstance(item["events"], list):
        check(len(item["events"]) > 0, "events list is not empty", "events list is empty")
        
        if len(item["events"]) > 0:
            all_have_deal_type = all("deal_type" in event for event in item["events"])
            check(all_have_deal_type, "all events have 'deal_type'", "one or more events missing 'deal_type'")

    # 5. For news field check exact keys and types
    if "news" in item and isinstance(item["news"], dict):
        news = item["news"]
        check("score" in news, "news score field present", "news score field missing")
        if "score" in news:
            check(isinstance(news["score"], (float, int)), "news score is a float", "news score is not a float")
            
        check("signal" in news, "news signal field present", "news signal field missing")
        if "signal" in news:
            check(news["signal"] in ["positive", "negative", None], "news signal is valid ('positive', 'negative', or None)", "news signal is invalid")
            
        check("headlines" in news, "news headlines field present", "news headlines field missing")
        if "headlines" in news:
            check(isinstance(news["headlines"], list), "news headlines is a list", "news headlines is not a list")
            
        check("deal_type" in news, "news deal_type field present", "news deal_type field missing")

    # 7. Print final conclusion
    if all_passed:
        print("\nAll checks passed. Output matches contract.")
    else:
        print("\nSome checks failed. Output does NOT fully match contract.")

if __name__ == "__main__":
    verify_output()
