"use client";

import { useState, useMemo, useEffect } from "react";
import SignalCard from "../../../components/SignalCard";
import SignalCardSkeleton from "../../../components/SignalCardSkeleton";
import TopMovers from "../../../components/TopMovers";
import { getDashboardData, runPipeline, Signal } from "../../../utils/api";
import {
  Zap,
  Target,
  Activity,
  Play,
  Loader2,
  Clock,
  ArrowUpRight,
  Globe,
  Database,
  ShieldCheck,
  Cpu,
  Radio
} from "lucide-react";
import Link from "next/link";
import { detectCircuit } from "../../../utils/signalUtils";
import { toast } from "react-hot-toast";
import { useAlerts } from "../../../context/AlertContext";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const { generateAlertsFromSignals } = useAlerts();

  const fetchData = async (force: boolean = false) => {
    try {
      if (force) setLoading(true);
      const { signals: data, generatedAt } = await getDashboardData(force);
      setSignals(data);
      setLastUpdated(generatedAt);
      await generateAlertsFromSignals(data);
      setError(null);
    } catch (err) {
      setError("CRITICAL: DATA SYNC FAILURE");
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
      const toastId = toast.loading("ORCHESTRATING ALPHA NODES...");
      const result = await runPipeline();
      if (result.status === "success") {
        toast.success("INTELLIGENCE LAYER SYNCHRONIZED", { id: toastId });
        await fetchData(true);
      } else {
        toast.error("PIPELINE FAULT DETECTED", { id: toastId });
      }
    } catch (err) {
      toast.error("COMMUNICATION LINK SEVERED");
    } finally {
      setIsPipelineRunning(false);
    }
  };

  const highConfluenceCount = useMemo(() => {
    return signals.filter(s => s.confidence === "HIGH").length;
  }, [signals]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center animate-pulse">
          <ShieldCheck className="w-10 h-10 text-rose-500 opacity-50" />
        </div>
        <h2 className="text-xl font-black text-white tracking-[0.3em] uppercase italic">{error}</h2>
        <button
          onClick={() => fetchData()}
          className="px-12 py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white rounded-2xl hover:bg-white/10 transition-all tracking-widest"
        >
          RE-ESTABLISH CONNECTION
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 pt-4">
      {/* Tactical Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Network Integrity', val: '98.4%', icon: Globe, col: 'indigo' },
          { label: 'Alpha Confluence', val: highConfluenceCount, icon: Target, col: 'cyan' },
          { label: 'Scanning Node', val: signals.length, icon: Database, col: 'emerald' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="px-6 py-4 rounded-[1.5rem] bg-[#050b18] border border-white/5 flex items-center gap-4 group hover:border-white/10 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl bg-${stat.col}-500/10 border border-${stat.col}-500/20 flex items-center justify-center text-${stat.col}-400 group-hover:scale-110 transition-transform`}>
              <stat.icon size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</span>
              <span className="text-lg font-black text-white italic tracking-tighter">{stat.val}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* Signal Feed Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-0.5 italic">Intelligence Stream</h2>
                  <p className="text-2xl font-black text-white uppercase italic tracking-tight">Top Confluence Signals</p>
                </div>
              </div>
              <Link href="/signal-radar" className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-500 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest flex items-center gap-2 italic">
                View All <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {loading ? (
                [...Array(4)].map((_, i) => <SignalCardSkeleton key={i} />)
              ) : (
                signals.slice(0, 4).map((signal) => (
                  <SignalCard key={signal.symbol} signal={signal} />
                ))
              )}
            </div>

            {!loading && lastUpdated && (
              <div className="mt-8 flex items-center justify-between gap-4 text-[9px] font-black uppercase text-slate-600 tracking-[0.3em] border-t border-white/5 pt-6 italic">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-indigo-500" />
                  Last Sync: {new Date(lastUpdated).toLocaleTimeString()}
                </div>
                <div className="text-indigo-400">Node: ASIA_PACIFIC_CLUSTER_07</div>
              </div>
            )}
          </section>

          {/* Movement Analytics Section */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-2 h-8 bg-indigo-600 rounded-full" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Global Momentum Analytics</h2>
            </div>
            {loading ? (
              <div className="h-64 rounded-[2.5rem] bg-white/5 animate-pulse" />
            ) : (
              <TopMovers signals={signals} />
            )}
          </section>
        </div>

        <div className="lg:col-span-1 space-y-10">
          {/* System Control Panel */}
          <section className="sticky top-28">
            <div className="bg-[#050b18] border border-white/5 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden relative group">
              {/* Visual backglow */}
              <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-indigo-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="bg-[#030814]/50 rounded-[2.3rem] p-8">
                <h3 className="text-xs font-black text-indigo-400 mb-8 uppercase tracking-[0.3em] italic border-b border-white/5 pb-4 flex items-center justify-between">
                  System Control
                  <Radio className="w-4 h-4 animate-pulse" />
                </h3>

                <div className="space-y-6">
                  <button
                    onClick={handleRunPipeline}
                    disabled={isPipelineRunning}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.15em] hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {isPipelineRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="italic">Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} className="fill-current" />
                        <span className="italic">Execute Full Scan</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { name: 'Signals Detected', val: loading ? '...' : signals.length, status: 'NOMINAL' },
                      { name: 'High Alpha Count', val: loading ? '...' : highConfluenceCount, status: 'OPTIMAL' },
                      { name: 'Risk Sentinel', val: loading ? '...' : signals.filter(s => detectCircuit(s.priceChangePercent)).length, status: 'ACTIVE', col: 'emerald' },
                    ].map((item, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.name}</span>
                          <span className={`text-[8px] font-black text-${item.col || 'indigo'}-400 uppercase tracking-widest italic`}>{item.status}</span>
                        </div>
                        <span className="text-xl font-black text-white italic">{item.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex flex-col gap-2">
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em] text-center">Node Security Level: <span className="text-emerald-500">MAXIMUM</span></span>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div animate={{ width: ['0%', '100%', '30%', '80%'] }} transition={{ duration: 10, repeat: Infinity }} className="h-full bg-indigo-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
