// merge-sorted-array — approach 1 — Insert one at a time
//
// Converted from docs/deep/merge-sorted-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "insert-one-at-a-time",
  title: "Insert one at a time",
  idea: `*How do I get \`b\`'s values into \`a\` while keeping everything sorted?* Take them one at a time. For
each value of \`b\`, walk \`a\`'s live prefix until you find the spot it belongs, slide everything from
that spot rightwards by one to open a gap, and drop the value in. *Where does the room for the
slide come from?* The padding — each insertion consumes exactly one padding slot, and the live
length grows by one. This is insertion sort's inner step, applied \`n\` times.`,
  intuition: `> **Intuition.** Filing paper into a ring binder that already has the right number of blank pages
> at the back. For each new sheet you flick through from the front until you reach the point it
> belongs, shove every sheet from there onward back one position to open a slot, and drop it in.
>
> The filing is always correct and it is always **expensive**, because moving one sheet into the
> middle means touching every sheet behind it. The cost you should feel in your hands is the same
> sheets being shoved back again and again — \`a\`'s largest value moves once for every insertion
> that lands before it.`,
  worked: `Input: \`a = [1, 2, 3, _, _, _]\` with \`m = 3\`, \`b = [2, 5, 6]\` with \`n = 3\`. Underscores are padding.
Every approach in this document traces this same input.

| Insert | Value | \`live\` before | Scan finds slot | Shifts | \`a\` after | \`live\` after |
|---|---|---|---|---|---|---|
| 1 | \`2\` | 3 | index 2 (after \`a\`'s own \`2\`, before \`3\`) | \`a[3] ← a[2]\` (the \`3\` moves right) | \`[1, 2, 2, 3, _, _]\` | 4 |
| 2 | \`5\` | 4 | index 4 (past everything live) | none | \`[1, 2, 2, 3, 5, _]\` | 5 |
| 3 | \`6\` | 5 | index 5 (past everything live) | none | \`[1, 2, 2, 3, 5, 6]\` | 6 |

Result \`[1, 2, 2, 3, 5, 6]\`. This example is kind to the approach — only one value had to move.

Feed it \`a = [4, 5, 6, _, _, _]\`, \`b = [1, 2, 3]\` instead and every insertion lands near the front,
shifting most of the live tail each time: **9** shift-moves to place three values, measured by
counting them. Worth being precise about why it is 9 and not \`3 + 4 + 5 = 12\`: after the first
insertion the already-placed small values sit *in front* of the next one, so \`at\` is no longer \`0\`
and the tail being shoved is one shorter than the live length each time — \`3 + 3 + 3\`.`,
  code: `def merge_sorted_array_insert_one_at_a_time(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    live = m  # how many real values a currently holds
    for j in range(n):
        at = 0
        while at < live and a[at] <= b[j]:
            at += 1
        for k in range(live, at, -1):  # open a gap by sliding the tail right
            a[k] = a[k - 1]
        a[at] = b[j]
        live += 1
    return a`,
  mistake: `> **Watch out.** The misconception is that a shift is a **set** of independent copies, so the order
> you perform them in is a matter of taste. It is not: consecutive copies overlap, and going
> left-to-right means every step reads a cell the previous step already overwrote. A shift right
> must run **right-to-left**, from the far end back toward the gap, so each cell is read before it
> is written.

Writing the slide as \`for k in range(at, live): a[k + 1] = a[k]\` smears \`a[at]\` along the tail
instead of moving it. The trap is how *quietly* it does that. On this document's own worked example
the buggy version returns the fully correct \`[1, 2, 2, 3, 5, 6]\` — because every shift there is
exactly one cell long, and a one-cell shift cannot smear.

It needs a tail of two or more to show. Measured on \`a = [1, 2, 3, 4, _, _]\` with \`m = 4\`,
inserting \`b = [2]\`: the buggy slide gives **\`[1, 2, 2, 3, 3, 0]\`**, where the \`4\` has been
overwritten by a duplicated \`3\`, against the correct \`[1, 2, 2, 3, 4]\`. The smallest failing input
at all is \`a = [1, 2, _]\`, \`m = 2\`, \`b = [0]\` — **\`[0, 1, 1]\`** instead of \`[0, 1, 2]\`.

This is the same "which direction is safe" question the last approach answers on a larger scale, and
it is worth noticing that the naive rung already contains it.`,
  cost: `**Time** \`O(n · (m + n))\`, **space** \`O(1)\`. Each of the \`n\` values from \`b\` does a linear scan to
find its position and then shifts up to the whole live tail, and that tail grows to \`m + n\`. Space
is three integers — all the shifting happens inside \`a\`, so nothing is allocated.

It is the right choice in one situation: when \`n\` is very small compared to \`m\`, and especially
when \`n\` is 1. Inserting a single value into a mostly-sorted array is genuinely cheaper as one
scan-and-shift than as a full merge, and it is what you would write by hand. For \`n\` of any real
size the shifting is pure motion with no comparisons in it — bookkeeping the next rung deletes
entirely.

---`,
}
