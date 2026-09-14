// daily-warmer — approach 2 — Backward scan, hopping over resolved blocks.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "backward",
  title: "Backward scan, hopping over resolved blocks",
  idea: `*The brute force re-walks runs of colder days that a previous day has already walked — can that work
be reused instead of repeated?* Yes, if you go right to left. By the time you reach day \`i\`, every day
after it already has its answer, and those answers are shortcuts: if day \`i+1\` is not warm enough for
you, then everything up to day \`i+1\`'s own warmer day is not warm enough either, so you can leap
straight over that entire block in one step instead of walking it. This fixes the brute force's
central weakness — **re-reading stretches of cold days that were already read** — by turning the
already-computed answers into a jump table.`,
  intuition: `> **Intuition.** Each resolved day is a **signpost** reading "the next thing warmer than me is *this*
> far ahead". Standing on day \`i\`: if the next day is warmer, you are done in one step. If it is not,
> its signpost points at the first day that beats *it* — and since that day is no warmer than you,
> every day in between is no warmer than you either, so you can teleport there without reading
> anything on the way. Keep following signposts until you land on something warmer, or on a day whose
> signpost says "nothing ever", which means nothing ever beats you either.

Each hop skips a whole block that some earlier computation already measured.`,
  worked: `\`temps = [73, 74, 75, 71, 69, 72, 76, 73]\`, scanned from right to left. There is still no stack — the
\`answer\` array itself is carrying the state, which is the interesting thing about this rung.

| Day \`i\` | \`temps[i]\` | Start at \`j\` | Hops taken | Landed | \`answer[i]\` | \`answer\` so far |
|---|---|---|---|---|---|---|
| 6 | 76 | 7 | \`j=7\` (73 ≤ 76) and \`answer[7] = 0\` → dead end | past the end | **0** | \`[0,0,0,0,0,0,0,0]\` |
| 5 | 72 | 6 | none — 76 > 72 immediately | j = 6 | **1** | \`[0,0,0,0,0,1,0,0]\` |
| 4 | 69 | 5 | none — 72 > 69 immediately | j = 5 | **1** | \`[0,0,0,0,1,1,0,0]\` |
| 3 | 71 | 4 | \`j=4\` (69 ≤ 71) → hop \`+answer[4]=1\` → j = 5 | j = 5 (72 > 71) | **2** | \`[0,0,0,2,1,1,0,0]\` |
| 2 | 75 | 3 | \`j=3\` (71 ≤ 75) → hop \`+2\` → j = 5; \`j=5\` (72 ≤ 75) → hop \`+1\` → j = 6 | j = 6 (76 > 75) | **4** | \`[0,0,4,2,1,1,0,0]\` |
| 1 | 74 | 2 | none — 75 > 74 immediately | j = 2 | **1** | \`[0,1,4,2,1,1,0,0]\` |
| 0 | 73 | 1 | none — 74 > 73 immediately | j = 1 | **1** | \`[1,1,4,2,1,1,0,0]\` |

Result \`[1, 1, 4, 2, 1, 1, 0, 0]\`, matching the brute force exactly. Day 2 is the row that shows the
mechanism: the brute force read four temperatures to resolve it, while this version read two and
jumped over the rest — it went 3 → 5 → 6 without ever looking at day 4, because day 3's answer of 2
already certified that days 3 and 4 are both no warmer than 71, and 71 is no warmer than 75.`,
  code: `def daily_warmer_backward_scan(temps: list[int]) -> list[int]:
    n = len(temps)
    answer = [0] * n
    for i in range(n - 2, -1, -1):  # the last day has nothing after it, so it stays 0
        j = i + 1
        while j < n and temps[j] <= temps[i]:
            if answer[j] == 0:
                j = n  # day j never warms up, so neither does day i
            else:
                j += answer[j]  # hop over a whole block that is already resolved
        answer[i] = j - i if j < n else 0
    return answer`,
  mistake: `Forgetting the \`answer[j] == 0\` branch and letting \`j += answer[j]\` run unguarded.

> **Watch out.** The misconception is reading \`answer[j] == 0\` as a **boring zero** — a day with a
> short wait, or nothing to do. It is not a number at all, it is a sentinel meaning *"no warmer day
> exists after \`j\`"*, and the two readings behave completely differently. Treated as a number,
> \`j += 0\` does not move \`j\`, \`temps[j] <= temps[i]\` is still true, and the \`while\` loop **spins
> forever**. That branch is not a tidy-up; it is the loop's only other exit, and it carries real
> meaning: nothing after day \`j\` beats day \`j\`, and day \`j\` does not beat me, so nothing after me
> beats me either.

The milder cousin is writing \`j += 1\` instead of \`j += answer[j]\`. That one terminates and returns
correct answers — it has simply thrown the whole idea away and rediscovered the brute force with extra
ceremony, which is a bug you find by timing rather than by testing.`,
  cost: `**Time O(n) amortised, space O(1) extra.** The cost argument is the same one that makes the next rung
work, and it is subtle: each hop from day \`i\` lands on a day that is strictly warmer than the one it
left, so the temperatures under \`j\` strictly increase along a single day's hop chain. With bounded
temperatures that caps any one chain, and across the whole array the total number of hops is linear
because each hop crosses a block that is thereafter never crossed again from the left. Space is O(1)
beyond the output, because the output array *is* the auxiliary structure.

Use it when the O(n) auxiliary space of a stack genuinely matters, or as a party trick that
demonstrates you understand what the stack is storing. Be honest about its standing, though: the
amortised argument is fiddlier to state under pressure than the stack's, and "each index is pushed
once and popped once" is a much easier sentence to defend on a whiteboard than "each hop crosses a
block that is never re-crossed".

---`,
}
