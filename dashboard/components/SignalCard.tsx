"use client";

import { useState } from "react";
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
  Share2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Signal } from "../data/mockSignals";
import StockDetailModal from "./StockDetailModal";
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
  const [showNews, setShowNews] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const isPositive = (signal?.priceChangePercent ?? 0) >= 0;
  const whyNow = signal?.why_now || signal?.explanation || "Strategic timing identified.";
  const horizon = formatHorizon(signal?.horizon);
  const newsItems = Array.isArray(signal?.news) ? signal.news.slice(0, 3) : [];
  const confidenceColor = formatConfidenceColor(signal?.confidence);
  const rank = signal?.rank;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open if clicking the share button specifically
    if ((e.target as HTMLElement).closest('.share-btn')) return;
    setModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="group cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative rounded-2xl border border-indigo-500/20 bg-[#071127]/80 backdrop-blur-xl p-6 transition-all duration-300 group-hover:border-indigo-400/40 group-hover:shadow-[0_12px_24px_-10px_rgba(99,102,241,0.25)] overflow-hidden">
          {/* Rank Badge */}
          {rank && (
            <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[10px] font-black px-2 py-1 rounded-br-lg z-10">
              #{rank}
            </div>
          )}

          {/* Share Button (Top Right) */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
            className="share-btn absolute top-3 right-3 p-2 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-indigo-400 hover:bg-white/10 transition-all z-20 group/share"
          >
            <Share2 size={16} className="group-hover/share:scale-110 transition-transform" />
          </button>

          {/* Glow effect */}
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-500" />
          
          <div className="block relative">
            <div className="flex items-start justify-between mb-5 pr-8">
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-black text-white tracking-tight italic underline decoration-indigo-500/30 underline-offset-4">{signal.symbol}</h3>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {formatPriceChange(signal.priceChangePercent)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-1 font-medium">{signal.company}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:border-rose-500/40'}`}>
                {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              </div>
            </div>

            <div className="flex items-center gap-6 mb-5">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1 font-black">Price</span>
                <span className="text-sm font-black text-white">{formatPrice(signal.price)}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1 font-black">Horizon</span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 italic">
                  <Clock size={12} className="text-indigo-400" />
                  {horizon}
                </div>
              </div>
            </div>

            {/* Explanation Section */}
            <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/5 group-hover:bg-indigo-500/[0.03] transition-colors duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 italic underline decoration-amber-500/30 underline-offset-2">Why Now</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                {whyNow}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 pb-4 border-b border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1 font-black">Confluence</span>
                <div className="flex items-center gap-1.5 font-black text-indigo-300 uppercase italic">
                  <Activity size={14} className="text-indigo-400" />
                  {normalizeScore(signal.score)}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1 font-black">Confidence</span>
                <div className={`flex items-center gap-1.5 font-black uppercase italic ${confidenceColor}`}>
                  <ShieldCheck size={14} />
                  {signal.confidence}
                </div>
              </div>
            </div>

            {/* News Section */}
            {newsItems.length > 0 && (
              <div className="pt-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNews(!showNews);
                  }}
                  className="flex items-center justify-between w-full text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Newspaper size={12} />
                    Latest Insights
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
                        <li key={idx} className="text-[10px] text-slate-400 leading-snug flex items-start gap-2 font-medium">
                          <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Per-card Modal Instance - Only passes symbol, isOpen, onClose */}
      <StockDetailModal 
        symbol={signal.symbol} 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </>
  );
}
