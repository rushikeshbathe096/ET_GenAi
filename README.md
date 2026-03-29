# AI-Powered Stock Investment System

> **Automated stock signal detection and decision support for the Indian equity markets.**

---

## 📖 Overview

This project is an automated system designed to identify trading opportunities in the Indian equity markets (NSE/BSE). By integrating multiple data sources—including live prices, corporate filings, and news feeds—it generates stock signals with clear entry rationales, confidence scores, and risk assessments.

The system aims to provide developers and investors with a structured way to analyze market data using AI-driven agents.

---

## ✨ Features

*   **Market Scanner**: Automatically scans daily price movements and bulk deals across NSE and BSE.
*   **Signal Confluence Engine**: Combines technical indicators with real-time news sentiment to validate market setups.
*   **Explainable Decisions**: Provides a "Why Now" rationale and specific risk factors for every recommended action (BUY/SELL/HOLD).
*   **Historical Pattern Matching (RAG)**: Uses **FAISS** and **Sentence-Transformers** to retrieve and compare current signals against historical market events.
*   **Sentiment Analysis**: Processes 50+ financial news streams using TextBlob and Groq to detect market polarity.
*   **Web Dashboard**: A modern interface built with Next.js for monitoring signals and stock details.

---

## 🏛️ System Architecture

The system follows a structured pipeline to process data and generate insights:

1.  **Data Ingestion**: Gathers raw price data, corporate bulk deals, and financial RSS entries.
2.  **Signal Calculation**: Computes technical indicators and weighs news sentiment for each stock.
3.  **Decision Logic**: Processes the combined technical and sentiment data to determine a market stance.
4.  **Explanation Generation**: Creates human-readable summaries and lists potential risks for the identified setup.
5.  **API Distribution**: Serves pre-computed and cached signals via a high-performance **FastAPI** backend.
6.  **Web Frontend**: Displays the aggregated data through a responsive **Next.js** dashboard.

---

## 🛠️ Tech Stack

*   **Backend**: FastAPI, SQLAlchemy (Database), Pydantic (Logic).
*   **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Framer Motion.
*   **AI/ML**: Groq (LLM Inference), Sentence-Transformers (Embeddings), FAISS (Vector Retrieval).
*   **Data Ingestion**: nsepython, yfinance, bsedata
*   **News**:Google News RSS,ET News,MoneyControl,Mint,CNBC TV -18, MINT.
*   **Database**: SQLite (Local) / MySQL (Cloud-ready).

---

## 🚀 Setup Instructions

### Backend Setup
1.  **Initialize Environment**:
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    ```
2.  **Configuration**:
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL=sqlite:///./et_genai.db  # Supports MySQL via pymysql
    GROQ_API_KEY=your_key_here
    SECRET_KEY=your_auth_secret
    ```
3.  **Run Server**:
    ```bash
    uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
    ```

### Frontend Setup
1.  **Install Packages**:
    ```bash
    cd dashboard && npm install
    ```
2.  **Environment Configuration**:
    Create `dashboard/.env.local`:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```
3.  **Launch Interface**:
    ```bash
    npm run dev
    ```

---

## 📡 Usage & API Endpoints

### Running the Data Pipeline
The system is designed to run its analysis once per day.
*   **Automated**: The system serves signals from a daily JSON cache (`data/signals/today.json`).
*   **Manual Refresh**: You can trigger a full market scan by hitting the endpoint:
    `POST http://localhost:8000/pipeline/run`

### Common API Endpoints
*   `GET /opportunities`: Retrieves the latest ranked stock signals.
*   `GET /signals/today`: Accesses the daily pre-computed analysis cache.
*   `GET /wishlist`: Manages personalized stock watchlists.

---

## ⚖️ License
Internal Use Only - Proprietary Decision Support System.

