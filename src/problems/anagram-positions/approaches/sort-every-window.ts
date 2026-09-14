// anagram-positions — approach 1 — Sort every window.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "sort-every-window",
  title: "Sort every window",
  idea: `*How do I know whether two strings are anagrams?* Put both into a canonical order and compare them
as strings. Two strings are anagrams exactly when their sorted forms are identical, so sort the
pattern once, then sort each window of the text and check for equality.`,
  intuition: `> **Intuition.** This is the dictionary definition, typed. Think of each window as a handful of
> Scrabble tiles: to compare two handfuls you line both up alphabetically on the rack and see
> whether the two rows look the same. It is obviously correct, which is its whole value — you can
> hand it to someone who has never seen the problem and they will agree it works. The waste is
> equally obvious once you look for it: alphabetising a handful is a lot of effort to answer a
> question that does not care about alphabetical order, and you throw the sorted row away and
> start over for the next handful, which differs from it by one tile.`,
  worked: `\`text = "cbaebabacd"\`, \`pattern = "abc"\`, so \`target = ['a', 'b', 'c']\` and \`k = 3\`.

| start       | window  | sorted window | equals target?            |
| ----------- | ------- | ------------- | ------------------------- |
| **0** | \`cba\` | \`abc\`       | **yes → record 0** |
| 1           | \`bae\` | \`abe\`       | no                        |
| 2           | \`aeb\` | \`abe\`       | no                        |
| 3           | \`eba\` | \`abe\`       | no                        |
| 4           | \`bab\` | \`abb\`       | no                        |
| 5           | \`aba\` | \`aab\`       | no                        |
| **6** | \`bac\` | \`abc\`       | **yes → record 6** |
| 7           | \`acd\` | \`acd\`       | no                        |

Answer \`[0, 6]\`. Eight windows, eight sorts of three characters each. Rows 1, 2 and 3 are worth
staring at: three different windows that all sort to \`abe\`, because they are the same three letters
being shuffled. Three separate sorts to discover that nothing changed except the arrangement.`,
  code: `def anagram_positions_sort_every_window(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    target = sorted(pattern)
    out: list[int] = []
    for start in range(len(text) - k + 1):
        if sorted(text[start : start + k]) == target:
            out.append(start)
    return out`,
  codeNote: `Note that \`range(len(text) - k + 1)\` is empty when the pattern is longer than the text, so the
"no windows at all" case needs no guard here.`,
  mistake: `> **Watch out.** The misconception is that *the same letters* is a question about **membership**.
> It is a question about multiplicity: a set records which letters appear and has already thrown
> away how many times.

Reaching for a \`set\` instead of \`sorted\`, because "same letters" sounds like a set question:

\`\`\`python
    target = set(pattern)
    ...
        if set(text[start : start + k]) == target:   # WRONG — a set forgets multiplicity
\`\`\`

A set records *which* letters appear and discards *how many times*, and an anagram is precisely a
statement about how many times. On the worked example this bug is completely invisible — it still
returns **[0, 6]**, because \`"abc"\` has no repeated letters and neither does any near-miss window.
That invisibility is what makes it dangerous: it passes the example in the problem statement.
Run it on \`text = "aab"\`, \`pattern = "abb"\` and it returns **[0]** where the right answer is **[]** —
\`{a, b} == {a, b}\`, so it happily calls \`"aab"\` an anagram of \`"abb"\`.

The fix is not "use a set plus a length check" — the lengths are equal by construction here, so that
adds nothing. The fix is to compare something that carries multiplicity: a sorted sequence, or
better, a tally.`,
  cost: `**Time** \`O(n · k log k)\`, **space** \`O(k)\`. The time is the number of windows, roughly n, times the cost of
sorting one window, \`k log k\` — so it degrades with both the text length and the pattern length, and
it is the only rung here whose cost depends on \`k\` at all after the tally arrives. The space is the
sorted copy of one window plus the sorted pattern, both \`k\` characters.

At the stated limits — text and pattern both up to \`3 · 10^4\` — this is on the order of 10⁹
character comparisons and will not pass. Use it when the "windows" are not windows at all: if you
have a scattered list of candidate strings with no structure between them, there is nothing to slide
and sorting each one is entirely reasonable. It is also the clearest possible oracle for a test
harness, which is its job at the bottom of this document.

---`,
}
