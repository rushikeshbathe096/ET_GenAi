"use client"

import { motion } from "framer-motion"
import { Search, Activity, Cpu, Globe, Database, TrendingUp } from "lucide-react"

export default function LandingFeatures() {
  const features = [
    {
      title: "Market Radar",
      desc: "Instant scanning of 5,000+ equities across NSE and BSE for price discovery and volume anomalies.",
      icon: Search,
      color: "blue"
    },
    {
      title: "Sentiment Engine",
      desc: "Real-time news synthesis using multi-agent NLP to detect polarity in corporate filings and headlines.",
      icon: Activity,
      color: "emerald"
    },
    {
      title: "Confluence Matrix",
      desc: "Our proprietary alignment logic that only triggers when technical, news, and macro signals overlap.",
      icon: Cpu,
      color: "indigo"
    },
    {
      title: "Global Macro",
      desc: "Integrated tracking of dollar index, yields, and commodity flows to filter for high-conviction setups.",
      icon: Globe,
      color: "cyan"
    },
    {
      title: "Historical RAG",
      desc: "Retrieval-Augmented Generation compares current setups against a 10-year database of similar patterns.",
      icon: Database,
      color: "purple"
    },
    {
      title: "Predictive Analytics",
      desc: "Monte Carlo simulations run in the background to estimate probability distributions for every signal.",
      icon: TrendingUp,
      color: "rose"
    }
  ]

  return (
    <section className="py-24 relative overflow-hidden bg-[#040a1a]">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black text-white mb-6 uppercase tracking-tight italic"
          >
            The Intelligence <span className="text-indigo-400">Stack</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg leading-relaxed"
          >
            Modular, high-performance engines built to surface edge in modern financial environments. No lag, no noise—just pure signal.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
            >
              {/* Subtle Gradient Backglow */}
              <div className={`absolute -right-12 -bottom-12 w-32 h-32 bg-${feature.color}-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <feature.icon size={28} className={`text-${feature.color}-400`} />
              </div>
              
              <h3 className="text-xl font-black text-white mb-4 uppercase tracking-normal italic">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {feature.desc}
              </p>
              
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Documentation</span>
                <TrendingUp size={12} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
