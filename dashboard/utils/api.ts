import { Signal } from "../data/mockSignals";
import { SectorData, mockMarket } from "../data/mockMarket";
import { Alert, mockAlerts } from "../data/mockAlerts";
import { mockAnalytics } from "../data/mockAnalytics";

export const USE_API = true;
const BASE_URL = "http://localhost:8000";

const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 800));

function transformStock(stock: any, defaultSymbol?: string): Signal | null {
  const confidence = stock.confidence || 0;
  if (!stock.symbol && !defaultSymbol) return null;

  let priceChangePercent = 0;
  const signals = stock.signals || [];
  const priceMovementSignal = signals.find((s: any) => s.type === "price_movement");
  
  if (priceMovementSignal) {
    const baseValue = (priceMovementSignal.score || 0) * 2;
    priceChangePercent = priceMovementSignal.direction === "negative" ? -baseValue : baseValue;
  } else if (stock.change_pct !== undefined) {
    priceChangePercent = Number(stock.change_pct);
  } else {
    priceChangePercent = confidence / 20;
  }

  if (priceChangePercent === 0) {
    const offset = (stock.symbol?.charCodeAt(0) || 0) % 5 / 10;
    priceChangePercent = (confidence > 0 ? confidence / 25 : 0.1) + offset;
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

export async function getDashboardData(): Promise<Signal[]> {
  try {
    const res = await fetch(`${BASE_URL}/dashboard?user_id=1`);
    if (!res.ok) throw new Error("Synchronization with Alpha Node failed.");
    
    const response = await res.json();
    const rawStocks = response?.data?.stocks || [];
    
    return rawStocks
      .map((stock: any) => transformStock(stock))
      .filter((s: any): s is Signal => s !== null);
  } catch (err) {
    console.error("Dashboard engine failed:", err);
    throw new Error("Failed to load dashboard intelligence.");
  }
}

export async function getSignals(): Promise<Signal[]> {
  // Use dashboard as proxy for all signals for now, or use specific market/signals if it exists
  try {
    const res = await fetch(`${BASE_URL}/dashboard?user_id=1`);
    if (!res.ok) throw new Error("Signal synchronization stream failed.");
    
    const response = await res.json();
    const rawStocks = response?.data?.stocks || [];
    
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

export async function getMarket(): Promise<SectorData[]> {
  // For now return mock or try to transform from dashboard if available
  return mockMarket;
}

export async function getAnalytics(): Promise<any> {
  return mockAnalytics;
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
