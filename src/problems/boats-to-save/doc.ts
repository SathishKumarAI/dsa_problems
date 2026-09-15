// boats-to-save — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through `lib/content.ts`'s glob, so every part it imports lands
// in a chunk of its own. `index.ts` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
import { understanding, unlocks } from "./understanding.ts"
import { approach as exactSearchOverEveryGroupRung } from "./approaches/exact-search-over-every-group.ts"
import { approach as rescanForTheHeaviestAndTheLightestRung } from "./approaches/rescan-for-the-heaviest-and-the-lightest.ts"
import { approach as sortThenEmptyTheQueueFromBothEndsRung } from "./approaches/sort-then-empty-the-queue-from-both-ends.ts"
import { approach as countTheWeightsIntoBucketsRung } from "./approaches/count-the-weights-into-buckets.ts"
import { approach as optimalRung } from "./approaches/optimal.ts"
import { arc, comparison } from "./arc.ts"
import { interview } from "./interview.ts"
import { scriptNote, script } from "./script.ts"

export const doc: TeachingDoc = {
  problemId: "boats-to-save",
  understanding,
  unlocks,
  approaches: [exactSearchOverEveryGroupRung, rescanForTheHeaviestAndTheLightestRung, sortThenEmptyTheQueueFromBothEndsRung, countTheWeightsIntoBucketsRung, optimalRung],
  arc,
  comparison,
  interview,
  scriptNote,
  script,
}

export default doc
