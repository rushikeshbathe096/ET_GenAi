"use client";

import { useEffect, useState, useMemo } from "react";
import SignalCard from "../../components/SignalCard";
import StockDetailDrawer from "../../components/StockDetailDrawer";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getSignals } from "../../utils/api";
import { Signal } from "../../data/mockSignals";
<<<<<<< HEAD
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
  BarChart4,
  Clock
} from "lucide-react";
=======
import { Search, SlidersHorizontal, ListFilter, Activity, ShieldCheck, AlertCircle } from "lucide-react";
import { useAlerts } from "../../context/AlertContext";
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c

export default function SignalRadarPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSector, setFilterSector] = useState("All");
  const [filterConfidence, setFilterConfidence] = useState("All");
  const [filterScore, setFilterScore] = useState("0");
  const [sortBy, setSortBy] = useState("score");
<<<<<<< HEAD
  const [viewType, setViewType] = useState<"grid" | "table">("table");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSignals();
      setSignals(data);
    } catch (err) {
      console.error("Signal Radar Error:", err);
      setError("Failed to synchronize Sentinel stream.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
=======
  
  const { generateAlertsFromSignals } = useAlerts();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getSignals();
        setSignals(data);
        generateAlertsFromSignals(data);
      } catch (err) {
        setError("Failed to synchronize Sentinel stream.");
      } finally {
        setLoading(false);
      }
    }
>>>>>>> 199e1ff0adcd621ea164db127ce2e01f8ec2652c
    fetchData();
  }, []);

  const sectors = useMemo(() => ["All", ...new Set(signals.map(s => s.sector))].sort(), [signals]);
  const confidences = ["All", "HIGH", "MEDIUM", "LOW"];
  const scoreThresholds = [
    { label: "Any Score", value: "0" },
    { label: "Elite (>8.0)", value: "8" },
    { label: "High (>7.0)", value: "7" },
    { label: "Solid (>5.0)", value: "5" },
  ];

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

  if (loading) return <LoadingSpinner />;

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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-8 pb-8 border-b border-indigo-500/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter">Kinetic Sentinel</h2>
            <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">Full Sector Data Stream</p>
          </div>
          
          <div className="flex items-center gap-1 bg-[#0c1532]/50 border border-white/10 p-1 rounded-2xl self-start md:self-auto">
            <button 
              onClick={() => setViewType("grid")}
              className={`p-2.5 rounded-xl transition-all ${viewType === "grid" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewType("table")}
              className={`p-2.5 rounded-xl transition-all ${viewType === "table" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"}`}
              title="Table View"
            >
              <ListIcon size={18} />
            </button>
          </div>
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
                className="bg-transparent text-[10px] font-black text-slate-300 focus:outline-none cursor-pointer uppercase tracking-widest"
              >
                {sectors.map(s => <option key={s} value={s} className="bg-[#030814]">{s}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#0c1532]/50 border border-white/10 px-4 py-2.5 rounded-2xl">
              <ShieldCheck size={16} className="text-cyan-400" />
              <select 
                value={filterConfidence}
                onChange={(e) => setFilterConfidence(e.target.value)}
                className="bg-transparent text-[10px] font-black text-slate-300 focus:outline-none cursor-pointer uppercase tracking-widest"
              >
                {confidences.map(c => <option key={c} value={c} className="bg-[#030814]">{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#0c1532]/50 border border-white/10 px-4 py-2.5 rounded-2xl">
              <BarChart4 size={16} className="text-emerald-400" />
              <select 
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="bg-transparent text-[10px] font-black text-slate-300 focus:outline-none cursor-pointer uppercase tracking-widest"
              >
                {scoreThresholds.map(t => <option key={t.value} value={t.value} className="bg-[#030814]">{t.label}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#0c1532]/50 border border-white/10 px-4 py-2.5 rounded-2xl">
              <SlidersHorizontal size={16} className="text-indigo-300" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] font-black text-slate-300 focus:outline-none cursor-pointer uppercase tracking-widest"
              >
                <option value="score" className="bg-[#030814]">Sort: Confluence</option>
                <option value="priceChange" className="bg-[#030814]">Sort: Price Change</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <section>
        {filteredAndSortedSignals.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">No signals matching sector criteria</p>
          </div>
        ) : viewType === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedSignals.map((signal) => (
              <div key={signal.symbol} onClick={() => setSelectedSignal(signal)}>
                <SignalCard signal={signal} />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0c1532]/30 backdrop-blur-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Price</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Change</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Horizon</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAndSortedSignals.map((signal) => (
                  <tr 
                    key={signal.symbol} 
                    onClick={() => setSelectedSignal(signal)}
                    className="group hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase italic">{signal.symbol}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{signal.sector}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-slate-100">₹{signal.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${signal.priceChangePercent >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                        {signal.priceChangePercent >= 0 ? "+" : ""}{signal.priceChangePercent.toFixed(2)}%
                        <TrendingUp size={12} className={signal.priceChangePercent < 0 ? "rotate-90" : ""} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${signal.confidence === "HIGH" ? "bg-cyan-400 animate-pulse" : signal.confidence === "MEDIUM" ? "bg-yellow-400" : "bg-slate-500"}`} />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{signal.confidence}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{signal.horizon}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${signal.score * 10}%` }}
                          />
                        </div>
                        <span className="text-sm font-black text-indigo-400 italic">
                          {signal.score.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
