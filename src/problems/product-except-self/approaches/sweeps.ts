// product-except-self — approach 4 — Prefix forward, suffix folded back in (optimal)
//
// Converted from docs/deep/product-except-self_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "sweeps",
  title: "Prefix forward, suffix folded back in (optimal)",
  idea: `*Both auxiliary arrays are written once and read once — does either need to exist?* No. Write the
left products directly into the output array, then sweep backward carrying the right product in a
single variable, multiplying it into what the output already holds.

This fixes Approach 3's weakness — **it keeps \`2n\` numbers alive for the sole purpose of reading each
of them exactly once.**`,
  intuition: `> **Intuition.** The same two walkers, but they no longer leave notes for each other. The first
> writes its running product straight onto the answer sheet. The second comes back the other way and,
> instead of writing a second note, multiplies its running product into what is already written
> there. The answer sheet does double duty: on the way out a scratchpad holding the prefix, on the way
> back the finished answer, one slot at a time. The backward walker only ever needs *one* number in
> hand and never looks at any other position's suffix.

> **Why it works.** One invariant per sweep, and the order of the two lines inside each loop is what
> maintains it. Forward: \`out[i]\` is assigned \`running\` **before** \`nums[i]\` joins \`running\`, so
> \`out[i]\` holds the product of \`nums[0..i-1]\` and can never contain its own element. Backward:
> \`out[i]\` is multiplied by \`running\` **before** \`nums[i]\` joins it, so the factor applied is the
> product of \`nums[i+1..n-1]\`. The two ranges are disjoint and cover everything but \`i\`, which is the
> same argument as Approach 3 — only the storage changed, not the reasoning. A zero needs no special
> case because nothing is ever undone, only accumulated.`,
  worked: `\`nums = [1, 2, 3, 4]\`. **Forward sweep** — write \`running\` into \`out[i]\` *first*, then fold \`nums[i]\`
into \`running\`:

| \`i\` | \`running\` before | \`out[i]\` written | \`running\` after | \`out\` so far |
|---|---|---|---|---|
| 0 | 1 | 1 | 1 | \`[1, 1, 1, 1]\` |
| 1 | 1 | 1 | 2 | \`[1, 1, 1, 1]\` |
| 2 | 2 | 2 | 6 | \`[1, 1, 2, 1]\` |
| 3 | 6 | 6 | 24 | \`[1, 1, 2, 6]\` |

\`out\` now holds the prefix products \`[1, 1, 2, 6]\` — identical to Approach 3's \`left\`, stored nowhere
extra. The final \`running = 24\` is never read again.

**Backward sweep** — reset \`running\` to \`EMPTY_PRODUCT\` and walk from the right, multiplying into
\`out[i]\` before folding \`nums[i]\` in:

| \`i\` | \`out[i]\` before | \`running\` before | \`out[i]\` after | \`running\` after | \`out\` so far |
|---|---|---|---|---|---|
| 3 | 6 | 1 | **6** | 4 | \`[1, 1, 2, 6]\` |
| 2 | 2 | 4 | **8** | 12 | \`[1, 1, 8, 6]\` |
| 1 | 1 | 12 | **12** | 24 | \`[1, 12, 8, 6]\` |
| 0 | 1 | 24 | **24** | 24 | \`[24, 12, 8, 6]\` |

Two passes, one extra variable, no division, and a zero needs no handling at all — it is folded into
\`running\` like any other value and quietly makes every product it touches zero, which is
arithmetically correct rather than a special case.`,
  code: `def product_except_self_prefix_suffix(nums: list[int]) -> list[int]:
    n = len(nums)
    out = [EMPTY_PRODUCT] * n
    running = EMPTY_PRODUCT
    for i in range(n):
        out[i] = running     # written before nums[i] joins, so i excludes itself
        running *= nums[i]
    running = EMPTY_PRODUCT
    for i in range(n - 1, -1, -1):
        out[i] *= running    # folds the suffix into the prefix already stored
        running *= nums[i]
    return out`,
  codeNote: `On the 32-bit guarantee: every value ever *read* here is either a prefix product (bounded by one of
the answers) or a finished answer, so all of them fit. The only value that can exceed 32 bits is the
very last update of \`running\` in each pass — the product of the entire array — and that update is
dead. In Java it silently wraps and does no harm; in C++ signed overflow is formally undefined, so a
strict implementation stops one step early or uses \`long long\`.`,
  mistake: `> **Watch out.** The misconception is that the two lines in each loop are **independent statements**
> that happen to sit next to each other, so their order is a matter of taste. The order *is* the
> correctness argument: writing before folding is the entire reason position \`i\` is excluded from its
> own answer.

Folding \`nums[i]\` into \`running\` before writing:

\`\`\`python
for i in range(n):
    running *= nums[i]   # WRONG — running now includes nums[i]
    out[i] = running
\`\`\`

\`out[i]\` now holds "everything up to and including me", and after the backward sweep every answer is
multiplied by its own element. On \`[1, 2, 3, 4]\` this yields \`[24, 24, 24, 24]\` — the first entry
correct, which is exactly why the bug survives a casual glance.

The second mistake is forgetting to reset \`running\` between the sweeps. The backward pass then starts
from the full product of the array and every answer comes out multiplied by that total: \`[1, 2, 3, 4]\`
yields \`[576, 288, 192, 144]\`, the right answer times 24.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\` beyond the required output. Two passes, one multiplication and one
assignment per element per pass; the only storage is a single \`running\` accumulator, because the
output array — which you must return anyway — is reused as the prefix scratchpad. Two linear passes is
also the **floor**: every element influences \`n - 1\` answers, so no correct algorithm reads fewer than
all of them.

**This is the one to memorize.** It is short, optimal in both time and space, needs no special case
for zeros or negatives, and the pattern it teaches — *sweep prefixes forward, then fold suffixes
backward into the same array* — reappears in trapping rain water, in candy-distribution problems, and
in several range-query problems. Learn the shape, not the lines.

> **Under the hood.** Three documents in this set have found the ladder's optimal rung losing to a
> rung below it on the clock. This one does not, and it is worth seeing what "actually optimal" looks
> like when it is true. At the constraint's ceiling, \`n = 10^5\`, best of three: two prefix arrays
> **12.50 ms**, folded **7.14 ms** — 1.8× faster while holding **one** integer of scratch against
> 200,000. Both are \`O(n)\`; only one of them is also cheap.
>
> | \`n\` | two prefix arrays | folded |
> |---|---|---|
> | \`500\` | 0.04 ms | **0.03 ms** |
> | \`1,000\` | 0.10 ms | **0.06 ms** |
> | \`2,000\` | 0.20 ms | **0.13 ms** |
> | \`4,000\` | 0.42 ms | **0.26 ms** |
>
> Both columns double when \`n\` doubles. That is what linear looks like, and it is worth having seen,
> because the next table is what linear looks like when it is lying.
>
> **\`O(n)\` here means \`O(n)\` multiplications, not \`O(n)\` time**, and those are the same thing only
> because the statement promises every answer fits in a 32-bit integer. Break that promise — take an
> array of \`n\` twos, which is legal-looking input that no longer satisfies the constraint — and the
> running product stops being a machine word:
>
> | \`n\` | bits in the running product | decimal digits | folded |
> |---|---|---|---|
> | \`500\` | 501 | 151 | 0.1 ms |
> | \`1,000\` | 1,001 | 302 | 0.2 ms |
> | \`2,000\` | 2,001 | 603 | 1.2 ms |
> | \`4,000\` | 4,001 | 1,205 | **9.0 ms** |
>
> The time **quadruples** when \`n\` doubles. Same code, same number of multiplications, and it is now
> quadratic, because multiplying two \`k\`-bit numbers is not one instruction — it is work proportional
> to \`k\`, and \`k\` is growing linearly down the array. In Python the failure is a slowdown; in Java or
> C++ it is silent wraparound and a wrong answer.
>
> Now read the constraint again, because it says something surprising. At \`n = 10^5\`, "every answer
> fits in 32 bits" means the product of any \`n - 1\` elements is under about two billion — which with
> integer values forces **almost every element to be \`1\`, \`-1\` or \`0\`**. A legal array of a hundred
> thousand elements can contain at most about thirty values with magnitude 2 or more. The constraint
> is not a note about overflow; it is a description of what the input can actually look like.
>
> **What to take from this.** "Constant time arithmetic" is an assumption, not a fact, and it is the
> assumption that every \`O(n)\` claim about products, sums and hashes quietly rests on. When a problem
> hands you a bound on the *size of the answer*, it is not being fussy — it is telling you which
> machine model you are allowed to cost the algorithm in.

---`,
}
