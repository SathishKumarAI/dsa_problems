# Triplets Summing to Zero — explained

## Understanding the Problem

You are given a list of whole numbers, which may be positive, negative, or zero, and which is in
no particular order. Find every group of three different positions whose values add up to zero.
Two groups count as the same answer if they contain the same three *values* — so if the list
contains two copies of −1 and you can build `[-1, -1, 2]` in more than one way, you report it once.
The output is a collection of triples, not a count and not a single triple.

**The core question is: for how many ways can three values in this list cancel each other out —
and how do you list each distinct way exactly once?** The naive approach is slow because it tries
every group of three positions, which is about n³/6 combinations; at the maximum allowed size that
is roughly 4.5 billion, far beyond what runs in time.

The constraints, and what each one buys:

| Constraint | What it unlocks |
|---|---|
| `3 <= nums.length <= 3000` | n³ is about 4.5 × 10⁹ — dead. n² is 9 × 10⁶ — comfortable. This bound is the explicit signal that the target complexity is quadratic, and that spending O(n log n) to sort first is essentially free by comparison. |
| `-10^5 <= nums[i] <= 10^5` | Values are bounded, so sums fit in a machine integer with no overflow care in Python, Java or C++. Note what this does **not** give you: the range is wide (200,001 possible values) so counting-sort or a value-indexed array is not the trick here. Boundedness helps arithmetic safety, not the algorithm. |
| triples must be distinct **as sets of values**, not as sets of indices | This is the constraint that shapes the whole problem. It is why the ladder below is mostly about *deduplication* rather than speed, and it is what makes sorting valuable for a second, independent reason: sorting drags equal values next to each other, which turns "have I emitted this triple before?" from a set membership test into a comparison with the neighbour. |
| an element may not be reused within one triple | Three *distinct positions*. Three copies of the value 0 in the list is a legitimate `[0, 0, 0]`; one copy used three times is not. |

The array **does not arrive sorted** — unlike the pair-sum problem, sortedness is not handed to
you. You buy it, for O(n log n), and the reason you are willing to is that it pays twice: it makes
the inner pair search a converging-pointer walk (O(n) instead of a hash table), and it makes
deduplication two neighbour comparisons instead of a set of tuples. Sorting is destructive to the
original positions — which would be fatal if the answer were indices. It is not; the answer is
values. That is the licence to sort.
---

## Reading the Calculations

This problem is the previous one wearing a hat. If you can read `sorted-pair-sum`, the only new
things here are **one subtraction** and **three duplicate skips** — and the skips are where almost
everyone's first attempt goes wrong.

### The symbol table

| You will see | It computes | Why it is written that way | If it were wrong |
|---|---|---|---|
| `s = sorted(nums)` | a sorted **copy** | Sorting buys two separate things, below. A copy, because the caller's array is not yours to reorder | Sorting in place silently reorders the caller's data |
| `i` | the **anchor** — the position of the first member of the triple | Fixing one value turns a three-way search into a two-way one | — |
| `need = -s[i]` | what the **other two** must add up to | If `a + b + c == 0` then `b + c == -a`. One subtraction, and the problem becomes the previous problem | `+s[i]` searches for a triple summing to `2·s[i]`, which is a different question |
| `lo`, `hi` | the converging pair, searching **only to the right of the anchor** | Starting `lo` at `i + 1` is what stops a triple being found twice in two different orders | `lo = 0` re-finds every earlier triple, permuted |
| `s[i] == s[i - 1]` | "this anchor is a repeat of the last one" | Sorted, so equal values are neighbours. Its triples were all recorded on the previous pass | Without it, `[-1, -1, …]` reports `(-1, 0, 1)` twice |
| `s[lo] == s[lo - 1]` after a hit | "this partner is a repeat" | Same reason, one level in | `[-2, 0, 0, 2, 2]` reports `(-2, 0, 2)` twice |

### The one subtraction

```
   a + b + c == 0          three unknowns
   b + c == -a             fix a, and the rest is a two-sum with target -a
```

That is the whole reframing. Fix each value in turn as the anchor, and what is left is exactly the
problem solved in `sorted-pair-sum`: find two values in a sorted range that hit a target, by walking
one pointer in from each end.

### Why sorting is worth it twice

Sorting costs `O(n log n)`, and it is easy to read that as the price of admission. It is not — it
buys **two** separate things, and the second is the one people forget:

| Sorting gives you | Which makes possible |
|---|---|
| an order | the two-pointer walk: comparing the ends tells you which end to retire |
| **equal values side by side** | duplicate skipping in `O(1)` — "is this the same as the one before?" |

Without the second, the natural fix for duplicates is a `set` of triples you have already emitted,
which costs memory and hashes every triple. With it, the check is one comparison with the neighbour.

Measured on the running example — every line printed by the script:

```
combinations that sum to zero, unsorted input: [(-1, 0, 1), (-1, 2, -1), (0, 1, -1)]
distinct as sets:                              [(-1, -1, 2), (-1, 0, 1)]
```

Three raw triples, two real answers. The array holds `-1` twice, so the same triple is reachable by
two different routes — and after sorting, those two routes become adjacent positions, which is why
one comparison removes it.

### The trace, in full

`nums = [-1, 0, 1, 2, -1, -4]`, sorted to `[-4, -1, -1, 0, 1, 2]`:

| `i` | anchor | `need = -s[i]` | The pair walk over the rest |
|---|---|---|---|
| `0` | `-4` | `4` | `-1+2=1 <4` → `-1+2=1 <4` → `0+2=2 <4` → `1+2=3 <4` → pointers meet, nothing |
| `1` | `-1` | `1` | `-1+2=1` **hit** → `(-1, -1, 2)`; then `0+1=1` **hit** → `(-1, 0, 1)` |
| `2` | `-1` | — | **skipped**: same as the previous anchor, its triples are already recorded |
| `3` | `0` | `0` | `1+2=3 > 0` → `hi--` → pointers meet, nothing |

Answer: `[(-1, -1, 2), (-1, 0, 1)]`.

Row `2` is the duplicate skip earning its place. Without it the anchor `-1` runs again and finds
`(-1, 0, 1)` a second time.

### How to trace it by hand

```
  i   anchor   need   lo   hi   s[lo]+s[hi]   vs need   action
```

1. Sort first, and write the sorted array above the table. Every index below refers to it.
2. For each anchor: skip it if it equals the one before, or you will re-find its triples.
3. Inside, run `sorted-pair-sum` over `s[i+1 …]` with target `-s[i]`.
4. **On a hit, move both pointers**, then skip any partner equal to the one just used. Moving only
   one pointer after a hit re-finds the same pair.
5. Stop the inner walk when the pointers meet, and move to the next anchor.

### Reading a complexity out loud

The outer loop is `O(n)` anchors and the inner walk is `O(n)`, so the search is `O(n²)`. The sort is
`O(n log n)`, which is **smaller**, so it disappears into the total — the step that looks like the
expensive one is the cheap one.

What `O(n²)` buys, counted rather than argued:

| `n` | Triples that exist | Inner steps taken |
|---|---|---|
| `6` | `20` | `10` |
| `50` | `19 600` | `1 112` |
| `200` | `1 313 400` | `18 440` |
| `800` | `85 013 600` | `299 301` |

At `n = 800` there are eighty-five million triples and the walk looks at under three hundred
thousand steps. That gap is the anchor-plus-two-pointers idea, in numbers.

---


---

## Approach 1 — Brute force

### The idea

*How do I find every triple summing to zero?* Look at every triple. *How do I avoid reporting the
same one twice?* Sort each hit's three values into a canonical order and drop it into a set, which
collapses the duplicates for you. This is the baseline: correct by construction, using nothing
about the input at all.

### How to think about it

Three nested loops with the indices kept in strictly increasing order — `i < j < k` — so each
group of three positions is visited exactly once rather than six times in different orders. Picture
an odometer with three wheels that can never show a repeat or go backwards. The set at the end is
doing a separate job from the loops: the loops guarantee no *index* group repeats, the set
guarantees no *value* triple repeats, and those are different things precisely because the list may
contain duplicate values. The shape to notice is that the work is pure enumeration — nothing found
at one triple informs the next.

### Worked example

Input: `nums = [-1, 0, 1, 2, -1, -4]` (positions 0–5 hold −1, 0, 1, 2, −1, −4).

There are C(6,3) = 20 index triples. Three of them sum to zero:

| Indices | Values | Sum | Canonical form added to the set |
|---|---|---|---|
| (0, 1, 2) | −1, 0, 1 | 0 | `(-1, 0, 1)` — new |
| (0, 3, 4) | −1, 2, −1 | 0 | `(-1, -1, 2)` — new |
| (1, 2, 4) | 0, 1, −1 | 0 | `(-1, 0, 1)` — **already present, absorbed** |

The other 17 miss: `(0,1,3)` gives 1, `(0,1,4)` gives −2, `(3,4,5)` gives −3, and so on. Final set:
`{(-1, -1, 2), (-1, 0, 1)}` — two triples from three hits, which is exactly the duplicate problem
in miniature. Positions 0 and 4 both hold −1, so the same *value* triple is reachable by two
different *index* triples.

### Code

```python
def three_sum_zero_brute_force(nums: list[int]) -> list[list[int]]:
    found: set[tuple[int, int, int]] = set()
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == 0:
                    found.add(tuple(sorted((nums[i], nums[j], nums[k]))))  # canonical order
    return [list(t) for t in found]
```

### Common mistake

Adding `(nums[i], nums[j], nums[k])` to the set *without* sorting the three values first. The set
then stores `(0, 1, -1)` and `(-1, 0, 1)` as two different entries, because tuples compare
position by position, and the output contains the same triple twice under two spellings. The
sorting inside `tuple(sorted(...))` is not cosmetic — it is the entire deduplication mechanism.
The second version of this bug is starting the inner loops at 0 instead of `i + 1` / `j + 1`,
which lets one position be used two or three times and happily reports `[0, 0, 0]` for a list
containing a single zero.

### Complexity and when to use this

**Time O(n³), space O(n) for the deduplicating set** (there can be O(n²) distinct triples in the
worst case, but for typical inputs the set holds the answer, which is small). The time is pure
enumeration: three nested walks, each up to n long, and nothing is remembered between them.

Use it exactly twice in your life: on inputs of a dozen elements, and as the oracle you validate a
fast implementation against — which is what it does in the stress test at the bottom of this file.
Its real value is that its correctness is obvious, which makes disagreements with it informative.

---

## Approach 2 — Hash per anchor

### The idea

*The brute force's inner two loops ask "do two values in the tail sum to `-nums[k]`?" by trying all
pairs — can that be one pass instead?* Yes: fix the first element as an **anchor**, and the
remaining question is exactly the two-sum problem on the suffix, which a hash set answers in a
single walk. This fixes the brute force's exact weakness — the innermost O(n) scan per pair — and
drops the cube to a square.

### How to think about it

Peel the problem: once you commit to one element of the triple, the other two must sum to its
negation, and that is a problem you already know how to solve. So the outer loop is "choose the
anchor", and inside it you run the guest-list trick — walk the suffix, and for each value ask the
set whether its partner has already gone past. Three-sum is two-sum with a loop wrapped around it,
and every k-sum after this is the same peel applied one more time. The awkward part is not the
search, it is the bookkeeping: the set tells you *a* pair exists, not whether you have already
emitted that exact triple, so deduplication needs its own handling.

### Worked example

Input: `nums = [-1, 0, 1, 2, -1, -4]`, sorted first to `[-4, -1, -1, 0, 1, 2]`.

| Anchor k | `nums[k]` | Needs pair summing to | Walk of the suffix | Result |
|---|---|---|---|---|
| 0 | −4 | 4 | x=−1 (need 5, set `{}`) miss → set `{-1}`; x=−1 (need 5) miss; x=0 (need 4) miss → set `{-1, 0}`; x=1 (need 3) miss; x=2 (need 2) miss | nothing — the largest available pair is 1 + 2 = 3 |
| 1 | −1 | 1 | x=−1 (need 2, set `{}`) miss → `{-1}`; x=0 (need 1) miss → `{-1, 0}`; x=1 (need **0**, present) **hit** → emit `[-1, 0, 1]`, set `{-1, 0, 1}`; x=2 (need **−1**, present) **hit** → emit `[-1, -1, 2]` | two triples |
| 2 | −1 | — | skipped: `nums[2] == nums[1]` | — |
| 3 | 0 | 0 | x=1 (need −1, set `{}`) miss → `{1}`; x=2 (need −2) miss | nothing |

Output `[[-1, 0, 1], [-1, -1, 2]]`. Note the anchor skip at k = 2 doing real work: without it,
anchor −1 would run again over the shorter suffix `[0, 1, 2]`, find `0 + 1` again, and emit
`[-1, 0, 1]` a second time.

### Code

```python
def three_sum_zero_hash_per_anchor(nums: list[int]) -> list[list[int]]:
    nums = sorted(nums)  # sorted only so equal anchors are adjacent and skippable
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if k > 0 and nums[k] == nums[k - 1]:
            continue  # this anchor value already produced all of its triples
        seen: set[int] = set()
        target = -nums[k]
        for x in nums[k + 1:]:
            if target - x in seen:
                triple = [nums[k], target - x, x]
                if triple not in out:  # duplicates inside one anchor still need catching
                    out.append(triple)
            seen.add(x)
    return out
```

### Common mistake

Dropping the anchor-skip line — `if k > 0 and nums[k] == nums[k - 1]: continue` — because the
inner `if triple not in out` check looks like it already handles duplicates. On `[-1, 0, 1, 2, -1, -4]`
it does, but only by paying an O(len(out)) scan on every hit, and on inputs with many repeated
anchors that scan becomes the dominant cost and can push the whole thing back toward cubic. The
skip is what makes each distinct anchor value do its work once. The subtler trap is the reverse:
skipping duplicate anchors but *also* deduplicating with a plain `set` of values and forgetting
that a legitimate answer can contain repeated values — `[0, 0, 0]` and `[-2, 1, 1]` are real
triples, and any dedup scheme that collapses "this triple has two equal entries" will lose them.

### Complexity and when to use this

**Time O(n²), space O(n).** One anchor loop over n elements, each running a linear suffix walk with
O(1) expected set operations, gives n². The space is the `seen` set, rebuilt per anchor, holding up
to n values. (The `triple not in out` membership scan is an extra cost this version carries and the
pointer version does not.)

This is the right shape when the array **cannot** be sorted — if the answer demanded original
indices, this is your ladder rung, with the anchor skip replaced by a tuple set. Here, though, you
are already sorting to get the skip rule, and once the array is sorted the pointer walk gives the
same time with constant space and cleaner deduplication. So this rung is a stepping stone: learn
it, because the peel-an-anchor idea is what generalises to k-sum, but ship the next one.

---

## Approach 3 — Sort, then converging pointers (optimal)

### The idea

*The hash rung sorts the array anyway and then ignores the ordering when searching the suffix —
why pay O(n) memory to look up values whose magnitudes their positions already reveal?* Use the
sorted suffix directly: one pointer just after the anchor, one at the far end, converging. This
fixes the hash rung's two weaknesses at once — the per-anchor set, and the `not in out` scan —
because sortedness makes both the search and the deduplication into pointer moves.

### How to think about it

Three fingers. One picks the smallest member of the triple and holds still; the other two walk
toward each other through the sorted tail, tuning the sum like a dial — sum too low, raise the
floor by stepping the left finger right; sum too high, lower the ceiling by stepping the right
finger left. When they meet, this anchor is exhausted and the anchor finger advances. Deduplication
becomes three skip rules on the same principle: never start an anchor on a value equal to the
previous anchor, and after recording a hit, walk both inner fingers past any repeats of the values
you just used. One more freebie falls out of sortedness: once the anchor's own value is positive,
every remaining element is positive too, three positives cannot sum to zero, and the whole loop can
stop.

> **Under the hood.** `sorted()` is Timsort, and it is worth knowing what that means here rather
> than filing it as "`O(n log n)`". Timsort looks for runs that are already ordered and merges them,
> so on input that is partly sorted it does far less than the bound suggests — on already-sorted
> input it is a single `O(n)` scan. It also allocates: `sorted()` returns a new list, which is the
> `O(n)` space this rung spends and the reason it does not disturb the caller's array.
>
> The practical point is the ordering of costs. The sort *looks* like the expensive step and it is
> the cheap one: `O(n log n)` against the `O(n²)` search that follows, so at any size where this
> problem is interesting the sort is a rounding error. Optimising it is the classic wrong instinct —
> the step to attack is the one whose exponent is larger, and it is never the one that has a
> library call attached to it.


### Worked example

Input: `nums = [-1, 0, 1, 2, -1, -4]`, sorted to `[-4, -1, -1, 0, 1, 2]`.

| k (anchor) | i (value) | j (value) | Sum | Action |
|---|---|---|---|---|
| 0 (−4) | 1 (−1) | 5 (2) | −3 | too low → `i → 2` |
| 0 (−4) | 2 (−1) | 5 (2) | −3 | too low → `i → 3` |
| 0 (−4) | 3 (0) | 5 (2) | −2 | too low → `i → 4` |
| 0 (−4) | 4 (1) | 5 (2) | −1 | too low → `i → 5`, pointers meet, anchor done |
| 1 (−1) | 2 (−1) | 5 (2) | **0** | **emit `[-1, -1, 2]`**; `i → 3`, `j → 4`; `nums[3]=0 ≠ nums[2]=-1` and `nums[4]=1 ≠ nums[5]=2`, so no skipping needed |
| 1 (−1) | 3 (0) | 4 (1) | **0** | **emit `[-1, 0, 1]`**; `i → 4`, `j → 3`, pointers cross, anchor done |
| 2 (−1) | — | — | — | skipped: equal to the previous anchor |
| 3 (0) | 4 (1) | 5 (2) | 3 | too high → `j → 4`, pointers meet, anchor done |

Output `[[-1, -1, 2], [-1, 0, 1]]`. Four sum checks for the first anchor, two for the second, one
for the last: seven in total, against the brute force's twenty.

### Code

```python
def three_sum_zero_two_pointers(nums: list[int]) -> list[list[int]]:
    nums = sorted(nums)  # a copy; nums.sort() would mutate the caller's list
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if nums[k] > 0:
            break  # smallest of the triple is positive, so the sum cannot be zero
        if k > 0 and nums[k] == nums[k - 1]:
            continue  # this anchor value is already fully explored
        i, j = k + 1, len(nums) - 1
        while i < j:
            s = nums[k] + nums[i] + nums[j]
            if s < 0:
                i += 1
            elif s > 0:
                j -= 1
            else:
                out.append([nums[k], nums[i], nums[j]])
                i += 1
                j -= 1
                while i < j and nums[i] == nums[i - 1]:
                    i += 1  # past repeats of the left value just used
                while i < j and nums[j] == nums[j + 1]:
                    j -= 1  # past repeats of the right value just used
    return out
```

### Common mistake

**Skipping duplicate anchors is the one everybody forgets**, and it fails loudly: on
`[-1, 0, 1, 2, -1, -4]`, without `if k > 0 and nums[k] == nums[k - 1]: continue`, the anchor at
index 2 (the second −1) runs its own pointer walk over `[0, 1, 2]`, finds `0 + 1 = 1`, and emits
`[-1, 0, 1]` for a second time. The output is not wrong in its contents, it is wrong in its
*multiplicity*, and that is a failed submission. The mirror bug is subtler and just as common:
after recording a hit, advancing only one pointer. If you write `i += 1` without `j -= 1`, then on
an input like `[-2, 0, 0, 2, 2]` the same triple re-emits as the untouched pointer keeps finding an
equal neighbour — both pointers must move past the values they just consumed, and *then* skip
repeats. Third in the family: writing the skip as `while nums[i] == nums[i - 1]` without the
`i < j` guard, which runs off the end of the array.

### Complexity and when to use this

**Time O(n²), space O(1) beyond the output** (O(n) if you count the sort's own scratch space or
insist on not mutating the input). The sort costs O(n log n), which is dominated. The quadratic
comes from the anchor loop running n times, each doing a converging walk whose two pointers between
them cover at most n positions — n × n, with a much smaller constant than the hash version because
the inner step is an add and a compare, no hashing.

This is the answer to ship: same asymptotic time as the hash rung, constant extra space, and the
deduplication falls out of the sort instead of needing a side structure. It is also the template
for the whole family — three-sum-closest is the same walk with a different scoring rule, four-sum
is this with one more anchor loop outside it, and k-sum is this recursion carried all the way down.

### The exchange argument — why skipping is safe

Two separate skips happen here and an interviewer will probe both. They need different arguments.

**1. Why moving one pointer never skips a triple.** With the anchor `nums[k]` fixed, the inner
problem is exactly "find pairs in the sorted range `k+1 .. n-1` summing to `T = -nums[k]`". Suppose
`nums[i] + nums[j] < T`. The pairs still in play that use index `i` are `(i, m)` for `m` in
`i+1 .. j`. Sortedness gives `nums[m] <= nums[j]`, so

```
nums[i] + nums[m]  <=  nums[i] + nums[j]  <  T
```

Every one of them falls short. Index `i` cannot be in any remaining answer, so advancing `i`
discards only losers. Symmetrically, if `nums[i] + nums[j] > T`, then for every `m` in `i .. j-1`
we have `nums[m] >= nums[i]`, so `nums[m] + nums[j] >= nums[i] + nums[j] > T`, and index `j` is
dead. Each iteration retires exactly one index and no index is retired before being proven
useless, so the walk is both linear and complete.

**2. Why skipping a duplicate anchor never loses a triple.** Suppose `nums[k] == nums[k-1]` and we
skip `k`. Any triple the skipped anchor could have produced has the form `(nums[k], a, b)` with `a`
and `b` drawn from the range `k+1 .. n-1`. But the previous anchor searched the range
`k .. n-1`, which *contains* that range, and it had the identical anchor value. So it already
considered the pair `(a, b)` and — since the target `-nums[k-1]` equals `-nums[k]` — already
emitted that exact value triple. Nothing is lost. The inner skips after a hit are the same argument
one level down: having just emitted `(nums[k], v_i, v_j)`, any other pair with those same two
values would produce an identical value triple, and the statement asks for distinct values.

**3. Why the `nums[k] > 0` break is safe.** The array is sorted, so if the anchor is positive every
element after it is positive too, and the anchor is the smallest member of any triple it can form.
Three positive numbers sum to something positive, never zero. Every remaining anchor is in the same
position, so the loop can stop entirely rather than merely skipping one.

All three arguments rest on the same foundation: **sortedness turns a position into a statement
about magnitude**, and every skip above is a magnitude argument in disguise.

---

## The Overall Arc

The principle this problem chases is *reduce the unknown to the known, then make the reduction
cheap*. Brute force treats a triple as an atom and enumerates all n³/6 of them, learning nothing
along the way, and collapsing duplicate value-triples afterwards with a set because the loops only
guarantee distinct *indices*. The first real idea is the peel: fix one element as an anchor and
what remains is not a new problem at all, it is two-sum on the suffix with target `-anchor` — so
the hash rung solves it the way two-sum is solved without sortedness, one pass and a set, and the
cube becomes a square. But that rung is uneasy, because it already sorted the array (to make equal
anchors adjacent and skippable) and then searched as though it had not, paying O(n) memory per
anchor to look up values whose sizes their positions already announce, and paying again with a
linear `already emitted?` scan on every hit. The final rung cashes in the sort completely: the
inner two-sum becomes converging pointers — constant space, and provably complete by the exchange
argument that a pointer is only ever retired after the arithmetic shows it cannot participate —
while deduplication stops being a data-structure problem and becomes three neighbour comparisons,
because sorting has stacked equal values side by side. That is the lesson worth carrying: **sorting
can be worth its O(n log n) for reasons that have nothing to do with searching faster.** Here it
buys the search *and* the uniqueness rule *and* a free early exit the moment the anchor turns
positive. And the structure generalises exactly as it stands — fix an index, solve (k−1)-sum on the
suffix, dedupe at every level — which is the whole of four-sum and k-sum, with two-pointers sitting
at the bottom of the recursion doing the real work.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force | O(n³) | O(n) for the dedup set | Obviously correct, hopelessly slow; dedup bolted on afterwards | n ≤ ~50, or as the oracle a fast version is stress-tested against |
| Hash per anchor | O(n²) | O(n) | Buys the inner search with memory; dedup needs its own scheme | The array must not be reordered, or the answer needs original indices |
| Sort + converging pointers | O(n²) | O(1) beyond output | Pays O(n log n) once, then gets search *and* dedup out of the ordering | The default answer; anything where values, not positions, are reported |

---

## Interview Priority

**Memorise cold: sort + converging pointers.** This is the expected answer, and it is not enough to
produce the shape — you must land the three dedup rules (skip an anchor equal to its predecessor;
after a hit move *both* pointers; then skip repeated values on both sides with an `i < j` guard)
and be ready to explain the exchange argument when asked "how do you know you didn't miss a
triple?". That question is asked almost every time. Being able to answer both halves — the pointer
skip and the anchor skip — separately and correctly is the actual bar.

**Memorise second: the anchor peel itself**, independent of how the inner pair search is done.
"Three-sum is two-sum with a loop around it" is the sentence that gets you to four-sum and k-sum on
the spot, and it is the follow-up an interviewer reaches for when you finish early. If you know the
peel, the generalisation is mechanical.

**Understand but do not drill: brute force, and the hash-per-anchor rung.** Brute force earns its
keep in the first thirty seconds — say it, price it at n³, move on — and later as a cross-check.
The hash rung is worth understanding because it is the honest answer when you are forbidden to
reorder the array, and because it makes clear that sorting here is bought for deduplication as much
as for speed. But given a sorted array, it is strictly dominated, and writing it as your final
answer invites the question "why are you carrying that set?"

---

## How to Get Fluent

1. **Say the reframing before writing anything.** *"Fix one value as the anchor; the other two have
   to sum to minus that value, which is two-sum on a sorted array."* **Done when** you can say it
   cold — it is the entire solution, and the code is transcription.

2. **Hand-trace `[-1, 0, 1, 2, -1, -4]`.** Four anchors, one of them skipped. **Done when** your
   table matches the one above row for row, including the skipped anchor and the reason for it.

3. **Delete the duplicate skips and run it.** Both of them, one at a time, and see which input each
   one was protecting against — the anchor skip fails on `[-1, -1, 0, 1]`, the partner skip on
   `[-2, 0, 0, 2, 2]`. **Done when** you can name the input that breaks each skip, rather than
   remembering that two skips exist.

4. **Move only one pointer after a hit** and watch it loop on the same pair. **Done when** you can
   say why both must move: the pair that just matched is used up, and leaving either end in place
   re-finds it.

5. **Do the siblings.** *Three Sum Closest* is this loop keeping the best distance instead of
   testing for zero — and it needs **no** duplicate skipping, because it returns a number rather
   than a set. *Four Sum* is one more anchor loop around this one. *Two Sum II* is the inner walk on
   its own. **Done when** you can say which of the three needs duplicate handling and why.

6. **A month later, the one sentence that should come back:** *fix one value and the rest is
   two-sum; sort first, because sorting buys both the pointer walk and cheap duplicate skipping.*


## Full Runnable Script

Every approach in one file, checked against the statement's example, the smallest legal input (both
a solvable one and one with no answer), heavy duplicates, duplicates that must yield two distinct
triples, an all-positive input that triggers the early break, and a randomised stress test against
brute force over a narrow value range so collisions and duplicates are common.

**The comparison canonicalises**: each triple is sorted internally and the list of triples is
sorted, because the three approaches legitimately produce them in different orders. Comparing raw
output would report disagreements that are not real.

```python
"""Triplets Summing to Zero — every approach in one file, cross-checked.

The answer is a SET of triples, so comparison canonicalises: each triple is sorted,
and the collection of triples is sorted. Without that, two correct runs look different.

Run: python three_sum_zero.py
"""

from __future__ import annotations

import random


def three_sum_zero_brute_force(nums: list[int]) -> list[list[int]]:
    found: set[tuple[int, int, int]] = set()
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == 0:
                    found.add(tuple(sorted((nums[i], nums[j], nums[k]))))  # dedup by value
    return [list(t) for t in found]


def three_sum_zero_hash_per_anchor(nums: list[int]) -> list[list[int]]:
    nums = sorted(nums)  # sorting only to make the anchor-skip rule possible
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if k > 0 and nums[k] == nums[k - 1]:
            continue  # same anchor value already produced all its triples
        seen: set[int] = set()
        target = -nums[k]
        for x in nums[k + 1:]:
            if target - x in seen:
                triple = [nums[k], target - x, x]
                if triple not in out:  # duplicates within one anchor still slip through
                    out.append(triple)
            seen.add(x)
    return out


def three_sum_zero_two_pointers(nums: list[int]) -> list[list[int]]:
    nums = sorted(nums)
    out: list[list[int]] = []
    for k in range(len(nums) - 2):
        if nums[k] > 0:
            break  # smallest element positive => three positives can never sum to zero
        if k > 0 and nums[k] == nums[k - 1]:
            continue
        i, j = k + 1, len(nums) - 1
        while i < j:
            s = nums[k] + nums[i] + nums[j]
            if s < 0:
                i += 1
            elif s > 0:
                j -= 1
            else:
                out.append([nums[k], nums[i], nums[j]])
                i += 1
                j -= 1
                while i < j and nums[i] == nums[i - 1]:
                    i += 1  # skip repeated left values, else the same triple re-emits
                while i < j and nums[j] == nums[j + 1]:
                    j -= 1
    return out


APPROACHES: list[tuple[str, object]] = [
    ("brute force", three_sum_zero_brute_force),
    ("hash per anchor", three_sum_zero_hash_per_anchor),
    ("two pointers", three_sum_zero_two_pointers),
]


def canon(triples: list[list[int]]) -> list[tuple[int, ...]]:
    """Sort inside each triple and across the list — the only fair way to compare sets."""
    return sorted(tuple(sorted(t)) for t in triples)


def run_case(label: str, nums: list[int]) -> bool:
    results = [(name, canon(fn(list(nums)))) for name, fn in APPROACHES]
    agree = all(r == results[0][1] for _, r in results)
    print(f"{label}")
    print(f"  nums={nums}")
    for name, r in results:
        print(f"    {name:<16} -> {[list(t) for t in r]}")
    print(f"    all agree: {agree}")
    return agree




# ------------------------------------ the arithmetic, printed rather than told
# Everything "Reading the Calculations" quotes is produced here: the anchor
# trace with its skips, the duplicate argument, and the work count.
def show_anchors(nums: list[int]) -> None:
    """One line per anchor and per inner step, skips included."""
    s = sorted(nums)
    print(f"\n=== anchors and the pair walk, nums={nums} ===")
    print(f"  sorted: {s}")
    n = len(s)
    found: list[tuple[int, int, int]] = []
    for i in range(n - 2):
        if i > 0 and s[i] == s[i - 1]:
            print(f"  i={i} anchor {s[i]:>3}  SKIPPED: repeat of the previous anchor")
            continue
        need = -s[i]
        lo, hi = i + 1, n - 1
        print(f"  i={i} anchor {s[i]:>3}  need {need:>3} from s[{lo}..{hi}] = {s[lo:hi + 1]}")
        while lo < hi:
            total = s[lo] + s[hi]
            if total == need:
                print(f"      {s[lo]:>3} + {s[hi]:>3} = {total:>3}  == {need}  -> ({s[i]}, {s[lo]}, {s[hi]})")
                found.append((s[i], s[lo], s[hi]))
                lo += 1
                hi -= 1
                while lo < hi and s[lo] == s[lo - 1]:
                    print(f"      skip the repeated partner {s[lo]}")
                    lo += 1
            elif total < need:
                print(f"      {s[lo]:>3} + {s[hi]:>3} = {total:>3}  <  {need}  -> lo += 1")
                lo += 1
            else:
                print(f"      {s[lo]:>3} + {s[hi]:>3} = {total:>3}  >  {need}  -> hi -= 1")
                hi -= 1
    print(f"  answer: {found}")


def show_duplicates(nums: list[int]) -> None:
    """Why sorting pays twice: equal values become neighbours."""
    from itertools import combinations

    raw = [c for c in combinations(nums, 3) if sum(c) == 0]
    distinct = sorted({tuple(sorted(c)) for c in raw})
    print("\n=== the same triple, reachable by two routes ===")
    print(f"  combinations that sum to zero, unsorted input: {raw}")
    print(f"  distinct as sets:                              {distinct}")
    print("  the array holds a repeated value, so one triple is reachable twice.")
    print("  sorted, those routes are ADJACENT, so one comparison removes the repeat")
    print("  instead of a set of every triple already emitted.")


def count_work() -> None:
    """Inner steps taken, against triples that exist."""
    import random

    def steps(a: list[int]) -> int:
        b = sorted(a)
        n = len(b)
        seen = 0
        for i in range(n - 2):
            if i > 0 and b[i] == b[i - 1]:
                continue
            lo, hi = i + 1, n - 1
            while lo < hi:
                seen += 1
                total = b[lo] + b[hi]
                if total == -b[i]:
                    lo += 1
                    hi -= 1
                    while lo < hi and b[lo] == b[lo - 1]:
                        lo += 1
                elif total < -b[i]:
                    lo += 1
                else:
                    hi -= 1
        return seen

    rng = random.Random(4)
    print("\n=== inner steps, against the triples that exist ===")
    print(f"  {'n':>6} {'triples that exist':>20} {'inner steps':>13}")
    for size in (6, 50, 200, 800):
        a = rng.sample(range(-size * 2, size * 2), size)
        print(f"  {size:>6} {size * (size - 1) * (size - 2) // 6:>20,} {steps(a):>13,}")


def measure_sort_share() -> None:
    """The step that looks expensive is the cheap one."""
    import random
    import time

    def timed(fn, repeat=3):
        best = float("inf")
        for _ in range(repeat):
            start = time.perf_counter()
            fn()
            best = min(best, time.perf_counter() - start)
        return best

    rng = random.Random(11)
    print("\n=== where the time actually goes ===")
    print(f"  {'n':>6} {'sorting':>12} {'the O(n^2) search':>20}")
    for size in (400, 1200):
        a = rng.sample(range(-size * 2, size * 2), size)
        sort_time = timed(lambda: sorted(a))

        def search() -> None:
            b = sorted(a)
            n = len(b)
            for i in range(n - 2):
                lo, hi = i + 1, n - 1
                while lo < hi:
                    total = b[lo] + b[hi]
                    if total == -b[i]:
                        lo += 1
                        hi -= 1
                    elif total < -b[i]:
                        lo += 1
                    else:
                        hi -= 1

        print(f"  {size:>6} {sort_time * 1e6:>9.0f} us {timed(search) * 1e6:>17.0f} us")
    print("  the sort is the rounding error; the search is the problem")

def main() -> None:
    ok = True

    # The statement's own example.
    ok &= run_case("example from the statement", [-1, 0, 1, 2, -1, -4])

    # Smallest legal input: exactly three elements, and they work.
    ok &= run_case("smallest legal input (n = 3)", [-1, 0, 1])

    # Smallest legal input that has no answer.
    ok &= run_case("no valid answer", [1, 2, 3])

    # Heavy duplicates: one triple, however many copies of zero there are.
    ok &= run_case("all duplicates", [0, 0, 0, 0, 0])

    # Duplicates that must produce two distinct triples, not four copies of one.
    ok &= run_case("duplicates, two triples", [-2, 0, 0, 2, 2, -2, 1, 1])

    # Every value positive — the nums[k] > 0 early break fires immediately.
    ok &= run_case("all positive", [3, 5, 7, 11])

    # Randomised stress against brute force, small range so collisions are common.
    random.seed(7)
    for _ in range(600):
        nums = [random.randint(-6, 6) for _ in range(random.randint(3, 14))]
        results = [canon(fn(list(nums))) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT nums={nums} -> {results}")
    print("stress: 600 random arrays cross-checked, all three approaches, canonicalised triples")

    print()
    show_anchors([-1, 0, 1, 2, -1, -4])
    show_duplicates([-1, 0, 1, 2, -1, -4])
    count_work()
    measure_sort_share()

    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED — see above.")


if __name__ == "__main__":
    main()
```

### Output when run

```
example from the statement
  nums=[-1, 0, 1, 2, -1, -4]
    brute force      -> [[-1, -1, 2], [-1, 0, 1]]
    hash per anchor  -> [[-1, -1, 2], [-1, 0, 1]]
    two pointers     -> [[-1, -1, 2], [-1, 0, 1]]
    all agree: True
smallest legal input (n = 3)
  nums=[-1, 0, 1]
    brute force      -> [[-1, 0, 1]]
    hash per anchor  -> [[-1, 0, 1]]
    two pointers     -> [[-1, 0, 1]]
    all agree: True
no valid answer
  nums=[1, 2, 3]
    brute force      -> []
    hash per anchor  -> []
    two pointers     -> []
    all agree: True
all duplicates
  nums=[0, 0, 0, 0, 0]
    brute force      -> [[0, 0, 0]]
    hash per anchor  -> [[0, 0, 0]]
    two pointers     -> [[0, 0, 0]]
    all agree: True
duplicates, two triples
  nums=[-2, 0, 0, 2, 2, -2, 1, 1]
    brute force      -> [[-2, 0, 2], [-2, 1, 1]]
    hash per anchor  -> [[-2, 0, 2], [-2, 1, 1]]
    two pointers     -> [[-2, 0, 2], [-2, 1, 1]]
    all agree: True
all positive
  nums=[3, 5, 7, 11]
    brute force      -> []
    hash per anchor  -> []
    two pointers     -> []
    all agree: True
stress: 600 random arrays cross-checked, all three approaches, canonicalised triples

ALL APPROACHES AGREED ON EVERY CASE.
```
