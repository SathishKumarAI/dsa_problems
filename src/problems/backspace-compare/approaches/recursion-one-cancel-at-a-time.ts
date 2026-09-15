// backspace-compare — approach 1 — Recursion: cancel one `'#'` at a time.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "recursion-one-cancel-at-a-time",
  title: "Recursion: cancel one `'#'` at a time",
  idea: `*Can I make the problem smaller?* Find the first \`'#'\`, delete it together with the character to its
left, and hand the shorter pair back to yourself. When neither string has a \`'#'\` left, both are
finished text and a plain equality test answers the question.`,
  intuition: `> **Intuition.** Editing a document by repeatedly hitting "find and fix the first mistake". Each pass
> removes one backspace and its victim, the document gets two characters shorter, and eventually no
> mistakes remain and you can just read what is left. It is the most literal possible reading of the
> rules, which makes it the easiest to believe and the easiest to get right — and each "pass" copies
> the whole document, which makes it the most expensive.`,
  worked: `| depth | \`s\` | \`t\` | first \`'#'\` | action |
|---|---|---|---|---|
| 0 | \`"abc##d"\` | \`"ad#d"\` | in \`s\` at index 3 | delete index 3 and index 2 → \`s = "ab#d"\` |
| 1 | \`"ab#d"\` | \`"ad#d"\` | in \`s\` at index 2 | delete index 2 and index 1 → \`s = "ad"\` |
| 2 | \`"ad"\` | \`"ad#d"\` | \`s\` clean; in \`t\` at index 2 | delete index 2 and index 1 → \`t = "ad"\` |
| 3 | \`"ad"\` | \`"ad"\` | none left | compare: \`"ad" == "ad"\` → **true** ✅ |

Notice depth 0 → 1. The run of two hashes is handled by the recursion *one at a time*: the first pass
removes \`#\` and \`c\`, which brings the second \`#\` next to \`b\`, and the next pass removes that pair. The
"delete the previous survivor" rule is never stated — it emerges from repeatedly applying the simple
rule to a shortened string.`,
  code: `HASH = "#"


def backspace_compare_recursion(s: str, t: str) -> bool:
    at = s.find(HASH)
    if at >= 0:
        head = s[: at - 1] if at > 0 else ""   # a '#' at index 0 has nothing to its left
        return backspace_compare_recursion(head + s[at + 1 :], t)
    at = t.find(HASH)
    if at >= 0:
        head = t[: at - 1] if at > 0 else ""
        return backspace_compare_recursion(s, head + t[at + 1 :])
    return s == t`,
  mistake: `> **Watch out.** Dropping the \`if at > 0 else ""\` guard and writing \`head = s[: at - 1]\` outright. The
> misconception is that "the part before the victim" is always \`s[:at-1]\`. When \`at == 0\` there is no
> victim, and \`s[:-1]\` in Python does not mean "empty" — it means **everything except the last
> character**, silently deleting from the wrong end of the string.

Measured on \`s = "#a"\`, \`t = "a"\`: \`at = 0\`, so \`head = "#"\`, and \`head + s[1:]\` reconstructs \`"#a"\`
exactly. The recursion makes no progress and Python raises \`RecursionError\`. It is a rare mercy — a
loud failure instead of a quiet wrong answer — and it is why the leading-\`'#'\` case is in every test
list in this document.`,
  cost: `**Time \`O((n + m)²)\`** — each \`'#'\` costs a \`find\` plus two slices that copy the whole string, and
there can be \`n + m\` of them. **Space \`O(n + m)\`** — one call frame per deletion, each holding its own
freshly copied string, so 200 hashes means 200 nested frames.

Use it to *state* the rule, and to convince yourself the rule is what you think it is. Nothing else.
Its value here is that it makes the next rung's motivation concrete: the algorithm is right and the
machinery around it is wrong.

---`,
}
