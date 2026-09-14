// find-all-duplicates — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are handed an array of length n. Every number in it is between 1 and n, and each of those
numbers shows up either once or twice — never three times. Report every number that shows up
twice. The order of the answer does not matter, and the answer may be empty.

**The core question is: for each value, have I seen this one before?** The naive approach is slow
because it answers that question by re-reading the rest of the array for every element, so an
array of 100,000 numbers costs about five billion comparisons — minutes of work for an answer that
should take milliseconds.

The constraints, and what each one buys:

The whole arc of this problem is one sentence: **the values are promised to lie in 1..n, which is
exactly the number of slots the array has, so the array itself can become the lookup table.**
Everything below is a walk toward taking that promise seriously.

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "`n == nums.length`, `1 <= n <= 10^5`",
        "what": "Quadratic work is ~5 × 10⁹ comparisons, far too slow. An O(n²) answer is correct and unusable."
    },
    {
        "constraint": "**`1 <= nums[i] <= n`**",
        "what": "The load-bearing one. Every value is a legal index of this very array. That is what lets the last two rungs throw away the hash map: a value *is* a slot number, so the lookup table does not need to be built — it is already sitting there. Subtract one to go from a 1-based value to a 0-based index."
    },
    {
        "constraint": "a value appears once or twice, never more",
        "what": "One bit per value is enough. You never need a counter, only a flag — which is what makes the sign of a number a sufficient place to keep the record."
    },
    {
        "constraint": "the answer may be empty, and its order is not part of the answer",
        "what": "You cannot return early, and you do not have to sort. Any comparison against a reference answer must sort both sides first."
    },
    {
        "constraint": "`n` may be 1",
        "what": "The only legal array is `[1]` and the answer is empty. This is the input that catches a loop starting at index 1, or one reading `nums[i - 1]` without a guard."
    }
]
