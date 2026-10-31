import { describe, expect, it } from "vitest";
import { formatINR } from "./format";

describe("formatINR", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(107000)).toBe("₹1,07,000");
  });

  it("shows paise only when there are any", () => {
    expect(formatINR(250)).toBe("₹250");
    expect(formatINR(250.5)).toBe("₹250.50");
  });

  it("rounds positive and negative amounts the same way", () => {
    expect(formatINR(-250.5)).toBe("-₹250.50");
    expect(formatINR(0.004)).toBe("₹0");
    expect(formatINR(-0.004)).toBe("₹0");
  });
});
