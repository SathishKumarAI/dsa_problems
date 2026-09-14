// rotate-array — approach 4 — Cyclic replacements
//
// Converted from docs/deep/rotate-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "cyclic-replacements",
  title: "Cyclic replacements",
  idea: `*The copies exist only because a value has nowhere to go when its destination is occupied — what if
you carry the displaced value with you?* Pick up \`nums[0]\`, put it where it belongs, pick up whatever
was sitting there, and continue. Each chain eventually returns to where it began, and one spare
variable is all the storage you ever need.

This fixes the weakness shared by Approaches 2 and 3: **both allocate a second array the size of the
input**, which the follow-up forbids.`,
  intuition: `> **Intuition.** Musical chairs where you are the only person standing. You hold one value, walk to
> the seat it belongs in, tap the occupant, put your value down — and now you are holding *their*
> value, so you walk to where that one belongs. Eventually you arrive back at the chair you emptied
> at the very start, put the last value down, and the **chain** is closed.

> **Why it works.** Stepping repeatedly by \`k\` around a ring of \`n\` seats returns to the start after
> \`n / gcd(n, k)\` steps — that is the smallest number of steps whose total, a multiple of \`k\`, is also
> a multiple of \`n\`. So the seats split into exactly **\`gcd(n, k)\` disjoint chains**, each of that
> length, and one chain visits every seat only when \`gcd(n, k) = 1\`. This is why the code counts
> values moved rather than trusting a closed chain to mean a finished array, and it is the one fact
> this rung teaches that no other rung shows.`,
  worked: `\`nums = [1, 2, 3, 4, 5, 6, 7]\`, \`k = 3\`, \`n = 7\`. Here \`gcd(7, 3) = 1\`, so there is exactly one chain
and it visits all seven slots. Start at index 0, pick up the \`1\`.

| step | from \`i\` | to \`j = (i + 3) % 7\` | value put down | value picked up | array after | \`moved\` |
|---|---|---|---|---|---|---|
| 1 | 0 | 3 | \`1\` | \`4\` | \`[1, 2, 3, 1, 5, 6, 7]\` | 1 |
| 2 | 3 | 6 | \`4\` | \`7\` | \`[1, 2, 3, 1, 5, 6, 4]\` | 2 |
| 3 | 6 | 2 | \`7\` | \`3\` | \`[1, 2, 7, 1, 5, 6, 4]\` | 3 |
| 4 | 2 | 5 | \`3\` | \`6\` | \`[1, 2, 7, 1, 5, 3, 4]\` | 4 |
| 5 | 5 | 1 | \`6\` | \`2\` | \`[1, 6, 7, 1, 5, 3, 4]\` | 5 |
| 6 | 1 | 4 | \`2\` | \`5\` | \`[1, 6, 7, 1, 2, 3, 4]\` | 6 |
| 7 | 4 | 0 | \`5\` | \`1\` | \`[5, 6, 7, 1, 2, 3, 4]\` | 7 |

Step 7 lands back on index 0, so the inner loop breaks. \`moved\` is 7, which equals \`n\`, so no second
chain starts. Seven writes for seven values, and the only storage used was one \`carry\`.

Contrast \`nums = [1, 2, 3, 4, 5, 6]\`, \`k = 2\`, where \`gcd(6, 2) = 2\`:

| chain | slots it visits | closes after | \`moved\` |
|---|---|---|---|
| starting at 0 | 0 → 2 → 4 → 0 | 3 moves | 3 |
| starting at 1 | 1 → 3 → 5 → 1 | 3 moves | 6 = \`n\`, stop |`,
  code: `def rotate_array_cyclic(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    moved = 0
    start = 0
    while moved < n:  # the counter restarts the walk for each of gcd(n, k) chains
        i = start
        carry = nums[start]
        while True:
            j = (i + k) % n
            nums[j], carry = carry, nums[j]
            i = j
            moved += 1
            if i == start:
                break
        start += 1
    return nums`,
  mistake: `> **Watch out.** The misconception is *"the chain returns to the start once every value has been
> placed."* It returns to the start once **its own** cycle is finished, which may be a small fraction
> of the array. Dropping the \`moved\` counter and the outer loop is the natural thing to do, and on
> the statement's own example the bug is invisible, because \`gcd(7, 3) = 1\` and the single chain
> really does cover all seven slots.

Measured, on inputs where \`n\` and \`k\` share a factor:

| input | single-chain version | correct | chains |
|---|---|---|---|
| \`[1, 2, 3, 4, 5, 6]\`, \`k = 2\` | \`[5, 2, 1, 4, 3, 6]\` | \`[5, 6, 1, 2, 3, 4]\` | \`gcd(6, 2) = 2\` |
| \`[1, 2, 3, 4, 5, 6, 7, 8]\`, \`k = 4\` | \`[5, 2, 3, 4, 1, 6, 7, 8]\` | \`[5, 6, 7, 8, 1, 2, 3, 4]\` | \`gcd(8, 4) = 4\` |
| \`[1, 2, 3, 4, 5, 6, 7]\`, \`k = 3\` | \`[5, 6, 7, 1, 2, 3, 4]\` | same — **passes** | \`gcd(7, 3) = 1\` |

In the second row only indices 0 and 4 were touched; the other six values sit exactly where they
started. This is the most instructive bug in the problem, because the failing inputs are the ones a
quick manual test is least likely to choose, and because the fix is not a patch — it is recognising
the cycle decomposition.

Using a sentinel value in the array to mark moved slots is **not** an acceptable alternative fix: the
constraints allow every 32-bit value, so no number is left over to mean "moved".`,
  cost: `**Time \`O(n)\`, space \`O(1)\`.** Every value is picked up once and put down once across all chains —
\`moved\` reaching \`n\` is the proof — so it is exactly \`n\` writes, the theoretical minimum. Space is
one \`carry\`, one counter and two indices, regardless of \`n\`.

Use it when you need an in-place rotation and writes are genuinely the bottleneck; this is the only
rung that touches each slot once. Use it also when the permutation is a known bijection but **not** a
rotation, because cycle-following generalises and the reversal trick does not. But be honest about
the cost: the \`gcd\` reasoning is what people get wrong under pressure, and the next rung arrives at
the same place with nothing to count.

---`,
}
