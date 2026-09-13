# Longest Consecutive Sequence — Explained

## Understanding the Problem

You are handed a bag of whole numbers in no particular order. Somewhere inside it there may be a
stretch of numbers that follow each other with no gap — 1, then 2, then 3, then 4 — and you must
report how long the longest such stretch is. The numbers do not have to sit next to each other in
the array; only their *values* have to follow each other. Duplicates are allowed and change nothing:
holding two copies of 3 does not make the run longer.

**The core question: how do you find neighbours by value when the array is ordered by position?**
The naive approach is slow because it answers "is 4 in this array?" by walking the whole array — and
it asks that question once per step of every candidate run, so the scans multiply into each other.

Two pieces of vocabulary, expanded once:

- A **run** (also "consecutive sequence") is a set of values `v, v+1, v+2, …` that are all present.
  Its length is how many values it contains, not how far apart they sit in the array.
- A **hash set** is a container that answers "is this value in here?" in roughly constant time no
  matter how many values it holds. That "roughly" is the whole reason the fast solution exists, and
  membership is the only property of the set this problem uses.

### The constraints, and what each one unlocks

| Constraint | What it forces or permits |
|---|---|
| `0 <= nums.length <= 10^5` | The empty array is legal input and must return `0` rather than crash. The upper end is what rules out anything quadratic: a hundred thousand values in one unbroken run would make the unguarded set walk take about five billion probes. |
| `-10^9 <= nums[i] <= 10^9` | **This is the constraint that forbids direct indexing.** With values this wide you cannot allocate one array slot per possible value — a two-billion-entry table is two gigabytes at one byte each. Hashing is not a preference here; it is the only membership structure that fits. |
| duplicates are allowed and do not lengthen a run | Every approach must deduplicate somewhere. The set-based ones get it free, because a set holds each value once. The sorting one must do it on purpose, or `[1, 2, 2, 3]` counts 2 twice and reports a run of 4. |
| the array is not sorted, and sorting it is what the `O(n)` answer avoids | This is the target talking. Sorting is a correct answer and a good first answer; it is also `O(n log n)`, and the point of the problem is that the question never needed order — only presence. |

The worked example traced in every section below is the statement's own:
`nums = [50, 3, 2, 100, 4, 1]`, whose answer is `4` (the run `1, 2, 3, 4`).

---

## Approach 1 — Brute force: walk each run, searching the array for every step

### The idea

*What is the most direct thing that could possibly work?* Take each value `x` in the array and ask
"is `x + 1` in here? is `x + 2` in here?" until the answer is no; the number of yeses is the length
of the run starting at `x`. *Why is that not the answer?* Because "is it in here?" is answered by
scanning the entire array from the start, so a run of length `L` costs `L` full scans — and you pay
that for every starting point.

### How to think about it

The shape of the reasoning is: **define the answer for one starting point, then try every starting
point.** The longest run has to begin somewhere, and that somewhere is one of the values in the
array, so if you can compute "length of the run beginning at `x`" correctly, trying all `x` cannot
miss the answer. That is the whole correctness argument, and it is worth noticing that every later
approach keeps it — none of them changes *what* is computed, only how fast the membership question
is answered and how many starting points are worth trying. All of the cost lives in the phrase "is
it in here", which for a plain Python list means a walk from index 0.

### Worked example

`nums = [50, 3, 2, 100, 4, 1]`. Each "probe" below is a full scan of six elements.

| Outer `x` | probes asked | result | run length | `best` after |
|---|---|---|---|---|
| 50 | `51?` → no | stops immediately | 1 | 1 |
| 3 | `4?` → yes, `5?` → no | one step | 2 | 2 |
| 2 | `3?` → yes, `4?` → yes, `5?` → no | two steps | 3 | 3 |
| 100 | `101?` → no | stops immediately | 1 | 3 |
| 4 | `5?` → no | stops immediately | 1 | 3 |
| 1 | `2?` yes, `3?` yes, `4?` yes, `5?` no | three steps | **4** | **4** |

Answer `4`. Count the work: twelve probes, each a six-element scan, seventy-two comparisons for a
six-element input. Notice also that the run `1,2,3,4` was walked from 1, from 2, from 3 and from 4 —
four times, for one answer. Both of those observations become an approach later.

### Code

```python
def longest_consecutive_brute(nums: list[int]) -> int:
    best = 0
    for x in nums:
        length = 1
        while x + length in nums:  # list membership: a full scan every time
            length += 1
        best = max(best, length)
    return best
```

### Common mistake

Writing the same loop but starting `length` at `0`, so the first probe asks whether `x` itself is
present — it always is — and every run comes back one longer than it is. The bug is invisible on a
fixed test where every answer is too big by exactly one and still looks like a plausible length.
Start `length` at `1` because `x` itself is already counted, and probe `x + 1` first.

### Complexity and when to use this

**Time `O(n³)` in the worst case, space `O(1)`.** The time is three factors multiplied: `n` starting
points, up to `n` steps per walk, and `n` comparisons per membership scan — an array like
`[1, 2, …, n]` hits all three at once. The space is genuinely constant: two integers and no
container.

Use it as the thing you say out loud in the first thirty seconds, and as the reference
implementation you cross-check a clever solution against on random inputs — which is exactly what
the script at the bottom of this document does with it. Never ship it: at `n = 10^5` the worst case
is around `10^15` comparisons.

---

## Approach 2 — Sort the values, then walk once

### The idea

*The brute force scans the array to find the next value — what if the next value were simply sitting
beside it?* Sort the values and consecutive numbers become physically adjacent, so one left-to-right
walk can count runs by comparing each value to the one before it. *What limitation does this fix?*
It kills the repeated searching: no membership question is ever asked, so the `n` scans per step
collapse into a single pass. What it costs instead is the sort.

### How to think about it

This is the classic **restructure-then-scan** trade, and the two halves are priced separately.
Restructuring costs `O(n log n)` — that is the sort, and it is the dominant term. Scanning the
restructured data costs `O(n)` — one comparison per adjacent pair. Once the values are in order the
rule is local: if this value is exactly one more than the previous one the run continues, otherwise
a new run starts here. Deduplicate first, because equal neighbours are neither "one more" nor a gap
and would otherwise reset a run that should have continued. The mental picture is beads on a string:
sorting threads them in order, and you walk the string counting how many beads in a row sit exactly
one apart.

### Worked example

`nums = [50, 3, 2, 100, 4, 1]`.

**Restructure:** `set(nums)` → `{1, 2, 3, 4, 50, 100}`, then `sorted(...)` → `[1, 2, 3, 4, 50, 100]`.

**Scan** — `zip(nums, nums[1:])` yields each adjacent pair:

| Pair `(prev, cur)` | `cur == prev + 1`? | `run` after | `best` after |
|---|---|---|---|
| start | — | 1 | 1 |
| `(1, 2)` | yes | 2 | 2 |
| `(2, 3)` | yes | 3 | 3 |
| `(3, 4)` | yes | **4** | **4** |
| `(4, 50)` | no — gap | 1 | 4 |
| `(50, 100)` | no — gap | 1 | 4 |

Answer `4`. The run was counted exactly once, in one sweep, and no value was ever searched for.

### Code

```python
def longest_consecutive_sort(nums: list[int]) -> int:
    if not nums:
        return 0
    nums = sorted(set(nums))  # the set() is not decoration: it drops duplicates
    best = run = 1
    for prev, cur in zip(nums, nums[1:]):
        run = run + 1 if cur == prev + 1 else 1
        best = max(best, run)
    return best
```

### Common mistake

Sorting `nums` without deduplicating. On `[1, 2, 2, 3]` the pairs are `(1,2) (2,2) (2,3)`; if equal
values reset the run you report 2, and if they extend it you report 4. The right answer is 3, and
neither branch reaches it. Deduplicating before the walk removes the case rather than handling it,
which is why the `set()` belongs on the line that sorts.

### Complexity and when to use this

**Time `O(n log n)`, space `O(n)`** for the deduplicated copy — `O(1)` extra if you may sort the
caller's array in place and handle duplicates inline. The time is the sort and nothing else; the
scan afterwards is a linear afterthought that does not change the order of growth. The space is the
set plus the sorted list of distinct values.

Use it when `n` is small, when the values are already sorted (the sort becomes free and this beats
everything below it), or when memory is tighter than time and a hash set of `n` entries will not
fit. It is also the right thing to write first in an interview and then improve out loud: correct,
short, and impossible to get subtly wrong once duplicates are handled.

---

## Approach 3 — A hash set, but walking from every value

### The idea

*The sort exists only so that "is `x + 1` present?" is cheap — can we make that question cheap
without imposing order?* Yes: put every value in a hash set, which answers membership in constant
time, then do exactly what the brute force did. *What limitation does this fix, and what does it
leave?* It fixes the `O(n)` membership scan, dropping the cost per probe from `n` to 1 — but it
leaves the brute force's other sin untouched, because the same run is still walked from every one of
its members.

### How to think about it

This is the instinctive hash solution, and it is worth writing down precisely because it *feels*
finished and is not. The reasoning that makes it feel finished goes: each probe is `O(1)`, there are
`n` starting points, therefore `O(n)`. The missing factor is the length of each walk. Picture one
long run of `n` values: starting from the first you walk `n` steps, from the second `n - 1`, from
the third `n - 2`, and the total is `n(n+1)/2` probes — quadratic, with a constant-time probe. The
lesson is that swapping a slow operation for a fast one only helps if you were not *also* doing it
too many times, and here you were.

### Worked example

`nums = [50, 3, 2, 100, 4, 1]`. First build the set: `values = {1, 2, 3, 4, 50, 100}` — it already
holds distinct values only, so deduplication came free. Iterating in ascending order for readability
(a real set hands values back in an arbitrary order, which does not affect the answer):

| `x` | probes (each `O(1)` now) | run length | `best` after |
|---|---|---|---|
| 1 | `2✓ 3✓ 4✓ 5✗` | **4** | 4 |
| 2 | `3✓ 4✓ 5✗` | 3 | 4 |
| 3 | `4✓ 5✗` | 2 | 4 |
| 4 | `5✗` | 1 | 4 |
| 50 | `51✗` | 1 | 4 |
| 100 | `101✗` | 1 | 4 |

Answer `4`. Twelve probes again — the same twelve as the brute force — but each is now a hash lookup
instead of a six-element scan. Look at the first four rows: `4 + 3 + 2 + 1 = 10` of those twelve
probes were spent re-walking a run that the first row had already measured in full.

### Code

```python
def longest_consecutive_set_naive(nums: list[int]) -> int:
    values = set(nums)
    best = 0
    for x in values:
        length = 1
        while x + length in values:  # O(1) per check, but the run is re-walked
            length += 1
        best = max(best, length)
    return best
```

### Common mistake

Iterating `for x in nums` instead of `for x in values`. On an input with many duplicates — say a
hundred thousand copies of the same long run — the outer loop now runs once per *element* rather
than once per *distinct value*, multiplying an already quadratic walk by the duplication factor.
Iterating the set is free deduplication for the outer loop and costs nothing to write.

### Complexity and when to use this

**Time `O(n²)` in the worst case, space `O(n)`.** The time comes from the nested walk: one unbroken
run of `n` values makes the inner loop run `n, n-1, n-2, …` times, which sums to `n²/2`. The space
is the set, holding up to `n` distinct values. On *scattered* input where runs are short it behaves
linearly, which is exactly why this version passes casual testing and dies on the adversarial case.

There is no situation where you should prefer this to the next approach — the fix is one `if` and
costs nothing. Its value is diagnostic: recognising that this is quadratic, and being able to name
the input that proves it, is most of what the problem is testing.

---

## Approach 4 — A hash set, walking only from the start of a run (optimal)

### The idea

*The run `1,2,3,4` was walked four times — can we elect a single member to walk it from?* Yes, and
the rule writes itself: `x` is the beginning of a run exactly when `x - 1` is absent from the set, so
skip every `x` whose predecessor is present. *What limitation does this fix?* It removes the
redundant walks that made approach 3 quadratic, without giving up the constant-time membership that
made approach 3 better than sorting.

### How to think about it

The shape is **elect one owner per run, then do the work once.** Every run has exactly one value
with no left neighbour — its true beginning — so the test `x - 1 not in values` selects precisely
one starting point per run and rejects every other member. That turns the total walking work into
"the sum of the lengths of all runs", which is just the number of distinct values, which is at most
`n`. The nested loop is still on the page and still looks quadratic; the reason it is not is an
**amortised** argument (amortised means: count the total work across the whole algorithm rather than
bounding each step in isolation). Every distinct value is touched at most twice — once by the outer
loop when it is tested for being a run start, once by the single inner walk that owns it — so the
total is linear no matter how the loops nest.

### Worked example

`nums = [50, 3, 2, 100, 4, 1]`, `values = {1, 2, 3, 4, 50, 100}`, iterated in ascending order for
readability:

| `x` | `x - 1` in set? | action | probes spent | `best` after |
|---|---|---|---|---|
| 1 | `0` → no | **start a walk**: `2✓ 3✓ 4✓ 5✗` → length 4 | 1 + 4 | **4** |
| 2 | `1` → yes | skip — 1 owns this run | 1 | 4 |
| 3 | `2` → yes | skip | 1 | 4 |
| 4 | `3` → yes | skip | 1 | 4 |
| 50 | `49` → no | start a walk: `51✗` → length 1 | 1 + 1 | 4 |
| 100 | `99` → no | start a walk: `101✗` → length 1 | 1 + 1 | 4 |

Answer `4`. Eleven probes, and — the part that matters — the run `1,2,3,4` was walked exactly once,
from 1. Compare the table to approach 3's: the three skip rows cost one probe each instead of
walking 3, 2 and 1 steps. On a six-element input the saving is small; on one long run of a hundred
thousand values it is the difference between `10^5` probes and `5 × 10^9`.

### Code

```python
def longest_consecutive(nums: list[int]) -> int:
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 in values:
            continue  # not the start of a run — its owner will walk it
        length = 1
        while x + length in values:
            length += 1
        best = max(best, length)
    return best
```

### Common mistake

Writing the guard as `if x + 1 in values: continue` — electing the *end* of a run as its owner and
then still walking upward from it, which walks off the end immediately and reports 1 for every run.
The guard and the walk must point in opposite directions: elect the value with no predecessor and
walk forwards, or elect the value with no successor and walk backwards. Mixing them produces a
function that returns 1 on every input containing a run, which is easy to mistake for "no runs
found" rather than for a bug.

### Complexity and when to use this

**Time `O(n)`, space `O(n)`.** The time is two linear passes in disguise: building the set is `n`
insertions, then every distinct value is examined once by the outer loop and belongs to at most one
inner walk — the nested loop never revisits a value, so the total is linear. The space is the set,
`O(n)` in the number of distinct values, and there is no way around it: something has to answer
membership in constant time.

This is the answer. Use it whenever the values are wide (as here) and the input is unsorted. The
only reasons to reach past it are the two named above — already-sorted input, or a memory budget
that cannot hold a hash set.

---

## Approach 5 — Direct indexing, the version this problem's constraints forbid

### The idea

*A hash set answers "is `v` present?" with a hash computation — could an array index answer it with
no computation at all?* If the values were packed into a small range you could allocate one slot per
possible value, mark the present ones, and read the answer off as the longest stretch of marked
slots — no probing, no hashing, one linear sweep. *What limitation does it fix?* It removes hashing
entirely, a real constant-factor win. **But it needs an assumption this problem does not grant**,
and that is the reason it is here.

### What must be true, and what breaks if it is not

The assumption is that `max - min` is small enough to allocate. Here `-10^9 <= nums[i] <= 10^9`, so
the span can be two billion and one; at one byte per slot that is two gigabytes to hold a hundred
thousand numbers. What breaks without the assumption is not correctness but feasibility — the
program is right and cannot run. The version below computes the span from the *actual* input rather
than the declared bounds, which makes it usable on clustered data and still hopeless on
`[-10^9, 10^9]`; the test harness prints exactly that, on purpose. The general move is **trading
value-range for speed**: when the universe of possible values is small, an array indexed by the
value itself is a perfect hash — no collisions, no hash cost, and the values arrive in sorted order
for free because array indices are ordered.

### Worked example

`nums = [50, 3, 2, 100, 4, 1]`. `lo = 1`, `hi = 100`, so allocate 100 slots, all zero.

**Mark:** value `v` sets slot `v - lo`.

| value | slot set |
|---|---|
| 50 | 49 |
| 3 | 2 |
| 2 | 1 |
| 100 | 99 |
| 4 | 3 |
| 1 | 0 |

`present` is now `1 1 1 1 0 0 … 0 1 (at 49) 0 … 0 1 (at 99)`.

**Sweep** — the run counter resets on every zero:

| slot | flag | `run` | `best` |
|---|---|---|---|
| 0 | 1 | 1 | 1 |
| 1 | 1 | 2 | 2 |
| 2 | 1 | 3 | 3 |
| 3 | 1 | **4** | **4** |
| 4 | 0 | 0 | 4 |
| 5–48 | 0 | 0 | 4 |
| 49 | 1 | 1 | 4 |
| 50–98 | 0 | 0 | 4 |
| 99 | 1 | 1 | 4 |

Answer `4` — and notice the sweep visited 100 slots to examine 6 values. That ratio is the price of
the assumption.

### Code

```python
def longest_consecutive_bitset(nums: list[int]) -> int:
    """Only legal when max - min is small enough to allocate. NOT valid for the
    stated -10^9..10^9 constraint."""
    if not nums:
        return 0
    lo, hi = min(nums), max(nums)
    present = bytearray(hi - lo + 1)
    for x in nums:
        present[x - lo] = 1  # the value IS the index; no hashing at all
    best = run = 0
    for flag in present:
        run = run + 1 if flag else 0  # a zero slot ends the run
        best = max(best, run)
    return best
```

### Common mistake

Sizing the array from the declared constraint (`2 * 10^9 + 1` slots) instead of from `min` and `max`
of the actual input, which turns a technique that is merely situational into one that cannot run at
all. The related error is forgetting the `- lo` offset: every negative value then lands on a negative
index, and in Python that silently wraps around to the end of the array and corrupts a different
slot instead of raising, so the answer comes back wrong rather than loud.

### Complexity and when to use this

**Time `O(n + R)`, space `O(R)`, where `R = max - min + 1` is the span of the values.** The `n` is
marking; the `R` is the sweep across every slot whether or not anything lives in it — which is why a
sparse input like `[0, 10^9]` costs a billion steps to find a run of length 1. The space is one byte
per slot across the whole span, independent of how many values you actually hold.

Use it when the value range is genuinely small and known in advance — ages, days of the year, scores
out of 100, bytes — and especially when the same set is queried repeatedly. For *this* problem it is
disqualified, and being able to say precisely why (`R` up to `2 × 10^9` while `n` is at most `10^5`,
so `R` dwarfs `n`) is a better answer than not knowing the technique at all.

---

## The Overall Arc

Every step of this ladder chases one principle: **the answer depends on which values exist, not on
where they sit or in what order they arrive**, and each approach is a different guess at how to
store "exists". The brute force stores nothing, so it re-derives existence by scanning the array and
pays three multiplied factors for the privilege. Sorting is the first real idea — it imposes an
order so that neighbours-by-value become neighbours-by-position, which makes the scan trivial, but
it buys far more than the question asked for (a total ordering) when all that was needed was a yes
or a no, and the receipt is `n log n`. Swapping the sorted array for a hash set buys exactly that
yes or no and nothing else, dropping every membership question to constant time — and yet the
instinctive version stalls at quadratic, because making an operation cheap does not help if you are
still performing it a quadratic number of times, and here every run is being measured once from each
of its members. The fix is not a faster data structure but a rule about who is allowed to do the
work: a value with a left neighbour is never the start of anything, so it defers, and each run is
walked exactly once from its true beginning — the nested loop stays on the page while the total work
becomes linear, because the loops now partition the values instead of revisiting them. Push the same
idea one step further and hashing itself can go, letting each value serve as its own array index,
but that only works when the universe of values is small, and here it is two billion wide — so the
ladder stops at the hash set not because nothing is faster in principle but because the constraint
says so. Two habits survive the problem: when a solution sorts, ask whether mere membership would
do; and when several starting points would each redo the same work, find the rule that elects one of
them.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | `O(n³)` | `O(1)` | No memory at all, paid for by rescanning the array on every probe | As the spoken first answer, and as the cross-check oracle in a test harness |
| Sort, then walk | `O(n log n)` | `O(n)` (or `O(1)` sorting in place) | Buys a total order when only membership was needed | Input is already sorted, `n` is small, or a hash set will not fit in memory |
| Hash set, walk from everywhere | `O(n²)` | `O(n)` | Constant-time probes, but the same run is re-measured from every member | Never — the guard that fixes it is one line |
| **Hash set, walk from run starts** | **`O(n)`** | **`O(n)`** | Linear, at the price of holding every distinct value in memory | **The default answer for this problem** |
| Direct indexing | `O(n + R)` | `O(R)` | Deletes hashing, but pays for the whole value span whether used or not | The value range is small and known — ages, scores, bytes. Disqualified here |

---

## Interview Priority

**Know cold: the hash set with the `x - 1` guard.** This is the answer, and the guard is the entire
interview. Expect to be asked why the nested loop is not quadratic, and have the amortised argument
ready in one sentence: every distinct value is examined once by the outer loop and belongs to at most
one inner walk, so the total is `2n` regardless of how the loops nest. Candidates who write the right
code but cannot defend the complexity do worse than candidates who write the sort and explain
themselves.

**Know cold: the sort.** Not as a fallback you are embarrassed by, but as the thing you write first,
confirm correct, and then improve out loud. It takes twenty seconds, it forces you to notice
duplicates — which the `O(n)` version handles invisibly, so you will otherwise forget to mention
them — and it gives you a baseline to compare the set against.

**Understand but do not drill: the unguarded set walk.** Its value is that it is the trap. Many
people write it, call it `O(n)`, and are wrong. Being able to say "without the guard this is
quadratic on a single long run, and here is the input that proves it" is a stronger signal than
arriving at the final code with no wrong turns, because it shows you know *why* the guard exists
rather than that you memorised it.

**Understand but do not drill: brute force and direct indexing.** Brute force is thirty seconds of
framing plus a testing oracle. Direct indexing is worth one sentence — "if the values were bounded I
would index them directly, but they run to `10^9`, so the table would dwarf the input" — which shows
you read the constraint rather than pattern-matched the problem.

---

## Full Runnable Script

```python
"""Longest Consecutive Sequence - every approach in one file, cross-checked.

Run:  python longest_consecutive.py
"""

from __future__ import annotations

import random


# ------------------------------------------------- approach 1: brute force
def longest_consecutive_brute(nums: list[int]) -> int:
    best = 0
    for x in nums:
        length = 1
        while x + length in nums:  # list membership: a full scan every time
            length += 1
        best = max(best, length)
    return best


# ------------------------------------------------------ approach 2: sorting
def longest_consecutive_sort(nums: list[int]) -> int:
    if not nums:
        return 0
    nums = sorted(set(nums))
    best = run = 1
    for prev, cur in zip(nums, nums[1:]):
        run = run + 1 if cur == prev + 1 else 1
        best = max(best, run)
    return best


# --------------------------------- approach 3: set, but walking from everywhere
def longest_consecutive_set_naive(nums: list[int]) -> int:
    values = set(nums)
    best = 0
    for x in values:
        length = 1
        while x + length in values:  # O(1) per check, but the run is re-walked
            length += 1
        best = max(best, length)
    return best


# ------------------------------------ approach 4: set, walking only from starts
def longest_consecutive(nums: list[int]) -> int:
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 in values:
            continue  # not the start of a run
        length = 1
        while x + length in values:
            length += 1
        best = max(best, length)
    return best


# ------------------------ approach 5: direct indexing (needs a bounded range)
def longest_consecutive_bitset(nums: list[int]) -> int:
    """Only legal when max - min is small enough to allocate. NOT valid for the
    stated -10^9..10^9 constraint; see the doc."""
    if not nums:
        return 0
    lo, hi = min(nums), max(nums)
    present = bytearray(hi - lo + 1)
    for x in nums:
        present[x - lo] = 1
    best = run = 0
    for flag in present:
        run = run + 1 if flag else 0
        best = max(best, run)
    return best


SPAN_BUDGET = 2_000_000  # refuse to allocate more than this many bytes

APPROACHES = [
    ("brute", longest_consecutive_brute),
    ("sort", longest_consecutive_sort),
    ("set_naive", longest_consecutive_set_naive),
    ("set_run_start", longest_consecutive),
    ("bitset", longest_consecutive_bitset),
]


def main() -> None:
    cases: list[tuple[str, list[int]]] = [
        ("statement example", [50, 3, 2, 100, 4, 1]),
        ("empty array", []),
        ("single value", [7]),
        ("duplicates do not lengthen", [1, 2, 2, 3, 3, 3]),
        ("no run longer than 1", [10, 30, 50, 70]),
        ("negatives across zero", [-2, -1, 0, 1, 5]),
        ("all identical", [4, 4, 4, 4]),
        ("full-width values", [-10**9, 10**9, 0]),
    ]
    random.seed(7)
    cases.append(("stress: 400 values in [0,200]",
                  [random.randint(0, 200) for _ in range(400)]))

    all_agreed = True
    for label, nums in cases:
        shown = nums if len(nums) <= 8 else nums[:6] + ["..."]
        print(f"\n{label}: n={len(nums)} {shown}")
        results: dict[str, int] = {}
        for name, fn in APPROACHES:
            span = max(nums) - min(nums) + 1 if nums else 0
            if name == "bitset" and span > SPAN_BUDGET:
                print(f"  {name:<14} -> skipped (span {span:,} exceeds the "
                      f"memory budget - this is the constraint in action)")
                continue
            print(f"  {name:<14} -> {fn(nums)}")
            results[name] = fn(nums)
        if len(set(results.values())) != 1:
            all_agreed = False
            print("  !! approaches disagree")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND - see the lines above")


if __name__ == "__main__":
    main()
```
