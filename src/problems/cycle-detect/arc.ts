// cycle-detect — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every step of this ladder chases one principle: **detecting a repeat means comparing your present
position against your past, and each approach differs only in where it keeps the past.** The nested
walk keeps no past at all and reconstructs it on demand, re-walking the prefix from the head at every
single node — correct and constant-space, but it pays a full traversal per node, and at the stated
10^4-node limit that quadratic bill is unpayable. The visited set fixes precisely that weakness by
writing the past down once instead of re-deriving it: one hash insert per node turns the re-scan into
a lookup and the running time collapses to linear. But now the past is \`O(n)\` of real memory, on a
problem whose stated point is constant space — the set traded the wrong resource. Floyd's insight is
that you do not need the past at all if you can be in two places at once: run a second pointer at
double speed, and the question "have I been here?" becomes the question "has the fast one caught the
slow one?", which needs no storage because the evidence is the two positions themselves. The
guarantee that makes it work is a consequence of the ρ shape the constraints promise — inside the
loop the gap closes by exactly one per step, so it must hit zero rather than stepping over it — and
that same geometry is what later hands you the cycle's entry point for free. The last rung goes the
other way and asks what could be cheaper than remembering nothing: writing the memory into the nodes
themselves, one impossible sentinel value per node, using the bounded value range the constraints
gave you. It matches Floyd's bounds with a smaller constant and loses the one thing Floyd never
risked — the list's contents. So the arc runs from *recompute the past*, to *store the past*, to
*replace the past with a second present*, to *store the past in the data and burn the data* — and the
winner is the only one that needs neither extra memory nor permission to destroy anything.

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
            "Nested walk",
            "`O(n²)`",
            "`O(1)`",
            "Recomputes the entire prefix instead of storing it",
            "You need a dead-simple oracle to test a clever version against, and `n` is tiny"
        ],
        [
            "Visited set",
            "`O(n)`",
            "`O(n)`",
            "Buys linear time with linear memory — the resource the problem forbids",
            "You need the cycle's entry or length in readable code, or the structure branches (a real graph) where two pointers do not apply"
        ],
        [
            "Floyd (tortoise/hare)",
            "`O(n)`",
            "`O(1)`",
            "None worth naming — two pointers, no allocation, input untouched",
            "Always, for this problem"
        ],
        [
            "Value-marking",
            "`O(n)`",
            "`O(1)`",
            "Fewest node visits, but the list's values are destroyed; needs a bounded value range",
            "The list is yours to destroy and you are counting dereferences"
        ]
    ]
}
