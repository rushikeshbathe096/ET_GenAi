import requests
import random
from datetime import datetime

BSE_BULK_URL = "https://api.bseindia.com/BseIndiaAPI/api/BulkDeal/w"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://www.bseindia.com/"
}

def fetch_bulk_deals(symbol: str | None = None):
    try:
        resp = requests.get(BSE_BULK_URL, headers=HEADERS, timeout=5)

        if "html" in resp.text.lower():
            raise Exception("Blocked by BSE")

        data = resp.json()

        deals = []
        for row in data.get("Table", []):
            deals.append({
                "ticker": row.get("SCRIP_CD", ""),
                "company": row.get("SCRIP_NM", ""),
                "buyer": row.get("CLIENT_NM", ""),
                "quantity": row.get("QTY_TRD", 0),
                "price": row.get("TRADE_PRICE", 0),
                "deal_type": "bulk_deal",
                "date": row.get("TRADE_DT", ""),
                "source_url": "https://bseindia.com/corporates/Bulk_Block_Short.html",
                "is_fallback": False,
            })

        if deals:
            if symbol:
                normalized = str(symbol).strip().upper()
                return [d for d in deals if str(d.get("ticker", "")).strip().upper() == normalized]
            return deals

    except Exception:
        pass

    # 🔥 FALLBACK (DON’T REMOVE THIS)
    companies = [
        ("TITAN", "Titan Company Ltd"),
        ("INFY", "Infosys Ltd"),
        ("HDFCBANK", "HDFC Bank Ltd"),
        ("RELIANCE", "Reliance Industries Ltd"),
        ("TCS", "Tata Consultancy Services Ltd"),
    ]

    results = []

    for ticker, company in companies:
        results.append({
            "ticker": ticker,
            "company": company,
            "buyer": "Simulated Buyer",
            "quantity": random.randint(100000, 500000),
            "price": random.uniform(1000, 3000),
            "deal_type": "bulk_deal",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "source_url": "https://bseindia.com/",
            "is_fallback": True,
        })

    if symbol:
        normalized = str(symbol).strip().upper()
        return [r for r in results if str(r.get("ticker", "")).strip().upper() == normalized]
    return results

if __name__ == "__main__":
    data = fetch_bulk_deals()
    print("\nSample output:")
    for item in data[:3]:
        print(item) []
        for entry in feed.entries[:20]:
            title = str(entry.get("title", "")).lower()
            if any(alias in title for alias in aliases) or "result" in title or "quarterly" in title:
                results.append({
                    "deal_type": "announcement",
                    "title": entry.get("title", ""),
                    "date": entry.get("published", ""),
                    "is_fallback": False
                })
        return results[:3]
    except Exception as exc:
        print(f"BSE announcements failed for {ticker}: {exc}")
        return []