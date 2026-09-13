import matter from "gray-matter";
import {
  LANGUAGES,
  SOLVE_STATES,
  type Language,
  type ProblemFrontmatter,
  type SolveState,
  type StatusMap,
} from "./types.ts";

const REQUIRED_FIELDS = [
  "platform",
  "id",
  "slug",
  "difficulty",
  "tags",
  "url",
  "status",
] as const;

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
