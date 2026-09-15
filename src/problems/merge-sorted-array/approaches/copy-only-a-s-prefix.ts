// merge-sorted-array — approach 4 — Copy only `a`'s prefix
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
  rung: "copy-only-a-s-prefix",
  title: "Copy only `a`'s prefix",
  idea: `*The scratch array is \`m + n\` long, gets fully written and then fully copied back — so every value
is written twice, and \`n\` of the copied slots were empty padding to begin with. What actually needs
saving?* Only \`a\`'s own \`m\` live values, because they are the only things a forward write into \`a\`
can destroy. \`b\` is a separate array that nobody is writing to. So save just the prefix, then merge
that buffer with \`b\` **forward into \`a\` itself**. The buffer shrinks from \`m + n\` to \`m\` and the
copy-back disappears entirely.`,
  intuition: `> **Intuition.** Same two decks and the same comparison, but now you lift only \`a\`'s live cards off
> the table and rebuild the answer directly onto the space they came from. The freed row in front of
> you is exactly as long as the answer, and you fill it left to right. Nothing you write can hurt
> you, because everything \`a\` had is already in your hand.

> **Why it works.** The invariant is that **\`a\` holds nothing that is still needed**. Its live
> prefix was copied wholesale into \`left\` before the first write, so every read comes from \`left\` or
> from \`b\` and every write goes to \`a\` — reads and writes touch disjoint memory, and the direction
> of travel stops mattering. That is the entire reason this rung can fill forwards where the next one
> cannot; it bought the freedom with \`O(m)\` of copying.`,
  worked: `Input: \`a = [1, 2, 3, _, _, _]\`, \`m = 3\`, \`b = [2, 5, 6]\`, \`n = 3\`. Buffer \`left = [1, 2, 3]\`;
cursors \`i\` into \`left\`, \`j\` into \`b\`, \`w\` the write position in \`a\`.

| Step | \`i\` (value) | \`j\` (value) | Comparison | Write | \`a\` after |
|---|---|---|---|---|---|
| 0 | — | — | copy \`left ← a[:3] = [1, 2, 3]\` | — | \`[1, 2, 3, _, _, _]\` |
| 1 | 0 (\`1\`) | 0 (\`2\`) | \`1 <= 2\` → buffer | \`a[0] ← 1\`, \`i → 1\` | \`[1, 2, 3, _, _, _]\` |
| 2 | 1 (\`2\`) | 0 (\`2\`) | tie → buffer | \`a[1] ← 2\`, \`i → 2\` | \`[1, 2, 3, _, _, _]\` |
| 3 | 2 (\`3\`) | 0 (\`2\`) | \`3 > 2\` → \`b\` | \`a[2] ← 2\`, \`j → 1\` | \`[1, 2, 2, _, _, _]\` ← the \`3\` is overwritten |
| 4 | 2 (\`3\`) | 1 (\`5\`) | \`3 <= 5\` → buffer | \`a[3] ← 3\`, \`i → 3\` | \`[1, 2, 2, 3, _, _]\` |
| 5 | — (spent) | 1 (\`5\`) | buffer exhausted | \`a[4] ← 5\`, \`j → 2\` | \`[1, 2, 2, 3, 5, _]\` |
| 6 | — | 2 (\`6\`) | buffer exhausted | \`a[5] ← 6\`, \`j → 3\` | \`[1, 2, 2, 3, 5, 6]\` |

Step 3 is the one to stare at: \`a[2]\` — which held the \`3\` — is overwritten with a \`2\`. That would
have been catastrophic in the previous rung without a copy, and here it is harmless, because the
\`3\` is safely sitting in \`left\`. Six writes instead of twelve, and a buffer of 3 instead of 6.`,
  code: `def merge_sorted_array_copy_prefix(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    left = a[:m]  # only a's live values are ever at risk of being overwritten
    i, j = 0, 0
    for w in range(m + n):
        if j >= n or (i < m and left[i] <= b[j]):
            a[w] = left[i]
            i += 1
        else:
            a[w] = b[j]
            j += 1
    return a`,
  mistake: `> **Watch out.** The misconception is that the buffer should hold **\`a\`**. It should hold \`a\`'s
> *live prefix*. Copying the whole array drags the padding in as if it were data, and since padding
> is conventionally zero, those zeros are smaller than most real values and get merged in first.

Writing \`left = a[:]\` or \`left = list(a)\` also breaks the merge's own precondition — \`[1, 2, 3, 0,
0, 0]\` is not a sorted run — so the algorithm is being fed an input it is not allowed to assume.
Measured on the worked example, the result is **\`[1, 2, 2, 3, 0, 0]\`**: the two real values \`5\` and
\`6\` are dropped and two padding zeros are promoted into the answer.

The bound that matters is \`m\`, never \`len(a)\`, and every loop condition in this approach must test
\`i < m\` rather than \`i < len(left)\`.`,
  cost: `**Time** \`O(m + n)\`, **space** \`O(m)\`. One comparison and one write per output slot with no
copy-back pass, so strictly **half** the writes of the scratch version. The memory is the saved
prefix, as big as \`a\`'s live portion and no bigger.

This is genuinely the best you can do when the spare room is in the *wrong place* — if \`a\` had its
padding at the front rather than the back, or if you were merging into a buffer that overlapped
only partially, this is the shape that survives. It is also the honest answer when \`m\` is small
and \`n\` is huge, because then \`O(m)\` extra memory is nearly nothing. Here it is one rung short,
because the padding is at the back and that fact makes even \`O(m)\` unnecessary.

---`,
}
