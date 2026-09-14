// anagram-positions — approach 4 — Slide the tally, carry an agreement counter (optimal).
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "optimal",
  title: "Slide the tally, carry an agreement counter (optimal)",
  idea: `*A slide changes exactly two letters — so how many of the twenty-six verdicts can possibly change?*
At most two. Carry a single integer saying **how many of the 26 letters currently have the right
count**, and update it only for the two letters that moved. A window is an anagram exactly when that
integer is 26, so the whole alphabet is never walked again.

This fixes Approach 3's weakness — **it recomputes a twenty-six-part comparison at every position,
when only the letters whose own counts changed could possibly have flipped their verdict.**`,
  intuition: `> **Intuition.** Keep a scoreboard reading *"23 of 26 letters are currently correct"* rather than
> re-reading all twenty-six boxes. When a letter's count changes, its verdict is the only one that
> can move, so the update is mechanical: before you touch a letter, check whether it *was* correct
> and subtract it from the score if so; change its count; then check whether it *is* correct and
> add it back if so. That is at most two points of movement per letter touched, and two letters
> are touched per slide. The subtle part is the starting value — the score begins as the number of
> letters that already agree with an empty window, which is every letter the pattern does not
> contain — and once you see that, the rest is a summary being maintained rather than recomputed.

The transferable move is worth saying on its own: **keep a summary of the comparison, and update the
summary exactly where the data changed.** That is the same trick that turns the
minimum-window-substring check from "are all required letters satisfied" into one integer, and it
generalises anywhere a verdict is a conjunction of many independent small verdicts.

> **Why it works.** One observation carries the whole rung: **only a letter whose own count
> changed can flip its verdict.** Every other letter's \`have\` and \`want\` are untouched, so their
> agreement is exactly what it was a step ago. A slide changes two letters, so at most two
> verdicts move, and \`agree\` stays equal to the true number of matching letters provided each
> change unbooks the old verdict before the count moves and books the new one after. \`agree == 26\`
> is then the same statement as \`have == want\`, at one integer comparison instead of 26.`,
  worked: `\`text = "cbaebabacd"\`, \`pattern = "abc"\`, \`k = 3\`. The window starts empty, so \`have\` is all zeros
and the letters that already agree are the 23 letters the pattern does not use: **\`agree\` starts at
23.**

| \`i\`       | in    | out   | what moved                                             | \`agree\` after | window  | verdict                  |
| ----------- | ----- | ----- | ------------------------------------------------------ | --------------- | ------- | ------------------------ |
| 0           | \`c\` | —    | \`c\` 0→1, now correct                                | 24              | —      | too early                |
| 1           | \`b\` | —    | \`b\` 0→1, now correct                                | 25              | —      | too early                |
| **2** | \`a\` | —    | \`a\` 0→1, now correct                                | **26**    | \`cba\` | **26 → record 0** |
| 3           | \`e\` | \`c\` | \`e\` 0→1 breaks (25); \`c\` 1→0 breaks (24)         | 24              | \`bae\` | no                       |
| 4           | \`b\` | \`b\` | \`b\` 1→2 breaks (23); \`b\` 2→1 fixes (24)          | 24              | \`aeb\` | no                       |
| 5           | \`a\` | \`a\` | \`a\` 1→2 breaks (23); \`a\` 2→1 fixes (24)          | 24              | \`eba\` | no                       |
| 6           | \`b\` | \`e\` | \`b\` 1→2 breaks (23); \`e\` 1→0 fixes (24)          | 24              | \`bab\` | no                       |
| 7           | \`a\` | \`b\` | \`a\` 1→2 breaks (23); \`b\` 2→1 fixes (24)          | 24              | \`aba\` | no                       |
| **8** | \`c\` | \`a\` | \`c\` 0→1 fixes (25); \`a\` 2→1 fixes (**26**) | **26**    | \`bac\` | **26 → record 6** |
| 9           | \`d\` | \`b\` | \`d\` 0→1 breaks (25); \`b\` 1→0 breaks (24)         | 24              | \`acd\` | no                       |

Answer \`[0, 6]\`. Compare this table with Approach 3's: identical tallies underneath, but the verdict
column now costs one integer comparison instead of twenty-six. Rows 4 and 5 — where the same letter
entered and left — show the counter dip and recover within a single step, which is exactly the
behaviour the "check before, change, check after" ordering is there to produce.`,
  code: `def anagram_positions_agreement_counter(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    if k > len(text):
        return []
    want = [0] * 26
    have = [0] * 26
    for ch in pattern:
        want[ord(ch) - 97] += 1
    agree = sum(1 for i in range(26) if want[i] == have[i])
    out: list[int] = []

    def touch(letter: int, delta: int) -> None:
        nonlocal agree
        if have[letter] == want[letter]:
            agree -= 1          # it agreed before the change, so it may not after
        have[letter] += delta
        if have[letter] == want[letter]:
            agree += 1

    for i, ch in enumerate(text):
        touch(ord(ch) - 97, 1)
        if i >= k:
            touch(ord(text[i - k]) - 97, -1)
        if i >= k - 1 and agree == 26:
            out.append(i - k + 1)
    return out`,
  mistake: `> **Watch out.** The misconception is that \`agree\` is a tally of **good events**. It is a claim
> about the present state, so every change owes it a correction in both directions: unbook,
> change, book.

Only ever raising the counter — checking equality *after* the change but never *before* it:

\`\`\`python
    def touch(letter: int, delta: int) -> None:
        nonlocal agree
        have[letter] += delta
        if have[letter] == want[letter]:   # WRONG — nothing ever subtracts
            agree += 1
\`\`\`

A letter that *was* correct and has just become incorrect still counts towards \`agree\`, so the
counter ratchets upward and eventually reaches 26 for windows that are nothing of the kind. On the
worked example this returns **[0, 1]** instead of \`[0, 6]\`: index 0 is right, index 1 is a pure
fabrication (\`"bae"\` is not an anagram of \`"abc"\`), and the real answer at index 6 is swamped by a
counter that stopped meaning anything several steps earlier.

The reason the before-check is not optional is that \`agree\` is not a tally of good events; it is a
*claim about the current state* — "this many letters match right now". Every line that changes the
state owes the counter a correction in both directions. Hence the three-step shape: unbook the old
verdict, change the data, book the new verdict.

A second bug in the same area, worth recognising: initialising \`agree = 0\` instead of counting the
letters that already agree with an empty window. The counter then tops out at 3 on this example
rather than 26 and the function returns **[]** — no answers at all. Starting from an empty window
means 23 letters are already correct, and the loop's job is to earn the other three.`,
  cost: `**Time** \`O(n)\`, **space** \`O(1)\`. The time is truly linear now: one pass over the text, and each step does
at most two \`touch\` calls, each of which is a constant number of array reads and integer
comparisons — the alphabet appears only once, in the initial \`sum(...)\` over 26 slots, which is a
one-off. Space is the two fixed 26-slot arrays and one integer.

**This is the one to understand cold**, though not necessarily the one to write first. On this
problem it beats Approach 3 by a constant factor of about 26, which matters at 3 · 10⁴ characters
only mildly — but it matters enormously when the alphabet is large. Swap lowercase letters for
Unicode, or for a pattern over a million distinct tokens, and Approach 3's per-step comparison
becomes the dominant cost while this one does not change at all. Use it whenever the per-step
verdict is a comparison over many independent parts and each step touches only a few of them.

---`,
}
