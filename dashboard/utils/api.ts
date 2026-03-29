import { Signal } from "../data/mockSignals";
import { SectorData, mockMarket } from "../data/mockMarket";
import { Alert, mockAlerts } from "../data/mockAlerts";
import { mockAnalytics } from "../data/mockAnalytics";

export const USE_API = true;
const BASE_URL = "http://localhost:8000";

function transformStock(stock: any, defaultSymbol?: string): Signal | null {
  const confidence = stock.confidence || 0;
  if (!stock.symbol && !defaultSymbol) return null;

  // Use priceChangePercent from the stock if available, or compute from signals
  let priceChangePercent = 0;
  if (stock.priceChangePercent !== undefined) {
    priceChangePercent = Number(stock.priceChangePercent);
  } else if (stock.change_pct !== undefined) {
    priceChangePercent = Number(stock.change_pct);
  } else {
    // If no direct percentage, attempt to find a price_movement signal
    const signals = stock.signals || [];
    const pm = signals.find((s: any) => s.type === "price_movement");
    if (pm) {
      priceChangePercent = pm.direction === "positive" ? (pm.score || 0) * 2 : -(pm.score || 0) * 2;
    }
  }

  // Fallback for visual data
  if (priceChangePercent === 0) {
    priceChangePercent = (confidence > 80 ? 2.5 : confidence > 50 ? 0.8 : -0.5);
  }

  return {
    symbol: stock.symbol || defaultSymbol || "UNKNOWN",
    company: stock.company || stock.name || "Unknown Entity",
    price: Number(stock.price || stock.current_price || 0),
    priceChangePercent: priceChangePercent,
    score: confidence / 10,
    confidence: (confidence > 80) ? "HIGH" : (confidence > 60) ? "MEDIUM" : "LOW",
    sector: stock.sector || "General",
    horizon: stock.actionability?.time_horizon || "1-2 Weeks",
    why_now: stock.why_now || "Signal detection in progress.",
    news: stock.news_headlines || [],
    explanation: stock.explanation || stock.why_now || "No detailed explanation available.",
    signals: stock.signals || [],
    technical_patterns: stock.technical_patterns || [],
    similar_events: stock.similar_events || []
  };
}

// ===================== API FUNCTIONS =====================

export async function getDashboardData(): Promise<Signal[]> {
  try {
    const res = await fetch(`${BASE_URL}/opportunities`);
    if (!res.ok) throw new Error("Synchronization with Alpha Node failed.");

    const response = await res.json();
    const rawStocks = response?.opportunities || [];
    
    return rawStocks
      .map((stock: any) => transformStock(stock))
      .filter((s: any): s is Signal => s !== null);
  } catch (err) {
    console.error("Dashboard engine failed:", err);
    throw new Error("Failed to load dashboard intelligence.");
  }
}

export async function getSignals(): Promise<Signal[]> {
  try {
    const res = await fetch(`${BASE_URL}/market/signals`);
    if (!res.ok) throw new Error("Signal synchronization stream failed.");

    const response = await res.json();
    const rawStocks = response?.stocks || [];
    
    return rawStocks
      .map((stock: any) => transformStock(stock))
      .filter((s: any): s is Signal => s !== null);
  } catch (err) {
    console.error("Signal Radar engine failed:", err);
    throw new Error("Failed to synchronize Sentinel stream.");
  }
}

export async function getStock(symbol: string): Promise<Signal | null> {
  try {
    const res = await fetch(`${BASE_URL}/stock/${symbol}`);
    if (!res.ok) return null;

    const json = await res.json();
    return mapBackendToSignal(json);
  } catch (err) {
    console.error("Stock fetch error:", err);
    return null;
  }
}

export async function getWatchlist(user_id: number = 1): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/wishlist?user_id=${user_id}`);
    if (!res.ok) throw new Error("Watchlist target link failed.");
    const response = await res.json();
    return response?.data?.symbols || [];
  } catch (err) {
    console.error("Watchlist error:", err);
    return [];
  }
}

export async function addTicker(symbol: string, user_id: number = 1): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/wishlist/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ symbol, user_id })
    });

    if (!res.ok) throw new Error("Add failed");
  } catch (err) {
    console.error("Add ticker error:", err);
    throw err;
  }
}

export async function removeTicker(symbol: string, user_id: number = 1): Promise<void> {
  try {
    const res = await fetch(
      `${BASE_URL}/wishlist/remove?user_id=${user_id}&symbol=${symbol}`,
      { method: "DELETE" }
    );

    if (!res.ok) throw new Error("Remove failed");
  } catch (err) {
    console.error("Remove ticker error:", err);
    throw err;
  }
}

export async function getMarket(): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}/market/overview`);
    if (!res.ok) return mockMarket;
    return await res.json();
  } catch (err) {
    console.error("Market overview failed:", err);
    return mockMarket;
  }
}

export async function getAnalytics(): Promise<any> {
    try {
        const res = await fetch(`${BASE_URL}/market/analytics`);
        if (!res.ok) return mockAnalytics;
        return await res.json();
    } catch (err) {
        console.error("Analytics fetch failed:", err);
        return mockAnalytics;
    }
}

export async function getAlerts(): Promise<Alert[]> {
  return mockAlerts;
}

// ===================== PIPELINE =====================

export async function runPipeline(): Promise<{ status: string }> {
  try {
    const res = await fetch(`${BASE_URL}/pipeline/run`, {
      method: "POST"
    });

    if (!res.ok) throw new Error("Pipeline failed");
    return await res.json();
  } catch (err) {
    console.error("Pipeline error:", err);
    throw err;
  }
}