"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Signal } from "../data/mockSignals";
import { getTopGainers, getTopLosers } from "../utils/signalUtils";
import { formatPercent } from "../utils/formatUtils";

interface TopMoversProps {
  signals: Signal[];
}

export default function TopMovers({ signals }: TopMoversProps) {
  const topGainers = useMemo(() => getTopGainers(signals), [signals]);
  const topLosers = useMemo(() => getTopLosers(signals), [signals]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp size={16} />
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Market Gainers</h2>
        </div>
        <div className="space-y-4">
          {topGainers.map((signal) => (
            <div key={signal.symbol} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-200">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white">{signal.symbol}</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{signal.company}</span>
              </div>
              <span className="text-sm font-black text-emerald-400">{formatPercent(signal.priceChangePercent)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
            <TrendingDown size={16} />
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Market Losers</h2>
        </div>
        <div className="space-y-4">
          {topLosers.map((signal) => (
            <div key={signal.symbol} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-all duration-200">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white">{signal.symbol}</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{signal.company}</span>
              </div>
              <span className="text-sm font-black text-rose-400">{formatPercent(signal.priceChangePercent)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
