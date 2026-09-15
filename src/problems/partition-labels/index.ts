// partition-labels — the problem record, assembled from the files beside it.
//
// EAGER: this module is on the static import chain from `src/data/index.ts`,
// so everything it reaches is in the catalogue's chunk. Keep it to the record.

import type { Problem } from "../../data/types.ts"
import { id, title, pattern, difficulty, leetcode, brief, statement, constraints, examples } from "./problem.ts"
import { hints } from "./hints.ts"
import { approach, whyNow, arc, complexity, python, alternatives } from "./solutions.ts"
import { walkthrough } from "./walkthrough.ts"

export const problem: Problem = {
  id,
  title,
  pattern,
  difficulty,
  leetcode,
  brief,
  statement,
  constraints,
  examples,
  hints,
  approach,
  whyNow,
  arc,
  complexity,
  python,
  alternatives,
  walkthrough,
}
