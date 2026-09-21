// trap-rain-water — the problem record, assembled from the files beside it.
//
// EAGER: this module is on the static import chain from `src/data/index.ts`,
// so everything it reaches is in the catalogue's chunk. Keep it to the record.
//
// The teaching document is NOT reachable from here — it hangs off `doc.ts`,
// which is imported only by `lib/content.ts`'s glob, so its prose stays in a
// chunk of its own (B95).

import type { Problem } from "../../data/types.ts"
import {
  id,
  title,
  pattern,
  difficulty,
  leetcode,
  brief,
  statement,
  constraints,
  examples,
  unlocks,
  checks,
  reading,
} from "./problem.ts"
import { hints } from "./hints.ts"
import {
  approach,
  whyNow,
  arc,
  complexity,
  python,
  java,
  cpp,
  alternatives,
  costWhy,
} from "./solutions.ts"

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
  // the five playbook fields
  unlocks,
  checks,
  reading,
  costWhy,
  hints,
  approach,
  whyNow,
  arc,
  complexity,
  python,
  java,
  cpp,
  alternatives,
}
