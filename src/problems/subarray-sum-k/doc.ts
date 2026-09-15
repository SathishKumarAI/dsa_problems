// subarray-sum-k — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as bruteRung } from "./approaches/brute.ts"
import { approach as prefixRung } from "./approaches/prefix.ts"
import { approach as windowRung } from "./approaches/window.ts"
import { approach as countsRung } from "./approaches/counts.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script, scriptOutput } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "subarray-sum-k",
  understanding,
  unlocks,
  approaches: [bruteRung, prefixRung, windowRung, countsRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
  scriptOutput,
}

export default doc
