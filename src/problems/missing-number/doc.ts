// missing-number — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding } from "./understanding.ts"
import { approach as sortAndScanRung } from "./approaches/sort-and-scan.ts"
import { approach as tableOfFlagsRung } from "./approaches/table-of-flags.ts"
import { approach as putEachValueAtItsOwnIndexRung } from "./approaches/put-each-value-at-its-own-index.ts"
import { approach as subtractFromTheTotalRung } from "./approaches/subtract-from-the-total.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script, scriptOutput } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "missing-number",
  understanding,
  approaches: [sortAndScanRung, tableOfFlagsRung, putEachValueAtItsOwnIndexRung, subtractFromTheTotalRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
  scriptOutput,
}

export default doc
