// next-permutation — "Understanding the Problem", and the constraints table
//
// Converted from docs/deep/next-permutation_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Take the numbers you were handed and imagine writing down *every* way of rearranging them, each one
read left to right as if it were a single long number, and then sorting that whole list from smallest
to largest. Your input sits somewhere in that list. Return the entry immediately after it — and if
your input is the very last entry, wrap around to the very first. The rearrangement happens in the
array you were given, using only a fixed amount of extra room.

**The core question:** what is the smallest possible increase you can make to this arrangement? The
naive approach is slow because it answers that by *actually building the list* — and the number of
arrangements of n values is n factorial, which passes a billion before n reaches thirteen.

### The constraints, and what each one unlocks

The worked example used in every section below is the statement's third one:

\`\`\`
nums = [1, 3, 5, 4, 2]        answer: [1, 4, 2, 3, 5]
\`\`\`

Two things about that answer are worth noticing before any method is described. The front of the
array — the \`1\` at index 0 — did not move. And the tail did not merely get swapped around: it came
back *ascending*. Both facts are the algorithm, before the algorithm exists.

---`

export const unlocks: Unlock[] = [
  {
    "constraint": "`1 <= nums.length <= 100`",
    "what": "A hundred values. **This is the constraint that kills the enumeration**: 100! is a number with 158 digits, so no machine will ever list those arrangements. It is also small enough that even an `O(n³ log n)` candidate search would finish — which matters, because it means the slow rungs are *runnable* here and you can cross-check against them."
  },
  {
    "constraint": "`0 <= nums[i] <= 100`",
    "what": "Small, non-negative whole numbers — and importantly, values repeat. A hundred slots drawn from 101 possible values guarantees nothing about distinctness."
  },
  {
    "constraint": "the answer is a **rearrangement**",
    "what": "Exactly the same multiset of values comes back: nothing added, nothing dropped, nothing substituted. This is the invariant every test in this document checks, because it catches an entire family of index bugs that a value-by-value comparison would miss."
  },
  {
    "constraint": "duplicates are allowed",
    "what": "**This is the constraint that shapes two comparisons.** Two arrangements that read the same are the *same* arrangement, so `[1, 1, 5]` is followed by `[1, 5, 1]`, not by another `[1, 1, 5]`. It forces the enumeration to de-duplicate and it forces the tail search to use `<=` rather than `<`."
  },
  {
    "constraint": "a fully descending array has no successor",
    "what": "**This is the wrap case**, and it is the one that separates a correct implementation from a lucky one. `[3, 2, 1]` is the last arrangement, so the answer is `[1, 2, 3]`. A solution that only knows how to step forward returns nothing here."
  },
  {
    "constraint": "a single element is both the first and last arrangement",
    "what": "`[7]` comes back as `[7]`. Falls out of the wrap rule for free if the wrap is handled properly, and crashes if it is not."
  },
  {
    "constraint": "in place, constant extra room",
    "what": "**This is the constraint that forbids the copy-out rung.** Building the reversed tail in a fresh list and pouring it back is `O(n)` extra memory for an operation that only permutes what is already there."
  }
]
