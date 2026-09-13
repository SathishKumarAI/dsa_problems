# Pair With Target Sum — explained

## Understanding the Problem

You are handed a list of whole numbers and one more number called the **target**. Somewhere in that
list there are two different slots whose numbers add up to the target. Your job is to hand back
*where they are* — the two positions — not the numbers themselves. You are promised that exactly one
such couple exists, so you never have to choose between two right answers, and you are told the two
slots must be different slots: a number cannot be added to itself.

**The core question:** for each number in the list, is its missing partner — the amount still needed
to reach the target — anywhere else in the list? The naive approach is slow because it answers that
question by *re-reading the whole list* every single time it asks, so the work grows with the square
of the list's length.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `2 <= nums.length <= 10^4` | Small enough that an O(n²) brute force (10⁸ comparisons at worst) is merely slow, not impossible — but big enough that an interviewer will not accept it. Also: there are always at least two elements, so you never handle an empty list. |
| `-10^9 <= nums[i] <= 10^9` | Values may be negative and may be enormous. **This is the constraint that forbids the last rung**: you cannot make an array with one slot per possible value, because that array would need two billion slots. It also means `target - x` can be any integer at all, so a lookup structure has to cope with arbitrary keys — which is exactly what a hash map does and a plain array does not. |
| `-10^9 <= target <= 10^9` | Same story on the target side. In Python integers never overflow, but in Java or C++ `nums[i] + nums[j]` of two billion-scale values overflows a 32-bit `int` — compute `target - nums[i]` instead of comparing sums, and the problem disappears. |
| exactly one valid pair exists | **This unlocks early return.** The moment you find a pair you may stop; there is nothing left to discover. Every approach below exploits it. It also means no approach has to break ties or prefer one answer over another. |
| an element may not be paired with itself | **This is the constraint that shapes the hash-map code.** It is the reason the one-pass version asks its question *before* inserting the current value, and the reason the two-pass version needs an explicit `j != i` guard. |

Note also what is *absent*: nothing says the values are distinct, and nothing says the list is
sorted. `[2, 2]` with target `4` is legal, and any approach that quietly assumes distinct values
will get it wrong.

The worked example used in every section below is the statement's own:

```
nums = [3, 6, 1, 5], target = 8        answer: [0, 3]   (3 + 5 = 8)
```

---

## Approach 1 — Brute force: try every pair

### The idea

*How do I know whether any two numbers add to the target?* Look at every possible couple and add
them up. There are only so many couples, and checking one is a single addition, so the answer is
guaranteed to turn up if it exists.

### How to think about it

Picture a small dinner party where you must find the two guests whose ages sum to 80. With no other
information, you walk up to guest 1 and ask guest 2, then guest 3, then guest 4 — then you go back
and start over from guest 2 and ask everyone after them. You never ask the same couple twice,
because once you have asked guest 1 about guest 3 there is no point asking guest 3 about guest 1.
That is the shape of the whole method: an outer walk that picks a person, an inner walk that picks
their partner from everyone still to their right. The reasoning has no memory — each question is
answered from scratch — and that lack of memory is the entire inefficiency.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`.

| outer `i` | `nums[i]` | inner `j` | `nums[j]` | sum | verdict |
|---|---|---|---|---|---|
| 0 | 3 | 1 | 6 | 9 | not 8 |
| 0 | 3 | 2 | 1 | 4 | not 8 |
| 0 | 3 | 3 | 5 | **8** | **match — return `[0, 3]`** |

Three additions on this input. But notice what would have happened had the answer been the last
couple, `[2, 3]`: the loop would have made all six additions. Six is 4·3/2 — the number of couples in
a group of four — and that formula is where the O(n²) comes from.

### Code

```python
def pair_sum_brute_force(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):  # j starts past i, so nothing pairs with itself
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
```

### Common mistake

Writing the inner loop as `for j in range(len(nums))` instead of `range(i + 1, len(nums))`. It looks
harmless — you are just checking more couples — but when `j` reaches `i` you are testing
`nums[i] + nums[i]`, which pairs an element with itself. Given `nums = [4, 1, 9]` and `target = 8`
that returns `[0, 0]`: a wrong answer that satisfies the arithmetic but violates the "two distinct
elements" rule. Starting `j` at `i + 1` fixes it *and* halves the work, because it also stops you
re-checking the couple `(3, 1)` after already checking `(1, 3)`.

### Complexity and when to use this

**Time O(n²), space O(1).** The cost comes from the nested walk: for each of n starting positions
the inner loop scans the remaining tail, giving roughly n²/2 additions. The space is constant
because nothing is stored — the only memory is two loop counters.

Use it when n is genuinely tiny (a handful of elements), when you are writing the reference
implementation that a faster version will be tested against (that is exactly its job in the test
suite at the bottom of this document), or as the first thirty seconds of an interview answer. Say
it out loud, name its cost, and then improve on it — starting from brute force is not a weakness,
failing to leave it is.

---

## Approach 2 — Sort, then binary search for each partner

### The idea

*The brute force re-scans the tail linearly for every element — can that scan be made faster?* Yes:
a linear scan is slow only because the data is unordered. Sort the values once, and then finding a
specific partner is a binary search instead of a walk, which turns each of the n searches from n
steps into about log n steps.

This fixes brute force's central weakness — **the inner loop reads every remaining element even
though it is looking for one specific number.**

### How to think about it

Think of an unsorted list as a pile of loose index cards and a sorted list as a filing cabinet. To
find one card in the pile you must look at all of them; to find one in the cabinet you open it
halfway, see whether you overshot, and throw away half the cabinet with a single glance. Sorting is
the cost of *building* the cabinet — you pay it once — and every lookup afterwards is cheap. The
catch, and it is the reason this rung is not the destination, is that filing the cards destroys the
information you were asked for: the answer is a pair of *original positions*, and once you sort, the
positions have moved. So you file index cards that carry their original slot number written on the
back, and pay for that bookkeeping too.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`.

Build the cabinet first — a list of positions ordered by the value they hold:

```
order  = [2, 0, 3, 1]        (position 2 holds 1, position 0 holds 3, …)
values = [1, 3, 5, 6]        the values in that order
```

Now for each position in the sorted list, binary-search for the partner **to its right only** (never
to its left, so no element can find itself, and every couple is considered exactly once):

| `p` | `values[p]` | needed | binary search over `values[p+1:]` | result |
|---|---|---|---|---|
| 0 | 1 | 8 − 1 = 7 | search `[3, 5, 6]` for 7 → lands past the end | not found |
| 1 | 3 | 8 − 3 = 5 | search `[5, 6]` for 5 → lands on position 2, and `values[2] == 5` | **found** |

Position 1 in the sorted order is `order[1] = 0`; position 2 is `order[2] = 3`. The answer in the
original numbering is `[0, 3]`.

### Code

```python
from bisect import bisect_left


def pair_sum_sort_binary_search(nums: list[int], target: int) -> list[int]:
    order = sorted(range(len(nums)), key=lambda k: nums[k])  # positions, ordered by value
    values = [nums[k] for k in order]
    for p in range(len(values)):
        need = target - values[p]
        q = bisect_left(values, need, p + 1)  # search only to the right of p
        if q < len(values) and values[q] == need:
            return sorted([order[p], order[q]])
    return []
```

### Common mistake

Searching the *whole* sorted array for the partner instead of only the part to the right of `p`. On
`nums = [4, 1, 9]` with `target = 8`, position `p` holding 4 searches for 4, finds itself, and
returns a pair of identical positions. People usually patch this by adding `if q != p`, which is
worse than it looks: on `nums = [4, 4, 1]` with `target = 8` the search for 4 lands on the *first*
4, and if `p` happens to be that same first 4 the guard rejects a pair that genuinely exists at the
second 4. Restricting the search window to `p + 1` onward is both the simpler fix and the correct
one — it makes self-pairing structurally impossible rather than filtering it out afterwards.

### Complexity and when to use this

**Time O(n log n), space O(n).** The two costs are worth separating, because that separation is the
whole lesson of this rung: **restructuring** (the sort) is O(n log n), and the **searching** is n
binary searches at O(log n) each, which is also O(n log n). Neither half is linear, so improving
only one of them would not help. The space is O(n) for the `order` and `values` arrays — the price
of carrying the original positions through the sort.

Use it when the array **arrives already sorted**, because then the restructuring cost vanishes and
only the O(n log n) search half remains — or better, use Approach 3, which drops to O(n) on sorted
input. Use it also when you must answer many different targets against the same array: the cabinet
is built once and every later query costs only O(n log n) — or O(log n) per lookup if you already
know which element you are standing on.

---

## Approach 3 — Sort, then converge two pointers

### The idea

*Once the values are sorted, is a binary search per element still more work than necessary?* It is.
After sorting, the sum of the smallest and the largest value tells you which end is wrong: if the
sum is too small only a bigger small-end can help, and if it is too large only a smaller large-end
can. So each comparison eliminates an entire element, and one sweep replaces all n binary searches.

This fixes Approach 2's weakness — **each binary search throws away everything it learned and starts
over from the middle of the array.**

### How to think about it

Two fingers, one on each end of a sorted row of numbers, moving toward each other. The left finger
can only ever make the total bigger; the right finger can only ever make it smaller. Ask for the
current total: if it undershoots the target, the left finger must advance — the number it is on now
is too small to be part of any surviving pair, because it is already paired with the largest number
available. If it overshoots, the right finger must retreat, for the mirror-image reason. Every step
permanently discards one number, so the fingers meet after at most n steps. The reasoning is
*directional*: sorting is what buys you the guarantee that moving a finger always moves the total in
a known direction.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`. The same sorted cabinet as before:

```
order  = [2, 0, 3, 1]
values = [1, 3, 5, 6]
          ^        ^
          i        j
```

| step | `i` | `j` | values | sum | vs target 8 | action |
|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 1 + 6 | 7 | too small | 1 can never reach 8 even with the biggest partner — advance `i` |
| 2 | 1 | 3 | 3 + 6 | 9 | too large | 6 is too big for anything left — retreat `j` |
| 3 | 1 | 2 | 3 + 5 | **8** | exact | stop |

The fingers rest on sorted positions 1 and 2, which are original positions `order[1] = 0` and
`order[2] = 3`. Sorted ascending, the answer is `[0, 3]`.

### Code

```python
def pair_sum_sort_two_pointers(nums: list[int], target: int) -> list[int]:
    order = sorted(range(len(nums)), key=lambda k: nums[k])
    i, j = 0, len(nums) - 1
    while i < j:
        total = nums[order[i]] + nums[order[j]]
        if total == target:
            return sorted([order[i], order[j]])  # sorted order != original order
        if total < target:
            i += 1
        else:
            j -= 1
    return []
```

### Common mistake

Sorting the values and forgetting that the answer is expressed in the *original* positions. Code
that sorts `nums` in place and then returns `[i, j]` — the pointer positions — returns the position
of the answer inside the sorted copy, which in general is a different pair of numbers entirely. On
our example it would return `[1, 2]` instead of `[0, 3]`. Sorting an array of positions, as above,
keeps the mapping. The second half of the same mistake is forgetting to put the two returned
positions back in ascending order: the small *value* is not necessarily at the small *position*.

### Complexity and when to use this

**Time O(n log n), space O(n).** Split the cost again: restructuring is O(n log n) for the sort;
searching is O(n) for the single converging sweep, because each iteration retires one element. The
search half is now optimal and the sort is the only thing standing between you and linear time.
Space is O(n) for the position array — with the caveat that if you are allowed to sort the values in
place and only need to report the *values* rather than their positions, this becomes O(1) extra
space and is then the most memory-frugal correct approach available.

Use it when the input is already sorted (the whole method collapses to a single O(n) pass with O(1)
extra space), when memory is the scarce resource rather than time, or when the problem grows into
three-sum or four-sum — there the converging sweep is the inner engine and the hash map is not.

---

## Approach 4 — Hash map, two passes

### The idea

*The sort exists only to make searching fast — but is order what the question actually needs?* No.
The question is "is the number `target - x` present, and where?", which is pure lookup, not
comparison. Record every value's position in a hash map first, then walk the array a second time
asking the map for each partner.

This fixes Approach 3's weakness — **it pays O(n log n) to impose an ordering that the question
never asked for.**

### How to think about it

A hash map is a cloakroom. You hand over a value and get back the ticket number where it was
stored, in one step, no searching and no ordering. Building the cloakroom is one pass over the
array; collecting from it is a second pass. Because the two passes are separate, at the moment you
ask the cloakroom a question it already contains *every* value in the array — including the very
element you are standing on. That is the single subtlety of this rung, and it is what the next rung
removes.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`.

**Pass one** builds value → position, later occurrences overwriting earlier ones:

| after reading | map contents |
|---|---|
| `nums[0] = 3` | `{3: 0}` |
| `nums[1] = 6` | `{3: 0, 6: 1}` |
| `nums[2] = 1` | `{3: 0, 6: 1, 1: 2}` |
| `nums[3] = 5` | `{3: 0, 6: 1, 1: 2, 5: 3}` |

**Pass two** asks for each partner:

| `i` | `nums[i]` | needed | map lookup | `j != i`? | result |
|---|---|---|---|---|---|
| 0 | 3 | 5 | found at 3 | 3 ≠ 0 ✓ | **return `[0, 3]`** |

### Code

```python
def pair_sum_two_pass_hash(nums: list[int], target: int) -> list[int]:
    index_of: dict[int, int] = {x: i for i, x in enumerate(nums)}  # a later duplicate overwrites
    for i, x in enumerate(nums):
        j = index_of.get(target - x, -1)
        if j != -1 and j != i:  # the guard that stops x from being its own partner
            return sorted([i, j])
    return []
```

### Common mistake

Omitting the `j != i` guard. With `nums = [3, 6, 1, 5]` and `target = 6`, standing on the 3 you look
up `6 - 3 = 3`, the map says position 0, and you return `[0, 0]` — one element used twice. The guard
is unavoidable in the two-pass shape because the map is complete before you start asking.

The second, subtler mistake is worrying that the "later occurrence overwrites earlier" behaviour
breaks duplicates, and adding a list of positions per value to compensate. It does not break them,
and the extra structure is wasted: with `nums = [2, 2]` and `target = 4`, the map is `{2: 1}`;
standing at `i = 0` you look up 2, get position 1, and `1 != 0` passes — `[0, 1]`. Overwriting is
precisely what makes the duplicate case work, because it guarantees the stored position is the
*other* one when you are standing on the first.

### Complexity and when to use this

**Time O(n), space O(n).** Time is two independent walks of n elements, each doing one hash
operation that costs O(1) on average — no nesting anywhere, so the total is linear. Space is the map
holding up to n entries. Hash operations are O(1) *expected*; a pathological set of keys can degrade
to O(n) per lookup, which is why the worst case is technically O(n²) and why cryptographic-grade
adversarial inputs are a real (if rare) concern in contest settings.

Use it when the problem changes so that you cannot decide at insert time — for instance, if you must
report *all* pairs rather than the first, or if the map must be prepared in advance and queried many
times. For the problem exactly as stated, Approach 5 does the same work in one pass and needs no
guard, so this rung is best understood as the stepping stone that makes the next one obvious.

---

## Approach 5 — Hash map, one pass (optimal)

### The idea

*If the map is only ever asked about values that came earlier, why put the later ones in it at all?*
Build the map as you go, and ask before you insert. When you stand on element `i`, the map holds
exactly the elements before `i` — so a hit is guaranteed to be a different element, and the pair is
found the first time either of its members is reached.

This fixes Approach 4's weakness — **the map contains the element you are standing on, forcing an
explicit self-pairing guard and a second pass over the array.**

### How to think about it

You are walking down a corridor of numbered doors, writing every number you pass onto a notepad
alongside its door number. At each door you ask one question: *have I already written down the
amount I still need?* If yes, the two doors are the answer and you stop walking. If no, you add this
door's number to the notepad and take one more step. The notepad only ever contains the past, which
is why "did I see it?" and "is it a different element?" become the same question — the ordering of
ask-then-write is doing the work that a guard did before. Nothing is ever revisited and nothing is
ever sorted; each element is touched exactly once.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`.

| `i` | `nums[i]` | needed = `8 - nums[i]` | is it in `seen`? | action | `seen` after |
|---|---|---|---|---|---|
| 0 | 3 | 5 | `seen` is empty — no | record 3 | `{3: 0}` |
| 1 | 6 | 2 | no | record 6 | `{3: 0, 6: 1}` |
| 2 | 1 | 7 | no | record 1 | `{3: 0, 6: 1, 1: 2}` |
| 3 | 5 | 3 | **yes, at position 0** | return `[0, 3]` | — |

Four lookups and three insertions, and the 5 is never written to the map at all — the walk ends the
moment the question is answered. Compare this with the two-pass version, which wrote all four values
before asking anything.

### Code

```python
def pair_sum_one_pass_hash(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:  # asked before inserting, so i is never matched against itself
            return [seen[target - x], i]
        seen[x] = i
    return []
```

Note the return order: `seen[target - x]` is an earlier position than `i` by construction, so the
result is already ascending and needs no sorting.

### Common mistake

Inserting before asking:

```python
seen[x] = i
if target - x in seen:          # WRONG — the map now contains x itself
    return [seen[target - x], i]
```

This breaks exactly when `target == 2 * x`. On `nums = [3, 6, 1, 5]` with `target = 6`, the first
iteration writes `{3: 0}`, then looks up `6 - 3 = 3`, finds position 0, and returns `[0, 0]`. The
bug is invisible on any input where the target is odd or where no element is exactly half the
target, which is what makes it such a reliable interview trap: it passes the example in the problem
statement and fails on the first hidden test with a self-doubling value. The order of the two lines
is not stylistic — it is the correctness argument.

### Complexity and when to use this

**Time O(n), space O(n).** One walk, and each step is one hash lookup plus at most one hash
insertion — both O(1) on average — so the total is linear in the number of elements. The map is the
space cost: in the worst case (no pair until the very end) it holds n − 1 entries. There is no way
to do better than O(n) time here, because any correct algorithm must at minimum look at every
element: skip one and the adversary hides half the answer there.

**This is the one to memorize.** It is the shortest correct solution, it needs no guard, no sort and
no second pass, it handles duplicates and negatives without special cases, and its shape —
*transform the pair question into a membership question about the past* — is the engine behind
subarray-sum-equals-k, longest-consecutive-run and a dozen other problems. Prefer a different rung
only when memory is scarcer than time, or when the array is already sorted.

---

## Approach 6 — Direct indexing when the values are small and bounded

### The idea

*A hash map is a general tool for arbitrary keys — but what if the keys are not arbitrary?* If every
value falls inside a small known range, you can replace the map with a plain array indexed by
`value - lowest`. Same algorithm as Approach 5, but lookup is a single memory read with no hashing
at all.

This does not fix a complexity weakness of Approach 5 — both are O(n). It fixes a *constant-factor*
weakness: **every lookup in a hash map costs a hash computation, a bucket probe and, on collision, a
comparison chain.**

### What must be true, and what breaks if it is not

The assumption is that `max(nums) - min(nums)` is small enough to allocate an array of that size.
**This problem's constraints say it is not**: with values spanning −10⁹ to 10⁹ the array would need
two billion slots, roughly 16 GB. The version below therefore measures the span first and falls back
to the hash map when the assumption fails — which is honest engineering, but means that on the
problem as literally stated this rung is a hash map in disguise. It is included because the *shape*
matters and recurs constantly: the moment a problem says "values are between 1 and 100" or "the
input is lowercase letters", swap the map for an array and take the constant-factor win.

What breaks without the guard: an unguarded allocation on the stated range is an instant
out-of-memory crash — not a wrong answer, a dead process. A subtler break is forgetting the
`lo <= need <= hi` check before indexing; `need` is `target - x` and can easily fall outside the
value range even when every element is inside it, and in Python a negative index silently reads from
the wrong end of the array instead of raising.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`. Here `lo = 1`, `hi = 6`, so the span is 6 slots, one per
possible value from 1 to 6. Every slot starts at −1, meaning "not seen".

| `i` | `nums[i]` | needed | slot for the need | occupied? | action | slots (value: position) |
|---|---|---|---|---|---|---|
| 0 | 3 | 5 | index 5−1 = 4 | −1, empty | write 3 at index 2 | `3: 0` |
| 1 | 6 | 2 | index 2−1 = 1 | −1, empty | write 6 at index 5 | `3: 0, 6: 1` |
| 2 | 1 | 7 | 7 is outside 1…6 — do not index at all | — | write 1 at index 0 | `1: 2, 3: 0, 6: 1` |
| 3 | 5 | 3 | index 3−1 = 2 | holds **0** | return `[0, 3]` | — |

Step 3 is the one to look at: the needed value 7 is larger than anything in the array, and the range
check is what stops the code from reading index 6 of a 6-slot array.

### Code

```python
def pair_sum_direct_index(nums: list[int], target: int, span_limit: int = 1 << 20) -> list[int]:
    if not nums:
        return []
    lo, hi = min(nums), max(nums)
    if hi - lo + 1 > span_limit:  # the bounded-value assumption fails; fall back
        return pair_sum_one_pass_hash(nums, target)
    slot: list[int] = [-1] * (hi - lo + 1)  # slot[v - lo] = last index holding value v
    for i, x in enumerate(nums):
        need = target - x
        if lo <= need <= hi and slot[need - lo] != -1:
            return [slot[need - lo], i]
        slot[x - lo] = i
    return []
```

### Common mistake

Using `0` as the "not seen yet" marker in the slot array. Position 0 is a perfectly real position,
so an element sitting at index 0 becomes indistinguishable from an empty slot, and any pair whose
partner lives at the front of the array is silently missed. On `nums = [3, 6, 1, 5]` with
`target = 8` the answer *is* at position 0, so this bug loses it completely and the function returns
`[]`. Use `-1` as the sentinel, or a separate boolean array of "occupied" flags.

### Complexity and when to use this

**Time O(n + V), space O(V)**, where V is the size of the value range. The `O(V)` term is the cost of
allocating and zeroing the slot array — invisible when V is a few hundred, fatal when V is two
billion. The per-element work is a subtraction and an array read, which is several times faster than
a hash lookup in practice even though both are O(1).

Use it when the problem states a small value range: characters, digits, ages, grades, small enum
codes, counts. Do **not** use it here, where the stated range is ±10⁹ — and say so out loud in an
interview, because naming the technique and then correctly rejecting it on the constraints is a
stronger answer than not knowing it exists.

---

## The Overall Arc

Every step on this ladder is chasing one principle: **do not redo work you do not need to do.**
Brute force does the most redundant work imaginable — for each element it re-reads the entire
remaining array, and the moment it moves on it forgets everything it just learned, so the same
values get compared again and again from a different starting point. The first instinct for killing
a repeated linear scan is to impose order on the data, and it works: sort once and each of those
scans becomes a binary search; then notice that even the binary searches are redundant, because in a
sorted array the two ends tell you unambiguously which way to move, and the n searches collapse into
a single converging sweep — at which point the sort is the only super-linear cost left, and the
whole method is bounded by the price of the filing cabinet you built. That is where the real insight
arrives, and it arrives as a question about the *question*: the pair test never asked about order at
all, it asked "is this particular number present?", and order is an expensive answer to a question
about membership. Swap the sorted array for a hash map and the O(n log n) restructuring vanishes,
leaving only two linear walks — and then one more piece of redundancy falls out, because the second
walk only ever asks about elements the first walk already passed, so the two walks can be fused into
one and the map can hold only the past, which as a bonus makes self-pairing impossible instead of
merely detectable. The final rung stops improving the algorithm and improves the machine underneath
it: a hash map is a general lookup for arbitrary keys, and if the keys happen to be small bounded
integers, the array index *is* the hash, so the last constant factor disappears too — except that
this problem's ±10⁹ range forbids it, which is itself the lesson that a technique is unlocked by a
constraint and not by preference. Unordered scan, imposed order, remembered values,
remembered-and-fused, and finally remembered-without-hashing — and the three worth carrying into an
interview are brute force (to name and reject), the one-pass hash map (to write), and the converging
two-pointer sweep, because it is the one that survives when the array arrives already sorted or when
the problem grows a third number.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | O(n²) | O(1) | No memory at all, so every question is re-answered from scratch | n is tiny; you need a reference implementation to test the fast ones against |
| Sort + binary search | O(n log n) | O(n) | Pays to order the data so each lookup is cheap; the ordering itself is the bill | Many targets queried against one array; the array is already sorted |
| Sort + two pointers | O(n log n) | O(n), or O(1) if sorting in place and positions are not needed | Order buys a *directional* sweep, removing the per-element search entirely | Input already sorted; memory-constrained; three-sum and four-sum follow-ups |
| Two-pass hash map | O(n) | O(n) | Drops ordering for membership, but must guard against matching an element with itself | The map must be built before any query, or all pairs are wanted |
| **One-pass hash map** | **O(n)** | **O(n)** | **Trades memory for time; ask-before-insert gives the self-pairing guard for free** | **The default answer for this problem** |
| Direct-index array | O(n + V) | O(V) | Removes hashing entirely, but only if the value range is small enough to allocate | Values bounded to a small known range — **not** this problem's ±10⁹ |

---

## Interview Priority

**Memorize cold — the one-pass hash map.** This is the expected answer and you should be able to
write it in under a minute without hesitating over the order of the lookup and the insertion. Be
ready to say *why* the lookup comes first, because that is the follow-up question. Its real value is
that it generalises: "turn a pair question into a membership question about what you have already
seen" solves subarray-sum-equals-k, two-sum-on-a-BST, and most "find the complement" variants.

**Memorize cold — brute force.** Not because you will submit it, but because naming the baseline and
its O(n²) cost before improving on it is what signals you are reasoning rather than reciting. It
takes ten seconds to state and it is also the oracle you use to sanity-check the fast solution.

**Memorize cold — sort plus converging two pointers.** The third one worth real recall, because it
is the version that wins when the array is already sorted (O(n) with O(1) extra space) and because
it is the engine inside three-sum, four-sum, container-with-most-water and most "pair from a sorted
range" problems. If you know only the hash map, three-sum will hurt.

**Understand but do not memorize — the two-pass hash map.** It is worth being able to explain,
because it makes the one-pass version's elegance visible by contrast, and because some variants
genuinely need the complete map up front. But if you write it by default in an interview you will
be asked to fuse the passes, so you may as well start there.

**Understand but do not memorize — sort plus binary search.** It is strictly worse than the
two-pointer sweep on the same sorted data: same asymptotic cost, more code, more index bookkeeping.
Its value is conceptual — it is the clearest illustration that "restructure the input" and "search
the restructured input" are two separate bills, and that you have to reduce both to get faster.

**Understand but do not memorize — direct indexing.** Nothing to recall, one thing to recognise:
when a problem bounds its values to a small range, the array index replaces the hash. Recognising
that a constraint has *unlocked* something is a more valuable habit than any specific
implementation.

---

## Full Runnable Script

Every approach above, plus a test suite that runs the statement's example, the smallest legal input,
a duplicate-value case, negatives, a target with no valid pair, a wide-range case that forces the
direct-index fallback, and 38 randomised stress cases whose targets are constructed so that exactly
one pair matches — each one cross-checked against brute force and against every other approach.

```python
"""Pair With Target Sum - every approach in one file, plus a self-checking test suite.

Run: python pair_sum_all.py
"""

from __future__ import annotations

import random
from bisect import bisect_left


# --- 1. Brute force: every pair ------------------------------------------------

def pair_sum_brute_force(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):  # j starts past i, so nothing pairs with itself
            if nums[i] + nums[j] == target:
                return [i, j]
    return []


# --- 2. Sort, then binary search for each complement ---------------------------

def pair_sum_sort_binary_search(nums: list[int], target: int) -> list[int]:
    order = sorted(range(len(nums)), key=lambda k: nums[k])  # positions, ordered by value
    values = [nums[k] for k in order]
    for p in range(len(values)):
        need = target - values[p]
        q = bisect_left(values, need, p + 1)  # search only to the right of p
        if q < len(values) and values[q] == need:
            return sorted([order[p], order[q]])
    return []


# --- 3. Sort, then converge two pointers ---------------------------------------

def pair_sum_sort_two_pointers(nums: list[int], target: int) -> list[int]:
    order = sorted(range(len(nums)), key=lambda k: nums[k])
    i, j = 0, len(nums) - 1
    while i < j:
        total = nums[order[i]] + nums[order[j]]
        if total == target:
            return sorted([order[i], order[j]])  # sorted order != original order
        if total < target:
            i += 1
        else:
            j -= 1
    return []


# --- 4. Two-pass hash map ------------------------------------------------------

def pair_sum_two_pass_hash(nums: list[int], target: int) -> list[int]:
    index_of: dict[int, int] = {x: i for i, x in enumerate(nums)}  # a later duplicate overwrites
    for i, x in enumerate(nums):
        j = index_of.get(target - x, -1)
        if j != -1 and j != i:  # the guard that stops x from being its own partner
            return sorted([i, j])
    return []


# --- 5. One-pass hash map (optimal) --------------------------------------------

def pair_sum_one_pass_hash(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:  # asked before inserting, so i is never matched against itself
            return [seen[target - x], i]
        seen[x] = i
    return []


# --- 6. Direct indexing, only when the values are small and bounded ------------

def pair_sum_direct_index(nums: list[int], target: int, span_limit: int = 1 << 20) -> list[int]:
    if not nums:
        return []
    lo, hi = min(nums), max(nums)
    if hi - lo + 1 > span_limit:  # the bounded-value assumption fails; fall back
        return pair_sum_one_pass_hash(nums, target)
    slot: list[int] = [-1] * (hi - lo + 1)  # slot[v - lo] = last index holding value v
    for i, x in enumerate(nums):
        need = target - x
        if lo <= need <= hi and slot[need - lo] != -1:
            return [slot[need - lo], i]
        slot[x - lo] = i
    return []


APPROACHES = [
    ("brute_force", pair_sum_brute_force),
    ("sort_binary_search", pair_sum_sort_binary_search),
    ("sort_two_pointers", pair_sum_sort_two_pointers),
    ("two_pass_hash", pair_sum_two_pass_hash),
    ("one_pass_hash", pair_sum_one_pass_hash),
    ("direct_index", pair_sum_direct_index),
]


# --- test suite ----------------------------------------------------------------

def unique_pair_case(size: int, spread: int, rng: random.Random) -> tuple[list[int], int]:
    """Random array plus a target hit by exactly one pair (the problem's guarantee)."""
    while True:
        nums = rng.sample(range(-spread, spread), size)
        i, j = rng.sample(range(size), 2)
        target = nums[i] + nums[j]
        hits = sum(
            1
            for a in range(size)
            for b in range(a + 1, size)
            if nums[a] + nums[b] == target
        )
        if hits == 1:
            return nums, target


def main() -> None:
    cases: list[tuple[str, list[int], int]] = [
        ("statement example", [3, 6, 1, 5], 8),
        ("smallest legal n, duplicates", [2, 2], 4),
        ("negatives and a zero sum", [-3, 4, 3, 90], 0),
        ("duplicate value, only one pair works", [3, 3, 4, 7], 11),
        ("no valid pair exists", [1, 2, 3], 100),
        ("wide value range, direct index falls back", [10**9, -10**9, 7, 3], 10),
    ]

    rng = random.Random(20260912)
    for n in range(2, 40):
        nums, target = unique_pair_case(n, 200, rng)
        cases.append((f"stress n={n}", nums, target))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums, target in cases:
        shown = nums if len(nums) <= 8 else nums[:8] + ["..."]
        print(f"\n{label}: nums={shown} target={target}")
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums), target)
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        agreed = all(r == results[0] for r in results)
        # every returned pair must actually sum to the target
        valid = all(
            not r or (len(r) == 2 and r[0] != r[1] and nums[r[0]] + nums[r[1]] == target)
            for r in results
        )
        if not agreed or not valid:
            all_agreed = False
            print(f"  DISAGREEMENT (agreed={agreed}, valid={valid})")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
