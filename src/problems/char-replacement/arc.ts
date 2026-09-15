// char-replacement — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/char-replacement_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every rung chases one principle: **stop recomputing what the last move already told you.** Brute force
violates it twice over — it reconsiders every one of the n²/2 stretches independently, and within each
one rescans all 26 tally slots to find the most frequent letter, so the same characters are counted and
the same maxima re-derived again and again; seven starts and 28 scans to describe seven characters. The
first fix is structural and it is the window itself: one pair of edges that both move forward only, so
each character is added once and removed at most once and the tally survives across candidates instead
of being torn up whenever the start moves. That alone takes the method from quadratic to linear, and it
rests on a small monotonicity claim worth stating aloud — a stretch unaffordable from a given left edge
stays unaffordable from any edge further left, so the tail never backs up. What remains wasteful is not
the tally but the **verdict**: after a one-character move the code scans 26 slots to rediscover which
letter is most common, which is twenty-six reads to learn what a single increment could only have
changed in one place. The instinct at this point is to maintain the maximum incrementally — and the
surprise of this problem is that you need not maintain it at all, you can simply refuse to lower it.
That refusal is safe for a reason specific to what is being asked: the answer is a maximum over widths,
and a stale, too-large most-frequent count can only make the window judge itself affordable when it is
not, which in turn only lets it hold a width the record already contains; it can never manufacture a
width longer than one that genuinely occurred. So the value is allowed to rot, the window stops
shrinking more than one step at a time, and it slides at record width waiting for a real improvement —
the traces above show it running four consecutive steps on a number that is flatly wrong about the
window's contents and arriving at the same answer as the honest version. Quadratic recount, linear
window with an honest verdict, linear window with a deliberately stale one — and the move worth
carrying away is the last, because "the answer is a maximum, so a bound that only tightens costs
nothing" is a licence you will want again, and because it is the question an interviewer asks when the
code looks too simple to be right.

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
      "Every substring",
      "`O(n² · 26)`",
      "`O(1)`",
      "No memory across starts; each character re-tallied once per preceding start",
      "n is tiny; you need an obviously-correct oracle"
    ],
    [
      "Window + recomputed max",
      "`O(26 · n)`",
      "`O(1)`",
      "Carries the tally but re-derives the verdict, paying a 26-slot scan per move",
      "Correctness must be self-evident and a 26× constant is irrelevant; the affordability rule may change"
    ],
    [
      "**Window + stale max**",
      "**`O(n)`**",
      "**`O(1)`**",
      "Lets the most-frequent count go stale; the price is owing an argument for why that is safe",
      "The default answer for this problem"
    ]
  ]
}
