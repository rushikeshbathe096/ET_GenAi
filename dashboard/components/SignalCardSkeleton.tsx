"use client";

export default function SignalCardSkeleton() {
  return (
    <div className="relative rounded-[2rem] border border-white/5 bg-[#050b18] p-6 animate-pulse overflow-hidden">
      <div className="absolute top-0 right-10 w-8 h-10 bg-white/5 rounded-b-lg shadow-lg" />
      
      <header className="flex items-start justify-between mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-20 bg-white/10 rounded-lg" />
            <div className="h-4 w-12 bg-white/5 rounded-full" />
          </div>
          <div className="h-3 w-32 bg-white/5 rounded-md" />
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5" />
      </header>

      <div className="grid grid-cols-2 gap-4 mb-4">
         <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="h-2 w-16 bg-white/5 rounded-full" />
            <div className="h-5 w-20 bg-white/10 rounded-lg" />
         </div>
         <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="h-2 w-16 bg-white/5 rounded-full" />
            <div className="h-5 w-20 bg-white/10 rounded-lg" />
         </div>
      </div>

      <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
         <div className="h-2 w-20 bg-white/10 rounded-full" />
         <div className="h-2 w-full bg-white/5 rounded-full" />
         <div className="h-2 w-3/4 bg-white/5 rounded-full" />
      </div>

      <footer className="pt-4 border-t border-white/5 space-y-4">
         <div className="flex items-center justify-between">
            <div className="space-y-2">
               <div className="h-2 w-16 bg-white/5 rounded-full" />
               <div className="h-4 w-12 bg-white/10 rounded-lg" />
            </div>
            <div className="space-y-2 items-end flex flex-col">
               <div className="h-2 w-16 bg-white/5 rounded-full" />
               <div className="h-4 w-12 bg-white/10 rounded-lg" />
            </div>
         </div>
         <div className="h-3 w-full bg-white/5 rounded-lg" />
      </footer>
    </div>
  );
}
