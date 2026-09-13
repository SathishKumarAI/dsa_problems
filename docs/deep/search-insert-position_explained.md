# Where Would This Value Go? — explained

## Understanding the Problem

You have a row of books on a shelf, already in order, no two the same. Someone hands you one more
book. Which slot does it go in? If a copy is already on the shelf, the answer is that copy's slot. If
it is not, the answer is the slot it would have to occupy to keep the row in order — and that may be
the empty space off the right-hand end.

Notice what changed from plain binary search. There, failing to find the value was a **dead end** and
you returned `-1`. Here, failing to find it is the *interesting* case, and the answer is a real
number with a meaning. That one change is the whole problem, and it is why this deserves a long
document despite being tagged easy.

**The core question:** not "is the target here" but **"how many elements are strictly smaller than
the target?"** That count *is* the answer — count them, and the target belongs immediately after
them. Read that sentence twice, because it explains every edge case at once: nothing is smaller, so
the answer is `0`; everything is smaller, so the answer is `n`; and if a copy is present, everything
smaller sits to its left and the count lands exactly on it.

That reframing has a standard name, and knowing the name is worth more than knowing this problem:

> **This problem is `lower_bound` wearing a friendly costume.** `lower_bound(nums, t)` is "the first
> index whose value is at least `t`", which is the same thing as "how many values are strictly less
> than `t`", which is the same thing as "where would `t` go". Those three sentences describe one
> number. The rest of this document is about computing it without off-by-one errors, and about the
> half-dozen other questions the same primitive answers for free.

The naive approach is slow because it *counts* the smaller elements one at a time, when sortedness
means the count can be **located** instead: the array is a block of too-small values followed by a
block of large-enough ones, and all you need is the seam between them.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `1 <= nums.length <= 10^4`, sorted ascending | Sortedness is **the constraint that makes halving legal**, and it is doing more work here than in plain binary search: it guarantees the array splits into `[too small…][large enough…]` with exactly one seam. A single out-of-order element and there is no seam to find. Never empty, so `nums[0]` is safe. |
| values distinct | **This is why "the index of the target" is unambiguous.** Allow duplicates and "the index" becomes a choice between the run's first and last position — which is precisely the sibling problem `first-last-position`. Here, distinctness makes lower bound and "the target's index" the same number whenever the target is present. |
| `-10^4 <= nums[i], target <= 10^4` | Everything fits an `int` with room to spare, and since `hi <= 10^4` the midpoint sum cannot overflow even in Java. Relevant only so you know the safe midpoint below is a habit, not a fix for this input. |
| a target larger than everything answers `nums.length` | **This is the constraint that decides where your range ends.** There are `n + 1` possible answers (`0` through `n`) but only `n` elements, so a search range whose top is `n - 1` physically cannot express the last one. Get this wrong and the code is right on every case except the one the statement bothered to spell out. |
| a target smaller than everything answers `0` | Free in every approach below — the low pointer simply never moves. It is in the constraint list to stop you special-casing it. |
| no `-1` anywhere | The loop's exit position **is** the answer. There is no "not found" branch to write, which is the payoff for choosing the right contract. |

### The loop contract, and why it matters more here

Two conventions exist and mixing them is where the bugs in this family come from:

| | **Inclusive** `[lo, hi]` | **Converging** `[lo, hi]` |
|---|---|---|
| Start | `lo = 0`, `hi = n - 1` | `lo = 0`, **`hi = n`** |
| Loop test | `while lo <= hi` | `while lo < hi` |
| Too small at `mid` | `lo = mid + 1` | `lo = mid + 1` |
| Otherwise | `hi = mid - 1` | `hi = mid` |
| Ends with | `lo == hi + 1`, range empty | `lo == hi`, one index |
| Answer | `lo` | `lo` |

Both work for this problem and both are used below. The trap specific to *this* problem is in the
top row: the converging form must start `hi` at **`n`**, not `n - 1`, because `hi` is a candidate
answer and `n` is a legal answer. The inclusive form starts `hi` at `n - 1` because `hi` is an
*index to examine*, and there is no element at index `n` to examine — yet `lo` can still finish at
`n`, one past the last thing it looked at. Same final answer, two different meanings for `hi`. Write
one and think in the other and you lose the past-the-end case.

> **Watch out.** `while lo <= hi` goes with `mid ± 1` on both sides; `while lo < hi` goes with
> `hi = mid`. `while lo <= hi` with `hi = mid` spins forever. `while lo < hi` with `hi = mid - 1`
> steps over the answer. If you remember nothing else about this family, remember that pairing.

### The midpoint, plainly

Write `mid = lo + (hi - lo) // 2` rather than `(lo + hi) // 2`:

- **In Python the two are the same number for every input.** Python integers do not overflow. Here
  it is style, nothing more.
- **In Java and C++ they are not**, because `int` wraps at 2³¹. With `lo = hi = 1073741824`,
  `(lo + hi) / 2` in Java is **−1073741824** — a negative index and an exception on the next line —
  while `lo + (hi - lo) / 2` is `1073741824`. This repo ships Java and C++ alongside the Python for
  every problem, so the habit has to survive translation.
- **For this problem it cannot happen**: `hi <= 10^4`. The overflow is a real defect in real code —
  it shipped in the JDK's `Arrays.binarySearch` for years — and it is irrelevant to these inputs.
  Write the safe form because it is free, not because this array can trigger it.

### The worked example used in every section below

```
nums = [1, 3, 5, 6],  target = 2        answer: 1
```

Target `2` is chosen deliberately over the statement's `5`. A present target exercises the easy
path; an absent one forces the code to end in a state that *means* something, which is the whole
point of the problem. Every approach below traces this input, and every approach is then checked
against the full sweep:

| target | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| answer | 0 | 0 | **1** | 1 | 2 | 2 | 3 | 4 |

Eight targets, four of them present, four absent, including one below everything and one past the
end. That row of eight numbers is the cheapest possible test for any candidate solution, and three of
the four bugs in this document are caught by it.

---

## Approach 1 — Walk until it fits *(the data file's alternative)*

### The idea

*Where does this value go?* Walk the shelf from the left until you meet a book that should come
**after** the new one. That slot is the answer. If you reach the end without meeting one, the new
book goes at the end.

### How to think about it

> **Intuition.** You are filing a card into a sorted card index by hand. You flick forward through
> the cards until you hit the first one that belongs after your card, and you slide yours in front of
> it. The reason this is the right *mental* model even though it is the wrong algorithm: it makes the
> answer's definition concrete. The answer is a **gap**, not a card — that is why there are five
> possible answers for a four-element array. Every faster version below is computing this same gap;
> they just locate it instead of walking to it.

### Worked example

`nums = [1, 3, 5, 6]`, `target = 2`.

| `i` | `nums[i]` | `nums[i] >= 2`? | action |
|---|---|---|---|
| 0 | `1` | no | keep walking |
| 1 | `3` | **yes** | **return 1** |

Two comparisons here, but that is luck: `target = 7` walks all four and then returns `len(nums)`.

| `i` | `nums[i]` | `nums[i] >= 7`? | action |
|---|---|---|---|
| 0 | `1` | no | keep walking |
| 1 | `3` | no | keep walking |
| 2 | `5` | no | keep walking |
| 3 | `6` | no | keep walking |
| — | — | — | fell off the end → **return 4** |

### Code

```python
def search_insert_walk(nums: list[int], target: int) -> int:
    for i in range(len(nums)):
        if nums[i] >= target:
            return i
    return len(nums)  # every element was smaller: the slot is one past the end
```

### Common mistake

> **Watch out.** The misconception is that `>` and `>=` are a matter of taste here — that "the first
> element bigger than the target" and "the first element not smaller than the target" are two ways of
> saying one thing. They are two **different primitives**, and swapping them is the single most
> common error in this whole family.

```python
        if nums[i] > target:      # WRONG — this is UPPER bound, not lower bound
```

Run both over the full sweep on `nums = [1, 3, 5, 6]`:

| target | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| correct (`>=`) | 0 | **0** | 1 | **1** | 2 | **2** | **3** | 4 |
| buggy (`>`) | 0 | **1** | 1 | **2** | 2 | **3** | **4** | 4 |

Look at which columns differ: `1`, `3`, `5`, `6` — **exactly the values present in the array**. On
every absent target the two agree perfectly. So a test suite made of absent targets passes, and the
statement's own first example (`target = 5`, answer `2`) returns **3**. The bug is invisible on half
the inputs and wrong on the other half, which is the worst possible failure profile.

And the deeper point: the buggy function is not nonsense. `>` computes **upper bound** — the first
index strictly *past* the target — which is `bisect_right` in the standard library, and a genuinely
useful primitive. Confirm it: `bisect_right([1,3,5,6], t)` for the eight targets gives
`0, 1, 1, 2, 2, 3, 4, 4`, which is the buggy row exactly. You have not written a bug so much as
answered the wrong question. **Naming the two primitives is how you stop making this mistake**, and
the pair shows up again as the whole content of `first-last-position`.

A second, quieter version of the same slip: returning `-1` when the walk falls off the end, out of
habit from plain binary search. On `target = 7` that returns `-1` where the statement asks for `4`.
This problem has no "not found".

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. The cost is one comparison per element until the seam, so it is
`O(position of the answer)` — cheap for small targets, a full pass for large ones, `O(n)` in the
worst case. Space is a loop counter.

At `n = 10⁴` this passes easily; the reason to go further is that the statement is a thin disguise
over a primitive you want in your hands, not that `10⁴` is slow. Keep this version as the oracle:
at the bottom of this document it is what every other approach is cross-checked against, and it is
the only one whose correctness you can verify by reading it.

---

## Approach 2 — Find it if it is there, then fall back *(an addition — not in the data file)*

### The idea

*The walk is linear, and plain binary search is logarithmic — can I just use plain binary search?*
Partly. A standard search finds the target in `O(log n)` **when it is present**, and when it is
absent it returns `-1`, which is not an answer here. So: binary search for a hit, and if there is no
hit, fall back to the walk.

This fixes the walk's weakness — **it reads every element before the answer** — but only on half the
inputs, and that turns out to be the wrong half.

### How to think about it

> **Intuition.** This is the rung almost everyone writes first, and it is worth writing precisely so
> you can feel what is wrong with it. The instinct is that "find the value" and "find the slot" are
> two tasks: the fast algorithm you already know does the first one, so bolt a slow one on for the
> second. What that instinct misses is that **the fast algorithm already found the slot** — it walked
> right past it on its way to failing. The boundary is sitting in `lo` at the moment the loop gives
> up, and the fallback scan is re-deriving, in linear time, a fact the logarithmic loop had already
> computed and thrown away.

> **Why it works.** The halving half is ordinary binary search and rests on the usual invariant: if
> the target is present, its index is in `[lo, hi]`. When `nums[mid] < target`, sortedness gives
> `nums[i] <= nums[mid] < target` for every `i <= mid`, so **no index at or left of `mid` can hold
> the target** and `[lo, mid]` is safe to discard. The mirror holds on the other side. The fallback
> is correct for the trivial reason that it is Approach 1 unchanged, run on the whole array.

### Worked example

`nums = [1, 3, 5, 6]`, `target = 2`. **Contract: inclusive `[lo, hi]`, `while lo <= hi`,
`mid ± 1`.**

| phase | step | `lo` | `hi` | `mid` | `nums[mid]` | compare | action |
|---|---|---|---|---|---|---|---|
| search | 1 | 0 | 3 | 1 | `3` | `3 > 2` | `hi = 0` |
| search | 2 | 0 | 0 | 0 | `1` | `1 < 2` | `lo = 1` |
| search | 3 | 1 | 0 | — | — | `lo > hi` | no hit — fall back |
| scan | 1 | — | — | — | `1` (`i = 0`) | `1 < 2` | keep walking |
| scan | 2 | — | — | — | `3` (`i = 1`) | `3 > 2` | **return 1** |

Five steps to do what Approach 3 does in three — and stare at row "search 3". At that moment
`lo == 1`. The answer is **1**. The loop had it, in a variable, and then the code discarded it and
started walking from index 0.

### Code

```python
def search_insert_find_then_scan(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = midpoint(lo, hi)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    # no hit: fall back to the linear walk for the slot
    for i in range(len(nums)):
        if nums[i] > target:
            return i
    return len(nums)
```

`midpoint` is the shared helper declared once in the full script:

```python
def midpoint(lo: int, hi: int) -> int:
    """Midpoint of a range, written so it cannot overflow a 32-bit int.

    In Python this is identical to (lo + hi) // 2 for every input; the form is kept
    because the Java and C++ translations of the same loop are not so lucky.
    """
    return lo + (hi - lo) // 2
```

Note that the fallback uses `>`, not `>=`, and that is **correct here** — the target is known to be
absent by the time the fallback runs, and on an absent target upper bound and lower bound agree (see
Approach 1's mistake table). That is a genuinely fragile piece of reasoning depending on an invariant
two code blocks away, and "this comparison is only correct because of something proved elsewhere" is
a good reason to prefer the next rung.

### Common mistake

> **Watch out.** The misconception is that the failed search's **last probed `mid`** is near the
> answer, so a small patch-up — return `mid` or `mid + 1` depending on which way the last comparison
> went — will finish the job. `mid` at the moment of failure is not the boundary. It is wherever the
> final halving happened to land, and it can be on either side of the answer.

```python
    lo, hi = 0, len(nums) - 1
    mid = 0
    while lo <= hi:
        mid = midpoint(lo, hi)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return mid            # WRONG — the last probe, not the boundary
```

Run it on `nums = [1, 3, 5, 6]`:

| target | correct | returning the last `mid` |
|---|---|---|
| `0` | 0 | 0 |
| `2` | 1 | **0** |
| `4` | 2 | **2** |
| `7` | 4 | **3** |

Target `4` is right by coincidence, `2` and `7` are wrong, and `7` cannot be fixed by any patch at
all: `mid` is an index into the array, so it can never be `4` on a four-element array, and `4` is the
required answer. **No amount of arithmetic on the last `mid` reaches a slot that is not an index.**
The pointer that *can* reach it is `lo`, which ends at `len(nums)` when every element is smaller —
and that is Approach 3 in one sentence.

### Complexity and when to use this

**Time** `O(log n)` when the target is present, `O(n)` when it is absent, so `O(n)` worst case.
**Space** `O(1)`. The cost split is the whole story: the fast path covers the case the problem was
*not* asking about, and the slow path covers the case it was. Insertion into a set of distinct values
is overwhelmingly a miss — that is why you are inserting — so the fallback is the common path.

Never use this. It is here because it is the rung most people write, and because the row where `lo`
already holds the answer is the most efficient way to explain the next approach. Write it once, see
the waste, delete it.

---

## Approach 3 — Lower bound, inclusive range *(the data file's primary solution)*

### The idea

*The failed search's `lo` was sitting on the answer — what if the loop stops looking for the target
altogether and just narrows onto that seam?* Then there is nothing to fall back to. Drop the
equality test entirely, keep halving on "is `nums[mid]` too small?", and when the range empties,
`lo` is the first index that is not too small. That is the answer, present or absent.

This fixes Approach 2's real weakness — **it throws away the boundary the halving had already
found** — and it removes the linear fallback, the equality branch, and the dependence on a
correctness argument living in another block.

### How to think about it

> **Intuition.** Stop searching for the book and start searching for the **seam**. The shelf is a
> block of books that belong before the new one, followed by a block that belong after; you are
> looking for the join. Every probe asks one question — *"is this book still in the before-block?"*
> — and moves the bookmark on the side that the answer rules out. The two bookmarks squeeze the seam
> between them, and when they cross, they have not lost it: `lo` is standing on the first book of the
> after-block, which is exactly the slot. The absence of any `== target` test is the point. You are
> not asking a question about the target's *existence*, and so its absence is not an exception.

> **Why it works.** The invariant is: **everything at index `< lo` is strictly smaller than the
> target, and everything at index `> hi` is at least the target.** Both halves are vacuously true at
> the start (`lo = 0`, `hi = n - 1`). If `nums[mid] < target`, sortedness makes every index `i <= mid`
> satisfy `nums[i] <= nums[mid] < target`, so **the discarded block `[lo, mid]` provably contains no
> index that is large enough** — setting `lo = mid + 1` keeps the invariant. If `nums[mid] >= target`,
> every `i >= mid` has `nums[i] >= target`, so **the discarded block `[mid, hi]` provably contains no
> index that is too small**, and `hi = mid - 1` keeps it. When `lo > hi` the two halves meet:
> everything left of `lo` is smaller, everything from `lo` onward is not, and that is the definition
> of lower bound. Termination is free — each step strictly moves one endpoint, so `hi - lo` shrinks.

### Worked example

`nums = [1, 3, 5, 6]`, `target = 2`. **Contract: inclusive `[lo, hi]`, `while lo <= hi`, both moves
`mid ± 1`, answer read from `lo`.**

| step | `lo` | `hi` | `mid` | `nums[mid]` | `nums[mid] < 2`? | action | invariant after |
|---|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 1 | `3` | no | `hi = 0` | indices ≥ 1 all hold ≥ 2 |
| 2 | 0 | 0 | 0 | `1` | yes | `lo = 1` | index 0 holds < 2 |
| — | 1 | 0 | — | — | — | `lo > hi`, **return 1** | left of 1 is smaller, 1 onward is not |

Two probes, no fallback, no equality test. And the past-the-end case, `target = 7`, on the same
array:

| step | `lo` | `hi` | `mid` | `nums[mid]` | `nums[mid] < 7`? | action |
|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 1 | `3` | yes | `lo = 2` |
| 2 | 2 | 3 | 2 | `5` | yes | `lo = 3` |
| 3 | 3 | 3 | 3 | `6` | yes | `lo = 4` |
| — | 4 | 3 | — | — | — | `lo > hi`, **return 4** |

`lo` finishes at `4`, one past the last index, with no special case written for it. `hi` started at
`n - 1 = 3` because `hi` is an index to *examine*; `lo` is a *slot*, and slots run one further.

### Code

```python
def search_insert_inclusive(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = midpoint(lo, hi)
        if nums[mid] < target:
            lo = mid + 1  # mid and everything left of it is too small
        else:
            hi = mid - 1  # mid might be the answer, but lo will come back to it
    return lo  # first index whose value is >= target; == len(nums) if none is
```

Five lines, and the only thing that distinguishes it from plain binary search is what is *missing*:
there is no `if nums[mid] == target: return mid`. Adding it back is not wrong — on distinct values it
returns the same number faster — but it is the branch that makes people think the absent case needs
handling, and it does not.

### Common mistake

> **Watch out.** The misconception is that after the loop, `lo` and `hi` are "about the same place",
> so either will do. They are not the same place and they never are: **the loop exits precisely when
> `lo == hi + 1`.** `hi` is always exactly one less than the answer, so returning it is off by one on
> every single input, including the ones you would test first.

```python
    return hi            # WRONG — always exactly one too small
```

Run it on `nums = [1, 3, 5, 6]`:

| target | correct (`lo`) | returning `hi` |
|---|---|---|
| `0` | 0 | **−1** |
| `2` | 1 | **0** |
| `5` | 2 | **1** |
| `7` | 4 | **3** |

Uniformly one too low, and on `target = 0` it returns `-1` — the value plain binary search uses for
"absent", which is how this bug gets rationalised instead of fixed. The fix is not arithmetic
(`return hi + 1` also works, and is worse to read); it is knowing what the two pointers *mean*. `hi`
is the last index proved too small. `lo` is the first index not proved too small. The question asked
for the second one.

### Complexity and when to use this

**Time** `O(log n)`, **space** `O(1)`. Each iteration halves `hi - lo + 1`, so the body runs at most
`⌊log₂n⌋ + 1` times — fourteen probes for `n = 10⁴` against up to ten thousand comparisons for the
walk. Space is three integers, independent of `n`; nothing is allocated.

**This is the one the data file ships and the one to write under pressure.** It is five lines, it has
no special cases, and the `return lo` is the whole trick. Use it any time the question reduces to
"how many are smaller" or "where does this go" — which, once you start noticing, is a lot of
questions.

---

## Approach 4 — Lower bound, converging range *(an addition — the form the data file's `arc` names)*

### The idea

*Approach 3 ends with `lo` one past `hi`, which takes a moment to reason about — can the loop end
with the two pointers simply **on** the answer?* Yes: let `hi` mean "a candidate slot" rather than
"an index to examine", start it at `n`, and shrink until `lo == hi`. There is no crossing and no
empty range to interpret; the survivor is the answer.

This does not fix a bug in Approach 3 — they return the same number on every input. What it fixes is
**the reader's model**: the exit condition stops being "the range emptied and now I reason about
where `lo` ended up" and becomes "one candidate is left, and it is the answer."

### How to think about it

> **Intuition.** In Approach 3 the two bookmarks pass through each other and you deduce the seam
> from where they crossed. Here they close in on the seam and stop touching it: `lo` is the leftmost
> slot still possible, `hi` is the rightmost slot still possible, and the loop runs until only one
> slot is possible. The change that makes this work is conceptual before it is numeric — `hi` is now
> a **slot between books**, and a four-book shelf has five slots, so `hi` starts at `4`. That is why
> `hi = mid` is correct rather than sloppy: `mid` is a slot that might be the answer, and discarding
> it would discard the answer.

> **Why it works.** Invariant: **the answer is in `[lo, hi]`**, with `lo` and `hi` as slots in
> `0..n`. If `nums[mid] < target`, then slot `mid` and every slot at or left of it is wrong — the
> target must go after `nums[mid]` — so `[lo, mid]` **provably cannot contain the answer** and
> `lo = mid + 1`. If `nums[mid] >= target`, the target belongs at or before slot `mid`, so `(mid, hi]`
> provably cannot contain it and `hi = mid`. Termination: with `lo < hi`, `midpoint` returns a value
> in `[lo, hi - 1]`, so `lo = mid + 1` strictly raises `lo` and `hi = mid` strictly lowers `hi`. One
> slot survives, and the invariant says it is the answer.

### Worked example

`nums = [1, 3, 5, 6]`, `target = 2`. **Contract: converging, `lo = 0`, `hi = len(nums) = 4`,
`while lo < hi`, `lo = mid + 1` / `hi = mid`.**

| step | `lo` | `hi` | slots still possible | `mid` | `nums[mid]` | `nums[mid] < 2`? | action |
|---|---|---|---|---|---|---|---|
| 1 | 0 | 4 | `0 1 2 3 4` | 2 | `5` | no | `hi = 2` |
| 2 | 0 | 2 | `0 1 2` | 1 | `3` | no | `hi = 1` |
| 3 | 0 | 1 | `0 1` | 0 | `1` | yes | `lo = 1` |
| — | 1 | 1 | `1` | — | — | — | one survivor → **return 1** |

Three probes rather than Approach 3's two on this input — the converging form has no early exit and
always spends `⌈log₂(n + 1)⌉` probes. It buys clarity, not speed. And `target = 7`:

| step | `lo` | `hi` | `mid` | `nums[mid]` | `nums[mid] < 7`? | action |
|---|---|---|---|---|---|---|
| 1 | 0 | 4 | 2 | `5` | yes | `lo = 3` |
| 2 | 3 | 4 | 3 | `6` | yes | `lo = 4` |
| — | 4 | 4 | — | — | — | **return 4** |

Slot `4` was reachable only because `hi` started at `4`.

### Code

```python
def search_insert_converging(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums)  # hi is a SLOT, and len(nums) is a legal slot
    while lo < hi:
        mid = midpoint(lo, hi)
        if nums[mid] < target:
            lo = mid + 1  # slot mid and everything left of it is ruled out
        else:
            hi = mid  # slot mid is still possible, so keep it
    return lo
```

`mid` is safe to index: `lo < hi` forces `mid <= hi - 1 <= n - 1`.

### The primitive, and everything it answers

This is the paragraph to take away from the document. You now have `lower_bound` — *the first index
whose value is at least `t`* — as four lines that need no adjustment. Its twin, `upper_bound`, is the
same four lines with `<` changed to `<=`: *the first index whose value is strictly greater than `t`*.
Between them they answer a surprising amount of the sorted-array question space:

| Question about a sorted array | Built from | Expression |
|---|---|---|
| where would `t` be inserted | lower bound | `lower_bound(nums, t)` |
| how many values are **strictly less** than `t` | lower bound | `lower_bound(nums, t)` |
| how many values are **at most** `t` | upper bound | `upper_bound(nums, t)` |
| is `t` present at all | lower bound + one check | `i = lower_bound(nums, t); i < n and nums[i] == t` |
| how many copies of `t` are there | both | `upper_bound(nums, t) - lower_bound(nums, t)` |
| first and last index of `t` | both | `[lower_bound(nums, t), upper_bound(nums, t) - 1]` |
| largest value **strictly less** than `t` (predecessor) | lower bound | `nums[lower_bound(nums, t) - 1]`, if that index is ≥ 0 |
| smallest value **strictly greater** than `t` (successor) | upper bound | `nums[upper_bound(nums, t)]`, if that index is < n |
| how many values lie in `[a, b]` | both | `upper_bound(nums, b) - lower_bound(nums, a)` |

Row six is the entire content of `first-last-position`, a problem rated medium. Row four is plain
binary search. Row one is this problem. **The four lines above are worth more than the three problems
combined**, and the reason to write them in the converging form is that it is the form that
generalises: everywhere the predicate is "is this still on the wrong side of the boundary", the loop
is this loop.

### Common mistake

> **Watch out.** The misconception is that a search range always spans `0` to `len(nums) - 1`,
> because that is what "the indices of an array" means. In the converging form `hi` is not an index,
> it is a **slot**, and the last slot is `len(nums)`. Carrying the habit over from plain binary
> search silently deletes one possible answer — the one the statement gives as its second example.

```python
    lo, hi = 0, len(nums) - 1     # WRONG in the converging form
    while lo < hi:
        ...
    return lo
```

Run it on `nums = [1, 3, 5, 6]`:

| target | correct | with `hi = len(nums) - 1` |
|---|---|---|
| `0` | 0 | 0 |
| `2` | 1 | 1 |
| `5` | 2 | 2 |
| `7` | 4 | **3** |

One wrong answer out of four, and it is only ever wrong when the target exceeds every element —
`lo` can never exceed `hi`, and `hi` was capped at `3`. Every test that does not include a
past-the-end target passes. **This is the bug the constraint list was warning you about** when it
bothered to say that `nums.length` is a valid answer.

The mirror slip is writing `hi = mid - 1` under `while lo < hi`. That one *loses* the answer rather
than capping it: the converging loop never revisits `mid`, so discarding it discards a live
candidate.

### Complexity and when to use this

**Time** `O(log n)`, **space** `O(1)`. The probe count is `⌈log₂(n + 1)⌉` — it is halving `n + 1`
slots rather than `n` indices — which is **14** for `n = 10⁴`, the same 14 as Approach 3. On small
inputs the two differ by a probe either way (three versus two on the worked example); at any size
that matters the difference is noise. Space is three integers.

Use this as your default shape for **every** boundary search, not just this one. It is the version to
have in muscle memory, because the same four lines with `<` → `<=` give you upper bound, and the pair
is the answer to the table above. Approach 3 is equally correct and the data file ships it; pick one
and be consistent, because the mixing is what costs marks.

---

## Approach 5 — Let the standard library do it

### The idea

*Is lower bound common enough that someone has already written it?* It is in Python's standard
library, has been for decades, and is a C implementation of exactly Approach 4.

### How to think about it

> **Intuition.** `bisect` is named for what it does to the range, and its two functions are the two
> primitives from the table above: `bisect_left` **is** lower bound, `bisect_right` **is** upper
> bound. The names describe where the value would be inserted relative to equal values already
> there — left of them, or right of them — which is the same distinction as `<` versus `<=` in the
> loop. Knowing this pairing is the point; the one-liner is just the reward.

### Worked example

`nums = [1, 3, 5, 6]`, `target = 2`: `bisect_left(nums, 2)` → `1`. The internals are Approach 4's
trace, run in C.

Across the full sweep, and set beside its twin so the difference is visible:

| target | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| `bisect_left` (lower bound) — **the answer** | 0 | 0 | 1 | 1 | 2 | 2 | 3 | 4 |
| `bisect_right` (upper bound) | 0 | **1** | 1 | **2** | 2 | **3** | **4** | 4 |

They differ on exactly the four present values, which is the same table as Approach 1's common
mistake, because it is the same mistake.

### Code

```python
from bisect import bisect_left


def search_insert_bisect(nums: list[int], target: int) -> int:
    return bisect_left(nums, target)
```

### Common mistake

> **Watch out.** The misconception is that `bisect_left` and `bisect_right` are stylistic variants
> and the shorter name is fine. They agree only when the value is **absent**, and this problem's
> whole first example has it present.

`bisect_right([1, 3, 5, 6], 5)` returns **3**. The answer is `2`. The array has no duplicates at all
and the two still disagree, because "left of the equal value" and "right of the equal value" differ
by one even when there is a single equal value. The rule: **"first index at least `v`" is always
`bisect_left`.**

### Complexity and when to use this

**Time** `O(log n)`, **space** `O(1)` — the same bounds as Approach 4, with a much better constant
because the loop runs in C rather than in the interpreter.

Use it in real code, always. Never write a binary search by hand in production Python when
`bisect_left`, `bisect_right`, `insort_left` or `insort_right` says what you mean. In an interview,
name it — *"in practice this is `bisect_left`"* — and then write Approach 3 or 4 anyway, because the
question is whether you can produce the loop, not whether you can find the module.

---

## The Overall Arc

The single principle every rung chases is **stop asking whether the target is here and start asking
where the boundary is**, and the reason this easy problem deserves a long document is that the shift
is a change of question, not a change of algorithm. The walk makes the answer concrete — the answer
is a gap, not an element, which is already the most important sentence in the problem, and it is why a
four-element array has five possible answers — but it locates that gap by counting to it, one
comparison per element, declining the ordering the input is handing over. The instinctive repair is
to reach for the binary search you already know, which finds the target fast and then has nothing to
say when the target is absent, so a linear fallback gets bolted on; and the moment worth staring at
is the instant that search gives up, because `lo` is sitting on the answer and the fallback is about
to spend `O(n)` re-deriving it. Deleting the equality test is what turns that accident into the
algorithm: the loop no longer looks for a value, it narrows onto the seam between *too small* and
*large enough*, absence stops being an exception because absence was never being tested, and the
answer is simply where `lo` stopped. From there the only remaining question is what the endpoints
**mean** — indices to examine, which crossed and left `lo` one past `hi`, or slots that could hold
the answer, which converge until one survives — and the second reading is the one that generalises,
because its `hi` can legally be `len(nums)` and because "is `mid` still on the wrong side of the
boundary" is a predicate you can state for boundaries no single probe could confirm. That is when the
problem stops being a problem and becomes a primitive: change one `<` to `<=` and the same four lines
are upper bound, and the pair answers where a value goes, how many are smaller, how many copies
exist, what the predecessor and successor are, and where a run of equals begins and ends — which is
the medium-rated sibling problem, solved twice over, for free. The standard library ships both as
`bisect_left` and `bisect_right`, and the fact that the classic bug in every rung above turns out to
be the *other* primitive rather than nonsense is the tell that these two functions, not this problem,
are the thing to walk away with.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Walk until it fits | `O(n)` | `O(1)` | Declines sortedness; counts to the seam instead of locating it | The oracle in a test harness; `n` is a handful |
| Find it, then fall back | `O(log n)` hit, `O(n)` miss | `O(1)` | Fast on the case the problem is not about, slow on the case it is | Never. It is the rung that teaches you what `lo` means |
| **Lower bound, inclusive `[lo, hi]`** | **`O(log n)`** | **`O(1)`** | **Drops the equality test, so absence needs no branch; exit needs `lo == hi + 1` reasoning** | **The data file's answer, and fine under pressure** |
| **Lower bound, converging slots** | **`O(log n)`** | **`O(1)`** | **No early exit, always `⌈log₂(n+1)⌉` probes — buys a one-survivor exit and `hi = len(nums)`** | **Your default for every boundary search; `<` → `<=` gives upper bound** |
| `bisect_left` | `O(log n)` | `O(1)` | Zero lines of your own, C constant factor — and zero demonstration that you can write it | Production code, always |

---

## Interview Priority

> **In an interview.** Reframe before you write: *"this is lower bound — the first index whose value
> is at least the target — which is also the count of values strictly less than it, which is also
> where it gets inserted."* Then write four lines. The follow-up is always one of two: **"what if the
> target is bigger than everything?"** — answer that `lo` finishes at `len(nums)`, which is the
> required answer and needs no special case, and that this is why `hi` starts at `len(nums)` in the
> converging form — or **"what if there are duplicates?"** — answer that lower bound gives the first
> occurrence, that `<` → `<=` gives upper bound and the first index past the run, and that the pair
> gives you the count and the range. That second answer is `first-last-position` handed over before
> it was asked.

**Memorize cold — lower bound, one of the two forms.** Four or five lines, and it must be automatic:
either `while lo <= hi` with `mid ± 1` and `return lo`, or `while lo < hi` with `hi = len(nums)`,
`hi = mid`, and `return lo`. Pick **one** and always write that one. The failure mode in interviews
is not ignorance of the algorithm, it is writing half of each form under time pressure, and the
symptom is either an infinite loop or an answer that is short by one.

**Memorize cold — upper bound, as the same code with `<=`.** You will not be asked for this problem
twice, but you will be asked for "count the occurrences", "find the range of equal values", or "how
many are in `[a, b]`", and all of them are the pair. Say the distinction out loud when you write it:
*lower bound stops at the first value not less than the target; upper bound stops at the first value
greater than it.*

**Worth understanding, not memorizing — `bisect_left` / `bisect_right`.** Name them. Mentioning that
the standard library ships both primitives reads as someone who has used them, and it costs one
sentence. Then write the loop by hand, because that is what is being tested.

**Not worth memorizing — the walk, and the find-then-fall-back rung.** Say the walk in a sentence,
name `O(n)`, move on. Do not write the fallback version even as a stepping stone; it invites "so
what is `lo` at the moment your search fails?" and if you have to work that out on the whiteboard
you have lost the advantage of the reframing you opened with.

---

## Full Runnable Script

Every approach above, plus a test suite: both statement examples, all eight targets in and around the
example array, a target below everything and one past the end, the smallest legal inputs at length 1
in all three positions, and 900 randomised stress cases over sorted distinct arrays — every target
from below the minimum to above the maximum, cross-checked against the linear walk. Each answer is
also validated structurally: inserting the target at the returned index must leave a sorted array.

```python
"""Where Would This Value Go? - every approach in one file, plus a self-checking test suite.

Run: python search_insert_position_all.py
"""

from __future__ import annotations

import random
from bisect import bisect_left

# --- shared: the one place the midpoint rule lives ------------------------------


def midpoint(lo: int, hi: int) -> int:
    """Midpoint of a range, written so it cannot overflow a 32-bit int.

    In Python this is identical to (lo + hi) // 2 for every input; the form is kept
    because the Java and C++ translations of the same loop are not so lucky.
    """
    return lo + (hi - lo) // 2


# --- 1. Walk until it fits (the data file's alternative) -----------------------


def search_insert_walk(nums: list[int], target: int) -> int:
    for i in range(len(nums)):
        if nums[i] >= target:
            return i
    return len(nums)  # every element was smaller: the slot is one past the end


# --- 2. Find it if it is there, then fall back --------------------------------


def search_insert_find_then_scan(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = midpoint(lo, hi)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    # no hit: fall back to the linear walk for the slot
    for i in range(len(nums)):
        if nums[i] > target:
            return i
    return len(nums)


# --- 3. Lower bound, inclusive range (the data file's primary) ----------------


def search_insert_inclusive(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = midpoint(lo, hi)
        if nums[mid] < target:
            lo = mid + 1  # mid and everything left of it is too small
        else:
            hi = mid - 1  # mid might be the answer, but lo will come back to it
    return lo  # first index whose value is >= target; == len(nums) if none is


# --- 4. Lower bound, converging range ----------------------------------------


def search_insert_converging(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums)  # hi is a SLOT, and len(nums) is a legal slot
    while lo < hi:
        mid = midpoint(lo, hi)
        if nums[mid] < target:
            lo = mid + 1  # slot mid and everything left of it is ruled out
        else:
            hi = mid  # slot mid is still possible, so keep it
    return lo


# --- 5. The standard library ---------------------------------------------------


def search_insert_bisect(nums: list[int], target: int) -> int:
    return bisect_left(nums, target)


APPROACHES = [
    ("walk", search_insert_walk),
    ("find_then_scan", search_insert_find_then_scan),
    ("inclusive", search_insert_inclusive),
    ("converging", search_insert_converging),
    ("bisect_left", search_insert_bisect),
]

# --- test suite ----------------------------------------------------------------


def is_sorted_after_insert(nums: list[int], target: int, at: int) -> bool:
    """The answer's real contract: inserting target at `at` must keep the row sorted."""
    grown = nums[:at] + [target] + nums[at:]
    return all(grown[i] <= grown[i + 1] for i in range(len(grown) - 1))


def main() -> None:
    example = [1, 3, 5, 6]
    cases: list[tuple[str, list[int], int]] = [
        ("statement example, present", example, 5),
        ("statement example, past the end", example, 7),
        ("below everything", example, 0),
        ("in the first gap", example, 2),
        ("in the second gap", example, 4),
        ("first element", example, 1),
        ("last element", example, 6),
        ("one past the last element", example, 7),
        ("length 1, below", [5], 1),
        ("length 1, equal", [5], 5),
        ("length 1, above", [5], 9),
        ("length 2, between", [1, 9], 5),
        ("negatives", [-9, -5, -1], -7),
        ("spanning zero", [-2, -1, 0, 1, 2], 0),
        ("min and max of the value range", [-10000, 10000], 0),
    ]

    rng = random.Random(20260912)
    for n in range(1, 31):
        nums = sorted(rng.sample(range(-60, 61), n))
        for target in range(nums[0] - 2, nums[-1] + 3):
            cases.append((f"stress n={n} t={target}", nums, target))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True
    shown_cases = 0

    for label, nums, target in cases:
        results = [fn(list(nums), target) for _, fn in APPROACHES]
        disagreed = any(r != results[0] for r in results)
        bad_slot = not is_sorted_after_insert(nums, target, results[0])
        # print the hand-written cases in full; keep the stress sweep to a summary
        if not label.startswith("stress") or disagreed or bad_slot:
            shown = nums if len(nums) <= 10 else nums[:10] + ["..."]
            print(f"\n{label}: nums={shown} target={target}")
            for (name, _), got in zip(APPROACHES, results):
                print(f"  {name:<{width}} -> {got}")
            shown_cases += 1
        if disagreed:
            all_agreed = False
            print("  DISAGREEMENT")
        if bad_slot:
            all_agreed = False
            print("  INSERTING THERE DOES NOT KEEP THE ROW SORTED")

    print(f"\n{len(cases)} cases ({shown_cases} printed), {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
