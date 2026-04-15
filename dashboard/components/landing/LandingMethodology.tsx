"use client"

import { motion } from "framer-motion"
import { ShieldCheck, BarChart2, MessageSquare, Globe, Target } from "lucide-react"

export default function LandingMethodology() {
  const steps = [
    {
      id: "01",
      title: "Signal Ingestion",
      icon: BarChart2,
      desc: "Live processing of NSE/BSE exchange feeds, order book imbalances, and corporate filings."
    },
    {
      id: "02",
      title: "Sentiment Calibration",
      icon: MessageSquare,
      desc: "NLP agents analyze 50+ news streams (Reuters, Mint, ET) to determine real-time market polarity."
    },
    {
      id: "03",
      title: "Confluence Logic",
      icon: ShieldCheck,
      desc: "Signals only filter through if technical setups align with bullish/bearish news cycles."
    },
    {
      id: "04",
      title: "Decision Issuance",
      icon: Target,
      desc: "Instant delivery of the Alpha Score, Entry Rationale, and specific Risk Factors."
    }
  ]

  return (
    <section className="py-24 bg-[#030814] relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 uppercase tracking-tight italic">
              The <span className="text-indigo-400">Alpha Protocol</span>.
            </h2>
            <div className="space-y-8">
              {steps.map((step, idx) => (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex gap-6 items-start group"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <step.icon size={22} className="text-indigo-400 group-hover:text-white" />
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="w-0.5 h-16 bg-gradient-to-b from-indigo-500/20 to-transparent mt-2" />
                    )}
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{step.id}</span>
                      <h3 className="text-xl font-black text-white uppercase italic">{step.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative">
             <div className="absolute inset-0 bg-indigo-600/10 blur-[100px] rounded-full" />
             <div className="relative p-8 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl overflow-hidden">
                <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                   </div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol Simulation</span>
                </div>

                {/* Simulated Data Flow Visual */}
                <div className="h-80 relative flex items-center justify-center">
                   <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center"
                   >
                      <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent opacity-50" />
                      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-50" />
                   </motion.div>

                   <div className="relative z-10 text-center">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-40 h-40 rounded-full bg-indigo-600/5 border border-indigo-500/30 flex items-center justify-center backdrop-blur-xl shadow-[0_0_50px_rgba(79,70,229,0.3)]"
                      >
                         <div className="text-center">
                            <span className="block text-4xl font-black text-white italic">AI</span>
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Core Node</span>
                         </div>
                      </motion.div>
                   </div>

                   {/* Floating Data Streams */}
                   {[1, 2, 3, 4, 5, 6].map((i) => (
                     <motion.div
                       key={i}
                       style={{ rotate: (i * 60) }}
                       className="absolute h-full"
                     >
                       <motion.div 
                        animate={{ y: [200, -200] }}
                        transition={{ duration: 2 + i, repeat: Infinity, ease: "linear" }}
                        className="w-1.5 h-6 bg-gradient-to-t from-indigo-500 to-transparent rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                       />
                     </motion.div>
                   ))}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Signals/Sec</div>
                      <div className="text-2xl font-black text-indigo-400">14.2k</div>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                      <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Latency</div>
                      <div className="text-2xl font-black text-emerald-400">18ms</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
