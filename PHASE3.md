# Money Tracker – Phase 3: Backend, Automations, Iteration & Demo

**Live app:** https://04rajesh91.github.io/money-tracker/
**Code:** https://github.com/04rajesh91/money-tracker
**Stack:** React + TypeScript + Vite + Tailwind + Recharts, hosted on GitHub Pages.

---

## Step 9 – Database and CRUD

### 9.1 Data design

Data is stored in the browser's `localStorage`: no sign-up, works offline, and each
user's money data stays on their own device. Each entity is one JSON collection.

**Primary entities:** Transactions, Budgets, Recurring Rules

| Entity | Collection (localStorage key) | Fields |
|---|---|---|
| Transaction | `mt_transactions` | `id`, `type` (income / expense), `amount`, `category`, `date` (yyyy-mm-dd), `note?`, `recurringId?` (set when added by automation) |
| Budget | `mt_budgets` | map of `category → monthly limit (₹)` for Food, Rent, Transport, Bills, Shopping, Health, Other |
| Recurring Rule | `mt_recurring` | `id`, `type`, `amount`, `category`, `note?`, `dayOfMonth` (1–28), `startMonth` (yyyy-mm), `active`, `lastAddedMonth?` |

### 9.2 CRUD checklist

| Entity | Create | Read / list | Update | Delete | Notes / gaps |
|---|---|---|---|---|---|
| Transaction | ☑ Add Transaction screen | ☑ Dashboard: totals, charts, Recent Transactions, month switcher | ☑ Pencil icon → Edit screen | ☑ Bin icon, with confirm dialog | Clear all data also available |
| Budget | ☑ Type an amount on Budgets screen | ☑ Budgets screen + Budget vs Actual chart | ☑ Change the amount (auto-saves) | ☑ ✕ button per category | Added the ✕ (delete) in this phase |
| Recurring Rule | ☑ Recurring screen form | ☑ "Your recurring entries" list | ☑ Edit + Pause / Resume | ☑ Bin icon, with confirm dialog | New entity in this phase |

---

## Step 10 – Automations and AI enhancements

### 10.1 Backend & automations table

| Trigger (event) | Tool / service | What should happen |
|---|---|---|
| User opens the app (new month / since last visit) | Built-in (runs in the app on load) | Every active recurring rule whose day has arrived is added as a transaction (e.g. salary on the 1st, rent on the 5th). Never duplicates; shows an "Automation: N entries added" banner. |
| User creates a recurring rule | Built-in | Rule is saved and any months already due (from its start month) are added immediately. |
| User pauses / resumes a rule | Built-in | Paused rules stop adding entries; on resume, the paused months are skipped (not back-filled). |
| User types a note on a transaction | Built-in Smart Auto-Categorise | Category (and income/expense type) is picked automatically, e.g. "Swiggy dinner" → Food, "Uber to office" → Transport, "Diwali bonus" → Income / Other Income. |
| User saves an expense that pushes a category past 80% or 100% of its budget | Built-in + browser Notifications API | In-app alert on save, alert banner on Dashboard, and a device notification if the user enabled it on the Budgets screen. |
| User pushes code to GitHub | GitHub Pages | Live site is served from the `gh-pages` branch (deploy with `npm run build` + `npx gh-pages -d dist --dotfiles`). |

### 10.2 Optional "wow" feature

**Feature name:** Smart Auto-Categorise

**What it does in one line:** As you type a note like "Swiggy dinner" or "Uber to office",
the app picks the right category (and switches to Income for "salary" / "bonus") so
adding a transaction takes two taps.

**Prompt or config notes for it:** Rule-based (not an LLM). It uses a keyword list per
category in `src/lib/categorize.ts`, tuned for Indian apps and merchants (Swiggy, Zomato,
Blinkit, Uber, Ola, Rapido, IRCTC, Amazon, Flipkart, Myntra, Apollo, 1mg…). It only acts
until the user taps a category themselves, and shows "✨ Auto-picked Food from your note".
It runs instantly and offline with no API key. A possible upgrade is an LLM call through a
small backend for notes the keywords don't cover.

---

## Step 11 – Testing and iteration loop

### 11.1 Scenario test script

"A salaried user wants to track monthly money without re-typing fixed payments.
They go through: **Recurring** (add ₹80,000 salary on the 1st from September, add ₹22,000
rent on the 5th) → **Budgets** (set Food ₹1,000) → **Add Transaction** (type "Swiggy
dinner", ₹850.50, sees Food auto-picked and an 80% budget alert) → **Dashboard** (sees
income ₹80,000, expenses ₹22,850.50, edits then deletes the food entry) → **Recurring**
(deletes the rent rule; past entries stay) → **Budgets** (removes the Food budget) → done."

Automated version: 14 checks, run end-to-end on a phone-sized screen, **passed twice in a
row**. There are also 26 unit tests (`npm test`) for recurring entries, auto-categorise,
budget alerts and money formatting.

### 11.2 Bug and gap log

| # | What broke / missing (issue) | Where (screen / flow) | Prompt you used to fix it | Fixed? |
|---|---|---|---|---|
| 1 | Typed budgets were lost unless you scrolled down and clicked "Save Budgets" | Budgets | "Budget amounts entered on the Budgets page are not saved. Changing a category's budget must save it right away, so it stays after switching tabs or reloading." | Y |
| 2 | Clicking "Add Transaction" quickly created duplicate transactions | Add Transaction | "The submit button can be clicked several times, creating duplicates. Disable it and ignore repeat submits after the first one." | Y |
| 3 | ₹250.50 showed as ₹251 in one place and -₹250 in another; paise hidden | Dashboard, Budgets | "Show money with 2 decimals when there are paise and use the same rounding everywhere so Total Expense and Savings match." | Y |
| 4 | Transaction note shown twice | Dashboard → Recent Transactions | "In Recent Transactions, show the note only once." | Y |
| 5 | Spending with no budget shown green "Under 80%"; "Remaining" showed a negative amount when no budget was set | Dashboard chart, Budgets | "When a category has no budget, show it grey with a 'No budget' legend and don't show a negative Remaining." | Y |
| 6 | Chart category labels overlapped on phones | Dashboard → Budget vs Actual | "On mobile, angle the chart's category labels so they don't overlap." | Y |
| 7 | No way to delete a budget; no recurring income/expenses (gap) | Budgets / new Recurring | "Enable full CRUD for Budgets and add a Recurring Transactions entity with create, list, edit, pause and delete, auto-adding due entries each month. Keep UX consistent." | Y |
| 8 | Resuming a paused rule would back-fill every paused month | Recurring | "When a paused recurring entry is resumed, skip the months it was paused instead of adding them." | Y |
| 9 | New "Recurring" tab was cut off on phones | Top navigation | "Make all four tabs fit on a 375px-wide phone screen; use a shorter label for Add Transaction on mobile." | Y |
| 10 | Editing a rule didn't say past entries stay unchanged | Recurring → Edit | "When editing a recurring entry, explain that changes apply to future months only." | Y |

### 11.3 Stability checklist

- ☑ Must-have flow works start to finish at least twice in a row (scenario above, 2 consecutive runs, all 14 checks passed)
- ☑ No obvious dead buttons or dead-end screens (every screen has the top tabs; forms have Cancel)
- ☑ CRUD works for main entities (Transactions, Budgets, Recurring Rules)
- ☑ Key automations fire as expected (recurring auto-add on open, smart auto-categorise, 80% / 100% budget alerts)
- ☑ No console errors; no horizontal scrolling at phone width; 26 unit tests passing
