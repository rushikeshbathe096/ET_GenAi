from datetime import datetime


def _fallback_price_event() -> dict:
    return {
        "deal_type": "price_movement",
        "reason": "nse_data_unavailable",
        "price": None,
        "change_pct": 0,
        "source": "fallback"
    }


def _has_price_movement(events: list) -> bool:
    return any(event.get("deal_type") == "price_movement" for event in events)

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

        if event.get("deal_type") == "price_movement":
            existing_events = grouped[ticker]["events"]
            existing_index = next(
                (
                    index
                    for index, existing in enumerate(existing_events)
                    if existing.get("deal_type") == "price_movement"
                ),
                None,
            )

            if existing_index is not None:
                existing_event = existing_events[existing_index]
                existing_source = existing_event.get("source")
                incoming_source = event.get("source")

                # Keep real market data over fallback, and upgrade fallback to real when available.
                if existing_source in {"nse", "yfinance"} and incoming_source == "fallback":
                    return
                if existing_source == "fallback" and incoming_source in {"nse", "yfinance"}:
                    existing_events[existing_index] = event
                    return

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

    # 🔹 NSE price events
    for item in nse_data:
        ticker = item.get("ticker")
        if not ticker:
            continue

        company = item.get("company", ticker)
        nse_events = item.get("events")

        if isinstance(nse_events, list) and nse_events:
            for nse_event in nse_events:
                event = {
                    "deal_type": nse_event.get("deal_type", "price_movement"),
                    "price": nse_event.get("price"),
                    "change_pct": nse_event.get("change_pct"),
                    "source": nse_event.get("source", "fallback")
                }
                add_event(ticker, company, event)
            continue

        # Backward-compatible fallback for flat NSE entries.
        event = {
            "deal_type": item.get("deal_type", "price_movement"),
            "price": item.get("price"),
            "change_pct": item.get("change_pct"),
            "source": item.get("source", "fallback")
        }
        add_event(ticker, company, event)

    # Ensure every grouped ticker has a price movement event.
    for ticker, data in grouped.items():
        if not _has_price_movement(data.get("events", [])):
            add_event(ticker, data.get("company", ticker), _fallback_price_event())

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