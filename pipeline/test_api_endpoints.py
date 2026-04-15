import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_endpoint(name, path, method="GET", data=None):
    print(f"Testing {name} ({path})...")
    start = time.time()
    try:
        if method == "GET":
            r = requests.get(f"{BASE_URL}{path}", timeout=30)
        else:
            r = requests.post(f"{BASE_URL}{path}", json=data, timeout=30)
        
        duration = time.time() - start
        print(f"  Status: {r.status_code}")
        print(f"  Time: {duration:.2f}s")
        if r.status_code == 200:
            print(f"  Sample Content: {str(r.json())[:100]}...")
        else:
            print(f"  Error: {r.text}")
    except Exception as e:
        print(f"  Failed: {e}")
    print("-" * 30)

if __name__ == "__main__":
    print("ALPHA NODE API DIAGNOSTIC\n")
    test_endpoint("Wishlist Get", "/wishlist")
    test_endpoint("Market Overview", "/market/overview")
    test_endpoint("Analytics Summary", "/market/analytics")
    test_endpoint("Market Signals", "/market/signals")
