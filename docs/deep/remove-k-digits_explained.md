# Smallest Number After Removing k Digits — explained

## Understanding the Problem

You are handed a number written out as a string of digits and a budget `k`. Delete exactly `k` of
those digits — you may not reorder anything, only cross digits out — and the digits that survive,
read in their original order, form a new number. Make that number as small as you can.

Two things about this are worth saying before any algorithm, because together they are the whole
problem.

First, **the length of the answer is fixed**: you keep exactly `n − k` digits. So you are not
choosing *how many* digits to keep, only *which*. And when two numbers have the same number of
digits, comparing them numerically is the same as comparing them left to right, character by
character — which means **the leftmost position where you can improve matters more than everything
to its right combined**. That single sentence is the greedy.

Second, the answer is a **number**, not a string of the same length as your working buffer. Leading
zeroes have to go, which can make the answer *shorter* than `n − k` digits, and if nothing survives
at all the answer is `"0"` rather than the empty string.

**The core question:** which `k` digits should go? The naive approach is slow because it treats that
as a combinatorial choice — `C(n, k)` subsets, each to be built and compared — when almost all of
those subsets differ only in a prefix that one comparison between neighbouring digits settles.

> **Intuition.** A row of price tags on a rail, and you may take `k` of them off. The tag nearest
> the left is worth more than all the others together, because it is the most significant digit.
> So walk from the left, and the moment you see a tag whose neighbour to the right is **cheaper**,
> pull the expensive one off: you have just lowered the most significant position you were able to
> reach, and nothing you do further right can undo that.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `1 <= num.length <= 10^5` | A hundred thousand digits. `C(n, k)` is not merely slow, it is unrepresentable; even `O(n · k)` is 10¹⁰ at `k = n/2`. **This is the constraint that forces a single pass**, and it rules out three of the four approaches below as submissions. |
| `0 <= k <= num.length` | Both extremes are legal. `k = 0` means "return the number unchanged" and `k = n` means "delete everything", which the statement says is `"0"`. Neither deserves a special case if the main loop is written honestly — check that yours does not need one. |
| digits only, **no leading zeroes** in the input unless the number is `0` | The *input* is clean, so `num[0] != '0'` unless `num == "0"`. This is a trap disguised as a reassurance: it tempts you to think the output is clean too, and it is not. |
| removing every digit leaves `"0"`, not `""` | An explicit line in the constraints, which means it is an explicit test case. `"".join(stack)` on an empty stack is `""`, and `""` is not a number. |
| leading zeroes must be stripped, so `"10200"` with `k = 1` gives `"200"` | **This is the constraint that makes the output length variable.** You keep `n − k = 4` digits and return 3 of them. Any code that asserts `len(result) == n - k` is wrong. |

The worked example used in every section below is the statement's own:

```
num = "1432219", k = 3        answer: "1219"
```

Seven digits, delete three, keep four. The digits that survive are at indices 0, 3, 5 and 6 —
`1`, `2`, `1`, `9` — and the three that go are the `4`, the `3` and one of the `2`s. The statement's
other two examples are the ones that test the finishing touches: `"10200"` with `k = 1` gives
`"200"` (a leading zero stripped, so the answer is shorter than `n − k`), and `"10"` with `k = 2`
gives `"0"` (nothing survives).

---

## Approach 1 — Try every set of removals *(an addition — not in the data file)*

### The idea

*Which `k` digits should I delete?* Try every possible answer. Enumerate all `C(n, k)` ways to choose
which `n − k` digits to keep, build the number each one produces, and return the smallest. It cannot
be wrong, because it considers everything — and that is precisely its value here: it is the
**oracle** every rung below is checked against.

### How to think about it

> **Intuition.** Every subset of digits you could keep is one lottery ticket, and you are buying
> the whole draw. There is no cleverness and there is no risk. The cost is the size of the draw:
> `C(20, 10)` is already 184 756, and `C(100000, 50000)` is a number with more digits than the
> input has characters. What the enumeration does give you is a place to *look* for structure —
> print the best few tickets and the winners all share the same first digit, which is the hint the
> next rung follows.

### Worked example

`num = "1432219"`, `k = 3`. There are `C(7, 4) = 35` ways to keep four digits. A sample, sorted by
the number they produce:

| kept indices | digits kept | number | note |
|---|---|---|---|
| 0, 3, 5, 6 | `1`, `2`, `1`, `9` | **1219** | **the minimum** |
| 0, 4, 5, 6 | `1`, `2`, `1`, `9` | 1219 | same string, different indices — ties are normal |
| 0, 3, 4, 5 | `1`, `2`, `2`, `1` | 1221 | keeping both `2`s costs you |
| 0, 1, 2, 3 | `1`, `4`, `3`, `2` | 1432 | the untouched prefix — terrible |
| 3, 4, 5, 6 | `2`, `2`, `1`, `9` | 2219 | dropping the leading `1` is much worse |

Two things to read off this table. Every good candidate starts with the `1` at index 0 — the
leftmost digit dominates, exactly as the intuition claimed. And `1219` is reachable two different
ways, so the answer is a *value*, not a set of positions; any algorithm that tries to identify "the"
three digits to delete is answering a harder question than the one asked.

### Code

```python
from itertools import combinations

def remove_k_digits_brute_force(num: str, k: int) -> str:
    keep = len(num) - k
    best: int | None = None
    for kept in combinations(range(len(num)), keep):
        value = int("".join(num[i] for i in kept) or "0")  # "" when keep == 0
        if best is None or value < best:
            best = value
    return str(best) if best is not None else "0"
```

Comparing as **integers** is deliberate and is the subject of the mistake below. `int()` also does
the leading-zero stripping for free, which is why this rung needs no `lstrip` of its own.

### Common mistake

> **Watch out.** The misconception is that comparing equal-length digit strings lexicographically
> is the same as comparing them numerically — which is **true**, and is exactly why the bug slips
> through. It stops being true the moment you strip leading zeroes, because stripping changes the
> lengths, and `"1000" < "200"` as strings while `1000 > 200` as numbers.

Keeping the candidates as strings and taking `min()`:

```python
    best = min("".join(num[i] for i in kept).lstrip("0") or "0"
               for kept in combinations(range(len(num)), keep))   # WRONG once lengths differ
```

On the worked example this is invisible — it returns **"1219"**, because no candidate there has a
leading zero, so every candidate is four characters long and the two orderings coincide. Run it on
`num = "10200"` with `k = 1` and it returns **"1000"** instead of `"200"`: the five candidates strip
to `200`, `1200`, `1000`, `1020`, `1020`, and among *those* strings `"1000"` sorts first because `1`
precedes `2`. The correct answer, `200`, is numerically less than half of it.

The rule worth carrying past this problem: **lexicographic and numeric order agree only on
fixed-width strings.** Pad, or compare as numbers, or compare by `(len, string)` — but never by
string alone once a transformation can change the length.

### Complexity and when to use this

**Time** `O(C(n, k) · n)` — the binomial count times the cost of building and converting each
candidate. **Space** `O(n)` for one candidate at a time. At `n = 20, k = 10` that is about 3.7 million
character operations, which is instant; at the constraint's `n = 10⁵` it does not finish before the
heat death of anything.

Use it for exactly one thing: as the reference implementation in a test harness, which is its job at
the bottom of this document. Its correctness is visible by reading, and that is what you need to
cross-check a greedy — greedy algorithms are the family where a plausible-looking rule passes twenty
hand-written cases and fails on the twenty-first. In an interview, name it, name the exponential
blow-up, and move on in one sentence.

---

## Approach 2 — Choose the answer one digit at a time

### The idea

*If the leftmost digit dominates, can I just pick it first and never revisit it?* Yes. You need
`n − k` digits. For the first one, scan as far right as you can afford — far enough to still leave
`n − k − 1` digits behind you — and take the **smallest** digit in that window. Then repeat from just
after it for the second digit, and so on.

This fixes Approach 1's weakness — **it enumerates `C(n, k)` candidates that mostly agree on their
prefixes** — by committing to one digit per position and never backtracking. The exponential
collapses to a product.

### How to think about it

> **Intuition.** You are filling `n − k` slots left to right, and for each slot you get a *window*
> of digits you are allowed to reach into. The window's right edge is set by a reservation: if you
> still have three slots to fill after this one, you must leave at least three digits unspent, so
> you may not reach past position `n − 3`. Within that window, take the smallest digit there is —
> because this slot is more significant than every slot after it, so no later choice can compensate
> for a bigger digit here. The window bookkeeping is the fiddly part, and it is the only fiddly
> part.

> **Why it works.** The exchange argument, one slot at a time. Suppose the first slot's window is
> `num[start .. limit]` and `m` is the position of the smallest digit in it. Take any valid answer
> `A` that puts some other digit `num[p]` in this slot. If `num[p] > num[m]`, then swapping in
> `num[m]` gives a string that is **smaller at the first position where the two differ**, and since
> both have the same length, that makes it a smaller number — and the swap is legal, because `m`
> lies in the window, so enough digits remain to the right of `m` to fill the remaining slots. If
> `num[p] == num[m]` with `p > m`, choosing the earlier one is never worse: it leaves a *superset*
> of the suffix available for the remaining slots, so whatever `A` did afterwards is still
> available. Hence some optimal answer takes the leftmost smallest digit in the window, and the
> argument then recurses on the shortened problem.

### Worked example

`num = "1432219"`, `k = 3`, so `keep = 4`. For slot `s`, the window's right edge is
`limit = n − (keep − s)` — the last position from which `keep − s` digits (this one plus the rest)
still fit.

| slot | `start` | `limit` | window `num[start..limit]` | smallest in it | taken at | answer so far |
|---|---|---|---|---|---|---|
| 0 | 0 | 3 | `1 4 3 2` | `1` | index 0 | `1` |
| 1 | 1 | 4 | `4 3 2 2` | `2` | index **3** (the first of the two) | `12` |
| 2 | 4 | 5 | `2 1` | `1` | index 5 | `121` |
| 3 | 6 | 6 | `9` | `9` | index 6 | `1219` |

Answer `"1219"`. Look at slot 1: the window holds two `2`s, at indices 3 and 4, and the code takes
the **earlier** one. That is not a tie-break for tidiness — taking index 3 leaves indices 4, 5, 6
available for the remaining slots, while taking index 4 leaves only 5 and 6, which is still enough
here but is strictly less room. Preferring the earliest of equal digits is what the exchange
argument's second case above licences.

Now count the reads: 4 + 4 + 2 + 1 = 11 comparisons on a 7-digit input. The windows overlap, and the
overlap is the waste — slot 0 reads indices 0–3 and slot 1 reads 1–4, re-examining three digits it
has already seen.

### Code

```python
def remove_k_digits_pick_per_slot(num: str, k: int) -> str:
    keep = len(num) - k
    picked: list[str] = []
    start = 0
    for slot in range(keep):
        # reserve one position for each slot still unfilled after this one
        limit = len(num) - (keep - slot)
        best = start
        for j in range(start, limit + 1):
            if num[j] < num[best]:  # strict: ties keep the EARLIER index, leaving more room
                best = j
        picked.append(num[best])
        start = best + 1
    out = "".join(picked).lstrip("0")
    return out or "0"
```

`limit` is computed in one place and the strictness of the comparison is a single character — the two
decisions this approach owns, each editable without touching anything else.

### Common mistake

> **Watch out.** The misconception is that `limit` is an exclusive bound because most Python ranges
> are. It is the **last reachable index**, inclusive, so the loop is `range(start, limit + 1)`.
> Dropping the `+ 1` makes the last legal digit of every window unreachable, which is not an
> off-by-one in the output length — it is a *wrong digit choice* that still produces a
> correctly-sized answer.

Writing the window scan with an exclusive bound:

```python
        for j in range(start, limit):       # WRONG — limit is inclusive; this loses the last digit
```

On the worked example this returns **"1221"** instead of `"1219"`. Trace the divergence at slot 2:
the true window is `num[4..5] = "21"` and the smallest is the `1` at index 5, but the buggy range
stops at index 4 and can only see the `2`. So slot 2 takes `2`, giving `122`, and slot 3 is then
forced to take `num[5] = 1` — producing `1221`, a number that is bigger than the real answer while
looking entirely plausible.

The reason this is the mistake people make and not a typo is that the `limit` formula and the loop
bound are **two separate expressions of one idea**, sitting two lines apart. That is a design smell,
not just a bug risk: the next two approaches do not compute a window at all, and cannot have this
bug.

### Complexity and when to use this

**Time** `O(n · k)` in the worst case, **space** `O(n)`. The cost split is worth naming: there are
`n − k` slots, and each one scans a window of up to `k + 1` positions — so the product is
`(n − k)(k + 1)`, maximised around `k = n/2` at roughly `n²/4`. At `n = 10⁵` that is 2.5 billion
character comparisons, so **this does not pass**. Space is the output buffer.

Use it when `k` is tiny and you want the version whose correctness is easiest to state out loud —
"take the smallest digit you can still afford to reach" is a one-sentence justification, which is
worth something under interview pressure. Use it too when the rule is *not* the simple
digit-comparison one (say each digit has a weight, or the objective is not lexicographic), because
the per-slot scan generalises where the stack below does not.

---

## Approach 3 — Delete the first descent, `k` times *(an addition — not in the data file)*

### The idea

*Forget choosing what to keep — what is the best single digit to delete?* The one that starts the
first **descent**: the leftmost position `i` where `num[i] > num[i+1]`. Delete it, and you have
lowered the most significant position you could reach. Do that `k` times. If there is no descent
anywhere, the string is non-decreasing and the best single deletion is the **last** digit.

This fixes Approach 2's weakness — **the window arithmetic, which is where that version dies** — and
it replaces it with a rule that names the actual insight instead of hiding it inside a bound
computation. It is the same asymptotic cost, and it is the rung that makes the optimal solution
obvious.

### How to think about it

> **Intuition.** Compare two neighbouring choices: deleting position `p` versus deleting position
> `p + 1`. The two results are **identical everywhere except one place** — position `p`, which
> holds `num[p+1]` in the first and `num[p]` in the second. So deleting earlier is better exactly
> when `num[p] > num[p+1]`, worse when `num[p] < num[p+1]`, and indistinguishable when they are
> equal. Now start at `p = 0` and slide right: while the digits are non-decreasing, sliding right
> is never a loss, so keep sliding; at the first descent, stop, because one more step would be a
> loss. **The first descent is not a heuristic — it is the exact answer to "where should the one
> deletion go".**

> **Why it works.** The comparison above is the entire proof of one round, and it is an exchange
> argument with no slack in it: for a fixed `p`, `result(p)` and `result(p+1)` differ only at index
> `p`, so the ordering between them is decided by `num[p]` versus `num[p+1]` alone. Sliding right
> while `num[p] <= num[p+1]` therefore never makes things worse, and stopping at the first descent
> is optimal among all single deletions; when no descent exists the slide runs to the end and
> deletes the last digit, which is again optimal because every earlier deletion would raise some
> position. Repeating for `k` rounds is sound because each round's problem is the same problem on a
> shorter string: "delete `k − 1` more digits to minimise", and an optimal first move followed by
> an optimal continuation is optimal. (That greedy-stays-ahead step is the part you should say out
> loud; it is not automatic, and it holds here because the rounds are independent — the objective
> after a deletion depends only on the string that remains.)

### Worked example

`num = "1432219"`, `k = 3`. Each round scans from the front for the first descent.

| round | string | scan | first descent at | digit deleted | result |
|---|---|---|---|---|---|
| 1 | `1432219` | `1 <= 4` ok, then `4 > 3` | index 1 | `4` | `132219` |
| 2 | `132219` | `1 <= 3` ok, then `3 > 2` | index 1 | `3` | `12219` |
| 3 | `12219` | `1 <= 2`, `2 <= 2` ok, then `2 > 1` | index 2 | `2` | **`1219`** |

Answer `"1219"`. And the case that shows why "no descent" needs its own rule — `num = "12345"`,
`k = 2`:

| round | string | first descent | digit deleted | result |
|---|---|---|---|---|
| 1 | `12345` | none — non-decreasing throughout | the **last** digit, `5` | `1234` |
| 2 | `1234` | none | the **last** digit, `4` | **`123`** |

Both rounds delete from the end, because on a non-decreasing string there is nothing to the right
that is smaller, so the only way to shrink the number is to make it shorter. Hold on to that: it is
the second of the two details that finish Approach 4.

Now the cost. Round 1 scanned 2 positions, round 2 scanned 2, round 3 scanned 3 — cheap here because
the descents were near the front. On `"12345"` each round scanned the **whole** string. Every round
restarts from index 0, and that is the waste.

### Code

```python
def remove_k_digits_repeated_descent(num: str, k: int) -> str:
    s = num
    for _ in range(k):
        i = 0
        while i < len(s) - 1 and s[i] <= s[i + 1]:
            i += 1  # slide right while it is non-decreasing: moving later is never a loss
        s = s[:i] + s[i + 1:]  # i is the first descent, or the last index if there is none
    out = s.lstrip("0")
    return out or "0"
```

The `while` condition is the only decision in the function, and the slice is the only mutation. Note
that no branch exists for "no descent found": the loop's own bound leaves `i` at the last index,
which is exactly what that case wants.

### Common mistake

> **Watch out.** The misconception is that "there is no descent" means "there is nothing worth
> deleting". It means the opposite — there is nothing worth deleting *in the middle*, so the
> deletion must come off the **end**. A non-decreasing number cannot be improved by removing an
> interior digit, only by getting shorter.

Skipping the round when no descent is found:

```python
        if i == len(s) - 1:
            break              # WRONG — "no descent" means delete from the END, not stop
```

On the worked example this is invisible: every round finds a descent, so the guard never fires and it
returns **"1219"**. Run it on `num = "12345"` with `k = 2` and it returns **"12345"** — the input,
unchanged, with zero of the two required deletions performed, where the answer is `"123"`. The bug
also breaks the constraint's own case: `"10"` with `k = 2` deletes the `1` on round 1 (a real
descent) and then breaks on round 2, returning **"0"**… which happens to be right, for the wrong
reason. The rule is not "stop when nothing looks deletable", it is **"exactly `k` digits leave, and
if none of them can come from the middle then they come from the end."**

### Complexity and when to use this

**Time** `O(n · k)`, **space** `O(n)`. Each of the `k` rounds scans up to `n` positions and rebuilds the
string, so the product is `n · k` — the same class as Approach 2, and for the same reason: the work
done to place one digit is repeated for every digit. The string slicing makes it `O(n)` allocations
per round too, which is a real constant in practice. At `n = 10⁵` with `k = n/2` this does not pass.

Use it when `k` is 1 or 2 and clarity beats everything, and use it as the explanation of the next
rung — because the next rung is this exact rule with the re-scanning removed. In an interview, this
is the version to *describe* before you write the stack: "the best single deletion is the first
descent, and here is the two-line proof" is the sentence that makes the stack look inevitable rather
than magic.

---

## Approach 4 — One pass with a monotonic stack

### The idea

*Each round of Approach 3 restarts at index 0 — but does the prefix before the deletion ever change?*
No. Everything left of the deletion point was already non-decreasing and stays that way. So keep
that prefix on a **stack**, feed the digits in one at a time, and pop while the top of the stack is
larger than the incoming digit and budget remains. The stack *is* the prefix, and nothing is ever
re-scanned.

This fixes Approach 3's weakness — **`k` passes, each restarting from the front** — and collapses it
to one pass. Then two details finish it, and they are where almost every implementation dies:
leftover budget comes off the **end**, and leading zeroes must be stripped with an empty result
meaning `"0"`.

### How to think about it

> **Intuition.** A spike you push digits onto, keeping it **non-decreasing bottom to top**. A new
> digit arrives; while it is smaller than the digit on top and you can still afford a removal, the
> top comes off — because a bigger digit sitting to the left of a smaller one is exactly the descent
> Approach 3 was hunting, and popping it lowers the most significant position available. When
> nothing on top is larger, push and move on. Each digit is pushed once and popped at most once, so
> the whole thing is one sweep even though it looks like a nested loop. And at the end the spike is
> non-decreasing by construction — which is precisely what makes the two finishing steps simple.

> **Why it works.** Three separate claims; the third is the one most write-ups skip.
>
> **The pops are right.** A pop happens only when `stack[-1] > ch`, which is a descent in the string
> being built, and Approach 3's exchange argument says deleting the earlier, larger digit of a
> descent is optimal among single deletions. The stack performs those deletions in left-to-right
> order, which is the order Approach 3 performs them in.
>
> **Not re-scanning is right.** After a pop, the new top is compared again — so the loop keeps
> popping while descents remain — and once no descent remains at the top, none exists anywhere in
> the stack, because the stack was non-decreasing before the newcomer arrived. That invariant
> (**the stack is always non-decreasing**) is what licences starting each comparison from the top
> instead of from index 0.
>
> **Truncating the end is right.** If budget survives the scan, the stack is non-decreasing and must
> lose `r` more digits. Among all subsequences of length `L = len(stack) − r`, the **first `L`
> characters** are componentwise minimal: any subsequence picks indices `i₀ < i₁ < …`, with
> `iⱼ >= j`, and a non-decreasing string gives `stack[iⱼ] >= stack[j]`. So the prefix is at least as
> small in every position, hence smallest overall — and the `r` removals come off the end. That is
> why `"12345"` with `k = 2` is `"123"` and not `"345"`.

### Worked example

`num = "1432219"`, `k = 3`. Budget starts at 3.

| step | digit | pops (while top > digit and budget > 0) | budget after | stack after |
|---|---|---|---|---|
| 1 | `1` | — (stack empty) | 3 | `1` |
| 2 | `4` | `1 > 4`? no | 3 | `1 4` |
| 3 | `3` | **pop `4`** (`4 > 3`); then `1 > 3`? no | 2 | `1 3` |
| 4 | `2` | **pop `3`** (`3 > 2`); then `1 > 2`? no | 1 | `1 2` |
| 5 | `2` | `2 > 2`? no — equal is not a descent | 1 | `1 2 2` |
| 6 | `1` | **pop `2`** (`2 > 1`); budget now 0, stop | 0 | `1 2 1` |
| 7 | `9` | budget 0 — no pops possible | 0 | `1 2 1 9` |

Budget is spent, so there is no truncation. `"".join(stack) = "1219"`, no leading zero to strip,
answer **`"1219"`**.

Two rows deserve a second look. **Step 5**: the incoming `2` equals the top, and nothing is popped —
spending a removal to replace a digit with an identical one is pure waste, which is why the
comparison is `>` and not `>=`. **Step 6**: the budget runs out mid-pop, leaving `2 1` on the stack
in descending order. The final stack is *not* fully non-decreasing, and that is fine: the guarantee
is "non-decreasing as far as the budget allowed", and once budget is zero there is nothing further to
do.

Now the two finishing details, on the statement's other examples. `num = "10200"`, `k = 1`:

| step | digit | pops | budget after | stack after |
|---|---|---|---|---|
| 1 | `1` | — | 1 | `1` |
| 2 | `0` | **pop `1`** (`1 > 0`) | 0 | `0` |
| 3 | `2` | budget 0 | 0 | `0 2` |
| 4 | `0` | budget 0 | 0 | `0 2 0` |
| 5 | `0` | budget 0 | 0 | `0 2 0 0` |

The buffer is `"0200"` — four digits, as promised, and a leading zero. Stripping gives **`"200"`**,
three digits: shorter than `n − k`, and correct. And `num = "10"`, `k = 2`: step 1 pushes `1`, step 2
pops it for the `0`, leaving `"0"` with budget 1; the truncation loop then pops the `0` too, leaving
an empty buffer, and `"" or "0"` returns **`"0"`**.

### Code

```python
def remove_k_digits_monotonic_stack(num: str, k: int) -> str:
    stack: list[str] = []
    budget = k
    for ch in num:
        # invariant: the stack is non-decreasing for as far as the budget has allowed
        while budget > 0 and stack and stack[-1] > ch:
            stack.pop()
            budget -= 1
        stack.append(ch)
    while budget > 0 and stack:
        stack.pop()  # nothing descended, so the cheapest digits to lose are at the END
        budget -= 1
    out = "".join(stack).lstrip("0")
    return out or "0"  # everything removed, or all zeroes, is the number zero
```

Three separately-labelled stages, because they answer three separate questions: the loop spends
budget on descents, the second loop spends leftover budget off the end, and the last line converts a
digit buffer into a number. Change any one and the other two do not move — and each of the three has
its own named failure below.

### Common mistake

> **Watch out.** The misconception is that leftover removals are "the ones you did not get to", so
> they should come off the front where the biggest savings are. They should come off the **end**.
> Once the scan is over, the survivors are non-decreasing, and for a non-decreasing string the
> smallest subsequence of a given length is its own **prefix** — so you keep the front and truncate
> the tail.

Popping from the front instead:

```python
    while budget > 0 and stack:
        stack.pop(0)        # WRONG — removes the most significant digits
        budget -= 1
```

On the worked example this is **invisible**: budget reaches zero during the scan, the loop never
runs, and it returns `"1219"`. Run it on `num = "12345"` with `k = 2` and it returns **"345"**
instead of `"123"` — nearly three times the correct value, and a perfectly well-formed three-digit
answer. Run it on `"112"` with `k = 1` and it returns **"12"** instead of `"11"`. Both inputs are
non-decreasing, which is exactly when the truncation loop is the *only* thing doing any work, so the
bug is silent on every input with a descent in it and total on every input without one.

Two more failures live in the last line, and both are named in the constraints, which is your hint
that both are tested:

- **Forgetting `lstrip("0")`.** On `"10200"` with `k = 1` the buffer is `"0200"`, and returning it
  unstripped gives **"0200"** instead of `"200"`. It is not merely cosmetic: `"0200"` is not how a
  number is written, and a grader comparing strings marks it wrong.
- **Forgetting `or "0"`.** On `"10"` with `k = 2` everything is removed and `"".join([])` is the
  empty string, so the function returns **""** instead of `"0"`. An empty string is not a number;
  the constraints say so in as many words.

And one claim that turns out **not** to be a bug worth panicking about, but is a bug: writing `>=`
instead of `>` in the pop condition. It spends a removal to swap a digit for an identical one, so on
`"1432219"` with `k = 3` it still returns **"1219"** — invisible again — but on `"112"` with `k = 1`
it returns **"12"** instead of `"11"`, because the second `1` pops the first and the budget is gone
before the useful descent arrives. The principle: **a removal must buy a strictly smaller digit in
that position, or it has bought nothing.**

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n)`. The time is linear despite the nested `while`: every digit is pushed
exactly once and popped at most once, so across the whole run there are at most `n` pushes and `n`
pops — the inner loop is not a nested scan, it is each digit's single opportunity to leave. (That
amortised argument is asked about more often than the code is.) Space is the stack, up to `n` digits,
and it is genuinely needed: the decision to remove a digit depends on a digit that has not arrived
yet, so the kept prefix must be held somewhere revisable.

**This is the one to write.** It is the only rung that passes at `n = 10⁵`, it is one pass with no
window arithmetic, and its three stages map one-to-one onto the three things the problem asks for.
The assumptions it leans on are worth stating: the objective must be **lexicographic on a fixed
length** (so the leftmost improvable position dominates), and a removal's benefit must depend only on
the digits adjacent to it in the surviving string. Change the objective — weight the positions
unevenly, or ask for the smallest number *at most* some bound — and the exchange argument fails,
which is when Approach 2's per-slot scan becomes the right tool again.

---

## The Overall Arc

Every rung here chases one principle — **the leftmost position you can improve is worth more than
everything to its right combined** — and the reason that principle is even available is a
reformulation that happens before any code: you keep exactly `n − k` digits, so all the candidates
have the same length, and comparing same-length digit strings numerically is the same as comparing
them left to right. Brute force declines to use that and pays for it in the only currency it has,
enumerating `C(n, k)` subsets that mostly agree on their prefixes; its one real service is showing
you, in a sorted table of candidates, that every good answer starts with the same digit. The first
genuine idea reads that observation as a rule — fill the slots left to right, and for each one take
the smallest digit you can still afford to reach — and it is correct by a clean exchange argument,
but the "can still afford to reach" turns into a reservation calculation whose inclusive bound is the
single most common way this rung is written wrong. The next rung deletes the arithmetic by asking a
smaller question: not "what should I keep" but "where should one deletion go", and that question has
an exact two-line answer, because deleting at `p` and at `p + 1` produce strings that differ in
exactly one position, so sliding the deletion rightwards is a loss precisely at the first descent.
Repeating that `k` times is correct and needs no windows — and it exposes the last piece of waste,
which is that every round restarts its scan from the front even though the prefix left of the
deletion never changed. Hold that prefix on a stack and it never has to be re-read: push digits,
pop while the top is larger than the newcomer and budget remains, and the stack stays non-decreasing
by construction, which is what makes comparing against the top as good as scanning from index 0. One
pass, `O(n)`, and every digit enters once and leaves at most once. Then the two details that the
optimal version alone has to face, both of them consequences of the stack rather than accidents of
it: if budget survives the scan the survivors are non-decreasing, and a non-decreasing string's
smallest subsequence of a given length is its own prefix, so the leftover removals come off the
**end**; and the buffer is a string of digits, not a number, so leading zeroes are stripped and an
empty buffer means `"0"`. Enumerate everything, pick per slot with a window, delete the first descent
repeatedly, then do the same deletions in one sweep and finish the number properly — and the part
worth carrying is not the stack, it is the sentence that justifies it: removing a digit larger than
the one after it always lowers the number, because the more significant position improves.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Try every set of removals | `O(C(n, k) · n)` | `O(n)` | Considers everything, so it cannot be subtly wrong — and cannot be run | The oracle in a test harness; the only safe way to check a greedy |
| Choose one digit per slot | `O(n · k)` | `O(n)` | One-sentence justification, paid for with window arithmetic | Tiny `k`; or an objective the exchange argument below does not fit |
| Delete the first descent, `k` times | `O(n · k)` | `O(n)` | States the greedy rule explicitly, at the cost of `k` full re-scans | `k` is 1 or 2; and as the explanation you give before writing the stack |
| **Monotonic stack, one pass** | **`O(n)`** | **`O(n)`** | **Never re-scans, but you must handle leftover budget and leading zeroes yourself** | **The default answer, and the only rung that passes at `n = 10⁵`** |

---

## Interview Priority

> **In an interview.** Justify the greedy before you write it: *"all candidates have `n − k` digits,
> so it is a left-to-right comparison — and removing a digit that is larger than the digit after it
> always lowers the number, because the more significant position improves."* Then write the stack.
> Volunteer the two finishing details rather than waiting to be caught by them: **leftover budget
> comes off the end**, because the survivors are non-decreasing and a non-decreasing string's
> smallest subsequence of a given length is its prefix; and **leading zeroes are stripped, with an
> empty result meaning `"0"`**. The near-certain follow-up is *"that is a loop inside a loop — isn't
> it `O(n²)`?"*, and the answer is that every digit is pushed once and popped at most once, so both
> loops together do at most `2n` work.

**Memorize cold — the stack, all three stages.** The scan loop, the truncation loop, the strip-and-
default line. Most failures are not in the first stage; they are in forgetting that the other two
exist. Practise on `"12345"` with `k = 2` (only the truncation does anything — the answer is `"123"`,
and popping from the front gives `"345"`) and on `"10"` with `k = 2` (only the last line does
anything — the answer is `"0"`, and forgetting the default gives `""`).

**Memorize cold — the one-sentence greedy justification.** *Removing a digit larger than the one
after it always lowers the number, because the more significant position improves.* Say it out loud
before the code. A greedy stated without its justification reads as a memorised answer; the same
greedy with its exchange argument reads as a derivation — and this is the family of problem where
interviewers push hardest on *why*, because plausible-looking greedy rules are usually wrong.

**Worth understanding, not memorizing — delete the first descent, `k` times.** Not as a submission,
but as the proof. The comparison between deleting at `p` and at `p + 1` — two results differing in
exactly one position — is the cleanest statement of why the stack pops what it pops, and it is the
thing to draw on the whiteboard if you are asked to justify the greedy more rigorously.

**Worth understanding, not memorizing — the per-slot window scan.** Know it exists and know what it
survives: change the objective so the leftmost-position argument no longer dominates, and the stack's
justification collapses while "scan the reachable window and take the best" still applies. That is
the answer to "what if the digits had weights?"

**Not worth memorizing — brute force.** But say it, and say *why* you want it anyway: greedy
algorithms are the family where a wrong rule passes every case you thought of, so a `C(n, k)`
reference implementation and a random stress test is how you actually find out. Then reject it on the
`10^5` constraint and move on.

---

## Full Runnable Script

Every approach above, plus a test suite covering all three statement examples, `k = 0`, `k = n`, the
smallest legal input, a strictly non-decreasing input (where only the truncation stage does any
work), a strictly decreasing one, inputs full of zeroes and repeated digits, every `k` from `0` to
`n` for several strings, and 400 randomised stress cases at lengths up to 11 — every case
cross-checked against the brute-force oracle. The buggy variants whose specific wrong answers the
text quotes are then re-run so the document's numbers are measured rather than remembered.

```python
"""Smallest Number After Removing k Digits - every approach in one file, plus a self-checking suite.

Run: python remove_k_digits_all.py
"""

from __future__ import annotations

import random
from itertools import combinations

# --- 1. Try every set of removals (the oracle) --------------------------------

def remove_k_digits_brute_force(num: str, k: int) -> str:
    keep = len(num) - k
    best: int | None = None
    for kept in combinations(range(len(num)), keep):
        value = int("".join(num[i] for i in kept) or "0")  # "" when keep == 0
        if best is None or value < best:
            best = value
    return str(best) if best is not None else "0"

# --- 2. Choose the answer one digit at a time ---------------------------------

def remove_k_digits_pick_per_slot(num: str, k: int) -> str:
    keep = len(num) - k
    picked: list[str] = []
    start = 0
    for slot in range(keep):
        # reserve one position for each slot still unfilled after this one
        limit = len(num) - (keep - slot)
        best = start
        for j in range(start, limit + 1):
            if num[j] < num[best]:  # strict: ties keep the EARLIER index, leaving more room
                best = j
        picked.append(num[best])
        start = best + 1
    out = "".join(picked).lstrip("0")
    return out or "0"

# --- 3. Delete the first descent, k times -------------------------------------

def remove_k_digits_repeated_descent(num: str, k: int) -> str:
    s = num
    for _ in range(k):
        i = 0
        while i < len(s) - 1 and s[i] <= s[i + 1]:
            i += 1  # slide right while it is non-decreasing: moving later is never a loss
        s = s[:i] + s[i + 1:]  # i is the first descent, or the last index if there is none
    out = s.lstrip("0")
    return out or "0"

# --- 4. One pass with a monotonic stack (optimal) -----------------------------

def remove_k_digits_monotonic_stack(num: str, k: int) -> str:
    stack: list[str] = []
    budget = k
    for ch in num:
        # invariant: the stack is non-decreasing for as far as the budget has allowed
        while budget > 0 and stack and stack[-1] > ch:
            stack.pop()
            budget -= 1
        stack.append(ch)
    while budget > 0 and stack:
        stack.pop()  # nothing descended, so the cheapest digits to lose are at the END
        budget -= 1
    out = "".join(stack).lstrip("0")
    return out or "0"  # everything removed, or all zeroes, is the number zero

APPROACHES = [
    ("brute_force", remove_k_digits_brute_force),
    ("pick_per_slot", remove_k_digits_pick_per_slot),
    ("repeated_descent", remove_k_digits_repeated_descent),
    ("monotonic_stack", remove_k_digits_monotonic_stack),
]

# --- the buggy variants, kept ONLY so the document's quoted numbers stay honest

def _bug_brute_string_min(num: str, k: int) -> str:
    keep = len(num) - k
    return min(
        "".join(num[i] for i in kept).lstrip("0") or "0"
        for kept in combinations(range(len(num)), keep)
    )  # WRONG: lexicographic order once stripping has changed the lengths

def _bug_exclusive_window(num: str, k: int) -> str:
    keep = len(num) - k
    picked: list[str] = []
    start = 0
    for slot in range(keep):
        limit = len(num) - (keep - slot)
        best = start
        for j in range(start, limit):  # WRONG: limit is inclusive
            if num[j] < num[best]:
                best = j
        picked.append(num[best])
        start = best + 1
    out = "".join(picked).lstrip("0")
    return out or "0"

def _bug_break_when_no_descent(num: str, k: int) -> str:
    s = num
    for _ in range(k):
        i = 0
        while i < len(s) - 1 and s[i] <= s[i + 1]:
            i += 1
        if i == len(s) - 1:
            break  # WRONG: "no descent" means delete from the END, not stop
        s = s[:i] + s[i + 1:]
    out = s.lstrip("0")
    return out or "0"

def _bug_leftover_from_front(num: str, k: int) -> str:
    stack: list[str] = []
    budget = k
    for ch in num:
        while budget > 0 and stack and stack[-1] > ch:
            stack.pop()
            budget -= 1
        stack.append(ch)
    while budget > 0 and stack:
        stack.pop(0)  # WRONG: removes the most significant digits
        budget -= 1
    out = "".join(stack).lstrip("0")
    return out or "0"

def _bug_no_strip(num: str, k: int) -> str:
    stack: list[str] = []
    budget = k
    for ch in num:
        while budget > 0 and stack and stack[-1] > ch:
            stack.pop()
            budget -= 1
        stack.append(ch)
    while budget > 0 and stack:
        stack.pop()
        budget -= 1
    return "".join(stack)  # WRONG: no lstrip, and no "0" default

def _bug_pop_on_equal(num: str, k: int) -> str:
    stack: list[str] = []
    budget = k
    for ch in num:
        while budget > 0 and stack and stack[-1] >= ch:  # WRONG: spends budget on a tie
            stack.pop()
            budget -= 1
        stack.append(ch)
    while budget > 0 and stack:
        stack.pop()
        budget -= 1
    out = "".join(stack).lstrip("0")
    return out or "0"

def main() -> None:
    cases: list[tuple[str, str, int]] = [
        ("statement example 1", "1432219", 3),
        ("statement example 2, leading zero stripped", "10200", 1),
        ("statement example 3, everything removed", "10", 2),
        ("k = 0 changes nothing", "1432219", 0),
        ("k = n removes everything", "1432219", 7),
        ("smallest legal input, k = 0", "7", 0),
        ("smallest legal input, k = n", "7", 1),
        ("input is a lone zero", "0", 0),
        ("non-decreasing: only truncation works", "12345", 2),
        ("non-decreasing with a tie", "112", 1),
        ("strictly decreasing", "54321", 2),
        ("all the same digit", "77777", 3),
        ("all zeroes", "00000", 2),
        ("zeroes after the first digit", "100000", 1),
        ("zero appears mid-string", "112300456", 4),
        ("nine digits, budget one", "987654321", 1),
    ]
    for s in ("1432219", "10200", "112", "12345", "54321", "10001", "9081726354"):
        for k in range(len(s) + 1):
            cases.append((f"every k for {s}", s, k))

    rng = random.Random(20260912)
    for _ in range(400):
        n = rng.randint(1, 11)
        # mostly small alphabets, so ties and zeroes actually occur
        alphabet = rng.choice(["01", "012", "0123456789", "112", "9"])
        s = "".join(rng.choice(alphabet) for _ in range(n))
        cases.append((f"stress n={n}", s, rng.randint(0, n)))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True
    shown = 0

    for label, num, k in cases:
        verbose = shown < 10
        if verbose:
            shown += 1
            print(f'\n{label}: num="{num}" k={k}')
        results = []
        for name, fn in APPROACHES:
            got = fn(num, k)
            results.append(got)
            if verbose:
                print(f'  {name:<{width}} -> "{got}"')
        if any(r != results[0] for r in results):
            all_agreed = False
            print(f"  DISAGREEMENT on {label}: num={num} k={k} -> {results}")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches, all cross-checked against brute force.")

    # --- the numbers the document quotes, re-measured ---------------------------
    quoted = [
        ("brute force compared as strings, 1432219 k=3", _bug_brute_string_min("1432219", 3), "1219 (invisible)"),
        ("brute force compared as strings, 10200 k=1", _bug_brute_string_min("10200", 1), "1000"),
        ("exclusive window bound, 1432219 k=3", _bug_exclusive_window("1432219", 3), "1221"),
        ("break when no descent, 1432219 k=3", _bug_break_when_no_descent("1432219", 3), "1219 (invisible)"),
        ("break when no descent, 12345 k=2", _bug_break_when_no_descent("12345", 2), "12345"),
        ("break when no descent, 10 k=2", _bug_break_when_no_descent("10", 2), "0 (right for the wrong reason)"),
        ("leftover from the front, 1432219 k=3", _bug_leftover_from_front("1432219", 3), "1219 (invisible)"),
        ("leftover from the front, 12345 k=2", _bug_leftover_from_front("12345", 2), "345"),
        ("leftover from the front, 112 k=1", _bug_leftover_from_front("112", 1), "12"),
        ("no strip / no default, 10200 k=1", _bug_no_strip("10200", 1), "0200"),
        ("no strip / no default, 10 k=2", _bug_no_strip("10", 2), "(empty string)"),
        ("pop on equal (>=), 1432219 k=3", _bug_pop_on_equal("1432219", 3), "1219 (invisible)"),
        ("pop on equal (>=), 112 k=1", _bug_pop_on_equal("112", 1), "12 (the correct answer is 11)"),
    ]
    print("\nquoted numbers, re-measured:")
    for what, got, says in quoted:
        shown_got = f'"{got}"' if got else "(empty string)"
        print(f"  {what:<46} -> {shown_got:<12} document says {says}")

    print(
        "\nALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "\nMISMATCH: the approaches did NOT all agree."
    )

if __name__ == "__main__":
    main()
```
