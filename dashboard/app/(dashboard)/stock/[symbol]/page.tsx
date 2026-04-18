"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowLeft,
  Newspaper,
  Info,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink
} from "lucide-react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { getStock, Signal } from "../../../../utils/api";
import { formatPrice, formatPercent } from "../../../../utils/formatUtils";
import { normalizeScore } from "../../../../utils/signalUtils";
import CandlestickChart from "../../../../components/CandlestickChart";

export default function StockDetailPage() {
  const params = useParams();
  const symbol = params?.symbol as string;
  const router = useRouter();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsTab, setNewsTab] = useState<"company" | "sector" | "global">("company");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!symbol) return;
      try {
        setLoading(true);
        const data = await getStock(symbol);
        setSignal(data);
      } catch (err) {
        setError("Node unavailable.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;
    fetch(`http://localhost:8000/stock/${symbol}/history`)
      .then(r => r.json())
      .then(d => setHistory(d.history || []))
      .catch(() => setHistory([]));
  }, [symbol]);

  if (!symbol) return null;
  if (loading) return <LoadingSpinner />;

  if (error || !signal) {
    return (
      <div className="flex flex-col items-center justify-center py-32 rounded-4xl border border-dashed border-white/10 bg-white/5 backdrop-blur-md max-w-2xl mx-auto">
        <AlertCircle className="w-12 h-12 text-slate-500 mb-6" />
        <h2 className="text-xl font-black text-white italic uppercase tracking-widest leading-none mb-2">Signal Blocked</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8 italic">Telemetry unreachable for {symbol}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase tracking-widest text-[10px] transition-all"
        >
          <ArrowLeft size={14} />
          Return to Hub
        </button>
      </div>
    );
  }

  const isPositive = signal.priceChangePercent >= 0;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 pt-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px] hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-3xl ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_50px_-10px_rgba(244,63,94,0.3)]'}`}>
              {isPositive ? <TrendingUp size={40} /> : <TrendingDown size={40} />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-3">
                <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none">{signal.symbol}</h1>
                <span className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{signal.price} ({formatPercent(signal.priceChangePercent)})
                </span>
              </div>
              <p className="text-xl text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">{signal.company}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-full">
          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Signal</span>
            <span className={`text-sm font-black italic uppercase ${signal.sentiment === 'BULLISH' ? 'text-emerald-400' : signal.sentiment === 'BEARISH' ? 'text-rose-400' : 'text-amber-400'}`}>{signal.sentiment}</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Confidence</span>
            <span className="text-sm font-black text-indigo-300 italic">{signal.confidence}</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Risk</span>
            <span className="text-sm font-black text-rose-400 italic">{signal.actionability?.risk_level}</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Confluence</span>
            <span className="text-xl font-black text-cyan-300 italic">{normalizeScore(signal.score)}</span>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <CandlestickChart symbol={symbol as string} data={history} />

        <div className="p-8 rounded-[2rem] bg-indigo-600/5 border border-indigo-500/10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">AI detected key events on this chart</span>
          </div>

          <div className="flex flex-wrap gap-6">
            {signal.technical_patterns && signal.technical_patterns.length > 0 ? signal.technical_patterns.map((pattern, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-colors cursor-default group">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">{pattern.type}</span>
                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">DETECTED</span>
                </div>
              </div>
            )) : (
              <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">No technical patterns detected.</span>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 text-indigo-400 text-sm font-black uppercase tracking-widest mb-8">
                <Zap size={18} />
                Why Now?
              </div>
              <div className="space-y-6">
                <p className="text-xs text-white font-medium leading-relaxed italic mb-4">{signal.why_now}</p>
                {signal.signals && signal.signals.length > 0 && (
                  <ul className="space-y-4 pt-4 border-t border-white/5">
                    {signal.signals.map((s, i) => (
                      <li key={i} className="flex gap-4">
                        <div className="w-1 h-1 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.type}</span>
                          <p className="text-[10px] text-white font-medium leading-relaxed italic">{s.reason}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 text-cyan-400 text-sm font-black uppercase tracking-widest mb-8">
                <Layers size={18} />
                Risk Factors
              </div>
              <ul className="space-y-4">
                {signal.risks && signal.risks.length > 0 ? signal.risks.map((risk, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-1 h-1 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">{risk}</p>
                  </li>
                )) : (
                  <li className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">No significant risks detected.</li>
                )}
              </ul>
            </section>
          </div>

          <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 text-indigo-400 text-sm font-black uppercase tracking-widest mb-8">
              <Calendar size={18} />
              Intelligent Event Timeline
            </div>
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/5 before:to-transparent">
              {signal.technical_patterns && signal.technical_patterns.length > 0 ? signal.technical_patterns.map((pattern, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/5 bg-[#030814] text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-white uppercase tracking-tight italic">{pattern.type}</div>
                      <time className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">TELEMETRY</time>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed italic">{pattern.reason}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-600 font-black uppercase tracking-widest text-[10px] italic">No technical patterns detected.</div>
              )}
            </div>
          </section>

          <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-indigo-400 text-sm font-black uppercase tracking-widest">
                <Newspaper size={18} />
                News Sentinel
              </div>
              {signal.news?.score !== undefined && (
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${signal.news.score > 0.1
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : signal.news.score < -0.1
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-white/5 text-slate-400 border-white/10"
                  }`}>
                  {signal.news.score > 0.1 ? "POSITIVE" : signal.news.score < -0.1 ? "NEGATIVE" : "NEUTRAL"}
                  {" "}{signal.news.score?.toFixed(2)}
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(["company", "sector", "global"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setNewsTab(tab)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${newsTab === tab
                      ? "bg-indigo-600 text-white"
                      : "bg-white/5 text-slate-500 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Headlines */}
            <div className="space-y-3">
              {(() => {
                const headlines = newsTab === "company"
                  ? (signal.news?.company_headlines || [])
                  : newsTab === "sector"
                    ? (signal.news?.sector_headlines || [])
                    : (signal.news?.global_headlines || []);

                if (headlines.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-600 font-black uppercase tracking-widest text-[10px] italic">
                      No {newsTab} headlines detected
                    </div>
                  );
                }

                return headlines.map((headline: string, idx: number) => {
                  const parts = headline.split(" - ");
                  const title = parts.slice(0, -1).join(" - ") || headline;
                  const source = parts[parts.length - 1] || "";
                  const searchUrl = `https://news.google.com/search?q=${encodeURIComponent(title)}`;

                  return (
                    <a
                      key={idx}
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 flex-1 mr-3">
                        <p className="text-xs text-white font-bold group-hover:text-indigo-300 transition-colors leading-relaxed">
                          {title}
                        </p>
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                          {source}
                        </span>
                      </div>
                      <span className="text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-1">
                        ↗
                      </span>
                    </a>
                  );
                });
              })()}
            </div>
          </section>
        </div>

        <aside className="space-y-10">
          <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 text-rose-400 text-sm font-black uppercase tracking-widest mb-8">
              <ShieldCheck size={18} />
              Risk Sentinel Analysis
            </div>
            <div className="space-y-8">
              <div>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2 font-mono">Volatility Level</span>
                <span className="text-sm font-black text-white italic">{signal.actionability?.risk_level || "MODERATE"}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2 font-mono">Conflicting Signals</span>
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">
                  {signal.signals?.filter(s => s.direction !== signal.sentiment).length || 0} SIGNALS
                </p>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2 font-mono">Uncertainty Notes</span>
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">{signal.disclaimer || "NOMINAL"}</p>
              </div>
            </div>
          </section>

          <section className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 text-indigo-400 text-sm font-black uppercase tracking-widest mb-8">
              <BarChart3 size={18} />
              Alpha Historical Match
            </div>
            <div className="space-y-6">
              <p className="text-xs text-slate-400 leading-relaxed italic">
                {signal.similar_events?.[0]?.event_description || "No direct historical match detected in the current lookback window."}
              </p>
              {signal.similar_events?.[0] && (
                <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.2em] block mb-2 font-mono">Signal Success Rate</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white italic tracking-tighter">{signal.similar_events[0].outcome_pct_30d}%</span>
                    <span className="text-[11px] font-black text-indigo-400/50 uppercase italic tracking-widest underline decoration-indigo-500/30">Historical Sets</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <footer className="space-y-4">
            <button className="w-full py-5 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] active:scale-95 flex items-center justify-center gap-3">
              <Target size={14} />
              Synchronize Mission
            </button>
            <div className="flex justify-center items-center gap-4 opacity-30 group cursor-default">
              <div className="w-12 h-px bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] whitespace-nowrap">End Transmission</span>
              <div className="w-12 h-px bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
            </div>
          </footer>
        </aside>
      </div>
    </div>
  );
}
