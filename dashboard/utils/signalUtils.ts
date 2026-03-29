import { Signal } from "../data/mockSignals";

export function getTopGainers(signals: Signal[]) {
  return [...signals].sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, 3);
}

export function getTopLosers(signals: Signal[]) {
  return [...signals].sort((a, b) => a.priceChangePercent - b.priceChangePercent).slice(0, 3);
}

export function detectCircuit(priceChangePercent: number) {
  return Math.abs(priceChangePercent) >= 10;
}

export function normalizeScore(score: number) {
  return Math.max(0, Math.min(10, score)).toFixed(1);
}
