import {
  LANGUAGE_COLUMN_LABELS,
  LANGUAGES,
  PLATFORM_LABELS,
  PLATFORM_ORDER,
  slugToTitle,
  type ProblemMetadata,
  type SolveState,
} from "./types.ts";

const TABLE_HEADER = [
  `| Platform | # | Problem | Difficulty | Tags | ${LANGUAGES.map((l) => LANGUAGE_COLUMN_LABELS[l]).join(" | ")} |`,
  `| --- | --- | --- | --- | --- | ${LANGUAGES.map(() => "---").join(" | ")} |`,
].join("\n");

function renderLanguageCell(
  approaches: Record<string, SolveState> | undefined,
): string {
  if (!approaches) return "";
  return Object.keys(approaches)
    .sort()
    .map((approach) => `${approach}: ${approaches[approach]}`)
    .join(", ");
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
    return [
      TABLE_HEADER,
      `| _No problems yet._ | | | | | ${emptyCells} |`,
    ].join("\n");
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
