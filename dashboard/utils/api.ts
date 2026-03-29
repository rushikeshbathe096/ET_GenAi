import { Signal } from "../data/mockSignals";
import { SectorData } from "../data/mockMarket";
import { Alert } from "../data/mockAlerts";
import { mockSignals } from "../data/mockSignals";
import { mockMarket } from "../data/mockMarket";
import { mockAnalytics } from "../data/mockAnalytics";
import { mockAlerts } from "../data/mockAlerts";

// Toggle for backend integration
export const USE_API = true;
const BASE_URL = "http://127.0.0.1:8000";

// Simulation delay for loading states (only used for mock)
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 800));

/**
 * Mapper: Backend Ticker Analysis -> Frontend Signal
 */
function mapBackendToSignal(item: any): Signal {
  const confidenceVal = Number(item.confidence || 0);
  let confidenceLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (confidenceVal >= 70) confidenceLevel = "HIGH";
  else if (confidenceVal >= 40) confidenceLevel = "MEDIUM";

  return {
    symbol: item.symbol || "UNKNOWN",
    company: item.company || item.symbol || "Unknown Entity",
    price: Number(item.price || item.current_price || 0),
    priceChangePercent: Number(item.change_pct || 0),
    score: confidenceVal / 10, // Normalized to 0-10
    confidence: confidenceLevel,
    sector: item.sector || "General",
    horizon: item.actionability?.time_horizon || "Short-term",
    why_now: item.why_now || "No specific catalyst provided.",
    explanation: item.why_now || "No detailed explanation available.",
    news: Array.isArray(item.news_headlines) ? item.news_headlines : [],
    signals: item.signals || [],
    technical_patterns: item.technical_patterns || [],
    similar_events: item.similar_events || []
  };
}

export async function getDashboardData(): Promise<Signal[]> {
  if (USE_API) {
    try {
      const res = await fetch(`${BASE_URL}/dashboard?user_id=1`);
      const json = await res.json();
      if (json.status === "success" && json.data?.stocks) {
        return json.data.stocks.map(mapBackendToSignal);
      }
      return [];
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      throw err;
    }
  }
  await simulateDelay();
  return mockSignals;
}

export async function getSignals(): Promise<Signal[]> {
  if (USE_API) {
    try {
      const res = await fetch(`${BASE_URL}/market/signals`);
      const json = await res.json();
      if (json.stocks) {
        return json.stocks.map(mapBackendToSignal);
      }
      return [];
    } catch (err) {
      console.error("Market Signals Fetch Error:", err);
      throw err;
    }
  }
  await simulateDelay();
  return mockSignals;
}

export async function getStock(symbol: string): Promise<Signal | null> {
  if (USE_API) {
    try {
      const res = await fetch(`${BASE_URL}/stock/${symbol}`);
      const json = await res.json();
      if (json.symbol) {
        return mapBackendToSignal(json);
      }
      return null;
    } catch (err) {
      console.error("Stock Detail Fetch Error:", err);
      throw err;
    }
  }
  await simulateDelay();
  return mockSignals.find(s => s.symbol === symbol) || null;
}

export async function getWatchlist(): Promise<string[]> {
  if (USE_API) {
    try {
      const res = await fetch(`${BASE_URL}/wishlist?user_id=1`);
      const json = await res.json();
      if (json.status === "success" && json.data?.symbols) {
        return json.data.symbols;
      }
      return [];
    } catch (err) {
      console.error("Watchlist Fetch Error:", err);
      throw err;
    }
  }
  await simulateDelay();
  const saved = localStorage.getItem("radar-watchlist");
  return saved ? JSON.parse(saved) : [];
}

export async function addTicker(symbol: string): Promise<void> {
  if (USE_API) {
    await fetch(`${BASE_URL}/wishlist/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: 1, symbol })
    });
    return;
  }
  await simulateDelay();
  const current = await getWatchlist();
  if (!current.includes(symbol)) {
    localStorage.setItem("radar-watchlist", JSON.stringify([...current, symbol]));
  }
}

export async function removeTicker(symbol: string): Promise<void> {
  if (USE_API) {
    await fetch(`${BASE_URL}/wishlist/remove?user_id=1&symbol=${symbol}`, { 
      method: "DELETE" 
    });
    return;
  }
  await simulateDelay();
  const current = await getWatchlist();
  localStorage.setItem("radar-watchlist", JSON.stringify(current.filter(s => s !== symbol)));
}

export async function getMarket(): Promise<any> {
  if (USE_API) {
    try {
      const res = await fetch(`${BASE_URL}/market/overview`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("Market Overview Fetch Error:", err);
      throw err;
    }
  }
  await simulateDelay();
  return { 
    sectors: mockMarket, 
    volatility: "Low", 
    participation: "Strong", 
    volume_depth: "1.2x 20-Day Avg" 
  };
}

export async function getAnalytics(): Promise<any> {
  if (USE_API) {
    try {
      const res = await fetch(`${BASE_URL}/market/analytics`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("Analytics Fetch Error:", err);
      throw err;
    }
  }
  await simulateDelay();
  return mockAnalytics;
}

export async function getAlerts(): Promise<Alert[]> {
  if (USE_API) {
    return mockAlerts;
  }
  await simulateDelay();
  return mockAlerts;
}

export async function runPipeline(): Promise<{ status: string }> {
  if (USE_API) {
    const res = await fetch(`${BASE_URL}/pipeline/run`, { method: "POST" });
    return res.json();
  }
  await simulateDelay();
  return { status: "success" };
}
