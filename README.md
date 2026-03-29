# 🚀 ET_GenAi: Autonomous Alpha Generation Engine

**ET_GenAi** is an AI-powered stock intelligence platform designed specifically for the Indian equity markets (NSE/BSE). It leverages a multi-agentic pipeline to transform raw market data, corporate filings, and news sentiment into high-probability trading signals with automated confidence scoring.

---

## 🏛️ Platform Architecture

The platform is divided into three primary layers:

### 1. The Alpha Node (Backend)
Built on **FastAPI**, the Alpha Node acts as the central intelligence hub. It orchestrates the signal processing pipeline, manages the **SQLite/MySQL** persistent store, and provides a high-performance REST API for real-time data delivery.

### 2. The Sentinel Dashboard (Frontend)
A mission-control interface built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**. It features high-fidelity visualizations, skeleton-based loading states, and autonomous deep-inspection modals for granular stock analysis.

### 3. The Intelligence Pipeline (M1—M3)
*   **M1 (Ingestion)**: Asynchronous fetching from NSE/BSE APIs and news financial streams.
*   **M2 (Confluence)**: Technical pattern detection and sentient news analysis using **Groq/Anthropic**.
*   **M3 (Orchestration)**: Final decision generation (BUY/SELL/HOLD) with confidence ranging from 0-100%.

---

## 🛠️ Step-by-Step Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Groq API Key** (Required for the Intelligence Pipeline)

### Phase 1: Alpha Node (Backend) Setup

1. **Navigate to the root directory**:
   ```bash
   cd ET_GenAi
   ```

2. **Initialize a Virtual Environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=sqlite:///./et_genai.db  # Or your MySQL connection string
   GROQ_API_KEY=your_groq_api_key_here
   SECRET_KEY=your_jwt_secret_key
   ```

5. **Start the API Server**:
   ```bash
   uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Phase 2: Sentinel Dashboard (Frontend) Setup

1. **Navigate to the dashboard directory**:
   ```bash
   cd dashboard
   ```

2. **Install Packages**:
   ```bash
   npm install
   ```

3. **Configure Frontend Environment**:
   Create a `.env.local` inside the `dashboard` folder:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Launch the Dashboard**:
   ```bash
   npm run dev
   ```

---

## 📡 Running the Intelligence Pipeline

The pipeline is designed to run once per day to pre-compute market opportunities.

- **Automated**: The system automatically caches the first successful run in `data/signals/today.json`.
- **Manual Trigger**: You can force a fresh market scan by clicking **"Force Signal Refresh"** on the dashboard or by hitting the endpoint:
  ```bash
  POST http://localhost:8000/pipeline/run
  ```



