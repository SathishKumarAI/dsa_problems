// summary-ranges — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/summary-ranges_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every step on this ladder chases one principle: **stop paying for anything the answer never asked
for.** The first instinct refuses to reason at all — lay out the number line from the smallest value
to the largest, light up the numbers you were given, and read the unbroken stretches straight off —
which is correct, and quietly charges you for every integer *between* your values, so two numbers a
billion apart cost a billion steps and on the real bounds the line cannot be allocated at all. The
escape is the observation the whole problem turns on: inside a consecutive run the difference
\`value - index\` never changes, and it jumps at every gap, so runs can be identified without ever
asking what lies between two values. Bucketing by that key touches each element once and the cost
finally follows the length of the input rather than the size of the numbers in it — but it then sorts
the keys to recover an ordering the input already had, and hashes every element to rebuild an
adjacency that was never lost, because the array was handed to you sorted. Drop the map and walk left
to right, appending each value to the current pile or starting a fresh one, and the same groups
appear with no keys and no re-sorting. That version stores every element, though, when only two
values per run — the first and the last — ever reach the output, so the next move keeps one number per
run instead of one per element by recording the positions where the chain breaks and pairing them
afterwards. And that still needs a second pass over a list that has to survive the first, which is
the last thing to go: a range can be written down the instant its break is seen, so nothing needs to
survive except the value the current run started at. Paint the line, key by the invariant, walk the
piles, keep the break points, keep one anchor — and threaded through all five is the formatting rule
that looks like a detail and is not, that a run of one prints bare, because it is the single decision
every rung must make identically and the one place where a technically well-formed range is still the
wrong answer.

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
      "Paint the number line",
      "`O(hi - lo)`",
      "`O(hi - lo)`",
      "Makes the structure visible instead of inferring it; pays per **value** in the span, not per element",
      "Values are dense and bounded — day numbers, ports, small ids. Forbidden here by `±2^31`"
    ],
    [
      "Bucket by `value - index`",
      "`O(n log n)`",
      "`O(n)`",
      "Cost follows the input at last, but it sorts keys to recover an order the input already had",
      "The input is **not** sorted, or you need the grouping itself"
    ],
    [
      "Split into run lists",
      "`O(n)`",
      "`O(n)`",
      "One local comparison replaces the map; still copies every element",
      "You need the runs' members, not just a summary of them"
    ],
    [
      "Collect the break points",
      "`O(n)`",
      "`O(k)` for `k` runs",
      "One number per run instead of one per element; still two passes over a stored list",
      "The break positions themselves are the answer"
    ],
    [
      "**One walk with an anchor**",
      "`O(n)`",
      "`O(1)`",
      "Emits each range the moment its break is seen, so nothing survives the pass but the anchor",
      "The default answer for this problem"
    ]
  ]
}
