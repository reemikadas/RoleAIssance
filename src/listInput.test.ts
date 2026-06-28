import { describe, expect, it } from "vitest";
import { parseCommaList } from "./listInput";

describe("comma-separated profile fields", () => {
  it("preserves spaces inside target-role names", () => {
    expect(parseCommaList("AI Engineer, Data Scientist")).toEqual([
      "AI Engineer",
      "Data Scientist",
    ]);
  });

  it("removes empty entries and surrounding whitespace only when saving", () => {
    expect(parseCommaList(" Product Manager, , ML Engineer ")).toEqual([
      "Product Manager",
      "ML Engineer",
    ]);
  });
});
