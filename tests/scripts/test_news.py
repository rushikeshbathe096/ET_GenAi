import time


def classify_sentiment(score: float) -> str:
    if score > 0.1:
        return "POSITIVE"
    if score < -0.1:
        return "NEGATIVE"
    return "NEUTRAL"


def run_news_check() -> None:
    print("=== NEWS API CHECK ===\n")

    try:
        import feedparser
        from textblob import TextBlob
    except ImportError as exc:
        print(f"Dependency import failed -> ERROR ({exc})")
        print("\n=== CHECK COMPLETE ===")
        return

    companies = ["Reliance", "TCS", "Infosys", "HDFC Bank"]
    company_keywords = {
        "Reliance": ["reliance industries", "reliance industries ltd"],
        "TCS": ["tata consultancy services", "tata consultancy services ltd"],
        "Infosys": ["infosys ltd", "infosys limited"],
        "HDFC Bank": ["hdfc bank ltd", "hdfc bank limited"],
    }
    sector_keywords = {
        "IT": ["software", "it services", "tech companies"],
        "BANKING": ["bank earnings", "rbi", "interest rates"],
        "ENERGY": ["oil prices", "crude oil", "energy sector"],
    }
    company_sector = {
        "Reliance": "ENERGY",
        "TCS": "IT",
        "Infosys": "IT",
        "HDFC Bank": "BANKING",
    }
    company_rss_sources = [
        "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
        "https://www.moneycontrol.com/rss/business.xml",
        "https://www.business-standard.com/rss/markets-106.rss",
    ]
    global_rss_sources = [
        "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
        "https://www.cnbc.com/id/10001147/device/rss/rss.html",
        "https://economictimes.indiatimes.com/news/international/world-news/rssfeeds/85536586.cms",
    ]
    max_company_headlines = 3
    max_sector_headlines = 2
    max_total_headlines = 5

    total_start = time.perf_counter()

    for company in companies:
        company_start = time.perf_counter()
        company_headlines = []
        sector_headlines = []
        seen_titles = set()
        any_feed_ok = False

        for url in company_rss_sources:
            try:
                parsed = feedparser.parse(url)

                # bozo indicates malformed feed; we still try entries if present.
                entries = getattr(parsed, "entries", [])
                if entries:
                    any_feed_ok = True

                for entry in entries:
                    title = (getattr(entry, "title", "") or "").strip()
                    if not title:
                        continue

                    headline_lower = title.lower()
                    strong_keywords = company_keywords.get(company, [])
                    strong_match = any(
                        strong_keyword in headline_lower
                        for strong_keyword in strong_keywords
                    )
                    if not strong_match:
                        continue

                    key = title.lower()
                    if key in seen_titles:
                        continue
                    seen_titles.add(key)

                    company_headlines.append(title)

                    if len(company_headlines) >= max_company_headlines:
                        break

                if len(company_headlines) >= max_company_headlines:
                    break

            except Exception:
                # Keep going to other RSS sources.
                continue

        for url in global_rss_sources:
            try:
                parsed = feedparser.parse(url)
                entries = getattr(parsed, "entries", [])
                if entries:
                    any_feed_ok = True

                for entry in entries:
                    title = (getattr(entry, "title", "") or "").strip()
                    if not title:
                        continue

                    headline_lower = title.lower()
                    sector = company_sector.get(company)
                    keywords = sector_keywords.get(sector, [])
                    if not any(keyword in headline_lower for keyword in keywords):
                        continue

                    key = title.lower()
                    if key in seen_titles:
                        continue
                    seen_titles.add(key)

                    sector_headlines.append(title)
                    if len(sector_headlines) >= max_sector_headlines:
                        break

                if len(sector_headlines) >= max_sector_headlines:
                    break

            except Exception:
                continue

        elapsed = time.perf_counter() - company_start

        if not any_feed_ok and not company_headlines and not sector_headlines:
            print(f"{company} -> ERROR (RSS failed) | Time: {elapsed:.2f}s")
            print("")
            continue

        if not company_headlines and not sector_headlines:
            print(f"{company} -> WARNING (no relevant headlines) | Time: {elapsed:.2f}s")
            print("")
            continue

        combined_headlines = (company_headlines + sector_headlines)[:max_total_headlines]
        combined_text = " ".join(combined_headlines)
        polarity = TextBlob(combined_text).sentiment.polarity
        sentiment_label = classify_sentiment(polarity)

        print(f"{company} -> SUCCESS | Time: {elapsed:.2f}s")
        print("Company Headlines:")
        if company_headlines:
            for headline in company_headlines:
                print(f"- {headline}")
        else:
            print("- None")

        print("Sector Headlines:")
        if sector_headlines:
            for headline in sector_headlines:
                print(f"- {headline}")
        else:
            print("- None")

        print(f"Sentiment: {sentiment_label} ({polarity:.2f})")
        print("")

    total_elapsed = time.perf_counter() - total_start
    print(f"Total execution time: {total_elapsed:.2f}s")
    print("\n=== CHECK COMPLETE ===")


if __name__ == "__main__":
    run_news_check()
