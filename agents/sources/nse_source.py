from nsepython import nse_eq
import yfinance as yf


def _to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _build_price_payload(ticker: str, price: float, change_pct: float, source: str) -> dict:
    return {
        "ticker": ticker,
        "events": [
            {
                "deal_type": "price_movement",
                "price": price,
                "change_pct": change_pct,
                "source": source
            }
        ]
    }


def _fetch_from_nse(ticker: str) -> dict | None:
    try:
        data = nse_eq(ticker)
        if not isinstance(data, dict):
            return None

        price_info = data.get("priceInfo", {})
        price = _to_float(price_info.get("lastPrice"))
        change_pct = _to_float(price_info.get("pChange"))

        if price is None or change_pct is None:
            return None

        return _build_price_payload(ticker, price, change_pct, "nse")
    except Exception as exc:
        print(f"NSE fetch failed for {ticker}: {exc}")
        return None


def _fetch_from_yfinance(ticker: str) -> dict | None:
    try:
        history = yf.Ticker(f"{ticker}.NS").history(period="5d")
        if history is None or history.empty or "Close" not in history:
            return None

        closes = history["Close"].dropna()
        if len(closes) == 0:
            return None

        last_close = _to_float(closes.iloc[-1])
        if last_close is None:
            return None

        if len(closes) >= 2:
            prev_close = _to_float(closes.iloc[-2])
            if prev_close in (None, 0):
                change_pct = 0.0
            else:
                change_pct = ((last_close - prev_close) / prev_close) * 100.0
        else:
            change_pct = 0.0

        return _build_price_payload(ticker, last_close, float(change_pct), "yfinance")
    except Exception as exc:
        print(f"yfinance fetch failed for {ticker}: {exc}")
        return None


def fetch_nse_data(ticker: str) -> dict | None:
    """Fetch ticker price movement with source priority: NSE -> yfinance -> None."""
    nse_data = _fetch_from_nse(ticker)
    if nse_data is not None:
        print(f"{ticker} → NSE SUCCESS")
        return nse_data

    yf_data = _fetch_from_yfinance(ticker)
    if yf_data is not None:
        print(f"{ticker} → YFINANCE USED")
        return yf_data

    return None
