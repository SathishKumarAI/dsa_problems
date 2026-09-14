// largest-rectangle — approach 3 — Monotonic stack of unfinished bars (optimal)
//
// Converted from docs/deep/largest-rectangle_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "stack",
  title: "Monotonic stack of unfinished bars (optimal)",
  idea: `*Both previous rungs go looking for boundaries — can the boundaries announce themselves instead?* Yes.
Sweep left to right, keeping on a stack the bars whose rectangle is **not yet finished**, in
non-decreasing height order. When a bar arrives that is shorter than the stack top, that top bar's
rectangle is finished: the arriving bar is its right boundary, and the bar below it on the stack is
its left boundary. Pop, compute, repeat. This fixes what both earlier rungs share — **searching for
the two shorter bars** — by having each bar discover its own boundaries the moment they exist.`,
  intuition: `> **Intuition.** The stack is a row of bars with **unfinished business**, each still hoping to extend
> further right. They sit in non-decreasing order because any bar that arrives shorter than the ones
> already waiting has just ended their hopes, and is served before joining. When a short bar walks in,
> everybody taller than it settles up and leaves — from the top down, tallest first — and each one
> learns both its edges as it goes: the newcomer on its right, and whoever it finds beneath it on its
> left.

The two next-smaller questions the problem needs are answered by the **same** pop, from opposite
sides, which is why one pass suffices where the brute force needed two walks per bar.`,
  worked: `\`heights = [2, 1, 5, 6, 2, 3]\`, with a **sentinel** \`0\` appended at index 6. The stack is shown as
\`index:height\`, top on the right; heights along it never decrease.

| \`i\` | incoming \`h\` | Pops — each with \`height × (i − left)\` | Stack after (idx:h) | \`best\` |
|---|---|---|---|---|
| 0 | 2 | — | \`[0:2]\` | 0 |
| 1 | 1 | idx 0 (\`h=2\`), left = 0, width \`1−0=1\` → area 2 | \`[1:1]\` | 2 |
| 2 | 5 | — | \`[1:1, 2:5]\` | 2 |
| 3 | 6 | — | \`[1:1, 2:5, 3:6]\` | 2 |
| 4 | 2 | idx 3 (\`h=6\`), left = 3, width \`4−3=1\` → area 6;<br>idx 2 (\`h=5\`), left = 2, width \`4−2=2\` → area **10** | \`[1:1, 4:2]\` | **10** |
| 5 | 3 | — | \`[1:1, 4:2, 5:3]\` | 10 |
| 6 | **0 (sentinel)** | idx 5 (\`h=3\`), left = 5, width \`6−5=1\` → area 3;<br>idx 4 (\`h=2\`), left = 2, width \`6−2=4\` → area 8;<br>idx 1 (\`h=1\`), left = 0, width \`6−0=6\` → area 6 | \`[6:sentinel]\` | 10 |

Answer **10**, found at step 4 when bar 2's rectangle was closed by the arrival of the \`2\`.

Three things to take from that table. At step 4, popping index 3 then index 2 gives them *different*
left boundaries — \`3\` and \`2\` — because after index 3 leaves, the bar beneath it is index 2, and that
is what "the new stack top is the left boundary" means in practice. At step 6 the sentinel closes out
the three bars that were still waiting, including index 1, whose rectangle is the full six-wide span
— **none of these three had been measured before the sentinel arrived.** And the stack is
non-decreasing in every single row, which is the invariant that makes the left boundary lookup a
single array read.`,
  code: `SENTINEL_HEIGHT: int = 0  # <= every legal height, so it drains the stack completely


def largest_rectangle_monotonic_stack(heights: list[int]) -> int:
    best = 0
    st: list[int] = []  # indices of unfinished bars, heights non-decreasing
    for i, h in enumerate(heights + [SENTINEL_HEIGHT]):
        while st and heights[st[-1]] > h:
            height = heights[st.pop()]
            left = st[-1] + 1 if st else 0  # the bar below is the first shorter one on the left
            best = max(best, height * (i - left))
        st.append(i)
    return best`,
  codeNote: `\`heights + [SENTINEL_HEIGHT]\` builds a copy for the loop to walk, so the caller's list is never
mutated; the pops index the original \`heights\`, which the sentinel's own index never reaches because
nothing follows it.`,
  mistake: `Leaving out the sentinel and iterating over \`heights\` alone.

> **Watch out.** The misconception is that the loop **finishes the job** — that by the time you have
> read every bar, every bar has been priced. It has not. A bar is only ever measured when something
> shorter arrives to close it, so every bar still on the stack at the end has **never been measured**,
> and those are exactly the bars in the final non-decreasing run. Sentinel or explicit drain loop, you
> must do one of them.

This is the single most-missed detail in this problem, and it hides better than almost any bug in this
repo: run the no-sentinel variant on this document's worked example and it returns **10**, the correct
answer, because \`[2, 1, 5, 6, 2, 3]\` ends on a bar that gets popped anyway. Run it on \`[1, 2, 3, 4, 5]\`
and it returns **0** against a correct **9** — nothing ever pops, so no area is ever computed. On the
smallest legal input \`[5]\` it returns **0** against a correct **5**. A test set without an ascending
tail will pass this bug straight through.`,
  cost: `**Time \`O(n)\`, space \`O(n)\`.** Time is the amortised argument above — \`n\` pushes and at most \`n\` pops,
each \`O(1)\` — and it holds on every input, not on average. Space is the stack, and the bound is tight:
an ascending histogram like \`[1, 2, 3, …]\` pushes every index and pops nothing until the sentinel, so
all \`n\` indices are resident at once.

This is the answer to ship, and it is the ceiling of the monotonic-stack family — if you can derive
this one, \`daily-warmer\` and next-greater-element are the same loop with the comparison and the
payload changed. It is also a building block: **maximal rectangle in a binary matrix** is literally
this routine run once per row, over a running array of column heights, which turns a hard 2-D problem
into \`n\` calls to a function you already have.

---`,
  notes: [
    { title: "why it works", body: `> **Why it works.** Two separate claims, and both are needed.
>
> **The boundaries are correct.** When index \`j\` is popped by the arrival of index \`i\`, \`i\` is the
> first index to the right of \`j\` with a strictly smaller height — because every index between them
> was pushed and then popped by something no taller, and \`i\` is the first to undercut \`j\` itself. The
> new stack top is the **nearest index to the left of \`j\` that is strictly shorter**, because the
> stack is non-decreasing and everything between them has already been popped. So \`left = top + 1\` and
> the width \`i − left\` is exactly the maximal span at height \`heights[j]\`.
>
> **The linear-time claim.** There is a \`while\` inside a \`for\`, and one iteration can pop most of the
> array — step 6 above pops three — so the page looks quadratic. It is not. **Each index is pushed
> exactly once and popped at most once**, so the total number of pops across the whole run is bounded
> by \`n\`, however unevenly they clump. An expensive iteration is expensive only *because* the cheap
> ones before it did the pushing, and it cannot happen twice without \`n\` more pushes first. Total
> work: \`n\` pushes, at most \`n\` pops, \`O(1)\` each — \`O(n)\`.

The sentinel deserves its own line. The loop only ever measures a bar when something **shorter**
arrives, so any bar left on the stack at the end has never been measured at all. Appending a bar of
height \`0\` — legal precisely because heights are non-negative, so nothing is shorter — guarantees
every remaining bar is popped and priced before the loop exits.` },
  ],
}
