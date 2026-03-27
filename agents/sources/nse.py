from .nse_source import fetch_nse_data

try:
    from config import DEBUG
except ImportError:
    DEBUG = False


def get_nse_data(ticker: str):
    data = fetch_nse_data(ticker)

    if data is None and DEBUG:
        print(f"NSE/yfinance unavailable for {ticker}.")

    return data


def fetch_nse_announcements():
    """
    Fetch NSE price movement data for tracked tickers.
    Uses live NSE data when available; falls back to simulated events when unavailable.
    """

    companies = ["TITAN", "INFY", "HDFCBANK", "RELIANCE", "TCS"]

    results = []

    for ticker in companies:
        data = get_nse_data(ticker)
        if data is not None:
            results.append(data)

    return results


if __name__ == "__main__":
    data = fetch_nse_announcements()

    print("\nSample output:")
    for item in data[:3]:
        print(item)