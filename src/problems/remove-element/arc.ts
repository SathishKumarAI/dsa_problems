// remove-element — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/remove-element_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every rung of this problem chases is *stop moving data and start choosing where to
write it*. Deleting the way you would from a physical list — find a match, close the hole, repeat —
is quadratic for a reason worth naming out loud: closing a hole rewrites the entire tail, so a
value near the end gets shifted once per removal that happens before it, and an array of nothing but
\`val\` does \`n\` shifts of up to \`n\` values to produce an empty answer. The moment you stop thinking
in holes and start thinking in survivors, the cost collapses to linear: read each value once, and
write each kept value once. Collecting those survivors into a fresh list is the first way to do
that, and it is correct and obvious and allocates an array's worth of memory to store values that
already exist a few slots away. Realising that the survivors are always a prefix of what has already
been read — you can never have kept more than you have examined — means the destination can be the
source: the writer trails the reader, every cell it stamps on is one the reader has finished with,
and the second array disappears. From there the last two rungs are about deleting redundancy rather
than changing the idea. The counting pass turns out to be free information the compaction loop was
already producing, since the writer's final position *is* the count — dropping it halves the reads
and, more importantly, removes the second place where the match test could quietly be written
differently. And the self-write guard notices that until the cursors part, every copy is a value
onto itself, so the commonest input of all — \`val\` never appears — can be answered with zero writes
instead of \`n\`. What the whole ladder leaves you with is a shape rather than a snippet: *reader
visits everything, writer advances only on a keeper, the gap is what was dropped, the writer's
final position is the length.* And it leaves you with the question to ask before any of it, because
the answer changes which algorithm is even legal: **does the order of the survivors matter?** Pinned
order buys you this loop. Unpinned order buys you the swap-with-the-last trick, whose cost scales
with removals rather than with the array — and choosing between them is a question about the
contract, not about the code.

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
      "Delete and shift",
      "O(n²)",
      "O(1)",
      "No memory and no cleverness, but every removal rewrites the whole tail",
      "The container really must stay hole-free at every step, e.g. live indices point into the tail"
    ],
    [
      "Filter into a copy",
      "O(n)",
      "O(n)",
      "Linear and obviously correct, but allocates an array to hold values it already has",
      "The original must stay intact, the input is a stream, or you need a trustworthy oracle"
    ],
    [
      "Count, then compact",
      "O(n)",
      "O(1)",
      "In place and linear, but reads twice and writes the match test in two places that can drift apart",
      "The output size must be known before the destination can be allocated or reserved"
    ],
    [
      "Reader and writer",
      "O(n)",
      "O(1)",
      "One pass, one predicate, the length falls out of the cursor",
      "The default answer — clearest correct in-place version"
    ],
    [
      "Reader and writer, self-writes skipped",
      "O(n)",
      "O(1)",
      "Same pass; one extra comparison per survivor buys zero writes when nothing is removed",
      "Writes cost more than reads — dirty pages, copy-on-write buffers, expensive assignment"
    ]
  ]
}
