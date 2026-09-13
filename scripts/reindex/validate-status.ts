import type { Language, StatusMap } from "./types.ts";

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
