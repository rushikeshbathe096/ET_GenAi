"use client";
import { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = new Array(period).fill(0);
  let gains = 0, losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < closes.length; i++) {
    if (i > period) {
      const diff = closes[i] - closes[i - 1];
      avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }
  return rsi;
}

function calculateMACD(closes: number[]): {
  macd: number[];
  signal: number[];
  histogram: number[];
} {
  const ema = (data: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const result: number[] = [data[0] || 0];
    for (let i = 1; i < data.length; i++) {
      result.push(data[i] * k + result[i - 1] * (1 - k));
    }
    return result;
  };

  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macd = ema12.map((v, i) => v - ema26[i]);
  const signal = ema(macd.slice(25), 9);
  const paddedSignal = new Array(25).fill(0).concat(signal);
  const histogram = macd.map((v, i) => v - paddedSignal[i]);

  return { macd, signal: paddedSignal, histogram };
}

export default function CandlestickChart({ symbol, data }: { symbol: string; data: Candle[] }) {
  const priceRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const rsiRef = useRef<HTMLDivElement>(null);
  const macdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!priceRef.current || !volumeRef.current || !data.length) return;

    const priceChart = createChart(priceRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#050b18" },
        textColor: "#475569",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      width: priceRef.current.clientWidth,
      height: 300,
      rightPriceScale: { borderColor: "rgba(255,255,255,0.05)" },
      timeScale: { borderColor: "rgba(255,255,255,0.05)", timeVisible: true },
    });

    const candleSeries = priceChart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#f43f5e",
      borderUpColor: "#10b981",
      borderDownColor: "#f43f5e",
      wickUpColor: "#10b981",
      wickDownColor: "#f43f5e",
    });

    const candles = data.map(d => ({
      time: d.date as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    candleSeries.setData(candles);
    priceChart.timeScale().fitContent();

    const volumeChart = createChart(volumeRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#050b18" },
        textColor: "#475569",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      width: volumeRef.current.clientWidth,
      height: 100,
      rightPriceScale: { borderColor: "rgba(255,255,255,0.05)" },
      timeScale: { borderColor: "rgba(255,255,255,0.05)", timeVisible: false },
    });

    const volumeSeries = volumeChart.addHistogramSeries({
      color: "#3b82f6",
      priceFormat: { type: "volume" },
    });

    const volumes = data.map(d => ({
      time: d.date as any,
      value: d.volume,
      color: d.close >= d.open ? "#10b981" : "#f43f5e",
    }));
    volumeSeries.setData(volumes);
    volumeChart.timeScale().fitContent();

    let rsiChart: any = null;
    if (rsiRef.current && data.length > 14) {
      const closes = data.map(d => d.close);
      const rsiValues = calculateRSI(closes);

      rsiChart = createChart(rsiRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#050b18" },
          textColor: "#475569",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.03)" },
          horzLines: { color: "rgba(255,255,255,0.03)" },
        },
        width: rsiRef.current.clientWidth,
        height: 120,
        rightPriceScale: { borderColor: "rgba(255,255,255,0.05)" },
        timeScale: { borderColor: "rgba(255,255,255,0.05)", timeVisible: false },
      });

      const rsiSeries = rsiChart.addLineSeries({
        color: "#a78bfa",
        lineWidth: 1,
      });

      const rsiData = data.slice(14).map((d, i) => ({
        time: d.date as any,
        value: rsiValues[i + 14],
      }));
      rsiSeries.setData(rsiData);

      rsiSeries.createPriceLine({
        price: 70,
        color: "#f43f5e",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "OB",
      });

      rsiSeries.createPriceLine({
        price: 30,
        color: "#10b981",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "OS",
      });

      rsiChart.timeScale().fitContent();
    }

    let macdChart: any = null;
    if (macdRef.current && data.length > 26) {
      const closes = data.map(d => d.close);
      const { macd, signal, histogram } = calculateMACD(closes);

      macdChart = createChart(macdRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#050b18" },
          textColor: "#475569",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.03)" },
          horzLines: { color: "rgba(255,255,255,0.03)" },
        },
        width: macdRef.current.clientWidth,
        height: 120,
        rightPriceScale: { borderColor: "rgba(255,255,255,0.05)" },
        timeScale: { borderColor: "rgba(255,255,255,0.05)", timeVisible: false },
      });

      const histSeries = macdChart.addHistogramSeries({
        color: "#3b82f6",
        priceFormat: { type: "price", precision: 2 },
      });

      const macdLine = macdChart.addLineSeries({
        color: "#6366f1",
        lineWidth: 1,
      });

      const signalLine = macdChart.addLineSeries({
        color: "#f59e0b",
        lineWidth: 1,
      });

      const startIdx = 26;
      histSeries.setData(data.slice(startIdx).map((d, i) => ({
        time: d.date as any,
        value: histogram[i + startIdx],
        color: histogram[i + startIdx] >= 0 ? "#10b981" : "#f43f5e",
      })));

      macdLine.setData(data.slice(startIdx).map((d, i) => ({
        time: d.date as any,
        value: macd[i + startIdx],
      })));

      signalLine.setData(data.slice(startIdx).map((d, i) => ({
        time: d.date as any,
        value: signal[i + startIdx],
      })));

      macdChart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (priceRef.current) priceChart.applyOptions({ width: priceRef.current.clientWidth });
      if (volumeRef.current) volumeChart.applyOptions({ width: volumeRef.current.clientWidth });
      if (rsiRef.current && rsiChart) rsiChart.applyOptions({ width: rsiRef.current.clientWidth });
      if (macdRef.current && macdChart) macdChart.applyOptions({ width: macdRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      priceChart.remove();
      volumeChart.remove();
      if (rsiChart) rsiChart.remove();
      if (macdChart) macdChart.remove();
    };
  }, [data]);

  return (
    <div className="bg-[#050b18] border border-white/5 rounded-[2.5rem] overflow-hidden p-6">
      <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">
        Price History — 30 Days
      </p>
      <div ref={priceRef} />
      <p className="text-xs font-black text-slate-600 uppercase tracking-widest mt-4 mb-2">
        Volume
      </p>
      <div ref={volumeRef} />

      <p className="text-xs font-black text-purple-400 uppercase tracking-widest mt-4 mb-2">
        RSI (14) — Overbought: 70 | Oversold: 30
      </p>
      <div ref={rsiRef} />

      <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mt-4 mb-2">
        MACD (12, 26, 9) — Blue: MACD | Yellow: Signal | Histogram
      </p>
      <div ref={macdRef} />
    </div>
  );
}
