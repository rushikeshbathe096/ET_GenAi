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
  ChevronRight,
  Zap,
  Terminal,
  Cpu,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="flex flex-col w-64 h-full bg-[#030814] border-r border-white/5 selection:bg-indigo-500/30">
      <div className="flex items-center gap-3 h-20 px-6 border-b border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)] shrink-0 transition-transform group-hover:rotate-12">
          <Zap size={20} className="text-white fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-white tracking-tighter uppercase italic leading-tight">
            Alpha Node
          </span>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">
            v2.1.0-beta
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-1 hide-scrollbar">
        <div className="px-4 mb-4">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">Terminal Stack</span>
        </div>

        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 text-xs font-bold rounded-xl transition-all duration-300 group relative ${isActive
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-200'
                }`}
            >
              <div className="flex items-center z-10">
                <item.icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-slate-300'}`} />
                <span className="uppercase tracking-widest italic">{item.name}</span>
              </div>

              {isActive && (
                <>
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white/5 border border-white/5 rounded-xl z-0"
                  />
                  <ChevronRight size={14} className="text-indigo-400 z-10" />
                </>
              )}
            </Link>
          );
        })}

        <div className="mt-12 px-4 mb-4">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">System Diagnostics</span>
        </div>
        <div className="space-y-1">
          {[
            { name: 'Core Engine', icon: Cpu, status: 'ONLINE', color: 'emerald' },
            { name: 'Alpha Feed', icon: Activity, status: 'SYNCED', color: 'indigo' },
            { name: 'Risk Sentinel', icon: ShieldAlert, status: 'GUARDING', color: 'cyan' },
          ].map((sys) => (
            <div key={sys.name} className="flex items-center justify-between px-4 py-3 text-[10px] font-black text-slate-500 group cursor-default">
              <div className="flex items-center gap-2">
                <sys.icon size={12} className="group-hover:text-slate-400 transition-colors" />
                <span className="uppercase tracking-widest italic">{sys.name}</span>
              </div>
              <span className={`text-[9px] text-${sys.color}-400/70`}>{sys.status}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
