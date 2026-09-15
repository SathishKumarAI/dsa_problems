// permutation-in-string — approach 2 — Slide a tally, compare all 26 counts each step
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
  rung: "tally",
  title: "Slide a tally, compare all 26 counts each step",
  idea: `*Consecutive windows differ by two characters — why rebuild the whole description?* Keep one 26-slot
tally of the window's letters. Moving the window increments one slot for the entering letter and
decrements one for the leaving letter; the tally itself is never rebuilt.

This fixes Approach 1's weakness: **each window is re-derived from its own characters, so every
character is sorted once for every window containing it.**`,
  intuition: `> **Intuition.** Instead of a handful of tiles, keep a scoreboard with twenty-six columns. A letter
> entering the window is a tick in one column; a letter leaving is a tick removed from another. Two
> pencil strokes per step, whatever the window's width — the middle of the window is never touched,
> because nothing in the middle changed. What is still clumsy is the **check**: after those two strokes
> you read all twenty-six columns and compare them against the target scoreboard, when at most two of
> them could possibly differ from what you already knew.`,
  worked: `\`s1 = "ab"\`, \`s2 = "eidbaooo"\`, so \`need = {a: 1, b: 1}\`. Only non-zero counts are shown; the window is
short until index 1 because the tally is filled in as it goes:

| \`i\` | enters | leaves | window | \`have\` (non-zero) | \`have == need\`? |
|---|---|---|---|---|---|
| 0 | \`e\` | — | \`e\` | \`{e: 1}\` | no |
| 1 | \`i\` | — | \`ei\` | \`{e: 1, i: 1}\` | no |
| 2 | \`d\` | \`e\` | \`id\` | \`{d: 1, i: 1}\` | no |
| 3 | \`b\` | \`i\` | \`db\` | \`{b: 1, d: 1}\` | no |
| 4 | \`a\` | \`d\` | \`ba\` | \`{a: 1, b: 1}\` | **yes — return \`True\`** |

> **Why it works.** The comparison is safe during the first \`k - 1\` steps, when the window is not yet
> full width, and it is worth knowing why rather than trusting it. \`have\` sums to \`i + 1\` while \`need\`
> sums to \`len(s1)\`, so while \`i + 1 < len(s1)\` the two arrays have different totals and cannot be
> equal. No guard is needed; the arithmetic supplies one.`,
  code: `def permutation_in_string_compare_all_counts(s1: str, s2: str) -> bool:
    if len(s1) > len(s2):
        return False
    need = tally(s1)
    have = [0] * ALPHABET
    for i, ch in enumerate(s2):
        have[slot(ch)] += 1
        if i >= len(s1):
            have[slot(s2[i - len(s1)])] -= 1  # one enters, one leaves: the width is fixed
        if have == need:
            return True
    return False`,
  mistake: `> **Watch out.** Forgetting the removal — writing only the increment, so the "window" silently becomes
> a **prefix** that grows forever. The misconception is that a sliding window is about the entering
> character, when it is about entering *and* leaving in the same breath; the leaving half is what keeps
> the width fixed and is the half people drop. It fails in a way designed to fool you: on
> \`s1 = "ab", s2 = "baxyz"\`, where the match sits at index 0, the prefix version returns **\`True\`** and
> looks correct. On the statement's own example, \`s1 = "ab", s2 = "eidbaooo"\`, it returns **\`False\`**
> against a correct \`True\`, and on \`s1 = "ab", s2 = "xyzab"\` it returns **\`False\`** too. A match
> anywhere but the very start is lost.`,
  cost: `**Time \`O(26 · n)\`.** The tally maintenance is two operations per step, so the sliding itself is
linear; the 26 comes entirely from comparing the full arrays after every move. Bounded by the alphabet
constraint, so this is genuinely \`O(n)\` with a constant near 26 — not a hidden quadratic.

**Space \`O(1)\`.** Two fixed 26-slot arrays, whatever the input length.

Right whenever the input is small enough that a 26× constant is invisible, which at \`n = 10⁴\` it
certainly is. Write it in an interview if you are short on time — it passes, it is easy to get right,
and it leaves you somewhere honest to improve *from*.

---`,
}
