"use client";

import { Bell, Clock, ShieldCheck, Zap, XCircle } from "lucide-react";
import { useAlerts, Alert } from "../../../context/AlertContext";

export default function AlertsPage() {
  const { alerts, markAsRead, markAllAsRead, clearAll } = useAlerts();

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "HIGH_CONFIDENCE": return <ShieldCheck size={18} className="text-indigo-400" />;
      case "CIRCUIT": return <Zap size={18} className="text-amber-400" />;
      case "WATCHLIST": return <Bell size={18} className="text-cyan-400" />;
      case "PIPELINE": return <Zap size={18} className="text-emerald-400" />;
      default: return <Bell size={18} />;
    }
  };

  const getAlertTag = (type: Alert["type"]) => {
    switch (type) {
      case "HIGH_CONFIDENCE": return <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-black tracking-widest uppercase">High Alpha</span>;
      case "CIRCUIT": return <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-black tracking-widest uppercase">Circuit</span>;
      case "WATCHLIST": return <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-black tracking-widest uppercase">Watchlist</span>;
      case "PIPELINE": return <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-black tracking-widest uppercase">Pipeline</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-3 pb-8 border-b border-indigo-500/10">
        <h1 className="text-4xl font-black text-white italic tracking-tighter italic leading-none">Sentinel Terminal</h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Real-Time Exception Logs</p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6 text-sm font-black uppercase tracking-widest italic">
            <span className="text-indigo-300 border-b-2 border-indigo-500 pb-2">All Logs ({alerts.length})</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={markAllAsRead} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors">
              Mark All as Read
            </button>
            <button onClick={clearAll} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1">
              <XCircle size={12} />
              Clear All
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
              <Bell className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No signals detected</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`group flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 transform hover:scale-[1.01] ${alert.read ? 'bg-[#0c1532]/30 border-white/5 opacity-60' : 'bg-[#0c1532]/80 border-indigo-500/20 shadow-[0_4px_15px_-5px_rgba(99,102,241,0.15)] group-hover:border-indigo-400/40'}`}
                onClick={() => markAsRead(alert.id)}
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
                
                {!alert.read && (
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => { e.stopPropagation(); markAsRead(alert.id); }} className={`p-2 rounded-xl border border-white/5 text-slate-500 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 uppercase text-[10px] font-black tracking-widest px-4 py-2`}>
                      ACKNOWLEDGE
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <div className="pt-20 text-center space-y-4">
         <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">All intelligence logs are persisted locally across sessions.</p>
      </div>
    </div>
  );
}
