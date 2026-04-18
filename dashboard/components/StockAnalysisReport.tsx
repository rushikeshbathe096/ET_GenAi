"use client";

import React from 'react';

interface NewsData {
  sentiment_label?: string;
  score?: number;
  company_headlines?: string[];
  sector_headlines?: string[];
  global_headlines?: string[];
}

interface TechnicalPattern {
  type: string;
  reason: string;
}

interface SignalItem {
  type: string;
  reason: string;
  direction: string;
  weight: number;
}

interface ConfidenceItem {
  label: string;
  contribution_pct: number;
}

interface Actionability {
  confidence_pct?: number;
  risk_level?: string;
  time_horizon?: string;
  color?: string;
}

interface StockAnalysisProps {
  data: {
    news?: NewsData;
    technical_patterns?: TechnicalPattern[];
    signals?: SignalItem[];
    confidence_breakdown?: ConfidenceItem[];
    risks?: string[];
    actionability?: Actionability;
    why_now?: string;
    price?: number;
    change_pct?: number;
    volume?: string | number;
    date?: string;
  };
}

export default function StockAnalysisReport({ data }: StockAnalysisProps) {
  if (!data) return null;

  const {
    news,
    technical_patterns,
    signals,
    confidence_breakdown,
    risks,
    actionability,
    why_now,
    price,
    change_pct,
    volume,
    date
  } = data;

  const getPatternIcon = (type: string) => {
    if (type.includes('volume')) return '📊';
    if (type.includes('high')) return '🚀';
    if (type.includes('pattern')) return '📈';
    return '🔍';
  };

  const highlightRiskText = (text: string) => {
    const keywords = ['volatility', 'overvaluation', 'risk', 'uncertainty', 'decline'];
    let parts = text.split(new RegExp(`(${keywords.join('|')})`, 'gi'));
    return parts.map((part, i) => 
      keywords.includes(part.toLowerCase()) ? <strong key={i} style={{ color: '#f87171' }}>{part}</strong> : part
    );
  };

  return (
    <div style={{ backgroundColor: '#050b18', color: '#e2e8f0', padding: '24px', borderRadius: '16px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>₹{price?.toLocaleString()}</h2>
          <p style={{ color: (change_pct ?? 0) >= 0 ? '#4ade80' : '#f87171', fontWeight: 'bold', margin: '4px 0' }}>
            {change_pct && (change_pct > 0 ? '+' : '')}{change_pct}%
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>VOL: {volume}</p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{date}</p>
        </div>
      </div>

      {why_now && (
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Why Now</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#94a3b8', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {why_now}
          </p>
        </section>
      )}

      {news && (
        <section style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#ffffff03', borderRadius: '12px', border: '1px solid #ffffff05' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>News Sentinel</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
               <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', backgroundColor: news.sentiment_label === 'BULLISH' ? '#064e3b' : '#450a0a', color: news.sentiment_label === 'BULLISH' ? '#34d399' : '#f87171', border: '1px solid currentColor' }}>
                {news.sentiment_label}
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Score: {news.score}</span>
            </div>
          </div>
          
          <div style={{ fontSize: '13px' }}>
            {(!news.company_headlines || news.company_headlines.length === 0) ? (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>No direct company news</p>
            ) : (
              news.company_headlines.slice(0, 3).map((h, i) => <p key={i} style={{ marginBottom: '4px' }}>• {h}</p>)
            )}
            
            <div style={{ marginTop: '12px', borderTop: '1px solid #ffffff05', paddingTop: '8px' }}>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>SECTOR PULSE</p>
              {news.sector_headlines?.slice(0, 3).map((h, i) => <p key={i} style={{ color: '#94a3b8', margin: '4px 0' }}>{h}</p>)}
            </div>

            {news.sentiment_label === 'NEUTRAL' && (
              <p style={{ marginTop: '8px', fontSize: '11px', color: '#fbbf24', fontStyle: 'italic' }}>No strong news-driven signal</p>
            )}
          </div>
        </section>
      )}

      {technical_patterns && technical_patterns.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Technical Architecture</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {technical_patterns.map((pt, i) => (
              <div key={i} style={{ padding: '12px', border: '1px solid #ffffff05', backgroundColor: '#ffffff03', borderRadius: '8px' }}>
                <span style={{ fontSize: '18px', marginRight: '8px' }}>{getPatternIcon(pt.type)}</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#white' }}>{pt.type.replace('_', ' ').toUpperCase()}</span>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', margin: 0 }}>{pt.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {signals && signals.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Alpha Signals</h3>
          <div style={{ spaceY: '8px' }}>
            {signals.sort((a,b) => b.weight - a.weight).map((sig, i) => (
              <div key={i} style={{ padding: '12px', marginBottom: '8px', borderLeft: `3px solid ${sig.direction === 'positive' ? '#10b981' : '#ef4444'}`, backgroundColor: i < 2 ? '#818cf80a' : '#ffffff02', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{sig.type}</span>
                  {i < 2 && <span style={{ fontSize: '9px', backgroundColor: '#818cf820', color: '#818cf8', padding: '1px 4px', borderRadius: '3px' }}>TOP SIGNAL</span>}
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>{sig.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {confidence_breakdown && confidence_breakdown.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Confidence Matrix</h3>
          {confidence_breakdown.map((item, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <span>{item.label}</span>
                <span>{item.contribution_pct}%</span>
              </div>
              <div style={{ height: '4px', width: '100%', backgroundColor: '#1e293b', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${item.contribution_pct}%`, backgroundColor: '#818cf8', borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {risks && risks.length > 0 && (
        <section style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ef444420', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Risk Sentinel</h3>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#94a3b8' }}>
            {risks.slice(0, 5).map((risk, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{highlightRiskText(risk)}</li>
            ))}
          </ul>
        </section>
      )}

      {actionability && (
        <section style={{ padding: '16px', borderRadius: '12px', backgroundColor: actionability.color === 'green' ? '#064e3b10' : '#450a0a10', border: `1px solid ${actionability.color === 'green' ? '#05966930' : '#dc262630'}` }}>
          <h3 style={{ fontSize: '12px', fontWeight: '900', color: actionability.color === 'green' ? '#10b981' : '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Execution Protocol</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>CONFIDENCE</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '2px 0' }}>{actionability.confidence_pct}%</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>RISK LEVEL</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '2px 0' }}>{actionability.risk_level}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>HORIZON</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '2px 0' }}>{actionability.time_horizon}</p>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
