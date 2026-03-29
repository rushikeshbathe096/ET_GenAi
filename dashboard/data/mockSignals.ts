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
  news: string[];
  explanation: string;
  signals: any[];
  technical_patterns: any[];
  similar_events: any[];
  rank?: number;
}

export const mockSignals: Signal[] = [
  {
    symbol: "TITAN",
    company: "Titan Company Ltd",
    price: 3976.6,
    priceChangePercent: -1.55,
    score: 8.9,
    confidence: "HIGH",
    sector: "Consumer Discretionary",
    horizon: "1-2 Weeks",
    why_now: "Insider Trade is supportive, but price movement is acting as a drag.",
    explanation: "TITAN is showing a constructive and balanced setup, supported by promoter buying and institutional activity.",
    news: ["Titan Company Ltd sees strong growth outlook", "Analyst consensus maintains buy rating"],
    signals: [],
    technical_patterns: [],
    similar_events: [],
    rank: 1
  },
  {
    symbol: "INFY",
    company: "Infosys Ltd",
    price: 1482,
    priceChangePercent: 2.4,
    score: 7.8,
    confidence: "HIGH",
    sector: "IT Services",
    horizon: "1-3 Weeks",
    why_now: "Strong delivery pipeline and resilient earnings trend with improved technical momentum.",
    explanation: "Strong delivery pipeline and resilient earnings trend with improved technical momentum.",
    news: ["Infosys wins strategic transformation contract.", "Deal pipeline guidance revised upward for next quarter."],
    signals: [],
    technical_patterns: [],
    similar_events: [],
    rank: 2
  },
  {
    symbol: "HDFC",
    company: "HDFC Bank Ltd",
    price: 1495,
    priceChangePercent: 1.8,
    score: 7.2,
    confidence: "MEDIUM",
    sector: "Banking",
    horizon: "2-4 Weeks",
    why_now: "Steady accumulation and improving breadth suggest a favorable risk-reward setup.",
    explanation: "Steady accumulation and improving breadth suggest a favorable risk-reward setup.",
    news: ["HDFC Bank reports stable credit growth trajectory.", "Deposit growth trends remain healthy in monthly update."],
    signals: [],
    technical_patterns: [],
    similar_events: [],
    rank: 3
  }
];
