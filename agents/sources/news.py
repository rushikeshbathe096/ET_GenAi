import re
import argparse
from urllib.parse import quote_plus

try:
    import feedparser
except ImportError:
    feedparser = None

try:
    from textblob import TextBlob

    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False

# try:
#     from config import DEBUG
# except ImportError:
#     DEBUG = False


COMPANY_RSS_SOURCES = [
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "https://www.moneycontrol.com/rss/business.xml",
    "https://www.business-standard.com/rss/markets-106.rss",
]

GLOBAL_RSS_SOURCES = [
    "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
    "https://www.cnbc.com/id/10001147/device/rss/rss.html",
    "https://economictimes.indiatimes.com/news/international/world-news/rssfeeds/85536586.cms",
]

SECTOR_KEYWORDS = {
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
    "GENERIC": ["market", "stocks", "shares", "earnings", "results"],
}

SECTOR_SEARCH_TERMS = {
    "IT": ["India IT services demand", "enterprise tech spending India"],
    "BANKING": ["India banking sector outlook", "RBI policy banks India"],
    "ENERGY": ["India energy sector outlook", "crude oil impact India"],
    "GENERIC": ["India stock market outlook", "corporate earnings India"],
}

SECTOR_GLOBAL_CONTEXT_TERMS = {
    "IT": ["US recession risk", "global tech spending"],
    "BANKING": ["RBI repo rate", "India inflation"],
    "ENERGY": ["crude oil prices", "OPEC decision"],
    "GENERIC": ["interest rate outlook", "inflation trend"],
}

GLOBAL_KEYWORDS = [
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

def _classify_signal(score: float) -> str | None:
    if score > 0.1:
        return "positive"
    if score < -0.1:
        return "negative"
    return None


def _build_google_news_rss(query: str) -> str:
    encoded = quote_plus(query)
    return (
        f"https://news.google.com/rss/search?q={encoded}"
        "&hl=en-IN&gl=IN&ceid=IN:en"
    )


def _headline_matches(title: str, phrases: list[str], tokens: list[str]) -> bool:
    headline_lower = title.lower()
    if any(phrase in headline_lower for phrase in phrases):
        return True

    words = set(re.findall(r"[a-z0-9]+", headline_lower))
    return any(token in words for token in tokens)


def _tokenize_company_name(company: str) -> list[str]:
    stop_words = {
        "limited",
        "ltd",
        "inc",
        "corp",
        "corporation",
        "company",
        "co",
        "plc",
        "services",
        "software",
    }
    tokens = [
        token
        for token in re.findall(r"[a-z0-9]+", company.lower())
        if len(token) >= 3 and token not in stop_words
    ]
    return list(dict.fromkeys(tokens))


def _infer_sector_from_company(company: str) -> str:
    lowered = str(company or "").lower()

    banking_terms = ("bank", "finance", "nbfc", "housing")
    energy_terms = ("oil", "gas", "petro", "energy", "power")
    it_terms = ("software", "tech", "it", "digital", "consultancy")

    # If company clearly looks tech/software, classify as IT before finance words.
    if any(term in lowered for term in it_terms):
        return "IT"

    if any(term in lowered for term in banking_terms):
        return "BANKING"
    if any(term in lowered for term in energy_terms):
        return "ENERGY"
    return "GENERIC"


def _infer_company_profile(company: str, sector: str | None = None, country: str = "India", time_window: str = "24h") -> dict:
    company_clean = str(company or "").strip()
    lowered = company_clean.lower()

    inferred_tokens = _tokenize_company_name(company_clean)
    inferred_phrases = [lowered] if lowered else []
    inferred_sector = str(sector or _infer_sector_from_company(company_clean)).strip().upper() or "GENERIC"
    inferred_search_terms = []
    if company_clean:
        inferred_search_terms = [
            company_clean,
            f"{company_clean} share",
            f"{company_clean} stock",
            f"{company_clean} {country} {time_window}",
        ]

    return {
        "sector": inferred_sector,
        "phrases": inferred_phrases,
        "tokens": inferred_tokens,
        "search_terms": inferred_search_terms,
    }


def _collect_headlines(urls: list[str], matcher) -> tuple[list[str], bool]:
    headlines: list[str] = []
    seen: set[str] = set()
    any_feed_ok = False

    for url in urls:
        try:
            parsed = feedparser.parse(url)
            entries = getattr(parsed, "entries", [])
            if entries:
                any_feed_ok = True

            for entry in entries:
                title = (getattr(entry, "title", "") or "").strip()
                if not title:
                    continue

                if not matcher(title):
                    continue

                key = title.lower()
                if key in seen:
                    continue
                seen.add(key)
                headlines.append(title)

        except Exception as exc:
            if DEBUG:
                print(f"News source failed: {url} -> {exc}")
            continue

    return headlines, any_feed_ok


def _words_set(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", (text or "").lower()))


def fetch_news_sentiment(
    company: str,
    sector: str | None = None,
    country: str = "India",
    time_window: str = "24h",
) -> dict:
    """
    Fetch company, sector, and global headlines and compute sentiment.
    Returns a stable structure used by analysis pipeline.
    """

    default_response = {
        "score": 0.0,
        "signal": None,
        "headlines": [],
        "deal_type": "news_sentiment",
        "is_fallback": True,
        "source_status": "fallback",
        "company_headlines": [],
        "sector_headlines": [],
        "global_headlines": [],
    }

    try:
        if not feedparser:
            raise RuntimeError("feedparser not installed")

        profile = _infer_company_profile(
            company=company,
            sector=sector,
            country=country,
            time_window=time_window,
        )
        sector = profile.get("sector", "GENERIC")
        phrases = profile.get("phrases", [])
        tokens = profile.get("tokens", [])
        search_terms = profile.get("search_terms", [])
        sector_terms = SECTOR_SEARCH_TERMS.get(sector, SECTOR_SEARCH_TERMS["GENERIC"])
        macro_context_terms = SECTOR_GLOBAL_CONTEXT_TERMS.get(
            sector, SECTOR_GLOBAL_CONTEXT_TERMS["GENERIC"]
        )

        company_sources = [_build_google_news_rss(term) for term in search_terms] + COMPANY_RSS_SOURCES
        sector_sources = [_build_google_news_rss(term) for term in sector_terms]
        sector_sources += [_build_google_news_rss(f"{company} {sector} {country}")]
        sector_sources += GLOBAL_RSS_SOURCES
        global_sources = [
            _build_google_news_rss(f"{company} {term} {country} {time_window}")
            for term in macro_context_terms
        ]
        global_sources += GLOBAL_RSS_SOURCES

        company_headlines, company_feed_ok = _collect_headlines(
            company_sources,
            lambda title: _headline_matches(title, phrases, tokens),
        )
        sector_headlines, sector_feed_ok = _collect_headlines(
            sector_sources,
            lambda title: (
                any(k in title.lower() for k in SECTOR_KEYWORDS.get(sector, []))
                and (
                    _headline_matches(title, phrases, tokens)
                    or any(k in title.lower() for k in sector_terms)
                )
            ),
        )
        global_headlines, global_feed_ok = _collect_headlines(
            global_sources,
            lambda title: (
                any(k in title.lower() for k in GLOBAL_KEYWORDS)
                and (
                    _headline_matches(title, phrases, tokens)
                    or any(k in title.lower() for k in SECTOR_KEYWORDS.get(sector, []))
                    or any(
                        term.lower() in title.lower()
                        for term in macro_context_terms
                    )
                )
            ),
        )

        company_headlines = company_headlines[:3]
        sector_headlines = sector_headlines[:2]
        global_headlines = global_headlines[:2]

        combined = company_headlines + sector_headlines + global_headlines
        combined = list(dict.fromkeys(combined))[:7]

        if not combined:
            status = "no_relevant_headlines"
            if not (company_feed_ok or sector_feed_ok or global_feed_ok):
                status = "fallback"
            return {**default_response, "source_status": status}

        if TEXTBLOB_AVAILABLE:
            polarity = float(TextBlob(" ".join(combined)).sentiment.polarity)
        else:
            polarity = 0.0

        return {
            "score": round(polarity, 2),
            "signal": _classify_signal(polarity),
            "headlines": combined,
            "deal_type": "news_sentiment",
            "is_fallback": False,
            "source_status": "live",
            "company": str(company),
            "sector": str(sector),
            "country": str(country),
            "time_window": str(time_window),
            "company_headlines": company_headlines,
            "sector_headlines": sector_headlines,
            "global_headlines": global_headlines,
        }

    except Exception as exc:
        if DEBUG:
            print(f"News fetch failed: {exc}")
        return default_response


def _label_from_score(score: float) -> str:
    if score > 0.1:
        return "POSITIVE"
    if score < -0.1:
        return "NEGATIVE"
    return "NEUTRAL"


def _print_news_report(result: dict) -> None:
    company = result.get("company") or "Unknown"
    score = float(result.get("score", 0.0))

    print("=== NEWS API CHECK ===\n")
    if result.get("is_fallback", True) and not result.get("headlines"):
        print(f"{company} -> WARNING (no relevant headlines)")
    else:
        print(f"{company} -> SUCCESS")

    print("Company Headlines:")
    company_headlines = result.get("company_headlines", [])
    if company_headlines:
        for headline in company_headlines:
            print(f"- {headline}")
    else:
        print("- None")

    print("Sector Headlines:")
    sector_headlines = result.get("sector_headlines", [])
    if sector_headlines:
        for headline in sector_headlines:
            print(f"- {headline}")
    else:
        print("- None")

    print("Global Headlines:")
    global_headlines = result.get("global_headlines", [])
    if global_headlines:
        for headline in global_headlines:
            print(f"- {headline}")
    else:
        print("- None")

    print(f"Sentiment: {_label_from_score(score)} ({score:.2f})")
    print("\n=== CHECK COMPLETE ===")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run company news sentiment check.")
    parser.add_argument("company", nargs="?", default="Dr. Reddy's Laboratories", help="Company name")
    parser.add_argument("--sector", default="", help="Sector (optional, e.g., IT/BANKING/ENERGY)")
    parser.add_argument("--country", default="India", help="Country context for search")
    parser.add_argument("--time-window", default="24h", help="Time window label (e.g., 24h, 7d)")
    args = parser.parse_args()

    response = fetch_news_sentiment(
        company=args.company,
        sector=args.sector or None,
        country=args.country,
        time_window=args.time_window,
    )
    _print_news_report(response)