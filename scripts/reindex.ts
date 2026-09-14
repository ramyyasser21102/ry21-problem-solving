import fs from "node:fs";
import path from "node:path";
import { generateTable } from "./reindex/generate-table.ts";
import { parseProblem } from "./reindex/parse-problem.ts";
import { PLATFORM_ORDER, type Language, type ProblemFrontmatter, type ProblemMetadata } from "./reindex/types.ts";
import { validateStatusAgainstFiles } from "./reindex/validate-status.ts";

// CLI glue: walks the repo, reads problem READMEs, and rewrites the marked
// block in the root README.md. Intentionally not unit tested (see spec's
// Testing Decisions) — thin, low-branching orchestration around the pure
// functions in ./reindex/*.

const START_MARKER = "<!-- PROBLEMS:START -->";
const END_MARKER = "<!-- PROBLEMS:END -->";

function findProblemReadmes(platformDir: string): string[] {
  const entries = fs.readdirSync(platformDir, {
    recursive: true,
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isFile() && entry.name === "README.md")
    .map((entry) => path.join(entry.parentPath, entry.name));
}

function discoverApproaches(
  problemDir: string,
): Partial<Record<Language, string[]>> {
  const result: Partial<Record<Language, string[]>> = {};

  const languageDirs = fs
    .readdirSync(problemDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  for (const dir of languageDirs) {
    const languageDir = path.join(problemDir, dir.name);
    const approaches = fs
      .readdirSync(languageDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name.replace(/\.[^.]+$/, ""));
    result[dir.name as Language] = approaches;
  }

  return result;
}

function replaceMarkedBlock(readme: string, table: string): string {
  const startIndex = readme.indexOf(START_MARKER);
  const endIndex = readme.indexOf(END_MARKER);
  if (startIndex === -1 || endIndex === -1) {
    throw new Error(
      `README.md is missing the ${START_MARKER} / ${END_MARKER} markers`,
    );
  }
  const before = readme.slice(0, startIndex + START_MARKER.length);
  const after = readme.slice(endIndex);
  return `${before}\n${table}\n${after}`;
}

export function reindex(): void {
  const root = process.cwd();
  const problems: ProblemMetadata[] = [];

  for (const platform of PLATFORM_ORDER) {
    const platformDir = path.join(root, platform);
    if (!fs.existsSync(platformDir)) continue;

    for (const readmePath of findProblemReadmes(platformDir)) {
      const content = fs.readFileSync(readmePath, "utf8");
      const relativePath = path.relative(root, readmePath);

      let frontmatter: ProblemFrontmatter;
      try {
        frontmatter = parseProblem(content);
      } catch (error) {
        console.error(
          `Failed to parse ${relativePath}: ${(error as Error).message}`,
        );
        process.exit(1);
      }

      const problemDir = path.dirname(readmePath);
      const discovered = discoverApproaches(problemDir);

      try {
        validateStatusAgainstFiles(discovered, frontmatter.status);
      } catch (error) {
        console.error(
          `Status mismatch in ${relativePath}: ${(error as Error).message}`,
        );
        process.exit(1);
      }

      problems.push({
        ...frontmatter,
        path: path.relative(root, problemDir),
      });
    }
  }

  const table = generateTable(problems);
  const readmePath = path.join(root, "README.md");
  const readme = fs.readFileSync(readmePath, "utf8");
  fs.writeFileSync(readmePath, replaceMarkedBlock(readme, table));

  console.log(`Reindexed ${problems.length} problem(s).`);
}

const isMainModule =
  process.argv[1] !== undefined &&
  import.meta.url === `file://${path.resolve(process.argv[1])}`;

if (isMainModule) {
  reindex();
}
