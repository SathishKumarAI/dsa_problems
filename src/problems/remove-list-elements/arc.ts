// remove-list-elements — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/remove-list-elements_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every rung here applies the one unlinking rule — **a node is deleted by its predecessor pointing past
it** — and the ladder is a sequence of things that turn out to be unnecessary. Restarting the scan
after each removal is the instinct of someone who does not trust their own cursor: the list changed,
so start again. It is never wrong and it is redundant for a reason worth saying out loud — **a deleted
node cannot come back**, so everything behind you is final and only the node immediately ahead can
have been affected; measured, that redundancy costs 419 inner steps on a 40-node list whose matches
sit at the end, and roughly \`n²/4\` in general. Rebuilding from the survivors makes one pass and never
looks back, which fixes the quadratic completely — and does it by allocating up to \`n\` fresh nodes and
abandoning the ones you were handed, so the caller gets a different list with the same contents and
anything holding a pointer to a survivor is now pointing into an orphan. Recursion keeps the real
nodes by inverting the question: rather than a cursor that deletes things, each node is asked what its
predecessor should point at, and a matching node deletes itself by simply not mentioning itself — no
\`prev\`, no head case, and, elegantly, no don't-advance rule either, because there is no cursor to
advance. But it holds a frame per **node**, not per removal, so at the stated ten thousand it raises
\`RecursionError\` even on a list with nothing to delete. Collapsing that stack into a single pointer
gives the strip-the-head loop: one pass, constant space, the caller's own nodes — everything asked
for — at the price of writing the same predicate twice, once for the head, which has no predecessor
and so needs its own loop, and once for the walk. That duplicated head loop is the one people forget,
and it is precisely the loop that a list of nothing but matches depends on; measured, omitting it
returns \`[7]\` on \`[7,7,7,7]\`. The last rung deletes the duplication with one throwaway node in front
of the head: now the head is somebody's \`next\` like every other node, the predicate appears once, the
loop runs exactly one iteration per node, and \`dummy.next\` is the right answer whether nothing went,
the front went, or all of it did — no branch on the return, and the empty-list answer falls out for
free. Restart, rebuild, recurse, strip-and-walk, invent a predecessor: two ideas are being sharpened
at once, and both are worth more than the problem. **After a removal, do not advance** — the node that
slid into the gap has not been judged — which is the same rule as every erase-while-iterating bug in
every language. And **the head is the only node with nothing in front of it**, so invent something
and the special case stops existing, which is the same move that ends *remove-nth-from-end* and
*swap-pairs*. Those two sentences are the whole problem; the five rungs exist to make you feel why.

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
      "Restart the scan",
      "`O(n²)`",
      "`O(1)`",
      "Never wrong, and re-walks ground it already cleared; ~419 steps on a measured 40-node worst shape",
      "You want an oracle whose correctness is visible by reading it"
    ],
    [
      "Rebuild from survivors",
      "`O(n)`",
      "`O(n)`",
      "Sidesteps every pointer problem by allocating up to `n` new nodes and abandoning the originals",
      "The input must not be mutated — shared, immutable, or const-borrowed"
    ],
    [
      "Recursive",
      "`O(n)`",
      "`O(n)` stack",
      "Three lines, no `prev` and no head case; one frame per node, so `10^4` raises `RecursionError`",
      "The list is provably short and readability outranks everything"
    ],
    [
      "Strip the head, then walk",
      "`O(n)`",
      "`O(1)`",
      "Optimal cost, and the predicate is written twice — the head copy is the forgotten one",
      "You cannot allocate the extra node at all"
    ],
    [
      "**Dummy node + one loop**",
      "**`O(n)`**",
      "**`O(1)`**",
      "**Same cost as above with one loop, one predicate, and no branch on the return**",
      "**Always, for this problem**"
    ]
  ]
}
