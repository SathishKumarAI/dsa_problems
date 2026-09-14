// merge-sorted-array — approach 2 — Append and sort
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
  rung: "append-and-sort",
  title: "Append and sort",
  idea: `*Inserting one at a time re-shifts a growing tail for every value of \`b\` — can the shifting be
skipped?* Yes, by not caring about order while copying. Dump \`b\`'s values into \`a\`'s padding
slots in whatever order they arrive, then hand the whole array to a sort and let it work out the
interleaving. This fixes the previous rung's weakness exactly: there is no scan-and-shift per
value, just \`n\` blind writes and one library call.`,
  intuition: `> **Intuition.** Tip both piles of paper into one heap and put the heap through the sorting machine.
> You are deliberately throwing away the one useful fact you had — that each pile arrived already
> ordered — in exchange for never having to think about the interleaving at all.
>
> It is the shortest code in this document by a wide margin, almost impossible to get wrong, and the
> right instinct in most real programs. It is also the rung a merge exists to improve on: the sort
> spends \`log(m + n)\` comparisons per element rediscovering an order that was sitting in front of
> it.`,
  worked: `Input: \`a = [1, 2, 3, _, _, _]\`, \`m = 3\`, \`b = [2, 5, 6]\`, \`n = 3\`.

| Step | Action | \`a\` after |
|---|---|---|
| 1 | \`a[3] ← b[0] = 2\` | \`[1, 2, 3, 2, _, _]\` |
| 2 | \`a[4] ← b[1] = 5\` | \`[1, 2, 3, 2, 5, _]\` |
| 3 | \`a[5] ← b[2] = 6\` | \`[1, 2, 3, 2, 5, 6]\` |
| 4 | \`a.sort()\` | \`[1, 2, 2, 3, 5, 6]\` |

Three writes and one sort. There are no cursors to trace in step 4, which is precisely the
approach's appeal and precisely what it costs you.`,
  code: `def merge_sorted_array_append_and_sort(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    for j in range(n):
        a[m + j] = b[j]  # overwrite the padding; do NOT append past the end
    a.sort()
    return a`,
  mistake: `> **Watch out.** The misconception is that \`a\` is a list with \`m\` things in it, so \`b\` has to be
> **added** to it. \`a\` is a list with \`m + n\` slots, \`n\` of them reserved for exactly this. Space to
> be *filled*, not a prefix to be appended after.

Writing \`a.extend(b)\` (or \`a += b\`) makes the array \`m + 2n\` long with the \`n\` padding zeros still
inside it, and the sort then scatters phantom zeros through the answer. Measured on the worked
example: \`[1, 2, 3, 0, 0, 0]\` plus \`[2, 5, 6]\` gives **\`[0, 0, 0, 1, 2, 2, 3, 5, 6]\`** instead of
\`[1, 2, 2, 3, 5, 6]\`.

> **Watch out.** The second misconception is that computing the right answer and *delivering* it
> are the same act. In an in-place problem the return value is not the deliverable; the caller's
> array is.

Rebinding the name — \`a = sorted(a[:m] + b)\` — is the same bug in a different costume. Measured: it
returns the perfectly correct **\`[1, 2, 2, 3, 5, 6]\`** while the caller's array is still
**\`[1, 2, 3, 0, 0, 0]\`**, untouched. In a language whose signature returns \`void\` the same mistake
produces silence and a wrong array.`,
  cost: `**Time** \`O((m + n) log(m + n))\`, **space** \`O(1)\` in principle. The time is dominated by the sort;
the \`n\` copies are linear and vanish into it.

The space claim deserves an asterisk. The \`n\` writes allocate nothing, but whether the **sort** is
in place is a property of the language: C++'s \`std::sort\` is, Java's primitive sort is, and Python's
Timsort uses up to \`O(n)\` auxiliary memory in the worst case. If a space bound is being enforced
strictly, say that out loud rather than claiming \`O(1)\` and hoping.

Use it in production code where \`m + n\` is small and clarity beats constant factors — it is two
lines and cannot be got wrong in an interesting way. Use it in an interview as the thing you offer
*and then immediately improve*, naming what it wasted: both halves were already sorted, and the
sort paid a log factor to learn that again.

---`,
}
