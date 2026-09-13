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

export interface ProblemMetadata extends ProblemFrontmatter {
  /** Folder path relative to the repo root, e.g. "leetcode/0001-two-sum" */
  path: string;
}

export const LANGUAGES: Language[] = ["ts", "py", "cpp"];

export const SOLVE_STATES: SolveState[] = [
  "un-solved",
  "need-study",
  "attempted",
  "in-progress",
  "solved",
];

export const PLATFORM_ORDER: ProblemFrontmatter["platform"][] = [
  "leetcode",
  "hackerrank",
  "codeforces",
];

export const PLATFORM_LABELS: Record<ProblemFrontmatter["platform"], string> = {
  leetcode: "LeetCode",
  hackerrank: "HackerRank",
  codeforces: "Codeforces",
};

export const LANGUAGE_COLUMN_LABELS: Record<Language, string> = {
  ts: "TS",
  py: "Python",
  cpp: "C++",
};
