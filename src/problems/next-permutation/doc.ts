// next-permutation — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as listEveryArrangementInOrderRung } from "./approaches/list-every-arrangement-in-order.ts"
import { approach as tryEverySwapThenSortTheTailRung } from "./approaches/try-every-swap-then-sort-the-tail.ts"
import { approach as findThePivotThenSortTheTailRung } from "./approaches/find-the-pivot-then-sort-the-tail.ts"
import { approach as pivotSwapRebuildTheTailBackwardsRung } from "./approaches/pivot-swap-rebuild-the-tail-backwards.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "next-permutation",
  understanding,
  unlocks,
  approaches: [listEveryArrangementInOrderRung, tryEverySwapThenSortTheTailRung, findThePivotThenSortTheTailRung, pivotSwapRebuildTheTailBackwardsRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
