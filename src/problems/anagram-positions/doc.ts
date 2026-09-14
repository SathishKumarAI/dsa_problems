// anagram-positions — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as sortEveryWindowRung } from "./approaches/sort-every-window.ts"
import { approach as countEveryWindowFromScratchRung } from "./approaches/count-every-window-from-scratch.ts"
import { approach as slideTheTallyCompareAll26Rung } from "./approaches/slide-the-tally-compare-all-26.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "anagram-positions",
  understanding,
  unlocks,
  approaches: [sortEveryWindowRung, countEveryWindowFromScratchRung, slideTheTallyCompareAll26Rung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
