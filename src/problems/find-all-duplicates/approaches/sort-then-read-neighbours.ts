// find-all-duplicates — approach 2 — Sort, then read neighbours.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "sort-then-read-neighbours",
  title: "Sort, then read neighbours",
  idea: `*The pair scan re-reads the whole tail for every element. What if the two copies of a value were
always next to each other, so a single pass could find them?* Sort the array. Sorting guarantees
that equal values become adjacent, so the question "does this repeat?" shrinks from "check n−i
other elements" to "check the one element immediately before me". This fixes the pair scan's exact
weakness: the restarted inner walk.`,
  intuition: `Sorting is herding — it drives every copy of a value into one clump. After that, duplicates are not
scattered across the array, they are touching. So you walk the sorted array once with a single
backward glance at each step: *is the number I am standing on the same as the one I just left?* Every
clump of two announces itself. You never look further back than one step, because sorting has
already promised that if a match exists anywhere, it is right there.`,
  worked: `Input: \`nums = [4, 3, 2, 7, 8, 2, 3, 1]\`. Sorted, that becomes \`[1, 2, 2, 3, 3, 4, 7, 8]\`.

| i | \`ordered[i - 1]\` | \`ordered[i]\` | Equal? |
|---|---|---|---|
| 1 | 1 | 2 | no |
| 2 | 2 | 2 | **yes** → collect \`2\` |
| 3 | 2 | 3 | no |
| 4 | 3 | 3 | **yes** → collect \`3\` |
| 5 | 3 | 4 | no |
| 6 | 4 | 7 | no |
| 7 | 7 | 8 | no |

Seven comparisons instead of 28, plus the cost of the sort. Answer: \`[2, 3]\`, already ascending for
free.`,
  code: `def find_all_duplicates_sort_then_neighbours(nums: list[int]) -> list[int]:
    ordered = sorted(nums)  # a COPY — sorting in place would rearrange the caller's array
    out: list[int] = []
    for i in range(1, len(ordered)):
        if ordered[i] == ordered[i - 1]:
            out.append(ordered[i])
    return out`,
  mistake: `Starting the loop at \`i = 0\` and reading \`ordered[i - 1]\`. In Python that is not an error — index
\`-1\` is the *last* element — so on the input \`[1]\` the code compares \`ordered[0]\` against
\`ordered[-1]\`, which is the same element, and reports \`1\` as a duplicate. The smallest legal input
is exactly where this shows up, and it is silent: no exception, just a wrong answer. Start at
\`i = 1\`.

The second mistake is using \`nums.sort()\` instead of \`sorted(nums)\`. That sorts the caller's array
in place and hands back a permuted array they did not ask for — see the mutation discussion under
Approach 5, which applies here too.`,
  cost: `**Time O(n log n), space O(n).** The time is dominated by the sort; the single pass afterwards is
linear and free by comparison. The space is the sorted copy. (If you are allowed to sort in place,
the space drops toward O(1) in C++ and to O(log n) of stack in most library sorts — but you have
then destroyed the input, which is the same cost Approach 5 pays, without Approach 5's speed.)

This is the right choice when the values are *not* bounded by n. Sorting needs no promise about the
range, which is what makes it the general answer to "find duplicates in anything comparable". It is
also what you reach for when you want the answer ascending anyway and the n log n is beneath notice.

---`,
}
