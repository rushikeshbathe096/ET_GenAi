"use client";

import { useState, useEffect } from "react";
import SignalCard from "../../components/SignalCard";
import StockDetailDrawer from "../../components/StockDetailDrawer";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getWatchlist, addTicker, removeTicker, getSignals } from "../../utils/api";
import { Signal } from "../../data/mockSignals";
import { Search, Plus, Trash2, LayoutList, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newTicker, setNewTicker] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  async function fetchWatchlistData() {
    try {
      const symbols = await getWatchlist();
      const allSignals = await getSignals();
      setWatchlist(symbols);
      setSignals(allSignals);
    } catch (err) {
      setError("Failed to fetch terminal data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWatchlistData();
  }, []);

  const handleAdd = async () => {
    const symbol = newTicker.trim().toUpperCase();
    if (!symbol) return;
    try {
      if (watchlist.includes(symbol)) {
        toast.error("Symbol already monitored.");
        return;
      }
      await addTicker(symbol);
      setWatchlist(prev => [...prev, symbol]);
      setNewTicker("");
      toast.success(`${symbol} linked to Mission Control.`);
    } catch (err) {
      toast.error("Failed to link node.");
    }
  };

  const handleRemove = async (symbol: string) => {
    try {
      await removeTicker(symbol);
      setWatchlist(prev => prev.filter(s => s !== symbol));
      toast.success(`${symbol} delinked.`);
    } catch (err) {
      toast.error("De-linkage failed.");
    }
  };

  const watchlistSignals = signals.filter((signal) => watchlist.includes(signal.symbol));
  
  const filteredSignals = watchlistSignals.filter((signal) => 
    signal.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    signal.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-6" />
        <h2 className="text-xl font-black text-rose-300 uppercase tracking-widest italic">{error}</h2>
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
      <header className="flex flex-col gap-6 pb-8 border-b border-indigo-500/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter italic">Mission Control</h2>
            <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold font-sans">Strategic Target Monitoring</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter Ticker (e.g., RELIANCE)"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="pl-4 pr-12 py-3 rounded-2xl bg-[#0c1532]/50 border border-white/10 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-64 uppercase tracking-widest"
              />
              <button 
                onClick={handleAdd}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition-all shadow-[0_4px_10px_-4px_rgba(99,102,241,0.5)]"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search Watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-sans"
          />
        </div>
      </header>

      <section className="relative">
        {watchlist.length === 0 ? (
          <div className="p-32 border border-dashed border-indigo-500/20 rounded-[3rem] text-center bg-[#071127]/50 backdrop-blur-xl group hover:border-indigo-500/40 transition-all duration-300">
            <LayoutList className="w-16 h-16 text-indigo-500/20 mx-auto mb-6 transition-all duration-500 group-hover:scale-110 group-hover:text-indigo-400/40" />
            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] mb-2">No Active Targets</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Add tickers above to initialize surveillance stream</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSignals.map((signal) => (
              <div key={signal.symbol} className="relative group">
                <div onClick={() => setSelectedSignal(signal)}>
                  <SignalCard signal={signal} />
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(signal.symbol);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-200 border border-rose-500/20 hover:bg-rose-500 hover:text-white z-10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {/* Show local entries that don't have detail signals yet */}
            {watchlist
              .filter(symbol => !signals.some(s => s.symbol === symbol))
              .map(symbol => (
                <div key={symbol} className="relative rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 flex flex-col justify-center animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-black text-slate-400 italic">{symbol}</span>
                    <button 
                      onClick={() => handleRemove(symbol)}
                      className="p-2 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-white/5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Syncing Terminal Node...</p>
                </div>
              ))}
          </div>
        )}
      </section>

      <StockDetailDrawer 
        signal={selectedSignal} 
        isOpen={!!selectedSignal} 
        onClose={() => setSelectedSignal(null)} 
      />
    </div>
  );
}
