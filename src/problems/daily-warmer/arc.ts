// daily-warmer — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every step here chases is *stop searching for the answer and let the answer come to
you*. The brute force takes the question at face value: each day wants to know when it next gets
warmer, so each day walks forward until it finds out — reliable, quadratic, and wasteful in a very
specific way, because the stretch of cold days that day 3 walks is a stretch day 2 has just finished
walking, and nothing about it changed in between. The first fix keeps the question pointed the same
way but reuses that work: scan right to left, and every day ahead already carries a signpost saying
how far the next warmer day is, so a day too cold for you can be leapt over wholesale rather than
walked — the answer array becomes its own jump table, and the pass turns amortised linear at no extra
space. The second fix is the one worth keeping, and it comes from turning the question inside out.
Instead of each day searching forward for the day that beats it, let each arriving day look back and
**resolve** every earlier day it beats. The days still waiting for an answer sit on a stack in
decreasing temperature order, which is not an imposed invariant but simply what remains after every
arrival clears out everyone colder than itself; and because the order decreases, the days a newcomer
beats are always a contiguous run at the top, so popping can stop at the first day it fails to beat.
No day ever searches for anything. The inner \`while\` makes the page look quadratic, and the resolution
of that illusion is the single most transferable idea in the whole pattern: each index is pushed
exactly once and popped at most once, so the total number of pops across the entire run is bounded by
n regardless of how unevenly they clump — one expensive iteration is paid for by the cheap ones that
filled the stack. What is left at the end is the days nobody ever beat, and here they need no
handling at all because 0 is already their answer, which is the one detail that does *not* generalise:
in largest-rectangle the leftovers are real answers and must be forced out with a sentinel, and
forgetting that is the classic bug. Everything else does generalise. Flip the comparison and you have
next smaller; flip the direction of the sweep and you have previous greater; report a distance instead
of a value and you have stock span; store indices and multiply the gap by a height and you have the
largest rectangle in a histogram. Learn this loop once, and recognising the family becomes the skill
rather than re-deriving the trick.

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
            "O(1) extra",
            "Transcribes the question literally; every day re-walks cold runs its neighbour just walked",
            "Tiny inputs, the first thirty seconds of an interview, and as the oracle the fast versions are stress-tested against"
        ],
        [
            "Backward scan with hops",
            "O(n) amortised",
            "O(1) extra",
            "Reuses computed answers as a jump table — linear with no stack, but the amortised argument is harder to state",
            "O(n) auxiliary space genuinely matters, or to show you know what the stack is storing"
        ],
        [
            "Monotonic stack",
            "O(n)",
            "O(n)",
            "Each day is pushed once and popped once; costs O(n) storage for the days still waiting",
            "Always — and it is the template for the whole next-greater family"
        ]
    ]
}
