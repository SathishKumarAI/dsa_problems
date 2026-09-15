// window-maximum — approach 2 — A max-heap with lazy eviction
//
// Converted from docs/deep/window-maximum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "heap",
  title: "A max-heap with lazy eviction",
  idea: `*The scan forgets everything between windows — what if a structure remembered the values instead?* Push
every value into a max-heap as the window advances. The heap's top is the largest value ever pushed; if
that top has already fallen out of the window, discard it and look again.

This fixes the scan's weakness: **it re-reads \`k - 1\` values it examined a moment earlier.**`,
  intuition: `> **Intuition.** A heap is a pile with the biggest item always on top, and one crucial limitation: you
> can only reach the top. There is no cheap way to pull a specific item out of the middle — and the item
> you need to remove is always the one that just slid out of the slot, which is somewhere in the middle.
> So you cannot remove it. Instead you leave it in the pile as a **corpse** and check, each time you
> read the top, whether the thing you are looking at is still inside the window; if not, throw it away
> and look at the next one. That is *lazy eviction*: you do not delete on departure, you delete on
> discovery.`,
  worked: `\`nums = [1, 3, -1, -3, 5, 3, 6, 7]\`, \`k = 3\`. The heap holds \`(value, index)\` pairs, shown
largest-first; nothing is ever evicted on this input because every new maximum arrives before the old
one expires:

| \`i\` | pushes | evicted from top | heap contents (value, index) | size | emits |
|---|---|---|---|---|---|
| 0 | \`(1, 0)\` | — | \`(1,0)\` | 1 | — |
| 1 | \`(3, 1)\` | — | \`(3,1) (1,0)\` | 2 | — |
| 2 | \`(-1, 2)\` | — | \`(3,1) (1,0) (-1,2)\` | 3 | **3** |
| 3 | \`(-3, 3)\` | — | \`(3,1) (1,0) (-1,2) (-3,3)\` | 4 | **3** |
| 4 | \`(5, 4)\` | — | \`(5,4) (3,1) (1,0) (-1,2) (-3,3)\` | 5 | **5** |
| 5 | \`(3, 5)\` | — | \`(5,4) (3,5) (3,1) (1,0) (-1,2) (-3,3)\` | 6 | **5** |
| 6 | \`(6, 6)\` | — | \`(6,6) (5,4) (3,5) (3,1) (1,0) (-1,2) (-3,3)\` | 7 | **6** |
| 7 | \`(7, 7)\` | — | \`(7,7) (6,6) (5,4) (3,5) (3,1) (1,0) (-1,2) (-3,3)\` | 8 | **7** |

Read the \`size\` column, because it is the whole argument against this approach. The window is three
wide; the heap ends holding **all eight** values. \`(1, 0)\` is still in there at the end, four windows
after it stopped being relevant, because it was never on top and so was never examined. Measured on
\`nums = [1..8], k = 3\`: peak heap size **8**, where a deque never exceeds **3**.`,
  code: `def window_maximum_heap_lazy(nums: list[int], k: int) -> list[int]:
    heap: list[tuple[int, int]] = []
    out: list[int] = []
    for i, x in enumerate(nums):
        heapq.heappush(heap, (-x, i))  # negated: heapq is a MIN-heap
        while expired(heap[0][1], i, k):  # the top may be a corpse from outside the window
            heapq.heappop(heap)
        if i >= k - 1:
            out.append(-heap[0][0])
    return out`,
  mistake: `> **Watch out.** Dropping the eviction loop entirely, because on many inputs the top *is* current and
> the code looks right. The misconception is that a heap's top is the maximum **of the window**; it is
> the maximum of everything ever pushed, and nothing about the heap knows the window exists. Measured:
> on the statement's own example it returns \`[3, 3, 5, 5, 6, 7]\` — completely correct, because each new
> maximum happens to arrive before the previous one expires. Then on \`nums = [9, 1, 1, 1, 2], k = 3\` it
> returns \`[9, 9, 9]\` where the answer is \`[9, 1, 2]\`, and on \`nums = [5, 4, 3, 2, 1], k = 2\` it returns
> \`[5, 5, 5, 5]\` where the answer is \`[5, 4, 3, 2]\`. Any input whose maximum arrives early and then
> leaves exposes it; the statement's example is precisely the kind that does not.`,
  cost: `**Time \`O(n log n)\`.** Every one of the \`n\` values is pushed at \`O(log n)\`, and every value is popped at
most once — but the heap can hold up to \`n\` entries, so the log factor is \`log n\` rather than \`log k\`.
The nested \`while\` is amortised: each entry is evicted at most once across the whole run.

**Space \`O(n)\`.** The corpses are the cost. Because a value is only removed when it reaches the top, an
increasing array keeps every element it ever saw, as the \`size\` column above shows.

Right when the question changes into something a deque cannot answer — a window *median*, a *k*-th
largest, a sum of the top three — because a heap generalises to order statistics and a monotonic deque
does not. For the plain maximum it is strictly worse than Approach 3 in both time and space, and its
real value here is diagnostic: it makes you name exactly what a heap cannot do, which is what the next
approach is built to fix.

---`,
}
