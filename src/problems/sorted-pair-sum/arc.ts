// sorted-pair-sum — the closing narrative, and the rungs side by side
//
// Rewritten 2026-10-17 for reading: one principle, one point per rung, and
// the recognition template as the thing to carry out.
//
// The LONG arc — what every rung had in common. The short paragraph the
// problem page renders under its ladder is `arc` in solutions.ts; the two are
// written for different readers and neither is a copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `One principle: **stop re-deriving what you already know.**

- Brute force keeps nothing between outer steps, so it re-reads the tail n times over. That is the
  quadratic wall.
- The hash map writes down every value it passes, so "does a partner exist?" costs one lookup — but
  look at what it stores: *which values are present*, in an array whose *order already says so*.
  O(n) memory for a fact the input handed over for free.
- The converging pointers cash that fact in. At the two extremes, one sum is both the largest the
  left index can ever make and the smallest the right index can, so one comparison proves an
  endpoint can never be in the answer. Retire it. No memory, one pass.

**The template to carry out:** a sorted sequence plus a quantity that moves one way as each end
moves means converging pointers apply and the exchange argument goes through. Three-sum meets it
after a sort; container-with-most-water meets it without one, because its monotonicity comes from
geometry; every k-sum built on the two inherits it.
---`

export const comparison: Comparison = {
  head: ["Approach", "Time", "Space", "Core trade-off", "Best used when"],
  rows: [
    [
      "Brute force",
      "O(n²)",
      "O(1)",
      "Zero cleverness, zero memory, quadratic time",
      "n is tiny, or you need a trustworthy reference to cross-check a faster solution",
    ],
    [
      "Hash map",
      "O(n)",
      "O(n)",
      "Buys the existence check with memory; ignores ordering entirely",
      "The array is **not** sorted, or you may not reorder it, or the answer needs original indices",
    ],
    [
      "Two converging pointers",
      "O(n)",
      "O(1)",
      "Reads magnitude off position instead of storing it; requires sortedness",
      "The array is sorted and the quantity is monotone in each pointer — the intended answer here",
    ],
  ],
}
