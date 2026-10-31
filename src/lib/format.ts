export function formatINR(amount: number): string {
  // Round the absolute value so positive and negative amounts round the same way
  const abs = Math.round(Math.abs(amount) * 100) / 100;
  const sign = amount < 0 && abs > 0 ? "-" : "";
  const hasPaise = !Number.isInteger(abs);
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(abs);
  return `${sign}₹${formatted}`;
}

export function formatINRCompact(amount: number): string {
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return formatINR(amount);
}

export function formatPercent(p: number): string {
  return `${Math.round(p)}%`;
}
