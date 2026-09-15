// remove-element — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as deleteAndShiftRung } from "./approaches/delete-and-shift.ts"
import { approach as filterIntoACopyRung } from "./approaches/filter-into-a-copy.ts"
import { approach as countThenCompactRung } from "./approaches/count-then-compact.ts"
import { approach as readerAndWriterRung } from "./approaches/reader-and-writer.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script, scriptOutput } from "./script.ts"
import { notes } from "./notes.ts"

export const doc: TeachingDoc = {
  problemId: "remove-element",
  understanding,
  unlocks,
  approaches: [deleteAndShiftRung, filterIntoACopyRung, countThenCompactRung, readerAndWriterRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
  scriptOutput,
  notes,
}

export default doc
