import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Language = "ts" | "py" | "cpp";

export type SolveState =
  | "un-solved"
  | "need-study"
  | "attempted"
  | "in-progress"
  | "solved";

export type StatusMap = Partial<Record<Language, Record<string, SolveState>>>;

export interface ProblemFrontmatter {
  platform: "leetcode" | "hackerrank" | "codeforces";
  id: string;
  slug: string;
  difficulty: string;
  tags: string[];
  url: string;
  status: StatusMap;
}

const REQUIRED_FIELDS = [
  "platform",
  "id",
  "slug",
  "difficulty",
  "tags",
  "url",
  "status",
] as const;

const LANGUAGES: Language[] = ["ts", "py", "cpp"];
const SOLVE_STATES: SolveState[] = [
  "un-solved",
  "need-study",
  "attempted",
  "in-progress",
  "solved",
];

function validateStatusShape(status: unknown): asserts status is StatusMap {
  if (typeof status !== "object" || status === null || Array.isArray(status)) {
    throw new Error('Frontmatter field "status" must be an object');
  }

  for (const [language, approaches] of Object.entries(status)) {
    if (!LANGUAGES.includes(language as Language)) {
      throw new Error(`Unknown language "${language}" in "status"`);
    }
    if (
      typeof approaches !== "object" ||
      approaches === null ||
      Array.isArray(approaches)
    ) {
      throw new Error(`"status.${language}" must be an object`);
    }
    for (const [approach, state] of Object.entries(approaches)) {
      if (!SOLVE_STATES.includes(state as SolveState)) {
        throw new Error(
          `Unknown status "${state}" for "status.${language}.${approach}"`,
        );
      }
    }
  }
}

export function parseProblem(content: string): ProblemFrontmatter {
  const { data } = matter(content);

  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Missing required frontmatter field "${field}"`);
    }
  }

  if (!Array.isArray(data.tags)) {
    throw new Error('Frontmatter field "tags" must be an array');
  }

  validateStatusShape(data.status);

  return {
    platform: data.platform,
    id: String(data.id),
    slug: data.slug,
    difficulty: data.difficulty,
    tags: data.tags,
    url: data.url,
    status: data.status,
  };
}

export interface ProblemMetadata extends ProblemFrontmatter {
  /** Folder path relative to the repo root, e.g. "leetcode/0001-two-sum" */
  path: string;
}

const PLATFORM_ORDER: ProblemFrontmatter["platform"][] = [
  "leetcode",
  "hackerrank",
  "codeforces",
];

const PLATFORM_LABELS: Record<ProblemFrontmatter["platform"], string> = {
  leetcode: "LeetCode",
  hackerrank: "HackerRank",
  codeforces: "Codeforces",
};

const LANGUAGE_COLUMN_LABELS: Record<Language, string> = {
  ts: "TS",
  py: "Python",
  cpp: "C++",
};

const TABLE_HEADER = [
  `| Platform | # | Problem | Difficulty | Tags | ${LANGUAGES.map((l) => LANGUAGE_COLUMN_LABELS[l]).join(" | ")} |`,
  `| --- | --- | --- | --- | --- | ${LANGUAGES.map(() => "---").join(" | ")} |`,
].join("\n");

function renderLanguageCell(approaches: Record<string, SolveState> | undefined): string {
  if (!approaches) return "";
  return Object.keys(approaches)
    .sort()
    .map((approach) => `${approach}: ${approaches[approach]}`)
    .join(", ");
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function compareIds(a: string, b: string): number {
  const numA = Number(a);
  const numB = Number(b);
  if (Number.isFinite(numA) && Number.isFinite(numB)) {
    return numA - numB;
  }
  return a.localeCompare(b);
}

export function generateTable(problems: ProblemMetadata[]): string {
  if (problems.length === 0) {
    const emptyCells = LANGUAGES.map(() => "").join(" | ");
    return [TABLE_HEADER, `| _No problems yet._ | | | | | ${emptyCells} |`].join(
      "\n",
    );
  }

  const sorted = [...problems].sort((a, b) => {
    const platformDiff =
      PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform);
    if (platformDiff !== 0) return platformDiff;
    return compareIds(a.id, b.id);
  });

  const rows = sorted.map((problem) => {
    const title = slugToTitle(problem.slug);
    const languageCells = LANGUAGES.map((language) =>
      renderLanguageCell(problem.status[language]),
    ).join(" | ");
    return `| ${PLATFORM_LABELS[problem.platform]} | ${problem.id} | [${title}](${problem.path}) | ${problem.difficulty} | ${problem.tags.join(", ")} | ${languageCells} |`;
  });

  return [TABLE_HEADER, ...rows].join("\n");
}

export function validateStatusAgainstFiles(
  discovered: Partial<Record<Language, string[]>>,
  status: StatusMap,
): void {
  const languages = new Set<Language>([
    ...(Object.keys(discovered) as Language[]),
    ...(Object.keys(status) as Language[]),
  ]);

  for (const language of languages) {
    const files = new Set(discovered[language] ?? []);
    const entries = new Set(Object.keys(status[language] ?? {}));

    for (const approach of files) {
      if (!entries.has(approach)) {
        throw new Error(
          `Approach file "${language}/${approach}" has no matching status entry`,
        );
      }
    }
    for (const approach of entries) {
      if (!files.has(approach)) {
        throw new Error(
          `Status entry "${language}/${approach}" has no matching file`,
        );
      }
    }
  }
}

// --- CLI glue below: walks the repo, reads problem READMEs, and rewrites
// the marked block in the root README.md. Intentionally not unit tested
// (see spec's Testing Decisions) — thin, low-branching orchestration around
// the pure functions above.

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

function main(): void {
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
  main();
}
