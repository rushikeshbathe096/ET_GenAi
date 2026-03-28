"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sun, Moon, Search, LayoutDashboard, Eye, Radio, 
  BarChart2, Settings, HelpCircle, User, Plus, TrendingUp, SlidersHorizontal
} from "lucide-react";
import SignalCard from "../components/SignalCard";

interface Signal {
  ticker: string;
  company: string;
  confluence_score: number;
  confidence: string;
  risk: string;
  horizon: string;
  why_now: string;
  price: number;
}

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

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const filteredSignals = signals.filter(
    (s) =>
      s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const averageScore = signals.length 
    ? (signals.reduce((acc, curr) => acc + curr.confluence_score, 0) / signals.length).toFixed(2)
    : "0.00";

  // Mock logo colors based on ticker
  const getLogoColors = (ticker: string) => {
    if (ticker === 'TITAN') return "bg-blue-600";
    if (ticker === 'INFY') return "bg-slate-800 dark:bg-black";
    if (ticker === 'HDFC') return "bg-green-600";
    return "bg-indigo-600";
  };

  // Theming classes objects for easy reading
  const theme = {
    appBg: isDarkMode ? "bg-[#13151a]" : "bg-slate-50",
    sidebarBg: isDarkMode ? "bg-[#13151a]" : "bg-white",
    cardBg: isDarkMode ? "bg-[#1c1e24]" : "bg-white",
    innerBoxBg: isDarkMode ? "bg-[#252830]" : "bg-slate-100",
    textMain: isDarkMode ? "text-white" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    hoverText: isDarkMode ? "hover:text-white" : "hover:text-slate-900",
    border: isDarkMode ? "border-slate-800/50" : "border-slate-200",
    inputBg: isDarkMode ? "bg-[#1c1e24]" : "bg-slate-100",
  };

  return (
    <div className={`flex min-h-screen ${theme.appBg} ${theme.textMain} transition-colors duration-300 font-sans`}>
      
      {/* SIDEBAR */}
      <aside className={`w-65 hidden md:flex flex-col py-6 px-4 ${theme.sidebarBg} border-r ${theme.border} z-20`}>
        {/* Logo */}
        <div className="px-4 mb-10 flex items-center gap-2">
          <Link href="/" className="font-black text-2xl tracking-tighter flex items-center transition-opacity hover:opacity-80">
            Intelligence<span className={isDarkMode ? "text-white" : "text-slate-900"}>Radar</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2">
          <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-semibold border-l-4 border-indigo-500`}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>
          <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${theme.textMuted} ${theme.hoverText} transition-colors font-medium border-l-4 border-transparent`}>
            <Eye className="w-5 h-5" />
            Watchlist
          </a>
          <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${theme.textMuted} ${theme.hoverText} transition-colors font-medium border-l-4 border-transparent`}>
            <Radio className="w-5 h-5" />
            Signals
          </a>
          <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${theme.textMuted} ${theme.hoverText} transition-colors font-medium border-l-4 border-transparent`}>
            <BarChart2 className="w-5 h-5" />
            Analysis
          </a>
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-2 mb-6">
          <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${theme.textMuted} ${theme.hoverText} transition-colors font-medium`}>
            <Settings className="w-5 h-5" />
            Settings
          </a>
          <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${theme.textMuted} ${theme.hoverText} transition-colors font-medium`}>
            <HelpCircle className="w-5 h-5" />
            Support
          </a>
        </div>

        {/* Status indicator */}
        <div className={`mt-auto ${theme.innerBoxBg} rounded-xl p-4 flex flex-col gap-2 border ${theme.border}`}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</span>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Signals Active
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAV */}
        <header className={`h-20 flex items-center justify-between px-8 border-b ${theme.border} z-10 sticky top-0 ${theme.appBg}/80 backdrop-blur-md`}>
          <div className="flex-1 max-w-md relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`} />
            <input 
              type="text" 
              placeholder="Search markets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl ${theme.inputBg} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium transition-colors`}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  systemStatus === "Online"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                System: {systemStatus}
              </span>
              <button
                onClick={onRefresh}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Refresh Data
              </button>
            </div>

            {pipelineMessage && (
              <div className={`text-sm font-semibold ${pipelineMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'} animate-pulse`}>
                {pipelineMessage.text}
              </div>
            )}
            
            <button 
              onClick={handleRunPipeline}
              disabled={isRunningPipeline}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-lg ${
                isRunningPipeline 
                  ? 'bg-indigo-500/50 cursor-not-allowed text-white shadow-indigo-500/20' 
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/30'
              }`}
            >
              {isRunningPipeline ? 'Running...' : 'Run Pipeline'}
            </button>

            <button className={`flex items-center gap-2 text-sm font-semibold ${theme.textMuted} ${theme.hoverText} transition-colors`}>
              <SlidersHorizontal className="w-4 h-4" />
              Sort
            </button>
            <button 
              onClick={toggleTheme}
              className={`flex items-center gap-2 text-sm font-semibold ${theme.textMuted} ${theme.hoverText} transition-colors`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDarkMode ? "Light" : "Dark"}
            </button>
            <div className={`w-9 h-9 rounded-full ${theme.innerBoxBg} flex items-center justify-center border ${theme.border}`}>
              <User className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
        </header>

        <div className="px-8 py-2 text-sm text-gray-500">
          Last updated: {lastUpdated ?? "..."}
        </div>

        {/* SCROLLABLE MAIN */}
        <main className="flex-1 overflow-auto p-8">
          
          <div className="max-w-6xl mx-auto">
            {/* HERO SECTION */}
            <div className={`${theme.cardBg} rounded-4xl p-10 mb-8 flex flex-col md:flex-row justify-between md:items-center border ${theme.border} shadow-sm transition-colors`}>
              <div className="max-w-xl">
                <div className="inline-block px-3 py-1 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                  Market Sentiment
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight leading-tight">
                  Current Portfolio Radar Insights
                </h1>
                <p className={`${theme.textMuted} text-base font-medium leading-relaxed`}>
                  System-wide signal alignment across major tech indices. High confluence levels indicate a synchronized market momentum trend within the 24-hour window.
                </p>
              </div>

              <div className="mt-8 md:mt-0 flex flex-col items-start md:items-end">
                <span className={`text-[11px] font-bold tracking-widest uppercase ${theme.textMuted} mb-2`}>Avg Confluence</span>
                <span className="text-7xl lg:text-8xl font-black bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400 tracking-tighter">
                  {averageScore}
                </span>
                <div className={`flex items-center gap-1.5 mt-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} text-sm font-bold`}>
                  <TrendingUp className="w-4 h-4" />
                  +4.2% Strength
                </div>
              </div>
            </div>

            {/* SIGNAL CARDS GRID */}
            {loading ? (
              <div className="p-6 text-lg animate-pulse">
                Loading latest signals...
              </div>
            ) : error ? (
              <div className="p-6">
                <h2 className="text-red-500 text-lg font-semibold">Unable to load signals</h2>
                <p className="text-gray-500">Please check backend connection.</p>
              </div>
            ) : signals.length === 0 ? (
              <div className="p-6 text-gray-500">No signals available yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredSignals.map((signal) => (
                <SignalCard 
                  key={signal.ticker}
                  company={signal.company}
                  ticker={signal.ticker}
                  confluence_score={signal.confluence_score}
                  confidence={signal.confidence}
                  risk={signal.risk}
                  horizon={signal.horizon}
                  why_now={signal.why_now}
                  price={signal.price}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
            )}

            {/* BOTTOM MINI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Portfolio Beta", val: "1.18", color: theme.textMain },
                { title: "Alpha Signal", val: "Strong", color: isDarkMode ? "text-sky-400" : "text-sky-600" },
                { title: "Market Cap Focused", val: "Mega Cap", color: theme.textMain },
                { title: "Next Rebalance", val: "14 Days", color: theme.textMain }
              ].map((stat, i) => (
                <div key={i} className={`${theme.cardBg} border ${theme.border} rounded-3xl p-6 flex flex-col justify-center`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted} mb-2`}>{stat.title}</span>
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.val}</span>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 z-50">
        <Plus className="w-6 h-6" />
      </button>

    </div>
  );
}
