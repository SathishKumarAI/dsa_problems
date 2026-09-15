// next-permutation — approach 3 — Find the pivot, then sort the tail
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
  rung: "find-the-pivot-then-sort-the-tail",
  title: "Find the pivot, then sort the tail",
  idea: `*The candidate table shows only one index ever changes first — can I find it directly?* Yes, and in
one scan. Walk in from the right while each value is greater than or equal to the one after it; the
first place that fails is the **pivot**. Everything to its right is non-increasing, which is the
statement that the tail is already its own largest arrangement and nothing there can grow. Sort the
tail ascending, then swap the pivot with the first tail value that exceeds it.

This fixes the candidate search's weakness — **it tests n²/2 candidates when only one position can
ever change first, and that position is findable in a single walk.**`,
  intuition: `> **Intuition.** Read the array from the right and ask "is this stretch still climbing?" As long as each value is at
> least as big as the one after it, the stretch is descending, and a descending run is the largest you
> can arrange those particular values — there is no way to push it higher, so no successor lives in
> there. The moment you find a value *smaller* than its successor, you have found the rightmost place
> where something can grow, and that is where the change must happen: any change further left would be
> a bigger jump than necessary. Then two smaller questions remain — what does the pivot become, and
> what happens to the tail — and this rung answers the second one with a sort, which is more force than
> it needs.`,
  worked: `\`nums = [1, 3, 5, 4, 2]\`.

**Finding the pivot**, scanning in from the right:

| compare | verdict |
|---|---|
| index 3 vs 4: is \`4 >= 2\`? | yes — still descending, keep going |
| index 2 vs 3: is \`5 >= 4\`? | yes — still descending, keep going |
| index 1 vs 2: is \`3 >= 5\`? | **no** — index 1 is the pivot |

So \`pivot = 1\`, holding the value 3, and the tail is \`[5, 4, 2]\` at indices 2…4.

**Sort the tail ascending:** the array becomes \`[1, 3, 2, 4, 5]\`, tail \`[2, 4, 5]\`.

**Find the pivot's replacement** by walking the now-ascending tail from its left end:

| \`at\` | value | \`<= 3\`? | action |
|---|---|---|---|
| 2 | 2 | yes | too small, keep walking |
| 3 | 4 | no | stop — 4 is the smallest tail value that still beats 3 |

**Swap indices 1 and 3:** \`[1, 4, 2, 3, 5]\`. The tail is still ascending, because the 3 that came out
of the pivot landed exactly where the 4 had been — and 4 was the *smallest* value above 3, so 3 slots
into that position in sorted order without disturbing anything. Answer: \`[1, 4, 2, 3, 5]\`.`,
  code: `def find_pivot(nums: list[int]) -> int:
    """The rightmost index whose value is below its successor, or -1 when the array is
    non-increasing and therefore the last arrangement. Everything after the pivot is
    already maximal, which is why the pivot is the only position that can change.

    >= keeps the scan going past equal neighbours, which is what makes duplicates work.
    """
    pivot = len(nums) - 2
    while pivot >= 0 and nums[pivot] >= nums[pivot + 1]:
        pivot -= 1
    return pivot


def next_permutation_pivot_sort_tail(nums: list[int]) -> list[int]:
    n = len(nums)
    pivot = find_pivot(nums)
    if pivot < 0:
        nums.sort()  # no successor: wrap to the smallest arrangement
        return nums
    nums[pivot + 1:] = sorted(nums[pivot + 1:])
    at = pivot + 1
    while nums[at] <= nums[pivot]:
        at += 1
    # the tail stays ascending: the pivot's value slots exactly where the
    # value it displaced was smallest-but-still-larger
    nums[pivot], nums[at] = nums[at], nums[pivot]
    return nums`,
  mistake: `> **Watch out.** Searching the sorted tail with \`while nums[at] < nums[pivot]\` instead of \`<=\`. It reads as the same
> thing — you want the first value bigger than the pivot — but \`<\` stops on a value *equal* to the
> pivot, and swapping two equal values changes nothing about the front while wrecking the tail. On
> \`[1, 5, 1]\` the buggy version returns **\`[1, 1, 5]\`**, which is *smaller* than the input; the correct
> answer is **\`[5, 1, 1]\`**. The bug is invisible on every input with distinct values, which is every
> example in most problem statements, so it survives all the way to a hidden test. Strictly greater is
> the requirement — the successor has to actually increase — so the skip condition has to be
> "less than **or equal**".`,
  cost: `**Time \`O(n log n)\`, space \`O(n)\`.** The pivot scan is \`O(n)\` and the swap is \`O(1)\`; the entire cost is the
sort of the tail, which in the worst case is the whole array. The space is whatever the sort needs —
Python's \`sorted\` on a slice builds a new list, so \`O(n)\`, and even an in-place sort is \`O(log n)\` of
stack. That is the tell that a rung remains: the problem asked for constant extra room and this does
not deliver it.

Use it when clarity beats the last factor of log n and you are not being graded on the memory bound —
it is the version most people can write correctly under pressure, because "sort the tail" needs no
argument about why the tail happens to already be in a convenient order. Then say out loud that the
sort is unnecessary, and why, and write the next rung.

---`,
}
