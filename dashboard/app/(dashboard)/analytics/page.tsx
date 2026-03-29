"use client";

import { useEffect, useState } from "react";
import { Activity, BarChart3, Target, ShieldCheck, AlertCircle } from "lucide-react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { getAnalytics, getMarket } from "../../../utils/api";
import { SectorData } from "../../../data/mockMarket";
import { formatPercent } from "../../../utils/formatUtils";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [market, setMarket] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [aData, mData] = await Promise.all([getAnalytics(), getMarket()]);
        setAnalytics(aData);
        setMarket(mData.sectors || []);
      } catch (err) {
        setError("Analytics Node offline.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error || !analytics) {
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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-end justify-between pb-8 border-b border-indigo-500/10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter leading-none">Engine Diagnostics</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs mt-3">Performance Convergence Node</p>
        </div>
        <div className="flex items-center gap-4 h-full">
           <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl flex items-center justify-between min-w-[200px]">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1 italic">Win Rate</span>
              <div className="flex items-center gap-2 text-3xl font-black text-indigo-300">
                <Target size={18} />
                {analytics.winRate}%
              </div>
            </div>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/20 p-5 rounded-2xl flex items-center justify-between min-w-[200px]">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1 italic">Avg Score</span>
              <div className="flex items-center gap-2 text-3xl font-black text-cyan-300">
                <ShieldCheck size={18} />
                {analytics.avgReturn}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-[#0c1532]/50 border border-indigo-500/10 rounded-3xl p-8 backdrop-blur-xl">
           <div className="flex items-center gap-3 text-indigo-300 text-sm font-black uppercase tracking-[0.2em] mb-10">
            <Activity size={18} />
            7-Day Operational Trend
          </div>
          <div className="flex items-end justify-between h-48 gap-4 px-4 overflow-hidden">
            {analytics.weeklyTrend.map((day: any) => (
               <div key={day.day} className="flex-1 flex flex-col items-center group">
                 <div className="w-full relative flex items-end justify-center h-full">
                    <div className="absolute inset-x-0 bottom-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-all duration-300 h-full rounded-t-lg" />
                    <div 
                      className="relative w-full rounded-t-lg bg-linear-to-t from-indigo-600 to-cyan-400 opacity-80 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_15px_-2px_rgba(99,102,241,0.5)]"
                      style={{ height: `${day.winRate}%` }}
                    />
                    <span className="absolute -top-8 text-xs font-black text-indigo-300 opacity-0 group-hover:opacity-100 transition-all duration-300">{day.winRate}%</span>
                 </div>
                 <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">{day.day}</span>
               </div>
            ))}
          </div>
        </section>

        <section className="bg-[#0c1532]/50 border border-indigo-500/10 rounded-3xl p-8 backdrop-blur-xl">
           <div className="flex items-center gap-3 text-indigo-300 text-sm font-black uppercase tracking-[0.2em] mb-10">
            <BarChart3 size={18} />
            Sector Confluence Stats
          </div>
           <div className="space-y-4">
              {market.map((sector: any) => (
                <div key={sector.sector} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:border-indigo-500/30 transition-all duration-200 group">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors uppercase tracking-widest">{sector.sector}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-black font-sans tracking-widest italic">Live Depth Analysis</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">Score Depth</span>
                      <span className="text-sm font-black text-indigo-300">{(analytics.avgReturn + (Math.random() - 0.5)).toFixed(1)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">Perf</span>
                      <span className={`text-sm font-black ${sector.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatPercent(sector.change)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </section>
      </div>
    </div>
  );
}
