// balanced-brackets — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import * as traps from "./traps.ts"
import { approach as deleteRung } from "./approaches/delete.ts"
import { approach as stackRung } from "./approaches/stack.ts"
import { approach as counterRung } from "./approaches/counter.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "balanced-brackets",
  understanding,
  unlocks,
  traps: { intro: traps.intro, rows: traps.rows, outro: traps.outro },
  approaches: [deleteRung, stackRung, counterRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
