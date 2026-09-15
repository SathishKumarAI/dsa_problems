// group-anagrams — approach 2 — The sorted letters as a hash-map key.
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "sorted",
  title: "The sorted letters as a hash-map key",
  idea: `*The scan re-derives a group's key once per comparison — what if that key were the group's name?*
Compute each word's sorted letters once and use the result as a key in a hash map whose values are
lists; every anagram lands on the same key automatically. *What limitation does this fix?* It deletes
the **search**: instead of asking each existing group "is this yours?", the word computes its own
label and the map finds the group in one lookup.`,
  intuition: `> **Intuition.** Stop walking the shelf looking for the right box and start reading the address off
> the parcel. The sorted letters are that address: \`"tea"\`, \`"eat"\` and \`"ate"\` all print \`aet\`, so
> all three are delivered to the same box without anyone comparing them to each other. Grouping
> stops being an algorithm and becomes a property of the map — compute the address, append, done.

The cost is now one sort per word rather than one sort per comparison, which is the difference
between \`n\` sorts and \`n²\` sorts. What remains payable is the \`log k\` inside each sort, and that is
what the next approach removes.

> **Why it works.** Sorting a word depends on its **multiset** of letters and nothing else: it
> throws away the original order and keeps only which letters appear and how often. So two words
> produce the same sorted string exactly when they hold the same letters with the same
> multiplicities — which is the definition of anagram. The "only if" half matters as much as the
> "if": a key that merged non-anagrams (the sum of the letter codes, say — \`ad\` and \`bc\` both give
> 197) would silently over-group.`,
  worked: `\`words = ["eat", "tea", "tan", "ate", "nat", "bat"]\`.

| Step | Word | \`_sorted_key\` (the key) | lookup | map state after |
|---|---|---|---|---|
| 1 | \`eat\` | \`aet\` | miss → new box | \`{aet: [eat]}\` |
| 2 | \`tea\` | \`aet\` | hit | \`{aet: [eat, tea]}\` |
| 3 | \`tan\` | \`ant\` | miss → new box | \`{aet: [eat, tea], ant: [tan]}\` |
| 4 | \`ate\` | \`aet\` | hit | \`{aet: [eat, tea, ate], ant: [tan]}\` |
| 5 | \`nat\` | \`ant\` | hit | \`{aet: [eat, tea, ate], ant: [tan, nat]}\` |
| 6 | \`bat\` | \`abt\` | miss → new box | \`{aet: [eat, tea, ate], ant: [tan, nat], abt: [bat]}\` |

Six sorts, six lookups, zero comparisons between words. Against the previous table: seven group
comparisons and fourteen canonicalisations became six.`,
  code: `def group_anagrams_sorted_key(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        groups.setdefault(_sorted_key(w), []).append(w)  # one sort per word, not per comparison
    return _in_required_order(list(groups.values()))`,
  mistake: `> **Watch out.** The misconception is that \`sorted(w)\` *is* the key, because it is what "the sorted
> word" means. It is a **list**, and a list is mutable and therefore unhashable — \`TypeError:
> unhashable type: 'list'\` the moment it runs. The key has to be something frozen: \`"".join(...)\`
> or \`tuple(...)\`.

Python is loud about this. Other languages are not: using an array *reference* as a key hashes by
identity rather than content, so every word gets its own group and the function cheerfully returns
\`n\` groups of one. That is the same mistake with the error message removed.`,
  cost: `**Time** \`O(n · k log k)\` to group, plus \`O(n · k log n)\` to order the required output; **space**
\`O(n · k)\`. The grouping time is one \`k log k\` sort per word and one constant-time map operation.
The output **sort** is a separate and at these sizes often larger term, worth naming out loud because
it is easy to quote "\`n k log k\`" for a function whose dominant line is actually the final ordering.

Use it whenever the alphabet is large or unknown — Unicode text, mixed case, words-as-tokens — since
sorting does not care what it is comparing while the count signature needs a fixed, small symbol set.
It is also the version to write first in an interview: one line of real logic, and it is easier to
say "and I can drop the \`log k\` by counting letters instead" than to start from the counting version
and justify it cold.

---`,
}
