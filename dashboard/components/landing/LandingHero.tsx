"use client"

import { motion } from "framer-motion"
import { ChevronRight, Play, Zap, Shield, Target, Activity, Orbit, Sparkles } from "lucide-react"
import Link from "next/link"

export default function LandingHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    },
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-16 overflow-hidden bg-[#030814]">
      {/* High-Fidelity Background Stack */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep Space Gradients */}
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[160px]" />
        
        {/* Technical Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        {/* Animated Scanning Beam */}
        <motion.div 
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 bottom-0 w-[400px] bg-gradient-to-r from-transparent via-indigo-500/[0.03] to-transparent skew-x-[25deg]"
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="container relative z-10 px-6 mx-auto text-center lg:text-left grid lg:grid-cols-2 gap-20 items-center"
      >
        <div className="max-w-3xl mx-auto lg:mx-0">
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black tracking-[0.3em] uppercase mb-10 italic shadow-2xl backdrop-blur-md"
          >
            <Zap size={14} className="fill-current" />
            <span>ESTABLISHING ALPHA CONFLUENCE v2.1.0</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 italic uppercase"
          >
            Institutional <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
               Intelligence
            </span> <br />
            Terminal.
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg lg:text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-bold uppercase tracking-tight"
          >
            The Alpha Node matrix synthesizes live telemetry, news volatility, and institutional flow into high-fidelity, actionable trade signals.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
          >
            <Link 
              href="/dashboard"
              className="group relative px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(79,70,229,0.5)] overflow-hidden transition-all hover:scale-105 active:scale-95 italic"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative flex items-center gap-3">
                Initialize Console <ChevronRight size={18} />
              </span>
            </Link>
            
            <button className="px-10 py-5 bg-white/[0.03] border border-white/10 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-3 group italic">
              <Play size={16} className="fill-white group-hover:scale-110 transition-transform" />
              Operational Demo
            </button>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-16 flex items-center gap-8 justify-center lg:justify-start"
          >
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 italic">Uplink Status</span>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-[#030814] bg-slate-800 flex items-center justify-center shadow-xl">
                         <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic leading-none">12.4k+ Institutional Nodes</span>
                </div>
             </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          className="hidden lg:block relative"
        >
          {/* Tactical Terminal Window */}
          <div className="relative z-10 p-[2px] rounded-[3.5rem] bg-gradient-to-br from-indigo-500/40 via-purple-500/10 to-transparent backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
            <div className="bg-[#050b18] rounded-[3.4rem] p-10 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10">
                 <Orbit size={300} className="text-white animate-spin-slow" />
              </div>

              <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-600 shadow-xl">
                     <Activity size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-widest uppercase italic">Active Matrix</h3>
                    <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">SENTINEL FEED-07</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                   <div className="w-2 h-2 rounded-full bg-slate-800" />
                   <div className="w-2 h-2 rounded-full bg-slate-800" />
                </div>
              </div>

              <div className="space-y-5 relative z-10">
                {[
                  { symbol: "RELIANCE", change: "+2.48%", status: "OPTIMIZED", score: 92, color: "indigo" },
                  { symbol: "TCS.UPLINK", change: "+1.12%", status: "STABLE", score: 68, color: "cyan" },
                  { symbol: "HDFCBANK", change: "+4.21%", status: "CONFLUENCE", score: 98, color: "emerald" },
                ].map((item, idx) => (
                  <motion.div 
                    key={item.symbol}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 + (idx * 0.2) }}
                    className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-between group/card hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center text-${item.color}-400 group-hover/card:scale-110 transition-transform`}>
                        <Target size={20} />
                      </div>
                      <div>
                        <div className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">{item.symbol}</div>
                        <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-2">{item.status}</div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-lg font-black text-white italic tracking-tighter">{item.change}</div>
                       <div className={`text-[9px] font-black uppercase tracking-widest mt-2 text-${item.color}-400`}>SCORE: {item.score}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Quantum Risk Inspected</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-indigo-400" />
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">AI AGENTIC CORE</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Floaters */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -z-10 animate-pulse" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1.5s' }} />
        </motion.div>
      </motion.div>
    </section>
  )
}
