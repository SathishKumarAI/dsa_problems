// classic-binary-search — approach 3 — The same halving, iteratively
//
// Converted from docs/deep/classic-binary-search_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "loop",
  title: "The same halving, iteratively",
  idea: `*The recursion's every call does the same thing to two variables and then tail-calls itself — is the
stack doing any work?* No. \`lo\` and \`hi\` are the entire state, and a loop can carry two integers
without asking the runtime for a frame. Rewrite the recursion as a \`while\` and the space collapses
to constant.

This fixes Approach 2's only real weakness — **\`O(log n)\` stack frames bought nothing**, and in
languages without tail-call elimination (including Python) they are a genuine, if small, cost.`,
  intuition: `> **Intuition.** Two bookmarks in the shelf, one at each end of the stretch that could still contain
> the ticket. Every step you look at the ticket halfway between them and move **one** bookmark past
> the middle — past, never onto it, because you have already read that ticket and it told you what
> it knows. The bookmarks march toward each other. When they cross, the stretch between them is
> empty and the ticket was never on the shelf. The recursion was two bookmarks too, it was just
> paying the runtime to hold them.

> **Why it works.** Same invariant, same discard argument as Approach 2 — if the target is present,
> its index is in \`[lo, hi]\`; \`nums[mid] < target\` proves every index \`i <= mid\` has \`nums[i] <
> target\` and therefore cannot be the answer. What the loop adds is a **termination** argument:
> every iteration either returns or moves \`lo\` strictly up or \`hi\` strictly down, so \`hi - lo\`
> strictly decreases, so after at most \`log₂n + 1\` iterations the range is empty. The \`mid ± 1\` is
> doing double duty here — correctness *and* termination — which is why it is not negotiable.`,
  worked: `\`nums = [-3, 0, 4, 9, 12]\`. **Contract: inclusive \`[lo, hi]\`, \`while lo <= hi\`, both moves
\`mid ± 1\`.**

| target | step | \`lo\` | \`hi\` | range | \`mid\` | \`nums[mid]\` | compare | action |
|---|---|---|---|---|---|---|---|---|
| **9** | 1 | 0 | 4 | \`[-3, 0, 4, 9, 12]\` | 2 | \`4\` | \`4 < 9\` | \`lo = 3\` |
| | 2 | 3 | 4 | \`[9, 12]\` | 3 | \`9\` | **equal** | **return 3** |
| **2** | 1 | 0 | 4 | \`[-3, 0, 4, 9, 12]\` | 2 | \`4\` | \`4 > 2\` | \`hi = 1\` |
| | 2 | 0 | 1 | \`[-3, 0]\` | 0 | \`-3\` | \`-3 < 2\` | \`lo = 1\` |
| | 3 | 1 | 1 | \`[0]\` | 1 | \`0\` | \`0 < 2\` | \`lo = 2\` |
| | 4 | 2 | 1 | \`[]\` | — | — | \`lo > hi\` | **return −1** |

Step 3 of the miss is the row worth memorising: a **one-element range**, \`lo == hi == 1\`, and it is
examined properly. Approach 2's common mistake is exactly the code that skips this row. Step 4 is the
exit: \`lo = 2\`, \`hi = 1\`, the range is \`nums[2..1]\`, which is empty and correct.`,
  code: `def classic_binary_search_iterative(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:  # inclusive range: lo == hi still holds one live candidate
        mid = midpoint(lo, hi)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1  # everything at or left of mid is too small
        else:
            hi = mid - 1  # everything at or right of mid is too large
    return -1`,
  mistake: `> **Watch out.** The misconception is that \`lo = mid\` is the "safe" move and \`lo = mid + 1\` the
> risky one — that keeping \`mid\` in play guards against losing the answer. In the inclusive contract
> it is the opposite: \`mid\` has already been compared and found unequal, so keeping it is not
> caution, it is a **fixed point**. The range stops shrinking and the loop never ends.

\`\`\`python
        if nums[mid] < target:
            lo = mid          # WRONG — mid was already rejected, and now it never leaves
\`\`\`

This does not return a wrong answer. It **hangs**. Running it on the worked example with \`target =
12\` and a step counter to stop the bleeding, here is what it does:

| step | \`lo\` | \`hi\` | \`mid\` | \`nums[mid]\` | action |
|---|---|---|---|---|---|
| 1 | 0 | 4 | 2 | \`4\` | \`lo = 2\` |
| 2 | 2 | 4 | 3 | \`9\` | \`lo = 3\` |
| 3 | 3 | 4 | 3 | \`9\` | \`lo = 3\` |
| 4 | 3 | 4 | 3 | \`9\` | \`lo = 3\` |
| … | 3 | 4 | 3 | \`9\` | forever |

\`lo + (4 - 3) // 2 = 3\` for as long as you care to watch. The submission does not come back with a
wrong answer; it times out, which is a harder failure to read. **The rule that prevents it:** in the
inclusive contract, \`mid\` has been *fully judged* by the time you move a pointer, so both moves skip
it. There is no branch in which keeping \`mid\` is correct.

The mirror bug, \`hi = mid\` with \`while lo <= hi\`, hangs the same way for the same reason — that is
the first row of the mixing table up at the top of the document.`,
  cost: `**Time** \`O(log n)\`, **space** \`O(1)\`. The time is the halving count: each iteration at least halves
\`hi - lo + 1\`, so the loop body runs at most \`⌊log₂n⌋ + 1\` times — fourteen for \`n = 10⁴\`, twenty-four
for a ten-million-element array. The space is two integers and a third for \`mid\`, regardless of \`n\`;
nothing is allocated and nothing is stacked.

**This is the one to write.** It is the version the data file ships as the primary solution, it is
what an interviewer expects to see, and it is the shape every later problem in this pattern
customises. When the question is literally "is this value here, and where", the inclusive contract
with an early \`return\` on the hit is the shortest honest answer.

---`,
}
