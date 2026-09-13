# Top K Frequent Elements — explained

## Understanding the Problem

You are given a list of whole numbers, in which the same number may appear many times, and a number
`k`. Return the `k` numbers that show up most often. You return the *values*, not their positions and
not how many times they appeared, and the order you return them in does not matter — `[4, 6]` and
`[6, 4]` are equally correct.

**The core question:** which `k` values have the largest counts? The work splits into two halves that
are not equally hard. Counting is the easy half — one walk of the list, tallying as you go. Ranking is
where every approach differs, and the naive approach is slow because it answers "how often does this
value appear?" by re-scanning the whole list once per distinct value, and then answers "which are
biggest?" by repeatedly re-scanning the counts.

The whole ladder below is one question asked over and over: **how much ordering does the answer
actually need?** You are asked for a set of `k` values, unordered. You are not asked for them in rank
order, not asked for their counts, and not asked about the values below the cut. A full sort supplies
far more than that — and every rung is a step toward supplying less.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `1 <= nums.length <= 10^5` | A hundred thousand elements makes the O(n²) brute force around 10¹⁰ operations — unrunnable. **This is what rules brute force out.** The lower bound of 1 means the list is never empty, so there is always at least one distinct value and `k = 1` always has an answer. |
| `-10^4 <= nums[i] <= 10^4` | Values are small and bounded — only 20,001 of them are possible. **This is what unlocks the counting-array rung (Approach 5)**: a plain array of 20,001 slots can replace the hash map entirely, because a value can be an array index directly. Compare this with problems whose values span ±10⁹, where that door is shut. |
| `1 <= k <= the number of distinct values in nums` | You are never asked for more values than exist, so no approach needs a "not enough distinct values" branch. It also means `k` can be as large as the number of distinct values, which is why "k is always small" is an assumption you may not make. |
| the answer is unique — no tie spans the k-th place | **This is what makes the answer well-defined without a tie-break rule.** Two values may share a count *inside* the top k, but the boundary is never ambiguous, so every approach below returns the same *set* even though they emit it in different orders. |
| *(implied)* a count can never exceed `n` | **This is what unlocks the bucket rung (Approach 4), the optimal one.** Counts are not arbitrary numbers: they are integers between 1 and n. Small bounded integers can be array *indices* rather than sort *keys*, and that single substitution removes every comparison from the ranking half. |

The worked example used in every section below is the statement's own:

```
nums = [4, 4, 4, 6, 6, 2], k = 2        answer: [4, 6]
```

The counts are 4 → three times, 6 → twice, 2 → once. So the top two are 4 and 6, and 2 is the one
left out.

---

## Approach 1 — Brute force: count by rescanning, then pick the maxima

### The idea

*How do I know how often a value appears?* Walk the whole list and count the matches. Do that for
each distinct value, then find the largest count by scanning the counts, mark that value as taken,
and scan again for the next largest — `k` times over.

### How to think about it

Imagine a shoebox of receipts and the question "which two shops did I visit most?", with no way to
keep a running tally. You pick the first shop name you see and flip through the entire box counting
its receipts. Then the next unfamiliar name, and flip through the whole box again. Once you have a
list of shop-and-count pairs, you read down it to find the biggest, cross it off, and read down it
again for the second biggest. Nothing is ever remembered between passes — not the counts you are
accumulating, not the ranking work you already did — and each pass re-derives from scratch what the
previous one partly knew. That amnesia is the entire inefficiency, and it appears in *both* halves:
the counting and the ranking.

### Worked example

`nums = [4, 4, 4, 6, 6, 2]`, `k = 2`.

**Collect the distinct values** by walking the list and checking each element against the values
found so far — itself a scan, not a lookup:

| element | already in `distinct`? | `distinct` after |
|---|---|---|
| 4 | no | `[4]` |
| 4 | yes | `[4]` |
| 4 | yes | `[4]` |
| 6 | no | `[4, 6]` |
| 6 | yes | `[4, 6]` |
| 2 | no | `[4, 6, 2]` |

**Count each one** with its own full pass over all six elements:

| value | full pass over `[4, 4, 4, 6, 6, 2]` | count |
|---|---|---|
| 4 | hit, hit, hit, miss, miss, miss | 3 |
| 6 | miss, miss, miss, hit, hit, miss | 2 |
| 2 | miss, miss, miss, miss, miss, hit | 1 |

**Select the top k** by scanning the counts once per answer:

| round | counts still available | largest | taken | output so far |
|---|---|---|---|---|
| 1 | 4→3, 6→2, 2→1 | 4 (count 3) | 4 | `[4]` |
| 2 | 6→2, 2→1 | 6 (count 2) | 6 | `[4, 6]` |

Eighteen element visits for the counting alone on a six-element list, plus the distinct-collection
scans, plus two more passes for the selection.

### Code

```python
def top_k_frequent_brute_force(nums: list[int], k: int) -> list[int]:
    distinct: list[int] = []
    for x in nums:
        if x not in distinct:  # membership test on a list: a scan, not a lookup
            distinct.append(x)
    counts: list[int] = []
    for value in distinct:
        counts.append(sum(1 for x in nums if x == value))  # a full pass per distinct value
    out: list[int] = []
    taken = [False] * len(distinct)
    for _ in range(k):
        best = -1
        for idx in range(len(distinct)):
            if not taken[idx] and (best == -1 or counts[idx] > counts[best]):
                best = idx
        taken[best] = True
        out.append(distinct[best])
    return out
```

### Common mistake

Skipping the `taken` bookkeeping and instead finding the maximum `k` times without removing it — the
loop then returns the same most-frequent value `k` times over. On the example that gives `[4, 4]`
instead of `[4, 6]`. The usual patch is to set the winner's count to `-1` after taking it, which
works but silently corrupts the counts array; if anything later in the function reads those counts,
it reads lies. A separate `taken` array, or removing the winner from the list, keeps the data honest.

The related mistake is collecting `distinct` by appending every element and deduplicating later — on
an array where one value repeats 10⁵ times, that is a 10⁵-entry list to scan through on every
membership check.

### Complexity and when to use this

**Time O(n²), space O(d)** where d is the number of distinct values. The quadratic term has two
independent sources, and it is worth naming both: collecting the distinct values costs O(n·d) because
each membership test is a list scan, and counting costs another O(n·d) because each value gets a full
pass. The selection adds O(k·d), which is small by comparison. Space is the distinct-value list and
its counts.

Use it when the list is tiny and you want code you can check by eye, and — its real role — as the
reference implementation the fast versions are tested against, which is exactly what it does in the
test suite at the bottom of this document. At the stated 10⁵ elements it is unusable.

---

## Approach 2 — Count with a hash map, then sort the distinct values by count

### The idea

*Both halves of the brute force rescan — can either be done in one pass?* The counting half can:
a hash map turns "how many times have I seen this value?" into a single step, so one walk of the list
produces every count. Then sort the distinct values by their counts, biggest first, and take the
first `k`.

This fixes brute force's weakness twice over — **it re-reads the entire list once per distinct value
to count, and re-reads the counts once per answer to rank.**

### How to think about it

Two separate jobs, each done with the right tool. The counting is a tally sheet: every element you
pass gets a mark next to its value, one step per element, and at the end the sheet is complete. The
ranking is a filing job: put the distinct values in a row ordered by their marks and read off the
front. The important thing to see is that these two costs are *separate bills* — the tally is linear
in the number of elements, the sort is `d log d` in the number of *distinct* values — and improving
one does nothing for the other. From here on, the counting half never changes again; every remaining
rung attacks only the ranking.

### Worked example

`nums = [4, 4, 4, 6, 6, 2]`, `k = 2`.

**Count** — one pass, updating the map in place:

| element | map after |
|---|---|
| 4 | `{4: 1}` |
| 4 | `{4: 2}` |
| 4 | `{4: 3}` |
| 6 | `{4: 3, 6: 1}` |
| 6 | `{4: 3, 6: 2}` |
| 2 | `{4: 3, 6: 2, 2: 1}` |

**Sort** the three distinct values by count, descending: `4` (3), `6` (2), `2` (1).

**Slice** the first `k = 2`: `[4, 6]`.

Six steps for the counting, and a sort of three items for the ranking. Notice what the sort produced
that nobody asked for: it put `2` in its correct place at the bottom. That wasted ordering is what
the next two rungs chip away at.

### Code

```python
from collections import Counter


def top_k_frequent_sort_counts(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    return sorted(counts, key=lambda v: counts[v], reverse=True)[:k]
```

### Common mistake

Sorting the map's *items* and forgetting to extract the values afterwards, returning
`[(4, 3), (6, 2)]` instead of `[4, 6]`. It is a small slip that a type checker catches and an
interviewer will not let pass, because the problem asks for elements and not for element/count pairs.

The subtler version is sorting by the wrong half of the pair. `sorted(counts.items())` with no `key`
sorts by the *value* first, because that is the first item of each tuple — so on our example it
returns `[(2, 1), (4, 3), (6, 2)]` and the top two come out as `2` and `4`. The answer looks
plausible (it contains the right number of items, drawn from the right set) and is wrong, which is
the worst kind of bug. Always name the sort key explicitly.

### Complexity and when to use this

**Time O(n + d log d), usually written O(n log n); space O(d).** Split the bill: counting is O(n),
one hash operation per element; sorting is O(d log d) over the distinct values, which in the worst
case (everything distinct) is d = n and gives the familiar O(n log n). The space is the map plus the
list of distinct values. The sort is the only super-linear term, so it is the only thing worth
attacking.

Use it when `k` is close to the number of distinct values — if you want nearly all of them ranked
anyway, sorting gives you that for free and the fancier approaches gain nothing. Use it also when you
need the results *in rank order*, which the optimal approach does not guarantee, or simply when the
input is small and two lines of obviously-correct code beats twelve.

---

## Approach 3 — Count, then a heap of size k

### The idea

*The sort orders every distinct value, but only `k` of them are wanted — can the rest be left
unordered?* Yes. Keep a collection of just the `k` best candidates seen so far, with the weakest of
them instantly reachable. Each new value is compared only against that weakest candidate: if it beats
it, swap; if not, discard it. The cost then follows `k` rather than the total number of distinct
values.

This fixes Approach 2's weakness — **it fully ranks every distinct value, including all the ones that
will never appear in the answer.**

### How to think about it

A leaderboard with exactly `k` slots and one special property: you can always see who is currently in
*last* place, instantly. A new contender arrives; you compare them only with that last-place holder.
Worse? They go home, and nobody else on the board was even disturbed. Better? Last place is evicted
and the newcomer is slotted in, which takes a moment of reshuffling but only about log k of it — you
never re-rank the whole board. The counter-intuitive part, worth sitting with, is that the board is a
**min**-heap even though you want the **maximum** counts: the smallest of your `k` best is precisely
the one you need to see, because it is the only one a newcomer can displace.

This is the instinctive move once you know the phrase "top k" — heap is the reflex. It is a real
improvement and it is not optimal, which is exactly why it is on the ladder.

### Worked example

`nums = [4, 4, 4, 6, 6, 2]`, `k = 2`. The counting half is identical to Approach 2 and produces
`{4: 3, 6: 2, 2: 1}`. Now feed those three pairs to a min-heap keyed by count:

| pair offered | heap size before | weakest on the heap | decision | heap after (count, value) |
|---|---|---|---|---|
| `(4, count 3)` | 0 | — | heap has room — push | `[(3, 4)]` |
| `(6, count 2)` | 1 | — | heap has room — push | `[(2, 6), (3, 4)]` |
| `(2, count 1)` | 2 (full) | count 2 | 1 is not greater than 2 — **discard without touching the heap** | `[(2, 6), (3, 4)]` |

Read the two values off the heap: `[4, 6]`.

The third row is the whole point. The value `2` is dismissed by a single comparison against the
weakest survivor, and no reordering happens at all. A full sort would have carefully placed it in
last position — work that the answer never uses.

### Code

```python
import heapq
from collections import Counter


def top_k_frequent_heap(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    heap: list[tuple[int, int]] = []  # (count, value), smallest count on top
    for value, c in counts.items():
        if len(heap) < k:
            heapq.heappush(heap, (c, value))
        elif c > heap[0][0]:
            heapq.heapreplace(heap, (c, value))  # push and pop in one sift
    return [value for _, value in sorted(heap, reverse=True)]
```

Python's `heapq.nlargest(k, counts, key=counts.get)` does exactly this and is what you would write in
real code; the explicit version above is here because the interview question is about the mechanism,
not the library call.

### Common mistake

Building a max-heap of all the counts and popping `k` times. It gives the right answer and quietly
throws away the improvement: heapifying every distinct value is O(d), then `k` pops at O(log d) each,
so the cost is tied to d again and the heap is now holding every value rather than only the
contenders. The whole reason to reach for a heap here is to bound its size at `k`; a heap of size d
is just a sort that stopped early.

The second mistake is pushing `(value, count)` instead of `(count, value)`. Tuples compare
left-to-right, so the heap orders by the *value* and the counts are never consulted at all. What makes
this one dangerous is that it often still returns the right answer: on our running example it does.
It fails on `nums = [7, 4, 4, 4, 7, 4, 4]` with `k = 1`, where the counts are `{7: 2, 4: 5}` — the
heap fills with `(7, 2)`, then tests the incoming 4 by asking whether its count `5` beats the heap
top's first element, which is the *value* `7`, decides it does not, and returns `[7]` instead of
`[4]`. The comparison key must be the count, and putting it first in the tuple is what makes that
true.

### Complexity and when to use this

**Time O(n + d log k), space O(n).** Counting is O(n). The ranking visits each of the d distinct
values once and pays at most O(log k) — the depth of a k-element heap — for the ones that get
inserted; values that lose their single comparison cost O(1). Space is the count map, which is O(d)
and therefore O(n) in the worst case, plus the k-element heap.

Use it when `k` is genuinely small relative to the number of distinct values — the classic "top 10
out of a million" — and especially when the data arrives as a **stream** you cannot store or re-read.
A bounded heap is the canonical streaming top-k structure; the bucket approach below is not, because
it needs to know n in advance and needs all the counts finished before it can start. When k
approaches d, `log k` approaches `log d` and this stops beating a plain sort.

---

## Approach 4 — Bucket by count (optimal)

### The idea

*The heap still pays a logarithm per candidate — can the counts be ordered without comparing them at
all?* They can, because a count is not an arbitrary number: it is an integer between 1 and n. Make an
array with one slot per possible count, drop each value into the slot matching its count, then read
the slots from the top down until you have `k` values.

This fixes Approach 3's weakness — **every insertion still costs a logarithm, because a heap ranks by
comparing.**

### How to think about it

A wall of numbered pigeonholes, one for each possible count from 0 up to n. A value that appears
seven times goes in hole 7 — no comparison, no search, you simply walk up to the hole with its number
on it. Once every value is placed, the wall is already sorted by construction, and you read it from
the highest hole downward, taking values until you have `k` of them. The substitution at the heart of
this is worth naming: **comparison becomes placement**. Nothing is ever compared to anything; a count
is used as an address. That is the same idea behind counting sort, bucket sort and radix sort, and
what makes it legal here is precisely that counts are bounded — an unbounded key could not be an
address.

### Worked example

`nums = [4, 4, 4, 6, 6, 2]`, `k = 2`. Counting gives `{4: 3, 6: 2, 2: 1}` as before. Now build a wall
of `n + 1 = 7` pigeonholes, numbered 0 through 6:

| value | its count | goes into hole |
|---|---|---|
| 4 | 3 | 3 |
| 6 | 2 | 2 |
| 2 | 1 | 1 |

The wall, after all three placements:

```
hole:   0     1     2     3     4     5     6
holds: [ ]   [2]   [6]   [4]   [ ]   [ ]   [ ]
```

Read from the top down, collecting until two values are in hand:

| hole | contents | action | collected |
|---|---|---|---|
| 6 | empty | nothing | `[]` |
| 5 | empty | nothing | `[]` |
| 4 | empty | nothing | `[]` |
| 3 | `[4]` | take 4 | `[4]` |
| 2 | `[6]` | take 6 — that is `k = 2`, **stop** | `[4, 6]` |

Hole 1, holding the value `2`, is never even looked at.

### Code

```python
from collections import Counter


def top_k_frequent_buckets(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    buckets: list[list[int]] = [[] for _ in range(len(nums) + 1)]  # a count can never exceed n
    for value, c in counts.items():
        buckets[c].append(value)
    out: list[int] = []
    for c in range(len(nums), 0, -1):
        for value in buckets[c]:
            out.append(value)
            if len(out) == k:
                return out
    return out
```

### Common mistake

Allocating `len(nums)` buckets instead of `len(nums) + 1`. A value that appears in *every* slot of the
array has count n, and hole n does not exist — so the single-value input `[5, 5, 5]` with `k = 1`
crashes with an index error. The off-by-one is easy to make because the holes are counts, not
positions, and counts start at 1 while the array of holes starts at 0; you need slots for
`0, 1, …, n`, which is `n + 1` of them.

The second mistake is the `break` that only escapes the inner loop. In Java or C++ a single `break`
inside the inner `for` leaves the outer loop running, and the code keeps collecting values from the
next bucket down — returning more than `k` of them. Either check the size again after the inner loop
(the reference Java and C++ solutions in this repo do exactly that) or return directly from inside
the inner loop, as the Python above does.

A third, quieter one: writing `buckets = [[]] * (len(nums) + 1)`. That creates `n + 1` references to
*the same* list, so every append lands in every bucket and the structure is meaningless. Use a
comprehension.

### Complexity and when to use this

**Time O(n), space O(n).** Every term is linear and worth attributing: counting is O(n); allocating
the buckets is O(n); placing the distinct values is O(d) which is at most O(n); and the downward read
visits at most n + 1 buckets and collects at most k values. There is no comparison sort anywhere, so
nothing contributes a logarithm. The space is the count map plus the bucket wall, both O(n).

**This is the one to memorize.** It is the linear answer and the one the problem is really testing.
Note the honest trade-off, though: it allocates n + 1 buckets even when only three distinct values
exist, so on an array of a million elements with five distinct values it touches far more memory than
the heap does — and unlike the heap, it cannot work on a stream, because it needs all counts complete
and n known before it starts. Optimal in the asymptotic sense is not the same as best in every
situation.

---

## Approach 5 — A counting array when the values are small and bounded

### The idea

*The counting half still hashes every element — but must it?* Not here. The constraints say every
value lies between −10⁴ and 10⁴, so there are only 20,001 possible values, and a value can index a
plain array directly. Replace the hash map with an array of tallies; the ranking half stays exactly as
in Approach 4.

This fixes no complexity weakness of Approach 4 — both are O(n) — but it removes a constant factor:
**every map update costs a hash computation, a bucket probe and, as the map grows, occasional
rehashing of everything already in it.**

### What must be true, and what breaks if it is not

The assumption is that the value range is small enough to allocate one tally slot per possible value.
**This problem's constraints say it is** — 20,001 slots is about 160 KB and entirely reasonable. That
makes this rung genuinely available here, unlike in problems whose values span ±10⁹, where an array
of that shape would need tens of gigabytes.

What breaks if the assumption fails: an unguarded allocation is not a wrong answer but a dead process
— an immediate out-of-memory. The implementation below therefore checks the actual range first and
falls back to Approach 4, which is what any library-quality version of this would do. The subtler
break is forgetting the `- lo` offset when indexing: negative values then index from the wrong end of
the array in Python (where a negative index wraps around silently) and throw in Java or C++.

Note the trade this rung makes, because it is not free. The tally array is 20,001 slots whether the
input has three distinct values or twenty thousand, and every one of those slots must be allocated,
zeroed, and then scanned when the buckets are filled. On a six-element input that is far more work
than a hash map does. The win appears when n is large — the per-element cost is what dominates then,
and an array index beats a hash every time.

### Worked example

`nums = [4, 4, 4, 6, 6, 2]`, `k = 2`. The tally array covers −10,000 to 10,000, so the slot for a
value `v` is at index `v + 10000`. Only three slots are ever touched:

| element | slot index | tally at that slot after |
|---|---|---|
| 4 | 10004 | 1 |
| 4 | 10004 | 2 |
| 4 | 10004 | 3 |
| 6 | 10006 | 1 |
| 6 | 10006 | 2 |
| 2 | 10002 | 1 |

Then walk the whole tally array, skipping the zeros, and place each non-zero into the pigeonhole wall
exactly as Approach 4 did:

| slot found non-zero | value it represents | count | goes into hole |
|---|---|---|---|
| 10002 | 2 | 1 | 1 |
| 10004 | 4 | 3 | 3 |
| 10006 | 6 | 2 | 2 |

Reading the wall from hole 6 downward gives `[4, 6]` — the same answer, reached without a single hash
computation, but at the cost of scanning all 20,001 tally slots to find the three that matter.

### Code

```python
def top_k_frequent_counting_array(
    nums: list[int], k: int, lo: int = -10**4, hi: int = 10**4
) -> list[int]:
    if not nums:
        return []
    if min(nums) < lo or max(nums) > hi:  # the bounded-value assumption fails; fall back
        return top_k_frequent_buckets(nums, k)
    tally = [0] * (hi - lo + 1)  # one slot per possible value, no hashing at all
    for x in nums:
        tally[x - lo] += 1
    buckets: list[list[int]] = [[] for _ in range(len(nums) + 1)]
    for offset, c in enumerate(tally):
        if c:
            buckets[c].append(offset + lo)
    out: list[int] = []
    for c in range(len(nums), 0, -1):
        for value in buckets[c]:
            out.append(value)
            if len(out) == k:
                return out
    return out
```

### Common mistake

Reading the tally array back and forgetting to convert the index into a value — appending `offset`
rather than `offset + lo`. Every answer then comes back shifted by 10,000: on our example you would
get `[10004, 10006]` instead of `[4, 6]`. It survives every test whose values happen to start at zero,
which is most hand-written tests, and fails the moment a negative value appears. The rule underneath
it: the moment you offset an index on the way in, the matching un-offset on the way out is part of the
same change, not a separate step to remember later.

### Complexity and when to use this

**Time O(n + V), space O(n + V)** where V is the size of the value range — here a fixed 20,001. The
`O(V)` term is the allocation, zeroing, and full scan of the tally array, which is constant for this
problem but not free: on a short input it dominates completely. The per-element counting is a
subtraction and an array increment, measurably faster than a hash map update when n is large.

Use it when the value range is small and stated, and when n is large enough that per-element cost is
what matters — counting characters, digits, grades, small enum codes, pixel intensities. Do not reach
for it when the range is wide or unknown, and do not present it as the primary interview answer:
present Approach 4, then offer this as "and since the values are bounded to ±10⁴, the map can be an
array". Noticing that a constraint has unlocked something is the point.

---

## The Overall Arc

Counting is the easy half and it stops changing after the second rung; the whole ladder is really one
question asked with increasing precision — **how much ordering does the answer actually need?**
Brute force answers it with no structure at all, rescanning the entire list once per distinct value to
count and then rescanning the counts once per answer to rank, so both halves are quadratic and
neither remembers anything. A hash map fixes the counting half outright, turning "how often?" into a
single step per element, and from there the counting never gets better and never needs to; what
remains is the ranking. Sorting the distinct values by count is the obvious ranking tool and it works,
but look at what it delivers: a complete ordering of every distinct value, including a careful
placement of everything below the cut that the answer will never mention. A heap of size `k` supplies
strictly less — it orders only the current contenders, so a value that cannot make the cut is dismissed
by one comparison instead of being sorted into its rightful place, and the logarithm now follows `k`
rather than the whole set. That is a real improvement and it is still paying a logarithm on every
candidate that does get in, which raises the last question: does ranking require comparing at all?
It does not, because a count is not an arbitrary key — it is an integer between 1 and n, and a small
bounded integer can be an *address* instead of a sort key. Drop each value into the pigeonhole
numbered with its count and the wall is sorted by construction, with no comparison anywhere and a
downward read that stops as soon as `k` values are in hand. That substitution — comparison becomes
placement — is the same engine behind counting sort, bucket sort and radix sort, and once you see it
you can apply it to the counting half too, because this problem's values are themselves bounded to
±10⁴ and so can index an array directly instead of being hashed. The honest closing note is that
"optimal" here means asymptotically optimal, and the right choice still depends on which quantity is
small: a tiny `k` against a huge distinct set favours the heap (which also works on a stream, where
buckets cannot), a `k` near the distinct count favours plain sorting (which hands you the order for
free), and a tight bound on the key is what favours buckets.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | O(n²) | O(d) | Rescans in both halves and remembers nothing | n is tiny; as the test-suite oracle |
| Count + sort | O(n + d log d) | O(d) | Simplest correct code, but fully ranks values that will never be returned | k is near the distinct count; you want results in rank order; small inputs |
| Count + heap of size k | O(n + d log k) | O(n) | Orders only the contenders, so the logarithm follows k — but still compares on every insert | k ≪ distinct values; streaming data that cannot be stored or re-read |
| **Count + buckets** | **O(n)** | **O(n)** | **Replaces comparison with placement; allocates n + 1 buckets regardless of how few distinct values exist** | **The default answer for this problem** |
| Counting array + buckets | O(n + V) | O(n + V) | Removes hashing from the counting half too, at the price of a fixed V-sized array | The value range is small and stated (here ±10⁴) and n is large |

---

## Interview Priority

**Memorize cold — count plus buckets.** This is the answer the problem is testing and the one that
gets you to linear time. What matters is being able to say *why* it is legal in one sentence — a count
cannot exceed n, so counts can be array indices instead of sort keys — because that sentence is the
transferable idea, and it is what the interviewer is listening for. Drill the two off-by-ones with it:
`n + 1` buckets, and a break that escapes both loops.

**Memorize cold — count plus a size-k heap.** The second one worth real recall, for two reasons. It is
the right answer when the follow-up is "now the data arrives as a stream of a billion events", where
buckets cannot be used at all, and it is the version whose "min-heap to find maxima" inversion people
get wrong under pressure. Being able to explain why the heap is a *min*-heap is a small thing that
reads as genuine understanding.

**Memorize cold — count plus sort.** Two lines, and the correct first thing to say. It gets a working
solution on the board in fifteen seconds and gives you something concrete to improve on, which is a
much better opening than silence while you assemble the optimal answer. Know its cost split — O(n) to
count, O(d log d) to rank — because naming which half is expensive is what motivates everything after
it.

**Understand but do not memorize — brute force.** Ten seconds to name and reject on the 10⁵ bound. Its
genuine use is as the oracle in a test suite, where being an obvious transcription of the problem
statement is the whole value.

**Understand but do not memorize — the counting array.** Nothing to recall, one thing to recognise: the
values here are bounded to ±10⁴, so the hash map in the counting half can be a plain array. Offer it
as a refinement after the bucket solution, not instead of it. The habit being trained is reading the
constraints for what they *unlock*, and this problem unlocks two separate things — counts bounded by n
gives you the buckets, values bounded by 10⁴ gives you the tally array.

---

## Full Runnable Script

Every approach above, plus a test suite covering the statement's two examples, a single-element input,
`k` equal to the full distinct count, a value repeated with no competition, negatives, a long tail with
`k = 1`, an input outside the stated value range that forces the counting-array fallback, and eighteen
randomised stress cases built so that every distinct value has a different frequency — which makes the
top `k` unique for any `k`, exactly as the constraints promise. Results are compared as sets, because
the problem does not specify an order among the answers, and the heap approach genuinely emits tied
counts in a different order from the others.

```python
"""Top K Frequent Elements - every approach in one file, plus a self-checking test suite.

Run: python top_k_frequent_all.py
"""

from __future__ import annotations

import heapq
import random
from collections import Counter


# --- 1. Brute force: count by rescanning, then pick the maxima ----------------

def top_k_frequent_brute_force(nums: list[int], k: int) -> list[int]:
    distinct: list[int] = []
    for x in nums:
        if x not in distinct:  # membership test on a list: a scan, not a lookup
            distinct.append(x)
    counts: list[int] = []
    for value in distinct:
        counts.append(sum(1 for x in nums if x == value))  # a full pass per distinct value
    out: list[int] = []
    taken = [False] * len(distinct)
    for _ in range(k):
        best = -1
        for idx in range(len(distinct)):
            if not taken[idx] and (best == -1 or counts[idx] > counts[best]):
                best = idx
        taken[best] = True
        out.append(distinct[best])
    return out


# --- 2. Count with a hash map, then sort the distinct values by count ---------

def top_k_frequent_sort_counts(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    return sorted(counts, key=lambda v: counts[v], reverse=True)[:k]


# --- 3. Count, then a heap of size k -----------------------------------------

def top_k_frequent_heap(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    heap: list[tuple[int, int]] = []  # (count, value), smallest count on top
    for value, c in counts.items():
        if len(heap) < k:
            heapq.heappush(heap, (c, value))
        elif c > heap[0][0]:
            heapq.heapreplace(heap, (c, value))  # push and pop in one sift
    return [value for _, value in sorted(heap, reverse=True)]


# --- 4. Bucket by count (optimal) --------------------------------------------

def top_k_frequent_buckets(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    buckets: list[list[int]] = [[] for _ in range(len(nums) + 1)]  # a count can never exceed n
    for value, c in counts.items():
        buckets[c].append(value)
    out: list[int] = []
    for c in range(len(nums), 0, -1):
        for value in buckets[c]:
            out.append(value)
            if len(out) == k:
                return out
    return out


# --- 5. Counting array, only when the values are small and bounded -----------

def top_k_frequent_counting_array(
    nums: list[int], k: int, lo: int = -10**4, hi: int = 10**4
) -> list[int]:
    if not nums:
        return []
    if min(nums) < lo or max(nums) > hi:  # the bounded-value assumption fails; fall back
        return top_k_frequent_buckets(nums, k)
    tally = [0] * (hi - lo + 1)  # one slot per possible value, no hashing at all
    for x in nums:
        tally[x - lo] += 1
    buckets: list[list[int]] = [[] for _ in range(len(nums) + 1)]
    for offset, c in enumerate(tally):
        if c:
            buckets[c].append(offset + lo)
    out: list[int] = []
    for c in range(len(nums), 0, -1):
        for value in buckets[c]:
            out.append(value)
            if len(out) == k:
                return out
    return out


APPROACHES = [
    ("brute_force", top_k_frequent_brute_force),
    ("sort_counts", top_k_frequent_sort_counts),
    ("heap", top_k_frequent_heap),
    ("buckets", top_k_frequent_buckets),
    ("counting_array", top_k_frequent_counting_array),
]


# --- test suite ---------------------------------------------------------------

def distinct_count_case(distinct: int, rng: random.Random) -> list[int]:
    """Every value gets its own frequency, so the top k is unique for any k."""
    values = rng.sample(range(-500, 500), distinct)
    frequencies = list(range(1, distinct + 1))
    rng.shuffle(frequencies)
    nums = [v for v, f in zip(values, frequencies) for _ in range(f)]
    rng.shuffle(nums)
    return nums


def main() -> None:
    cases: list[tuple[str, list[int], int]] = [
        ("statement example", [4, 4, 4, 6, 6, 2], 2),
        ("single element", [9], 1),
        ("k equals the distinct count", [1, 1, 2, 2, 3], 3),
        ("one value repeated", [5, 5, 5], 1),
        ("negatives", [-1, -1, -1, 2, 2, 7], 2),
        ("k = 1 on a long tail", [8, 8, 8, 8, 1, 2, 3, 4, 5], 1),
        ("out of the stated value range, falls back", [10**6, 10**6, -10**6, 3], 2),
    ]

    rng = random.Random(20260912)
    for distinct in range(2, 20):
        nums = distinct_count_case(distinct, rng)
        cases.append((f"stress distinct={distinct}, k={max(1, distinct // 2)}",
                      nums, max(1, distinct // 2)))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums, k in cases:
        shown = nums if len(nums) <= 10 else nums[:10] + ["..."]
        print(f"\n{label}: nums={shown} k={k}")
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums), k)
            results.append(sorted(got))  # order among the answers does not matter
            print(f"  {name:<{width}} -> {got}")
        agreed = all(r == results[0] for r in results) and len(results[0]) == k
        if not agreed:
            all_agreed = False
            print("  DISAGREEMENT")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE (compared as sets; order is not specified)."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
