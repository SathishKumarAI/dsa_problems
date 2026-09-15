// group-anagrams — the closing narrative, and the rungs side by side.
//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is `arc` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Comparison } from "../../content/types.ts"

export const arc = `One question drives every rung: **what is the key that makes two words the same?** The pairwise scan
refuses to answer it and pays quadratically for the refusal — with no label to address a group by, a
word can only be placed by interrogating every group already built, re-deriving "are these anagrams?"
against each one and throwing the derivation away. Sorting each word's letters is the first real
answer, and it converts the problem from a search into an addressing scheme: the label is computed
once per word, the hash map does the grouping for free, and \`n²\` comparisons collapse into \`n\`
lookups. But a sorted string and a letter tally carry exactly the same information — both are the
multiset of letters, nothing more — so the sort was buying nothing and charging \`log k\` for it; the
count signature is the same key built in one pass, and the twenty-six-letter alphabet is what makes
that tally a fixed array rather than another hash map. From there the only thing left to get right is
the rendering, where a missing separator quietly merges words whose counts differ only in where the
digits break. What transfers is the habit rather than the code: look for a canonical form, and check
whether the form you reached for is doing more than canonicalising. Anagram grouping, isomorphic
strings, "group shapes by their normalised outline", deduplicating records that differ only in field
order — all of them are the same problem once the key is chosen, and all of them have a version of
the delimiter bug waiting in how the key is serialised.

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
            "Pairwise scan",
            "`O(n² · k log k)`",
            "`O(n · k)`",
            "Needs no map or key design; pays a full search per word",
            "`n` is a handful, or as the oracle a harness checks the rest against"
        ],
        [
            "Sorted letters as key",
            "`O(n · k log k)`",
            "`O(n · k)`",
            "One sort per word buys addressing instead of searching; alphabet-agnostic",
            "Large, unknown or non-character alphabets — Unicode, mixed case, tokens"
        ],
        [
            "**26-count signature as key**",
            "**`O(n · k)`**",
            "**`O(n · k)`**",
            "Drops `log k` by exploiting the fixed alphabet; the key must be serialised with a separator",
            "**Small known alphabet, possibly long words — the answer here**"
        ]
    ]
}
