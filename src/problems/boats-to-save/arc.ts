// boats-to-save — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every rung on this ladder is chasing one thing: **replace a question about groups with a question
about one person.** The exact search never asks that question at all — it treats the crowd as a set to
be carved up and pays 2ⁿ for the privilege, which is the honest price of not knowing anything. What
breaks the exponent is a single observation that costs nothing to make: the heaviest person still
waiting is boarding a boat this round whatever you do, so the only real decision in the whole problem
is whether the seat beside them sails empty, and the best candidate for that seat is the lightest
person, because if even they do not fit then nobody does, and if they do fit then using them there
can never block a pairing that mattered — any other partner is heavier and therefore harder to place
later. That exchange argument is the load-bearing sentence of this problem, and once you have it the
remaining rungs are not about *what* to decide but about how cheaply you can find the two people the
rule names. Rescanning finds them in \`O(n)\` per round and re-derives an ordering that never changed;
sorting settles that ordering once and turns "find the heaviest" into "look at the end", at which
point the bottleneck moves from searching to *removing*, because popping the front of a queue shifts
everyone behind it. Counting the weights into buckets removes the removing — a person leaves by
decrementing a counter — and buys genuine linearity, but linear in the wrong quantity: the table is
sized by the weight limit, so ferrying two people across with a limit of thirty thousand allocates and
walks thirty thousand counters, which is the reminder that "\`O(n)\`" is meaningless until you say what n
counts. The last rung throws the container away entirely: on a sorted array the heaviest and the
lightest are just two indices, each moving only inward, so the whole remaining state is two integers
and the cost is the sort and nothing else. Exhaustive, then greedy-but-searching, then
greedy-and-sorted, then greedy-and-counted, then greedy-and-nothing-else — and the two things worth
carrying out of here are the converging sweep, which is the answer, and the exchange argument, which
is the reason it is allowed to be.

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
            "Exact search over every group",
            "`O(2ⁿ · n)`",
            "`O(2ⁿ)`",
            "Assumes nothing, so it must try everything",
            "n under ~20; as the oracle that proves a greedy right; genuine bin packing, where no greedy exists"
        ],
        [
            "Rescan for the heaviest and the lightest",
            "`O(n²)`",
            "`O(n)`",
            "Has the right rule but no cheap way to apply it",
            "The input must not be reordered and a copy is not affordable; stating the greedy on a whiteboard"
        ],
        [
            "Sort, then empty the queue from both ends",
            "`O(n²)` with a list, `O(n log n)` with a deque",
            "`O(n)`",
            "Fixes the searching and leaves the removing",
            "The container has `O(1)` removal at both ends (`deque`, `ArrayDeque`)"
        ],
        [
            "Count the weights into buckets",
            "`O(n + limit)`",
            "`O(limit)`",
            "No comparisons at all, but the bill is sized by the weight range",
            "Weights fall in a small known range and the crowd is much larger than that range"
        ],
        [
            "**Sort, then two converging pointers**",
            "**`O(n log n)`**",
            "**`O(1)` beyond the sort**",
            "**Pays once for order, then holds the entire state in two integers**",
            "**The default. `O(n)` outright if the input is already sorted**"
        ]
    ]
}
