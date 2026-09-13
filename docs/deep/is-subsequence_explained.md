# Is One String Hidden in the Other? — explained

## Understanding the Problem

You get two strings: a short one, `s`, and a long one, `t`. Answer yes or no to a single question:
can you produce `s` by crossing out some of the letters of `t` and leaving the rest exactly where
they are? The letters of `s` must appear in `t` **in the same order**, but they are allowed to be
scattered — nothing says they have to sit next to each other.

**The core question is: for each letter of the pattern, where is its next available occurrence in
the text?** The naive approach is slow because it answers that by starting a fresh search through
the text for every letter — walking over the same ground it has already covered, once per letter
of the pattern, which turns a 10,000-character text into 100 × 10,000 character reads for a
pattern of 100.

### The constraints, and what each one unlocks

| Constraint | What it unlocks |
|---|---|
| `0 <= s.length <= 100` | The pattern is tiny. This is why a per-character search *feels* fine and why the naive version passes the judge anyway — but it is also why the interesting question is the follow-up, not this one. |
| `0 <= t.length <= 10^4` | The text is a hundred times longer than the pattern. Any approach whose cost is "re-walk the text once per pattern letter" is paying 10⁴ for information it could have kept from the previous step. |
| **order preserved, but the characters need not be adjacent** | The load-bearing one. Because you may discard *any* text character that does not match, a mismatch is never a failure — it is just a character you skip. That is what allows a single left-to-right walk that never backtracks, and what makes the greedy "take the first match" safe. If adjacency were required this would be substring search and the whole approach would be different. |
| both are lowercase English letters | A 26-letter alphabet. Irrelevant to the one-pass answer, but it is exactly the constraint that makes the *follow-up* affordable: a table of "next occurrence of each letter after each position" costs 26 × 10⁴ entries, which is nothing. |
| the empty string is a subsequence of anything, including of itself | The answer for `s = ""` is `true` no matter what `t` is, so the code must be correct when the pattern cursor starts already at the end. This is what the `i < len(s)` guard is for; it is not defensive clutter. |

The third row is the one to internalise. It licenses the **exchange argument** that the fast
version depends on: when you need a `b` and the text offers you one, taking it is never worse than
waiting for a later `b`, because taking the earlier one leaves *strictly more* of the text
available for everything that still has to be matched. Any solution that skips a match and
succeeds can be rewritten to take that match and still succeed. So greed is not a heuristic here,
it is provably optimal — and that is why one pass with no backtracking is correct rather than
merely plausible.

---

## Approach 1 — Search for each character in turn

### The idea

*How do I place the first letter of the pattern?* Scan the text from the left until I find it.
*And the second?* Scan on from just past where the first landed — never from the beginning, or I
would be allowed to match two different pattern letters to the same text position. If any letter's
scan runs off the end of the text, the answer is no. This is the direct translation of the
definition into code: one search per pattern letter, each one resuming where the last left off.

### How to think about it

Think of it as reading down a page with a finger, hunting one target letter at a time. You put
your finger at the top, hunt for an `a`, and pin it. Then you start hunting for a `b` from the
line *below* the pin — not from the top of the page, which is the whole game. When a hunt runs off
the bottom of the page you stop and say no. The shape to notice is the bookkeeping: a variable
holding the resume point, a sentinel to record whether the inner hunt succeeded, and an early
return. Three moving parts to express what is really one idea, and each is a place to get it
wrong.

### Worked example

Input: `s = "abc"`, `t = "ahbgdc"`. Every approach in this document traces this same input.

| Hunt | Looking for | Scanning `t` from | Reads | Found at | New resume point |
|---|---|---|---|---|---|
| 1 | `a` | 0 | `t[0]='a'` | 0 | 1 |
| 2 | `b` | 1 | `t[1]='h'`, `t[2]='b'` | 2 | 3 |
| 3 | `c` | 3 | `t[3]='g'`, `t[4]='d'`, `t[5]='c'` | 5 | 6 |

All three letters placed, so the answer is `True`. Six characters of `t` were read in total — and
notice they form three *disjoint* stretches, `[0]`, `[1..2]`, `[3..5]`. That is not an accident,
and it matters for the cost analysis below.

### Code

```python
def is_subsequence_restart_scan(s: str, t: str) -> bool:
    at = 0
    for ch in s:
        found = -1
        for j in range(at, len(t)):
            if t[j] == ch:
                found = j
                break
        if found < 0:
            return False
        at = found + 1  # the next character must come strictly after this match
    return True
```

### Common mistake

Writing the inner scan as `for j in range(len(t))` — starting from the beginning of the text each
time instead of from `at`. This is not merely slower, it is **wrong**, and it is wrong in a way
the obvious test cases will not catch. With `s = "aa"` and `t = "ab"` it finds an `a` at index 0,
then goes back and finds the same `a` at index 0 again, and reports `True` — but `"aa"` is not a
subsequence of `"ab"`, because there is only one `a` to go round. The same bug says `"ba"` is a
subsequence of `"ab"`. Both letters must come from *different, increasing* positions, and `at` is
the only thing enforcing that. It is also the version that gives this approach its reputation for
being quadratic: re-reading the text from zero for every pattern letter is 100 × 10⁴ reads.

The quieter second mistake is using `found = 0` as the sentinel instead of `-1`. Zero is a
perfectly legal match position, so a match at the very front of the text becomes indistinguishable
from "not found".

### Complexity and when to use this

**Time O(|s| + |t|), space O(1)** — as written. This is worth being precise about, because the
figure usually quoted for this approach is O(|s| · |t|). That quadratic figure belongs to the
broken variant above, the one that restarts each scan at index 0. As written here, each successful
hunt scans the stretch of `t` from `at` to the match and then sets `at` past it, so the stretches
never overlap: added up, all the successful hunts together read each character of `t` at most
once, and the single failing hunt reads at most the rest of it. Space is three integers.

So the reason to move past this rung is not asymptotic — it is that it needs a nested loop, a
sentinel value, an early return and a manually maintained resume pointer to say something the next
approach says with one index and one `if`. Every one of those four parts is a place the code can
be subtly wrong, and the mistake above shows how invisible that wrongness can be. Use this shape
when the *search* step is genuinely more complicated than a character comparison — if finding the
next occurrence meant a binary search into a precomputed table, for instance, which is exactly
what the follow-up turns it into.

---

## Approach 2 — Two cursors, one pass

### The idea

*The per-letter hunt keeps a resume pointer, a sentinel and a nested loop just to remember where
it got to in the text — can the text be walked only once, with the position kept for free?* Yes.
Turn the loop inside out: instead of driving the pattern and searching the text, drive the **text**
and let the pattern's cursor advance whenever the current text character happens to be the one the
pattern is waiting for. The resume pointer becomes the loop variable, the sentinel disappears, and
the nested loop collapses into a single `if`.

### How to think about it

Two cursors, but — unlike the rest of this family — walking **two different sequences**. One
cursor sweeps the whole text, left to right, one character per step, and never goes back. The
other sits on the pattern at the character you are still waiting for, and only ever moves when the
text hands it a match. Picture a queue of people filing past a checklist: everyone in the queue
gets looked at exactly once, and you tick the next box only when the person walking past is the
one that box names. If every box ends up ticked, the answer is yes. The pattern cursor is the
family's "writer" in disguise — it does not write anything, it marks how much of the pattern has
been satisfied, and the gap between it and the text cursor is exactly the number of text
characters discarded.

### Worked example

Input: `s = "abc"`, `t = "ahbgdc"`.

| Step | Text cursor `j` (char) | Pattern cursor `i` | Waiting for `s[i]` | Match? | `i` after |
|---|---|---|---|---|---|
| 1 | 0 (`a`) | 0 | `a` | yes | 1 |
| 2 | 1 (`h`) | 1 | `b` | no | 1 |
| 3 | 2 (`b`) | 1 | `b` | yes | 2 |
| 4 | 3 (`g`) | 2 | `c` | no | 2 |
| 5 | 4 (`d`) | 2 | `c` | no | 2 |
| 6 | 5 (`c`) | 2 | `c` | yes | 3 |

The text is exhausted with `i = 3 = len(s)`, so every character of the pattern was placed in
order: `True`. Six steps, one per character of `t`, and the pattern cursor moved three times — the
gap of three is exactly the `h`, `g` and `d` that were skipped.

Run the same trace with `s = "axc"` and the only change is step 3: the pattern is waiting for `x`,
the `b` is not it, and `i` stays at 1 forever. The loop still finishes — it always reads all of `t`
— and ends with `i = 1 ≠ 3`, so `False`.

### Code

```python
def is_subsequence_two_pointers(s: str, t: str) -> bool:
    i = 0
    for ch in t:
        if i < len(s) and s[i] == ch:  # the i < len(s) guard is what ends the walk
            i += 1
    return i == len(s)
```

### Common mistake

Dropping the `i < len(s)` guard. Once the pattern has been fully matched, `i` equals `len(s)` and
`s[i]` is an index-out-of-range crash on the very next character of the text — so the function
works perfectly whenever the last match happens to land on the last character of `t`, and blows up
otherwise. `s = "abc"`, `t = "abcd"` crashes; `s = "abc"`, `t = "abc"` does not. That is the worst
kind of bug, the one whose test case passes.

The other one worth naming is returning `True` from inside the loop the moment `i` reaches
`len(s)`. That is not a bug — it is a legitimate early exit and it is faster — but people
frequently write it as `return i == len(s)` *inside* the loop, which returns `False` on the first
non-matching character instead of skipping it. And for the empty pattern the early-exit version
must still answer `True` without ever entering the loop, which the version above gets right for
free: `i` starts at `0`, `len(s)` is `0`, and `0 == 0`.

### Complexity and when to use this

**Time O(|t|), space O(1).** Every character of the text is examined exactly once and does a
single comparison; the pattern cursor only ever moves forward and never more than `|s|` times in
total, so it contributes nothing extra. Space is one integer.

This is the right answer for the question as asked, and for any single-query version of it. Where
it stops being right is the follow-up an interviewer will reach for: *you are given one fixed text
and a stream of ten thousand different patterns to check against it.* Now paying O(|t|) per query
is the bottleneck, and the fix is to preprocess the text once — build, for every position and every
one of the 26 letters, the index of that letter's next occurrence at or after that position. Each
query then walks only its own pattern, jumping straight to the next occurrence, and costs O(|s|)
(or O(|s| log |t|) if you store per-letter position lists and binary-search them instead of a full
table). The preprocessing is O(26 · |t|) once. That trade — pay a lot once so each of many queries
is cheap — is the actual lesson hiding behind an easy problem.

---

## The reader/writer family

This problem sits with remove-duplicates-sorted, remove-element and merge-sorted-array in one
family: **a reader walks the input, a writer marks where the next kept value belongs, and the gap
between the two cursors is exactly what has been dropped.** In the compaction problems the writer
literally writes; here it does not, and that is the interesting difference.

**This is the one that walks two different sequences rather than one array.** The reader sweeps
`t` and the pattern cursor `i` plays the writer's part: it marks the boundary between the part of
`s` already satisfied and the part still waiting, it only advances when something is "kept", and
its final position is the answer — not a length to truncate at, but a completeness check,
`i == len(s)`. The gap is still meaningful in the same way: `j + 1 − i` counts the characters of
`t` that were discarded. And the same safety property holds for the same reason — the pattern
cursor can never overtake the text cursor, because it only moves on a step that the text cursor is
also taking.

The other place the family's rule bends is **merge-sorted-array**, which must walk **backwards**:
its writer starts to the right of its reader, because writing forwards would overwrite values it
has not read yet. Here forwards is safe because nothing is written at all.

---

## The Overall Arc

The principle this problem chases is *never re-derive a position you already had*. The definition
of a subsequence reads as a per-letter search — find an `a`, then find a `b` after it, then find a
`c` after that — and written that way it needs a variable to remember the resume point, a nested
loop to do the hunting and a sentinel to report failure, with the ever-present temptation to
restart each hunt at the beginning of the text and quietly permit two pattern letters to claim the
same text position. Turning the loop inside out removes all of it at once: drive the text, one
character at a time, and the resume point *is* the loop variable, so it cannot be forgotten or
reset by accident. What makes that legal is the thing the problem's own definition hands you —
order must be preserved but adjacency need not, so any non-matching text character may simply be
thrown away, and a mismatch costs nothing but a step. And what makes it *correct* rather than
merely fast is the exchange argument: taking the first available match is never worse than waiting
for a later one, because the earlier match leaves strictly more of the text for everything still
to be matched, so any successful run that waits can be rewritten into one that grabs. That is the
same argument underneath almost every scanning greedy you will meet, and it is worth being able to
say in one sentence. The final turn of the screw is that the one-pass answer is only optimal for
*one* query: hold the text fixed and ask about thousands of patterns, and the per-query sweep of
the text becomes the bottleneck, so you pay once to precompute the next occurrence of every letter
from every position and buy back a per-query cost that depends only on the pattern. Cheap once,
cheap per query, and never the same walk twice.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Search for each character in turn | O(\|s\| + \|t\|) as written (O(\|s\|·\|t\|) if the scan wrongly restarts at 0) | O(1) | Mirrors the definition directly, but needs a nested loop, a sentinel and a hand-maintained resume pointer — three places to be subtly wrong | The "find the next occurrence" step is genuinely more than a character compare, e.g. a binary search into a precomputed table |
| Two cursors, one pass | O(\|t\|) | O(1) | One loop, one index, no sentinel; the resume position is the loop variable and cannot be lost | Any single-query version of this question — the intended answer |
| *(follow-up)* Precomputed next-occurrence table | O(26·\|t\|) once, then O(\|s\|) per query | O(26·\|t\|) | Pays real memory and a setup pass to make each of many queries independent of the text's length | One fixed text, many patterns to test against it |

---

## Interview Priority

**Know cold: the two-cursor pass, and the exchange argument that justifies it.** The code is four
lines and you should be able to write it without thinking, including the `i < len(s)` guard, which
is the single most common way this gets broken in an interview. What separates a good answer from
a recited one is being able to say *why greed is safe here* — taking the earliest match leaves the
longest possible remainder of the text, so it can never lose — in one sentence, unprompted. Then be
ready for the follow-up, because on this problem it is the real question: **many patterns against
one fixed text**, answered by precomputing the next occurrence of each letter from each position.
You do not need to code that table under time pressure, but you should be able to describe its
shape (26 × |t|), its build cost, and the per-query cost it buys, and to name the binary-search
variant that trades a smaller table for a log factor.

**Understand but do not drill: the per-letter search.** Say it in the first fifteen seconds to show
you have read the definition correctly, name the trap in it out loud — *if I restarted each search
at the beginning of the text I would let two pattern letters match the same text position, and
`"aa"` would look like a subsequence of `"ab"`* — and then collapse it into the one-pass version.
Naming that trap is worth more than the code itself, because it is the thing that separates
understanding the definition from having memorised a loop.

---

## Full Runnable Script

Both approaches in one file, checked against the statement's two examples, the smallest legal
input (both strings empty), each string empty on its own, a pattern equal to the text, a pattern
longer than the text, repeated characters, a greedy trap and a right-letters-wrong-order case, plus
a randomised stress test against an independent oracle written a completely different way — one
shared iterator over the text, consumed left to right.

This problem answers with a boolean rather than a length, so there is no unspecified tail to be
careful about, and neither approach mutates its arguments. Each approach is still called with its
own arguments so that no approach can be helped or hurt by another's leftovers.

```python
"""Is One String Hidden in the Other? - every approach in one file, cross-checked.

Run: python is_subsequence.py

This one answers with a boolean rather than a length, so there is no unspecified
tail to be careful about - but each approach is still handed its own arguments so
no approach can be helped or hurt by another.
"""

from __future__ import annotations

import random
from typing import Callable


# ------------------------------------------- approach 1: rescan t for each char
def is_subsequence_restart_scan(s: str, t: str) -> bool:
    at = 0
    for ch in s:
        found = -1
        for j in range(at, len(t)):
            if t[j] == ch:
                found = j
                break
        if found < 0:
            return False
        at = found + 1  # the next character must come strictly after this match
    return True


# ------------------------------------------ approach 2: one pass, two pointers
def is_subsequence_two_pointers(s: str, t: str) -> bool:
    i = 0
    for ch in t:
        if i < len(s) and s[i] == ch:  # the i < len(s) guard is what ends the walk
            i += 1
    return i == len(s)


APPROACHES: list[tuple[str, Callable[[str, str], bool]]] = [
    ("restart scan", is_subsequence_restart_scan),
    ("two pointers", is_subsequence_two_pointers),
]


def reference(s: str, t: str) -> bool:
    """Independent oracle: one shared iterator over t, consumed left to right."""
    it = iter(t)
    return all(ch in it for ch in s)


def run_case(label: str, s: str, t: str) -> bool:
    expected = reference(s, t)
    results = [(name, fn(s, t)) for name, fn in APPROACHES]
    agree = all(r == expected for _, r in results)
    print(f"{label}")
    print(f"  s={s!r} t={t!r}")
    for name, r in results:
        print(f"    {name:<14} -> {r}")
    print(f"    expected       -> {expected}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True
    ok &= run_case("example 1 from the statement", "abc", "ahbgdc")
    ok &= run_case("example 2 from the statement", "axc", "ahbgdc")
    ok &= run_case("smallest legal input (both empty)", "", "")
    ok &= run_case("empty pattern, non-empty text", "", "abc")
    ok &= run_case("non-empty pattern, empty text", "a", "")
    ok &= run_case("pattern equals text", "abc", "abc")
    ok &= run_case("pattern longer than text", "abcd", "abc")
    ok &= run_case("greedy trap: the first 'a' is the wrong-looking one", "ab", "aab")
    ok &= run_case("repeats in the pattern", "aaa", "aabbaa")
    ok &= run_case("repeats in the pattern, one short", "aaaa", "aabba")
    ok &= run_case("right letters, wrong order", "ba", "ab")

    random.seed(11)
    for _ in range(5000):
        t = "".join(random.choice("abc") for _ in range(random.randint(0, 12)))
        s = "".join(random.choice("abc") for _ in range(random.randint(0, 5)))
        expected = reference(s, t)
        for name, fn in APPROACHES:
            got = fn(s, t)
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} s={s!r} t={t!r} "
                      f"-> {got} != {expected}")
    print("stress: 5000 random (s, t) pairs over a 3-letter alphabet, "
          "both approaches vs the oracle")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok
          else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()
```

### Output when run

```
example 1 from the statement
  s='abc' t='ahbgdc'
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
example 2 from the statement
  s='axc' t='ahbgdc'
    restart scan   -> False
    two pointers   -> False
    expected       -> False
    all agree: True
smallest legal input (both empty)
  s='' t=''
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
empty pattern, non-empty text
  s='' t='abc'
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
non-empty pattern, empty text
  s='a' t=''
    restart scan   -> False
    two pointers   -> False
    expected       -> False
    all agree: True
pattern equals text
  s='abc' t='abc'
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
pattern longer than text
  s='abcd' t='abc'
    restart scan   -> False
    two pointers   -> False
    expected       -> False
    all agree: True
greedy trap: the first 'a' is the wrong-looking one
  s='ab' t='aab'
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
repeats in the pattern
  s='aaa' t='aabbaa'
    restart scan   -> True
    two pointers   -> True
    expected       -> True
    all agree: True
repeats in the pattern, one short
  s='aaaa' t='aabba'
    restart scan   -> False
    two pointers   -> False
    expected       -> False
    all agree: True
right letters, wrong order
  s='ba' t='ab'
    restart scan   -> False
    two pointers   -> False
    expected       -> False
    all agree: True
stress: 5000 random (s, t) pairs over a 3-letter alphabet, both approaches vs the oracle

ALL APPROACHES AGREED ON EVERY CASE.
```
