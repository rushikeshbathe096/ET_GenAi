"use client";

import { useEffect, useState, useMemo } from "react";
import SignalCard from "../../components/SignalCard";
import StockDetailDrawer from "../../components/StockDetailDrawer";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getSignals } from "../../utils/api";
import { Signal } from "../../data/mockSignals";
import { Search, SlidersHorizontal, ListFilter, Activity, ShieldCheck, AlertCircle } from "lucide-react";

export default function SignalRadarPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSector, setFilterSector] = useState("All");
  const [filterConfidence, setFilterConfidence] = useState("All");
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getSignals();
        setSignals(data);
      } catch (err) {
        setError("Failed to synchronize Sentinel stream.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const sectors = useMemo(() => ["All", ...new Set(signals.map(s => s.sector))], [signals]);
  const confidences = ["All", "HIGH", "MEDIUM", "LOW"];

  const filteredAndSortedSignals = useMemo(() => {
    let result = signals.filter((signal) => {
      const matchesSearch = 
        signal.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signal.company.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSector = filterSector === "All" || signal.sector === filterSector;
      const matchesConfidence = filterConfidence === "All" || signal.confidence === filterConfidence;

      return matchesSearch && matchesSector && matchesConfidence;
    });

    if (sortBy === "score") {
      result.sort((a, b) => b.score - a.score);
    } else if (sortBy === "priceChange") {
      result.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
    }

    return result;
  }, [signals, searchQuery, filterSector, filterConfidence, sortBy]);

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
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter italic">Kinetic Sentinel</h2>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">Full Sector Data Stream</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by Symbol or Company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#0c1532]/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-[#0c1532]/50 border border-white/10 px-4 py-2.5 rounded-2xl">
              <ListFilter size={16} className="text-indigo-400" />
              <select 
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-300 focus:outline-none cursor-pointer uppercase tracking-widest"
              >
                {sectors.map(s => <option key={s} value={s} className="bg-[#030814]">{s}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#0c1532]/50 border border-white/10 px-4 py-2.5 rounded-2xl">
              <ShieldCheck size={16} className="text-cyan-400" />
              <select 
                value={filterConfidence}
                onChange={(e) => setFilterConfidence(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-300 focus:outline-none cursor-pointer uppercase tracking-widest"
              >
                {confidences.map(c => <option key={c} value={c} className="bg-[#030814]">{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#0c1532]/50 border border-white/10 px-4 py-2.5 rounded-2xl">
              <SlidersHorizontal size={16} className="text-indigo-300" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-300 focus:outline-none cursor-pointer uppercase tracking-widest"
              >
                <option value="score" className="bg-[#030814]">Sort: Confluence Score</option>
                <option value="priceChange" className="bg-[#030814]">Sort: Price Change</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedSignals.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em]">No signals match criteria</p>
            </div>
          ) : (
            filteredAndSortedSignals.map((signal) => (
              <div key={signal.symbol} onClick={() => setSelectedSignal(signal)}>
                <SignalCard signal={signal} />
              </div>
            ))
          )}
        </div>
      </section>

      <StockDetailDrawer 
        signal={selectedSignal} 
        isOpen={!!selectedSignal} 
        onClose={() => setSelectedSignal(null)} 
      />
    </div>
  );
}
