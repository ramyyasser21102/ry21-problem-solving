import { describe, expect, it } from "vitest";
import { validateStatusAgainstFiles } from "./validate-status.ts";

describe("validateStatusAgainstFiles", () => {
  it("does not throw when discovered files and status entries match", () => {
    expect(() =>
      validateStatusAgainstFiles(
        { ts: ["brute", "optimal"] },
        { ts: { brute: "solved", optimal: "solved" } },
      ),
    ).not.toThrow();
  });

  it("throws when a file has no matching status entry", () => {
    expect(() =>
      validateStatusAgainstFiles(
        { ts: ["brute", "optimal"] },
        { ts: { brute: "solved" } },
      ),
    ).toThrow(/ts\/optimal/);
  });

  it("throws when a status entry has no matching file", () => {
    expect(() =>
      validateStatusAgainstFiles(
        { ts: ["brute"] },
        { ts: { brute: "solved", optimal: "solved" } },
      ),
    ).toThrow(/ts\/optimal/);
  });
});
