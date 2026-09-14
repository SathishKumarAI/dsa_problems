// fruit-baskets — approach 3 — A window that never shrinks, only slides.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "A window that never shrinks, only slides",
  idea: `*The window gains at most one new kind per step — so how many times can that inner loop actually
need to run?* Once. And more importantly: the answer is a **maximum**, so a window that has gone
illegal never needs to become legal again — it only needs to never grow wider than the widest legal
window already seen. Replace the \`while\` with a single \`if\`, drop \`best\` entirely, and read the
answer off the window's final width.

This fixes Approach 2's weakness — **an inner loop whose linearity must be argued for rather than
seen, plus a running maximum that duplicates information the window's own geometry already carries.**`,
  intuition: `> **Intuition.** Think of a frame of fixed width sliding along the row, rather than an elastic band
> stretching and snapping back. Each step the right edge advances one tree. If the window is still
> legal the frame **widens** by one; if it is not, the left edge advances too and the frame merely
> **slides** at its current width. So the frame never narrows, and its width at any moment is the
> widest legal window found so far. At the end the frame may well be holding an illegal window — that
> is allowed, and it is the part that feels wrong at first — but the *width* it is carrying was legal
> at some point, and no wider one ever existed.

> **Why it works.** Two claims, and the second is the one people distrust. **First**, one step adds at
> most one kind, so at most one corrective step is ever needed and the loop was never a loop. Let
> \`w = right - left + 1\` be the frame's width. \`right\` advances every step; \`left\` advances only when
> the window is illegal, so \`w\` never decreases, and it increases only on a step that ended legal.
> **Second**, the answer is a **maximum**. Every legal window the algorithm passes through is at most
> \`w\` wide at the moment it is passed, and \`w\` only ever takes values that were legal when they were
> reached — so \`w\` at the end equals the widest legal window in the whole row. There is no need to
> restore legality, because nothing is ever measured again: the frame is not a candidate answer, it is
> a **high-water mark** that happens to be shaped like a window. Ask instead for the *shortest*
> qualifying window, or for the indices the answer covers, and the frame becomes a lie — which is
> precisely why Approach 2 is the general one.`,
  worked: `\`fruits = [1, 2, 3, 2, 2]\`. There is no \`best\` column: the window's width **is** the running answer.

| \`right\` | kind added | \`counts\` after adding | over two kinds? | dropped from the left | \`left\` after | window | width |
|---|---|---|---|---|---|---|---|
| 0 | \`1\` | \`{1:1}\` | no | — | 0 | \`[0..0]\` | 1 |
| 1 | \`2\` | \`{1:1, 2:1}\` | no | — | 0 | \`[0..1]\` | 2 |
| 2 | \`3\` | \`{1:1, 2:1, 3:1}\` | **yes** | \`fruits[0]=1\` → count 0 → kind \`1\` deleted | 1 | \`[1..2]\` | 2 |
| 3 | \`2\` | \`{2:2, 3:1}\` | no | — | 1 | \`[1..3]\` | 3 |
| 4 | \`2\` | \`{2:3, 3:1}\` | no | — | 1 | \`[1..4]\` | **4** |

The answer is \`len(fruits) - left = 5 - 1 = 4\`. Read down the width column: \`1, 2, 2, 3, 4\` — it
never falls. Row 2 is the slide: the frame stayed two wide while both edges moved, which is exactly
what "never shrinks" looks like in practice.

Here is the same shape on a row where the frame ends up holding an illegal window, which is the case
worth seeing at least once. On \`fruits = [1, 1, 1, 2, 3]\` the frame reaches width 4 at \`right = 3\`
(the legal \`[1,1,1,2]\`), then the \`3\` arrives, the left edge steps once dropping a \`1\`, and the frame
ends as \`[1..4] = [1, 1, 2, 3]\` — three kinds, illegal, four wide. \`5 - 1 = 4\` is still the right
answer, because 4 was legal back when it was reached.`,
  code: `def fruit_baskets_non_shrinking(fruits: list[int]) -> int:
    counts: dict[int, int] = {}
    left = 0
    for right, kind in enumerate(fruits):
        counts[kind] = counts.get(kind, 0) + 1
        if len(counts) > 2:
            # one step only: the window slides rather than shrinking
            going = fruits[left]
            counts[going] -= 1
            if counts[going] == 0:
                del counts[going]
            left += 1
    return len(fruits) - left`,
  mistake: `> **Watch out.** The misconception is that \`while\` is the cautious choice and \`if\` is merely the
> optimization, so \`while\` must be safe in either version. It is not. \`while\` belongs with a tracked
> \`best\`; \`if\` belongs with \`len(fruits) - left\`. Each half is correct only with its own partner, and
> mixing them silently changes what the return value means.

Keeping the \`while\` from Approach 2 but returning \`len(fruits) - left\` makes the window genuinely
shrink back to legal at every violation, so the final width is the width of the **last** legal
window rather than the widest. On the worked example the bug is invisible — it still returns **4**,
because the last window happens to be the answer. Run it on \`fruits = [1, 1, 1, 2, 3]\` and it
returns **2** where the answer is **4**: the arrival of the \`3\` drives the left edge through all
three \`1\`s to index 3, leaving a two-wide window, and the four-wide \`[1,1,1,2]\` was discarded along
with the \`best\` variable that used to remember it.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. The time is linear by inspection now rather than by amortised
argument — one loop, a fixed amount of work per iteration, no inner loop to reason about. The space
is a map of at most three entries plus one integer; even \`best\` is gone.

Use it when you want the tightest loop and the question is purely "how wide is the widest". **State
the assumption it needs**: the answer must be a *maximum*, and only its *width* may be wanted. Break
either half — ask for the shortest qualifying window, ask which trees the answer covers, ask how many
maximal windows there are — and the frame is reporting a number about a window that is not legal. In
an interview, write Approach 2 and offer this as the tightening; that ordering shows you know which
one is general.

---`,
}
