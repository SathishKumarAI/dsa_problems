// find-all-duplicates — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `The principle every rung of this ladder chases is *stop paying for information the constraints
already gave you*. The pair scan pays for it in time, asking "have I seen this before?" by re-reading
the tail n times over, which is the quadratic wall. Sorting buys the answer by imposing an order on
the data — that works for anything comparable, but it charges n log n for an arrangement the answer
never reads. The hash map drops the ordering and stores presence directly, correct and linear and
completely general, but it hashes keys that were promised to be small dense integers, which is a
computation bought and thrown away. The flag table strips that away too: values 1..n index straight
into a row of n+1 pigeonholes, one memory read each, no hashing at all. And then comes the
observation the whole problem was built around: **that row of n+1 pigeonholes is a near-copy of the
input, which is already a row of n slots indexed by exactly the same numbers.** The second table was
never new information — it was the first one, paid for twice. Encoding the flag in the sign of
\`nums[v-1]\` collapses the two into one and the extra space goes to nothing. That collapse is the
transferable idea, and it costs something real every time you use it: the data now carries two
meanings at once, so every read has to strip the marking off before trusting the value, and the
caller's array is no longer the caller's array. The same move with a different marking scheme is what
solves \`first-missing-positive\` (swap each value into its own slot) and \`missing-number\` (the same
swap, or an arithmetic invariant that never touches the array at all) — and the question to ask at
the top of any of them is identical: *what does the constraint promise about the values, and is there
already a structure of exactly that shape lying around?*

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
            "Compare every pair",
            "O(n²)",
            "O(1)",
            "Zero assumptions, zero memory, quadratic time",
            "n is tiny, values are not numbers in a known range, or you need a reference oracle"
        ],
        [
            "Sort, read neighbours",
            "O(n log n)",
            "O(n)",
            "Buys adjacency with ordering work the answer never uses",
            "Values are unbounded or non-integer, or you want the answer sorted anyway"
        ],
        [
            "Count in a hash map",
            "O(n)",
            "O(n)",
            "Linear time for linear memory; fully general keys",
            "Values are arbitrary or non-integer, or the question becomes \"appears k times\""
        ],
        [
            "A flag per value",
            "O(n)",
            "O(n)",
            "Trades the map's generality for direct indexing",
            "Values are 1..n, allocation is fine, and the input must survive"
        ],
        [
            "Sign flip in place",
            "O(n)",
            "O(1)",
            "Same speed as the flag table, no allocation — pays by destroying the input",
            "The O(1)-space follow-up is asked and the caller can spare the array (or you repair it)"
        ]
    ]
}
