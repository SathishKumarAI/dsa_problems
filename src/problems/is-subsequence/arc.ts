// is-subsequence — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle this problem chases is *never re-derive a position you already had*. The definition
of a subsequence reads as a per-letter search — find an \`a\`, then find a \`b\` after it, then find a
\`c\` after that — and written that way it needs a variable to remember the resume point, a nested
loop to do the hunting and a sentinel to report failure, with the ever-present temptation to
restart each hunt at the beginning of the text and quietly permit two pattern letters to claim the
same text position. Turning the loop inside out removes all of it at once: drive the text, one
character at a time, and the resume point *is* the loop variable, so it cannot be forgotten or
reset by accident. What makes that legal is the thing the problem's own definition hands you —
order must be preserved but adjacency need not, so any non-matching text character may simply be
thrown away, and a mismatch costs nothing but a step. And what makes it *correct* rather than
merely fast is the exchange argument: taking the first available match is never worse than waiting
for a later one, because the earlier match leaves strictly more of the text for everything still
to be matched, so any successful run that waits can be rewritten into one that grabs. That is the
same argument underneath almost every scanning greedy you will meet, and it is worth being able to
say in one sentence. The final turn of the screw is that the one-pass answer is only optimal for
*one* query: hold the text fixed and ask about thousands of patterns, and the per-query sweep of
the text becomes the bottleneck, so you pay once to precompute the next occurrence of every letter
from every position and buy back a per-query cost that depends only on the pattern. Cheap once,
cheap per query, and never the same walk twice.

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
            "Search for each character in turn",
            "`O(\\",
              "s\\",
              "+ \\",
              "t\\",
              ")` as written (`O(\\",
              "s\\",
              "·\\",
              "t\\",
              ")` if the scan wrongly restarts at `0`)",
            "`O(1)`",
            "Mirrors the definition directly, but needs a nested loop, a sentinel and a hand-maintained resume pointer — three places to be subtly wrong",
            "The \"find the next occurrence\" step is genuinely more than a character compare, e.g. a binary search into a precomputed table"
        ],
        [
            "**Two cursors, one pass**",
            "**`O(\\",
              "t\\",
              ")`**",
            "**`O(1)`**",
            "**One loop, one index, no sentinel; the resume position is the loop variable and cannot be lost**",
            "**Any single-query version of this question — the intended answer**"
        ],
        [
            "*(follow-up)* Precomputed next-occurrence table",
            "`O(26·\\",
              "t\\",
              ")` once, then `O(\\",
              "s\\",
              ")` per query",
            "`O(26·\\",
              "t\\",
              ")`",
            "Pays real memory and a setup pass to make each of many queries independent of the text's length",
            "One fixed text, many patterns to test against it"
        ]
    ]
}
