# Same Letters, Different Order (Valid Anagram) — Explained

## Understanding the Problem

You are given two words and asked whether one is a shuffle of the other: the same letters, each used
the same number of times, just in a different order. "listen" and "silent" qualify; "rat" and "car"
do not, even though they are the same length.

**The core question: how do you compare two collections of letters when the order they arrive in is
exactly the thing you must ignore?** The naive approach is slow because it answers "does `t` still
have a spare copy of this letter?" by searching `t` from the beginning for every letter of `s`, so
one pass over `s` becomes `n` passes over `t`.

Two pieces of vocabulary, expanded once:

- A **multiset** (or "bag") is a collection where duplicates count but order does not: the bag
  `{a, a, b}` is the same bag as `{a, b, a}` and a different one from `{a, b, b}`. An anagram check
  is exactly a test of whether two multisets are equal, and that sentence is the whole problem.
- A **canonical form** is a single standard representation that every equivalent thing maps to, so
  that "are these equivalent?" becomes "are these identical?". Sorted letters are one canonical form
  for a bag of letters; a table of counts is another.

### The constraints, and what each one unlocks

| Constraint | What it forces or permits |
|---|---|
| `1 <= s.length, t.length <= 5 * 10^4` | Fifty thousand characters is small enough that even the `O(n log n)` sort is comfortable, and large enough that the `O(n²)` brute force is not — about `2.5 × 10^9` character comparisons at the top end. |
| `s` and `t` consist of lowercase English letters | **This is the constraint that unlocks direct indexing.** Twenty-six possible letters means a fixed 26-slot array, indexed by `ord(ch) - 97`, replaces the hash map entirely: no hashing, no allocation that grows with the input, and the tally is `O(1)` space rather than `O(k)`. Remove it — allow Unicode — and the array becomes a hash map again, which is the same algorithm in a different container. |
| different lengths can never be anagrams | A free early exit, and it is not only an optimisation: the `+1/-1` tally below is *wrong* without it, because it reads both strings with one index. |
| counts matter, not just membership: `aab` and `abb` use the same letters and are not anagrams | This kills the tempting one-liner `set(s) == set(t)`, which reports true for that pair. A bag is not a set. |

The worked example traced in every section below is the statement's first:
`s = "anagram"`, `t = "nagaram"`, which is `true`.

---

## Approach 1 — Brute force: cross off each letter of `s` inside a copy of `t`

### The idea

*What is the most direct thing that could possibly work?* Make a scratch copy of `t` and, for each
letter of `s`, find that letter in the copy and delete it; if every letter is found and the copy ends
up empty, the two words used the same letters the same number of times. *Why is that not the answer?*
Because "find that letter" scans the copy from the start, and deleting from the middle of a list
shifts everything after it — two linear operations, performed once per letter of `s`.

### How to think about it

The mental model is physical: lay out the letter tiles of `t` on the table, then walk through `s`
picking up a matching tile for each letter. If you ever reach for a letter that is not on the table,
the answer is no. If you finish `s` with the table empty, the answer is yes. This handles duplicate
letters correctly for free — each tile can only be picked up once — which is the property that the
`set(s) == set(t)` shortcut throws away. It is also the version whose correctness is most obviously
right, which makes it the oracle every faster version gets checked against. What to carry forward is
the observation that most of the work is *searching*: the algorithm knows it needs an `a`, and then
spends a scan discovering where the `a` is, when it never cared where.

### Worked example

`s = "anagram"`, `t = "nagaram"`. The scratch copy starts as `['n','a','g','a','r','a','m']`.

| Step | letter of `s` | found at index | `remaining` after removal |
|---|---|---|---|
| start | — | — | `n a g a r a m` |
| 1 | `a` | 1 | `n g a r a m` |
| 2 | `n` | 0 | `g a r a m` |
| 3 | `a` | 1 | `g r a m` |
| 4 | `g` | 0 | `r a m` |
| 5 | `r` | 0 | `a m` |
| 6 | `a` | 0 | `m` |
| 7 | `m` | 0 | *(empty)* |

Every letter was found, the table is clear, so the answer is `true`. Count the work: each row did a
search and a shift over a list that started at seven elements — seven rows, roughly fifty character
operations for a seven-letter word.

### Code

```python
def is_anagram_brute(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    remaining = list(t)
    for ch in s:
        if ch not in remaining:
            return False
        remaining.remove(ch)  # finds it, then shifts everything after it left
    return True
```

### Common mistake

Calling `remaining.remove(ch)` without the `in` check first. On a letter that is absent, `remove`
raises `ValueError` instead of returning `False`, so a function that should answer a question crashes
the caller. The related mistake is dropping the length guard and relying on "the copy ends up empty":
with `s = "ab"` and `t = "abc"` every letter of `s` is found, the loop finishes, and the function
returns `true` while a `c` is still sitting on the table.

### Complexity and when to use this

**Time `O(n²)`, space `O(n)`.** The time is `n` letters of `s`, each costing a scan of the remaining
list to locate the match plus a shift of everything after it — both linear, both inside the loop.
The space is the scratch copy of `t`, which is `n` characters; the algorithm cannot mutate the caller's
string because Python strings are immutable, so the copy is not optional.

Use it as the spoken first answer and as the cross-check oracle in a test harness, which is what the
script at the bottom of this document does with it. At `n = 5 × 10^4` the worst case is about
`2.5 × 10^9` operations, so it is not merely inelegant — it is too slow for the stated input size.

---

## Approach 2 — Sort both strings and compare

### The idea

*The brute force searches for each letter — what if both words were already in an order that makes
comparison trivial?* Sort the letters of each word; two anagrams have exactly one sorted form between
them, so the check becomes a single equality test. *What limitation does this fix?* It removes all
the searching and shifting: no letter is ever hunted for, because sorting has put every letter of
both words in the same predictable place.

### How to think about it

This is **canonicalise-then-compare**, and it is worth pricing the halves separately: restructuring
costs `O(n log n)` per string — that is the sort, and it dominates — while comparing the two results
costs `O(n)`, one character at a time, and is free by comparison. The reason it is correct is a
one-liner: sorting is a function of the multiset of letters alone, so two words with the same bag of
letters cannot sort differently, and two words with different bags must differ at the first position
where their bags diverge. It is also the shortest correct solution anyone will write for this problem
— one line in Python — which makes it the right thing to put on the board first and improve
afterwards.

### Worked example

`s = "anagram"`, `t = "nagaram"`.

**Canonicalise:**

| String | letters | sorted |
|---|---|---|
| `s` | `a n a g r a m` | `a a a g m n r` |
| `t` | `n a g a r a m` | `a a a g m n r` |

**Compare:** the two seven-character sequences are identical position by position, so the answer is
`true`. Contrast with the statement's other example: `"rat"` sorts to `a r t`, `"car"` sorts to
`a c r`, which differ at position 1 (`r` versus `c`) — `false`, decided by a single character
comparison once the sorting is done.

### Code

```python
def is_anagram_sort(s: str, t: str) -> bool:
    return sorted(s) == sorted(t)  # unequal lengths differ as lists, so no guard needed
```

### Common mistake

Writing `sorted(s) == sorted(t)` in a language where `sort` mutates in place and forgetting that it
returned `None` — in Python, `s.sort()` does not even exist on a string, but `list(s).sort()` returns
`None`, and `if list(s).sort() == list(t).sort()` compares `None` to `None` and reports every pair of
strings an anagram. The Python-specific version of the trap is reaching for `.sort()` when you want
`sorted()`: one mutates and returns nothing, the other returns the sorted copy.

### Complexity and when to use this

**Time `O(n log n)`, space `O(n)`.** The time is two sorts, each `n log n` comparisons; the equality
check afterwards is linear and does not change the order of growth. The space is the two sorted lists
— Python's `sorted()` always builds a new list, so there is no in-place variant for strings.

Use it when the alphabet is large, unknown, or not characters at all — sorting does not care whether
it is comparing lowercase letters, Unicode code points, or tuples, while the counting approaches all
need to know what the universe of symbols is. It is also the right answer when you are writing the
check once, in glue code, and `n log n` on short words is invisible.

---

## Approach 3 — Two hash maps of counts

### The idea

*Sorting imposes a total ordering on the letters, but "same bag of letters" never mentioned order —
can we build the bag directly?* Count how many times each letter appears in `s`, do the same for `t`,
and compare the two tables. *What limitation does this fix?* It removes the `log n` factor: building
a count table is one pass per string, so the whole check becomes linear where sorting was
linearithmic.

### How to think about it

The move here is to notice that the *data* is a multiset, and then store it as a multiset rather than
as something more ordered. A hash map from letter to count is that multiset, exactly and with nothing
extra — no positions, no ordering, just "how many of each", which is the only information the
question asks about. Two maps are equal when they have the same keys with the same values, and most
languages compare them that way in one call. The cost model shifts as well: it is no longer `n log n`
comparisons but `n` hash lookups, and the memory is proportional to the number of *distinct* letters
rather than to the length of the words. That distinction is what the last approach exploits.

### Worked example

`s = "anagram"`, `t = "nagaram"`.

**Build the map for `s`, one letter at a time:**

| Step | letter | `a` after |
|---|---|---|
| 1 | `a` | `{a:1}` |
| 2 | `n` | `{a:1, n:1}` |
| 3 | `a` | `{a:2, n:1}` |
| 4 | `g` | `{a:2, n:1, g:1}` |
| 5 | `r` | `{a:2, n:1, g:1, r:1}` |
| 6 | `a` | `{a:3, n:1, g:1, r:1}` |
| 7 | `m` | `{a:3, n:1, g:1, r:1, m:1}` |

**Build the map for `t`:**

| Step | letter | `b` after |
|---|---|---|
| 1 | `n` | `{n:1}` |
| 2 | `a` | `{n:1, a:1}` |
| 3 | `g` | `{n:1, a:1, g:1}` |
| 4 | `a` | `{n:1, a:2, g:1}` |
| 5 | `r` | `{n:1, a:2, g:1, r:1}` |
| 6 | `a` | `{n:1, a:3, g:1, r:1}` |
| 7 | `m` | `{n:1, a:3, g:1, r:1, m:1}` |

**Compare:** `a` and `b` were built in different orders and hold different insertion sequences, but
dictionaries compare by content — same five keys, same five counts — so the answer is `true`.

### Code

```python
def is_anagram_two_maps(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    a: dict[str, int] = {}
    b: dict[str, int] = {}
    for ch in s:
        a[ch] = a.get(ch, 0) + 1
    for ch in t:
        b[ch] = b.get(ch, 0) + 1
    return a == b  # dicts compare by content, not insertion order
```

### Common mistake

Comparing `set(a.keys()) == set(b.keys())` instead of `a == b` — checking that both words use the
same letters while forgetting to check *how many of each*. On `s = "aab"`, `t = "abb"` the key sets
are both `{a, b}` and the function reports `true`, which is the exact failure the statement calls out
in its constraints. The equivalent slip in the one-map-per-string form is comparing only the number
of distinct keys (`len(a) == len(b)`), which fails on the same input for the same reason.

### Complexity and when to use this

**Time `O(n)`, space `O(k)`, where `k` is the number of distinct symbols.** The time is two linear
passes plus a comparison of two maps holding at most `k` entries each — constant-time hash operations
throughout. The space is the two maps; for lowercase English `k` is at most 26, but in general it
grows with the alphabet, not with the input length.

Use it whenever the alphabet is large or unbounded — Unicode text, words rather than letters, arbitrary
hashable tokens. This is the version that survives "now make it work for any Unicode string", and
answering that follow-up is just swapping the array of the next approach back for a map. In Python,
`collections.Counter(s) == collections.Counter(t)` is this approach with the loops written for you.

---

## Approach 4 — One 26-slot tally, counting up for `s` and down for `t` (optimal)

### The idea

*Two maps hold two copies of nearly the same information and then compare them — what if one table
held the difference?* Walk both strings together, adding one to a letter's slot for `s` and
subtracting one for `t`; if the words are anagrams every slot returns to zero. *What limitation does
this fix?* Two of them: it halves the storage by keeping a single table instead of two, and — because
the alphabet is fixed at 26 lowercase letters — it replaces hashing with plain array indexing, which
makes the space genuinely constant rather than proportional to the alphabet.

### How to think about it

Two ideas are stacked here, and they are worth separating. The first is **store the difference, not
the operands**: you never actually need the two tallies, only whether they agree, so accumulate
`count(s) - count(t)` directly and check it against zero. The second is **the value is the index**:
`ord(ch) - 97` maps `a` to 0 and `z` to 25, so a plain 26-element list *is* a perfect hash table with
no collisions and no hash computation. Reading both strings with one loop index is what makes the
single tally possible, and it is also why the length guard stops being an optimisation and becomes a
correctness requirement — with unequal lengths the loop either runs off the end of the shorter string
or silently ignores the tail of the longer one. A non-zero slot at the end is not just a failure
signal, it is a diagnosis: it names a letter and says how many more of it one word has than the other.

### Worked example

`s = "anagram"`, `t = "nagaram"`. One index walks both. Only the non-zero slots are shown; the other
twenty-one stay at 0 throughout.

| `i` | `s[i]` (`+1`) | `t[i]` (`-1`) | `a` | `g` | `m` | `n` | `r` |
|---|---|---|---|---|---|---|---|
| start | — | — | 0 | 0 | 0 | 0 | 0 |
| 0 | `a` | `n` | **1** | 0 | 0 | **-1** | 0 |
| 1 | `n` | `a` | 0 | 0 | 0 | 0 | 0 |
| 2 | `a` | `g` | **1** | **-1** | 0 | 0 | 0 |
| 3 | `g` | `a` | 0 | 0 | 0 | 0 | 0 |
| 4 | `r` | `r` | 0 | 0 | 0 | 0 | 0 |
| 5 | `a` | `a` | 0 | 0 | 0 | 0 | 0 |
| 6 | `m` | `m` | 0 | 0 | 0 | 0 | 0 |

Every slot is zero, so the answer is `true`. Notice how the table wanders away from zero and back:
at `i = 0` it records "`s` is one `a` ahead and one `n` behind", and by `i = 1` that debt is settled.
The intermediate rows mean nothing on their own — only the final state is a claim. For contrast, on
`s = "rat"`, `t = "car"` the tally ends at `a: 0, c: -1, r: 0, t: +1`, and those two non-zero slots
say precisely what is wrong: `s` has a spare `t`, `t` has a spare `c`.

### Code

```python
def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False  # required, not an optimisation: one index reads both strings
    counts = [0] * 26
    for i in range(len(s)):
        counts[ord(s[i]) - 97] += 1  # 97 is ord('a'); the letter IS the index
        counts[ord(t[i]) - 97] -= 1
    return all(c == 0 for c in counts)
```

### Common mistake

Returning early inside the loop the moment a slot goes negative — "`t` has a letter `s` has not used,
so it cannot be an anagram". It is wrong because the tally is allowed to wander: in the trace above
the `n` slot is `-1` after step 0 and back to 0 after step 1, and an early return would have rejected
a true anagram on its first iteration. Only the state after the whole loop means anything. The other
frequent slip is subtracting `ord('A')` (65) instead of `ord('a')` (97), which sends every lowercase
letter to an index past 25 and raises `IndexError` — noisy, at least, unlike the early-return bug,
which fails silently.

### Complexity and when to use this

**Time `O(n)`, space `O(1)`.** The time is a single pass that touches each character of both strings
exactly once, with an array index rather than a hash in the inner step — one pass where the two-map
version needs two. The space is twenty-six integers, a fixed amount that does not grow with the input
at all; that is the strictest sense of constant space and it is only available because the alphabet is
bounded.

Use it whenever the alphabet is small and known: lowercase letters, DNA bases, digits, bytes. This is
the answer to the problem as stated. If the constraint is relaxed to arbitrary Unicode, fall back to
the previous approach — it is the same algorithm with a hash map in place of the array, and you can
keep the single-table `+1/-1` trick by checking that the map is empty (or all zeros) at the end.

---

## The Overall Arc

Every rung of this ladder is an answer to one question: **what is the cheapest object that captures
"a bag of letters", ignoring order?** The brute force refuses to build any such object and pays for it
by searching: it knows it needs an `a` and then spends a linear scan finding out where the `a` is,
discarding that knowledge immediately and searching again for the next letter. Sorting builds the
first real canonical form — impose a total order and two equal bags become two identical strings,
after which comparison is one sweep — but a total ordering is strictly more than the question asked
for, and the receipt is `n log n` per word for information that is thrown away as soon as the
comparison is done. Counting is the moment the representation finally matches the data: a bag *is* a
table of counts, so building that table in one pass stores exactly what the problem cares about and
nothing else, and the check drops to linear. Two tables are still one table too many, though — you
never need both tallies, only whether they agree, so a single table incremented for one word and
decremented for the other ends at all zeros exactly when the answer is yes, and a non-zero slot names
the offending letter for free. The last squeeze comes from the constraint rather than the algorithm:
because there are only twenty-six lowercase letters, the letter can serve as its own array index,
which deletes the hashing and makes the space a fixed twenty-six integers rather than something that
grows with the alphabet. The habit worth keeping is the one that drove every step: before optimising,
write down what the data actually *is* — here, a bag of counts — and the efficient representation
usually falls out; then check what the constraints bound, because a bounded alphabet is what turns a
hash map into an array.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force cross-off | `O(n²)` | `O(n)` | Obviously correct; pays a linear search and shift for every letter | The spoken first answer, and the oracle a test harness checks the rest against |
| Sort both | `O(n log n)` | `O(n)` | Buys a total ordering when only a bag was needed; shortest code by far | Large or unknown alphabets, non-character symbols, or one-off glue code |
| Two hash maps | `O(n)` | `O(k)` | Linear and alphabet-agnostic, but stores two tables and hashes every character | Unicode, words-as-tokens, anything where the symbol universe is unbounded |
| **One 26-slot tally, `+1/-1`** | **`O(n)`** | **`O(1)`** | Needs a small known alphabet and equal lengths; otherwise strictly best | **The answer here: lowercase letters, digits, DNA bases, bytes** |

---

## Interview Priority

**Know cold: the 26-slot `+1/-1` tally.** It is the expected answer, it is eight lines, and the two
details that separate a clean version from a shaky one are both worth saying out loud: the length
check is a correctness requirement because one index reads both strings, and you cannot return early
on a negative slot because the tally legitimately wanders below zero mid-pass. Be ready for the
follow-up "what if the strings are Unicode?" — the answer is one sentence, swap the array for a hash
map, and it is the same algorithm.

**Know cold: the sorted comparison.** One line, impossible to get wrong, and the correct thing to
write first so that there is a working answer on the board while you talk about improving it. It is
also the genuinely better choice when the alphabet is unbounded and the strings are short, which is
worth stating rather than dismissing — "`n log n` here beats `O(n)` with a hash per character until
the words get long" is a more senior-sounding remark than "sorting is the slow one".

**Understand but do not drill: two hash maps.** You will derive it in seconds if you need it, and its
real role is as the bridge you name when the constraint on the alphabet is lifted. Knowing that
`Counter(s) == Counter(t)` is this approach is enough.

**Understand but do not drill: the brute-force cross-off.** Thirty seconds of framing — "the direct
thing is to cross letters of `s` off a copy of `t`, which is quadratic because each removal is a
search plus a shift" — and a reliable oracle for random testing. Its other use is rhetorical: it is
the version that makes clear *why* duplicate letters are the difficulty, which is what the
`set(s) == set(t)` one-liner misses.

---

## Full Runnable Script

```python
"""Valid Anagram - every approach in one file, cross-checked.

Run:  python valid_anagram.py
"""

from __future__ import annotations

import random


# ------------------------------------------------- approach 1: brute force
def is_anagram_brute(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    remaining = list(t)
    for ch in s:
        if ch not in remaining:
            return False
        remaining.remove(ch)  # finds it, then shifts everything after it left
    return True


# ------------------------------------------------- approach 2: sort both
def is_anagram_sort(s: str, t: str) -> bool:
    return sorted(s) == sorted(t)


# ------------------------------------------------- approach 3: two hash maps
def is_anagram_two_maps(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    a: dict[str, int] = {}
    b: dict[str, int] = {}
    for ch in s:
        a[ch] = a.get(ch, 0) + 1
    for ch in t:
        b[ch] = b.get(ch, 0) + 1
    return a == b  # dicts compare by content, not insertion order


# --------------------------------- approach 4: one 26-slot tally, +1 then -1
def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    counts = [0] * 26
    for i in range(len(s)):
        counts[ord(s[i]) - 97] += 1
        counts[ord(t[i]) - 97] -= 1
    return all(c == 0 for c in counts)


APPROACHES = [
    ("brute", is_anagram_brute),
    ("sort", is_anagram_sort),
    ("two_maps", is_anagram_two_maps),
    ("tally26", is_anagram),
]


def main() -> None:
    cases: list[tuple[str, str, str]] = [
        ("statement example 1", "anagram", "nagaram"),
        ("statement example 2 (no answer)", "rat", "car"),
        ("different lengths", "ab", "abc"),
        ("minimal: both empty", "", ""),
        ("minimal: one letter each", "a", "a"),
        ("same letters, wrong counts", "aab", "abb"),
        ("identical strings", "zzz", "zzz"),
        ("one letter off at the end", "abcde", "abcdf"),
    ]

    all_agreed = True
    for label, s, t in cases:
        print(f'\n{label}: s="{s}" t="{t}"')
        results: dict[str, bool] = {}
        for name, fn in APPROACHES:
            results[name] = fn(s, t)
            print(f"  {name:<10} -> {results[name]}")
        if len(set(results.values())) != 1:
            all_agreed = False
            print("  !! approaches disagree")

    # stress: 500 random pairs, half of them true anagrams by construction,
    # every one cross-checked against the brute force above.
    rng = random.Random(5)
    mismatches = 0
    for _ in range(500):
        n = rng.randint(0, 8)
        s = "".join(rng.choice("abcde") for _ in range(n))
        if rng.random() < 0.5:
            chars = list(s)
            rng.shuffle(chars)
            t = "".join(chars)
        else:
            t = "".join(rng.choice("abcde") for _ in range(rng.randint(0, 8)))
        answers = {fn(s, t) for _, fn in APPROACHES}
        if len(answers) != 1:
            mismatches += 1
            print(f'  !! stress disagreement on s="{s}" t="{t}": {answers}')
    print(f"\nstress: 500 random pairs, {mismatches} disagreements")
    all_agreed &= mismatches == 0

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND - see the lines above")


if __name__ == "__main__":
    main()
```
