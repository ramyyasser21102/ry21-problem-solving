# ry21-problem-solving

A personal archive of solved coding problems from LeetCode, HackerRank, and Codeforces, organized by platform, with progress tracked independently per language and per approach.

## Language

**Platform**:
One of the three vendors this repo tracks problems from: LeetCode, HackerRank, or Codeforces. Each has its own folder at the repo root and its own problem-numbering convention.
_Avoid_: Vendor, source, site

**Problem**:
A single coding challenge from a platform, represented by one folder holding a `README.md` (its metadata) and one subfolder per language it's been worked on in.
_Avoid_: Challenge, question, exercise

**Problem ID**:
The platform's own identifier for a problem — a LeetCode problem number, a Codeforces contest+letter pair, or a HackerRank domain/slug path. Shape varies by platform; always stored as a string, never assumed numeric.
_Avoid_: Number (only true for LeetCode), Problem Number

**Slug**:
The kebab-case, human-readable name for a problem, used in its folder name and its derived title (e.g. `two-sum` → "Two Sum").

**Difficulty**:
The platform's own difficulty rating for a problem, stored exactly as that platform expresses it — a category like Easy/Medium/Hard for LeetCode and HackerRank, a numeric rating for Codeforces. Never normalized to a shared scale: a Codeforces difficulty and a LeetCode difficulty are not comparable values.

**Approach**:
A distinct strategy for solving a problem — e.g. a brute-force approach versus an optimal approach. A problem can have multiple approaches, each its own file within a language folder.
_Avoid_: Method, technique, strategy

**Language**:
The programming language a particular approach is written in — TypeScript, Python, or C++. A problem gets its own subfolder per language it's been worked on in.

**Status**:
How far along one approach, in one language, is toward being solved. Tracked independently per language and per approach — finishing an approach in TypeScript says nothing about its status in Python, and finishing one approach says nothing about another approach to the same problem. Status only exists for an approach that already has a file; an approach with no file yet has no status at all.

One of:

- **Un-Solved**: the default state for a newly created solution file — no real attempt has been made yet.
- **Need Study**: the technique required is known, but hasn't been learned or practiced yet.
- **Attempted**: worked on at some point, but not currently being continued.
- **In Progress**: the current active focus — actively being worked toward a solution right now.
- **Solved**: a complete, correct solution exists.

**Progress Index**:
The generated table in the root `README.md`, listing every problem across all platforms with a column per language showing that language's per-approach status. Rebuilt from each problem's metadata by the reindex process.
_Avoid_: Table, dashboard
