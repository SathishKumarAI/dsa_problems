// sorted-pair-sum — "Understanding the Problem"
//
// Rewritten 2026-10-17 for reading, not for completeness: the statement and
// the four bounds are on the page directly above this section (the cards carry
// the constraints → what-they-buy table), so neither is said again here. What
// is left is the one question under the statement and the three facts that
// decide every approach below.

export const understanding = `**The question under the statement:** for each value, does its partner — \`target − value\` — sit
somewhere else in the list?

Three facts decide everything that follows:

- **The list is sorted.** Where a value sits already says how big it is. That is information, and
  the fast answer spends it instead of spending memory.
- **Exactly one answer exists.** Stop at the first hit. The \`return []\` at the foot of each rung is
  for the tests below, never for a real input.
- **O(1) extra space.** No map, no copy. Whatever you do has to fit in a couple of integers.

Two worlds, one tell: if the input is **not** sorted, the hash map is the right answer and the
converging walk does not apply. Everything below is about knowing which world you are in.
---`
