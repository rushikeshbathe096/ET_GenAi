import json
from pipeline.run_pipeline import run_pipeline
from database.db import SessionLocal
from database.models import Opportunity

if __name__ == "__main__":
    result = run_pipeline()

    db = SessionLocal()

    for opp in result["opportunities"]:
        db.add(Opportunity(
            symbol=opp["symbol"],
            company=opp["company"],
            decision=opp["decision"],
            confidence=opp["confidence"],
            date=result["date"]
        ))

    db.commit()
    db.close()

    print("Saved to DB!")
    print(json.dumps(result, indent=2, ensure_ascii=False))