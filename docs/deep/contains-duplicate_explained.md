# Any Repeat in the Array? — explained

## Understanding the Problem

You are given a list of whole numbers and asked one yes-or-no question: does the same number show up
more than once anywhere in the list? Not *which* number repeats, not *where*, not *how many times* —
only whether such a number exists at all.

**The core question:** for each number, has this exact number appeared somewhere **earlier** in the
list? The naive approach is slow because it answers that by comparing every number against every
other, roughly `n²/2` comparisons, almost all of them re-asking something an earlier comparison
already settled.

Notice how much weaker the question is than it first appears. "Is there a repeat?" needs far less
information than "which value repeats?" or "how many repeats are there?", and every improvement
below comes from noticing you are allowed to **throw information away**.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `1 <= nums.length <= 10^5` | A hundred thousand elements makes `O(n²)` about 5·10⁹ comparisons — far too slow to run. **This is the constraint that rules brute force out**, demanding `O(n log n)` or better. The list is never empty, though a defensive implementation should still survive an empty one. |
| `-10^9 <= nums[i] <= 10^9` | Values may be negative and span four billion possibilities. **This is the constraint that forbids the direct-indexing rung**: an array with one slot per possible value is not allocatable. The lookup structure must cope with arbitrary integer keys — a hash set's job. |
| a single element cannot repeat, so `[x]` is always `false` | The base case. Every approach below returns `false` on `[x]` without special-casing it — but check it anyway, because a loop written with an off-by-one reads `nums[-1]` on a one-element list. |
| values unbounded in range, bounded in count | The trade-off, stated outright. At most 10⁵ *elements* but 2·10⁹ *possible values*, so a structure sized by the **data** (a set, at most 10⁵ entries) is affordable and one sized by the **value range** is not. |
| *(implied)* you need existence, not identity | **This unlocks the early exit.** The instant a repeat is found, nothing later can change the answer, so you may stop reading — the difference between an approach that always costs `n` and one that often costs far less. |

The worked example traced in every section below is the statement's own:

```
nums = [1, 2, 3, 1]        answer: true   (the value 1 sits at both position 0 and position 3)
```

---

## Reading the Calculations

This problem has no arithmetic in it at all — no index formula, no running total, nothing to
rearrange. What it has instead is four one-line solutions that look interchangeable and are not. The
useful skill here is reading a line and seeing **how much of the input it commits you to reading**,
because that, not the big-O, is what separates these rungs.

### The symbol table

| You will see | It computes | Why it is written that way | If it were wrong |
|---|---|---|---|
| `range(i + 1, len(nums))` | "everything **after** `i`" | Starting at `i` compares `nums[i]` with itself and reports a repeat on every input | `range(i, …)` returns `True` always; `range(0, …)` does every comparison twice |
| `x in seen` | "have I met this value before?" | The set answers without looking through anything — measured flat below | On a `list` it is a scan, and the rung is quadratic again with extra steps |
| `seen.add(x)` **after** the check | record it for later elements | **Order is the whole correctness argument.** See below | Add first and every element finds itself; the function returns `True` on every input |
| `len(set(nums)) != len(nums)` | "did anything collapse?" | A set drops duplicates, so a shorter set *is* a duplicate | `==` inverts the answer; `<` is correct but says less clearly why |
| `return True` inside the loop | **stop reading** | Existence, not identity — nothing later can change a `True` | Setting a flag and continuing is still correct, and throws away the only thing this rung has |
| `nums[i] == nums[i + 1]` (sorted) | "are these neighbours equal?" | After sorting, equal values are adjacent, so only neighbours need checking | `i - 1` on an unguarded loop reads `nums[-1]`, which in Python is the **last** element — a wrong answer, not a crash |
| `sorted(nums)` vs `nums.sort()` | a copy vs in place | `sort()` mutates the **caller's** array | A caller that needed its original order silently loses it |

### The one rearrangement

There is no formula here, so the "rearrangement" is a swap of two lines, and it is the only thing in
this problem that can be subtly wrong:

```
    for x in nums:                       for x in nums:
        if x in seen:  return True           seen.add(x)
        seen.add(x)                          if x in seen:  return True
    return False                         return False

    correct                              returns True on EVERY input
```

Read the right-hand version literally: it puts `x` into the set and then asks whether `x` is in the
set. It always is. It will pass `[1, 2, 3, 1]`, pass `[1, 1]`, pass every test whose answer is
`true`, and fail only on inputs with no duplicate — which is exactly the case people forget to test.
The check must happen against the values seen **strictly earlier**, and "strictly earlier" is
enforced by nothing but the order of those two lines.

### How to hand-trace it

`nums = [1, 2, 3, 1]`. Every row below is printed by the script at the foot of this document.

| Step | `x` | `seen` before | `x in seen`? | Action |
|---|---|---|---|---|
| 1 | `1` | `{}` | no | add `1` |
| 2 | `2` | `{1}` | no | add `2` |
| 3 | `3` | `{1, 2}` | no | add `3` |
| 4 | `1` | `{1, 2, 3}` | **yes** | **return `True`** |

Four elements, four probes, and the loop happened to run to the end. Now move the repeat to the
front — `[1, 1, 2, 3]` — and it is two probes with one value stored. Same array length, same answer,
a quarter of the work. That sensitivity to *where* the repeat sits is not a detail of this rung; it
is the only thing this rung has that the one-liner does not, and the measurement below prices it.

**The recipe, for any input:** walk left to right holding a set of what you have already passed. At
each element, ask before you add. If you ever add before you ask, you have written a function that
returns `True` on everything.

---

## Approach 1 — Brute force: compare every pair

### The idea

*How do I know whether two elements hold the same value?* Compare them. With no other tools, compare
every position against every position after it: any equal comparison proves a duplicate, and none at
all proves every element distinct.

### How to think about it

> **Intuition.** A room of people and the question "do any two share a birthday?", with no way to
> write anything down. You ask person 1 their birthday and then ask everyone else in turn whether
> it matches; then you start again from person 2, asking everyone after them — never going back to
> person 1, because that conversation already happened. An outer walk picks a person, an inner walk
> interrogates everyone to their right. Nothing is ever **remembered** between rounds, so each round
> re-derives facts from scratch, and that amnesia is the whole inefficiency.

### Worked example

`nums = [1, 2, 3, 1]`.

| step | `i` | `nums[i]` | `j` | `nums[j]` | equal? | answer so far |
|---|---|---|---|---|---|---|
| 1 | 0 | 1 | 1 | 2 | no | — |
| 2 | 0 | 1 | 2 | 3 | no | — |
| 3 | 0 | 1 | 3 | 1 | **yes** | `true` — return |

Three comparisons, because the repeat involves the very first element. Change the input to
`[2, 3, 4, 1, 1]` and the same code makes nine before finding the pair at the end; with no repeat at
all on five elements it makes all ten. Ten is 5·4/2 — the number of distinct couples — and that is
where the `O(n²)` comes from.

### Code

```python
def contains_duplicate_brute_force(nums: list[int]) -> bool:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):  # j > i, so no position is compared with itself
            if nums[i] == nums[j]:
                return True
    return False
```

### Common mistake

> **Watch out.** The misconception is that starting the inner loop at `0` merely does **extra
> work** — the same comparisons, plus some redundant ones. It does not: it adds the comparison
> `nums[i] == nums[i]`, which is true for every input, so the function returns `True`
> unconditionally.

On `[1, 2, 3, 4]` the wide version answers `True` where the correct answer is `False`. It is a
particularly nasty bug because the function still "works" on every input that genuinely has a
duplicate, so a test suite checking only positive cases passes clean. Guard it **structurally** by
starting `j` at `i + 1` — which also halves the comparisons — rather than by bolting on an `i != j`
check.

### Complexity and when to use this

**Time** `O(n²)`, **space** `O(1)`. Every one of the `n` starting positions scans the remaining
tail, giving roughly `n²/2` comparisons; nothing is stored, so the only memory is two loop counters.

Use it when `n` is tiny — below roughly twenty elements the constant factors mean this genuinely
beats a hash set, because allocating and hashing costs more than a handful of integer comparisons.
Use it also as the **oracle** in a test suite, exactly its role at the foot of this document. On
10⁵ elements it is unusable, and saying so is the first move of a good interview answer.

---

## Approach 2 — Sort, then look at neighbours

### The idea

*Comparing every pair is wasteful — can the data be rearranged so only a few comparisons matter?*
Yes. Force equal values to sit next to each other and a duplicate can only ever appear as two
adjacent elements, so one walk comparing each element with its predecessor settles the question.

This fixes brute force's weakness — **it compares elements that are obviously unrelated, because
nothing in an unsorted array tells you where a matching value might be.**

### How to think about it

> **Intuition.** A shuffled deck spread face-up on a table: to find whether any rank appears twice
> you must check every card against every other. Gather and sort the deck and identical ranks land
> shoulder to shoulder, so a single left-to-right sweep, glancing only at each card and the one
> before it, answers the question. Sorting is the cost of **herding** equal values together; the
> sweep afterwards is trivial. The catch is that this buys *adjacency*, which was never what you
> asked for — a strong, expensive property that happens to imply the weak, cheap one you needed.

> **Why it works.** The invariant the sort establishes is that `ordered` is non-decreasing, and
> from that one fact the whole method follows: if two equal values existed at any distance in the
> original, every value between them in sorted order is squeezed between two equal bounds and so
> equals them too. Equal values are therefore **contiguous** after sorting, and a run of length two
> or more must contain at least one adjacent equal pair. Checking neighbours is not a heuristic; it
> is exhaustive.

### Worked example

`nums = [1, 2, 3, 1]`. First the restructure — sort a copy, leaving the caller's array untouched:

| | contents |
|---|---|
| `nums` (caller's, untouched) | `[1, 2, 3, 1]` |
| `ordered` (the sorted copy) | `[1, 1, 2, 3]` |

Then the sweep, from position 1, comparing each element with its predecessor:

| step | `i` | `ordered[i - 1]` | `ordered[i]` | equal? | answer so far |
|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | **yes** | `true` — return |

The answer arrives on the first comparison of the sweep. That is not luck, it is the point: the sort
did all the work, and it did it before the sweep started.

### Code

```python
def contains_duplicate_sort_scan(nums: list[int]) -> bool:
    ordered = sorted(nums)  # a copy; the caller's order is not disturbed
    for i in range(1, len(ordered)):
        if ordered[i] == ordered[i - 1]:
            return True
    return False
```

### Common mistake

> **Watch out.** The misconception is that sorting the input is an **implementation detail** — the
> function returns the right answer either way, so who cares which array it sorted. The caller
> cares: `nums.sort()` silently destroys their ordering, and that surfaces as a bug three functions
> away when their positions no longer mean what they meant.

`sorted()` returns a new list and leaves the input alone; in Java the equivalent is `nums.clone()`
before `Arrays.sort`. The second version of the same mistake is starting the sweep at `i = 0` and
reading `ordered[i - 1]`: in Python `ordered[-1]` is the *last* element, so on a one-element list
you compare the only element with itself and wrongly return `True`.

### Complexity and when to use this

**Time** `O(n log n)`, **space** `O(1)` extra — or `O(n)` if, as above, you copy rather than sort in
place. Naming the two costs separately is this rung's lesson: **restructuring** (the sort) is
`O(n log n)` and dominates everything, while the **search** (the adjacency sweep) is only `O(n)`.
Improving the sweep is pointless; the only way forward is to stop sorting.

Use it when memory is the tight resource — an in-place sort answers the question in constant extra
space, whereas the hash set below allocates room for up to `n` values. Use it also when the array is
already sorted, or when the calling code wants it sorted anyway, in which case the sort is not a
cost but a side benefit.

---

## Approach 3 — Build the whole set, then compare sizes  *(an addition — not in the data file's ladder)*

### The idea

*Sorting buys adjacency, which is more than the question needs — what exactly does the question
need?* Only the count of **distinct** values. Pour every element into a set, which keeps one copy of
each value, and compare its size against the list's length.

This fixes Approach 2's weakness — **it pays `O(n log n)` to order the data, when the question is
about membership and not about order at all.**

### How to think about it

> **Intuition.** Pour a bag of marbles into a machine that keeps one marble of each colour and
> discards the rest, then count what you poured in and what came out. Differing counts mean some
> colour appeared twice. This is the first genuinely **linear** idea on the ladder and a real
> improvement — but it is also the instinctive one-liner, and it answers the question by first
> computing something strictly larger: the complete catalogue of every distinct value. Building all
> of it means you can never stop early, no matter how obvious the answer becomes.

> **Why it works.** This is the pigeonhole principle with the arrow pointing both ways. Inserting
> `n` elements into a set yields `n` entries exactly when every element is distinct, and fewer
> exactly when at least one insertion found its value **already present**. So `len(set(nums)) <
> len(nums)` is not evidence of a duplicate, it is equivalent to one — which is why the test suite
> can use the same expression as its independent oracle.

### Worked example

`nums = [1, 2, 3, 1]`.

| step | pouring in | already present? | set contents | set size | list length |
|---|---|---|---|---|---|
| 1 | `nums[0] = 1` | no | `{1}` | 1 | 4 |
| 2 | `nums[1] = 2` | no | `{1, 2}` | 2 | 4 |
| 3 | `nums[2] = 3` | no | `{1, 2, 3}` | 3 | 4 |
| 4 | `nums[3] = 1` | **yes — absorbed** | `{1, 2, 3}` | 3 | 4 |
| — | compare | — | — | `3` ≠ `4` | → `true` |

Look at row 4. The answer was decided the moment the second `1` was absorbed, but this approach has
no way to notice — it compares nothing until the pouring is completely finished. On four elements
that costs nothing; on `[1, 1, <99998 more>]` it reads all hundred thousand to learn something the
second element already proved.

### Code

```python
def contains_duplicate_set_length(nums: list[int]) -> bool:
    return len(set(nums)) != len(nums)  # builds every element before answering
```

### Common mistake

> **Watch out.** The misconception is that this one-liner works on **any iterable** — it reads like
> it only needs to be walked. It quietly requires an input that can be *measured* and traversed
> *twice*, which a generator is not.

`len(set(gen)) != len(gen)` fails outright with `TypeError: object of type 'generator' has no len()`.
The "obvious" repair, `len(set(items)) != len(list(items))`, is worse than the crash, because it
does not crash. Python evaluates the left side first, which consumes the generator entirely; the
right side then sees an exhausted iterator and builds an empty list. On an **all-distinct**
generator yielding `1, 2, 3, 4` it compares `4 != 0` and returns **`True`** — a confident wrong
answer on precisely the inputs that have no duplicate. The element-by-element approaches below need
neither a length nor a second traversal, which makes them the safer default in real code even though
this line is shorter.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n)`. Every element is hashed and inserted exactly once at `O(1)`
average cost; the space is the set, holding all `n` values in the worst case. Note the asymmetry
with Approach 4: their *worst* cases are identical and only the best and average cases differ — but
they differ a lot, because the early exit fires on the first repeat rather than at the end.

Use it when the code matters more than the microseconds, which in practice is most of the time: one
line, impossible to get subtly wrong, instantly readable. Prefer Approach 4 when the arrays are
long, when duplicates are expected early, or when the input is a stream you can only walk once.

---

## Approach 4 — A set with an early exit (optimal)

### The idea

*If the answer is decided the moment a repeat appears, why keep reading?* Walk the list once carrying
a set of values already seen. Ask before adding: a hit returns immediately, and reaching the end
proves everything distinct.

This fixes Approach 3's weakness — **it builds the entire catalogue before answering, so it always
pays for the whole array even when the answer was settled at element two.**

### How to think about it

> **Intuition.** A bouncer at a door with a guest list they are writing themselves. Each person
> arrives; you check whether their name is already on the list. If it is, you have caught a
> gatecrasher and the night is over — no reason to check the queue behind them. If not, you add the
> name and call the next person. The list only ever contains the **past**, and "have I seen this?"
> is asked against exactly that past.

> **Why it works.** The invariant is one sentence: **when the lookup for element `i` runs, `seen`
> holds exactly the values at indices `0 .. i-1`** — empty at the start, preserved because the
> insertion happens after the lookup. Correctness in both directions follows. If the function
> returns `True`, some value was found already present, so it genuinely occurs twice; and if a
> duplicate `(a, b)` with `a < b` exists, the value was inserted at step `a` and nothing is ever
> removed, so the lookup at step `b` cannot miss it.

### Worked example

`nums = [1, 2, 3, 1]`.

| step | `x` | `x in seen`? | action | `seen` after | answer so far |
|---|---|---|---|---|---|
| 1 | 1 | no (empty) | add | `{1}` | — |
| 2 | 2 | no | add | `{1, 2}` | — |
| 3 | 3 | no | add | `{1, 2, 3}` | — |
| 4 | 1 | **yes** | stop | — | `true` — return |

Four lookups, three insertions. On this input it matches Approach 3's work exactly — the repeat is at
the last position, so there was nothing to save. The difference shows on `[1, 1, 2, 3]`: this
approach stops after two elements while the set-length version reads all four. Identical in the
worst case, strictly better in the common one, never worse.

### Code

```python
def contains_duplicate_seen_set(nums: list[int]) -> bool:
    seen: set[int] = set()
    for x in nums:
        if x in seen:
            return True  # nothing later can change the answer
        seen.add(x)
    return False
```

### Common mistake

> **Watch out.** The misconception is that `return False` is the loop's "**otherwise**" branch and
> so belongs beside `return True`. It is not a branch, it is a **conclusion**: `False` is a claim
> about the entire list, and you cannot make a claim about everything until you have seen
> everything.

```python
for x in nums:
    if x in seen:
        return True
    seen.add(x)
    return False          # WRONG — indented into the loop
```

Indented, the function returns after examining the very first element, answering `False` for every
input whose duplicate is not at positions 0 and 1 — `[1, 2, 3, 1]` included, where it never reads
past the `2`. One level of indentation is the difference between "no duplicate anywhere" and "no
duplicate in the first element", and Python will not warn you.

A related trap in Java: `seen.add(x)` returns `false` when the value was already present, so
`if (!seen.add(x)) return true;` is the idiomatic one-liner — and writing `if (seen.add(x))` inverts
the test, returning `true` for arrays that are entirely distinct.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n)`. One pass with a hash lookup and at most one insertion per element,
both `O(1)` on average, so the work is linear in the number of elements *examined* — and the early
exit means that number is often far below `n`. The space is the set: up to `n` values when
everything is distinct, the price of not sorting. Strictly, hash operations are `O(1)` *expected*;
adversarially chosen keys can collide and degrade a pass to `O(n²)`, the one theoretical edge
sorting holds.

**This is the default answer.** Linear, four lines, stops as soon as it knows, and leaves the
caller's array alone. Choose sorting over it only when extra memory is genuinely unavailable, and
brute force only for toy-sized inputs.

> **Under the hood.** "The early exit means that number is often far below `n`" is the claim this
> rung is sold on, so price it. Three arrays of the same length, the same values, differing only in
> **where the repeat sits** — and for the brute force, how much of the input each rung actually
> touches, at `n = 2,000`:
>
> | shape | brute-force comparisons | set probes |
> |---|---|---|
> | repeat at position 1 | 1 | 2 |
> | repeat at the last position | 1,999 | 2,000 |
> | no repeat at all | **1,999,000** | 2,000 |
>
> The set column barely moves; the brute-force column goes from 1 to two million on the same
> `n`. That last row is `n(n-1)/2`, and it is the row a hand-written test almost never contains,
> because the inputs people invent to test "find the duplicate" have a duplicate in them.
>
> Now the part that should change how you talk about this problem. Wall clock at the ceiling,
> `n = 10^5`, best of three:
>
> | shape | sort | `len(set(nums))` | early exit |
> |---|---|---|---|
> | repeat at position 1 | 10.21 ms | 3.34 ms | **0.10 ms** |
> | repeat at the last position | 10.51 ms | **3.62 ms** | 5.46 ms |
> | no repeat at all | 13.12 ms | **3.33 ms** | 5.35 ms |
>
> The one-line `len(set(nums)) != len(nums)` — filed above as an *addition*, not the answer — is the
> fastest rung on two shapes out of three, and on the worst case it beats the "optimal" rung by
> **60%**. Not because it does less work: it does strictly more, building the whole set every time.
> It wins because `set(nums)` is one bulk operation in C while the early-exit loop pays Python's
> per-element interpreter cost on all `10^5` iterations. The same relationship holds at every size
> measured — 0.30 vs 0.51 ms at `10^4`, 3.81 vs 5.66 at `10^5`, 49.0 vs 82.9 at `10^6`.
>
> So what is the early exit actually for? Two things, and neither of them is worst-case speed:
>
> - **The best case**, which is 33× here and unbounded in general — 0.10 ms against 3.34 ms when the
>   repeat is near the front.
> - **The memory it never allocates.** Values stored before the answer is known: **1** when the repeat
>   is at position 1, against 100,000 for the one-liner, which always builds the whole set. On a
>   stream, or on an input that does not fit in memory, that is not a constant factor — it is the
>   difference between running and not.
>
> **What to take from this.** Two rungs with the same `O(n)` and the same worst case can differ by
> 60% in one direction and 2,000× in the other, and which one you want is decided by your input and
> your memory budget rather than by the ladder. Say that out loud in an interview and you are having
> a different conversation from the one most candidates have.

---

## Approach 5 — Direct indexing when the values are small and bounded  *(an addition — not in the data file's ladder)*

### The idea

*A hash set handles arbitrary keys — but what if the keys are not arbitrary?* If every value lies
inside a small known range, replace the set with a plain array of flags indexed by `value - lowest`.
The algorithm is Approach 4 unchanged; only the lookup changes, from a hash computation and a bucket
probe to a single memory read.

This fixes no complexity weakness — both are `O(n)`. It removes a **constant factor**: every hash-set
operation costs a hash computation and a probe, and the set rehashes as it fills.

### What must be true, and what breaks if it is not

The assumption is that `max(nums) - min(nums)` is small enough to allocate one flag per possible
value. **This problem's constraints say it is not**: values span −10⁹ to 10⁹, so the flag array would
need two billion slots.

The implementation below measures the span and falls back to Approach 4 when the assumption fails.
That fallback is a deliberate **call**, not a reach into another approach's internals — Approach 5
*is* Approach 4 with the set swapped for an array, and the fallback says so. It does mean that on the
problem as literally stated, this rung is a hash set in disguise.

Without the guard, an unguarded allocation on the stated range is not a wrong answer but a dead
process. The subtler break is dropping the `- lo` offset: with negative values present, `mark[x]`
indexes from the wrong end of the array in Python — a negative index wraps silently — and throws in
Java or C++.

There is a stricter cousin worth knowing. When a problem promises the values are a permutation-like
range such as `1..n`, you can mark "seen" *inside the input array itself* by negating the element at
the index a value points to, answering in `O(n)` time and **`O(1)` extra space**. That is the right
tool when the value range coincides with the index range and the input may be modified — and it is
strictly wrong here, where the values have no relationship to the indices.

### Worked example

`nums = [1, 2, 3, 1]`. Here `lo = 1` and `hi = 3`, so three flag slots cover every possible value,
all starting at `0` for "not seen".

| step | `x` | slot `x - lo` | flag before | action | `mark` for values `1, 2, 3` | answer so far |
|---|---|---|---|---|---|---|
| 1 | 1 | 0 | `0` | set | `1, 0, 0` | — |
| 2 | 2 | 1 | `0` | set | `1, 1, 0` | — |
| 3 | 3 | 2 | `0` | set | `1, 1, 1` | — |
| 4 | 1 | 0 | **`1`** | stop | `1, 1, 1` | `true` — return |

Identical bookkeeping to Approach 4, with the set replaced by three bytes and the hash replaced by a
subtraction. Note the two extra passes hidden at the start: `min(nums)` and `max(nums)` each read the
whole array before the main walk can begin.

### Code

```python
def contains_duplicate_direct_index(nums: list[int]) -> bool:
    if len(nums) < 2:
        return False
    lo, hi = min(nums), max(nums)
    if hi - lo + 1 > MAX_DIRECT_SPAN:  # the bounded-value assumption fails; fall back
        return contains_duplicate_seen_set(nums)
    mark = bytearray(hi - lo + 1)  # one byte per possible VALUE, not per element
    for x in nums:
        if mark[x - lo]:
            return True
        mark[x - lo] = 1
    return False
```

### Common mistake

> **Watch out.** The misconception is that the flag array needs to be "**big enough**", and
> `len(nums)` is a handy big number. Size is not the question — the array is indexed by *value*, so
> it must be sized by **how many values are possible**, never by how many elements there are. This
> problem's constraints say in as many words that those are two different quantities.

Writing `mark = bytearray(len(nums))` and then `mark[x]` happens to work on inputs like
`[0, 1, 2, 0]` where values and indices coincide, which is exactly what makes it dangerous. On
`[1, 2, 3, 1]` it indexes `mark[3]` of a four-slot array and survives by luck, returning the right
answer. On `[5, 9, 5]` it indexes `mark[5]` of a three-slot array and dies with
`IndexError: bytearray index out of range`.

### Complexity and when to use this

**Time** `O(n + V)`, **space** `O(V)`, where `V` is the size of the value range. The `O(V)` term is
allocating and zeroing the flag array — free when `V` is a few hundred, impossible when `V` is two
billion — and it is why this can be *slower* than a hash set on a short array with widely spread
values. The per-element work is a subtraction and an array read, several times faster in practice
than a hash lookup even though both are `O(1)`.

Use it when the problem bounds its values to a small range: characters, digits, grades, small enum
codes, ages. Do not use it here, where the constraints rule it out — and say that out loud, because
naming a technique and then rejecting it on the stated value range shows you read the constraints
rather than pattern-matched the problem.

---

## The Overall Arc

The principle running through this ladder is that **an answer should cost no more than the question
is worth**, and every rung is a discovery that the previous one computed something bigger than it
was asked for. Brute force computes, implicitly, the entire table of which pairs are equal — `n²/2`
facts — when a single yes/no was wanted, and it does so with no memory at all, so the same values
are compared over and over from different starting points. Sorting is the first instinct for killing
a repeated scan, and it works because it herds equal values into adjacency, collapsing the search to
one comparison per position; but adjacency is a much stronger property than "a repeat exists", it
costs `O(n log n)` to manufacture, and the sweep that consumes it is only linear — so the
restructuring is the entire bill and the search is free, which is the signal that the restructuring
is the wrong thing to be buying. The question was never about order; it was about membership, and
membership has its own structure. A set answers "have I seen this value?" directly in one step, and
pouring the whole array into one and comparing sizes is linear at last — but it still overshoots,
because it constructs the complete catalogue of distinct values before comparing anything, and so it
cannot stop early no matter how quickly the answer becomes obvious. Interleaving the question with
the building fixes that last piece of waste: ask before you insert, and the walk ends at the first
repeat instead of at the end of the array, the same *asymptotic* cost and a very different *actual*
one. The last rung stops improving the algorithm and improves the machine underneath it — if the
values were small and bounded, the array index would be the hash and even the hashing would
disappear — but this problem's ±10⁹ range explicitly forbids it, which is itself the lesson: a
technique is unlocked by a constraint, not chosen by preference. What matters most in an interview is
naming the trade rather than jumping to the answer: sorting is `O(n log n)` at constant memory and
leaves the data useful for other questions, the set is linear time at linear memory, and which is
"better" depends entirely on which resource is scarce.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | `O(n²)` | `O(1)` | Remembers nothing, so every fact is rediscovered | `n` is tiny (under ~20); as the test-suite oracle |
| Sort + adjacent scan | `O(n log n)` | `O(1)` in place, `O(n)` if copied | Buys adjacency — more than the question needs — but at almost no memory cost | Memory is tight; input already sorted; caller wants it sorted anyway |
| Set size vs list length | `O(n)` | `O(n)` | Linear and one line, but computes the full distinct catalogue and cannot exit early | Readability over microseconds; short arrays; quick scripts |
| **Seen-set with early exit** | **`O(n)`** | **`O(n)`** | **Trades memory for time and stops the instant the answer is known** | **The default answer for this problem** |
| Direct-index flags | `O(n + V)` | `O(V)` | Drops hashing entirely, but only if the value range is small enough to allocate | Values bounded to a small known range — **not** this problem's ±10⁹ |

---

## Interview Priority

> **In an interview.** Name brute force and its `O(n²)` in one sentence, then reframe out loud
> before writing: *"this is not a question about comparing pairs, it is a question about membership
> in what I have already seen."* Write the seen-set with the early exit, and be ready to justify its
> two decisions — why the lookup precedes the insertion, and why `return False` sits **outside** the
> loop. The follow-up is almost always **"now do it in constant extra space"**, and the answer is
> sort-then-scan neighbours: you give up linear time and the caller's array order, and you should
> say both out loud rather than let the interviewer find them.

**Memorize cold — the seen-set with early exit.** Four lines, linear, and the expected answer. What
matters is not typing it but explaining the two decisions inside it; both are correctness arguments,
and both are follow-up questions waiting to be asked.

**Memorize cold — sort plus the adjacency scan.** This is the constant-space answer, and switching
to it immediately while naming what you give up is worth more than knowing the fast version alone.
It is also the approach that generalises to "are there duplicates within `k` positions of each
other?" and to the several interval problems that begin with a sort.

**Understand but do not memorize — brute force.** Ten seconds at the start of the answer to name the
baseline and its `O(n²)`, and real use afterwards as the oracle you validate against. Nothing to
recall beyond "compare every pair, start the inner loop at `i + 1`".

**Understand but do not memorize — the set-length one-liner.** You will write this in real code all
the time and that is fine. In an interview it invites "can you avoid reading the whole array?", so
it is better as the thing you mention and improve than the thing you submit. Do know its one real
failure mode: it needs an input with a length that can be measured and traversed twice.

**Understand but do not memorize — direct indexing.** Nothing to recall, one thing to recognise:
when a problem bounds its values to a small range an array of flags replaces the hash set, and when
the values are a range like `1..n`, in-place sign marking reaches `O(1)` extra space. Spotting which
constraint would unlock either is the transferable skill.

---

## How to Get Fluent

This problem is small enough to be written from memory in thirty seconds, which is exactly why it is
worth drilling properly: the things that go wrong here are not about the algorithm.

**1. Write the early-exit version from nothing.** Four lines.
*Done when:* the `if x in seen` came before the `seen.add(x)` without you having to think about it.
If you had to pause and check, do drill 2 now rather than later.

**2. Write it wrong on purpose.** Swap those two lines and run it on `[1, 2, 3]`.
*Done when:* you have watched it return `True` on an array with no duplicate, and can say why every
test with a `true` answer still passes. The bug that only fails the case you forgot to write is the
one worth having met.

**3. Answer "which one would you actually ship?" with a question back.** The question is *how long is
the array, and is there a memory budget?*
*Done when:* you can name the one-liner as the faster choice on a worst case, the early exit as the
one with the bounded memory and the good best case, and mean both.

**4. Build the three shapes yourself and time them.** Repeat at the front, repeat at the back, no
repeat — same `n`, same values. The script at the foot of this page builds them.
*Done when:* you predicted, before running it, which of the three rows would be fastest and which
would be slowest, and were right about at least two.

**5. Count the brute force.** Run it on 2,000 distinct values.
*Done when:* you have seen 1,999,000 comparisons and recognise it as `n(n-1)/2` on sight, because
that expression turns up in half the problems in this repo.

**6. Answer the two follow-ups cold.** *"No extra memory allowed"* and *"the values are all between
1 and n"*.
*Done when:* you reach for sorting on the first and for in-place sign marking on the second, and can
say in one sentence what each one costs you — the caller's array order, and the values themselves.

**The one sentence worth keeping a month from now:** *ask before you add, because "seen" has to mean
"seen earlier"* — and its shadow: *the early exit buys a best case and a memory bound, not a faster
worst case.*

---

## Full Runnable Script

Every approach above, plus a test suite covering the statement's two examples, the smallest legal
input, an empty array, an all-identical array, a repeat only at the very end, negatives, values
outside any indexable range (forcing the direct-index fallback), and 38 randomised stress cases drawn
from a deliberately narrow value range so repeats are common — each cross-checked against brute
force, against every other approach, and against an independent distinct-count oracle.

`MAX_DIRECT_SPAN` is the one lifted decision in the file: the single place that answers "how wide a
value range is still worth a flag array?", so changing that policy is a one-line edit rather than a
hunt through the approaches.

```python
"""Any Repeat in the Array? - every approach in one file, plus a self-checking test suite.

Run: python contains_duplicate_all.py
"""

from __future__ import annotations

import random
import time

MAX_DIRECT_SPAN = 1 << 20  # widest value range still worth a flag array


# --- 1. Brute force: compare every pair ---------------------------------------

def contains_duplicate_brute_force(nums: list[int]) -> bool:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):  # j > i, so no position is compared with itself
            if nums[i] == nums[j]:
                return True
    return False


# --- 2. Sort, then look at neighbours -----------------------------------------

def contains_duplicate_sort_scan(nums: list[int]) -> bool:
    ordered = sorted(nums)  # a copy; the caller's order is not disturbed
    for i in range(1, len(ordered)):
        if ordered[i] == ordered[i - 1]:
            return True
    return False


# --- 3. Build the whole set, then compare sizes -------------------------------

def contains_duplicate_set_length(nums: list[int]) -> bool:
    return len(set(nums)) != len(nums)  # builds every element before answering


# --- 4. Set with an early exit (optimal) --------------------------------------

def contains_duplicate_seen_set(nums: list[int]) -> bool:
    seen: set[int] = set()
    for x in nums:
        if x in seen:
            return True  # nothing later can change the answer
        seen.add(x)
    return False


# --- 5. Direct indexing, only when the values are small and bounded -----------

def contains_duplicate_direct_index(nums: list[int]) -> bool:
    if len(nums) < 2:
        return False
    lo, hi = min(nums), max(nums)
    if hi - lo + 1 > MAX_DIRECT_SPAN:  # the bounded-value assumption fails; fall back
        return contains_duplicate_seen_set(nums)
    mark = bytearray(hi - lo + 1)  # one byte per possible VALUE, not per element
    for x in nums:
        if mark[x - lo]:
            return True
        mark[x - lo] = 1
    return False


APPROACHES = [
    ("brute_force", contains_duplicate_brute_force),
    ("sort_scan", contains_duplicate_sort_scan),
    ("set_length", contains_duplicate_set_length),
    ("seen_set", contains_duplicate_seen_set),
    ("direct_index", contains_duplicate_direct_index),
]


# --- test suite ---------------------------------------------------------------

def _best_of(fn, rounds: int = 3) -> float:
    best = float("inf")
    for _ in range(rounds):
        start = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - start)
    return best


def _shapes(n: int) -> list[tuple[str, list[int]]]:
    """Same length, same values. Only WHERE the repeat sits changes."""
    rng = random.Random(20260913)
    distinct = rng.sample(range(-10**9, 10**9), n)
    early, late = list(distinct), list(distinct)
    early[1] = early[0]
    late[-1] = late[0]
    return [
        ("repeat at position 1", early),
        ("repeat at the last position", late),
        ("no repeat at all", distinct),
    ]


def trace_the_seen_set() -> None:
    """Every row of the hand-trace table in 'Reading the Calculations'."""
    for nums in ([1, 2, 3, 1], [1, 1, 2, 3]):
        print(f"=== {nums} ===")
        seen: set[int] = set()
        for step, x in enumerate(nums, 1):
            before = sorted(seen)
            hit = x in seen
            print(
                f"  {step}. x={x}  seen before {before}  in seen? "
                f"{'YES -> return True' if hit else 'no -> add it'}"
            )
            if hit:
                break
            seen.add(x)
        print(f"  probes {step}, values stored {len(seen)}")


def measure() -> None:
    """The numbers quoted in the 'Under the hood' callout. Counts are exact and reproduce
    anywhere; timings are one machine's, and the SHAPE of each column is the claim."""
    print("\n=== how much of the input each rung touches, n = 2,000 ===")
    print(f"  {'shape':>28} {'brute compares':>16} {'set probes':>12}")
    for label, nums in _shapes(2000):
        compares = 0
        brute = False
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                compares += 1
                if nums[i] == nums[j]:
                    brute = True
                    break
            if brute:
                break
        probes, seen, viaset = 0, set(), False
        for x in nums:
            probes += 1
            if x in seen:
                viaset = True
                break
            seen.add(x)
        assert brute == viaset
        print(f"  {label:>28} {compares:>16} {probes:>12}")

    print("\n=== wall clock at the ceiling, n = 10^5 ===")
    print(f"  {'shape':>28} {'sort ms':>9} {'len(set) ms':>12} {'early exit ms':>14}")
    for label, nums in _shapes(10**5):
        print(
            f"  {label:>28}"
            f" {_best_of(lambda d=nums: contains_duplicate_sort_scan(list(d))) * 1e3:>9.2f}"
            f" {_best_of(lambda d=nums: contains_duplicate_set_length(list(d))) * 1e3:>12.2f}"
            f" {_best_of(lambda d=nums: contains_duplicate_seen_set(list(d))) * 1e3:>14.2f}"
        )

    print("\n=== the worst case — no repeat — as n grows ===")
    print(f"  {'n':>10} {'sort ms':>9} {'len(set) ms':>12} {'early exit ms':>14}")
    rng = random.Random(5)
    for n in (10**4, 10**5, 10**6):
        nums = rng.sample(range(-10**9, 10**9), n)
        print(
            f"  {n:>10}"
            f" {_best_of(lambda d=nums: contains_duplicate_sort_scan(list(d))) * 1e3:>9.2f}"
            f" {_best_of(lambda d=nums: contains_duplicate_set_length(list(d))) * 1e3:>12.2f}"
            f" {_best_of(lambda d=nums: contains_duplicate_seen_set(list(d))) * 1e3:>14.2f}"
        )

    print("\n=== values stored before the answer is known (the one-liner always stores n) ===")
    print(f"  {'shape':>28} {'early exit stores':>18}")
    for label, nums in _shapes(10**5):
        seen = set()
        for x in nums:
            if x in seen:
                break
            seen.add(x)
        print(f"  {label:>28} {len(seen):>18}")


def main() -> None:
    trace_the_seen_set()
    measure()
    print()

    cases: list[tuple[str, list[int]]] = [
        ("statement example, a repeat", [1, 2, 3, 1]),
        ("statement example, all distinct", [1, 2, 3, 4]),
        ("smallest legal input", [1]),
        ("empty input", []),
        ("every element the same", [7, 7, 7, 7, 7]),
        ("repeat only at the very end", [5, 9, 2, 4, 5]),
        ("negatives, distinct", [-3, -1, 0, 2]),
        ("negatives, repeat", [-3, -1, 0, -3]),
        ("wide range, direct index falls back", [10**9, -10**9, 5]),
        ("wide range with a repeat", [10**9, -10**9, 5, 10**9]),
    ]

    rng = random.Random(20260912)
    for n in range(2, 40):
        spread = max(2, n // 2)  # deliberately narrow, so repeats are common
        cases.append((f"stress n={n}", [rng.randrange(-spread, spread) for _ in range(n)]))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums in cases:
        shown = nums if len(nums) <= 8 else nums[:8] + ["..."]
        print(f"\n{label}: nums={shown}")
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums))
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        # an independent check: a duplicate exists iff the distinct count is smaller
        truth = len(set(nums)) < len(nums)
        agreed = all(r == results[0] for r in results) and results[0] == truth
        if not agreed:
            all_agreed = False
            print(f"  DISAGREEMENT (independent check says {truth})")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
