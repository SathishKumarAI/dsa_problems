// intersection-of-arrays — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every rung chases is *stop re-deriving what you already know*, and here the thing being
re-derived is the same fact five different ways: how many copies of each value each side can supply.
The cross-off scan pays for it in time, re-reading the whole right array for every element of the
left, and needs an O(m) flag array just to avoid claiming the same copy twice — so it is quadratic and
it is not even the memory-free option people assume it is. Sorting fixes the restarted walk by
imposing an order, and the order genuinely earns its keep: two cursors that never move backwards
consume matching pairs in a single linear sweep, and the multiplicity rule stops needing enforcement
because advancing past a matched pair *is* the claim. But ordering is information the answer never
reads — it asks how many, not which comes first — so n log m is paid for an arrangement that is
thrown away, and if you sort in place you have also permuted the caller's arrays irreversibly. The
counting family drops the ordering entirely: two tallies and a \`min\`, linear and explicit, with the
rule the whole problem rests on written down as one readable line. Then the redundancy becomes
visible — the second tally exists only to be compared against the first — and consuming one side on
the fly collapses two maps into one, with "running out of stock" computing the minimum lazily, one
unit at a time. And the last rung is the one that matters outside an interview room, because it
changes nothing about the algorithm and everything about what the algorithm can be *run on*:
\`min(a, b)\` is symmetric, so tally whichever array is smaller and stream the other, and suddenly the
memory is bounded by the smaller input rather than by whichever argument happened to be named second.
That is the transferable move. When two collections have to be compared, the asymmetry is not in the
problem, it is in your code — and the right question is never just "how fast is this?" but **"which of
these two things has to be held in memory, and did I get to choose?"**

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
            "Cross off with used flags",
            "O(n × m)",
            "O(m)",
            "No hashing and no ordering, but quadratic — and the flags are required for correctness, not speed",
            "Both arrays are tiny, elements are neither hashable nor orderable, or you need a reference oracle"
        ],
        [
            "Sort both, two cursors",
            "O(n log n + m log m)",
            "O(n + m) with copies, O(1) if you sort in place and accept the mutation",
            "Buys a single linear sweep with ordering work the answer never reads",
            "**Both arrays are already sorted** — then it is O(n + m) time and O(1) space and beats everything below"
        ],
        [
            "Count both, take the min",
            "O(n + m + k log k)",
            "O(n + m)",
            "Two tallies; the `min` rule is explicit and auditable",
            "Arrays are similar in size, you need the counts afterwards, or the problem generalises to k arrays"
        ],
        [
            "One count table, spend as you go",
            "O(n + m + k log k)",
            "O(m)",
            "One map instead of two, one fewer pass — but always tallies `nums2`",
            "Arrays are comparable in size and you want the shortest correct code"
        ],
        [
            "Count the smaller side",
            "O(n + m + k log k)",
            "O(min(n, m))",
            "Same algorithm, one line more, memory tied to the data's shape rather than to argument order",
            "The default — and the only answer to \"what if `nums2` is enormous and streamed once?\""
        ]
    ]
}
