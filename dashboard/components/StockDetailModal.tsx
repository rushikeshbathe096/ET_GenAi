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
  Copy,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity } from "../types/opportunity";
import { getDashboardData } from "../utils/api";
import { toast } from "react-hot-toast";
import { 
  formatPrice, 
  formatPriceChange, 
  formatHorizon, 
  formatConfidenceColor 
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
      // Step 1: Fetch consolidated opportunities
      const { signals } = await getDashboardData();
      
      // Step 2: Find the matching symbol
      // Note: signals are transformed in getDashboardData, so we check the symbol
      const match = signals.find(s => s.symbol === symbol);
      
      if (match) {
        // Map Signal back to Opportunity shape if needed, but they are very similar
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
      // Reset state when closed to avoid stale data flashing
      setOpportunity(null);
      setError(null);
    }
  }, [isOpen, symbol, fetchData]);

  const handleShare = async () => {
    if (!opportunity) return;
    
    const shareText = `📊 ${opportunity.symbol} (${opportunity.company}) — ${opportunity.decision}
Price: ₹${opportunity.price} (${formatPriceChange(opportunity.priceChangePercent)})
Score: ${opportunity.score}/10 | Confidence: ${opportunity.confidence}
Horizon: ${opportunity.horizon}
Why Now: ${opportunity.why_now}
— Powered by ET_GenAi`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${opportunity.symbol} Analysis`,
          text: shareText,
        });
      } catch (err) {
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Alpha Intelligence copied to clipboard!");
  };

  const getRiskFlag = () => {
    if (!opportunity) return null;
    
    const text = (opportunity.explanation + " " + opportunity.why_now).toLowerCase();
    const riskKeywords = ["drag", "mixed", "bearish", "weak", "downside", "resistance"];
    const hasRiskKeywords = riskKeywords.some(word => text.includes(word));

    if (opportunity.decision === "SELL") {
      return { type: "danger", message: "Sell signal active — review position immediately" };
    }
    if (opportunity.confidence === "LOW") {
      return { type: "warning", message: "Low confidence — wait for confirmation before acting" };
    }
    if (hasRiskKeywords) {
      return { type: "danger", message: "Mixed or negative signals detected — trade with caution" };
    }
    
    return { type: "safe", message: "No major risk flags detected" };
  };

  const riskFlag = getRiskFlag();
  const isPositive = (opportunity?.priceChangePercent ?? 0) >= 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ x: "100%", y: 0 }} // Desktop default
            animate={{ x: 0, y: 0 }}
            exit={{ x: "100%", y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[1001] w-full max-w-xl bg-[#030814] border-l border-white/5 flex flex-col shadow-2xl h-screen max-h-screen md:h-auto md:max-h-[90vh] md:m-4 md:rounded-[2rem] overflow-hidden sm:max-w-none md:max-w-2xl lg:max-w-2xl ml-auto"
            style={{ 
              // Custom responsive initial/exit for mobile vs desktop
              // Handling mobile slide-up via a media query check in CSS would be cleaner, 
              // but we can also do it here if we had access to window width
            }}
          >
            {/* Header */}
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-[#030814]/90 backdrop-blur-xl sticky top-0 z-20">
              <div className="flex items-center gap-4">
                 <button onClick={onClose} className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                 </button>
                 <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                       <h2 className="text-2xl font-black text-white italic tracking-tighter">{symbol}</h2>
                       <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 italic">
                          #{opportunity?.rank || '...'}
                       </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[200px]">{opportunity?.company || 'Loading Entity Intelligence...'}</span>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                  onClick={handleShare}
                  disabled={!opportunity}
                  className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30"
                 >
                    <Share2 size={18} />
                 </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
               {loading ? (
                  <div className="space-y-8 animate-pulse">
                     <div className="h-32 bg-white/5 rounded-3xl" />
                     <div className="h-48 bg-white/5 rounded-3xl" />
                     <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-white/5 rounded-3xl" />
                        <div className="h-24 bg-white/5 rounded-3xl" />
                     </div>
                  </div>
               ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                     <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-6">{error}</p>
                     <button 
                        onClick={fetchData}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all"
                     >
                        <RefreshCw size={14} /> Retry Sync
                     </button>
                  </div>
               ) : opportunity && (
                  <>
                     {/* Price Banner */}
                     <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Live Valuation</span>
                           <div className="text-3xl font-black text-white">{formatPrice(opportunity.price)}</div>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className={`flex items-center gap-1.5 font-black text-lg ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                              {formatPriceChange(opportunity.priceChangePercent)}
                           </div>
                           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sentinel Flux</span>
                        </div>
                     </div>

                     {/* Why Now */}
                     <section className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Zap size={16} className="text-amber-400" />
                           <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] italic">Strategic Catalyst</h3>
                        </div>
                        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-10">
                              <Zap size={48} className="text-amber-500" />
                           </div>
                           <p className="text-sm font-medium leading-relaxed text-amber-100/90 relative z-10 italic">
                             &quot;{opportunity.why_now}&quot;
                           </p>
                        </div>
                     </section>

                     {/* AI Analysis */}
                     <section className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Activity size={16} className="text-indigo-400" />
                           <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] italic">Full Agentic Reasoning</h3>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                           <p className="text-sm leading-relaxed text-slate-300">
                             {opportunity.explanation}
                           </p>
                        </div>
                     </section>

                     {/* Signal Strength & Confidence */}
                     <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                           <div className="flex items-center gap-2">
                              <Target size={14} className="text-indigo-400" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alpha Score</span>
                           </div>
                           <div className="space-y-3">
                              <div className="flex items-end justify-between">
                                 <div className="text-2xl font-black text-white italic underline underline-offset-4 decoration-indigo-500">{opportunity.score.toFixed(2)} <span className="text-xs text-slate-500 font-normal">/ 10</span></div>
                                 <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{opportunity.confidence} Confidence</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(opportunity.score / 10) * 100}%` }}
                                    className={`h-full ${formatConfidenceColor(opportunity.confidence).includes('emerald') ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : formatConfidenceColor(opportunity.confidence).includes('sky') ? 'bg-sky-500 shadow-[0_0_10px_#0ea5e9]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'}`}
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col justify-between">
                           <div className="flex items-center gap-2 mb-4">
                              <Clock size={14} className="text-indigo-400" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Horizon</span>
                           </div>
                           <div className="flex flex-col gap-2">
                              <span className="text-lg font-black text-white tracking-tight">{opportunity.horizon}</span>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-indigo-400 tracking-wider">
                                 <ShieldCheck size={10} /> Validated Strategy
                              </div>
                           </div>
                        </div>
                     </section>

                     {/* News */}
                     <section className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Newspaper size={16} className="text-indigo-400" />
                           <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] italic">Latest Evidence</h3>
                        </div>
                        <div className="space-y-3">
                           {opportunity.news && opportunity.news.length > 0 ? (
                              opportunity.news.map((item, i) => (
                                 <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                                    <p className="text-xs font-medium text-slate-400 leading-normal line-clamp-2">{item}</p>
                                 </div>
                              ))
                           ) : (
                              <div className="text-[10px] text-slate-600 uppercase font-black tracking-widest text-center py-8">No specific signals detected in stream.</div>
                           )}
                        </div>
                     </section>

                     {/* Risk Assessment */}
                     <section className="space-y-4 pb-12">
                        <div className="flex items-center gap-2">
                           <ShieldCheck size={16} className="text-indigo-400" />
                           <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] italic">Risk Assessment</h3>
                        </div>
                        <div className={`p-6 rounded-3xl border flex items-start gap-4 ${
                           riskFlag?.type === 'danger' ? 'bg-rose-500/5 border-rose-500/20' : 
                           riskFlag?.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 
                           'bg-emerald-500/5 border-emerald-500/20'
                        }`}>
                           <div className={`mt-0.5 ${
                              riskFlag?.type === 'danger' ? 'text-rose-500' : 
                              riskFlag?.type === 'warning' ? 'text-amber-500' : 
                              'text-emerald-500'
                           }`}>
                              {riskFlag?.type === 'safe' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                           </div>
                           <p className={`text-xs font-bold uppercase tracking-widest ${
                              riskFlag?.type === 'danger' ? 'text-rose-400' : 
                              riskFlag?.type === 'warning' ? 'text-amber-400' : 
                              'text-emerald-400'
                           }`}>
                              {riskFlag?.message}
                           </p>
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
