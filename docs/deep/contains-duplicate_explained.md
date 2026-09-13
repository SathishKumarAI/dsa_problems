# Any Repeat in the Array? — explained

## Understanding the Problem

You are given a list of whole numbers. Answer one yes-or-no question: does the same number show up
more than once anywhere in the list? You are not asked *which* number repeats, not *where* it
repeats, and not *how many times* — only whether such a number exists at all. If every number in the
list is different from every other, the answer is no.

**The core question:** for each number, has this exact number appeared somewhere earlier in the
list? The naive approach is slow because it answers that question by comparing every number against
every other number, which is roughly n²/2 comparisons — and almost all of them are re-asking
something an earlier comparison already settled.

Notice how much weaker the question is than it first appears. "Is there a repeat?" needs far less
information than "which value repeats?" or "how many repeats are there?", and every improvement
below comes from noticing that you are allowed to throw information away.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `1 <= nums.length <= 10^5` | A hundred thousand elements makes O(n²) about 5·10⁹ comparisons — far too slow to run. **This constraint is what rules brute force out** and demands something at O(n log n) or better. It also means the list is never empty, though a defensive implementation should still survive an empty one. |
| `-10^9 <= nums[i] <= 10^9` | Values may be negative and span four billion possibilities. **This is the constraint that forbids the direct-indexing rung**: an array with one slot per possible value is not allocatable. Any lookup structure must therefore cope with arbitrary integer keys, which is a hash set's job. |
| a single element cannot repeat, so a one-element array is always `false` | The base case. Every approach below returns `false` on `[x]` without special-casing it — but it is worth checking, because loops written with an off-by-one can read `nums[-1]` on a one-element list. |
| values unbounded in range but bounded in count — no room to index by value | The problem states the trade-off explicitly. There are at most 10⁵ *elements* but 2·10⁹ *possible values*, so a structure sized by the data (a set, at most 10⁵ entries) is affordable and a structure sized by the value range is not. |
| *(implied)* you need existence, not identity | **This unlocks the early exit.** The instant a repeat is found, nothing later in the list can change the answer, so you may stop reading. This is worth saying out loud: it is the difference between an approach that always costs n and one that often costs far less. |

The worked example used in every section below is the statement's own:

```
nums = [1, 2, 3, 1]        answer: true   (the value 1 sits at both position 0 and position 3)
```

---

## Approach 1 — Brute force: compare every pair

### The idea

*How do I know whether two elements hold the same value?* Compare them. With no other tools, compare
every position against every position after it; if any comparison comes back equal, a duplicate
exists, and if none does, every element is distinct.

### How to think about it

Imagine a room of people and the question "do any two share a birthday?", with no way to write
anything down. You ask person 1 their birthday and then ask everyone else in turn whether it matches.
Then you start again with person 2, asking everyone after them — you do not go back to person 1,
because that conversation already happened. The shape of the reasoning is an outer walk that picks a
person and an inner walk that interrogates everyone to their right. Nothing is ever remembered
between rounds, so each round re-derives facts from scratch, and that amnesia is the whole
inefficiency.

### Worked example

`nums = [1, 2, 3, 1]`.

| outer `i` | `nums[i]` | inner `j` | `nums[j]` | equal? |
|---|---|---|---|---|
| 0 | 1 | 1 | 2 | no |
| 0 | 1 | 2 | 3 | no |
| 0 | 1 | 3 | 1 | **yes — return `true`** |

Three comparisons here, because the repeat involves the very first element. Change the input to
`[2, 3, 4, 1, 1]` and the same code makes nine comparisons before finding the pair at the end; with
no repeat at all on five elements it makes all ten. Ten is 5·4/2 — the number of distinct couples —
and that is where the O(n²) comes from.

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

Starting the inner loop at `0` instead of `i + 1`. Then the moment `j` equals `i` you compare
`nums[i] == nums[i]`, which is always true, and the function returns `True` for every non-empty
input — including `[1, 2, 3, 4]`, where the correct answer is `False`. It is a particularly nasty
bug because the function still "works" on every input that genuinely has a duplicate, so a test
suite that only checks positive cases passes clean. Guard it structurally by starting `j` at
`i + 1`, which also halves the number of comparisons, rather than by adding an `if i != j` check.

### Complexity and when to use this

**Time O(n²), space O(1).** Every one of the n starting positions scans the remaining tail, giving
roughly n²/2 comparisons; nothing at all is stored, so the only memory is two loop counters.

Use it when n is tiny — below roughly twenty elements the constant factors mean this genuinely beats
a hash set, because allocating and hashing costs more than a handful of integer comparisons. Use it
also as the oracle in a test suite, which is exactly its role at the bottom of this document: it is
obviously correct, so it is the thing you check the clever versions against. On this problem's
stated 10⁵ elements it is unusable, and saying so is the first move of a good interview answer.

---

## Approach 2 — Sort, then look at neighbours

### The idea

*Comparing every pair is wasteful — can the data be rearranged so that only a few comparisons
matter?* Yes. If equal values are forced to sit next to each other, then a duplicate can only ever
appear as two adjacent elements, so a single walk comparing each element with its immediate
predecessor settles the question.

This fixes brute force's weakness — **it compares elements that are obviously unrelated, because
nothing in an unsorted array tells you where a matching value might be.**

### How to think about it

Think of a shuffled deck of cards spread face-up on a table. To find whether any rank appears twice
you would have to check every card against every other. Now gather the deck and sort it: identical
ranks land shoulder to shoulder, and a single left-to-right sweep, glancing only at each card and
the one before it, answers the question. Sorting is the cost of *herding* equal values together; the
sweep afterwards is trivial. The catch is that this buys adjacency, and adjacency was never what you
asked for — it is a strong, expensive property that happens to imply the weak, cheap one you needed.

### Worked example

`nums = [1, 2, 3, 1]`.

**Restructure** — sort a copy, leaving the caller's array untouched:

```
original: [1, 2, 3, 1]
sorted:   [1, 1, 2, 3]
```

**Search** — walk from position 1, comparing each element with its predecessor:

| `i` | `ordered[i - 1]` | `ordered[i]` | equal? |
|---|---|---|---|
| 1 | 1 | 1 | **yes — return `true`** |

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

Sorting `nums` in place with `nums.sort()`. The function returns the right answer and silently
destroys the caller's array order — a side effect nobody asked for, and one that shows up as a bug
three functions away when the caller's positions no longer mean what they meant. Python's `sorted()`
returns a new list and leaves the input alone; in Java the equivalent is `nums.clone()` before
`Arrays.sort`. The second version of the same mistake is starting the sweep at `i = 0` and reading
`ordered[i - 1]`: in Python, `ordered[-1]` is the *last* element, so on a one-element list you
compare the only element with itself and wrongly return `True`.

### Complexity and when to use this

**Time O(n log n), space O(1) extra** — or O(n) if, as above, you copy rather than sort in place.
The two costs are worth naming separately, because that is this rung's lesson: **restructuring**
(the sort) is O(n log n) and dominates everything, while the **search** (the adjacency sweep) is only
O(n). Improving the sweep is pointless; the only way forward is to stop sorting.

Use it when memory is the tight resource. An in-place sort answers the question in constant extra
space, whereas the hash set below allocates room for up to n values — on 10⁵ integers that is a real
difference. Use it also when the array is already sorted for some other reason (then the whole cost
is the O(n) sweep), or when the calling code wants a sorted array anyway, in which case the sort is
not a cost at all but a side benefit.

---

## Approach 3 — Build the whole set, then compare sizes

### The idea

*Sorting buys adjacency, which is more than the question needs — what exactly does the question
need?* Only the count of distinct values. Pour every element into a set, which by definition keeps
one copy of each value, and compare the set's size with the list's length: if the set is smaller,
something collapsed, and something can only collapse if it was a repeat.

This fixes Approach 2's weakness — **it pays O(n log n) to order the data, when the question is
about membership and not about order at all.**

### How to think about it

Picture pouring a bag of marbles into a machine that keeps one marble of each colour and discards the
rest. Count what you poured in, count what comes out. If the counts differ, some colour appeared
twice. This is the first genuinely linear idea on the ladder and it is a real improvement, but it is
also the instinctive one-liner — it answers the question by *first computing something strictly
larger*: the complete catalogue of every distinct value. That catalogue is more than a yes/no needs,
and building all of it means you can never stop early, no matter how obvious the answer becomes.

### Worked example

`nums = [1, 2, 3, 1]`.

| after pouring in | set contents | size so far |
|---|---|---|
| `nums[0] = 1` | `{1}` | 1 |
| `nums[1] = 2` | `{1, 2}` | 2 |
| `nums[2] = 3` | `{1, 2, 3}` | 3 |
| `nums[3] = 1` | `{1, 2, 3}` — already present, absorbed | 3 |

Final comparison: set size 3, list length 4. They differ, so the answer is `true`.

Look at the third row. After reading `nums[3]` the answer was already decided, but this approach had
no way to notice — it does not compare anything until the pouring is completely finished. On this
four-element input that costs nothing, but on `[1, 1, <99998 more elements>]` it reads all hundred
thousand elements to learn something the second one already proved.

### Code

```python
def contains_duplicate_set_length(nums: list[int]) -> bool:
    return len(set(nums)) != len(nums)  # builds every element before answering
```

### Common mistake

Reaching for this shape when the input is a *generator* or any other one-shot iterable rather than a
list. `len(set(gen)) != len(gen)` fails outright, because a generator has no length; and the
"obvious" repair — `len(set(items)) != len(list(items))` — consumes the generator on the first call
so the second sees an empty sequence and the function returns `False` for everything. The deeper
point is that this one-liner quietly requires an input it can measure and traverse twice. The
element-by-element approaches below need neither, which makes them the safer default in real code
even though this line is shorter.

### Complexity and when to use this

**Time O(n), space O(n).** Every element is hashed and inserted exactly once, each at O(1) average
cost, so the total is linear; the space is the set, which in the worst case (all distinct) holds all
n values. Note the asymmetry with Approach 4: the *worst case* of the two is identical, and only the
best and average cases differ — but they differ a lot, because the early exit fires on the first
repeat rather than at the end of the array.

Use it when the code matters more than the microseconds, which in practice is most of the time: it
is one line, it is impossible to get subtly wrong, and any reader understands it instantly. Prefer
Approach 4 when the arrays are long, when duplicates are expected early, or when the input is a
stream you can only walk once.

---

## Approach 4 — A set with an early exit (optimal)

### The idea

*If the answer is decided the moment a repeat appears, why keep reading?* Walk the list once,
carrying a set of the values already seen. Before adding each value, ask whether it is already there
— if it is, return immediately, and if the walk reaches the end, everything was distinct.

This fixes Approach 3's weakness — **it builds the entire catalogue before answering, so it always
pays for the whole array even when the answer was settled at element two.**

### How to think about it

You are a bouncer at a door with a guest list you are writing yourself. Each person arrives; you
check whether their name is already on your list. If it is, you have caught a gatecrasher and the
night is over — no reason to check the queue behind them. If it is not, you add the name and call
the next person. The list only ever contains the past, and the question "have I seen this?" is asked
against exactly that past. The whole method is one walk, one question per element, and a decision
that can happen at any moment rather than only at the end.

### Worked example

`nums = [1, 2, 3, 1]`.

| step | value | already in `seen`? | action | `seen` after |
|---|---|---|---|---|
| 1 | 1 | no (empty) | add it | `{1}` |
| 2 | 2 | no | add it | `{1, 2}` |
| 3 | 3 | no | add it | `{1, 2, 3}` |
| 4 | 1 | **yes** | return `true` | — |

Four lookups and three insertions. On this input it matches Approach 3's work exactly — the repeat
is at the last position, so there was nothing to save. The difference shows on `[1, 1, 2, 3]`: this
approach stops after two elements, while the set-length version reads all four. In the worst case
they are identical; in the common case this one is strictly better and never worse.

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

Putting the `return False` inside the loop:

```python
for x in nums:
    if x in seen:
        return True
    seen.add(x)
    return False          # WRONG — indented into the loop
```

The function now returns after examining the very first element and answers `False` for every input
whose duplicate is not at position 0 and 1 — for instance `[1, 2, 3, 1]`, where it never reads past
the 1 and the 2. The indentation of that one line is the difference between "no duplicate anywhere"
and "no duplicate in the first element", and Python will not warn you. The rule underneath it: a
loop that searches returns its negative answer *after* the loop, because the negative answer is a
claim about everything, and you cannot make a claim about everything until you have seen everything.

A related trap in Java: `seen.add(x)` returns `false` when the value was already present, so
`if (!seen.add(x)) return true;` is the idiomatic one-liner — but writing `if (seen.add(x))` inverts
the test and returns `true` for arrays that are entirely distinct.

### Complexity and when to use this

**Time O(n), space O(n).** One pass, with a hash lookup and at most one hash insertion per element —
both O(1) on average — so the work is linear in the number of elements examined, and the early exit
means that number is often far below n. The space is the set: up to n values when everything is
distinct, which is the price paid for not sorting. Strictly, hash operations are O(1) *expected*
rather than guaranteed; adversarially chosen keys can collide and degrade a pass to O(n²), which is
the one theoretical edge the sorting approach holds.

**This is the default answer.** It is linear, it is four lines, it stops as soon as it knows, and it
does not disturb the caller's array. Choose sorting over it only when extra memory is genuinely
unavailable, and choose brute force over it only for toy-sized inputs.

---

## Approach 5 — Direct indexing when the values are small and bounded

### The idea

*A hash set handles arbitrary keys — but what if the keys are not arbitrary?* If every value lies
inside a small known range, replace the set with a plain array of flags indexed by `value - lowest`.
The algorithm is Approach 4 unchanged; only the lookup changes, from a hash computation and a bucket
probe to a single memory read.

This fixes no complexity weakness of Approach 4 — both are O(n) — but it removes a constant factor:
**every hash-set operation costs a hash computation and a probe, and the set's internal bookkeeping
grows and rehashes as it fills.**

### What must be true, and what breaks if it is not

The assumption is that `max(nums) - min(nums)` is small enough to allocate one flag per possible
value. **This problem's constraints say it is not**: values span −10⁹ to 10⁹, so the flag array would
need two billion slots. The implementation below measures the span first and falls back to the hash
set when the assumption fails — meaning that on the problem as literally stated this rung is a hash
set in disguise. It is included because the shape recurs constantly: the moment a problem says
"values are 1 to 100", "the input is lowercase letters", or "all values are digits", swap the set for
an array and take the win.

Without the guard, an unguarded allocation on the stated range is not a wrong answer but a dead
process — an immediate out-of-memory. The subtler break is forgetting the `- lo` offset: with
negative values present, `mark[x]` indexes from the wrong end of the array in Python (a negative
index wraps) and throws in Java or C++.

There is a stricter cousin worth knowing. When the problem promises the values are a permutation-like
range such as 1…n, you can mark "seen" *inside the input array itself* by negating the sign of the
element at the index a value points to, which answers the question in O(n) time and **O(1) extra
space**. It is the right tool when the value range coincides with the index range and the input may
be modified — and it is strictly wrong here, where the values have no relationship to the indices.

### Worked example

`nums = [1, 2, 3, 1]`. Here `lo = 1` and `hi = 3`, so three flag slots cover every possible value,
all starting at 0 for "not seen".

| step | value | slot index (`value - 1`) | flag before | action | flags (`1`, `2`, `3`) |
|---|---|---|---|---|---|
| 1 | 1 | 0 | 0 | set the flag | `1, 0, 0` |
| 2 | 2 | 1 | 0 | set the flag | `1, 1, 0` |
| 3 | 3 | 2 | 0 | set the flag | `1, 1, 1` |
| 4 | 1 | 0 | **1** | return `true` | — |

Identical bookkeeping to Approach 4, with the set replaced by three bytes and the hash replaced by a
subtraction. Note the two extra passes hidden at the start: `min(nums)` and `max(nums)` each read the
whole array before the main walk can even begin.

### Code

```python
def contains_duplicate_direct_index(nums: list[int], span_limit: int = 1 << 20) -> bool:
    if len(nums) < 2:
        return False
    lo, hi = min(nums), max(nums)
    if hi - lo + 1 > span_limit:  # the bounded-value assumption fails; fall back
        return contains_duplicate_seen_set(nums)
    mark = bytearray(hi - lo + 1)  # one byte per possible value, not per element
    for x in nums:
        if mark[x - lo]:
            return True
        mark[x - lo] = 1
    return False
```

### Common mistake

Sizing the flag array by `len(nums)` instead of by the value range, and indexing it with the value:
`mark = bytearray(len(nums))` followed by `mark[x]`. It looks plausible — the array is "big enough"
— and it happens to work on inputs like `[0, 1, 2, 0]` where values and indices coincide, which is
exactly what makes it dangerous. On `[1, 2, 3, 1]` it indexes `mark[3]` on a four-slot array and
survives by luck; on `[5, 9, 5]` it indexes `mark[5]` on a three-slot array and crashes. The array
must be sized by **how many values are possible**, not by **how many elements there are** — those
are two different quantities, and this problem's constraints say so in as many words.

### Complexity and when to use this

**Time O(n + V), space O(V)**, where V is the size of the value range. The `O(V)` term is the
allocation and zeroing of the flag array — free when V is a few hundred, impossible when V is two
billion — and it is why this approach can be *slower* than a hash set on a short array with widely
spread values. The per-element work is a subtraction and an array read, several times faster in
practice than a hash lookup even though both are O(1).

Use it when the problem bounds its values to a small range: characters, digits, grades, small enum
codes, ages. Do not use it here, where the constraints rule it out — and say that out loud in an
interview, because naming the technique and then rejecting it on the stated value range shows you
read the constraints rather than pattern-matched the problem.

---

## The Overall Arc

The single principle running through this ladder is that **an answer should cost no more than the
question is worth**, and every rung is a discovery that the previous one computed something bigger
than it was asked for. Brute force computes, implicitly, the entire table of which pairs are equal —
n²/2 facts — when a single yes/no was wanted, and it does so with no memory at all, so the same
values are compared over and over from different starting points. Sorting is the first instinct for
killing a repeated scan, and it works because it herds equal values into adjacency, collapsing the
search to one comparison per position; but adjacency is a much stronger property than "a repeat
exists", it costs O(n log n) to manufacture, and the sweep that consumes it is only linear — so the
restructuring is the entire bill and the search is free, which is the signal that the restructuring
is the wrong thing to be buying. The question was never about order; it was about membership, and
membership has its own structure. A set answers "have I seen this value?" directly in one step, and
pouring the whole array into one and comparing sizes is linear at last — but it still overshoots, because
it constructs the complete catalogue of distinct values before comparing anything, and so it cannot
stop early no matter how quickly the answer becomes obvious. Interleaving the question with the
building fixes that last piece of waste: ask before you insert, and the walk ends at the first
repeat instead of at the end of the array, which is the same *asymptotic* cost and a very different
*actual* cost. The last rung stops improving the algorithm and improves the machine underneath it —
if the values were small and bounded, the array index would be the hash and even the hashing would
disappear — but this problem's ±10⁹ range explicitly forbids it, which is itself the lesson: a
technique is unlocked by a constraint, not chosen by preference. What matters most in an interview
is naming the trade rather than jumping to the answer: sorting is O(n log n) at constant memory and
leaves the data useful for other questions, the set is linear time at linear memory, and which of
those is "better" depends entirely on which resource is scarce.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | O(n²) | O(1) | Remembers nothing, so every fact is rediscovered | n is tiny (under ~20); as the test-suite oracle |
| Sort + adjacent scan | O(n log n) | O(1) in place, O(n) if copied | Buys adjacency — more than the question needs — but at almost no memory cost | Memory is the tight resource; input already sorted; caller wants it sorted anyway |
| Set size vs list length | O(n) | O(n) | Linear and one line, but computes the full distinct catalogue and cannot exit early | Readability over microseconds; short arrays; quick scripts |
| **Seen-set with early exit** | **O(n)** | **O(n)** | **Trades memory for time and stops the instant the answer is known** | **The default answer for this problem** |
| Direct-index flags | O(n + V) | O(V) | Drops hashing entirely, but only if the value range is small enough to allocate | Values bounded to a small known range — **not** this problem's ±10⁹ |

---

## Interview Priority

**Memorize cold — the seen-set with early exit.** Four lines, linear, and the expected answer. What
matters is not typing it but explaining the two decisions inside it: why the question comes before
the insertion, and why `return False` sits outside the loop. Both are correctness arguments, and
both are follow-up questions waiting to be asked.

**Memorize cold — sort plus the adjacency scan.** Keep this one for the trade-off conversation. When
the interviewer says "now do it in constant extra space", this is the answer, and being able to
switch to it immediately — while naming what you give up, namely linear time and the caller's array
order — is worth more than knowing the fast version alone. It is also the approach that generalises
to "are there duplicates within k positions of each other?" and to the several interval problems
that begin with a sort.

**Understand but do not memorize — brute force.** Worth ten seconds at the start of the answer, to
name the baseline and its O(n²) cost, and worth real use as the oracle you validate against. Nothing
to recall beyond "compare every pair, start the inner loop at `i + 1`".

**Understand but do not memorize — the set-length one-liner.** You will write this in real code all
the time and that is fine. In an interview it invites the question "can you avoid reading the whole
array?", so it is better as the thing you mention and then improve than as the thing you submit. Do
know its one real failure mode: it needs an input with a length that can be measured and traversed
twice.

**Understand but do not memorize — direct indexing.** Nothing to recall, one thing to recognise:
when a problem bounds its values to a small range, an array of flags replaces the hash set, and when
the values are a range like 1…n, in-place sign marking gets you to O(1) extra space. Spotting which
constraint would unlock either is the transferable skill; the code is three lines you can derive on
the spot.

---

## Full Runnable Script

Every approach above, plus a test suite covering the statement's two examples, the smallest legal
input, an empty array, an all-identical array, a repeat that appears only at the very end,
negatives, values outside any indexable range (forcing the direct-index fallback), and 38 randomised
stress cases drawn from a deliberately narrow value range so repeats are common — each one
cross-checked against brute force, against every other approach, and against an independent
distinct-count test.

```python
"""Any Repeat in the Array? - every approach in one file, plus a self-checking test suite.

Run: python contains_duplicate_all.py
"""

from __future__ import annotations

import random


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

def contains_duplicate_direct_index(nums: list[int], span_limit: int = 1 << 20) -> bool:
    if len(nums) < 2:
        return False
    lo, hi = min(nums), max(nums)
    if hi - lo + 1 > span_limit:  # the bounded-value assumption fails; fall back
        return contains_duplicate_seen_set(nums)
    mark = bytearray(hi - lo + 1)  # one byte per possible value, not per element
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

def main() -> None:
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
