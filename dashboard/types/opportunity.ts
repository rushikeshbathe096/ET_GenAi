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
