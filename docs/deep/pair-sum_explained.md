# Pair With Target Sum — explained

## Understanding the Problem

You are handed a list of whole numbers and one more number called the **target**. Somewhere in that
list are two different slots whose numbers add up to the target, and your job is to hand back *where
they are* — the two positions, not the numbers themselves.

You are promised exactly one such couple exists, so you never have to choose between two right
answers. You are also told the two slots must be **different** slots: a number may not be added to
itself.

**The core question:** for each number in the list, is its missing **partner** — the amount still
needed to reach the target — anywhere else in the list? The naive approach is slow because it
answers that question by re-reading the whole list every single time it asks, so the work grows with
the square of the list's length.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `2 <= nums.length <= 10^4` | Small enough that an `O(n²)` brute force (10⁸ comparisons at worst) is merely slow, not impossible — but big enough that an interviewer will not accept it. There are always at least two elements, so no empty-list branch. |
| `-10^9 <= nums[i] <= 10^9` | Values may be negative and enormous. **This is the constraint that forbids the last rung**: an array with one slot per possible value would need two billion slots. It also means `target - x` can be any integer at all, so the lookup structure must cope with arbitrary keys — which a hash map does and a plain array does not. |
| `-10^9 <= target <= 10^9` | Same story on the target side. Python integers never overflow, but in Java or C++ `nums[i] + nums[j]` of two billion-scale values overflows a 32-bit `int` — compute `target - nums[i]` instead of comparing sums and the problem disappears. |
| exactly one valid pair exists | **This unlocks early return.** The moment you find a pair you may stop; there is nothing left to discover, and no approach has to break ties. |
| an element may not be paired with itself | **This is the constraint that shapes the hash-map code.** It is why the one-pass version asks its question *before* inserting, and why the two-pass version needs an explicit `j != i` guard. |

Note what is *absent*: nothing says the values are distinct, and nothing says the list is sorted.
`[2, 2]` with `target = 4` is legal, and any approach that quietly assumes distinct values gets it
wrong.

The worked example traced in every section below is the statement's own:

```
nums = [3, 6, 1, 5], target = 8        answer: [0, 3]   (3 + 5 = 8)
```

---

## Reading the Calculations

If the prose above makes sense and then `j = index_of.get(target - x, -1)` stops you dead, this
section is the one you need. Nothing below is decoration: **every expression in this document
answers exactly one question**, and once you know which question, the line reads itself.

### The symbol table

| You will see | It computes | Why it is written that way | If it were wrong |
|---|---|---|---|
| `i` | **a position**, not a value — "slot number `i`" | The answer is positions, so the code carries positions everywhere | Returning values instead of positions answers a different question |
| `nums[i]` | the **number sitting in** slot `i` | Square brackets mean "look inside the list at this slot" | Confusing `i` with `nums[i]` is the single most common beginner error here |
| `target - x` | the **partner** `x` still needs | Addition rearranged: if `x + partner == target`, then `partner == target - x` | `target + x` or `x - target` asks for a number that has nothing to do with the problem |
| `need` | a name for `target - x`, computed once | A named value you can say out loud beats an expression repeated three times | — |
| `index_of` | a table from **value → the slot it sits in** | The question is "where is `need`?", so the table is keyed by value and answers with a position | Keyed the other way round (`position → value`) it answers a question you never asked |
| `index_of.get(need, -1)` | the slot holding `need`, **or `-1` if there is none** | `.get` with a default never raises; `-1` is impossible as a real slot, so it safely means "absent" | `index_of[need]` raises `KeyError` the first time a partner is missing |
| `j != i` | "the partner is a **different slot** from the one I am standing on" | The statement forbids pairing an element with itself | Without it, `3` at slot `0` with `target = 6` returns `[0, 0]` — one element used twice |
| `enumerate(nums)` | both at once: the slot number **and** the value in it | Saves writing `for i in range(len(nums))` then `nums[i]` | — |

Three of those rows are the whole two-pass solution. It really is that small.

### The one piece of arithmetic, spelled out

Everything turns on rearranging one equation. You are looking for two slots `i` and `j` with

```
nums[i] + nums[j] == target
```

Subtract `nums[i]` from both sides and the unknown is alone:

```
nums[j] == target - nums[i]
```

That is the whole trick, and it changes the **kind** of question you are asking. Before rearranging
you had a question about a *pair* — you must hold two numbers at once to test it, which is why the
brute force needs two loops. After rearranging you have a question about **one** number: *is the
value `target - nums[i]` somewhere in this list?* One number is a question a lookup table can
answer.

On the worked example, with `target = 8`, here is that subtraction at every slot — every row printed
by the script at the foot of this document, not typed from memory:

| `i` | `nums[i]` | `need = target - nums[i]` | is `need` in the list? |
|---|---|---|---|
| `0` | `3` | `8 - 3 = 5` | **yes**, at slot `3` |
| `1` | `6` | `8 - 6 = 2` | no |
| `2` | `1` | `8 - 1 = 7` | no |
| `3` | `5` | `8 - 5 = 3` | **yes**, at slot `0` |

Two rows say yes, and they are the same pair seen from its two ends: `(0, 3)` and `(3, 0)`. That is
not a bug; it is why the code may stop at the first one.

### How to trace it by hand

Take a sheet of paper and draw these columns. This is the two-pass version, which builds the whole
table first and then asks:

```
PASS 1 — build the table          PASS 2 — ask for each partner
  i   nums[i]   index_of              i  nums[i]  need  index_of.get(need)  j != i?
```

Rules, and there are only four:

1. **Pass one writes, pass two reads.** In pass one you never ask a question; in pass two you never
   write. Mixing them is the one-pass version, a different rung.
2. In pass one, each row adds **one entry**: `nums[i] → i`. If the value is already there, **the new
   row overwrites the old one** — write it down anyway, crossed out, because that overwriting is
   what makes duplicates work.
3. In pass two, each row computes `need`, looks it up in the **finished** table from pass one, and
   checks `j != i`.
4. **The answer is decided on the first row of pass two where the lookup succeeds *and* `j != i`.**
   Circle it. Everything after it never runs.

Filled in for `nums = [3, 6, 1, 5]`, `target = 8`:

| pass | `i` | `nums[i]` | `index_of` after this row | `need` | `.get(need, -1)` | `j != i`? |
|---|---|---|---|---|---|---|
| 1 | `0` | `3` | `{3: 0}` | — | — | — |
| 1 | `1` | `6` | `{3: 0, 6: 1}` | — | — | — |
| 1 | `2` | `1` | `{3: 0, 6: 1, 1: 2}` | — | — | — |
| 1 | `3` | `5` | `{3: 0, 6: 1, 1: 2, 5: 3}` | — | — | — |
| 2 | `0` | `3` | (unchanged, complete) | `5` | `3` | `3 != 0` ✔ → **return `[0, 3]`** |

One row of pass two did the work. The other three never happen.

> **Watch out.** The most common way to misread this is to think pass two searches the list. It does
> not — it searches the **table**, which was finished before pass two began. That is exactly why the
> table already contains the element you are standing on, and exactly why `j != i` is needed.

### Reading a complexity out loud

`O(n)` is not a speed; it is a **shape**. It says: *if the list gets ten times longer, the work gets
about ten times bigger.* `O(n²)` says: ten times longer, a hundred times the work. Read every
complexity in this document as a sentence about growth, never as a number of seconds.

Counted on real inputs — printed by the script below — for a list whose answer is the very last
pair:

| `n` | brute-force comparisons | one-pass lookups |
|---|---|---|
| `100` | `1 065` | `43` |
| `1 000` | `14 636` | `133` |
| `10 000` | `435 163` | `404` |

Ten times the input multiplies the brute force by about thirty and the hash version by about three.
That is the difference between `O(n²)` and `O(n)`, in numbers you can check.

---

## Approach 1 — Brute force: try every pair

### The idea

*How do I know whether any two numbers add to the target?* Look at every possible couple and add
them up. There are only so many couples and checking one is a single addition, so the answer is
guaranteed to turn up if it exists.

### How to think about it

> **Intuition.** A small dinner party where you must find the two guests whose ages sum to 80. You
> walk up to guest 1 and ask guest 2, then guest 3, then guest 4 — then you go back and start over
> from guest 2, asking everyone after them. You never ask the same couple twice, because once you
> have asked guest 1 about guest 3 there is no point asking guest 3 about guest 1. The reasoning
> has no **memory**: each question is answered from scratch, and that amnesia is the entire
> inefficiency.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`.

| step | `i` | `nums[i]` | `j` | `nums[j]` | sum | vs `8` | answer so far |
|---|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 1 | 6 | 9 | no | — |
| 2 | 0 | 3 | 2 | 1 | 4 | no | — |
| 3 | 0 | 3 | 3 | 5 | **8** | **match** | `[0, 3]` — return |

Three additions on this input. Had the answer been the last couple, `[2, 3]`, the loop would have
made all six — and six is 4·3/2, the number of couples in a group of four. That formula is where the
`O(n²)` comes from.

### Code

```python
def pair_sum_brute_force(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):  # j starts past i, so nothing pairs with itself
            if nums[i] + nums[j] == target:
                return as_pair(i, j)
    return []
```

### Common mistake

> **Watch out.** The misconception is that widening the inner loop to `range(len(nums))` is merely
> **wasteful** — you check some couples twice, so what. It is not wasteful, it is wrong: when `j`
> reaches `i` you are testing `nums[i] + nums[i]`, pairing an element with itself.

On `nums = [4, 1, 9]` with `target = 8` the wide version returns `[0, 0]` — arithmetic that adds up,
and an answer the problem forbids. Starting `j` at `i + 1` fixes it *and* halves the work, because
it also stops you re-checking the couple `(3, 1)` after already checking `(1, 3)`.

### Complexity and when to use this

**Time** `O(n²)`, **space** `O(1)`. The cost comes from the nested walk: for each of `n` starting
positions the inner loop scans the remaining tail, giving roughly `n²/2` additions. Space is
constant because nothing is stored — the only memory is two loop counters.

Use it when `n` is genuinely tiny, or as the **oracle** a faster version is tested against (exactly
its job in the test suite at the foot of this document). In an interview, say it out loud, name its
cost, and improve on it — starting from brute force is not a weakness, staying there is.

---

## Approach 2 — Sort, then binary search for each partner  *(an addition — not in the data file's ladder)*

### The idea

*The brute force re-scans the tail linearly for every element — can that scan be made faster?* Yes:
a linear scan is slow only because the data is unordered. Sort once, and finding a specific partner
becomes a binary search instead of a walk.

This fixes brute force's central weakness — **the inner loop reads every remaining element even
though it is looking for one specific number.**

### How to think about it

> **Intuition.** An unsorted list is a pile of loose index cards; a sorted list is a filing
> **cabinet**. To find one card in the pile you must look at all of them; to find one in the
> cabinet you open it halfway, see whether you overshot, and throw away half the cabinet at a
> glance. Sorting is the cost of *building* the cabinet, paid once, and every lookup afterwards is
> cheap. The catch — and the reason this rung is not the destination — is that filing the cards
> destroys the very thing you were asked for: the answer is a pair of *original positions*, and
> sorting moves them. So you file cards with their original slot number written on the back, and
> pay for that bookkeeping too.

> **Why it works.** Searching only the window `p + 1 .. n-1` is what makes the method both safe and
> complete. Safe, because a position can never find **itself**; complete, because every unordered
> couple `{p, q}` with `p < q` is examined exactly once, from its smaller side. Filtering
> self-matches out afterwards with a `q != p` test would be neither.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`. First the cabinet — positions ordered by the value they hold:

| `k` (sorted slot) | `order[k]` (original position) | `values[k]` |
|---|---|---|
| 0 | 2 | 1 |
| 1 | 0 | 3 |
| 2 | 3 | 5 |
| 3 | 1 | 6 |

Now each sorted slot binary-searches the window to its right:

| step | `p` | `values[p]` | `need` | window searched | `q` from `bisect_left` | `values[q] == need`? | answer so far |
|---|---|---|---|---|---|---|---|
| 1 | 0 | 1 | `8 - 1 = 7` | `[3, 5, 6]` | 4 (past the end) | — | — |
| 2 | 1 | 3 | `8 - 3 = 5` | `[5, 6]` | 2 | **yes** | `order[1]=0`, `order[2]=3` → `[0, 3]` |

### Code

```python
from bisect import bisect_left


def pair_sum_sort_binary_search(nums: list[int], target: int) -> list[int]:
    order = positions_by_value(nums)
    values = [nums[k] for k in order]
    for p in range(len(values)):
        need = target - values[p]
        q = bisect_left(values, need, p + 1)  # search only to the right of p
        if q < len(values) and values[q] == need:
            return as_pair(order[p], order[q])
    return []
```

### Common mistake

> **Watch out.** The misconception is that self-pairing is something you **detect and reject**
> afterwards — search the whole sorted array, then patch it with `if q != p`. Searching the whole
> array is the actual bug; the patch is the part that should make you uneasy.

Unpatched, on `nums = [4, 1, 9]` with `target = 8`, the slot holding `4` searches for `4`, finds
itself, and returns **`[0, 0]`** — two identical positions. So the patch is not optional.

The patch does work, and that is the uncomfortable part: it survives only because `bisect_left`
lands on `p` itself in exactly one situation, `target == 2 * values[p]`, and when the array really
does hold two copies of that value the pair is recovered when `p` reaches the *second* copy. On
`nums = [4, 4, 1]` with `target = 8` the guard rejects at `p = 1` and then accepts at `p = 2`,
returning the correct **`[0, 1]`**. That is a proof you would have to write out. Restricting the
window to `p + 1` onward needs no proof at all: it makes self-pairing **structurally impossible**
and considers each couple once, which is why it is the fix to reach for.

### Complexity and when to use this

**Time** `O(n log n)`, **space** `O(n)`. Separating the two bills is the whole lesson of this rung:
**restructuring** (the sort) is `O(n log n)`, and **searching** is `n` binary searches at `O(log n)`
each, also `O(n log n)`. Neither half is linear, so improving only one would not help. The space is
the `order` and `values` arrays — the price of carrying original positions through the sort.

Use it when the array **arrives already sorted**, so the restructuring cost vanishes — or better,
use Approach 3, which drops to `O(n)` on sorted input. Use it too when many different targets are
asked against one array: the cabinet is built once and every later query reuses it.

---

## Approach 3 — Sort, then converge two pointers

### The idea

*Once the values are sorted, is a binary search per element still more work than necessary?* It is.
The sum of the smallest and largest value tells you which end is wrong: too small, and only a bigger
small-end can help; too large, and only a smaller large-end can. Each comparison eliminates an
entire element, so one sweep replaces all `n` binary searches.

This fixes Approach 2's weakness — **each binary search throws away everything it learned and starts
over from the middle of the array.**

### How to think about it

> **Intuition.** Two fingers, one on each end of a sorted row, moving toward each other. The left
> finger can only ever make the total bigger; the right finger can only ever make it smaller. Ask
> for the current total: undershoot and the left finger must advance, overshoot and the right must
> retreat. Every step permanently discards one number, so the fingers meet after at most `n` steps.
> The reasoning is **directional**, and sorting is what buys the guarantee that moving a finger
> moves the total in a known direction.

> **Why it works.** The exchange argument is the whole proof. When `values[i] + values[j] < target`
> and `j` is the largest index still live, `values[i]` is already paired with the **biggest partner
> available** and still falls short — so no surviving pair can contain `i`, and discarding it loses
> nothing. The mirror case discards `j`. The invariant is therefore: *if an answer exists, it lies
> entirely inside `i..j`* — true at the start, preserved by every step, so the sweep cannot miss it.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`, over the same cabinet — `order = [2, 0, 3, 1]`,
`values = [1, 3, 5, 6]`.

| step | `i` | `j` | `values[i]` | `values[j]` | sum | vs `8` | action |
|---|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 1 | 6 | 7 | too small | `1` cannot reach `8` even with the biggest partner — advance `i` |
| 2 | 1 | 3 | 3 | 6 | 9 | too large | `6` is too big for anything left — retreat `j` |
| 3 | 1 | 2 | 3 | 5 | **8** | exact | stop: `order[1]=0`, `order[2]=3` → `[0, 3]` |

### Code

```python
def pair_sum_sort_two_pointers(nums: list[int], target: int) -> list[int]:
    order = positions_by_value(nums)
    i, j = 0, len(nums) - 1
    while i < j:
        total = nums[order[i]] + nums[order[j]]
        if total == target:
            return as_pair(order[i], order[j])
        if total < target:
            i += 1
        else:
            j -= 1
    return []
```

### Common mistake

> **Watch out.** The misconception is that **sorting is free of consequence** — the values are the
> same values, so the indices must still mean something. They do not. Sorting destroys the original
> numbering, and the original numbering *is* the answer.

Code that sorts `nums` in place and returns the pointer positions `[i, j]` reports where the answer
sits inside the **sorted copy**, which in general names two different numbers entirely. On our
example it returns `[1, 2]` instead of `[0, 3]`. Sorting an array of positions, as above, keeps the
mapping intact. The second half of the same mistake is forgetting to put the two returned positions
back in ascending order: the small *value* is not necessarily at the small *position*, which is why
`as_pair` exists.

### Complexity and when to use this

**Time** `O(n log n)`, **space** `O(n)`. Split the cost again: restructuring is `O(n log n)` for the
sort, and searching is `O(n)` for the single converging sweep, because each iteration retires one
element. The search half is now optimal and the sort is the only thing standing between you and
linear time. Space is the position array — though if you may sort the values in place and need only
report *values* rather than positions, this becomes `O(1)` extra space and is the most memory-frugal
correct approach available.

Use it when the input is already sorted, when memory is the scarce resource rather than time, or
when the problem grows into three-sum or four-sum — there the converging sweep is the inner engine
and the hash map is not.

---

## Approach 4 — Hash map, two passes  *(an addition — not in the data file's ladder)*

### The idea

*The sort exists only to make searching fast — but is order what the question actually needs?* No.
The question is "is the number `target - x` present, and where?", which is pure **lookup**, not
comparison. Record every value's position first, then walk the array again asking for each partner.

This fixes Approach 3's weakness — **it pays `O(n log n)` to impose an ordering the question never
asked for.**

### How to think about it

> **Intuition.** A hash map is a **cloakroom**. You hand over a value and get back the ticket
> number where it was stored, in one step, with no searching and no ordering. Building the
> cloakroom is one pass; collecting from it is a second. Because the passes are separate, at the
> moment you ask a question the cloakroom already contains *every* value in the array — including
> the element you are standing on. That is the single subtlety of this rung, and it is exactly what
> the next rung removes.

### Where does each value actually go? The bucket arithmetic

The sentence "record every value's position" hides the step people get stuck on. A hash map is an
**array of slots**, and the slot a value lands in is **computed from the value itself**. Not from
the order it arrived in.

That is the misconception worth killing first:

> **Watch out.** `nums[0] = 3` does **not** go into the first slot. There is no "first" element in a
> hash map. Arrival order decides nothing; `hash(value) % number_of_slots` decides everything. A map
> built from the same four numbers in any order ends up with the same four values in the same four
> slots.

Here is the table with the lid off — eight slots, our four values, every step printed by the script
at the foot of this document:

| Insert | `hash(v)` | slot = `hash(v) % 8` | The table afterwards |
|---|---|---|---|
| `3` at `i = 0` | `3` | `3 % 8 = 3` | `0:· 1:· 2:· 3:3→0 4:· 5:· 6:· 7:·` |
| `6` at `i = 1` | `6` | `6 % 8 = 6` | `0:· 1:· 2:· 3:3→0 4:· 5:· 6:6→1 7:·` |
| `1` at `i = 2` | `1` | `1 % 8 = 1` | `0:· 1:1→2 2:· 3:3→0 4:· 5:· 6:6→1 7:·` |
| `5` at `i = 3` | `5` | `5 % 8 = 5` | `0:· 1:1→2 2:· 3:3→0 4:· 5:5→3 6:6→1 7:·` |

Read the last row. The value `3` — the *first* number in the array — sits in **slot 3**. Slot `0` is
empty and stays empty. The arrow means *value → position in the array*: `3→0` says "the value 3 was
found at index 0 of `nums`".

Two facts make that arithmetic work at all:

1. **`hash(v)` of a small integer is the integer itself.** `hash(3) == 3`, `hash(0) == 0`. Nothing
   clever happens for ints; the hash function only has real work to do for strings and objects.
2. **`% 8` folds any number into a legal slot.** The table has eight slots, so the remainder after
   dividing by eight is always `0..7`. CPython writes it as `hash(v) & 7`, which is the same thing
   for a power-of-two size and faster — both printed by the script so you can see they agree.

### Looking a value up is the same arithmetic, run again

This is the part that makes the whole approach `O(1)`. To answer *"where is 5?"* the map does not
search. It recomputes: `hash(5) % 8 = 5`, jumps **straight** to slot 5, and finds `5→3` sitting
there. One multiplication-free step, no scanning, no comparison with the other three values.

So pass two of this rung reads, in full:

```
i = 0, nums[i] = 3
  need = 8 - 3 = 5
  hash(5) % 8 = 5            <- jump straight to slot 5
  slot 5 holds 5 -> 3        <- the value 5 lives at index 3 of nums
  j = 3, and j != i (3 != 0) <- different slots, so it is a legal pair
  answer: [0, 3]
```

And if the partner is absent, the jump lands on an **empty slot**, which is the answer "not here" —
also in one step. That is why a missing key costs the same as a present one.

### What happens when two values want the same slot

They can. `3`, `11` and `19` all compute `% 8 = 3`. The table does not give up; it puts the
newcomer in the next free slot and remembers to keep looking when asked:

| Insert | slot wanted | What happens | The table afterwards |
|---|---|---|---|
| `3` | `3` | empty, sit down | `3:3` |
| `11` | `3` | taken by `3`, step to `4` | `3:3  4:11` |
| `19` | `3` | taken, step to `4`, taken, step to `5` | `3:3  4:11  5:19` |

Those extra steps are called **probing**, and they are the entire reason `O(1)` is an *average*
rather than a promise. With ordinary integers the values spread out and probing is rare. Force every
key into one slot and the lookups degrade to a linear scan — measured, in the callout below.

> **Under the hood.** You never see slot numbers in real code, and you should never rely on one: a
> dict **resizes** when it gets about two-thirds full, which recomputes the slot of every key it
> already holds. `3` might sit in slot `3` of an eight-slot table and slot `3` of a sixteen-slot one
> by coincidence, or somewhere else entirely. The slot is an implementation detail; *the value is
> the address*, and that is the only thing to remember.


> **Under the hood.** "In one step" is the claim the whole rung rests on, so here is what actually
> happens when you write `index_of.get(5)`. Python computes `hash(5)`, which for a small integer
> **is the integer itself** — `hash(5) == 5`, `hash(0) == 0`. It takes that number modulo the
> table's slot count to pick a **bucket**, jumps straight to it, and compares the key it finds there
> with `5`. No scanning. The list's length never enters into it, which is why the cost does not grow
> with `n` — measured, on this machine:
>
> | `n` | `dict.get` | `x in list` |
> |---|---|---|
> | `1 000` | `20.5 ns` | `2 940 ns` |
> | `10 000` | `18.5 ns` | `29 755 ns` |
> | `100 000` | `19.5 ns` | `301 150 ns` |
> | `1 000 000` | `20.0 ns` | `3 030 150 ns` |
>
> The dict column is **flat** — a thousand keys or a million, about twenty nanoseconds. The list
> column multiplies by ten every time the input does. That is `O(1)` and `O(n)` seen as numbers
> rather than as symbols. Building the map costs one insertion per element, about `40 ns` each, so
> pass one of this rung is roughly `40 ms` for a million values — paid once, not once per question.

> **Under the hood.** The honest asterisk: `O(1)` is an **average**, not a guarantee. Two keys can
> land in the same bucket, and then the table has to compare them one after another. With ordinary
> integers this essentially never bites — forcing every key to collide on purpose, though, shows the
> real shape:
>
> | keys | distinct hashes | all one hash |
> |---|---|---|
> | `200` | `86 ns` | `3 736 ns` |
> | `1 000` | `94 ns` | `18 384 ns` |
> | `4 000` | `94 ns` | `74 146 ns` |
>
> The left column is flat; the right one grows linearly, because a bucket holding every key **is** a
> list being scanned. That is the `O(n)` worst case textbooks mention, and it is why the honest
> statement for this problem is "`O(n)` expected". You will not hit it with integers. You could hit
> it with an adversary choosing your keys, which is a real attack on web servers and the reason
> Python randomises string hashing at startup.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`. Pass one builds `value → position`, later occurrences
overwriting earlier ones:

| step | reading | `index_of` after |
|---|---|---|
| 1 | `nums[0] = 3` | `{3: 0}` |
| 2 | `nums[1] = 6` | `{3: 0, 6: 1}` |
| 3 | `nums[2] = 1` | `{3: 0, 6: 1, 1: 2}` |
| 4 | `nums[3] = 5` | `{3: 0, 6: 1, 1: 2, 5: 3}` |

Pass two asks for each partner against that complete map:

| step | `i` | `nums[i]` | `need` | `index_of.get(need)` | `j != i`? | answer |
|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 5 | `3` | `3 != 0` ✓ | `[0, 3]` — return |

### Code

```python
def pair_sum_two_pass_hash(nums: list[int], target: int) -> list[int]:
    index_of: dict[int, int] = {x: i for i, x in enumerate(nums)}  # a later duplicate overwrites
    for i, x in enumerate(nums):
        j = index_of.get(target - x, -1)
        if j != -1 and j != i:  # the guard that stops x from being its own partner
            return as_pair(i, j)
    return []
```

### Common mistake

> **Watch out.** The misconception is that "later occurrence **overwrites** earlier" loses
> duplicates, so the map should hold a list of positions per value. It does not lose them, and the
> extra structure is dead weight — overwriting is precisely what makes duplicates work.

With `nums = [2, 2]` and `target = 4` the map is `{2: 1}`; standing at `i = 0` you look up `2`, get
position `1`, and `1 != 0` passes, giving `[0, 1]`. Overwriting guarantees the stored position is
the *other* one when you are standing on the first.

The plainer mistake is omitting the `j != i` guard. With `nums = [3, 6, 1, 5]` and `target = 6`,
standing on the `3` you look up `6 - 3 = 3`, the map says position `0`, and you return `[0, 0]` —
one element used twice. The guard is unavoidable in the two-pass shape because the map is complete
before you start asking.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n)`. Time is two independent walks of `n` elements, each doing one
hash operation costing `O(1)` on average — no nesting anywhere. Space is the map holding up to `n`
entries. Hash operations are `O(1)` *expected*; a pathological set of keys degrades to `O(n)` per
lookup, which is why the worst case is technically `O(n²)` and why adversarial inputs are a real (if
rare) concern in contest settings.

Use it when you cannot decide at insert time — if you must report *all* pairs rather than the first,
or if the map must be prepared in advance and queried repeatedly. For the problem exactly as stated
this rung is best understood as the stepping stone that makes the next one obvious.

---

## Approach 5 — Hash map, one pass (optimal)

### The idea

*If the map is only ever asked about values that came earlier, why put the later ones in it at all?*
Build the map as you go and ask **before** you insert. Standing on element `i`, the map holds exactly
the elements before `i`, so a hit is guaranteed to be a different element.

This fixes Approach 4's weakness — **the map contains the element you are standing on, forcing an
explicit self-pairing guard and a second pass over the array.**

### How to think about it

> **Intuition.** You are walking a corridor of numbered doors, writing every number you pass onto a
> **notepad** beside its door number. At each door you ask one question: *have I already written
> down the amount I still need?* If yes, those two doors are the answer and you stop. If no, you
> add this door and take one more step. The notepad only ever contains the past, which is why "did
> I see it?" and "is it a different element?" collapse into the same question.

> **Why it works.** The invariant is one sentence: **when the lookup for index `i` runs, `seen`
> holds exactly the values at indices `0 .. i-1`** — established empty at the start, and preserved
> because the insertion happens after the lookup, never before. Two consequences fall straight out
> of it. A hit is necessarily a *different* element, so no guard is needed; and the unique pair
> `(a, b)` with `a < b` is found the moment `i` reaches `b`, because `a` was written on the notepad
> at step `a` and nothing is ever erased.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`.

| step | `i` | `nums[i]` | `need = 8 - nums[i]` | `need in seen`? | action | `seen` after |
|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 5 | no (empty) | record `3` | `{3: 0}` |
| 2 | 1 | 6 | 2 | no | record `6` | `{3: 0, 6: 1}` |
| 3 | 2 | 1 | 7 | no | record `1` | `{3: 0, 6: 1, 1: 2}` |
| 4 | 3 | 5 | 3 | **yes, at `0`** | return `[0, 3]` | — |

Four lookups, three insertions, and the `5` is never written at all — the walk ends the moment the
question is answered. The two-pass version wrote all four values before asking anything.

### Code

```python
def pair_sum_one_pass_hash(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:  # asked before inserting, so i is never matched against itself
            return as_pair(seen[target - x], i)
        seen[x] = i
    return []
```

`as_pair` is a no-op here: `seen[target - x]` is an earlier position than `i` by construction, so
the result is already ascending. It is called anyway so that the answer's shape is decided in **one
place** across all six approaches.

### Common mistake

> **Watch out.** The misconception is that the lookup and the insertion are two independent
> bookkeeping lines whose **order is stylistic**. The order *is* the correctness argument: insert
> first and the invariant "`seen` holds only the past" is false for one element — the one you are
> standing on.

```python
seen[x] = i
if target - x in seen:          # WRONG — the map now contains x itself
    return [seen[target - x], i]
```

This breaks exactly when `target == 2 * x`. On `nums = [3, 6, 1, 5]` with `target = 6` the first
iteration writes `{3: 0}`, looks up `6 - 3 = 3`, finds position `0`, and returns `[0, 0]`. It is
invisible on any input where the target is odd or no element is exactly half of it — which is what
makes it such a reliable interview trap: it passes the statement's own example and fails on the
first hidden test with a self-doubling value.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n)`. One walk, each step one hash lookup plus at most one insertion,
both `O(1)` on average. The map is the space cost: with no pair until the very end it holds `n - 1`
entries. Nothing can beat `O(n)` time here, because any correct algorithm must look at every
element — skip one and the adversary hides half the answer there.

**This is the one to memorize.** No guard, no sort, no second pass; duplicates and negatives need no
special cases. Its shape — *turn a pair question into a membership question about the past* — is the
engine behind subarray-sum-equals-k, longest-consecutive-run and a dozen others. Prefer a different
rung only when memory is scarcer than time, or when the array arrives sorted.

---

## Approach 6 — Direct indexing when the values are small and bounded  *(an addition — not in the data file's ladder)*

### The idea

*A hash map is a general tool for arbitrary keys — but what if the keys are not arbitrary?* If every
value falls inside a small known range, replace the map with a plain array indexed by
`value - lowest`. Same algorithm as Approach 5; the lookup becomes a single memory read with no
hashing at all.

This fixes no complexity weakness — both are `O(n)`. It fixes a **constant factor**: every hash
lookup costs a hash computation, a bucket probe and, on collision, a comparison chain.

### What must be true, and what breaks if it is not

The assumption is that `max(nums) - min(nums)` is small enough to allocate an array of that size.
**This problem's constraints say it is not**: values spanning −10⁹ to 10⁹ would need two billion
slots, roughly 16 GB.

The version below therefore measures the span and falls back to Approach 5 when the assumption
fails. That fallback is a deliberate **call**, not a reach into another approach's internals —
Approach 6 *is* Approach 5 with the map swapped for an array, and the fallback says so honestly. It
does mean that on the problem as literally stated, this rung is a hash map in disguise.

Without the span guard, an unguarded allocation on the stated range is an instant out-of-memory
crash — not a wrong answer, a dead process. The subtler break is dropping the `lo <= need <= hi`
check: `need` is `target - x` and easily falls outside the value range even when every element is
inside it, and in Python a negative index silently reads from the wrong end of the array rather than
raising.

### Worked example

`nums = [3, 6, 1, 5]`, `target = 8`. Here `lo = 1` and `hi = 6`, so the table is 6 slots, one per
possible value, every slot starting at `-1` for "not seen".

| step | `i` | `nums[i]` | `need` | slot for `need` | occupied? | write | `slot` as value → position |
|---|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 5 | `5-1 = 4` | `-1` | `3` at index `2` | `3: 0` |
| 2 | 1 | 6 | 2 | `2-1 = 1` | `-1` | `6` at index `5` | `3: 0, 6: 1` |
| 3 | 2 | 1 | 7 | **outside `1..6`** — never indexed | — | `1` at index `0` | `1: 2, 3: 0, 6: 1` |
| 4 | 3 | 5 | 3 | `3-1 = 2` | holds **`0`** | — | return `[0, 3]` |

Step 3 is the one to study: the needed value `7` exceeds anything in the array, and the range check
is all that stops the code reading index `6` of a 6-slot table.

### Code

```python
def pair_sum_direct_index(nums: list[int], target: int) -> list[int]:
    if not nums:
        return []
    lo, hi = min(nums), max(nums)
    if hi - lo + 1 > MAX_DIRECT_SPAN:  # the bounded-value assumption fails; fall back
        return pair_sum_one_pass_hash(nums, target)
    slot: list[int] = [NOT_SEEN] * (hi - lo + 1)  # slot[v - lo] = last index holding value v
    for i, x in enumerate(nums):
        need = target - x
        if lo <= need <= hi and slot[need - lo] != NOT_SEEN:
            return as_pair(slot[need - lo], i)
        slot[x - lo] = i
    return []
```

### Common mistake

> **Watch out.** The misconception is that `0` is a natural "**empty**" marker because that is what
> an array of counts starts at. Here the array holds *positions*, and `0` is a perfectly real
> position — so an element at the front of the array becomes indistinguishable from an empty slot.

On `nums = [3, 6, 1, 5]` with `target = 8` the answer *is* at position `0`, so this bug loses it
completely and the function returns `[]`. Use `-1` as the sentinel — that is what `NOT_SEEN` is —
or a separate array of occupancy flags.

### Complexity and when to use this

**Time** `O(n + V)`, **space** `O(V)`, where `V` is the size of the value range. The `O(V)` term is
allocating and zeroing the slot array — invisible when `V` is a few hundred, fatal when `V` is two
billion. The per-element work is a subtraction and an array read, several times faster than a hash
lookup in practice even though both are `O(1)`.

Use it when the problem states a small value range: characters, digits, ages, grades, small enum
codes. Do **not** use it here, where the stated range is ±10⁹ — and say so out loud, because naming
a technique and correctly rejecting it on the constraints is a stronger answer than not knowing it
exists.

---

## The Overall Arc

Every step on this ladder chases one principle — **do not redo work you do not need to do** — and
brute force does the most redundant work imaginable, re-reading the entire remaining array for each
element and forgetting everything the instant it moves on, so the same values are compared again and
again from a different starting point. The first instinct for killing a repeated linear scan is to
impose order on the data, and it works: sort once and each scan becomes a binary search; then notice
even the binary searches are redundant, because in a sorted array the two ends say unambiguously
which way to move, and the `n` searches collapse into a single converging sweep — at which point the
sort is the only super-linear cost left and the whole method is bounded by the price of the filing
cabinet you built. That is where the real insight arrives, and it arrives as a question about the
*question*: the pair test never asked about order at all, it asked "is this particular number
present?", and order is an expensive answer to a question about membership. Swap the sorted array
for a hash map and the `O(n log n)` restructuring vanishes, leaving two linear walks — and then one
more redundancy falls out, because the second walk only ever asks about elements the first walk
already passed, so the walks fuse into one and the map holds only the past, which as a bonus makes
self-pairing impossible instead of merely detectable. The final rung stops improving the algorithm
and improves the machine underneath it: a hash map is a general lookup for arbitrary keys, and if
the keys happen to be small bounded integers then the array index *is* the hash — except that this
problem's ±10⁹ range forbids it, which is itself the lesson that a technique is unlocked by a
constraint and not by preference. Unordered scan, imposed order, remembered values,
remembered-and-fused, and finally remembered-without-hashing: the three worth carrying into an
interview are brute force to name and reject, the one-pass hash map to write, and the converging
two-pointer sweep, because it is the one that survives when the array arrives sorted or when the
problem grows a third number.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | `O(n²)` | `O(1)` | No memory at all, so every question is re-answered from scratch | `n` is tiny; you need an oracle to test the fast ones against |
| Sort + binary search | `O(n log n)` | `O(n)` | Pays to order the data so each lookup is cheap; the ordering is the bill | Many targets queried against one array; the array is already sorted |
| Sort + two pointers | `O(n log n)` | `O(n)`, or `O(1)` sorting in place when positions are not needed | Order buys a *directional* sweep, removing the per-element search entirely | Input already sorted; memory-constrained; three-sum and four-sum follow-ups |
| Two-pass hash map | `O(n)` | `O(n)` | Drops ordering for membership, but must guard against matching an element with itself | The map must be complete before any query, or all pairs are wanted |
| **One-pass hash map** | **`O(n)`** | **`O(n)`** | **Ask-before-insert gives the self-pairing guard for free** | **The default answer for this problem** |
| Direct-index array | `O(n + V)` | `O(V)` | Removes hashing entirely, but only if the value range is small enough to allocate | Values bounded to a small known range — **not** this problem's ±10⁹ |

---

## Interview Priority

> **In an interview.** Name brute force and its `O(n²)` in one sentence, then say the reframing out
> loud before you write anything: *"I do not need to compare pairs, I need to ask whether
> `target - x` is something I have already seen."* Write the one-pass hash map. The follow-up is
> always **"why does the lookup come before the insertion?"** — answer that `seen` holds exactly the
> elements before `i`, so a hit is a different element by construction and no guard is needed. The
> second follow-up is usually *"what if the array were already sorted?"*, which is the two-pointer
> sweep at `O(n)` time and `O(1)` extra space.

**Memorize cold — the one-pass hash map.** You should be able to write it in under a minute without
hesitating over the order of the lookup and the insertion. Its real value is that it generalises:
"turn a pair question into a membership question about what you have already seen" solves
subarray-sum-equals-k, two-sum-on-a-BST, and most complement variants.

**Memorize cold — brute force.** Not to submit, but because naming the baseline and its `O(n²)`
before improving on it is what signals reasoning rather than recitation. Ten seconds to state, and
it is the oracle you sanity-check the fast solution against.

**Memorize cold — sort plus converging two pointers.** It wins when the array is already sorted
(`O(n)` with `O(1)` extra space) and it is the engine inside three-sum, four-sum and
container-with-most-water. If you know only the hash map, three-sum will hurt.

**Understand but do not memorize — the two-pass hash map.** Worth explaining, because it makes the
one-pass version's elegance visible by contrast, and some variants genuinely need the complete map
up front. Write it by default and you will be asked to fuse the passes anyway.

**Understand but do not memorize — sort plus binary search.** Strictly worse than the two-pointer
sweep on the same sorted data: same asymptotic cost, more code, more index bookkeeping. Its value is
conceptual — the clearest illustration that *restructure* and *search* are two separate bills.

**Understand but do not memorize — direct indexing.** Nothing to recall, one thing to recognise:
when a problem bounds its values to a small range, the array index replaces the hash. Noticing that
a constraint has *unlocked* something is a more valuable habit than any implementation.

---

## How to Get Fluent

Reading this page is not the same as being able to write the answer. These drills are in order, and
each one says what "done" looks like.

1. **Say the rearrangement before you write anything.** Out loud: *"I need two slots summing to the
   target, so for each number the partner I want is `target - nums[i]` — one number, which a lookup
   can answer."* **Done when** you can say it without looking, because every hash-map problem starts
   with turning a question about a pair into a question about one value.

2. **Hand-trace the two-pass version on `[3, 6, 1, 5]`, `target = 8`,** using the four columns above.
   Then trace it again on `[2, 2]`, `target = 4` — the case where the table holds `{2: 1}` and the
   `j != i` guard is what saves you. **Done when** your paper matches the tables in this document
   row for row, including the row where the answer is decided.

3. **Write the one-pass version from memory, then break it on purpose.** Move the insertion *above*
   the lookup and find an input it now gets wrong. **Done when** you can state in one sentence why
   asking before inserting removes the need for `j != i` — that sentence is the whole difference
   between the two hash rungs.

4. **Count, do not time.** Take `nums = list(range(10_000))` with the answer as the last pair, and
   count comparisons in the brute force against lookups in the hash version. **Done when** you have
   produced numbers like the `435 163` against `404` in this document yourself, because a complexity
   you have measured once stops being a symbol.

5. **Do the three siblings without re-reading this page.** *Contains Duplicate* is this map with the
   value thrown away; *Subarray Sum Equals K* is this map over **running totals** instead of values;
   *Group Anagrams* is this map with a **computed key**. **Done when** you recognise, in each, which
   thing became the key and which became the value — that pairing is the actual skill.

6. **A month later, the one sentence that should come back:** *a hash map turns "is it here?" from a
   search into a lookup, and the whole job is choosing what to key on.*

---

## Full Runnable Script

Every approach above, plus a test suite covering the statement's example, the smallest legal input,
a duplicate-value case, negatives, a target with no valid pair, a wide-range case that forces the
direct-index fallback, and 38 randomised stress cases whose targets are built so that exactly one
pair matches — each cross-checked against brute force and against every other approach.

Three pieces are **scaffolding**, not answers: `positions_by_value` (sort the positions, not the
values, so the original numbering survives), `as_pair` (the answer is two positions in ascending
order, decided in one place), and `unique_pair_case` (a random input honouring the problem's
one-pair promise).

```python
"""Pair With Target Sum - every approach in one file, plus a self-checking test suite.

Run: python pair_sum_all.py
"""

from __future__ import annotations

import random
import time
from bisect import bisect_left

MAX_DIRECT_SPAN = 1 << 20  # widest value range worth allocating a slot array for
NOT_SEEN = -1              # sentinel: 0 is a real position and cannot mean "empty"


# --- shared scaffolding ---------------------------------------------------------

def positions_by_value(nums: list[int]) -> list[int]:
    """Positions 0..n-1 ordered by the value each holds; sorting positions keeps the numbering."""
    return sorted(range(len(nums)), key=lambda k: nums[k])


def as_pair(a: int, b: int) -> list[int]:
    """The answer is two positions in ascending order - the small value is not the small position."""
    return [a, b] if a < b else [b, a]


# --- 1. Brute force: every pair ------------------------------------------------

def pair_sum_brute_force(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):  # j starts past i, so nothing pairs with itself
            if nums[i] + nums[j] == target:
                return as_pair(i, j)
    return []


# --- 2. Sort, then binary search for each complement ---------------------------

def pair_sum_sort_binary_search(nums: list[int], target: int) -> list[int]:
    order = positions_by_value(nums)
    values = [nums[k] for k in order]
    for p in range(len(values)):
        need = target - values[p]
        q = bisect_left(values, need, p + 1)  # search only to the right of p
        if q < len(values) and values[q] == need:
            return as_pair(order[p], order[q])
    return []


# --- 3. Sort, then converge two pointers ---------------------------------------

def pair_sum_sort_two_pointers(nums: list[int], target: int) -> list[int]:
    order = positions_by_value(nums)
    i, j = 0, len(nums) - 1
    while i < j:
        total = nums[order[i]] + nums[order[j]]
        if total == target:
            return as_pair(order[i], order[j])
        if total < target:
            i += 1
        else:
            j -= 1
    return []


# --- 4. Two-pass hash map ------------------------------------------------------

def pair_sum_two_pass_hash(nums: list[int], target: int) -> list[int]:
    index_of: dict[int, int] = {x: i for i, x in enumerate(nums)}  # a later duplicate overwrites
    for i, x in enumerate(nums):
        j = index_of.get(target - x, NOT_SEEN)
        if j != NOT_SEEN and j != i:  # the guard that stops x from being its own partner
            return as_pair(i, j)
    return []


# --- 5. One-pass hash map (optimal) --------------------------------------------

def pair_sum_one_pass_hash(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:  # asked before inserting, so i is never matched against itself
            return as_pair(seen[target - x], i)
        seen[x] = i
    return []


# --- 6. Direct indexing, only when the values are small and bounded ------------

def pair_sum_direct_index(nums: list[int], target: int) -> list[int]:
    if not nums:
        return []
    lo, hi = min(nums), max(nums)
    if hi - lo + 1 > MAX_DIRECT_SPAN:  # the bounded-value assumption fails; fall back
        return pair_sum_one_pass_hash(nums, target)
    slot: list[int] = [NOT_SEEN] * (hi - lo + 1)  # slot[v - lo] = last index holding value v
    for i, x in enumerate(nums):
        need = target - x
        if lo <= need <= hi and slot[need - lo] != NOT_SEEN:
            return as_pair(slot[need - lo], i)
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
    """Scaffolding: a random array plus a target hit by exactly one pair (the problem's promise)."""
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




# ------------------------------------------- measurements, not answers
# Everything the "Reading the Calculations" and "Under the hood" sections
# quote is printed here, so no number in this document is remembered.


class TinyMap:
    """A hash map with the lid off. NOT an answer — it exists so the bucket
    arithmetic in "Where does each value actually go?" is printed rather than
    drawn. It does in miniature what CPython's dict does: compute a slot from
    the key, and probe forward when that slot is taken.
    """

    __slots__ = ("slots", "last")

    def __init__(self, slots: int = 8) -> None:
        self.slots: list[tuple[int, int] | None] = [None] * slots
        self.last = ""

    def _home(self, key: int) -> int:
        """The slot a key BELONGS in, computed from the key and nothing else."""
        return hash(key) % len(self.slots)

    def put(self, key: int, value: int) -> None:
        i = self._home(key)
        probes = 0
        while self.slots[i] is not None and self.slots[i][0] != key:
            i = (i + 1) % len(self.slots)        # linear probing
            probes += 1
        self.slots[i] = (key, value)
        self.last = (f"hash({key}) = {hash(key)}, {hash(key)} % {len(self.slots)} = "
                     f"{self._home(key)}"
                     + (f", taken, probed {probes} -> slot {i}" if probes else f" -> slot {i}"))

    def get(self, key: int, default: int = -1) -> int:
        i = self._home(key)
        probes = 0
        while self.slots[i] is not None:
            if self.slots[i][0] == key:
                self.last = (f"hash({key}) % {len(self.slots)} = {self._home(key)}"
                             + (f", probed {probes} -> slot {i}" if probes else "")
                             + f": FOUND, the value {key} sits at index {self.slots[i][1]}")
                return self.slots[i][1]
            i = (i + 1) % len(self.slots)
            probes += 1
            if probes >= len(self.slots):
                break
        self.last = f"hash({key}) % {len(self.slots)} = {self._home(key)}: empty slot, so ABSENT"
        return default

    def picture(self) -> str:
        return "  ".join(
            f"{i}:{'  .  ' if s is None else f'{s[0]}->{s[1]}'}"
            for i, s in enumerate(self.slots)
        )


def show_buckets(nums: list[int], target: int) -> None:
    """Print the table after every insertion, then every lookup of pass two."""
    print("\n=== PASS ONE: each value is filed by its OWN value, not by its turn ===")
    table = TinyMap(8)
    for i, x in enumerate(nums):
        table.put(x, i)
        print(f"  put {x:>3} (at index {i}): {table.last}")
        print(f"      {table.picture()}")
    print(f"  nums[0] = {nums[0]} did NOT go into slot 0: the slot is decided by the VALUE")

    print("\n=== PASS TWO: each partner looked up in the finished table ===")
    for i, x in enumerate(nums):
        need = target - x
        j = table.get(need)
        print(f"  i={i} nums[i]={x}: need = {target} - {x} = {need}")
        print(f"      {table.last}")
        if j != -1 and j != i:
            print(f"      j = {j}, and j != i, so the answer is [{i}, {j}]")
            break

    print("\n=== when two values want the same slot ===")
    clash = TinyMap(8)
    for v in (3, 11, 19):
        clash.put(v, v)
        print(f"  put {v:>3}: {clash.last}")
        print(f"      {clash.picture()}")
    print("  probing is why O(1) is an average and not a promise")

    print("\n=== and the same arithmetic in CPython's real dict ===")
    for x in nums:
        print(f"    hash({x}) = {hash(x):>3}   {hash(x)} % 8 = {hash(x) % 8}   "
              f"{hash(x)} & 7 = {hash(x) & 7}   (the same, for a power-of-two size)")

def explain_arithmetic(nums: list[int], target: int) -> None:
    """The one piece of arithmetic, at every slot."""
    print(f"\n=== need = target - nums[i], for nums={nums}, target={target} ===")
    for i, x in enumerate(nums):
        need = target - x
        where = nums.index(need) if need in nums else None
        print(f"  i={i}  nums[i]={x:>3}  need = {target} - {x} = {need:>3}"
              f"   {'found at slot ' + str(where) if where is not None else 'not in the list'}")


def count_work(rng: random.Random) -> None:
    """Comparisons against lookups, on inputs whose answer is the LAST pair."""
    def brute(nums, target):
        n = 0
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                n += 1
                if nums[i] + nums[j] == target:
                    return n
        return n

    def one_pass(nums, target):
        seen, n = {}, 0
        for i, x in enumerate(nums):
            n += 1
            if target - x in seen:
                return n
            seen[x] = i
        return n

    print("\n=== work done when the answer is the last pair ===")
    print(f"  {'n':>7} {'brute-force comparisons':>25} {'one-pass lookups':>18}")
    for size in (100, 1000, 10000):
        data = rng.sample(range(10 * size), size)
        target = data[-1] + data[-2]
        print(f"  {size:>7} {brute(data, target):>25,} {one_pass(data, target):>18,}")


def measure_lookup() -> None:
    """A lookup does not care how big the container is; a scan does."""
    def timed(fn, repeat=5):
        best = float("inf")
        for _ in range(repeat):
            t = time.perf_counter()
            fn()
            best = min(best, time.perf_counter() - t)
        return best

    print("\n=== nanoseconds per question (this machine, so expect your own numbers) ===")
    print(f"  {'n':>9} {'dict.get':>12} {'x in list':>14}")
    for n in (1_000, 10_000, 100_000):
        values = list(range(n))
        table = {v: i for i, v in enumerate(values)}
        d = timed(lambda: [table.get(-1) for _ in range(200)]) / 200 * 1e9
        s = timed(lambda: [-1 in values for _ in range(20)]) / 20 * 1e9
        print(f"  {n:>9} {d:>11.1f}n {s:>13.1f}n")
    print("  the dict column is FLAT; the list column multiplies with n")


class _AllOneBucket:
    """Every instance hashes the same, on purpose: the O(n) worst case, forced."""

    __slots__ = ("v",)

    def __init__(self, v: int) -> None:
        self.v = v

    def __hash__(self) -> int:
        return 42

    def __eq__(self, other: object) -> bool:
        return isinstance(other, _AllOneBucket) and self.v == other.v


class _OwnBucket(_AllOneBucket):
    def __hash__(self) -> int:
        return hash(self.v)


def measure_collisions() -> None:
    """O(1) is an average. Force every key into one bucket and watch it become O(n)."""
    def timed(fn, repeat=3):
        best = float("inf")
        for _ in range(repeat):
            t = time.perf_counter()
            fn()
            best = min(best, time.perf_counter() - t)
        return best

    print("\n=== the same lookup, with distinct hashes and with one shared hash ===")
    print(f"  {'keys':>6} {'distinct':>12} {'all one bucket':>17}")
    for n in (200, 1000, 4000):
        good = {_OwnBucket(i): i for i in range(n)}
        bad = {_AllOneBucket(i): i for i in range(n)}
        probe_g = [_OwnBucket(i) for i in range(0, n, max(1, n // 50))]
        probe_b = [_AllOneBucket(i) for i in range(0, n, max(1, n // 50))]
        g = timed(lambda: [good.get(k) for k in probe_g]) / len(probe_g) * 1e9
        b = timed(lambda: [bad.get(k) for k in probe_b]) / len(probe_b) * 1e9
        print(f"  {n:>6} {g:>11.0f}n {b:>16.0f}n")
    print(f"  hash(5) = {hash(5)}, hash(0) = {hash(0)}, and hash(-1) = {hash(-1)}: "
          "a small int hashes to itself, except -1")

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

    show_buckets([3, 6, 1, 5], 8)
    explain_arithmetic([3, 6, 1, 5], 8)
    count_work(random.Random(7))
    measure_lookup()
    measure_collisions()

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
