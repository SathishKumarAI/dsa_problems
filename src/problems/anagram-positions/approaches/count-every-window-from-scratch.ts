// anagram-positions — approach 2 — Count every window from scratch.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "count-every-window-from-scratch",
  title: "Count every window from scratch",
  idea: `*Sorting produces an ordering the question never asked for — what does the question actually
compare?* Counts. So build a 26-slot tally for the pattern once, and for each window build a fresh
26-slot tally and compare the two. Same answer, and counting \`k\` characters is cheaper than sorting
them.

This fixes Approach 1's weakness — **it pays \`k log k\` to impose an ordering, then throws the
ordering away without ever using it.**`,
  intuition: `> **Intuition.** Instead of alphabetising the Scrabble tiles, keep a scoresheet with twenty-six
> boxes, one per letter, and tick a box for each tile in your hand. Two hands are anagrams exactly
> when their scoresheets are identical, and comparing two scoresheets is twenty-six glances no
> matter how many tiles were in the hands. The tiles' arrangement never mattered, and now it is
> never computed. What is still wasteful is the *fresh* scoresheet: you tear it up and start
> ticking from zero for the next hand, even though that hand shares all but two of its tiles with
> the one you just scored.`,
  worked: `\`text = "cbaebabacd"\`, \`pattern = "abc"\`, so \`want = {a: 1, b: 1, c: 1}\` and every other slot 0.
Only the non-zero slots of each window's tally are shown; every unshown slot is 0 in both tallies.

| start       | window  | tally built from scratch | equals\`want\`?             |
| ----------- | ------- | ------------------------ | --------------------------- |
| **0** | \`cba\` | \`a:1 b:1 c:1\`          | **yes → record 0**   |
| 1           | \`bae\` | \`a:1 b:1 e:1\`          | no —\`c\` is 0, \`e\` is 1 |
| 2           | \`aeb\` | \`a:1 b:1 e:1\`          | no                          |
| 3           | \`eba\` | \`a:1 b:1 e:1\`          | no                          |
| 4           | \`bab\` | \`a:1 b:2\`              | no —\`b\` is 2, \`c\` is 0 |
| 5           | \`aba\` | \`a:2 b:1\`              | no                          |
| **6** | \`bac\` | \`a:1 b:1 c:1\`          | **yes → record 6**   |
| 7           | \`acd\` | \`a:1 c:1 d:1\`          | no                          |

Answer \`[0, 6]\`. Twenty-four character reads (eight windows × three characters) plus eight
twenty-six-slot comparisons. Compare rows 3 and 4: the tally changed by exactly two slots — \`e\`
dropped from 1 to 0, \`b\` rose from 1 to 2 — yet all three characters were re-read to discover it.`,
  code: `def anagram_positions_count_every_window(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    want = [0] * 26
    for ch in pattern:
        want[ord(ch) - 97] += 1
    out: list[int] = []
    for start in range(len(text) - k + 1):
        have = [0] * 26
        for ch in text[start : start + k]:
            have[ord(ch) - 97] += 1
        if have == want:
            out.append(start)
    return out`,
  mistake: `> **Watch out.** The misconception is that the waste worth removing is the **allocation** inside
> the loop. The waste is the recount — and reusing a tally without subtracting what left is not
> reuse, it is a leak.

Hoisting \`have = [0] * 26\` out of the loop — usually in the name of "not allocating in a loop" — so
that one tally is reused without being cleared:

\`\`\`python
    have = [0] * 26                    # WRONG — hoisted, so counts accumulate across windows
    for start in range(len(text) - k + 1):
        for ch in text[start : start + k]:
            have[ord(ch) - 97] += 1
        if have == want:
            out.append(start)
\`\`\`

Every window's letters pile on top of the previous window's, so after the first window the tally
describes a growing prefix of the text rather than any window at all. On the worked example this
returns **[0]** instead of \`[0, 6]\`: the first window is measured correctly because the tally starts
empty, and everything after it is measured against garbage that only ever grows.

The bug is instructive because the *instinct* behind it is right — reusing the tally instead of
rebuilding it is exactly what the next rung does. The missing half is that reuse requires
**subtracting what left**, not just adding what arrived. Reuse without eviction is not an
optimization, it is a leak.`,
  cost: `**Time** \`O(n · k)\`, **space** \`O(1)\`. The time is the number of windows times \`k\` reads to fill the tally,
plus a fixed 26-step comparison per window that vanishes into the constant. The space is two 26-slot
arrays — fixed size regardless of the input, which is why this counts as \`O(1)\` and not \`O(k)\`: that is
the bounded-alphabet constraint paying out.

Dropping the \`log k\` is a genuine improvement but at the stated limits \`n · k\` is still about 10⁹ and
will not pass. Use it when the pattern is very short — for \`k = 2\` or \`k = 3\` the constant factors
make it competitive with anything — or when the candidate windows are not adjacent, so there is no
shared work to exploit and the tally cannot be slid.

---`,
}
