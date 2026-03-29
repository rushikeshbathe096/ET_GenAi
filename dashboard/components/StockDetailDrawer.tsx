"use client";

import { useEffect, useRef } from "react";
import { X, Target, ShieldCheck, Newspaper, Info, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Signal } from "../data/mockSignals";
import { formatPrice, formatPercent } from "../utils/formatUtils";
import { normalizeScore } from "../utils/signalUtils";

interface StockDetailDrawerProps {
  signal: Signal | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StockDetailDrawer({ signal, isOpen, onClose }: StockDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!signal) return null;

  const isPositive = signal.priceChangePercent >= 0;

  return (
    <>
      <div 
        className={`fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div 
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 z-[1001] w-full max-w-xl bg-[#030814] border-l border-indigo-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#030814]/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-white leading-none mb-1">{signal.symbol}</h2>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{signal.company}</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Current Price</span>
                <span className="text-xl font-black text-white">{formatPrice(signal.price)}</span>
                <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercent(signal.priceChangePercent)} Today
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Sector Focus</span>
                <span className="text-xl font-black text-white truncate">{signal.sector}</span>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Active Analysis</span>
              </div>
            </div>

            {/* Score & Confidence */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Confluence</span>
                  <div className="flex items-center gap-2 text-2xl font-black text-indigo-300">
                    <Activity size={18} />
                    {normalizeScore(signal.score)}
                  </div>
                </div>
              </div>
              <div className="bg-cyan-500/5 border border-cyan-500/20 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Confidence</span>
                  <div className="flex items-center gap-2 text-2xl font-black text-cyan-300">
                    <ShieldCheck size={18} />
                    {signal.confidence}
                  </div>
                </div>
              </div>
            </div>

            {/* Intelligence Summary */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-300 text-sm font-black uppercase tracking-widest">
                <Info size={16} />
                Intelligence Summary
              </div>
              <p className="text-slate-400 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10 italic">
                &quot;{signal.explanation}&quot;
              </p>
            </section>

            {/* News Radar */}
            <section className="space-y-4 pb-8">
              <div className="flex items-center gap-2 text-indigo-300 text-sm font-black uppercase tracking-widest">
                <Newspaper size={16} />
                Sentinel News Radar
              </div>
              <div className="space-y-3">
                {signal.news.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm text-white font-medium flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
