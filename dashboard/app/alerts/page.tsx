"use client";

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, ArrowUpCircle, TrendingDown, Clock, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getAlerts } from "../../utils/api";
import { Alert } from "../../data/mockAlerts";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getAlerts();
        setAlerts(data);
      } catch (err) {
        setError("Alert node disconnected.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "MOVEMENT": return <TrendingDown size={18} className="text-rose-400" />;
      case "UPGRADE": return <ArrowUpCircle size={18} className="text-emerald-400" />;
      case "CIRCUIT": return <Zap size={18} className="text-amber-400" />;
      default: return <Bell size={18} />;
    }
  };

  const getAlertTag = (type: Alert["type"]) => {
    switch (type) {
      case "MOVEMENT": return <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-black tracking-widest uppercase">Movement</span>;
      case "UPGRADE": return <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-black tracking-widest uppercase">Upgrade</span>;
      case "CIRCUIT": return <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-black tracking-widest uppercase">Circuit</span>;
      default: return null;
    }
  };

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
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-3 pb-8 border-b border-indigo-500/10">
        <h1 className="text-4xl font-black text-white italic tracking-tighter italic leading-none">Sentinel Terminal</h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Real-Time Exception Logs</p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6 text-sm font-black uppercase tracking-widest italic">
            <span className="text-indigo-300 border-b-2 border-indigo-500 pb-2">All Logs</span>
            <span className="text-slate-500 hover:text-white transition-colors cursor-pointer pb-2">Critical Only</span>
            <span className="text-slate-500 hover:text-white transition-colors cursor-pointer pb-2">System Config</span>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors">
            Mark All as Read
          </button>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`group flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 transform hover:scale-[1.01] ${alert.read ? 'bg-[#0c1532]/30 border-white/5 opacity-60' : 'bg-[#0c1532]/80 border-indigo-500/20 shadow-[0_4px_15px_-5px_rgba(99,102,241,0.15)] group-hover:border-indigo-400/40'}`}
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${alert.read ? 'bg-white/5 text-slate-500' : 'bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_-5px_rgba(99,102,241,0.4)]'}`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {getAlertTag(alert.type)}
                    {!alert.read && <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                  </div>
                  <p className={`text-md font-bold tracking-tight italic ${alert.read ? 'text-slate-400' : 'text-white'}`}>
                    &quot;{alert.message}&quot;
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    {alert.timestamp}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className={`p-2 rounded-xl border border-white/5 text-slate-500 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100`}>
                  <ShieldCheck size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-20 text-center space-y-4">
         <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 py-2 rounded-full border border-white/5 bg-white/5">
            <AlertTriangle size={12} />
            Archive Stream Full
         </div>
         <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Older signals are stored in long-term diagnostics.</p>
      </div>
    </div>
  );
}
