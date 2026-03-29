"use client";

import { Activity } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-20 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
        <Activity className="w-12 h-12 text-indigo-400 animate-spin-slow" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-slate-500 animate-pulse">
        Synchronizing Terminal...
      </p>
    </div>
  );
}
