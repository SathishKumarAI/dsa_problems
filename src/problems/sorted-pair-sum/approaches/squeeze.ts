// sorted-pair-sum — approach 3 — Two converging pointers (optimal)
//
// Converted from docs/deep/sorted-pair-sum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "squeeze",
  title: "Two converging pointers (optimal)",
  idea: `*The hash map pays n units of memory to remember which values exist — but the array is sorted, so
where a value sits already tells you how big it is. Can position replace memory?* Yes. Stand one
pointer at the smallest element and one at the largest; their sum tells you which of the two is
in the wrong place, and you move only that one. This fixes the hash map's weakness — the O(n)
book — by reading the same information straight off the ordering.`,
  intuition: `Two fingers walking toward each other from the ends of the list. The left finger is on the
smallest value still in play, the right finger on the largest, so their sum is the extreme case
in both directions. If the sum is too small, the only way to make it bigger is to give up the
smallest value — the left finger steps right. If it is too big, give up the largest — the right
finger steps left. Each step permanently removes one element from consideration, so the fingers
meet after at most n steps. The mental picture to keep is a *dial*: moving the left finger turns
the sum up, moving the right finger turns it down, and you are tuning toward the target.`,
  worked: `Input: \`nums = [1, 3, 6, 9]\`, \`target = 12\`.

| Step | i (value) | j (value) | Sum | vs target | Move |
|---|---|---|---|---|---|
| 1 | 0 (1) | 3 (9) | 10 | too small | 10 is the biggest sum any pair containing index 0 can reach, so index 0 is dead — \`i → 1\` |
| 2 | 1 (3) | 3 (9) | **12** | hit | return \`[1, 3]\` |

Two steps. Brute force took five and the hash map took four passes plus a three-entry dictionary;
this holds two integers and nothing else.`,
  code: `def sorted_pair_sum_two_pointers(nums: list[int], target: int) -> list[int]:
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return [i, j]
        if s < target:
            i += 1  # nums[i] paired with anything left of j is smaller still — retire it
        else:
            j -= 1
    return []`,
  mistake: `Writing \`while i <= j\`. When the pointers land on the same index the code adds an element to
itself, so an array containing \`6\` with \`target = 12\` returns \`[2, 2]\` — one element used twice,
which the statement forbids. The loop condition must be the strict \`i < j\`. A close second is
moving the *wrong* pointer: an \`if s < target: j -= 1\` typo makes the sum drop when it needed to
rise, the pointers cross without ever visiting the answer, and the function returns empty on
inputs that plainly have a solution.`,
  cost: `**Time O(n), space O(1).** Every iteration of the loop moves exactly one pointer inward and no
pointer ever moves back, so the total number of iterations is bounded by the gap between them,
which starts at n − 1. Space is two indices and a sum.

This is the right choice whenever the input is sorted (or is cheap to sort and the answer does not
depend on original positions) and the quantity you are searching for responds monotonically to
moving either end. It is strictly better than the hash map here on space and no worse on time, and
it is the pattern that the rest of this family — three-sum, k-sum, container-with-most-water — is
built on top of.`,
  notes: [
    { title: "the exchange argument — why skipping is safe", body: `This is the part an interviewer pushes on, and the part most write-ups leave out. The claim is:
**when \`nums[i] + nums[j] < target\`, no pair that uses index \`i\` can be the answer, so discarding
\`i\` throws away nothing.**

The proof is one line of arithmetic. The pairs still under consideration that use index \`i\` are
exactly \`(i, k)\` for \`k\` ranging over \`i+1 .. j\`. Because the array is sorted ascending,
\`nums[k] <= nums[j]\` for every such \`k\`. Therefore

\`\`\`
nums[i] + nums[k]  <=  nums[i] + nums[j]  <  target
\`\`\`

Every one of those pairs is *strictly below* the target. None of them can equal it. So index \`i\`
cannot appear in any answer that remains, and advancing \`i\` discards only losers. The mirror case
is identical with the inequality flipped: if \`nums[i] + nums[j] > target\`, then for every
\`k\` in \`i .. j-1\`, \`nums[k] >= nums[i]\`, so \`nums[k] + nums[j] >= nums[i] + nums[j] > target\`, and
index \`j\` is dead.

Two things make this work, and both are worth naming because they are the precondition you look
for when deciding whether *any* new problem is a two-pointer problem: the array is **sorted**, and
the quantity being compared is **monotone** in each pointer's movement. Remove sortedness and the
inequality \`nums[k] <= nums[j]\` evaporates, the whole argument collapses, and you are back to the
hash map.

Termination and completeness follow for free: each iteration retires exactly one index, the
pointers can never pass each other without the loop ending, and every index is retired only after
being proven unable to participate in a remaining answer. So if a pair exists, the pointers land
on it.

---` },
  ],
}
