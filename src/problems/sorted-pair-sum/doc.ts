// sorted-pair-sum — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding } from "./understanding.ts"
import { calculations } from "./calculations.ts"
import { approach as bruteRung } from "./approaches/brute.ts"
import { approach as hashRung } from "./approaches/hash.ts"
import { approach as squeezeRung } from "./approaches/squeeze.ts"
import { arc, comparison } from "./arc.ts"
import { interview, fluent } from "./interview.ts"
import { scriptNote, script, scriptOutput } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "sorted-pair-sum",
  understanding,
  calculations,
  approaches: [bruteRung, hashRung, squeezeRung],
  arc,
  comparison,
  interview,
  fluent,
  scriptNote,
  script,
  scriptOutput,
}

export default doc
