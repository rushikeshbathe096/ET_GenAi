"use client"

import { motion } from "framer-motion"
import { Star, ShieldCheck, Award, Zap, Target } from "lucide-react"

export default function LandingTestimonials() {
  const testimonials = [
    {
      name: "Aryan Malhotra",
      role: "Quantitative Analyst",
      text: "Alpha Node's confluence score has significantly reduced our false-positive trade signals. The sentiment integration is unmatched.",
      img: "https://i.pravatar.cc/100?img=12"
    },
    {
      name: "Sanya Gupta",
      role: "Independent Prop Trader",
      text: "I caught the entire mid-cap breakout last quarter thanks to the Alpha Radar. It's like having a 24/7 dedicated research team.",
      img: "https://i.pravatar.cc/100?img=25"
    },
    {
      name: "Vikram R.",
      role: "Fund Manager",
      text: "Transparent, explainable, and precise. Alpha Node doesn't just give you a ticker; it gives you the entire strategic 'Why'.",
      img: "https://i.pravatar.cc/100?img=33"
    }
  ]

  const stats = [
    { label: "Quarterly Alpha", value: "+22.4%", icon: Award },
    { label: "Signal Precision", value: "84%", icon: Target },
    { label: "Data Points/Day", value: "1B+", icon: Zap },
    { label: "Uptime Node", value: "99.9%", icon: ShieldCheck }
  ]

  return (
    <section className="py-24 bg-[#030814] relative">
      <div className="container mx-auto px-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[2rem] bg-white/5 border border-white/5 text-center group"
            >
              <stat.icon size={24} className="mx-auto text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tight">
            Trusted by the <span className="text-cyan-400">Elite</span>.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 relative shadow-2xl"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              
              <p className="text-slate-300 text-lg leading-relaxed italic mb-8">
                &ldquo;{item.text}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500/30">
                   <img src={item.img} alt={item.name} />
                </div>
                <div>
                   <div className="text-sm font-black text-white uppercase">{item.name}</div>
                   <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{item.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
