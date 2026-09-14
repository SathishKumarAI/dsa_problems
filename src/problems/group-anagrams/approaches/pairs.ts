// group-anagrams — approach 1 — Brute force: compare each word against the groups built so far.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "pairs",
  title: "Brute force: compare each word against the groups built so far",
  idea: `*What is the most direct thing that could possibly work?* Keep a list of groups; for each new word,
walk the groups and test it against each group's first member — if they are anagrams, join that
group, and if none matches, start a new one. *Why is that not the answer?* Because it never commits
to a label, so every word re-derives "are these anagrams?" from scratch against every group it does
*not* belong to, and the cost of placing one word grows with the number of groups already built.`,
  intuition: `> **Intuition.** Sorting laundry on a bed with no labels on the piles. Each new sock is held up
> against the top sock of pile one, then pile two, then pile three, until one matches or you run out
> of piles and start a fourth. Holding two socks up to each other is itself work — you have to lay
> both of them out flat to compare — and you do it again and again against piles you already know
> this sock does not belong to. The waste has two halves, and the expensive half is the **search**,
> not the test: even if comparing two socks were instant, walking every pile for every sock would
> still be quadratic.

Testing one pair means canonicalising both words, which costs \`k log k\` per word, and the search
over groups means doing that test up to \`n\` times per word. Correctness is easy: anagram-ness is
transitive, so every member of a group is an anagram of every other, and testing against a single
representative is as good as testing against all of them.`,
  worked: `\`words = ["eat", "tea", "tan", "ate", "nat", "bat"]\`. One row per word; each comparison canonicalises
both the group's first member and the candidate.

| Step | Word | \`_sorted_key(word)\` | groups compared against | comparisons | \`groups\` after |
|---|---|---|---|---|---|
| 1 | \`eat\` | \`aet\` | none | 0 | \`[[eat]]\` |
| 2 | \`tea\` | \`aet\` | \`eat\`→\`aet\` ✓ | 1 | \`[[eat, tea]]\` |
| 3 | \`tan\` | \`ant\` | \`eat\`→\`aet\` ✗ | 1 | \`[[eat, tea], [tan]]\` |
| 4 | \`ate\` | \`aet\` | \`eat\`→\`aet\` ✓ | 1 | \`[[eat, tea, ate], [tan]]\` |
| 5 | \`nat\` | \`ant\` | \`eat\`→\`aet\` ✗, \`tan\`→\`ant\` ✓ | 2 | \`[[eat, tea, ate], [tan, nat]]\` |
| 6 | \`bat\` | \`abt\` | \`eat\`→\`aet\` ✗, \`tan\`→\`ant\` ✗ | 2 | \`[[eat, tea, ate], [tan, nat], [bat]]\` |

Seven group comparisons for six words, and therefore fourteen canonicalisations — the representative
\`"eat"\` was canonicalised five separate times, once for every word ever compared against its group.
Finally \`_in_required_order\` gives \`[[ate, eat, tea], [bat], [nat, tan]]\`.`,
  code: `def group_anagrams_pairwise(words: list[str]) -> list[list[str]]:
    groups: list[list[str]] = []
    for w in words:
        key = _sorted_key(w)
        for g in groups:
            if _sorted_key(g[0]) == key:  # re-derives the representative's key every time
                g.append(w)
                break
        else:
            groups.append([w])
    return _in_required_order(groups)`,
  mistake: `> **Watch out.** The misconception is that a word might belong to **two** groups, so the loop had
> better keep looking after it finds a match. It cannot: anagram groups are disjoint by definition,
> and a word that has been placed must stop being a candidate immediately. Dropping the \`break\` (or
> the \`for…else\`) lets a word be appended and then, later in the same walk, compared as though it
> were still homeless.

The related error is comparing the candidate against *every* member of a group rather than its
first. It is not wrong — they are all anagrams of each other — but it multiplies the work by the
group size to learn something the representative already told you.`,
  cost: `**Time** \`O(n² · k log k)\`, **space** \`O(n · k)\`. The time is three factors multiplied: up to \`n\`
groups scanned per word, \`n\` words, and \`k log k\` to canonicalise the two words being compared. The
space is the **output** itself — every input word appears exactly once across the groups — plus the
temporary keys, which are discarded.

Use it when \`n\` is a handful and you want the shortest code that needs no map, or as the reference
implementation a harness checks the fast versions against, which is its job in the script below. At
\`n = 10^4\` with no anagrams present it performs about fifty million canonicalisations, so it is not
viable at the stated input size.

---`,
}
