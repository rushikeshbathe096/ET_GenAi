from fastapi import FastAPI
from routers.data_router import router as data_router

app = FastAPI()

@app.get("/")
def root():
    return {"message": "ET GenAI Data API is running"}

# include your router
app.include_router(data_router)