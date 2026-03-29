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
}

export const mockSignals: Signal[] = [
  {
    symbol: "TITAN",
    company: "Titan Company",
    price: 2758,
    priceChangePercent: -1.5,
    score: 8.9,
    confidence: "HIGH",
    sector: "Consumer Discretionary",
    horizon: "2-4 Weeks",
    why_now: "Promoter buying despite temporary pullback; institutional accumulation remains visible.",
    explanation: "Promoter buying despite temporary pullback; institutional accumulation remains visible.",
    news: ["Titan sees strong premium segment demand recovery.", "Brokerages maintain positive outlook after management commentary."]
  },
  {
    symbol: "INFY",
    company: "Infosys",
    price: 1482,
    priceChangePercent: 2.4,
    score: 7.8,
    confidence: "HIGH",
    sector: "IT Services",
    horizon: "1-3 Weeks",
    why_now: "Strong delivery pipeline and resilient earnings trend with improved technical momentum.",
    explanation: "Strong delivery pipeline and resilient earnings trend with improved technical momentum.",
    news: ["Infosys wins strategic transformation contract.", "Deal pipeline guidance revised upward for next quarter."]
  },
  {
    symbol: "HDFC",
    company: "HDFC Bank",
    price: 1495,
    priceChangePercent: 1.8,
    score: 7.2,
    confidence: "MEDIUM",
    sector: "Banking",
    horizon: "2-6 Weeks",
    why_now: "Steady accumulation and improving breadth suggest a favorable risk-reward setup.",
    explanation: "Steady accumulation and improving breadth suggest a favorable risk-reward setup.",
    news: ["HDFC Bank reports stable credit growth trajectory.", "Deposit growth trends remain healthy in monthly update."]
  },
  {
    symbol: "RELIANCE",
    company: "Reliance Industries",
    price: 2500,
    priceChangePercent: -2.9,
    score: 4.1,
    confidence: "MEDIUM",
    sector: "Energy",
    horizon: "1-2 Weeks",
    why_now: "Distribution pressure and weak follow-through suggest caution in near-term positioning.",
    explanation: "Distribution pressure and weak follow-through suggest caution in near-term positioning.",
    news: ["Reliance trades weaker as energy segment underperforms.", "Mixed outlook from recent management commentary."]
  },
  {
    symbol: "TCS",
    company: "Tata Consultancy Services",
    price: 3650,
    priceChangePercent: 0.8,
    score: 6.5,
    confidence: "HIGH",
    sector: "IT Services",
    horizon: "4-8 Weeks",
    why_now: "Steady order book execution and margin maintenance provide safety.",
    explanation: "Steady order book execution and margin maintenance provide safety.",
    news: ["TCS reports positive hiring trend.", "New deal signed with European bank."]
  },
  {
    symbol: "SBIN",
    company: "State Bank of India",
    price: 750,
    priceChangePercent: 11.2,
    score: 9.1,
    confidence: "HIGH",
    sector: "Banking",
    horizon: "1-2 Weeks",
    why_now: "Massive institutional accumulation as price hits upper circuit.",
    explanation: "Massive institutional accumulation as price hits upper circuit.",
    news: ["SBI reports record quarterly profit.", "Asset quality improves significantly."]
  },
  {
    symbol: "ICICIBANK",
    company: "ICICI Bank",
    price: 1080,
    priceChangePercent: 3.2,
    score: 8.5,
    confidence: "HIGH",
    sector: "Banking",
    horizon: "2-4 Weeks",
    why_now: "Market leading credit growth and superior ROE profile driving fresh alpha.",
    explanation: "Market leading credit growth and superior ROE profile driving fresh alpha.",
    news: ["ICICI Bank increases deposit rates.", "Analyst upgrade following strong Q3 numbers."]
  },
  {
    symbol: "BHARTIARTL",
    company: "Bharti Airtel",
    price: 1120,
    priceChangePercent: -0.5,
    score: 5.8,
    confidence: "MEDIUM",
    sector: "Telecom",
    horizon: "3-6 Weeks",
    why_now: "Consolidating near all-time highs with relative strength index holding steady.",
    explanation: "Consolidating near all-time highs with relative strength index holding steady.",
    news: ["Airtel expands 5G coverage to 500 cities.", "Tariff hike expected in next few months."]
  },
  {
    symbol: "MARUTI",
    company: "Maruti Suzuki",
    price: 10500,
    priceChangePercent: 1.2,
    score: 6.2,
    confidence: "LOW",
    sector: "Automobile",
    horizon: "2-4 Weeks",
    why_now: "Strong SUV order book and margin expansion potentially offsetting rural slowdown.",
    explanation: "Strong SUV order book and margin expansion potentially offsetting rural slowdown.",
    news: ["Maruti sees record bookings for new SUV models.", "Raw material costs easing, helping margins."]
  },
  {
    symbol: "LT",
    company: "Larsen & Toubro",
    price: 3450,
    priceChangePercent: 4.5,
    score: 7.9,
    confidence: "HIGH",
    sector: "Infrastructure",
    horizon: "6-12 Months",
    why_now: "Record order inflow guidance and infrastructure push in national budget.",
    explanation: "Record order inflow guidance and infrastructure push in national budget.",
    news: ["L&T wins mega order from Middle East.", "Project execution speeds up in Q4."]
  },
  {
    symbol: "ITC",
    company: "ITC Limited",
    price: 430,
    priceChangePercent: -2.1,
    score: 4.5,
    confidence: "LOW",
    sector: "FMCG",
    horizon: "1-2 Weeks",
    why_now: "Short-term profit booking after dividend payout; technical support near 420.",
    explanation: "Short-term profit booking after dividend payout; technical support near 420.",
    news: ["ITC hotel business demerger update.", "Cigarette volume growth stays resilient."]
  },
  {
    symbol: "SUNPHARMA",
    company: "Sun Pharma",
    price: 1540,
    priceChangePercent: 0.2,
    score: 5.1,
    confidence: "MEDIUM",
    sector: "Pharma",
    horizon: "4-8 Weeks",
    why_now: "Product approval pipeline looks strong for US market entry.",
    explanation: "Product approval pipeline looks strong for US market entry.",
    news: ["Sun Pharma gets FDA approval for specialty drug.", "Research spending increases in biosimilars."]
  }
];
