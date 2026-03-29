"use client";

import { useState, useMemo, useEffect } from "react";
import SignalCard from "../../components/SignalCard";
import TopMovers from "../../components/TopMovers";
import StockDetailDrawer from "../../components/StockDetailDrawer";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getDashboardData } from "../../utils/api";
import { Signal } from "../../data/mockSignals";
import { AlertCircle, ArrowRight, Zap, Target } from "lucide-react";
import Link from "next/link";
import { detectCircuit } from "../../utils/signalUtils";

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setSignals(data);
      } catch (err) {
        setError("Failed to synchronize with Alpha Node.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const circuitBreakers = useMemo(() => 
    signals.filter(s => detectCircuit(s.priceChangePercent)), 
  [signals]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-6" />
        <h2 className="text-xl font-black text-rose-300 uppercase tracking-widest italic">{error}</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Checking Backend Telemetry...</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Circuit Alert Banners */}
      {circuitBreakers.length > 0 && (
        <div className="space-y-3">
          {circuitBreakers.map((signal) => (
             <div key={`circuit-${signal.symbol}`} className="relative overflow-hidden group">
               <div className="absolute inset-x-0 bottom-0 h-[2px] bg-linear-to-r from-transparent via-amber-500 to-transparent animate-shimmer" />
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl group-hover:border-amber-500/40 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] animate-pulse">
                      <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest flex items-center gap-2">
                        Circuit Alert Detected
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                      </h3>
                      <p className="text-white font-bold italic text-lg leading-none mt-1">
                        {signal.symbol} ({signal.company}) hit {Math.abs(signal.priceChangePercent).toFixed(1)}% price limit
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedSignal(signal)}
                    className="group-hover:translate-x-1 flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-black font-black uppercase tracking-widest text-[10px] transition-all hover:bg-amber-400 active:scale-95"
                  >
                    Investigate Node
                    <ArrowRight size={14} />
                  </button>
               </div>
             </div>
          ))}
        </div>
      )}

      {/* Main Stats Header */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
           <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-xl font-black text-white italic tracking-[0.2em] uppercase">Market Pulse Summary</h2>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-1">Cross-Sector Liquidity Engine</p>
            </div>
            <Link href="/market" className="flex items-center gap-2 text-[10px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-[0.2em] transition-colors group">
              Full Pulse Radar
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <TopMovers signals={signals} />
        </div>

        <aside className="xl:col-span-4 flex flex-col justify-end">
           <div className="bg-[#0c1532]/50 border border-indigo-500/10 rounded-4xl p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-3 text-indigo-300 text-sm font-black uppercase tracking-[0.2em] mb-6">
                <Target size={18} />
                Global Alpha State
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Signals</span>
                  <span className="text-xl font-black text-white">{signals.length}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">High Confidence</span>
                  <span className="text-xl font-black text-white">{signals.filter(s => s.confidence === "HIGH").length}</span>
                </div>
              </div>
           </div>
        </aside>
      </section>

      {/* Grid Summary */}
      <section className="relative">
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h2 className="text-xl font-black text-white italic tracking-[0.2em] uppercase">Active Intelligence Radar</h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-1">Real-Time Signal Convergence</p>
          </div>
          <Link href="/signal-radar" className="flex items-center gap-2 text-[10px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-[0.2em] transition-colors group">
            Full Sentinel Feed
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {signals.slice(0, 8).map((signal) => (
            <div key={signal.symbol} onClick={() => setSelectedSignal(signal)}>
              <SignalCard signal={signal} />
            </div>
           ))}
        </div>
      </section>

      <StockDetailDrawer 
        signal={selectedSignal} 
        isOpen={!!selectedSignal} 
        onClose={() => setSelectedSignal(null)} 
      />
    </div>
  );
}
