// first-missing-positive — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as try1Then2Then3Rung } from "./approaches/try-1-then-2-then-3.ts"
import { approach as sortThenWalkRung } from "./approaches/sort-then-walk.ts"
import { approach as hashSetRung } from "./approaches/hash-set.ts"
import { approach as booleanTableOfSizeN1Rung } from "./approaches/boolean-table-of-size-n-1.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script, scriptOutput } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "first-missing-positive",
  understanding,
  unlocks,
  approaches: [try1Then2Then3Rung, sortThenWalkRung, hashSetRung, booleanTableOfSizeN1Rung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
  scriptOutput,
}

export default doc
