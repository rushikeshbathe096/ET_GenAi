"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "../components/DashboardLayout";
import DashboardSection from "../components/DashboardSection";
import StockDetailDrawer, { type StockDetailSignal } from "../components/StockDetailDrawer";
import { 
  Sun, Moon, Search, LayoutDashboard, Eye, Radio,
  Settings, HelpCircle, User, SlidersHorizontal,
  Bell, Copy, Sparkles, Activity, RotateCcw, ChevronDown
} from "lucide-react";

interface Signal {
  symbol: string;
  company: string;
  confluence_score: number;
  confidence: string;
  risk: string;
  horizon: string;
  why_now: string;
  price: number;
  current_price?: number;
  date?: string;
  source_url?: string;
  filing_signals?: StockDetailSignal["filing_signals"];
  technical_patterns?: StockDetailSignal["technical_patterns"];
  news_headlines?: string[];
  company_news?: string[];
  sector_news?: string[];
  global_news?: string[];
  price_history?: StockDetailSignal["price_history"];
}

const decisionSummaryDummy = {
  symbol: "TITAN",
  action: "STRONG BUY",
  confidence: "HIGH",
  reason: "Promoter buying + institutional activity",
};

const getSentiment = (decision: string) => {
  const d = decision?.toString().toUpperCase();
  if (d === "BUY" || d === "STRONG_BUY") return "BULLISH";
  if (d === "SELL" || d === "STRONG_SELL") return "BEARISH";
  return "SIDEWAYS";
};

export default function DashboardClient({ 
  signals, 
  loading,
  error,
  systemStatus,
  lastUpdated,
  onRefresh
}: { 
  signals: Signal[]; 
  loading: boolean;
  error: string | null;
  systemStatus: string;
  lastUpdated: string | null;
  onRefresh: () => Promise<void>;
}) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [leaderboardView, setLeaderboardView] = useState<"gainers" | "losers">("gainers");
  const [signalFilter, setSignalFilter] = useState<"ALL" | "BUY" | "SELL" | "HOLD">("ALL");
  const [sortBy, setSortBy] = useState<"score" | "priceDesc" | "priceAsc" | "tickerAsc">("score");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  // Pipeline Execution State
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineMessage, setPipelineMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const handleRunPipeline = async () => {
    setIsRunningPipeline(true);
    setPipelineMessage(null);
    try {
      const res = await fetch("http://localhost:8000/pipeline/run", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "API responded with an error");
      setPipelineMessage({ text: `${data.message} (${data.duration})`, type: "success" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setPipelineMessage({ text: `Failed to trigger pipeline: ${message}`, type: "error" });
    } finally {
      setIsRunningPipeline(false);
      setTimeout(() => setPipelineMessage(null), 5000);
    }
  };

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("dashboard-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;
    setIsDarkMode(shouldUseDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("dashboard-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const filteredSignals = signals.filter(
    (s) =>
      s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const watchlistSignals = filteredSignals.slice(0, 4);
  const topGainers = [...signals]
    .sort((a, b) => b.confluence_score - a.confluence_score)
    .slice(0, 5);
  const topLosers = [...signals]
    .sort((a, b) => a.confluence_score - b.confluence_score)
    .slice(0, 5);
  const leaderboardItems = leaderboardView === "gainers" ? topGainers : topLosers;

  const signalAccuracy = filteredSignals.length
    ? Math.min(
        99.9,
        (filteredSignals.reduce((acc, curr) => acc + curr.confluence_score, 0) /
          filteredSignals.length) * 10
      ).toFixed(1)
    : "0.0";

  const getSignalAction = (signal: Signal) => {
    if (signal.confluence_score >= 8.5) return "STRONG BUY";
    if (signal.confluence_score >= 7) return "BUY";
    if (signal.confluence_score <= 4.5) return "STRONG SELL";
    return "HOLD";
  };

  const getActionColor = (action: string) => {
    if (action.includes("SELL")) return "text-rose-400 border-rose-500/30 bg-rose-500/10";
    if (action.includes("BUY")) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    return "text-amber-300 border-amber-400/30 bg-amber-500/10";
  };

  const getSignalCategory = (signal: Signal): "BUY" | "SELL" | "HOLD" => {
    const action = getSignalAction(signal);
    if (action.includes("BUY")) return "BUY";
    if (action.includes("SELL")) return "SELL";
    return "HOLD";
  };

  const categoryFilteredSignals =
    signalFilter === "ALL"
      ? filteredSignals
      : filteredSignals.filter((signal) => getSignalCategory(signal) === signalFilter);

  const sortedSignals = [...categoryFilteredSignals].sort((a, b) => {
    if (sortBy === "priceDesc") return b.price - a.price;
    if (sortBy === "priceAsc") return a.price - b.price;
    if (sortBy === "tickerAsc") return a.symbol.localeCompare(b.symbol);
    return b.confluence_score - a.confluence_score;
  });

  const gridSignals = sortedSignals.slice(0, 4);

  const sortByLabel =
    sortBy === "score"
      ? "Signal Score"
      : sortBy === "priceDesc"
        ? "Price High-Low"
        : sortBy === "priceAsc"
          ? "Price Low-High"
          : "Ticker A-Z";

  const getMockMove = (score: number) => `${(score - 6).toFixed(1)}%`;

  const getLeaderboardMove = (signal: Signal, view: "gainers" | "losers") => {
    if (view === "gainers") {
      return `+${Math.max(0.5, signal.confluence_score - 5).toFixed(1)}%`;
    }
    return `-${Math.max(0.5, 5 - signal.confluence_score).toFixed(1)}%`;
  };

  // Theming classes objects for easy reading
  const theme = {
    appBg: isDarkMode
      ? "bg-[radial-gradient(circle_at_top_left,#121b4f_0%,#071024_42%,#050913_100%)]"
      : "bg-slate-100",
    sidebarBg: isDarkMode ? "bg-[#040a1a]/95" : "bg-white",
    cardBg: isDarkMode ? "bg-[#0c1532]/85" : "bg-white",
    innerBoxBg: isDarkMode ? "bg-[#132145]" : "bg-slate-100",
    textMain: isDarkMode ? "text-slate-50" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    hoverText: isDarkMode ? "hover:text-white" : "hover:text-slate-900",
    border: isDarkMode ? "border-indigo-500/20" : "border-slate-200",
    inputBg: isDarkMode ? "bg-[#02091f]" : "bg-slate-100",
  };

  return (
    <div className={`flex h-screen overflow-hidden ${theme.appBg} ${theme.textMain} transition-colors duration-300 font-sans`}>
      
      {/* SIDEBAR */}
      <aside className={`w-64 h-screen hidden md:flex flex-col py-6 px-4 ${theme.sidebarBg} border-r ${theme.border} z-20 shrink-0`}>
        {/* Logo */}
        <div className="px-2 mb-8 flex items-center gap-2">
          <Link href="/" className="font-black text-xl tracking-tight flex items-center transition-opacity hover:opacity-80 text-indigo-400">
            IntelligenceRadar
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold border ${theme.border}`}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>
          <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${theme.textMuted} ${theme.hoverText} transition-colors font-medium`}>
            <Radio className="w-5 h-5" />
            Market Pulse
          </a>
          <Link href="/signal-radar" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${theme.textMuted} ${theme.hoverText} transition-colors font-medium`}>
            <Eye className="w-5 h-5" />
            Signal Radar
          </Link>
          <Link href="/analytics" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${theme.textMuted} ${theme.hoverText} transition-colors font-medium`}>
            <SlidersHorizontal className="w-5 h-5" />
            Analytics
          </Link>
        </nav>

        <div className="mt-auto space-y-1 pt-6">
          <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${theme.textMuted} ${theme.hoverText} transition-colors text-sm`}>
            <HelpCircle className="w-4 h-4" />
            Support
          </a>
          <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${theme.textMuted} ${theme.hoverText} transition-colors text-sm`}>
            <Settings className="w-4 h-4" />
            Logout
          </a>
          <div className={`mx-4 mt-4 rounded-lg px-3 py-2 border ${theme.border} ${theme.innerBoxBg}`}>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System {systemStatus}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP NAV */}
        <header className={`h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 border-b ${theme.border} z-10 sticky top-0 bg-[#040a1a]/80 backdrop-blur-md`}>
          <div className="flex items-center gap-7">
            <div className="hidden md:flex items-center gap-4 lg:gap-5 text-[11px] lg:text-sm">
              <Link href="#" className="text-indigo-300 font-semibold">Dashboard</Link>
              <Link href="#" className={`${theme.textMuted} hover:text-white`}>Market Pulse</Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-72 relative hidden sm:block">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`} />
            <input 
              type="text" 
              placeholder="Search Assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-2 rounded-lg ${theme.inputBg} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-xs font-medium transition-colors`}
            />
          </div>

            <button className={`p-2 rounded-lg border ${theme.border} ${theme.textMuted} hover:text-white`}>
              <Bell className="w-4 h-4" />
            </button>
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg border ${theme.border} ${theme.textMuted} hover:text-white`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onRefresh}
              className={`p-2 rounded-lg border ${theme.border} ${theme.textMuted} hover:text-white`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              onClick={handleRunPipeline}
              disabled={isRunningPipeline}
              className={`px-2.5 sm:px-3 py-2 rounded-lg text-[11px] sm:text-xs font-semibold border ${theme.border} ${
                isRunningPipeline ? "bg-indigo-500/20 text-indigo-200" : "bg-indigo-500/70 hover:bg-indigo-500 text-white"
              }`}
            >
              {isRunningPipeline ? "Running" : "Run"}
            </button>
            <div className={`w-8 h-8 rounded-full ${theme.innerBoxBg} flex items-center justify-center border ${theme.border}`}>
              <User className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
        </header>

        {pipelineMessage && (
          <div className={`px-3 sm:px-4 lg:px-6 py-2 text-[11px] sm:text-xs font-semibold ${pipelineMessage.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
            {pipelineMessage.text}
          </div>
        )}

        {/* SCROLLABLE MAIN */}
        <main className="hide-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
          <DashboardLayout>
            <DashboardSection
              title="Decision Summary"
              className={`${theme.cardBg} border ${theme.border} rounded-2xl p-6 md:p-7 shadow-[0_0_0_1px_rgba(99,102,241,0.08),0_10px_35px_rgba(3,7,18,0.35)]`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-[10px] font-bold tracking-[0.2em] uppercase">Today&apos;s Market Insight</span>
                    <span className="text-[11px] sm:text-xs text-cyan-300 font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Decision Summary</span>
                  </div>
                  <h1 className="text-[clamp(1.6rem,4.3vw,3.1rem)] font-black leading-[1.05] mb-3 tracking-tight">
                    Top Opportunity: <span className="text-indigo-400">{decisionSummaryDummy.symbol}</span> - {getSentiment(decisionSummaryDummy.action)}
                  </h1>
                  <p className={`${theme.textMuted} max-w-2xl text-[13px] sm:text-sm lg:text-[15px] leading-relaxed mb-5`}>
                    Temporary UI testing data only. Backend logic remains unchanged.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">Action</p>
                      <p className="text-base sm:text-lg font-bold text-emerald-400">{getSentiment(decisionSummaryDummy.action)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">Confidence</p>
                      <p className="text-base sm:text-lg font-bold">{decisionSummaryDummy.confidence}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">Reason</p>
                      <p className="text-sm sm:text-base text-indigo-300 font-semibold">{decisionSummaryDummy.reason}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="rounded-2xl border border-indigo-500/30 bg-[#030a1d]/90 p-5 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[11px] sm:text-xs text-slate-400">Current Price</p>
                        <p className="text-[clamp(1.4rem,3.4vw,2rem)] font-bold">$1,420.50</p>
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2 py-1 rounded-md">+4.2%</span>
                    </div>
                    <div className="h-24 flex items-end gap-1 mb-4">
                      {[25, 35, 30, 45, 60, 78].map((h, i) => (
                        <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-sm ${i > 2 ? "bg-indigo-500/70" : "bg-slate-700/80"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </DashboardSection>

            <DashboardSection title="Filters" className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                {[
                  { label: "All Signals", value: "ALL" as const },
                  { label: "BULLISH", value: "BUY" as const },
                  { label: "BEARISH", value: "SELL" as const },
                  { label: "SIDEWAYS", value: "HOLD" as const },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setSignalFilter(tab.value)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold border transition-colors ${
                      signalFilter === tab.value
                        ? "bg-indigo-500 text-white border-indigo-400"
                        : `${theme.cardBg} ${theme.border} text-slate-300 hover:text-white`
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] sm:text-xs border ${theme.border} ${theme.cardBg} text-slate-300 hover:text-white`}
                >
                  Sort by: {sortByLabel}
                  <SlidersHorizontal className="w-3 h-3" />
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isSortMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-44 rounded-lg border ${theme.border} ${theme.cardBg} shadow-xl z-20 p-1`}>
                    {[
                      { key: "score", label: "Signal Score" },
                      { key: "priceDesc", label: "Price High-Low" },
                      { key: "priceAsc", label: "Price Low-High" },
                      { key: "tickerAsc", label: "Ticker A-Z" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setSortBy(option.key as "score" | "priceDesc" | "priceAsc" | "tickerAsc");
                          setIsSortMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                          sortBy === option.key
                            ? "bg-indigo-500/20 text-indigo-200"
                            : `${theme.textMuted} hover:bg-indigo-500/10 hover:text-white`
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </DashboardSection>

            <DashboardSection title="Opportunities" className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div className="xl:col-span-9">
                {loading ? (
                  <div className={`${theme.cardBg} border ${theme.border} rounded-2xl p-6 text-sm ${theme.textMuted}`}>Loading latest signals...</div>
                ) : error ? (
                  <div className={`${theme.cardBg} border ${theme.border} rounded-2xl p-6`}>
                    <h2 className="text-rose-400 text-lg font-semibold">Unable to load signals</h2>
                    <p className={`${theme.textMuted} text-sm`}>{error}</p>
                  </div>
                ) : gridSignals.length === 0 ? (
                  <div className={`${theme.cardBg} border ${theme.border} rounded-2xl p-6 text-sm ${theme.textMuted}`}>
                    No stocks found for {signalFilter === "ALL" ? "the current view" : `${signalFilter}`}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {gridSignals.map((signal) => {
                      const action = getSignalAction(signal);
                      const move = getMockMove(signal.confluence_score);
                      const positive = !move.startsWith("-");
                      return (
                        <article
                          key={signal.symbol}
                          className={`${theme.cardBg} border ${theme.border} rounded-2xl p-4 cursor-pointer hover:border-indigo-400/40 transition-colors`}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedSignal(signal)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedSignal(signal);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-[clamp(1rem,1.7vw,1.2rem)] leading-none">{signal.company.toUpperCase()}</p>
                              <p className="text-[11px] uppercase tracking-wider text-slate-500">{signal.symbol}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-1 rounded-md border font-bold ${getActionColor(action)}`}>{getSentiment(action)}</span>
                          </div>

                          <div className="flex items-end justify-between mb-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">Price Impact</p>
                              <p className="text-[clamp(1.35rem,2.9vw,1.9rem)] font-bold leading-none">${signal.price.toFixed(2)} <span className={`text-xs sm:text-sm ${positive ? "text-emerald-400" : "text-rose-400"}`}>{move}</span></p>
                            </div>
                            <div className="h-10 w-9 flex items-end gap-0.5">
                              {[35, 50, 70, 88].map((h, i) => (
                                <div key={i} style={{ height: `${h}%` }} className={`w-1.5 rounded-sm ${positive ? "bg-indigo-400" : "bg-rose-400"}`} />
                              ))}
                            </div>
                          </div>

                          <div className="rounded-lg border border-indigo-500/20 bg-[#08112a] px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">Why?</p>
                            <p className="text-xs text-slate-300 italic line-clamp-2">{signal.why_now}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              <aside className="xl:col-span-3 space-y-4">
                <DashboardSection title="Watchlist" className={`${theme.cardBg} border ${theme.border} rounded-2xl p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Your Watchlist</h3>
                    <button className="text-[10px] uppercase tracking-[0.2em] text-indigo-300">Edit</button>
                  </div>
                  <div className="space-y-2">
                    {watchlistSignals.length === 0 ? (
                      <p className={`text-xs ${theme.textMuted}`}>No tracked symbols.</p>
                    ) : (
                      watchlistSignals.map((signal) => (
                        <div key={signal.symbol} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />{signal.symbol}</span>
                          <span className={`text-[10px] font-semibold ${getSignalAction(signal).includes("BUY") ? "text-emerald-400" : getSignalAction(signal).includes("SELL") ? "text-rose-400" : "text-amber-300"}`}>
                            {getSentiment(getSignalAction(signal))}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    href="/watchlist"
                    className={`block w-full mt-3 rounded-lg border border-dashed ${theme.border} py-2 text-xs text-center ${theme.textMuted} hover:text-white`}
                  >
                    + Add Ticker
                  </Link>
                </DashboardSection>

                <DashboardSection title="Top Movers" className={`${theme.cardBg} border ${theme.border} rounded-2xl p-4`}>
                  <div className="flex mb-3 text-[10px] uppercase tracking-[0.2em] gap-2">
                    <button
                      type="button"
                      onClick={() => setLeaderboardView("gainers")}
                      className={`px-2 py-1 rounded-md border ${leaderboardView === "gainers" ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/10" : `text-slate-500 ${theme.border}`}`}
                    >
                      Gainers
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderboardView("losers")}
                      className={`px-2 py-1 rounded-md border ${leaderboardView === "losers" ? "text-rose-300 border-rose-500/40 bg-rose-500/10" : `text-slate-500 ${theme.border}`}`}
                    >
                      Losers
                    </button>
                  </div>
                  <div className="space-y-2 mb-3">
                    {leaderboardItems.length === 0 ? (
                      <p className={`text-xs ${theme.textMuted}`}>No stocks available.</p>
                    ) : (
                      leaderboardItems.map((signal) => (
                        <button
                          key={signal.symbol}
                          type="button"
                          onClick={() => setSearchQuery(signal.symbol)}
                          className={`w-full flex items-center justify-between text-sm rounded-md px-2 py-1.5 border ${theme.border} hover:border-indigo-400/50 hover:bg-indigo-500/10 transition-colors text-left`}
                        >
                          <span className="font-semibold text-sm">{signal.symbol}</span>
                          <span className={`font-semibold ${leaderboardView === "gainers" ? "text-emerald-400" : "text-rose-400"}`}>
                            {getLeaderboardMove(signal, leaderboardView)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-200">
                    <p className="font-semibold mb-1">Circuit Breaker Alert</p>
                    <p>Additional trading guardrails are active for momentum-heavy names.</p>
                  </div>
                </DashboardSection>
              </aside>
            </DashboardSection>

            <DashboardSection title="Quick Stats" className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3">
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-4 flex items-center gap-3`}>
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Active Signals</p>
                  <p className="text-[clamp(1.3rem,3vw,1.9rem)] font-bold leading-none">{filteredSignals.length || 0} Active</p>
                </div>
              </div>
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-4 flex items-center gap-3`}>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Signal Accuracy</p>
                  <p className="text-[clamp(1.3rem,3vw,1.9rem)] font-bold leading-none">{signalAccuracy}% Past 30d</p>
                </div>
              </div>
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-4 flex items-center gap-3`}>
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                  <Copy className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Last Scan</p>
                  <p className="text-[clamp(1.3rem,3vw,1.9rem)] font-bold leading-none">{lastUpdated ?? "..."}</p>
                </div>
              </div>
            </DashboardSection>
          </DashboardLayout>
        </main>
      </div>

      <StockDetailDrawer
        signal={selectedSignal}
        isOpen={Boolean(selectedSignal)}
        onClose={() => setSelectedSignal(null)}
        theme={theme}
        getSignalAction={(signal) => getSignalAction(signal as Signal)}
      />
    </div>
  );
}
