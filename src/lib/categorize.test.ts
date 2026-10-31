import { describe, expect, it } from "vitest";
import { suggestCategory } from "./categorize";

describe("suggestCategory", () => {
  it.each([
    ["Swiggy dinner", "Food"],
    ["Uber to office", "Transport"],
    ["Electricity bill", "Bills"],
    ["Amazon order", "Shopping"],
    ["Apollo pharmacy", "Health"],
    ["October rent", "Rent"],
  ])("expense note %s -> %s", (note, category) => {
    expect(suggestCategory(note, "expense")).toBe(category);
  });

  it("finds income categories", () => {
    expect(suggestCategory("October salary", "income")).toBe("Salary");
    expect(suggestCategory("Freelance gig", "income")).toBe("Other Income");
  });

  it("ignores case", () => {
    expect(suggestCategory("ZOMATO", "expense")).toBe("Food");
  });

  it("returns null when nothing matches or the note is empty", () => {
    expect(suggestCategory("misc thing", "expense")).toBeNull();
    expect(suggestCategory("   ", "expense")).toBeNull();
  });

  it("only suggests categories of the given type", () => {
    expect(suggestCategory("salary", "expense")).toBeNull();
  });
});
