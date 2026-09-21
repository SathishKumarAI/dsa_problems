// The problem record, assembled from the files beside it. EAGER: this module is
// on the static import chain from `src/data/index.ts`, so everything it reaches
// is in the catalogue's chunk. Keep it to the record.
//
// The teaching document is NOT reachable from here — it hangs off `doc.ts`,
// which is imported only by `lib/content.ts`'s glob, so its ~30 KB of prose
// stays in a chunk of its own (B95).

import type { Problem } from "../../data/types.ts"
import * as p from "./problem.ts"
import { hints } from "./hints.ts"
import {
  alternatives,
  approach,
  arc,
  code,
  complexity,
  costWhy,
  whyNow,
} from "./solutions.ts"

export const problem: Problem = {
  id: p.id,
  title: p.title,
  pattern: p.pattern,
  difficulty: p.difficulty,
  leetcode: p.leetcode,
  brief: p.brief,
  statement: p.statement,
  constraints: p.constraints,
  examples: p.examples,
  // the five playbook fields
  unlocks: p.unlocks,
  checks: p.checks,
  reading: p.reading,
  costWhy,
  hints,
  approach,
  whyNow,
  arc,
  complexity,
  ...code,
  alternatives,
}
