from .nse_source import fetch_nse_data

try:
    from config import DEBUG
except ImportError:
    DEBUG = False


def get_nse_data(ticker: str):
    data = fetch_nse_data(ticker)

    fallback_company_map = {
        "TITAN": "Titan Company Ltd",
        "INFY": "Infosys Ltd",
        "HDFCBANK": "HDFC Bank Ltd",
        "RELIANCE": "Reliance Industries Ltd",
        "TCS": "Tata Consultancy Services Ltd"
    }
    fallback_company = fallback_company_map.get(ticker, ticker)

    if data:
        info = data.get("info", {})
        price_info = data.get("priceInfo", {})

        return {
            "ticker": info.get("symbol", ticker),
            "company": info.get("companyName", fallback_company),
            "events": [
                {
                    "deal_type": "price_movement",
                    "price": price_info.get("lastPrice"),
                    "change_pct": price_info.get("pChange")
                }
            ]
        }

    if DEBUG:
        print(f"NSE live fetch unavailable for {ticker}. Using fallback event.")

    return {
        "ticker": ticker,
        "company": fallback_company,
        "events": [
            {
                "deal_type": "price_movement",
                "reason": "nse_data_unavailable",
                "price": None,
                "change_pct": 0
            }
        ]
    }


def fetch_nse_announcements():
    """
    Fetch NSE price movement data for tracked tickers.
    Uses live NSE data when available; falls back to simulated events when unavailable.
    """

    companies = ["TITAN", "INFY", "HDFCBANK", "RELIANCE", "TCS"]

    results = []

    for ticker in companies:
        results.append(get_nse_data(ticker))

    return results


if __name__ == "__main__":
    data = fetch_nse_announcements()

    print("\nSample output:")
    for item in data[:3]:
        print(item)