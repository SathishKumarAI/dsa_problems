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

- A **multiset**, or "bag", is what you get when you tip a word's Scrabble tiles into a pouch and
  shake it. Duplicates still count, but position is gone: `{a, a, b}` is the same pouch as
  `{a, b, a}` and a different pouch from `{a, b, b}`. An anagram check is exactly a test of whether
  two pouches hold the same tiles, and that sentence is the whole problem.
- A **canonical form** is one standard way of laying a pouch out so that "are these equivalent?"
  becomes "are these identical?". Tiles in alphabetical order is one canonical form; a table saying
  how many of each letter is another.

### The constraints, and what each one unlocks

| Constraint | What it forces or permits |
|---|---|
| `1 <= s.length, t.length <= 5 * 10^4` | Fifty thousand characters is small enough that even the `O(n log n)` **sort** is comfortable, and large enough that the `O(n²)` brute force is not — about `2.5 × 10^9` character comparisons at the top end. |
| `s` and `t` consist of lowercase English letters | **This is the constraint that unlocks direct indexing.** Twenty-six possible letters means a fixed `26`-slot array, indexed by `ord(ch) - ord("a")`, replaces the hash map entirely: no hashing, no allocation that grows with the input, and the tally is `O(1)` space rather than `O(k)`. Remove it — allow Unicode — and the array becomes a hash map again, which is the same algorithm in a different container. |
| different lengths can never be anagrams | A free **early exit**, and not only an optimisation: the `+1/-1` tally below is *wrong* without it, because one index reads both strings. |
| counts matter, not just membership: `aab` and `abb` use the same letters and are not anagrams | This kills the tempting one-liner `set(s) == set(t)`, which reports `True` for that pair. A **bag** is not a set. |

The worked example traced in every section below is the statement's first:

```
s = "anagram", t = "nagaram"        answer: True
```

---

## Reading the Calculations

Exactly one line in this problem is arithmetic, and it is the one every write-up prints without
explaining: `ord(ch) - ord("a")`. If that expression is a black box, the optimal solution is a spell
rather than an idea. It is also the only place this problem can go wrong silently, so it is worth the
three minutes.

### The symbol table

| You will see | It computes | Why it is written that way | If it were wrong |
|---|---|---|---|
| `ord(ch)` | the character's **code point** — its number | `"a"` is `97`, `"b"` is `98`, … `"z"` is `122`. The alphabet is *contiguous* in that numbering, which is the fact being exploited | — |
| `ord(ch) - ord("a")` | a slot in `0..25` | Arrays start at `0` and the letters start at `97`. Subtracting the first letter **shifts the alphabet down to zero** | Drop the subtraction and `counts[97]` needs a 123-slot array; on a 26-slot one it is an `IndexError` |
| `[0] * 26` | one counter per letter | Fixed size, known before reading a single character. This is what "`O(1)` space" means here | `[[0]] * 26` would share one object 26 times — not a bug in *this* problem, but the classic one next door |
| `counts[…] += 1` for `s`, `-= 1` for `t` | **one** tally, walked from both sides | Two separate tables would need a comparison at the end; one table needs only a test against zero | — |
| `all(c == 0 for c in counts)` | "did everything cancel?" | A letter appearing equally often in both strings nets to zero | `any(...)` inverts it; `sum(counts) == 0` passes `"ab"` against `"aa"`… **no**, it passes far worse: `+1 -1` anywhere cancels, so it is `True` for almost everything |
| `len(s) != len(t)` first | the length guard | **Correctness, not speed.** See below | Without it the loop reads both strings at one index and silently reports `True` for `"ab"` vs `"aba"` |
| `sorted(s) == sorted(t)` | canonical form, compared | Two bags are equal iff their sorted layouts are | `sorted(s) == sorted(t)` on *sets* — `set(s) == set(t)` — loses the counts and passes `"aab"` vs `"abb"` |

### The one rearrangement

Not an equation this time, but a merge. The obvious version keeps two tables and compares them:

```
counts_s = tally of s          counts_t = tally of t          return counts_s == counts_t
```

The optimal version keeps **one**, and moves the comparison inside it:

```
one table:   +1 for every letter of s          -1 for every letter of t
             anagrams  <=>  every slot is 0
```

The step that makes it legal is noticing that `a == b` is the same statement as `a - b == 0`. Once
the difference is what you store, the final comparison has already happened — the table *is* the
comparison, carried as you go. That move (store the difference rather than both sides) recurs
constantly: it is why prefix sums answer range queries, and why XOR answers `single-number`.

### How `ord` arithmetic actually works

```
  'a'  ->  97      97 - 97  =  0     counts[0]
  'b'  ->  98      98 - 97  =  1     counts[1]
  'n'  -> 110     110 - 97  = 13     counts[13]
  'z'  -> 122     122 - 97  = 25     counts[25]
```

Twenty-six letters, twenty-six slots, `0` through `25`, and the subtraction is doing one job:
**rebasing**. The same trick with a different base appears in `top-k-frequent`'s counting array
(`x - lo`, where `lo` is `-10^4`) and anywhere values are dense but do not start at zero. When it is
wrong it is usually wrong by being *absent*, and the symptom is an `IndexError` rather than a wrong
answer — which is the lucky case.

### How to hand-trace it

`s = "anagram"`, `t = "nagaram"`. One table, walked from both sides at once. Every row below is
printed by the script at the foot of this document.

| `i` | `s[i]` | slot | `t[i]` | slot | table afterwards (non-zero slots only) |
|---|---|---|---|---|---|
| 0 | `a` | 0 | `n` | 13 | `a:+1, n:-1` |
| 1 | `n` | 13 | `a` | 0 | *(empty)* |
| 2 | `a` | 0 | `g` | 6 | `a:+1, g:-1` |
| 3 | `g` | 6 | `a` | 0 | *(empty)* |
| 4 | `r` | 17 | `r` | 17 | *(empty)* |
| 5 | `a` | 0 | `a` | 0 | *(empty)* |
| 6 | `m` | 12 | `m` | 12 | *(empty)* |

Every slot zero, so `True`. Watch rows 0 and 1: the table goes out of balance and comes back. That is
the normal state of this algorithm — it is only the value at the **end** that means anything, and a
tempting "bail out as soon as a slot goes negative" is wrong for exactly that reason.

**The recipe, for any input:** check the lengths first; make 26 zeros; add one for each letter of the
first string and subtract one for each letter of the second, at the same index; answer whether every
slot is zero. If you find yourself comparing two tables, you have written approach 3 — which, as the
measurement below shows, is not the mistake it looks like.

---

## Approach 1 — Brute force: cross off each letter of `s` inside a copy of `t`  *(an addition — not in the data file's ladder)*

### The idea

*What is the most direct thing that could possibly work?* Make a scratch copy of `t` and, for each
letter of `s`, find that letter in the copy and delete it; if every letter is found and the copy ends
up empty, the two words used the same letters the same number of times. *Why is that not the answer?*
Because "find that letter" scans the copy from the start, and deleting from the middle of a list
shifts everything after it — two linear operations, performed once per letter of `s`.

### How to think about it

> **Intuition.** Lay the letter tiles of `t` face up on a table, then read `s` aloud one letter at a
> time, picking up a matching tile for each. Reach for a letter that is not on the table and the
> answer is no; finish `s` with the table bare and the answer is yes. Duplicates handle themselves —
> **a tile can only be picked up once** — which is precisely what the `set(s) == set(t)` shortcut
> throws away. What to carry forward is that nearly all the effort is *searching*: you already know
> you need an `a`, and then spend a whole sweep of the table discovering **where** the `a` is, when
> you never cared where.

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

Every letter was found and the table is clear, so the answer is `True`. Count the work: each row did
a search and a shift over a list that started at seven elements — roughly fifty character operations
for a seven-letter word.

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

> **Watch out.** The misconception is that `remove` is a **question** — that asking a list to drop a
> letter it does not have is a quiet no-op. It is not: `list.remove` raises `ValueError`, so a
> function whose job is to answer `True` or `False` instead takes the caller down with it.

The `in` check before the `remove` is what turns the exception back into an answer. The related slip
is dropping the **length guard** and trusting "the copy ends up empty": with `s = "ab"` and
`t = "abc"` every letter of `s` is found, the loop finishes, and the function returns `True` while a
`c` is still sitting on the table.

### Complexity and when to use this

**Time** `O(n²)`, **space** `O(n)`. The time is `n` letters of `s`, each costing a scan of the
remaining list to locate the match plus a shift of everything after it — both linear, both inside the
loop. The space is the scratch copy of `t`; Python strings are immutable, so the copy is not
optional.

Use it as the spoken first answer and as the **oracle** a test harness checks the rest against, which
is what the script at the bottom of this document does with it. At `n = 5 × 10^4` the worst case is
about `2.5 × 10^9` operations, so it is not merely inelegant — it is too slow for the stated input
size.

---

## Approach 2 — Sort both strings and compare

### The idea

*The brute force hunts for each letter — what if both words already lay in an order that makes
comparison trivial?* Sort the letters of each word; two anagrams have exactly one sorted form between
them, so the check becomes a single equality test.

This fixes brute force's central weakness — **every letter is hunted for, one linear scan at a
time** — because sorting has put every letter of both words in the same predictable place.

### How to think about it

> **Intuition.** Two people are each handed a pouch of tiles and told to lay theirs out in
> alphabetical order. Neither can see the other's word, neither knows what order it arrived in — and
> yet if the two pouches held the same tiles, the two rows on the table are now **identical, tile for
> tile**. Alphabetical order is a **fingerprint** for a bag of letters: same bag, same row, every
> time. Comparison stops being a search and becomes a glance down two rows.

> **Why it works.** Sorting is a function of the multiset alone — it reads the bag and ignores the
> arrival order entirely — so two words with the same bag *cannot* sort differently. Run it the other
> way for the converse: if the bags differ, some letter is more frequent in one word than the other,
> and in sorted order that letter's run has a different length, so the two rows must disagree at the
> first position where the runs diverge. Equal bags ⇔ equal sorted forms, which is exactly what an
> equality test on the sorted lists decides.

### Worked example

`s = "anagram"`, `t = "nagaram"`.

**Canonicalise:**

| String | letters | sorted |
|---|---|---|
| `s` | `a n a g r a m` | `a a a g m n r` |
| `t` | `n a g a r a m` | `a a a g m n r` |

**Compare:** the two seven-character sequences are identical position by position, so the answer is
`True`. Contrast with the statement's other example: `"rat"` sorts to `a r t`, `"car"` sorts to
`a c r`, which differ at position 1 (`r` versus `c`) — `False`, decided by a single character
comparison once the sorting is done.

### Code

```python
def is_anagram_sort(s: str, t: str) -> bool:
    return sorted(s) == sorted(t)  # unequal lengths differ as lists, so no guard needed
```

### Common mistake

> **Watch out.** The misconception is that `sort` and `sorted` are **the same verb spelled two
> ways**. One rearranges a list and hands you back `None`; the other leaves its argument alone and
> hands you the sorted copy. Comparing the results of two in-place sorts compares `None` to `None`,
> which is `True` for every pair of strings on earth.

Python will not let you write `s.sort()` on a string, but `list(s).sort()` is legal, returns `None`,
and turns the whole function into a constant `True`. Reach for `sorted()` when you want a value and
`.sort()` only when you want a side effect.

### Complexity and when to use this

**Time** `O(n log n)`, **space** `O(n)`. The time is two **sorts**, each `n log n` comparisons; the
equality check afterwards is linear and does not change the order of growth. The space is the two
sorted lists — `sorted()` always builds a new list, so there is no in-place variant for strings.

Use it when the alphabet is large, unknown, or not characters at all — sorting does not care whether
it compares lowercase letters, Unicode code points or tuples, while every counting approach must
first know what the universe of symbols is. It is also the right answer when you are writing the
check once, in glue code, and `n log n` on short words is invisible.

---

## Approach 3 — Two hash maps of counts  *(an addition — not in the data file's ladder)*

### The idea

*Sorting imposes a total ordering on the letters, but "same bag of letters" never mentioned order —
can the bag be built directly?* Count how many times each letter appears in `s`, do the same for `t`,
and compare the two tables.

This fixes sorting's weakness — **it buys a total ordering when only a bag was wanted** — and drops
the `log n` factor with it: building a count table is one pass per string.

### How to think about it

> **Intuition.** Two shopping receipts. You do not care in which order the items went into the
> basket, and no receipt records that anyway — it records *three apples, one gherkin, one mango*.
> Two baskets match when their receipts match, line for line, and reading a receipt is instant. A map
> from letter to count **is** that receipt: it stores precisely what the question asks about and
> nothing else, where the sorted row was still carrying an ordering nobody wanted.

The cost model shifts with the representation. It is no longer `n log n` comparisons but `n` hash
lookups, and the memory is proportional to the number of **distinct** letters rather than to the
length of the words. That distinction is the opening the last approach walks through.

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

**Compare:** `a` and `b` were filled in different orders and hold different insertion sequences, but
dictionaries compare by content — same five keys, same five counts — so the answer is `True`.

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

> **Watch out.** The misconception is that "the same letters" means **the same set of letters**. It
> does not — it means the same letters *with the same multiplicities*, and a set has thrown the
> multiplicities away before you ever get to compare it.

Comparing `set(a.keys()) == set(b.keys())` instead of `a == b` reports `True` on `s = "aab"`,
`t = "abb"` — both key sets are `{a, b}` — which is the exact failure the constraints call out. The
equivalent slip is comparing only the number of distinct keys, `len(a) == len(b)`, which fails on the
same input for the same reason.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(k)`, where `k` is the number of distinct symbols. The time is two
linear passes plus a comparison of two maps holding at most `k` entries each, with constant-time hash
operations throughout. The space is the two maps; for lowercase English `k` is at most `26`, but in
general it grows with the **alphabet**, not with the input length.

Use it whenever the alphabet is large or unbounded — Unicode text, words rather than letters,
arbitrary hashable tokens. This is the version that survives "now make it work for any Unicode
string", and answering that follow-up is just swapping the next approach's array back for a map. In
Python, `collections.Counter(s) == collections.Counter(t)` is this approach with the loops written
for you.

---

## Approach 4 — One `26`-slot tally, counting up for `s` and down for `t` (optimal)

### The idea

*Two maps hold two copies of nearly the same information and then compare them — what if one table
held the difference?* Walk both strings together, adding one to a letter's slot for `s` and
subtracting one for `t`; if the words are anagrams every slot returns to zero.

This fixes two of the previous rung's weaknesses at once: it halves the storage by keeping **one**
table instead of two, and — because the alphabet is fixed at twenty-six lowercase letters — it
replaces hashing with plain array indexing, making the space genuinely constant rather than
proportional to the alphabet.

### How to think about it

> **Intuition.** A ledger with one line per letter, all starting at zero. Every letter of `s` is a
> deposit on its line, every letter of `t` a withdrawal from its line. You are not asking what either
> word contains — you are asking whether the **books balance** at the end. A line left in credit says
> `s` has a spare of that letter; a line in debit says `t` does. All zeros means every deposit was
> matched by a withdrawal, which is the same statement as "the two pouches held the same tiles".

Two separate ideas are stacked here and both are reusable. The first is **store the difference, not
the operands**: you never needed the two tallies, only whether they agree. The second is **the value
is the index** — `_slot("a")` is `0` and `_slot("z")` is `25`, so a plain twenty-six-element list *is*
a perfect hash table with no collisions and no hash computation.

> **Why it works.** One index reads both strings, so after `i` iterations every line of the ledger
> holds `count(s[:i + 1]) - count(t[:i + 1])` for its letter — that is the invariant. At the end of
> the loop the lines therefore hold `count(s) - count(t)` letter by letter, and two bags are equal
> exactly when every one of those differences is zero. One table suffices because the *difference* of
> two multisets determines equality just as well as the pair of them, and a single pass suffices
> because the two strings have equal length — which is why the length guard is a correctness
> requirement here and merely an optimisation elsewhere.

### Worked example

`s = "anagram"`, `t = "nagaram"`. One index walks both. Only the non-zero slots are shown; the other
twenty-one stay at `0` throughout.

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

Every slot is zero, so the answer is `True`. Watch the ledger **wander** away from zero and back: at
`i = 0` it records "`s` is one `a` ahead and one `n` behind", and by `i = 1` that debt is settled. The
intermediate rows mean nothing on their own — only the final state is a claim. For contrast, on
`s = "rat"`, `t = "car"` the tally ends at `a: 0, c: -1, r: 0, t: +1`, and those two non-zero lines
say precisely what is wrong: `s` has a spare `t`, `t` has a spare `c`.

### Code

`ALPHABET` and `_slot` are the document's one **alphabet contract**: retarget the counting rung at
digits, DNA bases or bytes by editing those two lines and nothing else.

```python
ALPHABET = 26  # lowercase English, which the statement promises

def _slot(ch: str) -> int:
    """Letter -> tally index. Paired with ALPHABET; change both or neither."""
    return ord(ch) - ord("a")

def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False  # required, not an optimisation: one index reads both strings
    counts = [0] * ALPHABET
    for i in range(len(s)):
        counts[_slot(s[i])] += 1
        counts[_slot(t[i])] -= 1
    return all(c == 0 for c in counts)
```

### Common mistake

> **Watch out.** The misconception is that a slot going **negative** is already a verdict — "`t` has
> used a letter `s` has not, so we can stop". The ledger is *allowed* to go into debit mid-pass. In
> the trace above the `n` line is `-1` after step 0 and back to `0` after step 1, so an early return
> would reject a true anagram on its very first iteration.

Only the state after the whole loop means anything. The other frequent slip is writing `_slot` with
`ord("A")` instead of `ord("a")`, which sends every lowercase letter to an index past `25` and raises
`IndexError` — noisy, at least, unlike the early-return bug, which fails silently.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. The time is a single pass touching each character of both strings
exactly once, with an array index rather than a hash in the inner step — one pass where the two-map
version needs two. The space is twenty-six integers, a fixed amount that does not grow with the input
at all; that is the strictest sense of constant space, and it is available only because the alphabet
is **bounded**.

Use it whenever the alphabet is small and known: lowercase letters, DNA bases, digits, bytes. This is
the answer to the problem as stated. If the constraint is relaxed to arbitrary Unicode, fall back to
the previous approach — it is the same algorithm with a hash map in place of the array, and you can
keep the single-table `+1/-1` trick by checking the map is all zeros at the end.

> **Under the hood.** Everything above is true and the rung is still, in Python, the **slowest real
> rung on this page**. True anagrams of length `n`, best of five:
>
> | `n` | sort | two maps | **tally26** | `Counter(s) == Counter(t)` |
> |---|---|---|---|---|
> | `1,000` | 79 µs | 49 µs | 138 µs | **31 µs** |
> | `10,000` | 1,182 µs | 523 µs | 1,057 µs | **316 µs** |
> | `50,000` | 5,936 µs | 2,810 µs | 5,662 µs | **1,812 µs** |
>
> At the constraint's ceiling the `O(1)`-space linear rung is **3× slower** than a two-line
> `Counter(s) == Counter(t)`, and no faster than the `O(n log n)` sort it replaced. The asymptotics
> did not lie — they simply are not what is being measured. `sorted()` and `Counter()` run their loops
> in compiled C; `tally26` runs its loop in the interpreter and pays for an `ord()` call, a
> subtraction and an index on every character. At `n = 50,000` that is 100,000 interpreted iterations
> against one bulk call.
>
> It gets sharper. Compare fifty thousand `a`s against strings that differ in one place:
>
> | `t` | sort | `Counter` | tally26 |
> |---|---|---|---|
> | differs at position 0 | **614 µs** | 1,686 µs | 4,747 µs |
> | differs at the last position | **599 µs** | 1,683 µs | 4,762 µs |
> | identical | **595 µs** | 1,670 µs | 4,770 µs |
>
> The *sort* is now the fastest rung by 8×, because Timsort detects an already-ordered run and does
> almost nothing. Note also what does **not** happen: no column changes with the position of the
> mismatch. Not one of these rungs can exit early, because every one of them must read both strings
> in full before it knows anything — unlike `contains-duplicate`, where the early exit was the whole
> story.
>
> **What to take from this.** The ladder ranks *algorithms*; the clock ranks *implementations*, and in
> a language where the primitive is compiled and your loop is not, the two orders come apart. The
> honest reading of `tally26` is that it is the right answer for the reasons the section above gives —
> one pass, twenty-six integers, no allocation that grows, and it ports to C or Java or Rust where it
> genuinely *is* the fastest thing here. In Python, reach for `Counter` and know why you did.

---

## The Overall Arc

Every rung of this ladder is an answer to one question: **what is the cheapest object that captures
"a bag of letters", ignoring order?** The brute force refuses to build any such object and pays for it
by searching: it knows it needs an `a` and then spends a linear scan finding out where the `a` is,
discarding that knowledge immediately and searching again for the next letter. Sorting builds the
first real canonical form — impose a total order and two equal bags become two identical rows, after
which comparison is one sweep — but a total ordering is strictly more than the question asked for,
and the receipt is `n log n` per word for information thrown away as soon as the comparison is done.
Counting is the moment the representation finally matches the data: a bag *is* a table of counts, so
building that table in one pass stores exactly what the problem cares about and nothing else, and the
check drops to linear. Two tables are still one table too many, though — you never need both tallies,
only whether they agree, so a single ledger credited for one word and debited for the other ends at
all zeros exactly when the answer is yes, and a non-zero line names the offending letter for free.
The last squeeze comes from the constraint rather than the algorithm: because there are only
twenty-six lowercase letters, the letter can serve as its own array index, which deletes the hashing
and makes the space a fixed twenty-six integers rather than something that grows with the alphabet.
The habit worth keeping is the one that drove every step — before optimising, write down what the
data actually *is*, here a bag of counts, and the efficient representation usually falls out; then
check what the constraints bound, because a bounded alphabet is what turns a hash map into an array.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force cross-off | `O(n²)` | `O(n)` | Obviously correct; pays a linear search and shift for every letter | The spoken first answer, and the oracle a test harness checks the rest against |
| Sort both | `O(n log n)` | `O(n)` | Buys a total ordering when only a bag was needed; shortest code by far | Large or unknown alphabets, non-character symbols, or one-off glue code |
| Two hash maps | `O(n)` | `O(k)` | Linear and alphabet-agnostic, but stores two tables and hashes every character | Unicode, words-as-tokens, anything where the symbol universe is unbounded |
| **One `26`-slot tally, `+1/-1`** | **`O(n)`** | **`O(1)`** | Needs a small known alphabet and equal lengths; otherwise strictly best | **The answer here: lowercase letters, digits, DNA bases, bytes** |

---

## Interview Priority

> **In an interview.** Name the reframing before you write anything: *"an anagram check is a test
> that two multisets are equal, so I want the cheapest object that represents a multiset — and with
> only twenty-six letters that is a fixed array of counts."* Then write the tally and volunteer the
> two details that separate a clean version from a shaky one: the length check is a **correctness**
> requirement because one index reads both strings, and you cannot return early on a negative slot
> because the ledger legitimately goes into debit mid-pass. The follow-up is almost always **"what if
> the strings are Unicode?"** — one sentence: swap the array for a hash map, same algorithm.

**Know cold: the `26`-slot `+1/-1` tally.** It is the expected answer and it is eight lines. The
value is in the two caveats above, not the loop.

**Know cold: the sorted comparison.** One line, impossible to get wrong, and the correct thing to
write first so there is a working answer on the board while you talk about improving it. It is also
genuinely the better choice when the alphabet is unbounded and the strings are short — "`n log n`
here beats `O(n)` with a hash per character until the words get long" is a more senior remark than
"sorting is the slow one".

**Understand but do not drill: two hash maps.** You will derive it in seconds if you need it, and its
real role is as the **bridge** you name when the constraint on the alphabet is lifted. Knowing that
`Counter(s) == Counter(t)` is this approach is enough.

**Understand but do not drill: the brute-force cross-off.** Thirty seconds of framing — "the direct
thing is to cross letters of `s` off a copy of `t`, which is quadratic because each removal is a
search plus a shift" — and a reliable oracle for random testing. Its other use is rhetorical: it is
the version that makes clear *why* duplicate letters are the difficulty, which is exactly what the
`set(s) == set(t)` one-liner misses.

---

## How to Get Fluent

**1. Derive the slot arithmetic, do not memorise it.** Without looking, write the slot for `'n'`.
*Done when:* you got `13` by computing `110 - 97` rather than by recalling that `n` is the fourteenth
letter. The point is the *rebasing*, which transfers; the alphabet does not.

**2. Write the single-table version from nothing.** Six lines including the length guard.
*Done when:* the length check was the **first** line you wrote. If it arrived as an afterthought,
go to drill 3 immediately.

**3. Delete the length guard and watch it lie.** Run `("ab", "aba")`, `("a", "aa")`, `("abc",
"abcabc")`.
*Done when:* you have seen all three return `True` and can say exactly why — the loop indexes both
strings together, so it never reads the tail of the longer one. This is correctness, not an
optimisation, and it is the single most common way this solution ships broken.

**4. Break the other one.** Replace the tally with `set(s) == set(t)` and run `("aab", "abb")`.
*Done when:* you can state the difference between a set and a bag in one sentence and name which
one this problem needs.

**5. Time all four rungs yourself before reading the numbers again.** The script at the foot of this
page does it.
*Done when:* you can explain why the `O(1)`-space linear rung came last in Python, and why that
would reverse in C. If your explanation is about the algorithm, it is wrong — it is about where the
loop runs.

**6. Answer the Unicode follow-up cold.** *"Now the strings can contain any character."*
*Done when:* you say "same algorithm, hash map instead of the 26-slot array, keep the `+1/-1` and
check every value is zero" without hesitating — and can add the harder half: that "same character"
is not obvious in Unicode, since `é` has two encodings, so a real system normalises first.

**The one sentence worth keeping a month from now:** *`a == b` is `a - b == 0`, so store the
difference and the comparison happens for free* — and its shadow: *asymptotics rank the algorithm,
the clock ranks the implementation, and in Python they disagree.*

---

## Full Runnable Script

Every approach above, plus the statement's two examples, a length mismatch, the shortest legal input,
the `aab`/`abb` pair that defeats a set, and 500 randomised pairs — half of them true anagrams by
construction — all cross-checked against the brute force. `ALPHABET` and `_slot` are the shared
**alphabet contract**, declared once here and used only where counting by index happens.

```python
"""Valid Anagram - every approach in one file, cross-checked.

Run:  python valid_anagram.py
"""

from __future__ import annotations

import random
import time
from collections import Counter

# --- the alphabet contract: change these two together, and nothing else -------

ALPHABET = 26  # lowercase English, which the statement promises


def _slot(ch: str) -> int:
    """Letter -> tally index. Paired with ALPHABET; change both or neither."""
    return ord(ch) - ord("a")


# --- 1. brute force: cross letters of s off a copy of t -----------------------

def is_anagram_brute(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    remaining = list(t)
    for ch in s:
        if ch not in remaining:
            return False
        remaining.remove(ch)  # finds it, then shifts everything after it left
    return True


# --- 2. sort both and compare -------------------------------------------------

def is_anagram_sort(s: str, t: str) -> bool:
    return sorted(s) == sorted(t)


# --- 3. two hash maps of counts -----------------------------------------------

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


# --- 4. one ALPHABET-slot tally, +1 for s then -1 for t (optimal) -------------

def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False  # required, not an optimisation: one index reads both strings
    counts = [0] * ALPHABET
    for i in range(len(s)):
        counts[_slot(s[i])] += 1
        counts[_slot(t[i])] -= 1
    return all(c == 0 for c in counts)


APPROACHES = [
    ("brute", is_anagram_brute),
    ("sort", is_anagram_sort),
    ("two_maps", is_anagram_two_maps),
    ("tally26", is_anagram),
]


# --- test harness -------------------------------------------------------------

def _best_of(fn, rounds: int = 5) -> float:
    best = float("inf")
    for _ in range(rounds):
        start = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - start)
    return best


def _anagram_pair(n: int, rng: random.Random) -> tuple[str, str]:
    s = "".join(rng.choice("abcdefghijklmnopqrstuvwxyz") for _ in range(n))
    shuffled = list(s)
    rng.shuffle(shuffled)
    return s, "".join(shuffled)


def _tally_no_length_guard(s: str, t: str) -> bool:
    """Scaffolding: the optimal rung with its FIRST line removed, to show what breaks."""
    counts = [0] * ALPHABET
    for i in range(min(len(s), len(t))):
        counts[_slot(s[i])] += 1
        counts[_slot(t[i])] -= 1
    return all(c == 0 for c in counts)


def trace_the_single_table() -> None:
    """Every row of the hand-trace table in 'Reading the Calculations'."""
    s, t = "anagram", "nagaram"
    print(f"=== s={s!r} t={t!r}, one table walked from both sides ===")
    counts = [0] * ALPHABET
    for i in range(len(s)):
        counts[_slot(s[i])] += 1
        counts[_slot(t[i])] -= 1
        live = {chr(97 + j): c for j, c in enumerate(counts) if c}
        print(
            f"  i={i}  s[{i}]={s[i]} -> slot {_slot(s[i]):<2}"
            f"  t[{i}]={t[i]} -> slot {_slot(t[i]):<2}"
            f"  table {live if live else '(empty)'}"
        )
    print(f"  every slot zero? {all(c == 0 for c in counts)}")


def measure() -> None:
    """The numbers quoted in the 'Under the hood' callout. Timings are one machine's;
    the ORDER of the columns is the claim, and it is the surprising part."""
    rng = random.Random(20260913)

    print("\n=== true anagrams, as n grows ===")
    print(f"  {'n':>7} {'sort us':>9} {'two maps us':>12} {'tally26 us':>11} {'Counter us':>11}")
    for n in (1000, 10000, 50000):
        s, t = _anagram_pair(n, rng)
        print(
            f"  {n:>7}"
            f" {_best_of(lambda: is_anagram_sort(s, t)) * 1e6:>9.0f}"
            f" {_best_of(lambda: is_anagram_two_maps(s, t)) * 1e6:>12.0f}"
            f" {_best_of(lambda: is_anagram(s, t)) * 1e6:>11.0f}"
            f" {_best_of(lambda: Counter(s) == Counter(t)) * 1e6:>11.0f}"
        )

    print("\n=== fifty thousand 'a's, and where the mismatch sits ===")
    n = 50000
    s = "a" * n
    print(f"  {'t':>30} {'sort us':>9} {'Counter us':>11} {'tally26 us':>11}")
    for label, t in [
        ("differs at position 0", "b" + "a" * (n - 1)),
        ("differs at the last position", "a" * (n - 1) + "b"),
        ("identical", "a" * n),
    ]:
        print(
            f"  {label:>30}"
            f" {_best_of(lambda: is_anagram_sort(s, t)) * 1e6:>9.0f}"
            f" {_best_of(lambda: Counter(s) == Counter(t)) * 1e6:>11.0f}"
            f" {_best_of(lambda: is_anagram(s, t)) * 1e6:>11.0f}"
        )
    print("  no column moves with the mismatch: not one rung can exit early")

    print("\n=== the length guard is correctness, not an optimisation ===")
    for a, b in (("ab", "aba"), ("a", "aa"), ("abc", "abcabc")):
        print(
            f"  s={a:<7} t={b:<7} guarded {is_anagram(a, b)!s:<6}"
            f" unguarded {_tally_no_length_guard(a, b)!s:<6}"
        )


def main() -> None:
    trace_the_single_table()
    measure()
    print()

    cases: list[tuple[str, str, str]] = [
        ("statement example 1", "anagram", "nagaram"),
        ("statement example 2 (no answer)", "rat", "car"),
        ("different lengths", "ab", "abc"),
        ("shortest legal input, no answer", "a", "b"),
        ("shortest legal input: one letter each", "a", "a"),
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
        n = rng.randint(1, 8)  # 1, not 0: the constraints promise a non-empty string
        s = "".join(rng.choice("abcde") for _ in range(n))
        if rng.random() < 0.5:
            chars = list(s)
            rng.shuffle(chars)
            t = "".join(chars)
        else:
            t = "".join(rng.choice("abcde") for _ in range(rng.randint(1, 8)))
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
