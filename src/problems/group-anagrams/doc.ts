// group-anagrams — the teaching document, as data.
//
// Converted from docs/deep/group-anagrams_explained.md by
// scripts/md-to-content.mjs. Every byte of prose carried through unchanged;
// what changed is that the STRUCTURE is now a type (src/content/types.ts)
// rather than a heading convention a script had to grep for.
//
// Reached only through `lib/content.ts`'s glob — never import this file.

import type { TeachingDoc } from "../../content/types.ts"

export const doc: TeachingDoc = {
  problemId: "group-anagrams",
  understanding: `You are given a list of words and asked to sort them into piles, where two words go in the same pile
if one is a rearrangement of the other. "eat", "tea" and "ate" belong together; "bat" sits alone.
You return the piles, not the words, and here the answer is sorted inside each pile and between the
piles so there is exactly one correct output.

**The core question:** what single label can you compute from a word such that every rearrangement of
it produces the same label, and no other word does? The naive approach is slow because, lacking such
a label, it compares each new word against the piles built so far — so the number of comparisons
grows with the number of piles, and on input with no anagrams at all that is one comparison per
existing pile per word.

Two words that mean something specific here, each introduced by the picture rather than the
definition:

- Melt a word down and recast it in a fixed mould, and every anagram of it comes out of the mould
  looking the same. That cast object is the word's **canonical form** — also called its *key* or
  *signature* — and it turns "are these two equivalent?" into "are these two identical?".
- Now give every mould shape its own box on a shelf, and words drop into boxes as they arrive. That
  is **bucketing by key**: a hash map from key to list. Choosing the mould is the whole problem; the
  shelf is the part nobody argues about.

Throughout, \`n\` is the number of words and \`k\` is the maximum length of a word.

In the general form of this problem the group order is arbitrary, and comparing two arbitrary orders
without normalising first is the classic source of a false "wrong answer". Here the required order
and the normalisation happen to be the same operation, which is why one helper below serves both.

The worked example traced in every section is the statement's own:
\`words = ["eat", "tea", "tan", "ate", "nat", "bat"]\`, whose answer is
\`[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]\`.

Two decisions repeat across every approach, so each is lifted into a named helper defined once:

\`\`\`python
A = ord("a")            # lowercase letters index a fixed 26-slot tally
ALPHABET_SIZE = 26

def _sorted_key(word: str) -> str:
    """The letters in order: anagrams sort identically, non-anagrams cannot."""
    return "".join(sorted(word))

def _count_key(word: str) -> str:
    """The same multiset as a tally. The comma is load-bearing: without it the
    counts 1,11 and 11,1 both render as "111"."""
    counts = [0] * ALPHABET_SIZE
    for ch in word:
        counts[ord(ch) - A] += 1
    return ",".join(str(c) for c in counts)

def _in_required_order(groups: list[list[str]]) -> list[list[str]]:
    """Sort inside each group, then between groups. Required by this statement;
    in the general version it is the harness's canonicaliser instead."""
    return sorted(sorted(g) for g in groups)
\`\`\`

---`,
  unlocks: [
      {
          "constraint": "`1 <= words.length <= 10^4`",
          "what": "Ten thousand words is what rules out the pairwise **scan**: on input where no two words are anagrams there are `n` piles at the end, and the scan performs about `n²/2 = 5 × 10^7` group comparisons, each of which sorts a word."
      },
      {
          "constraint": "`0 <= words[i].length <= 100`, lowercase English letters",
          "what": "**Two** things at once. The 26-letter alphabet is what unlocks a fixed-size count signature — the letter is its own array index, so the tally costs no hashing and no allocation proportional to the alphabet. And `k <= 100` means `log k` is under 7, so the difference between sorting a word and counting it is a small **constant factor** in practice, not an order of magnitude."
      },
      {
          "constraint": "the empty string is a legal word, and all empty strings belong to one group",
          "what": "Every key scheme must handle it. Sorted letters give `\"\"`; the count signature gives twenty-six zeros. Both are perfectly good keys, which is the point — nothing special needs writing, but it needs checking."
      },
      {
          "constraint": "the answer is sorted inside each group and between groups",
          "what": "This makes the output unambiguous, which is what lets a test compare two answers directly. It also adds a real `O(n·k log n)` term to every approach, because **ordering** the output is part of the required work — and it is worth separating that from the grouping, which is the part the problem is actually about."
      }
  ],
  approaches: [
  {
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
  },
  {
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
  },
  {
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
  },
  ],
  arc: `One question drives every rung: **what is the key that makes two words the same?** The pairwise scan
refuses to answer it and pays quadratically for the refusal — with no label to address a group by, a
word can only be placed by interrogating every group already built, re-deriving "are these anagrams?"
against each one and throwing the derivation away. Sorting each word's letters is the first real
answer, and it converts the problem from a search into an addressing scheme: the label is computed
once per word, the hash map does the grouping for free, and \`n²\` comparisons collapse into \`n\`
lookups. But a sorted string and a letter tally carry exactly the same information — both are the
multiset of letters, nothing more — so the sort was buying nothing and charging \`log k\` for it; the
count signature is the same key built in one pass, and the twenty-six-letter alphabet is what makes
that tally a fixed array rather than another hash map. From there the only thing left to get right is
the rendering, where a missing separator quietly merges words whose counts differ only in where the
digits break. What transfers is the habit rather than the code: look for a canonical form, and check
whether the form you reached for is doing more than canonicalising. Anagram grouping, isomorphic
strings, "group shapes by their normalised outline", deduplicating records that differ only in field
order — all of them are the same problem once the key is chosen, and all of them have a version of
the delimiter bug waiting in how the key is serialised.

---`,
  comparison: {
      "head": [
          "Approach",
          "Time",
          "Space",
          "Core trade-off",
          "Best used when"
      ],
      "rows": [
          [
              "Pairwise scan",
              "`O(n² · k log k)`",
              "`O(n · k)`",
              "Needs no map or key design; pays a full search per word",
              "`n` is a handful, or as the oracle a harness checks the rest against"
          ],
          [
              "Sorted letters as key",
              "`O(n · k log k)`",
              "`O(n · k)`",
              "One sort per word buys addressing instead of searching; alphabet-agnostic",
              "Large, unknown or non-character alphabets — Unicode, mixed case, tokens"
          ],
          [
              "**26-count signature as key**",
              "**`O(n · k)`**",
              "**`O(n · k)`**",
              "Drops `log k` by exploiting the fixed alphabet; the key must be serialised with a separator",
              "**Small known alphabet, possibly long words — the answer here**"
          ]
      ]
  },
  interview: `> **In an interview.** Say the baseline in one sentence and kill it — *"the direct approach compares
> each word against each existing group, which is quadratic in the number of groups"* — then write
> the sorted-letters key, because it is one line and impossible to get wrong. Offer the count key as
> the improvement: *"sorting and counting produce the same information, and counting is one pass
> instead of \`k log k\`."* The follow-up is almost always **"how do you build the count key?"**, and
> the answer that separates you is the delimiter: without a separator, counts of 1 and 11 collide
> with 11 and 1.

**Know cold: the sorted-letters key.** It is two lines, it is the answer most interviewers are
listening for, and proposing the better key *from* a working solution reads as engineering — while
starting from the count signature and being asked "why?" reads as recall.

**Know cold: the count signature and its separator.** The insight is one sentence and the detail that
separates someone who has written it from someone who has read it is the delimiter. "Counts of 1 and
11 collide with 11 and 1" is a specific, checkable claim, which is exactly what distinguishes answers.

**Understand but do not drill: the pairwise scan.** It exists to establish what a key is *for*, before
you produce one. After that sentence, never write it again except as a test oracle.

**One thing to say regardless of approach:** in the general version the group order is arbitrary, so
if you are asked to verify your output against an expected answer, normalise both first — sort within
each group, then sort the groups. Two correct answers in different orders look like a disagreement
otherwise, and that false alarm costs more interview time than any of the code above.

---`,
  scriptNote: `Three approaches, the two key helpers and the ordering helper each defined exactly once, plus a test
suite. \`_in_required_order\` does double duty: it produces this statement's required output order, and
because the general problem leaves group order arbitrary, it is also what the harness compares
through. Everything under "test suite" is **scaffolding**, not answer.`,
  script: `"""Group Anagrams - every approach in one file, cross-checked.

Run:  python group_anagrams.py
"""

from __future__ import annotations

import random

A = ord("a")
ALPHABET_SIZE = 26


# ------------------------------------------------------ the shared decisions
def _sorted_key(word: str) -> str:
    """The letters in order: anagrams sort identically, non-anagrams cannot."""
    return "".join(sorted(word))


def _count_key(word: str) -> str:
    """The same multiset as a tally. The comma is load-bearing: without it the
    counts 1,11 and 11,1 both render as "111"."""
    counts = [0] * ALPHABET_SIZE
    for ch in word:
        counts[ord(ch) - A] += 1
    return ",".join(str(c) for c in counts)


def _in_required_order(groups: list[list[str]]) -> list[list[str]]:
    """Sort inside each group, then between groups. Required by this statement;
    in the general version, where group order is arbitrary, it is the
    canonicaliser the harness compares through."""
    return sorted(sorted(g) for g in groups)


# ------------------------------------------- approach 1: compare every pair
def group_anagrams_pairwise(words: list[str]) -> list[list[str]]:
    groups: list[list[str]] = []
    for w in words:
        key = _sorted_key(w)
        for g in groups:
            if _sorted_key(g[0]) == key:  # re-derives the representative's key every time
                g.append(w)
                break
        else:
            groups.append([w])
    return _in_required_order(groups)


# ------------------------------------- approach 2: sorted letters as the key
def group_anagrams_sorted_key(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        groups.setdefault(_sorted_key(w), []).append(w)
    return _in_required_order(list(groups.values()))


# ------------------------------------ approach 3: the letter tally as the key
def group_anagrams(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        groups.setdefault(_count_key(w), []).append(w)
    return _in_required_order(list(groups.values()))


APPROACHES = [
    ("pairwise", group_anagrams_pairwise),
    ("sorted_key", group_anagrams_sorted_key),
    ("count_key", group_anagrams),
]


# ------------------------------------------------- test suite (scaffolding)
def main() -> None:
    cases: list[tuple[str, list[str]]] = [
        ("statement example",
         ["eat", "tea", "tan", "ate", "nat", "bat"]),
        ("the empty string", [""]),
        ("minimal: one word", ["abc"]),
        ("empty strings group together", ["", "", "a"]),
        ("no two words are anagrams", ["ab", "cd", "ef"]),
        ("the same word repeated", ["xy", "xy", "yx"]),
        ("counts matter, not letters", ["aab", "abb", "aba"]),
    ]
    rng = random.Random(13)
    cases.append(("stress: 60 random words",
                  ["".join(rng.choice("abc") for _ in range(rng.randint(0, 4)))
                   for _ in range(60)]))

    all_agreed = True
    for label, words in cases:
        shown = words if len(words) <= 8 else words[:6] + ["..."]
        print(f"\\n{label}: n={len(words)} {shown}")
        results: dict[str, list[list[str]]] = {}
        for name, fn in APPROACHES:
            out = _in_required_order(fn(list(words)))
            results[name] = out
            text = str(out) if len(str(out)) <= 70 else str(out)[:67] + "..."
            print(f"  {name:<12} -> {len(out)} groups {text}")
        if len({repr(r) for r in results.values()}) != 1:
            all_agreed = False
            print("  !! approaches disagree")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND - see the lines above")


if __name__ == "__main__":
    main()`,
  notes: [
    { title: "Comparison", body: `All three additionally pay \`O(n · k log n)\` to order the output, which at \`k <= 100\` is often the
dominant term. That cost belongs to the output format, not to the grouping.

---` },
  ],
}

export default doc
