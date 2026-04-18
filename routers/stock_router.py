from fastapi import APIRouter
from pipeline.run_pipeline import analyze_stock

router = APIRouter(prefix="/stock", tags=["stock"])

@router.get("/{symbol}")
def get_stock_analysis(symbol: str):
    return analyze_stock(symbol)

@router.get("/{symbol}/history")
def get_stock_history(symbol: str):
    try:
        import yfinance as yf
        ticker = yf.Ticker(f"{symbol}.NS")
        hist = ticker.history(period="30d", interval="1d")
        if hist.empty:
            return {"symbol": symbol, "history": []}
        history = []
        for date, row in hist.iterrows():
            history.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"])
            })
        return {"symbol": symbol, "history": history}
    except Exception:
        return {"symbol": symbol, "history": []}