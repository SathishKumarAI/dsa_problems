// three-sum-closest — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as everyTripleRung } from "./approaches/every-triple.ts"
import { approach as sortThenPruneRung } from "./approaches/sort-then-prune.ts"
import { approach as binarySearchTheThirdRung } from "./approaches/binary-search-the-third.ts"
import { approach as twoPointersRung } from "./approaches/two-pointers.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script, scriptOutput } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "three-sum-closest",
  understanding,
  unlocks,
  approaches: [everyTripleRung, sortThenPruneRung, binarySearchTheThirdRung, twoPointersRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
  scriptOutput,
}

export default doc
