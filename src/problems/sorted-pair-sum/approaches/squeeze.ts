// sorted-pair-sum — approach 3 — Two converging pointers (optimal)
//
// Rewritten 2026-10-17 for reading: the reasoning as points, the mistake as
// bug / cousin, the exchange argument cut to the claim, the one-line proof and
// the two preconditions. Same six parts docs/deep/README.md §3 requires;
// `rung` binds this section to the problem's own ladder (solutions.ts).

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "squeeze",
  title: "Two converging pointers (optimal)",
  idea: `*The map pays n units of memory to know which values exist — but in a sorted array, position
already says how big a value is. Can position replace memory?* Yes. One pointer on the smallest
value, one on the largest; their sum says which of the two is in the wrong place, and only that one
moves.`,
  intuition: `- Two fingers walking inward from the ends. Left is on the smallest value still in play, right on
  the largest, so their sum is the extreme in both directions.
- Sum too small: the only way up is to give up the smallest — the left finger steps right.
- Sum too big: give up the largest — the right finger steps left.
- Each step retires one element for good, so the fingers meet after at most n − 1 steps.
- **Keep this picture:** a dial. The left finger turns the sum up, the right one turns it down, and
  you are tuning toward the target.`,
  worked: `Input: \`nums = [1, 3, 6, 9]\`, \`target = 12\`.

| Step | i (value) | j (value) | Sum | vs target | Move |
|---|---|---|---|---|---|
| 1 | 0 (1) | 3 (9) | 10 | too small | 10 is the biggest sum any pair with index 0 can reach, so index 0 is dead — \`i → 1\` |
| 2 | 1 (3) | 3 (9) | **12** | hit | return \`[1, 3]\` |

Two steps. Brute force took five, the map took four plus a three-entry dictionary; this holds two
integers and nothing else.`,
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
  mistake: `- **The bug:** \`while i <= j\`. At \`i == j\` an element is added to itself — a \`6\` with
  \`target = 12\` returns \`[2, 2]\`, one element used twice. The condition is the strict \`i < j\`.
- **Its cousin:** moving the wrong pointer. \`if s < target: j -= 1\` turns the sum down when it
  needed to go up; the pointers cross without visiting the answer, and the function returns empty on
  an input that plainly has one.`,
  cost: `**Time O(n), space O(1).** Each iteration moves one pointer inward and no pointer ever moves back,
so the starting gap of n − 1 bounds the loop. Two indices and a sum.

Reach for it when the input is sorted — or cheap to sort, and the answer does not need the original
positions — and the quantity you compare moves one way as either end moves. Strictly better than the
map here on space and no worse on time, and it is the move three-sum, k-sum and
container-with-most-water are built on.`,
  notes: [
    {
      title: "the exchange argument — why skipping is safe",
      body: `The part an interviewer pushes on. **The claim:** when \`nums[i] + nums[j] < target\`, no pair that
uses index \`i\` can be the answer, so retiring \`i\` loses nothing.

The proof is one line. The pairs still open that use \`i\` are \`(i, k)\` for \`k\` in \`i+1 .. j\`, and
sorted means \`nums[k] <= nums[j]\` for every one of them, so

\`\`\`
nums[i] + nums[k]  <=  nums[i] + nums[j]  <  target
\`\`\`

- Every such pair is strictly below the target. Index \`i\` is in no remaining answer.
- The big side mirrors it: \`nums[i] + nums[j] > target\` and \`nums[k] >= nums[i]\` for \`k\` in
  \`i .. j−1\` retires \`j\`.
- **Two preconditions, and they are the test for any new two-pointer problem:** the array is
  sorted, and the compared quantity moves one way as each pointer moves. Drop sortedness and the
  inequality vanishes — back to the map.
- Termination and completeness come free: one index retired per step, each only after it is proven
  useless, so if a pair exists the pointers land on it.`,
    },
  ],
}
