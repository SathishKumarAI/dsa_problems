# Rotate the Array by k — explained

## Understanding the Problem

You have a row of values and you must slide every one of them `k` places to the right. There is no
spare room on the right, so whatever falls off the end reappears at the front — a conveyor belt
joined into a loop. `[1, 2, 3, 4, 5, 6, 7]` rotated by 3 becomes `[5, 6, 7, 1, 2, 3, 4]`: the last
three came around to the front and everything else shifted right to make room. The follow-up adds the
real difficulty — do it **in place**, with no second array the size of the input.

**The core question:** where does each value end up, and can you put it there without needing
somewhere to park the value it displaces? The naive approach is slow because it reads "move right by
`k`" as "move right by one, `k` times", redoing the whole array for each step — and `k` can be
100,000 on an array of 100,000, which is ten billion writes.

Before any of that there is a reduction that is not optional.

> **Watch out.** The thought to correct first is *"`k` is just the number of places, I will worry
> about big `k` later."* Rotating by `n` puts every value back where it started, so rotating by `k`
> and rotating by `k % n` are the **same operation**. Reducing `k` first is the opening line of four
> of the five rungs below, and skipping it does not merely slow things down — depending on the rung
> it spins pointless full turns, silently returns the input unchanged, or indexes off the end. All
> three are measured in the sections that follow.

### The constraints, and what each one unlocks

| Constraint | What it unlocks, or forbids |
|---|---|
| `1 <= nums.length <= 10^5` | Never empty, so `n` is never 0 and `k % n` never divides by zero. But 10⁵ **kills any `O(n · k)` approach**: with `k` also at 10⁵ that is 10¹⁰ writes, minutes rather than milliseconds. This is what rules out Approach 1. |
| `-2^31 <= nums[i] <= 2^31 - 1` | Values may be negative and fill a signed 32-bit int. Nothing here sums values, so there is no overflow risk — but **every bit pattern is a legal value**, so there is no spare number to use as a "this slot has been moved" marker. That is why Approach 4 counts moves instead of marking slots. |
| `0 <= k <= 10^5`, and `k` may exceed the length | The permission slip for `k % n`, and the trap if you skip it. `k = 0` must work, `k = n` must work, `k > n` must work. |
| the rotation is to the **right**: `nums[i]` ends at `(i + k) % n` | Fixes the direction. `(i - k) % n` where `(i + k) % n` belongs rotates the wrong way — and still passes on a symmetric input, measured below. |
| in place, constant extra memory (the follow-up) | **This forbids Approaches 2 and 3.** Both are correct; both allocate a second array of `n` values. It is what makes the cyclic walk and the three reversals worth knowing at all. |

Note what is *absent*: nothing says the values are distinct. `[1, 1, 2, 2, 1, 1]` is legal, so any
approach that identifies a slot by the value sitting in it is wrong.

The worked example used in every section below is the statement's own:

```
nums = [1, 2, 3, 4, 5, 6, 7], k = 3        answer: [5, 6, 7, 1, 2, 3, 4]
```

### Shared scaffolding

One primitive recurs, so it is lifted to a single named helper rather than written inline three
times inside Approach 5.

```python
def reverse_span(nums: list[int], lo: int, hi: int) -> None:
    """Reverse nums[lo..hi] in place. Empty or single-element spans do nothing."""
    while lo < hi:
        nums[lo], nums[hi] = nums[hi], nums[lo]
        lo += 1
        hi -= 1
```

---

## Approach 1 — One step at a time

### The idea

*What does "rotate by `k`" mean if you only know how to rotate by one?* Rotating by one is easy: take
the last value out, slide everything right by a single slot, drop the saved value into the front. Do
that `k` times. No index arithmetic, no wraparound formula, nothing to get backwards.

### How to think about it

> **Intuition.** A line of people passing a parcel. Each round, the person at the end steps out
> holding their value, everyone else shuffles one place right, and the one who stepped out rejoins at
> the front. One round is an obviously-correct rotation by one, and `k` rounds is a rotation by `k`
> because rotations **compose**. That composition argument is the whole method, which is why it needs
> no insight — and it is also why it is slow: the value destined for slot 6 is dragged through slots
> 0 to 5 on the way there.

### Worked example

`nums = [1, 2, 3, 4, 5, 6, 7]`, `k = 3`, so `k % n = 3` and there are three rounds.

| round | value saved from the end | array after the shift and the drop |
|---|---|---|
| start | — | `[1, 2, 3, 4, 5, 6, 7]` |
| 1 | `7` | `[7, 1, 2, 3, 4, 5, 6]` |
| 2 | `6` | `[6, 7, 1, 2, 3, 4, 5]` |
| 3 | `5` | `[5, 6, 7, 1, 2, 3, 4]` |

Three rounds × seven slots = **21 writes** to move seven values. Watch the value `1`: it was written
at index 1, index 2 and index 3, and only the last was its destination.

### Code

```python
def rotate_array_one_step(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    for _ in range(k % n):  # k % n first, or a huge k repeats whole turns for nothing
        last = nums[n - 1]
        for i in range(n - 1, 0, -1):  # backwards: read every slot before overwriting it
            nums[i] = nums[i - 1]
        nums[0] = last
    return nums
```

### Common mistake

> **Watch out.** The misconception is that "copy each value from its left neighbour" describes the
> shift regardless of which way you walk. It does not. Walking **forwards** overwrites `nums[i]`
> before the next iteration reads it as `nums[i - 1]`, so the first value is smeared across the whole
> array. The rule: when shifting in place, walk **against** the direction of the shift.

Running the inner loop as `for i in range(1, n)` on `[1, 2, 3, 4, 5, 6, 7]` with `k = 3` gives,
measured:

```
[7, 1, 1, 1, 1, 1, 1]
```

A single round already destroys six of the seven values.

The second mistake on this rung is dropping `% n` from `range(k % n)`. It corrupts nothing — it just
performs `k // n` complete turns that do nothing, which at `k = 10^5` and `n = 2` is 50,000 wasted
full sweeps.

### Complexity and when to use this

**Time `O(n · k)`, space `O(1)`.** The time comes from the nesting: `k % n` rounds of `n` writes, so
the worst case is `n · (n − 1)` ≈ 10¹⁰ writes at the stated limits. That figure is analytic — the
stress harness runs this rung only at small `n`. Space is constant: one saved value and two counters.

Use it when `k` is known to be 1 or 2 and clarity beats everything. Otherwise it is the thirty-second
opening of an interview answer: state it, name its cost, then observe that a value's destination
never depended on the steps in between. That observation is the next rung.

---

## Approach 2 — Copy into a second array

### The idea

*If every value's final position is known in advance, why walk it there one slot at a time?* The
value at index `i` ends at `(i + k) % n` — that is the specification, written as a formula. Allocate
a second array, write each value straight into its destination, copy back.

This fixes Approach 1's weakness: **it rewrites all `n` values `k` times over**, dragging each value
through every slot between its start and its finish, when one expression names the finish directly.

### How to think about it

> **Intuition.** Stop thinking about sliding and start thinking about **addressing**. A rotation is a
> fixed, known mapping from old position to new. Given a blank array of the same size you never have
> to worry about what is already in a destination slot, because nothing is — so values can be placed
> in any order, in one pass, with no interference. The modulo does one job: turning an address that
> ran off the right end into the equivalent address at the front. The price of that freedom is the
> blank array, which is exactly what the follow-up forbids.

### Worked example

`nums = [1, 2, 3, 4, 5, 6, 7]`, `k = 3`, `n = 7`.

| `i` | `nums[i]` | destination `(i + 3) % 7` | `moved` after this write |
|---|---|---|---|
| 0 | `1` | `3` | `[_, _, _, 1, _, _, _]` |
| 1 | `2` | `4` | `[_, _, _, 1, 2, _, _]` |
| 2 | `3` | `5` | `[_, _, _, 1, 2, 3, _]` |
| 3 | `4` | `6` | `[_, _, _, 1, 2, 3, 4]` |
| 4 | `5` | `0` — wrapped | `[5, _, _, 1, 2, 3, 4]` |
| 5 | `6` | `1` | `[5, 6, _, 1, 2, 3, 4]` |
| 6 | `7` | `2` | `[5, 6, 7, 1, 2, 3, 4]` |

Then copy `moved` back over `nums`. Seven writes plus seven copies, and no value written twice.

### Code

```python
def rotate_array_second_array(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    moved = [0] * n
    for i in range(n):
        moved[(i + k) % n] = nums[i]  # the computed index is a DESTINATION, so it goes left
    for i in range(n):
        nums[i] = moved[i]
    return nums
```

### Common mistake

> **Watch out.** The misconception is that `(i + k) % n` is "the index the rotation pairs with `i`",
> which leaves it ambiguous whether it names a **source** or a **destination**. Both spellings are
> true statements about *some* rotation, so neither looks wrong in isolation. Decide once which it
> is, and say so in the code.

Putting the formula on the right — `moved[i] = nums[(i + k) % n]` — gives, measured on
`[1, 2, 3, 4, 5, 6, 7]` with `k = 3`:

```
[4, 5, 6, 7, 1, 2, 3]
```

That is a rotation **left** by 3. The tell is the first element: a right rotation by 3 must begin
with the value that was 3 from the end, which is `5`, not `4`. On a symmetric input such as
`[1, 1, 2, 2, 1, 1]` it can even produce the right answer by accident.

### Complexity and when to use this

**Time `O(n)`, space `O(n)`.** Time is two independent linear passes with constant work per slot and
no nesting. Space is the full-size scratch array — `n` extra integers, about 400 KB at the stated
limits — and that is the whole of the cost.

Use it when the input must not be mutated and you may return a new array: the copy-back pass then
disappears and this is the cleanest correct solution there is. Use it also when the permutation is
**arbitrary** rather than a rotation, because "write each value to its computed destination in a
blank array" works for any permutation, while both tricks below work only because a rotation has very
particular structure.

---

## Approach 3 — Cut and rejoin

### The idea

*Is a rotation really a per-element computation at all?* No — it is two blocks swapping places. The
last `k` values move to the front as one solid piece, and the first `n − k` follow, unchanged and in
order. Say that directly: take the tail, append the head.

This fixes Approach 2's weakness: **it computes a modular index for every element, and the direction
of the rotation is hidden inside that arithmetic** where it can be written backwards without looking
wrong. Naming the two blocks puts the direction where a reader can see it.

### How to think about it

> **Intuition.** Cutting a deck of cards. You lift the bottom `k` cards and place them on top — that
> is the whole operation, and nobody performing it thinks about an individual card's index. The cut
> point is `n − k`: everything from there to the end is block **A**, everything before it is block
> **B**, and the answer is A then B. Seeing it this way also explains the shape the final rung
> exploits — the answer is two blocks in the wrong order.

### Worked example

`nums = [1, 2, 3, 4, 5, 6, 7]`, `k = 3`, `n = 7`, so the cut is at `n − k = 4`.

| piece | slice | contents |
|---|---|---|
| block **B** — the head | `nums[:4]` | `[1, 2, 3, 4]` |
| block **A** — the last `k` | `nums[4:]` | `[5, 6, 7]` |
| answer, A then B | `nums[4:] + nums[:4]` | `[5, 6, 7, 1, 2, 3, 4]` |

Two bulk copies, no per-element arithmetic, and the answer reads straight off the slice boundaries.

### Code

```python
def rotate_array_cut_and_rejoin(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    nums[:] = nums[n - k:] + nums[: n - k]  # slice-assign so the caller's list changes
    return nums
```

### Common mistake

> **Watch out.** This is the rung where skipping `k %= n` is most dangerous, because Python's slices
> refuse to complain: a negative start counts from the right, and an out-of-range slice is silently
> clamped to empty. The misconception is that an illegal index will announce itself. Here it
> **returns a plausible array instead.**

With `nums = [1, 2]` and `k = 5`, `n - k` is `-3`, so `nums[-3:]` is the whole list and `nums[:-3]`
is empty. Measured:

| input | without `k %= n` | correct |
|---|---|---|
| `[1, 2]`, `k = 5` | `[1, 2]` — completely unrotated | `[2, 1]` |
| `[1, 2, 3, 4, 5, 6, 7]`, `k = 10` | `[5, 6, 7, 1, 2, 3, 4]` | `[5, 6, 7, 1, 2, 3, 4]` — passes |

The second row is the sting: `7 - 10 = -3` happens to name the same cut as `7 - 3`, so the bug is
right for some `k > n` and wrong for others. It will pass your own quick test and fail a hidden one.
In Java or C++ the same omission is an immediate out-of-bounds crash — loud, and much easier to find.

### Complexity and when to use this

**Time `O(n)`, space `O(n)`.** Time is two slice copies plus the slice-assignment back over `nums`,
each linear with a very small constant — in CPython these run in C, so this is by far the fastest of
the five in wall-clock terms. Space is `O(n)`: the concatenation builds a complete new list before
the assignment overwrites the original, so the peak is two full arrays.

Use it in production Python, where it is one readable line and the memory is irrelevant, or in any
language with a slice or `copy` primitive. Do **not** offer it as the answer to the follow-up — it
allocates `n` extra values, which is precisely what "constant extra memory" rules out.

---

## Approach 4 — Cyclic replacements

### The idea

*The copies exist only because a value has nowhere to go when its destination is occupied — what if
you carry the displaced value with you?* Pick up `nums[0]`, put it where it belongs, pick up whatever
was sitting there, and continue. Each chain eventually returns to where it began, and one spare
variable is all the storage you ever need.

This fixes the weakness shared by Approaches 2 and 3: **both allocate a second array the size of the
input**, which the follow-up forbids.

### How to think about it

> **Intuition.** Musical chairs where you are the only person standing. You hold one value, walk to
> the seat it belongs in, tap the occupant, put your value down — and now you are holding *their*
> value, so you walk to where that one belongs. Eventually you arrive back at the chair you emptied
> at the very start, put the last value down, and the **chain** is closed.

> **Why it works.** Stepping repeatedly by `k` around a ring of `n` seats returns to the start after
> `n / gcd(n, k)` steps — that is the smallest number of steps whose total, a multiple of `k`, is also
> a multiple of `n`. So the seats split into exactly **`gcd(n, k)` disjoint chains**, each of that
> length, and one chain visits every seat only when `gcd(n, k) = 1`. This is why the code counts
> values moved rather than trusting a closed chain to mean a finished array, and it is the one fact
> this rung teaches that no other rung shows.

### Worked example

`nums = [1, 2, 3, 4, 5, 6, 7]`, `k = 3`, `n = 7`. Here `gcd(7, 3) = 1`, so there is exactly one chain
and it visits all seven slots. Start at index 0, pick up the `1`.

| step | from `i` | to `j = (i + 3) % 7` | value put down | value picked up | array after | `moved` |
|---|---|---|---|---|---|---|
| 1 | 0 | 3 | `1` | `4` | `[1, 2, 3, 1, 5, 6, 7]` | 1 |
| 2 | 3 | 6 | `4` | `7` | `[1, 2, 3, 1, 5, 6, 4]` | 2 |
| 3 | 6 | 2 | `7` | `3` | `[1, 2, 7, 1, 5, 6, 4]` | 3 |
| 4 | 2 | 5 | `3` | `6` | `[1, 2, 7, 1, 5, 3, 4]` | 4 |
| 5 | 5 | 1 | `6` | `2` | `[1, 6, 7, 1, 5, 3, 4]` | 5 |
| 6 | 1 | 4 | `2` | `5` | `[1, 6, 7, 1, 2, 3, 4]` | 6 |
| 7 | 4 | 0 | `5` | `1` | `[5, 6, 7, 1, 2, 3, 4]` | 7 |

Step 7 lands back on index 0, so the inner loop breaks. `moved` is 7, which equals `n`, so no second
chain starts. Seven writes for seven values, and the only storage used was one `carry`.

Contrast `nums = [1, 2, 3, 4, 5, 6]`, `k = 2`, where `gcd(6, 2) = 2`:

| chain | slots it visits | closes after | `moved` |
|---|---|---|---|
| starting at 0 | 0 → 2 → 4 → 0 | 3 moves | 3 |
| starting at 1 | 1 → 3 → 5 → 1 | 3 moves | 6 = `n`, stop |

### Code

```python
def rotate_array_cyclic(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    moved = 0
    start = 0
    while moved < n:  # the counter restarts the walk for each of gcd(n, k) chains
        i = start
        carry = nums[start]
        while True:
            j = (i + k) % n
            nums[j], carry = carry, nums[j]
            i = j
            moved += 1
            if i == start:
                break
        start += 1
    return nums
```

### Common mistake

> **Watch out.** The misconception is *"the chain returns to the start once every value has been
> placed."* It returns to the start once **its own** cycle is finished, which may be a small fraction
> of the array. Dropping the `moved` counter and the outer loop is the natural thing to do, and on
> the statement's own example the bug is invisible, because `gcd(7, 3) = 1` and the single chain
> really does cover all seven slots.

Measured, on inputs where `n` and `k` share a factor:

| input | single-chain version | correct | chains |
|---|---|---|---|
| `[1, 2, 3, 4, 5, 6]`, `k = 2` | `[5, 2, 1, 4, 3, 6]` | `[5, 6, 1, 2, 3, 4]` | `gcd(6, 2) = 2` |
| `[1, 2, 3, 4, 5, 6, 7, 8]`, `k = 4` | `[5, 2, 3, 4, 1, 6, 7, 8]` | `[5, 6, 7, 8, 1, 2, 3, 4]` | `gcd(8, 4) = 4` |
| `[1, 2, 3, 4, 5, 6, 7]`, `k = 3` | `[5, 6, 7, 1, 2, 3, 4]` | same — **passes** | `gcd(7, 3) = 1` |

In the second row only indices 0 and 4 were touched; the other six values sit exactly where they
started. This is the most instructive bug in the problem, because the failing inputs are the ones a
quick manual test is least likely to choose, and because the fix is not a patch — it is recognising
the cycle decomposition.

Using a sentinel value in the array to mark moved slots is **not** an acceptable alternative fix: the
constraints allow every 32-bit value, so no number is left over to mean "moved".

### Complexity and when to use this

**Time `O(n)`, space `O(1)`.** Every value is picked up once and put down once across all chains —
`moved` reaching `n` is the proof — so it is exactly `n` writes, the theoretical minimum. Space is
one `carry`, one counter and two indices, regardless of `n`.

Use it when you need an in-place rotation and writes are genuinely the bottleneck; this is the only
rung that touches each slot once. Use it also when the permutation is a known bijection but **not** a
rotation, because cycle-following generalises and the reversal trick does not. But be honest about
the cost: the `gcd` reasoning is what people get wrong under pressure, and the next rung arrives at
the same place with nothing to count.

---

## Approach 5 — Three reversals (optimal)

### The idea

*Cut-and-rejoin already said the answer is two blocks that swapped places — can two blocks be swapped
in place?* They can, with one primitive. Reverse the whole array: the tail block is now at the front
and the head at the back, each written backwards. Reverse each block where it now sits and both read
forwards again.

This fixes Approach 4's weakness: **the cyclic walk needs a move counter (or a `gcd`) to know how
many chains to start**, and that bookkeeping is the part that gets written wrong.

### How to think about it

> **Intuition.** Write the array as block **B** then block **A**, and the goal as A then B. Reversing
> the whole thing gives reverse(A) followed by reverse(B) — the blocks are now on the correct sides,
> because reversing the array reverses the *order of the blocks* as well as the contents of each.
> Each block is individually backwards, so reverse each one where it sits. Reversing swaps the blocks
> and damages them in a way that reversing again repairs.

> **Why it works.** Let the array be `B · A` with `|A| = k`. Reversing a concatenation reverses both
> the order and each part: `reverse(B · A) = reverse(A) · reverse(B)`. So after the first pass the
> first `k` slots hold `reverse(A)` and the remaining `n − k` hold `reverse(B)`. Applying `reverse`
> to each of those spans gives `A · B`, which is the definition of a right rotation by `k`. The
> boundary for the second and third reversals is therefore `k`, **not** `n − k`: `n − k` was the cut
> in the *original* array, before anything moved.

### Worked example

`nums = [1, 2, 3, 4, 5, 6, 7]`, `k = 3`, `n = 7`.

| pass | span reversed | array after |
|---|---|---|
| start | — | `[1, 2, 3, 4, 5, 6, 7]` |
| 1 | `reverse_span(nums, 0, 6)` — everything | `[7, 6, 5, 4, 3, 2, 1]` |
| 2 | `reverse_span(nums, 0, 2)` — the first `k = 3` | `[5, 6, 7, 4, 3, 2, 1]` |
| 3 | `reverse_span(nums, 3, 6)` — the remaining `n − k = 4` | `[5, 6, 7, 1, 2, 3, 4]` |

The individual swaps inside the third pass, to show the loop is nothing more than that:

| `lo` | `hi` | `lo < hi`? | array after |
|---|---|---|---|
| 3 | 6 | yes — swap `4` and `1` | `[5, 6, 7, 1, 3, 2, 4]` |
| 4 | 5 | yes — swap `3` and `2` | `[5, 6, 7, 1, 2, 3, 4]` |
| 5 | 4 | no — stop | `[5, 6, 7, 1, 2, 3, 4]` |

Three passes, about `n` swaps in total, no allocation.

### Code

```python
def rotate_array_three_reversals(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    reverse_span(nums, 0, n - 1)  # blocks now on the correct sides, each backwards
    reverse_span(nums, 0, k - 1)  # repair the block that used to be the tail
    reverse_span(nums, k, n - 1)  # repair the block that used to be the head
    return nums
```

`k % n = 0` needs no special case: the second span is `(0, -1)` and does nothing, while the first and
third both cover the whole array, so it is reversed and reversed back.

### Common mistake

> **Watch out.** The misconception is that the block boundary is wherever the cut *was*. After the
> first reversal the tail block has moved to the **front** and is `k` long, so the boundary is `k`.
> Using `n − k` reverses the wrong two spans and produces a clean-looking rotation in the wrong
> direction.

Measured with `n - k` as the boundary:

| input | wrong boundary | correct |
|---|---|---|
| `[1, 2, 3, 4, 5, 6, 7]`, `k = 3` | `[4, 5, 6, 7, 1, 2, 3]` | `[5, 6, 7, 1, 2, 3, 4]` |
| `[1, 2, 3, 4]`, `k = 1` | `[2, 3, 4, 1]` | `[4, 1, 2, 3]` |

Both outputs are perfectly valid rotations, just left instead of right, which is why it survives a
glance. The fix is to re-derive the boundary from the **post-reversal** picture, not the pre-reversal
one.

The other mistake here is omitting `k %= n`, and on this rung it is finally loud: the second span is
`(0, k - 1)`, and `k - 1` can be far past the end. Measured on `[1, 2]` with `k = 5`:

```
IndexError: list index out of range
```

In C++ it would not raise — it would read past the end of the buffer and carry on, which is the
version of this bug you never want to meet.

### Complexity and when to use this

**Time `O(n)`, space `O(1)`.** Time is three reversal passes; the three spans together perform
`n/2 + k/2 + (n − k)/2 = n` swap-halves, so each value is written about twice. That is a constant
factor worse than the cyclic walk's exactly-one-write-per-value, and it is worth it. Space is
genuinely constant — two indices and the temporary inside the swap.

This is the rung to memorize. It satisfies the in-place follow-up, has no counter and no `gcd`
argument, its correctness fits in one sentence, and `k = 0` and `k = n` fall out with no special
cases. The reversal primitive itself reappears everywhere: reverse-words-in-a-string is the same
three-reversal trick with word boundaries instead of a single cut.

---

## The Overall Arc

Every step on this ladder chases one principle: **a value's destination never depended on the path it
took to get there, so stop moving it along that path.** The instinctive solution rotates by one, `k`
times, which is correct by pure composition and needs no insight at all — and it drags the value
belonging in slot 6 through slots 0 to 5 on the way, spending `n · k` writes to accomplish `n`
placements. The first real idea is that `(i + k) % n` names the destination outright, so a single
pass into a blank array places everything with no interference, because a blank array has no
occupants to displace; that is linear, and its entire cost is the blank array. Then comes a shift in
how the operation is *described* rather than computed: a rotation is not `n` independent address
calculations, it is two solid blocks trading places, and saying it that way both removes the
per-element arithmetic and puts the direction where a reader can see it instead of hiding it in a
modulo that can be written backwards without looking wrong. Both of those allocate, though, and the
follow-up forbids it — so the next move attacks the reason the copy was needed at all, which is that
a value has nowhere to go when its destination is occupied. Carry the displaced value with you and
one spare variable replaces the entire array; each chain closes back where it began, and the array is
rearranged with exactly one write per value, which is optimal. That rung also teaches what every
other rung hides: stepping by `k` around a ring of `n` does not necessarily visit everything, it
visits one of `gcd(n, k)` disjoint cycles, so the walk must be restarted — and a version trusting a
single chain silently leaves most of the array untouched on exactly the inputs nobody tests by hand.
Counting moves is the fix, and counting is also what gets written wrong under pressure, which is what
the last rung removes: return to the two-block description, and observe that reversing the whole
array puts both blocks on the correct side while damaging each one in a way that reversing it again
repairs. Three applications of one primitive, no counter, no `gcd`, no allocation. Shift repeatedly,
address directly, describe as blocks, follow the cycles, reverse three times — and running underneath
all five, the reduction that is not a detail: rotating by `n` changes nothing, so `k % n` is the real
rotation, and a version that skips it spins through pointless turns, returns the input unchanged, or
indexes off the end, depending only on which rung you happened to be standing on.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| One step at a time | `O(n · k)` | `O(1)` | Needs no insight and no index arithmetic; pays by moving every value through every slot | `k` is 1 or 2; as the baseline you name and reject |
| Copy into a second array | `O(n)` | `O(n)` | Each destination computed directly, but it needs a blank array to write into | A new array may be returned; the permutation is arbitrary, not a rotation |
| Cut and rejoin | `O(n)` | `O(n)` | Says what a rotation *is*, so the direction is visible; still allocates both blocks | Production code in a language with slices; clarity over memory |
| Cyclic replacements | `O(n)` | `O(1)` | In place with exactly one write per value; you must count moves, because there are `gcd(n, k)` chains | Writes are the bottleneck; the permutation is a bijection but not a rotation |
| **Three reversals** | `O(n)` | `O(1)` | In place with one primitive applied three times; ~2 writes per value instead of 1 | The answer to the in-place follow-up, and the one to memorize |

---

## Interview Priority

**Know cold — three reversals.** The expected answer to the follow-up, and you should be able to
write *and justify* it in under a minute.

> **In an interview.** Say `k %= n` out loud before you write a line — it is what separates a
> solution from a crash, and interviewers watch for it. Then give the one-sentence argument:
> *"reversing the whole array puts the two blocks on the correct sides with each written backwards,
> and reversing each block repairs it."* The follow-up is usually "can you do it with one write per
> element?", which is the cyclic rung — and its follow-up is "how many chains?", which is
> `gcd(n, k)`.

**Know cold — cut and rejoin.** One line, impossible to get wrong once `k %= n` is in place, and the
correct production answer when memory is not constrained. It is also the sentence that makes the
reversal trick explainable: you cannot argue "reversing swaps the blocks" until you have said the
answer is two blocks.

**Know cold — cyclic replacements, mostly for its lesson.** You are unlikely to submit it, but it is
the only rung exposing the `gcd(n, k)` cycle structure. Being able to say *"stepping by `k` around
`n` slots returns to the start after `n / gcd(n, k)` steps, so the array splits into `gcd(n, k)`
disjoint cycles"* is a genuinely strong signal; not being able to makes the follow-up uncomfortable.

**Understand, do not memorize — copy into a second array.** Useful as the stepping stone that
introduces `(i + k) % n`, and genuinely right when you may return a new array. Offer it as your final
answer and you will be asked for constant space, so you may as well get there yourself.

**Understand, do not memorize — one step at a time.** Ten seconds of naming and rejecting. Its value
is the observation it provokes: the intermediate positions were never required.

---

## Full Runnable Script

Every approach above, the shared `reverse_span` helper, and a test suite covering the statement's
examples, negatives, `k` larger than the array, the smallest legal input, `k = 0`, `k = n`, duplicate
values, two inputs where `n` and `k` share a factor so the cyclic rung must restart its chain, and 40
randomised stress cases with `k` deliberately often larger than `n` — each cross-checked against an
independent oracle that reads every destination from its source. Every approach rotates in place, so
each is handed its own copy.

```python
"""Rotate the Array by k - every approach in one file, plus a self-checking test suite.

Run: python rotate_array_all.py
"""

from __future__ import annotations

import random


def reverse_span(nums: list[int], lo: int, hi: int) -> None:
    """Reverse nums[lo..hi] in place. Empty or single-element spans do nothing."""
    while lo < hi:
        nums[lo], nums[hi] = nums[hi], nums[lo]
        lo += 1
        hi -= 1


# --- 1. One step at a time -----------------------------------------------------

def rotate_array_one_step(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    for _ in range(k % n):  # k % n first, or a huge k repeats whole turns for nothing
        last = nums[n - 1]
        for i in range(n - 1, 0, -1):  # backwards: read every slot before overwriting it
            nums[i] = nums[i - 1]
        nums[0] = last
    return nums


# --- 2. Copy into a second array -----------------------------------------------

def rotate_array_second_array(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    moved = [0] * n
    for i in range(n):
        moved[(i + k) % n] = nums[i]  # the computed index is a DESTINATION, so it goes left
    for i in range(n):
        nums[i] = moved[i]
    return nums


# --- 3. Cut and rejoin ---------------------------------------------------------

def rotate_array_cut_and_rejoin(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    nums[:] = nums[n - k:] + nums[: n - k]  # slice-assign so the caller's list changes
    return nums


# --- 4. Cyclic replacements ----------------------------------------------------

def rotate_array_cyclic(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    moved = 0
    start = 0
    while moved < n:  # the counter restarts the walk for each of gcd(n, k) chains
        i = start
        carry = nums[start]
        while True:
            j = (i + k) % n
            nums[j], carry = carry, nums[j]
            i = j
            moved += 1
            if i == start:
                break
        start += 1
    return nums


# --- 5. Three reversals (optimal) ----------------------------------------------

def rotate_array_three_reversals(nums: list[int], k: int) -> list[int]:
    n = len(nums)
    k %= n
    reverse_span(nums, 0, n - 1)  # blocks now on the correct sides, each backwards
    reverse_span(nums, 0, k - 1)  # repair the block that used to be the tail
    reverse_span(nums, k, n - 1)  # repair the block that used to be the head
    return nums


APPROACHES = [
    ("one_step", rotate_array_one_step),
    ("second_array", rotate_array_second_array),
    ("cut_and_rejoin", rotate_array_cut_and_rejoin),
    ("cyclic", rotate_array_cyclic),
    ("three_reversals", rotate_array_three_reversals),
]


# --- test scaffolding, not part of any answer ----------------------------------

def rotate_reference(nums: list[int], k: int) -> list[int]:
    """Independent oracle: the value landing at j came from j - k, wrapped."""
    n = len(nums)
    return [nums[(i - k) % n] for i in range(n)]


def main() -> None:
    cases: list[tuple[str, list[int], int]] = [
        ("statement example", [1, 2, 3, 4, 5, 6, 7], 3),
        ("negatives", [-1, -100, 3, 99], 2),
        ("k larger than the array", [1, 2], 5),
        ("smallest legal input", [7], 0),
        ("smallest legal input, k > n", [7], 3),
        ("k = 0, nothing moves", [1, 2, 3, 4], 0),
        ("k = n, a full turn", [1, 2, 3, 4], 4),
        ("k = n - 1", [1, 2, 3, 4], 3),
        ("duplicates", [1, 1, 2, 2, 1, 1], 3),
        ("gcd(n, k) = 2 - two cycles", [1, 2, 3, 4, 5, 6], 2),
        ("gcd(n, k) = 4 - four cycles", [1, 2, 3, 4, 5, 6, 7, 8], 4),
        ("all equal", [5, 5, 5, 5], 2),
    ]
    # Every input has an answer: a rotation is always defined, so this problem has
    # no "no answer" case to test. The O(n * k) rung is kept to small n here; its
    # 10^10-write worst case at the stated limits is analytic, not measured.

    rng = random.Random(20260912)
    for _ in range(40):
        n = rng.randint(1, 30)
        nums = [rng.randint(-50, 50) for _ in range(n)]
        k = rng.randint(0, 120)  # deliberately often larger than n
        cases.append((f"stress n={n} k={k}", nums, k))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums, k in cases:
        shown = nums if len(nums) <= 8 else nums[:8] + ["..."]
        print(f"\n{label}: nums={shown} k={k}")
        expected = rotate_reference(nums, k)
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums), k)  # every approach mutates in place: give each a copy
            results.append(got)
            short = got if len(got) <= 8 else got[:8] + ["..."]
            print(f"  {name:<{width}} -> {short}")
        agreed = all(r == expected for r in results)
        if not agreed:
            all_agreed = False
            print(f"  DISAGREEMENT: reference said {expected[:8]}")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED WITH THE REFERENCE ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
