# Search a Rotated Sorted Array — explained

## Understanding the Problem

Take an ascending array of distinct numbers, cut it once at an unknown point, and swap the two
pieces: `[0, 1, 2, 4, 5, 6, 7]` becomes `[4, 5, 6, 7, 0, 1, 2]`. Given that array and a target,
return the target's index, or `-1` if it is not there — in logarithmic time.

The rotation looks like it has destroyed the sortedness, and it has not. What it destroyed is one
thing only: **the guarantee that the whole array ascends from `nums[0]` to `nums[n-1]`**. What
survives is more than enough:

> The array is **two ascending runs** laid end to end, with every value in the first run larger than
> every value in the second. So if you cut anywhere, **at least one of the two pieces is still a
> plain sorted array** — because at most one piece can contain the seam.

**The core question:** given one probe, which half can I throw away? The naive approach is slow
because it never asks — it compares each element to the target and learns nothing about the other
`n − 1`, which is the behaviour of a search on unordered data. Every rung below is an attempt to
recover a decisive probe.

> **Intuition.** Cut the row in half at the midpoint and look at the two pieces. One of them runs
> uphill the whole way and one of them has the cliff in it. The uphill piece is a piece you can
> *interrogate*: a sorted range contains a value exactly when the value lies between its two ends,
> so two comparisons tell you, with certainty, whether the target is in there. If it is, search it.
> If it is not, the target is in the other piece or nowhere — and either way you have just halved
> the problem without ever finding out where the cliff is.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `1 <= nums.length <= 5000` | Small enough that `O(n)` would pass on a judge, so the `O(log n)` is **the problem's own requirement**, not a pressure from the input size. Also: never empty, so `nums[0]` and `nums[-1]` always exist, and `lo <= hi` holds at entry. |
| `-10^4 <= nums[i], target <= 10^4` | The target can be a value that is nowhere in the array, including one strictly between the two runs — `3` in `[4, 5, 6, 7, 0, 1, 2]`. The `-1` path is an ordinary outcome, not an error path. |
| **all values are distinct** | **This is the load-bearing constraint.** It is what makes `nums[lo] <= nums[mid]` a *decision* rather than a coin flip: with no equal values, the probe is on one definite side of the seam. It is also why a bare equality can be a hit — there is exactly one index per value, so "the index" is well defined. |
| a rotation of **zero** is still valid input | `[1, 2, 3]` unchanged is legal. Any formulation with a branch for "the rotated case" owes a branch for this one; the good formulation treats it as the case where the left half is sorted, every time, and needs nothing extra. |
| distinctness is what makes `log n` possible; duplicates break it | The constraints say this out loud, which is unusual and worth taking seriously — it is a signpost to the follow-up. The last approach here removes distinctness and measures the damage. |

The worked example used in every section below is the statement's own:

```
nums = [4, 5, 6, 7, 0, 1, 2], target = 0        answer: 4
```

The first run is `nums[0..3] = [4, 5, 6, 7]`, the second is `nums[4..6] = [0, 1, 2]`, and the seam
sits between index 3 and index 4. The target is the first element of the second run. The statement's
second example, `target = 3`, is the miss: `3` is above the second run's largest value and below the
first run's smallest, so it is in neither, and the answer is `-1`.

---

## Approach 1 — Scan for it

### The idea

*Where is the target?* Look at every element until you find it. This is what you would write if
nobody mentioned sorting, and writing it down makes its flaw precise: **each comparison resolves one
index and tells you nothing about any other.** A search that cannot rule out the elements it did not
read is condemned to read them all.

### How to think about it

> **Intuition.** Flipping through an unsorted stack of numbered cards looking for card 0. Every
> card you turn over is one card's worth of progress. There is no card you can turn over that lets
> you skip the rest of the stack — and *that* is the property the sortedness is supposed to buy
> you. When you find yourself writing a linear scan over sorted data, the question to ask is not
> "how do I make this loop faster", it is "what should one probe have told me?"

### Worked example

`nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0`.

| step | `i` | `nums[i]` | `== 0`? | indices ruled out so far |
|---|---|---|---|---|
| 1 | 0 | 4 | no | {0} |
| 2 | 1 | 5 | no | {0, 1} |
| 3 | 2 | 6 | no | {0, 1, 2} |
| 4 | 3 | 7 | no | {0, 1, 2, 3} |
| 5 | **4** | **0** | **yes** | return **4** |

Read the last column: after four comparisons, four indices are settled. The rungs below settle
*half of what remains* per comparison, which at `n = 5000` is the difference between 5000 reads and
13.

### Code

```python
def search_rotated_scan(nums: list[int], target: int) -> int:
    for i in range(len(nums)):
        if nums[i] == target:
            return i
    return -1
```

### Common mistake

> **Watch out.** The misconception is that a loop that returns early can also fall out of the
> bottom with the loop variable still meaning something. It cannot: after a `for` completes, `i` is
> the **last index visited**, not a verdict.

Returning `i` after the loop instead of `-1`:

```python
    for i in range(len(nums)):
        if nums[i] == target:
            return i
    return i          # WRONG — that is the last index, not "absent"
```

On the worked example this is invisible: the target is found at index 4 and the bad line never runs.
Search the same array for the statement's missing value `3` and it returns **6** instead of `-1` —
a perfectly plausible index, pointing at the value `2`. There is a second, nastier failure hiding in
it: on an empty array `i` is never bound at all and Python raises `NameError`, so the same line is
both a wrong answer and a crash depending on the input. (Here the constraints forbid the empty
array, which is why the crash is a footnote and the wrong index is the lesson.) **Absence needs its
own explicit return value**; it is never a leftover.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. The cost is one comparison per element, up to `n` of them, because no
comparison narrows anything but itself. Space is a loop counter.

Use it when the data genuinely has no order, and use it here as the **oracle** in a test harness —
its correctness is visible by reading, which is exactly what you need to cross-check the clever
versions. In an interview: one sentence, name the `O(n)`, and note that the problem has asked for
logarithmic, so this is a baseline being rejected rather than an answer being offered.

---

## Approach 2 — Find the seam, then binary-search one piece

### The idea

*If the obstacle is that the array is two runs, can I find where they join and then use ordinary
binary search?* Yes. Binary-search for the seam first — the standard rotated-minimum routine,
comparing the midpoint against the right end — which splits the array into two genuinely sorted
ranges. Then run a textbook binary search on each, or work out which one could hold the target and
search only that.

This fixes Approach 1's weakness — **no probe narrows the search** — and gets to `O(log n)`. It pays
for it by needing two searches and by making the pivot search a correctness dependency of its own:
if the seam is off by one, the second search is looking in a range that is not sorted.

### How to think about it

> **Intuition.** Repair the input, then use the tool you already trust. You have a broken ruler —
> two straight pieces taped together at a kink — and rather than learn to read a kinked ruler you
> first find the kink, then read whichever straight piece the measurement falls on. It is honest,
> it works, and it is more machinery than the job needs, because reading a kinked ruler turns out
> to be easy once you notice that any cut leaves one straight piece.

> **Why it works.** Phase one is exactly the rotated-minimum invariant: if `nums[mid] > nums[hi]`
> the seam is strictly right of `mid`, so `nums[lo..mid]` **cannot contain the minimum** and is
> discarded; otherwise `nums[mid..hi]` ascends with no break, so `nums[mid+1..hi]` **cannot contain
> the minimum** and `mid` is kept. The range closes on the seam index `p`. Phase two then rests on
> the fact that `nums[0..p-1]` and `nums[p..n-1]` are each strictly ascending, which is precisely
> what a textbook binary search needs; each one answers definitively, and the target is in exactly
> one of them or in neither.

### Worked example

`nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0`. **Phase one — find the seam:**

| iter | `lo` | `hi` | `mid` | `nums[mid]` | `nums[hi]` | greater? | new `lo`, `hi` |
|---|---|---|---|---|---|---|---|
| 1 | 0 | 6 | 3 | 7 | 2 | yes | `lo = 4`, `hi = 6` |
| 2 | 4 | 6 | 5 | 1 | 2 | no | `lo = 4`, `hi = 5` |
| 3 | 4 | 5 | 4 | 0 | 1 | no | `lo = 4`, `hi = 4` |

Seam at `p = 4`. The two sorted ranges are `nums[0..3] = [4, 5, 6, 7]` and `nums[4..6] = [0, 1, 2]`.

**Phase two — binary-search each range in turn:**

| range | `a` | `b` | `mid` | `nums[mid]` | vs `0` | action |
|---|---|---|---|---|---|---|
| `[0, 3]` | 0 | 3 | 1 | 5 | too big | `b = 0` |
| `[0, 3]` | 0 | 0 | 0 | 4 | too big | `b = -1`, range empty — not here |
| `[4, 6]` | 4 | 6 | 5 | 1 | too big | `b = 4` |
| `[4, 6]` | 4 | 4 | 4 | **0** | **hit** | return **4** |

Seven probes in total against Approach 4's three on the same input. Both are `O(log n)`; the constant
is roughly double, and every one of those probes is a line of code that can be wrong.

### Code

Two independent pieces, so the decision each one owns stays in one place:

```python
def _seam_index(nums: list[int]) -> int:
    """Index of the smallest element: the start of the second ascending run."""
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1  # seam is right of mid, so nums[lo..mid] cannot hold the minimum
        else:
            hi = mid  # nums[mid..hi] ascends, so nothing right of mid can be smaller
    return lo

def _binary_search(nums: list[int], target: int, lo: int, hi: int) -> int:
    """Textbook search over a range promised to be strictly ascending. -1 if absent."""
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

def search_rotated_find_seam(nums: list[int], target: int) -> int:
    seam = _seam_index(nums)
    for lo, hi in ((0, seam - 1), (seam, len(nums) - 1)):
        found = _binary_search(nums, target, lo, hi)
        if found != -1:
            return found
    return -1
```

`_binary_search` is the only place the compare-and-halve decision lives, and `_seam_index` is the
only place the rotation is reasoned about. Swap either and nothing else moves — which is the point
of splitting them.

### Common mistake

> **Watch out.** The misconception is that "search the piece the target belongs to" is a small
> optimisation over searching both. It is a **second algorithm** — you now have to decide range
> membership correctly, on top of searching — and it is where this rung usually breaks.

The tempting tightening is to pick the range instead of trying both:

```python
    if target >= nums[0]:
        return _binary_search(nums, target, 0, seam - 1)   # WRONG when there is no seam
    return _binary_search(nums, target, seam, len(nums) - 1)
```

On an un-rotated array — legal input, "a rotation of zero" — the seam is `0`, so the first range is
`(0, -1)`, which is empty, and every target that satisfies `target >= nums[0]` is looked for in
nothing. Searching `[1, 2, 3]` for `3` returns **-1** instead of 2. Trying **both** ranges, as the
code above does, costs one extra failed search of an empty or near-empty range and removes the whole
class of bug: an empty range makes `lo <= hi` false immediately and returns `-1` without a single
probe. That is the lazy option and the correct one at the same time.

### Complexity and when to use this

**Time** `O(log n)`, **space** `O(1)`. The cost is three separate logarithms — one to find the seam and up
to two textbook searches — so roughly `3 log n` probes against `log n` for the single-pass version.
Space is a handful of integers; the helper calls are iterative, so there is no stack growth.

Use it when the array is searched **many times**: compute the seam once, cache it, and every
subsequent query is a plain binary search over a rotated array you have already understood. That is
a real scenario, and it is the honest argument for this rung. For a single query it is strictly more
code and more probes than the next rungs.

---

## Approach 3 — Search the *unrotated* index space *(an addition — not in the data file)*

### The idea

*If the seam is known, why search two ranges rather than repair the indexing?* The array is a
rotation, so the element that *would* be at sorted position `i` is sitting at physical index
`(seam + i) % n`. Find the seam, then run one textbook binary search over `0 .. n-1` reading through
that translation, and convert the answer back at the end.

This fixes Approach 2's weakness — **two ranges, two searches, and a membership question between
them** — by making the rotation disappear into an index expression. One search, one range, and the
compare-and-halve logic is unmodified.

### How to think about it

> **Intuition.** You are not fixing the array, you are fixing your **reading glasses**. Behind the
> rotation there is a perfectly sorted array; the rotation is a relabelling of where each element
> physically lives. So keep the search you already trust and put a translator in front of every
> read: "when I ask for the `i`-th smallest, hand me physical slot `(seam + i) mod n`." The search
> never learns the array was rotated. This is the same move as flattening a matrix into one sorted
> list — a re-indexing that makes an unfamiliar structure into a familiar one — and it is worth
> recognising as a move rather than a trick.

> **Why it works.** Define `view(i) = nums[(seam + i) % n]`. Because `nums` is a rotation of a
> sorted array with its minimum at `seam`, `view(0) < view(1) < … < view(n-1)`: the mapping walks
> the second run to its end and then wraps to the first run, whose values are all larger. So `view`
> is strictly ascending, and a textbook binary search over it is correct by the textbook argument —
> when `view(mid) < target`, **`view(0..mid)` cannot contain the target** because all of it is at
> most `view(mid)`, and symmetrically above. The returned sorted position `i` is converted once at
> the end to the physical index `(seam + i) % n`.

### Worked example

`nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0`, `n = 7`. Phase one finds `seam = 4` exactly as in
Approach 2 (three probes, same table). The view is then:

```
sorted position i      0  1  2  3  4  5  6
physical (4 + i) % 7   4  5  6  0  1  2  3
view(i) = nums[...]    0  1  2  4  5  6  7      <- strictly ascending, by construction
```

| iter | `lo` | `hi` | `mid` | physical `(4+mid) % 7` | `view(mid)` | vs `0` | new `lo`, `hi` |
|---|---|---|---|---|---|---|---|
| 1 | 0 | 6 | 3 | 0 | 4 | too big | `lo = 0`, `hi = 2` |
| 2 | 0 | 2 | 1 | 5 | 1 | too big | `lo = 0`, `hi = 0` |
| 3 | 0 | 0 | 0 | **4** | **0** | **hit** | sorted position 0 → physical **4** |

Six probes in total (three for the seam, three for the search), against Approach 2's seven and
Approach 4's three. The win over Approach 2 is not the probe count — it is that the search half has
**no rotation logic in it at all**.

### Code

```python
def search_rotated_index_rotation(nums: list[int], target: int) -> int:
    n = len(nums)
    seam = _seam_index(nums)  # reuses Approach 2's helper: this rung differs only after it
    lo, hi = 0, n - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        value = nums[(seam + mid) % n]  # read through the translation; the search never sees it
        if value == target:
            return (seam + mid) % n
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```

The modular read appears twice and means the same thing both times: **sorted position to physical
index**. If you wanted to change the direction of the rotation, those are the only two places to
edit.

### Common mistake

> **Watch out.** The misconception is that a search returns "the answer". It returns an answer *in
> the coordinate system it was searching*, and here that is the sorted coordinate system, not the
> array's. Forgetting the conversion back is not an off-by-one; it is a **units error**.

Returning `mid` instead of `(seam + mid) % n`:

```python
        if value == target:
            return mid        # WRONG — that is the sorted position, not the array index
```

On the worked example this returns **0** instead of 4. The value `0` is a legal-looking index, and it
is the index of the value `4` — so a caller checking `nums[result] == target` catches it and a caller
that trusts the number does not. The number happens to *equal* the target here, which makes it
especially easy to eyeball as correct. The fix is not to be careful; it is to convert exactly once,
at the boundary, and never let the two coordinate systems share a variable name.

### Complexity and when to use this

**Time** `O(log n)`, **space** `O(1)`. Two logarithms — the seam search and the view search — so about
`2 log n` probes. The modulo is one integer operation per probe and does not change the class. Space
is constant.

Use it when the re-indexing is the clearer story: it is the version to reach for if the array is
also being *sliced* or *iterated* in sorted order elsewhere, since `view(i)` is reusable for those
too. It is also worth knowing as the bridge to `search-2d-matrix`, where the same move — one index
expression turning an awkward layout into a plain sorted sequence — is the entire solution. For a
single lookup, the next rung does it in one pass and never computes the seam at all.

---

## Approach 4 — One pass: which half is sorted?

### The idea

*Do I need the seam at all?* No. At every step, one of the two halves around `mid` is guaranteed
seam-free and therefore plainly sorted — comparing `nums[mid]` against `nums[lo]` says which. A
sorted range contains the target exactly when the target lies between its two ends, so two
comparisons settle whether to go into that half or the other one.

This fixes the weakness shared by Approaches 2 and 3 — **both compute the seam as a separate phase,
whose correctness must be established before the actual search means anything.** Here the same
probe that halves the range also identifies the ordered side. One loop, no phases, no pivot.

### How to think about it

> **Intuition.** Three questions per probe, in this order, and the algorithm *is* those three
> questions: **which half is sorted?** — then **is the target inside that sorted half?** — and
> therefore **which half do I discard?** The reason this needs no pivot hunt is that you never care
> where the cliff is; you only care that it is not in the half you are about to interrogate. Write
> the code as those three lines and it stays readable. Write it as "handle the rotated case" and it
> becomes a thicket of conditions that you will not be able to re-derive next month.

> **Why it works.** At each iteration the invariant is: *if the target is anywhere in the array, its
> index is inside `[lo, hi]`.* Both branches preserve it by naming what the discarded half cannot
> contain.
>
> *If `nums[lo] <= nums[mid]`:* the window's left half `nums[lo..mid]` contains no seam, so it is
> strictly ascending. A strictly ascending range holds the target **iff**
> `nums[lo] <= target < nums[mid]` (strict at the top because `nums[mid] != target` — that was
> checked first). If that test passes, **the right half cannot contain the target**: everything in
> `nums[mid+1..hi]` is either above `nums[mid]` in the first run or below `nums[lo]` in the second,
> and the target is in neither band. If it fails, **the left half cannot contain the target** — the
> membership test for a sorted range is exact, so a failure is a proof of absence, not an
> inconclusive result.
>
> *Otherwise (`nums[lo] > nums[mid]`):* the seam is in the left half, so the **right** half
> `nums[mid..hi]` is the ascending one, and the mirror-image argument applies with the test
> `nums[mid] < target <= nums[hi]`.
>
> The window shrinks by at least one index per iteration (`mid` is always excluded from both
> branches' assignments), and the loop exits when `lo > hi`, at which point the invariant says the
> target is in an empty range — that is, absent.
>
> The exactness of "a sorted range holds `v` iff `v` lies between its ends" is doing all the work,
> and it is the sentence to say out loud. It is why one probe is enough.

### Worked example

`nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0`.

| iter | `lo` | `hi` | `mid` | `nums[mid]` | hit? | `nums[lo] <= nums[mid]`? | sorted half | target inside it? | new `lo`, `hi` |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 6 | 3 | 7 | no | `4 <= 7` yes | left `[4, 5, 6, 7]` | `4 <= 0 < 7`? **no** | `lo = 4`, `hi = 6` |
| 2 | 4 | 6 | 5 | 1 | no | `0 <= 1` yes | left `[0, 1]` | `0 <= 0 < 1`? **yes** | `lo = 4`, `hi = 4` |
| 3 | 4 | 4 | 4 | **0** | **yes** | — | — | — | return **4** |

Three probes, no seam ever computed. Note iteration 2: the window is `[4, 6]` and the "left half" is
`nums[4..5] = [0, 1]` — the sorted-half test is about the *current window*, not the original array,
which is why `nums[lo]` and not `nums[0]` is the anchor.

And the statement's miss, `target = 3`, on the same array:

| iter | `lo` | `hi` | `mid` | `nums[mid]` | `nums[lo] <= nums[mid]`? | sorted half | `3` inside it? | new `lo`, `hi` |
|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 6 | 3 | 7 | `4 <= 7` yes | left `[4..7]` | `4 <= 3 < 7`? no | `lo = 4`, `hi = 6` |
| 2 | 4 | 6 | 5 | 1 | `0 <= 1` yes | left `[0, 1]` | `0 <= 3 < 1`? no | `lo = 6`, `hi = 6` |
| 3 | 6 | 6 | 6 | 2 | `2 <= 2` yes | left `[2]` | `2 <= 3 < 2`? no | `lo = 7`, `hi = 6` |
| — | 7 | 6 | — | — | — | `lo > hi` | — | return **-1** |

Iteration 3 is the row that justifies the `<=` in the sorted-half test: with `lo == mid == hi` the
comparison is `nums[mid] <= nums[mid]`, which is only true for `<=`. The next section is what happens
when it is not.

### Code

```python
def search_rotated_one_pass(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:  # left half is seam-free, so it is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1  # target is inside the sorted left half
            else:
                lo = mid + 1  # a sorted range's membership test is exact: it is NOT here
        else:  # the seam is on the left, so the right half is the sorted one
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
```

Ten lines, and the structure mirrors the three questions exactly: the outer `if` answers "which half
is sorted", the inner `if` answers "is the target inside it", and the assignment answers "which half
do I discard". A change to any one of the three is a change to one line.

### Common mistake

> **Watch out.** The misconception is that `nums[lo] <= nums[mid]` and `nums[lo] < nums[mid]` differ
> only when two elements are equal — and since the values are distinct, that never happens. It does
> happen, constantly: `lo` and `mid` are the **same index** whenever the window has one or two
> elements, and then `nums[lo] < nums[mid]` is comparing a value to itself.

Writing the sorted-half test strictly:

```python
        if nums[lo] < nums[mid]:     # WRONG — false whenever lo == mid, i.e. every 1- or 2-wide window
```

On the worked example this is **invisible**: it still returns **4**, because the target is found
before any window narrows to two elements. Run it on `nums = [3, 1]` with `target = 1` and it returns
**-1** instead of 1. Trace it: `lo = 0`, `hi = 1`, `mid = 0`, so the test is `nums[0] < nums[0]`,
false — the code concludes "the right half is the sorted one", tests `nums[0] < 1 <= nums[1]`, i.e.
`3 < 1`, false, and sets `hi = -1`. The loop exits reporting absence, having never looked at index 1.
The same failure appears on `[1, 0]` searching for `0`, and on `[1, 2, 3, 0]` searching for `0`: the
window narrows to a two-element tail and the search walks away from it.

`mid = (lo + hi) // 2` rounds down, so `mid == lo` on every two-wide window. **That is not an edge
case, it is the last step of most searches.** In Java and C++ the same line is also where overflow
lives — `lo + (hi - lo) / 2` is the form used in the data file's Java and C++ for that reason; in
Python integers do not overflow, so `(lo + hi) // 2` is safe here and only here.

### Complexity and when to use this

**Time** `O(log n)`, **space** `O(1)`. Every iteration excludes `mid` and at least half of the remaining
window, so the probe count is `⌈log₂ n⌉` — 13 at `n = 5000`. The per-iteration work is four integer
comparisons at worst, which is the whole constant factor: one logarithm, not two or three. Space is
three integers, and the loop is iterative, so there is no stack.

**This is the one to write.** It is the shortest correct solution, it needs no second phase whose
correctness must be argued separately, and it is the version interviewers expect. The assumption it
depends on is the one the constraints hand you — **distinct values** — and the next section removes
it.

---

## Approach 5 — When the values are **not** distinct *(an addition — the standard follow-up)*

### The idea

*What if duplicates are allowed?* Then `nums[lo] == nums[mid]` tells you nothing about which half is
sorted, so the decisive probe stops being decisive. There is no half you can discard — only one
element. The repair is a third branch that advances `lo` by exactly one, and the price is a linear
worst case.

This does not improve on Approach 4; it **relaxes the assumption Approach 4 rests on**, and it is the
follow-up you will be asked for. The answer has to be returned as a boolean or "any matching index",
because with duplicates there is no longer a single index per value.

### How to think about it

> **Intuition.** Look at `[3, 3, 3, 1, 3]` and `[3, 1, 3, 3, 3]`. Probe the middle of each: in both,
> `nums[lo]`, `nums[mid]` and `nums[hi]` are all `3`. The seam is right of the middle in the first
> and left of it in the second, and **from the three values in your hand the two arrays are
> identical**. So any rule that picks a half is guessing, and on one of the two arrays the guess is
> wrong. What you can still say is much smaller and still true: `nums[lo]` is not the target (you
> checked `nums[mid]`, and they are equal), so index `lo` can be retired. One index, not a half.

> **Why it works.** The two strict branches are Approach 4's, unchanged, and still discard halves
> that provably cannot hold the target. The new branch fires only when `nums[lo] == nums[mid]` and
> `nums[mid] != target`, so `nums[lo] != target` too, and retiring index `lo` **cannot lose an
> occurrence of the target**. The invariant "if the target is present, an index holding it is in
> `[lo, hi]`" therefore survives — weakened from *the* index to *an* index, which is the honest
> statement once duplicates exist. Termination is unchanged: every branch strictly narrows the
> window.

### Worked example

On this document's array `nums = [4, 5, 6, 7, 0, 1, 2]` the values are distinct, the tie branch never
fires, and the trace is Approach 4's three rows returning index **4**. The section earns its keep on
an array the other approaches were never promised:

`nums = [3, 3, 3, 1, 3]`, `target = 1`.

| iter | `lo` | `hi` | `mid` | `nums[mid]` | hit? | `nums[lo]` vs `nums[mid]` | branch | new `lo`, `hi` |
|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 4 | 2 | 3 | no | `3 == 3` | **ambiguous** → `lo += 1` | `lo = 1`, `hi = 4` |
| 2 | 1 | 4 | 2 | 3 | no | `3 == 3` | **ambiguous** → `lo += 1` | `lo = 2`, `hi = 4` |
| 3 | 2 | 4 | 3 | **1** | **yes** | — | — | return **3** |

Two wasted probes before the third one lands — and the pattern generalises badly.
`nums = [3, 3, 3, 3, 3]` with `target = 1`: every probe finds `nums[lo] == nums[mid]`, every iteration
retires one index, and the loop runs `n` times. Measured on 5000 identical values with an absent
target: **5000 iterations**, against 13 for a distinct array of the same length.

### Code

```python
def search_rotated_with_duplicates(nums: list[int], target: int) -> int:
    """Returns SOME index holding target, or -1. With duplicates 'the' index is not defined."""
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] == nums[mid]:
            lo += 1  # ambiguous: nums[lo] is not the target either, so retire ONE index
        elif nums[lo] < nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
```

The tie is checked **first**, and that ordering is the whole design: once the ambiguous case has its
own branch, the two remaining branches can use strict comparisons and are exactly Approach 4's.

### Common mistake

> **Watch out.** The misconception is that duplicates are absorbed by the comparison you already
> have — that keeping `nums[lo] <= nums[mid]` and letting ties fall into the "left is sorted" branch
> is close enough. A tie is not a small greater-than; it is the **absence of information**, and a
> branch acting on it is acting on nothing.

Letting ties ride in the "left half is sorted" branch is Approach 4's code applied unchanged to
duplicate-bearing input. Over the 20 000 random rotated arrays drawn from the values `0..2` that this
document's script generates, it reports the wrong answer **56 times** — where "wrong" means it
returns `-1` for a target that is present, or an index whose value is not the target. The mirror
guess, folding ties into the "right half is sorted" branch with `nums[lo] < nums[mid]`, is wrong
**992 times** on the same inputs.

Read that pair of numbers carefully, because it is the real lesson and it is the opposite of
reassuring. **56 failures in 20 000 is a bug you will ship.** A hand-written test suite will not
contain the case; a hundred random trials will probably not either; and the failure it produces is
a plausible `-1` on a target that is right there in the array. The mirror version, failing eighteen
times as often, is by that measure the *safer* mistake — you would find it. Only the one-index
retreat is sound, and it is right on all 50 000 duplicate-laden cases in the stress test.

The mitigation, when you control the input rather than the algorithm: **de-duplicate**. A rotated
array with duplicates removed is a rotated array of distinct values, and Approach 4 applies again in
full. If the duplicates carry meaning, store one index list per value and search the distinct
values — the `O(n)` worst case is otherwise unavoidable, because `n − 1` copies of one value hiding a
single different one force any correct algorithm to read almost everything.

### Complexity and when to use this

**Time** `O(log n)` average, **`O(n)` worst case**; **space** `O(1)`. The split is the lesson: the two
strict branches halve the window, while the tie branch retires a single index. On input with few
ties this is indistinguishable from Approach 4; on all-equal input it degrades to a scan with extra
comparisons. The worst case is **information-theoretic**, not an implementation flaw — with `n − 1`
equal values concealing one different one, no algorithm can rule out a position it has not read.

Use it whenever distinctness is not promised, and say the worst case out loud. In an interview this
is almost always the follow-up to Approach 4, and the strongest answer names the `O(n)` *and* says
why it is unavoidable.

---

## The Overall Arc

Every rung chases one principle — **make a single probe decisive** — and the reframing that makes
that possible arrives before any code: rotation does not destroy the order, it destroys only the
promise that the *whole* array ascends, and since a rotation has exactly one seam, any cut leaves at
least one piece that is still plainly sorted. The linear scan declines the reframing and pays for it
exactly: each comparison resolves one index and nothing else, so all `n` must be read. The first
real idea is to repair the input — binary-search for the seam, which splits the array into two
genuinely sorted ranges, then run a textbook search on each — and it works, reaching `O(log n)` at
the cost of three logarithms and a pivot phase whose correctness has to be established before the
search phase means anything. The re-indexing rung sharpens that into something more transferable: if
the seam is known, the element at sorted position `i` lives at physical slot `(seam + i) mod n`, so
put a translator in front of every read and the search itself needs no knowledge of the rotation at
all — the same move that turns a fully sorted matrix into one sorted array, and worth recognising as
a move rather than a trick. But both of those still locate the seam, and the seam was never the
question. The single-pass version asks three questions of one probe — which half is sorted, is the
target inside that sorted half, and therefore which half do I discard — and the middle question is
answerable with certainty because **a sorted range contains a value exactly when the value lies
between its ends**, which makes a failed membership test a *proof of absence* rather than an
inconclusive result. That exactness is the whole algorithm; it is why one comparison against an end
replaces an entire pivot search, and it is the same probe-against-an-end reasoning that finds the
minimum in the problem next door. The last rung then withdraws the promise everything above leans
on. Distinctness is precisely what makes `nums[lo] <= nums[mid]` a decision; with duplicates,
`[3, 3, 3, 1, 3]` and `[3, 1, 3, 3, 3]` present identical evidence to a probe while having their
seams on opposite sides, so no half can be discarded and the honest repair retires one index at a
time for an `O(n)` worst case no algorithm can beat. Scan, repair the array, repair the indexing,
repair nothing and interrogate the ordered half — and then know exactly which promise that last step
was spending.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Scan for it | `O(n)` | `O(1)` | Uses no order at all, so nothing can go subtly wrong — and nothing can go fast | The oracle in a test harness; genuinely unordered data |
| Find the seam, then search a piece | `O(log n)` | `O(1)` | Three logarithms and a pivot phase that must be right before the search means anything | The same array is searched many times — find the seam once and cache it |
| Search the unrotated index space | `O(log n)` | `O(1)` | Two logarithms; the rotation vanishes into one index expression, so the search is textbook | You also need sorted-order access or slicing; and as the bridge to `search-2d-matrix` |
| **One pass: which half is sorted** | **`O(log n)`** | **`O(1)`** | **One logarithm, no phases; needs distinct values to keep the probe decisive** | **The default answer, and the one to write in an interview** |
| Duplicate-tolerant | `O(log n)` avg, `O(n)` worst | `O(1)` | Retires one index when the comparison says nothing — correctness bought with the guarantee | Values are not promised distinct: the standard follow-up |

---

## Interview Priority

> **In an interview.** Lead with the structural sentence, not the code: *"a rotation has one seam,
> so any cut leaves at least one half plainly sorted — and a sorted range contains a value exactly
> when the value lies between its ends, so one probe can be decisive."* Then write the single pass
> and narrate it as the three questions: which half is sorted, is the target inside it, which half
> do I discard. Two follow-ups are near-certain. **"Why `<=` and not `<`?"** — because `lo == mid`
> on every one- and two-element window, so strict comparison is comparing a value to itself, and
> `[3, 1]` searching for `1` returns `-1`. **"What about duplicates?"** — the probe stops being
> decisive, you retire one index instead of discarding a half, and the worst case becomes `O(n)` and
> cannot be better.

**Memorize cold — the single pass (Approach 4).** Ten lines, and reconstructible from the invariant
rather than from memory: identify the sorted half against `nums[lo]`, test membership against that
half's two ends, discard the other. Practise until the `<=` is automatic — it is the difference
between a correct solution and one that returns `-1` on a two-element window, and it is invisible on
the example everyone tests with.

**Memorize cold — the two membership tests.** `nums[lo] <= target < nums[mid]` for a sorted left
half, `nums[mid] < target <= nums[hi]` for a sorted right half. The asymmetry is not arbitrary: the
strict end is always the one at `mid`, because `nums[mid] == target` was already handled and ruled
out. Being able to say *why* the brackets fall that way is what separates having derived this from
having memorised it.

**Worth understanding, not memorizing — the seam-then-search version (Approach 2).** Know it exists,
know it is also `O(log n)`, and know the one situation where it is genuinely better: many queries
against the same array, where the seam is computed once and cached. Offer it as the answer to "what
if I search this array a thousand times?" — that question is asked, and the single pass is the wrong
answer to it.

**Worth understanding, not memorizing — the index rotation (Approach 3).** Not for this problem, but
for the habit: before inventing a new algorithm for an awkward layout, look for a re-indexing that
turns it into a familiar one. That habit is the whole of `search-2d-matrix` and half of the
flattened-structure problems you will meet.

**Not worth memorizing — the linear scan.** But say it, name its `O(n)`, and reject it on the
problem's stated logarithmic requirement inside thirty seconds. Naming the baseline and killing it
on a stated constraint is scored; skipping it looks like you did not consider it.

---

## Full Runnable Script

Every approach above, plus a test suite covering both statement examples, the smallest legal input,
un-rotated arrays, seams at either extreme, targets that fall between the two runs, targets outside
the whole range, every rotation of several small arrays searched for every plausible target, and 600
randomised distinct cases — all cross-checked against a linear scan. The duplicate-tolerant approach
is then checked separately on 50 000 random arrays **with** duplicates, where the other four are not
promised to work, alongside the two folded-tie guesses whose failure counts Approach 5 quotes, and
the buggy variants whose specific wrong answers are quoted in the text.

```python
"""Search a Rotated Sorted Array - every approach in one file, plus a self-checking test suite.

Run: python search_rotated_all.py
"""

from __future__ import annotations

import random

# --- shared scaffolding (harness and helpers, not answers in themselves) -------

def _seam_index(nums: list[int]) -> int:
    """Index of the smallest element: the start of the second ascending run."""
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1  # seam is right of mid, so nums[lo..mid] cannot hold the minimum
        else:
            hi = mid  # nums[mid..hi] ascends, so nothing right of mid can be smaller
    return lo

def _binary_search(nums: list[int], target: int, lo: int, hi: int) -> int:
    """Textbook search over a range promised to be strictly ascending. -1 if absent."""
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

# --- 1. Scan for it -----------------------------------------------------------

def search_rotated_scan(nums: list[int], target: int) -> int:
    for i in range(len(nums)):
        if nums[i] == target:
            return i
    return -1

# --- 2. Find the seam, then binary-search each sorted piece -------------------

def search_rotated_find_seam(nums: list[int], target: int) -> int:
    seam = _seam_index(nums)
    for lo, hi in ((0, seam - 1), (seam, len(nums) - 1)):
        found = _binary_search(nums, target, lo, hi)
        if found != -1:
            return found
    return -1

# --- 3. Search the unrotated index space --------------------------------------

def search_rotated_index_rotation(nums: list[int], target: int) -> int:
    n = len(nums)
    seam = _seam_index(nums)
    lo, hi = 0, n - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        value = nums[(seam + mid) % n]  # read through the translation; the search never sees it
        if value == target:
            return (seam + mid) % n
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

# --- 4. One pass: which half is sorted? (optimal) -----------------------------

def search_rotated_one_pass(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:  # left half is seam-free, so it is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1  # target is inside the sorted left half
            else:
                lo = mid + 1  # a sorted range's membership test is exact: it is NOT here
        else:  # the seam is on the left, so the right half is the sorted one
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

# --- 5. Duplicate-tolerant (O(n) worst case, and that is unavoidable) ---------

def search_rotated_with_duplicates(nums: list[int], target: int) -> int:
    """Returns SOME index holding target, or -1. With duplicates 'the' index is not defined."""
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] == nums[mid]:
            lo += 1  # ambiguous: nums[lo] is not the target either, so retire ONE index
        elif nums[lo] < nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

APPROACHES = [
    ("scan", search_rotated_scan),
    ("find_seam", search_rotated_find_seam),
    ("index_rotation", search_rotated_index_rotation),
    ("one_pass", search_rotated_one_pass),
    ("with_duplicates", search_rotated_with_duplicates),
]

# --- the buggy variants, kept ONLY so the document's quoted numbers stay honest

def _bug_return_i_when_absent(nums: list[int], target: int) -> int:
    i = -1
    for i in range(len(nums)):
        if nums[i] == target:
            return i
    return i  # WRONG: the last index visited, not "absent"

def _bug_pick_one_range(nums: list[int], target: int) -> int:
    seam = _seam_index(nums)
    if target >= nums[0]:
        return _binary_search(nums, target, 0, seam - 1)  # WRONG when there is no seam
    return _binary_search(nums, target, seam, len(nums) - 1)

def _bug_return_sorted_position(nums: list[int], target: int) -> int:
    n = len(nums)
    seam = _seam_index(nums)
    lo, hi = 0, n - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        value = nums[(seam + mid) % n]
        if value == target:
            return mid  # WRONG: sorted position, not array index
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

def _bug_strict_sorted_half(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] < nums[mid]:  # WRONG: false whenever lo == mid
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

def _fold_tie_left_sorted(nums: list[int], target: int) -> int:
    """Approach 4 unchanged: ties ride in the 'left half is sorted' branch."""
    return search_rotated_one_pass(nums, target)

def _fold_tie_right_sorted(nums: list[int], target: int) -> int:
    """Ties ride in the 'right half is sorted' branch instead."""
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] < nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

def rotations(values: list[int]) -> list[list[int]]:
    """Scaffolding, not an answer: every rotation of a sorted list."""
    s = sorted(values)
    return [s[r:] + s[:r] for r in range(len(s))]

def index_ok(nums: list[int], target: int, got: int) -> bool:
    """A returned index is right if it holds the target, or is -1 when the target is absent."""
    if got == -1:
        return target not in nums
    return 0 <= got < len(nums) and nums[got] == target

def main() -> None:
    cases: list[tuple[str, list[int], int]] = [
        ("statement example", [4, 5, 6, 7, 0, 1, 2], 0),
        ("statement miss, between the runs", [4, 5, 6, 7, 0, 1, 2], 3),
        ("smallest legal input, hit", [7], 7),
        ("smallest legal input, miss", [7], 3),
        ("rotation by zero, last element", [1, 2, 3], 3),
        ("rotation by zero, first element", [1, 2, 3], 1),
        ("two elements, the '<' trap", [3, 1], 1),
        ("two elements, the '<' trap mirrored", [1, 0], 0),
        ("four elements, tail is the target", [1, 2, 3, 0], 0),
        ("seam at the very end", [2, 3, 4, 5, 6, 1], 1),
        ("seam right after the front", [6, 1, 2, 3, 4, 5], 6),
        ("target below the whole range", [4, 5, 6, 7, 0, 1, 2], -10_000),
        ("target above the whole range", [4, 5, 6, 7, 0, 1, 2], 10_000),
        ("all negative", [-1, -5, -4, -3, -2], -5),
        ("spans zero", [3, 4, -100, -1, 0, 2], 0),
    ]
    for base in ([1, 2, 3, 4], [10, 20, 30, 40, 50], [-3, -1, 0, 4, 9, 11, 12]):
        for arr in rotations(base):
            for t in base + [min(base) - 1, max(base) + 1, 5]:
                cases.append((f"exhaustive over rotations of {base}", arr, t))

    rng = random.Random(20260912)
    for _ in range(600):
        n = rng.randint(1, 40)
        base = rng.sample(range(-10_000, 10_001), n)
        arr = rng.choice(rotations(base))
        target = rng.choice(arr) if rng.random() < 0.6 else rng.randint(-10_000, 10_000)
        cases.append((f"stress distinct n={n}", arr, target))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True
    shown = 0

    for label, nums, target in cases:
        verbose = shown < 10
        if verbose:
            shown += 1
            print(f"\n{label}: nums={nums} target={target}")
        want = search_rotated_scan(nums, target)
        for name, fn in APPROACHES:
            got = fn(list(nums), target)
            if verbose:
                print(f"  {name:<{width}} -> {got}")
            # distinct values, so the correct index is unique and the scan's answer is it
            if got != want or not index_ok(nums, target, got):
                all_agreed = False
                print(f"  DISAGREEMENT {name} on {label}: {nums} target={target} -> {got}, want {want}")

    print(f"\n{len(cases)} distinct-value cases, {len(APPROACHES)} approaches, all cross-checked against the scan.")

    # --- the numbers the document quotes, re-measured ---------------------------
    print("\nquoted numbers, re-measured:")
    print(f"  return i when absent, [4,5,6,7,0,1,2] target 3  -> {_bug_return_i_when_absent([4, 5, 6, 7, 0, 1, 2], 3)}  (document says 6)")
    print(f"  pick one range, [1,2,3] target 3                -> {_bug_pick_one_range([1, 2, 3], 3)}  (document says -1)")
    print(f"  return sorted position, statement example        -> {_bug_return_sorted_position([4, 5, 6, 7, 0, 1, 2], 0)}  (document says 0)")
    print(f"  strict sorted-half test, statement example      -> {_bug_strict_sorted_half([4, 5, 6, 7, 0, 1, 2], 0)}  (document says 4, i.e. invisible)")
    print(f"  strict sorted-half test, [3,1] target 1         -> {_bug_strict_sorted_half([3, 1], 1)}  (document says -1)")
    print(f"  strict sorted-half test, [1,0] target 0         -> {_bug_strict_sorted_half([1, 0], 0)}  (document says -1)")
    print(f"  strict sorted-half test, [1,2,3,0] target 0     -> {_bug_strict_sorted_half([1, 2, 3, 0], 0)}  (document says -1)")

    # --- duplicates: only approaches 1 and 5 are promised to work here ---------
    dup_bad = 0
    fold_left_bad = fold_right_bad = 0
    seen = 0
    for _ in range(50_000):
        n = rng.randint(1, 12)
        base = sorted(rng.randint(0, 2) for _ in range(n))
        arr = rng.choice(rotations(base))
        target = rng.randint(0, 3)
        if not index_ok(arr, target, search_rotated_with_duplicates(list(arr), target)):
            dup_bad += 1
        if seen < 20_000:
            seen += 1
            if not index_ok(arr, target, _fold_tie_left_sorted(list(arr), target)):
                fold_left_bad += 1
            if not index_ok(arr, target, _fold_tie_right_sorted(list(arr), target)):
                fold_right_bad += 1

    identical = [7] * 5000
    lo, hi, probes = 0, 4999, 0
    while lo <= hi:  # the tie branch's cost on the worst input there is
        probes += 1
        mid = (lo + hi) // 2
        if identical[mid] == 1:
            break
        if identical[lo] == identical[mid]:
            lo += 1
        elif identical[lo] < identical[mid]:
            lo = mid + 1
        else:
            hi = mid - 1

    print("\nduplicates, 50000 random rotations of values drawn from 0..2:")
    print(f"  with_duplicates wrong                         {dup_bad} times")
    print(f"  ties in the 'left is sorted' branch  (<=)     {fold_left_bad} times of the first 20000  (document says 56)")
    print(f"  ties in the 'right is sorted' branch (<)      {fold_right_bad} times of the first 20000  (document says 992)")
    print(f"  probes on 5000 identical values, absent target: {probes}  (document says 5000; a distinct array takes 13)")
    if dup_bad:
        all_agreed = False

    print(
        "\nALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "\nMISMATCH: the approaches did NOT all agree."
    )

if __name__ == "__main__":
    main()
```
