export interface NewsItem {
  title: string;
  sentimentScore: number;
  timestamp: string;
}

export interface NewsObject {
  score: number;
  sentiment_label: string;
  company_headlines: string[];
  sector_headlines: string[];
  global_headlines: string[];
}

export interface ChartEvent {
  date: string;
  type: 'sentiment' | 'news' | 'risk' | 'volume';
  label: string;
  description: string;
}

export interface Signal {
  symbol: string;
  company: string;
  price: number;
  priceChangePercent: number;
  score: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  sector: string;
  horizon: string;
  why_now: string;
  news: NewsObject;
  risks: string[];
  explanation: string;
  signals: any[];
  technical_patterns: any[];
  similar_events: any[];
  rank?: number;
  decision?: string;
  sentiment?: string;
  insights?: {
    sentiment: string;
    volume: string;
    momentum: string;
  };
  risk_meta?: {
    volatility: string;
    conflictingSignals: string;
    uncertainty: string;
  };
  historicalPattern?: {
    description: string;
    successRate: number;
  };
  recentShift?: {
    sentiment: { from: string; to: string };
    volume: string;
    risk: { from: string; to: string };
  };
  chartEvents?: ChartEvent[];
  actionability?: {
    confidence_pct: string;
    risk_level: string;
    time_horizon: string;
    color: string;
  };
}

export interface Alert {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
}

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
  priceChangePercent: number;
  sector: string;
  horizon: string;
  news: NewsItem[];
}

export const USE_API = true;
const BASE_URL = "http://localhost:8000";

function transformStock(stock: any, defaultSymbol?: string): Signal | null {
  if (!stock.symbol && !defaultSymbol) return null;

  const decisionToSentiment = (decision: string): string => {
    const d = decision.toString().toUpperCase();
    if (d === "BUY" || d === "STRONG_BUY") return "BULLISH";
    if (d === "SELL" || d === "STRONG_SELL") return "BEARISH";
    return "SIDEWAYS";
  };

  let confidence = "LOW";
  if (typeof stock.confidence === "string") {
    const uc = stock.confidence.toUpperCase();
    if (["HIGH", "MEDIUM", "LOW"].includes(uc)) confidence = uc;
  } else {
    const rawConf = Number(stock.confidence || 0);
    confidence = rawConf >= 70 ? "HIGH" : rawConf >= 45 ? "MEDIUM" : "LOW";
  }
  
  // Normalize price change
  let priceChangePercent = 0;
  if (stock.change_pct !== undefined) {
    priceChangePercent = Number(stock.change_pct);
  } else if (stock.priceChangePercent !== undefined) {
    priceChangePercent = Number(stock.priceChangePercent);
  }

  const news: NewsObject = {
    score: stock.news?.score || 0,
    sentiment_label: stock.news?.sentiment_label || "neutral",
    company_headlines: stock.news?.company_headlines || [],
    sector_headlines: stock.news?.sector_headlines || [],
    global_headlines: stock.news?.global_headlines || []
  };

  return {
    symbol: stock.symbol || defaultSymbol || "UNKNOWN",
    company: stock.company || stock.name || "Unknown Entity",
    price: Number(stock.price || 0),
    priceChangePercent: priceChangePercent,
    score: Number(stock.score || 0),
    confidence: confidence,
    sector: stock.sector || "General",
    horizon: stock.horizon || "Short Term",
    why_now: stock.why_now || "Signal detection in progress.",
    news: news,
    risks: stock.risks || [],
    explanation: stock.explanation || stock.why_now || "No detailed explanation available.",
    signals: stock.signals || [],
    technical_patterns: stock.technical_patterns || [],
    similar_events: stock.similar_events || [],
    actionability: stock.actionability,
    rank: stock.rank,
    decision: stock.decision || "HOLD",
    sentiment: decisionToSentiment(stock.decision || "HOLD"),
    insights: stock.insights || {
      sentiment: decisionToSentiment(stock.decision || "HOLD"),
      volume: "Normal",
      momentum: "Stable"
    },
    risk_meta: stock.risk_meta || {
      volatility: "Moderate",
      conflictingSignals: "None detected",
      uncertainty: "Nominal"
    },
    historicalPattern: stock.historicalPattern || {
      description: "No direct historical match in current scan",
      successRate: 0
    },
    recentShift: stock.recentShift || {
      sentiment: { from: "Neutral", to: decisionToSentiment(stock.decision || "HOLD") },
      volume: "+12% vs Avg",
      risk: { from: "Low", to: "Medium" }
    },
    chartEvents: stock.chartEvents || [
      { date: "2024-03-15", type: "sentiment", label: "Sentiment Spike", description: "Inferred from 40+ news sources" },
      { date: "2024-03-20", type: "volume", label: "Breakout", description: "Institutional accumulation detected" },
      { date: "2024-03-22", type: "news", label: "Earnings Beat", description: "Surpassed consensus by 15%" }
    ]
  };
}

export interface DashboardResponse {
  signals: Signal[];
  generatedAt: string | null;
}

export async function getDashboardData(force: boolean = false): Promise<DashboardResponse> {
  try {
    const res = await fetch(`${BASE_URL}/market/signals`);
    if (!res.ok) throw new Error("Failed to fetch market data");
    
    const response = await res.json();
    const rawStocks = response?.stocks || [];
    
    const signals = rawStocks
      .map((stock: any) => transformStock(stock))
      .filter((s: any): s is Signal => s !== null);

    return { signals, generatedAt: new Date().toISOString() };
  } catch (err) {
    console.error("Dashboard fetch failed:", err);
    throw new Error("Failed to load dashboard data");
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
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Market overview failed:", err);
    return null;
  }
}

export async function getAnalytics(): Promise<any> {
    try {
        const res = await fetch(`${BASE_URL}/market/analytics`);
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error("Analytics fetch failed:", err);
        return null;
    }
}

export async function getAlerts(): Promise<Alert[]> {
  return [];
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