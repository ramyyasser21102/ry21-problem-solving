import type { Language } from "../reindex/types.ts";

export function buildSolutionStub(language: Language, approach: string): string {
  switch (language) {
    case "ts":
      return `// TODO: implement ${approach}\nexport function solve() {}\n`;
    case "py":
      return `# TODO: implement ${approach}\ndef solve():\n    pass\n`;
    case "cpp":
      return `// TODO: implement ${approach}\nvoid solve() {}\n`;
  }
}
