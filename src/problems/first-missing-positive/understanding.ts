// first-missing-positive — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are handed an unsorted array of integers. It may contain negatives, zeroes, duplicates, and
numbers far larger than the array is long. Find the smallest positive integer — 1, 2, 3, … — that
does **not** appear in it. The follow-up, which is the entire difficulty, is to do it in linear time
using only a constant amount of extra memory.

**The core question is: for each candidate 1, 2, 3, …, is that number present in the array?** The
naive approach is slow because it answers that question by re-scanning the whole array once per
candidate, and there can be n+1 candidates, so an array of 100,000 numbers costs about ten billion
comparisons.

The constraints, and what each one buys:

The whole arc of this problem is one sentence: **the answer is promised to lie in 1..n+1, so the
only values that matter are 1..n — exactly as many as the array has slots, and each one is a legal
index of the array itself.** Everything below is a walk toward taking that seriously.

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "`1 <= nums.length <= 10^5`",
        "what": "Quadratic work is ~10¹⁰ comparisons. A correct O(n²) answer will time out."
    },
    {
        "constraint": "`-2^31 <= nums[i] <= 2^31 - 1`",
        "what": "Negatives, zeroes and duplicates are all legal. Any approach that assumes the values are a clean permutation is wrong, and `first-missing-positive` is the harder cousin of `missing-number` precisely because of this."
    },
    {
        "constraint": "**the answer always lies in 1..n+1**",
        "what": "The load-bearing one, and it is a deduction, not a given: n values can block at most n distinct positives, so the worst the array can do is hold exactly 1, 2, …, n, which forces the answer to n+1. Everything else follows from this bound."
    },
    {
        "constraint": "**anything ≤ 0 or > n is noise**",
        "what": "A direct corollary. Such a value can never be the answer (it is not a positive ≤ n+1 candidate that could be missing at the bottom) and it can never block one (it occupies none of the n+1 candidate slots). So every rung from the third onward can throw those values away the moment it sees them — which is what makes a table of exactly n+1 slots sufficient."
    },
    {
        "constraint": "**`nums` may be modified**",
        "what": "This is what unlocks the final rung. The array's n slots are indexed 0..n−1, and the interesting values are 1..n. One subtraction lines them up, and the array becomes its own lookup table."
    },
    {
        "constraint": "O(n) time **and** O(1) extra space",
        "what": "The set and the boolean table are both correct and both fail the follow-up. They are not slow — they are memory you were told not to spend."
    }
]
