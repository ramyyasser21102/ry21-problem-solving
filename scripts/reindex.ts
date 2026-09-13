import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface ProblemFrontmatter {
  platform: "leetcode" | "hackerrank" | "codeforces";
  id: string;
  slug: string;
  difficulty: string;
  tags: string[];
  url: string;
}

const REQUIRED_FIELDS = [
  "platform",
  "id",
  "slug",
  "difficulty",
  "tags",
  "url",
] as const;

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

  return {
    platform: data.platform,
    id: String(data.id),
    slug: data.slug,
    difficulty: data.difficulty,
    tags: data.tags,
    url: data.url,
  };
}

export interface ProblemMetadata extends ProblemFrontmatter {
  /** Folder path relative to the repo root, e.g. "leetcode/0001-two-sum" */
  path: string;
  /** Language subfolder names found under the problem's folder, e.g. ["ts"] */
  languages: string[];
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

const TABLE_HEADER = [
  "| Platform | # | Problem | Difficulty | Tags | Languages solved in |",
  "| --- | --- | --- | --- | --- | --- |",
].join("\n");

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
    return [TABLE_HEADER, "| _No problems yet._ | | | | | |"].join("\n");
  }

  const sorted = [...problems].sort((a, b) => {
    const platformDiff =
      PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform);
    if (platformDiff !== 0) return platformDiff;
    return compareIds(a.id, b.id);
  });

  const rows = sorted.map((problem) => {
    const title = slugToTitle(problem.slug);
    return `| ${PLATFORM_LABELS[problem.platform]} | ${problem.id} | [${title}](${problem.path}) | ${problem.difficulty} | ${problem.tags.join(", ")} | ${problem.languages.join(", ")} |`;
  });

  return [TABLE_HEADER, ...rows].join("\n");
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

function discoverLanguages(problemDir: string): string[] {
  return fs
    .readdirSync(problemDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
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
      problems.push({
        ...frontmatter,
        path: path.relative(root, problemDir),
        languages: discoverLanguages(problemDir),
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
