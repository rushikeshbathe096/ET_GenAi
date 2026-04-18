"use client";

import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Target,
  ShieldCheck,
  Clock,
  ChevronRight
} from "lucide-react";
import { Signal } from "../utils/api";
import {
  formatPrice,
  formatPriceChange,
  formatHorizon,
  formatConfidenceColor
} from "../utils/formatUtils";

interface SignalCardProps {
  signal: Signal;
}

export default function SignalCard({ signal }: SignalCardProps) {
  const router = useRouter();
  const isPositive = (signal?.priceChangePercent ?? 0) >= 0;

  const currentDecision = signal.decision || "HOLD";
  const sentimentColor =
    currentDecision.includes("BUY") ? "text-emerald-400" :
      currentDecision.includes("SELL") ? "text-rose-400" :
        "text-amber-400";

  return (
    <div
      onClick={() => router.push(`/stock/${signal.symbol}`)}
      className="group cursor-pointer bg-[#0f1115] border border-white/5 rounded-xl p-6 hover:border-indigo-500/30 transition-all relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">{signal.symbol}</h3>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider truncate max-w-[150px]">
            {signal.company}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Momentum</span>
          <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatPriceChange(signal.priceChangePercent)}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Alpha Score</span>
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Target size={12} className="text-indigo-500" />
            <span className="text-sm">{Number(signal.score || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 py-3 border-y border-white/[0.03]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Signal Decision</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${sentimentColor}`}>
            {currentDecision}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Conviction</span>
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <ShieldCheck size={11} className="text-indigo-400" />
            <span className="text-[10px] uppercase">{signal.confidence}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between group-hover:text-indigo-400 transition-colors">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <Clock size={12} />
          {formatHorizon(signal.horizon)}
        </div>
        <ChevronRight size={14} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
      </div>

      {/* Subtle indicator bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/[0.02]">
        <div
          className={`h-full ${isPositive ? 'bg-emerald-500/30' : 'bg-rose-500/30'}`}
          style={{ width: `${Math.min(100, (signal.score || 0) * 10)}%` }}
        />
      </div>
    </div>
  );
}
