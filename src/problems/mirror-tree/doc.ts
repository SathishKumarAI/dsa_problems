// mirror-tree — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as palindromeOfTheValuesBrokenRung } from "./approaches/palindrome-of-the-values-broken.ts"
import { approach as buildTheMirrorThenCompareRung } from "./approaches/build-the-mirror-then-compare.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { approach as aQueueOfCrossedPairsRung } from "./approaches/a-queue-of-crossed-pairs.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "mirror-tree",
  understanding,
  unlocks,
  approaches: [palindromeOfTheValuesBrokenRung, buildTheMirrorThenCompareRung, optimalRung, aQueueOfCrossedPairsRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
