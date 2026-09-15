// three-sum-zero — approach 3 — Sort, then converging pointers (optimal)
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
  rung: "twoptr",
  title: "Sort, then converging pointers (optimal)",
  idea: `*The hash rung sorts the array anyway and then ignores the ordering when searching the suffix —
why pay O(n) memory to look up values whose magnitudes their positions already reveal?* Use the
sorted suffix directly: one pointer just after the anchor, one at the far end, converging. This
fixes the hash rung's two weaknesses at once — the per-anchor set, and the \`not in out\` scan —
because sortedness makes both the search and the deduplication into pointer moves.`,
  intuition: `Three fingers. One picks the smallest member of the triple and holds still; the other two walk
toward each other through the sorted tail, tuning the sum like a dial — sum too low, raise the
floor by stepping the left finger right; sum too high, lower the ceiling by stepping the right
finger left. When they meet, this anchor is exhausted and the anchor finger advances. Deduplication
becomes three skip rules on the same principle: never start an anchor on a value equal to the
previous anchor, and after recording a hit, walk both inner fingers past any repeats of the values
you just used. One more freebie falls out of sortedness: once the anchor's own value is positive,
every remaining element is positive too, three positives cannot sum to zero, and the whole loop can
stop.

> **Under the hood.** \`sorted()\` is Timsort, and it is worth knowing what that means here rather
> than filing it as "\`O(n log n)\`". Timsort looks for runs that are already ordered and merges them,
> so on input that is partly sorted it does far less than the bound suggests — on already-sorted
> input it is a single \`O(n)\` scan. It also allocates: \`sorted()\` returns a new list, which is the
> \`O(n)\` space this rung spends and the reason it does not disturb the caller's array.
>
> The practical point is the ordering of costs. The sort *looks* like the expensive step and it is
> the cheap one: \`O(n log n)\` against the \`O(n²)\` search that follows, so at any size where this
> problem is interesting the sort is a rounding error. Optimising it is the classic wrong instinct —
> the step to attack is the one whose exponent is larger, and it is never the one that has a
> library call attached to it.`,
  worked: `Input: \`nums = [-1, 0, 1, 2, -1, -4]\`, sorted to \`[-4, -1, -1, 0, 1, 2]\`.

| k (anchor) | i (value) | j (value) | Sum | Action |
|---|---|---|---|---|
| 0 (−4) | 1 (−1) | 5 (2) | −3 | too low → \`i → 2\` |
| 0 (−4) | 2 (−1) | 5 (2) | −3 | too low → \`i → 3\` |
| 0 (−4) | 3 (0) | 5 (2) | −2 | too low → \`i → 4\` |
| 0 (−4) | 4 (1) | 5 (2) | −1 | too low → \`i → 5\`, pointers meet, anchor done |
| 1 (−1) | 2 (−1) | 5 (2) | **0** | **emit \`[-1, -1, 2]\`**; \`i → 3\`, \`j → 4\`; \`nums[3]=0 ≠ nums[2]=-1\` and \`nums[4]=1 ≠ nums[5]=2\`, so no skipping needed |
| 1 (−1) | 3 (0) | 4 (1) | **0** | **emit \`[-1, 0, 1]\`**; \`i → 4\`, \`j → 3\`, pointers cross, anchor done |
| 2 (−1) | — | — | — | skipped: equal to the previous anchor |
| 3 (0) | 4 (1) | 5 (2) | 3 | too high → \`j → 4\`, pointers meet, anchor done |

Output \`[[-1, -1, 2], [-1, 0, 1]]\`. Four sum checks for the first anchor, two for the second, one
for the last: seven in total, against the brute force's twenty.`,
  code: `def three_sum_zero_two_pointers(nums: list[int]) -> list[list[int]]:
    nums = sorted(nums)  # a copy; nums.sort() would mutate the caller's list
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if nums[k] > 0:
            break  # smallest of the triple is positive, so the sum cannot be zero
        if k > 0 and nums[k] == nums[k - 1]:
            continue  # this anchor value is already fully explored
        i, j = k + 1, len(nums) - 1
        while i < j:
            s = nums[k] + nums[i] + nums[j]
            if s < 0:
                i += 1
            elif s > 0:
                j -= 1
            else:
                out.append([nums[k], nums[i], nums[j]])
                i += 1
                j -= 1
                while i < j and nums[i] == nums[i - 1]:
                    i += 1  # past repeats of the left value just used
                while i < j and nums[j] == nums[j + 1]:
                    j -= 1  # past repeats of the right value just used
    return out`,
  mistake: `**Skipping duplicate anchors is the one everybody forgets**, and it fails loudly: on
\`[-1, 0, 1, 2, -1, -4]\`, without \`if k > 0 and nums[k] == nums[k - 1]: continue\`, the anchor at
index 2 (the second −1) runs its own pointer walk over \`[0, 1, 2]\`, finds \`0 + 1 = 1\`, and emits
\`[-1, 0, 1]\` for a second time. The output is not wrong in its contents, it is wrong in its
*multiplicity*, and that is a failed submission. The mirror bug is subtler and just as common:
after recording a hit, advancing only one pointer. If you write \`i += 1\` without \`j -= 1\`, then on
an input like \`[-2, 0, 0, 2, 2]\` the same triple re-emits as the untouched pointer keeps finding an
equal neighbour — both pointers must move past the values they just consumed, and *then* skip
repeats. Third in the family: writing the skip as \`while nums[i] == nums[i - 1]\` without the
\`i < j\` guard, which runs off the end of the array.`,
  cost: `**Time O(n²), space O(1) beyond the output** (O(n) if you count the sort's own scratch space or
insist on not mutating the input). The sort costs O(n log n), which is dominated. The quadratic
comes from the anchor loop running n times, each doing a converging walk whose two pointers between
them cover at most n positions — n × n, with a much smaller constant than the hash version because
the inner step is an add and a compare, no hashing.

This is the answer to ship: same asymptotic time as the hash rung, constant extra space, and the
deduplication falls out of the sort instead of needing a side structure. It is also the template
for the whole family — three-sum-closest is the same walk with a different scoring rule, four-sum
is this with one more anchor loop outside it, and k-sum is this recursion carried all the way down.`,
  notes: [
    { title: "the exchange argument — why skipping is safe", body: `Two separate skips happen here and an interviewer will probe both. They need different arguments.

**1. Why moving one pointer never skips a triple.** With the anchor \`nums[k]\` fixed, the inner
problem is exactly "find pairs in the sorted range \`k+1 .. n-1\` summing to \`T = -nums[k]\`". Suppose
\`nums[i] + nums[j] < T\`. The pairs still in play that use index \`i\` are \`(i, m)\` for \`m\` in
\`i+1 .. j\`. Sortedness gives \`nums[m] <= nums[j]\`, so

\`\`\`
nums[i] + nums[m]  <=  nums[i] + nums[j]  <  T
\`\`\`

Every one of them falls short. Index \`i\` cannot be in any remaining answer, so advancing \`i\`
discards only losers. Symmetrically, if \`nums[i] + nums[j] > T\`, then for every \`m\` in \`i .. j-1\`
we have \`nums[m] >= nums[i]\`, so \`nums[m] + nums[j] >= nums[i] + nums[j] > T\`, and index \`j\` is
dead. Each iteration retires exactly one index and no index is retired before being proven
useless, so the walk is both linear and complete.

**2. Why skipping a duplicate anchor never loses a triple.** Suppose \`nums[k] == nums[k-1]\` and we
skip \`k\`. Any triple the skipped anchor could have produced has the form \`(nums[k], a, b)\` with \`a\`
and \`b\` drawn from the range \`k+1 .. n-1\`. But the previous anchor searched the range
\`k .. n-1\`, which *contains* that range, and it had the identical anchor value. So it already
considered the pair \`(a, b)\` and — since the target \`-nums[k-1]\` equals \`-nums[k]\` — already
emitted that exact value triple. Nothing is lost. The inner skips after a hit are the same argument
one level down: having just emitted \`(nums[k], v_i, v_j)\`, any other pair with those same two
values would produce an identical value triple, and the statement asks for distinct values.

**3. Why the \`nums[k] > 0\` break is safe.** The array is sorted, so if the anchor is positive every
element after it is positive too, and the anchor is the smallest member of any triple it can form.
Three positive numbers sum to something positive, never zero. Every remaining anchor is in the same
position, so the loop can stop entirely rather than merely skipping one.

All three arguments rest on the same foundation: **sortedness turns a position into a statement
about magnitude**, and every skip above is a magnitude argument in disguise.

---` },
  ],
}
