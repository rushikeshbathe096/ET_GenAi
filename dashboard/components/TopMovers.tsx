"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Radio, Activity } from "lucide-react";
import { Signal } from "../data/mockSignals";
import { getTopGainers, getTopLosers } from "../utils/signalUtils";
import { formatPercent } from "../utils/formatUtils";
import { motion } from "framer-motion";

interface TopMoversProps {
  signals: Signal[];
}

export default function TopMovers({ signals }: TopMoversProps) {
  const topGainers = useMemo(() => getTopGainers(signals), [signals]);
  const topLosers = useMemo(() => getTopLosers(signals), [signals]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-[2.5rem] border border-white/5 bg-[#050b18] p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
           <TrendingUp size={80} className="text-emerald-500" />
        </div>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio size={20} className="animate-pulse" />
            </div>
            <div>
               <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Telemetry</h2>
               <p className="text-sm font-black text-white uppercase italic tracking-tight">Top Alpha Gainers</p>
            </div>
          </div>
          <Activity size={16} className="text-emerald-500/30" />
        </div>

        <div className="space-y-3">
          {topGainers.map((signal) => (
            <motion.div 
              key={signal.symbol} 
              whileHover={{ x: 5 }}
              onClick={() => window.location.href = `/stock/${signal.symbol}`}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all cursor-pointer overflow-hidden relative"
            >
              <div className="flex flex-col">
                <span className="text-sm font-black text-white italic tracking-tight">{signal.symbol}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[140px]">{signal.company}</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="hidden sm:flex items-end gap-1 h-4">
                    {[3, 5, 8, 6, 9].map((h, i) => (
                       <div key={i} className="w-1 bg-emerald-500/20 rounded-t-sm" style={{ height: `${h * 10}%` }} />
                    ))}
                 </div>
                 <span className="text-sm font-black text-emerald-400 italic">{formatPercent(signal.priceChangePercent)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-white/5 bg-[#050b18] p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
           <TrendingDown size={80} className="text-rose-500" />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Radio size={20} className="animate-pulse" />
            </div>
            <div>
               <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Telemetry</h2>
               <p className="text-sm font-black text-white uppercase italic tracking-tight">High Alpha Losers</p>
            </div>
          </div>
          <Activity size={16} className="text-rose-500/30" />
        </div>

        <div className="space-y-3">
          {topLosers.map((signal) => (
            <motion.div 
              key={signal.symbol} 
              whileHover={{ x: -5 }}
              onClick={() => window.location.href = `/stock/${signal.symbol}`}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-rose-500/[0.03] hover:border-rose-500/20 transition-all cursor-pointer overflow-hidden relative"
            >
              <div className="flex flex-col">
                <span className="text-sm font-black text-white italic tracking-tight">{signal.symbol}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[140px]">{signal.company}</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="hidden sm:flex items-end gap-1 h-4 rotate-180">
                    {[3, 5, 8, 6, 9].map((h, i) => (
                       <div key={i} className="w-1 bg-rose-500/20 rounded-t-sm shadow-[0_0_5px_rgba(244,63,94,0.2)]" style={{ height: `${h * 10}%` }} />
                    ))}
                 </div>
                 <span className="text-sm font-black text-rose-400 italic">{formatPercent(signal.priceChangePercent)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
