# Where Every Anagram Hides — explained

## Understanding the Problem

You are given a long piece of text and a short pattern, both lowercase letters. Slide a frame of
exactly the pattern's width along the text. At each position, ask: does the chunk inside the frame
use **exactly the same letters, the same number of times**, as the pattern — in any order? Every
position where the answer is yes goes into a list of start indices, and that list is the answer.

The single substitution that unlocks everything: **an anagram is not about order, it is about
counts**. "cba" and "bac" are anagrams of "abc" because all three contain one `a`, one `b` and one
`c`. So a window is an answer exactly when its 26-slot letter tally equals the pattern's 26-slot
letter tally. Order never enters the question, which means any solution that computes an ordering —
sorting, say — is answering a harder question than the one asked.

**The core question:** at each of the text's positions, does the window starting there have the same
letter counts as the pattern? The naive approach is slow because it rebuilds those counts from
scratch at every position, re-reading `k` characters per window when two neighbouring windows differ
by exactly two letters.

Two properties of this problem shape every rung below, and both are unusual enough to be worth
naming before any code:

- **The window is a fixed width.** Unlike most window problems, there is no growing and no
  shrinking: the frame is `len(pattern)` wide always, and "slide by one" means exactly *one letter
  enters and one letter leaves*. Two updates per step, forever.
- **Answers overlap, and that is normal.** The frame advances by one after a hit, never by `k`.
  `"aaaa"` with pattern `"aa"` answers at 0, 1 **and** 2 — three overlapping windows, all correct. A
  solution that jumps past a match to avoid "reusing" letters is not being careful, it is wrong.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| text and pattern up to `3 · 10^4`, **lowercase letters only** | **This is the constraint that unlocks the fixed 26-slot array** in place of a hash map, and it is why every approach below is `O(1)` space rather than `O(k)`: the alphabet is bounded and known, so a plain array indexed by `ord(ch) - 97` replaces a dictionary and the comparison of two tallies is a fixed 26 steps regardless of the input. It is also the constraint whose *absence* would change the answer — Unicode text would need a map and the "compare 26" step would become "compare however many distinct letters exist". |
| every candidate has the pattern's length | **This is the constraint that makes it a fixed-width window.** There are at most `len(text) − len(pattern) + 1` candidates, all the same size, so nothing ever grows or shrinks — the only move is "slide by one", which changes exactly two letters. |
| an anagram is about **counts**, not order | **This is the constraint that kills sorting.** Sorting produces an order nobody asked for, at `k log k` per window, and throws it away immediately. Two tallies answer the same question in a fixed 26 comparisons. |
| windows overlap; `"aaaa"` with `"aa"` answers three times | Do not advance past a match. The step is always one. |
| a pattern longer than the text has no windows at all | The answer is an empty list, and the two sliding approaches need an explicit guard for it — otherwise they compare a tally that was never filled. The two per-window approaches get it for free from an empty loop range. |

The worked example used in every section below is the statement's own:

```
text = "cbaebabacd", pattern = "abc"        answer: [0, 6]
```

`"cba"` sits at index 0 and `"bac"` at index 6; both hold one `a`, one `b` and one `c`. The pattern
is `k = 3` wide, and the text has ten characters, so there are `10 − 3 + 1 = 8` windows to judge.

---

## Approach 1 — Sort every window

### The idea

*How do I know whether two strings are anagrams?* Put both into a canonical order and compare them
as strings. Two strings are anagrams exactly when their sorted forms are identical, so sort the
pattern once, then sort each window of the text and check for equality.

### How to think about it

> **Intuition.** This is the dictionary definition, typed. Think of each window as a handful of
> Scrabble tiles: to compare two handfuls you line both up alphabetically on the rack and see
> whether the two rows look the same. It is obviously correct, which is its whole value — you can
> hand it to someone who has never seen the problem and they will agree it works. The waste is
> equally obvious once you look for it: alphabetising a handful is a lot of effort to answer a
> question that does not care about alphabetical order, and you throw the sorted row away and
> start over for the next handful, which differs from it by one tile.

### Worked example

`text = "cbaebabacd"`, `pattern = "abc"`, so `target = ['a', 'b', 'c']` and `k = 3`.

| start | window | sorted window | equals target? |
|---|---|---|---|
| **0** | `cba` | `abc` | **yes → record 0** |
| 1 | `bae` | `abe` | no |
| 2 | `aeb` | `abe` | no |
| 3 | `eba` | `abe` | no |
| 4 | `bab` | `abb` | no |
| 5 | `aba` | `aab` | no |
| **6** | `bac` | `abc` | **yes → record 6** |
| 7 | `acd` | `acd` | no |

Answer `[0, 6]`. Eight windows, eight sorts of three characters each. Rows 1, 2 and 3 are worth
staring at: three different windows that all sort to `abe`, because they are the same three letters
being shuffled. Three separate sorts to discover that nothing changed except the arrangement.

### Code

```python
def anagram_positions_sort_every_window(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    target = sorted(pattern)
    out: list[int] = []
    for start in range(len(text) - k + 1):
        if sorted(text[start : start + k]) == target:
            out.append(start)
    return out
```

Note that `range(len(text) - k + 1)` is empty when the pattern is longer than the text, so the
"no windows at all" case needs no guard here.

### Common mistake

> **Watch out.** The misconception is that *the same letters* is a question about **membership**.
> It is a question about multiplicity: a set records which letters appear and has already thrown
> away how many times.

Reaching for a `set` instead of `sorted`, because "same letters" sounds like a set question:

```python
    target = set(pattern)
    ...
        if set(text[start : start + k]) == target:   # WRONG — a set forgets multiplicity
```

A set records *which* letters appear and discards *how many times*, and an anagram is precisely a
statement about how many times. On the worked example this bug is completely invisible — it still
returns **[0, 6]**, because `"abc"` has no repeated letters and neither does any near-miss window.
That invisibility is what makes it dangerous: it passes the example in the problem statement.
Run it on `text = "aab"`, `pattern = "abb"` and it returns **[0]** where the right answer is **[]** —
`{a, b} == {a, b}`, so it happily calls `"aab"` an anagram of `"abb"`.

The fix is not "use a set plus a length check" — the lengths are equal by construction here, so that
adds nothing. The fix is to compare something that carries multiplicity: a sorted sequence, or
better, a tally.

### Complexity and when to use this

**Time** `O(n · k log k)`, **space** `O(k)`. The time is the number of windows, roughly n, times the cost of
sorting one window, `k log k` — so it degrades with both the text length and the pattern length, and
it is the only rung here whose cost depends on `k` at all after the tally arrives. The space is the
sorted copy of one window plus the sorted pattern, both `k` characters.

At the stated limits — text and pattern both up to `3 · 10^4` — this is on the order of 10⁹
character comparisons and will not pass. Use it when the "windows" are not windows at all: if you
have a scattered list of candidate strings with no structure between them, there is nothing to slide
and sorting each one is entirely reasonable. It is also the clearest possible oracle for a test
harness, which is its job at the bottom of this document.

---

## Approach 2 — Count every window from scratch

### The idea

*Sorting produces an ordering the question never asked for — what does the question actually
compare?* Counts. So build a 26-slot tally for the pattern once, and for each window build a fresh
26-slot tally and compare the two. Same answer, and counting `k` characters is cheaper than sorting
them.

This fixes Approach 1's weakness — **it pays `k log k` to impose an ordering, then throws the
ordering away without ever using it.**

### How to think about it

> **Intuition.** Instead of alphabetising the Scrabble tiles, keep a scoresheet with twenty-six
> boxes, one per letter, and tick a box for each tile in your hand. Two hands are anagrams exactly
> when their scoresheets are identical, and comparing two scoresheets is twenty-six glances no
> matter how many tiles were in the hands. The tiles' arrangement never mattered, and now it is
> never computed. What is still wasteful is the *fresh* scoresheet: you tear it up and start
> ticking from zero for the next hand, even though that hand shares all but two of its tiles with
> the one you just scored.

### Worked example

`text = "cbaebabacd"`, `pattern = "abc"`, so `want = {a: 1, b: 1, c: 1}` and every other slot 0.
Only the non-zero slots of each window's tally are shown; every unshown slot is 0 in both tallies.

| start | window | tally built from scratch | equals `want`? |
|---|---|---|---|
| **0** | `cba` | `a:1 b:1 c:1` | **yes → record 0** |
| 1 | `bae` | `a:1 b:1 e:1` | no — `c` is 0, `e` is 1 |
| 2 | `aeb` | `a:1 b:1 e:1` | no |
| 3 | `eba` | `a:1 b:1 e:1` | no |
| 4 | `bab` | `a:1 b:2` | no — `b` is 2, `c` is 0 |
| 5 | `aba` | `a:2 b:1` | no |
| **6** | `bac` | `a:1 b:1 c:1` | **yes → record 6** |
| 7 | `acd` | `a:1 c:1 d:1` | no |

Answer `[0, 6]`. Twenty-four character reads (eight windows × three characters) plus eight
twenty-six-slot comparisons. Compare rows 3 and 4: the tally changed by exactly two slots — `e`
dropped from 1 to 0, `b` rose from 1 to 2 — yet all three characters were re-read to discover it.

### Code

```python
def anagram_positions_count_every_window(text: str, pattern: str) -> list[int]:
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
    return out
```

### Common mistake

> **Watch out.** The misconception is that the waste worth removing is the **allocation** inside
> the loop. The waste is the recount — and reusing a tally without subtracting what left is not
> reuse, it is a leak.

Hoisting `have = [0] * 26` out of the loop — usually in the name of "not allocating in a loop" — so
that one tally is reused without being cleared:

```python
    have = [0] * 26                    # WRONG — hoisted, so counts accumulate across windows
    for start in range(len(text) - k + 1):
        for ch in text[start : start + k]:
            have[ord(ch) - 97] += 1
        if have == want:
            out.append(start)
```

Every window's letters pile on top of the previous window's, so after the first window the tally
describes a growing prefix of the text rather than any window at all. On the worked example this
returns **[0]** instead of `[0, 6]`: the first window is measured correctly because the tally starts
empty, and everything after it is measured against garbage that only ever grows.

The bug is instructive because the *instinct* behind it is right — reusing the tally instead of
rebuilding it is exactly what the next rung does. The missing half is that reuse requires
**subtracting what left**, not just adding what arrived. Reuse without eviction is not an
optimization, it is a leak.

### Complexity and when to use this

**Time** `O(n · k)`, **space** `O(1)`. The time is the number of windows times `k` reads to fill the tally,
plus a fixed 26-step comparison per window that vanishes into the constant. The space is two 26-slot
arrays — fixed size regardless of the input, which is why this counts as `O(1)` and not `O(k)`: that is
the bounded-alphabet constraint paying out.

Dropping the `log k` is a genuine improvement but at the stated limits `n · k` is still about 10⁹ and
will not pass. Use it when the pattern is very short — for `k = 2` or `k = 3` the constant factors
make it competitive with anything — or when the candidate windows are not adjacent, so there is no
shared work to exploit and the tally cannot be slid.

---

## Approach 3 — Slide the tally, compare all 26

### The idea

*Neighbouring windows share all but two of their letters — so why is the tally rebuilt?* It need not
be. Keep one tally and update it as the frame moves: add the letter entering on the right, subtract
the letter leaving on the left. Two operations per step instead of `k`, and then the same 26-slot
comparison decides the window.

This fixes Approach 2's weakness — **it re-reads all `k` characters of a window that differs from
its predecessor by exactly two letters.**

### How to think about it

> **Intuition.** The frame moves one step. Exactly one letter walks in the front door and exactly
> one walks out the back, and everybody else in the room stays put. So do not re-take the register
> — adjust it by two lines. A single loop over the text does both jobs at once if you think of
> index `i` as "the letter entering" and index `i - k` as "the letter leaving at the same moment":
> the window is complete from `i = k - 1` onward, which is exactly when you start reading verdicts
> off the tally. The one thing still repeated at every step is the *comparison* — twenty-six slots
> checked, of which at most two could possibly have changed.

### Worked example

`text = "cbaebabacd"`, `pattern = "abc"`, `k = 3`, `want = {a: 1, b: 1, c: 1}`. One loop over the
text; the window is `text[i-k+1 .. i]` once `i >= 2`.

| `i` | letter in | letter out (`text[i-3]`) | tally after both updates | window | verdict |
|---|---|---|---|---|---|
| 0 | `c` | — | `c:1` | — | too early |
| 1 | `b` | — | `b:1 c:1` | — | too early |
| **2** | `a` | — | `a:1 b:1 c:1` | `cba` | **equals want → record 0** |
| 3 | `e` | `c` | `a:1 b:1 e:1` | `bae` | no |
| 4 | `b` | `b` | `a:1 b:1 e:1` | `aeb` | no |
| 5 | `a` | `a` | `a:1 b:1 e:1` | `eba` | no |
| 6 | `b` | `e` | `a:1 b:2` | `bab` | no |
| 7 | `a` | `b` | `a:2 b:1` | `aba` | no |
| **8** | `c` | `a` | `a:1 b:1 c:1` | `bac` | **equals want → record 6** |
| 9 | `d` | `b` | `a:1 c:1 d:1` | `acd` | no |

Answer `[0, 6]`. Rows 4 and 5 are the payoff: the incoming and outgoing letters happen to be the same
letter, the tally is untouched, and the window still had to be judged — twenty-six comparisons to
confirm that literally nothing changed. That is the waste the last rung removes.

### Code

```python
def anagram_positions_slide_the_tally(text: str, pattern: str) -> list[int]:
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
    return out
```

The `k > len(text)` guard is now necessary: without it, a pattern longer than the text leaves the
loop comparing a partially-filled tally, and `i >= k - 1` never becomes true only by luck of the
arithmetic. State it explicitly rather than relying on that.

### Common mistake

> **Watch out.** The misconception is that the letter leaving the window is the window's **start
> index**. When `i` arrives the window becomes `[i-k+1, i]`, so `i - k + 1` is the letter that
> stays as the new leftmost member and `i - k` is the one that just fell off the back.

Evicting the wrong letter — `text[i - k + 1]` instead of `text[i - k]`. The `+ 1` looks right because
`i - k + 1` is the window's *start* index, and "the start of the window" feels like the thing that
leaves. It is not: when `i` arrives, the window becomes `text[i-k+1 .. i]`, so `i - k + 1` is the
letter that is *staying* as the new leftmost member, and `i - k` is the one that just fell off the
back.

The result is a tally that is neither the old window nor the new one. On the worked example the buggy
version returns **[0, 3, 4, 5]** instead of `[0, 6]` — it keeps the correct first answer, then
invents three consecutive false positives at 3, 4 and 5 and misses the genuine answer at 6.
Three *plausible-looking* wrong answers in a row is worse than a crash: nothing about the output
announces that it is garbage.

The reliable way to get this right is to write down what the window is before you write the index:
after processing `i`, the window is `[i-k+1, i]` inclusive. Both `i - k` (just left) and `i - k + 1`
(the reported start) then read off that line directly.

### Complexity and when to use this

**Time** `O(26n)`, **space** `O(1)`. The `k` is gone from the time — each character of the text is added once
and subtracted once, which is the sliding — but a 26-slot comparison still runs at every one of the n
positions, so the alphabet size survives as a constant factor. The space is the same two fixed arrays.

At the stated limits this is roughly 8 · 10⁵ comparisons and passes comfortably, which is worth
saying plainly: **for this problem, this rung is fast enough.** Write it when you want the shortest
correct code that passes, and when the pattern's alphabet is small. It is also the right rung when
the comparison is genuinely cheap or genuinely rare — if you only need to test the window every so
often rather than at every position, maintaining an incremental summary buys nothing.

---

## Approach 4 — Slide the tally, carry an agreement counter (optimal)

### The idea

*A slide changes exactly two letters — so how many of the twenty-six verdicts can possibly change?*
At most two. Carry a single integer saying **how many of the 26 letters currently have the right
count**, and update it only for the two letters that moved. A window is an anagram exactly when that
integer is 26, so the whole alphabet is never walked again.

This fixes Approach 3's weakness — **it recomputes a twenty-six-part comparison at every position,
when only the letters whose own counts changed could possibly have flipped their verdict.**

### How to think about it


> **Intuition.** Keep a scoreboard reading *"23 of 26 letters are currently correct"* rather than
> re-reading all twenty-six boxes. When a letter's count changes, its verdict is the only one that
> can move, so the update is mechanical: before you touch a letter, check whether it *was* correct
> and subtract it from the score if so; change its count; then check whether it *is* correct and
> add it back if so. That is at most two points of movement per letter touched, and two letters
> are touched per slide. The subtle part is the starting value — the score begins as the number of
> letters that already agree with an empty window, which is every letter the pattern does not
> contain — and once you see that, the rest is a summary being maintained rather than recomputed.

The transferable move is worth saying on its own: **keep a summary of the comparison, and update the
summary exactly where the data changed.** That is the same trick that turns the
minimum-window-substring check from "are all required letters satisfied" into one integer, and it
generalises anywhere a verdict is a conjunction of many independent small verdicts.

> **Why it works.** One observation carries the whole rung: **only a letter whose own count
> changed can flip its verdict.** Every other letter's `have` and `want` are untouched, so their
> agreement is exactly what it was a step ago. A slide changes two letters, so at most two
> verdicts move, and `agree` stays equal to the true number of matching letters provided each
> change unbooks the old verdict before the count moves and books the new one after. `agree == 26`
> is then the same statement as `have == want`, at one integer comparison instead of 26.

### Worked example

`text = "cbaebabacd"`, `pattern = "abc"`, `k = 3`. The window starts empty, so `have` is all zeros
and the letters that already agree are the 23 letters the pattern does not use: **`agree` starts at
23.**

| `i` | in | out | what moved | `agree` after | window | verdict |
|---|---|---|---|---|---|---|
| 0 | `c` | — | `c` 0→1, now correct | 24 | — | too early |
| 1 | `b` | — | `b` 0→1, now correct | 25 | — | too early |
| **2** | `a` | — | `a` 0→1, now correct | **26** | `cba` | **26 → record 0** |
| 3 | `e` | `c` | `e` 0→1 breaks (25); `c` 1→0 breaks (24) | 24 | `bae` | no |
| 4 | `b` | `b` | `b` 1→2 breaks (23); `b` 2→1 fixes (24) | 24 | `aeb` | no |
| 5 | `a` | `a` | `a` 1→2 breaks (23); `a` 2→1 fixes (24) | 24 | `eba` | no |
| 6 | `b` | `e` | `b` 1→2 breaks (23); `e` 1→0 fixes (24) | 24 | `bab` | no |
| 7 | `a` | `b` | `a` 1→2 breaks (23); `b` 2→1 fixes (24) | 24 | `aba` | no |
| **8** | `c` | `a` | `c` 0→1 fixes (25); `a` 2→1 fixes (**26**) | **26** | `bac` | **26 → record 6** |
| 9 | `d` | `b` | `d` 0→1 breaks (25); `b` 1→0 breaks (24) | 24 | `acd` | no |

Answer `[0, 6]`. Compare this table with Approach 3's: identical tallies underneath, but the verdict
column now costs one integer comparison instead of twenty-six. Rows 4 and 5 — where the same letter
entered and left — show the counter dip and recover within a single step, which is exactly the
behaviour the "check before, change, check after" ordering is there to produce.

### Code

```python
def anagram_positions_agreement_counter(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    if k > len(text):
        return []
    want = [0] * 26
    have = [0] * 26
    for ch in pattern:
        want[ord(ch) - 97] += 1
    agree = sum(1 for i in range(26) if want[i] == have[i])
    out: list[int] = []

    def touch(letter: int, delta: int) -> None:
        nonlocal agree
        if have[letter] == want[letter]:
            agree -= 1          # it agreed before the change, so it may not after
        have[letter] += delta
        if have[letter] == want[letter]:
            agree += 1

    for i, ch in enumerate(text):
        touch(ord(ch) - 97, 1)
        if i >= k:
            touch(ord(text[i - k]) - 97, -1)
        if i >= k - 1 and agree == 26:
            out.append(i - k + 1)
    return out
```

### Common mistake

> **Watch out.** The misconception is that `agree` is a tally of **good events**. It is a claim
> about the present state, so every change owes it a correction in both directions: unbook,
> change, book.

Only ever raising the counter — checking equality *after* the change but never *before* it:

```python
    def touch(letter: int, delta: int) -> None:
        nonlocal agree
        have[letter] += delta
        if have[letter] == want[letter]:   # WRONG — nothing ever subtracts
            agree += 1
```

A letter that *was* correct and has just become incorrect still counts towards `agree`, so the
counter ratchets upward and eventually reaches 26 for windows that are nothing of the kind. On the
worked example this returns **[0, 1]** instead of `[0, 6]`: index 0 is right, index 1 is a pure
fabrication (`"bae"` is not an anagram of `"abc"`), and the real answer at index 6 is swamped by a
counter that stopped meaning anything several steps earlier.

The reason the before-check is not optional is that `agree` is not a tally of good events; it is a
*claim about the current state* — "this many letters match right now". Every line that changes the
state owes the counter a correction in both directions. Hence the three-step shape: unbook the old
verdict, change the data, book the new verdict.

A second bug in the same area, worth recognising: initialising `agree = 0` instead of counting the
letters that already agree with an empty window. The counter then tops out at 3 on this example
rather than 26 and the function returns **[]** — no answers at all. Starting from an empty window
means 23 letters are already correct, and the loop's job is to earn the other three.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. The time is truly linear now: one pass over the text, and each step does
at most two `touch` calls, each of which is a constant number of array reads and integer
comparisons — the alphabet appears only once, in the initial `sum(...)` over 26 slots, which is a
one-off. Space is the two fixed 26-slot arrays and one integer.

**This is the one to understand cold**, though not necessarily the one to write first. On this
problem it beats Approach 3 by a constant factor of about 26, which matters at 3 · 10⁴ characters
only mildly — but it matters enormously when the alphabet is large. Swap lowercase letters for
Unicode, or for a pattern over a million distinct tokens, and Approach 3's per-step comparison
becomes the dominant cost while this one does not change at all. Use it whenever the per-step
verdict is a comparison over many independent parts and each step touches only a few of them.

---

## The Overall Arc

Every rung here is an argument about **how much of the counting to redo**, and the argument only
becomes possible after one substitution: an anagram is a multiset, a multiset is counts, and order
is irrelevant. Sorting each window redoes all of the work and then some, because it computes a full
ordering — `k log k` per window — to answer a question that never mentions order, and discards the
ordering immediately afterwards. Replacing the sort with a tally redoes only `k` reads per window and
compares in a fixed twenty-six, which is strictly better and still wasteful in an obvious way: two
neighbouring windows share all but two of their letters, so re-reading all `k` of them is paying for
information you already had. Sliding the tally fixes that — one letter in, one letter out, two
updates per step — and the `k` disappears from the running time entirely, leaving a shape worth
recognising on sight, because the fixed-width window (enter one, leave one, test) is a whole family of
string problems and not just this one. What is left over is the *test*: twenty-six slots compared at
every position, when a slide can have changed at most two of them, which is a comparison being
recomputed rather than maintained. The last rung keeps an integer saying how many letters currently
agree and adjusts it only where the data moved — unbook the old verdict, change the count, book the
new one — so the alphabet is walked exactly once, at startup, and never again. That final move is
the one worth stealing and carrying to other problems: **keep a summary of the comparison rather than
recomputing the comparison, and update the summary exactly where the data changed**, which is the
same trick that reduces the minimum-window-substring check to a single integer. Sort it, count it,
slide it, summarise it — and note that at every rung the answers were allowed to overlap and the
frame always advanced by exactly one, because a match consumes nothing and `"aaaa"` really does
answer three times for `"aa"`.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Sort every window | `O(n · k log k)` | `O(k)` | Computes an ordering the question never asked about, then throws it away | Candidates are scattered strings with no sliding structure; as a readable oracle |
| Count every window | `O(n · k)` | `O(1)` | Drops the ordering for a tally, but rebuilds the tally from zero every window | Very short patterns; non-adjacent candidate windows |
| Slide the tally, compare 26 | `O(26n)` | `O(1)` | Updates the tally instead of rebuilding it, but still re-runs the whole comparison | **Small fixed alphabet — fast enough here, and the shortest correct code** |
| **Slide the tally + agreement counter** | **`O(n)`** | **`O(1)`** | **Maintains a summary of the comparison; costs one extra invariant to keep correct** | **Large alphabets, or any per-step verdict made of many independent parts** |

---

## Interview Priority

> **In an interview.** Write Approach 3 and state the two index facts as you write them: after
> processing `i` the window is `[i-k+1, i]`, so `i - k` leaves and `i - k + 1` is what you report.
> The follow-up is **"can you beat 26 comparisons per step?"** — answer with the agreement counter
> and the sentence that justifies it: *only a letter whose own count changed can flip its
> verdict.* Be ready for "what does `agree` start at?", because that is the half people fumble: 26
> minus the number of distinct letters in the pattern.

**Memorize cold — the sliding tally (Approach 3).** This is the answer that passes, and it should
take under a minute: build `want`, run one loop over the text adding `text[i]` and subtracting
`text[i - k]`, compare the tallies once `i >= k - 1`. Know the two index facts without thinking —
after processing `i` the window is `[i-k+1, i]`, so `i - k` is what leaves and `i - k + 1` is what
you report — because that is where this gets written wrong under pressure.

**Memorize cold — the agreement counter (Approach 4).** Not because Approach 3 is too slow here, but
because this is the idea the problem exists to teach and it is the one an interviewer follows up on:
*"can you do better than 26 comparisons per step?"* The answer is the three-step `touch` — unbook,
change, book — and the sentence that justifies it: **only a letter whose own count changed can flip
its verdict.** Be ready to say why the counter starts at 26 minus the number of distinct letters in
the pattern; that is the half people fumble.

**Worth understanding, not memorizing — counting every window.** Its job is to make the sliding
version's improvement visible by contrast. It is also the honest first thing to say out loud —
"the naive version is a tally per window, `O(n·k)`" — before improving on it, and there are real
situations (scattered candidates, tiny `k`) where it is the correct choice rather than the
placeholder.

**Worth understanding, not memorizing — sorting every window.** One sentence in an interview:
"sorting each window works and costs `k log k` per window, but sorting answers a question about
order that an anagram does not ask." Naming it and rejecting it for the right reason takes ten
seconds and demonstrates you know what an anagram actually is. Its other use is as the oracle in a
test harness, where being obviously correct beats being fast.

---

## Full Runnable Script

Every approach above, plus a test suite covering the statement's example, the overlapping-answers
example, the pattern-longer-than-text example, the smallest legal inputs in both matching and
non-matching form, the `"aaaa"` / `"aa"` case where every window answers, a pattern with a repeated
letter, a text with no answer at all, and 30 randomised stress cases over a three-letter alphabet —
all cross-checked against the sort-every-window oracle and against every other approach.

```python
"""Where Every Anagram Hides - every approach in one file, plus a self-checking test suite.

Run: python anagram_positions_all.py
"""

from __future__ import annotations

import random

# --- 1. Sort every window ------------------------------------------------------

def anagram_positions_sort_every_window(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    target = sorted(pattern)
    out: list[int] = []
    for start in range(len(text) - k + 1):
        if sorted(text[start : start + k]) == target:
            out.append(start)
    return out

# --- 2. Count every window from scratch ----------------------------------------

def anagram_positions_count_every_window(text: str, pattern: str) -> list[int]:
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
    return out

# --- 3. Slide the tally, compare all 26 ----------------------------------------

def anagram_positions_slide_the_tally(text: str, pattern: str) -> list[int]:
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
    return out

# --- 4. Slide the tally, carry an agreement counter (optimal) ------------------

def anagram_positions_agreement_counter(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    if k > len(text):
        return []
    want = [0] * 26
    have = [0] * 26
    for ch in pattern:
        want[ord(ch) - 97] += 1
    agree = sum(1 for i in range(26) if want[i] == have[i])
    out: list[int] = []

    def touch(letter: int, delta: int) -> None:
        nonlocal agree
        if have[letter] == want[letter]:
            agree -= 1          # it agreed before the change, so it may not after
        have[letter] += delta
        if have[letter] == want[letter]:
            agree += 1

    for i, ch in enumerate(text):
        touch(ord(ch) - 97, 1)
        if i >= k:
            touch(ord(text[i - k]) - 97, -1)
        if i >= k - 1 and agree == 26:
            out.append(i - k + 1)
    return out

APPROACHES = [
    ("sort_every_window", anagram_positions_sort_every_window),
    ("count_every_window", anagram_positions_count_every_window),
    ("slide_the_tally", anagram_positions_slide_the_tally),
    ("agreement_counter", anagram_positions_agreement_counter),
]

# --- test suite ----------------------------------------------------------------

def main() -> None:
    cases: list[tuple[str, str, str]] = [
        ("statement example", "cbaebabacd", "abc"),
        ("overlapping answers", "abab", "ab"),
        ("pattern longer than the text", "aa", "aaa"),
        ("smallest legal input, a match", "a", "a"),
        ("smallest legal input, no match", "a", "b"),
        ("every window answers", "aaaa", "aa"),
        ("no answer anywhere", "abcdefg", "hz"),
        ("pattern with duplicate letters", "baaabbaa", "aab"),
        ("whole text is the only window", "listen", "silent"),
        ("text equals pattern length but differs", "abc", "abd"),
    ]

    rng = random.Random(20260912)
    for n in range(1, 31):
        text = "".join(rng.choice("abc") for _ in range(n))
        pattern = "".join(rng.choice("abc") for _ in range(rng.randint(1, 4)))
        cases.append((f"stress n={n}", text, pattern))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, text, pattern in cases:
        print(f'\n{label}: text="{text}" pattern="{pattern}"')
        results = []
        for name, fn in APPROACHES:
            got = fn(text, pattern)
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        if any(r != results[0] for r in results):
            all_agreed = False
            print("  DISAGREEMENT")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )

if __name__ == "__main__":
    main()
```
