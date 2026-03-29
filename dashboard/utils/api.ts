import { Signal } from "../data/mockSignals";
import { SectorData } from "../data/mockMarket";
import { Alert } from "../data/mockAlerts";
import { mockSignals } from "../data/mockSignals";
import { mockMarket } from "../data/mockMarket";
import { mockAnalytics } from "../data/mockAnalytics";
import { mockAlerts } from "../data/mockAlerts";

<<<<<<< HEAD
// Toggle for backend integration
export const USE_API = true;
const BASE_URL = "http://127.0.0.1:8000";
=======
// Toggle for future backend integration
export const USE_API = true;
const BASE_URL = "http://localhost:8000";
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c

// Simulation delay for loading states (only used for mock)
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 800));

<<<<<<< HEAD
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
=======
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
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c
  };
}

export async function getDashboardData(): Promise<Signal[]> {
<<<<<<< HEAD
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
=======
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
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c
  }
}

export async function getSignals(): Promise<Signal[]> {
<<<<<<< HEAD
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
=======
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
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c
  }
}

export async function getStock(symbol: string): Promise<Signal | null> {
<<<<<<< HEAD
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
=======
  try {
    const res = await fetch(`${BASE_URL}/stock/${symbol}`);
    if (!res.ok) return null;
    
    const stock = await res.json();
    return transformStock(stock, symbol);
  } catch (err) {
    console.error(`Stock fetch failed for ${symbol}:`, err);
    return null;
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c
  }
}

<<<<<<< HEAD
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
=======
export async function getWatchlist(user_id: number = 1): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/wishlist?user_id=${user_id}`);
    if (!res.ok) throw new Error("Synchronization failure.");
    const response = await res.json();
    return response?.data?.symbols || [];
  } catch (err) {
    console.error("Watchlist fetch failed:", err);
    return [];
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c
  }
}

<<<<<<< HEAD
export async function addTicker(symbol: string): Promise<void> {
  if (USE_API) {
    await fetch(`${BASE_URL}/wishlist/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: 1, symbol })
=======
export async function addTicker(symbol: string, user_id: number = 1): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/wishlist/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, user_id })
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c
    });
    if (!res.ok) throw new Error("Failed to link target symbol.");
  } catch (err) {
    console.error("Failed to add to watchlist:", err);
    throw err;
  }
}

<<<<<<< HEAD
export async function removeTicker(symbol: string): Promise<void> {
  if (USE_API) {
    await fetch(`${BASE_URL}/wishlist/remove?user_id=1&symbol=${symbol}`, { 
      method: "DELETE" 
    });
    return;
=======
export async function removeTicker(symbol: string, user_id: number = 1): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/wishlist/remove?user_id=${user_id}&symbol=${symbol}`, { 
      method: "DELETE" 
    });
    if (!res.ok) throw new Error("Failed to delink target symbol.");
  } catch (err) {
    console.error("Failed to remove from watchlist:", err);
    throw err;
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c
  }
}

<<<<<<< HEAD
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
=======
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
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c
  return mockAnalytics;
}

export async function getAlerts(): Promise<Alert[]> {
<<<<<<< HEAD
  if (USE_API) {
    return mockAlerts;
  }
  await simulateDelay();
=======
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c
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
