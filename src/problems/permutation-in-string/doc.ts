// permutation-in-string — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as sortRung } from "./approaches/sort.ts"
import { approach as tallyRung } from "./approaches/tally.ts"
import { approach as agreeRung } from "./approaches/agree.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "permutation-in-string",
  understanding,
  unlocks,
  approaches: [sortRung, tallyRung, agreeRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
