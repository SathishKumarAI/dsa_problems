// backspace-compare — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as recursionOneCancelAtATimeRung } from "./approaches/recursion-one-cancel-at-a-time.ts"
import { approach as rebuildTheTextBySlicingRung } from "./approaches/rebuild-the-text-by-slicing.ts"
import { approach as cancelWithAStackRung } from "./approaches/cancel-with-a-stack.ts"
import { approach as backwardPassWithASkipCounterRung } from "./approaches/backward-pass-with-a-skip-counter.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script, scriptOutput } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "backspace-compare",
  understanding,
  unlocks,
  approaches: [recursionOneCancelAtATimeRung, rebuildTheTextBySlicingRung, cancelWithAStackRung, backwardPassWithASkipCounterRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
  scriptOutput,
}

export default doc
