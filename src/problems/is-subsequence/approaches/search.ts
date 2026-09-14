// is-subsequence — approach 1 — Search for each character in turn.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "search",
  title: "Search for each character in turn",
  idea: `*How do I place the first letter of the pattern?* Scan the text from the left until I find it.
*And the second?* Scan on from just past where the first landed — never from the beginning, or I
would be allowed to match two different pattern letters to the same text position. If any letter's
scan runs off the end of the text, the answer is no. This is the direct translation of the
definition into code: one search per pattern letter, each one resuming where the last left off.`,
  intuition: `> **Intuition.** Reading down a page with a finger, hunting one target letter at a time. You put
> your finger at the top, hunt for an \`a\`, and pin it there. Then you hunt for a \`b\` starting from
> the line *below* the pin — never from the top of the page again, and that restriction is the whole
> game. When a hunt runs off the bottom you stop and say no.
>
> The shape worth noticing is the **bookkeeping**: a variable holding the resume point, a sentinel
> recording whether the inner hunt succeeded, and an early return. Three moving parts to express
> what is really one idea, and each one is a separate place to be wrong.`,
  worked: `Input: \`s = "abc"\`, \`t = "ahbgdc"\`. Every approach in this document traces this same input.

| Hunt | Looking for | Scanning \`t\` from | Reads | Found at | New resume point |
|---|---|---|---|---|---|
| 1 | \`a\` | 0 | \`t[0]='a'\` | 0 | 1 |
| 2 | \`b\` | 1 | \`t[1]='h'\`, \`t[2]='b'\` | 2 | 3 |
| 3 | \`c\` | 3 | \`t[3]='g'\`, \`t[4]='d'\`, \`t[5]='c'\` | 5 | 6 |

All three letters placed, so the answer is \`True\`. Six characters of \`t\` were read in total — and
notice they form three *disjoint* stretches, \`[0]\`, \`[1..2]\`, \`[3..5]\`. That is not an accident,
and it matters for the cost analysis below.`,
  code: `def is_subsequence_restart_scan(s: str, t: str) -> bool:
    at = 0
    for ch in s:
        found = -1
        for j in range(at, len(t)):
            if t[j] == ch:
                found = j
                break
        if found < 0:
            return False
        at = found + 1  # the next character must come strictly after this match
    return True`,
  mistake: `> **Watch out.** The misconception is that \`at\` is an **optimization** — a way to avoid re-reading
> text you have already walked past. It is not; it is the only thing enforcing that two pattern
> letters come from two *different* text positions. Delete it and the function does not become
> slow, it becomes wrong.

Writing the inner scan as \`for j in range(len(t))\`, restarting at the beginning of the text each
time instead of at \`at\`. With \`s = "aa"\` and \`t = "ab"\` it finds an \`a\` at index \`0\`, goes back,
finds the same \`a\` at index \`0\` again, and reports **\`True\`** — but \`"aa"\` is not a subsequence of
\`"ab"\`, because there is only one \`a\` to go round. The same bug reports **\`True\`** for \`"ba"\`
against \`"ab"\`, where the letters exist but the order does not.

It is also the version that earns this approach its reputation for being quadratic: re-reading the
text from zero for every pattern letter is \`100 × 10^4\` reads.

> **Watch out.** The second misconception is that any **falsy** value will serve as "not found".
> Zero is a perfectly legal match position — the first character of the text — so \`found = 0\` makes
> a match at the front indistinguishable from a failed hunt.

With \`found = 0\` as the sentinel and the guard written \`if found == 0\`, the worked example below
returns **\`False\`** instead of \`True\`: the very first hunt finds its \`a\` at index \`0\`, and the guard
reads that as failure.`,
  cost: `**Time** \`O(|s| + |t|)\`, **space** \`O(1)\` — as written. That is worth being precise about, because
the figure usually quoted for this approach is \`O(|s| · |t|)\`, and that quadratic figure belongs to
the **broken** variant above, the one restarting each scan at index \`0\`.

As written here, each successful hunt scans \`t\` from \`at\` to its match and then sets \`at\` past it,
so the stretches never overlap; added up, all the successful hunts together read each character of
\`t\` at most once, and the single failing hunt reads at most the rest. Space is three integers.

So the reason to move past this rung is not asymptotic — it is that it needs a nested loop, a
sentinel value, an early return and a manually maintained resume pointer to say something the next
approach says with one index and one \`if\`. Every one of those four parts is a place the code can
be subtly wrong, and the mistake above shows how invisible that wrongness can be. Use this shape
when the *search* step is genuinely more complicated than a character comparison — if finding the
next occurrence meant a binary search into a precomputed table, for instance, which is exactly
what the follow-up turns it into.

---`,
}
