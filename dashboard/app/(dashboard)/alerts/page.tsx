"use client";

import { Bell, Clock, ShieldCheck, Zap, XCircle, Terminal, Activity, Radio, CheckCircle2 } from "lucide-react";
import { useAlerts, Alert } from "../../../context/AlertContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AlertsPage() {
  const { alerts, markAsRead, markAllAsRead, clearAll } = useAlerts();

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "HIGH_CONFIDENCE": return <ShieldCheck size={20} className="text-indigo-400" />;
      case "CIRCUIT": return <Zap size={20} className="text-amber-400" />;
      case "WATCHLIST": return <Bell size={20} className="text-cyan-400" />;
      case "PIPELINE": return <Activity size={20} className="text-emerald-400" />;
      default: return <Bell size={20} />;
    }
  };

  const getAlertTag = (type: Alert["type"]) => {
    switch (type) {
      case "HIGH_CONFIDENCE": return <span className="text-[9px] px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 font-black tracking-[0.2em] uppercase italic border border-indigo-500/20">Alpha Sentinel</span>;
      case "CIRCUIT": return <span className="text-[9px] px-3 py-1 rounded-xl bg-amber-500/10 text-amber-500 font-black tracking-[0.2em] uppercase italic border border-amber-500/20">Circuit Protocol</span>;
      case "WATCHLIST": return <span className="text-[9px] px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-500 font-black tracking-[0.2em] uppercase italic border border-cyan-500/20">Target Lock</span>;
      case "PIPELINE": return <span className="text-[9px] px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 font-black tracking-[0.2em] uppercase italic border border-emerald-500/20">Core Engine</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 pt-4">
      {/* Sentinel Header */}
      <header className="relative p-12 rounded-[3.5rem] bg-[#050b18] border border-white/5 overflow-hidden group">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] -mr-32 -mt-32" />
         <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="p-4 rounded-3xl bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                     <Terminal className="w-6 h-6 text-white" />
                  </div>
                  <div>
                     <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Sentinel Terminal</h1>
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2 block italic">REAL-TIME EXCEPTION & INTELLIGENCE LOGS</span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Buffer Status</span>
                  <span className="text-xl font-black text-emerald-400 italic">NOMINAL</span>
               </div>
               <div className="w-px h-10 bg-white/10" />
               <div className="flex items-center gap-3">
                  <Radio size={16} className="text-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LIVE FEED</span>
               </div>
            </div>
         </div>
      </header>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-1 h-6 bg-indigo-600 rounded-full" />
             <h2 className="text-xl font-black text-white italic uppercase tracking-widest">Active Logs ({alerts.length})</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={markAllAsRead} 
              className="px-6 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-white/10 transition-all italic"
            >
              Acknowledge All
            </button>
            <button 
              onClick={clearAll} 
              className="px-6 py-2.5 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all italic flex items-center gap-2"
            >
              <XCircle size={12} />
              Purge Logs
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {alerts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-32 text-center border border-dashed border-white/5 rounded-[3rem] bg-[#050b18]/50"
              >
                <Bell className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-xs italic">No Sentinel events detected in current session</p>
              </motion.div>
            ) : (
              alerts.map((alert, i) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  key={alert.id} 
                  className={`group flex items-center justify-between p-8 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden ${alert.read ? 'bg-[#050b18]/40 border-white/5 opacity-50' : 'bg-[#050b18] border-indigo-500/20 shadow-2xl hover:border-indigo-400 group-hover:shadow-indigo-500/10'}`}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="flex items-center gap-8 relative z-10">
                    <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all ${alert.read ? 'bg-white/5 text-slate-600' : 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] group-hover:scale-110'}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        {getAlertTag(alert.type)}
                        {!alert.read && <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />}
                      </div>
                      <h3 className={`text-lg font-black tracking-tight italic leading-relaxed ${alert.read ? 'text-slate-500' : 'text-white'}`}>
                        &quot;{alert.message}&quot;
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] italic">
                        <Clock size={12} className="text-indigo-500" />
                        Transmitted: {alert.timestamp}
                      </div>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {!alert.read && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-4 relative z-10"
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); markAsRead(alert.id); }} 
                          className="px-8 py-3 rounded-2xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2 italic shadow-lg"
                        >
                          <CheckCircle2 size={12} />
                          Acknowledge
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Aesthetic Background Pattern */}
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-indigo-500/[0.02] to-transparent pointer-events-none" />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer className="pt-20 text-center">
         <p className="text-[10px] text-slate-700 font-extrabold uppercase tracking-[0.3em] italic">All sentinel logs are archived in persistent volatile storage.</p>
      </footer>
    </div>
  );
}
