from nsepython import nse_eq, get_bulkdeals, get_blockdeals
import yfinance as yf


def _to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _build_price_payload(ticker: str, price: float, change_pct: float, source: str, volume: float = None, company: str = None) -> dict:
    return {
        "ticker": ticker,
        "company": company if company else ticker,
        "events": [
            {
                "deal_type": "price_movement",
                "price": price,
                "change_pct": change_pct,
                "volume": volume,
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

        volume = None
        if isinstance(data.get("preOpenMarket"), dict):
            volume = _to_float(data["preOpenMarket"].get("totalTradedVolume"))

        company = None
        info = data.get("info", {})
        if isinstance(info, dict):
            company = info.get("companyName")
        if not company:
            metadata = data.get("metadata", {})
            if isinstance(metadata, dict):
                company = metadata.get("companyName")

        return _build_price_payload(ticker, price, change_pct, "nse", volume, company)
    except Exception as exc:
        print(f"NSE fetch failed for {ticker}: {exc}")
        return None

def _fetch_from_yfinance(ticker: str) -> dict | None:
    try:
        # Indices (^) and special symbols shouldn't have .NS suffix
        yf_ticker = ticker
        if not ticker.startswith("^") and not ticker.endswith(".NS"):
            yf_ticker = f"{ticker}.NS"
            
        history = yf.Ticker(yf_ticker).history(period="5d")
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


def fetch_price_data(symbol: str) -> dict:
    """Return normalized price data for one symbol."""
    ticker = str(symbol or "").strip().upper()
    if not ticker:
        return {
            "symbol": "",
            "company": "",
            "price": None,
            "change_pct": 0.0,
            "volume": None,
            "source": "unavailable",
        }

    payload = fetch_nse_data(ticker)
    events = payload.get("events", []) if isinstance(payload, dict) else []
    event = events[0] if events and isinstance(events[0], dict) else {}
    company_name = payload.get("company") if isinstance(payload, dict) else None

    return {
        "symbol": ticker,
        "company": company_name if company_name else ticker,
        "price": event.get("price"),
        "change_pct": _to_float(event.get("change_pct")) if event else 0.0,
        "volume": _to_float(event.get("volume")) if event else None,
        "source": event.get("source", "unavailable") if event else "unavailable",
    }


def fetch_bulk_deals(ticker: str) -> list[dict]:
    try:
        raw = get_bulkdeals()
        if raw is None:
            return []
        
        # get_bulkdeals() returns a pandas DataFrame
        import pandas as pd
        if isinstance(raw, pd.DataFrame):
            df = raw
        else:
            return []
        
        if df.empty:
            return []
        
        # Filter by ticker symbol
        mask = df["Symbol"].str.strip().str.upper() == ticker.strip().upper()
        filtered = df[mask]
        
        if filtered.empty:
            return []
        
        results = []
        for _, row in filtered.iterrows():
            qty = _to_float(row.get("Quantity Traded", 0))
            if not qty:
                continue
            results.append({
                "deal_type": "bulk_deal",
                "buyer": str(row.get("Client Name", "Unknown")).strip(),
                "quantity": qty,
                "transaction": str(row.get("Buy/Sell", "")).strip().lower(),
                "price": _to_float(row.get("Trade Price / Wght. Avg. Price", 0)),
                "is_fallback": False
            })
        return results
    except Exception as exc:
        print(f"Bulk deals fetch failed for {ticker}: {exc}")
        return []


def fetch_insider_trades(ticker: str) -> list[dict]:
    # nsepython does not expose insider trading data
    # returning empty list — will integrate SEBI source when available
    return []


def fetch_indices() -> list[dict]:
    """Fetch major NSE indices performance."""
    indices = {
        "Nifty 50": "^NSEI",
        "Nifty Bank": "^NSEBANK",
        "Nifty IT": "^CNXIT",
        "Nifty Auto": "^CNXAUTO",
        "Nifty Pharma": "^CNXPHARMA",
        "Nifty Energy": "^CNXENERGY",
    }
    results = []
    for name, ticker in indices.items():
        try:
            # Note: _fetch_from_yfinance returns a dict with 'events' list
            temp = _fetch_from_yfinance(ticker.replace(".NS", ""))
            if temp and "events" in temp and len(temp["events"]) > 0:
                event = temp["events"][0]
                results.append({
                    "name": name,
                    "price": event.get("price"),
                    "change": event.get("change_pct")
                })
        except Exception as e:
            print(f"Index fetch failed for {name}: {e}")
            continue
    return results

