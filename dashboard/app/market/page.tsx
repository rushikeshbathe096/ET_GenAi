"use client";

import { useEffect, useState } from "react";
import { Activity, LayoutGrid, Target, AlertCircle } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getMarket } from "../../utils/api";
import { SectorData } from "../../data/mockMarket";
import { formatPercent } from "../../utils/formatUtils";

export default function MarketPulsePage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getMarket();
        setSummary(data);
      } catch (err) {
        setError("Market Telemetry offline.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error || !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-6" />
        <h2 className="text-xl font-black text-rose-300 uppercase tracking-widest italic">{error || "Data unavailable"}</h2>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const sectors = summary.sectors || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-3 pb-8 border-b border-indigo-500/10">
        <h1 className="text-4xl font-black text-white italic tracking-tighter leading-none">Global Pulse Node</h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Cross-Sector Convergence Radar</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-2 bg-[#0c1532]/50 border border-indigo-500/10 rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-indigo-300 text-sm font-black uppercase tracking-[0.2em] mb-8">
            <Activity size={18} />
            Sector Performance Index
          </div>
          <div className="grid gap-6">
            {sectors.map((sector: any) => (
              <div key={sector.sector} className="group flex flex-col gap-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors uppercase tracking-widest">{sector.sector}</span>
                  <span className={`text-sm font-black ${sector.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatPercent(sector.change)}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_15px_-2px_rgba(99,102,241,0.5)] ${sector.change >= 0 ? 'bg-linear-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-linear-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'}`}
                    style={{ width: `${Math.max(1, Math.min(100, Math.abs(sector.change) * 20 + 20))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0c1532]/50 border border-indigo-500/10 rounded-3xl p-8 backdrop-blur-xl">
             <div className="flex items-center gap-3 text-indigo-300 text-sm font-black uppercase tracking-[0.2em] mb-6">
              <Target size={18} />
              Session Volatility
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <span className="text-7xl font-black text-white italic tracking-tighter">{summary.volatility || "Low"}</span>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">Risk Sentiment: Persistent</p>
            </div>
          </div>

          <div className="bg-[#0c1532]/50 border border-indigo-500/10 rounded-3xl p-8 backdrop-blur-xl">
             <div className="flex items-center gap-3 text-indigo-300 text-sm font-black uppercase tracking-[0.2em] mb-6">
              <LayoutGrid size={18} />
              Participation Depth
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <span className="text-6xl font-black text-white italic tracking-tighter">{summary.participation || "Strong"}</span>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">Volume: {summary.volume_depth || "1.2x Avg"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
