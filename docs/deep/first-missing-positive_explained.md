# The Smallest Positive That Is Missing — explained

## Understanding the Problem

You are handed an unsorted array of integers. It may contain negatives, zeroes, duplicates, and
numbers far larger than the array is long. Find the smallest positive integer — 1, 2, 3, … — that
does **not** appear in it. The follow-up, which is the entire difficulty, is to do it in linear time
using only a constant amount of extra memory.

**The core question is: for each candidate 1, 2, 3, …, is that number present in the array?** The
naive approach is slow because it answers that question by re-scanning the whole array once per
candidate, and there can be n+1 candidates, so an array of 100,000 numbers costs about ten billion
comparisons.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| `1 <= nums.length <= 10^5` | Quadratic work is ~10¹⁰ comparisons. A correct O(n²) answer will time out. |
| `-2^31 <= nums[i] <= 2^31 - 1` | Negatives, zeroes and duplicates are all legal. Any approach that assumes the values are a clean permutation is wrong, and `first-missing-positive` is the harder cousin of `missing-number` precisely because of this. |
| **the answer always lies in 1..n+1** | The load-bearing one, and it is a deduction, not a given: n values can block at most n distinct positives, so the worst the array can do is hold exactly 1, 2, …, n, which forces the answer to n+1. Everything else follows from this bound. |
| **anything ≤ 0 or > n is noise** | A direct corollary. Such a value can never be the answer (it is not a positive ≤ n+1 candidate that could be missing at the bottom) and it can never block one (it occupies none of the n+1 candidate slots). So every rung from the third onward can throw those values away the moment it sees them — which is what makes a table of exactly n+1 slots sufficient. |
| **`nums` may be modified** | This is what unlocks the final rung. The array's n slots are indexed 0..n−1, and the interesting values are 1..n. One subtraction lines them up, and the array becomes its own lookup table. |
| O(n) time **and** O(1) extra space | The set and the boolean table are both correct and both fail the follow-up. They are not slow — they are memory you were told not to spend. |

The whole arc of this problem is one sentence: **the answer is promised to lie in 1..n+1, so the
only values that matter are 1..n — exactly as many as the array has slots, and each one is a legal
index of the array itself.** Everything below is a walk toward taking that seriously.

---

## Approach 1 — Try 1, then 2, then 3

### The idea

*How do I know whether the answer is 1?* Scan the array looking for a 1. *And if it is there?* Then
try 2, then 3, and so on. The first candidate that is absent is the answer. The bound above tells you
where to stop: n+1 candidates is always enough, because the array cannot block more than n of them.
This is the baseline, and it uses nothing about the input except that you can compare its elements
for equality.

### How to think about it

A bouncer with a list of names, calling them out one at a time. "Is 1 in the building?" — walk the
whole room, ask everyone. "Yes." — "Is 2 in the building?" — walk the whole room again. The first
name nobody answers to is the answer. The reason it is slow is obvious from the picture: you walk the
entire room from scratch for every name, and the walk for name 5 re-reads every person that the walks
for names 1 through 4 already read. Nothing learned in one sweep is carried into the next.

The one genuinely important thing this approach contains is the loop bound. `range(1, n + 2)` is the
bound argument made executable, and it is the part of this problem an interviewer is actually testing.

### Worked example

Input: `nums = [3, 4, -1, 1]` — the same input traced through every approach in this document. n = 4,
so candidates run 1 through 5.

| Candidate | Scan of `[3, 4, -1, 1]` | Verdict |
|---|---|---|
| 1 | 3? no. 4? no. −1? no. **1? yes** | present, try the next candidate |
| 2 | 3? no. 4? no. −1? no. 1? no | **absent → answer 2** |

Two candidates, seven element comparisons. Notice that the scan for candidate 2 re-read all four
elements the scan for candidate 1 had already read. On an array where the answer is n+1, every one of
the n+1 candidates triggers a full n-element scan — that is where the quadratic blowup lives. The
array is never written to.

### Code

```python
def first_missing_positive_try_each_candidate(nums: list[int]) -> int:
    for c in range(1, len(nums) + 2):  # n + 1 candidates is always enough
        found = False
        for x in nums:
            if x == c:
                found = True
                break
        if not found:
            return c
    return len(nums) + 1
```

### Common mistake

Bounding the candidate loop by the largest value in the array instead of by n+1 — `for c in
range(1, max(nums) + 2)`. On `[7, 8, 9, 11, 12]` that happens to work, but on `[-5, -3]` the maximum
is negative, the range is empty, and the function falls through to whatever the default is. It also
does far more work than necessary on `[1000000]`, walking a million candidates for a one-element
array. The bound is a property of the array's **length**, not of its contents, and getting that
backwards is the single most common wrong instinct on this problem.

### Complexity and when to use this

**Time O(n²), space O(1).** The cost is n+1 candidates each triggering a scan of up to n elements,
with nothing remembered between candidates. Space is one counter and one flag.

Use it when n is tiny, or — its real job — as a trustworthy oracle to cross-check the clever versions
against, which is exactly what it does in the stress test at the bottom of this file. It is also the
right thing to say out loud first in an interview, because saying it forces you to state the n+1
bound, and the bound is the insight the rest of the solution is built on.

---

## Approach 2 — Sort, then walk

### The idea

*The candidate scan re-reads the whole array once per candidate. What if the values were arranged so
that a single left-to-right walk could settle every candidate at once?* Sort them. Once the values are
in order, you can hold a single counter for "the next positive I am still looking for" and advance it
every time the array hands you exactly that number. This fixes the candidate scan's exact weakness:
the restarted inner sweep.

### How to think about it

Walk the sorted array holding one number in your head — `want`, starting at 1. Each value you meet
falls into one of three cases. If it is *less than* `want` (a negative, a zero, or a duplicate of
something already counted), ignore it and keep walking. If it *equals* `want`, that candidate is
present, so bump `want` by one and keep going. If it is *greater than* `want`, you have just walked
past the place where `want` should have been and it was not there — so `want` is the answer and you
can stop. Sorting is what makes the third case a proof rather than a guess: in sorted order, nothing
smaller can appear later.

### Worked example

Input: `nums = [3, 4, -1, 1]`. Sorted, that becomes `[-1, 1, 3, 4]`.

| Value | `want` before | Case | `want` after |
|---|---|---|---|
| −1 | 1 | less than `want` — noise, skip | 1 |
| 1 | 1 | equals `want` — present | 2 |
| 3 | 2 | **greater than `want`** — 2 was never here | 2, and stop |

Answer 2, in three steps plus the cost of the sort. Compare with the seven comparisons the candidate
scan needed on this tiny array; at n = 100,000 the gap is n log n versus n².

### Code

```python
def first_missing_positive_sort_then_walk(nums: list[int]) -> int:
    """Destroys nums: sorts it in place."""
    nums.sort()
    want = 1
    for x in nums:
        if x == want:
            want += 1
        elif x > want:  # the run of wanted values has been overshot, so want is missing
            break
    return want
```

### Common mistake

Writing `elif x != want: break` — that is, breaking on anything that is not the wanted value. Now the
leading `-1` in `[-1, 1, 3, 4]` breaks the loop immediately and the function returns 1, which is
wrong. The same bug fires on any duplicate: `[1, 1, 2]` sorted is `[1, 1, 2]`, `want` becomes 2 after
the first `1`, the second `1` is not 2, and you return 2 — the correct answer here by luck, but on
`[1, 1, 2, 3]` it returns 2 while the true answer is 4. The three cases really are three: skip,
advance, stop. Only *overshooting* proves absence.

### Complexity and when to use this

**Time O(n log n), space O(1) beyond the sort** (the in-place sort itself costs O(log n) of stack in
most libraries, and this version destroys the caller's array; `sorted(nums)` would cost O(n) instead).
The time is the sort; the walk afterwards is a single linear pass and free by comparison.

This is the right choice when you are handed data that is *already sorted* — then it is an O(n) answer
with no cleverness at all — or when n log n is fast enough and you want code that is obviously
correct. In an interview it is the honest second thing to say: it beats the quadratic version and it
sets up the question that leads to the next rung, namely *why am I paying to order values when the
question only ever asks whether one specific number is present?*

---

## Approach 3 — Hash set

### The idea

*Sorting spends O(n log n) putting the values into an arrangement the answer never reads — it only
ever asks "is this number here?". Can that be asked directly?* Yes: pour everything into a set, then
probe 1, 2, 3, … until a probe misses. Each probe is O(1) expected, so the whole thing is linear. This
fixes sorting's weakness: the ordering work that the answer makes no use of.

### How to think about it

Same bouncer as Approach 1, except now the guest list is indexed. Instead of walking the room to
answer "is 1 here?", you glance at a lookup structure that answers it in one step. You still ask the
candidates in order — 1, 2, 3 — because you want the *smallest* missing one, but each question is now
cheap instead of costing a full sweep. The trade is stated plainly for the first time in this ladder:
you buy linear time with linear memory, and the input is never touched.

Note how few probes you actually make. The probing loop stops the instant it misses, so it runs
`answer` times, and `answer` is at most n+1 — total work is linear, and usually much less.

### Worked example

Input: `nums = [3, 4, -1, 1]`.

Pass 1 builds the set: `{3, 4, -1, 1}`. Four inserts, and note that `-1` goes in too even though it
can never matter — the set has no idea which values are relevant.

Pass 2 probes:

| Probe | In the set? | Action |
|---|---|---|
| 1 | yes | try 2 |
| 2 | **no** | return 2 |

Two probes. The answer is 2, and the array comes back untouched.

### Code

```python
def first_missing_positive_hash_set(nums: list[int]) -> int:
    seen = set(nums)
    want = 1
    while want in seen:
        want += 1
    return want
```

### Common mistake

Believing the `while` loop can run away. It cannot, and knowing why is the point: `seen` holds at most
n distinct values, so it cannot contain all of 1, 2, …, n+1, and the loop is guaranteed to miss by
candidate n+1 at the latest. The real mistake here is a different one — reaching for this version when
the interviewer said "constant extra space" and then being unable to say what is wrong with it. It is
not slow. It is O(n) memory, and the memory holds negatives and billion-sized values that could never
have participated in the answer, which is exactly the wastefulness the next rung removes.

### Complexity and when to use this

**Time O(n), space O(n).** Time is one linear pass to build the set plus at most n+1 constant-time
probes. Space is the set, which holds up to n distinct values of arbitrary magnitude.

This is the right choice when the input must survive, when you are not being asked for constant space,
and above all when the values are **not** integers in a small range — a set keys on anything hashable,
so this is the version that survives "now the values are 64-bit" or "now they are strings you want to
order somehow". It is also the version most production code should ship: it is four lines, obviously
correct, and O(n) memory on a 100,000-element array is nothing to worry about.

---

## Approach 4 — Boolean table of size n+1

### The idea

*The set is storing every value in the input, including the negatives and the billion-sized ones that
the bound argument already proved irrelevant — and it pays a hash on every insert and every probe.
Since the answer is capped at n+1, only the values 1..n can matter. Why not index a flat table by the
value itself?* That is this rung. Allocate n+1 booleans, tick off the in-range values, and return the
first index never ticked. This fixes the set's weakness: paying for generality and storing noise.

### How to think about it

**The table is a row of numbered pigeonholes, one per candidate, and a value tells you which hole it
belongs in.** As each number walks past, it is either in 1..n — in which case it drops a token in its
own hole — or it is noise, and it is dropped on the floor immediately. No hashing, no boxing, no
comparison of one value against another; just a direct array write. Then walk the holes from 1 upward
and the first empty one names the answer.

This rung is where the final one becomes visible. Once you see the answer as "a row of n+1 pigeonholes
indexed by the values 1..n", the next question asks itself: *the input is already a row of n slots,
and the values 1..n are already legal indexes into it — why am I allocating a second row?*

### Worked example

Input: `nums = [3, 4, -1, 1]`. n = 4, so `seen` is five `False` flags (indices 0..4; slot 0 is never
used, because 0 is not a candidate).

Pass 1, ticking off:

| Value | In 1..4? | `seen` after |
|---|---|---|
| 3 | yes | `[F, F, F, T, F]` |
| 4 | yes | `[F, F, F, T, T]` |
| −1 | **no — noise, dropped** | `[F, F, F, T, T]` |
| 1 | yes | `[F, T, F, T, T]` |

Pass 2, walking the candidates:

| Candidate | `seen[c]` | Action |
|---|---|---|
| 1 | True | keep going |
| 2 | **False** | return 2 |

Answer 2. Two linear passes, and the input is untouched. Note that `-1` never made it into the table
at all — the set version stored it, this one refused it at the door.

### Code

```python
def first_missing_positive_boolean_table(nums: list[int]) -> int:
    n = len(nums)
    seen = [False] * (n + 1)
    for x in nums:
        if 1 <= x <= n:  # anything outside 1..n can neither be nor block the answer
            seen[x] = True
    for c in range(1, n + 1):
        if not seen[c]:
            return c
    return n + 1
```

### Common mistake

Dropping the `1 <= x <= n` guard. Without it, `seen[x]` on a negative value silently writes to a slot
counted from the end of the list — Python allows `seen[-1]` — corrupting the flag for candidate n and
producing a wrong answer with no error message; and `seen[x]` on a value larger than n raises
`IndexError` outright. On `[3, 4, -1, 1]` the unguarded version writes `seen[-1] = True`, which is
`seen[4]`, marking candidate 4 as present when it already was — harmless here, which is precisely why
the bug survives casual testing and then fails in production on an input where it matters.

The companion off-by-one is allocating `[False] * n` instead of `n + 1`: the value n needs slot n, and
a table of length n stops at n−1.

### Complexity and when to use this

**Time O(n), space O(n).** One pass to tick off, one pass over at most n candidates to find the hole —
with a direct array read or write at each step and no hashing at all, so the constants are noticeably
better than the set. Space is n+1 booleans, which in C++ can be a bitset of n bits and in Python is a
list of references.

This is the right choice when the value range is known and dense, allocation is allowed, and the input
must survive — it is the fastest approach in this file that does not write to `nums`. It is also the
version worth writing first in an interview even when you intend to do the in-place trick, because it
makes the marking scheme obvious before you start hiding it inside the data.

---

## Approach 5 — Cyclic placement, in place

### The idea

*The boolean table has n+1 slots indexed by the values 1..n. The input has n slots indexed 0..n−1.
Those are the same slots with an offset of one. Why are there two of them?* This rung deletes the
second one. Instead of writing a flag at `seen[v]`, move the value `v` itself into slot `v-1`.
Afterwards, "is candidate c present?" is answered by a single read: slot c−1 holds c if and only if c
was in the array. This fixes the boolean table's weakness — the fresh allocation — and drops the extra
space to O(1). The price is that the array is permuted beyond recovery.

### How to think about it

**Every value is trying to go home, and its home is the slot with its own number on the door.** The
value 1 belongs in slot 0, the value 4 in slot 3, and anything outside 1..n is homeless and stays
wherever it lands. So you walk the array and, at each position, ask the value standing there where it
belongs. If it belongs elsewhere and that slot does not already hold a copy of it, swap the two. The
swap hands you a *new* value at the current position, which may itself belong elsewhere — so you ask
again, and keep asking, until the value at hand is homeless or already home. Only then do you step
forward.

When the walk is done, the array reads 1, 2, 3, … for as far as those values existed, and the first
slot that disagrees with its own door number names the missing value.

### Worked example

Input: `nums = [3, 4, -1, 1]`, n = 4. This is the real trace of the placing pass, one line per swap.

| At | Value there | Belongs in slot | What is there | Action | Array after |
|---|---|---|---|---|---|
| i = 0 | 3 | 2 | −1, not 3 | swap slots 0 and 2 | `[-1, 4, 3, 1]` |
| i = 0 | −1 | — | — | homeless, step forward | `[-1, 4, 3, 1]` |
| i = 1 | 4 | 3 | 1, not 4 | swap slots 1 and 3 | `[-1, 1, 3, 4]` |
| i = 1 | 1 | 0 | −1, not 1 | swap slots 1 and 0 | `[1, -1, 3, 4]` |
| i = 1 | −1 | — | — | homeless, step forward | `[1, -1, 3, 4]` |
| i = 2 | 3 | 2 | itself | already home, step forward | `[1, -1, 3, 4]` |
| i = 3 | 4 | 3 | itself | already home, step forward | `[1, -1, 3, 4]` |

Three swaps in total for a four-element array. Now the reading pass:

| Slot | Holds | Wants | Verdict |
|---|---|---|---|
| 0 | 1 | 1 | correct, keep going |
| 1 | **−1** | 2 | 2 was never placed → **answer 2** |

The array left behind is `[1, -1, 3, 4]` — a permutation of the input the caller never asked for.

### Why the walk is still linear, despite the inner loop

This is the part that looks dangerous and is not, and it is the thing to be able to explain out loud.
There is a `while` loop nested inside a `for` loop, which usually spells O(n²) — but here the total
number of swaps across the *entire* run is at most n, so the whole placing pass is O(n).

The reason is an accounting argument. Look at what a swap does: it takes a value `v` that is in 1..n
and puts it in slot `v-1`, which is its home. The guard `nums[nums[i] - 1] != nums[i]` is what
guarantees this — the swap only fires when the destination does *not* already hold `v`, so after the
swap, slot `v-1` holds `v` for the first time. And once a slot holds its own value, nothing can ever
move it again: any future swap targeting that slot would have to pass the same guard, and the guard
now reads "the destination already holds this value", so it fails and the loop stops.

So every single swap in the entire run permanently settles one value that had never been settled
before. There are at most n values that can be settled. Therefore there are at most n swaps in total,
across every iteration of the outer loop combined. The inner `while` is not "up to n iterations per
outer step" — it is "some iterations, drawn from a shared budget of n for the whole run". Add the n
outer steps themselves, and the placing pass costs at most 2n operations, plus n more for the reading
pass. Linear.

The same argument is what makes the sibling approach in `missing-number` linear, and it is the
standard shape for *any* in-place permutation trick: find the quantity that strictly increases and
never decreases (here, "number of values sitting at home"), show every unit of inner work advances it
by one, and the bound follows.

### Code

```python
def first_missing_positive_cyclic_placement(nums: list[int]) -> int:
    """Destroys nums: every placeable value is swapped into slot value - 1."""
    n = len(nums)
    for i in range(n):
        # keep sending the value at i home until i holds junk or is already settled
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1
```

### Common mistake

Writing the guard as `nums[nums[i] - 1] != i + 1` — checking whether the destination is "correct"
rather than whether it already holds the value being sent. That comparison is against the wrong slot's
door number and is simply incorrect. But the far more common and far nastier bug is dropping the
duplicate guard entirely and writing `while 1 <= nums[i] <= n and nums[i] != i + 1`. On `[1, 1]` that
loop swaps slot 1 with slot 0, gets `[1, 1]` back, finds `nums[1] != 2` still true, swaps again, and
**spins forever**. Duplicates are explicitly legal in this problem, so this is not a theoretical
hazard — it is a hang on a perfectly ordinary input. The guard must compare the destination's
*contents* to the value being placed, because that is what proves progress and that is what the
linearity argument above depends on.

A third, quieter bug: writing `j = nums[i] - 1` *after* the swap instead of before, or swapping
through a stale `j`. The index must be computed from the current value at `i`, and in Python the
tuple swap `nums[i], nums[j] = nums[j], nums[i]` evaluates the right-hand side first, which is why it
is safe — writing the same thing as three separate assignments with a temporary is where people
clobber the value they are about to read.

### The cost of mutation — who it hurts, and can it be undone

The array does not come back. Unlike the sign-flip trick in `find-all-duplicates`, which only changes
signs and leaves every value in place, this rung **permutes** the array: values move, and the original
ordering is destroyed.

Who gets hurt:

- **A caller that still needs the array.** The values are all still there (nothing is created or
  deleted), but they are in different positions. Anything that depended on order — a parallel array of
  labels indexed the same way, a previously computed index, a slice boundary — is now silently wrong.
  Nothing throws. The next reader just sees the data in the wrong order.
- **A concurrent reader.** This function writes to most of the array; another thread reading it
  concurrently sees a half-permuted state where a value can legitimately appear twice or not at all.
  It is a data race, and no amount of careful reading on the other side fixes it.
- **A read-only or shared buffer.** A memory-mapped read-only page faults; a copy-on-write page gets
  dirtied; a caller who passed a view into a larger array has that larger array scrambled too.

**Can it be undone?** In general, no — not without spending the memory the trick was invented to
avoid. Sign flipping is its own inverse, so `find-all-duplicates` can repair itself in one pass. A
permutation is invertible in principle, but you would have to have *recorded* it, and recording which
swaps you made costs O(n) memory, which defeats the entire purpose. The only honest ways to get the
original back are: copy the array before you start (O(n) space — at which point use the boolean table,
which is simpler and just as fast), or accept the loss.

The practical rule is the same as for every in-place trick, and it is a contract question rather than
an algorithm question: **if you permute the caller's input, that belongs in the function's name or its
docstring**, not in a comment three levels down. Note also that the problem statement here explicitly
permits modification — which is a deliberate signal that the intended answer mutates. When a statement
goes out of its way to tell you the input is expendable, it is telling you where to look.

### Complexity and when to use this

**Time O(n), space O(1).** The placing pass is at most n outer steps plus at most n swaps total, by
the accounting argument above; the reading pass is one more walk of n. Space is a loop index and a
temporary — no allocation at all, and the answer is a single integer, so there is not even an output
list to count.

Use it when the constant-space follow-up is genuinely being asked, when the array is large enough that
a second n-sized allocation is a real cost, and when the caller has said the input is expendable. In
an interview this is the answer the question was written for, and the two things that earn the marks
are the n+1 bound argument and the linearity argument — not the code, which is six lines and which
plenty of people can reproduce without understanding either.

---

## The Overall Arc

The principle every rung chases is *stop paying twice for what the constraints already told you*, and
this problem is unusual in that the crucial constraint is not written down — it is deduced. With n
values in hand you can block at most n distinct positives, so the answer is trapped in 1..n+1 before
you have looked at a single element. Everything else falls out of that. The candidate scan takes the
bound seriously enough to know when to stop but pays for the presence test in time, sweeping the whole
array once per candidate. Sorting fixes the sweeping by imposing an order, which is general and
correct but charges n log n for an arrangement the answer never consults — it only ever asks "is this
one number here?". The hash set answers exactly that question in one step, and is the right production
answer, but it stores everything the array contains, including the negatives and the billion-sized
values that the bound already proved cannot matter. The boolean table throws those away at the door
and indexes straight into a row of n+1 pigeonholes — no hashing, no noise. And then the last
observation: **that row of n+1 pigeonholes indexed by 1..n is the same shape as the input, a row of n
slots indexed 0..n−1, offset by one.** The second table was never new information; it was the first
one, paid for twice. Sending each value `v` into slot `v-1` collapses them into a single structure
that is simultaneously the data and the lookup table, and the extra space vanishes. What that collapse
costs is stated honestly by the statement itself — the array is permuted and does not come back — and
what makes it *safe* is the accounting argument: every swap settles one value forever, there are only
n values to settle, so the nested loop that looks quadratic is linear. Both halves, the bound and the
accounting, transfer directly: the same shape solves `missing-number`, `find-all-duplicates`, and
every "the values are a near-permutation of the indices" problem you will meet.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Try each candidate | O(n²) | O(1) | Zero assumptions, zero memory, re-scans for every candidate | n is tiny, or you need a reference oracle — and as the way to state the n+1 bound out loud |
| Sort, then walk | O(n log n) | O(1) beyond the sort | Buys a single settling pass with ordering work the answer never reads | The input is already sorted, or n log n is plainly fast enough |
| Hash set | O(n) | O(n) | Linear time for linear memory; stores noise it can never use | The input must survive, constant space is not required, or values are not small dense integers |
| Boolean table of n+1 | O(n) | O(n) | Trades the set's generality for direct indexing and drops noise at the door | Values are bounded, allocation is fine, and the input must come back intact |
| Cyclic placement | O(n) | O(1) | Same speed as the table with no allocation — pays by permuting the input irreversibly | The constant-space follow-up is asked and the caller has no further use for the array |

---

## Interview Priority

**Know cold: cyclic placement, and the boolean table.** This question exists to test exactly that
pair. Open with the boolean table — it is linear, it is obviously correct, and describing it proves
you have already deduced the n+1 bound and classified everything outside 1..n as noise. Then say the
sentence that gets you the rest of the way: *"the table has n+1 slots and the array has n, indexed by
the same numbers, so I can use the array as its own table by putting each value v into slot v−1."*
Write it, and then be ready for the two questions that always follow. First: **why is the nested while
loop not quadratic?** (every swap settles one value permanently, there are at most n values, so at most
n swaps happen across the whole run). Second: **what happens on duplicates?** (the guard compares the
destination's contents to the value being placed; without it, `[1, 1]` hangs forever). Being unable to
answer either one turns a correct solution into a memorised one, and the interviewer can tell.

**Worth having ready: the hash set.** Four lines, and it is what you would actually ship. Name it in
ten seconds, then say precisely what disqualifies it — not speed, but O(n) memory spent on values the
bound already ruled out.

**Understand but do not drill: the candidate scan and the sort.** The candidate scan's whole value is
that stating it forces you to say the n+1 bound in your first thirty seconds, and that it makes an
unimpeachable oracle for the stress test below. The sort deserves one dismissive sentence about paying
n log n for an ordering the answer never reads — dismissing it for the right reason is what shows you
are choosing rather than pattern-matching.

---

## Full Runnable Script

Every approach in one file, checked against all three examples from the statement, both smallest legal
inputs (the one whose answer is past the end and the one whose answer is 1), a duplicate case, an
all-noise case, and a randomised stress test seeded with negatives, zeroes, duplicates and
out-of-range values. Each approach is handed **its own copy of the data**, because two of the five
rearrange the array they are given and the next approach would otherwise read corrupted input.

There is no "no answer" case, and that is not an oversight: the bound argument guarantees an answer in
1..n+1 always exists, so every legal input has one.

```python
"""The Smallest Positive That Is Missing — every approach in one file, cross-checked.

Run: python first_missing_positive.py
"""

from __future__ import annotations

import random
from typing import Callable


def first_missing_positive_try_each_candidate(nums: list[int]) -> int:
    for c in range(1, len(nums) + 2):  # n + 1 candidates is always enough
        found = False
        for x in nums:
            if x == c:
                found = True
                break
        if not found:
            return c
    return len(nums) + 1


def first_missing_positive_sort_then_walk(nums: list[int]) -> int:
    """Destroys nums: sorts it in place."""
    nums.sort()
    want = 1
    for x in nums:
        if x == want:
            want += 1
        elif x > want:  # the run of wanted values has been overshot, so want is missing
            break
    return want


def first_missing_positive_hash_set(nums: list[int]) -> int:
    seen = set(nums)
    want = 1
    while want in seen:
        want += 1
    return want


def first_missing_positive_boolean_table(nums: list[int]) -> int:
    n = len(nums)
    seen = [False] * (n + 1)
    for x in nums:
        if 1 <= x <= n:  # anything outside 1..n can neither be nor block the answer
            seen[x] = True
    for c in range(1, n + 1):
        if not seen[c]:
            return c
    return n + 1


def first_missing_positive_cyclic_placement(nums: list[int]) -> int:
    """Destroys nums: every placeable value is swapped into slot value - 1."""
    n = len(nums)
    for i in range(n):
        # keep sending the value at i home until i holds junk or is already settled
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1


APPROACHES: list[tuple[str, Callable[[list[int]], int]]] = [
    ("try each candidate", first_missing_positive_try_each_candidate),
    ("sort, then walk", first_missing_positive_sort_then_walk),
    ("hash set", first_missing_positive_hash_set),
    ("boolean table", first_missing_positive_boolean_table),
    ("cyclic placement", first_missing_positive_cyclic_placement),
]


def run_case(label: str, nums: list[int]) -> bool:
    # Each approach gets its OWN copy: two of the five rearrange what they are handed.
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
    ok &= run_case("example from the statement", [1, 2, 0])
    ok &= run_case("the hole is in the middle", [3, 4, -1, 1])
    ok &= run_case("nothing in 1..n is present", [7, 8, 9, 11, 12])
    ok &= run_case("smallest legal input, answer past the end", [1])
    ok &= run_case("smallest legal input, answer is 1", [2])
    ok &= run_case("duplicates", [1, 1])
    ok &= run_case("all noise", [-5, 0, -1, 2 ** 31 - 1])
    # There is no 'no answer' case here: an answer in 1..n+1 always exists.

    random.seed(11)
    checked = 0
    for _ in range(500):
        n = random.randint(1, 30)
        # mix of noise (negatives, zero, oversized) and in-range values, with duplicates
        nums = [random.choice([random.randint(-20, 0), random.randint(1, n + 5)])
                for _ in range(n)]
        expected = first_missing_positive_try_each_candidate(list(nums))
        for name, fn in APPROACHES:
            got = fn(list(nums))
            if got != expected:
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} {got} != {expected}")
        checked += 1
    print(f"stress: {checked} random arrays of noise and in-range values, all five "
          f"approaches cross-checked against brute force")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()
```

### Output when run

```
example from the statement
  nums=[1, 2, 0]
    try each candidate   -> 3
    sort, then walk      -> 3
    hash set             -> 3
    boolean table        -> 3
    cyclic placement     -> 3
    all agree: True
the hole is in the middle
  nums=[3, 4, -1, 1]
    try each candidate   -> 2
    sort, then walk      -> 2
    hash set             -> 2
    boolean table        -> 2
    cyclic placement     -> 2
    all agree: True
nothing in 1..n is present
  nums=[7, 8, 9, 11, 12]
    try each candidate   -> 1
    sort, then walk      -> 1
    hash set             -> 1
    boolean table        -> 1
    cyclic placement     -> 1
    all agree: True
smallest legal input, answer past the end
  nums=[1]
    try each candidate   -> 2
    sort, then walk      -> 2
    hash set             -> 2
    boolean table        -> 2
    cyclic placement     -> 2
    all agree: True
smallest legal input, answer is 1
  nums=[2]
    try each candidate   -> 1
    sort, then walk      -> 1
    hash set             -> 1
    boolean table        -> 1
    cyclic placement     -> 1
    all agree: True
duplicates
  nums=[1, 1]
    try each candidate   -> 2
    sort, then walk      -> 2
    hash set             -> 2
    boolean table        -> 2
    cyclic placement     -> 2
    all agree: True
all noise
  nums=[-5, 0, -1, 2147483647]
    try each candidate   -> 1
    sort, then walk      -> 1
    hash set             -> 1
    boolean table        -> 1
    cyclic placement     -> 1
    all agree: True
stress: 500 random arrays of noise and in-range values, all five approaches cross-checked against brute force

ALL APPROACHES AGREED ON EVERY CASE.
```
