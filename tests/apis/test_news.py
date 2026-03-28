import re
import time
from urllib.parse import quote_plus


def classify_sentiment(score: float) -> str:
    if score > 0.1:
        return "POSITIVE"
    if score < -0.1:
        return "NEGATIVE"
    return "NEUTRAL"


def headline_matches(title: str, phrases: list[str], tokens: list[str]) -> bool:
    headline_lower = title.lower()
    if any(phrase in headline_lower for phrase in phrases):
        return True

    words = set(re.findall(r"[a-z0-9]+", headline_lower))
    return any(token in words for token in tokens)


def build_google_news_rss(query: str) -> str:
    encoded = quote_plus(query)
    return (
        f"https://news.google.com/rss/search?q={encoded}"
        "&hl=en-IN&gl=IN&ceid=IN:en"
    )


def run_news_check() -> None:
    print("=== NEWS API CHECK ===\n")

    try:
        import feedparser
        from textblob import TextBlob
    except ImportError as exc:
        print(f"Dependency import failed -> ERROR ({exc})")
        print("\n=== CHECK COMPLETE ===")
        return

    companies = ["Reliance", "TCS", "Infosys", "HDFC Bank", "OFSS"]
    company_keywords = {
        "Reliance": {
            "phrases": [
                "reliance industries",
                "reliance industries ltd",
                "reliance retail",
                "jio",
            ],
            "tokens": ["reliance", "ril"],
            "search_terms": ["Reliance Industries share", "Reliance Jio"],
        },
        "TCS": {
            "phrases": [
                "tata consultancy services",
                "tata consultancy services ltd",
            ],
            "tokens": ["tcs"],
            "search_terms": ["TCS share", "Tata Consultancy Services"],
        },
        "Infosys": {
            "phrases": ["infosys ltd", "infosys limited"],
            "tokens": ["infosys", "infy"],
            "search_terms": ["Infosys share", "INFY"],
        },
        "HDFC Bank": {
            "phrases": ["hdfc bank ltd", "hdfc bank limited"],
            "tokens": ["hdfc", "hdb"],
            "search_terms": ["HDFC Bank share", "HDFC Bank"],
        },
        "OFSS": {
            "phrases": [
                "oracle financial services software",
                "oracle financial services",
                "ofss",
            ],
            "tokens": ["ofss"],
            "search_terms": [
                "OFSS share",
                "Oracle Financial Services Software",
            ],
        },
    }
    sector_keywords = {
        # Keep sector filters specific so generic world headlines are not mislabeled.
        "IT": [
            "it services",
            "software services",
            "digital transformation",
            "cloud spending",
            "enterprise software",
            "outsourcing",
            "tech spending",
        ],
        "BANKING": [
            "bank earnings",
            "rbi",
            "interest rates",
            "repo rate",
            "net interest margin",
            "deposit growth",
            "npa",
            "liquidity",
        ],
        "ENERGY": [
            "oil prices",
            "crude oil",
            "brent",
            "wti",
            "opec",
            "petrochemical",
            "refinery",
            "lng",
        ],
    }
    global_keywords = [
        "interest rates",
        "inflation",
        "cpi",
        "gdp",
        "central bank",
        "federal reserve",
        "rbi",
        "currency",
        "rupee",
        "dollar",
        "oil prices",
        "crude oil",
        "brent",
        "wti",
        "opec",
        "trade",
        "tariff",
        "geopolitical",
        "sanctions",
        "war",
        "recession",
    ]
    sector_search_terms = {
        "IT": ["India IT services demand", "enterprise tech spending India"],
        "BANKING": ["India banking sector outlook", "RBI policy banks India"],
        "ENERGY": ["India energy sector outlook", "crude oil impact India"],
    }
    sector_global_context_terms = {
        "IT": ["US recession risk", "global tech spending"],
        "BANKING": ["RBI repo rate", "India inflation"],
        "ENERGY": ["crude oil prices", "OPEC decision"],
    }
    company_sector = {
        "Reliance": "ENERGY",
        "TCS": "IT",
        "Infosys": "IT",
        "HDFC Bank": "BANKING",
        "OFSS": "IT",
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
    max_global_headlines = 2
    max_total_headlines = 7

    total_start = time.perf_counter()

    for company in companies:
        company_start = time.perf_counter()
        company_headlines = []
        sector_headlines = []
        global_headlines = []
        seen_titles = set()
        any_feed_ok = False
        company_match = company_keywords.get(company, {})
        sector = company_sector.get(company)
        company_tokens = company_match.get("tokens", [])
        company_search_sources = [
            build_google_news_rss(term)
            for term in company_match.get("search_terms", [])
        ]
        company_sources = company_search_sources + company_rss_sources
        sector_search_sources = [
            build_google_news_rss(term)
            for term in sector_search_terms.get(sector, [])
        ]
        sector_sources = sector_search_sources + global_rss_sources
        global_search_sources = [
            build_google_news_rss(f"{company} {term}")
            for term in sector_global_context_terms.get(sector, [])
        ]
        global_sources = global_search_sources + global_rss_sources

        for url in company_sources:
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

                    strong_match = headline_matches(
                        title,
                        company_match.get("phrases", []),
                        company_match.get("tokens", []),
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

        for url in sector_sources:
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

        for url in global_sources:
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
                    macro_match = any(
                        keyword in headline_lower for keyword in global_keywords
                    )
                    company_context_match = any(
                        token in set(re.findall(r"[a-z0-9]+", headline_lower))
                        for token in company_tokens
                    )
                    if not macro_match and not company_context_match:
                        continue

                    key = title.lower()
                    if key in seen_titles:
                        continue
                    seen_titles.add(key)

                    global_headlines.append(title)
                    if len(global_headlines) >= max_global_headlines:
                        break

                if len(global_headlines) >= max_global_headlines:
                    break

            except Exception:
                continue

        elapsed = time.perf_counter() - company_start

        if (
            not any_feed_ok
            and not company_headlines
            and not sector_headlines
            and not global_headlines
        ):
            print(f"{company} -> ERROR (RSS failed) | Time: {elapsed:.2f}s")
            print("")
            continue

        if not company_headlines and not sector_headlines and not global_headlines:
            print(f"{company} -> WARNING (no relevant headlines) | Time: {elapsed:.2f}s")
            print("")
            continue

        combined_headlines = (
            company_headlines + sector_headlines + global_headlines
        )[:max_total_headlines]
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

        print("Global Headlines:")
        if global_headlines:
            for headline in global_headlines:
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
