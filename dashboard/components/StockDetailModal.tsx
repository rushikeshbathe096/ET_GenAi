"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Target, 
  Clock, 
  Newspaper, 
  AlertTriangle, 
  Share2, 
  CheckCircle2,
  RefreshCw,
  Cpu,
  Binary,
  Microscope
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity } from "../types/opportunity";
import { getDashboardData } from "../utils/api";
import { toast } from "react-hot-toast";
import { 
  formatPrice, 
  formatPriceChange, 
  formatConfidenceColor,
  formatDecisionText
} from "../utils/formatUtils";

interface StockDetailModalProps {
  symbol: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StockDetailModal({ symbol, isOpen, onClose }: StockDetailModalProps) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    try {
      const { signals } = await getDashboardData();
      const match = signals.find(s => s.symbol === symbol);
      
      if (match) {
        setOpportunity(match as any);
      } else {
        throw new Error("Intelligence for this entity is not currently in cache.");
      }
    } catch (err) {
      console.error("Modal Fetch Error:", err);
      setError("Failed to synchronize with Alpha Node.");
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (isOpen && symbol) {
      fetchData();
    } else if (!isOpen) {
      setOpportunity(null);
      setError(null);
    }
  }, [isOpen, symbol, fetchData]);

  const getSentiment = (decision: string) => {
    const d = decision?.toString().toUpperCase();
    if (d === "BUY" || d === "STRONG_BUY") return "BULLISH";
    if (d === "SELL" || d === "STRONG_SELL") return "BEARISH";
    return "SIDEWAYS";
  };

  const handleShare = async () => {
    if (!opportunity) return;
    const shareText = `📊 Alpha Node: ${opportunity.symbol} - ${getSentiment(opportunity.decision || "")} at ₹${opportunity.price}\nRationale: ${opportunity.why_now}`;
    if (navigator.share) {
       try { await navigator.share({ title: `${opportunity.symbol} Intelligence`, text: shareText }); } catch { copyToClipboard(shareText); }
    } else { copyToClipboard(shareText); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Alpha Intelligence Synchronized to Clipboard");
  };

  const getRiskFlag = () => {
    if (!opportunity) return null;
    const text = (opportunity.explanation + " " + opportunity.why_now).toLowerCase();
    if (opportunity.decision === "SELL") return { type: "danger", message: "SELL CRITICAL — EXECUTE IMMEDIATELY" };
    if (opportunity.confidence === "LOW") return { type: "warning", message: "LOW CONFIDENCE NODE — WAIT FOR SYNC" };
    return { type: "safe", message: "NOMINAL RISK PARAMETERS" };
  };

  const riskFlag = getRiskFlag();
  const isPositive = (opportunity?.priceChangePercent ?? 0) >= 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[1001] w-full max-w-xl bg-[#030814] border-l border-white/5 flex flex-col shadow-2xl h-screen overflow-hidden"
          >
            {/* Header Readout */}
            <header className="p-8 border-b border-white/5 bg-[#030814]/90 backdrop-blur-xl sticky top-0 z-20">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                     <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                        <X size={18} />
                     </button>
                     <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{symbol}</h2>
                           <div className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest">RANK.#{opportunity?.rank || '00'}</div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic truncate max-w-[200px]">{opportunity?.company || 'Loading Entity...'}</span>
                     </div>
                  </div>
                  <button 
                    onClick={handleShare}
                    className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                  >
                     <Share2 size={18} />
                  </button>
               </div>
               
               <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Live Price</span>
                     <span className="text-2xl font-black text-white italic tracking-tight">{opportunity ? formatPrice(opportunity.price) : '₹0.00'}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Session Flux</span>
                     <div className={`flex items-center gap-1.5 text-lg font-black italic ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {opportunity ? formatPriceChange(opportunity.priceChangePercent) : '0.00%'}
                     </div>
                  </div>
                  <div className="flex flex-col ml-auto items-end">
                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</span>
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Synced</span>
                     </div>
                  </div>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 hide-scrollbar pb-20">
               {loading ? (
                  <div className="space-y-8 animate-pulse">
                     <div className="h-32 bg-white/5 rounded-[2rem]" />
                     <div className="h-48 bg-white/5 rounded-[2rem]" />
                     <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-white/5 rounded-[2rem]" />
                        <div className="h-24 bg-white/5 rounded-[2rem]" />
                     </div>
                  </div>
               ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                     <AlertTriangle className="w-12 h-12 text-rose-500 mb-6" />
                     <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-8">{error}</p>
                     <button 
                        onClick={fetchData}
                        className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-950/20"
                     >
                        <RefreshCw size={14} /> Re-establish Link
                     </button>
                  </div>
               ) : opportunity && (
                  <>
                     {/* Strategic Insight */}
                     <section className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Zap size={14} className="text-indigo-400 fill-current" />
                           <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Alpha Rationale</h3>
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-6 opacity-5">
                              <Binary size={80} className="text-indigo-500" />
                           </div>
                           <p className="text-sm font-black italic leading-relaxed text-indigo-100/90 relative z-10">
                             &quot;{opportunity.why_now}&quot;
                           </p>
                        </div>
                     </section>

                     {/* Tactical Breakdown */}
                     <section className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Microscope size={14} className="text-indigo-400" />
                           <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Agentic Reasoning</h3>
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5">
                           <p className="text-sm font-medium leading-[1.8] text-slate-400">
                             {opportunity.explanation}
                           </p>
                        </div>
                     </section>

                     {/* Intelligence Matrix */}
                     <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col justify-between">
                           <div>
                              <div className="flex items-center gap-2 mb-4">
                                 <Target size={14} className="text-indigo-400" />
                                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Confluence Score</span>
                              </div>
                              <div className="text-4xl font-black text-white italic tracking-tight">{opportunity.score.toFixed(2)}<span className="text-xs text-slate-700 font-bold ml-1 italic">/10.00</span></div>
                           </div>
                           <div className="mt-6">
                              <div className="flex justify-between items-center mb-2">
                                 <span className={`text-[9px] font-black uppercase tracking-widest ${formatConfidenceColor(opportunity.confidence)}`}>{opportunity.confidence} Confidence</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(opportunity.score / 10) * 100}%` }}
                                    className={`h-full ${formatConfidenceColor(opportunity.confidence).includes('emerald') ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col justify-between">
                           <div className="flex items-center gap-2 mb-4">
                              <Clock size={14} className="text-indigo-400" />
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Trade Horizon</span>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-2xl font-black text-white italic uppercase tracking-tighter">{opportunity.horizon}</span>
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Locked for Execution</span>
                           </div>
                        </div>
                     </section>

                     {/* News Signal Stream */}
                     <section className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Activity size={14} className="text-indigo-400" />
                           <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Telemetry Stream</h3>
                        </div>
                        <div className="space-y-3">
                           {opportunity.news && opportunity.news.length > 0 ? (
                              opportunity.news.map((item, i) => (
                                 <div key={i} className="flex gap-4 p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                                    <p className="text-xs font-bold text-slate-500 leading-normal italic">{item.title}</p>
                                 </div>
                              ))
                           ) : (
                              <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest text-center py-10 italic">Buffer Empty • No live signals in current orbit</div>
                           )}
                        </div>
                     </section>

                     {/* Risk Sentinel Output */}
                     <section className="space-y-4 pb-12">
                        <div className="flex items-center gap-2">
                           <ShieldCheck size={14} className="text-indigo-400" />
                           <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Risk Sentinel</h3>
                        </div>
                        <div className={`p-8 rounded-[2.5rem] border flex items-center gap-4 ${
                           riskFlag?.type === 'danger' ? 'bg-rose-500/5 border-rose-500/20' : 
                           riskFlag?.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 
                           'bg-emerald-500/5 border-emerald-500/20'
                        }`}>
                           <div className={`p-3 rounded-2xl ${
                               riskFlag?.type === 'danger' ? 'bg-rose-500/10 text-rose-500' : 
                               riskFlag?.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                               'bg-emerald-500/10 text-emerald-500'
                           }`}>
                              {riskFlag?.type === 'safe' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Report</span>
                              <p className={`text-sm font-black uppercase italic tracking-widest ${
                                 riskFlag?.type === 'danger' ? 'text-rose-400' : 
                                 riskFlag?.type === 'warning' ? 'text-amber-400' : 
                                 'text-emerald-400'
                              }`}>
                                 {riskFlag?.message}
                              </p>
                           </div>
                        </div>
                     </section>
                  </>
               )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
