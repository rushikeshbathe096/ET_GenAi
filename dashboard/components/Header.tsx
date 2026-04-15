"use client";

import { usePathname } from "next/navigation";
import { Search, Moon, Sun, Monitor, Activity, Radio, Command } from "lucide-react";
import { useAlerts } from "../context/AlertContext";
import AlertBell from "./AlertBell";
import { motion } from "framer-motion";

const routeTitles: { [key: string]: string } = {
  "/dashboard": "Tactical Dashboard",
  "/signal-radar": "Alpha Signal Radar",
  "/watchlist": "Strategic Watchlist",
  "/market": "Momentum Pulse",
  "/analytics": "Intelligence Analytics",
  "/alerts": "System Protocol Alerts",
};

export default function Header() {
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Alpha Node Terminal";
  const { unreadCount } = useAlerts();

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#030814]/90 backdrop-blur-xl sticky top-0 z-[100]">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
             <Monitor size={14} className="text-indigo-400" />
             <h1 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] italic">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xl font-black text-white italic uppercase tracking-tight">Active Node: <span className="text-indigo-400">NSE_BSE_ORBIT_01</span></span>
             <motion.div 
               animate={{ opacity: [0.3, 1, 0.3] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
             >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
             </motion.div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="w-96 relative hidden lg:block group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="ACCESS PROTOCOL (SYMBOL / SECTOR / SIGNAL)..."
            className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all duration-300 hover:border-white/10 group-focus-within:bg-indigo-500/5 group-focus-within:border-indigo-500/20 uppercase tracking-widest italic"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-slate-500">
             <Command size={8} /> K
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-6 px-6 border-x border-white/5">
              <div className="flex flex-col items-end">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global Volatility</span>
                 <span className="text-xs font-black text-rose-400 italic">14.28 VIX</span>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Network Load</span>
                 <span className="text-xs font-black text-indigo-400 italic">0.04%</span>
              </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertBell unreadCount={unreadCount} />
          </div>
        </div>
      </div>
    </header>
  );
}
