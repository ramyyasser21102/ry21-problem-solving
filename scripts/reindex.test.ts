import { describe, expect, it } from "vitest";
import { generateTable, parseProblem, type ProblemMetadata } from "./reindex.ts";

describe("parseProblem", () => {
  it("parses a complete frontmatter block", () => {
    const content = `---
platform: leetcode
id: "1"
slug: two-sum
difficulty: Easy
tags: [array, hash-map]
url: https://leetcode.com/problems/two-sum/
---

Notes go here.
`;

    expect(parseProblem(content)).toEqual({
      platform: "leetcode",
      id: "1",
      slug: "two-sum",
      difficulty: "Easy",
      tags: ["array", "hash-map"],
      url: "https://leetcode.com/problems/two-sum/",
    });
  });

  const requiredFields = ["platform", "id", "slug", "difficulty", "tags", "url"];
  const fullFrontmatter: Record<string, string> = {
    platform: "leetcode",
    id: '"1"',
    slug: "two-sum",
    difficulty: "Easy",
    tags: "[array, hash-map]",
    url: "https://leetcode.com/problems/two-sum/",
  };

  it.each(requiredFields)("throws when %s is missing", (missingField) => {
    const lines = requiredFields
      .filter((field) => field !== missingField)
      .map((field) => `${field}: ${fullFrontmatter[field]}`);
    const content = `---\n${lines.join("\n")}\n---\n\nNotes.\n`;

    expect(() => parseProblem(content)).toThrow(missingField);
  });
});

describe("generateTable", () => {
  const twoSum: ProblemMetadata = {
    platform: "leetcode",
    id: "1",
    slug: "two-sum",
    difficulty: "Easy",
    tags: ["array", "hash-map"],
    url: "https://leetcode.com/problems/two-sum/",
    path: "leetcode/0001-two-sum",
    languages: ["ts"],
  };

  it("renders a row for a single problem", () => {
    const table = generateTable([twoSum]);

    expect(table).toBe(
      [
        "| Platform | # | Problem | Difficulty | Tags | Languages solved in |",
        "| --- | --- | --- | --- | --- | --- |",
        "| LeetCode | 1 | [Two Sum](leetcode/0001-two-sum) | Easy | array, hash-map | ts |",
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
      languages: ["ts"],
    };
    const hackerrankProblem: ProblemMetadata = {
      platform: "hackerrank",
      id: "algorithms/solve-me-first",
      slug: "solve-me-first",
      difficulty: "Easy",
      tags: ["warmup"],
      url: "https://www.hackerrank.com/challenges/solve-me-first",
      path: "hackerrank/algorithms/solve-me-first",
      languages: ["ts"],
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
      "| LeetCode | 1 | [Two Sum](leetcode/0001-two-sum) | Easy | array, hash-map | ts |",
      "| LeetCode | 20 | [Valid Parentheses](leetcode/0020-valid-parentheses) | Easy | array, hash-map | ts |",
      "| HackerRank | algorithms/solve-me-first | [Solve Me First](hackerrank/algorithms/solve-me-first) | Easy | warmup | ts |",
      "| Codeforces | 4a | [Watermelon](codeforces/4a-watermelon) | 800 | math | ts |",
    ]);
  });

  it("renders a placeholder row when there are no problems", () => {
    expect(generateTable([])).toBe(
      [
        "| Platform | # | Problem | Difficulty | Tags | Languages solved in |",
        "| --- | --- | --- | --- | --- | --- |",
        "| _No problems yet._ | | | | | |",
      ].join("\n"),
    );
  });
});
