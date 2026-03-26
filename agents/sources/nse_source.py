from nsepython import nse_eq


def fetch_nse_data(ticker: str) -> dict | None:
    """Fetch raw NSE data for a ticker using nsepython."""
    try:
        return nse_eq(ticker)
    except Exception as exc:
        print(f"NSE fetch failed for {ticker}: {exc}")
        return None
