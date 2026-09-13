import { describe, expect, it } from "vitest";
import { parseProblem } from "./parse-problem.ts";

describe("parseProblem", () => {
  it("parses a complete frontmatter block", () => {
    const content = `---
platform: leetcode
id: "1"
slug: two-sum
difficulty: Easy
tags: [array, hash-map]
url: https://leetcode.com/problems/two-sum/
status: {ts: {brute: solved, optimal: solved}}
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
      status: { ts: { brute: "solved", optimal: "solved" } },
    });
  });

  const requiredFields = ["platform", "id", "slug", "difficulty", "tags", "url", "status"];
  const fullFrontmatter: Record<string, string> = {
    platform: "leetcode",
    id: '"1"',
    slug: "two-sum",
    difficulty: "Easy",
    tags: "[array, hash-map]",
    url: "https://leetcode.com/problems/two-sum/",
    status: "{ts: {optimal: solved}}",
  };

  it.each(requiredFields)("throws when %s is missing", (missingField) => {
    const lines = requiredFields
      .filter((field) => field !== missingField)
      .map((field) => `${field}: ${fullFrontmatter[field]}`);
    const content = `---\n${lines.join("\n")}\n---\n\nNotes.\n`;

    expect(() => parseProblem(content)).toThrow(missingField);
  });

  const baseFrontmatter = `platform: leetcode
id: "1"
slug: two-sum
difficulty: Easy
tags: [array, hash-map]
url: https://leetcode.com/problems/two-sum/`;

  it("throws when status names an unknown language", () => {
    const content = `---\n${baseFrontmatter}\nstatus: {rust: {optimal: solved}}\n---\n\nNotes.\n`;

    expect(() => parseProblem(content)).toThrow(/unknown language/i);
  });

  it("throws when status has an unknown state value", () => {
    const content = `---\n${baseFrontmatter}\nstatus: {ts: {optimal: done}}\n---\n\nNotes.\n`;

    expect(() => parseProblem(content)).toThrow(/unknown status/i);
  });
});
