# The Value That Owns the Majority — explained

## Understanding the Problem

You are handed a list of numbers in which one value appears **more than half the time**, and you
must say which value that is. "More than half" is strict: in a list of seven, the winner must appear
at least four times; a value appearing exactly three of six times does not qualify. You are told up
front that such a value exists, so you are never asked to report its absence.

**The core question is: which single value occurs more often than everything else put together?**
The naive approach is slow because it answers that by re-counting: it takes one value, sweeps the
whole list to tally it, then takes the next value and sweeps the whole list again — about n²
comparisons, which at the maximum allowed size is 2.5 billion.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| `1 <= nums.length <= 5 * 10^4` | Quadratic work is ~2.5 × 10⁹ comparisons, far past a one-second budget, so the re-counting approach will not survive. The lower bound of 1 also means a single-element list is legal, and that element is trivially its own majority — worth checking your code handles it. |
| `-10^9 <= nums[i] <= 10^9` | The values are arbitrary integers over a huge range, so you cannot index an array by value the way you could with lowercase letters or small bounded numbers. That rules out a counting array and forces either a hash map, a sort, or something that stores no per-value state at all. It also means the values are only ever compared for equality — nothing here needs arithmetic on them, so overflow is not a concern. |
| **the majority element is guaranteed to exist** | This is the load-bearing promise. It is what lets the final approach run a single counter and trust whatever survives, with no verification and no memory. It is also the one constraint most likely to be removed in a follow-up question, and removing it does not slow the algorithm down — it makes the algorithm *wrong* until you add a second pass. |
| more than n/2 means **strictly** more than half | This is what makes the pairing argument work at all. A value with exactly half the elements can be cancelled out one-for-one by the rest and leave nothing standing; a value with even one more than half cannot. It is also why every comparison in your code must be `>` and never `>=`. |

Nothing in the problem asks *how many times* the winner appears. That gap — between the question
asked and the information a counting solution collects — is the space the best approach lives in.

---

## Approach 1 — Count each value by rescanning

### The idea

*How do I know whether a value is the majority?* Count how many times it appears and compare that
against half the length. *And how do I find the majority?* Do that for every value in the list and
return the first one that clears the bar. This is the definition transcribed directly into code; it
assumes nothing at all about the input.

### How to think about it

Two fingers again. The outer finger picks a candidate value; the inner finger walks the entire list
tallying how many times that exact value shows up. When the tally clears half the length, you are
done. The work is a full sweep per candidate, and since candidates come from the list itself, the
list is swept up to n times. The waste is easy to name: sweeping for the value `2` learns exactly
how many `1`s there are too — it counts them, passes over them, and throws that away before
starting the next sweep. Every later approach is a way of keeping something from that sweep.

### Worked example

Input: `nums = [2, 2, 1, 1, 1, 2, 2]`. The list has 7 elements, so the winner needs **more than 3**
occurrences, meaning at least 4.

The outer finger starts on `nums[0] = 2`, and the inner finger sweeps:

| position | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| value | 2 | 2 | 1 | 1 | 1 | 2 | 2 |
| is it a `2`? | yes | yes | no | no | no | yes | yes |
| running tally of `2` | 1 | 2 | 2 | 2 | 2 | 3 | **4** |

Tally 4 > 3, so the answer is `2`, found on the first candidate after 7 comparisons. That was luck
of the draw: the majority happened to sit at index 0. Feed it `[5, 6, 7, 8, 8, 8, 8, 8, 8]` and the
outer finger burns a full sweep on `5`, another on `6`, another on `7`, and only clears the bar on
its fourth — 36 comparisons for nine elements. The worst case is a majority that starts late.

### Code

```python
def majority_element_brute_force(nums: list[int]) -> int:
    need = len(nums) // 2
    for x in nums:
        if sum(1 for y in nums if y == x) > need:  # strictly more than half
            return x
    return nums[0]
```

### Common mistake

Writing `>= need` instead of `> need`. Integer division has already rounded down, so `need` is 3
for a list of 7, and `>= 3` accepts a value that appears only three times out of seven — which is a
*minority*. On `nums = [1, 1, 1, 2, 2, 2, 2]` the loop meets `1` first, tallies 3, accepts it, and
returns `1` when the true majority is `2`. The fix is not to fiddle with the rounding but to drop
the division entirely: `2 * count > len(nums)` says "strictly more than half" with no rounding to
get wrong, and it is exactly the definition the statement gives.

### Complexity and when to use this

**Time O(n²), space O(1).** The cost is one full sweep per candidate and up to n candidates, each
sweep doing n equality checks. Space is a single tally, regardless of input size.

Use it as an oracle. It is so directly a restatement of "appears more than half the time" that if a
faster approach disagrees with it, the faster approach is the one that is wrong — which is precisely
the job it does in the stress test at the bottom of this file. Beyond that, it is the sentence you
say first in an interview to establish the baseline you are about to beat.

---

## Approach 2 — Sort, then take the middle

### The idea

*The rescanning wastes work because equal values are scattered — what if they were not?* Sort the
list and every run of equal values becomes one contiguous block. A block covering more than half
the list must cover the middle slot, whatever else is around it, so the answer is simply the element
sitting at the centre after sorting. This fixes the brute force's repeated sweeping by paying once
to restructure the input, then answering with a single array read.

### How to think about it

Two costs, and it pays to keep them apart. The first is the **restructuring**: sorting, at
O(n log n). The second is the **search**: once sorted, finding the answer is one indexing operation,
O(1) — you do not even scan. That is the trade this rung makes, and it is the general shape of a
whole family of solutions: spend a log-linear pass turning a messy input into a structured one, then
harvest the answer almost for free.

Why the middle slot specifically? Picture the sorted list as a row of seats and the majority as one
unbroken ribbon laid across more than half of them. However you slide a ribbon longer than half the
row, it must cover the centre seat — there is not enough room on either side for it to miss. So
whatever is sitting in the centre seat *is* the majority. The argument is geometric and needs no
counting at all.

### Worked example

Input: `nums = [2, 2, 1, 1, 1, 2, 2]`.

| Stage | Contents |
|---|---|
| as given | `[2, 2, 1, 1, 1, 2, 2]` |
| after sorting | `[1, 1, 1, 2, 2, 2, 2]` |
| index | ` 0  1  2  3  4  5  6` |

The middle index is `7 // 2 = 3`, and `ordered[3] = 2`. Answer: `2`.

Look at where the block of `2`s landed — indices 3 through 6, four seats out of seven. It could not
have avoided index 3: three seats to its left is all the room there is, and the block needs four.
That is the ribbon argument made concrete.

### Code

```python
def majority_element_sort(nums: list[int]) -> int:
    ordered = sorted(nums)
    return ordered[len(ordered) // 2]  # a majority always covers the middle slot
```

### Common mistake

Reaching for `len(ordered) // 2 - 1` — "the middle of a list of 7 is index 3, so for the element
*before* the middle…". On this very example that returns `ordered[2] = 1`, a value that appears
three times out of seven. The reason `n // 2` is the safe slot and `n // 2 - 1` is not: a block of
`n // 2 + 1` seats can sit flush against the right end, occupying indices `n // 2` through `n - 1`
and leaving index `n // 2 - 1` outside it — which is exactly what happened above. The centre slot is
the only index guaranteed to be covered for both odd and even lengths, so use it and nothing else.

A second, quieter mistake is calling an in-place sort on the caller's array. `nums.sort()` reorders
the list the caller handed you, which is a side effect nobody asked for; `sorted(nums)` copies.

### Complexity and when to use this

**Time O(n log n), space O(n).** The time is entirely the sort — the lookup afterwards is a single
array read and contributes nothing. The space is the sorted copy; sorting in place instead brings it
down to O(log n) for the recursion stack, at the cost of destroying the input.

It is not the fastest answer here, but it is worth more than its runtime suggests. It is three lines,
it is very hard to get wrong once you have the right index, and in an interview it is a perfectly
respectable second sentence — "sorting gives it to me in n log n, let me now do better". It is also
the approach that genuinely wins when you need *more* than the majority: the median, the top-k
values, or every value occurring more than n/3 times all fall out of a sorted array with a short
extra scan.

---

## Approach 3 — Count everything in a hash map

### The idea

*Sorting rearranges the whole list just to find one value — can the counts be collected without
moving anything?* Yes: walk the list once, keeping a dictionary from value to how many times it has
been seen, then return whichever key has the biggest tally. This fixes the sorting rung's
log-linear cost — one pass instead of a sort — and fixes the brute force's rescanning at the same
time, because every value's tally is built during the same single sweep.

### How to think about it

A tally sheet with a row per distinct value. Each element you read adds one tick to its own row, and
no row is ever re-read while you are ticking another. That is the single-pass win over brute force:
counting `2`s no longer throws away what you learned about `1`s. At the end you scan the rows and
pick the tallest.

This is the instinctive answer, and for most purposes it is a fine one. Its weakness is not speed
but *scope*: the sheet holds a tally for every distinct value in the input, and the question only
ever asked about one of them. On a list of 50,000 mostly-distinct values you will build 25,000 rows
to report a single number. Hold on to that mismatch — it is the crack the last approach goes
through.

### Worked example

Input: `nums = [2, 2, 1, 1, 1, 2, 2]`.

| Step | value read | tally sheet after the tick |
|---|---|---|
| 1 | 2 | `{2: 1}` |
| 2 | 2 | `{2: 2}` |
| 3 | 1 | `{2: 2, 1: 1}` |
| 4 | 1 | `{2: 2, 1: 2}` |
| 5 | 1 | `{2: 2, 1: 3}` |
| 6 | 2 | `{2: 3, 1: 3}` |
| 7 | 2 | `{2: 4, 1: 3}` |

Then the second scan over the sheet: start with `best = nums[0] = 2` (tally 4); the row for `2`
does not beat itself; the row for `1` has 3, which is not more than 4. Answer: `2`.

Seven ticks plus two row comparisons, against the brute force's seven comparisons *per candidate*.
Note step 6, where `1` and `2` are briefly tied at 3 — the sheet is happy to hold that ambiguity,
and the majority only pulls ahead at the last element.

### Code

```python
def majority_element_count_map(nums: list[int]) -> int:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    best = nums[0]
    for value, seen in counts.items():
        if seen > counts[best]:
            best = value
    return best
```

### Common mistake

Confusing the tally with the value. The natural way to write "find the biggest" is
`best = 0; for value, seen in counts.items(): if seen > best: best = seen` — and now `best` holds a
*count*, so the function returns `4` on this example instead of `2`. The bug survives casual testing
because 4 is a perfectly plausible-looking integer and, on small inputs where the majority value and
its count happen to coincide, it even returns the right answer. Track the winning **key** and compare
through the map (`counts[best]`), or use `max(counts, key=counts.get)`, which makes the distinction
impossible to get wrong.

### Complexity and when to use this

**Time O(n), space O(n).** The time is one pass to build the sheet plus one pass over its rows, each
with constant expected cost per step; the space is one entry per *distinct* value, which in the worst
case — before you knew a majority existed — is the whole input.

This is the right choice whenever you need more than the single winner: the full frequency
distribution, the runner-up, the top k, or the answer to "and how many times did it appear?". It is
also what you write when the promise of a majority is absent and you want the most frequent element
regardless. Here it is one rung short only because the problem asks for so much less than it
delivers.

---

## Approach 4 — Boyer–Moore voting (optimal)

### The idea

*The tally sheet spends memory proportional to the number of distinct values, but the question is
about one value — can the list be reduced without remembering any of them?* Yes, by cancellation.
Pair off each occurrence of a candidate against one occurrence of anything else; both are struck
out. A value holding strictly more than half the list cannot be fully struck out, so whatever is
left standing is the answer — and tracking it takes one candidate and one counter.

### How to think about it

Think of it as an election where every vote for someone else destroys one vote for the current
leader. You hold two things: who is currently leading, and by how much. A matching value pushes the
lead up by one; a differing value pulls it down by one. When the lead hits zero, the current leader
has been completely cancelled out and you hand the lead to the very next element you see — you have
no idea whether it is the true majority, and it does not matter.

Why the survivor is correct: every decrement destroys one majority vote **and** one non-majority
vote together, so it consumes them in pairs. There are fewer than half the elements that are *not*
the majority, so the pairing runs out of non-majority votes before it runs out of majority ones. At
least one majority vote is left uncancelled, and no other value can be holding the lead at the end,
because holding the lead requires having survived every pairing. The counter is not a count of
anything real — it is a *margin*, and it can be zero in the middle of an array whose majority is
overwhelming.

The one thing this argument never establishes is that the survivor is a majority. It establishes
only that *if* a majority exists, the survivor is it. That is why the guarantee in the statement is
not decoration.

### Worked example

Input: `nums = [2, 2, 1, 1, 1, 2, 2]`. Start with `candidate = nums[0] = 2` and `count = 0`.

| Step | value | count was 0? | candidate after | matches? | count after |
|---|---|---|---|---|---|
| 1 | 2 | yes → adopt `2` | 2 | yes | 1 |
| 2 | 2 | no | 2 | yes | 2 |
| 3 | 1 | no | 2 | no | 1 |
| 4 | 1 | no | 2 | no | **0** |
| 5 | 1 | yes → adopt `1` | **1** | yes | 1 |
| 6 | 2 | no | 1 | no | **0** |
| 7 | 2 | yes → adopt `2` | **2** | yes | 1 |

Answer: `2`.

Trace what actually happened. Steps 3 and 4 cancelled two `2`s against two `1`s — four elements
struck out, margin back to zero. Step 5 handed the lead to `1`, a value that is *not* the majority,
and the algorithm was perfectly happy about that. Step 6 cancelled that lone `1` against a `2`. By
step 7 the only elements left uncancelled are `2`s, and the last one takes the lead and keeps it.
Two `1`s and two `2`s annihilated in the middle; the surplus of `2`s is what survives. And notice
that the final `count` is 1, which tells you nothing about how many `2`s there were — the counter is
a margin, not a tally.

### Code

```python
def majority_element_boyer_moore(nums: list[int]) -> int:
    candidate = nums[0]
    count = 0
    for x in nums:
        if count == 0:
            candidate = x  # nothing survives; the newcomer leads the next round
        count += 1 if x == candidate else -1
    return candidate
```

### Common mistake

Swapping the two statements in the loop — adjusting the count first and adopting the new candidate
afterwards:

```python
count += 1 if x == candidate else -1
if count == 0:
    candidate = x        # WRONG: adopted but never counted
```

Now when the margin collapses you install a new leader **without giving it its own vote**, so it
starts the next round at zero instead of one, and the very next differing element drives the count
negative. On `nums = [2, 1, 2]` — where `2` is a genuine majority, two out of three — this version
returns `1`. The bug is nasty because it is invisible most of the time: on the seven-element example
above it still returns `2`, by luck. A negative `count` is the tell; if you ever see one while
debugging, this is the reason.

### Complexity and when to use this

**Time O(n), space O(1).** The time is one pass with two comparisons and one addition per element —
no hashing, no allocation, nothing that can degrade. The space is two variables, and that is true
whether the array holds ten elements or fifty thousand.

This is the answer to ship, and the reason to ship it is the space, not the speed — the hash map is
already linear in time. Reach for it when memory is the binding constraint: streaming data you
cannot store, an embedded target, or a interviewer who has just said "now do it in constant space".
Its precondition is the whole game, so say the precondition out loud when you write it.

### Without the promise

Remove "a majority is guaranteed to exist" and this code does not slow down, it *lies*. Run it on
`[1, 2, 3]` and it returns `3`; run it on `[1, 1, 2, 2]` and it returns `1`. Both are simply the last
value to pick up the lead, and neither is a majority of anything. Nothing in the loop can detect
this, because the counter tracks a margin and a margin of 1 at the end is equally consistent with
"an overwhelming winner" and "no winner at all".

The repair is one extra pass: count how many times the survivor actually appears and check it
clears half.

```python
def majority_element_boyer_moore_verified(nums: list[int]) -> int | None:
    """Same walk, plus the pass that the 'a majority exists' promise pays for."""
    candidate = majority_element_boyer_moore(nums)
    if sum(1 for x in nums if x == candidate) > len(nums) // 2:
        return candidate
    return None
```

**What the verification costs:** one more linear scan — 2n comparisons instead of n, still O(n) time
and still O(1) space. That is the entire price of dropping the guarantee, which is worth knowing
precisely, because it means the guarantee buys you a constant factor and nothing more. The reason to
care is that the promise is the most commonly removed constraint in the follow-up, and answering
"then I add a verification pass, still linear, still constant space" immediately is much better than
discovering the problem when the interviewer feeds you `[1, 2, 3]`.

The same cancellation argument generalises: to find every value appearing more than n/3 times, keep
**two** candidates and two counters — at most two such values can exist, and pairing three distinct
values off against each other cancels them three at a time. That variant *always* needs the
verification pass, because "more than n/3" carries no guarantee that any such value exists.

---

## The Overall Arc

The thread running through every rung is *collect only what the question asks about*. The brute
force collects nothing at all and pays for it by rebuilding the same knowledge n times over: each
sweep counts every value in the list and reports one number about one of them, then discards the
rest and starts again. Sorting is the first real idea — restructure the input so that equality
becomes adjacency, and the answer stops needing to be counted at all, because a block longer than
half the row cannot miss the centre seat; but it moves all n elements to learn about one, and pays
n log n for the privilege. The hash map is the instinct most people land on and the first genuinely
linear answer: one pass, one tally per distinct value, nothing recomputed — and yet look at what is
on the sheet when it finishes. Tens of thousands of rows, one of which is the answer and the rest of
which were never asked for. That surplus is the signal. Boyer–Moore takes the question at its word:
you were asked for a single value, so carry a single value, plus the one extra number needed to know
whether it is still winning. The pairing argument is what makes that safe — every disagreeing element
cancels one agreeing element, the minority runs out of ammunition before the majority does, and so
the last value standing must be the one that had more than half. What makes the whole thing possible
is a sentence in the problem statement rather than anything in the data: *a majority is guaranteed to
exist*. That is the deeper lesson here, and it transfers well beyond this problem — a promise in the
statement is a licence to spend less, and the first thing to ask of any suspiciously cheap algorithm
is which promise it is cashing in. Take the promise away and the algorithm does not get slower, it
gets **wrong**, until you spend one more linear pass to check what it handed you.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Count by rescanning | O(n²) | O(1) | Literal, obviously correct, remembers nothing | n is tiny, or you need a trustworthy oracle to cross-check a faster version |
| Sort, take the middle | O(n log n) | O(n) | One restructuring pass buys an O(1) lookup | You also need the median, the top k, or the n/3 variants — or you want three lines you cannot get wrong |
| Count in a hash map | O(n) | O(n) | Linear, but stores a tally for every distinct value | You need the full frequency picture, the runner-up, or the count itself |
| Boyer–Moore voting | O(n) | O(1) | Constant space, but correct **only** because a majority is promised | Memory is the binding constraint — streaming, embedded, or an explicit O(1)-space requirement |

---

## Interview Priority

**Know cold: Boyer–Moore, and the hash map.** The hash map is the answer you should be able to write
in fifteen seconds to get a correct solution on the board; Boyer–Moore is the answer to the follow-up
that always comes — "now in constant space". Being able to state the pairing argument in two
sentences (*every disagreement cancels one agreement; a strict majority cannot be fully cancelled*)
is what separates having memorised the loop from understanding it, and it is what makes the two
follow-ups answerable on the spot: *what if no majority is guaranteed?* (add a verification pass,
still O(n) time and O(1) space) and *what about everything appearing more than n/3 times?* (two
candidates, two counters, and now the verification pass is mandatory). Get the statement order right
inside the loop — adopt on zero, **then** count — because the swapped version passes most small tests
and fails on `[2, 1, 2]`.

**Understand but do not drill: the rescanning brute force and the sort.** Name the brute force in
your first sentence to put the O(n²) baseline on the table, and mention the sort as the easy
n log n improvement — the ribbon-covering-the-centre-seat argument is a nice thing to say and takes
five seconds. Neither is what the question is testing, but skipping straight to the voting algorithm
without them makes it look recalled rather than derived, and the natural next question — "why does
that work?" — is much easier to answer well if you have already talked about what the other
approaches were storing and why it was more than you needed.

---

## Full Runnable Script

Every approach in one file, checked against both statement examples, the smallest legal input, an
array of identical values, a majority that only appears at the tail (the worst case for the brute
force), values at the extremes the constraints allow, and a randomised stress run over arrays
deliberately built to contain a genuine majority. There is also a no-answer section: arrays with no
majority at all, which lie outside the problem's promise, showing what plain Boyer–Moore returns
there and what the verification pass returns instead.

```python
"""The Value That Owns the Majority — every approach in one file, cross-checked.

Run: python majority_element.py
"""

from __future__ import annotations

import random


def majority_element_brute_force(nums: list[int]) -> int:
    need = len(nums) // 2
    for x in nums:
        if sum(1 for y in nums if y == x) > need:  # strictly more than half
            return x
    return nums[0]


def majority_element_sort(nums: list[int]) -> int:
    ordered = sorted(nums)
    return ordered[len(ordered) // 2]  # a majority always covers the middle slot


def majority_element_count_map(nums: list[int]) -> int:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    best = nums[0]
    for value, seen in counts.items():
        if seen > counts[best]:
            best = value
    return best


def majority_element_boyer_moore(nums: list[int]) -> int:
    candidate = nums[0]
    count = 0
    for x in nums:
        if count == 0:
            candidate = x  # nothing survives; the newcomer leads the next round
        count += 1 if x == candidate else -1
    return candidate


def majority_element_boyer_moore_verified(nums: list[int]) -> int | None:
    """Same walk, plus the pass that the 'a majority exists' promise pays for."""
    candidate = majority_element_boyer_moore(nums)
    if sum(1 for x in nums if x == candidate) > len(nums) // 2:
        return candidate
    return None


APPROACHES: list[tuple[str, object]] = [
    ("brute force", majority_element_brute_force),
    ("sort, take middle", majority_element_sort),
    ("count map", majority_element_count_map),
    ("Boyer-Moore", majority_element_boyer_moore),
    ("Boyer-Moore + check", majority_element_boyer_moore_verified),
]


def run_case(label: str, nums: list[int]) -> bool:
    results = [(name, fn(list(nums))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  nums={nums}")
    for name, r in results:
        print(f"    {name:<20} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    # Both examples from the statement.
    ok &= run_case("statement example 1", [3, 2, 3])
    ok &= run_case("statement example 2", [2, 2, 1, 1, 1, 2, 2])

    # Minimal legal input: one element, trivially its own majority.
    ok &= run_case("minimal (n = 1)", [7])

    # Every element identical — the count never drops.
    ok &= run_case("all duplicates", [4, 4, 4, 4])

    # The majority sits entirely at one end, so the candidate flips late.
    ok &= run_case("majority at the tail", [5, 6, 7, 8, 8, 8, 8, 8, 8])

    # Large negative values: the constraint allows -10^9 .. 10^9.
    ok &= run_case("negatives", [-10 ** 9, 1, -10 ** 9, 2, -10 ** 9])

    # No majority exists — outside the promise, so only the verified variant may be trusted.
    print()
    print("no majority (outside the problem's promise)")
    for nums in [[1, 2, 3], [1, 1, 2, 2]]:
        bare = majority_element_boyer_moore(list(nums))
        checked = majority_element_boyer_moore_verified(list(nums))
        true_majority = None
        for x in set(nums):
            if nums.count(x) > len(nums) // 2:
                true_majority = x
        print(f"    nums={nums} -> Boyer-Moore says {bare} (no majority exists), "
              f"verified says {checked}")
        ok &= checked == true_majority  # the check is what makes the answer honest

    # Randomised stress: arrays built to contain a real majority.
    random.seed(11)
    for _ in range(500):
        n = random.randint(1, 25)
        winner = random.randint(-5, 5)
        others = [v for v in range(-5, 6) if v != winner]
        arr = [winner] * (n // 2 + 1)
        arr += [random.choice(others) for _ in range(n - len(arr))]
        random.shuffle(arr)
        results = [fn(list(arr)) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT nums={arr} -> {results}")
    print()
    print("stress: 500 random arrays each built with a genuine majority, "
          "all five approaches cross-checked")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()
```

### Output when run

```
statement example 1
  nums=[3, 2, 3]
    brute force          -> 3
    sort, take middle    -> 3
    count map            -> 3
    Boyer-Moore          -> 3
    Boyer-Moore + check  -> 3
    all agree: True
statement example 2
  nums=[2, 2, 1, 1, 1, 2, 2]
    brute force          -> 2
    sort, take middle    -> 2
    count map            -> 2
    Boyer-Moore          -> 2
    Boyer-Moore + check  -> 2
    all agree: True
minimal (n = 1)
  nums=[7]
    brute force          -> 7
    sort, take middle    -> 7
    count map            -> 7
    Boyer-Moore          -> 7
    Boyer-Moore + check  -> 7
    all agree: True
all duplicates
  nums=[4, 4, 4, 4]
    brute force          -> 4
    sort, take middle    -> 4
    count map            -> 4
    Boyer-Moore          -> 4
    Boyer-Moore + check  -> 4
    all agree: True
majority at the tail
  nums=[5, 6, 7, 8, 8, 8, 8, 8, 8]
    brute force          -> 8
    sort, take middle    -> 8
    count map            -> 8
    Boyer-Moore          -> 8
    Boyer-Moore + check  -> 8
    all agree: True
negatives
  nums=[-1000000000, 1, -1000000000, 2, -1000000000]
    brute force          -> -1000000000
    sort, take middle    -> -1000000000
    count map            -> -1000000000
    Boyer-Moore          -> -1000000000
    Boyer-Moore + check  -> -1000000000
    all agree: True

no majority (outside the problem's promise)
    nums=[1, 2, 3] -> Boyer-Moore says 3 (no majority exists), verified says None
    nums=[1, 1, 2, 2] -> Boyer-Moore says 1 (no majority exists), verified says None

stress: 500 random arrays each built with a genuine majority, all five approaches cross-checked

ALL APPROACHES AGREED ON EVERY CASE.
```
