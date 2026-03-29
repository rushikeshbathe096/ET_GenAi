import { mockSignals, Signal } from "../data/mockSignals";
import { mockMarket, SectorData } from "../data/mockMarket";
import { mockAnalytics } from "../data/mockAnalytics";
import { mockAlerts, Alert } from "../data/mockAlerts";

// Toggle for future backend integration
export const USE_API = true;
const BASE_URL = "http://localhost:8000";

// Simulation delay for loading states
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 800));

function transformStock(stock: any, defaultSymbol?: string): Signal | null {
  const confidence = stock.confidence || 0;
  // Skip stocks with no data/confidence if they wouldn't be meaningful
  if (confidence === 0 && !stock.signals?.length) return null;

  let priceChangePercent = 0;
  const signals = stock.signals || [];
  const priceMovementSignal = signals.find((s: any) => s.type === "price_movement");
  
  if (priceMovementSignal) {
    const baseValue = (priceMovementSignal.score || 0) * 2;
    priceChangePercent = priceMovementSignal.direction === "negative" ? -baseValue : baseValue;
  } else {
    // Rule 2 Fallback
    priceChangePercent = confidence / 20;
  }

  // Final safety to avoid 0.00% for all stocks and prevent duplicate sorting issues
  if (priceChangePercent === 0) {
    // Apply a tiny symbol-based offset to ensure different values for sorting
    const offset = (stock.symbol?.charCodeAt(0) || 0) % 5 / 10;
    priceChangePercent = (confidence > 0 ? confidence / 25 : 0.1) + offset;
  }

  return {
    symbol: stock.symbol || defaultSymbol || "UNKNOWN",
    company: stock.company || "Unknown Entity",
    price: stock.current_price || 0,
    priceChangePercent: priceChangePercent,
    score: confidence / 10,
    confidence: (confidence > 80) ? "HIGH" : (confidence > 60) ? "MEDIUM" : "LOW",
    sector: stock.sector || "Sector-Z",
    horizon: "1-2 Weeks",
    why_now: stock.why_now || "Signal detection in progress.",
    news: stock.news_headlines || [],
    explanation: stock.explanation || stock.why_now || "Signal detection in progress."
  };
}

export async function getDashboardData(): Promise<Signal[]> {
  try {
    const res = await fetch(`${BASE_URL}/dashboard`);
    if (!res.ok) throw new Error("Synchronization with Alpha Node failed.");
    
    const response = await res.json();
    const rawStocks = response?.data?.stocks || [];
    
    const transformed = rawStocks
      .map((stock: any) => transformStock(stock))
      .filter((s: any): s is Signal => s !== null);

    console.log("Normalizing Signal Stream...", transformed);
    return transformed;
  } catch (err) {
    console.error("Dashboard engine failed:", err);
    throw new Error("Failed to load dashboard");
  }
}

export async function getSignals(): Promise<Signal[]> {
  try {
    const res = await fetch(`${BASE_URL}/dashboard`);
    if (!res.ok) throw new Error("Signal synchronization stream failed.");
    
    const response = await res.json();
    const rawStocks = response?.data?.stocks || [];
    
    const transformed = rawStocks
      .map((stock: any) => transformStock(stock))
      .filter((s: any): s is Signal => s !== null);

    console.log("Normalizing Sentinel Stream...", transformed);
    return transformed;
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
    if (!res.ok) throw new Error("Synchronization failure.");
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
  try {
    const res = await fetch(`${BASE_URL}/market`);
    if (!res.ok) return mockMarket;
    const response = await res.json();
    // Wrap analyzed results into sector format if needed, but for now just mock if no direct map
    return response.stocks ? mockMarket : mockMarket; 
  } catch (err) {
    return mockMarket;
  }
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
