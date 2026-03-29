"use client";

import { useState, useMemo, useEffect } from "react";
import SignalCard from "../../../components/SignalCard";
import SignalCardSkeleton from "../../../components/SignalCardSkeleton";
import TopMovers from "../../../components/TopMovers";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { getDashboardData, runPipeline } from "../../../utils/api";
import { Signal } from "../../../data/mockSignals";
import { AlertCircle, ArrowRight, Zap, Target, Activity, Play, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { detectCircuit } from "../../../utils/signalUtils";
import { toast } from "react-hot-toast";
import { useAlerts } from "../../../context/AlertContext";

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const { generateAlertsFromSignals } = useAlerts();

  const fetchData = async (force: boolean = false) => {
    try {
      if (force) setLoading(true); // Re-show loading for forced refreshes if desired
      const { signals: data, generatedAt } = await getDashboardData(force);
      setSignals(data);
      setLastUpdated(generatedAt);
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
        await fetchData(true);
      } else {
        toast.error("Pipeline execution failed.", { id: toastId });
      }
    } catch (err) {
      toast.error("Critical communication error with Alpha Node.");
    } finally {
      setIsPipelineRunning(false);
    }
  };

  const highConfluenceCount = useMemo(() => {
    return signals.filter(s => s.confidence === "HIGH").length;
  }, [signals]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 opacity-50" />
        <h2 className="text-xl font-bold text-white tracking-widest uppercase">{error}</h2>
        <button 
          onClick={() => fetchData()}
          className="px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white rounded-2xl hover:bg-white/10 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight italic uppercase underline decoration-indigo-500 decoration-4 underline-offset-8">Alpha Node</h1>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Real-time autonomous market scanning and signal detection engine.
          </p>
        </div>
        
        <button 
          onClick={handleRunPipeline}
          disabled={isPipelineRunning}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isPipelineRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Orchestrating...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>Force Signal Refresh</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-widest italic">Top Confluence Signals</h2>
              </div>
              <Link href="/signal-radar" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View Radar <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                 [...Array(4)].map((_, i) => <SignalCardSkeleton key={i} />)
              ) : (
                signals.slice(0, 4).map((signal) => (
                  <SignalCard key={signal.symbol} signal={signal} />
                ))
              )}
            </div>

            {/* Last Updated Timestamp - Under the cards as requested */}
            {!loading && lastUpdated && (
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-t border-white/5 pt-4">
                <Clock size={12} />
                Alpha Node Last Transmitted: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white uppercase tracking-widest italic">Movement Analytics</h2>
            </div>
            {loading ? (
                <div className="h-48 rounded-3xl bg-white/5 animate-pulse" />
            ) : (
                <TopMovers signals={signals} />
            )}
          </section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <section className="sticky top-24">
             <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest italic border-b border-white/10 pb-2">Telemetry</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Scanned</span>
                      <span className="text-sm font-black text-white">{loading ? '...' : signals.length} Stocks</span>
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">High Alpha</span>
                      <span className="text-sm font-black text-emerald-400">{loading ? '...' : highConfluenceCount}</span>
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Circuit Alert</span>
                      <span className={`text-sm font-black ${!loading && signals.some(s => detectCircuit(s.priceChangePercent)) ? 'text-amber-400' : 'text-slate-500'}`}>
                        {loading ? '...' : signals.filter(s => detectCircuit(s.priceChangePercent)).length} Detected
                      </span>
                   </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
