// next-permutation — approach 1 — List every arrangement in order
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
  rung: "list-every-arrangement-in-order",
  title: "List every arrangement in order",
  idea: `*How do I find the next entry in a sorted list of arrangements?* Build the list. Generate all n!
orderings of the values, throw away the repeats, sort what is left, find where the input sits, and
take the entry after it — wrapping to the front when the input was last.`,
  intuition: `> **Intuition.** This is the definition of the problem typed out as code, and there is real value in that: it can be
> wrong only in ways that are obvious. The one piece of machinery worth understanding is how to produce
> the k-th ordering without recursion. Count \`k\` in the **factorial number system** — instead of digit
> places worth 1, 10, 100, the places are worth 1, 1, 2, 6, 24, …, that is 0!, 1!, 2!, 3!, 4!. Each
> digit then says "take the item at this position out of what is left of the sorted pool". Running \`k\`
> from 0 to n! − 1 walks every ordering exactly once, and because the pool starts sorted, it walks them
> in increasing order too.`,
  worked: `\`nums = [1, 3, 5, 4, 2]\`. The sorted pool is \`[1, 2, 3, 4, 5]\`, so there are 5! = 120 orderings, all
distinct because the values are. Sorted, the list looks like this around the input:

| position in the list | arrangement |
|---|---|
| 9 | \`[1, 3, 4, 5, 2]\` |
| 10 | \`[1, 3, 5, 2, 4]\` |
| **11** | **\`[1, 3, 5, 4, 2]\`  ← the input** |
| 12 | \`[1, 4, 2, 3, 5]\`  ← **the answer** |
| 13 | \`[1, 4, 2, 5, 3]\` |

Look hard at rows 11 and 12, because everything else in this document is an attempt to get from one
to the other without building the other 118. The \`1\` at the front is untouched. The \`3\` at index 1
became a \`4\` — the smallest value in \`[5, 4, 2]\` that is bigger than 3. And what was left over,
\`{3, 5, 2}\`, came back as \`2, 3, 5\`: as small as it can possibly be arranged.`,
  code: `def next_permutation_enumerate_all(nums: list[int]) -> list[int]:
    n = len(nums)
    base = sorted(nums)
    total = 1
    for i in range(2, n + 1):
        total *= i
    seen = set()  # a set, not a list: two identical arrangements are ONE arrangement
    for k in range(total):
        # k counted in the factorial number system picks one ordering
        pool = list(base)
        perm = []
        rest = k
        for left in range(n, 0, -1):
            f = 1
            for i in range(2, left):
                f *= i  # f is (left - 1)!, the place value of this digit
            perm.append(pool.pop(rest // f))
            rest %= f
        seen.add(tuple(perm))
    ordered = sorted(seen)
    at = ordered.index(tuple(nums))
    return list(ordered[(at + 1) % len(ordered)])  # % wraps the last arrangement to the first`,
  mistake: `> **Watch out.** Collecting the arrangements in a list instead of a set. With distinct values you will never notice —
> all n! orderings are different and the code is correct. Feed it \`[1, 1, 5]\` and it breaks: the two
> 1s can swap without changing what the arrangement *reads* as, so \`(1, 1, 5)\` appears twice in the
> sorted list, \`index\` finds the first copy, and "the next entry" is the second copy. The function
> returns **\`[1, 1, 5]\`** — the input, unchanged — where the correct answer is **\`[1, 5, 1]\`**. The
> underlying confusion is between an *ordering of positions* and an *arrangement of values*; the
> problem asks about the second, and de-duplication is what converts one into the other.`,
  cost: `**Time \`O(n! · n log(n!))\`, space \`O(n! · n)\`.** The time is n! orderings, each costing \`O(n)\` to decode,
and then a sort of n! items whose comparisons each cost \`O(n)\`. The space is the collection of all of
them. Neither number is measured below — the stress tests cap this rung at seven values, where 5040
arrangements is instant, and the factorial growth is stated rather than demonstrated.

Use it only as the oracle: it is the definition, so if a clever method disagrees with it on a small
input, the clever method is wrong. That is exactly its job in the test suite at the bottom of this
document. The factorial-number-system decode is also genuinely reusable — "give me the k-th
arrangement directly" is a real requirement in ranking and unranking problems — but for *this*
problem the enumeration is the thing to beat, not the thing to keep.

---`,
}
