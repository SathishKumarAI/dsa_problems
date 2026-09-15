// merge-sorted-array — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as insertOneAtATimeRung } from "./approaches/insert-one-at-a-time.ts"
import { approach as appendAndSortRung } from "./approaches/append-and-sort.ts"
import { approach as mergeIntoAScratchArrayRung } from "./approaches/merge-into-a-scratch-array.ts"
import { approach as copyOnlyASPrefixRung } from "./approaches/copy-only-a-s-prefix.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script, scriptOutput } from "./script.ts"
import { notes } from "./notes.ts"

export const doc: TeachingDoc = {
  problemId: "merge-sorted-array",
  understanding,
  unlocks,
  approaches: [insertOneAtATimeRung, appendAndSortRung, mergeIntoAScratchArrayRung, copyOnlyASPrefixRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
  scriptOutput,
  notes,
}

export default doc
