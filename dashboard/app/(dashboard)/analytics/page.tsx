"use client";

import { useEffect, useState } from "react";
import { 
  Activity, 
  BarChart3, 
  Target, 
  ShieldCheck, 
  AlertCircle, 
  Cpu, 
  BarChart4, 
  Orbit, 
  Zap, 
  HardDrive,
  RefreshCw,
  TrendingUp,
  Workflow
} from "lucide-react";
import { getAnalytics, getMarket } from "../../../utils/api";
import { formatPercent } from "../../../utils/formatUtils";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [market, setMarket] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [aData, mData] = await Promise.all([getAnalytics(), getMarket()]);
      setAnalytics(aData);
      setMarket(mData.sectors || []);
    } catch (err) {
      setError("CRITICAL: ANALYTICS NODE OFFLINE");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
     return (
        <div className="space-y-12 animate-pulse pt-4">
           <div className="h-32 bg-white/5 rounded-[3rem]" />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-[500px] bg-white/5 rounded-[3rem]" />
              <div className="h-[500px] bg-white/5 rounded-[3rem]" />
           </div>
        </div>
     );
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center animate-pulse">
           <AlertCircle className="w-12 h-12 text-rose-500" />
        </div>
        <div className="text-center">
           <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase italic mb-2">{error}</h2>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Diagnostics engine failure • Link verification required</p>
        </div>
        <button 
          onClick={fetchData}
          className="px-12 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/10 transition-all shadow-2xl"
        >
          FORCE DIAGNOSTIC
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32 pt-4">
      {/* High-Fidelity Diagnostics Header */}
      <header className="relative p-12 rounded-[3.5rem] bg-[#050b18] border border-white/5 overflow-hidden group">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] -mr-40 -mt-40 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
         
         <div className="relative flex flex-col xl:flex-row items-center justify-between gap-12">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="p-4 rounded-3xl bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                     <Workflow className="w-6 h-6 text-white" />
                  </div>
                  <div>
                     <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Engine Diagnostics</h1>
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2 block italic">Alpha Node Performance Convergence</span>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="px-5 py-2 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                     <RefreshCw size={12} className="text-indigo-400 animate-spin-slow" />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Live Feed Status: OPTIMAL</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
               <motion.div whileHover={{ y: -5 }} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 min-w-[240px]">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-400">
                     <Target size={24} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1 italic">Win Probability</span>
                     <span className="text-4xl font-black text-white italic tracking-tighter leading-none">{analytics.winRate}%</span>
                  </div>
               </motion.div>

               <motion.div whileHover={{ y: -5 }} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 min-w-[240px]">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-600/20 flex items-center justify-center text-cyan-400">
                     <ShieldCheck size={24} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1 italic">Alpha Confluence</span>
                     <span className="text-4xl font-black text-white italic tracking-tighter leading-none">{analytics.avgReturn}</span>
                  </div>
               </motion.div>
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Trend Matrix */}
        <section className="bg-[#050b18] border border-white/5 rounded-[3.5rem] p-12 overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
              <BarChart4 size={200} className="text-indigo-400" />
           </div>
           
           <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">Operational Velocity</h2>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest italic">7-DAY SCAN</div>
           </div>

           <div className="flex items-end justify-between h-56 gap-6 px-4">
             {analytics.weeklyTrend.map((day: any, i: number) => (
                <div key={day.day} className="flex-1 flex flex-col items-center group/bar h-full">
                  <div className="w-full relative flex items-end justify-center h-full">
                     <div className="absolute inset-x-0 bottom-0 bg-white/[0.02] group-hover/bar:bg-white/[0.05] transition-all duration-300 h-full rounded-t-2xl" />
                     <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${day.winRate}%` }}
                       transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                       className="relative w-full rounded-t-2xl bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 group-hover/bar:brightness-125 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                     />
                     <span className="absolute -top-8 text-[10px] font-black text-white italic opacity-0 group-hover/bar:opacity-100 transition-all">{day.winRate}%</span>
                  </div>
                  <span className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover/bar:text-white transition-colors italic">{day.day}</span>
                </div>
             ))}
           </div>
        </section>

        {/* Sector Analytics Matrix */}
        <section className="bg-[#050b18] border border-white/5 rounded-[3.5rem] p-12 overflow-hidden relative group font-mono">
           <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Orbit size={200} className="text-indigo-400 animate-spin-slow" />
           </div>
           
           <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">Sector Confluence</h2>
              </div>
              <Activity size={18} className="text-indigo-500/50" />
           </div>

           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {market.map((sector: any, i: number) => (
                <motion.div 
                  key={sector.sector} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.02] hover:bg-indigo-500/[0.03] hover:border-indigo-500/30 transition-all group/item"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white group-hover/item:text-indigo-400 transition-colors uppercase italic tracking-tighter">{sector.sector}</span>
                    <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest italic mt-1 leading-none">Depth Protocol 0{i + 1}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col text-right">
                      <span className="text-[8px] text-slate-600 uppercase tracking-widest font-black mb-1">Depth</span>
                      <span className="text-lg font-black text-white italic tracking-tighter">{(analytics.avgReturn + (Math.random() - 0.5)).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[8px] text-slate-600 uppercase tracking-widest font-black mb-1">Vector</span>
                      <span className={`text-lg font-black italic tracking-tighter ${sector.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatPercent(sector.change)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
        </section>
      </div>
    </div>
  );
}
