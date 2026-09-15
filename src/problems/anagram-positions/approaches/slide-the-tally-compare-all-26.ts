// anagram-positions — approach 3 — Slide the tally, compare all 26.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "slide-the-tally-compare-all-26",
  title: "Slide the tally, compare all 26",
  idea: `*Neighbouring windows share all but two of their letters — so why is the tally rebuilt?* It need not
be. Keep one tally and update it as the frame moves: add the letter entering on the right, subtract
the letter leaving on the left. Two operations per step instead of \`k\`, and then the same 26-slot
comparison decides the window.

This fixes Approach 2's weakness — **it re-reads all \`k\` characters of a window that differs from
its predecessor by exactly two letters.**`,
  intuition: `> **Intuition.** The frame moves one step. Exactly one letter walks in the front door and exactly
> one walks out the back, and everybody else in the room stays put. So do not re-take the register
> — adjust it by two lines. A single loop over the text does both jobs at once if you think of
> index \`i\` as "the letter entering" and index \`i - k\` as "the letter leaving at the same moment":
> the window is complete from \`i = k - 1\` onward, which is exactly when you start reading verdicts
> off the tally. The one thing still repeated at every step is the *comparison* — twenty-six slots
> checked, of which at most two could possibly have changed.`,
  worked: `\`text = "cbaebabacd"\`, \`pattern = "abc"\`, \`k = 3\`, \`want = {a: 1, b: 1, c: 1}\`. One loop over the
text; the window is \`text[i-k+1 .. i]\` once \`i >= 2\`.

| \`i\`       | letter in | letter out (\`text[i-3]\`) | tally after both updates | window  | verdict                           |
| ----------- | --------- | -------------------------- | ------------------------ | ------- | --------------------------------- |
| 0           | \`c\`     | —                         | \`c:1\`                  | —      | too early                         |
| 1           | \`b\`     | —                         | \`b:1 c:1\`              | —      | too early                         |
| **2** | \`a\`     | —                         | \`a:1 b:1 c:1\`          | \`cba\` | **equals want → record 0** |
| 3           | \`e\`     | \`c\`                      | \`a:1 b:1 e:1\`          | \`bae\` | no                                |
| 4           | \`b\`     | \`b\`                      | \`a:1 b:1 e:1\`          | \`aeb\` | no                                |
| 5           | \`a\`     | \`a\`                      | \`a:1 b:1 e:1\`          | \`eba\` | no                                |
| 6           | \`b\`     | \`e\`                      | \`a:1 b:2\`              | \`bab\` | no                                |
| 7           | \`a\`     | \`b\`                      | \`a:2 b:1\`              | \`aba\` | no                                |
| **8** | \`c\`     | \`a\`                      | \`a:1 b:1 c:1\`          | \`bac\` | **equals want → record 6** |
| 9           | \`d\`     | \`b\`                      | \`a:1 c:1 d:1\`          | \`acd\` | no                                |

Answer \`[0, 6]\`. Rows 4 and 5 are the payoff: the incoming and outgoing letters happen to be the same
letter, the tally is untouched, and the window still had to be judged — twenty-six comparisons to
confirm that literally nothing changed. That is the waste the last rung removes.`,
  code: `def anagram_positions_slide_the_tally(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    if k > len(text):
        return []
    want = [0] * 26
    have = [0] * 26
    for ch in pattern:
        want[ord(ch) - 97] += 1
    out: list[int] = []
    for i, ch in enumerate(text):
        have[ord(ch) - 97] += 1
        if i >= k:
            have[ord(text[i - k]) - 97] -= 1
        if i >= k - 1 and have == want:
            out.append(i - k + 1)
    return out`,
  codeNote: `The \`k > len(text)\` guard is now necessary: without it, a pattern longer than the text leaves the
loop comparing a partially-filled tally, and \`i >= k - 1\` never becomes true only by luck of the
arithmetic. State it explicitly rather than relying on that.`,
  mistake: `> **Watch out.** The misconception is that the letter leaving the window is the window's **start
> index**. When \`i\` arrives the window becomes \`[i-k+1, i]\`, so \`i - k + 1\` is the letter that
> stays as the new leftmost member and \`i - k\` is the one that just fell off the back.

Evicting the wrong letter — \`text[i - k + 1]\` instead of \`text[i - k]\`. The \`+ 1\` looks right because
\`i - k + 1\` is the window's *start* index, and "the start of the window" feels like the thing that
leaves. It is not: when \`i\` arrives, the window becomes \`text[i-k+1 .. i]\`, so \`i - k + 1\` is the
letter that is *staying* as the new leftmost member, and \`i - k\` is the one that just fell off the
back.

The result is a tally that is neither the old window nor the new one. On the worked example the buggy
version returns **[0, 3, 4, 5]** instead of \`[0, 6]\` — it keeps the correct first answer, then
invents three consecutive false positives at 3, 4 and 5 and misses the genuine answer at 6.
Three *plausible-looking* wrong answers in a row is worse than a crash: nothing about the output
announces that it is garbage.

The reliable way to get this right is to write down what the window is before you write the index:
after processing \`i\`, the window is \`[i-k+1, i]\` inclusive. Both \`i - k\` (just left) and \`i - k + 1\`
(the reported start) then read off that line directly.`,
  cost: `**Time** \`O(26n)\`, **space** \`O(1)\`. The \`k\` is gone from the time — each character of the text is added once
and subtracted once, which is the sliding — but a 26-slot comparison still runs at every one of the n
positions, so the alphabet size survives as a constant factor. The space is the same two fixed arrays.

At the stated limits this is roughly 8 · 10⁵ comparisons and passes comfortably, which is worth
saying plainly: **for this problem, this rung is fast enough.** Write it when you want the shortest
correct code that passes, and when the pattern's alphabet is small. It is also the right rung when
the comparison is genuinely cheap or genuinely rare — if you only need to test the window every so
often rather than at every position, maintaining an incremental summary buys nothing.

---`,
}
