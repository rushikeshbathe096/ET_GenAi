import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from metaflow import FlowSpec, step
from datetime import datetime
import os
import json

# Import your source functions
from agents.sources.bse import fetch_bulk_deals
from agents.sources.sebi import fetch_insider_trades
from agents.sources.nse import fetch_nse_announcements
from agents.sources.circulars import fetch_circulars
from agents.sources.news import fetch_news_sentiment
from agents.sources.parser import merge_all_sources


class OpportunityRadarDataFlow(FlowSpec):

    @step
    def start(self):
        print("[start] Starting pipeline...")
        self.next(self.fetch_bse)

    @step
    def fetch_bse(self):
        print("[fetch_bse] Fetching BSE bulk deals...")
        try:
            self.bse_data = fetch_bulk_deals()
        except Exception as e:
            print(f"BSE failed: {e}")
            self.bse_data = []
        self.next(self.fetch_sebi)

    @step
    def fetch_sebi(self):
        print("[fetch_sebi] Fetching SEBI insider trades...")
        try:
            self.sebi_data = fetch_insider_trades()
        except Exception as e:
            print(f"SEBI failed: {e}")
            self.sebi_data = []
        self.next(self.fetch_nse)

    @step
    def fetch_nse(self):
        print("[fetch_nse] Fetching NSE announcements...")
        try:
            self.nse_data = fetch_nse_announcements()
        except Exception as e:
            print(f"NSE failed: {e}")
            self.nse_data = []
        self.next(self.fetch_news)

    @step
    def fetch_news(self):
        print("[fetch_news] Fetching news sentiment...")

        self.news_data = {}

        try:
            companies = set()

            # Collect companies from BSE data
            for item in self.bse_data:
                company = item.get("company")
                if company:
                    companies.add(company)

            # Fetch sentiment for each company
            for company in companies:
                try:
                    self.news_data[company] = fetch_news_sentiment(company)
                except Exception as e:
                    print(f"News failed for {company}: {e}")
                    self.news_data[company] = {
                        "score": 0.0,
                        "signal": None,
                        "headlines": [],
                        "deal_type": "news_sentiment"
                    }

        except Exception as e:
            print(f"News step failed: {e}")
            self.news_data = {}

        self.next(self.parse_and_save)

    @step
    def parse_and_save(self):
        print("[parse_and_save] Merging and saving data...")

        try:
            merged = merge_all_sources(
                self.bse_data,
                self.sebi_data,
                self.nse_data,
                fetch_circulars(),  # direct call
                self.news_data
            )

            # Create directory if not exists
            os.makedirs("data/parsed", exist_ok=True)

            filename = f"data/parsed/{datetime.now().strftime('%Y-%m-%d')}.json"

            with open(filename, "w") as f:
                json.dump(merged, f, indent=2)

            self.result = merged
            self.output_file = filename

        except Exception as e:
            print(f"Parse/save failed: {e}")
            self.result = []
            self.output_file = None

        self.next(self.end)

    @step
    def end(self):
        count = len(self.result) if self.result else 0
        print(f"[end] Done. {count} companies parsed.")
        if self.output_file:
            print(f"Output saved to: {self.output_file}")


if __name__ == "__main__":
    OpportunityRadarDataFlow()