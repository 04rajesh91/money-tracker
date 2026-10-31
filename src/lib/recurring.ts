import type { RecurringRule, Transaction } from "./types";

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function prevMonth(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

function nextMonth(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

export function clampDay(day: number): number {
  if (!Number.isFinite(day)) return 1;
  return Math.min(28, Math.max(1, Math.round(day)));
}

export interface GenerateResult {
  added: Omit<Transaction, "id">[];
  rules: RecurringRule[];
}

/**
 * Works out which recurring entries are due up to `today` and have not been
 * added yet. Pure: returns the new transactions and the rules with their
 * `lastAddedMonth` moved forward, so running it twice never duplicates.
 */
export function generateDue(
  rules: RecurringRule[],
  today: Date = new Date()
): GenerateResult {
  const added: Omit<Transaction, "id">[] = [];
  const current = monthKey(today);

  const nextRules = rules.map((rule) => {
    if (!rule.active) return rule;
    const day = clampDay(rule.dayOfMonth);
    const afterLast = rule.lastAddedMonth
      ? nextMonth(rule.lastAddedMonth)
      : rule.startMonth;
    let month = afterLast > rule.startMonth ? afterLast : rule.startMonth;
    let last = rule.lastAddedMonth;

    while (month <= current) {
      // In the current month, wait until the chosen day has arrived
      if (month === current && today.getDate() < day) break;
      added.push({
        type: rule.type,
        amount: rule.amount,
        category: rule.category,
        date: `${month}-${String(day).padStart(2, "0")}`,
        note: rule.note,
        recurringId: rule.id,
      });
      last = month;
      month = nextMonth(month);
    }

    return last === rule.lastAddedMonth ? rule : { ...rule, lastAddedMonth: last };
  });

  return { added, rules: nextRules };
}
