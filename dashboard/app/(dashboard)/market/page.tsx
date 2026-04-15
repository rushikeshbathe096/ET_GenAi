"use client";

import { useEffect, useState } from "react";
import { 
  Activity, 
  LayoutGrid, 
  Target, 
  AlertCircle, 
  Globe, 
  Zap, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Orbit,
  Waves
} from "lucide-react";
import { getMarket } from "../../../utils/api";
import { formatPercent } from "../../../utils/formatUtils";
import { motion, AnimatePresence } from "framer-motion";

export default function MarketPulsePage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMarket();
      setSummary(data);
    } catch (err) {
      setError("COMMUNICATION ERROR: MARKET TELEMETRY OFFLINE");
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
           <div className="h-24 bg-white/5 rounded-[2.5rem]" />
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-[600px] bg-white/5 rounded-[3rem]" />
              <div className="space-y-8">
                 <div className="h-64 bg-white/5 rounded-[3rem]" />
                 <div className="h-64 bg-white/5 rounded-[3rem]" />
              </div>
           </div>
        </div>
     );
  }

  if (error || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center animate-pulse">
           <AlertCircle className="w-12 h-12 text-rose-500" />
        </div>
        <div className="text-center">
           <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase italic mb-2">{error}</h2>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Sentinel uplink failed • Diagnostic required</p>
        </div>
        <button 
          onClick={fetchData}
          className="px-12 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/10 transition-all shadow-2xl"
        >
          FORCE RE-SYNC
        </button>
      </div>
    );
  }

  const sectors = summary.sectors || [];

  return (
    <div className="space-y-12 pb-32 pt-4">
      {/* High-Impact Header */}
      <header className="relative p-12 rounded-[3.5rem] bg-[#050b18] border border-white/5 overflow-hidden group">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] -mr-32 -mt-32" />
         <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="p-4 rounded-3xl bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                     <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                     <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Global Pulse Node</h1>
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2 block">CROSS-SECTOR CONVERGENCE RADAR</span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Sentiment Orbit</span>
                  <span className="text-xl font-black text-emerald-400 italic">OPTIMIZED</span>
               </div>
               <div className="w-px h-10 bg-white/10" />
               <motion.button 
                 onClick={fetchData}
                 whileHover={{ rotate: 180 }}
                 className="p-4 rounded-full bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl"
               >
                  <RefreshCw size={20} />
               </motion.button>
            </div>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sector Analytics */}
        <div className="lg:col-span-2 relative">
           <div className="rounded-[3rem] bg-[#050b18] border border-white/5 p-12 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <Orbit size={180} className="text-indigo-400 animate-[spin_20s_linear_infinity]" />
              </div>
              
              <div className="flex items-center gap-4 mb-12 relative z-10">
                <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">Sector Performance Matrix</h2>
              </div>

              <div className="grid gap-10 relative z-10">
                {sectors.map((sector: any, i: number) => (
                  <motion.div 
                    key={sector.sector} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic group-hover:text-indigo-400 transition-colors">Sector.{i + 1}</span>
                         <h3 className="text-lg font-black text-white tracking-widest uppercase italic leading-none">{sector.sector}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className={`text-[10px] font-black uppercase tracking-widest ${sector.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {sector.change >= 0 ? <TrendingUp size={12} className="inline mr-1" /> : <TrendingDown size={12} className="inline mr-1" />}
                            {formatPercent(sector.change)}
                         </span>
                      </div>
                    </div>
                    <div className="relative h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(5, Math.min(100, Math.abs(sector.change) * 25 + 20))}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full transition-all group-hover:brightness-125 ${sector.change >= 0 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
           </div>
        </div>

        {/* Global Stats */}
        <div className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[3rem] bg-[#050b18] border border-white/5 p-10 overflow-hidden relative group"
          >
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Waves size={80} className="text-indigo-500" />
             </div>
             <div className="flex items-center gap-3 text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-10 italic">
               <Activity size={18} />
               Volatility Index
             </div>
             <div className="flex flex-col items-center justify-center py-4">
               <span className="text-7xl font-black text-white italic tracking-tighter leading-none">{summary.volatility || "LOW"}</span>
               <div className="mt-8 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest italic animate-pulse">
                  PERSISTENT RISK LAYER
               </div>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[3rem] bg-[#050b18] border border-white/5 p-10 overflow-hidden relative group"
          >
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <BarChart3 size={80} className="text-indigo-500" />
             </div>
             <div className="flex items-center gap-3 text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-10 italic">
               <Target size={18} />
               Alpha Density
             </div>
             <div className="flex flex-col items-center justify-center py-4">
               <span className="text-7xl font-black text-white italic tracking-tighter leading-none">{summary.participation || "DEEP"}</span>
               <div className="mt-8 flex items-center gap-2">
                  <span className="text-slate-600 font-black uppercase tracking-widest text-[9px]">Volume depth:</span>
                  <span className="text-emerald-400 font-black uppercase tracking-widest text-[10px] italic">{summary.volume_depth || "1.2X AVG"}</span>
               </div>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
