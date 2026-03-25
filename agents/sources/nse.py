import random
from datetime import datetime

try:
    from config import DEBUG
except ImportError:
    DEBUG = False


def fetch_nse_announcements():
    """
    NSE is unreliable / blocks requests.
    So we skip live fetching and return simulated but realistic announcements.
    Always returns valid structured data.
    """

    if DEBUG:
        print("Skipping NSE RSS (unreliable). Using fallback data.")

    companies = ["TITAN", "INFY", "HDFCBANK", "RELIANCE", "TCS"]
    titles = [
        "Q3 Results Announced",
        "Board Meeting Update",
        "Dividend Declared",
        "Earnings Call Scheduled",
        "Strategic Partnership Announced"
    ]

    results = []

    for company in companies:
        results.append({
            "title": f"{company}: {random.choice(titles)}",
            "summary": f"Simulated corporate announcement for {company}",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "source_url": "https://www.nseindia.com/",
            "deal_type": "announcement"
        })

    return results


if __name__ == "__main__":
    data = fetch_nse_announcements()

    print("\nSample output:")
    for item in data[:3]:
        print(item)