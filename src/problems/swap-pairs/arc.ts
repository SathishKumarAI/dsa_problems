// swap-pairs — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/swap-pairs_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every rung above the first is chasing one thing — **a grip on the node in front of the pair** — and
the first rung is here to establish that the problem is about structure at all. Swapping the payloads
is two lines, constant space, and produces a printout indistinguishable from the right answer while
leaving every node exactly where it was; it fails the moment a node carries more than an \`int\` or
anything outside holds a pointer in, which is why the trace tracks \`n0, n1, n2\` rather than \`1, 2, 3\`
and why the harness audits identity separately from values. Once you commit to moving nodes, the
difficulty is immediate and specific: a swap rewrites **three** links, and the third belongs to the
node before the pair, so the code must be able to name four nodes at once and must not overwrite any
of them before reading it. The array rung buys that ability wholesale — lay every node pointer out
where all neighbours are indexable, swap in the array, rewrite every \`next\` — which genuinely
relinks, at the price of a second copy of the list's structure to look **one** node ahead that the
pair already points at. Recursion deletes the array by noticing that the rest of the list can be
asked to swap itself and hand back its own new front, which is the clearest statement of the idea on
the page and costs a stack frame per pair; unusually for a list recursion the stated hundred-node
ceiling makes that safe, so the honest objection is style, not overflow. The loop with a \`prev\`
pointer replaces the frame with a variable, and in doing so exposes what was hiding behind both
earlier rungs: the first pair has nothing behind it, so the answer must be captured before the first
swap destroys it and the third assignment must be skipped exactly once — two branches, three
conditionals, and every one of them a bug site, measured as \`[1, 4, 3, 5]\` when the return is wrong.
The last rung deletes all of it with one throwaway node in front of the head. Now every pair is an
ordinary pair, the three assignments run unconditionally, the loop test \`prev.next and prev.next.next\`
covers the empty list, the single node and the odd tail with one expression, and the new head is not
computed but *read off* \`dummy.next\`. Repaint, shunt via a siding, delegate, carry a \`prev\`, invent a
predecessor: the principle being sharpened is that **the head is the only node with nothing in front
of it, and a fake node in front of it turns a special case into no case** — which is the same
sentence that ends *remove-nth-from-end* and *remove-list-elements*, and the reason those three
problems are really one lesson.

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
      "Swap the values",
      "`O(n)`",
      "`O(1)`",
      "Cheapest and **wrong**: no node moves, so every outside pointer is now stale",
      "Nodes are interchangeable data holders and nothing holds a pointer in — and you have written that down"
    ],
    [
      "Node array, then relink",
      "`O(n)`",
      "`O(n)`",
      "Buys a second copy of the structure to see one node ahead",
      "The permutation is non-local — reverse-every-k, rotate, interleave"
    ],
    [
      "Recursive",
      "`O(n)`",
      "`O(n/2)` stack",
      "Clearest statement of the idea; safe at n ≤ 100, not in general",
      "Readability matters most, or as the second interview answer"
    ],
    [
      "`prev` pointer, head special-cased",
      "`O(n)`",
      "`O(1)`",
      "Constant space with three conditionals, two of them purely the head's fault",
      "You cannot allocate the extra node at all"
    ],
    [
      "**`prev` pointer + dummy node**",
      "**`O(n)`**",
      "**`O(1)`**",
      "**One throwaway node buys away every branch in the function**",
      "**Always, for this problem**"
    ]
  ]
}
