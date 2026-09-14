import { describe, expect, it } from "vitest";
import { buildProblemId } from "./build-problem-id.ts";

describe("buildProblemId", () => {
  it("builds a LeetCode id and folder path", () => {
    expect(
      buildProblemId({ platform: "leetcode", number: "1", slug: "two-sum" }),
    ).toEqual({ id: "1", folderPath: "leetcode/0001-two-sum" });
  });

  it("builds a Codeforces id and folder path", () => {
    expect(
      buildProblemId({
        platform: "codeforces",
        contest: "4",
        letter: "A",
        slug: "watermelon",
      }),
    ).toEqual({ id: "4a", folderPath: "codeforces/4a-watermelon" });
  });

  it("builds a HackerRank id and folder path", () => {
    expect(
      buildProblemId({
        platform: "hackerrank",
        domain: "algorithms",
        slug: "solve-me-first",
      }),
    ).toEqual({
      id: "algorithms/solve-me-first",
      folderPath: "hackerrank/algorithms/solve-me-first",
    });
  });
});
