// merge-sorted-array — approach 5 — Backward two pointers (optimal)
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
  rung: "optimal",
  title: "Backward two pointers (optimal)",
  idea: `*The prefix copy exists solely because writing forward into \`a[0]\` would land on a live value of
\`a\` that has not been placed yet. Is that a fact about the problem, or about the direction of
travel?* The direction. Turn around. Start the write cursor on \`a\`'s **last** slot — which is
padding, so writing there destroys nothing — and fill the answer from the largest value down to
the smallest. Every subsequent write moves further left into a cell that has *just been vacated*
by the value it held. The buffer becomes unnecessary and the merge runs with no scratch memory at
all.`,
  intuition: `> **Intuition.** Loading a van, working from the far wall forward. The heaviest crate goes in
> first, against the back of the van, and each lighter one stacks in front of it — so you are always
> putting something down in space that is already clear, and you never have to shuffle a crate you
> have already placed. The van's empty half is at the back; that is why you start at the back.
>
> Three cursors on the same row of boxes: \`i\` on the last live value of \`a\`, \`j\` on the last value
> of \`b\`, and \`w\` on the last box of all. The larger of the two values under \`i\` and \`j\` is the
> largest value not yet placed anywhere, so it belongs in box \`w\`. Write it, step that value's
> cursor back, step \`w\` back.

> **Why it works.** Two claims, and the second is the one that makes it legal.
>
> **Correctness:** the larger of the two exposed values is the maximum of everything unplaced, by
> the same argument as the forward merge read in a mirror — so writing it into the highest unfilled
> slot is right, and one comparison retires one value.
>
> **Safety:** the write cursor is **always strictly to the right of \`a\`'s read cursor**, \`w > i\`.
> Both start at \`w = m + n − 1\` and \`i = m − 1\`, so the gap starts at \`n\`; each step decrements \`w\`
> and decrements at most one of \`i\` or \`j\`, so the gap \`w − i\` equals the number of \`b\`'s values
> already placed and can only grow. Every cell \`w\` lands on is therefore original padding or a cell
> whose value has already been copied to its final home — never a live value still waiting its turn.
> Fill **forwards** instead and the very first write is \`a[0] ←\`, landing on a live value with
> \`w = i = 0\`: the inequality fails at step one, which is exactly why the previous two rungs needed
> a buffer.`,
  worked: `Input: \`a = [1, 2, 3, _, _, _]\`, \`m = 3\`, \`b = [2, 5, 6]\`, \`n = 3\`. Start \`i = 2\`, \`j = 2\`, \`w = 5\`.

| Step | \`i\` (value) | \`j\` (value) | Larger | Write | \`a\` after | \`w\` after |
|---|---|---|---|---|---|---|
| start | 2 (\`3\`) | 2 (\`6\`) | — | — | \`[1, 2, 3, _, _, _]\` | 5 |
| 1 | 2 (\`3\`) | 2 (\`6\`) | \`b\`'s \`6\` | \`a[5] ← 6\`, \`j → 1\` | \`[1, 2, 3, _, _, 6]\` | 4 |
| 2 | 2 (\`3\`) | 1 (\`5\`) | \`b\`'s \`5\` | \`a[4] ← 5\`, \`j → 0\` | \`[1, 2, 3, _, 5, 6]\` | 3 |
| 3 | 2 (\`3\`) | 0 (\`2\`) | \`a\`'s \`3\` | \`a[3] ← 3\`, \`i → 1\` | \`[1, 2, 3, 3, 5, 6]\` | 2 |
| 4 | 1 (\`2\`) | 0 (\`2\`) | tie → take \`b\` | \`a[2] ← 2\`, \`j → -1\` | \`[1, 2, 2, 3, 5, 6]\` | 1 |

\`j\` has reached \`-1\`, so the loop stops — with \`a[0]\` and \`a[1]\` never touched at all. They did not
need to be: whatever remains of \`a\` when \`b\` runs dry is already sitting exactly where it belongs,
because everything smaller than it has already been placed to its left and everything larger has
been moved to its right. That early stop is not an optimisation bolted on, it is the loop
condition.

Watch step 3 in particular. \`a[3]\` is written while \`i\` is still on index 2 — the write cursor is
one slot to the *right* of the read cursor, which is the invariant doing all the work. In step 4
the gap is two, and it is exactly the two values of \`b\` (the \`5\` and the \`6\`) already placed.`,
  code: `def merge_sorted_array_backward_two_pointers(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    i, j, write = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and a[i] > b[j]:  # i may be -1 when a is pure padding
            a[write] = a[i]
            i -= 1
        else:
            a[write] = b[j]
            j -= 1
        write -= 1
    return a  # when j runs dry, a[0..i] is already in its final position`,
  mistake: `> **Watch out.** The misconception is that \`i >= 0\` protects against an **out-of-range read**. In
> Python there is no out-of-range read to protect against — \`a[-1]\` is the perfectly legal *last*
> element of the array, which at that moment holds the largest value you have already placed. The
> guard is not there to stop a crash; it is there to stop \`a\` being compared against a value that is
> no longer input.

Drop the guard and the comparison wrongly succeeds, that already-placed value is copied a second
time, and \`i\` keeps walking negative while \`j\` stands still — so the loop cannot end. Measured over
every input up to \`m + n = 6\`: the unguarded version either returns the right answer or raises
**\`IndexError: list index out of range\`**, in 1082 of the cases tried, and **never once** returns a
silently wrong array.

That last point corrects a tempting way to state this. It is *not* true that \`a = [0]\`, \`m = 0\`,
\`b = [1]\`, \`n = 1\` exposes the bug — measured, that input returns **\`[1]\`** with the guard and
**\`[1]\`** without it, because \`a[-1] = 0\` is not greater than \`1\`, so the \`else\` branch runs and
happens to be right. The smallest input that actually breaks it is \`a = [_, _]\`, \`m = 0\`,
\`b = [0, 1]\`, \`n = 2\`, which raises \`IndexError\`. In Java and C++ the same line is a genuine
out-of-bounds read, and there it *can* be silent garbage.

> **Watch out.** The second misconception is that the loop should stop when **either** array runs
> dry, because a merge needs two things to compare. It needs to stop when \`b\` runs dry, and only
> then — whatever is left of \`a\` is already home, but whatever is left of \`b\` still has to be moved.

Looping \`while i >= 0 and j >= 0\` leaves the drain out. Measured on the all-of-\`b\`-is-smaller case
\`a = [4, 5, 6, _, _, _]\`, \`b = [1, 2, 3]\`: it returns **\`[4, 5, 6, 4, 5, 6]\`** instead of
\`[1, 2, 3, 4, 5, 6]\` — \`a\`'s values duplicated into the padding and every value of \`b\` lost. On the
worked example it returns the correct \`[1, 2, 2, 3, 5, 6]\`, which is why this one survives casual
testing. Looping on \`j >= 0\` alone makes the drain automatic (the \`else\` branch handles it) and makes
the *other* leftover case free, because the rest of \`a\` needs no work at all.`,
  cost: `**Time** \`O(m + n)\`, **space** \`O(1)\`. Each iteration writes one output slot and retires one input
value, and no cursor ever reverses, so the loop runs at most \`m + n\` times — often fewer, since it
stops the moment \`b\` is exhausted. Space is three integers, whatever the size of the arrays.

This is the intended answer, and the reason to know it is not this problem — it is the move. **When
in-place writing collides with reading, reverse the direction of travel.** The same trick is what
makes \`memmove\` safe for overlapping regions, what lets you shift an array right without a buffer,
what makes in-place string expansion (replacing every space with \`%20\`, say) work in one pass, and
what underlies any "fill from the end because the end is where the free room is" algorithm. Reach
for it the moment you notice that the output is larger than the input and the extra space is at
the back.

---`,
}
