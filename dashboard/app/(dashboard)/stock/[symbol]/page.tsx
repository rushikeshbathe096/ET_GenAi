"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowLeft, 
  Newspaper, 
  Info,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { getStock } from "../../../../utils/api";
import { Signal } from "../../../../data/mockSignals";
import { formatPrice, formatPercent } from "../../../../utils/formatUtils";
import { normalizeScore } from "../../../../utils/signalUtils";

export default function StockDetailPage() {
  const { symbol } = useParams();
  const router = useRouter();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!symbol) return;
      try {
        setLoading(true);
        const data = await getStock(symbol as string);
        setSignal(data);
      } catch (err) {
        setError("Node unavailable.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [symbol]);

  if (loading) return <LoadingSpinner />;

  if (error || !signal) {
    return (
      <div className="flex flex-col items-center justify-center py-32 rounded-4xl border border-dashed border-white/10 bg-white/5 backdrop-blur-md max-w-2xl mx-auto">
        <AlertCircle className="w-12 h-12 text-slate-500 mb-6" />
        <h2 className="text-xl font-black text-white italic uppercase tracking-widest leading-none mb-2">Signal Blocked</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8 italic">Telemetry unreachable for {symbol}</p>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase tracking-widest text-[10px] transition-all"
        >
          <ArrowLeft size={14} />
          Return to Hub
        </button>
      </div>
    );
  }

  const isPositive = signal.priceChangePercent >= 0;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-indigo-500/10">
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px] hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-3xl ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_50px_-10px_rgba(244,63,94,0.3)]'}`}>
              {isPositive ? <TrendingUp size={40} /> : <TrendingDown size={40} />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-3">
                <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none">{signal.symbol}</h1>
                <span className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercent(signal.priceChangePercent)}
                </span>
              </div>
              <p className="text-xl text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">{signal.company}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 h-full">
          <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-3xl flex flex-col justify-center min-w-[200px]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Confluence Node</span>
            <div className="flex items-center gap-2 text-4xl font-black text-indigo-300">
              <Activity size={24} />
              {normalizeScore(signal.score)}
            </div>
          </div>
          <div className="bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-3xl flex flex-col justify-center min-w-[200px]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Sector Depth</span>
            <div className="flex items-center gap-2 text-xl font-black text-cyan-300 uppercase tracking-widest">
              {signal.sector}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-[#0c1532]/50 border border-indigo-500/10 rounded-3xl p-8 backdrop-blur-xl">
             <div className="flex items-center gap-3 text-indigo-300 text-sm font-black uppercase tracking-[0.2em] mb-6">
              <Info size={16} />
              Analysis Explanation
            </div>
            <p className="text-slate-300 text-lg leading-relaxed italic border-l-4 border-indigo-500 pl-6 bg-indigo-500/5 py-4 rounded-r-xl">
              &quot;{signal.explanation}&quot;
            </p>
          </section>

          {signal.signals.length > 0 && (
            <section className="bg-[#0c1532]/50 border border-indigo-500/10 rounded-3xl p-8 backdrop-blur-xl animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-3 text-indigo-300 text-sm font-black uppercase tracking-[0.2em] mb-6">
                <Activity size={16} />
                Signal Convergence Factors
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signal.signals.map((s, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.type?.replace(/_/g, ' ')}</span>
                      <div className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${s.direction === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        <div className={`w-1 h-1 rounded-full ${s.direction === 'positive' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-[8px] font-black uppercase">{s.direction}</span>
                      </div>
                    </div>
                    <p className="text-sm text-white font-bold leading-snug group-hover:text-indigo-300 transition-colors">{s.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {signal.technical_patterns.length > 0 && (
            <section className="bg-[#0c1532]/50 border border-indigo-500/10 rounded-3xl p-8 backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 text-indigo-300 text-sm font-black uppercase tracking-[0.2em] mb-6">
                <TrendingUp size={16} />
                Pattern Identifiers
              </div>
              <div className="flex flex-wrap gap-3">
                {signal.technical_patterns.map((p, idx) => (
                  <div key={idx} className="px-4 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-black text-indigo-300 uppercase tracking-widest hover:border-indigo-400/50 transition-all cursor-default">
                    {p.type?.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-[#0c1532]/50 border border-indigo-500/10 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 text-indigo-300 text-sm font-black uppercase tracking-[0.2em] mb-6">
              <Newspaper size={16} />
              News Sentinel Feed
            </div>
            <div className="space-y-4">
              {signal.news.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-white font-bold leading-tight">{item}</p>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">2 Hours Ago</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-8 rounded-3xl backdrop-blur-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Execution Signal</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <span className="text-xs font-bold text-slate-400">Confidence</span>
                <span className="text-sm font-black text-cyan-300 font-mono">{signal.confidence}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <span className="text-xs font-bold text-slate-400">Price At Signal</span>
                <span className="text-sm font-black text-white">{formatPrice(signal.price)}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <span className="text-xs font-bold text-slate-400">Timeframe</span>
                <span className="text-sm font-black text-indigo-300 uppercase">{signal.horizon}</span>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">Catalyst: Why Now?</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-bold">
                {signal.why_now}
              </p>
            </div>

            <button className="w-full mt-6 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase tracking-widest text-xs transition-all duration-200 shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)] active:scale-95">
              Add to Active Mission
            </button>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 italic">Risk Sentiment</h3>
             <div className="flex flex-col gap-4">
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-linear-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-1000 ease-out" 
                   style={{ width: `${Math.max(20, Math.min(80, (signal.score / 10) * 100))}%` }}
                 />
               </div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Balanced Environment</p>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
