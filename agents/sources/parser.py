from datetime import datetime

def merge_all_sources(bse_data, sebi_data, nse_data, circular_data, news_data):
    """
    Merge all sources into one structured output per ticker.
    """

    grouped = {}

    def add_event(ticker, company, event):
        if ticker not in grouped:
            grouped[ticker] = {
                "ticker": ticker,
                "company": company,
                "events": [],
                "news": None,
                "date": datetime.now().strftime("%Y-%m-%d")
            }

        # deduplicate
        if event not in grouped[ticker]["events"]:
            grouped[ticker]["events"].append(event)

    # 🔹 BSE events
    for item in bse_data:
        ticker = item.get("ticker")
        company = item.get("company", ticker)

        event = {
            "deal_type": item.get("deal_type"),
            "title": item.get("title"),
            "quantity": item.get("quantity"),
            "metadata": item.get("metadata", {}),
            "source_url": item.get("source_url")
        }

        add_event(ticker, company, event)

    # 🔹 SEBI events
    for item in sebi_data:
        ticker = item.get("ticker")
        company = item.get("company", ticker)

        event = {
            "deal_type": item.get("deal_type"),
            "person_role": item.get("person_role"),
            "transaction": item.get("transaction"),
            "quantity": item.get("quantity"),
            "value": item.get("value"),
            "source_url": item.get("source_url")
        }

        add_event(ticker, company, event)

    # 🔹 NSE announcements (no ticker → skip or map)
    for item in nse_data:
        # optional: skip since no ticker mapping
        continue

    # 🔹 Circulars (global events → skip or attach later)
    for item in circular_data:
        continue

    # 🔹 Attach news
    for ticker, data in grouped.items():
        company = data["company"]

        news = news_data.get(company)

        if not news:
            news = {
                "score": 0.0,
                "signal": None,
                "headlines": [],
                "deal_type": "news_sentiment"
            }

        grouped[ticker]["news"] = news

    return list(grouped.values())


if __name__ == "__main__":
    # quick test
    sample = merge_all_sources(
        [{"ticker": "TITAN", "company": "Titan", "deal_type": "bulk_deal", "quantity": 100}],
        [],
        [],
        [],
        {}
    )

    import json
    print(json.dumps(sample, indent=2))