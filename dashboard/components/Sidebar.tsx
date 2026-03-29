"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Radar, 
  ListOrdered, 
  Activity, 
  BarChart3, 
  Bell, 
  ChevronRight 
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Signal Radar', href: '/signal-radar', icon: Radar },
  { name: 'Watchlist', href: '/watchlist', icon: ListOrdered },
  { name: 'Market Pulse', href: '/market', icon: Activity },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Alerts', href: '/alerts', icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 h-full bg-[#040a1a] border-r border-indigo-500/20">
      <div className="flex items-center justify-between h-16 px-6 border-b border-indigo-500/20">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
          Opportunity Radar
        </span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-white'}`} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-indigo-500/20">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
            RJ
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Rajesh J.</span>
            <span className="text-[10px] text-emerald-400">Pro Terminal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
