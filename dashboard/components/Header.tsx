"use client";

import { usePathname } from "next/navigation";
import { Search, Moon, Sun } from "lucide-react";
import AlertBell from "./AlertBell";

import { mockAlerts } from "../data/mockAlerts";

const routeTitles: { [key: string]: string } = {
  "/dashboard": "Market Dashboard",
  "/signal-radar": "Signal Radar",
  "/watchlist": "Personal Watchlist",
  "/market": "Market Pulse",
  "/analytics": "Performance Analytics",
  "/alerts": "System Alerts",
};

export default function Header() {
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Opportunity Radar";
  const unreadCount = mockAlerts.filter(a => !a.read).length;

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-indigo-500/10 bg-[#030814]/85 backdrop-blur-md sticky top-0 z-[100]">
      <div className="flex items-center">
        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-80 relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search signals, sectors, or symbols..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all duration-200 hover:border-white/20"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="pr-3 border-r border-white/10 hidden md:flex items-center gap-2">
            <button className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors">
              <Sun size={18} />
            </button>
            <button className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors">
              <Moon size={18} />
            </button>
          </div>
          <AlertBell unreadCount={unreadCount} />
        </div>
      </div>
    </header>
  );
}
