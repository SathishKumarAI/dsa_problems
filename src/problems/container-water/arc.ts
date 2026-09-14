// container-water — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `One greedy argument carries this entire problem, and the value of working the ladder is that it
teaches you to *state* that argument rather than merely trust it. Brute force computes the area of
all n(n−1)/2 pairs and keeps the biggest, and its failure is not subtlety but waste: having measured
the container \`(1, 8)\`, it has already learned everything about the pairs \`(1, 7)\`, \`(1, 6)\`, … —
each is narrower, and each is still capped by whichever of the two original sticks was shorter — and
it discards that knowledge and re-measures them one by one. Turn that discarded inference into a
rule and the problem collapses. Start at maximum width, because width is the resource you can only
ever spend, never earn back. Look at the two walls and identify the bottleneck: the area is
\`min(a, b) × width\`, so the *shorter* wall alone sets the ceiling, and the taller wall's excess height
is doing nothing. Moving the taller wall inward is therefore the one move that is guaranteed to hurt
— narrower, and still capped by the same short wall — while moving the shorter wall is the only move
that can buy you a taller ceiling in exchange for the width you give up. Retire the shorter wall,
step inward, repeat, and each single comparison provably eliminates every remaining pair that
contained that wall. One sweep, constant space, and the answer cannot be missed. The general lesson
is the recognition rule: converging pointers do not need a sorted array — they need a **bottleneck
you can identify and a proof that advancing past it discards only losers**. In pair-sum that proof
comes from sorted order; here it comes from geometry. Rehearse this particular proof out loud,
because "why is that safe?" is the question that follows the code every single time, and the answer
is exactly the paragraph above.

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
            "Brute force",
            "O(n²)",
            "O(1)",
            "Measures everything, proves nothing; dies at n = 10⁵",
            "n is tiny, or as the oracle a greedy solution is stress-tested against"
        ],
        [
            "Converging pointers",
            "O(n)",
            "O(1)",
            "One comparison retires a whole family of pairs — but you must be able to justify the discard",
            "Always, here; and as the template whenever one endpoint is a provable bottleneck"
        ]
    ]
}
