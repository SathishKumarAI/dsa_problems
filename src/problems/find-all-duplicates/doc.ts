// find-all-duplicates — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as compareEveryPairRung } from "./approaches/compare-every-pair.ts"
import { approach as sortThenReadNeighboursRung } from "./approaches/sort-then-read-neighbours.ts"
import { approach as countInAHashMapRung } from "./approaches/count-in-a-hash-map.ts"
import { approach as aFlagPerValueRung } from "./approaches/a-flag-per-value.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script, scriptOutput } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "find-all-duplicates",
  understanding,
  unlocks,
  approaches: [compareEveryPairRung, sortThenReadNeighboursRung, countInAHashMapRung, aFlagPerValueRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
  scriptOutput,
}

export default doc
