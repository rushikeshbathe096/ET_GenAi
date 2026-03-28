import React from "react";

export interface SignalCardProps {
  company: string;
  ticker: string;
  confluence_score: number;
  confidence: string;
  risk: string;
  horizon: string;
  why_now: string;
  price: number;
  isDarkMode?: boolean;
}

export default function SignalCard({
  company,
  ticker,
  confluence_score,
  confidence,
  risk,
  horizon,
  why_now,
  price,
  isDarkMode = true
}: SignalCardProps) {
  // Mock logo colors based on ticker
  const getLogoColors = (t: string) => {
    if (t === 'MSFT') return "bg-blue-600";
    if (t === 'AAPL') return "bg-slate-800 dark:bg-black";
    if (t === 'NVDA') return "bg-green-600";
    return "bg-indigo-600";
  };

  const theme = {
    cardBg: isDarkMode ? "bg-[#1c1e24]" : "bg-white",
    innerBoxBg: isDarkMode ? "bg-[#252830]" : "bg-slate-100",
    textMain: isDarkMode ? "text-white" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    border: isDarkMode ? "border-slate-800/50" : "border-slate-200",
  };

  // Formatting specific mocks based on image
  const normalizedScore = Math.min(1, Math.max(0, confluence_score > 1 ? confluence_score / 10 : confluence_score));
  const scorePercent = Math.round(normalizedScore * 100);
  const isPositive = ticker !== 'AAPL'; // Mock positive/negative like image
  const mockChange = isPositive ? `+2.45%` : `-0.42%`; // Statically set to avoid hydration mismatch
  const priceColor = isPositive ? (isDarkMode ? "text-emerald-400" : "text-emerald-600") : (isDarkMode ? "text-rose-400" : "text-rose-600");
  const riskColor = risk === 'High' ? (isDarkMode ? 'text-rose-400' : 'text-rose-600') : risk === 'Medium' ? (isDarkMode ? 'text-sky-400' : 'text-sky-600') : (isDarkMode ? 'text-emerald-400' : 'text-emerald-600');

  return (
    <div className={`${theme.cardBg} border ${theme.border} rounded-3xl p-7 flex flex-col hover:border-indigo-500/30 transition-all shadow-sm`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner ${getLogoColors(ticker)}`}>
            {ticker.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">{ticker}</h3>
            <p className={`text-sm ${theme.textMuted} font-medium`}>{company}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">₹{price.toFixed(2)}</div>
          <div className={`text-xs font-bold ${priceColor}`}>{mockChange}</div>
        </div>
      </div>

      {/* Confluence Score Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Confluence Score</span>
          <span className="text-sm font-bold text-indigo-400">{scorePercent}%</span>
        </div>
        <div className={`h-1.5 w-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full overflow-hidden`}>
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full" 
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      {/* Risk / Horizon Boxes */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className={`${theme.innerBoxBg} rounded-xl p-4 flex flex-col gap-1`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Risk</span>
          <span className={`text-sm font-bold ${riskColor}`}>{risk}</span>
        </div>
        <div className={`${theme.innerBoxBg} rounded-xl p-4 flex flex-col gap-1`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Horizon</span>
          <span className={`text-sm font-bold ${theme.textMain}`}>{horizon}</span>
        </div>
      </div>

      {/* Why Now */}
      <div className="mt-auto pt-2">
        <h4 className={`text-[10px] font-bold uppercase tracking-widest border-t border-transparent ${theme.textMuted} mb-3`}>
          Why Now?
        </h4>
        <p className={`text-sm ${theme.textMuted} leading-relaxed font-medium`}>
          {why_now}
        </p>
      </div>

    </div>
  );
}
