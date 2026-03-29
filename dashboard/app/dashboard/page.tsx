"use client";

import { useState, useMemo, useEffect } from "react";
import SignalCard from "../../components/SignalCard";
import TopMovers from "../../components/TopMovers";
import StockDetailDrawer from "../../components/StockDetailDrawer";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getDashboardData, runPipeline } from "../../utils/api";
import { Signal } from "../../data/mockSignals";
import { AlertCircle, ArrowRight, Zap, Target, Activity, Play, Loader2 } from "lucide-react";
import Link from "next/link";
import { detectCircuit } from "../../utils/signalUtils";
import { toast } from "react-hot-toast";
import { useAlerts } from "../../context/AlertContext";

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  const { generateAlertsFromSignals, addAlert } = useAlerts();

  const fetchData = async () => {
    try {
      const data = await getDashboardData();
      setSignals(data);
      // Step 2 — Generate Alerts from Signals
      await generateAlertsFromSignals(data);
      setError(null);
    } catch (err) {
      setError("Failed to synchronize with Alpha Node.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunPipeline = async () => {
    if (isPipelineRunning) return;

    try {
      setIsPipelineRunning(true);
      const toastId = toast.loading("Executing Intelligence Pipeline...");
      
      const result = await runPipeline();
      
      if (result.status === "success") {
        toast.success("Intelligence updated successfully.", { id: toastId });
        addAlert({
          symbol: "SYS",
          type: "PIPELINE",
          message: "Intelligence pipeline executed successfully. All telemetry updated."
        });
        await fetchData();
      } else {
        throw new Error("Pipeline returned non-success status");
      }
    } catch (err) {
      toast.error("Pipeline failure: Connection lost.");
    } finally {
      setIsPipelineRunning(false);
    }
  };

  const circuitBreakers = useMemo(() => 
    signals.filter(s => detectCircuit(s.priceChangePercent)), 
  [signals]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-6" />
        <h2 className="text-xl font-black text-rose-300 uppercase tracking-widest italic">{error}</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Checking Backend Telemetry...</p>
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Circuit Alert Banners */}
      {circuitBreakers.length > 0 && (
        <div className="space-y-3">
          {circuitBreakers.map((signal) => (
             <div key={`circuit-${signal.symbol}`} className="relative overflow-hidden group">
               <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-shimmer" />
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl group-hover:border-amber-500/40 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] animate-pulse">
                      <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest flex items-center gap-2">
                        Circuit Alert Detected
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                      </h3>
                      <p className="text-white font-bold italic text-lg leading-none mt-1">
                        {signal.symbol} ({signal.company}) hit {Math.abs(signal.priceChangePercent).toFixed(1)}% price limit
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedSignal(signal)}
                    className="group-hover:translate-x-1 flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-black font-black uppercase tracking-widest text-[10px] transition-all hover:bg-amber-400 active:scale-95"
                  >
                    Investigate Node
                    <ArrowRight size={14} />
                  </button>
               </div>
             </div>
          ))}
        </div>
      )}

      {/* Main Stats Header */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
           <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-xl font-black text-white italic tracking-[0.2em] uppercase">Market Pulse Summary</h2>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-1">Cross-Sector Liquidity Engine</p>
            </div>
            <Link href="/market" className="flex items-center gap-2 text-[10px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-[0.2em] transition-colors group">
              Full Pulse Radar
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <TopMovers signals={signals} />
        </div>

        <aside className="xl:col-span-4 flex flex-col justify-end">
           <div className="bg-[#0c1532]/50 border border-indigo-500/10 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-3 text-indigo-300 text-sm font-black uppercase tracking-[0.2em] mb-6">
                <Target size={18} />
                Global Alpha State
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Signals</span>
                  <span className="text-xl font-black text-white">{signals.length}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">High Confidence</span>
                  <span className="text-xl font-black text-white">{signals.filter(s => s.confidence === "HIGH").length}</span>
                </div>
                
                <button
                  onClick={handleRunPipeline}
                  disabled={isPipelineRunning}
                  className={`mt-4 w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 overflow-hidden relative group ${
                    isPipelineRunning 
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                      : "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] active:scale-[0.98]"
                  }`}
                >
                  <div className={`absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500`} />
                  <span className="relative flex items-center gap-2">
                    {isPipelineRunning ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Play size={14} fill="currentColor" />
                    )}
                    {isPipelineRunning ? "Node Busy..." : "Execute Pipeline"}
                  </span>
                </button>
              </div>
           </div>
        </aside>
      </section>

      {/* Grid Summary */}
      <section className="relative">
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h2 className="text-xl font-black text-white italic tracking-[0.2em] uppercase">Active Intelligence Radar</h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-1">Real-Time Signal Convergence</p>
          </div>
          <Link href="/signal-radar" className="flex items-center gap-2 text-[10px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-[0.2em] transition-colors group">
            Full Sentinel Feed
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {signals.length === 0 ? (
             <div className="col-span-full py-12 text-center border border-dashed border-indigo-500/20 rounded-[2rem] bg-[#0c1532]/30">
               <Activity className="w-10 h-10 text-slate-600 mx-auto mb-4 animate-pulse" />
               <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">No signals available</p>
               <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-widest">Awaiting sector convergence...</p>
             </div>
           ) : (
             signals.slice(0, 8).map((signal) => (
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
