// first-missing-positive — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every rung chases is *stop paying twice for what the constraints already told you*, and
this problem is unusual in that the crucial constraint is not written down — it is deduced. With n
values in hand you can block at most n distinct positives, so the answer is trapped in 1..n+1 before
you have looked at a single element. Everything else falls out of that. The candidate scan takes the
bound seriously enough to know when to stop but pays for the presence test in time, sweeping the whole
array once per candidate. Sorting fixes the sweeping by imposing an order, which is general and
correct but charges n log n for an arrangement the answer never consults — it only ever asks "is this
one number here?". The hash set answers exactly that question in one step, and is the right production
answer, but it stores everything the array contains, including the negatives and the billion-sized
values that the bound already proved cannot matter. The boolean table throws those away at the door
and indexes straight into a row of n+1 pigeonholes — no hashing, no noise. And then the last
observation: **that row of n+1 pigeonholes indexed by 1..n is the same shape as the input, a row of n
slots indexed 0..n−1, offset by one.** The second table was never new information; it was the first
one, paid for twice. Sending each value \`v\` into slot \`v-1\` collapses them into a single structure
that is simultaneously the data and the lookup table, and the extra space vanishes. What that collapse
costs is stated honestly by the statement itself — the array is permuted and does not come back — and
what makes it *safe* is the accounting argument: every swap settles one value forever, there are only
n values to settle, so the nested loop that looks quadratic is linear. Both halves, the bound and the
accounting, transfer directly: the same shape solves \`missing-number\`, \`find-all-duplicates\`, and
every "the values are a near-permutation of the indices" problem you will meet.

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
            "Try each candidate",
            "O(n²)",
            "O(1)",
            "Zero assumptions, zero memory, re-scans for every candidate",
            "n is tiny, or you need a reference oracle — and as the way to state the n+1 bound out loud"
        ],
        [
            "Sort, then walk",
            "O(n log n)",
            "O(1) beyond the sort",
            "Buys a single settling pass with ordering work the answer never reads",
            "The input is already sorted, or n log n is plainly fast enough"
        ],
        [
            "Hash set",
            "O(n)",
            "O(n)",
            "Linear time for linear memory; stores noise it can never use",
            "The input must survive, constant space is not required, or values are not small dense integers"
        ],
        [
            "Boolean table of n+1",
            "O(n)",
            "O(n)",
            "Trades the set's generality for direct indexing and drops noise at the door",
            "Values are bounded, allocation is fine, and the input must come back intact"
        ],
        [
            "Cyclic placement",
            "O(n)",
            "O(1)",
            "Same speed as the table with no allocation — pays by permuting the input irreversibly",
            "The constant-space follow-up is asked and the caller has no further use for the array"
        ]
    ]
}
