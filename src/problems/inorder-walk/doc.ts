// inorder-walk — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { calculations } from "./calculations.ts"
import { approach as rebuildTheAnswerAtEveryNodeRung } from "./approaches/rebuild-the-answer-at-every-node.ts"
import { approach as oneListHandedDownRung } from "./approaches/one-list-handed-down.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { approach as morrisThreadingRung } from "./approaches/morris-threading.ts"
import { arc, comparison } from "./arc.ts"
import { interview, fluent } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "inorder-walk",
  understanding,
  unlocks,
  calculations,
  approaches: [rebuildTheAnswerAtEveryNodeRung, oneListHandedDownRung, optimalRung, morrisThreadingRung],
  arc,
  comparison,
  interview,
  fluent,
  scriptNote,
  script,
}

export default doc
