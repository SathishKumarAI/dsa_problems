# What Both Arrays Hold — explained

## Understanding the Problem

You are handed two integer arrays. Return the values they have in common — but with a twist that is
the entire problem: a value appears in the answer as many times as it appears in **both** arrays.
Three 1s on the left and two on the right yield two 1s, not one and not five. Neither array is sorted,
either may repeat values, and the judge accepts the answer in any order.

**The core question is: for each value, how many copies can both sides supply at once?** The naive
approach is slow because it answers that by re-scanning the whole right-hand array for every element
of the left, so two arrays of 1,000 elements cost a million comparisons — and it needs a side table of
"already claimed" flags just to stay correct.

Note what the core question is *not*. It is not "is this value present?" That is the set-intersection
problem, a different question with a different answer, and confusing the two is the single most common
way to get this wrong. **The answer's count for a value is `min(count in nums1, count in nums2)`.**
Everything below is a different way of computing that minimum.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| `1 <= nums1.length, nums2.length <= 1000` | Small enough that even the quadratic rung finishes. The interest here is not survival, it is which structure fits the shape of the data. Both arrays always have at least one element, so neither is ever empty. |
| `0 <= nums1[i], nums2[i] <= 1000` | Values are small, dense, non-negative integers. That makes every hash operation cheap in practice, and it means a flat array of 1001 counters would work in place of a map — worth knowing, though the map is what generalises. |
| **multiplicity is `min(count₁, count₂)`** | The load-bearing one. It turns this from a membership problem into a **counting** problem, and it is what disqualifies the obvious `set(nums1) & set(nums2)` one-liner. |
| neither array is sorted, and both may hold duplicates | Sortedness is available only if you pay for it, which is what the second rung does — and it mutates or copies to get there. |
| any order is accepted; this repo returns ascending | So there is exactly one canonical result to compare against. Any cross-check must sort both sides first. |
| **the follow-up: `nums2` is enormous and can only be streamed once** | This is the real lesson, and it is what separates the last rung from the one before it. If one array cannot fit in memory, the extra space has to be bounded by the **smaller** one. |

The shape of the ladder: every rung computes the same minimum, and what changes is where the
bookkeeping lives and how big it is allowed to get.

---

## Approach 1 — Cross off with used flags

### The idea

*How do I know whether a value on the left has a partner on the right?* Scan the right-hand array
looking for it. *And how do I stop one copy on the right from answering for three copies on the left?*
Mark each right-hand element the moment it is claimed, and never claim it twice. This is the baseline,
and the flags are not an optimisation — they are what makes it *correct*.

### How to think about it

Two rows of tokens on a table. You pick up a token from the left row and walk along the right row
looking for a token with the same number on it that has not already been turned face-down. Find one,
turn it face-down, and put a matching token in the answer pile. Find none, and the left token is
discarded. The face-down markers are the whole trick: without them, a single `2` on the right would
pair with every `2` on the left, and the answer would report more copies than the right side actually
holds.

This is the rung that makes the minimum rule visible as a *physical* constraint — you run out of
tokens — rather than as a formula. Every later rung is a cheaper way of running out.

### Worked example

Input: `nums1 = [4, 9, 5]`, `nums2 = [9, 4, 9, 8, 4]` — the same pair traced through every approach in
this document. The expected answer is `[4, 9]`: the right side holds two 9s, but the left side holds
only one, so `min(1, 2) = 1`.

`used` starts as five `False` flags, one per element of `nums2`.

| Left value | Walk along `nums2` | Result | `used` after | Answer |
|---|---|---|---|---|
| 4 | j=0: 9, no. j=1: **4, unclaimed** | claim index 1 | `[F, T, F, F, F]` | `[4]` |
| 9 | j=0: **9, unclaimed** | claim index 0 | `[T, T, F, F, F]` | `[4, 9]` |
| 5 | j=0 claimed, j=1 claimed, j=2: 9 no, j=3: 8 no, j=4: 4 no | no partner | unchanged | `[4, 9]` |

Eight element inspections. The second 9 at index 2 and the second 4 at index 4 were never claimed,
because the left side ran out of demand for them — that is `min(1, 2) = 1` happening physically.
Sorted for a canonical result: `[4, 9]`. Neither input array was modified; only the separate flag
array was written to.

### Code

```python
def intersection_of_arrays_cross_off_with_flags(nums1: list[int], nums2: list[int]) -> list[int]:
    used = [False] * len(nums2)  # without this, one right-hand copy answers for many left ones
    out: list[int] = []
    for x in nums1:
        for j in range(len(nums2)):
            if not used[j] and nums2[j] == x:
                used[j] = True
                out.append(x)
                break  # one partner per left element, then stop looking
    out.sort()
    return out
```

### Common mistake

Dropping the `break`. Without it, the inner loop keeps going after a successful claim and finds the
*other* copies of the same value, claiming them too. On `nums1 = [4, 9, 5]` against
`nums2 = [9, 4, 9, 8, 4]`, the left-hand `4` would claim both right-hand 4s and the answer would be
`[4, 4, 9]` — more copies than the left side ever asked for. The rule is one partner per left element;
`break` is what enforces it.

The subtler version is dropping the `used` array entirely and testing only `nums2[j] == x`. That is
the membership-versus-counting confusion made concrete: on `nums1 = [1, 1, 1]` against
`nums2 = [1, 1]` it returns `[1, 1, 1]` — three copies from a right side that only holds two.

### Complexity and when to use this

**Time O(n × m), space O(m)** for the flags, where n and m are the two array lengths. The time is the
nested walk: every element of `nums1` triggers a scan of up to all of `nums2`, and nothing learned on
one left element is carried to the next. The space is one boolean per element of `nums2` — note that
this is O(m), *not* O(1), which is worth saying out loud because it is easy to mis-file this rung as
"the no-memory one".

Use it when both arrays are tiny, when the elements are not hashable and not orderable so neither of
the two structural tricks applies, or — its real job here — as an unimpeachable oracle to cross-check
the faster versions against, which is exactly what it does in the stress test at the bottom of this
file.

---

## Approach 2 — Sort both, then two cursors

### The idea

*The cross-off scan restarts at index 0 of the right array for every element of the left, re-reading
copies it has already claimed and skipped. What if both sides were in order, so neither cursor ever
had to go backwards?* Sort them. Then walk the two arrays together: equal values are a match and both
cursors advance; otherwise the cursor sitting on the smaller value advances, because in sorted order
that value can never be matched by anything still ahead on the other side. This fixes the cross-off
scan's exact weakness — the restarted inner walk — and it needs no used-flags at all, because
advancing past a matched pair is itself the claim.

### How to think about it

Two queues of people, each queue lined up by ticket number, and you are comparing the two people at
the front. If their numbers match, you have found a pair — take it, and send both of them away. If
one number is smaller than the other, that person can never be matched: everyone remaining in the
other queue has a number at least as large as the one you are looking at now, so send the smaller
person away and look again. The queues only ever shrink, nobody is ever recalled, and when either
queue empties you are done.

The multiplicity rule falls out on its own here rather than being enforced by a flag. Three 1s on the
left against two on the right: the cursors pair off the first two, then the left cursor is sitting on
a third 1 while the right cursor has moved past its last one onto something larger — so the left
cursor advances unmatched. Two pairs taken, `min(3, 2) = 2`, with no counting anywhere.

### Worked example

Input: `nums1 = [4, 9, 5]`, `nums2 = [9, 4, 9, 8, 4]`. Sorted: `a = [4, 5, 9]`, `b = [4, 4, 8, 9, 9]`.

| Step | i (a[i]) | j (b[j]) | Comparison | Action | Answer |
|---|---|---|---|---|---|
| 1 | 0 (4) | 0 (4) | equal | take `4`, advance both | `[4]` |
| 2 | 1 (5) | 1 (4) | 5 > 4 | the right 4 has no partner left — advance j | `[4]` |
| 3 | 1 (5) | 2 (8) | 5 < 8 | the left 5 has no partner left — advance i | `[4]` |
| 4 | 2 (9) | 2 (8) | 9 > 8 | advance j | `[4]` |
| 5 | 2 (9) | 3 (9) | equal | take `9`, advance both | `[4, 9]` |
| 6 | 3 — past the end | 4 (9) | — | `a` is exhausted, stop | `[4, 9]` |

Five comparisons and the answer arrives ascending for free — no final sort needed. The second 9 in `b`
at index 4 is simply never reached, which is `min(1, 2) = 1` again.

**Why this walk is linear even though it has a loop.** Every iteration of the `while` advances at
least one cursor — the equal case advances both, and each unequal case advances exactly one — and no
cursor ever moves backwards. So the total number of iterations is bounded by n + m. The loop's cost is
not the concern here; the sorts that precede it are.

### Code

```python
def intersection_of_arrays_sort_two_cursors(nums1: list[int], nums2: list[int]) -> list[int]:
    a = sorted(nums1)  # COPIES — sorting in place would rearrange the caller's arrays
    b = sorted(nums2)
    i = j = 0
    out: list[int] = []
    while i < len(a) and j < len(b):
        if a[i] < b[j]:
            i += 1
        elif a[i] > b[j]:
            j += 1
        else:
            out.append(a[i])
            i += 1
            j += 1
    return out  # already ascending, because both inputs were
```

### Common mistake

Advancing only one cursor on a match, or advancing the wrong one on a mismatch. Writing `i += 1` on a
match without the matching `j += 1` means the right-hand copy is never consumed, so three 1s on the
left against two on the right yields three matches instead of two — the same over-counting bug the
`used` flags existed to prevent, reappearing in a new disguise. And on a mismatch, advancing the
cursor on the *larger* value is worse than wrong: it can loop forever on some inputs, because the
smaller value stays put while the larger side runs past everything that could have matched it.

The reasoning to hold onto is the one that justifies the move: when `a[i] < b[j]`, every remaining
element of `b` is at least `b[j]`, which is already greater than `a[i]`, so `a[i]` has no possible
partner left and can be discarded. Sortedness is exactly what licenses that discard, and nothing else
does.

### The cost of mutation — who it hurts, and can it be undone

This is the one rung in this file that can touch the caller's data, and whether it does is a choice
you make in one character. `sorted(nums1)` builds a copy and costs O(n) memory; `nums1.sort()` costs
nothing extra and **permutes the caller's array**. The Java and C++ versions of this approach in the
repo's problem data make exactly that choice explicitly — one clones first, the other sorts the
by-value parameter.

Who gets hurt when you sort in place:

- **A caller that still needs the array in its original order.** Every value is still present, but at
  a different position. A parallel array of labels indexed the same way, a previously computed index,
  a slice boundary — all silently wrong afterwards. Nothing throws.
- **A concurrent reader.** A sort writes across the whole array, and another thread reading it
  mid-sort sees a state where a value can appear twice or not at all. That is a data race no amount of
  careful reading on the other side repairs.
- **A read-only or shared buffer.** A read-only memory mapping faults; a copy-on-write page is
  dirtied; a caller who passed a view into a larger array has that larger array scrambled too.

**Can it be undone?** No, not without having recorded the original order — which means an O(n) copy,
which is precisely the memory the in-place sort was trying to save. A permutation is invertible in
principle and unrecoverable in practice unless you paid to remember it. This is why the code above
uses `sorted()`: if you are going to spend O(n) memory anyway, spend it visibly on a copy rather than
invisibly on the caller's correctness.

Everything from Approach 3 onward reads both inputs and writes to neither, which is one more reason
the counting family wins here.

### Complexity and when to use this

**Time O(n log n + m log m), space O(n + m)** as written with copies — or O(log n) of sort stack if you
sort in place and accept the mutation. The time is dominated entirely by the two sorts; the merge walk
afterwards is a single linear pass and free by comparison.

This is the right choice when **both arrays are already sorted** — then the sorts vanish, the whole
thing is O(n + m) with O(1) extra space, and it beats every hash-based rung in this file on both axes.
It is also the right choice when the elements are orderable but not hashable, and when you need the
answer sorted anyway. Say this one out loud in an interview even though it is not the final answer,
because "are they sorted?" is a question the interviewer wants you to ask.

---

## Approach 3 — Count both sides, take the minimum

### The idea

*Sorting spends O(n log n) putting values into an order the answer never reads — the question is only
how many of each value each side holds, and ordering is not part of that. Can the counts be asked for
directly?* Yes: tally each array into its own map, then for every value emit it `min(count₁, count₂)`
times. This fixes sorting's weakness — the ordering work — and it states the multiplicity rule
outright as one line of code instead of leaving it to emerge from flags or cursors.

### How to think about it

Two inventory sheets. You count what is in warehouse A, you count what is in warehouse B, and then for
each product you can ship as many units as the *emptier* warehouse holds. No item is ever compared
against another item; the only operations are "increment this product's row" and "take the smaller of
two numbers". The rule the whole problem rests on is now written down explicitly — `min(a, b)` — where
in every other rung it is an emergent side effect of some mechanism.

That explicitness is this rung's real value. If you are unsure whether your fancier solution is
correct, this is the version you compare it against, because you can read the rule straight off the
page.

### Worked example

Input: `nums1 = [4, 9, 5]`, `nums2 = [9, 4, 9, 8, 4]`.

Two tally passes:

| | Map after |
|---|---|
| `c1` from `[4, 9, 5]` | `{4: 1, 9: 1, 5: 1}` |
| `c2` from `[9, 4, 9, 8, 4]` | `{9: 2, 4: 2, 8: 1}` |

Then walk the keys of `c1`:

| Value | count in `c1` | count in `c2` | `min` | Emitted |
|---|---|---|---|---|
| 4 | 1 | 2 | **1** | `4` |
| 9 | 1 | 2 | **1** | `9` |
| 5 | 1 | 0 (absent) | 0 | nothing |

Sorted for a canonical result: `[4, 9]`. Three passes in total (two to tally, one over the distinct
keys), two maps holding six entries between them, and neither input array is touched.

### Code

```python
def intersection_of_arrays_count_both_take_min(nums1: list[int], nums2: list[int]) -> list[int]:
    c1: dict[int, int] = {}
    c2: dict[int, int] = {}
    for x in nums1:
        c1[x] = c1.get(x, 0) + 1
    for x in nums2:
        c2[x] = c2.get(x, 0) + 1
    out: list[int] = []
    for x, n in c1.items():
        take = min(n, c2.get(x, 0))  # absent on the right counts as zero, not as an error
        out.extend([x] * take)
    out.sort()
    return out
```

### Common mistake

Writing `c2[x]` instead of `c2.get(x, 0)` when reading the second map. Any value present on the left
and absent on the right — the `5` in this example — has no key in `c2` at all, so the lookup raises
`KeyError`. It is the same defaulting bug as in every tally-building loop, and it fires on the most
ordinary input imaginable: two arrays that do not overlap completely.

The deeper mistake this rung exists to prevent is using a **set** on either side. `set(nums1) &
set(nums2)` is the answer to a different problem: it reports each shared value once regardless of how
many copies exist. On this example it happens to give `{4, 9}`, which looks right and is right by
luck; on `nums1 = [1, 1, 1]` against `nums2 = [1, 1]` it gives `{1}` where the answer is `[1, 1]`.
Presence is not multiplicity, and the moment you write `set` you have thrown the counts away.

### Complexity and when to use this

**Time O(n + m + k log k), space O(n + m)**, where k is the size of the answer. Time is two linear
tally passes plus one pass over the distinct keys, and the `k log k` is only the final sort that pins
down a canonical order — the judge accepts any order, so that term is this repo's choice, not the
problem's. Space is two maps, one per input, holding up to one entry per distinct value on each side.

This is the right choice when you want the rule visible and auditable, when both arrays are of similar
size so there is nothing to gain by treating them asymmetrically, or when you need the counts
themselves for something else afterwards. It is also the version that generalises: three arrays, or
"emit `min` across k arrays", is a small edit here and an awkward rewrite in every other rung.

---

## Approach 4 — One count table, spend as you go

### The idea

*The second tally exists only to be compared against the first — and building it forces a separate
pass over the keys afterwards just to assemble the answer. What if one side were consumed on the fly
instead of counted?* Tally `nums2` only, then walk `nums1`: a value that still has stock is taken and
its stock drops by one. The minimum is then enforced by *running out* rather than by comparing two
numbers. This fixes the two-map rung's weakness — the redundant second table and the extra pass.

### How to think about it

A shop with a stock ledger. You count what is on the shelves once, then serve customers one at a time:
each customer asks for an item, and you hand it over if there is stock, decrementing the ledger. When
the stock for an item hits zero, later customers asking for it leave empty-handed. You never compute
"how many did that customer group want in total" and compare it against the shelf count — you simply
serve until you cannot. The result is identical to `min(demand, supply)`, computed lazily, one unit at
a time.

Notice what this buys beyond one fewer map: the output is assembled *during* the walk over `nums1`,
so there is no third pass over a key set. Two passes total.

### Worked example

Input: `nums1 = [4, 9, 5]`, `nums2 = [9, 4, 9, 8, 4]`. `nums2` becomes the stock ledger.

Pass 1 builds the ledger: `{9: 2, 4: 2, 8: 1}`.

Pass 2 walks `nums1`:

| Value | Stock before | Action | Stock after | Answer |
|---|---|---|---|---|
| 4 | 2 | take, decrement | `{9: 2, 4: 1, 8: 1}` | `[4]` |
| 9 | 2 | take, decrement | `{9: 1, 4: 1, 8: 1}` | `[4, 9]` |
| 5 | absent (0) | skip | unchanged | `[4, 9]` |

Sorted: `[4, 9]`. Two passes, one map. The ledger ends with unspent stock — one 9, one 4, one 8 — which
is exactly the surplus the right side held and the left side never asked for.

### Code

```python
def intersection_of_arrays_one_count_table(nums1: list[int], nums2: list[int]) -> list[int]:
    stock: dict[int, int] = {}
    for x in nums2:
        stock[x] = stock.get(x, 0) + 1
    out: list[int] = []
    for x in nums1:
        if stock.get(x, 0) > 0:
            stock[x] -= 1  # running out IS the min(), computed lazily
            out.append(x)
    out.sort()
    return out
```

### Common mistake

Testing `if x in stock` instead of `if stock.get(x, 0) > 0`. The key stays in the dictionary after its
count is decremented to zero, so `in` keeps saying yes long after the stock is gone — and the count
then goes negative while the answer over-reports. On `nums1 = [1, 1, 1]` against `nums2 = [1, 1]` the
buggy version returns `[1, 1, 1]` and leaves `stock[1] == -1` behind as evidence. Membership in the
map is not the same as having stock; only the count is.

(Deleting the key when it hits zero also fixes it, and is what you would do if the map's size
mattered. Testing the count is fewer lines and does not churn the map.)

### Complexity and when to use this

**Time O(n + m + k log k), space O(m)** — one map sized to the distinct values of `nums2`, and the
`k log k` is again only the canonical-order sort. Time is one pass to build and one to spend, with an
O(1) expected hash operation at each step.

This is the right choice when the two arrays are of comparable size and you want the shortest correct
solution: it is six lines, it holds one table instead of two, and it makes one fewer pass than
Approach 3. It is one rung short of best only because it always tallies `nums2` — whatever `nums2`
happens to be.

---

## Approach 5 — Count the smaller side, stream the larger

### The idea

*This code always builds its table from `nums2`. What if `nums2` is the big one?* Ten values on the
left and a billion on the right still costs a billion map entries to produce a ten-element answer.
But `min(a, b)` is symmetric — swapping which array is which cannot change the answer — so you are
free to tally whichever array is **shorter** and stream the other past it. This fixes the previous
rung's weakness: memory tied to an arbitrary argument position rather than to the actual shape of the
data. It is the same algorithm, one line richer, with its space bound changed from O(m) to
O(min(n, m)).

### How to think about it

The shop again, except now you get to decide which side is the ledger. The ledger has to be held in
memory in full; the other side only ever walks past you one item at a time and is never revisited. So
you put the *small* thing in the ledger and let the *big* thing stream. That is not a micro-optimisation
— it is the difference between a program that runs and one that does not, when the large side is a
file on disk, a network cursor, or a database result set that cannot be materialised.

This is precisely what the famous follow-up asks: *what if `nums2` is enormous and can only be read
once?* The answer is this rung, and the sentence that earns the point is **"the memory has to be
bounded by the smaller input, because the larger one is only ever streamed."**

### Worked example

Input: `nums1 = [4, 9, 5]`, `nums2 = [9, 4, 9, 8, 4]`. `nums1` has 3 elements and `nums2` has 5, so
**`nums1` becomes the ledger** — the opposite of Approach 4's choice on the same input.

Pass 1 builds the ledger from the shorter array: `{4: 1, 9: 1, 5: 1}`.

Pass 2 streams the longer array past it:

| Streamed value | Stock before | Action | Ledger after | Answer |
|---|---|---|---|---|
| 9 | 1 | take, decrement | `{4: 1, 9: 0, 5: 1}` | `[9]` |
| 4 | 1 | take, decrement | `{4: 0, 9: 0, 5: 1}` | `[9, 4]` |
| 9 | **0** | out of stock — the left side only ever had one 9 | unchanged | `[9, 4]` |
| 8 | absent | the ledger has never heard of it | unchanged | `[9, 4]` |
| 4 | **0** | out of stock | unchanged | `[9, 4]` |

Sorted for a canonical result: `[4, 9]`. The ledger never grew past three entries — the number of
distinct values in the *smaller* array — no matter how long the streamed side was. Rows three and five
are `min(1, 2) = 1` enforcing itself by exhaustion, with no comparison of counts anywhere in the code.
Neither input array was modified; `nums2` was read exactly once, front to back, which is what makes it
streamable.

### Code

```python
def intersection_of_arrays_count_the_smaller_side(nums1: list[int], nums2: list[int]) -> list[int]:
    small, large = (nums1, nums2) if len(nums1) <= len(nums2) else (nums2, nums1)
    stock: dict[int, int] = {}
    for x in small:
        stock[x] = stock.get(x, 0) + 1
    out: list[int] = []
    for x in large:
        if stock.get(x, 0) > 0:
            stock[x] -= 1
            out.append(x)
    out.sort()
    return out
```

### Common mistake

Assuming the swap changes the answer and trying to "correct" for it — reversing the output, or
special-casing which array the results came from. It does not need correcting: the answer is a
multiset of *values*, not of positions, and `min(count₁, count₂)` is symmetric in its two arguments,
so which side is tallied is genuinely arbitrary. The worked example above demonstrates it: Approach 4
collected `[4, 9]` walking `nums1`, this one collected `[9, 4]` streaming `nums2`, and both sort to
the same answer.

The mistake that actually costs marks is a subtler one about the follow-up. If the large side truly
cannot fit in memory, then `out.sort()` at the end is a lie — the *answer* is bounded by the smaller
array's size, so it is fine here, but only because `min` caps the answer at `len(small)`. Saying that
out loud (*"the output is bounded by the smaller array too, so collecting it is safe"*) is what shows
you have thought the streaming case through rather than recited it.

### Complexity and when to use this

**Time O(n + m + k log k), space O(min(n, m))** — the map holds one entry per distinct value of the
shorter array, and the answer itself is bounded by that array's length. Time is one pass over each
array plus the canonical-order sort; the streamed side is read exactly once and never revisited.

This is the default to reach for. It is the same code as Approach 4 with one extra line, it is never
worse, and it is dramatically better whenever the inputs are lopsided — which real data usually is.
The single case where something else wins is when both arrays arrive already sorted, in which case the
two-cursor merge does the job in O(n + m) time with O(1) extra space and no hashing at all.

---

## The Overall Arc

The principle every rung chases is *stop re-deriving what you already know*, and here the thing being
re-derived is the same fact five different ways: how many copies of each value each side can supply.
The cross-off scan pays for it in time, re-reading the whole right array for every element of the
left, and needs an O(m) flag array just to avoid claiming the same copy twice — so it is quadratic and
it is not even the memory-free option people assume it is. Sorting fixes the restarted walk by
imposing an order, and the order genuinely earns its keep: two cursors that never move backwards
consume matching pairs in a single linear sweep, and the multiplicity rule stops needing enforcement
because advancing past a matched pair *is* the claim. But ordering is information the answer never
reads — it asks how many, not which comes first — so n log m is paid for an arrangement that is
thrown away, and if you sort in place you have also permuted the caller's arrays irreversibly. The
counting family drops the ordering entirely: two tallies and a `min`, linear and explicit, with the
rule the whole problem rests on written down as one readable line. Then the redundancy becomes
visible — the second tally exists only to be compared against the first — and consuming one side on
the fly collapses two maps into one, with "running out of stock" computing the minimum lazily, one
unit at a time. And the last rung is the one that matters outside an interview room, because it
changes nothing about the algorithm and everything about what the algorithm can be *run on*:
`min(a, b)` is symmetric, so tally whichever array is smaller and stream the other, and suddenly the
memory is bounded by the smaller input rather than by whichever argument happened to be named second.
That is the transferable move. When two collections have to be compared, the asymmetry is not in the
problem, it is in your code — and the right question is never just "how fast is this?" but **"which of
these two things has to be held in memory, and did I get to choose?"**

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Cross off with used flags | O(n × m) | O(m) | No hashing and no ordering, but quadratic — and the flags are required for correctness, not speed | Both arrays are tiny, elements are neither hashable nor orderable, or you need a reference oracle |
| Sort both, two cursors | O(n log n + m log m) | O(n + m) with copies, O(1) if you sort in place and accept the mutation | Buys a single linear sweep with ordering work the answer never reads | **Both arrays are already sorted** — then it is O(n + m) time and O(1) space and beats everything below |
| Count both, take the min | O(n + m + k log k) | O(n + m) | Two tallies; the `min` rule is explicit and auditable | Arrays are similar in size, you need the counts afterwards, or the problem generalises to k arrays |
| One count table, spend as you go | O(n + m + k log k) | O(m) | One map instead of two, one fewer pass — but always tallies `nums2` | Arrays are comparable in size and you want the shortest correct code |
| Count the smaller side | O(n + m + k log k) | O(min(n, m)) | Same algorithm, one line more, memory tied to the data's shape rather than to argument order | The default — and the only answer to "what if `nums2` is enormous and streamed once?" |

---

## Interview Priority

**Know cold: count the smaller side, and the two-cursor merge.** They are a matched pair, and the
interview is about knowing which one the input calls for. The counting version is the default answer
and it is six lines; what earns the marks is not the code but the two sentences around it — *"this is
a counting problem, not a membership problem, so the answer's count for a value is `min` of the two
counts"*, and, for the famous follow-up, *"I tally whichever array is smaller and stream the other, so
the memory is bounded by the smaller input."* The two-cursor merge is what you switch to the moment
someone says the arrays are sorted, because then it is O(n + m) time with O(1) extra space and no
hashing, which strictly beats the map. Asking "are they sorted?" before you start is itself part of
the answer.

**Worth stating and rejecting out loud: the set intersection.** `set(nums1) & set(nums2)` is the
answer everyone reaches for first, and naming it *and then killing it* — "that gives `[1]` for three
1s against two, but the answer is `[1, 1]`" — is the fastest way to show you have actually read the
multiplicity rule rather than pattern-matched the title.

**Understand but do not drill: the cross-off scan, and the two-map version.** The cross-off scan's
value is that it makes the minimum rule physical (you run out of tokens) and that it is a
bulletproof oracle for testing — it plays exactly that role in the script below. The two-map version
is worth knowing as the readable reference implementation, the one you write when you want the rule
visible, and as the shape that generalises to three or more arrays. Neither is what you would ship.

---

## Full Runnable Script

Every approach in one file, checked against both examples from the statement, the smallest legal
inputs in both flavours (one element each with no overlap, and one element each that match), the
lopsided-counts case that kills every set-based solution, an extremely lopsided pair that exercises
the smaller-side choice, and a randomised stress test with heavy duplication cross-checked against
brute force. Each approach is handed **its own copy of the data**, because the sorting rung rearranges
what it is given in several languages and any cross-check downstream would then be comparing corrupted
arrays. Every answer is **sorted before comparison**, because the judge accepts any order.

```python
"""What Both Arrays Hold — every approach in one file, cross-checked.

Run: python intersection_of_arrays.py
"""

from __future__ import annotations

import random
from typing import Callable


def intersection_of_arrays_cross_off_with_flags(nums1: list[int], nums2: list[int]) -> list[int]:
    used = [False] * len(nums2)  # without this, one right-hand copy answers for many left ones
    out: list[int] = []
    for x in nums1:
        for j in range(len(nums2)):
            if not used[j] and nums2[j] == x:
                used[j] = True
                out.append(x)
                break
    out.sort()
    return out


def intersection_of_arrays_sort_two_cursors(nums1: list[int], nums2: list[int]) -> list[int]:
    a = sorted(nums1)
    b = sorted(nums2)
    i = j = 0
    out: list[int] = []
    while i < len(a) and j < len(b):
        if a[i] < b[j]:
            i += 1
        elif a[i] > b[j]:
            j += 1
        else:
            out.append(a[i])
            i += 1
            j += 1
    return out  # already ascending, because both inputs were


def intersection_of_arrays_count_both_take_min(nums1: list[int], nums2: list[int]) -> list[int]:
    c1: dict[int, int] = {}
    c2: dict[int, int] = {}
    for x in nums1:
        c1[x] = c1.get(x, 0) + 1
    for x in nums2:
        c2[x] = c2.get(x, 0) + 1
    out: list[int] = []
    for x, n in c1.items():
        take = min(n, c2.get(x, 0))
        out.extend([x] * take)
    out.sort()
    return out


def intersection_of_arrays_one_count_table(nums1: list[int], nums2: list[int]) -> list[int]:
    stock: dict[int, int] = {}
    for x in nums2:
        stock[x] = stock.get(x, 0) + 1
    out: list[int] = []
    for x in nums1:
        if stock.get(x, 0) > 0:
            stock[x] -= 1  # running out IS the min(), computed lazily
            out.append(x)
    out.sort()
    return out


def intersection_of_arrays_count_the_smaller_side(nums1: list[int], nums2: list[int]) -> list[int]:
    small, large = (nums1, nums2) if len(nums1) <= len(nums2) else (nums2, nums1)
    stock: dict[int, int] = {}
    for x in small:
        stock[x] = stock.get(x, 0) + 1
    out: list[int] = []
    for x in large:
        if stock.get(x, 0) > 0:
            stock[x] -= 1
            out.append(x)
    out.sort()
    return out


APPROACHES: list[tuple[str, Callable[[list[int], list[int]], list[int]]]] = [
    ("cross off with flags", intersection_of_arrays_cross_off_with_flags),
    ("sort, two cursors", intersection_of_arrays_sort_two_cursors),
    ("count both, take min", intersection_of_arrays_count_both_take_min),
    ("one count table", intersection_of_arrays_one_count_table),
    ("count the smaller side", intersection_of_arrays_count_the_smaller_side),
]


def run_case(label: str, nums1: list[int], nums2: list[int]) -> bool:
    # Each approach gets its OWN copies: the cursor rung sorts what it is handed in some
    # languages, and sorting either input would corrupt a later cross-check.
    results = [(name, sorted(fn(list(nums1), list(nums2)))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  nums1={nums1} nums2={nums2}")
    for name, r in results:
        print(f"    {name:<22} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True
    ok &= run_case("example from the statement", [1, 2, 2, 1], [2, 2])
    ok &= run_case("multiplicity is the minimum", [4, 9, 5], [9, 4, 9, 8, 4])
    ok &= run_case("smallest legal input, no overlap", [1], [2])
    ok &= run_case("smallest legal input, full overlap", [1], [1])
    ok &= run_case("more copies on the left than the right", [1, 1, 1], [1, 1])
    ok &= run_case("lopsided sizes", [7], [7, 7, 7, 7, 7, 7, 7, 7])

    random.seed(5)
    checked = 0
    for _ in range(500):
        nums1 = [random.randint(0, 12) for _ in range(random.randint(1, 20))]
        nums2 = [random.randint(0, 12) for _ in range(random.randint(1, 20))]
        expected = sorted(intersection_of_arrays_cross_off_with_flags(list(nums1), list(nums2)))
        for name, fn in APPROACHES:
            got = sorted(fn(list(nums1), list(nums2)))
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} {nums1} {nums2} {got} != {expected}")
        checked += 1
    print(f"stress: {checked} random array pairs with heavy duplication, all five "
          f"approaches cross-checked against brute force")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()
```

### Output when run

```
example from the statement
  nums1=[1, 2, 2, 1] nums2=[2, 2]
    cross off with flags   -> [2, 2]
    sort, two cursors      -> [2, 2]
    count both, take min   -> [2, 2]
    one count table        -> [2, 2]
    count the smaller side -> [2, 2]
    all agree: True
multiplicity is the minimum
  nums1=[4, 9, 5] nums2=[9, 4, 9, 8, 4]
    cross off with flags   -> [4, 9]
    sort, two cursors      -> [4, 9]
    count both, take min   -> [4, 9]
    one count table        -> [4, 9]
    count the smaller side -> [4, 9]
    all agree: True
smallest legal input, no overlap
  nums1=[1] nums2=[2]
    cross off with flags   -> []
    sort, two cursors      -> []
    count both, take min   -> []
    one count table        -> []
    count the smaller side -> []
    all agree: True
smallest legal input, full overlap
  nums1=[1] nums2=[1]
    cross off with flags   -> [1]
    sort, two cursors      -> [1]
    count both, take min   -> [1]
    one count table        -> [1]
    count the smaller side -> [1]
    all agree: True
more copies on the left than the right
  nums1=[1, 1, 1] nums2=[1, 1]
    cross off with flags   -> [1, 1]
    sort, two cursors      -> [1, 1]
    count both, take min   -> [1, 1]
    one count table        -> [1, 1]
    count the smaller side -> [1, 1]
    all agree: True
lopsided sizes
  nums1=[7] nums2=[7, 7, 7, 7, 7, 7, 7, 7]
    cross off with flags   -> [7]
    sort, two cursors      -> [7]
    count both, take min   -> [7]
    one count table        -> [7]
    count the smaller side -> [7]
    all agree: True
stress: 500 random array pairs with heavy duplication, all five approaches cross-checked against brute force

ALL APPROACHES AGREED ON EVERY CASE.
```
