import { describe, expect, it } from "vitest";
import { generateTable } from "./generate-table.ts";
import type { ProblemMetadata } from "./types.ts";

describe("generateTable", () => {
  const twoSum: ProblemMetadata = {
    platform: "leetcode",
    id: "1",
    slug: "two-sum",
    difficulty: "Easy",
    tags: ["array", "hash-map"],
    url: "https://leetcode.com/problems/two-sum/",
    path: "leetcode/0001-two-sum",
    status: { ts: { brute: "solved", optimal: "solved" } },
  };

  it("renders a row for a single problem, with a column per language", () => {
    const table = generateTable([twoSum]);

    expect(table).toBe(
      [
        "| Platform | # | Problem | Difficulty | Tags | TS | Python | C++ |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
        "| LeetCode | 1 | [Two Sum](leetcode/0001-two-sum) | Easy | array, hash-map | brute: solved, optimal: solved |  |  |",
      ].join("\n"),
    );
  });

  it("groups by platform in fixed order, then sorts by id within a platform", () => {
    const codeforcesProblem: ProblemMetadata = {
      platform: "codeforces",
      id: "4a",
      slug: "watermelon",
      difficulty: "800",
      tags: ["math"],
      url: "https://codeforces.com/problemset/problem/4/A",
      path: "codeforces/4a-watermelon",
      status: { ts: { optimal: "solved" } },
    };
    const hackerrankProblem: ProblemMetadata = {
      platform: "hackerrank",
      id: "algorithms/solve-me-first",
      slug: "solve-me-first",
      difficulty: "Easy",
      tags: ["warmup"],
      url: "https://www.hackerrank.com/challenges/solve-me-first",
      path: "hackerrank/algorithms/solve-me-first",
      status: { ts: { optimal: "solved" } },
    };
    const laterLeetCodeProblem: ProblemMetadata = {
      ...twoSum,
      id: "20",
      slug: "valid-parentheses",
      path: "leetcode/0020-valid-parentheses",
    };

    const table = generateTable([
      codeforcesProblem,
      hackerrankProblem,
      laterLeetCodeProblem,
      twoSum,
    ]);
    const rows = table.split("\n").slice(2);

    expect(rows).toEqual([
      "| LeetCode | 1 | [Two Sum](leetcode/0001-two-sum) | Easy | array, hash-map | brute: solved, optimal: solved |  |  |",
      "| LeetCode | 20 | [Valid Parentheses](leetcode/0020-valid-parentheses) | Easy | array, hash-map | brute: solved, optimal: solved |  |  |",
      "| HackerRank | algorithms/solve-me-first | [Solve Me First](hackerrank/algorithms/solve-me-first) | Easy | warmup | optimal: solved |  |  |",
      "| Codeforces | 4a | [Watermelon](codeforces/4a-watermelon) | 800 | math | optimal: solved |  |  |",
    ]);
  });

  it("renders a blank cell for a language with no approaches, and lists every approach for one that has them", () => {
    const multiApproach: ProblemMetadata = {
      ...twoSum,
      status: { ts: { brute: "attempted", optimal: "in-progress" } },
    };

    const table = generateTable([multiApproach]);
    const row = table.split("\n")[2];

    expect(row).toBe(
      "| LeetCode | 1 | [Two Sum](leetcode/0001-two-sum) | Easy | array, hash-map | brute: attempted, optimal: in-progress |  |  |",
    );
  });

  it("renders a placeholder row when there are no problems", () => {
    expect(generateTable([])).toBe(
      [
        "| Platform | # | Problem | Difficulty | Tags | TS | Python | C++ |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
        "| _No problems yet._ | | | | |  |  |  |",
      ].join("\n"),
    );
  });
});
