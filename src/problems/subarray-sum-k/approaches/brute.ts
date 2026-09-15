// subarray-sum-k — approach 1 — Sum every subarray
//
// Converted from docs/deep/subarray-sum-k_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "brute",
  title: "Sum every subarray",
  idea: `*How do I know whether the stretch from \`i\` to \`j\` adds up to \`k\`?* Add it up and look. *And how do
I count them all?* Fix a start, walk right to the end keeping a running total, and tick a counter
every time that total lands on \`k\` — then do it again for the next start. This is the baseline: it
uses nothing about the input except that the values can be added.`,
  intuition: `> **Intuition.** Picture a ruler you keep sliding along the row. Plant its left end at position 0
> and stretch the right end one tile at a time, calling out the total after each stretch; every
> time you call out \`k\`, that is one answer. When the right end runs off the row you move the left
> end one step right and start stretching again from there. The important detail is that the
> running total *is* reused inside one start — you never re-add a whole stretch from scratch — but
> it is thrown away entirely the moment the start moves. That discarded work is the whole story of
> the rest of this file.`,
  worked: `\`nums = [1, -1, 0]\`, \`k = 0\`.

| Step | start \`i\` | end \`j\` | \`running\` | Verdict |
|---|---|---|---|---|
| 1 | 0 | 0 | 0 + 1 = **1** | not 0 |
| 2 | 0 | 1 | 1 + (−1) = **0** | hit — \`[1, -1]\`, count = 1 |
| 3 | 0 | 2 | 0 + 0 = **0** | hit — \`[1, -1, 0]\`, count = 2 |
| 4 | 1 | 1 | 0 + (−1) = **−1** | not 0 |
| 5 | 1 | 2 | −1 + 0 = **−1** | not 0 |
| 6 | 2 | 2 | 0 + 0 = **0** | hit — \`[0]\`, count = 3 |

Six additions for a three-element array. Stare at step 3: the total was *already* \`0\` at step 2 and
the stretch kept qualifying after swallowing a zero. That is a negative-and-zero array doing
something a strictly positive array never does, and it is the reason the window fails later.`,
  code: `def subarray_sum_k_brute_force(nums: list[int], k: int) -> int:
    total = 0
    for i in range(len(nums)):
        running = 0
        for j in range(i, len(nums)):
            running += nums[j]
            if running == k:
                total += 1
    return total`,
  mistake: `> **Watch out.** The misconception is that each **start** can contribute at most one answer, so a
> \`break\` after \`total += 1\` is free speed. That is the right instinct for *"does a subarray summing
> to \`k\` exist?"* and the wrong one for *"how many?"* — and the two questions look identical until
> a zero or a negative shows up.

On this very example the \`break\` costs you step 3: the start at index 0 reaches \`k\` at \`[1, -1]\`
**and again** at \`[1, -1, 0]\`, so it returns **2** instead of 3. On an array of strictly positive
numbers the \`break\` really is harmless, because once the total passes \`k\` it never comes back — so
the bug hides on exactly the inputs people test with first.`,
  cost: `**Time** \`O(n²)\`, **space** \`O(1)\`. The cost is the pair of nested walks: \`n\` starts, each extending
up to \`n\` tiles, one addition and one comparison per step. The space is three integers no matter how
big the array is.

Use it when \`n\` is genuinely small and — more usefully — as the oracle you check a clever solution
against. That is exactly its job at the bottom of this file: it is slow, but it is so plainly a
direct transcription of the question that if it disagrees with your fast version, the fast version
is wrong.

---`,
}
