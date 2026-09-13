# Single Number — Explained

## Understanding the Problem

You are given a list of whole numbers in which every value shows up exactly twice, except for one
value that shows up once. Find that one value. Nothing is sorted, the pairs are not next to each
other, and you are told nothing about where the loner sits.

**The core question: how do you notice which value has no partner without remembering every value
you have seen?** The naive approach is slow because it answers "does this one have a partner?" by
re-reading the whole list for each element, so one pass over the input turns into `n` passes.

Two pieces of vocabulary, expanded once:

- **XOR** (written `^`, spoken "exclusive or") is a light switch. Feed it a `1` and the switch
  flips; feed it a `0` and nothing happens. Do that independently in every bit column of two
  numbers and you get their XOR: `5 ^ 3` is `101 ^ 011 = 110`, which is `6`.
- **Constant extra space** (`O(1)`) means the memory you allocate does not grow with the input: a
  handful of variables, not a container that holds one entry per element. Copying the input in
  order to sort it is not constant space unless you may sort the caller's array in place.

### The constraints, and what each one unlocks

| Constraint | What it forces or permits |
|---|---|
| `1 <= nums.length <= 3 * 10^4` | The array is never empty, so there is always an answer and no "not found" case to design for. The single-element input `[1]` is legal and every approach must survive it — it is the **edge case** that breaks a sort-and-scan written with the wrong loop bound. |
| `-3 * 10^4 <= nums[i] <= 3 * 10^4` | **This is the constraint that unlocks direct indexing.** Sixty thousand and one possible values means one byte per value is a 60 KB table, which fits comfortably. Widen the values to 64 bits and that approach dies instantly, while every other approach here is unaffected. |
| `nums.length` is always odd | A free **sanity check**: pairs contribute an even count and the loner makes it odd. An even length means the input violates its own promise. |
| **every value appears exactly twice except one, which appears once** | **This is the promise the XOR solution is built on, and it is load-bearing.** XOR cancels a *pair*; it does not cancel a triple. If some value appeared three times, or if two values appeared once each, the XOR fold would return the XOR of every odd-count value, which is usually not any element of the array at all — and it would return it confidently, with no error. The hash map degrades gracefully under the same violation (it returns *a* value with count 1); XOR does not. |
| linear time, constant space (the follow-up) | This is what disqualifies the **hash map**, which is otherwise perfectly good, and what disqualifies sorting into a copy. |

The worked example traced in every section below is the statement's second one:

```
nums = [4, 1, 2, 1, 2]        answer: 4
```

---

## Approach 1 — Brute force: for each value, count its occurrences  *(an addition — not in the data file's ladder)*

### The idea

*What is the most direct thing that could possibly work?* For each element, count how many times it
occurs in the whole array; the one whose count is `1` is the answer. *Why is that not the answer?*
Because counting occurrences means walking the entire array, and you do that once per element, so
the two walks multiply.

### How to think about it

> **Intuition.** A drawer of loose socks and no table to lay them out on. You pull out one sock,
> then rummage through the entire drawer looking for its match; if you find one, you drop both back
> in and pull out the next sock. Every rummage is a full pass over the drawer, and the instant it
> ends you forget everything it told you — the rummage for the first sock passed over every other
> sock in there and learned nothing you kept. That **amnesia** is the whole inefficiency, and every
> later rung is a different way of writing something down.

### Worked example

`nums = [4, 1, 2, 1, 2]`. Each count is a full five-element scan.

| Outer element | `nums.count(x)` scans and finds | count | action |
|---|---|---|---|
| `4` (index 0) | one match, at index 0 | 1 | **return `4`** |

That is the whole trace, because the loner happens to sit first — this input is the brute force's
best case. Move the loner to the end (`[1, 2, 1, 2, 4]`) and you get the worst case instead:

| Outer element | count | action |
|---|---|---|
| `1` | 2 | keep going |
| `2` | 2 | keep going |
| `1` | 2 | keep going |
| `2` | 2 | keep going |
| `4` | 1 | **return `4`** |

Five scans of five elements: twenty-five comparisons to find one number.

### Code

```python
def single_number_brute(nums: list[int]) -> int:
    for x in nums:
        if nums.count(x) == 1:  # count() is itself a full pass
            return x
    return NOT_FOUND
```

### Common mistake

> **Watch out.** The misconception is that `!= 2` and `== 1` are **the same test**, because the
> promise says everything else appears twice. They are the same test only while the promise holds —
> and the whole point of the follow-up variants is to break it.

Writing `if nums.count(x) != 2: return x` passes every well-formed case and then silently returns
the wrong element the moment a value appears three or four times, which is exactly the follow-up
version of this problem. Test for the property you actually want rather than for the negation of the
property you expect everything else to have.

### Complexity and when to use this

**Time** `O(n²)`, **space** `O(1)`. The time is `n` outer elements times an `n`-element scan inside
`count()`; the early return helps on lucky inputs and does nothing in the worst case. The space is a
single loop variable — nothing is stored.

Use it as the thirty-second spoken answer, and as the **oracle** a test harness checks the clever
versions against, which is what the script at the bottom of this document does with it. At
`n = 3 × 10^4` the worst case is about `9 × 10^8` comparisons — slow, but notably not fatal, which is
why this version sometimes sneaks through weak test suites.

---

## Approach 2 — Hash map of counts

### The idea

*The brute force recomputes counts it has already computed — what if every count were computed once
and kept?* Walk the array once building a map from value to how many times it occurred, then walk
the map and return the key whose count is `1`.

This fixes brute force's central weakness — **it re-reads the entire array once per element** — at a
price the follow-up forbids: the map holds up to `n` entries.

### How to think about it

> **Intuition.** A tally sheet pinned to the wall next to the drawer. Pull socks out one at a time
> and, instead of rummaging, put a pencil mark next to that colour on the sheet. When the drawer is
> empty, read down the sheet for the colour with a single mark. You never search — you write once
> and read once. The thing to notice is how **lopsided** the bookkeeping is: the sheet ends up
> holding `n/2` colours and their marks so that you can use exactly one of them and throw the rest
> away. That gap between what was stored and what was needed is the opening the last two rungs walk
> through.

### Worked example

`nums = [4, 1, 2, 1, 2]`.

**Pass 1 — build the tally:**

| Step | value read | `counts` after |
|---|---|---|
| start | — | `{}` |
| 1 | `4` | `{4: 1}` |
| 2 | `1` | `{4: 1, 1: 1}` |
| 3 | `2` | `{4: 1, 1: 1, 2: 1}` |
| 4 | `1` | `{4: 1, 1: 2, 2: 1}` |
| 5 | `2` | `{4: 1, 1: 2, 2: 2}` |

**Pass 2 — scan the tally for a count of `1`:**

| entry | count | action |
|---|---|---|
| `4 → 1` | 1 | **return `4`** |

Three map entries were built to answer with one of them. Note that after step 3 the map claimed all
three values were loners; only the rest of the input settled which one really was, so **no early
exit is possible** during pass 1.

### Code

```python
def single_number_hash_map(nums: list[int]) -> int:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    for x, c in counts.items():
        if c == 1:
            return x
    return NOT_FOUND
```

### Common mistake

> **Watch out.** The misconception is that a count of `1` is **news** — that the first time a value
> reaches one mark you have learned something. You have not. Every value has one mark the first time
> it is read; only the end of the input distinguishes a loner from a pair you have half-seen.

In the trace above, `4`, `1` and `2` all hold count `1` after step 3, so returning from inside the
first loop returns `4` on this input and `1` on `[1, 2, 1, 2, 4]`. A related and more tempting
variant is a **set** with add/discard (`if x in seen: seen.remove(x) else: seen.add(x)`), returning
`seen.pop()` — that one is genuinely correct under the promise and rather elegant, but it is still
`O(n)` space, so it does not escape this rung.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n)`. The time is one pass to build the map plus one pass over its at
most `n` entries, with constant-time hash operations throughout. The space is the map: roughly
`n/2 + 1` entries, each holding a key and a count.

Use it when the promise is **weaker** than the one stated here — values may appear three times, there
may be several loners, or you need the counts for anything else afterwards. The counting map
generalises to every variant of this problem, which is exactly why it is worth being fluent in even
though it loses on this particular statement.

---

## Approach 3 — Sort, then scan in steps of two

### The idea

*The map costs `O(n)` memory — can the partners be put next to each other without a container?* Sort
the array and every pair becomes adjacent, so walking in steps of two lands on the first element of
each pair; the first position where `s[i] != s[i + 1]` is where the loner broke the alignment.

This fixes the hash map's **memory** — sorting in place needs no extra container — at the price of
`O(n log n)` time, which breaks the other half of the follow-up.

### How to think about it

> **Intuition.** Tip the drawer out and line the socks up by colour. Now "does this one have a
> partner?" stops being a question about the whole drawer and becomes a question about the sock
> immediately to its right — a **local** question, answerable with one glance. Walk the line two at
> a time, checking each couple. Every couple before the loner sits neatly in an even slot and an odd
> slot; the loner shoves everything after it along by one, and that shove is exactly what the check
> detects.

> **Why it works.** The invariant is an alignment: **before the loner, every pair occupies an even
> index and the odd index directly after it.** So a step-of-two walk that finds `s[i] == s[i + 1]`
> has confirmed a whole pair and may skip both. The first `i` where they differ is the first index
> past which the alignment is broken, and only the loner can break it — which makes `s[i]` the
> answer. If the walk never finds a break, the loner never displaced anything, so it must sort last:
> hence the trailing `return s[-1]`.

### Worked example

`nums = [4, 1, 2, 1, 2]`.

**Restructure:** `sorted(nums)` → `[1, 1, 2, 2, 4]`.

**Scan** — `range(0, len(s) - 1, 2)` gives `i = 0, 2`:

| `i` | `s[i]` | `s[i+1]` | equal? | action |
|---|---|---|---|---|
| 0 | `1` | `1` | yes | a complete pair — step past both |
| 2 | `2` | `2` | yes | a complete pair — step past both |
| — | loop ends: `i = 4` is past `len(s) - 1 = 4` | — | — | **return `s[-1]` = `4`** |

Answer `4`. Here the loner was the largest value, so the loop found nothing and the final `return`
did the work. Had the input been `[4, 1, 4, 2, 2]` the sorted form would be `[1, 2, 2, 4, 4]`, and at
`i = 0` the check `s[0] = 1 != s[1] = 2` would fire and return `1` immediately.

### Code

```python
def single_number_sort_scan(nums: list[int]) -> int:
    s = sorted(nums)
    for i in range(0, len(s) - 1, 2):
        if s[i] != s[i + 1]:
            return s[i]
    return s[-1]  # never misaligned: the loner is the last element
```

### Common mistake

> **Watch out.** The misconception is that **the loop must find it** — that a value with no partner
> has to trip the inequality somewhere. It does not. A loner that sorts last displaces nothing, so
> every couple the loop inspects is a genuine pair and the loop simply runs out.

Dropping the final `return s[-1]` therefore returns `None` on the exact case traced above, and also
on the single-element input `[1]`, where `range(0, 0, 2)` is empty and the body never runs at all.
Those are the two inputs most likely to be in a test suite.

### Complexity and when to use this

**Time** `O(n log n)`, **space** `O(1)` in place — `O(n)` as written, because `sorted()` builds a
copy. The time is entirely the **sort**; the scan is a single linear pass that does not change the
order of growth. The space depends on one decision: `nums.sort()` mutates the caller's array and
needs no extra room, while `sorted(nums)` leaves the input alone and allocates a second one.

Use it when mutating the input is acceptable, memory is the binding constraint, and the values are
**not integers** — because the next approach is the better answer for integers and only for integers.
Sorting is indifferent to what the values *are*; XOR is not.

---

## Approach 4 — XOR everything together (optimal)

### The idea

*Both previous rungs build something in order to cancel pairs — is there an operation that cancels a
pair all by itself?* There is. Flip a light switch twice and the room is exactly as you found it, and
that "twice undoes once" is `^` acting in every bit column at once.

This fixes both previous weaknesses at the same time — the hash map's `O(n)` **memory** and the
sort's `O(n log n)` **time** — by collapsing the entire state of the algorithm to one integer.

### How to think about it

> **Intuition.** Picture a row of light switches, one per bit column, all off. Walk the array and
> for each number flip the switches in the columns where that number has a `1`. Two equal numbers
> flip exactly the same switches, so the second one undoes the first and the room forgets they were
> ever there — it does not matter how far apart in the array they sat, because flipping is
> **order-blind**. When the walk ends, the only switches still on are the ones the loner flipped.
> Read the row and you have read the answer.

The cleanest way to hold it: XOR is **addition without carrying**, one bit column at a time. Each
column ends up holding the parity of how many `1`s passed through it, and a pair contributes two `1`s
or two `0`s — even either way — so pairs are invisible in every column.

> **Why it works.** The invariant is that after reading `k` elements, `acc` equals the XOR of
> exactly those `k` elements. XOR is **commutative and associative**, so that fold may be
> re-bracketed and re-ordered freely: mentally slide the two copies of each value next to each other.
> Each such couple collapses by `x ^ x == 0`, and `0` is the **identity** (`0 ^ y == y`), so it
> vanishes from the expression without disturbing the rest. What is left is the one value with no
> partner. Note which half of the promise is doing the work: *even* multiplicity, not exactly two —
> a value appearing four times also disappears, a value appearing three times does not.

### Worked example

`nums = [4, 1, 2, 1, 2]`. In binary: `4 = 100`, `1 = 001`, `2 = 010`.

| Step | value | binary | `acc` before | `acc` after | as a number |
|---|---|---|---|---|---|
| start | — | — | — | `000` | 0 |
| 1 | `4` | `100` | `000` | `100` | 4 |
| 2 | `1` | `001` | `100` | `101` | 5 |
| 3 | `2` | `010` | `101` | `111` | 7 |
| 4 | `1` | `001` | `111` | `110` | 6 |
| 5 | `2` | `010` | `110` | `100` | **4** |

Answer `4`. Watch the **columns** rather than the numbers: the `001` switch went on at step 2 and
back off at step 4; the `010` switch on at step 3 and off at step 5; the `100` switch was set at step
1 and nothing ever touched it again. The intermediate values `5`, `7` and `6` are not elements of the
array and are not claims about anything — which is the usual reason this rung feels like magic on a
first read. Only the final value means something.

### Code

```python
def single_number(nums: list[int]) -> int:
    acc = 0
    for x in nums:
        acc ^= x  # pairs cancel to 0; 0 ^ loner is the loner
    return acc
```

### Common mistake

> **Watch out.** The misconception is that a fold must be **seeded from the first element**, the way
> a running maximum usually is. XOR needs no seed: `0` is its identity, so starting there is free and
> also makes the degenerate empty input return `0` instead of raising.

Seeding `acc = nums[0]` and then looping over *all* of `nums` XORs the first element in twice and
cancels it — returning `0` on `[1]`, and the wrong value in general. Seed from the first element only
if you also skip it (`for x in nums[1:]`).

A second worry that turns out not to be one: **negative numbers**. Python integers are unbounded, but
`^` behaves as though they were written in two's complement with infinitely many leading sign bits,
so `x ^ x` is still exactly `0` and the fold is unchanged — the script's negative-loner case confirms
it.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. The time is one pass with one machine instruction per element — no
hashing, no comparison, no branch. The space is a single integer and it does not grow with `n`; this
is the strictest reading of constant space that any approach here achieves.

Use it whenever the values are integers and the pairing promise holds. The transferable habit: **when
duplicates arrive in pairs and you need the odd one out, reach for an operation with an inverse
rather than for a container.** Know where it stops, too — the follow-up where every value appears
three times except one breaks XOR entirely, and the replacement is counting each bit position modulo
`3`, which is the same per-column parity idea at a different base.

---

## Approach 5 — Direct indexing: one toggle per possible value  *(an addition — not in the data file's ladder)*

### The idea

*XOR cancels every pair inside one shared accumulator — what if each value had its own private
accumulator?* The values are bounded, so you can afford one byte per possible value and flip it each
time that value is seen; a pair flips its byte on and back off, and the single byte left standing
names the answer.

*What limitation does this fix?* **None that matters** — it is not better than XOR. It is here
because it is what the value-range constraint actually unlocks, and because the same technique is the
right answer to neighbouring problems where no cancelling operation exists.

### How to think about it

> **Intuition.** Instead of one row of switches shared by every number, build a wall with one switch
> per possible *value* — sixty thousand and one of them, all off. Read the array and slap the switch
> belonging to each value you meet. A value seen twice gets slapped twice and ends up off again. At
> the end you walk the wall looking for the one switch still glowing, and its **position** on the
> wall is the answer, not its contents. That is the trade: XOR was tiny and had to be decoded, this
> is enormous and needs no decoding at all.

### What must be true, and what breaks if it is not

It needs `-3 * 10^4 <= nums[i] <= 3 * 10^4`, which this problem grants. That is 60,001 slots, 60 KB
at one byte each — a fixed cost that does not grow with `n`, so it is technically `O(1)` space for
*this* problem while being `O(R)` space in general, where `R` is the size of the value range. Remove
the bound and it breaks immediately: 64-bit values would need an eighteen-quintillion-entry table.

The **offset** is the other requirement. Values can be negative, so the slot number is `x - VALUE_LO`;
forgetting that subtraction sends negative values to negative indices, which Python silently wraps to
the far end of the array rather than rejecting.

### Worked example

`nums = [4, 1, 2, 1, 2]`, with `VALUE_LO = -30000`, so value `v` lives in slot `v + 30000`. Only the
three interesting slots are shown; all 60,001 start at `0`.

| Step | value | slot | slot before | after `^= 1` |
|---|---|---|---|---|
| 1 | `4` | 30004 | 0 | **1** |
| 2 | `1` | 30001 | 0 | 1 |
| 3 | `2` | 30002 | 0 | 1 |
| 4 | `1` | 30001 | 1 | 0 |
| 5 | `2` | 30002 | 1 | 0 |

**Final sweep** over all slots, looking for the one still holding `1`:

| slot | value it represents | flag |
|---|---|---|
| 0 … 30000 | `-30000` … `0` | 0 |
| 30001 | `1` | 0 |
| 30002 | `2` | 0 |
| 30003 | `3` | 0 |
| **30004** | **`4`** | **1 → return `4`** |

Answer `4`. The sweep examined thirty thousand slots to find it — that is the shape of the cost here:
independent of `n`, proportional to the **value range**.

### Code

```python
VALUE_LO, VALUE_HI = -30_000, 30_000  # the range the statement promises

def single_number_bucket(nums: list[int]) -> int:
    """One byte per possible value, toggled: a pair returns its slot to 0."""
    seen = bytearray(VALUE_HI - VALUE_LO + 1)
    for x in nums:
        seen[x - VALUE_LO] ^= 1  # the value IS the index; no hashing at all
    for i, flag in enumerate(seen):
        if flag:
            return i + VALUE_LO  # undo the offset to recover the value
    return NOT_FOUND
```

### Common mistake

> **Watch out.** The misconception is that a **count** is always at least as informative as a
> **parity**, so `+= 1` must be the safer choice. In a `bytearray` it is strictly worse: the slot
> wraps at 256, so a value appearing 256 times reports `0` and disappears without a sound.

Toggling with `^= 1` keeps every slot to the single bit this problem needs — "seen an odd number of
times" — and cannot overflow. If you genuinely need counts, use a list of `int` and accept the
memory.

### Complexity and when to use this

**Time** `O(n + R)`, **space** `O(R)`, where `R = 60,001` is the size of the value range. The `n` is
the toggling pass; the `R` is the final sweep across every slot whether or not anything landed in it,
which is why this is slower than XOR on small inputs despite doing less work per element. The space
is one byte per possible value, allocated up front regardless of how many values you actually see.

Use it when the value range is small and known and **no algebraic trick is available** — counting
sort, frequency histograms over bytes or characters, "which of the 26 letters is missing". For *this*
problem XOR wins on every axis, and the point of writing this version is to be able to say why the
bound on the values matters at all.

---

## The Overall Arc

Every rung of this ladder is a different answer to one question: **how much do you need to remember
in order to notice that one thing has no partner?** The brute force remembers nothing and pays for it
by re-reading the array once per element, recomputing counts it has already computed and discarding
them again. The hash map fixes that by remembering everything exactly once — genuinely linear, and
the honest instinctive answer — but it stores `n/2` distinct values and their counts in order to
report a single number, and the follow-up's constant-space requirement is really an observation that
almost all of that memory is waste. Sorting attacks the same waste from the opposite direction: it
remembers nothing extra and instead rearranges the input so that "has a partner" becomes a question
about the adjacent slot, which is elegant and costs `n log n` to impose an ordering the question never
asked for. XOR is what happens when you stop looking for a *container* and start looking for an
*operation*: because `x ^ x` is `0` and the fold can be re-ordered freely, every pair annihilates
wherever it sits, and the entire state collapses to one integer — linear time, genuinely constant
space, no comparison and no hash. That collapse is only legal because the problem promised the
non-answers come in exact pairs, which is worth saying out loud, since the same fold returns a
confident wrong number the moment a value appears three times. The last rung goes the other way,
giving each possible value its own private one-bit accumulator, which the bounded value range permits
and which nothing else about the problem rewards — it is slower than XOR and far larger, and it earns
its place as the reminder that a bound on the values is itself a tool. The habit to carry: when the
data has an algebraic structure — pairs that cancel, sums that telescope, parities that agree — an
operation with an inverse will usually beat any data structure, and the bound on the values tells you
whether indexing was ever an option.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | `O(n²)` | `O(1)` | No memory at all, paid for by recomputing every count | The spoken first answer, and the oracle a test harness checks the rest against |
| Hash map of counts | `O(n)` | `O(n)` | Linear, but remembers every distinct value to report one | The promise is weaker — triples, several loners, or the counts are needed afterwards |
| Sort, then scan in pairs | `O(n log n)` | `O(1)` in place | Trades time for memory; indifferent to what the values are | Mutating the input is fine, memory is tight, and the values are not integers |
| **XOR fold** | **`O(n)`** | **`O(1)`** | Needs the exact-pairs promise and integer values; otherwise strictly best | **The answer. Integers, pairs cancel, one loner** |
| Direct indexing | `O(n + R)` | `O(R)` | Deletes hashing, pays for the whole value range up front | The range is small and known and no cancelling operation exists |

---

## Interview Priority

> **In an interview.** Say the *reason* before the operation: *"every other value appears an even
> number of times, so if I use an operation where a thing cancels itself, the pairs vanish wherever
> they sit and only the loner survives — that operation is XOR."* Then write the three lines. The
> follow-up is nearly always **"what if every other value appeared three times?"** — answer that XOR
> dies because it only cancels even multiplicities, and that the fix is the same per-column parity
> idea in base 3: count each bit position modulo `3`.

**Know cold: the XOR fold.** The interview is not about the three lines, it is about whether you can
name the three properties that make them correct — self-inverse, identity `0`, commutative and
associative — and the promise they lean on.

**Know cold: the hash map.** Not because it wins, but because it is the correct answer to every
neighbouring version of this problem and the natural thing to reach for when the interviewer weakens
the promise. It is also what you should write first if XOR does not come to you immediately: a
working linear solution with the wrong space bound is a far better position than a blank page.

**Understand but do not drill: sort-and-scan.** Its value is the conversation it enables — "if I may
sort in place I get constant space for `n log n` time, which is the other half of the trade" shows
you treat time and space as **separate budgets**. Write it once to get the step-of-two loop and the
trailing `return s[-1]` into your fingers, then move on.

**Understand but do not drill: brute force and direct indexing.** Brute force is a framing sentence
and a testing oracle. Direct indexing deserves one line — "the values are bounded to ±30,000, so I
could toggle a 60 KB table, but XOR gets the same result in one integer" — which shows you read the
constraint and then chose not to need it.

---

## Full Runnable Script

Every approach above, plus a test suite covering both statement examples, the single-element input, a
negative loner, a zero loner, the extremes of the value range, and a randomised stress case of 501
values cross-checked against the brute force. `NOT_FOUND`, `VALUE_LO`/`VALUE_HI` and `make_case` are
**scaffolding**, declared once: the first two so that "what is returned if the promise breaks" and
"what range do we trust" are each a single edit, the third so the stress case is built in one place
rather than inline.

```python
"""Single Number - every approach in one file, cross-checked.

Run:  python single_number.py
"""

from __future__ import annotations

import random

# --- scaffolding, not answers -------------------------------------------------

NOT_FOUND = -1  # unreachable under the promise; keeps every approach int-returning
VALUE_LO, VALUE_HI = -30_000, 30_000  # the value range the statement promises


# --- 1. brute force: count each element's occurrences -------------------------

def single_number_brute(nums: list[int]) -> int:
    for x in nums:
        if nums.count(x) == 1:  # count() is itself a full pass
            return x
    return NOT_FOUND


# --- 2. hash map of counts ----------------------------------------------------

def single_number_hash_map(nums: list[int]) -> int:
    counts: dict[int, int] = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    for x, c in counts.items():
        if c == 1:
            return x
    return NOT_FOUND


# --- 3. sort, then scan in steps of two ---------------------------------------

def single_number_sort_scan(nums: list[int]) -> int:
    s = sorted(nums)
    for i in range(0, len(s) - 1, 2):
        if s[i] != s[i + 1]:
            return s[i]
    return s[-1]  # never misaligned: the loner is the last element


# --- 4. XOR fold (optimal) ----------------------------------------------------

def single_number(nums: list[int]) -> int:
    acc = 0
    for x in nums:
        acc ^= x  # pairs cancel to 0; 0 ^ loner is the loner
    return acc


# --- 5. direct indexing: one toggle per possible value ------------------------

def single_number_bucket(nums: list[int]) -> int:
    """One byte per possible value, toggled: a pair returns its slot to 0."""
    seen = bytearray(VALUE_HI - VALUE_LO + 1)
    for x in nums:
        seen[x - VALUE_LO] ^= 1  # the value IS the index; no hashing at all
    for i, flag in enumerate(seen):
        if flag:
            return i + VALUE_LO
    return NOT_FOUND


APPROACHES = [
    ("brute", single_number_brute),
    ("hash_map", single_number_hash_map),
    ("sort_scan", single_number_sort_scan),
    ("xor", single_number),
    ("bucket", single_number_bucket),
]


# --- test harness -------------------------------------------------------------

def make_case(pairs: list[int], loner: int, seed: int) -> list[int]:
    """Scaffolding: each value in `pairs` twice, plus `loner` once, shuffled."""
    nums = [x for p in pairs for x in (p, p)] + [loner]
    random.Random(seed).shuffle(nums)
    return nums


def main() -> None:
    cases: list[tuple[str, list[int]]] = [
        ("statement example 1", [2, 2, 1]),
        ("statement example 2", [4, 1, 2, 1, 2]),
        ("minimal: one element", [1]),
        ("the loner is negative", [-3, 7, 7, 5, 5]),
        ("the loner is zero", [9, 0, 9]),
        ("bounds of the value range", [VALUE_HI, VALUE_LO, VALUE_HI]),
        ("pairs on both sides of the loner", [8, 8, 6, 9, 9]),
    ]
    # stress: 250 pairs drawn without replacement plus one value that is not
    # among them, shuffled. Cross-checked against the brute force above.
    pool = random.Random(3).sample(range(VALUE_LO, VALUE_HI + 1), 251)
    cases.append(("stress: 501 values", make_case(pool[:250], pool[250], 3)))

    all_agreed = True
    for label, nums in cases:
        shown = nums if len(nums) <= 8 else nums[:6] + ["..."]
        print(f"\n{label}: n={len(nums)} {shown}")
        results: dict[str, int] = {}
        for name, fn in APPROACHES:
            results[name] = fn(list(nums))
            print(f"  {name:<10} -> {results[name]}")
        if len(set(results.values())) != 1:
            all_agreed = False
            print("  !! approaches disagree")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE" if all_agreed
          else "DISAGREEMENT FOUND - see the lines above")


if __name__ == "__main__":
    main()
```
