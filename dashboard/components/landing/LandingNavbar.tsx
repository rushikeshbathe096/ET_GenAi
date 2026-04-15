"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Zap, ChevronRight, Terminal } from "lucide-react"

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Terminal", href: "#" },
    { name: "Alpha Ops", href: "#features" },
    { name: "Protocol", href: "#methodology" },
    { name: "Institutional", href: "#pricing" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] pointer-events-none p-6">
      <div className="container mx-auto">
         <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`pointer-events-auto h-20 px-8 flex items-center justify-between transition-all duration-500 rounded-[2rem] border ${
              isScrolled 
                ? "bg-[#030814]/60 backdrop-blur-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[0.98]" 
                : "bg-transparent border-transparent"
            }`}
         >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] group-hover:scale-110 group-hover:rotate-12 transition-all">
                <Zap size={20} className="text-white fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Alpha Node</span>
                 <span className="text-[9px] font-black text-indigo-400 tracking-[0.3em] uppercase leading-none mt-1">Institutional</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-12 bg-white/[0.03] border border-white/5 px-10 py-3 rounded-full backdrop-blur-md">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em] italic relative group/link"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-500 group-hover/link:w-full transition-all" />
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-6">
              <Link href="/signin" className="text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em] italic">
                Uplink
              </Link>
              <Link 
                href="/dashboard"
                className="px-8 py-3 bg-indigo-600 text-white rounded-[1rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2 group italic"
              >
                Access Terminal
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button 
              className="lg:hidden text-white p-2 rounded-xl bg-white/5 border border-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
         </motion.div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="lg:hidden fixed inset-x-6 top-32 bg-[#050b18]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 z-[101] shadow-2xl pointer-events-auto"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-xl font-black text-white uppercase tracking-widest italic"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/5" />
              <div className="flex flex-col gap-4">
                 <Link href="/signin" className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center italic">
                    Uplink Account
                 </Link>
                 <Link 
                    href="/dashboard"
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest text-center italic shadow-2xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                 >
                    Launch Alpha Console
                 </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
