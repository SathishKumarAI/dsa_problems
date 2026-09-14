// summary-ranges — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as paintTheNumberLineRung } from "./approaches/paint-the-number-line.ts"
import { approach as bucketByValueMinusIndexRung } from "./approaches/bucket-by-value-minus-index.ts"
import { approach as splitIntoRunListsRung } from "./approaches/split-into-run-lists.ts"
import { approach as collectTheBreakPointsRung } from "./approaches/collect-the-break-points.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "summary-ranges",
  understanding,
  unlocks,
  approaches: [paintTheNumberLineRung, bucketByValueMinusIndexRung, splitIntoRunListsRung, collectTheBreakPointsRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
