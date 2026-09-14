// balanced-brackets — approach 1 — Repeated replace: delete matched pairs until nothing changes
//
// Converted from docs/deep/balanced-brackets_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "delete",
  title: "Repeated replace: delete matched pairs until nothing changes",
  idea: `*How do I know whether the brackets pair up correctly?* Find a pair that is obviously matched — an
opener sitting immediately beside its own closer, like \`()\` or \`{}\` — delete it, and repeat. Deleting
an innermost pair exposes the pair that was wrapped around it, so if the string was well-formed it
collapses to nothing, and if anything is left over it was not.`,
  intuition: `> **Intuition.** The string is a row of **nested boxes**, and you are repeatedly throwing away every
> empty box you can see. An empty box is an opener directly followed by its own closer, with nothing
> in between. Throw all of those away and the boxes that contained *only* those are now empty
> themselves, so throw those away too. A well-formed string is exactly one that disappears entirely
> under this process; anything that survives had a bracket with no partner, or partners in the wrong
> order.

The waste to notice is that each sweep re-reads the entire string, including the long stretches
nowhere near the pair being deleted.`,
  worked: `\`s = "([{}])"\`. Each round applies all three replacements, then checks whether anything changed.

| Round | Starting string | after removing \`()\` | after removing \`[]\` | after removing \`{}\` | Changed? |
|---|---|---|---|---|---|
| 1 | \`([{}])\` | \`([{}])\` | \`([{}])\` | \`([])\` | yes |
| 2 | \`([])\` | \`([])\` | \`()\` | \`()\` | yes |
| 3 | \`()\` | \`""\` | \`""\` | \`""\` | yes |
| 4 | \`""\` | \`""\` | \`""\` | \`""\` | no — stop |

Result: the empty string, so the answer is **true**. Notice the shape of the work. There is no stack
here at all — that is the point of this rung — and the state being carried between rounds is the
*whole remaining string*. The innermost pair \`{}\` dissolved first, then \`[]\`, then \`()\`: strictly
inside-out, which is the same order a stack pops in. This approach is already doing last-in-first-out;
it is just paying a full string rebuild for each pop instead of an array index.

Four rounds for a string of six characters, three of them productive. A string nested d levels deep
needs d + 1 rounds, and each round copies the whole string.`,
  code: `PAIRS: dict[str, str] = {")": "(", "]": "[", "}": "{"}  # closer -> its opener
OPENERS: str = "([{"


def balanced_brackets_repeated_replace(s: str) -> bool:
    empty_pairs = [opener + closer for closer, opener in PAIRS.items()]  # "()", "[]", "{}"
    prev: str | None = None
    while prev != s:  # loop to a fixed point: one pass is not enough for nesting
        prev = s
        for pair in empty_pairs:
            s = s.replace(pair, "")
    return s == ""`,
  codeNote: `The three bracket kinds are a fact about the problem, not about any one approach, so they live at
module scope and every approach reads them from there. Changing the alphabet — adding \`<\`/\`>\`, say —
is then a one-line edit in one place.`,
  mistake: `Doing a **single** round of replacements instead of looping until nothing changes:

\`\`\`python
s = s.replace("()", "").replace("[]", "").replace("{}", "")
return s == ""          # WRONG
\`\`\`

> **Watch out.** The misconception is that \`str.replace\` removing *all* occurrences makes one pass
> **exhaustive**. It does not. It removes every pair that is adjacent *right now*, and deleting those
> pairs creates new adjacencies it will never go back and look at.

Running that variant on \`"((()))"\` returns \`False\`, because one pass leaves \`"(())"\` behind — the
innermost \`()\` is removed, and the two pairs that become adjacent as a result are never reconsidered.
On this document's worked example \`"([{}])"\` it also returns \`False\`, leaving \`"([])"\`. The loop to a
fixed point is not an optimisation, it is the algorithm.`,
  cost: `**Time O(n²), space O(n).** The cost comes from the outer loop: nesting depth can be as large as n/2,
each round is a full scan and rebuild of the string, so the two multiply. The space is the new string
each \`replace\` allocates — Python strings are immutable, so every round builds a fresh one.

Use it essentially never in production, but *do* know it, for two reasons. It is the reference
implementation the fast version gets stress-tested against at the bottom of this document, and more
importantly, recognising that it is a slow simulation of popping is what makes the stack feel
inevitable rather than clever. If you find yourself writing it in an interview, say out loud what it
is doing — "this is repeatedly removing the innermost pair, which is a pop" — and the next rung
writes itself.

---`,
}
