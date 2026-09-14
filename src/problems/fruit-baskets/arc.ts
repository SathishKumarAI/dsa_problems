// fruit-baskets — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `Everything here turns on one act of recognition — **the baskets are a story and the question is
"longest run with at most two distinct values"** — and once that substitution is made, the general
version, at-most-\`K\`-distinct, is the same code with a different number, so \`K = 2\` is only the
variant with a picture attached. From there every rung is an argument about the **left edge**.
Restart it at each tree and you are quadratic, because the run from tree 1 covers nearly all the
ground the run from tree 0 just covered and you carry nothing across; the runs overlap almost
completely, which is the standard signal that one window can be slid rather than many walks
repeated. Carry the left edge instead, with a count per kind inside the window, and you are linear
with an inner loop: extend on the right, and when a third kind appears pull the left edge forward
until some kind's count reaches zero and it genuinely departs — and it is *that* detail, counts
rather than presence, that people get wrong, because a kind whose first copy slides out the back may
still have copies sitting in the middle of the window. Then comes the observation that the inner
loop can never run more than once, since a single step adds at most one kind, and behind it the
deeper one: the answer is a **maximum**, so the window never needs to become legal again, only never
wider than the widest legal window already seen. The loop becomes a single \`if\`, the frame slides
instead of shrinking, the running maximum dissolves into the window's own width, and the answer is
read off the geometry at the end — even though the frame may be sitting on an illegal window when
the row runs out. That last rung is worth understanding rather than memorising, because it is
exactly as general as its assumption: it is a high-water mark wearing the shape of a window, and the
moment the question asks for a minimum, or for the answer's location rather than its size, the
shrinking version is the one that survives.

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
            "Try every starting tree",
            "`O(n²)`",
            "`O(1)`",
            "No memory across starts, so overlapping runs are re-walked in full",
            "`n` is tiny; you need a readable oracle to cross-check the fast versions"
        ],
        [
            "**A window that shrinks until legal**",
            "**`O(n)`**",
            "**`O(1)`**",
            "**Carries the left edge; linearity is amortised rather than visible**",
            "**The default answer — generalises to at-most-`K`, to minimum-variants, and to \"which indices\"**"
        ],
        [
            "A window that never shrinks",
            "`O(n)`",
            "`O(1)`",
            "Drops the running maximum by letting the frame's width *be* it — valid only for a maximum-width answer",
            "You want the tightest loop and the question is purely \"how wide\""
        ]
    ]
}
