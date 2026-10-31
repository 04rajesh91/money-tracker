import type { Budgets, Transaction } from "./types";

export function makeDemoTransactions(): Transaction[] {
  const now = new Date();
  const tx: Transaction[] = [];

  const y = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const daysAgo = (n: number): Date => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };

  let id = 1;
  const mk = (
    amount: number,
    type: Transaction["type"],
    category: string,
    date: Date,
    note?: string
  ): Transaction => ({ id: String(id++), type, amount, category, date: y(date), note });

  // 3 months of salary
  tx.push(mk(95000, "income", "Salary", daysAgo(2), "October salary"));
  tx.push(mk(95000, "income", "Salary", daysAgo(33), "September salary"));
  tx.push(mk(95000, "income", "Salary", daysAgo(63), "August salary"));
  tx.push(mk(12000, "income", "Other Income", daysAgo(15), "Freelance gig"));

  // Rent - monthly
  tx.push(mk(22000, "expense", "Rent", daysAgo(1), "October rent"));
  tx.push(mk(22000, "expense", "Rent", daysAgo(31), "September rent"));
  tx.push(mk(22000, "expense", "Rent", daysAgo(61), "August rent"));

  // Food
  tx.push(mk(450, "expense", "Food", daysAgo(0), "Dinner with friends"));
  tx.push(mk(320, "expense", "Food", daysAgo(2), "Groceries"));
  tx.push(mk(180, "expense", "Food", daysAgo(3), "Lunch"));
  tx.push(mk(620, "expense", "Food", daysAgo(5), "Weekend outing"));
  tx.push(mk(240, "expense", "Food", daysAgo(7), "Coffee & snacks"));
  tx.push(mk(510, "expense", "Food", daysAgo(10), "Groceries"));
  tx.push(mk(290, "expense", "Food", daysAgo(14), "Takeout"));
  tx.push(mk(410, "expense", "Food", daysAgo(40), "Groceries"));

  // Transport
  tx.push(mk(1500, "expense", "Transport", daysAgo(4), "Petrol"));
  tx.push(mk(220, "expense", "Transport", daysAgo(6), "Cab to airport"));
  tx.push(mk(1300, "expense", "Transport", daysAgo(20), "Petrol"));
  tx.push(mk(400, "expense", "Transport", daysAgo(45), "Train tickets"));

  // Bills
  tx.push(mk(1200, "expense", "Bills", daysAgo(8), "Electricity"));
  tx.push(mk(699, "expense", "Bills", daysAgo(9), "Mobile recharge"));
  tx.push(mk(999, "expense", "Bills", daysAgo(12), "Internet"));
  tx.push(mk(1150, "expense", "Bills", daysAgo(38), "Electricity"));

  // Shopping
  tx.push(mk(2999, "expense", "Shopping", daysAgo(11), "New shoes"));
  tx.push(mk(1499, "expense", "Shopping", daysAgo(18), "Jacket"));

  // Health
  tx.push(mk(800, "expense", "Health", daysAgo(22), "Pharmacy"));
  tx.push(mk(1500, "expense", "Health", daysAgo(50), "Doctor visit"));

  // Other
  tx.push(mk(600, "expense", "Other", daysAgo(16), "Gift for friend"));

  return tx;
}

export function makeDemoBudgets(): Budgets {
  return {
    Food: 9000,
    Rent: 22000,
    Transport: 5000,
    Bills: 4000,
    Shopping: 5000,
    Health: 3000,
    Other: 2000,
  };
}
