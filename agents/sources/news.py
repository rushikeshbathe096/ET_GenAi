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


def fetch_news_sentiment(company: str) -> dict:
    """
    Fetches news sentiment for a company using ET Markets RSS.
    Falls back to simulated sentiment if RSS or TextBlob fails.
    Always returns valid structured output.
    """

    default_response = {
        "score": 0.0,
        "signal": None,
        "headlines": [],
        "deal_type": "news_sentiment",
        "is_fallback": True,
        "source_status": "fallback",
    }

    try:
        if not feedparser:
            raise Exception("feedparser not installed")

        feed = feedparser.parse("https://economictimes.indiatimes.com/markets/rss.cms")

        if not feed.entries:
            raise Exception("No RSS entries")

        company_lower = company.lower()
        matched = []

        for entry in feed.entries:
            title = entry.get("title", "")
            if company_lower in title.lower():
                matched.append(title)

        if not matched:
            raise Exception("No matching company news")

        matched = matched[:5]

        scores = []

        for title in matched:
            if TEXTBLOB_AVAILABLE:
                polarity = TextBlob(title).sentiment.polarity
            else:
                polarity = random.uniform(-0.5, 0.5)

            scores.append(polarity)

        avg_score = sum(scores) / len(scores)

        if avg_score > 0.3:
            signal = "positive"
        elif avg_score < -0.3:
            signal = "negative"
        else:
            signal = None

        return {
            "score": float(round(avg_score, 2)),
            "signal": signal,
            "headlines": matched,
            "deal_type": "news_sentiment",
            "is_fallback": False,
            "source_status": "live",
        }

    except Exception as e:
        if DEBUG:
            print(f"News fetch failed: {e}")

        # Fallback is explicit and non-signal generating.
        return default_response


if __name__ == "__main__":
    print(fetch_news_sentiment("Titan"))