"use client";

import { useState, useEffect } from "react";
import SignalCard from "../../../components/SignalCard";
import StockDetailModal from "../../../components/StockDetailModal";
import { getWatchlist, addTicker, removeTicker, getSignals } from "../../../utils/api";
import { Signal } from "../data/mockSignals";
import { Search, Plus, Trash2, LayoutList, AlertCircle, Crosshair, Radio, ShieldCheck, Zap, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAlerts } from "../../../context/AlertContext";
import { motion, AnimatePresence } from "framer-motion";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const [newTicker, setNewTicker] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const { addAlert } = useAlerts();

  async function fetchWatchlistData(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      const [symbols, allSignals] = await Promise.all([
        getWatchlist(),
        getSignals()
      ]);
      setWatchlist(symbols);
      setSignals(allSignals);
    } catch (err) {
      setError("CRITICAL: MISSION CONTROL OFFLINE");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWatchlistData();
  }, []);

  const handleAdd = async () => {
    const symbol = newTicker.trim().toUpperCase();
    if (!symbol || isActionLoading) return;
    
    if (watchlist.includes(symbol)) {
      toast.error("NODE ALREADY TRACKED");
      return;
    }

    try {
      setIsActionLoading(true);
      const toastId = toast.loading(`UPLINKING ${symbol}...`);
      
      await addTicker(symbol);
      await fetchWatchlistData(false);
      
      addAlert({
        symbol,
        type: "WATCHLIST",
        message: `Strategic node ${symbol} locked for surveillance.`
      });
      
      setNewTicker("");
      toast.success(`${symbol} UPLINK ESTABLISHED`, { id: toastId });
    } catch (err) {
      toast.error("UPLINK FAILED");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemove = async (symbol: string) => {
    if (isActionLoading) return;
    
    try {
      setIsActionLoading(true);
      const toastId = toast.loading(`TERMINATING LINK: ${symbol}...`);
      
      await removeTicker(symbol);
      await fetchWatchlistData(false);
      
      toast.success(`${symbol} DE-LINKED`, { id: toastId });
    } catch (err) {
      toast.error("DE-LINKAGE ERROR");
    } finally {
      setIsActionLoading(false);
    }
  };

  const watchlistSignals = signals.filter((signal) => watchlist.includes(signal.symbol));
  
  const filteredSignals = watchlistSignals.filter((signal) => 
    signal.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    signal.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
     return (
        <div className="space-y-12 animate-pulse pt-4">
           <div className="h-48 bg-white/5 rounded-[3.5rem]" />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                 <div key={i} className="h-64 bg-white/5 rounded-[2.5rem]" />
              ))}
           </div>
        </div>
     );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center animate-pulse">
           <AlertCircle className="w-12 h-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase italic">{error}</h2>
        <button 
          onClick={() => fetchWatchlistData()}
          className="px-12 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/10 transition-all shadow-2xl"
        >
          RE-INITIALIZE TERMINAL
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32 pt-4">
      {/* High-Fidelity Tactical Header */}
      <header className="relative p-12 rounded-[3.5rem] bg-[#050b18] border border-white/5 overflow-hidden group">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] -mr-40 -mt-40 opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />
         
         <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="p-4 rounded-3xl bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                     <Crosshair className="w-6 h-6 text-white" />
                  </div>
                  <div>
                     <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Mission Control</h1>
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2 block italic">Strategic Target Monitoring Hub</span>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="px-5 py-2 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{watchlist.length} NODES TRACKED</span>
                  </div>
                  <div className="px-5 py-2 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                     <ShieldCheck size={12} className="text-indigo-400" />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">SECURITY PROTOCOL: MAX</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-auto">
               <div className="relative group/input">
                  <input 
                    type="text" 
                    placeholder="ENTER NODE SYMBOL (E.G. RELIANCE)..."
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="w-full lg:w-80 bg-white/[0.02] border border-white/5 rounded-[2rem] pl-8 pr-16 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:bg-white/[0.05] focus:border-indigo-500/30 transition-all placeholder:text-slate-700 italic"
                  />
                  <button 
                    onClick={handleAdd}
                    disabled={isActionLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={20} />}
                  </button>
               </div>
               
               <div className="relative">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                 <input 
                   type="text" 
                   placeholder="SEARCH ACTIVE TARGETS..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] pl-16 pr-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:bg-white/[0.05] focus:border-indigo-500/30 transition-all placeholder:text-slate-700 italic"
                 />
               </div>
            </div>
         </div>
      </header>

      <section className="relative">
        <AnimatePresence mode="popLayout">
          {watchlist.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="p-32 border border-dashed border-white/5 rounded-[3.5rem] text-center bg-[#050b18]/50 backdrop-blur-xl group hover:border-indigo-500/20 transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
              <LayoutList className="w-20 h-20 text-indigo-500/10 mx-auto mb-8 transition-all duration-1000 group-hover:scale-110 group-hover:rotate-12 group-hover:text-indigo-500/30" />
              <h3 className="text-2xl font-black text-slate-700 uppercase tracking-[0.3em] mb-3 italic">No Active Surveillance</h3>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic max-w-sm mx-auto leading-loose">
                 ACQUIRE STRATEGIC TARGETS THROUGH THE NODE UPLINK ABOVE TO INITIALIZE TRACKING STREAM.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredSignals.map((signal) => (
                <motion.div 
                   layout
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   key={signal.symbol} 
                   className="relative group h-full"
                >
                  <div 
                    onClick={() => {
                       setSelectedSymbol(signal.symbol);
                       setModalOpen(true);
                    }}
                    className="h-full"
                  >
                    <SignalCard signal={signal} />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(signal.symbol);
                    }}
                    disabled={isActionLoading}
                    className="absolute top-6 right-6 p-3 rounded-2xl bg-[#030814] text-rose-500 opacity-0 group-hover:opacity-100 transition-all border border-rose-500/20 hover:bg-rose-500 hover:text-white z-20 disabled:cursor-not-allowed shadow-xl hover:-translate-y-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
              
              {/* Display Un-synced Tickers */}
              {watchlist
                .filter(symbol => !signals.some(s => s.symbol === symbol))
                .map(symbol => (
                  <motion.div 
                    layout
                    key={symbol} 
                    className="relative rounded-[2.5rem] border border-dashed border-white/5 bg-[#050b18] p-10 flex flex-col items-center justify-center space-y-4 group overflow-hidden"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center relative">
                       <Radio size={24} className="text-slate-600 animate-pulse" />
                       <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
                    </div>
                    <div className="text-center">
                       <span className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{symbol}</span>
                       <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mt-4 flex items-center justify-center gap-2">
                          <Loader2 size={10} className="animate-spin" /> Synchronizing...
                       </p>
                    </div>
                    <button 
                      onClick={() => handleRemove(symbol)}
                      disabled={isActionLoading}
                      className="p-3 rounded-2xl bg-white/5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
            </div>
          )}
        </AnimatePresence>
      </section>

      <StockDetailModal 
        symbol={selectedSymbol} 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
}
