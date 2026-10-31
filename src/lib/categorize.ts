import type { TransactionType } from "./types";

// Keyword rules for picking a category from the note. Checked in order;
// the first category with a matching keyword wins.
const RULES: { category: string; type: TransactionType; words: string[] }[] = [
  { category: "Salary", type: "income", words: ["salary", "payroll", "stipend", "wages"] },
  { category: "Other Income", type: "income", words: ["freelance", "refund", "cashback", "interest", "dividend", "bonus", "gift received"] },
  { category: "Rent", type: "expense", words: ["rent", "landlord", "lease", "pg ", "hostel"] },
  { category: "Food", type: "expense", words: ["swiggy", "zomato", "food", "lunch", "dinner", "breakfast", "grocer", "restaurant", "cafe", "coffee", "tea", "snack", "pizza", "blinkit", "zepto", "bigbasket", "takeout", "meal"] },
  { category: "Transport", type: "expense", words: ["uber", "ola", "rapido", "cab", "taxi", "auto", "metro", "bus", "train", "petrol", "diesel", "fuel", "parking", "toll", "flight", "irctc"] },
  { category: "Bills", type: "expense", words: ["electricity", "water bill", "gas", "internet", "wifi", "broadband", "recharge", "mobile", "phone bill", "dth", "netflix", "spotify", "prime", "subscription", "emi", "insurance"] },
  { category: "Health", type: "expense", words: ["doctor", "hospital", "pharmacy", "medicine", "medical", "clinic", "gym", "dentist", "apollo", "1mg", "pharmeasy"] },
  { category: "Shopping", type: "expense", words: ["amazon", "flipkart", "myntra", "ajio", "meesho", "shopping", "clothes", "shoes", "jacket", "shirt", "mall", "electronics"] },
];

/** Suggests a category for the note, or null when nothing matches. */
export function suggestCategory(
  note: string,
  type: TransactionType
): string | null {
  const text = ` ${note.toLowerCase()} `;
  if (!text.trim()) return null;
  for (const rule of RULES) {
    if (rule.type !== type) continue;
    if (rule.words.some((w) => text.includes(w))) return rule.category;
  }
  return null;
}
