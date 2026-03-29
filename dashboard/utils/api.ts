import { Signal } from "../data/mockSignals";
import { SectorData } from "../data/mockMarket";
import { Alert } from "../data/mockAlerts";
import { mockMarket } from "../data/mockMarket";
import { mockAnalytics } from "../data/mockAnalytics";
import { mockAlerts } from "../data/mockAlerts";

export const USE_API = true;
const BASE_URL = "http://localhost:8000";

// Simulation delay for loading states (only used for mock)
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 800));

/**
 * Mapper: Backend -> Frontend Signal
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
    score: confidenceVal / 10,
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

/**
 * Transform fallback stock
 */
function transformStock(stock: any, defaultSymbol?: string): Signal | null {
  const confidence = stock.confidence || 0;
  if (confidence === 0 && !stock.signals?.length) return null;

  let priceChangePercent = 0;
  const signals = stock.signals || [];

  const priceMovementSignal = signals.find((s: any) => s.type === "price_movement");

  if (priceMovementSignal) {
    const baseValue = (priceMovementSignal.score || 0) * 2;
    priceChangePercent =
      priceMovementSignal.direction === "negative" ? -baseValue : baseValue;
  } else {
    priceChangePercent = confidence / 20;
  }

  if (priceChangePercent === 0) {
    const offset = (stock.symbol?.charCodeAt(0) || 0) % 5 / 10;
    priceChangePercent = (confidence > 0 ? confidence / 25 : 0.1) + offset;
  }

  return {
    symbol: stock.symbol || defaultSymbol || "UNKNOWN",
    company: stock.company || "Unknown Entity",
    price: stock.current_price || 0,
    priceChangePercent,
    score: confidence / 10,
    confidence: confidence > 80 ? "HIGH" : confidence > 60 ? "MEDIUM" : "LOW",
    sector: stock.sector || "Sector-Z",
    horizon: "1-2 Weeks",
    why_now: stock.why_now || "Signal detection in progress.",
    news: stock.news_headlines || [],
    explanation: stock.explanation || stock.why_now || "Signal detection in progress.",
    signals: stock.signals || [],
    technical_patterns: stock.technical_patterns || [],
    similar_events: stock.similar_events || []
  };
}

// ===================== API FUNCTIONS =====================

export async function getDashboardData(): Promise<Signal[]> {
  try {
    if (USE_API) {
      const res = await fetch(`${BASE_URL}/dashboard?user_id=1`);
      const json = await res.json();
      if (json.status === "success" && json.data?.stocks) {
        return json.data.stocks.map(mapBackendToSignal);
      }
      return [];
    } else {
      await simulateDelay();
      return [];
    }
  } catch (err) {
    console.error("Dashboard error:", err);
    return [];
  }
}

export async function getSignals(): Promise<Signal[]> {
  try {
    if (USE_API) {
      const res = await fetch(`${BASE_URL}/market/signals`);
      const json = await res.json();
      return json.stocks ? json.stocks.map(mapBackendToSignal) : [];
    } else {
      await simulateDelay();
      return [];
    }
  } catch (err) {
    console.error("Signals error:", err);
    return [];
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

// ===================== WATCHLIST =====================

export async function getWatchlist(user_id: number = 1): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/wishlist?user_id=${user_id}`);
    const json = await res.json();
    return json?.data?.symbols || [];
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

// ===================== MARKET =====================

export async function getMarket(): Promise<SectorData[]> {
  try {
    const res = await fetch(`${BASE_URL}/market`);
    if (!res.ok) return mockMarket;

    const json = await res.json();
    return json?.stocks ? mockMarket : mockMarket;
  } catch {
    return mockMarket;
  }
}

export async function getAnalytics(): Promise<any> {
  return mockAnalytics;
}

export async function getAlerts(): Promise<Alert[]> {
  await simulateDelay();
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