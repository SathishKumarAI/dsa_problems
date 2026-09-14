// three-sum-closest — approach 4 — Two pointers converging (the instinctive linear inner scan)
//
// Converted from docs/deep/three-sum-closest_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "two-pointers",
  title: "Two pointers converging (the instinctive linear inner scan)",
  idea: `*The binary search rediscovers the shape of the tail for every pair — can the previous search's
knowledge be carried forward instead?* Yes. Fix only the **first** value, then put one pointer just
after it and one at the far end. Read the pair sum: if the triple undershoots, the only way up is to
move the low pointer right; if it overshoots, the high pointer must come in. Either way one index
retires permanently, so the whole inner scan is linear. This fixes the binary search's weakness:
**\`log n\` work per pair, repeated from scratch \`n²/2\` times.**`,
  intuition: `> **Intuition.** Two hands on a sorted ruler, one at each end of the stretch you are allowed to use.
> The sum of what they point at, plus the fixed anchor, is your reading. Too low? The only way to
> raise it is to bring the left hand inward, since everything to its left is smaller still. Too high?
> Bring the right hand in. Each move retires one position forever, so the two hands meet after at most
> \`n\` moves — and you never had to decide *how far* to move, only which hand.

> **Why it works.** The move rule needs an argument, and it is an exchange argument. Suppose the
> current sum \`s\` is **below** the target, with pointers at \`lo\` and \`hi\`. Consider every triple still
> available that uses \`hi\`: they are \`nums[i] + nums[k] + nums[hi]\` for \`lo <= k < hi\`. Since the array
> is sorted, \`nums[k] >= nums[lo]\` is false for none of them below \`lo\`… precisely, every remaining
> \`k\` is \`>= lo\`, so every such sum is \`>= s\`. But we are *already* going to evaluate the best of
> those as \`lo\` advances — the only pairing with \`hi\` that we would lose by moving \`hi\` instead is the
> one with the *smallest* remaining low value, namely \`lo\` itself, and that is exactly the sum we just
> measured and fed to \`better\`. So advancing \`lo\` discards nothing unmeasured: every triple containing
> \`nums[lo]\` and a partner at or below \`hi\` has a sum no greater than \`s\`, and \`s\` is already the
> closest of them from below because the array is sorted. The mirror argument covers \`s > target\`.
> **This is why there is no exact-hit branch:** when \`s == target\` the distance is \`0\`, nothing can be
> closer, and the only correct action is to stop — which is what the next rung does.`,
  worked: `Sorted: \`[-4, -1, 1, 2]\`, \`target = 1\`. \`best\` seeded at \`-4\`.

| \`i\` (\`nums[i]\`) | \`lo\` (\`nums[lo]\`) | \`hi\` (\`nums[hi]\`) | \`s\` | \`\\|s − 1\\|\` | \`best\` before → after | \`s\` vs target | move |
|---|---|---|---|---|---|---|---|
| 0 (−4) | 1 (−1) | 3 (2) | −3 | 4 | −4 → **−3** | below | \`lo++\` |
| 0 (−4) | 2 (1) | 3 (2) | −1 | 2 | −3 → **−1** | below | \`lo++\` |
| — | 3 | 3 | — | — | — | pointers met | anchor −4 retired |
| 1 (−1) | 2 (1) | 3 (2) | 2 | 1 | −1 → **2** | at/above | \`hi--\` |
| — | 2 | 2 | — | — | — | pointers met | anchor −1 retired |

Result **2**. ✅ Three sums evaluated instead of the brute force's four — and on a 500-element array,
about 125 000 instead of 20 708 500.

Compare the brute-force table: the same winning triple \`(-1, 1, 2)\` is found, but only three
candidates were ever formed, and no pair was examined twice.`,
  code: `def three_sum_closest_two_pointers(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        lo, hi = i + 1, n - 1
        while lo < hi:                       # STRICT: lo == hi would use one position twice
            s = nums[i] + nums[lo] + nums[hi]
            best = better(s, best, target)
            if s < target:                   # the sign of the miss says which end to move
                lo += 1
            else:
                hi -= 1
    return best`,
  mistake: `> **Watch out.** Writing \`while lo <= hi\`. The misconception is that the loop should keep going until
> the pointers cross — which is right for a search over a *range*, and wrong here, because \`lo == hi\`
> means both pointers sit on the **same position** and the "triple" uses that entry twice. The problem
> requires three distinct positions.

Measured on the worked example it returns \`1\` instead of \`2\`: at \`i = 1\`, \`lo\` and \`hi\` both land on
index 2, forming \`-1 + 1 + 1 = 1\`, which is an exact hit on the target — and an illegal one, since
\`nums[2]\` was counted twice. On \`nums = [-2,0,1,3]\`, \`target = 0\` it returns \`0\` instead of \`-1\`.
Illegal triples are seductive precisely because they often look *better* than the real answer.

The other classic — and the reason this rung sits where it does in the ladder — is **forgetting to
sort**. The move rule is meaningless on unsorted data: "the sum is too low, so move \`lo\` right" is only
true if everything to the right is larger. Measured on \`nums = [4,-9,5,-1,-2]\`, \`target = 9\`, dropping
the sort returns \`7\` where the answer is \`8\`. It gets away with it on small inputs often enough to
pass a casual test, which is what makes it dangerous.`,
  cost: `**Time \`O(n²)\`** — \`O(n log n)\` to sort, then \`n\` anchors each running a linear inner scan, because
every iteration retires exactly one index. **Space \`O(1)\`** beyond the sorted copy: three indices and
\`best\`.

This is the answer to ship when the input might not contain an exact hit, and it is the version whose
argument you must be able to give. The next rung adds one line to it.

---`,
}
