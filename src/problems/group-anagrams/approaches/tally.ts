// group-anagrams — approach 3 — The 26-letter count signature as the key (optimal).
//
// All six parts docs/deep/README.md §3 requires. `rung` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file `doc.ts` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: "tally",
  title: "The 26-letter count signature as the key (optimal)",
  idea: `*Sorting a word produces a label, but sorting is more than labelling — can the label be built without
ordering anything?* Count how many of each of the twenty-six letters the word contains and use that
tally as the key; two anagrams have identical tallies by definition. *What limitation does this fix?*
It removes the \`log k\` inside the key computation: the tally is built in one pass, so labelling costs
\`k\` rather than \`k log k\`.`,
  intuition: `> **Intuition.** A row of twenty-six pigeonholes, one per letter, and you drop a pebble into a hole
> for each character of the word. Two anagrams leave the pigeonholes in exactly the same state,
> because they are the same pebbles arriving in a different order — and the state is all you keep.
> Reading the row left to right gives the key. Nothing was ever compared to anything, and the row
> has a fixed number of holes no matter how long the word is.

A sorted string and a letter tally carry **exactly** the same information — both are the multiset of
letters, nothing more — so the sort was never buying anything extra, only costing more to produce.
The constraint doing the work is the alphabet: with twenty-six possible letters, \`ord(ch) - A\` maps
each letter to its own slot, so the tally is a plain fixed-size array with no hashing and no growth.

> **Why it works.** The key is the multiset itself, written down. Two words share a \`_count_key\`
> exactly when every letter occurs the same number of times in both — that *is* the definition of
> anagram, so the key neither splits a group nor merges two. The one way to break the "no merging"
> half is in the **rendering**: twenty-six numbers flattened into one string are only distinguishable
> if the boundaries between them survive, which is what the comma is for.

**The constraint this rung exploits, and what breaks without it:** it needs a small, known alphabet.
Lowercase English gives twenty-six slots. Allow uppercase and you need fifty-two and a different index
formula; allow arbitrary Unicode and a fixed array is impossible, at which point the key becomes a
sorted list of \`(character, count)\` pairs — which has re-introduced a sort, making Approach 2 the
better answer again. The technique is not universally superior; it is what this alphabet permits.`,
  worked: `\`words = ["eat", "tea", "tan", "ate", "nat", "bat"]\`. Only the non-zero pigeonholes are listed; the
full key is written out once below so the shape is concrete.

| Step | Word | non-zero counts | key | map state after |
|---|---|---|---|---|
| 1 | \`eat\` | a=1, e=1, t=1 | \`K_aet\` | \`{K_aet: [eat]}\` |
| 2 | \`tea\` | a=1, e=1, t=1 | \`K_aet\` | \`{K_aet: [eat, tea]}\` |
| 3 | \`tan\` | a=1, n=1, t=1 | \`K_ant\` | \`{K_aet: [eat, tea], K_ant: [tan]}\` |
| 4 | \`ate\` | a=1, e=1, t=1 | \`K_aet\` | \`{K_aet: [eat, tea, ate], K_ant: [tan]}\` |
| 5 | \`nat\` | a=1, n=1, t=1 | \`K_ant\` | \`{K_aet: [eat, tea, ate], K_ant: [tan, nat]}\` |
| 6 | \`bat\` | a=1, b=1, t=1 | \`K_abt\` | \`{K_aet: […], K_ant: […], K_abt: [bat]}\` |

\`K_aet\` written out is \`1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0\` — twenty-six numbers,
with 1s at slots 0 (\`a\`), 4 (\`e\`) and 19 (\`t\`). Building it cost three increments and a render; no
sorting happened.`,
  code: `def group_anagrams(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        groups.setdefault(_count_key(w), []).append(w)
    return _in_required_order(list(groups.values()))`,
  codeNote: `\`tuple(counts)\` works just as well as a key and skips the rendering entirely — tuples are hashable
and compare by content, which removes the separator trap by construction. The joined string is used
here because it is what translates directly into Java and C++, where a \`String\` key is the path of
least resistance.`,
  mistake: `> **Watch out.** The misconception is that the separator inside a flattened key is **formatting**,
> so \`"".join(...)\` and \`",".join(...)\` differ only in how the key looks. The separator is part of
> the correctness argument: without it, the tallies \`[1, 11, 0, …]\` and \`[11, 1, 0, …]\` both render
> as \`"111…"\` and two words that are not anagrams are merged into one group.

It passes every test built from short words, because a count only reaches 10 when one letter appears
ten times in a single word — and then it fails silently rather than loudly. With \`k\` up to 100 that
is reachable, not theoretical. The lesson generalises: whenever you flatten a sequence of numbers
into a string key, the delimiter is load-bearing.`,
  cost: `**Time** \`O(n · k)\` to group, plus \`O(n · k log n)\` to order the required output; **space**
\`O(n · k)\`. The grouping time is one pass over each word — \`k\` increments — plus a fixed 26-step
render and one map operation, so it is linear in the total input size. The output ordering is the
separate term named above, and with \`k <= 100\` it is frequently the larger one, which is the honest
thing to say when asked for the complexity.

Use it when the alphabet is small and fixed and the words may be long, which is when dropping \`log k\`
shows up in a measurement. At \`k <= 100\` the win over sorted keys is a **constant** factor rather
than a category change, so the real reason to know it is the follow-up conversation: naming both keys
and the trade between them is what the question is asking for.

---`,
}
