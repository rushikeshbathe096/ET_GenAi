import { Signal } from "../data/mockSignals";
import { SectorData, mockMarket } from "../data/mockMarket";
import { Alert, mockAlerts } from "../data/mockAlerts";
import { mockAnalytics } from "../data/mockAnalytics";

export interface Opportunity {
  symbol: string;
  company: string;
  rank: number;
  score: number;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  decision: "BUY" | "SELL" | "HOLD" | "STRONG_BUY" | "STRONG_SELL";
  explanation: string;
  why_now: string;
  actionability: string;
  price: number;
  priceChangePercent: number;
  sector: string;
  horizon: string;
  news: string[];
}

export const USE_API = true;
const BASE_URL = "http://localhost:8000";

function transformStock(stock: any, defaultSymbol?: string): Signal | null {
  if (!stock.symbol && !defaultSymbol) return null;

  const confidence = stock.confidence || "LOW";
  
  // Normalize price change
  let priceChangePercent = 0;
  if (stock.priceChangePercent !== undefined) {
    priceChangePercent = Number(stock.priceChangePercent);
  } else if (stock.change_pct !== undefined) {
    priceChangePercent = Number(stock.change_pct);
  }

  return {
    symbol: stock.symbol || defaultSymbol || "UNKNOWN",
    company: stock.company || stock.name || "Unknown Entity",
    price: Number(stock.price || 0),
    priceChangePercent: priceChangePercent,
    score: Number(stock.score || 0),
    confidence: (confidence.toString().toUpperCase() === "HIGH" ? "HIGH" : 
                 confidence.toString().toUpperCase() === "MEDIUM" ? "MEDIUM" : "LOW"),
    sector: stock.sector || "General",
    horizon: stock.horizon || "Short Term",
    why_now: stock.why_now || "Signal detection in progress.",
    news: Array.isArray(stock.news) ? stock.news : [],
    explanation: stock.explanation || stock.why_now || "No detailed explanation available.",
    signals: stock.signals || [],
    technical_patterns: stock.technical_patterns || [],
    similar_events: stock.similar_events || [],
    rank: stock.rank
  };
}

export interface DashboardResponse {
  signals: Signal[];
  generatedAt: string | null;
}

export async function getDashboardData(force: boolean = false): Promise<DashboardResponse> {
  try {
    const res = await fetch(`${BASE_URL}/opportunities${force ? "?force=true" : ""}`);
    if (!res.ok) throw new Error("Synchronization with Alpha Node failed.");
    
    const response = await res.json();
    const rawStocks = response?.opportunities || [];
    const generatedAt = response?.generated_at || null;
    
    const signals = rawStocks
      .map((stock: any) => transformStock(stock))
      .filter((s: any): s is Signal => s !== null);

    return { signals, generatedAt };
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
    
    const stock = await res.json();
    return transformStock(stock, symbol);
  } catch (err) {
    console.error(`Stock fetch failed for ${symbol}:`, err);
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
    console.error("Watchlist fetch failed:", err);
    return [];
  }
}

export async function addTicker(symbol: string, user_id: number = 1): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/wishlist/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, user_id })
    });
    if (!res.ok) throw new Error("Failed to link target symbol.");
  } catch (err) {
    console.error("Failed to add to watchlist:", err);
    throw err;
  }
}

export async function removeTicker(symbol: string, user_id: number = 1): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/wishlist/remove?user_id=${user_id}&symbol=${symbol}`, { 
      method: "DELETE" 
    });
    if (!res.ok) throw new Error("Failed to delink target symbol.");
  } catch (err) {
    console.error("Failed to remove from watchlist:", err);
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

export async function runPipeline(): Promise<{ status: string }> {
  try {
    const res = await fetch(`${BASE_URL}/pipeline/run`, { method: "POST" });
    if (!res.ok) throw new Error("Pipeline trigger failed on Alpha Node.");
    return await res.json();
  } catch (err) {
    console.error("Pipeline engine failed:", err);
    throw new Error("Critical connection error to Alpha Pipeline.");
  }
}