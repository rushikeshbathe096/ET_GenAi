"use client"

import { useEffect, useState, type MouseEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, ShieldCheck, Sparkles, Activity, ChevronRight, Sun, Moon } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

const features = [
  {
    icon: Sparkles,
    title: "Market Sentiment Radar",
    description:
      "Aggregates social, news, and institutional signals to map fast-moving shifts in market psychology.",
  },
  {
    icon: Activity,
    title: "Real-time Signal Alignment",
    description:
      "Detects when technical, macro, and derivative indicators converge at key price-discovery zones.",
  },
  {
    icon: BarChart3,
    title: "Multi-index Analysis",
    description:
      "Tracks cross-index confluence factors to identify hidden inter-market relationships.",
  },
]

const testimonials = [
  {
    quote:
      "IntelligenceRadar transformed how our desk visualizes inter-market flows. The confluence score is now a primary filter.",
    name: "Marcus Thorne",
    role: "Lead Strategist",
  },
  {
    quote:
      "The speed of signal discovery is unmatched. We catch rotations minutes before broader market recognition.",
    name: "Elena Voss",
    role: "Independent Alpha Generator",
  },
  {
    quote:
      "A technical marvel. The Sentinel surfaces edge-quality setups with excellent context clarity.",
    name: "Julian R.",
    role: "CTO, Nexus Derivatives",
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return true
    }

    const savedTheme = window.localStorage.getItem("landing-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    return savedTheme ? savedTheme === "dark" : prefersDark
  })
  const [showIntro, setShowIntro] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    window.localStorage.setItem("landing-theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowIntro(false)
    }, 950)

    return () => window.clearTimeout(timer)
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
    titleGradient: isDarkMode
      ? "from-indigo-300 via-sky-300 to-cyan-300"
      : "from-indigo-700 via-sky-700 to-cyan-700",
    heroBadge: isDarkMode
      ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
      : "border-cyan-300 bg-cyan-100 text-cyan-800",
    featureIcon: isDarkMode
      ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-300"
      : "border-cyan-300 bg-cyan-100 text-cyan-800",
    panelBg: isDarkMode ? "bg-white/5 border-white/10" : "bg-white/80 border-slate-200/80",
    cardBg: isDarkMode ? "bg-[#050d1c] border-white/10" : "bg-white border-slate-200",
    heroFrame: isDarkMode ? "bg-[#071427] border-white/15" : "bg-[#dfeaff] border-slate-200",
    lineChartBg: isDarkMode
      ? "bg-linear-to-b from-cyan-500/10 via-slate-950 to-slate-950 border-cyan-500/20"
      : "bg-linear-to-b from-cyan-100 via-sky-50 to-white border-cyan-200",
    sectionBg: isDarkMode ? "bg-[#050d1c] border-white/10" : "bg-[#f8fbff] border-slate-200",
    ctaBg: isDarkMode ? "from-[#131f39] to-[#0f1427] border-white/15" : "from-[#dbe9ff] to-[#f2f7ff] border-slate-200",
  }

  const reveal = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const stagger = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const sectionViewport = { once: true, amount: 0.45, margin: "0px 0px -12% 0px" }

  const handleGetStartedClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    if (isNavigating) {
      return
    }

    setIsNavigating(true)
    window.setTimeout(() => {
      router.push("/dashboard")
    }, 620)
  }

  const handleLandingLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    window.location.assign("/")
  }

  return (
    <div className={`min-h-screen ${theme.pageBg} ${theme.textMain} font-sans transition-colors duration-300`}>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className={`fixed inset-0 z-[120] flex items-center justify-center ${isDarkMode ? "bg-[#030814]" : "bg-[#eef3ff]"}`}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.76, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="text-center"
            >
              <div className={`text-4xl font-black tracking-tight ${theme.textMain}`}>IntelligenceRadar</div>
              <motion.div
                className={`mx-auto mt-2 h-1 w-28 rounded-full ${isDarkMode ? "bg-cyan-300" : "bg-cyan-600"}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNavigating && (
          <motion.div
            className={`fixed inset-0 z-[130] ${isDarkMode ? "bg-[#040916]" : "bg-[#e6efff]"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className={`absolute inset-0 ${isDarkMode ? "bg-linear-to-r from-cyan-500/15 via-indigo-500/15 to-transparent" : "bg-linear-to-r from-cyan-300/40 via-indigo-300/35 to-transparent"}`}
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="flex h-full items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <p className={`text-xs uppercase tracking-[0.22em] ${theme.textSoft}`}>Launching</p>
                <p className={`mt-2 text-3xl font-black tracking-tight ${theme.textMain}`}>Dashboard</p>
                <motion.div
                  className={`mx-auto mt-4 h-1 w-40 rounded-full ${isDarkMode ? "bg-cyan-300" : "bg-cyan-700"}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`pointer-events-none fixed inset-0 ${theme.glowOpacity} ${theme.glowBg}`}
      />
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
      <motion.div
        className="pointer-events-none fixed bottom-8 left-1/3 h-52 w-52 rounded-full bg-sky-300/20 blur-3xl"
        animate={{ x: [0, 25, 0], y: [0, -30, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-8 lg:px-10"
        initial={{ opacity: 0, scale: 0.985, y: 18, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`mb-16 flex items-center justify-between rounded-2xl border px-6 py-4 backdrop-blur-xl ${theme.panelBg}`}
        >
          <Link
            href="/"
            onClick={handleLandingLogoClick}
            className={`text-xl font-bold tracking-tight ${theme.textMain} transition-opacity hover:opacity-80`}
          >
            IntelligenceRadar
          </Link>
          <nav className={`hidden items-center gap-8 text-sm ${theme.textMuted} md:flex`}>
            <a href="#features" className={`transition ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>
              Features
            </a>
            <a href="#score" className={`transition ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>
              Pricing
            </a>
            <a href="#about" className={`transition ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>
              About
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${isDarkMode ? "border-white/20 bg-white/5 text-slate-100 hover:border-white/40" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"}`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              {isDarkMode ? "Light" : "Dark"}
            </button>
            <Link
              href="/dashboard"
              onClick={handleGetStartedClick}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Get Started
            </Link>
          </div>
        </motion.header>

        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-20 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
        >
          <motion.div variants={reveal}>
            <motion.div
              variants={reveal}
              className={`mb-6 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${theme.heroBadge}`}
            >
              Live Market Synthesis
            </motion.div>
            <motion.h1 variants={reveal} className={`text-5xl font-black leading-[0.95] tracking-tight md:text-7xl ${theme.textMain}`}>
              AI-Powered
              <br />
              <span className={`bg-linear-to-r ${theme.titleGradient} bg-clip-text text-transparent`}>
                Market Confluence
              </span>
            </motion.h1>
            <motion.p variants={reveal} className={`mt-6 max-w-xl text-base leading-relaxed ${theme.textMuted}`}>
              The Kinetic Sentinel engine processes millions of data points to identify high-probability trade alignments across indices, sentiment, and volume in real-time.
            </motion.p>
            <motion.div variants={reveal} className="mt-8 flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  onClick={handleGetStartedClick}
                  className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_#6366f188] transition hover:bg-indigo-400"
                >
                  Get Started
                </Link>
              </motion.div>
              <motion.button
                type="button"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`rounded-xl border px-6 py-3 text-sm font-semibold transition ${isDarkMode ? "border-white/20 bg-white/5 text-slate-200 hover:border-white/40 hover:text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900"}`}
              >
                View Platform Demo
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div variants={reveal} className={`rounded-3xl border p-4 shadow-2xl shadow-indigo-950/20 ${theme.heroFrame}`}>
            <motion.div
              className={`h-90 overflow-hidden rounded-2xl border p-4 ${theme.lineChartBg}`}
              whileHover={{ scale: 1.01, rotateX: -1, rotateY: 1 }}
              transition={{ duration: 0.35 }}
            >
              <div className={`mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] ${theme.textSoft}`}>
                <span>Sentinel Overview</span>
                <span className={theme.accentText}>Signal 07</span>
              </div>
              <div className={`relative h-full rounded-xl border p-4 ${isDarkMode ? "border-white/10 bg-slate-950/70" : "border-slate-200 bg-white/80"}`}>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e91a_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e91a_1px,transparent_1px)] bg-size-[28px_28px]" />
                <motion.svg
                  viewBox="0 0 500 260"
                  className="relative h-full w-full opacity-90"
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: [0.4, 0.95, 0.6, 0.9] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.polyline
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    points="10,220 85,185 140,200 205,130 280,110 335,95 405,125 490,60"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.2, ease: "easeInOut" }}
                  />
                  <motion.polyline
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2"
                    points="10,200 95,205 175,150 255,170 325,125 390,145 490,100"
                    opacity="0.8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.7, ease: "easeInOut", delay: 0.2 }}
                  />
                </motion.svg>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          id="features"
          className="mb-20"
          initial="hidden"
          whileInView="show"
          viewport={sectionViewport}
          variants={stagger}
        >
          <motion.h2 variants={reveal} className={`mb-3 text-4xl font-bold tracking-tight ${theme.textMain}`}>Precision Intelligence</motion.h2>
          <motion.p variants={reveal} className={`mb-8 max-w-3xl ${theme.textMuted}`}>
            Advanced detection modules designed for institutional-grade market analysis and execution.
          </motion.p>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <motion.article
                key={title}
                variants={reveal}
                whileHover={{ y: -8, scale: 1.015 }}
                transition={{ duration: 0.25 }}
                className={`group rounded-2xl border p-6 transition hover:-translate-y-0.5 hover:border-cyan-400/30 ${theme.cardBg}`}
              >
                <motion.div
                  className={`mb-4 inline-flex rounded-xl border p-2.5 ${theme.featureIcon}`}
                  animate={{ rotate: [0, index % 2 === 0 ? 6 : -6, 0] }}
                  transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Icon size={18} />
                </motion.div>
                <h3 className={`mb-2 text-xl font-semibold ${theme.textMain}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{description}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="score"
          className={`mb-20 grid gap-10 rounded-3xl border p-7 lg:grid-cols-2 lg:p-10 ${theme.sectionBg}`}
          initial="hidden"
          whileInView="show"
          viewport={sectionViewport}
          variants={stagger}
        >
          <motion.div variants={reveal} className="rounded-2xl border border-cyan-500/20 bg-linear-to-br from-cyan-500/10 to-indigo-500/5 p-6">
            <div className={`mb-3 text-xs uppercase tracking-[0.2em] ${theme.accentText}`}>Confluence Snapshot</div>
            <div className="grid h-57.5 grid-cols-6 items-end gap-3">
              {[42, 58, 36, 67, 88, 79].map((value, index) => (
                <div key={index} className="flex h-full flex-col justify-end">
                  <motion.div
                    className="rounded-t-md bg-linear-to-t from-cyan-400 to-sky-300"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={reveal}>
            <h2 className={`mb-4 text-4xl font-bold tracking-tight ${theme.textMain}`}>The Confluence Score</h2>
            <p className={`mb-6 ${theme.textMuted}`}>
              Our proprietary algorithm distills thousands of variables into a single score. When the Sentinel identifies a high-confluence zone, it signals an elite-tier alignment of market forces.
            </p>
            <ul className="space-y-4 text-sm">
              <li className={`flex items-start gap-3 ${theme.textMuted}`}>
                <ShieldCheck className="mt-0.5 text-indigo-300" size={18} />
                <span>
                  <strong className={theme.textMain}>Dynamic Volatility Hedging:</strong> automatic sizing model tied to real-time ATR and liquidity depth.
                </span>
              </li>
              <li className={`flex items-start gap-3 ${theme.textMuted}`}>
                <ShieldCheck className="mt-0.5 text-indigo-300" size={18} />
                <span>
                  <strong className={theme.textMain}>Probabilistic Modeling:</strong> Monte Carlo simulations run in the background for every identified confluence zone.
                </span>
              </li>
            </ul>
          </motion.div>
        </motion.section>

        <motion.section
          id="about"
          className="mb-20"
          initial="hidden"
          whileInView="show"
          viewport={sectionViewport}
          variants={stagger}
        >
          <motion.h2 variants={reveal} className={`mb-8 text-center text-4xl font-bold tracking-tight ${theme.textMain}`}>Trusted by High-Alpha Units</motion.h2>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <motion.article
                key={item.name}
                variants={reveal}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.22 }}
                className={`rounded-2xl border p-6 ${theme.cardBg}`}
              >
                <div className={`mb-3 ${theme.accentText}`}>★★★★★</div>
                <p className={`mb-6 text-sm leading-relaxed ${theme.textMuted}`}>&ldquo;{item.quote}&rdquo;</p>
                <p className={`text-sm font-semibold ${theme.textMain}`}>{item.name}</p>
                <p className={`text-xs uppercase tracking-[0.12em] ${theme.textSoft}`}>{item.role}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={sectionViewport}
          variants={stagger}
          className={`mb-16 rounded-3xl border bg-linear-to-r px-8 py-12 text-center shadow-xl shadow-indigo-950/20 ${theme.ctaBg}`}
        >
          <motion.h2 variants={reveal} className={`text-4xl font-bold tracking-tight ${theme.textMain}`}>Deploy the Kinetic Sentinel</motion.h2>
          <motion.p variants={reveal} className={`mx-auto mt-3 max-w-2xl ${theme.textMuted}`}>
            Join 12,000+ analysts leveraging high-signal confluence intelligence across modern financial systems.
          </motion.p>
          <motion.div variants={reveal} className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/dashboard"
                onClick={handleGetStartedClick}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Get Started Now
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronRight size={16} />
                </motion.span>
              </Link>
            </motion.div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-xl border px-6 py-3 text-sm font-semibold transition ${isDarkMode ? "border-white/20 bg-white/5 text-slate-200 hover:border-white/40 hover:text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900"}`}
            >
              Talk to Institutional Sales
            </motion.button>
          </motion.div>
        </motion.section>

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={sectionViewport}
          transition={{ duration: 0.7 }}
          className={`grid gap-6 border-t py-8 text-sm md:grid-cols-4 ${isDarkMode ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-600"}`}
        >
          <div>
            <div className={`mb-2 font-semibold ${theme.textMain}`}>IntelligenceRadar</div>
            <p className={`text-xs leading-relaxed ${theme.textSoft}`}>
              Precision intelligence for high-alpha environments.
            </p>
          </div>
          <div>
            <div className={`mb-2 font-semibold ${theme.textMain}`}>Platform</div>
            <p>Market Radar</p>
            <p>Signal Align</p>
            <p>API Docs</p>
          </div>
          <div>
            <div className={`mb-2 font-semibold ${theme.textMain}`}>Company</div>
            <p>About</p>
            <p>Terms</p>
            <p>Privacy</p>
          </div>
          <div>
            <div className={`mb-2 font-semibold ${theme.textMain}`}>Contact</div>
            <p>Support</p>
            <p>Security</p>
            <p>Contact</p>
          </div>
        </motion.footer>
      </motion.div>
    </div>
  )
}
