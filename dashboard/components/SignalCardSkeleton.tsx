"use client";

export default function SignalCardSkeleton() {
  return (
    <div className="relative rounded-2xl border border-white/5 bg-[#071127]/50 p-6 animate-pulse overflow-hidden">
      {/* Rank Badge placeholder */}
      <div className="absolute top-0 left-0 h-4 w-8 bg-white/10 rounded-br-lg" />

      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="h-6 w-16 bg-white/10 rounded-md" />
            <div className="h-4 w-10 bg-white/5 rounded-md" />
          </div>
          <div className="h-3 w-32 bg-white/5 rounded-md" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/10" />
      </div>

      <div className="flex items-center gap-6 mb-5">
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-8 bg-white/5 rounded-full" />
          <div className="h-4 w-14 bg-white/10 rounded-md" />
        </div>
        <div className="w-px h-8 bg-white/5" />
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-10 bg-white/5 rounded-full" />
          <div className="h-3.5 w-16 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Explanation placeholder */}
      <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
        <div className="h-2.5 w-12 bg-white/10 rounded-full" />
        <div className="h-2 w-full bg-white/5 rounded-full" />
        <div className="h-2 w-3/4 bg-white/5 rounded-full" />
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="h-2 w-16 bg-white/5 rounded-full" />
            <div className="h-4 w-12 bg-white/10 rounded-md" />
          </div>
          <div className="space-y-1.5 flex flex-col items-end">
            <div className="h-2 w-16 bg-white/5 rounded-full" />
            <div className="h-4 w-12 bg-white/10 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
