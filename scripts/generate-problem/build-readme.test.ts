import { describe, expect, it } from "vitest";
import { parseProblem } from "../reindex/parse-problem.ts";
import { buildReadmeContent } from "./build-readme.ts";

describe("buildReadmeContent", () => {
  const fields = {
    platform: "leetcode" as const,
    id: "1",
    slug: "two-sum",
    difficulty: "Easy",
    tags: ["array", "hash-map"],
    url: "https://leetcode.com/problems/two-sum/",
  };

  it("produces frontmatter with every approach defaulted to un-solved", () => {
    const content = buildReadmeContent(fields, "ts", ["brute", "optimal"]);

    expect(content).toContain("platform: leetcode");
    expect(content).toContain('id: "1"');
    expect(content).toContain("slug: two-sum");
    expect(content).toContain("difficulty: Easy");
    expect(content).toContain("tags: [array, hash-map]");
    expect(content).toContain("url: https://leetcode.com/problems/two-sum/");
    expect(content).toContain(
      "status:\n  ts:\n    brute: un-solved\n    optimal: un-solved",
    );
    expect(content).toContain("# Two Sum");
    expect(content).toContain("## Approaches");
    expect(content).toContain("`brute`");
    expect(content).toContain("`optimal`");
  });

  it("round-trips through parseProblem", () => {
    const content = buildReadmeContent(fields, "ts", ["brute", "optimal"]);

    expect(parseProblem(content)).toEqual({
      ...fields,
      status: { ts: { brute: "un-solved", optimal: "un-solved" } },
    });
  });
});
