// three-sum-zero — approach 2 — Hash per anchor
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
  rung: "hash",
  title: "Hash per anchor",
  idea: `*The brute force's inner two loops ask "do two values in the tail sum to \`-nums[k]\`?" by trying all
pairs — can that be one pass instead?* Yes: fix the first element as an **anchor**, and the
remaining question is exactly the two-sum problem on the suffix, which a hash set answers in a
single walk. This fixes the brute force's exact weakness — the innermost O(n) scan per pair — and
drops the cube to a square.`,
  intuition: `Peel the problem: once you commit to one element of the triple, the other two must sum to its
negation, and that is a problem you already know how to solve. So the outer loop is "choose the
anchor", and inside it you run the guest-list trick — walk the suffix, and for each value ask the
set whether its partner has already gone past. Three-sum is two-sum with a loop wrapped around it,
and every k-sum after this is the same peel applied one more time. The awkward part is not the
search, it is the bookkeeping: the set tells you *a* pair exists, not whether you have already
emitted that exact triple, so deduplication needs its own handling.`,
  worked: `Input: \`nums = [-1, 0, 1, 2, -1, -4]\`, sorted first to \`[-4, -1, -1, 0, 1, 2]\`.

| Anchor k | \`nums[k]\` | Needs pair summing to | Walk of the suffix | Result |
|---|---|---|---|---|
| 0 | −4 | 4 | x=−1 (need 5, set \`{}\`) miss → set \`{-1}\`; x=−1 (need 5) miss; x=0 (need 4) miss → set \`{-1, 0}\`; x=1 (need 3) miss; x=2 (need 2) miss | nothing — the largest available pair is 1 + 2 = 3 |
| 1 | −1 | 1 | x=−1 (need 2, set \`{}\`) miss → \`{-1}\`; x=0 (need 1) miss → \`{-1, 0}\`; x=1 (need **0**, present) **hit** → emit \`[-1, 0, 1]\`, set \`{-1, 0, 1}\`; x=2 (need **−1**, present) **hit** → emit \`[-1, -1, 2]\` | two triples |
| 2 | −1 | — | skipped: \`nums[2] == nums[1]\` | — |
| 3 | 0 | 0 | x=1 (need −1, set \`{}\`) miss → \`{1}\`; x=2 (need −2) miss | nothing |

Output \`[[-1, 0, 1], [-1, -1, 2]]\`. Note the anchor skip at k = 2 doing real work: without it,
anchor −1 would run again over the shorter suffix \`[0, 1, 2]\`, find \`0 + 1\` again, and emit
\`[-1, 0, 1]\` a second time.`,
  code: `def three_sum_zero_hash_per_anchor(nums: list[int]) -> list[list[int]]:
    nums = sorted(nums)  # sorted only so equal anchors are adjacent and skippable
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if k > 0 and nums[k] == nums[k - 1]:
            continue  # this anchor value already produced all of its triples
        seen: set[int] = set()
        target = -nums[k]
        for x in nums[k + 1:]:
            if target - x in seen:
                triple = [nums[k], target - x, x]
                if triple not in out:  # duplicates inside one anchor still need catching
                    out.append(triple)
            seen.add(x)
    return out`,
  mistake: `Dropping the anchor-skip line — \`if k > 0 and nums[k] == nums[k - 1]: continue\` — because the
inner \`if triple not in out\` check looks like it already handles duplicates. On \`[-1, 0, 1, 2, -1, -4]\`
it does, but only by paying an O(len(out)) scan on every hit, and on inputs with many repeated
anchors that scan becomes the dominant cost and can push the whole thing back toward cubic. The
skip is what makes each distinct anchor value do its work once. The subtler trap is the reverse:
skipping duplicate anchors but *also* deduplicating with a plain \`set\` of values and forgetting
that a legitimate answer can contain repeated values — \`[0, 0, 0]\` and \`[-2, 1, 1]\` are real
triples, and any dedup scheme that collapses "this triple has two equal entries" will lose them.`,
  cost: `**Time O(n²), space O(n).** One anchor loop over n elements, each running a linear suffix walk with
O(1) expected set operations, gives n². The space is the \`seen\` set, rebuilt per anchor, holding up
to n values. (The \`triple not in out\` membership scan is an extra cost this version carries and the
pointer version does not.)

This is the right shape when the array **cannot** be sorted — if the answer demanded original
indices, this is your ladder rung, with the anchor skip replaced by a tuple set. Here, though, you
are already sorting to get the skip rule, and once the array is sorted the pointer walk gives the
same time with constant space and cleaner deduplication. So this rung is a stepping stone: learn
it, because the peel-an-anchor idea is what generalises to k-sum, but ship the next one.

---`,
}
