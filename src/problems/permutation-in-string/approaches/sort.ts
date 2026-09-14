// permutation-in-string — approach 1 — Sort every window and compare
//
// Converted from docs/deep/permutation-in-string_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "sort",
  title: "Sort every window and compare",
  idea: `*How do I test whether a window is a rearrangement of \`s1\`?* Two strings are rearrangements of each
other exactly when their sorted forms are identical. So sort \`s1\` once, then slide a window of that
width along \`s2\`, sorting each window and comparing.`,
  intuition: `> **Intuition.** Sorting is a way of making "same letters, any order" into "literally the same string".
> Think of each window as a handful of Scrabble tiles: you cannot compare two handfuls at a glance, but
> line both up alphabetically and the comparison is a single look down the row. The cost is that you
> re-line-up the *whole* handful at every position, even though moving the window only swapped one tile
> for another. Fifteen of the sixteen tiles you just carefully sorted are the same tiles you sorted a
> moment ago.`,
  worked: `\`s1 = "ab"\`, \`s2 = "eidbaooo"\`. Target is \`sorted("ab") = ['a', 'b']\`. State per window position:

| \`start\` | window | sorted window | target | match? |
|---|---|---|---|---|
| 0 | \`ei\` | \`ei\` | \`ab\` | no |
| 1 | \`id\` | \`di\` | \`ab\` | no |
| 2 | \`db\` | \`bd\` | \`ab\` | no |
| 3 | \`ba\` | \`ab\` | \`ab\` | **yes — return \`True\`** |

Four windows examined, four sorts performed, and the fourth one re-sorted the \`b\` that the third window
had already sorted.`,
  code: `def permutation_in_string_sort_every_window(s1: str, s2: str) -> bool:
    target = sorted(s1)
    k = len(s1)
    for start in range(len(s2) - k + 1):  # empty range when s1 is longer than s2
        if sorted(s2[start : start + k]) == target:
            return True
    return False`,
  codeNote: `Note that the \`s1\`-longer-than-\`s2\` guard is free here: \`range\` of a negative number is empty, so the
loop simply never runs.`,
  mistake: `> **Watch out.** Reaching for \`set\` instead of \`sorted\`, because "a rearrangement uses the same
> letters" sounds like a statement about **which** letters rather than **how many**. A set answers
> "which letters appear"; the question is "how many of each". The two agree on every \`s1\` without a
> repeat, which is every example anyone tries first. Measured: \`s1 = "aab", s2 = "abb"\` returns
> **\`True\`**, and the correct answer is \`False\` — \`abb\` has two \`b\`s where \`aab\` needs two \`a\`s.
> \`s1 = "aab", s2 = "eidbabooo"\` also returns \`True\` against a correct \`False\`.`,
  cost: `**Time \`O(n · k log k)\`**, \`n = len(s2)\`, \`k = len(s1)\`. There are \`n - k + 1\` window positions and each
pays a full sort of \`k\` characters. The cost is all in the re-sorting: no information survives from one
window to the next.

**Space \`O(k)\`.** One sorted copy of the window at a time.

Right when \`k\` is tiny and clarity matters more than speed, or as the opening move in an interview —
it takes one line to state, it is obviously correct, and it makes the next rung's motivation
("consecutive windows differ by two characters") land. It is also the oracle in the test suite below.

---`,
}
