// swap-pairs — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as valuesRung } from "./approaches/values.ts"
import { approach as arrayRung } from "./approaches/array.ts"
import { approach as recurseRung } from "./approaches/recurse.ts"
import { approach as prevRung } from "./approaches/prev.ts"
import { approach as dummyRung } from "./approaches/dummy.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "swap-pairs",
  understanding,
  unlocks,
  approaches: [valuesRung, arrayRung, recurseRung, prevRung, dummyRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
