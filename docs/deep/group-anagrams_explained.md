# Group the Anagrams Together — Explained

## Understanding the Problem

You are given a list of words and asked to sort them into piles, where two words go in the same pile
if one is a rearrangement of the other. "eat", "tea" and "ate" belong together; "bat" sits alone.
You return the piles, not the words, and here the answer is sorted inside each pile and between the
piles so there is exactly one correct output.

**The core question: what single label can you compute from a word such that every rearrangement of
it produces the same label, and no other word does?** The naive approach is slow because, lacking
such a label, it compares each new word against the piles built so far — so the number of comparisons
grows with the number of piles, and on input with no anagrams at all that is one comparison per
existing pile per word.

Two pieces of vocabulary, expanded once:

- A **canonical form** (used here interchangeably with **key** or **signature**) is a standard
  representation that every equivalent thing maps to, so "are these equivalent?" becomes "are these
  identical?". Two words are anagrams exactly when their canonical forms are equal.
- **Bucketing by key** means using a hash map from key to a list, so that everything sharing a key
  accumulates in one list. Once a key exists, the grouping is free — the map does it. Choosing the
  key is the whole problem; the bucketing is the part nobody argues about.

Throughout, `n` is the number of words and `k` is the maximum length of a word.

### The constraints, and what each one unlocks

| Constraint | What it forces or permits |
|---|---|
| `1 <= words.length <= 10^4` | Ten thousand words is what rules out the pairwise scan: on input where no two words are anagrams there are `n` piles at the end, and the scan performs about `n²/2 = 5 × 10^7` group comparisons, each of which sorts a word. |
| `0 <= words[i].length <= 100`, lowercase English letters | **Two things at once.** The 26-letter alphabet is what unlocks a fixed-size count signature — the letter is its own array index, so the tally costs no hashing and no allocation proportional to the alphabet. And `k <= 100` means `log k` is under 7, so the difference between sorting a word and counting it is a small constant factor in practice, not an order of magnitude: the count key is the better answer, but say honestly that it is a constant-factor win at these lengths. |
| the empty string is a legal word, and all empty strings belong to one group | Every key scheme must handle it. Sorted letters give `""`; the count signature gives twenty-six zeros. Both are perfectly good keys, which is the point — nothing special needs writing, but it needs checking. |
| the answer is sorted inside each group and between groups | This makes the output unambiguous, which is what lets a test compare two answers directly. It also adds a real `O(n·k log n)` term to every approach here, because sorting the output is part of the required work — and it is worth separating that from the grouping, which is the part the problem is actually about. In the general form of this problem the group order is arbitrary, and comparing two arbitrary orders without normalising first is the classic source of a false "wrong answer". |

The worked example traced in every section below is the statement's own:
`words = ["eat", "tea", "tan", "ate", "nat", "bat"]`, whose answer is
`[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]`.

---

## Approach 1 — Brute force: compare each word against the groups built so far

### The idea

*What is the most direct thing that could possibly work?* Keep a list of groups; for each new word,
walk the groups and test it against each group's first member — if they are anagrams, join that
group, and if none matches, start a new one. *Why is that not the answer?* Because it never commits
to a label, so every word re-derives "are these anagrams?" from scratch against every group it does
not belong to, and the cost of placing one word grows with the number of groups already built.

### How to think about it

The shape of the reasoning is **build the answer incrementally, searching what you have built so
far.** It is correct by an easy argument: anagram-ness is transitive, so every member of a group is
an anagram of every other, and testing against a single representative is as good as testing against
all of them. Two costs sit inside this and should be priced separately. Testing one pair means
canonicalising both words — the implementation sorts each one, which is `k log k` — and the search
over groups means doing that test up to `n` times per word. That product is the whole problem with
this approach, and notice the second half of it is the *search*, not the test: even if the anagram
test were free, walking every group for every word would still be quadratic.

### Worked example

`words = ["eat", "tea", "tan", "ate", "nat", "bat"]`. Each comparison sorts the group's first member
and the candidate.

| Word | groups compared against (first member → sorted) | outcome | `groups` after |
|---|---|---|---|
| `eat` | none | new group | `[[eat]]` |
| `tea` | `eat`→`aet` vs `aet` | match | `[[eat, tea]]` |
| `tan` | `eat`→`aet` vs `ant` | no match | `[[eat, tea], [tan]]` |
| `ate` | `eat`→`aet` vs `aet` | match | `[[eat, tea, ate], [tan]]` |
| `nat` | `eat`→`aet` vs `ant` ✗, `tan`→`ant` vs `ant` ✓ | match on the second | `[[eat, tea, ate], [tan, nat]]` |
| `bat` | `eat`→`aet` ✗, `tan`→`ant` ✗ | no match | `[[eat, tea, ate], [tan, nat], [bat]]` |

Eight group comparisons for six words, and sixteen sorts — the representative `"eat"` was sorted five
separate times, once for every word that was ever compared against its group. **Finally**, sort inside
each group and then between groups: `[[ate, eat, tea], [bat], [nat, tan]]`.

### Code

```python
def group_anagrams_pairwise(words: list[str]) -> list[list[str]]:
    groups: list[list[str]] = []
    for w in words:
        placed = False
        for g in groups:
            if sorted(g[0]) == sorted(w):  # re-sorts the representative each time
                g.append(w)
                placed = True
                break
        if not placed:
            groups.append([w])
    return sorted(sorted(g) for g in groups)
```

### Common mistake

Forgetting the `break` after appending. Without it the loop keeps walking the remaining groups, and
while it will not find a second match (anagram groups are disjoint), it does keep scanning — and if
the code also sets a flag and appends without breaking, a word can be added to a group and then, on a
later iteration of the same loop, compared as though it had not been placed. The deeper version of
this bug is comparing against *every* member of a group instead of its first: correct, since they are
all anagrams of each other, and needlessly multiplying the work by the group size.

### Complexity and when to use this

**Time `O(n² · k log k)`, space `O(n · k)`.** The time is the product of three things: up to `n`
groups scanned per word, `n` words, and `k log k` to sort the two words being compared. The space is
the output itself — every input word appears exactly once across the groups — plus the temporary
sorted copies, which are discarded.

Use it when `n` is genuinely tiny (a handful of words) and you want the shortest code that needs no
map, or as the reference implementation a test harness checks the fast versions against, which is
what the script at the bottom of this document does with it. At `n = 10^4` with no anagrams present
it performs about fifty million sorts, so it is not viable for the stated input size.

---

## Approach 2 — The sorted letters as a hash-map key

### The idea

*The scan re-sorts a group's representative once per comparison — what if the sorted form were the
group's name?* Sort each word's letters once and use the result as a key in a hash map whose values
are lists; every anagram of a word lands on the same key automatically. *What limitation does this
fix?* It deletes the search entirely: instead of asking each existing group "is this yours?", the
word computes its own label and the map finds the group in one lookup.

### How to think about it

This is the move from **searching to addressing**, and it is the same move that turns a linear scan
of an array into a dictionary lookup. Once you accept that two anagrams must produce the same label,
the grouping stops being an algorithm and becomes a data-structure fact — the map already groups by
key, so all the code has to do is compute the key and append. The correctness argument for *this*
particular key is one line: sorting depends only on the multiset of letters, so anagrams sort
identically and non-anagrams cannot. The cost is now one sort per word rather than one sort per
comparison, which is the difference between `n` sorts and `n²` sorts. What remains payable is the
`log k` inside each sort — and that is what the next approach removes.

### Worked example

`words = ["eat", "tea", "tan", "ate", "nat", "bat"]`.

| Word | sorted letters (the key) | map state after |
|---|---|---|
| `eat` | `aet` | `{aet: [eat]}` |
| `tea` | `aet` | `{aet: [eat, tea]}` |
| `tan` | `ant` | `{aet: [eat, tea], ant: [tan]}` |
| `ate` | `aet` | `{aet: [eat, tea, ate], ant: [tan]}` |
| `nat` | `ant` | `{aet: [eat, tea, ate], ant: [tan, nat]}` |
| `bat` | `abt` | `{aet: [eat, tea, ate], ant: [tan, nat], abt: [bat]}` |

Six sorts, six lookups, zero comparisons between words. Compare with the previous table: eight group
comparisons and sixteen sorts became six sorts. **Finally**, sort inside each group and between
groups: `[[ate, eat, tea], [bat], [nat, tan]]`.

### Code

```python
def group_anagrams_sorted_key(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        groups.setdefault("".join(sorted(w)), []).append(w)  # one sort per word, not per comparison
    return sorted(sorted(g) for g in groups.values())
```

### Common mistake

Using `sorted(w)` — a list — directly as the key. Lists are mutable and therefore unhashable in
Python, so this raises `TypeError: unhashable type: 'list'` the moment it runs; the fix is
`"".join(sorted(w))` or `tuple(sorted(w))`. The quieter version of the same error in other languages
is using the *array reference* as a key, which hashes by identity rather than content, so every word
gets its own group and the function cheerfully returns `n` groups of one.

### Complexity and when to use this

**Time `O(n · k log k)` to group, plus `O(n · k log n)` to sort the required output; space
`O(n · k)`.** The grouping time is one `k log k` sort per word and one constant-time map operation.
The output sort is a separate, and at these sizes often larger, term — worth naming out loud because
it is easy to quote "`n k log k`" for a function whose dominant line is actually the final `sorted()`.
The space is the map: every word stored once, plus one key per group, each up to `k` characters.

Use it whenever the alphabet is large or unknown — Unicode text, mixed case, words-as-tokens — since
sorting does not care what it is comparing while the count signature needs a fixed, small symbol set.
It is also the version to write first in an interview: it is one line of real logic, and it is easier
to say "and I can drop the `log k` by counting letters instead" than to start from the counting
version and justify it cold.

---

## Approach 3 — The 26-letter count signature as the key (optimal)

### The idea

*Sorting a word produces a label, but sorting is more than labelling — can the label be built without
ordering anything?* Count how many of each of the twenty-six letters the word contains and use that
tally as the key; two anagrams have identical tallies by definition. *What limitation does this fix?*
It removes the `log k` factor inside the key computation: the tally is built in one pass over the
word, so labelling costs `k` rather than `k log k`, and no comparison-based sorting happens per word
at all.

### How to think about it

Two ideas stack here. The first is that a sorted string and a letter tally carry **exactly the same
information** — both are the multiset of letters and nothing else — so the sorted form was never
buying anything extra, only costing more to produce. The second is the constraint doing work: with
twenty-six possible letters, `ord(ch) - 97` maps each letter to its own slot, so the tally is a plain
fixed-size array with no hashing and no growth. The key then has to be made hashable, which means
rendering those twenty-six numbers as one value — and the rendering is where the only real trap
lives. Join them with a separator. Without one, the tallies `[1, 11, 0, …]` and `[11, 1, 0, …]`
both render as `"1110…"` and two different words collide into one group; the comma is not
cosmetic.

**The constraint this rung exploits, and what breaks without it:** it needs a small, known alphabet.
Lowercase English gives twenty-six slots. Allow uppercase and you need fifty-two and a different index
formula; allow arbitrary Unicode and a fixed array is impossible, at which point the key becomes a
sorted list of `(character, count)` pairs from a hash map — which has re-introduced a sort, making
approach 2 the better answer again. The technique is not universally superior; it is what this
problem's alphabet permits.

### Worked example

`words = ["eat", "tea", "tan", "ate", "nat", "bat"]`. Each key is twenty-six comma-separated counts;
only the non-zero positions are listed, and the full key is shown once so the shape is concrete.

| Word | non-zero counts | key (abbreviated) | map state after |
|---|---|---|---|
| `eat` | a=1, e=1, t=1 | `1,0,0,0,1,0,…,1,…,0` | `{K_aet: [eat]}` |
| `tea` | a=1, e=1, t=1 | same as above | `{K_aet: [eat, tea]}` |
| `tan` | a=1, n=1, t=1 | `1,0,…,1(n),…,1(t),…` | `{K_aet: [eat, tea], K_ant: [tan]}` |
| `ate` | a=1, e=1, t=1 | `K_aet` | `{K_aet: [eat, tea, ate], K_ant: [tan]}` |
| `nat` | a=1, n=1, t=1 | `K_ant` | `{K_aet: [eat, tea, ate], K_ant: [tan, nat]}` |
| `bat` | a=1, b=1, t=1 | `K_abt` | `{K_aet: […], K_ant: […], K_abt: [bat]}` |

The full key for `eat`, written out, is
`1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0` — twenty-six numbers, with 1s at positions 0
(`a`), 4 (`e`) and 19 (`t`). Building it costs three increments plus the render; no sorting happened.
**Finally**, sort inside each group and between groups: `[[ate, eat, tea], [bat], [nat, tan]]`.

### Code

```python
def group_anagrams(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        counts = [0] * 26
        for ch in w:
            counts[ord(ch) - 97] += 1  # 97 is ord('a'); the letter IS the index
        key = ",".join(str(c) for c in counts)  # the comma stops 1,11 == 11,1
        groups.setdefault(key, []).append(w)
    return sorted(sorted(g) for g in groups.values())
```

`tuple(counts)` works just as well as a key and skips the string rendering entirely — tuples are
hashable and compare by content — and it removes the separator trap by construction. The joined
string is shown here because it is what translates directly into Java and C++, where a `String` key
is the path of least resistance.

### Common mistake

Building the key as `"".join(str(c) for c in counts)` — no separator. It passes every test built from
short words, because a count only reaches 10 when a single letter appears ten times in one word, and
then it fails silently: a word with counts `[1, 11, …]` and a word with counts `[11, 1, …]` both
produce a key beginning `"111"` and are merged into one group. With `k` up to 100 this is reachable,
not theoretical. The mistake is instructive beyond this problem: whenever you flatten a sequence of
numbers into a string key, the delimiter is part of the correctness argument, not formatting.

### Complexity and when to use this

**Time `O(n · k)` to group, plus `O(n · k log n)` to sort the required output; space `O(n · k)`.**
The grouping time is one pass over each word — `k` increments — plus a fixed 26-step render and one
map operation, so it is linear in the total input size. The output sort is the separate term named
above, and with `k <= 100` it is frequently the larger one, which is the honest thing to say when
asked for the complexity. The space is the map: each word stored once, plus one key per group.

Use it when the alphabet is small and fixed and the words may be long, which is when dropping
`log k` actually shows up in a measurement. At `k <= 100` the win over sorted keys is a constant
factor rather than a category change, so the real reason to know it is the follow-up conversation:
naming both keys and the trade between them — sorted keys are shorter to write and alphabet-agnostic,
count signatures are faster and immune to long words — is what the question is asking for.

---

## The Overall Arc

One question drives every rung: **what is the key that makes two words the same?** The pairwise scan
refuses to answer it, and pays quadratically for the refusal — with no label to address a group by, a
word can only be placed by interrogating every group already built, re-deriving "are these anagrams?"
against each one and throwing the derivation away. Sorting each word's letters is the first real
answer, and it converts the problem from a search into an addressing scheme: the label is computed
once per word, the hash map does the grouping for free, and `n²` comparisons collapse into `n`
lookups. But a sorted string and a letter tally carry exactly the same information — both are the
multiset of letters, nothing more — so the sort was buying nothing and charging `log k` for it; the
count signature is the same key built in one pass, and the twenty-six-letter alphabet is what makes
that tally a fixed array rather than another hash map. From there the only thing left to get right is
the rendering, where a missing separator quietly merges words whose counts differ only in where the
digits break. What transfers is the habit rather than the code: look for a canonical form, and check
whether the form you reached for is doing more than canonicalising. Anagram grouping, isomorphic
strings, "group shapes by their normalised outline", deduplicating records that differ only in field
order — all of them are the same problem once the key is chosen, and all of them have a version of
the delimiter bug waiting in how the key is serialised.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Pairwise scan | `O(n² · k log k)` | `O(n · k)` | Needs no map or key design; pays a full search per word | `n` is a handful, or as the oracle a test harness checks the rest against |
| Sorted letters as key | `O(n · k log k)` | `O(n · k)` | One sort per word buys addressing instead of searching; alphabet-agnostic | Large, unknown or non-character alphabets — Unicode, mixed case, tokens |
| **26-count signature as key** | **`O(n · k)`** | **`O(n · k)`** | Drops `log k` by exploiting the fixed alphabet; the key must be serialised with a separator | **Small known alphabet, possibly long words — the answer here** |

All three additionally pay `O(n · k log n)` to sort the output into the required canonical order,
which at `k <= 100` is often the dominant term. That cost belongs to the output format, not to the
grouping.

---

## Interview Priority

**Know cold: the sorted-letters key.** It is two lines, it is impossible to get wrong, and it is the
answer most interviewers are listening for when they ask this question. Write it first, state its
cost as `n · k log k`, and then offer the improvement — proposing the better key from a working
solution reads as engineering, while starting from the count signature and being asked "why?" reads
as recall.

**Know cold: the count signature and the separator.** The key insight is one sentence — "sorting and
counting produce the same information, and counting is one pass instead of `k log k`" — and the
detail that separates someone who has written it from someone who has read it is the delimiter. Being
able to say "without a separator, counts of 1 and 11 collide with 11 and 1" is a specific, checkable
claim, which is exactly the kind of thing that distinguishes answers.

**Understand but do not drill: the pairwise scan.** Say it in one sentence at the start — "the direct
approach is to compare each word to each existing group, which is quadratic in the number of groups"
— to establish what the key is *for* before you produce one. Then never write it again except as a
test oracle.

**One thing to say regardless of approach:** in the general version of this problem the group order is
arbitrary, so if you are asked to verify your output against an expected answer, normalise both first
— sort within each group and then sort the groups. Two correct answers in different orders look like
a disagreement otherwise, and that false alarm costs more interview time than any of the code above.

---

## Full Runnable Script

```python
"""Group Anagrams - every approach in one file, cross-checked.

Run:  python group_anagrams.py
"""

from __future__ import annotations

import random


# ------------------------------------------- approach 1: compare every pair
def group_anagrams_pairwise(words: list[str]) -> list[list[str]]:
    groups: list[list[str]] = []
    for w in words:
        placed = False
        for g in groups:
            if sorted(g[0]) == sorted(w):  # re-sorts the representative each time
                g.append(w)
                placed = True
                break
        if not placed:
            groups.append([w])
    return sorted(sorted(g) for g in groups)


# ------------------------------------- approach 2: sorted letters as the key
def group_anagrams_sorted_key(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        groups.setdefault("".join(sorted(w)), []).append(w)
    return sorted(sorted(g) for g in groups.values())


# ------------------------------------ approach 3: the letter tally as the key
def group_anagrams(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = {}
    for w in words:
        counts = [0] * 26
        for ch in w:
            counts[ord(ch) - 97] += 1
        key = ",".join(str(c) for c in counts)  # the comma stops 1,11 == 11,1
        groups.setdefault(key, []).append(w)
    return sorted(sorted(g) for g in groups.values())


APPROACHES = [
    ("pairwise", group_anagrams_pairwise),
    ("sorted_key", group_anagrams_sorted_key),
    ("count_key", group_anagrams),
]


def canonical(groups: list[list[str]]) -> list[list[str]]:
    """Group order and within-group order are arbitrary in general, so compare
    only after sorting both levels. Without this, two correct answers look
    different and the stress test reports false disagreements."""
    return sorted(sorted(g) for g in groups)


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
        print(f"\n{label}: n={len(words)} {shown}")
        results: dict[str, list[list[str]]] = {}
        for name, fn in APPROACHES:
            results[name] = canonical(fn(list(words)))
            out = results[name]
            text = str(out) if len(str(out)) <= 70 else str(out)[:67] + "..."
            print(f"  {name:<12} -> {len(out)} groups {text}")
        if len({repr(r) for r in results.values()}) != 1:
            all_agreed = False
            print("  !! approaches disagree")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND - see the lines above")


if __name__ == "__main__":
    main()
```
