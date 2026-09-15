// daily-warmer — approach 3 — Monotonic stack of unresolved days (optimal).
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "stack",
  title: "Monotonic stack of unresolved days (optimal)",
  idea: `*Both previous rungs are organised around the day asking the question — what if the work were
organised around the day that answers it?* Turn the problem inside out. Instead of each day searching
forward for its warmer day, let each new day look **backwards** and resolve every earlier day that it
beats. Keep the days still waiting for an answer on a stack, and the moment a warmer temperature
arrives, pop off everyone it beats and hand each of them their answer. This fixes the weakness both
earlier rungs share — **searching at all** — by replacing the search with a single push and a single
pop per day.`,
  intuition: `> **Intuition.** A **queue at a counter**, everyone holding a card with their temperature, arranged
> so temperatures always decrease from front to back. A new day walks up. Anyone at the back holding
> a card colder than the newcomer has just been served — the newcomer *is* their warmer day — so they
> leave, and they leave from the back, most recent first, because the queue was built coldest-last.
> When nobody at the back is colder any more, the newcomer joins the back and the decreasing order is
> preserved. Whoever is still queued when the input runs out never got served, and their answer is 0.

The stack holds **indices whose answer is still unknown**. That is the sentence to remember, and it is
what generalises: in every problem of this family the stack holds the items still waiting, kept in
whatever order makes "the next arrival resolves a run of them at the top" true.`,
  worked: `\`temps = [73, 74, 75, 71, 69, 72, 76, 73]\`. The stack is shown as \`index:temperature\` with the **top
on the right**; note that the temperatures always decrease from left to right, which is the invariant.

| \`i\` | \`temps[i]\` | Pops (each resolved) | Stack after (idx:temp) | \`answer\` so far |
|---|---|---|---|---|
| 0 | 73 | — | \`[0:73]\` | \`[0,0,0,0,0,0,0,0]\` |
| 1 | 74 | idx 0 (73) → \`1 − 0 = 1\` | \`[1:74]\` | \`[1,0,0,0,0,0,0,0]\` |
| 2 | 75 | idx 1 (74) → \`2 − 1 = 1\` | \`[2:75]\` | \`[1,1,0,0,0,0,0,0]\` |
| 3 | 71 | — (71 does not beat 75) | \`[2:75, 3:71]\` | \`[1,1,0,0,0,0,0,0]\` |
| 4 | 69 | — (69 does not beat 71) | \`[2:75, 3:71, 4:69]\` | \`[1,1,0,0,0,0,0,0]\` |
| 5 | 72 | idx 4 (69) → \`5 − 4 = 1\`; idx 3 (71) → \`5 − 3 = 2\` | \`[2:75, 5:72]\` | \`[1,1,0,2,1,0,0,0]\` |
| 6 | 76 | idx 5 (72) → \`6 − 5 = 1\`; idx 2 (75) → \`6 − 2 = 4\` | \`[6:76]\` | \`[1,1,4,2,1,1,0,0]\` |
| 7 | 73 | — (73 does not beat 76) | \`[6:76, 7:73]\` | \`[1,1,4,2,1,1,0,0]\` |

The scan ends with indices 6 and 7 still on the stack. They are never resolved, and they keep the \`0\`
the array was initialised with — result \`[1, 1, 4, 2, 1, 1, 0, 0]\`.

Three things in that table are the whole technique. **The stack is always decreasing** — \`75, 71, 69\`
at step 4 — which is what guarantees that the days a newcomer beats are a contiguous run at the top,
so popping can stop at the first day it does not beat. **Day 2 waits from step 2 until step 6**,
sitting under later, colder days, and is resolved only by the first thing that actually beats it; no
search was performed, the answer came to it. And **step 6 pops twice**, which is where the inner
\`while\` loop looks expensive — the next section explains why it is not.`,
  code: `def daily_warmer_monotonic_stack(temps: list[int]) -> list[int]:
    answer = [0] * len(temps)
    waiting: list[int] = []  # indices whose answer is unknown, temps decreasing
    for i, t in enumerate(temps):
        while waiting and temps[waiting[-1]] < t:  # strict: an equal day is not warmer
            j = waiting.pop()
            answer[j] = i - j
        waiting.append(i)
    return answer
    # whatever is left on \`waiting\` never warms up, and already holds 0`,
  codeNote: `The stack holds **indices, not temperatures**, and that is not an implementation detail. The answer is
a distance, so you need \`j\` to subtract; and you need \`temps[j]\` to compare — an index gives you both,
a temperature gives you only one.`,
  mistake: `Writing \`temps[waiting[-1]] <= t\` instead of \`<\`. This pops days whose temperature exactly *equals*
the new day's, recording a wait that ends on a day that is not warmer at all.

> **Watch out.** The misconception is that the comparison in a monotonic stack is a **style choice** —
> that \`<\` and \`<=\` differ only in how ties are broken, and either will do. They do not. The
> comparison *is* the specification: \`<\` implements "strictly warmer", \`<=\` implements "warmer or the
> same", and the problem asked for the first. Worse, the wrong one hides — run that variant on this
> document's worked example and it returns \`[1, 1, 4, 2, 1, 1, 0, 0]\`, completely correct, because
> the example happens to contain no relevant tie.

Feed it \`[73, 73, 74]\` and it returns \`[1, 1, 0]\` where the correct answer is \`[2, 1, 0]\` — it claims
day 0's wait ended on day 1, which is the same 73. On \`[30, 30, 30]\` it returns \`[1, 1, 0]\` against a
correct \`[0, 0, 0]\`, inventing warmer days that do not exist. With temperatures confined to a
71-value range, ties are not an edge case here but the ordinary case, so put one in your own test
data before trusting either comparison.`,
  cost: `**Time O(n), space O(n).** Time is the amortised argument above: n pushes, at most n pops, O(1) work
each, and the inner loop cannot exceed that budget however lumpy its distribution. Space is the stack,
and the bound is tight — a strictly decreasing series like \`[100, 99, 98, …]\` never pops anything, so
all n indices sit on the stack at once.

This is the answer to ship, and more importantly it is the answer to *recognise*. The moment a problem
asks for "the next thing bigger/smaller than this one" for every position, this loop is the response,
with four knobs: the comparison (\`<\` for next greater, \`>\` for next smaller), the direction of the
sweep (left-to-right for *next*, right-to-left for *previous*), what you store on the stack (indices
here, sometimes pairs), and what you do with whatever is left over at the end (nothing here, because
0 is already correct — but \`largest-rectangle\` must flush it, and that difference is exactly where
most implementations of that problem go wrong).

---`,
  notes: [
    { title: "why the inner `while` loop is still linear", body: `> **Why it works.** There is a loop inside a loop, and the inner one can pop several indices in a
> single outer iteration — step 6 above popped two — so the shape on the page is exactly the shape of
> an \`O(n²)\` algorithm. It is not. **Each index enters the stack exactly once and leaves it at most
> once**, so the total number of pops across the entire run is bounded by \`n\`, however unevenly they
> clump. Count pushes, not iterations, and the quadratic illusion disappears.

Spelled out, because this is what an interviewer probes:

- Every index is pushed onto the stack **exactly once**, in its own outer iteration. That is n pushes
  in total, across the entire run.
- Nothing is ever pushed back after being popped. Once an index's answer is written it is gone for
  good.
- Therefore there are **at most n pops in total**, across the entire run — not per iteration.

So the inner \`while\` body executes at most n times summed over the whole algorithm, whatever the
input looks like. A single iteration can be expensive — the last day of \`[100, 99, 98, …, 30, 101]\`
pops the entire stack — but that iteration is expensive precisely *because* the previous ones were
cheap, and it cannot happen twice, because the stack it emptied has to be refilled one push per day
first. Total work: n pushes plus at most n pops plus n comparisons, so **O(n)**. This is amortised
analysis, and the sentence that carries it in an interview is: **"each index enters the stack once
and leaves once, so the total pop count is bounded by n no matter how the pops are distributed."**` },
  ],
}
