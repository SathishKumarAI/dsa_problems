# Product of Everything Else — explained

## Understanding the Problem

You are given a list of whole numbers and asked to produce a new list of the same length. The number
you put in each slot is what you get by multiplying together *all the other* numbers in the original
list — everything except the one sitting in that slot. Two rules make it interesting: you are not
allowed to divide, and the whole thing has to run in time proportional to the length of the list, not
to its square.

**The core question:** for every position, what is the product of the whole list *minus one element*?
The naive approach is slow because it treats each of the n positions as an unrelated problem and
recomputes an almost-identical product from scratch each time — when in truth the product for
position 5 and the product for position 6 share nearly all of their factors.

The no-division rule looks arbitrary and is not. Division would let you compute the total product
once and divide it out at each position, which is one line and finished — except that it dies the
moment a zero appears, because you cannot divide by zero and the total is zero anyway. Banning
division forces you to find the *structure* in the problem instead of the shortcut, and the structure
is this: everything except position `i` splits cleanly into **everything to the left of `i`** and
**everything to the right of `i`**, two questions that never overlap.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `2 <= nums.length <= 10^5` | A hundred thousand elements makes the O(n²) version about 10¹⁰ multiplications — hopeless. **This is what rules brute force out.** The lower bound of 2 also means the "product of everything else" is never an empty product, so you never have to argue about what the answer for a single-element list should be. |
| `-30 <= nums[i] <= 30` | Values are small and may be negative or zero. Small values keep partial products from exploding for short arrays, and the negatives are a reminder that signs matter: an even number of negative factors flips back to positive. This bound does **not** unlock direct indexing, because the values here are never used as lookup keys — nothing is being searched for. |
| every answer is guaranteed to fit in a 32-bit integer | **This unlocks fixed-width arithmetic**: in Java or C++ you can keep every running product in a plain `int` rather than reaching for `long` or a big-integer type. There is one subtlety, covered in Approach 4: the running variable's *final* update in each pass can exceed 32 bits, but that value is never read. |
| division is off the table — which matters most precisely because the array may contain zeros | **This is what forces the prefix/suffix structure.** It is not an arbitrary handicap: with a zero in the array, division needs a separate counting-of-zeros special case to be correct at all, while a prefix/suffix sweep treats a zero exactly like any other number. |

One rung of the usual ladder has no analogue here, and it is worth saying why. There is no
"sort the input and search it" step, because the answer is *indexed by position* — slot `i` of the
output is about slot `i` of the input — and sorting destroys precisely that correspondence. Nor is
anything being searched for. This problem's ladder is instead about how much *partial work* you keep
around and reuse.

The worked example used in every section below is the statement's own:

```
nums = [1, 2, 3, 4]        answer: [24, 12, 8, 6]
```

Check it once by hand: position 0 gets 2·3·4 = 24, position 1 gets 1·3·4 = 12, position 2 gets
1·2·4 = 8, position 3 gets 1·2·3 = 6.

---

## Approach 1 — Brute force: multiply the others, once per position

### The idea

*How do I get the product of everything except one element?* Loop over the whole array and multiply
in every element whose position is not the one you are excluding. Do that once for each of the n
positions and you have the whole answer, with no cleverness and no risk of being wrong.

### How to think about it

Think of a shopping receipt and the question "what would the total be without item 3?". With no
memory of anything, you would re-add every other line from scratch. Then someone asks the same about
item 4, and you re-add every other line again — including all the same lines you just added, minus a
different one. That is the shape here, with multiplication instead of addition: n independent
traversals that each recompute an almost-identical product. The reasoning has no notion that the
answers are related to each other, and that missing relationship is the entire inefficiency.

### Worked example

`nums = [1, 2, 3, 4]`.

| excluded `i` | inner walk (`j`, skipping `j == i`) | running product | result |
|---|---|---|---|
| 0 | j=1 → ×2, j=2 → ×3, j=3 → ×4 | 1 → 2 → 6 → 24 | 24 |
| 1 | j=0 → ×1, j=2 → ×3, j=3 → ×4 | 1 → 1 → 3 → 12 | 12 |
| 2 | j=0 → ×1, j=1 → ×2, j=3 → ×4 | 1 → 1 → 2 → 8 | 8 |
| 3 | j=0 → ×1, j=1 → ×2, j=2 → ×3 | 1 → 1 → 2 → 6 | 6 |

Sixteen index visits, twelve multiplications, for four answers. Look at rows 0 and 1: both multiply
by 3 and by 4. Rows 2 and 3 both multiply by 1 and by 2. Every shared factor is computed twice or
more, and that redundancy is what the rest of this document removes.

### Code

```python
def product_except_self_brute_force(nums: list[int]) -> list[int]:
    out: list[int] = []
    for i in range(len(nums)):
        product = 1
        for j in range(len(nums)):
            if j != i:  # the only position skipped
                product *= nums[j]
        out.append(product)
    return out
```

### Common mistake

Initialising `product = 1` once, outside the outer loop, instead of once per position. The variable
then carries the previous position's product into the next one and every answer after the first is
garbage — on our example you would get `[24, 288, 2304, ...]`, growing without bound. It is easy to
write because the line *looks* like setup, and the fix is to see the inner loop as a complete,
self-contained calculation that must start from a clean slate every time. The multiplicative identity
is 1, not 0; initialising to 0 is the other version of this mistake and makes every answer zero.

### Complexity and when to use this

**Time O(n²), space O(1)** beyond the output. The cost comes from nesting: n positions, each doing a
full n-element walk, giving n² index visits. No storage is used other than the single `product`
accumulator, and the output array is not counted because the problem demands it.

Use it when n is a handful of elements, and — more usefully — as the reference implementation that
proves the fast versions right. That is exactly its job in the test suite below: it is so obviously a
transcription of the problem statement that if the linear version ever disagrees with it, the linear
version is what is broken.

---

## Approach 2 — Divide the total product (the instinctive move the problem bans)

### The idea

*Every answer is the total product with one factor removed — so why not compute the total once and
remove that factor?* Multiply everything together in one pass, then produce each answer by dividing
the total by that position's value. One pass to build, one pass to emit.

This fixes brute force's weakness — **it recomputes shared factors n times instead of computing the
whole product once** — and it is the approach almost everyone reaches for first. It is worth working
through properly rather than skipping, because *why* it is banned teaches the real lesson.

### How to think about it

One shared pot, made once. Everything goes in; to serve position `i`, you take the pot and take
`nums[i]` back out. The reasoning is a single global aggregate plus a cheap per-position adjustment,
which is exactly the right instinct — the whole ladder is about reusing shared work. The problem is
the *mechanism* of removal. Multiplication has an inverse, division, but that inverse has a hole in
it at zero: you cannot take a zero back out of a pot, because once a zero goes in, the pot tells you
nothing about what else is in there. So the moment a single zero exists, this idea must be patched
with a separate counting rule, and the patch is where it stops being a one-liner.

### Worked example

`nums = [1, 2, 3, 4]` — no zeros, so this is the easy path.

**Pass one, build the total:**

| step | value | running total |
|---|---|---|
| start | — | 1 |
| `nums[0]` | 1 | 1 |
| `nums[1]` | 2 | 2 |
| `nums[2]` | 3 | 6 |
| `nums[3]` | 4 | **24** |

**Pass two, divide it out:**

| `i` | `nums[i]` | `24 / nums[i]` |
|---|---|---|
| 0 | 1 | 24 |
| 1 | 2 | 12 |
| 2 | 3 | 8 |
| 3 | 4 | 6 |

Now the case the ban exists for. Take the statement's second example, `nums = [-1, 1, 0, -3, 3]`.
The total product is 0, and `0 / 0` at position 2 is not a number. The approach only survives by
counting zeros first: with **two or more** zeros every answer is 0; with **exactly one** zero, only
the zero's own slot gets the product of the non-zero values (here `-1 · 1 · -3 · 3 = 9`) and every
other slot gets 0; with **no** zeros, divide normally. That three-branch structure is the honest cost
of this approach.

### Code

```python
def product_except_self_division(nums: list[int]) -> list[int]:
    zeros = nums.count(0)
    if zeros > 1:  # two zeros leave a zero in every product
        return [0] * len(nums)
    product_of_nonzero = 1
    for x in nums:
        if x != 0:
            product_of_nonzero *= x
    if zeros == 1:  # only the zero's own slot survives
        return [product_of_nonzero if x == 0 else 0 for x in nums]
    return [product_of_nonzero // x for x in nums]  # exact: x divides the product
```

### Common mistake

Writing the obvious two-liner — total product, then `total // nums[i]` — and never handling zeros. It
passes `[1, 2, 3, 4]`, it passes every hand-written test you are likely to invent, and it raises
`ZeroDivisionError` (or in Java, throws `ArithmeticException`) on the first input containing a 0.
Worse is the half-fix of skipping zeros while building the total and then handing the zero's own
slot that same total: on `[-1, 1, 0, -3, 3]` the non-zero product is 9 and the output comes out
`[-9, 9, 9, -3, 3]` instead of `[0, 0, 9, 0, 0]` — right in exactly one slot, wrong in the other
four, and with no exception raised to tell you.

There is a second, quieter mistake even in the correct version above: using floating-point division
(`total / x` in Python) instead of integer division. With values that fit comfortably in a float it
looks fine, but a product of many 30s exceeds 2⁵³ where doubles stop representing every integer
exactly, and answers start coming back off by one. The division here is always exact — `x` is
literally one of the factors of the product — so integer division is both correct and safe.

### Complexity and when to use this

**Time O(n), space O(1)** beyond the output: two linear passes, one to build the total and one to
emit. On paper it ties the optimal approach. In practice it is disqualified twice over: the problem
forbids it outright, and integer division is several times slower than multiplication on real
hardware, so even where it is allowed it is not obviously faster than Approach 4.

Use it when division is permitted, zeros are impossible by construction, and you want the shortest
possible code — for instance, running products over a list of known-positive quantities such as
prices or weights. Name it in an interview, name its zero problem, and then move on; recognising why
the shortcut fails is what points at the structure the next two approaches exploit.

---

## Approach 3 — Two prefix arrays

### The idea

*If division is not available to remove one factor, can the product be built without that factor
ever going in?* Yes. The product of everything except position `i` is (everything strictly left of
`i`) × (everything strictly right of `i`). Build both of those as arrays of running products — one
sweep forward, one sweep backward — then multiply them together position by position.

This fixes Approach 2's weakness — **it needs an inverse operation that does not exist at zero** —
and it fixes brute force's weakness too, because each running product reuses the one before it
instead of starting over.

### How to think about it

Two people walk the array from opposite ends, each carrying a running total. The one starting on the
left writes down, at every position, the product of everything they have passed *so far but not
including where they are standing*. The one starting on the right does the mirror image. When they
are done, every position has two notes pinned to it: "everything before me" and "everything after
me". Multiply the two notes and you have "everything but me" — and notice that no factor was ever
removed, because the element at position `i` was never multiplied into either note in the first
place. That is the whole trick: exclusion by *never including*, rather than by dividing out.

This is the prefix-sum idea with multiplication swapped in for addition, and recognising it as such
is worth more than the solution itself.

### Worked example

`nums = [1, 2, 3, 4]`.

**Forward sweep** — `left[i]` = product of everything strictly before `i`. Start `left[0] = 1`, the
empty product, because nothing is before position 0:

| `i` | computed as | value |
|---|---|---|
| 0 | (nothing before it) | 1 |
| 1 | `left[0] × nums[0]` = 1 × 1 | 1 |
| 2 | `left[1] × nums[1]` = 1 × 2 | 2 |
| 3 | `left[2] × nums[2]` = 2 × 3 | 6 |

**Backward sweep** — `right[i]` = product of everything strictly after `i`. Start `right[3] = 1`:

| `i` | computed as | value |
|---|---|---|
| 3 | (nothing after it) | 1 |
| 2 | `right[3] × nums[3]` = 1 × 4 | 4 |
| 1 | `right[2] × nums[2]` = 4 × 3 | 12 |
| 0 | `right[1] × nums[1]` = 12 × 2 | 24 |

**Combine:**

| `i` | `left[i]` | `right[i]` | product |
|---|---|---|---|
| 0 | 1 | 24 | **24** |
| 1 | 1 | 12 | **12** |
| 2 | 2 | 4 | **8** |
| 3 | 6 | 1 | **6** |

Three passes, 2n stored numbers, and not a single division. Look at the `left` and `right` arrays
together: each is read exactly once, in the combining step. That observation is what the next
approach is built on.

### Code

```python
def product_except_self_two_prefix_arrays(nums: list[int]) -> list[int]:
    n = len(nums)
    left = [1] * n   # left[i] = product of everything strictly before i
    right = [1] * n  # right[i] = product of everything strictly after i
    for i in range(1, n):
        left[i] = left[i - 1] * nums[i - 1]
    for i in range(n - 2, -1, -1):
        right[i] = right[i + 1] * nums[i + 1]
    return [left[i] * right[i] for i in range(n)]
```

Note the two off-by-one details that carry the whole meaning: the forward loop multiplies in
`nums[i - 1]`, not `nums[i]`, and the backward loop multiplies in `nums[i + 1]`, not `nums[i]`. That
is what makes each array *strictly* exclusive of its own position.

### Common mistake

Writing `left[i] = left[i - 1] * nums[i]` — multiplying in the current element instead of the
previous one. The array now holds "everything up to and including me", so combining it with `right[i]` —
"everything strictly after me" — multiplies the *whole* array together at every position. On
`[1, 2, 3, 4]` it produces `[24, 24, 24, 24]`, and the fact that position 0 is right makes the bug
easy to miss. The fix is to state the invariant in words before writing the line:
*`left[i]` is the product of everything strictly before `i`* — and then notice that the last element
included is `nums[i - 1]`.

The mirror-image version of this mistake is looping `for i in range(n - 1, -1, -1)` in the backward
sweep and reading `right[i + 1]`, which on the first iteration indexes one past the end. In Python
that is an `IndexError` and you find out immediately; in C++ it is silent memory corruption. Both
sweeps must start one position *inside* the boundary, because the boundary slot is the empty product
and is already correct.

### Complexity and when to use this

**Time O(n), space O(n).** Three separate linear passes, each doing one multiplication per element,
so the time is linear with a small constant. The space is the two auxiliary arrays holding 2n numbers
— genuinely extra storage, not counted in the output — and that is the only thing separating this
from optimal.

Use it when clarity matters more than memory, which is more often than interview culture admits:
`left` and `right` are self-describing, the code reads exactly like the explanation, and 2n integers
is nothing at n = 10⁵. Use it also as the intermediate step in an interview — state it, show it is
linear, and then compress it, because the compression is easier to explain when the thing being
compressed is already on the board.

---

## Approach 4 — Prefix forward, suffix folded back in (optimal)

### The idea

*Both auxiliary arrays are written once and read once — does either of them need to exist?* No.
Write the left products directly into the output array, then sweep backward carrying the right
product in a single variable, multiplying it into what the output already holds. Each position gets
left × right without either half ever being stored separately.

This fixes Approach 3's weakness — **it keeps 2n numbers alive for the sole purpose of reading each
of them exactly once.**

### How to think about it

Same two walkers as before, but they no longer leave notes for each other. The first walker writes
its running product straight onto the answer sheet. The second walker comes back the other way and,
instead of writing a second note, multiplies its running product into what is already written there.
The answer sheet does double duty: on the way out it is a scratchpad holding the prefix, on the way
back it becomes the finished answer, one slot at a time. The key realisation is that the backward
walker only ever needs *one* number in hand — the running product of everything it has passed — and
never needs to look at what any other position's suffix was.

### Worked example

`nums = [1, 2, 3, 4]`.

**Forward sweep.** Write `running` into `out[i]` *first*, then fold `nums[i]` into `running`. That
order is what makes `out[i]` exclude its own element:

| `i` | `running` before | `out[i]` written | `running` after (× `nums[i]`) | `out` so far |
|---|---|---|---|---|
| 0 | 1 | 1 | 1 | `[1, 1, 1, 1]` |
| 1 | 1 | 1 | 2 | `[1, 1, 1, 1]` |
| 2 | 2 | 2 | 6 | `[1, 1, 2, 1]` |
| 3 | 6 | 6 | 24 | `[1, 1, 2, 6]` |

`out` now holds the prefix products `[1, 1, 2, 6]` — identical to the `left` array from Approach 3,
but stored nowhere extra. The final `running = 24` is never used again.

**Backward sweep.** Reset `running` to 1 and walk from the right, multiplying it into `out[i]` before
folding `nums[i]` in:

| `i` | `out[i]` before | `running` before | `out[i]` after (× `running`) | `running` after (× `nums[i]`) | `out` so far |
|---|---|---|---|---|---|
| 3 | 6 | 1 | **6** | 4 | `[1, 1, 2, 6]` |
| 2 | 2 | 4 | **8** | 12 | `[1, 1, 8, 6]` |
| 1 | 1 | 12 | **12** | 24 | `[1, 12, 8, 6]` |
| 0 | 1 | 24 | **24** | 24 | `[24, 12, 8, 6]` |

Two passes, one extra variable, no division, and the zero case needs no special handling — a zero is
folded into `running` like any other value and quietly makes every product it touches zero, which is
arithmetically correct rather than a special case.

### Code

```python
def product_except_self_prefix_suffix(nums: list[int]) -> list[int]:
    n = len(nums)
    out = [1] * n
    running = 1
    for i in range(n):
        out[i] = running     # written before nums[i] joins, so i excludes itself
        running *= nums[i]
    running = 1
    for i in range(n - 1, -1, -1):
        out[i] *= running    # folds the suffix into the prefix already stored
        running *= nums[i]
    return out
```

On the 32-bit guarantee: every value ever *read* here is either a prefix product (which is bounded by
one of the answers) or a finished answer, so all of them fit. The only value that can exceed 32 bits
is the very last update of `running` in each pass — the product of the entire array — and that
update is dead code, never read. In Java it silently wraps and does no harm; in C++ signed overflow
is formally undefined, so a strict implementation stops the loop one step early or uses `long long`.

### Common mistake

Swapping the two lines in either loop — folding `nums[i]` into `running` *before* writing or
multiplying:

```python
for i in range(n):
    running *= nums[i]   # WRONG — running now includes nums[i]
    out[i] = running
```

Now `out[i]` holds "everything up to and including me", and after the backward sweep every answer is
multiplied by its own element. On `[1, 2, 3, 4]` this yields `[24, 24, 24, 24]` — and note the first
entry is *correct*, which is exactly why the bug survives a casual glance at the output. The ordering
is not stylistic: writing before folding is the entire argument for why position `i` is excluded from
its own answer.

The second common mistake is forgetting to reset `running = 1` between the two sweeps. The backward
pass then starts from the full product of the array, and every answer comes out multiplied by that
total: `[1, 2, 3, 4]` yields `[576, 288, 192, 144]`, which is the correct answer times 24.

### Complexity and when to use this

**Time O(n), space O(1)** beyond the required output. Two passes, one multiplication and one
assignment per element per pass; the only storage is a single `running` accumulator, because the
output array — which the problem demands you return anyway — is reused as the prefix scratchpad. Two
linear passes is also the floor: every element influences n − 1 answers, so no correct algorithm can
read fewer than all of them.

**This is the one to memorize.** It is short, it is optimal in both time and space, it needs no
special case for zeros or negatives, and the pattern it teaches — *sweep prefixes forward, then fold
suffixes backward into the same array* — reappears in trapping rain water, in candy-distribution
problems, and in several interval and range-query problems. Learn the shape, not the lines.

---

## The Overall Arc

The banned operation is the whole teaching device: division is the obvious way to remove one factor
from a product, and taking it away forces you to look for the *structure* of the problem instead of
reaching for the shortcut. Brute force sees n unrelated questions and answers each with a full pass,
which is not only quadratic but blind — it never notices that the answer for position 5 and the
answer for position 6 differ by exactly two factors. The first instinct on noticing the shared work
is to compute the shared thing once: one grand total, then remove one factor per position, which is
genuinely linear and genuinely the right instinct, right up until a zero appears and the inverse
operation you were relying on stops existing — at which point the approach needs a three-branch
zero-counting patch and the elegance is gone. What the zero exposes is that "remove a factor" was
never the right frame. The right frame is *never put the factor in*: everything except position `i`
is everything to its left times everything to its right, two completely independent questions, each
of which is a running product that a single sweep can compute for every position at once. Build both
as arrays and the problem is solved in linear time with no division anywhere — and then you notice
that each of those two arrays is written once and read exactly once, which is the signature of
storage that does not need to exist. The output array is already being allocated, so let it carry the
prefix products on the way out, and let one scalar variable carry the suffix product on the way back,
folding into each slot as it passes. What is left is two passes, one extra integer, and a zero that
behaves like any other number because nothing is ever undone — only accumulated. The corner case to
rehearse out loud is exactly the one the division shortcut could not survive, and the pattern worth
carrying away is prefix-forward-then-fold-suffix-backward, which shows up far more often than this
one problem.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | O(n²) | O(1) | No reuse at all — every answer recomputes factors its neighbours already computed | n is tiny; as the test-suite oracle |
| Divide the total | O(n) | O(1) | Linear and short, but needs an inverse operation that fails at zero and a three-branch patch to be correct | Division is allowed and zeros are impossible by construction |
| Two prefix arrays | O(n) | O(n) | Buys total clarity with 2n numbers that are each read exactly once | Readability matters more than memory; as the step before compressing it |
| **Prefix + folded suffix** | **O(n)** | **O(1)** extra | **Reuses the output as scratch space; the order of write-then-fold is the whole correctness argument** | **The default answer for this problem** |

---

## Interview Priority

**Memorize cold — the prefix/folded-suffix version.** This is the expected answer and it is only
eight lines, but the lines are order-sensitive in a way that punishes half-memorisation. Drill the
invariant rather than the code: *`out[i]` holds everything before `i`, so write it before folding
`nums[i]` in*. If you can state that sentence you can rederive both loops, including the backward
one, under pressure.

**Memorize cold — the two-prefix-array version.** Not as a fallback but as the *explanation*. The
fastest way to present the optimal solution is to draw the `left` and `right` arrays, show that each
is read once, and then collapse them in front of the interviewer. Starting from the compressed
version and trying to justify it backwards is much harder, and it looks memorised rather than
understood.

**Understand but do not memorize — the division approach.** Thirty seconds of your answer, and
valuable ones: state it, state that it is linear, then state why the problem forbids it and what a
zero does to it. Naming the shortcut *and* its failure mode is what demonstrates you understand why
the constraint exists. Do not submit it — the statement rules it out explicitly, and doing it anyway
reads as not having read the question.

**Understand but do not memorize — brute force.** Ten seconds to name and reject on the 10⁵ bound.
Its real use is as the oracle in the test suite, where its obviousness is the entire point.

---

## Full Runnable Script

Every approach above, plus a test suite covering the statement's two examples (including the one with
a zero), the smallest legal input, two zeros, one zero at the minimum length, all-negative values,
repeated values, the extremes of the stated −30…30 range, and eleven randomised stress cases drawn
from that range with zeros deliberately over-represented — each one cross-checked against brute force
and against every other approach. (Python integers are arbitrary-precision, so the stress cases'
products are allowed to exceed 32 bits; the 32-bit guarantee matters for Java and C++, not here.)

```python
"""Product of Everything Else - every approach in one file, plus a self-checking test suite.

Run: python product_except_self_all.py
"""

from __future__ import annotations

import random


# --- 1. Brute force: multiply the others, once per position -------------------

def product_except_self_brute_force(nums: list[int]) -> list[int]:
    out: list[int] = []
    for i in range(len(nums)):
        product = 1
        for j in range(len(nums)):
            if j != i:  # the only position skipped
                product *= nums[j]
        out.append(product)
    return out


# --- 2. Divide the total product (banned by the statement; shown to be refuted)

def product_except_self_division(nums: list[int]) -> list[int]:
    zeros = nums.count(0)
    if zeros > 1:  # two zeros leave a zero in every product
        return [0] * len(nums)
    product_of_nonzero = 1
    for x in nums:
        if x != 0:
            product_of_nonzero *= x
    if zeros == 1:  # only the zero's own slot survives
        return [product_of_nonzero if x == 0 else 0 for x in nums]
    return [product_of_nonzero // x for x in nums]  # exact: x divides the product


# --- 3. Two prefix arrays -----------------------------------------------------

def product_except_self_two_prefix_arrays(nums: list[int]) -> list[int]:
    n = len(nums)
    left = [1] * n   # left[i] = product of everything strictly before i
    right = [1] * n  # right[i] = product of everything strictly after i
    for i in range(1, n):
        left[i] = left[i - 1] * nums[i - 1]
    for i in range(n - 2, -1, -1):
        right[i] = right[i + 1] * nums[i + 1]
    return [left[i] * right[i] for i in range(n)]


# --- 4. Prefix forward, suffix folded back in (optimal) ----------------------

def product_except_self_prefix_suffix(nums: list[int]) -> list[int]:
    n = len(nums)
    out = [1] * n
    running = 1
    for i in range(n):
        out[i] = running     # written before nums[i] joins, so i excludes itself
        running *= nums[i]
    running = 1
    for i in range(n - 1, -1, -1):
        out[i] *= running    # folds the suffix into the prefix already stored
        running *= nums[i]
    return out


APPROACHES = [
    ("brute_force", product_except_self_brute_force),
    ("division", product_except_self_division),
    ("two_prefix_arrays", product_except_self_two_prefix_arrays),
    ("prefix_suffix", product_except_self_prefix_suffix),
]


# --- test suite ---------------------------------------------------------------

def main() -> None:
    cases: list[tuple[str, list[int]]] = [
        ("statement example", [1, 2, 3, 4]),
        ("statement example with a zero", [-1, 1, 0, -3, 3]),
        ("smallest legal input", [2, 3]),
        ("two zeros", [0, 0]),
        ("one zero, minimal", [0, 5]),
        ("all negative", [-1, -2, -3]),
        ("ones only", [1, 1, 1, 1]),
        ("repeated values", [3, 3, 3]),
        ("bounds of the value range", [-30, 30, -30, 30]),
    ]

    rng = random.Random(20260912)
    for n in range(2, 13):
        # random values inside the stated -30..30 range, zeros deliberately likely
        cases.append((f"stress n={n}", [rng.choice([0] + list(range(-30, 31))) for _ in range(n)]))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums in cases:
        print(f"\n{label}: nums={nums}")
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums))
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        agreed = all(r == results[0] for r in results)
        if not agreed:
            all_agreed = False
            print("  DISAGREEMENT")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
