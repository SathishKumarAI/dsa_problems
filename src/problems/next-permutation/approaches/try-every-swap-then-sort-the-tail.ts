// next-permutation — approach 2 — Try every swap, then sort the tail
//
// Converted from docs/deep/next-permutation_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "try-every-swap-then-sort-the-tail",
  title: "Try every swap, then sort the tail",
  idea: `*Do I need all n! arrangements, or only the ones that could plausibly be the answer?* Only a few.
The successor is always reachable by swapping one pair of positions and then making everything after
the left one as small as possible. So build that candidate for each of the n²/2 pairs, discard the
ones that do not beat the input, and keep the smallest of what remains.

This fixes the enumeration's fatal weakness — **it builds every arrangement when all but a handful
were never candidates.**`,
  intuition: `> **Intuition.** Think of the arrangement as a number and ask what "the next one up" means for a number: you want to
> change it as far to the *right* as you can, and by as little as you can. That intuition says two
> things. First, whatever changes, the change is a value moving into an earlier slot — a swap. Second,
> once you have made that one change, everything to the right of it should be as small as possible,
> because those digits are free to be anything and small is what keeps the total small. So: pick a
> swap, sort the tail, and see what you get. Trying all n²/2 swaps is brute force *over the right
> candidate set* rather than over the whole universe.`,
  worked: `\`nums = [1, 3, 5, 4, 2]\`. Every pair \`(i, j)\`, swapped and with everything after \`i\` sorted:

| \`i\` | \`j\` | candidate | beats the input? | running best |
|---|---|---|---|---|
| 0 | 1 | \`[3, 1, 2, 4, 5]\` | yes | \`[3, 1, 2, 4, 5]\` |
| 0 | 2 | \`[5, 1, 2, 3, 4]\` | yes | unchanged (bigger) |
| 0 | 3 | \`[4, 1, 2, 3, 5]\` | yes | unchanged (bigger) |
| 0 | 4 | \`[2, 1, 3, 4, 5]\` | yes | \`[2, 1, 3, 4, 5]\` |
| 1 | 2 | \`[1, 5, 2, 3, 4]\` | yes | \`[1, 5, 2, 3, 4]\` |
| 1 | 3 | \`[1, 4, 2, 3, 5]\` | yes | **\`[1, 4, 2, 3, 5]\`** |
| 1 | 4 | \`[1, 2, 3, 4, 5]\` | no — smaller than the input | unchanged |
| 2 | 3 | \`[1, 3, 4, 2, 5]\` | no | unchanged |
| 2 | 4 | \`[1, 3, 2, 4, 5]\` | no | unchanged |
| 3 | 4 | \`[1, 3, 5, 2, 4]\` | no | unchanged |

Ten candidates, six of which beat the input, and the smallest of those six is \`[1, 4, 2, 3, 5]\`.
Now read the table for the pattern that the next rung exploits: **every candidate that changed
something at index 2 or later failed.** Swapping inside \`[5, 4, 2]\` can only make that tail smaller,
never bigger, because the tail is already descending — already the largest arrangement of those three
values. That is observation one of four, and it fell out of the data.`,
  code: `def next_permutation_every_swap(nums: list[int]) -> list[int]:
    n = len(nums)
    best = None
    for i in range(n):
        for j in range(i + 1, n):
            cand = list(nums)
            cand[i], cand[j] = cand[j], cand[i]
            cand[i + 1:] = sorted(cand[i + 1:])  # everything after the change goes as small as it can
            if cand > nums and (best is None or cand < best):
                best = cand
    # nothing beat the input, so it was the last arrangement
    return best if best is not None else sorted(nums)`,
  mistake: `> **Watch out.** Swapping but not sorting the tail — keeping the candidate as the raw swap. You still get an
> arrangement that is larger than the input, so the code runs and returns something plausible, but it
> is not the *smallest* larger one. On the worked example it returns **\`[1, 4, 5, 3, 2]\`** instead of
> **\`[1, 4, 2, 3, 5]\`**: correct in its first two slots and wrong in the last three, which is the most
> annoying kind of wrong because the answer looks nearly right. The missing idea is that the successor
> must be minimal *twice over* — minimal in which position changes, and then minimal in everything
> after it. Half the algorithm satisfies the first requirement; the tail is the second.`,
  cost: `**Time \`O(n³ log n)\`, space \`O(n)\`.** There are \`O(n²)\` pairs; each one copies the array (\`O(n)\`) and sorts
the tail (\`O(n log n)\`), so the sort dominates and the total is n² × n log n. The space is the single
candidate plus the running best. At n = 100 that is around ten million operations — genuinely fast
enough for this problem's constraints, which is precisely why it is worth building: it is a correct,
runnable cross-check against the linear version on inputs far too large for the enumeration.

Use it when you need an oracle at a size the factorial rung cannot reach, or when the "one step of
change" rule is itself unclear — a search over a small candidate set is the standard way to *discover*
a greedy rule before you can prove one. The table above is a worked example of exactly that: the rule
for the next rung is visible in its results.

---`,
}
