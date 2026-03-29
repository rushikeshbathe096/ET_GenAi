"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

export default function AlertBell({ unreadCount = 0 }: { unreadCount?: number }) {
  return (
    <Link 
      href="/alerts"
      className="relative p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all duration-200 hover:text-white hover:border-white/20 hover:bg-white/10"
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
      )}
    </Link>
  );
}
