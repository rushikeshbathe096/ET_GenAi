export function formatPrice(price: number) {
  return price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

export function formatPercent(percent: number) {
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
}
