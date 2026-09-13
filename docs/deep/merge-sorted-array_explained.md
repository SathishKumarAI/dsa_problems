# Merge the Second Array Into the First — explained

## Understanding the Problem

You have two lists of numbers, each already arranged from smallest to largest. The first list,
`a`, has been handed to you deliberately oversized: its first `m` slots hold its own values and the
last `n` slots are **padding**, junk you are free to scribble on. The second list, `b`, holds `n`
values. Fill `a` so it holds all `m + n` values in sorted order, without allocating a second array
to do it.

**The core question is: at each output position, which of the two lists offers the next value?**
Answering it is easy — compare the two front values and take the smaller. What makes the problem
interesting is *where to put the answer*. The obvious approach, filling `a` from index 0 forward,
destroys itself: the very first write to `a[0]` lands on one of `a`'s own live values, and that
value has not been placed yet. So the naive fix is to save a copy of `a` first, and now you are
allocating exactly the memory the problem told you not to.

### The constraints, and what each one unlocks

| Constraint | What it unlocks |
|---|---|
| `0 <= m, n <= 200` and `1 <= m + n` | The input is tiny, so *every* approach here passes a judge — even the quadratic one. That is a warning, not a licence: this problem is graded on technique, and the only thing separating the rungs is how much memory and motion they waste. It also means `m = 0` and `n = 0` are both real inputs that the code must survive. |
| `a`'s first `m` values and all `n` of `b`'s are each already sorted | This is what makes a *merge* possible at all. Each comparison places one value permanently, so the whole job is linear — whereas throwing both halves at a sort pays a log factor to rediscover ordering the input already handed you. |
| **the last `n` slots of `a` are padding you may overwrite** | The load-bearing one, and the reason this problem exists. **Merging backwards is only legal because the first array has spare room at the end.** Start the write cursor on the last slot and every write lands on either padding or a cell whose value has already been read and placed. Fill forwards and the first write clobbers a value still waiting its turn. Take the spare room away — imagine `a` were exactly `m` long — and there is no in-place answer at all. |
| `m = 0` and `n = 0` are both legal | `n = 0` must leave `a` alone and not read `b` at all; `m = 0` means `a` is nothing but padding, so the read cursor into `a` starts at `-1` and must never be dereferenced. In Python `a[-1]` is the *last* element rather than an error, so this bug does not crash — it silently produces a wrong answer. |
| values may repeat, within one array and across both | Equal values are interchangeable integers, so ties may break either way without changing the output. That is why one approach can compare with `>` and another with `<=` and both are right. |

The middle row deserves saying twice, plainly: **the only reason the good answer walks backwards
is that the free space is at the back.** If the padding were at the front, the good answer would
walk forwards. The technique is not "merging goes backwards"; it is "write into the space you
actually have, and travel in whichever direction keeps the write cursor away from unread data".

---

## Approach 1 — Insert one at a time

### The idea

*How do I get `b`'s values into `a` while keeping everything sorted?* Take them one at a time. For
each value of `b`, walk `a`'s live prefix until you find the spot it belongs, slide everything from
that spot rightwards by one to open a gap, and drop the value in. *Where does the room for the
slide come from?* The padding — each insertion consumes exactly one padding slot, and the live
length grows by one. This is insertion sort's inner step, applied `n` times.

### How to think about it

Filing paper into a ring binder that already has the right number of blank pages at the back.
For each new sheet you flick through from the front until you reach the point it belongs, then you
shove every sheet from there onward back one position to open a slot, and drop it in. The filing
is always correct, and it is always *expensive*, because moving one sheet into the middle means
touching every sheet behind it. The cost you should feel in your hands is that the same sheets get
shoved back again and again — `a`'s largest value is moved once per insertion that lands before it.

### Worked example

Input: `a = [1, 2, 3, _, _, _]` with `m = 3`, `b = [2, 5, 6]` with `n = 3`. Underscores are padding.
Every approach in this document traces this same input.

| Insert | Value | `live` before | Scan finds slot | Shifts | `a` after | `live` after |
|---|---|---|---|---|---|---|
| 1 | `2` | 3 | index 2 (after `a`'s own `2`, before `3`) | `a[3] ← a[2]` (the `3` moves right) | `[1, 2, 2, 3, _, _]` | 4 |
| 2 | `5` | 4 | index 4 (past everything live) | none | `[1, 2, 2, 3, 5, _]` | 5 |
| 3 | `6` | 5 | index 5 (past everything live) | none | `[1, 2, 2, 3, 5, 6]` | 6 |

Result `[1, 2, 2, 3, 5, 6]`. This example is kind to the approach — only one value had to be
shifted. Feed it `a = [4, 5, 6, _, _, _]`, `b = [1, 2, 3]` instead and every single insertion lands
at the front, shifting the entire live tail each time: 3 + 4 + 5 = 12 moves to place 3 values.

### Code

```python
def merge_sorted_array_insert_one_at_a_time(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    live = m  # how many real values a currently holds
    for j in range(n):
        at = 0
        while at < live and a[at] <= b[j]:
            at += 1
        for k in range(live, at, -1):  # open a gap by sliding the tail right
            a[k] = a[k - 1]
        a[at] = b[j]
        live += 1
    return a
```

### Common mistake

Sliding the gap open **left to right** instead of right to left — writing
`for k in range(at, live): a[k + 1] = a[k]`. Each step copies the value you just wrote one slot
further along, so instead of shifting the tail you smear `a[at]` across the entire rest of the
array: `[1, 2, 3, _, _, _]` inserting a `2` at index 2 becomes `[1, 2, 2, 2, _, _]` and the `3` is
gone forever. A shift right must be performed right-to-left, from the far end back toward the gap,
so that every cell is read before it is overwritten. That is the same "which direction is safe"
question the last approach in this document answers on a larger scale — and it is worth noticing
that the naive rung already contains it.

### Complexity and when to use this

**Time O(n · (m + n)), space O(1).** Each of the `n` values from `b` does a linear scan to find its
position and then shifts up to the whole live tail, and the live tail grows to `m + n`. Space is
three integers — the shifting all happens inside `a`, so nothing is allocated.

It is the right choice in one situation: when `n` is very small compared to `m`, and especially
when `n` is 1. Inserting a single value into a mostly-sorted array is genuinely cheaper as one
scan-and-shift than as a full merge, and it is what you would write by hand. For `n` of any real
size the shifting is pure motion with no comparisons in it — bookkeeping the next rung deletes
entirely.

---

## Approach 2 — Append and sort

### The idea

*Inserting one at a time re-shifts a growing tail for every value of `b` — can the shifting be
skipped?* Yes, by not caring about order while copying. Dump `b`'s values into `a`'s padding
slots in whatever order they arrive, then hand the whole array to a sort and let it work out the
interleaving. This fixes the previous rung's weakness exactly: there is no scan-and-shift per
value, just `n` blind writes and one library call.

### How to think about it

Tip both piles of paper into one heap and put the heap through the sorting machine. You are
deliberately throwing away the one useful fact you had — that each pile was already ordered — in
exchange for never having to think about the interleaving. It is the shortest code in this
document by a wide margin, it is almost impossible to get wrong, and it is the right instinct in
most real programs. It is also the rung that a merge exists to improve on: the sort spends
`log(m + n)` comparisons per element rediscovering the order that was sitting in front of it.

### Worked example

Input: `a = [1, 2, 3, _, _, _]`, `m = 3`, `b = [2, 5, 6]`, `n = 3`.

| Step | Action | `a` after |
|---|---|---|
| 1 | `a[3] ← b[0] = 2` | `[1, 2, 3, 2, _, _]` |
| 2 | `a[4] ← b[1] = 5` | `[1, 2, 3, 2, 5, _]` |
| 3 | `a[5] ← b[2] = 6` | `[1, 2, 3, 2, 5, 6]` |
| 4 | `a.sort()` | `[1, 2, 2, 3, 5, 6]` |

Three writes and one sort. There are no cursors to trace in step 4, which is precisely the
approach's appeal and precisely what it costs you.

### Code

```python
def merge_sorted_array_append_and_sort(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    for j in range(n):
        a[m + j] = b[j]  # overwrite the padding; do NOT append past the end
    a.sort()
    return a
```

### Common mistake

Writing `a.extend(b)` (or `a += b`) instead of overwriting the padding. `a` already *has* `n`
spare slots — appending adds `n` more, so the array ends up `m + 2n` long and the `n` padding
zeros are still sitting inside it. Sorting then produces a longer array with phantom zeros
scattered through the middle: `[1, 2, 3, 0, 0, 0]` plus `[2, 5, 6]` becomes
`[0, 0, 0, 1, 2, 2, 3, 5, 6]` instead of `[1, 2, 2, 3, 5, 6]`. The padding is space to be *filled*,
not a prefix to be appended after. The same bug in a different costume is rebinding the name —
`a = sorted(a[:m] + b)` — which produces the right list and assigns it to a local variable, leaving
the caller's array exactly as it was.

### Complexity and when to use this

**Time O((m + n) log(m + n)), space O(1) in principle.** The time is dominated by the sort; the
`n` copies are linear and disappear into it. The space claim deserves an asterisk: the `n` writes
allocate nothing, but whether the *sort* is in place depends on the language. C++'s `std::sort` is
in place, Java's primitive sort is in place, and Python's Timsort uses up to O(n) auxiliary memory
in the worst case. If the problem's space bound is being enforced strictly, say so out loud rather
than claiming O(1) and hoping.

Use it in production code where `m + n` is small and clarity beats constant factors — it is two
lines and cannot be got wrong in an interesting way. Use it in an interview as the thing you offer
*and then immediately improve*, naming what it wasted: both halves were already sorted, and the
sort paid a log factor to learn that again.

---

## Approach 3 — Merge into a scratch array

### The idea

*The sort throws away the one fact the input hands you for free — both halves are already ordered.
Can that be exploited?* Yes, with a textbook merge: keep a cursor at the front of each sorted run,
compare the two values they point at, write the smaller into the output and advance that cursor.
Each comparison places one value permanently, so the whole thing is linear instead of
`log`-factored. *Where does the output go?* Into a brand new array of size `m + n`, then copied
back over `a` at the end.

### How to think about it

Two sorted decks of cards face up, and one empty space to build the result in. Look at the top
card of each deck, take the smaller, place it, and look again. Because both decks are sorted, the
smaller of the two tops is the smallest card remaining anywhere — there is no need to look deeper
into either deck, ever. When one deck runs out, the other is already in order and can be poured
straight down. The problem is the empty space: you have borrowed a whole extra table to do it on,
and half of it is being used to hold values that already sit in `a`.

### Worked example

Input: `a = [1, 2, 3, _, _, _]`, `m = 3`, `b = [2, 5, 6]`, `n = 3`. Cursors `i` into `a`'s live
prefix, `j` into `b`, `w` into the scratch array `out`.

| Step | `i` (value) | `j` (value) | Comparison | Write | `out` after |
|---|---|---|---|---|---|
| 1 | 0 (`1`) | 0 (`2`) | `1 <= 2` → take `a` | `out[0] ← 1`, `i → 1` | `[1, _, _, _, _, _]` |
| 2 | 1 (`2`) | 0 (`2`) | `2 <= 2` → tie, take `a` | `out[1] ← 2`, `i → 2` | `[1, 2, _, _, _, _]` |
| 3 | 2 (`3`) | 0 (`2`) | `3 > 2` → take `b` | `out[2] ← 2`, `j → 1` | `[1, 2, 2, _, _, _]` |
| 4 | 2 (`3`) | 1 (`5`) | `3 <= 5` → take `a` | `out[3] ← 3`, `i → 3` | `[1, 2, 2, 3, _, _]` |
| 5 | — (`a` spent) | 1 (`5`) | `a` exhausted → take `b` | `out[4] ← 5`, `j → 2` | `[1, 2, 2, 3, 5, _]` |
| 6 | — | 2 (`6`) | `a` exhausted → take `b` | `out[5] ← 6`, `j → 3` | `[1, 2, 2, 3, 5, 6]` |

Then a second loop copies all six values from `out` back over `a`. Twelve writes in total to place
six values.

### Code

```python
def merge_sorted_array_scratch_merge(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    out = [0] * (m + n)
    i, j = 0, 0
    for w in range(m + n):
        if j >= n or (i < m and a[i] <= b[j]):
            out[w] = a[i]
            i += 1
        else:
            out[w] = b[j]
            j += 1
    for w in range(m + n):
        a[w] = out[w]
    return a
```

### Common mistake

Getting the order of the exhaustion checks wrong — writing the condition as
`if a[i] <= b[j] or j >= n`. Python evaluates left to right, so `a[i] <= b[j]` is reached with
`j == n` the moment `b` runs dry, and the whole thing dies with an `IndexError` (in C++ it reads
past the end of the vector and silently compares garbage). The exhaustion tests must come *first*,
short-circuiting before any indexing happens: `j >= n or (i < m and a[i] <= b[j])` reads as "if
`b` has nothing left, take from `a`; otherwise take from `a` only if it has something and that
something is not larger."

The other classic here is forgetting the copy-back loop and returning `out`. In Python that hands
the caller a correct-looking list while the array they actually passed in is untouched — the
function has not merged anything in place, it has merely computed the answer somewhere else. In a
language where the signature returns `void`, the same bug produces silence and a wrong array.

### Complexity and when to use this

**Time O(m + n), space O(m + n).** Every value is compared once and written twice — once into the
scratch array, once on the way back — so the time is two linear passes. The space is the scratch
array, exactly the size of the finished result.

This is the right shape whenever you are merging two sorted runs and you *do* have somewhere to
put the answer: it is the merge step of merge sort, it is what `heapq.merge` and `std::merge` do,
and outside this artificial "we gave you spare room" framing it is the standard answer. Its only
sin here is that the problem handed you spare room and you ignored it.

---

## Approach 4 — Copy only `a`'s prefix

### The idea

*The scratch array is `m + n` long, gets fully written and then fully copied back — so every value
is written twice, and `n` of the copied slots were empty padding to begin with. What actually needs
saving?* Only `a`'s own `m` live values, because they are the only things a forward write into `a`
can destroy. `b` is a separate array that nobody is writing to. So save just the prefix, then merge
that buffer with `b` **forward into `a` itself**. The buffer shrinks from `m + n` to `m` and the
copy-back disappears entirely.

### How to think about it

Same two decks, same comparison, but now you lift only `a`'s live cards off the table and rebuild
the result directly onto the space they came from. The freed row in front of you is exactly as long
as the answer, and you fill it left to right. The reason it is safe is worth stating precisely: the
write cursor `w` advances one slot per value placed, and it can only ever be as far along as the
number of values already taken — of which at most `i` came from the buffer — so `w` never runs
ahead of information you still need. It does not need to: the values at risk are already in your
hand.

### Worked example

Input: `a = [1, 2, 3, _, _, _]`, `m = 3`, `b = [2, 5, 6]`, `n = 3`. Buffer `left = [1, 2, 3]`;
cursors `i` into `left`, `j` into `b`, `w` the write position in `a`.

| Step | `i` (value) | `j` (value) | Comparison | Write | `a` after |
|---|---|---|---|---|---|
| 0 | — | — | copy `left ← a[:3] = [1, 2, 3]` | — | `[1, 2, 3, _, _, _]` |
| 1 | 0 (`1`) | 0 (`2`) | `1 <= 2` → buffer | `a[0] ← 1`, `i → 1` | `[1, 2, 3, _, _, _]` |
| 2 | 1 (`2`) | 0 (`2`) | tie → buffer | `a[1] ← 2`, `i → 2` | `[1, 2, 3, _, _, _]` |
| 3 | 2 (`3`) | 0 (`2`) | `3 > 2` → `b` | `a[2] ← 2`, `j → 1` | `[1, 2, **2**, _, _, _]` |
| 4 | 2 (`3`) | 1 (`5`) | `3 <= 5` → buffer | `a[3] ← 3`, `i → 3` | `[1, 2, 2, 3, _, _]` |
| 5 | — (spent) | 1 (`5`) | buffer exhausted | `a[4] ← 5`, `j → 2` | `[1, 2, 2, 3, 5, _]` |
| 6 | — | 2 (`6`) | buffer exhausted | `a[5] ← 6`, `j → 3` | `[1, 2, 2, 3, 5, 6]` |

Step 3 is the one to stare at: `a[2]` — which held the `3` — is overwritten with a `2`. That would
have been catastrophic in the previous rung without a copy, and here it is harmless, because the
`3` is safely sitting in `left`. Six writes instead of twelve, and a buffer of 3 instead of 6.

### Code

```python
def merge_sorted_array_copy_prefix(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    left = a[:m]  # only a's live values are ever at risk of being overwritten
    i, j = 0, 0
    for w in range(m + n):
        if j >= n or (i < m and left[i] <= b[j]):
            a[w] = left[i]
            i += 1
        else:
            a[w] = b[j]
            j += 1
    return a
```

### Common mistake

Copying the whole array instead of the prefix — `left = a[:]` or `left = list(a)`. Now the buffer
contains the `n` padding cells as if they were real values, and since padding is conventionally
zero, those zeros are *smaller* than most real values and get merged in first. On the worked
example the buffer becomes `[1, 2, 3, 0, 0, 0]`, the merge treats it as a sorted run (it is not
sorted, which breaks the merge's precondition outright), and the result is garbage. The bound
that matters is `m`, not `len(a)`, and every loop condition in this approach must test `i < m`
rather than `i < len(left)`.

### Complexity and when to use this

**Time O(m + n), space O(m).** One comparison and one write per output slot, no copy-back pass, so
it is strictly half the writes of the scratch version. The memory is the saved prefix, which is as
big as `a`'s live portion.

This is genuinely the best you can do when the spare room is in the *wrong place* — if `a` had its
padding at the front rather than the back, or if you were merging into a buffer that overlapped
only partially, this is the shape that survives. It is also the honest answer when `m` is small
and `n` is huge, because then `O(m)` extra memory is nearly nothing. Here it is one rung short,
because the padding is at the back and that fact makes even `O(m)` unnecessary.

---

## Approach 5 — Backward two pointers (optimal)

### The idea

*The prefix copy exists solely because writing forward into `a[0]` would land on a live value of
`a` that has not been placed yet. Is that a fact about the problem, or about the direction of
travel?* The direction. Turn around. Start the write cursor on `a`'s **last** slot — which is
padding, so writing there destroys nothing — and fill the answer from the largest value down to
the smallest. Every subsequent write moves further left into a cell that has *just been vacated*
by the value it held. The buffer becomes unnecessary and the merge runs with no scratch memory at
all.

### How to think about it

Three cursors on the same row of boxes: `i` on the last live value of `a`, `j` on the last value of
`b`, and `w` on the last box of all. At each step the larger of the two values under `i` and `j` is
the largest value not yet placed anywhere — so it belongs in box `w`. Write it, step that value's
cursor back, step `w` back. The safety property is one inequality and it is the whole proof:
**`w` is always strictly to the right of `i`**, because `w` has consumed `(m − 1 − i) + (n − 1 − j)`
slots' worth of values from *both* arrays while only `(m − 1 − i)` of them came from `a`. The gap
between them is exactly the number of `b`'s values placed so far, and it can only grow. So the
write cursor is forever chasing the read cursor from behind, never overtaking it, and every cell
it lands on is either original padding or a cell whose value has already been copied to its final
home.

### Worked example

Input: `a = [1, 2, 3, _, _, _]`, `m = 3`, `b = [2, 5, 6]`, `n = 3`. Start `i = 2`, `j = 2`, `w = 5`.

| Step | `i` (value) | `j` (value) | Larger | Write | `a` after | `w` after |
|---|---|---|---|---|---|---|
| start | 2 (`3`) | 2 (`6`) | — | — | `[1, 2, 3, _, _, _]` | 5 |
| 1 | 2 (`3`) | 2 (`6`) | `b`'s `6` | `a[5] ← 6`, `j → 1` | `[1, 2, 3, _, _, 6]` | 4 |
| 2 | 2 (`3`) | 1 (`5`) | `b`'s `5` | `a[4] ← 5`, `j → 0` | `[1, 2, 3, _, 5, 6]` | 3 |
| 3 | 2 (`3`) | 0 (`2`) | `a`'s `3` | `a[3] ← 3`, `i → 1` | `[1, 2, 3, 3, 5, 6]` | 2 |
| 4 | 1 (`2`) | 0 (`2`) | tie → take `b` | `a[2] ← 2`, `j → -1` | `[1, 2, 2, 3, 5, 6]` | 1 |

`j` has reached `-1`, so the loop stops — with `a[0]` and `a[1]` never touched at all. They did not
need to be: whatever remains of `a` when `b` runs dry is already sitting exactly where it belongs,
because everything smaller than it has already been placed to its left and everything larger has
been moved to its right. That early stop is not an optimisation bolted on, it is the loop
condition.

Watch step 3 in particular. `a[3]` is written while `i` is still on index 2 — the write cursor is
one slot to the *right* of the read cursor, which is the invariant doing all the work. In step 4
the gap is two, and it is exactly the two values of `b` (the `5` and the `6`) already placed.

### Code

```python
def merge_sorted_array_backward_two_pointers(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    i, j, write = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and a[i] > b[j]:  # i may be -1 when a is pure padding
            a[write] = a[i]
            i -= 1
        else:
            a[write] = b[j]
            j -= 1
        write -= 1
    return a  # when j runs dry, a[0..i] is already in its final position
```

### Common mistake

Dropping the `i >= 0` guard and writing just `if a[i] > b[j]`. When `a` is pure padding (`m = 0`)
or when `a`'s values run out before `b`'s, `i` reaches `-1` — and in Python `a[-1]` is not an error,
it is the **last element of the array**, which at that moment holds the largest value you have
already placed. So the comparison silently succeeds, that value gets copied a second time, and `b`'s
remaining values are lost. Feed it `a = [0]`, `m = 0`, `b = [1]`, `n = 1`: with the guard you get
`[1]`, without it you get `[0]`, no exception, no warning. In Java and C++ the same line reads out
of bounds instead — a crash if you are lucky, garbage if you are not.

The second mistake is looping `while i >= 0 and j >= 0` and stopping there. That is the natural
thing to write and it is half right: if `a` runs out first, `b` still has values left and they are
all smaller than everything placed, so they must be copied down into `a[0..j]` — and that drain
loop is missing. Looping on `j >= 0` alone, as above, makes the drain automatic (the `else` branch
handles it) and makes the *other* leftover case — `b` runs out first — free, because the rest of
`a` needs no work at all.

### Complexity and when to use this

**Time O(m + n), space O(1).** Each iteration writes one output slot and retires one input value,
and no index ever moves backwards, so the loop runs at most `m + n` times — often fewer, since it
stops the moment `b` is exhausted. Space is three integers: nothing is allocated no matter how big
the arrays are.

This is the intended answer, and the reason to know it is not this problem — it is the move. **When
in-place writing collides with reading, reverse the direction of travel.** The same trick is what
makes `memmove` safe for overlapping regions, what lets you shift an array right without a buffer,
what makes in-place string expansion (replacing every space with `%20`, say) work in one pass, and
what underlies any "fill from the end because the end is where the free room is" algorithm. Reach
for it the moment you notice that the output is larger than the input and the extra space is at
the back.

---

## The reader/writer family

This problem belongs with remove-duplicates-sorted, remove-element and is-subsequence: **a reader
walks the input, a writer marks where the next kept value belongs, and the gap between the two
cursors is exactly what has been dropped — or here, what has been inserted.** In the backward merge
the reader is `i`, walking `a`'s live values from the top down; the writer is `w`, marking the slot
the next value belongs in; and the gap `w − i` is precisely the number of `b`'s values already
placed. When that gap is zero the two cursors coincide and `a`'s remaining values are already home,
which is why the loop can stop as soon as `b` is spent.

**This is the one where the family's usual rule reverses.** Everywhere else the writer trails
*behind* the reader, and that is what makes overwriting safe: the writer only ever lands on cells
the reader has finished with. Here the writer is *ahead* of the reader, to the right of it, and
both of them travel right-to-left. The safety argument is the same one read in a mirror — the
writer never lands on a cell the reader still needs — but achieving it required reversing the
direction of the whole walk, and that was only possible because the spare room sits at the back.
It is the clearest illustration in the family that "reader behind writer" was never the rule; the
rule is *the write cursor must stay out of the unread region*, and which side that puts it on
depends on where the free space is.

The other bend in the family is **is-subsequence**, which keeps two cursors but walks two different
sequences instead of one array, and never writes at all.

---

## The Overall Arc

The principle every rung of this problem chases is *stop moving data you were never asked to move,
and let the shape of the memory you were given tell you which way to walk*. Inserting `b`'s values
one at a time is correct and it is almost all motion: each insertion re-shifts a growing tail, so
`a`'s largest value gets shoved right once per value that lands before it, and none of that
shifting performs a single useful comparison. Dumping everything into the padding and calling
`sort` deletes the shifting in one stroke, but it does so by throwing away the fact that both
halves arrived already ordered, and it then pays a logarithmic factor per element to rediscover
it. A merge reclaims that fact — two cursors, one comparison, one value placed for good, linear
overall — but a textbook merge needs somewhere to build the answer, so it borrows a full
`m + n` array and writes every value twice. Noticing that only `a`'s own prefix is ever in danger
shrinks the borrowed space to `m` and halves the writes, and that is the best you can do as long
as you insist on filling the answer from the front. And then the last rung asks the question the
whole problem was built around: *why the front?* Filling forward is only unsafe because `a[0]`
holds a live value; the spare room is at the **back**, so start there. Fill from the largest value
down, and the write cursor begins on padding and thereafter only ever lands on cells already
emptied by the values it has just placed — the buffer becomes unnecessary, the copy-back
disappears, and the whole merge runs in three integers. Two details fall out for free once the
direction is right: the loop can stop the instant `b` is exhausted, because whatever remains of `a`
is already in its final place; and the case that exercises the leftovers — every value of `b`
smaller than every value of `a` — is the one your test list must contain, because it is the only
one where `a`'s values all have to move. The generalisable move is not "merges go backwards". It
is: **when writing collides with reading, turn around and write into the space you actually have.**

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Insert one at a time | O(n · (m + n)) | O(1) | No extra memory, but every insertion re-shifts a growing tail — pure motion, no comparisons | `n` is tiny relative to `m`, especially `n = 1` |
| Append and sort | O((m + n) log(m + n)) | O(1)* | Shortest and safest code; discards the sortedness the input handed you and pays a log factor to relearn it | Small inputs, production code where clarity beats constant factors (*if the language's sort is in place) |
| Merge into a scratch array | O(m + n) | O(m + n) | Exploits both runs being sorted, but borrows a full-size array and writes every value twice | Merging two sorted runs when you genuinely have an output buffer — the merge step of merge sort |
| Copy only `a`'s prefix | O(m + n) | O(m) | Halves the writes and the buffer by saving only what a forward write could destroy | The spare room is in the wrong place for a backward walk, or `m ≪ n` |
| Backward two pointers | O(m + n) | O(1) | Nothing allocated, every value written once — but only legal because the padding is at the back | The intended answer whenever the free space sits at the end of the destination |

---

## Interview Priority

**Know cold: the backward two-pointer merge, and the forward scratch merge it comes from.** They
are a matched pair, and the interview is about the step between them. Write the forward merge
without thinking — it is the merge step of merge sort and it will come up again in a dozen other
questions — then be able to say in one sentence why it cannot be done in place forwards (`a[0]` is
a live value) and what changes that (the free room is at the back, so walk backwards). Get three
things right under pressure: initialise `write` to `m + n − 1`, guard the comparison with
`i >= 0`, and loop on `j >= 0` rather than on both cursors so the drain case handles itself.
Volunteering the invariant — *the write cursor is always to the right of `a`'s read cursor, and the
gap is the number of `b`'s values already placed* — is what turns a memorised loop into a
demonstrated one, and it is the thing an interviewer will push on.

**Understand but do not drill: append-and-sort, insert-one-at-a-time, and the prefix copy.**
Append-and-sort is worth thirty seconds at the start as the honest baseline and is genuinely what
you would ship for small inputs; naming it and then naming what it wastes shows judgement rather
than ignorance. Insert-one-at-a-time is worth knowing only so you can recognise it as insertion
sort's inner step and say why it is quadratic. The prefix copy is the most interesting of the
three, because it is the answer to the follow-up "what if the spare room were at the *front*
instead?" — at which point the backward walk stops working and `O(m)` extra memory becomes the
real floor.

---

## Full Runnable Script

All five approaches in one file, checked against the statement's three examples, the smallest legal
inputs (`m + n = 1`, in both the `m = 0` and the `n = 0` shapes), the all-of-`b`-is-smaller case
that exercises `a`'s leftover tail, the all-of-`b`-is-larger case where `a` never moves, an
all-ties case, negatives, and a randomised stress test against an independent oracle that ignores
in-place-ness entirely and just sorts the union.

Here the answer really is the whole array — `a` has exactly `m + n` slots and every one of them is
specified once the merge is done — so unlike the compaction problems in this family there is no
unspecified tail to avoid comparing. Each approach still gets its **own copy** of `a`, because
every one of them writes into it.

```python
"""Merge the Second Array Into the First - every approach in one file, cross-checked.

Run: python merge_sorted_array.py

Here the answer really is the whole array: a has exactly m + n slots and all of
them are specified once the merge is done, so there is no unspecified tail to
avoid looking at. Each approach still gets its OWN copy of a, because every one
of them writes into it.
"""

from __future__ import annotations

import random
from typing import Callable


# ---------------------------------------- approach 1: insert one at a time, O(n(m+n))
def merge_sorted_array_insert_one_at_a_time(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    live = m  # how many real values a currently holds
    for j in range(n):
        at = 0
        while at < live and a[at] <= b[j]:
            at += 1
        for k in range(live, at, -1):  # open a gap by sliding the tail right
            a[k] = a[k - 1]
        a[at] = b[j]
        live += 1
    return a


# ------------------------------------- approach 2: append and sort, O((m+n) log(m+n))
def merge_sorted_array_append_and_sort(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    for j in range(n):
        a[m + j] = b[j]
    a.sort()
    return a


# ------------------------------------ approach 3: forward merge into scratch, O(m+n)
def merge_sorted_array_scratch_merge(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    out = [0] * (m + n)
    i, j = 0, 0
    for w in range(m + n):
        if j >= n or (i < m and a[i] <= b[j]):
            out[w] = a[i]
            i += 1
        else:
            out[w] = b[j]
            j += 1
    for w in range(m + n):
        a[w] = out[w]
    return a


# ------------------------------------------ approach 4: copy only a's prefix, O(m)
def merge_sorted_array_copy_prefix(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    left = a[:m]  # only a's live values are ever at risk of being overwritten
    i, j = 0, 0
    for w in range(m + n):
        if j >= n or (i < m and left[i] <= b[j]):
            a[w] = left[i]
            i += 1
        else:
            a[w] = b[j]
            j += 1
    return a


# --------------------------------- approach 5: backward two pointers, O(1) space
def merge_sorted_array_backward_two_pointers(
    a: list[int], m: int, b: list[int], n: int
) -> list[int]:
    i, j, write = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and a[i] > b[j]:  # i may be -1 when a is pure padding
            a[write] = a[i]
            i -= 1
        else:
            a[write] = b[j]
            j -= 1
        write -= 1
    return a  # when j runs dry, a[0..i] is already in its final position


Merge = Callable[[list[int], int, list[int], int], list[int]]

APPROACHES: list[tuple[str, Merge]] = [
    ("insert one at a time", merge_sorted_array_insert_one_at_a_time),
    ("append and sort", merge_sorted_array_append_and_sort),
    ("scratch merge", merge_sorted_array_scratch_merge),
    ("copy a's prefix", merge_sorted_array_copy_prefix),
    ("backward pointers", merge_sorted_array_backward_two_pointers),
]


def reference(a: list[int], m: int, b: list[int], n: int) -> list[int]:
    """Independent oracle: forget in-place entirely and just sort the union."""
    return sorted(a[:m] + b[:n])


def run_case(label: str, a: list[int], m: int, b: list[int], n: int) -> bool:
    expected = reference(a, m, b, n)
    results = [(name, fn(list(a), m, list(b), n)) for name, fn in APPROACHES]
    agree = all(r == expected for _, r in results)
    print(f"{label}")
    print(f"  a={a} m={m} b={b} n={n}")
    for name, r in results:
        print(f"    {name:<21} -> {r}")
    print(f"    expected              -> {expected}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True
    ok &= run_case("example 1 / the doc's worked example",
                   [1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3)
    ok &= run_case("example 2 - nothing to merge, loop must not run",
                   [1], 1, [], 0)
    ok &= run_case("example 3 - a is pure padding, i starts at -1",
                   [0], 0, [1], 1)
    ok &= run_case("all of b is SMALLER - exercises a's leftover tail",
                   [4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3)
    ok &= run_case("all of b is LARGER - a never moves",
                   [1, 2, 3, 0, 0, 0], 3, [7, 8, 9], 3)
    ok &= run_case("ties everywhere - equal values are interchangeable",
                   [2, 2, 2, 0, 0, 0], 3, [2, 2, 2], 3)
    ok &= run_case("interleaved one for one",
                   [1, 3, 5, 0, 0, 0], 3, [2, 4, 6], 3)
    ok &= run_case("negative and large values",
                   [-10, 0, 0, 0], 1, [-99, 7, 100], 3)
    ok &= run_case("b has a single value that lands in the middle",
                   [1, 9, 0], 2, [5], 1)

    random.seed(3)
    for _ in range(3000):
        m = random.randint(0, 8)
        n = random.randint(0, 8)
        if m + n == 0:  # the constraints require at least one value
            continue
        left = sorted(random.randint(-5, 5) for _ in range(m))
        b = sorted(random.randint(-5, 5) for _ in range(n))
        a = left + [0] * n
        expected = reference(a, m, b, n)
        for name, fn in APPROACHES:
            got = fn(list(a), m, list(b), n)
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} a={a} m={m} b={b} n={n} "
                      f"-> {got} != {expected}")
    print("stress: 3000 random (a, m, b, n) with m, n in 0..8, "
          "all five approaches vs the oracle")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok
          else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()
```

### Output when run

```
example 1 / the doc's worked example
  a=[1, 2, 3, 0, 0, 0] m=3 b=[2, 5, 6] n=3
    insert one at a time  -> [1, 2, 2, 3, 5, 6]
    append and sort       -> [1, 2, 2, 3, 5, 6]
    scratch merge         -> [1, 2, 2, 3, 5, 6]
    copy a's prefix       -> [1, 2, 2, 3, 5, 6]
    backward pointers     -> [1, 2, 2, 3, 5, 6]
    expected              -> [1, 2, 2, 3, 5, 6]
    all agree: True
example 2 - nothing to merge, loop must not run
  a=[1] m=1 b=[] n=0
    insert one at a time  -> [1]
    append and sort       -> [1]
    scratch merge         -> [1]
    copy a's prefix       -> [1]
    backward pointers     -> [1]
    expected              -> [1]
    all agree: True
example 3 - a is pure padding, i starts at -1
  a=[0] m=0 b=[1] n=1
    insert one at a time  -> [1]
    append and sort       -> [1]
    scratch merge         -> [1]
    copy a's prefix       -> [1]
    backward pointers     -> [1]
    expected              -> [1]
    all agree: True
all of b is SMALLER - exercises a's leftover tail
  a=[4, 5, 6, 0, 0, 0] m=3 b=[1, 2, 3] n=3
    insert one at a time  -> [1, 2, 3, 4, 5, 6]
    append and sort       -> [1, 2, 3, 4, 5, 6]
    scratch merge         -> [1, 2, 3, 4, 5, 6]
    copy a's prefix       -> [1, 2, 3, 4, 5, 6]
    backward pointers     -> [1, 2, 3, 4, 5, 6]
    expected              -> [1, 2, 3, 4, 5, 6]
    all agree: True
all of b is LARGER - a never moves
  a=[1, 2, 3, 0, 0, 0] m=3 b=[7, 8, 9] n=3
    insert one at a time  -> [1, 2, 3, 7, 8, 9]
    append and sort       -> [1, 2, 3, 7, 8, 9]
    scratch merge         -> [1, 2, 3, 7, 8, 9]
    copy a's prefix       -> [1, 2, 3, 7, 8, 9]
    backward pointers     -> [1, 2, 3, 7, 8, 9]
    expected              -> [1, 2, 3, 7, 8, 9]
    all agree: True
ties everywhere - equal values are interchangeable
  a=[2, 2, 2, 0, 0, 0] m=3 b=[2, 2, 2] n=3
    insert one at a time  -> [2, 2, 2, 2, 2, 2]
    append and sort       -> [2, 2, 2, 2, 2, 2]
    scratch merge         -> [2, 2, 2, 2, 2, 2]
    copy a's prefix       -> [2, 2, 2, 2, 2, 2]
    backward pointers     -> [2, 2, 2, 2, 2, 2]
    expected              -> [2, 2, 2, 2, 2, 2]
    all agree: True
interleaved one for one
  a=[1, 3, 5, 0, 0, 0] m=3 b=[2, 4, 6] n=3
    insert one at a time  -> [1, 2, 3, 4, 5, 6]
    append and sort       -> [1, 2, 3, 4, 5, 6]
    scratch merge         -> [1, 2, 3, 4, 5, 6]
    copy a's prefix       -> [1, 2, 3, 4, 5, 6]
    backward pointers     -> [1, 2, 3, 4, 5, 6]
    expected              -> [1, 2, 3, 4, 5, 6]
    all agree: True
negative and large values
  a=[-10, 0, 0, 0] m=1 b=[-99, 7, 100] n=3
    insert one at a time  -> [-99, -10, 7, 100]
    append and sort       -> [-99, -10, 7, 100]
    scratch merge         -> [-99, -10, 7, 100]
    copy a's prefix       -> [-99, -10, 7, 100]
    backward pointers     -> [-99, -10, 7, 100]
    expected              -> [-99, -10, 7, 100]
    all agree: True
b has a single value that lands in the middle
  a=[1, 9, 0] m=2 b=[5] n=1
    insert one at a time  -> [1, 5, 9]
    append and sort       -> [1, 5, 9]
    scratch merge         -> [1, 5, 9]
    copy a's prefix       -> [1, 5, 9]
    backward pointers     -> [1, 5, 9]
    expected              -> [1, 5, 9]
    all agree: True
stress: 3000 random (a, m, b, n) with m, n in 0..8, all five approaches vs the oracle

ALL APPROACHES AGREED ON EVERY CASE.
```
