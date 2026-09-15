// permutation-in-string — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/permutation-in-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The whole ladder here is an argument about the **test**, not the skeleton — because the skeleton was
settled by one observation in the first minute: a rearrangement of \`s1\` has \`s1\`'s length, so the window
width is known before the search starts, and the fixed-width shape means one character enters and one
leaves per step with no shrink loop and no amortised argument to make. Given that, the first instinct is
to reduce "same letters in any order" to something comparable, and sorting does it — line both handfuls
up alphabetically and equality is a glance — but it re-sorts the entire window at every position, so
every character is sorted once for each window containing it, and the fourth window carefully re-sorts a
letter the third window already sorted. The fix is to describe the window by a tally instead of by its
sorted text, because a tally can be *edited*: one increment for the arrival, one decrement for the
departure, two pencil strokes per step whatever the width, and the middle of the window is never touched
because nothing in the middle changed. That makes the sliding linear, and exposes the remaining waste as
being in the verdict rather than the state — after two strokes the code reads all twenty-six columns to
decide whether the scoreboards match, when at most two of them can differ from what it already knew. So
the last move is the same one that makes the covering-window problem cheap: **replace the repeated check
with a summary updated at the boundary**, here one integer counting how many letters currently hold
exactly the right count, adjusted only for the two letters that moved, and only in the two transitions a
step-of-one can cause — a count landing on its target, or a count leaving it. The verdict becomes a
single comparison against 26, and every one of those three tests was only ever expressible because the
alphabet was promised finite and small on the first line of the problem. Re-sorted text, an edited
tally, a maintained verdict — and the habit worth taking away is the general one: when a check is
repeated over sliding data, look for a summary you can update incrementally instead of recompute.

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
      "Sort every window",
      "`O(n · k log k)`",
      "`O(k)`",
      "Nothing survives between windows; each is re-derived from its own characters",
      "`k` is tiny; you want an obviously-correct oracle or a one-line opening answer"
    ],
    [
      "Slide a tally, compare all 26",
      "`O(26 · n)`",
      "`O(1)`",
      "Edits the state but recomputes the verdict, reading 26 slots after a two-slot change",
      "`n` is small enough that a 26× constant is invisible; you want it correct fast"
    ],
    [
      "**Tally + `agree` counter**",
      "**`O(n)`**",
      "**`O(1)`**",
      "Maintains the verdict too; the price is four transition cases that must all be right",
      "The default answer, and the base for find-all-anagrams"
    ]
  ]
}
