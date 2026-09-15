// same-tree — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as serialiseRung } from "./approaches/serialise.ts"
import { approach as compareRung } from "./approaches/compare.ts"
import { approach as iterativeRung } from "./approaches/iterative.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "same-tree",
  understanding,
  unlocks,
  approaches: [serialiseRung, compareRung, iterativeRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
