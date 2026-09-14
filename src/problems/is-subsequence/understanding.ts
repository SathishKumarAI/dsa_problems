// is-subsequence — "Understanding the Problem", and the constraints table.
//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.

import type { Unlock } from "../../content/types.ts"

export const understanding = `Take a long sentence and a marker pen, and black out any letters you like. Whatever survives, read
left to right, is a **subsequence** of what you started with. The question is whether one particular
short string \`s\` is reachable that way from a long string \`t\` — yes or no.

The letters of \`s\` must appear in \`t\` in the same **order**, but nothing says they sit next to each
other. Blacking out is free; reordering is forbidden.

**The core question is: for each letter of the pattern, where is its next available occurrence in
the text?** The naive approach is slow because it answers that by starting a fresh search through
the text for every letter — walking over the same ground it has already covered, once per letter
of the pattern, which turns a 10,000-character text into 100 × 10,000 character reads for a
pattern of 100.

The third row is the one to internalise: it is what licenses **greed**, and the proof is spelled out
where it is used, in Approach 2's \`Why it works\`.

---`

export const unlocks: Unlock[] = [
    {
        "constraint": "`0 <= s.length <= 100`",
        "what": "The pattern is tiny. This is why a per-character search *feels* fine and why the naive version passes the judge anyway — but it is also why the interesting question is the follow-up, not this one."
    },
    {
        "constraint": "`0 <= t.length <= 10^4`",
        "what": "The text is a hundred times longer than the pattern. Any approach whose cost is \"re-walk the text once per pattern letter\" is paying 10⁴ for information it could have kept from the previous step."
    },
    {
        "constraint": "**order preserved, but the characters need not be adjacent**",
        "what": "The load-bearing one. Because you may discard *any* text character that does not match, a mismatch is never a failure — it is just a character you skip. That is what allows a single left-to-right walk that never backtracks, and what makes the greedy \"take the first match\" safe. If adjacency were required this would be substring search and the whole approach would be different."
    },
    {
        "constraint": "both are lowercase English letters",
        "what": "A 26-letter alphabet. Irrelevant to the one-pass answer, but it is exactly the constraint that makes the *follow-up* affordable: a table of \"next occurrence of each letter after each position\" costs 26 × 10⁴ entries, which is nothing."
    },
    {
        "constraint": "the empty string is a subsequence of anything, including of itself",
        "what": "The answer for `s = \"\"` is `true` no matter what `t` is, so the code must be correct when the pattern cursor starts already at the end. This is what the `i < len(s)` guard is for; it is not defensive clutter."
    }
]
