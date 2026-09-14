// three-sum-zero — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/three-sum-zero_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle this problem chases is *reduce the unknown to the known, then make the reduction
cheap*. Brute force treats a triple as an atom and enumerates all n³/6 of them, learning nothing
along the way, and collapsing duplicate value-triples afterwards with a set because the loops only
guarantee distinct *indices*. The first real idea is the peel: fix one element as an anchor and
what remains is not a new problem at all, it is two-sum on the suffix with target \`-anchor\` — so
the hash rung solves it the way two-sum is solved without sortedness, one pass and a set, and the
cube becomes a square. But that rung is uneasy, because it already sorted the array (to make equal
anchors adjacent and skippable) and then searched as though it had not, paying O(n) memory per
anchor to look up values whose sizes their positions already announce, and paying again with a
linear \`already emitted?\` scan on every hit. The final rung cashes in the sort completely: the
inner two-sum becomes converging pointers — constant space, and provably complete by the exchange
argument that a pointer is only ever retired after the arithmetic shows it cannot participate —
while deduplication stops being a data-structure problem and becomes three neighbour comparisons,
because sorting has stacked equal values side by side. That is the lesson worth carrying: **sorting
can be worth its O(n log n) for reasons that have nothing to do with searching faster.** Here it
buys the search *and* the uniqueness rule *and* a free early exit the moment the anchor turns
positive. And the structure generalises exactly as it stands — fix an index, solve (k−1)-sum on the
suffix, dedupe at every level — which is the whole of four-sum and k-sum, with two-pointers sitting
at the bottom of the recursion doing the real work.

---`

export const comparison: Comparison = {
  "head": [
    "Approach",
    "Time",
    "Space",
    "Core trade-off",
    "Best used when"
  ],
  "rows": [
    [
      "Brute force",
      "O(n³)",
      "O(n) for the dedup set",
      "Obviously correct, hopelessly slow; dedup bolted on afterwards",
      "n ≤ ~50, or as the oracle a fast version is stress-tested against"
    ],
    [
      "Hash per anchor",
      "O(n²)",
      "O(n)",
      "Buys the inner search with memory; dedup needs its own scheme",
      "The array must not be reordered, or the answer needs original indices"
    ],
    [
      "Sort + converging pointers",
      "O(n²)",
      "O(1) beyond output",
      "Pays O(n log n) once, then gets search *and* dedup out of the ordering",
      "The default answer; anything where values, not positions, are reported"
    ]
  ]
}
