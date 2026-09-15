// intersection-of-arrays — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `You are handed two integer arrays. Return the values they have in common — but with a twist that is
the entire problem: a value appears in the answer as many times as it appears in **both** arrays.
Three 1s on the left and two on the right yield two 1s, not one and not five. Neither array is sorted,
either may repeat values, and the judge accepts the answer in any order.

**The core question is: for each value, how many copies can both sides supply at once?** The naive
approach is slow because it answers that by re-scanning the whole right-hand array for every element
of the left, so two arrays of 1,000 elements cost a million comparisons — and it needs a side table of
"already claimed" flags just to stay correct.

Note what the core question is *not*. It is not "is this value present?" That is the set-intersection
problem, a different question with a different answer, and confusing the two is the single most common
way to get this wrong. **The answer's count for a value is \`min(count in nums1, count in nums2)\`.**
Everything below is a different way of computing that minimum.

The constraints, and what each one buys:

The shape of the ladder: every rung computes the same minimum, and what changes is where the
bookkeeping lives and how big it is allowed to get.

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "`1 <= nums1.length, nums2.length <= 1000`",
        "what": "Small enough that even the quadratic rung finishes. The interest here is not survival, it is which structure fits the shape of the data. Both arrays always have at least one element, so neither is ever empty."
    },
    {
        "constraint": "`0 <= nums1[i], nums2[i] <= 1000`",
        "what": "Values are small, dense, non-negative integers. That makes every hash operation cheap in practice, and it means a flat array of 1001 counters would work in place of a map — worth knowing, though the map is what generalises."
    },
    {
        "constraint": "**multiplicity is `min(count₁, count₂)`**",
        "what": "The load-bearing one. It turns this from a membership problem into a **counting** problem, and it is what disqualifies the obvious `set(nums1) & set(nums2)` one-liner."
    },
    {
        "constraint": "neither array is sorted, and both may hold duplicates",
        "what": "Sortedness is available only if you pay for it, which is what the second rung does — and it mutates or copies to get there."
    },
    {
        "constraint": "any order is accepted; this repo returns ascending",
        "what": "So there is exactly one canonical result to compare against. Any cross-check must sort both sides first."
    },
    {
        "constraint": "**the follow-up: `nums2` is enormous and can only be streamed once**",
        "what": "This is the real lesson, and it is what separates the last rung from the one before it. If one array cannot fit in memory, the extra space has to be bounded by the **smaller** one."
    }
]
