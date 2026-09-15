// merge-sorted-array — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/merge-sorted-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every rung of this problem chases is *stop moving data you were never asked to move,
and let the shape of the memory you were given tell you which way to walk*. Inserting \`b\`'s values
one at a time is correct and it is almost all motion: each insertion re-shifts a growing tail, so
\`a\`'s largest value gets shoved right once per value that lands before it, and none of that
shifting performs a single useful comparison. Dumping everything into the padding and calling
\`sort\` deletes the shifting in one stroke, but it does so by throwing away the fact that both
halves arrived already ordered, and it then pays a logarithmic factor per element to rediscover
it. A merge reclaims that fact — two cursors, one comparison, one value placed for good, linear
overall — but a textbook merge needs somewhere to build the answer, so it borrows a full
\`m + n\` array and writes every value twice. Noticing that only \`a\`'s own prefix is ever in danger
shrinks the borrowed space to \`m\` and halves the writes, and that is the best you can do as long
as you insist on filling the answer from the front. And then the last rung asks the question the
whole problem was built around: *why the front?* Filling forward is only unsafe because \`a[0]\`
holds a live value; the spare room is at the **back**, so start there. Fill from the largest value
down, and the write cursor begins on padding and thereafter only ever lands on cells already
emptied by the values it has just placed — the buffer becomes unnecessary, the copy-back
disappears, and the whole merge runs in three integers. Two details fall out for free once the
direction is right: the loop can stop the instant \`b\` is exhausted, because whatever remains of \`a\`
is already in its final place; and the case that exercises the leftovers — every value of \`b\`
smaller than every value of \`a\` — is the one your test list must contain, because it is the only
one where \`a\`'s values all have to move. The generalisable move is not "merges go backwards". It
is: **when writing collides with reading, turn around and write into the space you actually have.**

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
      "Insert one at a time",
      "`O(n · (m + n))`",
      "`O(1)`",
      "No extra memory, but every insertion re-shifts a growing tail — pure motion, no comparisons",
      "`n` is tiny relative to `m`, especially `n = 1`"
    ],
    [
      "Append and sort",
      "`O((m + n) log(m + n))`",
      "`O(1)`*",
      "Shortest and safest code; discards the sortedness the input handed you and pays a `log` factor to relearn it",
      "Small inputs, production code where clarity beats constant factors (*if the language's sort is in place)"
    ],
    [
      "Merge into a scratch array",
      "`O(m + n)`",
      "`O(m + n)`",
      "Exploits both runs being sorted, but borrows a full-size array and writes every value twice",
      "Merging two sorted runs when you genuinely have an output buffer — the merge step of merge sort"
    ],
    [
      "Copy only `a`'s prefix",
      "`O(m + n)`",
      "`O(m)`",
      "Halves the writes and the buffer by saving only what a forward write could destroy",
      "The spare room is in the wrong place for a backward walk, or `m ≪ n`"
    ],
    [
      "**Backward two pointers**",
      "**`O(m + n)`**",
      "**`O(1)`**",
      "**Nothing allocated, every value written once — but only legal because the padding is at the back**",
      "**The intended answer whenever the free space sits at the end of the destination**"
    ]
  ]
}
