"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Activity, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Newspaper, 
  Zap,
  Target,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Signal } from "../data/mockSignals";
import { 
  formatPrice, 
  formatPriceChange, 
  formatHorizon, 
  formatConfidenceColor 
} from "../utils/formatUtils";
import { normalizeScore } from "../utils/signalUtils";

interface SignalCardProps {
  signal: Signal;
}

export default function SignalCard({ signal }: SignalCardProps) {
  const router = useRouter();
  const [showNews, setShowNews] = useState(false);
  
  const isPositive = (signal?.priceChangePercent ?? 0) >= 0;
  const rationale = signal.why_now || signal.explanation || "";
  const truncated = rationale.length > 100 
    ? rationale.slice(0, 100) + "..." 
    : rationale;
  const horizon = formatHorizon(signal?.horizon);
  const newsItems = Array.isArray(signal?.news) ? signal.news.slice(0, 3) : [];
  const confidenceColor = formatConfidenceColor(signal?.confidence);
  const rank = signal?.rank;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.action-btn')) return;
    router.push(`/stock/${signal.symbol}`);
  };

  const getSentiment = (decision: string) => {
    const d = decision?.toString().toUpperCase();
    if (d === "BUY" || d === "STRONG_BUY") return "BULLISH";
    if (d === "SELL" || d === "STRONG_SELL") return "BEARISH";
    return "SIDEWAYS";
  };

  // Safe fallback for UI rendering
  const currentDecision = signal.decision || "HOLD";
  const sentimentColor =
    currentDecision.includes("BUY") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
    currentDecision.includes("SELL") ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
    "bg-amber-500/10 text-amber-400 border-amber-500/20";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className="group cursor-pointer perspective-1000"
        onClick={handleCardClick}
      >
        <div className="relative rounded-[2rem] border border-white/5 bg-[#050b18] p-6 transition-all duration-500 group-hover:bg-[#071127] group-hover:border-indigo-500/30 group-hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] overflow-hidden">
          {/* Animated Scanning Beam */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-[2s] pointer-events-none" />
          
          {/* Rank Ribbon */}
          {rank && (
            <div className="absolute top-0 right-10 w-8 h-10 bg-indigo-600 flex items-center justify-center text-[10px] font-black italic rounded-b-lg shadow-lg">
              #{rank}
            </div>
          )}

          {/* Action Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/stock/${signal.symbol}`);
            }}
            className="action-btn absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-indigo-600 transition-all z-20"
          >
            <Maximize2 size={14} />
          </button>

          <header className="flex items-start justify-between mb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{signal.symbol}</h3>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {formatPriceChange(signal.priceChangePercent)}
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${sentimentColor}`}>
                  {getSentiment(signal.decision || "HOLD")}
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic truncate max-w-[180px]">{signal.company}</span>
            </div>
            <motion.div 
              animate={{ rotate: isPositive ? 0 : 180 }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${isPositive ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-400/40' : 'bg-rose-500/5 border-rose-500/20 text-rose-400 group-hover:bg-rose-500/10 group-hover:border-rose-400/40'}`}
            >
              {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </motion.div>
          </header>

          <div className="grid grid-cols-2 gap-4 mb-4">
             <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.25em] mb-1">Execution Price</span>
                <span className="text-lg font-black text-white italic">{formatPrice(signal.price)}</span>
             </div>
             <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.25em] mb-1">Strategic Horizon</span>
                <div className="flex items-center gap-2 text-indigo-400 font-black italic">
                   <Clock size={12} />
                   <span className="text-xs uppercase">{horizon}</span>
                </div>
             </div>
          </div>

          <div className="mb-6 p-4 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 relative group-hover:border-indigo-500/30 transition-all">
             <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-indigo-400 fill-current" />
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] font-mono">ALPHA RATIONALE</span>
             </div>
             <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                {truncated}
             </p>
          </div>

          <footer className="pt-4 border-t border-white/5 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Alpha Confluence</span>
                   <div className="flex items-center gap-2 text-white font-black italic">
                      <Target size={14} className="text-indigo-400" />
                      <span className="text-sm">{Number(signal.score || 0).toFixed(1)}</span>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Conf.</span>
                   <div className={`flex items-center gap-2 font-black italic uppercase ${confidenceColor}`}>
                      <ShieldCheck size={14} />
                      <span className="text-sm">{signal.confidence}</span>
                   </div>
                </div>
             </div>

             {newsItems.length > 0 && (
               <div className="pt-2">
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setShowNews(!showNews);
                   }}
                   className="flex items-center justify-between w-full text-[8px] font-black uppercase text-slate-500 hover:text-indigo-400 transition-colors tracking-widest"
                 >
                   <div className="flex items-center gap-2">
                     <Newspaper size={12} />
                     Telemetry Insights
                   </div>
                   {showNews ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                 </button>
                 
                 <AnimatePresence>
                   {showNews && (
                     <motion.ul
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="mt-3 space-y-2 overflow-hidden"
                     >
                       {newsItems.map((item, idx) => (
                         <li key={idx} className="text-[10px] text-slate-400 leading-snug flex items-start gap-3 font-medium px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                           <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_5px_rgba(79,70,229,0.8)]" />
                           {item.title}
                         </li>
                       ))}
                     </motion.ul>
                   )}
                 </AnimatePresence>
               </div>
             )}
          </footer>
        </div>
      </motion.div>

    </>
  );
}
