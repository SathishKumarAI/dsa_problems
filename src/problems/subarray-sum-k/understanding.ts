// subarray-sum-k — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/subarray-sum-k_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Lay a row of numbered tiles on a table and stretch a rubber band over an unbroken run of them. You
may start anywhere and stop anywhere, but you may not lift the band over a tile you would rather
skip. That unbroken run is a **subarray** — \`[1, -1]\` is one inside \`[1, -1, 0]\`, and \`[1, 0]\` is
not, because reaching it means jumping the \`-1\`.

You are asked how many placements of that band cover tiles adding up to exactly \`k\`. Two placements
that overlap are two separate answers, and the band must cover at least one tile.

**The core question:** for each place you could stop, how many places could you have started so that
the stretch between them adds up to \`k\`? The naive approach is slow because it answers that by
physically re-adding every stretch — start at position 0 and walk to the end, start at position 1
and walk to the end, and so on. That is about n²/2 additions, roughly 200 million at the largest
allowed input.

> **Watch out.** The misconception is that this is a **window** problem. Every question phrased as
> "a contiguous stretch with a target sum" trains that reflex — grow on the right, shrink on the
> left — and the reflex is wrong here for exactly one reason, spelled out in the table below: the
> values may be negative. This is a **prefix** problem wearing a window's clothes, and the whole
> difference is a minus sign in the input.

### The constraints, and what each one unlocks

The worked example used in every section below is the statement's own:

\`\`\`
nums = [1, -1, 0], k = 0        answer: 3   ([1, -1], [1, -1, 0], [0])
\`\`\`

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= nums.length <= 2 * 10^4`",
    "what": "Quadratic work is ~2 × 10⁸ additions — over the line for a one-second budget, so an `O(n²)` answer will not survive. The lower bound of 1 also means the array is never empty, so \"a non-empty subarray\" is always askable."
  },
  {
    "constraint": "`-1000 <= nums[i] <= 1000` and `-10^7 <= k <= 10^7`",
    "what": "Every running total lies between −2 × 10⁷ and 2 × 10⁷, so sums fit in a 32-bit integer with room to spare. Nothing here needs big integers or overflow care — in Java or C++ an `int` is safe."
  },
  {
    "constraint": "**values may be negative**",
    "what": "This one *forbids* rather than unlocks. A window that grows on the right and shrinks on the left only works when growing raises the sum and shrinking lowers it; a negative value breaks that. **This is the constraint that disqualifies the sliding window** — the first thing most people reach for. Delete it and the window becomes the best answer in this file, at `O(1)` space."
  },
  {
    "constraint": "the count includes overlapping subarrays, and a subarray is non-empty",
    "what": "You are asked *how many*, not *which ones*, so an approach may store **counts** rather than positions. That is what keeps the final version `O(n)`: listing every qualifying subarray could itself take `O(n²)` output. \"Non-empty\" is why the lookup must happen before the current prefix is recorded; otherwise a stretch of length zero would count."
  }
]
