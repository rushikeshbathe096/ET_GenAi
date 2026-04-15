"use client"

import Link from "next/link"
import { Zap, X, Globe, Layers, Mail } from "lucide-react"

export default function LandingFooter() {
  return (
    <footer className="py-20 bg-[#020611] border-t border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Zap size={20} className="text-white fill-current" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase italic">Alpha Node</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Autonomous alpha generation and market confluence intelligence for professional traders and institutions.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"><X size={18} /></Link>
              <Link href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Globe size={18} /></Link>
              <Link href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Layers size={18} /></Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-black uppercase italic mb-6 tracking-widest">Protocol</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><Link href="#" className="hover:text-white transition-colors">Terminal</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Radar Engine</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Sentiment Matrix</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">API Docs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase italic mb-6 tracking-widest">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><Link href="#" className="hover:text-white transition-colors">About Ops</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security Node</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase italic mb-6 tracking-widest">Support</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500 text-slate-500">
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Live Status</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Direct Link</Link></li>
              <li className="flex items-center gap-2"><Mail size={14} /> <span>ops@alphanode.ai</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase text-slate-600 tracking-[0.3em]">
          <div>© 2026 Alpha Node Intelligence • All Rights Reserved</div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-slate-400">NSE License</Link>
            <Link href="#" className="hover:text-slate-400">BSE License</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
