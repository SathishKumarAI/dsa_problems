// product-except-self — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { calculations } from "./calculations.ts"
import { approach as bruteRung } from "./approaches/brute.ts"
import { approach as divisionRung } from "./approaches/division.ts"
import { approach as prefixRung } from "./approaches/prefix.ts"
import { approach as sweepsRung } from "./approaches/sweeps.ts"
import { arc, comparison } from "./arc.ts"
import { interview, fluent } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "product-except-self",
  understanding,
  unlocks,
  calculations,
  approaches: [bruteRung, divisionRung, prefixRung, sweepsRung],
  arc,
  comparison,
  interview,
  fluent,
  scriptNote,
  script,
}

export default doc
