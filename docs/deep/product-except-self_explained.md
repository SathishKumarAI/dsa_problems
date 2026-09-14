# Product of Everything Else — explained

## Understanding the Problem

Imagine four price tags on a table and someone asking, of each one in turn, "what do the *other*
three multiply to?" That is the whole problem: hand back a list of the same length where slot `i`
holds the product of everything in the original list except the number sitting in slot `i`. Two rules
make it interesting — you may not divide, and the whole thing must run in time proportional to the
list's length rather than its square.

**The core question:** for every position, what is the product of the whole list *minus one element*?
The naive approach is slow because it treats each of the `n` positions as an unrelated problem and
rebuilds an almost-identical product from scratch — when the answer for position 5 and the answer for
position 6 share all but two of their factors.

The **no-division** rule looks arbitrary and is not. Division would let you compute the total once
and divide it out per position — one line, finished — except that it dies the moment a zero appears.
Banning it forces you to find the *structure*: everything except position `i` splits cleanly into
**everything to the left of `i`** and **everything to the right of `i`**, two questions that never
overlap.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `2 <= nums.length <= 10^5` | A hundred thousand elements makes the `O(n²)` version about 10¹⁰ multiplications — hopeless. **This is what rules brute force out.** The lower bound of `2` also means the product of everything else is never an empty product, so there is no argument to have about a single-element list. |
| `-30 <= nums[i] <= 30` | Values are small and may be negative or zero. The negatives are a reminder that **signs** matter: an even number of negative factors flips back to positive. This bound does **not** unlock direct indexing, because the values here are never used as lookup keys — nothing is being searched for. |
| every answer fits in a 32-bit integer | **This unlocks fixed-width arithmetic**: in Java or C++ every running product can live in a plain `int`. One subtlety, covered in Approach 4 — the running variable's *final* update in each pass can exceed 32 bits, but that value is never read. |
| division is off the table, and the array may contain zeros | **This is what forces the prefix/suffix structure.** With a zero present, division needs a separate counting-of-zeros special case to be correct at all, while a prefix/suffix sweep treats a zero exactly like any other number. |

One rung of the usual ladder has no analogue here, and it is worth saying why. There is no "sort the
input and search it" step, because the answer is *indexed by position* — slot `i` of the output is
about slot `i` of the input — and sorting destroys precisely that correspondence. This ladder is
instead about how much **partial work** you keep around and reuse.

The worked example used in every section below is the statement's own:

```
nums = [1, 2, 3, 4]        answer: [24, 12, 8, 6]
```

Check it by hand once: position `0` gets 2·3·4 = 24, position `1` gets 1·3·4 = 12, position `2` gets
1·2·4 = 8, position `3` gets 1·2·3 = 6.

One value recurs in every approach below and is worth naming rather than typing four times — the
**empty product**, the thing a running product starts from before any factor has joined it:

```python
EMPTY_PRODUCT = 1  # the product of no numbers at all; every accumulator below starts here
```

---

## Reading the Calculations

This is the first problem in the set whose optimal solution is genuinely hard to *read*. Not hard to
write — it is nine lines — but hard to look at and believe, because the same array is used as an
output buffer and as a scratch pad, and because the crucial line writes a value **before** the
variable it is built from has been updated. Almost every bug here is an ordering bug, so this section
is about ordering.

### The symbol table

| You will see | It computes | Why it is written that way | If it were wrong |
|---|---|---|---|
| `EMPTY_PRODUCT = 1` | the product of *no* numbers | Multiplying by `1` changes nothing, which is exactly what "nothing has joined yet" should mean. (`0` is the equivalent for sums) | Start at `0` and every answer is `0` |
| `left[i]` | product of everything **strictly before** `i` | "Strictly" is the whole contract. `left[0]` is the empty product, because nothing is before position `0` | Include `nums[i]` and every answer is the product of the whole array |
| `left[i] = left[i - 1] * nums[i - 1]` | extend the previous prefix | Note the **two different indices**: writing at `i`, reading `nums` at `i - 1`. That offset *is* the word "strictly" | `nums[i]` here folds each element into its own answer — the most common bug in this problem |
| `right[i] = right[i + 1] * nums[i + 1]` | the mirror image | Same offset, other direction | — |
| `out[i] = left[i] * right[i]` | everything except `i` | The two halves never overlap and together cover everything else, so their product is the answer | — |
| `out[i] = running` **then** `running *= nums[i]` | the fold, forward | **Write before you update.** The value stored is the prefix *not yet* including `nums[i]` | Swap the two lines and `out[i]` includes `nums[i]` — the same bug as above, in disguise |
| `out[i] *= running` **then** `running *= nums[i]` | the fold, backward | `*=` because `out[i]` already holds the prefix; this multiplies the suffix into it | `=` overwrites the prefix and the answer becomes the suffix alone |
| `range(n - 1, -1, -1)` | `n-1` down to `0` | The `-1` end is exclusive, so it stops *after* `0` | `range(n - 1, 0, -1)` never visits position `0` — which is left holding a prefix of `1` and no suffix, silently wrong at exactly one index |

### The one rearrangement

Start from the definition and split it. The answer at `i` is the product of everything except `i`:

```
answer[i]  =  nums[0] * nums[1] * … * nums[i-1]  *  nums[i+1] * … * nums[n-1]
              \___________  ___________/            \_________  _________/
                          \/                                  \/
                   everything LEFT of i                everything RIGHT of i

answer[i]  =  left[i] * right[i]
```

That is the entire idea, and it is worth seeing why it is a *rearrangement* rather than a trick. The
naive reading treats each `answer[i]` as its own product, so the `n` answers share nothing. This
reading says the answers are all built from two **running** quantities that each change by one factor
per step — so the `n` answers share almost everything, and the sharing is what turns `n²` into `n`.

The division approach is the same equation solved the other way: `answer[i] = total / nums[i]`. It is
algebraically correct and it is not defined when `nums[i]` is `0`, which is why the statement bans it
and why the split above is the durable version. Division needs the whole product and then undoes
part of it; the split never builds the whole product in the first place.

### How to hand-trace it

`nums = [1, 2, 3, 4]`. The folded version, both passes, on one array. Every row below is printed by
the script at the foot of this document.

**Forward pass** — store the running prefix, *then* extend it:

| `i` | `out[i] = running` | then `running *= nums[i]` |
|---|---|---|
| 0 | `out[0] = 1` | `running = 1` |
| 1 | `out[1] = 1` | `running = 2` |
| 2 | `out[2] = 2` | `running = 6` |
| 3 | `out[3] = 6` | `running = 24` |

`out` is now `[1, 1, 2, 6]` — each slot holding the product of everything to its left. The final
`running = 24` is computed and never read, which is the detail the 32-bit note at the top refers to.

**Backward pass** — `running` resets to `1` and the same dance runs the other way:

| `i` | `out[i] *= running` | then `running *= nums[i]` |
|---|---|---|
| 3 | `6 * 1 = 6` | `running = 4` |
| 2 | `2 * 4 = 8` | `running = 12` |
| 1 | `1 * 12 = 12` | `running = 24` |
| 0 | `1 * 24 = 24` | `running = 24` |

`out = [24, 12, 8, 6]`. Check one by hand: position `1` should be `1·3·4 = 12`, and it is — the `1`
came from the forward pass, the `12` from the backward one, and `nums[1] = 2` was never multiplied in
by either, because both passes write before they update.

**The recipe, for any input:** sweep left storing the running product *before* folding in the current
element; reset; sweep right multiplying the running product *into* what is already there, again
before folding in the current element. The phrase "before folding in the current element", said
twice, is the entire algorithm.

---

## Approach 1 — Brute force: multiply the others, once per position

### The idea

*How do I get the product of everything except one element?* Loop over the whole array and multiply
in every element whose position is not the excluded one. Do that once for each of the `n` positions
and the whole answer is built, with no cleverness and no risk of being wrong.

### How to think about it

> **Intuition.** A shopping receipt, and the question "what would the total be without item 3?".
> With no memory of anything you re-add every other line from scratch. Then someone asks the same
> about item 4, and you re-add every other line again — the same lines you just added, minus a
> different one. That is the shape here with multiplication instead of addition: `n` independent
> traversals, each rebuilding an almost-identical product. The reasoning has no notion that the
> answers are related to one another, and that missing relationship is the entire inefficiency.

### Worked example

`nums = [1, 2, 3, 4]`.

| excluded `i` | inner walk (`j`, skipping `j == i`) | `product` after each step | `out` so far |
|---|---|---|---|
| 0 | `j=1` ×2, `j=2` ×3, `j=3` ×4 | 1 → 2 → 6 → **24** | `[24]` |
| 1 | `j=0` ×1, `j=2` ×3, `j=3` ×4 | 1 → 1 → 3 → **12** | `[24, 12]` |
| 2 | `j=0` ×1, `j=1` ×2, `j=3` ×4 | 1 → 1 → 2 → **8** | `[24, 12, 8]` |
| 3 | `j=0` ×1, `j=1` ×2, `j=2` ×3 | 1 → 1 → 2 → **6** | `[24, 12, 8, 6]` |

Sixteen index visits, twelve multiplications, for four answers. Rows `0` and `1` both multiply by 3
and by 4; rows `2` and `3` both multiply by 1 and by 2. Every shared factor is computed twice or
more, and that redundancy is what the rest of this document removes.

### Code

```python
def product_except_self_brute_force(nums: list[int]) -> list[int]:
    out: list[int] = []
    for i in range(len(nums)):
        product = EMPTY_PRODUCT
        for j in range(len(nums)):
            if j != i:  # the only position skipped
                product *= nums[j]
        out.append(product)
    return out
```

### Common mistake

> **Watch out.** The misconception is that `product = 1` is **setup** — the kind of line that belongs
> at the top of a function next to the other declarations. It is not setup, it is part of the inner
> calculation: each position's product is a complete, self-contained computation that must start from
> a clean slate.

Hoisting it outside the outer loop carries the previous position's product into the next one, and
every answer after the first is garbage — on `[1, 2, 3, 4]` you get `[24, 288, 2304, …]`, growing
without bound. Initialising to `0` instead of `1` is the other half of the same misconception and
makes every answer `0`; the multiplicative identity is `EMPTY_PRODUCT`, not zero.

### Complexity and when to use this

**Time** `O(n²)`, **space** `O(1)` beyond the output. The cost comes from nesting: `n` positions,
each doing a full `n`-element walk, giving `n²` index visits. The only storage is the single
`product` accumulator; the output array is not counted because the problem demands it.

Use it when `n` is a handful of elements, and — more usefully — as the **oracle** the fast versions
are tested against. That is exactly its job in the test suite below: it is so plainly a transcription
of the statement that if a linear version ever disagrees with it, the linear version is what is
broken.

---

## Approach 2 — Divide the total product (the instinctive move the problem bans)  *(an addition — not in the data file's ladder)*

### The idea

*Every answer is the total product with one factor removed — so why not compute the total once and
remove that factor?* Multiply everything together in one pass, then emit each answer by dividing the
total by that position's value.

This fixes brute force's weakness — **it recomputes shared factors `n` times instead of computing the
whole product once** — and it is what almost everyone reaches for first. It is worth working through
properly rather than skipping, because *why* it is banned teaches the real lesson.

### How to think about it

> **Intuition.** One shared pot, made once. Everything goes in; to serve position `i` you take the
> pot and take `nums[i]` back out. A single global aggregate plus a cheap per-position adjustment is
> exactly the right instinct — the whole ladder is about reusing shared work. The problem is the
> *mechanism* of removal: multiplication's inverse has a hole in it at zero. Once a zero goes into the
> pot, the pot tells you nothing about what else is in there, so a single zero forces a separate
> counting rule, and that patch is where the one-liner stops being a one-liner.

### Worked example

`nums = [1, 2, 3, 4]` — no zeros, so this is the easy path. **Pass one** builds the total, **pass
two** divides it out:

| step | `nums[i]` | `product_of_nonzero` | `out` so far |
|---|---|---|---|
| start | — | 1 | `[]` |
| build `i=0` | 1 | 1 | `[]` |
| build `i=1` | 2 | 2 | `[]` |
| build `i=2` | 3 | 6 | `[]` |
| build `i=3` | 4 | **24** | `[]` |
| emit `i=0` | 1 | 24 | `[24]` |
| emit `i=1` | 2 | 24 | `[24, 12]` |
| emit `i=2` | 3 | 24 | `[24, 12, 8]` |
| emit `i=3` | 4 | 24 | `[24, 12, 8, 6]` |

Now the case the ban exists for — the statement's second example, `nums = [-1, 1, 0, -3, 3]`. The
total product is `0`, and `0 / 0` at position `2` is not a number. The approach survives only by
counting zeros first, and with **exactly one** zero the emit step stops being a division altogether:

| `i` | `nums[i]` | is it the zero? | `out[i]` |
|---|---|---|---|
| 0 | -1 | no | 0 |
| 1 | 1 | no | 0 |
| 2 | 0 | **yes** | **9** (= −1·1·−3·3) |
| 3 | -3 | no | 0 |
| 4 | 3 | no | 0 |

With **two or more** zeros every answer is `0`; with **exactly one**, only the zero's own slot
survives, as above; with **none**, divide normally. That three-branch structure is the honest cost of
this approach.

### Code

```python
def product_except_self_division(nums: list[int]) -> list[int]:
    zeros = nums.count(0)
    if zeros > 1:  # two zeros leave a zero in every product
        return [0] * len(nums)
    product_of_nonzero = EMPTY_PRODUCT
    for x in nums:
        if x != 0:
            product_of_nonzero *= x
    if zeros == 1:  # only the zero's own slot survives
        return [product_of_nonzero if x == 0 else 0 for x in nums]
    return [product_of_nonzero // x for x in nums]  # exact: x divides the product
```

### Common mistake

> **Watch out.** The misconception is that a zero in the input is an **edge case** — the kind of
> thing you bolt a guard onto once the main line works. It is not an edge case, it is a demolition:
> the operation the whole approach rests on stops existing, so what you need is a different branch,
> not a guard.

The obvious two-liner — total product, then `total // nums[i]` — passes `[1, 2, 3, 4]` and every
hand-written test you are likely to invent, then raises `ZeroDivisionError` (in Java, throws
`ArithmeticException`) on the first input containing a `0`. Worse is the half-fix of skipping zeros
while building the total and then handing the zero's own slot that same total: on `[-1, 1, 0, -3, 3]`
the non-zero product is `9` and the output comes out `[-9, 9, 9, -3, 3]` instead of `[0, 0, 9, 0, 0]`
— right in exactly one slot, wrong in the other four, and with no exception to tell you.

A second, quieter mistake survives even in the correct version: floating-point division (`total / x`)
instead of `//`. A product of many 30s exceeds 2⁵³, where doubles stop representing every integer
exactly, and answers start coming back off by one. The division here is always exact — `x` is
literally one of the factors — so integer division is both correct and safe.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)` beyond the output: two linear passes. On paper it ties the optimal
approach. In practice it is disqualified twice over — the problem forbids it outright, and integer
**division** is several times slower than multiplication on real hardware, so even where it is legal
it is not obviously faster than Approach 4.

Use it when division is permitted, zeros are impossible by construction, and you want the shortest
possible code — running products over known-positive quantities such as prices or weights. Name it in
an interview, name its zero problem, then move on; recognising why the shortcut fails is what points
at the structure the next two approaches exploit.

> **Under the hood.** The zero problem is usually described as an edge case, which undersells it. The
> version people actually reach for has no zero handling at all:
>
> ```
> [1, 2, 3, 4]  ->  [24, 12, 8, 6]      correct
> [1, 0, 3, 4]  ->  ZeroDivisionError
> [0, 0, 3, 4]  ->  ZeroDivisionError
> ```
>
> and the correct answers are `[0, 12, 0, 0]` and `[0, 0, 0, 0]`. Note that those two need *different*
> reasoning: with one zero, only the zero's own slot is non-zero; with two, every slot is zero. So
> the one-liner needs **three** branches — no zeros, exactly one, two or more — and the code above is
> only the first of them.
>
> How often does that matter? Over 10,000 random small arrays with zeros permitted: 4,314 had no
> zero, 3,724 had exactly one, 1,962 had two or more. **57% land in a branch the one-liner does not
> have.** This is not a rare corner; it is the majority of the input space, and it is invisible if
> your own test cases happen to be made of non-zero numbers.
>
> That is the real argument for the prefix/suffix split, and it is not about speed — both are `O(n)`.
> The split has **one** code path. It treats a zero as an ordinary factor, because it never needs to
> undo a multiplication, and an algorithm that never undoes anything has nothing to special-case.

---

## Approach 3 — Two prefix arrays

### The idea

*If division is not available to remove a factor, can the product be built without that factor ever
going in?* Yes. The product of everything except position `i` is (everything strictly left of `i`) ×
(everything strictly right of `i`). Build both as arrays of running products — one sweep forward, one
backward — then multiply them position by position.

This fixes Approach 2's weakness — **it needs an inverse operation that does not exist at zero** —
and brute force's too, because each running product reuses the one before it.

### How to think about it

> **Intuition.** Two people walk the array from opposite ends, each carrying a running total. The one
> starting on the left writes down, at every position, the product of everything they have passed *so
> far but not including where they are standing*; the one on the right does the mirror image. Every
> position ends up with two notes pinned to it — "everything before me" and "everything after me" —
> and multiplying them gives "everything but me". No factor was ever removed, because the element at
> position `i` never went into either note. **Exclusion by never including**, rather than by dividing
> out.

This is the prefix-sum idea with multiplication swapped in for addition, and recognising it as such
is worth more than the solution itself.

> **Why it works.** Two invariants, one per sweep. Forward: after the step for `i`, `left[i]` equals
> the product of `nums[0..i-1]`, maintained by multiplying in `nums[i - 1]` — the element just passed,
> never the current one. Backward: `right[i]` equals the product of `nums[i+1..n-1]`, maintained by
> multiplying in `nums[i + 1]`. Since those two ranges are **disjoint** and together cover every index
> except `i`, their product is by definition the answer for `i` — and the boundary slots are correct
> for free, because the product over an empty range is `EMPTY_PRODUCT`.

### Worked example

`nums = [1, 2, 3, 4]`. The forward sweep fills `left`, the backward sweep fills `right`, and the last
column is the answer. `left[0]` and `right[3]` start at `EMPTY_PRODUCT` because nothing lies outside
those boundaries:

| step | direction | computed as | `left` | `right` |
|---|---|---|---|---|
| init | — | boundaries are the empty product | `[1, _, _, _]` | `[_, _, _, 1]` |
| `i=1` | → | `left[0] × nums[0]` = 1 × 1 | `[1, 1, _, _]` | `[_, _, _, 1]` |
| `i=2` | → | `left[1] × nums[1]` = 1 × 2 | `[1, 1, 2, _]` | `[_, _, _, 1]` |
| `i=3` | → | `left[2] × nums[2]` = 2 × 3 | `[1, 1, 2, 6]` | `[_, _, _, 1]` |
| `i=2` | ← | `right[3] × nums[3]` = 1 × 4 | `[1, 1, 2, 6]` | `[_, _, 4, 1]` |
| `i=1` | ← | `right[2] × nums[2]` = 4 × 3 | `[1, 1, 2, 6]` | `[_, 12, 4, 1]` |
| `i=0` | ← | `right[1] × nums[1]` = 12 × 2 | `[1, 1, 2, 6]` | `[24, 12, 4, 1]` |

Combine them position by position:

| `i` | `left[i]` | `right[i]` | `out[i]` |
|---|---|---|---|
| 0 | 1 | 24 | **24** |
| 1 | 1 | 12 | **12** |
| 2 | 2 | 4 | **8** |
| 3 | 6 | 1 | **6** |

Three passes, `2n` stored numbers, not a single division. Note that `left` and `right` are each read
exactly once, in the combining step — that observation is what the next approach is built on.

### Code

```python
def product_except_self_two_prefix_arrays(nums: list[int]) -> list[int]:
    n = len(nums)
    left = [EMPTY_PRODUCT] * n   # left[i] = product of everything strictly before i
    right = [EMPTY_PRODUCT] * n  # right[i] = product of everything strictly after i
    for i in range(1, n):
        left[i] = left[i - 1] * nums[i - 1]
    for i in range(n - 2, -1, -1):
        right[i] = right[i + 1] * nums[i + 1]
    return [left[i] * right[i] for i in range(n)]
```

The two off-by-one details carry the whole meaning: forward multiplies in `nums[i - 1]`, backward in
`nums[i + 1]`. That is what makes each array *strictly* exclusive of its own position.

### Common mistake

> **Watch out.** The misconception is that `left[i]` means "the running product **at** `i`" — the
> natural reading of a prefix array, and the one every prefix-*sum* tutorial encourages. Here it must
> mean the product strictly **before** `i`, so the last element folded in is `nums[i - 1]`.

Writing `left[i] = left[i - 1] * nums[i]` makes the array hold "everything up to and including me".
Combined with `right[i]` — "everything strictly after me" — it multiplies the *whole* array together
at every position: `[1, 2, 3, 4]` produces `[24, 24, 24, 24]`, and position `0` being right is what
makes the bug easy to miss.

The mirror-image version loops `for i in range(n - 1, -1, -1)` in the backward sweep and reads
`right[i + 1]`, indexing one past the end on the first iteration — an `IndexError` in Python, silent
memory corruption in C++. Both sweeps must start one position *inside* the boundary, because the
boundary slot is already `EMPTY_PRODUCT` and already correct.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(n)`. Three linear passes, one multiplication per element each, so the
time is linear with a small constant. The space is the two auxiliary arrays holding `2n` numbers —
genuinely extra storage, not counted in the output — and that is the only thing separating this from
optimal.

Use it when **clarity** matters more than memory, which is more often than interview culture admits:
`left` and `right` are self-describing and `2n` integers is nothing at `n = 10^5`. Use it also as the
intermediate step in an interview — state it, show it is linear, then compress it, because the
compression is far easier to explain when the thing being compressed is already on the board.

---

## Approach 4 — Prefix forward, suffix folded back in (optimal)

### The idea

*Both auxiliary arrays are written once and read once — does either need to exist?* No. Write the
left products directly into the output array, then sweep backward carrying the right product in a
single variable, multiplying it into what the output already holds.

This fixes Approach 3's weakness — **it keeps `2n` numbers alive for the sole purpose of reading each
of them exactly once.**

### How to think about it

> **Intuition.** The same two walkers, but they no longer leave notes for each other. The first
> writes its running product straight onto the answer sheet. The second comes back the other way and,
> instead of writing a second note, multiplies its running product into what is already written
> there. The answer sheet does double duty: on the way out a scratchpad holding the prefix, on the way
> back the finished answer, one slot at a time. The backward walker only ever needs *one* number in
> hand and never looks at any other position's suffix.

> **Why it works.** One invariant per sweep, and the order of the two lines inside each loop is what
> maintains it. Forward: `out[i]` is assigned `running` **before** `nums[i]` joins `running`, so
> `out[i]` holds the product of `nums[0..i-1]` and can never contain its own element. Backward:
> `out[i]` is multiplied by `running` **before** `nums[i]` joins it, so the factor applied is the
> product of `nums[i+1..n-1]`. The two ranges are disjoint and cover everything but `i`, which is the
> same argument as Approach 3 — only the storage changed, not the reasoning. A zero needs no special
> case because nothing is ever undone, only accumulated.

### Worked example

`nums = [1, 2, 3, 4]`. **Forward sweep** — write `running` into `out[i]` *first*, then fold `nums[i]`
into `running`:

| `i` | `running` before | `out[i]` written | `running` after | `out` so far |
|---|---|---|---|---|
| 0 | 1 | 1 | 1 | `[1, 1, 1, 1]` |
| 1 | 1 | 1 | 2 | `[1, 1, 1, 1]` |
| 2 | 2 | 2 | 6 | `[1, 1, 2, 1]` |
| 3 | 6 | 6 | 24 | `[1, 1, 2, 6]` |

`out` now holds the prefix products `[1, 1, 2, 6]` — identical to Approach 3's `left`, stored nowhere
extra. The final `running = 24` is never read again.

**Backward sweep** — reset `running` to `EMPTY_PRODUCT` and walk from the right, multiplying into
`out[i]` before folding `nums[i]` in:

| `i` | `out[i]` before | `running` before | `out[i]` after | `running` after | `out` so far |
|---|---|---|---|---|---|
| 3 | 6 | 1 | **6** | 4 | `[1, 1, 2, 6]` |
| 2 | 2 | 4 | **8** | 12 | `[1, 1, 8, 6]` |
| 1 | 1 | 12 | **12** | 24 | `[1, 12, 8, 6]` |
| 0 | 1 | 24 | **24** | 24 | `[24, 12, 8, 6]` |

Two passes, one extra variable, no division, and a zero needs no handling at all — it is folded into
`running` like any other value and quietly makes every product it touches zero, which is
arithmetically correct rather than a special case.

### Code

```python
def product_except_self_prefix_suffix(nums: list[int]) -> list[int]:
    n = len(nums)
    out = [EMPTY_PRODUCT] * n
    running = EMPTY_PRODUCT
    for i in range(n):
        out[i] = running     # written before nums[i] joins, so i excludes itself
        running *= nums[i]
    running = EMPTY_PRODUCT
    for i in range(n - 1, -1, -1):
        out[i] *= running    # folds the suffix into the prefix already stored
        running *= nums[i]
    return out
```

On the 32-bit guarantee: every value ever *read* here is either a prefix product (bounded by one of
the answers) or a finished answer, so all of them fit. The only value that can exceed 32 bits is the
very last update of `running` in each pass — the product of the entire array — and that update is
dead. In Java it silently wraps and does no harm; in C++ signed overflow is formally undefined, so a
strict implementation stops one step early or uses `long long`.

### Common mistake

> **Watch out.** The misconception is that the two lines in each loop are **independent statements**
> that happen to sit next to each other, so their order is a matter of taste. The order *is* the
> correctness argument: writing before folding is the entire reason position `i` is excluded from its
> own answer.

Folding `nums[i]` into `running` before writing:

```python
for i in range(n):
    running *= nums[i]   # WRONG — running now includes nums[i]
    out[i] = running
```

`out[i]` now holds "everything up to and including me", and after the backward sweep every answer is
multiplied by its own element. On `[1, 2, 3, 4]` this yields `[24, 24, 24, 24]` — the first entry
correct, which is exactly why the bug survives a casual glance.

The second mistake is forgetting to reset `running` between the sweeps. The backward pass then starts
from the full product of the array and every answer comes out multiplied by that total: `[1, 2, 3, 4]`
yields `[576, 288, 192, 144]`, the right answer times 24.

### Complexity and when to use this

**Time** `O(n)`, **space** `O(1)` beyond the required output. Two passes, one multiplication and one
assignment per element per pass; the only storage is a single `running` accumulator, because the
output array — which you must return anyway — is reused as the prefix scratchpad. Two linear passes is
also the **floor**: every element influences `n - 1` answers, so no correct algorithm reads fewer than
all of them.

**This is the one to memorize.** It is short, optimal in both time and space, needs no special case
for zeros or negatives, and the pattern it teaches — *sweep prefixes forward, then fold suffixes
backward into the same array* — reappears in trapping rain water, in candy-distribution problems, and
in several range-query problems. Learn the shape, not the lines.

> **Under the hood.** Three documents in this set have found the ladder's optimal rung losing to a
> rung below it on the clock. This one does not, and it is worth seeing what "actually optimal" looks
> like when it is true. At the constraint's ceiling, `n = 10^5`, best of three: two prefix arrays
> **12.50 ms**, folded **7.14 ms** — 1.8× faster while holding **one** integer of scratch against
> 200,000. Both are `O(n)`; only one of them is also cheap.
>
> | `n` | two prefix arrays | folded |
> |---|---|---|
> | `500` | 0.04 ms | **0.03 ms** |
> | `1,000` | 0.10 ms | **0.06 ms** |
> | `2,000` | 0.20 ms | **0.13 ms** |
> | `4,000` | 0.42 ms | **0.26 ms** |
>
> Both columns double when `n` doubles. That is what linear looks like, and it is worth having seen,
> because the next table is what linear looks like when it is lying.
>
> **`O(n)` here means `O(n)` multiplications, not `O(n)` time**, and those are the same thing only
> because the statement promises every answer fits in a 32-bit integer. Break that promise — take an
> array of `n` twos, which is legal-looking input that no longer satisfies the constraint — and the
> running product stops being a machine word:
>
> | `n` | bits in the running product | decimal digits | folded |
> |---|---|---|---|
> | `500` | 501 | 151 | 0.1 ms |
> | `1,000` | 1,001 | 302 | 0.2 ms |
> | `2,000` | 2,001 | 603 | 1.2 ms |
> | `4,000` | 4,001 | 1,205 | **9.0 ms** |
>
> The time **quadruples** when `n` doubles. Same code, same number of multiplications, and it is now
> quadratic, because multiplying two `k`-bit numbers is not one instruction — it is work proportional
> to `k`, and `k` is growing linearly down the array. In Python the failure is a slowdown; in Java or
> C++ it is silent wraparound and a wrong answer.
>
> Now read the constraint again, because it says something surprising. At `n = 10^5`, "every answer
> fits in 32 bits" means the product of any `n - 1` elements is under about two billion — which with
> integer values forces **almost every element to be `1`, `-1` or `0`**. A legal array of a hundred
> thousand elements can contain at most about thirty values with magnitude 2 or more. The constraint
> is not a note about overflow; it is a description of what the input can actually look like.
>
> **What to take from this.** "Constant time arithmetic" is an assumption, not a fact, and it is the
> assumption that every `O(n)` claim about products, sums and hashes quietly rests on. When a problem
> hands you a bound on the *size of the answer*, it is not being fussy — it is telling you which
> machine model you are allowed to cost the algorithm in.

---

## The Overall Arc

The banned operation is the whole teaching device: division is the obvious way to remove one factor
from a product, and taking it away forces you to look for the *structure* of the problem instead of
reaching for the shortcut. Brute force sees `n` unrelated questions and answers each with a full pass,
which is not only quadratic but blind — it never notices that the answer for position 5 and the answer
for position 6 differ by exactly two factors. The first instinct on noticing the shared work is to
compute the shared thing once: one grand total, then remove one factor per position, which is
genuinely linear and genuinely the right instinct, right up until a zero appears and the inverse
operation you were relying on stops existing — at which point the approach needs a three-branch
zero-counting patch and the elegance is gone. What the zero exposes is that "remove a factor" was
never the right frame. The right frame is *never put the factor in*: everything except position `i` is
everything to its left times everything to its right, two completely independent questions, each of
which is a running product that a single sweep computes for every position at once. Build both as
arrays and the problem is solved in linear time with no division anywhere — and then you notice that
each of those arrays is written once and read exactly once, which is the signature of storage that
does not need to exist. The output array is already being allocated, so let it carry the prefix
products on the way out, and let one scalar carry the suffix product on the way back, folding into
each slot as it passes. What is left is two passes, one extra integer, and a zero that behaves like
any other number because nothing is ever undone — only accumulated. The corner case to rehearse out
loud is exactly the one the division shortcut could not survive, and the pattern worth carrying away
is prefix-forward-then-fold-suffix-backward, which shows up far more often than this one problem.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | `O(n²)` | `O(1)` | No reuse at all — every answer recomputes factors its neighbours already computed | `n` is tiny; as the test-suite oracle |
| Divide the total | `O(n)` | `O(1)` | Linear and short, but needs an inverse that fails at zero and a three-branch patch to be correct | Division is allowed and zeros are impossible by construction |
| Two prefix arrays | `O(n)` | `O(n)` | Buys total clarity with `2n` numbers that are each read exactly once | Readability matters more than memory; as the step before compressing it |
| **Prefix + folded suffix** | **`O(n)`** | **`O(1)`** extra | **Reuses the output as scratch space; the order of write-then-fold is the whole correctness argument** | **The default answer for this problem** |

---

## Interview Priority

> **In an interview.** Say the structural sentence before writing anything: *"everything except `i` is
> everything left of `i` times everything right of `i`, so nothing ever has to be divided out."* Draw
> `left` and `right` as two arrays, show each is read exactly once, then collapse them on the board
> into the output plus one scalar. The follow-up is always **"what does a zero do to your solution?"**
> — and the answer is the best line you have: *nothing, because nothing is ever undone, only
> accumulated.* Have the division approach's three-branch zero patch ready as the contrast.

**Memorize cold — the prefix/folded-suffix version.** The expected answer, eight lines, and the lines
are order-sensitive in a way that punishes half-memorisation. Drill the invariant rather than the
code: *`out[i]` holds everything before `i`, so write it before folding `nums[i]` in.* If you can say
that sentence you can rederive both loops, backward one included, under pressure.

**Memorize cold — the two-prefix-array version.** Not as a fallback but as the *explanation*.
Starting from the compressed version and justifying it backwards is much harder, and it reads as
memorised rather than understood.

**Understand but do not memorize — the division approach.** Thirty valuable seconds: state it, state
that it is linear, then state why the problem forbids it and what a zero does to it. Naming the
shortcut *and* its failure mode is what demonstrates you understand why the constraint exists. Do not
submit it — the statement rules it out, and doing it anyway reads as not having read the question.

**Understand but do not memorize — brute force.** Ten seconds to name and reject on the `10^5` bound.
Its real use is as the oracle in the test suite, where its obviousness is the entire point.

---

## How to Get Fluent

The folded solution is nine lines and every one of its bugs is an ordering bug, so these drills are
about order rather than about ideas.

**1. Trace the forward pass on `[1, 2, 3, 4]` with a pencil, writing both columns.** Store, then
extend.
*Done when:* you wrote `out = [1, 1, 2, 6]` and can say why `out[3]` is `6` and not `24`. If you got
`[1, 2, 6, 24]`, you updated before you stored — go straight to drill 2.

**2. Swap the two lines on purpose.** Put `running *= nums[i]` before `out[i] = running`.
*Done when:* you have seen every answer come back as the product of the **whole** array, and can
name the one word that broke: *strictly*.

**3. Write the two-array version first, then fold it, without looking.** Two arrays, then one.
*Done when:* the fold felt mechanical rather than clever — the second array was never anything but a
running value read once, so it did not need to exist.

**4. Break the backward range.** Change `range(n - 1, -1, -1)` to `range(n - 1, 0, -1)` and run it.
*Done when:* you have seen exactly one wrong answer, at index `0`, and understand why an off-by-one
at a loop *bound* produces a single wrong slot rather than a crash. These are the hardest bugs to see
in a code review.

**5. Reach for division, then talk yourself out of it in three sentences.** Total, divided by each
element.
*Done when:* you can say (a) it dies on a zero, (b) one zero and two zeros need different answers, so
it is three branches not two, and (c) the split never divides, so it never needs any of them.

**6. Ask what the 32-bit promise is actually for.** Run the all-twos table from the script.
*Done when:* you can say that `O(n)` counts multiplications, that multiplication is only `O(1)` while
the numbers fit in a machine word, and — the part almost nobody notices — that at `n = 10^5` the
constraint forces nearly every element of a legal input to be `1`, `-1` or `0`.

**The one sentence worth keeping a month from now:** *everything except `i` is everything left of `i`
times everything right of `i`, and both are running products* — and its shadow: *write before you
update, in both directions.*

---

## Full Runnable Script

Every approach above, plus a test suite covering the statement's two examples (including the one with
a zero), the smallest legal input, two zeros, one zero at minimal length, all-negative values,
repeated values, the extremes of the stated `-30`…`30` range, and eleven randomised stress cases from
that range with zeros deliberately over-represented — each cross-checked against brute force and
against every other approach. Python integers are arbitrary-precision, so the stress cases' products
may exceed 32 bits; that guarantee matters for Java and C++, not here.

`EMPTY_PRODUCT` is the one shared decision, declared once and used by all four approaches.

```python
"""Product of Everything Else - every approach in one file, plus a self-checking test suite.

Run: python product_except_self_all.py
"""

from __future__ import annotations

import random
import time

EMPTY_PRODUCT = 1  # the product of no numbers at all; every accumulator below starts here


# --- 1. Brute force: multiply the others, once per position -------------------

def product_except_self_brute_force(nums: list[int]) -> list[int]:
    out: list[int] = []
    for i in range(len(nums)):
        product = EMPTY_PRODUCT
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
    product_of_nonzero = EMPTY_PRODUCT
    for x in nums:
        if x != 0:
            product_of_nonzero *= x
    if zeros == 1:  # only the zero's own slot survives
        return [product_of_nonzero if x == 0 else 0 for x in nums]
    return [product_of_nonzero // x for x in nums]  # exact: x divides the product


# --- 3. Two prefix arrays -----------------------------------------------------

def product_except_self_two_prefix_arrays(nums: list[int]) -> list[int]:
    n = len(nums)
    left = [EMPTY_PRODUCT] * n   # left[i] = product of everything strictly before i
    right = [EMPTY_PRODUCT] * n  # right[i] = product of everything strictly after i
    for i in range(1, n):
        left[i] = left[i - 1] * nums[i - 1]
    for i in range(n - 2, -1, -1):
        right[i] = right[i + 1] * nums[i + 1]
    return [left[i] * right[i] for i in range(n)]


# --- 4. Prefix forward, suffix folded back in (optimal) ----------------------

def product_except_self_prefix_suffix(nums: list[int]) -> list[int]:
    n = len(nums)
    out = [EMPTY_PRODUCT] * n
    running = EMPTY_PRODUCT
    for i in range(n):
        out[i] = running     # written before nums[i] joins, so i excludes itself
        running *= nums[i]
    running = EMPTY_PRODUCT
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

def _best_of(fn, rounds: int = 3) -> float:
    best = float("inf")
    for _ in range(rounds):
        start = time.perf_counter()
        fn()
        best = min(best, time.perf_counter() - start)
    return best


def _naive_division(nums: list[int]) -> list[int]:
    """Scaffolding: the one-liner people reach for, with NO zero handling at all."""
    total = EMPTY_PRODUCT
    for x in nums:
        total *= x
    return [total // x for x in nums]


def _legal_array(n: int, rng: random.Random) -> list[int]:
    """An array that actually satisfies 'every answer fits in a 32-bit integer'.
    At this n that forces nearly every element to be +/-1, which is the point."""
    nums = [rng.choice([-1, 1]) for _ in range(n)]
    for i in rng.sample(range(n), 6):
        nums[i] = [2, 3, 5, 7, 11, 13][i % 6]
    return nums


def trace_the_fold() -> None:
    """Both tables of the hand-trace in 'Reading the Calculations'."""
    nums = [1, 2, 3, 4]
    n = len(nums)
    out = [EMPTY_PRODUCT] * n
    print(f"=== {nums}, forward pass: store, THEN extend ===")
    running = EMPTY_PRODUCT
    for i in range(n):
        out[i] = running
        running *= nums[i]
        print(f"  i={i}  out[{i}] = {out[i]:<3} then running = {running}")
    print(f"  out {out}   (final running {running} is written and never read)")
    print("=== backward pass: multiply IN, then extend ===")
    running = EMPTY_PRODUCT
    for i in range(n - 1, -1, -1):
        before = out[i]
        out[i] *= running
        running *= nums[i]
        print(f"  i={i}  {before} * {out[i] // before if before else 0} = {out[i]:<3} then running = {running}")
    print(f"  out {out}")


def measure() -> None:
    """The numbers quoted in the two 'Under the hood' callouts. Counts are exact;
    timings are one machine's, and the SHAPE of each column is the claim."""
    print("\n=== the division one-liner, with no zero special case ===")
    for nums in ([1, 2, 3, 4], [1, 0, 3, 4], [0, 0, 3, 4]):
        try:
            got = str(_naive_division(list(nums)))
        except ZeroDivisionError as exc:
            got = f"ZeroDivisionError: {exc}"
        correct = product_except_self_prefix_suffix(list(nums))
        print(f"  {str(nums):<14} -> {got:<34} correct {correct}")

    rng = random.Random(1)
    buckets = {0: 0, 1: 0, 2: 0}
    for _ in range(10000):
        sample = [rng.choice([-2, -1, 0, 1, 2, 3]) for _ in range(rng.randint(2, 8))]
        buckets[min(sample.count(0), 2)] += 1
    print("  over 10,000 random small arrays with zeros permitted:")
    print(f"    no zeros    {buckets[0]:>6}   plain division works")
    print(f"    exactly one {buckets[1]:>6}   needs its own branch")
    print(f"    two or more {buckets[2]:>6}   needs a third branch")
    share = 100 * (buckets[1] + buckets[2]) / 10000
    print(f"    {share:.0f}% land in a branch the one-liner does not have")

    print("\n=== linear, when the 32-bit promise holds ===")
    print(f"  {'n':>6} {'two arrays ms':>14} {'folded ms':>11}")
    rng = random.Random(20260913)
    for n in (500, 1000, 2000, 4000):
        nums = _legal_array(n, rng)
        print(
            f"  {n:>6}"
            f" {_best_of(lambda d=nums: product_except_self_two_prefix_arrays(list(d))) * 1e3:>14.2f}"
            f" {_best_of(lambda d=nums: product_except_self_prefix_suffix(list(d))) * 1e3:>11.2f}"
        )

    print("\n=== and what happens when it does not: an array of n twos ===")
    print(f"  {'n':>6} {'bits':>8} {'digits':>8} {'folded ms':>11}")
    for n in (500, 1000, 2000, 4000):
        nums = [2] * n
        running = EMPTY_PRODUCT
        for x in nums:
            running *= x
        t = _best_of(lambda d=nums: product_except_self_prefix_suffix(list(d)))
        print(f"  {n:>6} {running.bit_length():>8} {len(str(running)):>8} {t * 1e3:>11.1f}")
    print("  time QUADRUPLES when n doubles: bignum multiplication is not O(1)")

    print("\n=== at the real ceiling, n = 10^5, with legal values ===")
    nums = _legal_array(10**5, rng)
    biggest = max(abs(v) for v in product_except_self_prefix_suffix(list(nums)))
    print(f"  largest answer {biggest}, inside 32 bits: {biggest < 2**31}")
    print(
        f"  two prefix arrays"
        f" {_best_of(lambda: product_except_self_two_prefix_arrays(list(nums))) * 1e3:.2f} ms"
        f"  ·  folded"
        f" {_best_of(lambda: product_except_self_prefix_suffix(list(nums))) * 1e3:.2f} ms"
    )
    print(f"  scratch integers held: two arrays {2 * len(nums)}, folded 1")


def main() -> None:
    trace_the_fold()
    measure()
    print()

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
