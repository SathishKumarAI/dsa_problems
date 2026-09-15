// right-side-view — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as collectEveryLevelKeepTheLastOfEachRung } from "./approaches/collect-every-level-keep-the-last-of-each.ts"
import { approach as levelOrderRememberingOnlyTheLastRung } from "./approaches/level-order-remembering-only-the-last.ts"
import { approach as depthFirstLeftToRightOverwritingRung } from "./approaches/depth-first-left-to-right-overwriting.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "right-side-view",
  understanding,
  unlocks,
  approaches: [collectEveryLevelKeepTheLastOfEachRung, levelOrderRememberingOnlyTheLastRung, depthFirstLeftToRightOverwritingRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
