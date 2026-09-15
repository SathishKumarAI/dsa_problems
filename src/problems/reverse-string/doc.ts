// reverse-string — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as recursionRung } from "./approaches/recursion.ts"
import { approach as growANewStringRung } from "./approaches/grow-a-new-string.ts"
import { approach as stackOfCharactersRung } from "./approaches/stack-of-characters.ts"
import { approach as copyBackToFrontRung } from "./approaches/copy-back-to-front.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script, scriptOutput } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "reverse-string",
  understanding,
  unlocks,
  approaches: [recursionRung, growANewStringRung, stackOfCharactersRung, copyBackToFrontRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
  scriptOutput,
}

export default doc
