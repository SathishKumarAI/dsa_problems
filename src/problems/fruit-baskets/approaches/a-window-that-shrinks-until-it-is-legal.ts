// fruit-baskets — approach 2 — A window that shrinks until it is legal.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "a-window-that-shrinks-until-it-is-legal",
  title: "A window that shrinks until it is legal",
  idea: `*Every start re-walks the run its predecessor already walked — can one walk serve them all?* Yes.
Keep a single window with a count for each kind inside it. Push the right edge forward one tree at a
time; whenever the window holds three kinds, pull the left edge forward until one of them is gone
entirely. Record the widest legal width you ever hold.

This fixes Approach 1's weakness — **it restarts the walk at every tree, so overlapping runs are
re-walked from scratch.**`,
  intuition: `> **Intuition.** One elastic band stretched over a stretch of the row, instead of a fresh walk per
> tree. The right hand always moves right, adding a tree. When a third kind appears the window is
> illegal, so the left hand pulls in — one tree at a time, decrementing that kind's count — until some
> kind's count hits zero and that kind genuinely disappears from the window. Then you measure and
> carry on. Both hands only ever travel rightwards, so although the code has a loop inside a loop,
> each tree is entered once and left at most once and the total work is linear.`,
  worked: `\`fruits = [1, 2, 3, 2, 2]\`. The \`counts\` column is the live map of what is inside the window.

| \`right\` | kind added | \`counts\` after adding | illegal? shrink… | \`left\` after | window | width | best |
|---|---|---|---|---|---|---|---|
| 0 | \`1\` | \`{1:1}\` | no | 0 | \`[0..0]\` | 1 | 1 |
| 1 | \`2\` | \`{1:1, 2:1}\` | no | 0 | \`[0..1]\` | 2 | 2 |
| 2 | \`3\` | \`{1:1, 2:1, 3:1}\` | **yes** — drop \`fruits[0]=1\`, its count hits 0, kind \`1\` is deleted | 1 | \`[1..2]\` | 2 | 2 |
| 3 | \`2\` | \`{2:2, 3:1}\` | no | 1 | \`[1..3]\` | 3 | 3 |
| 4 | \`2\` | \`{2:3, 3:1}\` | no | 1 | \`[1..4]\` | **4** | **4** |

The answer is 4. Five right-edge steps and exactly one left-edge step, against the brute force's
thirteen tree-visits. Row 2 is the corner case the example exists for: the window lands on
\`[1..2]\`, keeping the \`2\` at index 1, so when the trailing \`2\`s arrive the run stretches to four. A
solution that had jumped to index 3 — just past the offending \`3\` — would top out at 2.`,
  code: `def fruit_baskets_shrinking_window(fruits: list[int]) -> int:
    counts: dict[int, int] = {}
    best = 0
    left = 0
    for right, kind in enumerate(fruits):
        counts[kind] = counts.get(kind, 0) + 1
        while len(counts) > 2:
            going = fruits[left]
            counts[going] -= 1
            if counts[going] == 0:
                del counts[going]  # a kind leaves only when its COUNT hits zero
            left += 1
        best = max(best, right - left + 1)
    return best`,
  codeNote: `\`len(counts)\` is the number of distinct kinds in the window, and it is trustworthy only because the
\`del\` is guarded by the zero check. That single guarded line is the invariant of the whole approach.`,
  mistake: `> **Watch out.** The misconception is that a kind **leaves** the window when one of its fruits slides
> out the back. It leaves when its **count** reaches zero. \`del counts[going]\` without the
> \`== 0\` guard — or a \`set\` of present kinds instead of a map of counts — removes a kind the window is
> still full of.

On the worked example this bug is completely **invisible**: it still returns **4**, because no kind
in \`[1, 2, 3, 2, 2]\` has a second copy left behind when its first copy is evicted. That invisibility
is the danger — it passes the example you were given. Run it on \`fruits = [1, 2, 1, 3, 3, 3]\` and it
returns **5** where the answer is **4**: at the moment the \`3\` arrives it drops the \`1\` at index 0
and deletes kind \`1\` from the map, even though the \`1\` at index 2 is still inside the window. From
there the map claims two kinds while the window really holds three, and the final five-wide window
\`[2, 1, 3, 3, 3]\` is certified legal.

The general form is worth carrying: whenever a window's membership is tracked by a container, the
container is a **multiset**, not a set. Anything that can enter twice must leave twice.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. The time is linear by an amortised argument, not by inspection:
each tree is added by the right edge exactly once and removed by the left edge at most once, so the
inner \`while\` is the left edge's share of a single forward journey and both edges together take at
most \`2n\` steps. The space is the \`counts\` map, which never holds more than three entries at once —
constant, even though the kinds themselves are unbounded in value.

**This is the rung to write in an interview.** It is the general, honest form of the technique: grow
on the right, restore legality on the left, measure while legal. Change \`2\` to \`K\` and it is
at-most-\`K\`-distinct with no other edit. Change \`max\` to \`min\`, or ask *which* trees the answer
covers, and this version still works while the next one quietly does not.

---`,
}
