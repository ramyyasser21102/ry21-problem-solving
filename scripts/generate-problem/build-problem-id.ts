export type ProblemIdInput =
  | { platform: "leetcode"; number: string; slug: string }
  | { platform: "codeforces"; contest: string; letter: string; slug: string }
  | { platform: "hackerrank"; domain: string; slug: string };

export interface BuiltProblemId {
  id: string;
  folderPath: string;
}

export function buildProblemId(input: ProblemIdInput): BuiltProblemId {
  switch (input.platform) {
    case "leetcode": {
      const paddedNumber = input.number.padStart(4, "0");
      return {
        id: input.number,
        folderPath: `leetcode/${paddedNumber}-${input.slug}`,
      };
    }
    case "codeforces": {
      const id = `${input.contest}${input.letter}`.toLowerCase();
      return {
        id,
        folderPath: `codeforces/${id}-${input.slug}`,
      };
    }
    case "hackerrank": {
      const id = `${input.domain}/${input.slug}`;
      return {
        id,
        folderPath: `hackerrank/${input.domain}/${input.slug}`,
      };
    }
  }
}
