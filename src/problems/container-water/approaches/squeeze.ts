// container-water — approach 2 — Converging pointers with a greedy discard (optimal).
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "squeeze",
  title: "Converging pointers with a greedy discard (optimal)",
  idea: `*Brute force measures every pair, but most pairs are hopeless — can we prove a whole family of them
worthless without measuring them?* Yes. Start with the widest possible container, the two end
sticks. The shorter of the two is the one capping the area, and keeping it can only ever produce
narrower containers with the same cap or worse — so retire it and step inward. This fixes the brute
force's exact weakness: the inference it computed and discarded is turned into a discard rule.`,
  intuition: `Two fingers at the far ends of the row, holding the widest container there is. Every future
container is narrower, so the only way to come out ahead is to get taller. Ask which of your two
sticks is stopping you: it is the shorter one, always, because water can only rise to the shorter
wall. Moving the taller one inward is strictly self-defeating — you lose width and the short stick
still holds the ceiling down. So move the shorter one, and hope for something taller. Repeat until
the fingers meet. The mental picture is *sacrificing width to buy height*, and only ever paying for
height you might actually get.`,
  worked: `Input: \`heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]\`, the same input as above.

| Step | i (height) | j (height) | Width | \`min\` | Area | Best | Which moves, and why |
|---|---|---|---|---|---|---|---|
| 1 | 0 (1) | 8 (7) | 8 | 1 | 8 | 8 | left is shorter (1 < 7) → \`i → 1\` |
| 2 | 1 (8) | 8 (7) | 7 | 7 | **49** | **49** | right is shorter (7 ≤ 8) → \`j → 7\` |
| 3 | 1 (8) | 7 (3) | 6 | 3 | 18 | 49 | right is shorter → \`j → 6\` |
| 4 | 1 (8) | 6 (8) | 5 | 8 | 40 | 49 | tie (8 vs 8); the code moves \`j\` → \`j → 5\` |
| 5 | 1 (8) | 5 (4) | 4 | 4 | 16 | 49 | right is shorter → \`j → 4\` |
| 6 | 1 (8) | 4 (5) | 3 | 5 | 15 | 49 | right is shorter → \`j → 3\` |
| 7 | 1 (8) | 3 (2) | 2 | 2 | 4 | 49 | right is shorter → \`j → 2\` |
| 8 | 1 (8) | 2 (6) | 1 | 6 | 6 | 49 | right is shorter → \`j → 1\`, pointers meet, stop |

Eight measurements against brute force's thirty-six, same answer of 49, found at step 2. Notice step
1: the widest container is measured first and is nearly worthless, and notice that the pointers
never revisit position 0 — the entire family of 8 pairs that contain that height-1 stick was retired
by a single comparison.`,
  code: `def container_water_two_pointers(heights: list[int]) -> int:
    i, j = 0, len(heights) - 1
    best = 0
    while i < j:
        best = max(best, (j - i) * min(heights[i], heights[j]))
        if heights[i] < heights[j]:
            i += 1  # the short wall caps every remaining pair it belongs to — retire it
        else:
            j -= 1
    return best`,
  mistake: `**Moving the taller wall** — writing \`if heights[i] > heights[j]: i += 1\`. It is an easy slip
because "move away from the tall one" and "move the tall one" sound similar when you are reciting the
rule from memory rather than from the argument. On the statement's own example it returns 8 instead of
49: the sweep clings to the height-1 stick at position 0 — the very wall that is capping everything —
and walks the right pointer all the way down to meet it, never once measuring a container that stick
is not in. The fix is not to memorise the direction but to memorise the *reason* — the shorter
wall is the one capping you, so the shorter wall is the one with nothing left to offer.

The second mistake is recording the area *after* moving a pointer instead of before, which skips
measuring the very first, widest container; on an input whose answer is the full-width pair, such as
\`[3, 1, 1, 3]\`, that returns 2 instead of 9. Measure, then move. And the third: \`while i <= j\`,
which computes a zero-width "container" of a stick with itself — harmless to the maximum here, since
its area is 0, but a habit that is fatal in the neighbouring problems where it reuses an element.`,
  cost: `**Time O(n), space O(1).** Every iteration moves exactly one pointer inward and neither pointer ever
moves back, so the gap between them shrinks by one each step and the loop runs at most n − 1 times.
Space is two indices and a running best.

This is the answer, and there is no rung above it — you cannot do better than reading each stick
once. More usefully, this is the problem to reach for when you want to *recognise* the pattern in an
unfamiliar question: whenever a quantity depends on two endpoints, one of which is the clear
bottleneck, and moving the non-bottleneck end can be shown to make things strictly worse, converging
pointers apply, whether or not anything is sorted.`,
  notes: [
    { title: "the exchange argument — why skipping is safe", body: `This is what an interviewer probes the moment you produce the greedy rule, and it is the part most
write-ups skip. The claim: **when \`heights[i] < heights[j]\`, no pair that uses index \`i\` can beat the
area you have already recorded, so retiring \`i\` loses nothing.**

Here is the argument in full. The pairs still in play that involve index \`i\` are \`(i, m)\` for \`m\`
ranging over \`i+1 .. j−1\` — everything to the right of \`i\` and left of \`j\`, since \`j\` itself has just
been measured. Take any such \`m\` and compare its container with the one you just measured, \`(i, j)\`:

- **Width.** \`m < j\`, so \`m − i < j − i\`. The new container is strictly narrower.
- **Height.** The height is \`min(heights[i], heights[m])\`, which is at most \`heights[i]\`. And
  \`heights[i]\` is precisely the height of the container you just measured, because \`heights[i]\` was
  the smaller of the two. So the new container is no taller.

Multiply: strictly smaller width times no-greater height gives an area strictly less than
\`(j − i) × heights[i]\`, which is already in \`best\`. Every pair containing \`i\` is provably worse than
something already recorded, so index \`i\` can be discarded forever without measuring any of them.
One comparison retires an entire family of up to n − 1 candidates.

The mirror case is identical: if \`heights[j] <= heights[i]\`, then for every \`m\` in \`i+1 .. j−1\`, the
container \`(m, j)\` is narrower than \`(i, j)\` and capped at \`heights[j]\`, which is the height of the
container just measured — so index \`j\` is dead.

Two details worth having ready, because they are the follow-up questions:

**Ties.** When the two heights are equal, *either* pointer may be retired, and both arguments above
hold simultaneously. The code moves \`j\`; moving \`i\` would be equally correct. In fact when
\`heights[i] == heights[j]\`, every pair that uses *either* of them is provably worse, so a clever
implementation could retire both at once. The simple version loses nothing by retiring one.

**Completeness.** Each iteration retires exactly one index, so the loop terminates in at most n − 1
steps, and no index is ever retired before being proven unable to improve on the recorded best. Since
the optimal pair is never retired, the pointers must still be straddling it when it is measured —
therefore it is measured. That is the whole proof, and notice it never once uses sorted order: the
only facts consumed are that the width shrinks as the pointers converge and that the shorter wall
caps the height.

---` },
  ],
}
