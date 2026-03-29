import os
import json
from datetime import datetime
from fastapi import APIRouter, Query
from agents.analysis_agent import compute_signals
from agents.utils.data_loader import load_latest_data
from agents.decision_agent import enrich_signal
from agents.explanation_agent import enrich_explanations

router = APIRouter()


def _confidence_label(confluence_score) -> str:
    try:
        score = float(confluence_score)
    except (TypeError, ValueError):
        score = 0.0

    if score <= 3:
        return "Low"
    if score < 7:
        return "Moderate"
    return "Strong"


def _build_clean_opportunity(signal: dict, rank: int) -> dict:
    reasoning = signal.get("reasoning_card", [])
    if isinstance(reasoning, list) and reasoning:
        explanation = " ".join(str(line) for line in reasoning if line)
    else:
        explanation = "Analysis complete; key signals are being monitored."

    actionability = str(signal.get("actionability", "Monitoring setup"))
    
    # Extract price and change from events
    price = 0.0
    price_change = 0.0
    for event in signal.get("events", []):
        if event.get("deal_type") == "price_movement":
            price = float(event.get("price", 0.0))
            price_change = float(event.get("change_pct", 0.0))
            break
            
    # Map confidence label to frontend format
    conf_raw = _confidence_label(signal.get("confluence_score", 0.0))
    conf_map = {
        "Low": "LOW",
        "Moderate": "MEDIUM",
        "Strong": "HIGH"
    }
    confidence = conf_map.get(conf_raw, "MEDIUM")

    return {
        "symbol": str(signal.get("ticker", "")),
        "company": str(signal.get("company", "")),
        "rank": rank,
        "score": float(signal.get("confluence_score", 0.0)),
        "confidence": confidence,
        "decision": actionability,
        "explanation": explanation,
        "why_now": str(signal.get("why_now", "No recent catalyst summary available.")),
        "actionability": actionability,
        "price": price,
        "priceChangePercent": price_change,
        "sector": "General", # Fallback for now
        "horizon": "1-2 Weeks", # Fallback for now
        "news": signal.get("news", {}).get("headlines", []) if isinstance(signal.get("news"), dict) else []
    }

@router.get("/opportunities")
def get_opportunities(force: bool = Query(default=False)):
    cache_dir = "data/signals"
    cache_path = os.path.join(cache_dir, "today.json")
    today_str = datetime.now().strftime("%Y-%m-%d")

    # 1. Attempt to serve from today's cache if not forced
    if not force and os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cached_data = json.load(f)
                
            # Verify cache is actually from today
            if cached_data.get("generated_date") == today_str:
                return cached_data
        except Exception as ce:
            print(f"Cache Read Failure: {ce}")

    # 2. Re-run pipeline if cache is missing, stale, or bypass is forced
    data = load_latest_data()
    if not data:
        return {
            "status": "success",
            "count": 0,
            "generated_at": datetime.now().isoformat(),
            "generated_date": today_str,
            "opportunities": []
        }

    signals = compute_signals(data)
    
    # Process top 5 signals to ensure fast execution
    top_signals = signals[:5]
    
    enriched_signals = []
    for idx, sig in enumerate(top_signals):
        try:
            enriched = enrich_signal(sig)
            enriched_row = dict(enriched)
        except Exception as e:
            print(f"Decision agent failed for {sig.get('ticker')}: {e}")
            enriched_row = dict(sig)

        enriched_row["rank"] = idx + 1
        enriched_row["confidence_label"] = _confidence_label(enriched_row.get("confluence_score", 0.0))
        enriched_signals.append(enriched_row)

    explained_signals = []
    for row in enriched_signals:
        try:
            # Note: explanation agent takes list form
            explained_row = enrich_explanations([row])[0]
            explained_signals.append(dict(explained_row))
        except Exception as e:
            print(f"Explanation agent failed for {row.get('ticker')}: {e}")
            explained_signals.append(dict(row))

    clean_opportunities = [
        _build_clean_opportunity(row, rank=idx + 1)
        for idx, row in enumerate(explained_signals)
    ]

    top_clean = clean_opportunities[0] if clean_opportunities else {}
    
    response = {
        "status": "success",
        "count": len(signals),
        "generated_at": datetime.now().isoformat(),
        "generated_date": today_str,
        "top_opportunity": top_clean,
        "decision": top_clean.get("decision", "No data available"),
        "explanation": top_clean.get("explanation", "No data available for analysis."),
        "opportunities": clean_opportunities
    }

    # 3. Persist the fresh analysis to cache
    try:
        os.makedirs(cache_dir, exist_ok=True)
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(response, f, indent=2)
            
        # Also archive by date for historical persistence
        archive_path = os.path.join(cache_dir, f"{today_str}.json")
        with open(archive_path, "w", encoding="utf-8") as f:
            json.dump(response, f, indent=2)
    except Exception as se:
        print(f"Cache Write Failure: {se}")

    return response