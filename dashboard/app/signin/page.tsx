"use client"

import { useState, useEffect, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    setMounted(true)
    const savedTheme = window.localStorage.getItem("landing-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
    } else {
      setIsDarkMode(prefersDark)
    }
  }, [])

  const theme = {
    pageBg: isDarkMode ? "bg-[#030814]" : "bg-[#eef3ff]",
    textMain: isDarkMode ? "text-slate-100" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-300" : "text-slate-600",
    textSoft: isDarkMode ? "text-slate-400" : "text-slate-500",
    accentText: isDarkMode ? "text-cyan-300" : "text-cyan-700",
    glowOpacity: isDarkMode ? "opacity-60" : "opacity-100",
    glowBg: isDarkMode
      ? "[background:radial-gradient(circle_at_15%_20%,#1d4ed833_0%,transparent_35%),radial-gradient(circle_at_80%_10%,#6366f140_0%,transparent_30%),radial-gradient(circle_at_40%_60%,#0f172a_0%,#030814_55%)]"
      : "[background:radial-gradient(circle_at_15%_20%,#bfdbfe_0%,transparent_35%),radial-gradient(circle_at_80%_10%,#c7d2fe_0%,transparent_30%),radial-gradient(circle_at_40%_60%,#f8fbff_0%,#eef3ff_55%)]",
    cardBg: isDarkMode ? "bg-[#050d1c] border-white/10" : "bg-white border-slate-200",
    inputBg: isDarkMode ? "bg-white/5 border-white/10 text-white placeholder-slate-500 my-1 focus:border-cyan-400" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 my-1 focus:border-cyan-500",
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg("")

    // Very basic frontend validation
    if (!email || !password) {
      setErrorMsg("Please enter both email and password")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Invalid email or password")
      }

      // Success, token received
      window.localStorage.setItem("token", data.access_token)
      router.push("/dashboard")
      
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme.pageBg} ${theme.textMain} font-sans transition-colors duration-300 px-4`}>
      <div className={`pointer-events-none fixed inset-0 ${theme.glowOpacity} ${theme.glowBg}`} />
      
      {/* Background orbs from landing */}
      <motion.div
        className="pointer-events-none fixed -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none fixed -right-20 top-36 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -20, 0], scale: [1.1, 0.95, 1.1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="z-10 w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className={`text-2xl font-bold tracking-tight ${theme.textMain} transition-opacity hover:opacity-80`}>
            IntelligenceRadar
          </Link>
          <p className={`mt-2 text-sm ${theme.textMuted}`}>Enter the kinetic sentinel engine.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`rounded-3xl border p-8 shadow-2xl relative overflow-hidden ${theme.cardBg}`}
        >
          {isLoading && (
            <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
               <motion.div 
                 className={`h-full ${isDarkMode ? "bg-cyan-400" : "bg-cyan-600"}`}
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
               />
            </div>
          )}

          <h1 className="text-2xl font-bold mb-6">Sign In</h1>
          
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
            >
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme.textSoft}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textSoft}`} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-xl border pl-12 pr-4 py-3 text-sm transition-colors outline-none ${theme.inputBg}`}
                  placeholder="agent@nexus.io"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-xs font-semibold uppercase tracking-wider ${theme.textSoft}`}>
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textSoft}`} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl border pl-12 pr-4 py-3 text-sm transition-colors outline-none ${theme.inputBg}`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { y: -2, scale: 1.01 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_#6366f166] transition hover:bg-indigo-400 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Dashboard <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className={`mt-8 pt-6 border-t ${isDarkMode ? "border-white/10" : "border-slate-200"} text-center`}>
            <p className={`text-sm ${theme.textMuted}`}>
              Don't have an account?{" "}
              <Link href="/signup" className={`font-semibold hover:underline ${theme.accentText}`}>
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
