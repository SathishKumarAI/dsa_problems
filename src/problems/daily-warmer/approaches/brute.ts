// daily-warmer — approach 1 — Brute force: look forward from every day.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "brute",
  title: "Brute force: look forward from every day",
  idea: `*How many days until it gets warmer?* Stand on a day and walk forward through the calendar until you
meet a temperature higher than the one you are standing on, then report how far you walked. If you
reach the end of the list without finding one, the answer is 0.`,
  intuition: `> **Intuition.** Flipping through a **wall calendar** one page at a time. For January 1 you turn
> pages until you hit a warmer day, note how many pages you turned, then flip all the way back to
> January 2 and start turning again. Completely reliable, and exactly how a person would do it by
> hand.

The waste is also exactly what a person would notice by hand: the pages you turn for January 2 are
almost all pages you just turned for January 1. Each day's search starts from a blank memory, and
nothing learned in one pass is carried into the next.`,
  worked: `\`temps = [73, 74, 75, 71, 69, 72, 76, 73]\`. There is no stack in this approach — that is the point of
this rung, and it is worth seeing the absence before seeing what fills it. The state carried between
steps is nothing at all; each row below starts fresh.

| Day \`i\` | \`temps[i]\` | Days scanned forward | Found at | Answer |
|---|---|---|---|---|
| 0 | 73 | \`74\` | j = 1 | **1** |
| 1 | 74 | \`75\` | j = 2 | **1** |
| 2 | 75 | \`71\`, \`69\`, \`72\`, \`76\` | j = 6 | **4** |
| 3 | 71 | \`69\`, \`72\` | j = 5 | **2** |
| 4 | 69 | \`72\` | j = 5 | **1** |
| 5 | 72 | \`76\` | j = 6 | **1** |
| 6 | 76 | \`73\` | never | **0** |
| 7 | 73 | *(nothing left)* | never | **0** |

Result \`[1, 1, 4, 2, 1, 1, 0, 0]\`. Look at rows 2, 3 and 4: day 2 scanned \`71, 69, 72, 76\`, then day 3
scanned \`69, 72\` — a strict subset of what day 2 had just read — and day 4 scanned \`72\` again. The
same temperatures are re-read three times, and nothing about them changed in between. Sixteen
comparisons on this eight-day input; on a strictly decreasing series of length n it would be n(n−1)/2.`,
  code: `def daily_warmer_brute_force(temps: list[int]) -> list[int]:
    n = len(temps)
    answer = [0] * n  # days that never warm up keep this 0 and are never written
    for i in range(n):
        for j in range(i + 1, n):
            if temps[j] > temps[i]:
                answer[i] = j - i
                break
    return answer`,
  mistake: `Writing \`answer[i] = j\` instead of \`answer[i] = j - i\`. The loop logic is entirely correct and the
warmer day is found in the right place — the bug is only in what gets reported.

> **Watch out.** The misconception is confusing **where** the warmer day is with **how long** you
> wait for it. The problem asks for a duration, and a duration is always a *difference* of two
> positions, never a position. It survives casual testing because the two coincide whenever \`i\` is 0,
> so the first entry of every test case looks right — on the example above, day 0's answer is \`1\`
> either way. The first divergence is day 2, where the correct answer is \`4\` and the buggy one is \`6\`.`,
  cost: `**Time O(n²), space O(1) extra.** The cost comes from the inner scan restarting at every day: in the
worst case — temperatures that never rise — each of the n days walks the entire remaining list and
finds nothing, giving n(n−1)/2 comparisons. The space is O(1) beyond the output array, since nothing
is remembered between days.

Use it when n is genuinely small, and use it as the oracle that validates the fast versions — which
is exactly its job in the stress test at the bottom of this document. At the stated n = 10⁵ it is
about 5 × 10⁹ comparisons on a decreasing series, so name that number out loud and move up. It is
still worth two minutes of an interview: stating the brute force and pricing it is how you earn the
right to say "and now here is what the repeated scanning is telling us".

---`,
}
