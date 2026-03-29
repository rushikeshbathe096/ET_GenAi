"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Target, ShieldCheck, Activity } from "lucide-react";
import { Signal } from "../data/mockSignals";
import { formatPrice, formatPercent } from "../utils/formatUtils";
import { normalizeScore } from "../utils/signalUtils";

interface SignalCardProps {
  signal: Signal;
}

export default function SignalCard({ signal }: SignalCardProps) {
  const isPositive = signal.priceChangePercent >= 0;

  return (
    <Link href={`/stock/${signal.symbol}`} className="block group transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative rounded-2xl border border-indigo-500/20 bg-[#071127]/80 backdrop-blur-xl p-6 transition-all duration-300 group-hover:border-indigo-400/40 group-hover:shadow-[0_12px_24px_-10px_rgba(99,102,241,0.25)] overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-500" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">{signal.symbol}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {isPositive ? '+' : ''}{signal.priceChangePercent.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{signal.company}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:border-rose-500/40'}`}>
              {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-0.5">Price</span>
              <span className="text-sm font-bold text-white">{formatPrice(signal.price)}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-0.5">Sector</span>
              <span className="text-sm font-bold text-white">{signal.sector}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-0.5">Confluence</span>
                <div className="flex items-center gap-1.5 font-black text-indigo-300">
                  <Activity size={14} className="text-indigo-400" />
                  {normalizeScore(signal.score)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-0.5">Confidence</span>
                <div className="flex items-center justify-end gap-1.5 font-bold text-cyan-300">
                  <ShieldCheck size={14} className="text-cyan-400" />
                  {signal.confidence}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
