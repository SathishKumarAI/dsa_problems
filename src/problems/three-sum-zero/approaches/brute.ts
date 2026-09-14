// three-sum-zero — approach 1 — Brute force
//
// Converted from docs/deep/three-sum-zero_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "brute",
  title: "Brute force",
  idea: `*How do I find every triple summing to zero?* Look at every triple. *How do I avoid reporting the
same one twice?* Sort each hit's three values into a canonical order and drop it into a set, which
collapses the duplicates for you. This is the baseline: correct by construction, using nothing
about the input at all.`,
  intuition: `Three nested loops with the indices kept in strictly increasing order — \`i < j < k\` — so each
group of three positions is visited exactly once rather than six times in different orders. Picture
an odometer with three wheels that can never show a repeat or go backwards. The set at the end is
doing a separate job from the loops: the loops guarantee no *index* group repeats, the set
guarantees no *value* triple repeats, and those are different things precisely because the list may
contain duplicate values. The shape to notice is that the work is pure enumeration — nothing found
at one triple informs the next.`,
  worked: `Input: \`nums = [-1, 0, 1, 2, -1, -4]\` (positions 0–5 hold −1, 0, 1, 2, −1, −4).

There are C(6,3) = 20 index triples. Three of them sum to zero:

| Indices | Values | Sum | Canonical form added to the set |
|---|---|---|---|
| (0, 1, 2) | −1, 0, 1 | 0 | \`(-1, 0, 1)\` — new |
| (0, 3, 4) | −1, 2, −1 | 0 | \`(-1, -1, 2)\` — new |
| (1, 2, 4) | 0, 1, −1 | 0 | \`(-1, 0, 1)\` — **already present, absorbed** |

The other 17 miss: \`(0,1,3)\` gives 1, \`(0,1,4)\` gives −2, \`(3,4,5)\` gives −3, and so on. Final set:
\`{(-1, -1, 2), (-1, 0, 1)}\` — two triples from three hits, which is exactly the duplicate problem
in miniature. Positions 0 and 4 both hold −1, so the same *value* triple is reachable by two
different *index* triples.`,
  code: `def three_sum_zero_brute_force(nums: list[int]) -> list[list[int]]:
    found: set[tuple[int, int, int]] = set()
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == 0:
                    found.add(tuple(sorted((nums[i], nums[j], nums[k]))))  # canonical order
    return [list(t) for t in found]`,
  mistake: `Adding \`(nums[i], nums[j], nums[k])\` to the set *without* sorting the three values first. The set
then stores \`(0, 1, -1)\` and \`(-1, 0, 1)\` as two different entries, because tuples compare
position by position, and the output contains the same triple twice under two spellings. The
sorting inside \`tuple(sorted(...))\` is not cosmetic — it is the entire deduplication mechanism.
The second version of this bug is starting the inner loops at 0 instead of \`i + 1\` / \`j + 1\`,
which lets one position be used two or three times and happily reports \`[0, 0, 0]\` for a list
containing a single zero.`,
  cost: `**Time O(n³), space O(n) for the deduplicating set** (there can be O(n²) distinct triples in the
worst case, but for typical inputs the set holds the answer, which is small). The time is pure
enumeration: three nested walks, each up to n long, and nothing is remembered between them.

Use it exactly twice in your life: on inputs of a dozen elements, and as the oracle you validate a
fast implementation against — which is what it does in the stress test at the bottom of this file.
Its real value is that its correctness is obvious, which makes disagreements with it informative.

---`,
}
