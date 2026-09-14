// window-maximum — the closing narrative, and the rungs side by side
//
// Converted from docs/deep/window-maximum_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = `The whole ladder is driven by one awkward fact: **a maximum does not undo**. A sliding sum is trivial
because subtraction reverses addition, so the departing element can simply be taken back out — but if
the departing element *was* the maximum, a running maximum has no idea what to fall back to, because the
smaller values were discarded precisely for being smaller. The brute force sidesteps this by keeping
nothing at all and re-reading the whole window every step, which is correct and pays \`k - 1\` redundant
reads per position; eighteen reads to describe an array of eight. The first real attempt at memory is a
heap, which does remember every value and hands back the largest in logarithmic time — and it runs
straight into the awkward fact from the other side. A heap only exposes its top, so it cannot delete the
element that just left the window, because that element is somewhere in the middle; the workaround is
**lazy eviction**, leaving corpses in the pile and checking on each read whether the top is still inside
the window. It works, and the price is visible in the trace: a window three wide leaves a heap holding
all eight values, because entries are only removed when they happen to surface. The insight that fixes
it is to stop asking how to delete the right thing later and start asking what should never have been
stored. If \`nums[i] <= nums[j]\` and \`i < j\`, then every future window containing \`i\` also contains \`j\` —
windows are contiguous, so there is no way to reach past \`j\` while keeping \`i\` — and \`j\` wins or ties in
all of them; position \`i\` is **dominated** forever the instant \`j\` arrives, and can be thrown away with
nothing lost. Discarding on arrival rather than on discovery leaves exactly the candidates that could
still win, in strictly decreasing order, so the front *is* the answer with no staleness to check and no
pile to carry: each index enters once and leaves once, giving linear time and \`O(k)\` space. What that
structure needs beyond a stack is the ability to remove from the **front** as well as the back — the
maximum that nothing beat still has to age out when its index falls off the window's left edge, as the
9 does in the supplementary trace — and needing both ends is the entire reason the answer is a deque.
Re-read everything, remember everything and filter it late, or keep only what can still win and expire
it from the front: the last of those is what "monotonic deque" means, and the two habits it teaches —
delete eagerly what can never win, and check that your structure can expire at the end where age
accumulates — are worth more than the nine lines that implement it.

---`

export const comparison: Comparison = {
  "head": [
    "Approach",
    "Time",
    "Space",
    "Core trade-off",
    "Best used when"
  ],
  "rows": [
    [
      "Scan each window",
      "`O(n · k)`",
      "`O(1)`",
      "No memory at all, so nothing can go stale and nothing is reused",
      "`k` is small and fixed; you need an obviously-correct oracle"
    ],
    [
      "Max-heap, lazy eviction",
      "`O(n log n)`",
      "`O(n)`",
      "Remembers everything but cannot delete the departed, so it carries corpses and re-checks the top",
      "The question becomes a median, a *k*-th largest, or any order statistic a deque cannot express"
    ],
    [
      "**Monotonic deque**",
      "**`O(n)`**",
      "**`O(k)`**",
      "Discards dominated values on arrival, so the front is the answer; needs indices, not values, to know what expired",
      "The default answer for this problem, and for sliding-window minimum"
    ]
  ]
}
