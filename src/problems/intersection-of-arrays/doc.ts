// intersection-of-arrays — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as crossOffWithUsedFlagsRung } from "./approaches/cross-off-with-used-flags.ts"
import { approach as sortBothThenTwoCursorsRung } from "./approaches/sort-both-then-two-cursors.ts"
import { approach as countBothSidesTakeTheMinimumRung } from "./approaches/count-both-sides-take-the-minimum.ts"
import { approach as oneCountTableSpendAsYouGoRung } from "./approaches/one-count-table-spend-as-you-go.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script, scriptOutput } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "intersection-of-arrays",
  understanding,
  unlocks,
  approaches: [crossOffWithUsedFlagsRung, sortBothThenTwoCursorsRung, countBothSidesTakeTheMinimumRung, oneCountTableSpendAsYouGoRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
  scriptOutput,
}

export default doc
