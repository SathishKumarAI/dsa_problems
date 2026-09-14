// merge-sorted-array — approach 3 — Merge into a scratch array
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
  rung: "merge-into-a-scratch-array",
  title: "Merge into a scratch array",
  idea: `*The sort throws away the one fact the input hands you for free — both halves are already ordered.
Can that be exploited?* Yes, with a textbook merge: keep a cursor at the front of each sorted run,
compare the two values they point at, write the smaller into the output and advance that cursor.
Each comparison places one value permanently, so the whole thing is linear instead of
\`log\`-factored. *Where does the output go?* Into a brand new array of size \`m + n\`, then copied
back over \`a\` at the end.`,
  intuition: `> **Intuition.** Two sorted decks of cards face up, and one empty space to build the result in.
> Look at the top card of each deck, take the smaller, place it, look again. When one deck runs out,
> the other is already in order and can be poured straight down.
>
> The problem is the empty space. You have borrowed a whole extra table to work on, and half of it
> is holding values that already sit in \`a\`.

> **Why it works.** The invariant is that **the smaller of the two exposed values is the smallest
> value remaining anywhere**. Each deck is sorted, so every card still buried under a cursor is at
> least as large as the card on top of it; the minimum of the whole remainder therefore has to be one
> of the two tops, and taking the smaller one places it permanently. There is never a reason to look
> deeper into either run, which is why one comparison retires one value and the whole merge is
> linear rather than \`log\`-factored.`,
  worked: `Input: \`a = [1, 2, 3, _, _, _]\`, \`m = 3\`, \`b = [2, 5, 6]\`, \`n = 3\`. Cursors \`i\` into \`a\`'s live
prefix, \`j\` into \`b\`, \`w\` into the scratch array \`out\`.

| Step | \`i\` (value) | \`j\` (value) | Comparison | Write | \`out\` after |
|---|---|---|---|---|---|
| 1 | 0 (\`1\`) | 0 (\`2\`) | \`1 <= 2\` → take \`a\` | \`out[0] ← 1\`, \`i → 1\` | \`[1, _, _, _, _, _]\` |
| 2 | 1 (\`2\`) | 0 (\`2\`) | \`2 <= 2\` → tie, take \`a\` | \`out[1] ← 2\`, \`i → 2\` | \`[1, 2, _, _, _, _]\` |
| 3 | 2 (\`3\`) | 0 (\`2\`) | \`3 > 2\` → take \`b\` | \`out[2] ← 2\`, \`j → 1\` | \`[1, 2, 2, _, _, _]\` |
| 4 | 2 (\`3\`) | 1 (\`5\`) | \`3 <= 5\` → take \`a\` | \`out[3] ← 3\`, \`i → 3\` | \`[1, 2, 2, 3, _, _]\` |
| 5 | — (\`a\` spent) | 1 (\`5\`) | \`a\` exhausted → take \`b\` | \`out[4] ← 5\`, \`j → 2\` | \`[1, 2, 2, 3, 5, _]\` |
| 6 | — | 2 (\`6\`) | \`a\` exhausted → take \`b\` | \`out[5] ← 6\`, \`j → 3\` | \`[1, 2, 2, 3, 5, 6]\` |

Then a second loop copies all six values from \`out\` back over \`a\`. Twelve writes in total to place
six values.`,
  code: `def merge_sorted_array_scratch_merge(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    out = [0] * (m + n)
    i, j = 0, 0
    for w in range(m + n):
        if j >= n or (i < m and a[i] <= b[j]):
            out[w] = a[i]
            i += 1
        else:
            out[w] = b[j]
            j += 1
    for w in range(m + n):
        a[w] = out[w]
    return a`,
  mistake: `> **Watch out.** The misconception is that \`or\` is **symmetric**, so the two halves of the condition
> can go in either order. In a short-circuiting language it is not symmetric at all: the left half is
> always evaluated, so a bounds test placed second is a bounds test that never protects anything.

Writing the condition as \`if a[i] <= b[j] or j >= n\` indexes before it checks. It fails two
different ways depending on the input, and the quieter one is worse:

| Input | What the broken order does | Correct |
|---|---|---|
| the worked example, \`a = [1, 2, 3, _, _, _]\`, \`b = [2, 5, 6]\` | silently returns **\`[1, 2, 2, 3, 0, 0]\`** — it runs off \`a\`'s live prefix into the padding and merges the zeros | \`[1, 2, 2, 3, 5, 6]\` |
| \`a = [4, 5, 6, _, _, _]\`, \`b = [1, 2, 3]\` | raises **\`IndexError: list index out of range\`** | \`[1, 2, 3, 4, 5, 6]\` |
| smallest failing input, \`a = [_]\`, \`m = 0\`, \`b = [1]\` | silently returns **\`[0]\`** | \`[1]\` |

So "it crashes" is only half the story, and the half that does not crash is the dangerous one. The
exhaustion tests must come **first**, short-circuiting before any indexing: \`j >= n or (i < m and
a[i] <= b[j])\` reads as *"if \`b\` has nothing left, take from \`a\`; otherwise take from \`a\` only if it
has something and that something is not larger."*

> **Watch out.** The second misconception is that a function returning the right value has done its
> job. Here the deliverable is the caller's array, not the return value.

Forgetting the copy-back loop and returning \`out\` hands back a correct-looking
**\`[1, 2, 2, 3, 5, 6]\`** while the caller's array is still **\`[1, 2, 3, 0, 0, 0]\`** — measured. The
function has not merged in place, it has computed the answer somewhere else.`,
  cost: `**Time** \`O(m + n)\`, **space** \`O(m + n)\`. Every value is compared once and written **twice** —
once into the scratch array, once on the way back — so the time is two linear passes. The space is
the scratch array, exactly the size of the finished result.

This is the right shape whenever you are merging two sorted runs and you *do* have somewhere to
put the answer: it is the merge step of merge sort, it is what \`heapq.merge\` and \`std::merge\` do,
and outside this artificial "we gave you spare room" framing it is the standard answer. Its only
sin here is that the problem handed you spare room and you ignored it.

---`,
}
