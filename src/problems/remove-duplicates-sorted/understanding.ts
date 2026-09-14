// remove-duplicates-sorted — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/remove-duplicates-sorted_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are handed a list of numbers already arranged from smallest to largest, and some values
appear more than once. Throw away the repeats so every value is left exactly once, keep the values
in the order they were already in, and do it inside the array you were given rather than building
a second one. The answer is a **prefix**: the survivors packed at the front, plus the count of how
many there are.

**The core question is: for each value, has this value already been kept?** The naive way to
answer that is to remember everything kept so far — in a set, or by re-scanning what you have
written — and both are slow or expensive for the same reason: they treat the question as being
about the whole history. A set costs memory proportional to the input and throws away the ordering
the input handed you for free, so you would have to sort all over again to put the answer back in
order. A re-scan of what you have kept is a second loop inside the first, which is quadratic.

### The constraints, and what each one unlocks

The third row is the whole problem. If the input were unsorted none of this works: \`[1, 5, 1]\` has
a duplicate that is not adjacent to anything, a single neighbour comparison would miss it, and you
would be back to a hash set. Sortedness here is not a convenience, it is the mechanism.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= nums.length <= 3 * 10^4`",
    "what": "Big enough that an O(n²) \"re-scan what I kept\" answer is ~4.5 × 10⁸ comparisons and will not survive. Also: the array is never empty, so index 0 always exists and is always a survivor."
  },
  {
    "constraint": "`-100 <= nums[i] <= 100`",
    "what": "Values are small and bounded. This is the constraint that *would* make a counting-array answer tempting — 201 buckets would do it — and it is worth noticing that you never need it, because the good answer does not look at a value's magnitude at all, only at whether two values are equal."
  },
  {
    "constraint": "**sorted non-decreasing**",
    "what": "The load-bearing one. In a sorted array **every duplicate is adjacent to its twin**. So \"have I seen this value before?\" — a question about the whole history — collapses into \"is this the same as the last one I kept?\", a question answered by one comparison. That collapse is what removes the set."
  },
  {
    "constraint": "in place, survivors at the front",
    "what": "This is what forbids the fresh output list. You may not spend O(n) memory on an answer that already fits in the memory you were given."
  }
]
