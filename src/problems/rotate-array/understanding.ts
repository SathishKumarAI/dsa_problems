// rotate-array — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/rotate-array_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You have a row of values and you must slide every one of them \`k\` places to the right. There is no
spare room on the right, so whatever falls off the end reappears at the front — a conveyor belt
joined into a loop. \`[1, 2, 3, 4, 5, 6, 7]\` rotated by 3 becomes \`[5, 6, 7, 1, 2, 3, 4]\`: the last
three came around to the front and everything else shifted right to make room. The follow-up adds the
real difficulty — do it **in place**, with no second array the size of the input.

**The core question:** where does each value end up, and can you put it there without needing
somewhere to park the value it displaces? The naive approach is slow because it reads "move right by
\`k\`" as "move right by one, \`k\` times", redoing the whole array for each step — and \`k\` can be
100,000 on an array of 100,000, which is ten billion writes.

Before any of that there is a reduction that is not optional.

> **Watch out.** The thought to correct first is *"\`k\` is just the number of places, I will worry
> about big \`k\` later."* Rotating by \`n\` puts every value back where it started, so rotating by \`k\`
> and rotating by \`k % n\` are the **same operation**. Reducing \`k\` first is the opening line of four
> of the five rungs below, and skipping it does not merely slow things down — depending on the rung
> it spins pointless full turns, silently returns the input unchanged, or indexes off the end. All
> three are measured in the sections that follow.

### The constraints, and what each one unlocks

Note what is *absent*: nothing says the values are distinct. \`[1, 1, 2, 2, 1, 1]\` is legal, so any
approach that identifies a slot by the value sitting in it is wrong.

The worked example used in every section below is the statement's own:

\`\`\`
nums = [1, 2, 3, 4, 5, 6, 7], k = 3        answer: [5, 6, 7, 1, 2, 3, 4]
\`\`\`
### Shared scaffolding

One primitive recurs, so it is lifted to a single named helper rather than written inline three
times inside Approach 5.

\`\`\`python
def reverse_span(nums: list[int], lo: int, hi: int) -> None:
    """Reverse nums[lo..hi] in place. Empty or single-element spans do nothing."""
    while lo < hi:
        nums[lo], nums[hi] = nums[hi], nums[lo]
        lo += 1
        hi -= 1
\`\`\`

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= nums.length <= 10^5`",
    "what": "Never empty, so `n` is never 0 and `k % n` never divides by zero. But 10⁵ **kills any `O(n · k)` approach**: with `k` also at 10⁵ that is 10¹⁰ writes, minutes rather than milliseconds. This is what rules out Approach 1."
  },
  {
    "constraint": "`-2^31 <= nums[i] <= 2^31 - 1`",
    "what": "Values may be negative and fill a signed 32-bit int. Nothing here sums values, so there is no overflow risk — but **every bit pattern is a legal value**, so there is no spare number to use as a \"this slot has been moved\" marker. That is why Approach 4 counts moves instead of marking slots."
  },
  {
    "constraint": "`0 <= k <= 10^5`, and `k` may exceed the length",
    "what": "The permission slip for `k % n`, and the trap if you skip it. `k = 0` must work, `k = n` must work, `k > n` must work."
  },
  {
    "constraint": "the rotation is to the **right**: `nums[i]` ends at `(i + k) % n`",
    "what": "Fixes the direction. `(i - k) % n` where `(i + k) % n` belongs rotates the wrong way — and still passes on a symmetric input, measured below."
  },
  {
    "constraint": "in place, constant extra memory (the follow-up)",
    "what": "**This forbids Approaches 2 and 3.** Both are correct; both allocate a second array of `n` values. It is what makes the cyclic walk and the three reversals worth knowing at all."
  }
]
