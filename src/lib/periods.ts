import type { Transaction } from "./types";

export interface MonthRange {
  label: string;
  start: Date;
  end: Date;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function getMonthRange(ref: Date = new Date()): MonthRange {
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return {
    label: start.toLocaleString("en-IN", { month: "long", year: "numeric" }),
    start,
    end: endOfDay(end),
  };
}

export function inMonth(tx: Transaction, range: MonthRange): boolean {
  const d = new Date(tx.date + "T00:00:00");
  return d >= range.start && d <= range.end;
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
