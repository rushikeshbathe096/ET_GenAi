import re
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


def _get_search_terms(company_name: str) -> list[str]:
    """Map ticker symbols to descriptive search terms for Google News."""
    TICKER_TO_SEARCH = {
        "TCS": ["Tata Consultancy Services", "TCS share"],
        "INFY": ["Infosys share", "INFY stock"],
        "RELIANCE": ["Reliance Industries share", "Reliance Jio"],
        "HDFCBANK": ["HDFC Bank share", "HDFC Bank stock"],
        "ICICIBANK": ["ICICI Bank share"],
        "SBIN": ["SBI share", "State Bank of India"],
        "WIPRO": ["Wipro share"],
        "OFSS": ["Oracle Financial Services Software", "OFSS share"],
        "TITAN": ["Titan Company share"],
        "BAJFINANCE": ["Bajaj Finance share"],
        "ONGC": ["ONGC share", "Oil Natural Gas"],
        "TATAMOTORS": ["Tata Motors share"],
        "AXISBANK": ["Axis Bank share"],
    }
    
    # Check if the input name is a key in the mapping (ticker mode)
    clean_name = str(company_name).strip().upper()
    if clean_name in TICKER_TO_SEARCH:
        return TICKER_TO_SEARCH[clean_name]
    
    # Otherwise return the name directly
    return [company_name]


def _detect_sector(company_name: str) -> str:
    """Infer sector from company name keywords."""
    lowered = str(company_name).lower()
    if any(k in lowered for k in ["bank", "finance", "nbfc"]):
        return "BANKING"
    if any(k in lowered for k in ["software", "tech", "consultancy", "oracle", "infosys", "wipro", "tcs"]):
        return "IT"
    if any(k in lowered for k in ["oil", "gas", "energy", "petroleum", "reliance"]):
        return "ENERGY"
    if any(k in lowered for k in ["pharma", "health", "medicine"]):
        return "PHARMA"
    return "GENERAL"


def _fetch_headlines_from_rss(urls: list[str], max_count: int, filter_func=None) -> list[str]:
    if not feedparser:
        return []
        
    headlines = []
    seen = set()
    
    for url in urls:
        try:
            feed = feedparser.parse(url)
            for entry in feed.get("entries", []):
                title = str(entry.get("title", "")).strip()
                if not title or title.lower() in seen:
                    continue
                
                if filter_func and not filter_func(title):
                    continue
                    
                headlines.append(title)
                seen.add(title.lower())
                if len(headlines) >= max_count:
                    return headlines
        except Exception:
            continue
            
    return headlines


def fetch_news_sentiment(company: str) -> dict:
    """
    Overhauled news fetching logic using multiple RSS sources, sector detection,
    and TextBlob sentiment analysis.
    """
    
    # 1. Setup metadata
    company_name = str(company or "Unknown").strip()
    sector = _detect_sector(company_name)
    search_terms = _get_search_terms(company_name)
    
    # 2. Define RSS Pools
    company_news_urls = []
    for term in search_terms:
        company_news_urls.append(f"https://news.google.com/rss/search?q={quote_plus(term)}+share&hl=en-IN&gl=IN&ceid=IN:en")
        company_news_urls.append(f"https://news.google.com/rss/search?q={quote_plus(term)}+stock&hl=en-IN&gl=IN&ceid=IN:en")
    company_news_urls += [
        "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
        "https://www.moneycontrol.com/rss/business.xml",
        "https://www.business-standard.com/rss/markets-106.rss"
    ]
    
    sector_news_urls = [
        f"https://news.google.com/rss/search?q={quote_plus(sector)}+stocks+India&hl=en-IN&gl=IN&ceid=IN:en",
        "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
        "https://www.business-standard.com/rss/markets-106.rss"
    ]
    
    global_news_urls = [
        f"https://news.google.com/rss/search?q={quote_plus(company_name)}+market+outlook&hl=en-IN&gl=IN&ceid=IN:en",
        "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
        "https://economictimes.indiatimes.com/news/international/world-news/rssfeeds/85536586.cms"
    ]
    
    # 3. Fetch Headlines
    try:
        # Filter company headlines to ensure relevance
        def company_matcher(t):
            t_low = t.lower()
            return any(s.lower().split()[0] in t_low for s in search_terms)
            
        c_headlines = _fetch_headlines_from_rss(company_news_urls, 3, company_matcher)
        s_headlines = _fetch_headlines_from_rss(sector_news_urls, 2)
        g_headlines = _fetch_headlines_from_rss(global_news_urls, 2)
        
        combined = c_headlines + s_headlines + g_headlines
        
        # 4. Sentiment Scoring
        score = 0.0
        if combined and TEXTBLOB_AVAILABLE:
            blob = TextBlob(" ".join(combined))
            score = round(float(blob.sentiment.polarity), 2)
            
        label = "neutral"
        if score > 0.1:
            label = "positive"
        elif score < -0.1:
            label = "negative"
            
        signal = label if label != "neutral" else None
        
        # 5. Build Response
        is_fallback = len(combined) == 0
        
        return {
            "score": score,
            "sentiment_label": label,
            "signal": signal,
            "headlines": combined,
            "company_headlines": c_headlines,
            "sector_headlines": s_headlines,
            "global_headlines": g_headlines,
            "deal_type": "news_sentiment",
            "is_fallback": is_fallback,
            "source_status": "live" if not is_fallback else "fallback",
            "company": company_name,
            "sector": sector,
            "country": "India",
            "time_window": "24h"
        }
        
    except Exception as exc:
        # 10. Never crash
        print(f"News logic critical failure: {exc}")
        return {
            "score": 0.0,
            "sentiment_label": "neutral",
            "signal": None,
            "headlines": [],
            "company_headlines": [],
            "sector_headlines": [],
            "global_headlines": [],
            "deal_type": "news_sentiment",
            "is_fallback": True,
            "source_status": "fallback",
            "company": company_name,
            "sector": sector,
            "country": "India",
            "time_window": "24h"
        }

if __name__ == "__main__":
    import json
    import sys
    test_company = sys.argv[1] if len(sys.argv) > 1 else "TCS"
    print(json.dumps(fetch_news_sentiment(test_company), indent=2))