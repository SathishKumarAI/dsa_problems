# Sort Three Colours In Place — explained

## Understanding the Problem

You are handed an array in which every entry is a `0`, a `1` or a `2` — nothing else ever appears.
Rearrange it so that all the zeroes come first, then all the ones, then all the twos. You must do
it inside the array you were given, and you must do it in a single pass: each element gets looked
at a constant number of times, not a logarithmic number.

**The core question is: for each element, which of the three regions does it belong to, and how do
I get it there without disturbing the elements already placed?** The naive approach — hand the
array to a general-purpose sort — is slow because a comparison sort has to be prepared for any
ordering relation at all, so it pays O(n log n) comparisons to discover an ordering that you were
*told in advance*: there are three values and you already know which comes first.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| `1 <= nums.length <= 300` | Tiny. Honestly, at n = 300 every approach on this page finishes instantly, and the problem is not really about speed — it is about the technique. It also means the array is never empty, so `nums[0]` always exists. |
| **`nums[i]` is `0`, `1` or `2` — three values, known in advance** | The load-bearing constraint. A fixed, tiny, *known* alphabet is what makes counting work at all (three counters, not a dictionary) and it is what makes the one-pass version work: with three values there are exactly three regions, so three boundary indices are enough to describe the entire state of the array mid-walk. |
| **The rearrangement must happen in place** | This one is a constraint on the **answer**, not on the input, and the distinction is worth making because it changes what you are allowed to do rather than what you are given. The input is an ordinary array; nothing about it forbids building a second one. What is forbidden is *delivering* the answer as a fresh array — the caller holds a reference to the original and expects to see it reordered. So an approach is disqualified not for being slow but for producing its answer in the wrong place. |
| One pass: each element examined a constant number of times | This is what separates the two approaches below. Counting reads every element twice — once to count, once to overwrite — and that is the specific thing the famous solution removes. |

That third row is the one people skim past. "In place" does not mean "you may not use an extra
variable"; it means the result must end up in the caller's own array. Counting-and-rewriting
satisfies it (it writes back into `nums`), so it is a legal answer — it just reads the array twice
and, as the next section shows, has a property that quietly disqualifies it for a whole class of
real uses.

---

## Approach 1 — Count, then rewrite

### The idea

*I know the array holds only three distinct values, and I know the order they should appear in. Do
I actually need to compare anything?* No. Count how many zeroes there are, how many ones and how
many twos. Then walk the array from the front, writing that many zeroes, then that many ones, then
that many twos. No comparison sort, no ordering to discover — the answer is fully determined by
three numbers.

### How to think about it

Imagine sorting a pile of red, white and blue poker chips by *not* sorting them at all: you count
the pile, note "eleven red, six white, nine blue", sweep the whole pile off the table, and then lay
out eleven red chips, six white, nine blue from a fresh supply. The result is correct and the
method is almost embarrassingly simple. The thing to notice — and it is the reason this approach is
not the end of the story — is that **you did not move the original chips; you replaced them.** With
plain integers those are indistinguishable. With anything that carries a payload, they are not.

### Worked example

Input: `nums = [2, 0, 2, 1, 1, 0]` — the statement's own example, and the same input traced through
both approaches in this document.

**Pass one — count:**

| Reading index | Value | `counts` after this step |
|---|---|---|
| 0 | 2 | `[0, 0, 1]` |
| 1 | 0 | `[1, 0, 1]` |
| 2 | 2 | `[1, 0, 2]` |
| 3 | 1 | `[1, 1, 2]` |
| 4 | 1 | `[1, 2, 2]` |
| 5 | 0 | `[2, 2, 2]` |

**Pass two — rewrite from the front, using `at` as the write cursor:**

| Write | Value written | `at` after | Array state |
|---|---|---|---|
| — | — | 0 | `[2, 0, 2, 1, 1, 0]` |
| `nums[0] = 0` | 0 | 1 | `[0, 0, 2, 1, 1, 0]` |
| `nums[1] = 0` | 0 | 2 | `[0, 0, 2, 1, 1, 0]` |
| `nums[2] = 1` | 1 | 3 | `[0, 0, 1, 1, 1, 0]` |
| `nums[3] = 1` | 1 | 4 | `[0, 0, 1, 1, 1, 0]` |
| `nums[4] = 2` | 2 | 5 | `[0, 0, 1, 1, 2, 0]` |
| `nums[5] = 2` | 2 | 6 | `[0, 0, 1, 1, 2, 2]` |

Twelve array accesses in total: six reads and six writes. Note the second and fourth rows, where
the array does not visibly change — the value being written happens to equal the value already
there, and the code has no idea. Every slot is overwritten unconditionally.

### Code

```python
def sort_colors_count_then_rewrite(nums: list[int]) -> list[int]:
    counts = [0, 0, 0]
    for x in nums:
        counts[x] += 1  # the value IS the index: no branching, no comparison
    at = 0
    for value in range(3):
        for _ in range(counts[value]):
            nums[at] = value  # writes a fresh value, does not move the original element
            at += 1
    return nums
```

### Common mistake

Building and returning a new list instead of writing back — `return [0] * counts[0] + [1] * counts[1] + [2] * counts[2]`.
It produces exactly the right sequence and it fails the problem, because the caller is holding the
original array and will see it unchanged. This is the in-place requirement biting: the answer is
correct but delivered to the wrong address. The fix is the explicit `nums[at] = value` write loop,
which puts the result where the caller is looking.

The second, subtler version of the same misunderstanding: a counting rewrite is only valid when the
elements are *interchangeable*. If the array held objects that happen to have a colour field —
`Ball(colour=0, id="a7")` — then writing `nums[at] = 0` would destroy `id="a7"` and replace it with
a bare zero. Counting sorts the *values*; it does not sort the *elements*. Nothing in this
problem's statement exposes the difference, which is exactly why it is easy to carry the habit into
a problem where it matters.

### Complexity and when to use this

**Time O(n), space O(1).** Two linear passes: one read pass to count, one write pass to fill, so
2n array accesses. The space is three counters, and — crucially — three is a constant *because the
alphabet is fixed at three values*. Generalised to k distinct values it is O(k), which is still
O(1) whenever k is bounded, and this is the shape of counting sort in general.

Use it when the elements are genuinely interchangeable (plain numbers, enum tags, bytes), when two
passes over the data are free, or when you want something you can write correctly in thirty seconds
and be certain about. It is also the right *starting* answer in an interview: it is linear, it beats
the library sort, and it sets up the question "can you do it in one pass?" which is what the
interviewer is waiting for.

---

## Approach 2 — Dutch national flag, three pointers (optimal)

### The idea

*Counting is linear, so what is left to improve?* Two things. It reads the array twice, and it
produces the answer by overwriting rather than moving — so it cannot be used when the elements
carry anything beyond their colour. *Can I place every element correctly while seeing it only
once?* Yes, if instead of counting you carve the array into three growing regions and, for each
element you examine, immediately swap it into the region where it belongs. This fixes both of the
previous approach's weaknesses at once: one pass, and every element that ends up somewhere is the
*original* element, moved, not a replacement written on top of it.

### How to think about it

Picture three regions growing from both ends and the middle. A settled block of zeroes grows
rightward from the left edge. A settled block of twos grows leftward from the right edge. Between
them sits a block of settled ones, and beyond that — squeezed between the ones and the twos — is
the shrinking region of elements nobody has looked at yet. A cursor sits at the front of that
unknown region and picks up one element at a time: a zero gets thrown down to the left block, a two
gets thrown up to the right block, and a one is already exactly where it should be. Every step
shrinks the unknown region by one, so the whole thing finishes when the unknown region is empty.

### The invariant, in prose

This is the part that has to be said in words, because the code is four lines and the reason it
works is not visible in them. Three indices — `low`, `mid`, `high` — divide the array into four
stretches, and at every single moment of the loop, all four of these statements are true:

- **Everything before `low` is a `0`.** Indices `0 .. low-1` are settled zeroes and will never be
  touched again.
- **Everything from `low` up to but not including `mid` is a `1`.** These are settled ones. This
  stretch can be empty, and at the start it is.
- **Everything from `mid` to `high` is unexamined.** Nobody has looked at these yet. This is the
  region that shrinks.
- **Everything after `high` is a `2`.** Indices `high+1 .. n-1` are settled twos and will never be
  touched again.

Read that as one sentence: *everything before `low` is 0, everything after `high` is 2, and
everything between `low` and the cursor is 1.* When the cursor `mid` finally passes `high`, the
unexamined stretch is empty, and the three remaining stretches — zeroes, ones, twos, in that order —
are the whole array. That is the proof of correctness; there is nothing else to it.

Now the part that actually catches people, and it follows directly from the invariant:

**A swap with the HIGH side brings in an unexamined value, so the cursor must not advance. A swap
with the LOW side does not, so it must.**

Here is why, in each direction.

*When `nums[mid]` is a `2`:* it is swapped with `nums[high]`. What was sitting at `high`? By the
invariant, index `high` is in the unexamined stretch — it is the last element nobody has looked at.
So the swap hands the cursor a value of completely unknown colour. It might be a `0`, which needs
throwing to the far left. If the cursor advanced, that `0` would be left stranded in the middle
region, which the invariant claims holds only ones — and the invariant would be false. So `high`
retreats (the twos block has grown by one) and `mid` stays exactly where it is, to examine the
newcomer on the next iteration.

*When `nums[mid]` is a `0`:* it is swapped with `nums[low]`. What was sitting at `low`? By the
invariant, index `low` is the first element of the *settled ones* stretch — something already
examined and known to be a `1`. (And if the ones stretch is empty, then `low == mid` and the swap
is an element with itself, which is a no-op on a value the cursor just examined.) Either way, the
value arriving at `mid` is one the walk has already classified. There is nothing left to learn
about it, so `mid` advances along with `low`.

That asymmetry is the entire exercise. It is not a trick or an off-by-one to memorise; it is a
direct consequence of *which side of the array still contains unknowns*. The `high` side does. The
`low` side does not.

One more consequence worth naming: the loop condition is `mid <= high`, not `mid < high`. When
`mid == high` there is still exactly one unexamined element — the one they are both pointing at —
and it must be classified. Using `<` leaves that last element wherever it happened to land, which
is wrong on any input ending in an unplaced value.

### Worked example

Input: `nums = [2, 0, 2, 1, 1, 0]` — the same array approach 1 rewrote.

Start: `low = 0`, `mid = 0`, `high = 5`, array `[2, 0, 2, 1, 1, 0]`.

| Step | `nums[mid]` | Action | `low` | `mid` | `high` | Array after |
|---|---|---|---|---|---|---|
| 1 | `2` (at index 0) | swap indices 0 and 5; `high` retreats; **`mid` stays** | 0 | 0 | 4 | `[0, 0, 2, 1, 1, 2]` |
| 2 | `0` (at index 0 — the value just swapped in) | swap indices 0 and 0 (a no-op); both advance | 1 | 1 | 4 | `[0, 0, 2, 1, 1, 2]` |
| 3 | `0` (at index 1) | swap indices 1 and 1 (a no-op); both advance | 2 | 2 | 4 | `[0, 0, 2, 1, 1, 2]` |
| 4 | `2` (at index 2) | swap indices 2 and 4; `high` retreats; **`mid` stays** | 2 | 2 | 3 | `[0, 0, 1, 1, 2, 2]` |
| 5 | `1` (at index 2 — swapped in from index 4) | already correct; only `mid` advances | 2 | 3 | 3 | `[0, 0, 1, 1, 2, 2]` |
| 6 | `1` (at index 3) | already correct; only `mid` advances | 2 | 4 | 3 | `[0, 0, 1, 1, 2, 2]` |
| end | — | `mid = 4 > high = 3`, loop ends | 2 | 4 | 3 | `[0, 0, 1, 1, 2, 2]` |

Six iterations for six elements — exactly one pass, which is the claim. And steps 1 → 2 are the
asymmetry made concrete: step 1 swapped a `2` out to the back and got a `0` in return, and because
`mid` did not advance, step 2 immediately caught that `0` and sent it to the front. Had `mid`
advanced at step 1, the array would have been left as `[0, 0, 2, 1, 1, 2]` with a stranded zero at
index 0 that never gets claimed by the zeroes region — and the final answer would have been
`[0, 0, 1, 1, 2, 2]` only by luck of this particular input. Try it on `[2, 0]`: with the wrong
advance, step 1 swaps to `[0, 2]` and moves `mid` to 1, `high` is now 0, the loop ends, and the
answer is `[0, 2]` — which happens to be right. Try `[2, 2, 0]`: the wrong version gives
`[0, 2, 2]`, also right. The bug is genuinely hard to trigger on small inputs, which is why the
stress test at the bottom of this file runs four thousand random arrays rather than four.

Verify the invariant at step 5, where `low = 2`, `mid = 2`, `high = 3`, array `[0, 0, 1, 1, 2, 2]`:
indices `0..1` are zeroes ✓; indices `2..1` (the settled-ones stretch) are empty ✓; indices `2..3`
are unexamined — and they do happen to hold ones, but the algorithm does not know that yet ✓;
indices `4..5` are twos ✓.

### Code

```python
def sort_colors_dutch_flag(nums: list[int]) -> list[int]:
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:  # <= , not < : when they meet there is still one unexamined element
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 2:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1  # mid does NOT advance: the value swapped in is unexamined
        else:
            mid += 1
    return nums
```

### Common mistake

Advancing `mid` after a swap with `high`:

```python
elif nums[mid] == 2:
    nums[mid], nums[high] = nums[high], nums[mid]
    high -= 1
    mid += 1        # WRONG
```

The value that just arrived at `mid` came from the unexamined region and has never been
classified. If it is a `0`, it is now stranded in the middle stretch — which the invariant claims
holds only ones — and nothing will ever move it to the front. On `[2, 0, 2, 1, 1, 0]` the wrong
version returns `[0, 0, 1, 1, 2, 2]` anyway, which is why hand-testing the examples does not catch
it; on `[1, 2, 0]` it returns `[1, 0, 2]`, which is plainly wrong. The rule, stated so it is
memorable: **the cursor advances only when it has finished with the value under it, and after a
high-side swap it has not even started.**

The mirror error — *not* advancing `mid` after a low-side swap — is an infinite loop rather than a
wrong answer, because the same zero gets swapped with itself forever once `low == mid`.

### Complexity and when to use this

**Time O(n), space O(1).** Every iteration of the loop either advances `mid` or retreats `high`, and
the two can only move toward each other, so the loop body runs at most n times — one pass, with a
constant number of array accesses per element. Space is three integers; the swaps happen inside the
caller's array.

This is the right choice when you need a genuine single pass, when the data is large enough that
two traversals cost real cache time, or — the case that actually matters outside interviews — when
the elements carry a payload and must be *moved* rather than *rewritten*. It is also the routine
that makes quicksort robust: a three-way partition on the pivot (`< pivot`, `== pivot`, `> pivot`)
is exactly this loop, and it is what stops quicksort degrading to quadratic time on arrays with
many equal keys. Learning it here, on an array of three colours, is learning it in the easiest
place it ever appears.

---

## The Overall Arc

The principle every step of this problem chases is *use what you were told*. A library sort is the
zero-knowledge answer: it assumes nothing about the values, discovers the ordering by comparison,
and pays O(n log n) for the privilege. But you were handed a fact — there are exactly three
values, and you already know their order — and the counting approach cashes that in immediately,
dropping to two linear passes with three counters, because when the alphabet is known there is
nothing left to *discover*, only to tally. That would be the end of it, except counting quietly
changes what an element *is*: it does not move your zeroes and twos anywhere, it overwrites every
slot with a freshly minted value, which is invisible for plain integers and destructive the moment
an element carries anything else. The Dutch-national-flag partition fixes that and the second pass
together, and the way it does so is the actual lesson: instead of collecting global knowledge first
and applying it second, it maintains a *local promise about the array's shape* that stays true after
every single step — everything before `low` is a zero, everything after `high` is a two, everything
between `low` and the cursor is a one, everything between the cursor and `high` is still unknown.
Correctness stops being an argument about totals and becomes an argument about one step: show that
each of the three cases preserves the promise, show that the unknown region shrinks every time, and
the algorithm is proved. That is also where the famous asymmetry comes from — swapping toward the
`high` side reaches into the unknown region and hands you back something unclassified, so the
cursor must stay and look; swapping toward the `low` side reaches into already-settled ground, so
the cursor may move on. Nothing about that is a trick to memorise; it falls straight out of asking
*which side still has unknowns in it*. And the payoff extends well past three colours: the same
loop, with the three cases rewritten as `< pivot`, `== pivot`, `> pivot`, is the three-way partition
that keeps quicksort linear-ish on arrays full of duplicate keys — which is the single most common
place a textbook quicksort falls over in production.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Count, then rewrite | O(n), two passes | O(1) — three counters | Trivially correct and impossible to get subtly wrong, but reads the array twice and *replaces* elements rather than moving them | Elements are plain interchangeable values, two passes are free, and you want certainty fast — also the right opening answer in an interview |
| Dutch national flag | O(n), one pass | O(1) — three indices | One pass and every element genuinely moved, at the cost of an invariant you must state correctly and an asymmetric cursor rule | A true single pass is required, elements carry a payload, or you want the three-way partition that hardens quicksort against duplicate keys |

---

## Interview Priority

**Know cold: the Dutch national flag partition.** This is the reason the problem is asked. Write
the loop without hesitating, use `mid <= high` rather than `<`, and — this is what actually
separates candidates — be able to *say the invariant out loud* before you write a line: everything
before `low` is a zero, everything after `high` is a two, everything between `low` and `mid` is a
one, everything between `mid` and `high` is unexamined. Then explain the asymmetry in one sentence
("a high-side swap pulls in an element from the unexamined region, so the cursor has to look at it;
a low-side swap pulls in one already classified, so it does not"). An interviewer who hears the
invariant knows you can re-derive the code; one who only sees the code cannot tell whether you
re-derived it or remembered it.

**Know cold: count, then rewrite.** Not because it is hard, but because leading with it is the
right move. It takes twenty seconds, it is already linear, and it makes the follow-up — "now do it
in one pass" — the natural next thing to say rather than a challenge you got caught by. Be ready
for the reason it is not the final answer: it overwrites instead of moving, which breaks the moment
elements carry a payload.

**Understand but do not drill: the library sort.** `nums.sort()` is worth exactly one sentence,
said out loud and immediately rejected — "that is O(n log n) and it throws away the fact that there
are only three values". It is the baseline that makes everything after it look like a decision.

---

## Full Runnable Script

Every approach in one file, checked against both statement examples, the smallest legal input,
all-one-value cases, an array with no ones at all, an already-sorted array, an exactly-reversed
array, and a randomised stress test cross-checked against Python's `sorted()` — which is a valid
oracle here precisely because the values are plain integers.

**Both approaches mutate the list they are given**, so every call below is handed its own `list(nums)`
copy. Without that, the first approach would sort the array and the second would be handed an
already-sorted array, so the cross-check would be comparing corrupted inputs and would pass no
matter how broken the code was.

```python
"""Sort Three Colours In Place — every approach in one file, cross-checked.

Both approaches MUTATE the list they are handed, so every call below gets its own
copy; sharing one list would make the cross-check compare already-corrupted arrays.

Run: python sort_colors.py
"""

from __future__ import annotations

import random
from typing import Callable


def sort_colors_count_then_rewrite(nums: list[int]) -> list[int]:
    counts = [0, 0, 0]
    for x in nums:
        counts[x] += 1
    at = 0
    for value in range(3):
        for _ in range(counts[value]):
            nums[at] = value  # writes a fresh value, does not move the original element
            at += 1
    return nums


def sort_colors_dutch_flag(nums: list[int]) -> list[int]:
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 2:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1  # mid does NOT advance: the value swapped in is unexamined
        else:
            mid += 1
    return nums


APPROACHES: list[tuple[str, Callable[[list[int]], list[int]]]] = [
    ("count then rewrite", sort_colors_count_then_rewrite),
    ("dutch flag", sort_colors_dutch_flag),
]


def run_case(label: str, nums: list[int]) -> bool:
    expected = sorted(nums)  # the oracle: three values, so a plain sort is the answer
    results = [(name, fn(list(nums))) for name, fn in APPROACHES]
    agree = all(r == expected for _, r in results)
    print(label)
    print(f"  nums={nums}")
    for name, r in results:
        print(f"    {name:<20} -> {r}")
    print(f"    reference={expected}  all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    ok &= run_case("example from the statement", [2, 0, 2, 1, 1, 0])
    ok &= run_case("second example from the statement", [2, 0, 1])
    ok &= run_case("smallest legal input (n = 1)", [1])
    ok &= run_case("smallest legal input, a lone 2", [2])
    ok &= run_case("all one value", [1, 1, 1, 1, 1])
    ok &= run_case("all one value, all twos", [2, 2, 2])
    ok &= run_case("heavy duplicates, no ones at all", [2, 0, 0, 2, 2, 0])
    ok &= run_case("already sorted", [0, 0, 1, 1, 2, 2])
    ok &= run_case("exactly reversed", [2, 2, 1, 1, 0, 0])

    random.seed(3)
    mismatches = 0
    for _ in range(4000):
        nums = [random.randint(0, 2) for _ in range(random.randint(1, 30))]
        expected = sorted(nums)
        for name, fn in APPROACHES:
            got = fn(list(nums))  # fresh copy per approach
            if got != expected:
                mismatches += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} got={got} want={expected}")
    print(f"stress: 4000 random arrays of 0/1/2 vs sorted(), {mismatches} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()
```

### Output when run

```
example from the statement
  nums=[2, 0, 2, 1, 1, 0]
    count then rewrite   -> [0, 0, 1, 1, 2, 2]
    dutch flag           -> [0, 0, 1, 1, 2, 2]
    reference=[0, 0, 1, 1, 2, 2]  all agree: True
second example from the statement
  nums=[2, 0, 1]
    count then rewrite   -> [0, 1, 2]
    dutch flag           -> [0, 1, 2]
    reference=[0, 1, 2]  all agree: True
smallest legal input (n = 1)
  nums=[1]
    count then rewrite   -> [1]
    dutch flag           -> [1]
    reference=[1]  all agree: True
smallest legal input, a lone 2
  nums=[2]
    count then rewrite   -> [2]
    dutch flag           -> [2]
    reference=[2]  all agree: True
all one value
  nums=[1, 1, 1, 1, 1]
    count then rewrite   -> [1, 1, 1, 1, 1]
    dutch flag           -> [1, 1, 1, 1, 1]
    reference=[1, 1, 1, 1, 1]  all agree: True
all one value, all twos
  nums=[2, 2, 2]
    count then rewrite   -> [2, 2, 2]
    dutch flag           -> [2, 2, 2]
    reference=[2, 2, 2]  all agree: True
heavy duplicates, no ones at all
  nums=[2, 0, 0, 2, 2, 0]
    count then rewrite   -> [0, 0, 0, 2, 2, 2]
    dutch flag           -> [0, 0, 0, 2, 2, 2]
    reference=[0, 0, 0, 2, 2, 2]  all agree: True
already sorted
  nums=[0, 0, 1, 1, 2, 2]
    count then rewrite   -> [0, 0, 1, 1, 2, 2]
    dutch flag           -> [0, 0, 1, 1, 2, 2]
    reference=[0, 0, 1, 1, 2, 2]  all agree: True
exactly reversed
  nums=[2, 2, 1, 1, 0, 0]
    count then rewrite   -> [0, 0, 1, 1, 2, 2]
    dutch flag           -> [0, 0, 1, 1, 2, 2]
    reference=[0, 0, 1, 1, 2, 2]  all agree: True
stress: 4000 random arrays of 0/1/2 vs sorted(), 0 disagreements

ALL APPROACHES AGREED ON EVERY CASE.
```
