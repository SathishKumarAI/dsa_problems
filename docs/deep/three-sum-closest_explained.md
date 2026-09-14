# The Triple Nearest the Target — explained

## Understanding the Problem

You have a list of whole numbers and one more number, the **target**. Pick three of the list's
entries — three different positions, though the values at them may be equal — and add them. Out of
every triple you could have picked, return the sum that lands **nearest** the target. You return the
sum, not the three numbers.

**The core question: which triple's sum is closest to the target?** The naive approach is slow because
it answers that by forming every triple there is — `n(n−1)(n−2)/6` of them — and each one is only
three additions, so the work grows with the cube of the list's length.

### The misconception: "this is 3Sum"

It looks like 3Sum and the same two-pointer engine drives it, so the reflex is to reuse 3Sum's code.
Two things are different, and both of them bite.

| | 3Sum | **3Sum Closest** |
|---|---|---|
| What you are looking for | every triple summing to **exactly** 0 | the **single best** sum, exact or not |
| When a sum equals the target | record it, then skip past duplicates to avoid repeating the triple | nothing can beat distance `0` — **return immediately** |
| How the pointers move | `s < 0` → `lo++`, `s > 0` → `hi--`, `s == 0` → *both* move and duplicates are skipped | move by the **sign of the difference** only; there is no exact hit to step past |
| Duplicate values | must be skipped, or the answer contains the same triple twice | cost nothing but time — you return one number, not a set |
| What the loop carries | the output list | a separate **`best`**, updated on every single sum |

> **Watch out.** The thing you were about to think is *"I'll just adapt 3Sum's skip-the-duplicates
> loop."* Do not. Those skips exist to stop a *set-shaped answer* repeating itself, and this answer is
> a single integer. Porting them in adds code that can only introduce bugs — and porting in 3Sum's
> `while lo < hi and nums[lo] == nums[lo+1]: lo += 1` can skip past the very pair that was closest.

The second difference is the structural one: because there is no exact hit to anchor on, **the best
answer has to be tracked separately** in a variable that survives the whole scan. Every rung below
shares that variable and shares one rule for updating it.

### The tie-break, and why the document pins it down

When two triples are equally close, this document (and every rung in it) returns **the smaller sum**.
LeetCode promises the input has a unique answer, so on the judge the rule never fires. It is pinned
here for a concrete reason: five implementations visit triples in five different orders, and they can
only be cross-checked against each other if they break ties identically. The rule is lifted into one
helper, `better`, used by all five.

```python
def better(candidate: int, best: int, target: int) -> int:
    """Closest to target wins; ties go to the SMALLER sum."""
    d, bd = abs(candidate - target), abs(best - target)
    return candidate if (d < bd or (d == bd and candidate < best)) else best
```

The statement's second example is exactly this case: `nums = [-2, 0, 1, 3]`, `target = 0`. The sums
`-1` and `1` are both one away, and the answer is `-1`.

### The constraints, and what each one unlocks

| Constraint | What it unlocks |
|---|---|
| `3 <= nums.length <= 500` | A triple always exists, so **there is no no-answer case** and `best` can be seeded with the first legal triple rather than an infinity sentinel. `500³/6` is about `2 × 10^7` — the cubic rung is slow but survivable, which is why it makes a usable reference. |
| `-1000 <= nums[i] <= 1000`, `-10^4 <= target <= 10^4` | A triple sum lies in `[-3000, 3000]` and fits a 32-bit `int` with room to spare, so **no overflow handling is needed** even in Java or C++. |
| the three **positions** must be distinct; **values may repeat** | `[0, 0, 0]` is legal input and its only triple is the answer. This is the permission slip for *not* writing duplicate-skipping code — and the trap for anyone who ports it from 3Sum. |
| nothing says the array is **sorted** | **The permission slip for every rung after the first.** Sorting is not given; it is bought, for `O(n log n)`. What it buys is a *direction*: in a sorted array, "the sum is too small" has an unambiguous fix. Every optimisation below descends from that one fact. |
| ties are broken toward the smaller sum | Makes five differently-ordered scans comparable. On the judge, the promised-unique answer means it never fires. |

### The worked example, used in every section below

```
nums = [-1, 2, 1, -4],  target = 1        answer: 2
sorted:  [-4, -1, 1, 2]
```

Only four triples exist, so every rung can be traced to the last step:

| triple | sum | distance from 1 |
|---|---|---|
| `(-1, 2, 1)` | **2** | **1** ← the answer |
| `(-1, 2, -4)` | −3 | 4 |
| `(-1, 1, -4)` | −4 | 5 |
| `(2, 1, -4)` | −1 | 2 |

Note the first rung works on the array **unsorted** and every later rung sorts it. They still agree,
because `better` does not care what order candidates arrive in.

---

## Approach 1 — Every triple

### The idea

*How do I know which triple is closest?* Form all of them and keep the best one seen. Three nested
loops, each starting one past the previous, so every combination of three distinct positions is
visited exactly once and none is visited twice.

### How to think about it

> **Intuition.** A committee of three has to be chosen from a room, and you are scoring every possible
> committee. You pick a first member, then a second from everyone *after* them, then a third from
> everyone after *that* — starting each inner walk past the outer one is what stops you from
> re-scoring the same three people in a different order. You carry one slip of paper with the best
> score so far, and the reasoning has no memory beyond it: each committee is scored from scratch, and
> that lack of memory is the entire inefficiency.

### Worked example

`nums = [-1, 2, 1, -4]` (unsorted), `target = 1`. `best` is seeded with the first triple:
`nums[0] + nums[1] + nums[2] = -1 + 2 + 1 = 2`.

| `i` (`nums[i]`) | `j` (`nums[j]`) | `k` (`nums[k]`) | `s` | `\|s − 1\|` | `best` before | verdict | `best` after |
|---|---|---|---|---|---|---|---|
| 0 (−1) | 1 (2) | 2 (1) | 2 | 1 | 2 | tie with itself | 2 |
| 0 (−1) | 1 (2) | 3 (−4) | −3 | 4 | 2 | worse | 2 |
| 0 (−1) | 2 (1) | 3 (−4) | −4 | 5 | 2 | worse | 2 |
| 1 (2) | 2 (1) | 3 (−4) | −1 | 2 | 2 | worse | 2 |

Result **2**. ✅ Four triples for `n = 4`; for `n = 500` there would be 20 708 500.

### Code

```python
def three_sum_closest_every_triple(nums: list[int], target: int) -> int:
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):        # j starts past i, k past j: each triple exactly once
            for k in range(j + 1, n):
                s = nums[i] + nums[j] + nums[k]
                best = better(s, best, target)
    return best
```

`seed_sum(nums)` is `nums[0] + nums[1] + nums[2]` — legal because `3 <= n` is promised. `better` is
the shared tie-break helper from above.

### Common mistake

> **Watch out.** Seeding `best = 0`. The misconception is that `0` is a neutral starting point. It is
> not a *sum* — it is a value no triple may have produced, and if it happens to sit nearer the target
> than anything reachable, the function returns a number that is not any triple's sum at all.

Measured on the worked example it returns `0` instead of `2`. On the statement's third example,
`nums = [1,1,1,0]`, `target = -100`, it also returns `0` where the answer is `2` — because `0` is
nearer `-100` than any real triple is. The seed must be a **reachable** sum; `seed_sum` guarantees
that, and the constraint `3 <= n` is what makes it safe.

(A sentinel like `float("inf")` also works, but it forces the tie-break comparison to cope with a
non-integer and makes the function return type a lie. Seeding with a real triple is cleaner.)

### Complexity and when to use this

**Time `O(n³)`** — three nested walks, `n(n−1)(n−2)/6` triples, three additions each; at `n = 500`
that is about `2 × 10^7` sums, slow but not fatal. **Space `O(1)`** — two loop counters and `best`.

Use it as the reference a fast version is stress-tested against, which is precisely its job in the
script below, and as the first thirty seconds of an interview answer. It is also the only rung that
needs no sorting, so it is the one to keep if the input must not be reordered and you cannot afford a
copy.

---

## Approach 2 — Sort, then prune the inner loop

### The idea

*The blind triple loop cannot tell a hopeless candidate from a promising one — can the data be
arranged so it can?* Sort the values. Then for a fixed first and second value, the innermost sums are
**monotonically increasing** in `k`, so the moment one reaches the target, every later `k` only
overshoots further and the scan can stop. This fixes brute force's weakness: **after seeing a sum far
above the target it still had to check the rest.**

### How to think about it

> **Intuition.** You are turning a dial upward looking for a mark. Unsorted, the dial jumps about at
> random and you must try every position. Sorted, the dial only ever climbs — so the first time you
> pass the mark, you are done, because everything beyond is further past it. The last value below and
> the first value at-or-above are the only two that can be closest, and a monotone walk hands you both
> for free at the moment it stops.

This is also the first appearance of the theme that runs through the rest of the ladder: **sorting is
bought once and sold repeatedly.** Here it buys an early `break`. Later it buys a binary search, and
then it buys the pointer sweep.

### Worked example

Sorted: `[-4, -1, 1, 2]`, `target = 1`. `best` is seeded with `-4 + -1 + 1 = -4`.

| `i` (`nums[i]`) | `j` (`nums[j]`) | `k` (`nums[k]`) | `s` | `\|s − 1\|` | `best` after | then |
|---|---|---|---|---|---|---|
| 0 (−4) | 1 (−1) | 2 (1) | −4 | 5 | −4 | `s < 1`, continue |
| 0 (−4) | 1 (−1) | 3 (2) | −3 | 4 | **−3** | `s < 1`, inner loop ends |
| 0 (−4) | 2 (1) | 3 (2) | −1 | 2 | **−1** | `s < 1`, inner loop ends |
| 1 (−1) | 2 (1) | 3 (2) | 2 | 1 | **2** | `s >= 1` → **break** |

Result **2**. ✅

The last row is the pruning doing its work: `s = 2` reaches the target, `best` is updated *first*, and
only then does the loop break. On this tiny array there is nothing left to skip; on a long ascending
tail the break is what removes it.

### Code

```python
def three_sum_closest_sort_then_prune(nums: list[int], target: int) -> int:
    nums = sorted(nums)                      # a copy: the caller's order is not ours to change
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            for k in range(j + 1, n):
                s = nums[i] + nums[j] + nums[k]
                best = better(s, best, target)
                if s >= target:              # sorted, so every later k only overshoots further
                    break
    return best
```

### Common mistake

> **Watch out.** Putting the `break` **before** the `best` update. The misconception is that a sum at
> or above the target is out of contention. It is the opposite — it is one of the **two best
> candidates** for this pair, the first one on the high side, and the one below it is the other. Break
> before recording and you throw away the better half of the bracket every time.

Measured on the worked example it returns `-1` instead of `2` — the winning triple is exactly the sum
that trips the break. On `nums = [0,5,5,6,9]`, `target = 14`, it returns `11` where `14` is reachable
exactly. Record, then break; the order of those two lines is the whole rung.

### Complexity and when to use this

**Time `O(n log n)` for the sort plus `O(n³)` worst case** — the sort is dominated, and the pruning is
a constant-factor win, not a class change: a target above every reachable sum never trips the break,
so the inner loop still runs to the end every time. **Space `O(1)`** beyond the sorted copy.

Its value is pedagogical rather than practical: it is the rung where **sorting starts paying**, and
where you first see that the two sums bracketing the target are the only ones that matter for a fixed
pair. Say that sentence out loud and the next two rungs both fall out of it. Do not ship it — say what
it does not fix (the worst case is unchanged) and move up.

---

## Approach 3 — Binary search for the third value

### The idea

*The pruned loop still walks the tail one step at a time, and only stops early when the target sits
early in it — can the stopping point be found directly?* Yes. With the first two values fixed, the
ideal third is pure arithmetic: `want = target - nums[i] - nums[j]`. The tail is sorted, so binary
search for `want` and test only the two entries straddling it. This fixes the pruning rung's weakness:
**a target above everything makes the inner loop scan to the end, every time.**

### How to think about it

> **Intuition.** A filing cabinet instead of a pile of index cards. With two values chosen, you know
> exactly what the third *should* be to hit the target dead on. That number is probably not in the
> cabinet — but the two files sitting either side of where it would go are the nearest things to it,
> and in a sorted cabinet you reach them by opening it halfway and discarding half, repeatedly.
> Everything further away in either direction is further from `want`, so nothing else needs looking
> at.

### Worked example

Sorted: `[-4, -1, 1, 2]`, `target = 1`. `best` seeded at `-4`. The search finds `lo` = the first index
in the tail whose value is `>= want`; the candidates are `lo - 1` and `lo`, filtered to `j < k < n`.

| `i` (`nums[i]`) | `j` (`nums[j]`) | `want` | search lands at | candidates `k` | `s` | `\|s − 1\|` | `best` after |
|---|---|---|---|---|---|---|---|
| 0 (−4) | 1 (−1) | `1 − (−4) − (−1) = 6` | `lo = 4` (past the end) | `[3]` | −3 | 4 | **−3** |
| 0 (−4) | 2 (1) | `1 − (−4) − 1 = 4` | `lo = 4` | `[3]` | −1 | 2 | **−1** |
| 1 (−1) | 2 (1) | `1 − (−1) − 1 = 1` | `lo = 3` | `[3]` | 2 | 1 | **2** |

Result **2**. ✅

Two details worth reading off the table. In the first two rows `want` exceeds everything in the tail,
so the search runs off the end at `lo = 4`; only `lo - 1 = 3` survives the `j < k < n` filter, and it
is the right candidate — the largest available value, since `want` is above them all. In the third
row `want = 1` and `nums[3] = 2` is the first value `>= 1`, so `lo = 3`; `lo - 1 = 2` equals `j` and is
filtered out, correctly, because `k` must be a different position.

### Code

```python
def three_sum_closest_binary_search(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            want = target - nums[i] - nums[j]      # the third value that would hit target exactly
            lo, hi = j + 1, n
            while lo < hi:                         # first index in the tail with nums[idx] >= want
                mid = (lo + hi) // 2
                if nums[mid] < want:
                    lo = mid + 1
                else:
                    hi = mid
            for k in (lo - 1, lo):                 # the two entries straddling want
                if j < k < n:                      # k must be a real position past j
                    s = nums[i] + nums[j] + nums[k]
                    best = better(s, best, target)
    return best
```

### Common mistake

> **Watch out.** Testing only `lo` and not `lo - 1`. The misconception is that a binary search "finds
> the closest value". It does not — it finds the first value **at or above** `want`, which is one side
> of the bracket. The value just below it is often nearer, and when `want` exceeds the whole tail,
> `lo` runs off the end and testing only `lo` tests **nothing at all**.

Measured on `nums = [-8,-6,-4,-2]`, `target = -13`: it returns `-12` where the answer is `-14`. On
`nums = [-5,-4,-3,-2]`, `target = 1000` it returns `-12` where the answer is `-9`. (It happens to be
right on the worked example, which is exactly why this bug survives casual testing — always test it
against a target that lies outside the reachable range.)

The paired slip is the bounds check. `k` must satisfy `j < k < n`; dropping the `k > j` half lets the
search return `k == j` and forms a triple that uses one position twice.

### Complexity and when to use this

**Time `O(n² log n)`** — `n²/2` pairs, each paying a `log n` search over the tail, plus the sort.
**Space `O(1)`** beyond the sorted copy; the search uses three indices.

This is a genuine improvement — the worst case finally drops below cubic — and it is worth knowing for
a reason beyond this problem: it is the shape you reach for when the inner structure is sorted but the
outer loop is not amenable to a pointer sweep. Here it is not the destination, because it restarts
from scratch for every pair and throws away everything the previous search learned. That observation
is the last rung.

---

## Approach 4 — Two pointers converging (the instinctive linear inner scan)

### The idea

*The binary search rediscovers the shape of the tail for every pair — can the previous search's
knowledge be carried forward instead?* Yes. Fix only the **first** value, then put one pointer just
after it and one at the far end. Read the pair sum: if the triple undershoots, the only way up is to
move the low pointer right; if it overshoots, the high pointer must come in. Either way one index
retires permanently, so the whole inner scan is linear. This fixes the binary search's weakness:
**`log n` work per pair, repeated from scratch `n²/2` times.**

### How to think about it

> **Intuition.** Two hands on a sorted ruler, one at each end of the stretch you are allowed to use.
> The sum of what they point at, plus the fixed anchor, is your reading. Too low? The only way to
> raise it is to bring the left hand inward, since everything to its left is smaller still. Too high?
> Bring the right hand in. Each move retires one position forever, so the two hands meet after at most
> `n` moves — and you never had to decide *how far* to move, only which hand.

> **Why it works.** The move rule needs an argument, and it is an exchange argument. Suppose the
> current sum `s` is **below** the target, with pointers at `lo` and `hi`. Consider every triple still
> available that uses `hi`: they are `nums[i] + nums[k] + nums[hi]` for `lo <= k < hi`. Since the array
> is sorted, `nums[k] >= nums[lo]` is false for none of them below `lo`… precisely, every remaining
> `k` is `>= lo`, so every such sum is `>= s`. But we are *already* going to evaluate the best of
> those as `lo` advances — the only pairing with `hi` that we would lose by moving `hi` instead is the
> one with the *smallest* remaining low value, namely `lo` itself, and that is exactly the sum we just
> measured and fed to `better`. So advancing `lo` discards nothing unmeasured: every triple containing
> `nums[lo]` and a partner at or below `hi` has a sum no greater than `s`, and `s` is already the
> closest of them from below because the array is sorted. The mirror argument covers `s > target`.
> **This is why there is no exact-hit branch:** when `s == target` the distance is `0`, nothing can be
> closer, and the only correct action is to stop — which is what the next rung does.

### Worked example

Sorted: `[-4, -1, 1, 2]`, `target = 1`. `best` seeded at `-4`.

| `i` (`nums[i]`) | `lo` (`nums[lo]`) | `hi` (`nums[hi]`) | `s` | `\|s − 1\|` | `best` before → after | `s` vs target | move |
|---|---|---|---|---|---|---|---|
| 0 (−4) | 1 (−1) | 3 (2) | −3 | 4 | −4 → **−3** | below | `lo++` |
| 0 (−4) | 2 (1) | 3 (2) | −1 | 2 | −3 → **−1** | below | `lo++` |
| — | 3 | 3 | — | — | — | pointers met | anchor −4 retired |
| 1 (−1) | 2 (1) | 3 (2) | 2 | 1 | −1 → **2** | at/above | `hi--` |
| — | 2 | 2 | — | — | — | pointers met | anchor −1 retired |

Result **2**. ✅ Three sums evaluated instead of the brute force's four — and on a 500-element array,
about 125 000 instead of 20 708 500.

Compare the brute-force table: the same winning triple `(-1, 1, 2)` is found, but only three
candidates were ever formed, and no pair was examined twice.

### Code

```python
def three_sum_closest_two_pointers(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        lo, hi = i + 1, n - 1
        while lo < hi:                       # STRICT: lo == hi would use one position twice
            s = nums[i] + nums[lo] + nums[hi]
            best = better(s, best, target)
            if s < target:                   # the sign of the miss says which end to move
                lo += 1
            else:
                hi -= 1
    return best
```

### Common mistake

> **Watch out.** Writing `while lo <= hi`. The misconception is that the loop should keep going until
> the pointers cross — which is right for a search over a *range*, and wrong here, because `lo == hi`
> means both pointers sit on the **same position** and the "triple" uses that entry twice. The problem
> requires three distinct positions.

Measured on the worked example it returns `1` instead of `2`: at `i = 1`, `lo` and `hi` both land on
index 2, forming `-1 + 1 + 1 = 1`, which is an exact hit on the target — and an illegal one, since
`nums[2]` was counted twice. On `nums = [-2,0,1,3]`, `target = 0` it returns `0` instead of `-1`.
Illegal triples are seductive precisely because they often look *better* than the real answer.

The other classic — and the reason this rung sits where it does in the ladder — is **forgetting to
sort**. The move rule is meaningless on unsorted data: "the sum is too low, so move `lo` right" is only
true if everything to the right is larger. Measured on `nums = [4,-9,5,-1,-2]`, `target = 9`, dropping
the sort returns `7` where the answer is `8`. It gets away with it on small inputs often enough to
pass a casual test, which is what makes it dangerous.

### Complexity and when to use this

**Time `O(n²)`** — `O(n log n)` to sort, then `n` anchors each running a linear inner scan, because
every iteration retires exactly one index. **Space `O(1)`** beyond the sorted copy: three indices and
`best`.

This is the answer to ship when the input might not contain an exact hit, and it is the version whose
argument you must be able to give. The next rung adds one line to it.

---

## Approach 5 — Two pointers with an early exit (optimal)

### The idea

*The sweep keeps grinding through every remaining pair even after finding a sum equal to the target —
and nothing can improve on a distance of zero.* Return the moment `s == target`. This fixes the
previous rung's only remaining waste: **it cannot recognise that it has already won.**

### How to think about it

> **Intuition.** You are hunting for the closest reading to a mark, and the needle lands exactly on
> it. There is no reading closer than *exact*, so the search is over — continuing is not caution, it is
> refusing to accept an answer you already hold. One comparison per step buys that recognition, and on
> the very common case where an exact triple exists it turns a full `O(n²)` sweep into an early exit.

Note what the early exit is **not**: it is not a pruning heuristic that might skip the right answer.
Distance `0` is the global minimum of the objective, so returning is provably correct, not merely
usually fine.

### Worked example

Sorted: `[-4, -1, 1, 2]`, `target = 1`.

| `i` (`nums[i]`) | `lo` (`nums[lo]`) | `hi` (`nums[hi]`) | `s` | `s == target`? | `best` after | move |
|---|---|---|---|---|---|---|
| 0 (−4) | 1 (−1) | 3 (2) | −3 | no | **−3** | `lo++` |
| 0 (−4) | 2 (1) | 3 (2) | −1 | no | **−1** | `lo++` |
| — | 3 | 3 | — | — | — | anchor −4 retired |
| 1 (−1) | 2 (1) | 3 (2) | 2 | no | **2** | `hi--` |
| — | 2 | 2 | — | — | — | anchor −1 retired |

Result **2**. ✅ On this input the early exit never fires — no triple hits `1` exactly — so the trace is
identical to approach 4, which is the point: **the extra line costs one comparison and changes
nothing when it does not apply.**

Change the target to `2` and the first row of the third anchor becomes `s = 2 == target`, and the
function returns on the spot with two fewer iterations. The script below includes that case.

### Code

```python
def three_sum_closest_early_exit(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            best = better(s, best, target)
            if s == target:                  # distance 0 is the global minimum: nothing can beat it
                return target
            if s < target:
                lo += 1
            else:
                hi -= 1
    return best
```

### Common mistake

> **Watch out.** Indenting the final `return best` **inside** the `for i` loop. The misconception is
> that the early-exit rung "returns as soon as it has an answer" — it returns as soon as it has a
> *perfect* answer, and `best` after one anchor is merely the best among the triples starting at
> `nums[0]`. Adding a return statement to a loop that already has one makes the misplacement very easy
> to write and very hard to see.

Measured on the worked example it returns `-1` instead of `2`: the first anchor `-4` yields `-1` as its
local best, and the winning triple lives under the *second* anchor. On `nums = [-5,-4,-3,-2]`,
`target = 1000` it returns `-10` where the answer is `-9`.

The much smaller sibling: returning `s` rather than `target` on the exact hit. They are equal at that
point, so it is correct — but writing `target` says *why* you are returning, and the code documents
its own stopping rule.

### Complexity and when to use this

**Time `O(n²)` worst case, often far less** — the sort is `O(n log n)`, the sweep is `n` anchors ×
linear inner scan, and the exit fires on the first exact hit. The worst case (no triple equals the
target) is unchanged and is stated analytically, not measured. **Space `O(1)`** beyond the sorted copy.

> **In an interview.** Ship this one. Open by naming the difference from 3Sum out loud — *"same
> engine, different stopping rule: there is no exact hit to skip past, so the pointers move by the
> sign of the difference and I track the best sum separately"* — because that sentence is what the
> question is testing. Have the exchange argument ready for "why is it safe to move only one pointer?"
> and be explicit that you are **not** skipping duplicate values, because the answer is a single
> integer rather than a set of triples. Expect the follow-up *"what if I wanted the triple, not the
> sum?"* — store the three indices alongside `best` inside `better`'s caller; nothing else changes.

---

## The Overall Arc

The principle every step here chases is *turn an unordered search into a directed one, then stop as
soon as the direction has nothing left to tell you*. The problem opens as pure enumeration: form every
triple, score it against the target, keep the best — correct, `O(n³)`, and utterly memoryless, since
each committee is scored from scratch and nothing learned about one informs the next. Sorting is the
first purchase, and it buys **direction**: with the values in order the innermost sums climb
monotonically, so the first one to reach the target is the last one worth looking at for that pair,
and the two sums bracketing the target become the only candidates — a real constant-factor win,
though a target that sits above everything never trips the break, so the cubic worst case survives.
Noticing that the bracket is what matters, rather than the walk to it, gives the next rung for free:
with the first two values fixed the ideal third is arithmetic, `target − nums[i] − nums[j]`, and a
sorted tail can be *searched* rather than walked, so each pair costs `log n` instead of `n` and the
worst case finally drops to `O(n² log n)`. But every one of those searches starts from scratch and
discards everything the previous one learned about where the tail sits relative to the target, which
is the waste the final engine removes: fix only the first value, put a pointer at each end of the
rest, and let the **sign of the miss** choose which end moves — too low and the left hand must come
in because everything left of it is smaller, too high and the right hand must, and either way one
index retires permanently, so an entire inner scan finishes in linear time and the whole thing is
quadratic with three integers of state. The last line is the cheapest and the most characteristic:
distance zero is the global minimum of the objective, so a sum equal to the target can be returned on
the spot, which is provably correct rather than merely usually fine. Two habits are worth carrying
away, and they are the reason this variant punishes pattern-matching so effectively. First, for every
*optimisation* problem — as opposed to every *find-the-exact-thing* problem — ask two questions before
writing a loop: what is the update rule for "best so far", and can an exact answer short-circuit it?
Here the answers are "closest wins, with a pinned tie-break" and "yes, at distance zero", and the whole
solution is those two answers wrapped around a pointer sweep. Second, when a problem looks like one
you know, find the sentence that differs before reusing the code — here it is the stopping rule, and
porting 3Sum's duplicate-skipping loop into it adds machinery that can only introduce bugs, because
this answer is one integer and not a set.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Every triple | `O(n³)` | `O(1)` | Needs no sort and no argument; scores every committee from scratch | The reference a fast version is stress-tested against, or the input must not be reordered |
| Sort, then prune | `O(n log n + n³)` worst case | `O(1)` | Buys a monotone inner loop, so the first sum reaching the target ends it — a constant-factor win, not a class change | Showing where sorting starts paying; never shipped |
| Binary search the third | `O(n² log n)` | `O(1)` | Computes the ideal third value and searches for it; restarts the search for every pair | The inner structure is sorted but an outer pointer sweep is unavailable |
| Two pointers | `O(n²)` | `O(1)` | One comparison retires one index for good, replacing the `log n` search with a single step | Shipping, when no exact hit is expected |
| Two pointers + early exit | `O(n²)` worst, often far less | `O(1)` | Adds one comparison per step to recognise distance `0` and stop | The default answer — the exact-hit case is common and costs nothing to detect |

---

## Interview Priority

**Know cold: the two-pointer sweep with the early exit.** It is the expected answer and it is short.
What must be automatic is the strict `while lo < hi` (equal pointers would use one position twice),
the seed being a real triple rather than `0` or an infinity, and the move rule being driven by the
**sign** of `s − target` with no exact-hit branch except the return.

**Know cold: how this differs from 3Sum.** Being able to state the three differences — no
duplicate-skipping, a separately tracked best, an early return instead of a recorded hit — is worth
more than the code, because the interviewer is watching to see whether you pattern-match or read. A
candidate who ports 3Sum's skip loops in and then debugs them has failed the actual test.

**Understand but do not drill: the cubic brute force, the pruned version, and the binary search.** The
brute force earns ten seconds as the reference and the price quote. The pruned version earns one
sentence — *"sorting makes the inner loop monotone, so the two sums bracketing the target are the only
candidates"* — because that sentence is what makes the two-pointer move rule obvious afterwards. The
binary search is worth recognising if an interviewer proposes it, and worth being able to say why the
pointer sweep beats it: it restarts for every pair rather than carrying what it learned.

---

## Full Runnable Script

All five approaches in one file. Two decisions are lifted to module scope because every rung shares
them: `seed_sum` (the first legal triple, safe because `3 <= n`) and `better` (the tie-break). Lifting
`better` is not tidiness — five approaches visit triples in five different orders, and they can only be
cross-checked if they break ties identically.

Tests cover all three of the statement's examples including the tie and the target below every
reachable sum, the smallest legal input (`n = 3`, one triple), all-duplicate values, duplicates where a
choice exists, an input where an exact hit exists so the early-exit rung actually fires, a target above
every reachable sum, an all-negative array, and 3000 random arrays checked against an
`itertools.combinations` reference.

There is **no no-valid-answer case**: `3 <= n` guarantees a triple always exists. The cubic rung is run
at reduced `n` in the stress test (`n <= 12`); its `n = 500` cost is stated analytically above.

```python
"""The Triple Nearest the Target - every approach in one file, cross-checked.

Tie-break: closest wins; equal distances go to the SMALLER sum. Every approach
uses the same rule, so five implementations that visit triples in five different
orders still have to produce the same number.

Run: python three_sum_closest.py
"""

from __future__ import annotations

import itertools
import random


def seed_sum(nums: list[int]) -> int:
    """The first legal triple. 3 <= n is promised, so this always exists."""
    return nums[0] + nums[1] + nums[2]


def better(candidate: int, best: int, target: int) -> int:
    """The one rule every rung shares: closest to `target` wins, ties go to the SMALLER sum.

    Lifted out because five approaches visit triples in five different orders,
    and they can only agree if they break ties identically.
    """
    d, bd = abs(candidate - target), abs(best - target)
    return candidate if (d < bd or (d == bd and candidate < best)) else best


def three_sum_closest_every_triple(nums: list[int], target: int) -> int:
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            for k in range(j + 1, n):
                s = nums[i] + nums[j] + nums[k]
                best = better(s, best, target)
    return best


def three_sum_closest_sort_then_prune(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            for k in range(j + 1, n):
                s = nums[i] + nums[j] + nums[k]
                best = better(s, best, target)
                if s >= target:       # sorted, so every later k only overshoots further
                    break
    return best


def three_sum_closest_binary_search(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        for j in range(i + 1, n - 1):
            want = target - nums[i] - nums[j]
            lo, hi = j + 1, n
            while lo < hi:                     # first index in the tail with nums[idx] >= want
                mid = (lo + hi) // 2
                if nums[mid] < want:
                    lo = mid + 1
                else:
                    hi = mid
            for k in (lo - 1, lo):             # the two entries straddling the ideal third value
                if j < k < n:
                    s = nums[i] + nums[j] + nums[k]
                    best = better(s, best, target)
    return best


def three_sum_closest_two_pointers(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            best = better(s, best, target)
            if s < target:        # the sign of the miss says which end to move
                lo += 1
            else:
                hi -= 1
    return best


def three_sum_closest_early_exit(nums: list[int], target: int) -> int:
    nums = sorted(nums)
    n = len(nums)
    best = seed_sum(nums)
    for i in range(n - 2):
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            best = better(s, best, target)
            if s == target:       # distance 0 cannot be improved on
                return target
            if s < target:
                lo += 1
            else:
                hi -= 1
    return best


def reference(nums: list[int], target: int) -> int:
    """Slow and obvious: every combination, same tie-break."""
    sums = [a + b + c for a, b, c in itertools.combinations(nums, 3)]
    return min(sums, key=lambda s: (abs(s - target), s))   # the same rule, expressed as a sort key


APPROACHES = [
    ("every triple", three_sum_closest_every_triple),
    ("sort + prune", three_sum_closest_sort_then_prune),
    ("binary search", three_sum_closest_binary_search),
    ("two pointers", three_sum_closest_two_pointers),
    ("early exit", three_sum_closest_early_exit),
]


def run_case(label: str, nums: list[int], target: int) -> bool:
    want = reference(list(nums), target)
    results = [(name, fn(list(nums), target)) for name, fn in APPROACHES]
    agree = all(got == want for _, got in results)
    print(label)
    print(f"  nums={nums}, target={target}   (reference answer {want})")
    for name, got in results:
        print(f"    {name:<14} -> {got}")
    print(f"    all agree with the reference: {agree}")
    return agree


def main() -> None:
    ok = True

    # The document's worked example, and the statement's first.
    ok &= run_case("worked example / statement 1", [-1, 2, 1, -4], 1)
    # The tie: -1 and 1 are both one away from 0, so the smaller sum wins.
    ok &= run_case("statement 2 - an exact tie", [-2, 0, 1, 3], 0)
    # Target far below every reachable sum: no pointer ever brackets anything.
    ok &= run_case("statement 3 - target below every sum", [1, 1, 1, 0], -100)

    # Smallest legal input: exactly three values, exactly one triple.
    ok &= run_case("smallest legal input (n = 3)", [4, -7, 2], 0)
    # Duplicates everywhere — legal, and the only triple is the answer.
    ok &= run_case("all duplicates", [0, 0, 0], 5)
    ok &= run_case("duplicates with a choice", [1, 1, 1, 1, 5], 7)

    # There is no "no answer" case: 3 <= n guarantees a triple always exists.
    # The nearest thing is an exact hit, which the early-exit rung returns from at once.
    ok &= run_case("an exact hit exists", [-1, 2, 1, -4], 2)
    # Target above every reachable sum: the mirror of statement 3.
    ok &= run_case("target above every sum", [-5, -4, -3, -2], 1000)
    # Negative values only.
    ok &= run_case("all negative", [-8, -6, -4, -2], -13)

    random.seed(11)
    bad = 0
    for _ in range(3000):
        n = random.randint(3, 12)          # small n: "every triple" is cubic, run it reduced
        nums = [random.randint(-12, 12) for _ in range(n)]
        target = random.randint(-20, 20)
        want = reference(list(nums), target)
        for name, fn in APPROACHES:
            got = fn(list(nums), target)
            if got != want:
                bad += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} nums={nums} target={target}: got {got}, want {want}")
    print(f"stress: 3000 random arrays (n <= 12, values -12..12), all five approaches, {bad} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()
```

### Output when run

```
worked example / statement 1
  nums=[-1, 2, 1, -4], target=1   (reference answer 2)
    every triple   -> 2
    sort + prune   -> 2
    binary search  -> 2
    two pointers   -> 2
    early exit     -> 2
    all agree with the reference: True
statement 2 - an exact tie
  nums=[-2, 0, 1, 3], target=0   (reference answer -1)
    every triple   -> -1
    sort + prune   -> -1
    binary search  -> -1
    two pointers   -> -1
    early exit     -> -1
    all agree with the reference: True
statement 3 - target below every sum
  nums=[1, 1, 1, 0], target=-100   (reference answer 2)
    every triple   -> 2
    sort + prune   -> 2
    binary search  -> 2
    two pointers   -> 2
    early exit     -> 2
    all agree with the reference: True
smallest legal input (n = 3)
  nums=[4, -7, 2], target=0   (reference answer -1)
    every triple   -> -1
    sort + prune   -> -1
    binary search  -> -1
    two pointers   -> -1
    early exit     -> -1
    all agree with the reference: True
all duplicates
  nums=[0, 0, 0], target=5   (reference answer 0)
    every triple   -> 0
    sort + prune   -> 0
    binary search  -> 0
    two pointers   -> 0
    early exit     -> 0
    all agree with the reference: True
duplicates with a choice
  nums=[1, 1, 1, 1, 5], target=7   (reference answer 7)
    every triple   -> 7
    sort + prune   -> 7
    binary search  -> 7
    two pointers   -> 7
    early exit     -> 7
    all agree with the reference: True
an exact hit exists
  nums=[-1, 2, 1, -4], target=2   (reference answer 2)
    every triple   -> 2
    sort + prune   -> 2
    binary search  -> 2
    two pointers   -> 2
    early exit     -> 2
    all agree with the reference: True
target above every sum
  nums=[-5, -4, -3, -2], target=1000   (reference answer -9)
    every triple   -> -9
    sort + prune   -> -9
    binary search  -> -9
    two pointers   -> -9
    early exit     -> -9
    all agree with the reference: True
all negative
  nums=[-8, -6, -4, -2], target=-13   (reference answer -14)
    every triple   -> -14
    sort + prune   -> -14
    binary search  -> -14
    two pointers   -> -14
    early exit     -> -14
    all agree with the reference: True
stress: 3000 random arrays (n <= 12, values -12..12), all five approaches, 0 disagreements

ALL APPROACHES AGREED ON EVERY CASE.
```
