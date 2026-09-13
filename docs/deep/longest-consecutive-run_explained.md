# Longest Consecutive Sequence — Explained

## Understanding the Problem

You are handed a bag of whole numbers in no particular order. Somewhere inside it there may be a
stretch of numbers that follow each other with no gap — 1, then 2, then 3, then 4 — and you must
report how long the longest such stretch is. The numbers do not have to sit next to each other in
the array; only their *values* have to follow each other. Duplicates are allowed and change nothing:
holding two copies of 3 does not make the run longer.

**The core question:** how do you find neighbours **by value** when the array is ordered by position?
The naive approach is slow because it answers "is 4 in this array?" by walking the whole array — and
it asks that question once per step of every candidate run, so the scans multiply into each other.

Two words that mean something specific here, each introduced by the picture:

- Tip the bag onto a table and push the numbers into a line so each is one more than the last. That
  line is a **run** (also "consecutive sequence"). Its length is how many values it contains, not
  how far apart they sat in the array.
- A **hash set** is the container that answers "is this value in here?" without looking through
  anything — roughly constant time no matter how much it holds. Membership is the only property of
  the set this problem uses, and that "roughly constant" is the whole reason the fast solution
  exists.

### The constraints, and what each one unlocks

| Constraint | What it forces or permits |
|---|---|
| `0 <= nums.length <= 10^5` | The **empty** array is legal input and must return `0` rather than crash. The upper end rules out anything quadratic: a hundred thousand values in one unbroken run would make the unguarded set walk take about five billion probes. |
| `-10^9 <= nums[i] <= 10^9` | **This is the constraint that forbids direct indexing.** With values this wide you cannot allocate one array slot per possible value — a two-billion-entry table is two gigabytes at one byte each. Hashing is not a preference here; it is the only membership structure that fits. |
| duplicates are allowed and do not lengthen a run | Every approach must **deduplicate** somewhere. The set-based ones get it free, because a set holds each value once. The sorting one must do it on purpose, or `[1, 2, 2, 3]` counts 2 twice and reports a run of 4. |
| the array is not sorted, and sorting it is what the `O(n)` answer avoids | This is the target talking. Sorting is a correct and a good first answer; it is also `O(n log n)`, and the point of the problem is that the question never needed **order** — only presence. |

The worked example traced in every section below is the statement's own:
`nums = [50, 3, 2, 100, 4, 1]`, whose answer is `4` (the run `1, 2, 3, 4`).

Three of the five approaches below walk a run upward from a starting value, differing only in *what
they ask* and *which starts they bother with*. That walk is lifted into one helper, defined once:

```python
def _run_length_from(start: int, present: list[int] | set[int]) -> int:
    """How many of start, start+1, start+2, … are present, counting start itself.
    The container is the variable: a list costs a full scan per probe, a set does not."""
    length = 1
    while start + length in present:
        length += 1
    return length
```

---

## Approach 1 — Brute force: walk each run, searching the array for every step  *(an addition — not in the data file's ladder)*

### The idea

*What is the most direct thing that could possibly work?* Take each value `x` in the array and ask
"is `x + 1` in here? is `x + 2` in here?" until the answer is no; the number of yeses is the length
of the run starting at `x`. *Why is that not the answer?* Because "is it in here?" is answered by
scanning the entire array from the start, so a run of length `L` costs `L` full scans — and you pay
that for every starting point.

### How to think about it

> **Intuition.** A bag of numbered tiles, face down, and no table to lay them out on. You pick up
> tile 3 and want to know whether a 4 exists, so you tip the whole bag out, look through every tile,
> find the 4, and put them all back. Then you want the 5, so you tip the bag out again. Every single
> question costs you a complete search of everything you own, and you ask one question per step of
> every run you try — from every tile in the bag.

The correctness argument is the easy part and every later approach keeps it: the longest run has to
begin at *some* value in the array, so computing "length of the run beginning at `x`" correctly and
trying all `x` cannot miss the answer. Nothing below changes *what* is computed — only how fast the
membership question is answered, and how many starting points are worth trying.

### Worked example

`nums = [50, 3, 2, 100, 4, 1]`. Each probe below is a full scan of six elements.

| Step | `x` | probes asked | run length | `best` after |
|---|---|---|---|---|
| 1 | 50 | `51?`✗ | 1 | 1 |
| 2 | 3 | `4?`✓ `5?`✗ | 2 | 2 |
| 3 | 2 | `3?`✓ `4?`✓ `5?`✗ | 3 | 3 |
| 4 | 100 | `101?`✗ | 1 | 3 |
| 5 | 4 | `5?`✗ | 1 | 3 |
| 6 | 1 | `2?`✓ `3?`✓ `4?`✓ `5?`✗ | **4** | **4** |

Answer `4`. Twelve probes, each a six-element scan: seventy-two comparisons for a six-element input.
Notice too that the run `1,2,3,4` was walked from 1, from 2, from 3 and from 4 — four times, for one
answer. Each of those two observations becomes an approach later.

### Code

```python
def longest_consecutive_brute(nums: list[int]) -> int:
    best = 0
    for x in nums:
        best = max(best, _run_length_from(x, nums))  # list membership: a full scan per probe
    return best
```

### Common mistake

> **Watch out.** The misconception is that `length` counts **probes answered yes**, so it should
> start at `0` and the first probe should ask about `x` itself. It counts **values in the run**, and
> `x` is already one of them. Starting at `0` and probing `x` first makes every run come back exactly
> one too long.

That off-by-one is invisible on a fixed test, because every answer is too big by the same amount and
still looks like a plausible length. Start `length` at `1` and probe `x + 1` first — which is what
the shared `_run_length_from` does, in one place, for all three approaches that walk.

### Complexity and when to use this

**Time** `O(n³)` in the worst case, **space** `O(1)`. The time is three factors multiplied: `n`
starting points, up to `n` steps per walk, and `n` comparisons per membership scan — an array like
`[1, 2, …, n]` hits all three at once. The space is genuinely constant: two integers and no
container.

Use it as the thing you say out loud in the first thirty seconds, and as the **oracle** you
cross-check a clever solution against on random inputs, which is exactly its job in the script below.
Never ship it: at `n = 10^5` the worst case is around `10^15` comparisons.

---

## Approach 2 — Sort the values, then walk once

### The idea

*The brute force scans the array to find the next value — what if the next value were simply sitting
beside it?* Sort the values and consecutive numbers become physically adjacent, so one left-to-right
walk can count runs by comparing each value to the one before it. *What limitation does this fix?*
It kills the repeated **searching**: no membership question is ever asked, so `n` scans per step
collapse into a single pass. What it costs instead is the sort.

### How to think about it

> **Intuition.** Beads threaded on a string in order. You walk the string from one end, and at each
> bead you ask one local question: is this bead exactly one more than the bead behind it? If yes the
> run continues; if no, a new run starts here. You never search, never look ahead, never go back —
> the order has already done all the finding for you, and the walk just counts.

This is the classic **restructure-then-scan** trade, and the two halves are priced separately:
restructuring costs `O(n log n)` and dominates, scanning the restructured data costs `O(n)`.
Deduplicate before threading, because equal neighbours are neither "one more" nor a gap, and they
would reset a run that should have continued.

### Worked example

`nums = [50, 3, 2, 100, 4, 1]`.

**Restructure:** `set(nums)` → `{1, 2, 3, 4, 50, 100}`, then `sorted(...)` → `[1, 2, 3, 4, 50, 100]`.

**Scan** — `zip(nums, nums[1:])` yields each adjacent pair:

| Step | Pair `(prev, cur)` | `cur == prev + 1`? | `run` after | `best` after |
|---|---|---|---|---|
| 0 | — (start) | — | 1 | 1 |
| 1 | `(1, 2)` | yes | 2 | 2 |
| 2 | `(2, 3)` | yes | 3 | 3 |
| 3 | `(3, 4)` | yes | **4** | **4** |
| 4 | `(4, 50)` | no — gap | 1 | 4 |
| 5 | `(50, 100)` | no — gap | 1 | 4 |

Answer `4`. The run was counted exactly once, in one sweep, and no value was ever searched for.

### Code

```python
def longest_consecutive_sort(nums: list[int]) -> int:
    if not nums:
        return 0
    values = sorted(set(nums))  # the set() is not decoration: it drops duplicates
    best = run = 1
    for prev, cur in zip(values, values[1:]):
        run = run + 1 if cur == prev + 1 else 1
        best = max(best, run)
    return best
```

### Common mistake

> **Watch out.** The misconception is that duplicates are **harmless** here — the run cares about
> values, and a repeated value is the same value, so surely it just gets counted again and nothing
> breaks. Sorting puts equal values side by side, and an adjacent pair `(2, 2)` is neither "one
> more" nor a gap, so whichever branch you send it down is wrong.

On `[1, 2, 2, 3]` the pairs are `(1,2) (2,2) (2,3)`. If equal values reset the run you report 2; if
they extend it you report 4. The right answer is 3, and neither branch reaches it — which is why
`set()` belongs on the line that sorts, removing the case rather than handling it.

### Complexity and when to use this

**Time** `O(n log n)`, **space** `O(n)` for the deduplicated copy — `O(1)` extra if you may sort the
caller's array in place and handle duplicates inline. The time is the **sort** and nothing else; the
scan afterwards is a linear afterthought that does not change the order of growth.

Use it when `n` is small, when the values are already sorted (the sort becomes free and this beats
everything below it), or when memory is tighter than time and a hash set of `n` entries will not fit.
It is also the right thing to write first in an interview and then improve out loud: correct, short,
and impossible to get subtly wrong once duplicates are handled.

---

## Approach 3 — A hash set, but walking from every value  *(an addition — not in the data file's ladder)*

### The idea

*The sort exists only so that "is `x + 1` present?" is cheap — can that question be made cheap
without imposing order?* Yes: put every value in a hash set, which answers membership in constant
time, then do exactly what the brute force did. *What limitation does this fix, and what does it
leave?* It fixes the `O(n)` membership scan, dropping the cost per probe from `n` to 1 — but it
leaves the brute force's other sin untouched, because the same run is still walked from every one of
its members.

### How to think about it

> **Intuition.** The tiles are out of the bag now and laid on a board where you can see any one of
> them instantly — no more tipping out the bag. But you are still starting a fresh walk from every
> single tile. The run `1,2,3,4` gets measured four times: once from the 1, once from the 2, once
> from the 3, once from the 4. You made each question cheap and kept asking a quadratic number of
> them.

The reasoning that makes this *feel* finished goes: each probe is `O(1)`, there are `n` starting
points, therefore `O(n)`. The missing factor is the **length** of each walk. Picture one long run of
`n` values: from the first you walk `n` steps, from the second `n - 1`, and the total is `n(n+1)/2`
probes — quadratic, with a constant-time probe. Swapping a slow operation for a fast one only helps
if you were not also doing it too many times.

### Worked example

`nums = [50, 3, 2, 100, 4, 1]`, so `values = {1, 2, 3, 4, 50, 100}` — distinct values only, so
deduplication came free. Iterated in ascending order for readability; a real set hands values back
in an arbitrary order, which does not affect the answer.

| Step | `x` | probes (each `O(1)` now) | run length | `best` after |
|---|---|---|---|---|
| 1 | 1 | `2✓ 3✓ 4✓ 5✗` | **4** | 4 |
| 2 | 2 | `3✓ 4✓ 5✗` | 3 | 4 |
| 3 | 3 | `4✓ 5✗` | 2 | 4 |
| 4 | 4 | `5✗` | 1 | 4 |
| 5 | 50 | `51✗` | 1 | 4 |
| 6 | 100 | `101✗` | 1 | 4 |

Answer `4`. Twelve probes — the same twelve as the brute force — but each is now a hash lookup
instead of a six-element scan. Look at rows 2 to 4: `3 + 2 + 1 = 6` of those twelve probes were spent
re-walking a run that row 1 had already measured in full.

### Code

```python
def longest_consecutive_set_naive(nums: list[int]) -> int:
    values = set(nums)
    best = 0
    for x in values:
        best = max(best, _run_length_from(x, values))  # O(1) per probe, but the run is re-walked
    return best
```

### Common mistake

> **Watch out.** The misconception is that iterating `nums` and iterating `values` differ only in
> **order**, since they hold the same numbers. They differ in **count**: `nums` hands you every
> duplicate, so the outer loop runs once per element rather than once per distinct value.

On an input with many duplicates — a hundred thousand copies of the same long run — that multiplies
an already quadratic walk by the duplication factor. Iterating the set is free deduplication for the
outer loop and costs nothing to write.

### Complexity and when to use this

**Time** `O(n²)` in the worst case, **space** `O(n)`. The time comes from the nested walk: one
unbroken run of `n` values makes the inner walk run `n, n-1, n-2, …` times, which sums to `n²/2`. The
space is the set, holding up to `n` distinct values. On *scattered* input where runs are short it
behaves linearly, which is exactly why this version passes casual testing and dies on the adversarial
case.

There is no situation where you should prefer this to the next approach — the fix is one `if` and
costs nothing. Its value is **diagnostic**: recognising that this is quadratic, and being able to
name the input that proves it, is most of what the problem is testing.

---

## Approach 4 — A hash set, walking only from the start of a run (optimal)

### The idea

*The run `1,2,3,4` was walked four times — can one member be elected to walk it for everyone?* Yes,
and the rule writes itself: `x` is the beginning of a run exactly when `x - 1` is absent from the
set, so skip every `x` whose predecessor is present. *What limitation does this fix?* It removes the
redundant walks that made Approach 3 quadratic, without giving up the constant-time membership that
made Approach 3 better than sorting.

### How to think about it

> **Intuition.** Everyone in a queue is asked to measure the queue, and they all set off counting
> heads — that is Approach 3. Instead, let one rule decide who does the counting: *if someone is
> standing in front of you, it is not your job*. Exactly one person per queue has nobody in front of
> them, so exactly one walk happens per run, and everybody else answers in a single glance over
> their shoulder.

> **Why it works.** Two claims. **Correctness:** every run has exactly one value with no left
> neighbour — its true beginning — so `x - 1 not in values` selects precisely one starting point per
> run and rejects every other member; no run is missed and none is measured twice. **Linearity:** the
> nested loop is still on the page, and the reason it is not quadratic is an *amortised* argument —
> count the total work across the whole algorithm rather than bounding each step in isolation. Every
> distinct value is touched at most **twice**: once by the outer loop when it is tested for being a
> run start, and once by the single inner walk that owns it, because a value belongs to exactly one
> run and that run is walked exactly once. Total work is therefore at most `2n` probes however the
> loops nest. Drop the guard and a value is walked once per member of its run instead of once, which
> is precisely the `n²/2` of the previous rung.

### Worked example

`nums = [50, 3, 2, 100, 4, 1]`, `values = {1, 2, 3, 4, 50, 100}`, iterated in ascending order for
readability:

| Step | `x` | `x - 1` in set? | action | probes spent (guard + walk) | `best` after |
|---|---|---|---|---|---|
| 1 | 1 | `0` → no | **walk**: `2✓ 3✓ 4✓ 5✗` → length 4 | 1 + 4 = 5 | **4** |
| 2 | 2 | `1` → yes | skip — 1 owns this run | 1 + 0 = 1 | 4 |
| 3 | 3 | `2` → yes | skip | 1 + 0 = 1 | 4 |
| 4 | 4 | `3` → yes | skip | 1 + 0 = 1 | 4 |
| 5 | 50 | `49` → no | walk: `51✗` → length 1 | 1 + 1 = 2 | 4 |
| 6 | 100 | `99` → no | walk: `101✗` → length 1 | 1 + 1 = 2 | 4 |

Answer `4`, in twelve probes — the *same* twelve as Approach 3, because at `n = 6` the six guard
checks cost exactly what the skipped walking saved. That is the honest reading of a six-element
input, and it is why the table is not the argument. The argument is the shape: the run `1,2,3,4` is
walked **once**, from 1, and rows 2 to 4 cost one probe each instead of three, two and one. Scale the
run to a hundred thousand values and Approach 3 spends `5 × 10^9` probes where this spends about
`2 × 10^5`.

### Code

```python
def longest_consecutive(nums: list[int]) -> int:
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 in values:
            continue  # not the start of a run — its owner will walk it
        best = max(best, _run_length_from(x, values))
    return best
```

### Common mistake

> **Watch out.** The misconception is that the guard is a **duplicate filter** — "skip values I have
> already seen" — so either direction will do, and `if x + 1 in values: continue` looks like the
> same idea. It is not a filter; it *elects an owner*, and the owner has to be at the end the walk
> moves away from. Electing the value with no **successor** and then walking upward from it walks off
> the end immediately.

The guard and the walk must point in opposite directions: elect the value with no predecessor and
walk forwards, or elect the value with no successor and walk backwards. Mixing them returns `1` on
every input containing a run, which reads like "no runs found" rather than like a bug — the worst
kind of wrong answer.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n)`. The time is two linear passes in disguise: building the set is `n`
insertions, then every distinct value is examined once by the outer loop and belongs to at most one
inner walk, so the nested loop never revisits a value. The space is the **set**, `O(n)` in the number
of distinct values, and there is no way around it: something has to answer membership in constant
time.

This is the answer. Use it whenever the values are wide (as here) and the input is unsorted. The only
reasons to reach past it are the two named above — already-sorted input, or a memory budget that
cannot hold a hash set.

---

## Approach 5 — Direct indexing, the version this problem's constraints forbid  *(an addition — not in the data file's ladder)*

### The idea

*A hash set answers "is `v` present?" with a hash computation — could an array index answer it with
no computation at all?* If the values were packed into a small range you could allocate one slot per
possible value, mark the present ones, and read the answer off as the longest stretch of marked
slots — no probing, no hashing, one linear sweep. *What limitation does it fix?* It removes hashing
entirely, a real constant-factor win. **But it needs an assumption this problem does not grant**, and
that is the reason it is here.

### How to think about it

> **Intuition.** A long row of numbered pigeonholes, one per possible value, all empty. Post each
> number into its own hole — the value *is* the address, so no searching and no hashing happens at
> all. Then walk the row from one end and count how many filled holes you pass in a row. The catch
> is that you must build and walk the entire row, including every empty hole between 4 and 50.

### What must be true, and what breaks if it is not

The assumption is that `max - min` is small enough to allocate. Here `-10^9 <= nums[i] <= 10^9`, so
the span can be two billion and one; at one byte per slot that is two gigabytes to hold a hundred
thousand numbers. What breaks is not correctness but **feasibility** — the program is right and
cannot run. The version below sizes the row from the *actual* input rather than the declared bounds,
which makes it usable on clustered data and still hopeless on `[-10^9, 10^9]`; the harness prints
exactly that, on purpose.

The general move is **trading value-range for speed**: when the universe of possible values is small,
an array indexed by the value itself is a perfect hash — no collisions, no hash cost, and the values
arrive in sorted order for free because array indices are ordered.

### Worked example

`nums = [50, 3, 2, 100, 4, 1]`. `lo = 1`, `hi = 100`, so allocate 100 slots, all zero. Value `v` sets
slot `v - lo`.

| Step | value | slot set |
|---|---|---|
| 1 | 50 | 49 |
| 2 | 3 | 2 |
| 3 | 2 | 1 |
| 4 | 100 | 99 |
| 5 | 4 | 3 |
| 6 | 1 | 0 |

`present` is now `1 1 1 1 0 0 … 0 1 (at 49) 0 … 0 1 (at 99)`. Sweep it, resetting on every zero:

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

Answer `4` — and the sweep visited 100 slots to examine 6 values. That ratio is the price of the
assumption.

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

> **Watch out.** The misconception is that the table should be sized from the **declared constraint**
> — `2 * 10^9 + 1` slots, because that is what the problem says the values may be. Size it from the
> `min` and `max` of the input actually in front of you, and a technique that cannot run at all
> becomes one that is merely situational.

The related error is forgetting the `- lo` offset. Every negative value then lands on a negative
index, and in Python that silently wraps to the end of the array and corrupts a different slot
instead of raising — so the answer comes back wrong rather than loud.

### Complexity and when to use this

**Time** `O(n + R)`, **space** `O(R)`, where `R = max - min + 1` is the **span** of the values. The
`n` is marking; the `R` is the sweep across every slot whether or not anything lives in it — which is
why a sparse input like `[0, 10^9]` costs a billion steps to find a run of length 1. The space is one
byte per slot across the whole span, independent of how many values you hold.

Use it when the value range is genuinely small and known in advance — ages, days of the year, scores
out of 100, bytes — and especially when the same set is queried repeatedly. For *this* problem it is
disqualified, and being able to say precisely why (`R` up to `2 × 10^9` while `n` is at most `10^5`)
is a better answer than not knowing the technique at all.

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
| Brute force | `O(n³)` | `O(1)` | No memory at all, paid for by rescanning the array on every probe | As the spoken first answer, and as the cross-check oracle in a harness |
| Sort, then walk | `O(n log n)` | `O(n)` (or `O(1)` sorting in place) | Buys a total order when only membership was needed | Input is already sorted, `n` is small, or a hash set will not fit in memory |
| Hash set, walk from everywhere | `O(n²)` | `O(n)` | Constant-time probes, but the same run is re-measured from every member | Never — the guard that fixes it is one line |
| **Hash set, walk from run starts** | **`O(n)`** | **`O(n)`** | Linear, at the price of holding every distinct value in memory | **The default answer for this problem** |
| Direct indexing | `O(n + R)` | `O(R)` | Deletes hashing, but pays for the whole value span whether used or not | The value range is small and known — ages, scores, bytes. Disqualified here |

---

## Interview Priority

> **In an interview.** Write the sort first, out loud — *"dedupe, sort, walk adjacent pairs,
> `O(n log n)`"* — and then say what you are about to improve: *"the question only ever needs
> membership, not order, so a hash set replaces the sort."* Write the set version **with** the
> `x - 1` guard. The follow-up is certain and it is always the same: **"there is a loop inside a
> loop — isn't that `O(n²)`?"** Answer with the amortised argument in one sentence: every distinct
> value is examined once by the outer loop and belongs to at most one inner walk, so the total is
> `2n` no matter how the loops nest.

**Know cold: the hash set with the `x - 1` guard.** The guard is the entire interview. Candidates who
write the right code but cannot defend the complexity do worse than candidates who write the sort and
explain themselves.

**Know cold: the sort.** Not as a fallback you are embarrassed by, but as the thing you write first,
confirm correct, and then improve out loud. It takes twenty seconds and it forces you to notice
duplicates — which the `O(n)` version handles invisibly, so you will otherwise forget to mention them.

**Understand but do not drill: the unguarded set walk.** Its value is that it is the **trap**. Many
people write it, call it `O(n)`, and are wrong. Being able to say "without the guard this is
quadratic on a single long run, and here is the input that proves it" is a stronger signal than
arriving at the final code with no wrong turns.

**Understand but do not drill: brute force and direct indexing.** Brute force is thirty seconds of
framing plus a testing oracle. Direct indexing is worth one sentence — "if the values were bounded I
would index them directly, but they run to `10^9`, so the table would dwarf the input" — which shows
you read the constraint rather than pattern-matched the problem.

---

## Full Runnable Script

Five approaches sharing one walk helper, plus a test suite. The `SPAN_BUDGET` guard and everything
under "test suite" is **scaffolding**, not answer: it exists so the harness refuses to allocate a
two-gigabyte table and prints the refusal, which is the disqualifying constraint made visible.

```python
"""Longest Consecutive Sequence - every approach in one file, cross-checked.

Run:  python longest_consecutive.py
"""

from __future__ import annotations

import random


# --------------------------------------------------------- the shared walk
def _run_length_from(start: int, present: list[int] | set[int]) -> int:
    """How many of start, start+1, start+2, … are present, counting start itself.
    The container is the variable: a list costs a full scan per probe, a set does not."""
    length = 1
    while start + length in present:
        length += 1
    return length


# ------------------------------------------------- approach 1: brute force
def longest_consecutive_brute(nums: list[int]) -> int:
    best = 0
    for x in nums:
        best = max(best, _run_length_from(x, nums))  # list membership: a full scan per probe
    return best


# ------------------------------------------------------ approach 2: sorting
def longest_consecutive_sort(nums: list[int]) -> int:
    if not nums:
        return 0
    values = sorted(set(nums))  # the set() is not decoration: it drops duplicates
    best = run = 1
    for prev, cur in zip(values, values[1:]):
        run = run + 1 if cur == prev + 1 else 1
        best = max(best, run)
    return best


# --------------------------------- approach 3: set, but walking from everywhere
def longest_consecutive_set_naive(nums: list[int]) -> int:
    values = set(nums)
    best = 0
    for x in values:
        best = max(best, _run_length_from(x, values))  # O(1) per probe, but the run is re-walked
    return best


# ------------------------------------ approach 4: set, walking only from starts
def longest_consecutive(nums: list[int]) -> int:
    values = set(nums)
    best = 0
    for x in values:
        if x - 1 in values:
            continue  # not the start of a run — its owner will walk it
        best = max(best, _run_length_from(x, values))
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
        present[x - lo] = 1  # the value IS the index; no hashing at all
    best = run = 0
    for flag in present:
        run = run + 1 if flag else 0  # a zero slot ends the run
        best = max(best, run)
    return best


APPROACHES = [
    ("brute", longest_consecutive_brute),
    ("sort", longest_consecutive_sort),
    ("set_naive", longest_consecutive_set_naive),
    ("set_run_start", longest_consecutive),
    ("bitset", longest_consecutive_bitset),
]


# ------------------------------------------------- test suite (scaffolding)
SPAN_BUDGET = 2_000_000  # refuse to allocate more than this many bytes


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
        span = max(nums) - min(nums) + 1 if nums else 0
        results: dict[str, int] = {}
        for name, fn in APPROACHES:
            if name == "bitset" and span > SPAN_BUDGET:
                print(f"  {name:<14} -> skipped (span {span:,} exceeds the "
                      f"memory budget - this is the constraint in action)")
                continue
            results[name] = fn(nums)
            print(f"  {name:<14} -> {results[name]}")
        if len(set(results.values())) != 1:
            all_agreed = False
            print("  !! approaches disagree")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND - see the lines above")


if __name__ == "__main__":
    main()
```
