// fruit-baskets — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as tryEveryStartingTreeRung } from "./approaches/try-every-starting-tree.ts"
import { approach as aWindowThatShrinksUntilItIsLegalRung } from "./approaches/a-window-that-shrinks-until-it-is-legal.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "fruit-baskets",
  understanding,
  unlocks,
  approaches: [tryEveryStartingTreeRung, aWindowThatShrinksUntilItIsLegalRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
