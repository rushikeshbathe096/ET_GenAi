export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) return "₹0.00";
  return price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

export function formatPercent(percent: number | undefined | null): string {
  if (percent === undefined || percent === null || isNaN(percent)) return "0.00%";
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
}

export function formatPriceChange(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "0.00%";
  return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
}

export function formatHorizon(val: string | undefined | null): string {
  if (!val || val === "NaN") return "Short Term";
  return val;
}

export function formatConfidenceColor(confidence: string | undefined | null): string {
  const c = (confidence || "").toUpperCase();
  if (c === "HIGH") return "text-emerald-400";
  if (c === "MEDIUM") return "text-blue-400";
  if (c === "LOW") return "text-yellow-400";
  return "text-cyan-300"; // fallback
}

export function formatConfidenceBg(confidence: string | undefined | null): string {
  const c = (confidence || "").toUpperCase();
  if (c === "HIGH") return "bg-emerald-500/20";
  if (c === "MEDIUM") return "bg-blue-500/20";
  if (c === "LOW") return "bg-yellow-500/20";
  return "bg-cyan-500/20"; // fallback
}
