// largest-rectangle — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/largest-rectangle_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `A histogram is a row of bars standing side by side, each exactly one unit wide and as tall as the
number given for it. Draw any axis-aligned rectangle you like on top of that picture, as long as
every part of it sits **under** the bars — no part may stick out into empty air. Return the area of
the biggest such rectangle.

The thing that makes this hard is that a rectangle is defined by two edges you get to choose, and
there are \`O(n²)\` pairs of edges. But there is a second way to describe the very same rectangle, and
it is the whole problem: **any rectangle that fits under the bars is capped by the shortest bar it
spans.** Push it taller and it pokes out through that shortest bar; that bar is what decides its
height.

> **Intuition.** Think of the rectangle as water poured into a channel: it rises until it reaches the
> lowest wall it touches, and no further. The low wall, not the two ends, is what sets the level.

That reframing converts "choose two edges" into "choose one bar". **Fix each bar in turn as the
rectangle's height, and ask how far it can extend left and right before something *shorter* stops
it.** Every rectangle worth considering is the widest one at some bar's exact height, so checking one
per bar checks them all. Now the unknown has a name, and it is a familiar one: *where is the first
shorter bar on each side?* — a **next-smaller-element** question, asked twice.

**The core question is therefore: for each bar, where is the first strictly shorter bar to its left,
and to its right?** The naive approach is slow because it answers that by physically walking outward
from every bar, and a histogram of equal bars makes each of those walks cross the entire array.

### The constraints, and what each one unlocks

The worked example used in every section below is the statement's own:

\`\`\`
heights = [2, 1, 5, 6, 2, 3]        answer: 10   (height 5 spanning bars 2 and 3)
\`\`\`

Worth noting before you start: the answer \`10\` uses height \`5\` across two bars, beating both the
tallest single bar (\`6 × 1 = 6\`) and the widest possible span (\`1 × 6 = 6\`). Neither "go tall" nor
"go wide" is the answer, which is exactly why the shortest-bar framing is needed.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= heights.length <= 10^5`",
    "what": "**This is what prices out both non-linear rungs.** A quadratic scan is `10^10` operations on a flat histogram, where every bar spreads across every other bar. It also kills divide & conquer's *worst* case specifically: that approach is `O(n log n)` only when the minimum tends to land mid-array, and degrades to `O(n²)` on sorted input — which `[1, 2, 3, …, 10^5]` is. The lower bound means the array is never empty, so `n = 1` is a real input and its answer is that bar's own height."
  },
  {
    "constraint": "`0 <= heights[i] <= 10^4`",
    "what": "**Heights are non-negative, and that is what makes a `0` sentinel legal.** A trailing bar of height `0` is shorter than or equal to every real bar, so appending one forces the stack to drain completely — if heights could be negative, `0` would not dominate and the sentinel would have to be `-inf`. A `0` is also a legal *real* bar, and a histogram of all zeroes has a largest rectangle of area `0`, so \"no rectangle\" is a genuine answer rather than an error."
  },
  {
    "constraint": "the rectangle spans consecutive bars and is capped by the shortest of them",
    "what": "**This is the permission slip for the entire \"fix a bar as the height\" reframing.** Because the cap is the shortest spanned bar, every maximal rectangle has its height equal to some bar exactly, so iterating over `n` candidate heights — one per bar — is exhaustive rather than a heuristic. Without this, you would be searching a two-dimensional space of edges."
  }
]
