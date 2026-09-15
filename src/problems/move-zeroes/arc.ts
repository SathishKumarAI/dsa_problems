// move-zeroes — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/move-zeroes_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle this problem chases from the first line to the last is *the answer can be built in the
space the input is vacating*. The copy version says what the answer is — kept values in order, then
zeroes — and builds it somewhere safe, which is the right instinct and the wrong address: it
allocates a whole second array, writes every kept value into it, and then writes every one of them
again on the way back, all to produce a result that could have been assembled in the original array
the entire time. The reader/writer pair makes that observation concrete. As the reader moves
forward it passes over positions it will never need again, and those positions are precisely where
the kept values belong once the zeroes ahead of them are gone; so the writer trails the reader,
claiming vacated ground, and the gap between the two is never anything other than the number of
zeroes seen so far — no counter required, because the geometry already counts them. What makes this
safe rather than reckless is a promise stated in one sentence and maintained at every step:
*everything before the writer is a kept value, in order*. That sentence is doing two jobs at once —
"no zeroes before the writer" is what makes the final zero-fill correct and correctly sized, and "in
order" is what satisfies the constraint that ruled out every clever swap-with-the-end scheme. The
third version then asks what happens if, instead of copying forward and cleaning up after, the two
pointers simply trade: the zero at the writer's position is exactly what belongs at the reader's, so
a swap completes both halves of the move at once and the cleanup pass evaporates. That turns out not
to be strictly better, which is the more useful lesson — count the writes and the choice flips
depending on how common zeroes are — and it is a good reminder that "one pass" is a description of
structure, not a measurement of cost. The shape you take away is bigger than this problem: a reader
that visits everything, a writer that marks the frontier of the answer, and a predicate that decides
which is which. Change the predicate to \`!= val\` and it is \`remove-element\`; change it to "differs
from the last kept value" and it is \`remove-duplicates-from-sorted-array\`; keep it and it is this.

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
      "Filter into a copy",
      "O(n)",
      "O(n)",
      "Restates the answer literally and is nearly impossible to get wrong, at the cost of a second array and writing every kept value twice",
      "Clarity beats memory, the filtered list is wanted anyway, or you need an unimpeachable oracle to cross-check a faster version"
    ],
    [
      "Reader and writer, two passes",
      "O(n)",
      "O(1)",
      "Allocates nothing and each pass is separately verifiable; costs a second traversal and a visibly \"garbage\" middle state",
      "The default. Zeroes are rare or unknown, and you want the version whose halves you can reason about independently"
    ],
    [
      "Reader and writer, swapping",
      "O(n)",
      "O(1)",
      "One pass with no cleanup and fewest writes when zeroes are common; up to 2n writes when they are rare, all self-swaps",
      "Zeroes are known to dominate, or a single traversal of the data is structurally required"
    ]
  ]
}
