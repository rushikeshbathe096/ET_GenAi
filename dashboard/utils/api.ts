import { mockSignals, Signal } from "../data/mockSignals";
import { mockMarket, SectorData } from "../data/mockMarket";
import { mockAnalytics } from "../data/mockAnalytics";
import { mockAlerts, Alert } from "../data/mockAlerts";

// Toggle for future backend integration
export const USE_API = false;
const BASE_URL = "http://localhost:8000";

// Simulation delay for loading states
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 800));

export async function getDashboardData(): Promise<Signal[]> {
  if (USE_API) {
    const res = await fetch(`${BASE_URL}/opportunities`);
    return res.json();
  }
  await simulateDelay();
  return mockSignals;
}

export async function getSignals(): Promise<Signal[]> {
  if (USE_API) {
    const res = await fetch(`${BASE_URL}/opportunities`);
    return res.json();
  }
  await simulateDelay();
  return mockSignals;
}

export async function getStock(symbol: string): Promise<Signal | null> {
  if (USE_API) {
    const res = await fetch(`${BASE_URL}/opportunities/${symbol}`);
    return res.json();
  }
  await simulateDelay();
  return mockSignals.find(s => s.symbol === symbol) || null;
}

export async function getWatchlist(): Promise<string[]> {
  if (USE_API) {
    const res = await fetch(`${BASE_URL}/watchlist`);
    return res.json();
  }
  await simulateDelay();
  const saved = localStorage.getItem("radar-watchlist");
  return saved ? JSON.parse(saved) : [];
}

export async function addTicker(symbol: string): Promise<void> {
  if (USE_API) {
    await fetch(`${BASE_URL}/watchlist`, {
      method: "POST",
      body: JSON.stringify({ symbol })
    });
    return;
  }
  await simulateDelay();
  const current = await getWatchlist();
  if (!current.includes(symbol)) {
    localStorage.setItem("radar-watchlist", JSON.stringify([...current, symbol]));
  }
}

export async function removeTicker(symbol: string): Promise<void> {
  if (USE_API) {
    await fetch(`${BASE_URL}/watchlist/${symbol}`, { method: "DELETE" });
    return;
  }
  await simulateDelay();
  const current = await getWatchlist();
  localStorage.setItem("radar-watchlist", JSON.stringify(current.filter(s => s !== symbol)));
}

export async function getMarket(): Promise<SectorData[]> {
  if (USE_API) {
    const res = await fetch(`${BASE_URL}/market/sectors`);
    return res.json();
  }
  await simulateDelay();
  return mockMarket;
}

export async function getAnalytics(): Promise<any> {
  if (USE_API) {
    const res = await fetch(`${BASE_URL}/analytics`);
    return res.json();
  }
  await simulateDelay();
  return mockAnalytics;
}

export async function getAlerts(): Promise<Alert[]> {
  if (USE_API) {
    const res = await fetch(`${BASE_URL}/alerts`);
    return res.json();
  }
  await simulateDelay();
  return mockAlerts;
}

export async function runPipeline(): Promise<{ status: string }> {
  if (USE_API) {
    const res = await fetch(`${BASE_URL}/pipeline/run`, { method: "POST" });
    return res.json();
  }
  await simulateDelay();
  return { status: "success" };
}
