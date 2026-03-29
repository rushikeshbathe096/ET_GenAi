"use client";

import { useEffect, useState, useMemo } from "react";
import SignalCard from "../../../components/SignalCard";
import SignalCardSkeleton from "../../../components/SignalCardSkeleton";
import StockDetailModal from "../../../components/StockDetailModal";
import { getDashboardData } from "../../../utils/api";
import { Signal } from "../../../data/mockSignals";
import { normalizeScore } from "../../../utils/signalUtils";

import { 
  Search, 
  SlidersHorizontal, 
  ListFilter, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
  TrendingUp,
  Clock,
  BarChart4
} from "lucide-react";
import { useAlerts } from "../../../context/AlertContext";


export default function SignalRadarPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSector, setFilterSector] = useState("All");
  const [filterConfidence, setFilterConfidence] = useState("All");
  const [filterScore, setFilterScore] = useState("0");
  const [sortBy, setSortBy] = useState("score");
  const [viewType, setViewType] = useState<"grid" | "table">("grid"); 
  
  const { generateAlertsFromSignals } = useAlerts();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { signals: data, generatedAt } = await getDashboardData();
      setSignals(data);
      setLastUpdated(generatedAt);
      generateAlertsFromSignals(data);
    } catch (err) {
      console.error("Signal Radar Error:", err);
      setError("Failed to synchronize Sentinel stream.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sectors = useMemo(() => ["All", ...new Set(signals.map(s => s.sector))].sort(), [signals]);
  const confidences = ["All", "HIGH", "MEDIUM", "LOW"];
  
  const filteredAndSortedSignals = useMemo(() => {
    let result = signals.filter((signal) => {
      const matchesSearch = 
        signal.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signal.company.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSector = filterSector === "All" || signal.sector === filterSector;
      const matchesConfidence = filterConfidence === "All" || signal.confidence === filterConfidence;
      const matchesScore = signal.score >= Number(filterScore);

      return matchesSearch && matchesSector && matchesConfidence && matchesScore;
    });

    if (sortBy === "score") {
      result.sort((a, b) => b.score - a.score);
    } else if (sortBy === "priceChange") {
      result.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
    }

    return result;
  }, [signals, searchQuery, filterSector, filterConfidence, filterScore, sortBy]);

  const handleEntityClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    setModalOpen(true);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-6" />
        <h2 className="text-xl font-black text-rose-300 uppercase tracking-widest italic">{error}</h2>
        <button 
          onClick={fetchData}
          className="mt-8 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
       {/* Animated Header */}
       <div className="relative p-12 rounded-[2.5rem] bg-[#071127]/80 border border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] -mr-48 -mt-48" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                   <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase underline decoration-4 underline-offset-8 decoration-indigo-500">Signal Radar</h1>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] max-w-lg">
                  Multi-agent confluence scoring environment tracking high-probability setups in Indian markets.
                </p>
                {lastUpdated && (
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pt-2">
                        <Clock size={12} />
                        Stream Sync: {new Date(lastUpdated).toLocaleTimeString()}
                    </div>
                )}
             </div>

             <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Universe</div>
                   <div className="text-2xl font-black text-white">{loading ? '...' : signals.length}</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Radar Stream</div>
                    <div className="text-sm font-black text-emerald-400 uppercase tracking-tighter flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Live
                    </div>
                </div>
             </div>
          </div>
       </div>

       {/* Toolbar */}
       <div className="sticky top-24 z-40 p-4 rounded-3xl bg-[#030814]/80 border border-white/5 backdrop-blur-2xl shadow-2xl space-y-4">
          <div className="flex flex-col xl:flex-row gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="SEARCH ALPHA SOURCE (TICKER OR ENTITY)..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
             <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                   <ListFilter size={14} className="text-indigo-400" />
                   <select 
                      value={filterSector}
                      onChange={(e) => setFilterSector(e.target.value)}
                      className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none hover:text-white cursor-pointer"
                   >
                     {sectors.map(s => <option key={s} value={s} className="bg-[#071127]">{s}</option>)}
                   </select>
                </div>
                <div className="flex items-center gap-3">
                   <ShieldCheck size={14} className="text-indigo-400" />
                   <select 
                      value={filterConfidence}
                      onChange={(e) => setFilterConfidence(e.target.value)}
                      className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none hover:text-white cursor-pointer"
                   >
                     {confidences.map(c => <option key={c} value={c} className="bg-[#071127]">{c}</option>)}
                   </select>
                </div>
                <div className="flex items-center gap-3">
                   <TrendingUp size={14} className="text-indigo-400" />
                   <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none hover:text-white cursor-pointer"
                   >
                     <option value="score" className="bg-[#071127]">SORT BY SCORE</option>
                     <option value="priceChange" className="bg-[#071127]">SORT BY PERFORMANCE</option>
                   </select>
                </div>
             </div>

             <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
                <button 
                  onClick={() => setViewType("grid")}
                  className={`p-2 rounded-lg transition-all ${viewType === "grid" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                >
                   <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setViewType("table")}
                  className={`p-2 rounded-lg transition-all ${viewType === "table" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                >
                   <ListIcon size={16} />
                </button>
             </div>
          </div>
       </div>

       {/* Results Grid / Table */}
       {viewType === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {loading ? (
                [...Array(8)].map((_, i) => <SignalCardSkeleton key={i} />)
             ) : (
                filteredAndSortedSignals.map((signal) => (
                   <SignalCard key={signal.symbol} signal={signal} />
                ))
             )}
          </div>
       ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-[#071127]/50 backdrop-blur-xl">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Node</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Momentum</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Score</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Confidence</th>
                   </tr>
                </thead>
                <tbody>
                   {loading ? (
                       [...Array(6)].map((_, i) => (
                           <tr key={i} className="animate-pulse">
                               <td className="px-8 py-6"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                               <td className="px-8 py-6"><div className="h-4 w-16 bg-white/5 rounded ml-auto" /></td>
                               <td className="px-8 py-6"><div className="h-4 w-12 bg-white/5 rounded ml-auto" /></td>
                               <td className="px-8 py-6"><div className="h-4 w-20 bg-white/5 rounded ml-auto" /></td>
                           </tr>
                       ))
                   ) : filteredAndSortedSignals.map((signal) => (
                      <tr 
                        key={signal.symbol} 
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                        onClick={() => handleEntityClick(signal.symbol)}
                      >
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                               <span className="text-sm font-black text-white italic underline decoration-indigo-500/30 underline-offset-4">{signal.symbol}</span>
                               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{signal.sector}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <span className={`text-xs font-black italic ${signal.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                               {signal.priceChangePercent >= 0 ? '+' : ''}{signal.priceChangePercent}%
                            </span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <span className="text-sm font-black text-indigo-300 italic">{signal.score.toFixed(1)}</span>
                         </td>
                         <td className="px-8 py-6 text-right">
                             <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full italic ${signal.confidence === 'HIGH' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : signal.confidence === 'MEDIUM' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                {signal.confidence}
                             </span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       )}

       {filteredAndSortedSignals.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
             <BarChart4 size={48} className="text-slate-500 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No signals detected in this range.</p>
          </div>
       )}

       <StockDetailModal 
         symbol={selectedSymbol} 
         isOpen={modalOpen} 
         onClose={() => setModalOpen(false)} 
       />
    </div>
  );
}
