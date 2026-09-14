import { slugToTitle, type Language, type ProblemFrontmatter } from "../reindex/types.ts";

export type ProblemFields = Omit<ProblemFrontmatter, "status">;

export function buildReadmeContent(
  fields: ProblemFields,
  language: Language,
  approaches: string[],
): string {
  const statusLines = approaches
    .map((approach) => `    ${approach}: un-solved`)
    .join("\n");

  const approachLines = approaches
    .map((approach) => `- **\`${approach}\`** — TODO: describe this approach.`)
    .join("\n");

  return `---
platform: ${fields.platform}
id: "${fields.id}"
slug: ${fields.slug}
difficulty: ${fields.difficulty}
tags: [${fields.tags.join(", ")}]
url: ${fields.url}
status:
  ${language}:
${statusLines}
---

# ${slugToTitle(fields.slug)}

## Approaches

${approachLines}
`;
}
