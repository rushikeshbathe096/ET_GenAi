"use client"

import { motion } from "framer-motion"
import { Check, Zap, ChevronRight, Target, Shield, Cpu } from "lucide-react"
import Link from "next/link"

export default function LandingPricing() {
  const plans = [
    {
      name: "Tactical",
      price: "0",
      desc: "Perfect for exploring the Alpha Node ecosystem.",
      features: ["5 Real-time Signals / Day", "Basic Sentiment Analysis", "NSE Radar Access", "Public Community Support"],
      cta: "Start Free",
      highlight: false,
      icon: Target
    },
    {
      name: "Strategic",
      price: "1,999",
      desc: "The professional choice for active delta-neutral traders.",
      features: ["Unlimited High-Confluence Signals", "Deep-Dive Sentiment Matrix", "BSE & Global Macro Radar", "Historical RAG Pattern Matching", "Priority Intelligence Node"],
      cta: "Go Pro",
      highlight: true,
      icon: Cpu
    },
    {
      name: "Institutional",
      price: "Custom",
      desc: "Bespoke execution and API access for hedge funds.",
      features: ["Private Hosting Node", "Custom Model Fine-tuning", "L1 Latency API Access", "24/7 Dedicated Quant Support", "Full Methodology Disclosure"],
      cta: "Contact Ops",
      highlight: false,
      icon: Shield
    }
  ]

  return (
    <section className="py-24 bg-[#040a1a] relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tight mb-6">
            Scale Your <span className="text-indigo-400">Alpha</span>.
          </h2>
          <p className="text-slate-400 text-lg">Choose the intelligence depth that matches your execution style.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-8 rounded-[3rem] border transition-all duration-500 relative flex flex-col ${plan.highlight ? "bg-indigo-600 border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.3)] scale-105 z-10" : "bg-white/5 border-white/10 hover:border-white/20"}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-indigo-600 text-[10px] font-black uppercase px-4 py-1 rounded-full tracking-widest">
                  Most Deployed
                </div>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.highlight ? "bg-white/20" : "bg-indigo-500/10"}`}>
                   <plan.icon size={24} className={plan.highlight ? "text-white" : "text-indigo-400"} />
                </div>
                <h3 className={`text-2xl font-black uppercase italic mb-2 ${plan.highlight ? "text-white" : "text-white"}`}>{plan.name}</h3>
                <p className={`text-sm ${plan.highlight ? "text-indigo-100" : "text-slate-500"}`}>{plan.desc}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                   <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "text-white"}`}>
                    {plan.price !== "Custom" && "₹"}
                    {plan.price}
                   </span>
                   {plan.price !== "Custom" && <span className={`text-sm font-bold ${plan.highlight ? "text-indigo-200" : "text-slate-500"}`}>/mo</span>}
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex gap-3 items-start">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${plan.highlight ? "bg-white/20" : "bg-indigo-500/10"}`}>
                       <Check size={12} className={plan.highlight ? "text-white" : "text-indigo-400"} />
                    </div>
                    <span className={`text-sm font-medium ${plan.highlight ? "text-indigo-50" : "text-slate-400"}`}>{f}</span>
                  </div>
                ))}
              </div>

              <Link 
                href={plan.price === "Custom" ? "mailto:ops@alphanode.ai" : "/dashboard"}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-center transition-all ${plan.highlight ? "bg-white text-indigo-600 hover:bg-slate-100 shadow-xl" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg"}`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Lead Capture Branding */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-12 rounded-[3.5rem] bg-gradient-to-r from-indigo-900/40 via-[#030814] to-cyan-900/40 border border-white/5 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
          <div className="relative z-10">
             <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 uppercase italic">Join the <span className="text-indigo-400">Waitlist</span> for V3.</h2>
             <p className="text-slate-400 max-w-xl mx-auto mb-10">Get early access to our Cross-Asset Correlation node before it goes public. Limited slots available for institutional beta.</p>
             
             <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="quant@firm.com" 
                  className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors font-bold"
                />
                <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">
                  Reserve Slot
                </button>
             </form>
             <p className="mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Secure Transmission Line • No Spam Policy</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
