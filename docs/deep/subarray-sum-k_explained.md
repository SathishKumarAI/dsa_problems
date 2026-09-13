# How Many Subarrays Sum to k? — explained

## Understanding the Problem

You are given a list of whole numbers and a target value `k`. A *subarray* is a run of neighbours
taken without skipping — `[1, -1]` is a subarray of `[1, -1, 0]`, but `[1, 0]` is not, because you
would have to jump over the `-1`. Count how many such runs add up to exactly `k`. Runs that
overlap are counted separately, and a run must contain at least one element.

**The core question is: for each place you could stop, how many places could you have started so
that the stretch between them adds up to `k`?** The naive approach is slow because it answers that
by physically re-adding every stretch: it starts at position 0 and walks to the end, then starts at
position 1 and walks to the end, and so on — about n²/2 additions, which for the largest allowed
input is roughly 200 million.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| `1 <= nums.length <= 2 * 10^4` | Quadratic work is ~2 × 10⁸ additions — over the line for a one-second budget, so an O(n²) answer will not survive. The lower bound of 1 also means the array is never empty, so "a non-empty subarray" is always askable. |
| `-1000 <= nums[i] <= 1000` and `-10^7 <= k <= 10^7` | Every running total lies between −2 × 10⁷ and 2 × 10⁷, so sums fit in a 32-bit integer with room to spare. Nothing here needs big integers or overflow care — in Java or C++ an `int` is safe. |
| **values may be NEGATIVE** | This one *forbids* rather than unlocks. A window that grows on the right and shrinks on the left only works when growing raises the sum and shrinking lowers it. A negative value breaks that, so the sliding-window reflex — the first thing most people reach for on a "contiguous stretch" question — is unavailable. Delete this constraint and the window becomes the best answer in the file, at constant space. |
| the count includes overlapping subarrays, and a subarray must be non-empty | You are asked *how many*, not *which ones* — so the answer is a number, and an approach may store **counts** rather than positions. That is what lets the final version stay O(n): listing every qualifying subarray could itself take O(n²) output. "Non-empty" is why the lookup must happen before the current prefix is recorded; otherwise a stretch of length zero would count. |

The thing to hold on to before reading further: this problem looks like a window problem and is not
one. It is a *prefix* problem, and the difference is the minus sign in the input.

---

## Approach 1 — Sum every subarray

### The idea

*How do I know whether the stretch from `i` to `j` adds up to `k`?* Add it up and look. *And how do
I count them all?* Fix a start, walk right to the end keeping a running total, and tick a counter
every time that total lands on `k` — then do it again for the next start. This is the baseline: it
uses nothing about the input except that the values can be added.

### How to think about it

Picture a ruler you keep sliding along the array. You plant its left end at position 0 and stretch
the right end one element at a time, calling out the total after each stretch. Every time you call
out `k`, that is one answer. When the right end runs off the array, you move the left end one step
right and start stretching again from there. The important detail is that the running total is
*reused* inside one start — you never re-add the whole stretch from scratch — but it is thrown away
entirely when the start moves. That discarded work is the whole story of the rest of this file.

### Worked example

Input: `nums = [1, -1, 0]`, `k = 0`. The answer is 3.

| Step | start `i` | end `j` | running total | Verdict |
|---|---|---|---|---|
| 1 | 0 | 0 | 0 + 1 = **1** | not 0 |
| 2 | 0 | 1 | 1 + (−1) = **0** | hit — `[1, -1]`, count = 1 |
| 3 | 0 | 2 | 0 + 0 = **0** | hit — `[1, -1, 0]`, count = 2 |
| 4 | 1 | 1 | 0 + (−1) = **−1** | not 0 |
| 5 | 1 | 2 | −1 + 0 = **−1** | not 0 |
| 6 | 2 | 2 | 0 + 0 = **0** | hit — `[0]`, count = 3 |

Six additions for a three-element array. Notice step 3: the total was *already* 0 at step 2 and the
stretch kept qualifying after adding a zero. That is a negative-and-zero array doing something a
strictly positive array never does, and it is the reason the window approach later fails.

### Code

```python
def subarray_sum_k_brute_force(nums: list[int], k: int) -> int:
    total = 0
    for i in range(len(nums)):
        running = 0
        for j in range(i, len(nums)):
            running += nums[j]
            if running == k:
                total += 1
    return total
```

### Common mistake

Writing `break` after `total += 1`, as if each start could contribute at most one answer. That is
the right instinct for "does a subarray summing to `k` exist?" and the wrong one for "how many?".
On this very example it costs you step 3: the start at index 0 reaches `k` at `[1, -1]` **and again**
at `[1, -1, 0]`, so breaking returns 2 instead of 3. The reason it is not obvious is that on an
array of positive numbers the break is harmless — once the total passes `k` it never returns — so
the bug hides until a zero or a negative shows up.

### Complexity and when to use this

**Time O(n²), space O(1).** The cost is the pair of nested walks: n starts, each extending up to n
elements, with one addition and one comparison per step. Space is three integers, no matter how big
the array is.

Use it when n is genuinely small, and — more usefully — as the oracle you check a clever solution
against. That is exactly its job at the bottom of this file: it is slow, but it is so plainly a
direct transcription of the question that if it disagrees with your fast version, the fast version
is wrong.

---

## Approach 2 — Prefix sums, compared pairwise

### The idea

*The brute force re-adds the same leading elements over and over — can the sum of any stretch be
had without adding it up?* Yes, by arithmetic: if `P[j]` is the total of everything before position
`j`, then the stretch from `i` up to `j` sums to `P[j] − P[i]`. Build that table of running totals
once, and every stretch becomes a single subtraction — which fixes the brute force's repeated
arithmetic, though not yet its repeated *looking*.

### How to think about it

Think of milestone markers on a road. `P[j]` is the distance from the start to marker `j`, so the
distance between any two markers is the difference of their readings — you never re-walk the road,
you just subtract. Building the markers is one pass. The catch is that you still have to consider
every *pair* of markers, and there are about n²/2 of them, so the total work is the same order as
before. What has changed is the cost *per pair*: one subtraction instead of one addition and one
step of a walk. This rung separates two costs that the brute force had welded together — computing
sums, and searching over pairs — and it only pays off the first.

One indexing detail that repays care: the table has **n + 1** entries, not n. `P[0] = 0` stands for
"the empty stretch before the array begins". That phantom zero is not a formality; it is the same
zero that the final approach has to seed its map with, and for the same reason.

### Worked example

Input: `nums = [1, -1, 0]`, `k = 0`.

First the table of running totals, one boundary at a time:

| boundary | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| `P` | 0 | 1 | 0 | 0 |
| meaning | before the array | after `1` | after `1, -1` | after `1, -1, 0` |

Then every pair of boundaries `i < j`, where the pair names the stretch between them:

| Step | `i` | `j` | `P[j] − P[i]` | Stretch | Verdict |
|---|---|---|---|---|---|
| 1 | 0 | 1 | 1 − 0 = 1 | `[1]` | no |
| 2 | 0 | 2 | 0 − 0 = **0** | `[1, -1]` | hit, count = 1 |
| 3 | 0 | 3 | 0 − 0 = **0** | `[1, -1, 0]` | hit, count = 2 |
| 4 | 1 | 2 | 0 − 1 = −1 | `[-1]` | no |
| 5 | 1 | 3 | 0 − 1 = −1 | `[-1, 0]` | no |
| 6 | 2 | 3 | 0 − 0 = **0** | `[0]` | hit, count = 3 |

Six subtractions and one three-step build, against the brute force's six additions. Look at the `P`
row, though: the value **0 appears three times** (at boundaries 0, 2 and 3). Every hit in the table
above is a pair of boundaries with the *same* reading. That observation is the entire next idea.

### Code

```python
def subarray_sum_k_prefix_pairwise(nums: list[int], k: int) -> int:
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    total = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums) + 1):  # j is an END boundary, so it reaches n
            if prefix[j] - prefix[i] == k:
                total += 1
    return total
```

### Common mistake

Writing the inner loop as `range(i + 1, len(nums))` — the range you would use if `j` were an
*index* rather than a *boundary*. There are n + 1 boundaries and the last one, `n`, names "the end
of the array", so stopping at `n − 1` silently drops every subarray that ends on the final element.
On this example that loses both `[1, -1, 0]` and `[0]`, returning 1 instead of 3. It is a
particularly nasty bug because it is invisible on inputs whose answers all sit in the middle, and
because the code still runs, still looks symmetric, and still returns a plausible number.

### Complexity and when to use this

**Time O(n²), space O(n).** The time is dominated by the double loop over boundary pairs — the
table itself is one linear pass; the space is the table, one integer per boundary. So this rung
trades memory for a smaller constant factor and buys no better asymptotic behaviour at all.

On its own it is rarely the answer you ship. It earns its place for two reasons: it is the step at
which the problem stops being about addition and starts being about *differences*, which is the
conceptual jump the optimal solution needs; and the prefix table itself is genuinely the right tool
when you must answer many arbitrary range-sum queries on a fixed array — build once in O(n), answer
each query in O(1).

---

## Approach 3 — The sliding window (the instinct that fails here)

### The idea

*Both approaches so far are quadratic because they consider every pair of endpoints — can the two
endpoints move in one coordinated sweep instead?* That is the sliding window: extend the right edge
to take in more, pull the left edge in when the total gets too big, and never move either edge
backwards. It fixes the pairwise rung's n² search in one pass and constant space. It is also
**wrong on this problem**, and understanding exactly why is worth more than the approach itself.

### How to think about it

A window works when the running total behaves like a dial with a direction: pushing the right edge
out can only turn it up, pulling the left edge in can only turn it down. Under that guarantee, if
the total is too big you know which edge to move, and each edge only ever moves forward, so the
whole sweep costs O(n). Now put a negative number in the array. Pulling the left edge past a `−1`
*raises* the total instead of lowering it. The dial no longer has a direction, "too big, so shrink"
is no longer a valid deduction, and an edge you moved forward may have been hiding an answer you
can never get back to. The technique has not become slower — it has stopped being correct.

The version written below is the careful form of the window, which handles zeros properly by
counting subarrays with sum **at most** `k`, then subtracting those with sum at most `k − 1`. Even
in this careful form, the non-negativity assumption is load-bearing.

### Worked example

Input: `nums = [1, -1, 0]`, `k = 0`. The true answer is 3; the window returns **0**.

`at_most(0)` — subarrays whose sum is 0 or less:

| Step | right (value) | window sum after adding | Shrink? | left after | windows counted (`right − left + 1`) | total |
|---|---|---|---|---|---|---|
| 1 | 0 (1) | 1 | 1 > 0 → drop `nums[0]`, sum → 0, left → 1 | 1 | 0 − 1 + 1 = **0** | 0 |
| 2 | 1 (−1) | −1 | no | 1 | 1 − 1 + 1 = 1 | 1 |
| 3 | 2 (0) | −1 | no | 1 | 2 − 1 + 1 = 2 | 3 |

`at_most(0) = 3`. Running the same walk for `at_most(-1)` gives 3 as well, so the window's answer is
3 − 3 = **0**.

The damage is visible at step 1. The window saw a total of 1, concluded "too big, shrink", and
retired index 0 — permanently. But index 0 is the start of *two* of the three real answers, and it
was only "too big" because the `−1` that would have fixed it had not been read yet. A positive
array cannot do that to you; this one can.

### Code

```python
def _at_most(nums: list[int], limit: int) -> int:
    """Subarrays with sum <= limit. Only valid when every value is non-negative."""
    left = 0
    running = 0
    total = 0
    for right, x in enumerate(nums):
        running += x
        while running > limit and left <= right:
            running -= nums[left]
            left += 1
        total += right - left + 1  # every window ending at right and starting >= left
    return total


def subarray_sum_k_sliding_window(nums: list[int], k: int) -> int:
    """WRONG on inputs containing negatives — see the section on this approach."""
    return _at_most(nums, k) - _at_most(nums, k - 1)
```

### Common mistake

Aside from reaching for it at all, the specific bug people write here is the simpler window:
*shrink while the sum exceeds `k`, and add one to the count whenever the sum equals `k`.* That
version counts at most one subarray per right endpoint, which is wrong as soon as **zeros** appear
— even with no negatives anywhere. On `nums = [0, 0, 0]`, `k = 0` it reports 3 when the answer is 6,
because three different windows end at the last position and all of them sum to zero. The
`at_most(k) − at_most(k−1)` formulation above is what fixes that: `right − left + 1` counts *every*
valid window ending at `right`, not just one. Two separate assumptions are hiding in the naive
version — "no negatives" and "no zeros" — and only the first survives the fix.

### Complexity and when to use this

**Time O(n), space O(1).** Each edge crosses the array once and never goes back, so the two calls
to `_at_most` are two linear sweeps; the state is three integers. On paper that beats the optimal
answer below, which spends O(n) memory.

Use it when — and only when — **every value is non-negative**. That assumption is what makes the
total monotone in each edge, which is what makes "too big, so shrink" a sound deduction. Remove it
and the approach does not degrade, it breaks, as the trace above shows. When it does apply it is
excellent and it generalises far beyond this question: longest window with a bounded sum, count of
windows under a threshold, at-most-k-distinct-characters, and the whole family of "shrink to restore
the invariant" problems. Recognising which world you are in is the actual skill; the code is the
easy part.

---

## Approach 4 — Prefix sums in a counting map (optimal)

### The idea

*The pairwise rung found every answer by looking for two boundaries with the same reading — can
that search be replaced by a lookup?* Yes. Walk the array once carrying the running total; at each
boundary the question "how many earlier boundaries had reading `running − k`?" is answered instantly
by a map from reading to *how many times it has occurred*. This fixes the pairwise rung's remaining
n²: the inner scan over earlier boundaries becomes one dictionary lookup, and it works with
negatives because nothing here assumes any direction of movement.

### How to think about it

Rearrange the arithmetic of the previous rung. A stretch ending at the current boundary sums to `k`
exactly when `running − P[i] = k`, that is when `P[i] = running − k`. So you are not hunting for
subarrays at all — you are asking a membership question about numbers you have already written
down. Keep a tally book of every running total you have passed, with a count beside each, because
several earlier boundaries can carry the same reading and each of them starts a different valid
subarray. Two details make it correct. The book starts with **`{0: 1}`** — the empty prefix, before
any element, has total zero and has occurred once. And you look up *before* you record the current
total, so the subarray you count always has at least one element in it.

### Worked example

Input: `nums = [1, -1, 0]`, `k = 0`.

| Step | value | running total | looking for `running − k` | map *before* the lookup | found | count | map *after* recording |
|---|---|---|---|---|---|---|---|
| 0 | — | 0 | — | `{0: 1}` | — | 0 | `{0: 1}` (the seed) |
| 1 | 1 | 1 | 1 − 0 = 1 | `{0: 1}` | 0 times | 0 | `{0: 1, 1: 1}` |
| 2 | −1 | 0 | 0 | `{0: 1, 1: 1}` | **1 time** | 1 | `{0: 2, 1: 1}` |
| 3 | 0 | 0 | 0 | `{0: 2, 1: 1}` | **2 times** | **3** | `{0: 3, 1: 1}` |

Three steps, three lookups, answer 3. Step 3 is the one to stare at: a single lookup contributed
**two** answers at once, because two earlier boundaries (the phantom one before the array, and the
one after `[1, -1]`) both carried a reading of 0. The brute force needed two separate walks to find
those same two subarrays. That is where the quadratic went.

### Code

```python
def subarray_sum_k_prefix_count_map(nums: list[int], k: int) -> int:
    seen: dict[int, int] = {0: 1}  # the empty prefix has sum 0 and has occurred once
    running = 0
    total = 0
    for x in nums:
        running += x
        total += seen.get(running - k, 0)  # look up BEFORE recording, so length >= 1
        seen[running] = seen.get(running, 0) + 1
    return total
```

### Common mistake

**Starting the map empty — `seen = {}` instead of `seen = {0: 1}`.** Without the seed, every
subarray that begins at index 0 goes missing, because the boundary *before* the first element was
never written down and so can never be found. On this example the count drops from 3 to 1: the two
answers starting at index 0 (`[1, -1]` and `[1, -1, 0]`) both vanish, and only `[0]` survives. On
`nums = [2, 3, -3, 4]`, `k = 5` it is even starker — the only answer is `[2, 3]`, it starts at index
0, and the unseeded version returns 0 for an array that plainly has one.

The seed is easy to remember once you stop treating it as a special case: the map is a tally of
*prefix sums that have occurred*, the empty prefix is a prefix, and its sum is zero. It has occurred,
exactly once, before the loop begins. A close cousin of this bug is recording the current total
*before* the lookup, which lets a boundary match itself and counts a zero-length subarray whenever
`k = 0` — on `[0, 0, 0]`, `k = 0` that inflates 6 to 9.

### Complexity and when to use this

**Time O(n), space O(n).** One pass, with a constant-expected-time dictionary lookup and insert per
element, so the time is linear; the space is the map, which in the worst case holds a distinct
reading for every boundary — an array of all-distinct running totals, such as any array of positive
numbers, is exactly that worst case.

This is the answer to ship. It is the only rung here that is both linear and correct in the presence
of negatives, and the problem's constraints — twenty thousand elements, values that may be negative,
a count rather than a list as the output — point at it from three directions at once. The pattern
generalises widely: swap the counting map for a map of *first index* and you get "longest subarray
summing to k"; take the running total modulo m and you count subarrays divisible by m; replace the
sum with a running XOR and you count subarrays with a given XOR. The shape is always the same —
turn a question about ranges into a question about how often a running value has been seen.

---

## The Overall Arc

The principle every rung chases is *stop asking about ranges and start asking about points*. The
brute force treats the question literally: a subarray is a stretch, so it walks each stretch and
adds it up, and the cost of that literalism is n²/2 additions with everything learned on one start
thrown away before the next. The prefix table is the arithmetic that dissolves the range — the sum
from `i` to `j` is `P[j] − P[i]`, so a stretch is no longer a thing you traverse but a *difference
between two readings* — yet on its own it only makes each of the n² pairs cheaper, and the pairs are
still all there. The sliding window is the reflex that this shape of question triggers, and it is a
genuinely good technique that this particular problem disqualifies, because a window is an argument
about monotonicity ("too big, therefore shrink") and a negative number destroys the monotonicity;
that failure is worth as much as a success, because it teaches you to check the sign of the inputs
before reaching for two pointers, and it is also the trapdoor back to O(1) space the moment a
problem promises non-negative values. The breakthrough is to take the prefix identity seriously one
step further: rearranged, `P[j] − P[i] = k` says `P[i] = P[j] − k`, which is not a statement about a
stretch at all but a *membership question about a number you have already computed* — and membership
questions are what hash maps answer in one step. Counting occurrences rather than storing positions
is the last piece, because several earlier boundaries can carry the same reading and each one is a
separate answer; that is why a single lookup in the worked example contributed two subarrays at
once. What you are left with is one pass, one running integer, and a tally book — and a template
that reappears every time a problem asks about contiguous stretches with a fixed sum, a fixed
remainder, or a fixed XOR: derive the running quantity, rearrange the condition into "has this value
been seen", and remember to write down the empty prefix before you begin.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Sum every subarray | O(n²) | O(1) | Literal, obviously correct, no memory, no reuse | n is tiny, or you need a trustworthy oracle to cross-check a fast version against |
| Prefix sums, pairwise | O(n²) | O(n) | Makes each pair cheap but still visits every pair | You need arbitrary range sums answered repeatedly on a fixed array |
| Sliding window | O(n) | O(1) | Constant space, but only sound when the sum is monotone in each edge | **Every value is non-negative** — otherwise it is not slow, it is wrong |
| Prefix sums + counting map | O(n) | O(n) | Buys the pair search with memory; indifferent to sign | The general case, and the intended answer here |

---

## Interview Priority

**Know cold: the prefix-sum counting map, and the sliding window.** They are a matched pair, and the
interview is usually about proving you know which one the input calls for. Write the map version
without hesitating, seed it `{0: 1}` the first time rather than after a failed test, and be able to
say in one sentence why it does not care about negatives — nothing in it assumes a direction of
movement. Then be ready for the follow-up that is almost always asked: *"what if I told you all the
numbers were positive?"* The correct answer is the window, at O(1) space, and being able to switch
approaches on that one word is the whole point of the question. Expect the second follow-up too —
*"now return the longest such subarray instead of the count"* — which is the same walk with the map
storing the **first index** at which each reading occurred rather than a tally.

**Understand but do not drill: the two quadratic rungs.** State the brute force out loud in the
first thirty seconds so the baseline and its 2 × 10⁸ operations are on the table, then use the prefix
identity as the bridge to the real answer — deriving `P[i] = P[j] − k` in front of the interviewer is
much stronger than producing the finished map from memory, because it shows where the idea comes
from. Neither quadratic version is something anyone is hiring for, but skipping them entirely makes
the optimal solution look memorised rather than reasoned.

---

## Full Runnable Script

Every approach in one file, checked against both statement examples, the smallest legal input in
both its hit and miss forms, an all-zeros array where overlapping answers multiply, an answer that
starts at index 0 (the case the `{0: 1}` seed exists for), an input with no answer at all, and two
randomised stress runs — one with negatives cross-checking the three correct approaches, one
non-negative where the sliding window is allowed to join in. The window is also run on a negative
input where it is *expected* to disagree, and the script fails loudly if it ever agrees there,
because that disagreement is the lesson.

```python
"""How Many Subarrays Sum to k? — every approach in one file, cross-checked.

Run: python subarray_sum_k.py
"""

from __future__ import annotations

import random


def subarray_sum_k_brute_force(nums: list[int], k: int) -> int:
    total = 0
    for i in range(len(nums)):
        running = 0
        for j in range(i, len(nums)):
            running += nums[j]
            if running == k:
                total += 1
    return total


def subarray_sum_k_prefix_pairwise(nums: list[int], k: int) -> int:
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    total = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums) + 1):  # j is an END boundary, so it reaches n
            if prefix[j] - prefix[i] == k:
                total += 1
    return total


def _at_most(nums: list[int], limit: int) -> int:
    """Subarrays with sum <= limit. Only valid when every value is non-negative."""
    left = 0
    running = 0
    total = 0
    for right, x in enumerate(nums):
        running += x
        while running > limit and left <= right:
            running -= nums[left]
            left += 1
        total += right - left + 1  # every window ending at right and starting >= left
    return total


def subarray_sum_k_sliding_window(nums: list[int], k: int) -> int:
    """WRONG on inputs containing negatives — see the section on this approach."""
    return _at_most(nums, k) - _at_most(nums, k - 1)


def subarray_sum_k_prefix_count_map(nums: list[int], k: int) -> int:
    seen: dict[int, int] = {0: 1}  # the empty prefix has sum 0 and has occurred once
    running = 0
    total = 0
    for x in nums:
        running += x
        total += seen.get(running - k, 0)  # look up BEFORE recording, so length >= 1
        seen[running] = seen.get(running, 0) + 1
    return total


APPROACHES: list[tuple[str, object]] = [
    ("brute force", subarray_sum_k_brute_force),
    ("prefix pairwise", subarray_sum_k_prefix_pairwise),
    ("prefix + count map", subarray_sum_k_prefix_count_map),
]


def run_case(label: str, nums: list[int], k: int) -> bool:
    results = [(name, fn(list(nums), k)) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  nums={nums} k={k}")
    for name, r in results:
        print(f"    {name:<19} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    # Both examples from the statement.
    ok &= run_case("statement example 1 (overlapping)", [1, 1, 1], 2)
    ok &= run_case("statement example 2 (negatives)", [1, -1, 0], 0)

    # Minimal case: one element that is the answer, and one that is not.
    ok &= run_case("minimal (n = 1, hit)", [3], 3)
    ok &= run_case("minimal (n = 1, miss)", [3], 5)

    # Duplicates and zeros: every one of the six non-empty stretches sums to 0.
    ok &= run_case("duplicates / zeros", [0, 0, 0], 0)

    # A stretch that starts at index 0 — this is the one {0: 1} exists for.
    ok &= run_case("answer starts at index 0", [2, 3, -3, 4], 5)

    # No subarray reaches k at all.
    ok &= run_case("no answer", [1, 2, 3], 100)

    # The sliding window: right on non-negative input, wrong the moment a negative appears.
    print()
    print("sliding window (needs all values non-negative)")
    for nums, k in [([1, 1, 1], 2), ([0, 0, 0], 0), ([1, 2, 3], 3)]:
        got = subarray_sum_k_sliding_window(list(nums), k)
        want = subarray_sum_k_brute_force(list(nums), k)
        print(f"    nums={nums} k={k} -> window {got}, truth {want}, "
              f"{'agrees' if got == want else 'DISAGREES'}")
        ok &= got == want
    broken_nums, broken_k = [1, -1, 0], 0
    got = subarray_sum_k_sliding_window(list(broken_nums), broken_k)
    want = subarray_sum_k_brute_force(list(broken_nums), broken_k)
    print(f"    nums={broken_nums} k={broken_k} -> window {got}, truth {want}, "
          f"{'wrong as predicted' if got != want else 'UNEXPECTEDLY AGREED'}")
    ok &= got != want  # the failure is the point; if it ever agreed, the lesson is wrong

    # Randomised stress, with negatives, against brute force.
    random.seed(7)
    for _ in range(500):
        nums = [random.randint(-6, 6) for _ in range(random.randint(1, 14))]
        k = random.randint(-8, 8)
        results = [fn(list(nums), k) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT nums={nums} k={k} -> {results}")
    print()
    print("stress: 500 random arrays with negatives, all three correct approaches cross-checked")

    # Randomised stress on non-negative input, where the window is allowed to join in.
    for _ in range(500):
        nums = [random.randint(0, 6) for _ in range(random.randint(1, 14))]
        k = random.randint(0, 10)
        truth = subarray_sum_k_brute_force(list(nums), k)
        got = subarray_sum_k_sliding_window(list(nums), k)
        if got != truth:
            ok = False
            print(f"  WINDOW DISAGREEMENT nums={nums} k={k} -> {got} vs {truth}")
    print("stress: 500 random non-negative arrays, sliding window cross-checked too")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE (and the sliding window failed exactly "
          "where predicted)." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()
```

### Output when run

```
statement example 1 (overlapping)
  nums=[1, 1, 1] k=2
    brute force         -> 2
    prefix pairwise     -> 2
    prefix + count map  -> 2
    all agree: True
statement example 2 (negatives)
  nums=[1, -1, 0] k=0
    brute force         -> 3
    prefix pairwise     -> 3
    prefix + count map  -> 3
    all agree: True
minimal (n = 1, hit)
  nums=[3] k=3
    brute force         -> 1
    prefix pairwise     -> 1
    prefix + count map  -> 1
    all agree: True
minimal (n = 1, miss)
  nums=[3] k=5
    brute force         -> 0
    prefix pairwise     -> 0
    prefix + count map  -> 0
    all agree: True
duplicates / zeros
  nums=[0, 0, 0] k=0
    brute force         -> 6
    prefix pairwise     -> 6
    prefix + count map  -> 6
    all agree: True
answer starts at index 0
  nums=[2, 3, -3, 4] k=5
    brute force         -> 1
    prefix pairwise     -> 1
    prefix + count map  -> 1
    all agree: True
no answer
  nums=[1, 2, 3] k=100
    brute force         -> 0
    prefix pairwise     -> 0
    prefix + count map  -> 0
    all agree: True

sliding window (needs all values non-negative)
    nums=[1, 1, 1] k=2 -> window 2, truth 2, agrees
    nums=[0, 0, 0] k=0 -> window 6, truth 6, agrees
    nums=[1, 2, 3] k=3 -> window 2, truth 2, agrees
    nums=[1, -1, 0] k=0 -> window 0, truth 3, wrong as predicted

stress: 500 random arrays with negatives, all three correct approaches cross-checked
stress: 500 random non-negative arrays, sliding window cross-checked too

ALL APPROACHES AGREED ON EVERY CASE (and the sliding window failed exactly where predicted).
```
