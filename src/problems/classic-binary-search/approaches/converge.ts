// classic-binary-search — approach 4 — Converge on the single survivor
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
  rung: "converge",
  title: "Converge on the single survivor",
  idea: `*What if the loop is not allowed to return early — what if it must run until exactly one candidate
remains, and only then look?* That is the other contract, and it is worth writing once here, on the
easiest possible problem, because **the next three problems in this pattern are all written in it.**
Shrink until \`lo == hi\`, then ask one question: is the survivor the target?

This does not fix a weakness in Approach 3 — for *this* problem Approach 3 is strictly better,
because it can return early on a hit. What this rung fixes is a weakness in **you**: the inclusive
contract cannot express "find the first index where a property starts holding", and that is what
\`search-insert-position\`, \`first-last-position\` and \`single-in-sorted\` all actually are.`,
  intuition: `> **Intuition.** A tournament, not a search. Instead of asking "is this it?" at every step, you ask
> the weaker question "could the answer be at or left of the middle?" and keep exactly the side that
> could contain it. You never declare a winner mid-tournament; you shrink the bracket until one
> competitor is left standing, and *then* you check whether the survivor is actually any good. The
> payoff is that "could the answer be at or left of here?" is a question you can ask about
> properties that no single element can confirm — *the first value that is at least the target*, *the
> first index where the pairing breaks* — and those are the problems where this contract is the only
> one that works.

> **Why it works.** The invariant is weaker than Approach 3's and that is the point: **if the target
> is present, its index is in \`[lo, hi]\`**, maintained by a predicate rather than an equality test.
> \`nums[mid] < target\` proves every index \`i <= mid\` is too small, so \`lo = mid + 1\` discards only
> indices that provably cannot hold the target. \`nums[mid] >= target\` leaves open that \`mid\` itself
> is the answer, so \`hi = mid\` keeps it. Termination: with \`lo < hi\`, \`midpoint\` returns something in
> \`[lo, hi - 1]\`, so \`lo = mid + 1\` strictly raises \`lo\` and \`hi = mid\` strictly lowers \`hi\`. The
> range shrinks every iteration and ends holding one index. The **final equality check is not
> optional** — the invariant only ever said "*if* present", and the survivor is where the target
> would be, not proof that it is.`,
  worked: `\`nums = [-3, 0, 4, 9, 12]\`. **Contract: converging, \`while lo < hi\`, \`lo = mid + 1\` / \`hi = mid\`,
verify at the end.**

| target | step | \`lo\` | \`hi\` | \`mid\` | \`nums[mid]\` | \`nums[mid] < target\`? | action |
|---|---|---|---|---|---|---|---|
| **9** | 1 | 0 | 4 | 2 | \`4\` | yes | \`lo = 3\` |
| | 2 | 3 | 4 | 3 | \`9\` | no | \`hi = 3\` |
| | — | 3 | 3 | — | — | — | survivor index 3, \`nums[3] == 9\` → **return 3** |
| **2** | 1 | 0 | 4 | 2 | \`4\` | no | \`hi = 2\` |
| | 2 | 0 | 2 | 1 | \`0\` | yes | \`lo = 2\` |
| | — | 2 | 2 | — | — | — | survivor index 2, \`nums[2] == 4 ≠ 2\` → **return −1** |

Look at the miss. The loop finishes perfectly happily, pointing at index 2 — which is not wrong,
it is **where \`2\` would go** if you inserted it. The loop found a boundary; the equality check is
what turns a boundary into an answer to *this* question. Hold that thought: the next document in this
pattern is the problem where you keep the boundary and drop the check.`,
  code: `def classic_binary_search_converging(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:  # converging range: stop with exactly one candidate left
        mid = midpoint(lo, hi)
        if nums[mid] < target:
            lo = mid + 1  # mid is provably too small, skip it
        else:
            hi = mid  # mid might BE the answer, so keep it
    return lo if nums[lo] == target else -1`,
  codeNote: `Note what is *absent*: there is no \`== target\` branch inside the loop. The loop does not look for the
target, it looks for a boundary; equality is checked once, at the end. That asymmetry — \`mid + 1\` on
one side, \`mid\` on the other — is the converging contract's signature, and seeing it should tell you
which contract you are reading before you read anything else.`,
  mistake: `> **Watch out.** The misconception is that once \`lo == hi\` the search "found" something, so the
> final comparison is a formality. It is not a formality. **The converging loop always terminates
> pointing at an index, whether the target exists or not** — on an array with no match at all, \`lo\`
> still lands somewhere, because the loop's job was to locate a boundary, not to confirm a value.

\`\`\`python
    return lo                 # WRONG — reports an index for a value that is not there
\`\`\`

Run it on \`nums = [-3, 0, 4, 9, 12]\`:

| target | present? | correct | dropping the check |
|---|---|---|---|
| \`9\` | yes | 3 | 3 |
| \`2\` | no | −1 | **2** |
| \`99\` | no | −1 | **4** |
| \`-99\` | no | −1 | **0** |

Every absent target gets a confident index. Note that the three wrong answers are not random —
\`2\` returns \`2\`, \`99\` returns \`4\`, \`-99\` returns \`0\` — those are precisely the *insertion points*.
The buggy function is not broken; it is a correct implementation of a **different problem**, and
recognising that is more useful than memorising the fix. (Its one real defect is at the edges: for
\`99\` it returns \`4\`, but the honest insertion point is \`5\`, one past the end, and a range capped at
\`len(nums) - 1\` cannot express that. The next document fixes exactly that.)`,
  cost: `**Time** \`O(log n)\`, **space** \`O(1)\`. The time is \`⌈log₂n⌉\` probes — note this is *exactly* that
many, always, with no early exit, where Approach 3 can get lucky and return on the first probe. The
constant factor is slightly worse for a hit and identical for a miss. Space is two integers.

Use it when the question is **"where is the boundary"** rather than **"is this value here"** — which
is to say, use it for almost every other problem in this pattern. For this problem, prefer Approach 3
and know this one exists; for \`search-insert-position\`, \`first-last-position\` and
\`single-in-sorted\`, this is the contract and Approach 3's shape does not fit.

---`,
}
