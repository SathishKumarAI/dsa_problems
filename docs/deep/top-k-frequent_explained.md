# Top K Frequent Elements — explained

## Understanding the Problem

Picture a shoebox of shop receipts and the question "which two shops did I visit most?". That is this
problem: given a list of whole numbers in which the same number may appear many times, and a number
`k`, return the `k` numbers that show up most often. You return the *values* — not their positions,
not their counts — and the order does not matter, so `[4, 6]` and `[6, 4]` are equally correct.

**The core question:** which `k` values have the largest counts? The work splits into two halves that
are not equally hard. **Counting** is the easy half: one walk of the list, tallying as you go.
**Ranking** is where every approach differs, and the naive one is slow because it answers "how often
does this value appear?" by re-scanning the whole list once per distinct value, then answers "which
are biggest?" by re-scanning the counts once per answer.

The whole ladder below is one question asked with increasing precision: **how much ordering does the
answer actually need?** You are asked for a set of `k` values, unordered — not in rank order, not with
their counts, and nothing about the values below the cut. A full sort supplies far more than that, and
every rung is a step toward supplying less.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `1 <= nums.length <= 10^5` | A hundred thousand elements makes the `O(n²)` brute force around 10¹⁰ operations — unrunnable. **This is what rules brute force out.** The lower bound of `1` means the list is never empty, so `k = 1` always has an answer. |
| `-10^4 <= nums[i] <= 10^4` | Only 20,001 values are possible. **This is what unlocks the counting-array rung (Approach 5)**: a plain array of 20,001 slots replaces the hash map, because a value can be an array index directly. Compare problems whose values span ±10⁹, where that door is shut. |
| `1 <= k <= the number of distinct values in nums` | You are never asked for more values than exist, so no approach needs a "not enough distinct values" branch. It also means `k` can be as large as `d`, which is why *"`k` is always small"* is an assumption you may not make. |
| the answer is unique — no tie spans the `k`-th place | **This is what makes the answer well-defined without a tie-break rule.** Two values may share a count *inside* the top `k`, but the boundary is never ambiguous, so every approach returns the same *set* even though they emit it in different orders. |
| *(implied)* a count can never exceed `n` | **This is what unlocks the bucket rung (Approach 4), the optimal one.** Counts are not arbitrary numbers — they are integers in `1..n`, and small bounded integers can be array *indices* rather than sort *keys*. That single substitution removes every comparison from the ranking half. |

Throughout, `n` is the number of elements, `d` the number of distinct values.

The worked example used in every section below is the statement's own:

```
nums = [4, 4, 4, 6, 6, 2], k = 2        answer: [4, 6]
```

The counts are `4` → three times, `6` → twice, `2` → once. The top two are `4` and `6`; `2` is the
one left out.

---

## Approach 1 — Brute force: count by rescanning, then pick the maxima  *(an addition — not in the data file's ladder)*

### The idea

*How do I know how often a value appears?* Walk the whole list and count the matches. Do that for
each distinct value, then find the largest count by scanning the counts, mark that value as taken,
and scan again for the next largest — `k` times over.

### How to think about it

> **Intuition.** The shoebox again, with no way to keep a running tally. You pick the first shop name
> you see and flip through the entire box counting its receipts; then the next unfamiliar name, and
> flip through the whole box again. Once you have a list of shop-and-count pairs you read down it to
> find the biggest, cross it off, and read down it again for the second biggest. Nothing is ever
> remembered between passes — not the counts you are accumulating, not the ranking already done — and
> that amnesia appears in *both* halves, the counting and the ranking.

### Worked example

`nums = [4, 4, 4, 6, 6, 2]`, `k = 2`.

**Collect the distinct values**, checking each element against those found so far — itself a scan,
not a lookup:

| element | already in `distinct`? | `distinct` after |
|---|---|---|
| 4 | no | `[4]` |
| 4 | yes | `[4]` |
| 4 | yes | `[4]` |
| 6 | no | `[4, 6]` |
| 6 | yes | `[4, 6]` |
| 2 | no | `[4, 6, 2]` |

**Count each one** with its own full pass over all six elements:

| value | full pass over `[4, 4, 4, 6, 6, 2]` | `counts` |
|---|---|---|
| 4 | hit, hit, hit, miss, miss, miss | 3 |
| 6 | miss, miss, miss, hit, hit, miss | 2 |
| 2 | miss, miss, miss, miss, miss, hit | 1 |

**Select the top `k`** by scanning the counts once per answer:

| round | counts still available | largest | `taken` after | `out` so far |
|---|---|---|---|---|
| 1 | 4→3, 6→2, 2→1 | `4` (count 3) | `[T, F, F]` | `[4]` |
| 2 | 6→2, 2→1 | `6` (count 2) | `[T, T, F]` | `[4, 6]` |

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

> **Watch out.** The misconception is that "find the maximum `k` times" *means* "find the top `k`".
> It does not: without removing the winner, the same maximum wins every round. On the example that
> returns `[4, 4]` instead of `[4, 6]`.

The usual patch is to set the winner's count to `-1` after taking it. It works, and it silently
corrupts `counts`; anything later in the function that reads those counts reads lies. A separate
`taken` array keeps the data honest at the cost of one list.

The related mistake is collecting `distinct` by appending every element and deduplicating later — on
an array where one value repeats 10⁵ times, that is a 10⁵-entry list to scan on every membership
check.

### Complexity and when to use this

**Time** `O(n²)`, **space** `O(d)`. The quadratic term has two independent sources and both are worth
naming: collecting the distinct values costs `O(n·d)` because each membership test is a list scan, and
counting costs another `O(n·d)` because each value gets a full pass. Selection adds `O(k·d)`, small by
comparison. Space is the distinct-value list and its counts.

Use it when the list is tiny and you want code checkable by eye, and — its real role — as the
**oracle** the fast versions are tested against, which is exactly its job in the test suite below. At
the stated 10⁵ elements it is unusable.

---

## Approach 2 — Count with a hash map, then sort the distinct values by count

### The idea

*Both halves of the brute force rescan — can either be done in one pass?* The counting half can: a
hash map turns "how many times have I seen this value?" into a single step, so one walk produces every
count. Then sort the distinct values by count, biggest first, and take the first `k`.

This fixes brute force's weakness twice over — **it re-reads the entire list once per distinct value
to count, and re-reads the counts once per answer to rank.**

### How to think about it

> **Intuition.** Two separate jobs, each with the right tool. The counting is a **tally sheet**: every
> element you pass gets a mark next to its value, one step per element, and at the end the sheet is
> complete. The ranking is a **filing job**: put the distinct values in a row ordered by their marks
> and read off the front. The thing to see is that these are *separate bills* — the tally is linear in
> `n`, the sort is `d log d` in the number of distinct values — and improving one does nothing for the
> other. From here on the counting half never changes again; every remaining rung attacks the ranking.

### Worked example

`nums = [4, 4, 4, 6, 6, 2]`, `k = 2`. **Count** in one pass, updating the map in place:

| element | `counts` after |
|---|---|
| 4 | `{4: 1}` |
| 4 | `{4: 2}` |
| 4 | `{4: 3}` |
| 6 | `{4: 3, 6: 1}` |
| 6 | `{4: 3, 6: 2}` |
| 2 | `{4: 3, 6: 2, 2: 1}` |

**Sort** the distinct values by count, descending, and slice off the first `k = 2`:

| sorted position | value | count | inside `k`? | `out` so far |
|---|---|---|---|---|
| 0 | `4` | 3 | yes | `[4]` |
| 1 | `6` | 2 | yes | `[4, 6]` |
| 2 | `2` | 1 | no — carefully placed, then discarded | `[4, 6]` |

That last row is the waste the next two rungs chip away at: the sort put `2` in its correct place at
the bottom, and nobody asked.

### Code

```python
from collections import Counter


def top_k_frequent_sort_counts(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    return sorted(counts, key=lambda v: counts[v], reverse=True)[:k]
```

### Common mistake

> **Watch out.** The misconception is that a default sort on `counts.items()` sorts by **count**,
> because counting is what the problem is about. It sorts by the tuple's *first* element, which is the
> value.

`sorted(counts.items())` with no `key` returns `[(2, 1), (4, 3), (6, 2)]` on the example, so the top
two come out as `2` and `4`. The answer looks plausible — right number of items, drawn from the right
set — and is wrong, which is the worst kind of bug. Always name the sort key explicitly.

The smaller slip is sorting the items and forgetting to extract the values, returning
`[(4, 3), (6, 2)]` instead of `[4, 6]`. A type checker catches that one; an interviewer will not let
it pass either, because the problem asks for elements, not pairs.

### Complexity and when to use this

**Time** `O(n + d log d)`, usually written `O(n log n)`; **space** `O(d)`. Split the bill: counting is
`O(n)`, one hash operation per element; sorting is `O(d log d)` over the distinct values, which in the
worst case (everything distinct) is `d = n`. The **sort** is the only super-linear term, so it is the
only thing worth attacking.

Use it when `k` is close to `d` — if you want nearly all of them ranked anyway, sorting gives you that
for free and the fancier approaches gain nothing. Use it also when you need the results *in rank
order*, which the optimal approach does not guarantee, or simply when the input is small and two lines
of obviously-correct code beats twelve.

---

## Approach 3 — Count, then a heap of size k

### The idea

*The sort orders every distinct value, but only `k` are wanted — can the rest be left unordered?* Yes.
Keep a collection of just the `k` best candidates seen so far, with the weakest of them instantly
reachable. Each new value is compared only against that weakest candidate: better, swap; worse,
discard. The cost then follows `k` rather than `d`.

This fixes Approach 2's weakness — **it fully ranks every distinct value, including all the ones that
will never appear in the answer.**

### How to think about it

> **Intuition.** A leaderboard with exactly `k` slots and one special property: you can always see
> who is in *last* place, instantly. A contender arrives and is compared only with that last-place
> holder. Worse? They go home and nobody else on the board is even disturbed. Better? Last place is
> evicted and the newcomer slots in, which takes a moment of reshuffling but only about `log k` of it
> — the board is never re-ranked. The counter-intuitive part, worth sitting with: the board is a
> **min**-heap even though you want the **maximum** counts.

> **Why it works.** The invariant is that the heap always holds the `k` largest counts seen so far,
> and `heap[0]` is the smallest of them. That makes `heap[0]` the only element a newcomer can
> displace: anything that fails to beat the weakest survivor cannot beat any of the other `k - 1`
> either, so one comparison safely dismisses it. This is why the heap must be a min-heap — a max-heap
> would put the *least* useful element, the current champion, at the one position you can see.

This is the instinctive move once you know the phrase "top k" — heap is the reflex. It is a real
improvement and it is not optimal, which is exactly why it is on the ladder.

### Worked example

`nums = [4, 4, 4, 6, 6, 2]`, `k = 2`. The counting half is identical to Approach 2 and produces
`{4: 3, 6: 2, 2: 1}`. Feed those three pairs to a min-heap keyed by count:

| pair offered | heap size before | `heap[0]` (weakest) | decision | heap after |
|---|---|---|---|---|
| `(4, count 3)` | 0 | — | room — push | `[(3, 4)]` |
| `(6, count 2)` | 1 | — | room — push | `[(2, 6), (3, 4)]` |
| `(2, count 1)` | 2 (full) | `(2, 6)` | 1 does not beat 2 — **discard, heap untouched** | `[(2, 6), (3, 4)]` |

Read the two values off the heap: `[4, 6]`.

The third row is the whole point. The value `2` is dismissed by a single comparison against the
weakest survivor and no reordering happens at all, where a full sort would have carefully placed it
last — work the answer never uses.

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

`heapq.nlargest(k, counts, key=counts.get)` does exactly this and is what you would write in real
code; the explicit version is here because the interview question is about the mechanism, not the
library call.

### Common mistake

> **Watch out.** The misconception is that tuple order in the heap is cosmetic — that
> `(value, count)` and `(count, value)` are the same pair written two ways. Tuples compare
> left-to-right, so the first element *is* the sort key, and `(value, count)` builds a heap that
> orders by value and never consults a count at all.

What makes this one dangerous is that it often still returns the right answer: on the running example
it does. It fails on `nums = [7, 4, 4, 4, 7, 4, 4]` with `k = 1`, where the counts are `{7: 2, 4: 5}`
— the heap fills with `(7, 2)`, then tests the incoming `4` by asking whether its count `5` beats the
heap top's first element, which is the *value* `7`, decides it does not, and returns `[7]` instead of
`[4]`.

The other mistake is building a max-heap of all `d` counts and popping `k` times. Right answer, and
the improvement is quietly thrown away: heapifying costs `O(d)`, then `k` pops at `O(log d)` each, so
the cost is tied to `d` again. The whole reason to reach for a heap is to **bound** its size at `k`; a
heap of size `d` is a sort that stopped early.

### Complexity and when to use this

**Time** `O(n + d log k)`, **space** `O(n)`. Counting is `O(n)`. The ranking visits each of the `d`
distinct values once and pays at most `O(log k)` — the depth of a `k`-element heap — for the ones that
get inserted; values that lose their single comparison cost `O(1)`. Space is the count map, `O(d)` and
therefore `O(n)` at worst, plus the `k`-element heap.

Use it when `k` is genuinely small relative to `d` — the classic "top 10 out of a million" — and
especially when the data arrives as a **stream** you cannot store or re-read. A bounded heap is the
canonical streaming top-k structure; the bucket approach below is not, because it needs `n` known in
advance and all counts finished before it starts. When `k` approaches `d`, `log k` approaches `log d`
and this stops beating a plain sort.

---

## Approach 4 — Bucket by count (optimal)

### The idea

*The heap still pays a logarithm per candidate — can the counts be ordered without comparing them at
all?* They can, because a count is not an arbitrary number: it is an integer in `1..n`. Make an array
with one slot per possible count, drop each value into the slot matching its count, then read the
slots from the top down until you have `k` values.

This fixes Approach 3's weakness — **every insertion still costs a logarithm, because a heap ranks by
comparing.**

### How to think about it

> **Intuition.** A wall of numbered pigeonholes, one for each possible count from `0` up to `n`. A
> value that appears seven times goes in hole 7 — no comparison, no search, you walk up to the hole
> with its number on it. Once every value is placed the wall is sorted by construction, and you read
> it from the highest hole downward, taking values until you have `k`. The substitution at the heart
> of this is worth naming: **comparison becomes placement**. A count is used as an address.

> **Why it works.** A count is bounded — no value can appear more than `n` times in a list of `n`
> elements — so `buckets[c]` is always a legal index and the wall needs exactly `n + 1` holes. That
> boundedness is the entire licence: an unbounded key could not be an address. Ordering then comes for
> free, because hole numbers *are* counts, so descending hole order is descending count order without
> a single comparison. The downward read is correct to stop early because every value still unseen
> sits in a lower hole, and therefore has a count no larger than the ones already collected.

That is the same idea behind counting sort, bucket sort and radix sort.

### Worked example

`nums = [4, 4, 4, 6, 6, 2]`, `k = 2`. Counting gives `{4: 3, 6: 2, 2: 1}` as before. Build a wall of
`n + 1 = 7` pigeonholes, numbered `0` through `6`, and place each value:

| value | its count | goes into hole | wall after |
|---|---|---|---|
| 4 | 3 | 3 | `[[], [], [], [4], [], [], []]` |
| 6 | 2 | 2 | `[[], [], [6], [4], [], [], []]` |
| 2 | 1 | 1 | `[[], [2], [6], [4], [], [], []]` |

Read from the top down, collecting until two values are in hand:

| hole | contents | action | `out` |
|---|---|---|---|
| 6 | empty | nothing | `[]` |
| 5 | empty | nothing | `[]` |
| 4 | empty | nothing | `[]` |
| 3 | `[4]` | take `4` | `[4]` |
| 2 | `[6]` | take `6` — that is `k = 2`, **stop** | `[4, 6]` |

Hole 1, holding the value `2`, is never even looked at.

### Code

The ranking half is shared with Approach 5 — the two rungs differ *only* in how they produce the
counts — so it lives in one named helper. That is also the one place to edit if the two off-by-ones
below ever need fixing:

```python
def top_k_by_bucketing(counts: dict[int, int], n: int, k: int) -> list[int]:
    """Ranking half: a count is an index, so nothing is ever compared."""
    buckets: list[list[int]] = [[] for _ in range(n + 1)]  # a count can never exceed n
    for value, c in counts.items():
        buckets[c].append(value)
    out: list[int] = []
    for c in range(n, 0, -1):
        for value in buckets[c]:
            out.append(value)
            if len(out) == k:
                return out
    return out


def top_k_frequent_buckets(nums: list[int], k: int) -> list[int]:
    return top_k_by_bucketing(Counter(nums), len(nums), k)
```

### Common mistake

> **Watch out.** The misconception is that the wall needs one hole per element, so `len(nums)` holes.
> The holes are **counts**, not positions, and counts run `0` through `n` inclusive — that is `n + 1`
> of them.

Allocating `len(nums)` buckets means hole `n` does not exist, so a value filling the whole array —
`[5, 5, 5]` with `k = 1` — crashes with an index error on the one input where the answer is most
obvious.

The second mistake is a `break` that only escapes the inner loop. In Java or C++ a single `break`
inside the inner `for` leaves the outer loop running and the code keeps collecting from the next
bucket down, returning more than `k` values. Either re-check the size after the inner loop (the
reference Java and C++ solutions in this repo do that) or return directly from inside it, as the
Python above does.

A third, quieter one: `buckets = [[]] * (n + 1)` creates `n + 1` references to *the same* list, so
every append lands in every bucket. Use a comprehension.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n)`. Every term is linear and worth attributing: counting is `O(n)`,
allocating the buckets is `O(n)`, placing the distinct values is `O(d)` which is at most `O(n)`, and
the downward read visits at most `n + 1` buckets while collecting at most `k` values. No comparison
sort anywhere, so nothing contributes a logarithm.

**This is the one to memorize.** Note the honest trade-off: it allocates `n + 1` buckets even when
only three distinct values exist, so on a million elements with five distinct values it touches far
more memory than the heap — and unlike the heap it cannot work on a **stream**, because it needs all
counts complete and `n` known before it starts. Asymptotically optimal is not the same as best in
every situation.

---

## Approach 5 — A counting array when the values are small and bounded  *(an addition — not in the data file's ladder)*

### The idea

*The counting half still hashes every element — but must it?* Not here. Every value lies between
−10⁴ and 10⁴, so there are only 20,001 possibilities and a value can index a plain array directly.
Replace the hash map with an array of tallies; the ranking half is unchanged, and reuses
`top_k_by_bucketing` verbatim.

This fixes no complexity weakness of Approach 4 — both are `O(n)` — but it removes a constant factor:
**every map update costs a hash computation, a bucket probe and, as the map grows, occasional
rehashing of everything already in it.**

### What must be true, and what breaks if it is not

The assumption is that the value range is small enough to allocate one tally slot per possible value.
**This problem's constraints say it is** — 20,001 slots is about 160 KB. That makes this rung
genuinely available here, unlike in problems whose values span ±10⁹, where the array would need tens
of gigabytes.

What breaks if the assumption fails: an unguarded allocation is not a wrong answer but a dead process,
an immediate out-of-memory. The implementation below checks the actual range first and falls back to
plain hashing, which is what any library-quality version would do. The subtler break is forgetting the
`- lo` offset when indexing — negative values then index from the wrong end of the array in Python,
where a negative index wraps around silently, and throw in Java or C++.

The trade is not free either. The tally array is 20,001 slots whether the input has three distinct
values or twenty thousand, and every slot must be allocated, zeroed and scanned. On a six-element
input that is far more work than a hash map does; the win appears when `n` is large, because
per-element cost is what dominates then and an array index beats a hash every time.

### Worked example

`nums = [4, 4, 4, 6, 6, 2]`, `k = 2`. The slot for a value `v` is at index `v + 10000`. Only three
slots are ever touched:

| element | slot index | `tally` at that slot after |
|---|---|---|
| 4 | 10004 | 1 |
| 4 | 10004 | 2 |
| 4 | 10004 | 3 |
| 6 | 10006 | 1 |
| 6 | 10006 | 2 |
| 2 | 10002 | 1 |

Then walk the whole tally array, skipping the zeros, converting each surviving slot back into a value
and count — after which `top_k_by_bucketing` does exactly what it did in Approach 4:

| slot found non-zero | value it represents | count | goes into hole |
|---|---|---|---|
| 10002 | `2` | 1 | 1 |
| 10004 | `4` | 3 | 3 |
| 10006 | `6` | 2 | 2 |

Reading the wall from hole 6 downward gives `[4, 6]` — the same answer, reached without a single hash
computation, at the cost of scanning all 20,001 tally slots to find the three that matter.

### Code

```python
def top_k_frequent_counting_array(
    nums: list[int], k: int, lo: int = -10**4, hi: int = 10**4
) -> list[int]:
    if not nums:
        return []
    if min(nums) < lo or max(nums) > hi:  # the bounded-value assumption fails; hash instead
        return top_k_by_bucketing(Counter(nums), len(nums), k)
    tally = [0] * (hi - lo + 1)  # one slot per possible value, no hashing at all
    for x in nums:
        tally[x - lo] += 1
    counts = {offset + lo: c for offset, c in enumerate(tally) if c}  # un-offset on the way out
    return top_k_by_bucketing(counts, len(nums), k)
```

### Common mistake

> **Watch out.** The misconception is that the offset is an *implementation detail of the write* —
> something you do to make the index legal, and then forget. It is half of a pair: the moment you
> subtract `lo` on the way in, adding it back on the way out is part of the same change, not a step
> to remember later.

Appending `offset` rather than `offset + lo` shifts every answer by 10,000: on the example you get
`[10004, 10006]` instead of `[4, 6]`. It survives every test whose values happen to start at zero —
most hand-written tests — and fails the moment a negative value appears.

### Complexity and when to use this

**Time** `O(n + V)`, **space** `O(n + V)`, where `V` is the size of the value range, here a fixed
20,001. The `O(V)` term is the allocation, zeroing and full scan of the tally array — constant for
this problem but not free, and on a short input it dominates completely. The per-element counting is a
subtraction and an array increment, measurably faster than a hash map update when `n` is large.

Use it when the value range is small and stated and `n` is large enough that per-element cost is what
matters — characters, digits, grades, small enum codes, pixel intensities. Do not reach for it when
the range is wide or unknown, and do not present it as the primary interview answer: present Approach
4, then offer this as *"and since the values are bounded to ±10⁴, the map can be an array"*. Noticing
that a constraint has unlocked something is the point.

---

## The Overall Arc

Counting is the easy half and it stops changing after the second rung; the whole ladder is really one
question asked with increasing precision — **how much ordering does the answer actually need?** Brute
force answers it with no structure at all, rescanning the entire list once per distinct value to count
and then rescanning the counts once per answer to rank, so both halves are quadratic and neither
remembers anything. A hash map fixes the counting half outright, turning "how often?" into a single
step per element, and from there the counting never gets better and never needs to; what remains is
the ranking. Sorting the distinct values by count is the obvious ranking tool and it works, but look
at what it delivers: a complete ordering of every distinct value, including a careful placement of
everything below the cut that the answer will never mention. A heap of size `k` supplies strictly less
— it orders only the current contenders, so a value that cannot make the cut is dismissed by one
comparison instead of being sorted into its rightful place, and the logarithm now follows `k` rather
than the whole set. That is a real improvement and it is still paying a logarithm on every candidate
that does get in, which raises the last question: does ranking require comparing at all? It does not,
because a count is not an arbitrary key — it is an integer between 1 and `n`, and a small bounded
integer can be an *address* instead of a sort key. Drop each value into the pigeonhole numbered with
its count and the wall is sorted by construction, with no comparison anywhere and a downward read that
stops as soon as `k` values are in hand. That substitution — comparison becomes placement — is the
same engine behind counting sort, bucket sort and radix sort, and once you see it you can apply it to
the counting half too, because this problem's values are themselves bounded to ±10⁴ and so can index
an array directly instead of being hashed. The honest closing note is that "optimal" here means
asymptotically optimal, and the right choice still depends on which quantity is small: a tiny `k`
against a huge distinct set favours the heap (which also works on a stream, where buckets cannot), a
`k` near the distinct count favours plain sorting (which hands you the order for free), and a tight
bound on the key is what favours buckets.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | `O(n²)` | `O(d)` | Rescans in both halves and remembers nothing | `n` is tiny; as the test-suite oracle |
| Count + sort | `O(n + d log d)` | `O(d)` | Simplest correct code, but fully ranks values that will never be returned | `k` is near `d`; you want results in rank order; small inputs |
| Count + heap of size `k` | `O(n + d log k)` | `O(n)` | Orders only the contenders, so the logarithm follows `k` — but still compares on every insert | `k` ≪ `d`; streaming data that cannot be stored or re-read |
| **Count + buckets** | **`O(n)`** | **`O(n)`** | **Replaces comparison with placement; allocates `n + 1` buckets regardless of how few distinct values exist** | **The default answer for this problem** |
| Counting array + buckets | `O(n + V)` | `O(n + V)` | Removes hashing from the counting half too, at the price of a fixed `V`-sized array | The value range is small and stated (here ±10⁴) and `n` is large |

---

## Interview Priority

> **In an interview.** Open with count-plus-sort out loud — *"tally with a hash map, sort the distinct
> values by count, slice `k`"* — so something correct is on the board in fifteen seconds, then name
> the waste: *"the sort ranks everything below the cut, and nobody asked for that."* Improve to
> buckets and justify it in one sentence: **a count cannot exceed `n`, so counts can be array indices
> instead of sort keys.** The follow-up is reliably **"now the data arrives as a stream of a billion
> events"** — the answer is the size-`k` heap, because buckets need `n` known up front and all counts
> finished before they can start.

**Memorize cold — count plus buckets.** The answer the problem is testing and the one that reaches
linear time. What matters is being able to say *why* it is legal in one sentence, because that
sentence is the transferable idea. Drill the two off-by-ones with it: `n + 1` buckets, and a break
that escapes both loops.

**Memorize cold — count plus a size-`k` heap.** Worth real recall for two reasons: it is the right
answer to the streaming follow-up, and it is the version whose "min-heap to find maxima" inversion
people get wrong under pressure. Being able to explain why the heap is a *min*-heap reads as genuine
understanding.

**Memorize cold — count plus sort.** Two lines, and the correct first thing to say. Know its cost
split — `O(n)` to count, `O(d log d)` to rank — because naming which half is expensive is what
motivates everything after it.

**Understand but do not memorize — brute force.** Ten seconds to name and reject on the `10^5` bound.
Its genuine use is as the oracle in a test suite.

**Understand but do not memorize — the counting array.** Nothing to recall, one thing to recognise:
the values are bounded to ±10⁴, so the map in the counting half can be a plain array. Offer it as a
refinement *after* the bucket solution. The habit being trained is reading the constraints for what
they **unlock**, and this problem unlocks two separate things — counts bounded by `n` gives you the
buckets, values bounded by 10⁴ gives you the tally array.

---

## Full Runnable Script

Every approach above, plus a test suite covering the statement's example, a single-element input, `k`
equal to the full distinct count, a value repeated with no competition, negatives, a long tail with
`k = 1`, an input outside the stated value range that forces the counting-array fallback, and eighteen
randomised stress cases built so every distinct value has a different frequency — which makes the top
`k` unique for any `k`, exactly as the constraints promise.

Two things below are **scaffolding**, not answers: `distinct_count_case` builds those stress inputs,
and the harness compares results with `sorted(...)` because the problem specifies no order among the
answers and the heap genuinely emits them in a different order from the others. `top_k_by_bucketing`
is not scaffolding — it is the shared ranking half of Approaches 4 and 5, defined once here and used
by both.

```python
"""Top K Frequent Elements - every approach in one file, plus a self-checking test suite.

Run: python top_k_frequent_all.py
"""

from __future__ import annotations

import heapq
import random
from collections import Counter


# --- shared ranking half, used by approaches 4 and 5 --------------------------

def top_k_by_bucketing(counts: dict[int, int], n: int, k: int) -> list[int]:
    """Ranking half: a count is an index, so nothing is ever compared."""
    buckets: list[list[int]] = [[] for _ in range(n + 1)]  # a count can never exceed n
    for value, c in counts.items():
        buckets[c].append(value)
    out: list[int] = []
    for c in range(n, 0, -1):
        for value in buckets[c]:
            out.append(value)
            if len(out) == k:
                return out
    return out


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
    return top_k_by_bucketing(Counter(nums), len(nums), k)


# --- 5. Counting array, only when the values are small and bounded -----------

def top_k_frequent_counting_array(
    nums: list[int], k: int, lo: int = -10**4, hi: int = 10**4
) -> list[int]:
    if not nums:
        return []
    if min(nums) < lo or max(nums) > hi:  # the bounded-value assumption fails; hash instead
        return top_k_by_bucketing(Counter(nums), len(nums), k)
    tally = [0] * (hi - lo + 1)  # one slot per possible value, no hashing at all
    for x in nums:
        tally[x - lo] += 1
    counts = {offset + lo: c for offset, c in enumerate(tally) if c}  # un-offset on the way out
    return top_k_by_bucketing(counts, len(nums), k)


APPROACHES = [
    ("brute_force", top_k_frequent_brute_force),
    ("sort_counts", top_k_frequent_sort_counts),
    ("heap", top_k_frequent_heap),
    ("buckets", top_k_frequent_buckets),
    ("counting_array", top_k_frequent_counting_array),
]


# --- test suite (scaffolding below this line, not answers) --------------------

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
