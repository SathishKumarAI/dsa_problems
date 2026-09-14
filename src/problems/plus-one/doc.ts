// plus-one — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as buildTheNumberAddOneSplitItBackRung } from "./approaches/build-the-number-add-one-split-it-back.ts"
import { approach as reverseCarryReverseBackRung } from "./approaches/reverse-carry-reverse-back.ts"
import { approach as carryFromTheBackRung } from "./approaches/carry-from-the-back.ts"
import { approach as specialCaseAllNinesRung } from "./approaches/special-case-all-nines.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "plus-one",
  understanding,
  unlocks,
  approaches: [buildTheNumberAddOneSplitItBackRung, reverseCarryReverseBackRung, carryFromTheBackRung, specialCaseAllNinesRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
