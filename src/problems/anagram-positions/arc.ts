// anagram-positions — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `Every rung here is an argument about **how much of the counting to redo**, and the argument only
becomes possible after one substitution: an anagram is a multiset, a multiset is counts, and order
is irrelevant. Sorting each window redoes all of the work and then some, because it computes a full
ordering — \`k log k\` per window — to answer a question that never mentions order, and discards the
ordering immediately afterwards. Replacing the sort with a tally redoes only \`k\` reads per window and
compares in a fixed twenty-six, which is strictly better and still wasteful in an obvious way: two
neighbouring windows share all but two of their letters, so re-reading all \`k\` of them is paying for
information you already had. Sliding the tally fixes that — one letter in, one letter out, two
updates per step — and the \`k\` disappears from the running time entirely, leaving a shape worth
recognising on sight, because the fixed-width window (enter one, leave one, test) is a whole family of
string problems and not just this one. What is left over is the *test*: twenty-six slots compared at
every position, when a slide can have changed at most two of them, which is a comparison being
recomputed rather than maintained. The last rung keeps an integer saying how many letters currently
agree and adjusts it only where the data moved — unbook the old verdict, change the count, book the
new one — so the alphabet is walked exactly once, at startup, and never again. That final move is
the one worth stealing and carrying to other problems: **keep a summary of the comparison rather than
recomputing the comparison, and update the summary exactly where the data changed**, which is the
same trick that reduces the minimum-window-substring check to a single integer. Sort it, count it,
slide it, summarise it — and note that at every rung the answers were allowed to overlap and the
frame always advanced by exactly one, because a match consumes nothing and \`"aaaa"\` really does
answer three times for \`"aa"\`.

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
            "Sort every window",
            "`O(n · k log k)`",
            "`O(k)`",
            "Computes an ordering the question never asked about, then throws it away",
            "Candidates are scattered strings with no sliding structure; as a readable oracle"
        ],
        [
            "Count every window",
            "`O(n · k)`",
            "`O(1)`",
            "Drops the ordering for a tally, but rebuilds the tally from zero every window",
            "Very short patterns; non-adjacent candidate windows"
        ],
        [
            "Slide the tally, compare 26",
            "`O(26n)`",
            "`O(1)`",
            "Updates the tally instead of rebuilding it, but still re-runs the whole comparison",
            "**Small fixed alphabet — fast enough here, and the shortest correct code**"
        ],
        [
            "**Slide the tally + agreement counter**",
            "**`O(n)`**",
            "**`O(1)`**",
            "**Maintains a summary of the comparison; costs one extra invariant to keep correct**",
            "**Large alphabets, or any per-step verdict made of many independent parts**"
        ]
    ]
}
