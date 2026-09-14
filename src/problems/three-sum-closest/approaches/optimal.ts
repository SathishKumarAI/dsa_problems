// three-sum-closest — approach 5 — Two pointers with an early exit (optimal)
//
// Converted from docs/deep/three-sum-closest_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "Two pointers with an early exit (optimal)",
  idea: `*The sweep keeps grinding through every remaining pair even after finding a sum equal to the target —
and nothing can improve on a distance of zero.* Return the moment \`s == target\`. This fixes the
previous rung's only remaining waste: **it cannot recognise that it has already won.**`,
  intuition: `> **Intuition.** You are hunting for the closest reading to a mark, and the needle lands exactly on
> it. There is no reading closer than *exact*, so the search is over — continuing is not caution, it is
> refusing to accept an answer you already hold. One comparison per step buys that recognition, and on
> the very common case where an exact triple exists it turns a full \`O(n²)\` sweep into an early exit.

Note what the early exit is **not**: it is not a pruning heuristic that might skip the right answer.
Distance \`0\` is the global minimum of the objective, so returning is provably correct, not merely
usually fine.`,
  worked: `Sorted: \`[-4, -1, 1, 2]\`, \`target = 1\`.

| \`i\` (\`nums[i]\`) | \`lo\` (\`nums[lo]\`) | \`hi\` (\`nums[hi]\`) | \`s\` | \`s == target\`? | \`best\` after | move |
|---|---|---|---|---|---|---|
| 0 (−4) | 1 (−1) | 3 (2) | −3 | no | **−3** | \`lo++\` |
| 0 (−4) | 2 (1) | 3 (2) | −1 | no | **−1** | \`lo++\` |
| — | 3 | 3 | — | — | — | anchor −4 retired |
| 1 (−1) | 2 (1) | 3 (2) | 2 | no | **2** | \`hi--\` |
| — | 2 | 2 | — | — | — | anchor −1 retired |

Result **2**. ✅ On this input the early exit never fires — no triple hits \`1\` exactly — so the trace is
identical to approach 4, which is the point: **the extra line costs one comparison and changes
nothing when it does not apply.**

Change the target to \`2\` and the first row of the third anchor becomes \`s = 2 == target\`, and the
function returns on the spot with two fewer iterations. The script below includes that case.`,
  code: `def three_sum_closest_early_exit(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            best = better(s, best, target)
            if s == target:                  # distance 0 is the global minimum: nothing can beat it
                return target
            if s < target:
                lo += 1
            else:
                hi -= 1
    return best`,
  mistake: `> **Watch out.** Indenting the final \`return best\` **inside** the \`for i\` loop. The misconception is
> that the early-exit rung "returns as soon as it has an answer" — it returns as soon as it has a
> *perfect* answer, and \`best\` after one anchor is merely the best among the triples starting at
> \`nums[0]\`. Adding a return statement to a loop that already has one makes the misplacement very easy
> to write and very hard to see.

Measured on the worked example it returns \`-1\` instead of \`2\`: the first anchor \`-4\` yields \`-1\` as its
local best, and the winning triple lives under the *second* anchor. On \`nums = [-5,-4,-3,-2]\`,
\`target = 1000\` it returns \`-10\` where the answer is \`-9\`.

The much smaller sibling: returning \`s\` rather than \`target\` on the exact hit. They are equal at that
point, so it is correct — but writing \`target\` says *why* you are returning, and the code documents
its own stopping rule.`,
  cost: `**Time \`O(n²)\` worst case, often far less** — the sort is \`O(n log n)\`, the sweep is \`n\` anchors ×
linear inner scan, and the exit fires on the first exact hit. The worst case (no triple equals the
target) is unchanged and is stated analytically, not measured. **Space \`O(1)\`** beyond the sorted copy.

> **In an interview.** Ship this one. Open by naming the difference from 3Sum out loud — *"same
> engine, different stopping rule: there is no exact hit to skip past, so the pointers move by the
> sign of the difference and I track the best sum separately"* — because that sentence is what the
> question is testing. Have the exchange argument ready for "why is it safe to move only one pointer?"
> and be explicit that you are **not** skipping duplicate values, because the answer is a single
> integer rather than a set of triples. Expect the follow-up *"what if I wanted the triple, not the
> sum?"* — store the three indices alongside \`best\` inside \`better\`'s caller; nothing else changes.

---`,
}
