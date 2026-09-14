# Find a Target in Sorted Array — explained

## Understanding the Problem

You are handed a shelf of numbered tickets, already in order, smallest on the left. Someone names a
number. Tell them which slot it is in, or tell them it is not on the shelf.

That is the whole statement, and it is deceptively small. The reason this problem is the first rung
of an entire pattern is not that it is hard — it is that it is the **smallest problem in which the
loop's contract is the entire difficulty**. Nobody has ever failed to understand "look at the middle
and throw away half". People fail at `mid + 1` versus `mid`, at `<` versus `<=`, and at what `lo`
means once the loop has stopped. Those three failures are the subject of this document.

**The core question:** not "where is the target" but **"which half of what remains can I discard
without looking inside it?"** The naive approach is slow because it never asks that question at all
— it treats an ordered shelf as an unordered bag and reads every ticket, throwing away the one
promise the input makes.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `1 <= nums.length <= 10^4` | Ten thousand. **This constraint does not rule out the linear scan** — 10⁴ comparisons is microseconds, and a scan would pass. The log bound here is a *stated requirement*, not a performance necessity, which makes this the rare problem where you must write the fast version because you were told to, not because you measured. The array is also never empty, so `nums[0]` is always safe. |
| `-10^4 <= nums[i], target <= 10^4` | Values fit an `int` in any language with room to spare. More usefully: indices run to at most 9999, so `lo + hi <= 19998`, and **the famous midpoint overflow cannot happen here.** That matters — it means writing the overflow-safe midpoint in this problem is a *habit*, not a fix, and you should know which it is. |
| sorted ascending | **This is the constraint that makes halving legal.** Everything below follows from it and nothing works without it. One unsorted element and every rung past the first is wrong. |
| every value is distinct | The answer is unique, so "an index holding the target" and "the index of the target" are the same phrase. **Delete this promise and the problem splits in two** — which is exactly what `first-last-position` is. |
| return `-1` when the target is absent | The loop must end in a state that can *distinguish* "absent" from "found", and the two contracts below do that differently: one returns from inside the loop, the other reads the answer off the exit position. |
| "Must run in `O(log n)`" | The linear scan is excluded by fiat. Say so out loud and move on. |

### The loop contract — read this before any code

Every binary search in this pattern is one of two shapes, and almost every bug in the family is
someone writing half of one and half of the other. Pick a contract, state it, keep it.

| | **Inclusive** `[lo, hi]` | **Converging** `[lo, hi]` |
|---|---|---|
| What the range means | every index from `lo` to `hi` is still a candidate | the answer is somewhere in `lo..hi`; shrink to one survivor |
| Loop test | `while lo <= hi` | `while lo < hi` |
| On "answer is strictly right" | `lo = mid + 1` | `lo = mid + 1` |
| On "answer is at or left of mid" | `hi = mid - 1` | `hi = mid` |
| Loop ends when | the range is **empty**: `lo == hi + 1` | the range is **one index**: `lo == hi` |
| Answer read from | a `return` inside the loop, or `lo` | `nums[lo]`, then verified |
| Probes when nothing is found | ⌊log₂n⌋ + 1 | exactly ⌈log₂n⌉ |

Two rules make the table safe to use, and they are not interchangeable:

- **Inclusive form: both moves must skip `mid`.** You have just compared `nums[mid]` to the target
  and learned everything `mid` can tell you. Leaving `mid` inside the range means re-asking a
  question you have already answered, and on a two-element range that is an infinite loop.
- **Converging form: exactly one side skips `mid`, and it must be `lo`.** `hi = mid` deliberately
  keeps `mid` as a candidate — that is the point, it is how the survivor can *be* `mid`. So the other
  branch has to make strict progress, or nothing shrinks.

> **Watch out.** The two mixings are the two classic failures, and they fail in opposite ways.
> `while lo <= hi` paired with `hi = mid` **never terminates** on a range where `mid == lo == hi`.
> `while lo < hi` paired with `hi = mid - 1` **steps over the answer**, because the converging form
> never gets to re-examine `mid` and you just discarded it. If you can only remember one thing:
> `<=` goes with `mid ± 1`, `<` goes with `hi = mid`.

### The midpoint, plainly

Write `mid = lo + (hi - lo) // 2`, not `(lo + hi) // 2`. Here is the actual reason, without the
folklore:

- **In Python the two are always the same number.** Python integers do not overflow; there is no
  value of `lo` and `hi` for which they differ. In Python this is a style choice and nothing more.
- **In Java and C++ they differ**, because `int` is 32 bits and wraps. This repo ships all three
  languages for every problem, so the habit has to survive the translation. With `lo` and `hi` both
  at `1073741824` (2³⁰), Java computes `(lo + hi) / 2` as **−1073741824** — a negative index, and an
  `ArrayIndexOutOfBoundsException` one line later. `lo + (hi - lo) / 2` returns `1073741824`. With
  `lo = 1000000000, hi = 2000000000` the naive form gives **−647483648**; the safe form gives
  `1500000000`. (Those three numbers are simulated 32-bit arithmetic, run, not recited.)
- **For this problem it cannot happen**, because `hi <= 9999`. It is a real bug in real code — it
  lived in the JDK's own `Arrays.binarySearch` for nine years — but on an array of 10⁴ elements it
  is theatre. Write the safe form because it costs nothing and because the same fingers will one day
  binary-search a range of file offsets, not because this input can trigger it.

The repo is consistent with itself here: the Java in `first-last-position.ts` already writes
`lo + (hi - lo) / 2` while the Python in this problem writes `(lo + hi) // 2`, and both are correct
for the reasons above. The documents below use `lo + (hi - lo) // 2` everywhere so the shape is one
shape.

### The worked example used in every section below

```
nums = [-3, 0, 4, 9, 12]
```

Two targets are traced through every approach, because this problem has two answers and only one of
them is interesting:

| target | answer | why it is in the trace |
|---|---|---|
| `9` | `3` | the hit — the easy path everyone gets right |
| `2` | `-1` | the miss — it sits between `0` and `4`, so the range must empty out and **the exit state is the only thing that can report it** |

---

## Approach 1 — Read every ticket

### The idea

*How do I find a value in an array?* Look at the values, one after another, until one of them is it.
If you get to the end, it was not there. This is the baseline, and its only job is to be so obviously
correct that the clever versions can be checked against it.

### How to think about it

> **Intuition.** You are looking for a name in a phone book by starting at `A` and reading every
> entry. Nothing about this is wrong — it is guaranteed to find the name. What it does is **decline
> a gift**: the book is in order, and order is information about entries you have not read. The
> scan learns exactly one bit per comparison ("not this one") when a comparison against a sorted
> array could have told you about thousands of entries at once. Everything that follows is one idea
> — *spend each comparison on as many elements as possible*.

### Worked example

`nums = [-3, 0, 4, 9, 12]`.

| target | `i` | `nums[i]` | equal? | action |
|---|---|---|---|---|
| **9** | 0 | `-3` | no | keep going |
| | 1 | `0` | no | keep going |
| | 2 | `4` | no | keep going |
| | 3 | `9` | **yes** | **return 3** |
| **2** | 0 | `-3` | no | keep going |
| | 1 | `0` | no | keep going |
| | 2 | `4` | no | keep going |
| | 3 | `9` | no | keep going |
| | 4 | `12` | no | keep going |
| | — | — | — | fell off the end → **return −1** |

Nine comparisons for a five-element array. The optimal versions below use **three**, total, for both
targets combined.

### Code

```python
def classic_binary_search_linear_scan(nums: list[int], target: int) -> int:
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1
```

### Common mistake

> **Watch out.** The misconception is that adding an early exit — *stop as soon as `nums[i]` passes
> the target, since the array is sorted* — turns the scan into something fast. It does not. It is
> **correct**, and it changes nothing that matters.

This is a case where the "buggy" variant is not buggy, and saying so is more useful than inventing a
failure:

```python
    for i, x in enumerate(nums):
        if x == target:
            return i
        if x > target:       # correct, and worth nothing
            return -1
    return -1
```

Run it on the worked example and it returns `3` for target `9` and `-1` for target `2` — both right.
It even saves two comparisons on the miss. But the worst case is unchanged: a target equal to the
last element, or larger than everything, still reads all `n` entries. `O(n)` is a statement about the
worst case, and the early exit does not touch the worst case. **The misconception worth naming is
"uses sortedness" being confused with "logarithmic".** Both the early exit and binary search use
sortedness. Only one of them discards a *fraction* of the remaining candidates per comparison, and
that fraction is the entire difference.

The genuinely wrong version of this rung is reaching for the language's built-in:

```python
    return nums.index(target)     # WRONG — raises instead of returning -1
```

On the worked example with target `2` that does not return anything; it raises
`ValueError: 2 is not in list`. The statement asked for `-1`, and a thrown exception is not `-1`.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)`. The cost is one comparison per element and there are `n` of them;
there is no state beyond the loop index, so space is a constant.

Use it as the oracle. At the bottom of this document it is the reference every other approach is
cross-checked against, and that is the right role for it: it is the only version whose correctness
you can confirm by reading it once. In an interview, name it in a sentence, name `O(n)`, note that
the statement explicitly demands `O(log n)`, and move on.

---

## Approach 2 — Halve it, recursively

### The idea

*The scan learns one element per comparison — can one comparison rule out many?* Yes, and sortedness
is what makes it legal. Compare the target against the middle element: if the middle is too small,
everything from the middle leftwards is also too small and can be deleted in one stroke. Then solve
the same problem on what is left, which is what recursion is for.

This fixes the scan's central weakness — **it spends a comparison to eliminate one candidate when
the ordering entitles it to eliminate half of them.**

### How to think about it

> **Intuition.** Guess-the-number, played properly. Someone is thinking of a number between 1 and
> 1000 and answers "higher" or "lower". You do not start at 1. You say 500, and whichever answer you
> get, 500 numbers just died. The array is the same game with the answers written down in advance:
> `nums[mid]` versus the target *is* the "higher or lower", and the half it condemns never needs to
> be read. Recursion is just the honest spelling of "now play the same game on what is left" — the
> subproblem is literally the same problem on a smaller range.

> **Why it works.** The invariant is: **if the target is present at all, its index is in
> `[lo, hi]`.** It starts true because the range is the whole array. Each step preserves it. If
> `nums[mid] < target`, then for every index `i <= mid` sortedness gives `nums[i] <= nums[mid] <
> target`, so **no index at or left of `mid` can hold the target** — discarding `[lo, mid]` cannot
> discard the answer. The mirror argument covers `nums[mid] > target`. When `lo > hi` the range is
> empty, the invariant says the target's index is in an empty set, and therefore the target is
> absent.

### Worked example

`nums = [-3, 0, 4, 9, 12]`. Each row is one call; the range shown is what that call was handed.

| target | call | `lo` | `hi` | `mid` | `nums[mid]` | verdict | next call |
|---|---|---|---|---|---|---|---|
| **9** | 1 | 0 | 4 | 2 | `4` | `4 < 9` — left half dies | `go(3, 4)` |
| | 2 | 3 | 4 | 3 | `9` | **hit** | **return 3** |
| **2** | 1 | 0 | 4 | 2 | `4` | `4 > 2` — right half dies | `go(0, 1)` |
| | 2 | 0 | 1 | 0 | `-3` | `-3 < 2` — left half dies | `go(1, 1)` |
| | 3 | 1 | 1 | 1 | `0` | `0 < 2` — left half dies | `go(2, 1)` |
| | 4 | 2 | 1 | — | — | `lo > hi`, range empty | **return −1** |

Two calls for the hit, four for the miss. Row 4 is the important one and the one people forget
exists: a call whose range is **empty**, `lo` one past `hi`. That is not an error state, it is the
answer.

### Code

```python
def classic_binary_search_recursive(nums: list[int], target: int) -> int:
    def go(lo: int, hi: int) -> int:
        if lo > hi:  # the range is empty: the invariant now says "absent"
            return -1
        mid = midpoint(lo, hi)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            return go(mid + 1, hi)
        return go(lo, mid - 1)

    return go(0, len(nums) - 1)
```

`midpoint` is the shared helper declared once at the top of the full script:

```python
def midpoint(lo: int, hi: int) -> int:
    """Midpoint of an inclusive range, written so it cannot overflow a 32-bit int.

    In Python this is identical to (lo + hi) // 2 for every input; the form is kept
    because the Java and C++ translations of the same loop are not so lucky.
    """
    return lo + (hi - lo) // 2
```

That helper is the "one obvious place to edit" for the midpoint rule, and every approach in this
document calls it. **Contract used: inclusive `[lo, hi]`, `while`-equivalent test `lo > hi` as the
base case, both moves `mid ± 1`.**

### Common mistake

> **Watch out.** The misconception is that `lo >= hi` is "the range has run out" — it reads like it
> in English. It is not: `lo == hi` is a range holding **exactly one candidate**, and that candidate
> is very often the answer. Empty is `lo > hi`, and only `lo > hi`.

```python
    def go(lo: int, hi: int) -> int:
        if lo >= hi:      # WRONG — throws away every one-element range unexamined
            return -1
```

The reason this bug survives so long is that it is **right about the worked example**. Run it on
`nums = [-3, 0, 4, 9, 12]` with target `9` and it returns `3`, correct, because that search never
narrows to a single index. Run the same code on the same array with every target in turn:

| target | correct | with `lo >= hi` |
|---|---|---|
| `-3` | 0 | 0 |
| `0` | 1 | **−1** |
| `4` | 2 | 2 |
| `9` | 3 | 3 |
| `12` | 4 | **−1** |
| `2` (absent) | −1 | −1 |

Two of the five present values are reported missing. The three it gets right are the ones whose
search happens to land on them while the range still holds two or more indices. A test suite with
one example passes; the submission fails. **That is the argument for the stress test at the bottom
of this document**, and it is why the trace above spends four rows on the miss.

### Complexity and when to use this

**Time** `O(log n)`, **space** `O(log n)`. The time is the number of halvings it takes to reduce `n`
to zero, which is `log₂n` — for `n = 10⁴`, fourteen probes rather than ten thousand. The space is the
part people forget: **each call is a stack frame**, and there are `log n` live at the deepest point.
Fourteen frames is nothing, but the space is not `O(1)` and claiming it is will be corrected.

Use it when the recursion genuinely clarifies — on a tree, or when the "smaller subproblem" is not a
contiguous index range and carrying it in two variables would be awkward. For a flat array it buys
readability some people like and costs stack frames everyone pays. The next rung is the same
algorithm with the frames removed.

---

## Approach 3 — The same halving, iteratively *(the data file's primary solution)*

### The idea

*The recursion's every call does the same thing to two variables and then tail-calls itself — is the
stack doing any work?* No. `lo` and `hi` are the entire state, and a loop can carry two integers
without asking the runtime for a frame. Rewrite the recursion as a `while` and the space collapses
to constant.

This fixes Approach 2's only real weakness — **`O(log n)` stack frames bought nothing**, and in
languages without tail-call elimination (including Python) they are a genuine, if small, cost.

### How to think about it

> **Intuition.** Two bookmarks in the shelf, one at each end of the stretch that could still contain
> the ticket. Every step you look at the ticket halfway between them and move **one** bookmark past
> the middle — past, never onto it, because you have already read that ticket and it told you what
> it knows. The bookmarks march toward each other. When they cross, the stretch between them is
> empty and the ticket was never on the shelf. The recursion was two bookmarks too, it was just
> paying the runtime to hold them.

> **Why it works.** Same invariant, same discard argument as Approach 2 — if the target is present,
> its index is in `[lo, hi]`; `nums[mid] < target` proves every index `i <= mid` has `nums[i] <
> target` and therefore cannot be the answer. What the loop adds is a **termination** argument:
> every iteration either returns or moves `lo` strictly up or `hi` strictly down, so `hi - lo`
> strictly decreases, so after at most `log₂n + 1` iterations the range is empty. The `mid ± 1` is
> doing double duty here — correctness *and* termination — which is why it is not negotiable.

### Worked example

`nums = [-3, 0, 4, 9, 12]`. **Contract: inclusive `[lo, hi]`, `while lo <= hi`, both moves
`mid ± 1`.**

| target | step | `lo` | `hi` | range | `mid` | `nums[mid]` | compare | action |
|---|---|---|---|---|---|---|---|---|
| **9** | 1 | 0 | 4 | `[-3, 0, 4, 9, 12]` | 2 | `4` | `4 < 9` | `lo = 3` |
| | 2 | 3 | 4 | `[9, 12]` | 3 | `9` | **equal** | **return 3** |
| **2** | 1 | 0 | 4 | `[-3, 0, 4, 9, 12]` | 2 | `4` | `4 > 2` | `hi = 1` |
| | 2 | 0 | 1 | `[-3, 0]` | 0 | `-3` | `-3 < 2` | `lo = 1` |
| | 3 | 1 | 1 | `[0]` | 1 | `0` | `0 < 2` | `lo = 2` |
| | 4 | 2 | 1 | `[]` | — | — | `lo > hi` | **return −1** |

Step 3 of the miss is the row worth memorising: a **one-element range**, `lo == hi == 1`, and it is
examined properly. Approach 2's common mistake is exactly the code that skips this row. Step 4 is the
exit: `lo = 2`, `hi = 1`, the range is `nums[2..1]`, which is empty and correct.

### Code

```python
def classic_binary_search_iterative(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:  # inclusive range: lo == hi still holds one live candidate
        mid = midpoint(lo, hi)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1  # everything at or left of mid is too small
        else:
            hi = mid - 1  # everything at or right of mid is too large
    return -1
```

### Common mistake

> **Watch out.** The misconception is that `lo = mid` is the "safe" move and `lo = mid + 1` the
> risky one — that keeping `mid` in play guards against losing the answer. In the inclusive contract
> it is the opposite: `mid` has already been compared and found unequal, so keeping it is not
> caution, it is a **fixed point**. The range stops shrinking and the loop never ends.

```python
        if nums[mid] < target:
            lo = mid          # WRONG — mid was already rejected, and now it never leaves
```

This does not return a wrong answer. It **hangs**. Running it on the worked example with `target =
12` and a step counter to stop the bleeding, here is what it does:

| step | `lo` | `hi` | `mid` | `nums[mid]` | action |
|---|---|---|---|---|---|
| 1 | 0 | 4 | 2 | `4` | `lo = 2` |
| 2 | 2 | 4 | 3 | `9` | `lo = 3` |
| 3 | 3 | 4 | 3 | `9` | `lo = 3` |
| 4 | 3 | 4 | 3 | `9` | `lo = 3` |
| … | 3 | 4 | 3 | `9` | forever |

`lo + (4 - 3) // 2 = 3` for as long as you care to watch. The submission does not come back with a
wrong answer; it times out, which is a harder failure to read. **The rule that prevents it:** in the
inclusive contract, `mid` has been *fully judged* by the time you move a pointer, so both moves skip
it. There is no branch in which keeping `mid` is correct.

The mirror bug, `hi = mid` with `while lo <= hi`, hangs the same way for the same reason — that is
the first row of the mixing table up at the top of the document.

### Complexity and when to use this

**Time** `O(log n)`, **space** `O(1)`. The time is the halving count: each iteration at least halves
`hi - lo + 1`, so the loop body runs at most `⌊log₂n⌋ + 1` times — fourteen for `n = 10⁴`, twenty-four
for a ten-million-element array. The space is two integers and a third for `mid`, regardless of `n`;
nothing is allocated and nothing is stacked.

**This is the one to write.** It is the version the data file ships as the primary solution, it is
what an interviewer expects to see, and it is the shape every later problem in this pattern
customises. When the question is literally "is this value here, and where", the inclusive contract
with an early `return` on the hit is the shortest honest answer.

---

## Approach 4 — Converge on the single survivor *(an addition — the second contract, not in the data file)*

### The idea

*What if the loop is not allowed to return early — what if it must run until exactly one candidate
remains, and only then look?* That is the other contract, and it is worth writing once here, on the
easiest possible problem, because **the next three problems in this pattern are all written in it.**
Shrink until `lo == hi`, then ask one question: is the survivor the target?

This does not fix a weakness in Approach 3 — for *this* problem Approach 3 is strictly better,
because it can return early on a hit. What this rung fixes is a weakness in **you**: the inclusive
contract cannot express "find the first index where a property starts holding", and that is what
`search-insert-position`, `first-last-position` and `single-in-sorted` all actually are.

### How to think about it

> **Intuition.** A tournament, not a search. Instead of asking "is this it?" at every step, you ask
> the weaker question "could the answer be at or left of the middle?" and keep exactly the side that
> could contain it. You never declare a winner mid-tournament; you shrink the bracket until one
> competitor is left standing, and *then* you check whether the survivor is actually any good. The
> payoff is that "could the answer be at or left of here?" is a question you can ask about
> properties that no single element can confirm — *the first value that is at least the target*, *the
> first index where the pairing breaks* — and those are the problems where this contract is the only
> one that works.

> **Why it works.** The invariant is weaker than Approach 3's and that is the point: **if the target
> is present, its index is in `[lo, hi]`**, maintained by a predicate rather than an equality test.
> `nums[mid] < target` proves every index `i <= mid` is too small, so `lo = mid + 1` discards only
> indices that provably cannot hold the target. `nums[mid] >= target` leaves open that `mid` itself
> is the answer, so `hi = mid` keeps it. Termination: with `lo < hi`, `midpoint` returns something in
> `[lo, hi - 1]`, so `lo = mid + 1` strictly raises `lo` and `hi = mid` strictly lowers `hi`. The
> range shrinks every iteration and ends holding one index. The **final equality check is not
> optional** — the invariant only ever said "*if* present", and the survivor is where the target
> would be, not proof that it is.

### Worked example

`nums = [-3, 0, 4, 9, 12]`. **Contract: converging, `while lo < hi`, `lo = mid + 1` / `hi = mid`,
verify at the end.**

| target | step | `lo` | `hi` | `mid` | `nums[mid]` | `nums[mid] < target`? | action |
|---|---|---|---|---|---|---|---|
| **9** | 1 | 0 | 4 | 2 | `4` | yes | `lo = 3` |
| | 2 | 3 | 4 | 3 | `9` | no | `hi = 3` |
| | — | 3 | 3 | — | — | — | survivor index 3, `nums[3] == 9` → **return 3** |
| **2** | 1 | 0 | 4 | 2 | `4` | no | `hi = 2` |
| | 2 | 0 | 2 | 1 | `0` | yes | `lo = 2` |
| | — | 2 | 2 | — | — | — | survivor index 2, `nums[2] == 4 ≠ 2` → **return −1** |

Look at the miss. The loop finishes perfectly happily, pointing at index 2 — which is not wrong,
it is **where `2` would go** if you inserted it. The loop found a boundary; the equality check is
what turns a boundary into an answer to *this* question. Hold that thought: the next document in this
pattern is the problem where you keep the boundary and drop the check.

### Code

```python
def classic_binary_search_converging(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:  # converging range: stop with exactly one candidate left
        mid = midpoint(lo, hi)
        if nums[mid] < target:
            lo = mid + 1  # mid is provably too small, skip it
        else:
            hi = mid  # mid might BE the answer, so keep it
    return lo if nums[lo] == target else -1
```

Note what is *absent*: there is no `== target` branch inside the loop. The loop does not look for the
target, it looks for a boundary; equality is checked once, at the end. That asymmetry — `mid + 1` on
one side, `mid` on the other — is the converging contract's signature, and seeing it should tell you
which contract you are reading before you read anything else.

### Common mistake

> **Watch out.** The misconception is that once `lo == hi` the search "found" something, so the
> final comparison is a formality. It is not a formality. **The converging loop always terminates
> pointing at an index, whether the target exists or not** — on an array with no match at all, `lo`
> still lands somewhere, because the loop's job was to locate a boundary, not to confirm a value.

```python
    return lo                 # WRONG — reports an index for a value that is not there
```

Run it on `nums = [-3, 0, 4, 9, 12]`:

| target | present? | correct | dropping the check |
|---|---|---|---|
| `9` | yes | 3 | 3 |
| `2` | no | −1 | **2** |
| `99` | no | −1 | **4** |
| `-99` | no | −1 | **0** |

Every absent target gets a confident index. Note that the three wrong answers are not random —
`2` returns `2`, `99` returns `4`, `-99` returns `0` — those are precisely the *insertion points*.
The buggy function is not broken; it is a correct implementation of a **different problem**, and
recognising that is more useful than memorising the fix. (Its one real defect is at the edges: for
`99` it returns `4`, but the honest insertion point is `5`, one past the end, and a range capped at
`len(nums) - 1` cannot express that. The next document fixes exactly that.)

### Complexity and when to use this

**Time** `O(log n)`, **space** `O(1)`. The time is `⌈log₂n⌉` probes — note this is *exactly* that
many, always, with no early exit, where Approach 3 can get lucky and return on the first probe. The
constant factor is slightly worse for a hit and identical for a miss. Space is two integers.

Use it when the question is **"where is the boundary"** rather than **"is this value here"** — which
is to say, use it for almost every other problem in this pattern. For this problem, prefer Approach 3
and know this one exists; for `search-insert-position`, `first-last-position` and
`single-in-sorted`, this is the contract and Approach 3's shape does not fit.

---

## The Overall Arc

The principle every rung chases is **spend each comparison on as many candidates as it can possibly
eliminate**, and the whole ladder is the consequence of noticing that a sorted array lets one
comparison speak for half the elements you have not read. The linear scan declines that offer: it
asks "is this the one?" `n` times and each answer is worth exactly one element, which is why it is
`O(n)` on an input that is handing you `O(log n)` for free. Halving accepts the offer, and because
"now do the same on what is left" is literally the same problem on a shorter range, recursion is the
first natural spelling — correct, clear, and paying `log n` stack frames for two integers it could
have carried itself. Removing the recursion is pure profit and leaves the version worth memorising:
two bookmarks, `while lo <= hi`, probe the middle, move one bookmark *past* it. But the iterative
version quietly contains the decision that the rest of this pattern turns on — **what the range means
and when the loop is allowed to stop** — and there are two coherent answers, not one. The inclusive
contract treats the range as a set of live candidates, ends when that set is empty, and reports
success by returning from inside; it is perfect when the question is "is this exact value present".
The converging contract treats the range as a bracket around a boundary, ends when one index
survives, and asks its question once at the end; it is the only one of the two that can express
"the first index where some property starts holding", because that property may be invisible at any
single probe. The last rung here does nothing useful for *this* problem — Approach 3 beats it — but
it reveals that the buggy version of itself, the one that forgets the final equality check, is a
correct solution to a different and more general question: *where would this value go?* That is not a
coincidence and it is not a bug you should just patch. It is the next problem, and the two after it,
and the reason this easy problem is worth a long document: get the contract right here, in five
elements you can trace by hand, and the medium ones stop being about off-by-ones and start being
about what you are searching **for**.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Read every ticket | `O(n)` | `O(1)` | Declines the sortedness entirely; one comparison buys one element | It is the oracle in your test harness, or `n` is a handful |
| Recursive halving | `O(log n)` | `O(log n)` stack | Cleanest expression of "same problem, smaller range", paid for in frames | The subproblem is not a contiguous index range — trees, not arrays |
| **Iterative, inclusive `[lo, hi]`** | **`O(log n)`** | **`O(1)`** | **Two integers carry everything; early `return` on a hit** | **The default. The question is "is this exact value here, and where"** |
| Converging, one survivor | `O(log n)` | `O(1)` | No early exit — always `⌈log₂n⌉` probes — but expresses boundaries, which the inclusive form cannot | The question is "where is the boundary": the rest of this pattern |

---

## Interview Priority

> **In an interview.** Say the contract out loud before you write it: *"I'll keep an inclusive
> range `[lo, hi]` of indices that could still hold the target, loop while `lo <= hi`, and move
> past `mid` on both sides because `mid` has already been compared."* That single sentence
> pre-empts the two follow-ups you would otherwise get — "why `mid + 1`?" and "what does `lo` mean
> when the loop ends?" — and it signals that the off-by-ones are a decision you made rather than a
> thing you are hoping about. If asked to do it recursively, do it, but volunteer that it is
> `O(log n)` space.

**Memorize cold — the iterative inclusive search (Approach 3).** Five lines, and you should be able
to write them with your eyes closed, including `hi = len(nums) - 1` (not `len(nums)`) and both
`mid ± 1`. The follow-up to expect is *"what happens when the target is absent — what is `lo` at that
point?"* Answer: `lo` is one past `hi`, the range is empty, and — worth adding unprompted — `lo` is
sitting exactly on the insertion point, which is the next problem.

**Memorize cold — the converging form (Approach 4).** Not for this problem, where it is the weaker
choice, but because it is the skeleton of every boundary search you will be asked for. The two
things to have automatic: `while lo < hi`, and the asymmetry `lo = mid + 1` / `hi = mid`. If you find
yourself writing `hi = mid - 1` under a `while lo < hi`, stop — you have mixed the contracts and you
are about to step over the answer.

**Worth understanding, not memorizing — the recursion.** It is the same algorithm and most people
find it the clearest first explanation, so it is a fine thing to *say* while you write the loop. Just
do not offer it as your final answer without naming the stack cost, because an interviewer who asks
"and the space complexity?" is asking whether you noticed.

**Not worth memorizing — the linear scan.** But do name it and reject it, and reject it on the right
grounds: here the reason is the stated `O(log n)` requirement, not the input size, because 10⁴
elements would scan fine. Rejecting an approach for the *wrong* reason is a worse signal than not
rejecting it.

---

## Full Runnable Script

Every approach above, plus a test suite: both statement examples, every present value in the example
array, targets below and above the whole range, a target that falls in a gap, the smallest legal
input at length 1 both ways, and 600 randomised stress cases over sorted distinct arrays — each one
querying both a value that is present and a value that is absent, all cross-checked against the
linear scan.

```python
"""Find a Target in Sorted Array - every approach in one file, plus a self-checking test suite.

Run: python classic_binary_search_all.py
"""

from __future__ import annotations

import random

# --- shared: the one place the midpoint rule lives ------------------------------


def midpoint(lo: int, hi: int) -> int:
    """Midpoint of an inclusive range, written so it cannot overflow a 32-bit int.

    In Python this is identical to (lo + hi) // 2 for every input; the form is kept
    because the Java and C++ translations of the same loop are not so lucky.
    """
    return lo + (hi - lo) // 2


# --- 1. Read every ticket ------------------------------------------------------


def classic_binary_search_linear_scan(nums: list[int], target: int) -> int:
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1


# --- 2. Halve it, recursively --------------------------------------------------


def classic_binary_search_recursive(nums: list[int], target: int) -> int:
    def go(lo: int, hi: int) -> int:
        if lo > hi:  # the range is empty: the invariant now says "absent"
            return -1
        mid = midpoint(lo, hi)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            return go(mid + 1, hi)
        return go(lo, mid - 1)

    return go(0, len(nums) - 1)


# --- 3. The same halving, iteratively (the data file's primary) ----------------


def classic_binary_search_iterative(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:  # inclusive range: lo == hi still holds one live candidate
        mid = midpoint(lo, hi)
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1  # everything at or left of mid is too small
        else:
            hi = mid - 1  # everything at or right of mid is too large
    return -1


# --- 4. Converge on the single survivor ---------------------------------------


def classic_binary_search_converging(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:  # converging range: stop with exactly one candidate left
        mid = midpoint(lo, hi)
        if nums[mid] < target:
            lo = mid + 1  # mid is provably too small, skip it
        else:
            hi = mid  # mid might BE the answer, so keep it
    return lo if nums[lo] == target else -1


APPROACHES = [
    ("linear_scan", classic_binary_search_linear_scan),
    ("recursive", classic_binary_search_recursive),
    ("iterative", classic_binary_search_iterative),
    ("converging", classic_binary_search_converging),
]

# --- test suite ----------------------------------------------------------------


def main() -> None:
    example = [-3, 0, 4, 9, 12]
    cases: list[tuple[str, list[int], int]] = [
        ("statement example, present", example, 9),
        ("statement example, absent", example, 2),
        ("first element", example, -3),
        ("last element", example, 12),
        ("middle element", example, 4),
        ("second element", example, 0),
        ("below everything", example, -10000),
        ("above everything", example, 10000),
        ("in a gap", example, 7),
        ("length 1, present", [5], 5),
        ("length 1, absent", [5], 4),
        ("length 2, both present", [1, 2], 1),
        ("length 2, second present", [1, 2], 2),
        ("length 2, absent between", [1, 3], 2),
        ("negatives only", [-9, -7, -5, -1], -5),
    ]

    rng = random.Random(20260912)
    for n in range(1, 31):
        pool = rng.sample(range(-60, 61), n)
        nums = sorted(pool)
        present = nums[rng.randrange(n)]
        cases.append((f"stress n={n} present", nums, present))
        absent = rng.randrange(-70, 71)
        while absent in nums:
            absent = rng.randrange(-70, 71)
        cases.append((f"stress n={n} absent", nums, absent))
        cases.append((f"stress n={n} below", nums, nums[0] - 1))
        cases.append((f"stress n={n} above", nums, nums[-1] + 1))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums, target in cases:
        shown = nums if len(nums) <= 10 else nums[:10] + ["..."]
        print(f"\n{label}: nums={shown} target={target}")
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums), target)
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        if any(r != results[0] for r in results):
            all_agreed = False
            print("  DISAGREEMENT")
        # an index is only an answer if it actually holds the target
        if results[0] != -1 and nums[results[0]] != target:
            all_agreed = False
            print("  BAD INDEX")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```
