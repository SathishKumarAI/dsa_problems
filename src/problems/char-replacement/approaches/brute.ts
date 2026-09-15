// char-replacement — approach 1 — Every stretch, tallied from its own start
//
// Converted from docs/deep/char-replacement_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "brute",
  title: "Every stretch, tallied from its own start",
  idea: `*How do I know whether a stretch is affordable?* Take every start, extend the end one character at a
time, keep a running tally since that start, and after each extension check
\`rewrites_needed(length, max(tally)) <= k\`. Remember the longest stretch that ever passed.`,
  intuition: `> **Intuition.** You stand at a position and read forward with a clipboard, marking a tick per letter.
> At each step you glance at the clipboard, find the tallest column, and count how many characters are
> *not* in it — that is the paint bill. Within budget? Note the length. Then you step to the next
> starting position, tear off a **fresh** clipboard, and do it all again. The tally survives within one
> start, which already beats recounting the substring from scratch; it is thrown away every time the
> start moves, and that discarded knowledge is what makes this quadratic.`,
  worked: `\`s = "AABABBA"\`, \`k = 1\`. State per start — the furthest end that stayed affordable:

| start \`i\` | char | longest affordable stretch | ends at \`j\` | length | \`best\` after |
|---|---|---|---|---|---|
| 0 | \`A\` | \`AABA\` | 3 | **4** | 4 |
| 1 | \`A\` | \`ABA\` | 3 | 3 | 4 |
| 2 | \`B\` | \`BABB\` | 5 | **4** | 4 |
| 3 | \`A\` | \`ABB\` | 5 | 3 | 4 |
| 4 | \`B\` | \`BBA\` | 6 | 3 | 4 |
| 5 | \`B\` | \`BA\` | 6 | 2 | 4 |
| 6 | \`A\` | \`A\` | 6 | 1 | 4 |

Seven starts, 28 extensions, 28 separate 26-slot \`max()\` scans — to describe a seven-character string.
Two different starts, 0 and 2, both reach the answer 4. Hold on to that.`,
  code: `def char_replacement_every_substring(s: str, k: int) -> int:
    best = 0
    for i in range(len(s)):
        counts = [0] * ALPHABET  # reset per start: a new start is a new stretch
        for j in range(i, len(s)):
            counts[slot(s[j])] += 1
            if rewrites_needed(j - i + 1, max(counts)) <= k:  # max() rescans all 26 slots
                best = max(best, j - i + 1)
    return best`,
  mistake: `> **Watch out.** Hoisting \`counts = [0] * ALPHABET\` out of the outer loop, to "avoid reallocating an
> array 100,000 times". The misconception is that the reset is **overhead**; it is a *statement* — a
> new start means a new stretch. Leave the tally accumulating across starts and every stretch is judged
> against characters that are not in it. Measured: the statement's example returns **6** where the
> answer is 4; \`"AABBBCC"\` with \`k = 0\` returns **6** where the answer is 3; \`"ABCDE"\` with \`k = 0\`
> returns **3** where the answer is 1. All three are too *large* — inflated tallies make everything
> look affordable.`,
  cost: `**Time \`O(n² · 26)\`.** Two nested walks give n²/2 stretches, and each extension pays a 26-slot scan to
find the most frequent letter, so the 26 is a genuine multiplier.

**Space \`O(1)\`.** One fixed 26-slot array, constant because the alphabet is bounded.

Use it as the oracle — short enough to be obviously correct, which is exactly what you want on the
other side of a cross-check, and that is its job in the test suite below.

---`,
}
