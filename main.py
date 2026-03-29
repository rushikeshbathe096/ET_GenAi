# Repository architecture migration in progress.
# All FastAPI logic has been consolidated to the api/main.py module.
# Please execute the intelligence platform via:
# uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

import uvicorn
from api.main import app

if __name__ == "__main__":
    print("ET_GenAi: Starting platform hub via api/main gateway...")
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
