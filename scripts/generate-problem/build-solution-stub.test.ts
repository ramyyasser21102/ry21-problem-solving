import { describe, expect, it } from "vitest";
import { buildSolutionStub } from "./build-solution-stub.ts";

describe("buildSolutionStub", () => {
  it("produces a TypeScript stub", () => {
    expect(buildSolutionStub("ts", "brute")).toBe(
      `// TODO: implement brute\nexport function solve() {}\n`,
    );
  });

  it("produces a Python stub", () => {
    expect(buildSolutionStub("py", "optimal")).toBe(
      `# TODO: implement optimal\ndef solve():\n    pass\n`,
    );
  });

  it("produces a C++ stub", () => {
    expect(buildSolutionStub("cpp", "greedy")).toBe(
      `// TODO: implement greedy\nvoid solve() {}\n`,
    );
  });
});
