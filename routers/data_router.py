from fastapi import APIRouter
import os
import glob
import json

router = APIRouter(prefix="/data")


def get_latest_file():
    try:
        files = glob.glob("data/parsed/*.json")
        if not files:
            return None
        files.sort()
        return files[-1]
    except Exception:
        return None


@router.get("/parsed")
def get_parsed_data():
    try:
        latest_file = get_latest_file()

        if not latest_file:
            return {"error": "No data available"}

        with open(latest_file, "r") as f:
            data = json.load(f)

        return data

    except Exception:
        return {"error": "Failed to read parsed data"}


@router.get("/news/{ticker}")
def get_news_by_ticker(ticker: str):
    try:
        latest_file = get_latest_file()

        if not latest_file:
            return {"error": "No data available"}

        with open(latest_file, "r") as f:
            data = json.load(f)

        ticker = ticker.lower()

        for item in data:
            if item.get("ticker", "").lower() == ticker:
                return item.get("news", {})

        return {"error": "Ticker not found"}

    except Exception:
        return {"error": "Failed to fetch news"}