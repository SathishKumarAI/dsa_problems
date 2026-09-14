// sort-colors — approach 2 — Dutch national flag, three pointers (optimal)
//
// Converted from docs/deep/sort-colors_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "pointers",
  title: "Dutch national flag, three pointers (optimal)",
  idea: `*Counting is linear, so what is left to improve?* Two things. It reads the array twice, and it
produces the answer by overwriting rather than moving — so it cannot be used when the elements
carry anything beyond their colour. *Can I place every element correctly while seeing it only
once?* Yes, if instead of counting you carve the array into three growing regions and, for each
element you examine, immediately swap it into the region where it belongs. This fixes both of the
previous approach's weaknesses at once: one pass, and every element that ends up somewhere is the
*original* element, moved, not a replacement written on top of it.`,
  intuition: `Picture three regions growing from both ends and the middle. A settled block of zeroes grows
rightward from the left edge. A settled block of twos grows leftward from the right edge. Between
them sits a block of settled ones, and beyond that — squeezed between the ones and the twos — is
the shrinking region of elements nobody has looked at yet. A cursor sits at the front of that
unknown region and picks up one element at a time: a zero gets thrown down to the left block, a two
gets thrown up to the right block, and a one is already exactly where it should be. Every step
shrinks the unknown region by one, so the whole thing finishes when the unknown region is empty.`,
  worked: `Input: \`nums = [2, 0, 2, 1, 1, 0]\` — the same array approach 1 rewrote.

Start: \`low = 0\`, \`mid = 0\`, \`high = 5\`, array \`[2, 0, 2, 1, 1, 0]\`.

| Step | \`nums[mid]\` | Action | \`low\` | \`mid\` | \`high\` | Array after |
|---|---|---|---|---|---|---|
| 1 | \`2\` (at index 0) | swap indices 0 and 5; \`high\` retreats; **\`mid\` stays** | 0 | 0 | 4 | \`[0, 0, 2, 1, 1, 2]\` |
| 2 | \`0\` (at index 0 — the value just swapped in) | swap indices 0 and 0 (a no-op); both advance | 1 | 1 | 4 | \`[0, 0, 2, 1, 1, 2]\` |
| 3 | \`0\` (at index 1) | swap indices 1 and 1 (a no-op); both advance | 2 | 2 | 4 | \`[0, 0, 2, 1, 1, 2]\` |
| 4 | \`2\` (at index 2) | swap indices 2 and 4; \`high\` retreats; **\`mid\` stays** | 2 | 2 | 3 | \`[0, 0, 1, 1, 2, 2]\` |
| 5 | \`1\` (at index 2 — swapped in from index 4) | already correct; only \`mid\` advances | 2 | 3 | 3 | \`[0, 0, 1, 1, 2, 2]\` |
| 6 | \`1\` (at index 3) | already correct; only \`mid\` advances | 2 | 4 | 3 | \`[0, 0, 1, 1, 2, 2]\` |
| end | — | \`mid = 4 > high = 3\`, loop ends | 2 | 4 | 3 | \`[0, 0, 1, 1, 2, 2]\` |

Six iterations for six elements — exactly one pass, which is the claim. And steps 1 → 2 are the
asymmetry made concrete: step 1 swapped a \`2\` out to the back and got a \`0\` in return, and because
\`mid\` did not advance, step 2 immediately caught that \`0\` and sent it to the front. Had \`mid\`
advanced at step 1, the array would have been left as \`[0, 0, 2, 1, 1, 2]\` with a stranded zero at
index 0 that never gets claimed by the zeroes region — and the final answer would have been
\`[0, 0, 1, 1, 2, 2]\` only by luck of this particular input. Try it on \`[2, 0]\`: with the wrong
advance, step 1 swaps to \`[0, 2]\` and moves \`mid\` to 1, \`high\` is now 0, the loop ends, and the
answer is \`[0, 2]\` — which happens to be right. Try \`[2, 2, 0]\`: the wrong version gives
\`[0, 2, 2]\`, also right. The bug is genuinely hard to trigger on small inputs, which is why the
stress test at the bottom of this file runs four thousand random arrays rather than four.

Verify the invariant at step 5, where \`low = 2\`, \`mid = 2\`, \`high = 3\`, array \`[0, 0, 1, 1, 2, 2]\`:
indices \`0..1\` are zeroes ✓; indices \`2..1\` (the settled-ones stretch) are empty ✓; indices \`2..3\`
are unexamined — and they do happen to hold ones, but the algorithm does not know that yet ✓;
indices \`4..5\` are twos ✓.`,
  code: `def sort_colors_dutch_flag(nums: list[int]) -> list[int]:
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:  # <= , not < : when they meet there is still one unexamined element
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 2:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1  # mid does NOT advance: the value swapped in is unexamined
        else:
            mid += 1
    return nums`,
  mistake: `Advancing \`mid\` after a swap with \`high\`:

\`\`\`python
elif nums[mid] == 2:
    nums[mid], nums[high] = nums[high], nums[mid]
    high -= 1
    mid += 1        # WRONG
\`\`\`

The value that just arrived at \`mid\` came from the unexamined region and has never been
classified. If it is a \`0\`, it is now stranded in the middle stretch — which the invariant claims
holds only ones — and nothing will ever move it to the front. On \`[2, 0, 2, 1, 1, 0]\` the wrong
version returns \`[0, 0, 1, 1, 2, 2]\` anyway, which is why hand-testing the examples does not catch
it; on \`[1, 2, 0]\` it returns \`[1, 0, 2]\`, which is plainly wrong. The rule, stated so it is
memorable: **the cursor advances only when it has finished with the value under it, and after a
high-side swap it has not even started.**

The mirror error — *not* advancing \`mid\` after a low-side swap — is an infinite loop rather than a
wrong answer, because the same zero gets swapped with itself forever once \`low == mid\`.`,
  cost: `**Time O(n), space O(1).** Every iteration of the loop either advances \`mid\` or retreats \`high\`, and
the two can only move toward each other, so the loop body runs at most n times — one pass, with a
constant number of array accesses per element. Space is three integers; the swaps happen inside the
caller's array.

This is the right choice when you need a genuine single pass, when the data is large enough that
two traversals cost real cache time, or — the case that actually matters outside interviews — when
the elements carry a payload and must be *moved* rather than *rewritten*. It is also the routine
that makes quicksort robust: a three-way partition on the pivot (\`< pivot\`, \`== pivot\`, \`> pivot\`)
is exactly this loop, and it is what stops quicksort degrading to quadratic time on arrays with
many equal keys. Learning it here, on an array of three colours, is learning it in the easiest
place it ever appears.

---`,
  notes: [
    { title: "the invariant, in prose", body: `This is the part that has to be said in words, because the code is four lines and the reason it
works is not visible in them. Three indices — \`low\`, \`mid\`, \`high\` — divide the array into four
stretches, and at every single moment of the loop, all four of these statements are true:

- **Everything before \`low\` is a \`0\`.** Indices \`0 .. low-1\` are settled zeroes and will never be
  touched again.
- **Everything from \`low\` up to but not including \`mid\` is a \`1\`.** These are settled ones. This
  stretch can be empty, and at the start it is.
- **Everything from \`mid\` to \`high\` is unexamined.** Nobody has looked at these yet. This is the
  region that shrinks.
- **Everything after \`high\` is a \`2\`.** Indices \`high+1 .. n-1\` are settled twos and will never be
  touched again.

Read that as one sentence: *everything before \`low\` is 0, everything after \`high\` is 2, and
everything between \`low\` and the cursor is 1.* When the cursor \`mid\` finally passes \`high\`, the
unexamined stretch is empty, and the three remaining stretches — zeroes, ones, twos, in that order —
are the whole array. That is the proof of correctness; there is nothing else to it.

Now the part that actually catches people, and it follows directly from the invariant:

**A swap with the HIGH side brings in an unexamined value, so the cursor must not advance. A swap
with the LOW side does not, so it must.**

Here is why, in each direction.

*When \`nums[mid]\` is a \`2\`:* it is swapped with \`nums[high]\`. What was sitting at \`high\`? By the
invariant, index \`high\` is in the unexamined stretch — it is the last element nobody has looked at.
So the swap hands the cursor a value of completely unknown colour. It might be a \`0\`, which needs
throwing to the far left. If the cursor advanced, that \`0\` would be left stranded in the middle
region, which the invariant claims holds only ones — and the invariant would be false. So \`high\`
retreats (the twos block has grown by one) and \`mid\` stays exactly where it is, to examine the
newcomer on the next iteration.

*When \`nums[mid]\` is a \`0\`:* it is swapped with \`nums[low]\`. What was sitting at \`low\`? By the
invariant, index \`low\` is the first element of the *settled ones* stretch — something already
examined and known to be a \`1\`. (And if the ones stretch is empty, then \`low == mid\` and the swap
is an element with itself, which is a no-op on a value the cursor just examined.) Either way, the
value arriving at \`mid\` is one the walk has already classified. There is nothing left to learn
about it, so \`mid\` advances along with \`low\`.

That asymmetry is the entire exercise. It is not a trick or an off-by-one to memorise; it is a
direct consequence of *which side of the array still contains unknowns*. The \`high\` side does. The
\`low\` side does not.

One more consequence worth naming: the loop condition is \`mid <= high\`, not \`mid < high\`. When
\`mid == high\` there is still exactly one unexamined element — the one they are both pointing at —
and it must be classified. Using \`<\` leaves that last element wherever it happened to land, which
is wrong on any input ending in an unplaced value.` },
  ],
}
