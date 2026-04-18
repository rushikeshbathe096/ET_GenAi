"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import SignalCard from "../../../components/SignalCard";
import SignalCardSkeleton from "../../../components/SignalCardSkeleton";
import { getDashboardData, getStock, Signal } from "../../../utils/api";
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
   BarChart4,
   Cpu,
   Zap,
   Radio,
   Target
} from "lucide-react";
import { useAlerts } from "../../../context/AlertContext";
import { motion, AnimatePresence } from "framer-motion";

export default function SignalRadarPage() {
   const [signals, setSignals] = useState<Signal[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [lastUpdated, setLastUpdated] = useState<string | null>(null);
   const router = useRouter();

   const [searchQuery, setSearchQuery] = useState("");
   const [filterSector, setFilterSector] = useState("All");
   const [filterConfidence, setFilterConfidence] = useState("All");
   const [filterScore, setFilterScore] = useState("0");
   const [sortBy, setSortBy] = useState("score");
   const [viewType, setViewType] = useState<"grid" | "table">("grid");

   const [searchSymbolValue, setSearchSymbolValue] = useState("");
   const [searchedSignal, setSearchedSignal] = useState<Signal | null>(null);
   const [searchError, setSearchError] = useState(false);
   const [isSearching, setIsSearching] = useState(false);

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
         setError("COMMUNICATION FAULT: SENTINEL STREAM REJECTED");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchData();
   }, []);

   const handleApiSearch = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!searchSymbolValue.trim()) return;

      setIsSearching(true);
      setSearchError(false);
      try {
         const result = await getStock(searchSymbolValue);
         if (result) {
            router.push(`/stock/${result.symbol}`);
         } else {
            setSearchError(true);
         }
      } catch (error) {
         setSearchedSignal(null);
         setSearchError(true);
      } finally {
         setIsSearching(false);
      }
   };

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
      router.push(`/stock/${symbol}`);
   };

   if (error) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center animate-pulse">
               <AlertCircle className="w-12 h-12 text-rose-500" />
            </div>
            <div className="text-center">
               <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase italic mb-2">{error}</h2>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verify network uplink or contact node administrator</p>
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

   return (
      <div className="space-y-12 pb-32 pt-4">
         {/* High-Fidelity Tactical Header */}
         <div className="relative p-12 rounded-[3.5rem] bg-[#050b18] border border-white/5 overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] -mr-40 -mt-40 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -ml-20 -mb-20" />

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="p-4 rounded-3xl bg-indigo-600 shadow-[0_0_25px_rgba(79,70,229,0.5)] group-hover:scale-105 transition-transform">
                        <Cpu className="w-8 h-8 text-white" />
                     </div>
                     <div>
                        <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Signal Matrix</h1>
                        <div className="flex items-center gap-2 mt-2">
                           <Radio size={14} className="text-emerald-400 animate-pulse" />
                           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Institutional Feed Active</span>
                        </div>
                     </div>
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[11px] max-w-xl italic leading-loose opacity-80">
                     Global autonomous scanning grid targeting alpha-rich setups. Processing <span className="text-white">multi-agent confluence</span> across 5,000+ data nodes per cycle.
                  </p>
                  {lastUpdated && (
                     <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
                        <Clock size={12} className="text-indigo-400" />
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">Stream Ingest: <span className="text-indigo-300 italic">{new Date(lastUpdated).toLocaleTimeString()}</span></span>
                     </div>
                  )}
               </div>

               <div className="flex flex-wrap gap-6 items-center">
                  <div className="flex flex-col gap-2">
                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Network Load</span>
                     <div className="flex items-end gap-1 h-12">
                        {[4, 7, 5, 9, 3, 6, 8, 4].map((h, i) => (
                           <motion.div
                              key={i}
                              animate={{ height: [`${h * 10}%`, `${(h + 2) * 10}%`, `${h * 10}%`] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                              className="w-1.5 bg-indigo-500/20 rounded-t-sm"
                           />
                        ))}
                     </div>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl min-w-[180px]">
                     <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-3 italic">Alpha Nodes Found</div>
                     <div className="text-5xl font-black text-white italic tracking-tighter">{loading ? '...' : signals.length}</div>
                  </div>
               </div>
            </div>
         </div>

         {/* Matrix Toolbar */}
         <div className="sticky top-24 z-40 p-2 rounded-[2.5rem] bg-[#030814]/90 border border-white/5 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row gap-2">
            <div className="relative flex-1 group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
               <input
                  type="text"
                  placeholder="ACCESS ALPHA SOURCE (SYMBOL / ENTITY)..."
                  className="w-full bg-white/[0.02] border border-transparent rounded-[2rem] pl-16 pr-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:bg-indigo-500/5 focus:border-indigo-500/20 transition-all placeholder:text-slate-700 italic"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>

            <div className="flex flex-wrap items-center gap-4 px-6 py-2 bg-white/[0.02] rounded-[2rem] border border-white/5">
               <div className="flex items-center gap-3 group">
                  <Target size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  <select
                     value={filterSector}
                     onChange={(e) => setFilterSector(e.target.value)}
                     className="bg-transparent text-[9px] font-black uppercase tracking-widest text-slate-500 outline-none hover:text-white cursor-pointer transition-colors"
                  >
                     {sectors.map(s => <option key={s} value={s} className="bg-[#071127]">{s}</option>)}
                  </select>
               </div>
               <div className="w-px h-6 bg-white/5" />
               <div className="flex items-center gap-3 group">
                  <ShieldCheck size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  <select
                     value={filterConfidence}
                     onChange={(e) => setFilterConfidence(e.target.value)}
                     className="bg-transparent text-[9px] font-black uppercase tracking-widest text-slate-500 outline-none hover:text-white cursor-pointer transition-colors"
                  >
                     {confidences.map(c => <option key={c} value={c} className="bg-[#071127]">{c}</option>)}
                  </select>
               </div>
               <div className="w-px h-6 bg-white/5" />
               <div className="flex items-center gap-3 group">
                  <SlidersHorizontal size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  <select
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     className="bg-transparent text-[9px] font-black uppercase tracking-widest text-slate-500 outline-none hover:text-white cursor-pointer transition-colors"
                  >
                     <option value="score" className="bg-[#071127]">BY CONFLUENCE</option>
                     <option value="priceChange" className="bg-[#071127]">BY VELOCITY</option>
                  </select>
               </div>
            </div>

            <div className="flex items-center gap-1 p-2 bg-white/[0.02] rounded-[2rem] border border-white/5">
               <button
                  onClick={() => setViewType("grid")}
                  className={`p-4 rounded-full transition-all ${viewType === "grid" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-900/20" : "text-slate-600 hover:text-slate-300"}`}
               >
                  <LayoutGrid size={18} />
               </button>
               <button
                  onClick={() => setViewType("table")}
                  className={`p-4 rounded-full transition-all ${viewType === "table" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-900/20" : "text-slate-600 hover:text-slate-300"}`}
               >
                  <ListIcon size={18} />
               </button>
            </div>
         </div>

         {/* Direct API Search Input */}
         <div className="mb-8">
            <form onSubmit={handleApiSearch} className="flex flex-col gap-2">
               <div className="relative flex items-center group">
                  <Search className="absolute left-6 text-slate-600 group-focus-within:text-indigo-400 w-5 h-5 transition-colors" />
                  <input
                     type="text"
                     placeholder="Search NSE symbol e.g. TITAN"
                     className="w-full bg-[#050b18] border border-white/10 rounded-[2rem] pl-16 pr-32 py-5 text-sm font-black uppercase tracking-widest text-white focus:outline-none focus:border-indigo-500/50 shadow-inner transition-all"
                     value={searchSymbolValue}
                     onChange={(e) => setSearchSymbolValue(e.target.value.toUpperCase())}
                     onKeyDown={(e) => {
                        if (e.key === "Escape") {
                           setSearchSymbolValue('');
                           setSearchedSignal(null);
                           setSearchError(false);
                        }
                     }}
                  />
                  <button
                     type="submit"
                     disabled={isSearching || !searchSymbolValue.trim()}
                     className="absolute right-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50"
                  >
                     {isSearching ? "..." : "Search"}
                  </button>
               </div>
               {searchError && (
                  <span className="text-rose-500 text-xs font-bold ml-6 mt-1 uppercase tracking-widest">Stock not found</span>
               )}
            </form>

            {searchedSignal && (
               <div className="mt-8 p-1 rounded-[2.1rem] bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
                  <div className="bg-[#030814] rounded-[2rem] h-full w-full">
                     <SignalCard signal={searchedSignal} />
                  </div>
               </div>
            )}
         </div>

         {/* Matrix Results */}
         <AnimatePresence mode="wait">
            {viewType === "grid" ? (
               <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
               >
                  {loading ? (
                     [...Array(8)].map((_, i) => <SignalCardSkeleton key={i} />)
                  ) : (
                     filteredAndSortedSignals.map((signal) => (
                        <SignalCard key={signal.symbol} signal={signal} />
                     ))
                  )}
               </motion.div>
            ) : (
               <motion.div
                  key="table"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="overflow-hidden rounded-[3rem] border border-white/5 bg-[#050b18] shadow-2xl"
               >
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01]">
                           <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Alpha Node ID</th>
                           <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic text-right">Momentum Vector</th>
                           <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic text-right">Confluence Score</th>
                           <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic text-right">Security Protocol</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {loading ? (
                           [...Array(6)].map((_, i) => (
                              <tr key={i} className="animate-pulse">
                                 <td className="px-10 py-8"><div className="h-4 w-40 bg-white/5 rounded-lg" /></td>
                                 <td className="px-10 py-8"><div className="h-4 w-20 bg-white/5 rounded-lg ml-auto" /></td>
                                 <td className="px-10 py-8"><div className="h-4 w-12 bg-white/5 rounded-lg ml-auto" /></td>
                                 <td className="px-10 py-8"><div className="h-4 w-24 bg-white/5 rounded-lg ml-auto" /></td>
                              </tr>
                           ))
                        ) : (
                           filteredAndSortedSignals.map((signal) => (
                              <tr
                                 key={signal.symbol}
                                 className="hover:bg-indigo-500/[0.02] transition-colors cursor-pointer group"
                                 onClick={() => handleEntityClick(signal.symbol)}
                              >
                                 <td className="px-10 py-8 relative">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center gap-4">
                                       <div className="flex flex-col">
                                          <span className="text-lg font-black text-white italic uppercase tracking-tight group-hover:text-indigo-400 transition-colors leading-none mb-1">{signal.symbol}</span>
                                          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{signal.sector}</span>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-8 text-right">
                                    <div className="flex flex-col items-end">
                                       <span className={`text-sm font-black italic tracking-tight ${signal.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                          {signal.priceChangePercent >= 0 ? '+' : ''}{signal.priceChangePercent}%
                                       </span>
                                       <div className="w-12 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                          <motion.div
                                             initial={{ width: 0 }}
                                             animate={{ width: '60%' }}
                                             className={`h-full ${signal.priceChangePercent >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                          />
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-8 text-right">
                                    <span className="text-xl font-black text-white italic tracking-tighter shadow-sm">{signal.score.toFixed(2)}</span>
                                 </td>
                                 <td className="px-10 py-8 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                       <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-xl italic tracking-widest ${signal.confidence === 'HIGH' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : signal.confidence === 'MEDIUM' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                          {signal.confidence}
                                       </span>
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </motion.div>
            )}
         </AnimatePresence>

         {filteredAndSortedSignals.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-32 opacity-20 group">
               <div className="p-8 rounded-full bg-white/5 border border-white/5 mb-8 group-hover:scale-110 transition-transform">
                  <BarChart4 size={64} className="text-slate-500" />
               </div>
               <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 italic">No Alpha Detected in current matrix</p>
            </div>
         )}
      </div>
   );
}
