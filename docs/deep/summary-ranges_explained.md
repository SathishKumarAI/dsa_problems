# Collapse the Runs into Ranges — explained

## Understanding the Problem

You are handed a list of whole numbers, already in increasing order with no repeats, and asked to
describe it as compactly as possible. Wherever the numbers run on consecutively — 0, 1, 2 — you write
that stretch as `"0->2"` instead of listing it. A number with no consecutive neighbour on either side
stands alone and is written bare, as `"7"`, never as `"7->7"`.

**The core question:** where does one consecutive stretch end and the next begin? The naive approach
is slow not because of the *count* of numbers — there are at most twenty — but because of how far
apart their **values** can be: walking the number line from the smallest value to the largest visits
every integer in between, and the values may be four billion apart.

That distinction is the whole difficulty of this problem, and it is the misconception worth naming
before any code.

> **Watch out.** The thought to correct is *"twenty numbers, so any approach is fast enough."* Cost
> here can be driven by the **span** rather than the length. `[1, 1000000000]` is two numbers and a
> billion steps for anything that walks the number line, and on the real bounds such a walk cannot
> even allocate its scratch space. Ask of every rung: does its work follow the size of the *input* or
> the size of the *numbers in it*?

Underneath all five rungs is one observation, and it is worth stating up front because four of them
are just different ways of using it.

> **Why it works.** In a sorted array of distinct integers, a **consecutive run is exactly a maximal
> block where `nums[i] - i` is constant.** Inside a run each step adds 1 to the value and 1 to the
> index, so the difference does not move; at a gap the value jumps by more than 1 while the index
> jumps by exactly 1, so the difference strictly increases. Grouping by that key and scanning for
> where it changes are therefore the same operation seen from two sides.

### The constraints, and what each one unlocks

| Constraint | What it unlocks, or forbids |
|---|---|
| `0 <= nums.length <= 20` | **The empty array is legal input** and must come back as an empty list, so nothing may read `nums[0]` before checking there is one. Twenty is small enough that an `O(n log n)` rung costs nothing measurable — the ladder here is about *shape*, not speed. |
| `-2^31 <= nums[i] <= 2^31 - 1` | Values may be negative and astronomically far apart. **This is what forbids Approach 1**: a boolean per value between the smallest and largest needs over four billion slots in the worst case. It is also why the output must handle a leading `-`. |
| `nums` is sorted strictly ascending | **The permission slip for every rung after the second.** Already ordered means values sharing a `value - index` key are already adjacent, so no map and no re-sorting are needed — a straight left-to-right scan finds the same groups. No duplicates means "consecutive" is exactly `+1`, with no equal-value case to skip. |
| a run of length one prints bare, never as `"x->x"` | A formatting rule with teeth: it is the single decision every rung must make identically, which is why it is lifted into one helper below. |
| ranges come out ascending, covering every value exactly once | No value may appear in two ranges, and none may be dropped. The natural failure is losing the **final** run, which has no gap after it to announce it. |

The worked example used in every section below is the statement's second — chosen because it contains
three runs of length one *and* two genuine ranges, so every rung has to make the bare-versus-arrow
decision more than once:

```
nums = [0, 2, 3, 4, 6, 8, 9]        answer: ["0", "2->4", "6", "8->9"]
```

### Shared scaffolding

Every rung ends the same way: given a run's first and last value, print one string. That decision
appears five times, so it lives in one named helper and nowhere else.

```python
def format_range(first: int, last: int) -> str:
    """A one-value run prints bare; anything longer prints as first->last."""
    return str(first) if first == last else f"{first}->{last}"
```

---

## Approach 1 — Paint the number line

### The idea

*How do I find stretches of consecutive numbers?* Lay out the whole number line from the smallest
value to the largest, mark which numbers are present, then read the line from end to end — a
consecutive run is simply an unbroken stretch of marks. No cleverness at all, because the structure
is now visible rather than inferred.

### How to think about it

> **Intuition.** A row of light bulbs, one per integer between the smallest and largest value. Switch
> on the bulbs for the numbers you were given, then walk the row from left to right: each unbroken
> stretch of lit bulbs is one range, and each gap of dark bulbs separates two ranges. The method
> refuses to reason about the data at all — it makes the answer physically visible and then reads it
> off. That refusal is exactly what it pays for, because the row has one bulb per **value**, not per
> number you were given.

### Worked example

`nums = [0, 2, 3, 4, 6, 8, 9]`, so `lo = 0`, `hi = 9` and the line has ten slots.

| value | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| `present` | on | off | on | on | on | off | on | off | on | on |

Now walk `v` from 0 to 9:

| `v` | lit? | action | `out` after |
|---|---|---|---|
| 0 | on | run starts at 0; 1 is dark, so it ends at 0 | `["0"]` |
| 1 | off | skip | `["0"]` |
| 2 | on | run starts at 2; walks through 3 and 4; 5 is dark | `["0", "2->4"]` |
| 5 | off | skip | `["0", "2->4"]` |
| 6 | on | run starts at 6; 7 is dark, so it ends at 6 | `["0", "2->4", "6"]` |
| 7 | off | skip | `["0", "2->4", "6"]` |
| 8 | on | run starts at 8; walks through 9; the line ends | `["0", "2->4", "6", "8->9"]` |

Ten slots examined to describe seven numbers. On this input the overhead is trivial. On
`[1, 1000000000]` the same walk examines a billion.

### Code

```python
def summary_ranges_paint_line(nums: list[int], span_limit: int = 1 << 20) -> list[str]:
    if not nums:
        return []
    lo, hi = nums[0], nums[-1]
    if hi - lo + 1 > span_limit:  # the small-span assumption fails; fall back
        return summary_ranges_anchor_walk(nums)
    present = [False] * (hi - lo + 1)  # one slot per VALUE in the span, not per element
    for x in nums:
        present[x - lo] = True
    out: list[str] = []
    v = lo
    while v <= hi:
        if not present[v - lo]:
            v += 1
            continue
        start = v
        while v <= hi and present[v - lo]:
            v += 1
        out.append(format_range(start, v - 1))  # v overshot by one past the run
    return out
```

**The assumption this rung needs, and what breaks without it.** It assumes `hi - lo + 1` is small
enough to allocate. This problem's constraints say it is not: with values spanning ±2³¹ the array
would need over four billion booleans. The version above measures the span and falls back to the
final rung when the assumption fails — honest engineering, and it means that on the problem as
literally stated this rung is the anchor walk in disguise. It is here because the *shape* recurs
constantly: the moment a problem bounds its values to a small range, painting the line is the
simplest correct thing you can write.

### Common mistake

> **Watch out.** The misconception is that a span from `lo` to `hi` contains `hi - lo` values. It
> contains `hi - lo + 1` — both endpoints are included. This fencepost error is invisible until the
> largest value is written.

Allocating `[False] * (hi - lo)` on `[0, 2, 3, 4, 6, 8, 9]` gives, measured:

```
IndexError: list assignment index out of range
```

It fails on the marking pass, at `x = 9`, because index `9 - 0` needs a tenth slot in a nine-slot
array. In C++ the same array would not raise — it would write one past the end of the buffer.

### Complexity and when to use this

**Time `O(hi - lo)`, space `O(hi - lo)`.** Both costs follow the **span**, not the input length: the
marking pass is `O(n)` but the allocation and the reading walk both visit every value between the
extremes, whether or not it is present. That is the cost model to notice — it is the only rung whose
price is set by the numbers rather than by how many there are.

Use it when the values are genuinely dense and bounded — day-of-year numbers, port numbers, small ids
— where the line is short and the code is the simplest thing that can work. Reject it here on the
`±2^31` constraint, and say so out loud: naming a technique and correctly ruling it out on a
constraint is a stronger answer than not knowing it.

---

## Approach 2 — Bucket by `value - index`

### The idea

*Can the runs be identified without walking the number line at all?* Yes — inside a consecutive run
`nums[i] - i` never changes, and it jumps at every gap. Use that difference as a key, bucket the
values under it, and each bucket is exactly one run.

This fixes Approach 1's weakness: **its work follows the numeric span rather than the array**, so two
numbers a billion apart cost a billion steps. Keying on `value - index` touches each element once, so
the cost finally follows the length of the input.

### How to think about it

> **Intuition.** Imagine each number carrying a label saying how far ahead of its own index it sits.
> Walk along a consecutive stretch and that label never changes — you move forward one slot and the
> value moves forward one step, so the gap between them holds. Cross a hole in the sequence and the
> label jumps, because the value leapt further than the index did. Sorting the labels and reading off
> the groups gives the runs, without ever asking what lies *between* two values.

### Worked example

`nums = [0, 2, 3, 4, 6, 8, 9]`. Compute the key for each element:

| `i` | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| `nums[i]` | `0` | `2` | `3` | `4` | `6` | `8` | `9` |
| key `nums[i] - i` | `0` | `1` | `1` | `1` | `2` | `3` | `3` |

The key is constant across `2, 3, 4` and constant across `8, 9` — exactly the two real runs — and it
changes at every gap. Building the buckets in one pass:

| after reading | `groups` |
|---|---|
| `nums[0] = 0` | `{0: [0]}` |
| `nums[1] = 2` | `{0: [0], 1: [2]}` |
| `nums[2] = 3` | `{0: [0], 1: [2, 3]}` |
| `nums[3] = 4` | `{0: [0], 1: [2, 3, 4]}` |
| `nums[4] = 6` | `{0: [0], 1: [2, 3, 4], 2: [6]}` |
| `nums[5] = 8` | `{0: [0], 1: [2, 3, 4], 2: [6], 3: [8]}` |
| `nums[6] = 9` | `{0: [0], 1: [2, 3, 4], 2: [6], 3: [8, 9]}` |

Then read the keys in ascending order, `0, 1, 2, 3`, formatting each bucket from its first and last
value: `["0", "2->4", "6", "8->9"]`.

### Code

```python
def summary_ranges_value_minus_index(nums: list[int]) -> list[str]:
    groups: dict[int, list[int]] = {}
    for i, x in enumerate(nums):
        groups.setdefault(x - i, []).append(x)  # the key is constant inside a run
    out: list[str] = []
    for key in sorted(groups):
        run = groups[key]
        out.append(format_range(run[0], run[-1]))
    return out
```

### Common mistake

> **Watch out.** The misconception is that the key *is* the group's identity, so whatever you collect
> under it will do. The key identifies **which** run an element belongs to; it says nothing about
> what the output needs, which is the run's first and last **values**.

Collecting indices — `groups.setdefault(x - i, []).append(i)` — produces, measured on
`[0, 2, 3, 4, 6, 8, 9]`:

```
['0', '1->3', '4', '5->6']
```

Four groups, correctly separated, and every number in the answer is wrong: `"1->3"` describes the
positions of the run `2, 3, 4`. It is easy to miss in review because the structure of the output is
right — the right count of ranges, in the right order, with the right bare-versus-arrow pattern.

### Complexity and when to use this

**Time `O(n log n)`, space `O(n)`.** Time is one linear pass to bucket, plus `sorted(groups)` over at
most `n` keys, and that sort is the only super-linear part. Space is `O(n)`: every element is stored
once inside a bucket.

Use it when the input is **not** sorted, or when you need the grouping itself rather than a summary —
the `value - index` key is a real technique that reappears in longest-consecutive-sequence variants
and in problems keyed on an arithmetic invariant. Here it does work the sortedness already did for
you, which is the next rung's argument.

---

## Approach 3 — Split into run lists

### The idea

*If the input is already sorted, do we need a key at all?* No. Values sharing a `value - index` key
are already adjacent, so a single left-to-right walk can tell whether each number continues the run
being built or starts a new one — no hashing, no map, no re-sorting.

This fixes Approach 2's weakness: **it computes and sorts a key whose ordering the input already
had.** The map was reconstructing adjacency that was never lost.

### How to think about it

> **Intuition.** You are sorting index cards into piles, left to right. Look at the next number and
> ask one question: *is it exactly one more than the last number on the current pile?* If yes it goes
> on that pile; if no you start a fresh pile. At the end each pile is one run, in order, and you
> never had to look at any pile but the most recent one. The sortedness is what makes that one local
> comparison sufficient — in an unsorted array the run a number belongs to might be several piles
> back.

### Worked example

`nums = [0, 2, 3, 4, 6, 8, 9]`.

| `x` | last value on the current pile | `last + 1 == x`? | action | `runs` after |
|---|---|---|---|---|
| `0` | no piles yet | — | start a pile | `[[0]]` |
| `2` | `0` | `1 != 2` | start a pile | `[[0], [2]]` |
| `3` | `2` | `3 == 3` yes | append | `[[0], [2, 3]]` |
| `4` | `3` | `4 == 4` yes | append | `[[0], [2, 3, 4]]` |
| `6` | `4` | `5 != 6` | start a pile | `[[0], [2, 3, 4], [6]]` |
| `8` | `6` | `7 != 8` | start a pile | `[[0], [2, 3, 4], [6], [8]]` |
| `9` | `8` | `9 == 9` yes | append | `[[0], [2, 3, 4], [6], [8, 9]]` |

Format each pile from its first and last value: `["0", "2->4", "6", "8->9"]`.

### Code

```python
def summary_ranges_run_lists(nums: list[int]) -> list[str]:
    runs: list[list[int]] = []
    for x in nums:
        if runs and runs[-1][-1] + 1 == x:  # compare against the run's LAST value
            runs[-1].append(x)
        else:
            runs.append([x])
    return [format_range(run[0], run[-1]) for run in runs]
```

The empty array needs no special case: the loop never runs, `runs` stays empty, and the comprehension
returns `[]`.

### Common mistake

> **Watch out.** The misconception is that a run is identified by where it **started**, so comparing
> against `runs[-1][0]` is the same thing. A run grows at its **end**, and only its last value knows
> what number may join next. Comparing against the first value lets a run grow by exactly one element
> and then break.

Writing `runs[-1][0] + 1 == x` gives, measured:

| input | with the start comparison | correct |
|---|---|---|
| `[0, 2, 3, 4, 6, 8, 9]` | `['0', '2->3', '4', '6', '8->9']` | `['0', '2->4', '6', '8->9']` |
| `[0, 1, 2, 4, 5, 7]` | `['0->1', '2', '4->5', '7']` | `['0->2', '4->5', '7']` |

Every run of length 1 or 2 comes out right, so the bug survives any test whose runs are short — and
every run of three or more is silently split, with the extra pieces still looking like perfectly
well-formed ranges.

The second mistake here is dropping the `runs and` guard: on the very first element `runs[-1]` raises
`IndexError` on an empty list. That one is loud and fixes itself on the first run.

### Complexity and when to use this

**Time `O(n)`, space `O(n)`.** Time is one pass doing one comparison and one append per element, with
no sorting anywhere. Space is `O(n)` and that is the flaw: the run lists hold every element a second
time, when only two values per run — its first and its last — ever reach the output.

Use it when you actually need the grouped **elements**, not just a summary of them: "return the runs
themselves" is a common variant, and this rung answers it directly while the later ones throw the
members away. For this problem it stores `n` values in order to print two per run.

---

## Approach 4 — Collect the break points

### The idea

*If only the first and last value of each run reach the output, why store the middles?* Record the
positions where the chain breaks, then pair consecutive break points into ranges. One number per run
instead of one per element.

This fixes Approach 3's weakness: **it copies every element into a run list when only the ends are
ever read.**

### How to think about it

> **Intuition.** Think of the array as a ribbon and the gaps as places to cut. One pass finds the cut
> points — the indices after which the chain does not continue — and the last index is always a cut,
> because the ribbon ends there. Each piece is then described by where the previous cut left off and
> where this cut lands. Nothing about the values inside a piece matters, so nothing about them is
> stored.

### Worked example

`nums = [0, 2, 3, 4, 6, 8, 9]`. First pass, looking for `nums[i] + 1 != nums[i + 1]`:

| `i` | `nums[i]` | `nums[i + 1]` | chain breaks? | `ends` after |
|---|---|---|---|---|
| 0 | `0` | `2` | `1 != 2` — yes | `[0]` |
| 1 | `2` | `3` | `3 == 3` — no | `[0]` |
| 2 | `3` | `4` | `4 == 4` — no | `[0]` |
| 3 | `4` | `6` | `5 != 6` — yes | `[0, 3]` |
| 4 | `6` | `8` | `7 != 8` — yes | `[0, 3, 4]` |
| 5 | `8` | `9` | `9 == 9` — no | `[0, 3, 4]` |

Then append the final index, 6, because the last run ends there with no gap to announce it:
`ends = [0, 3, 4, 6]`. The second pass pairs each break with the position after the previous one:

| `b` | `start` | `nums[start]` | `nums[b]` | emitted | next `start` |
|---|---|---|---|---|---|
| 0 | 0 | `0` | `0` | `"0"` | 1 |
| 3 | 1 | `2` | `4` | `"2->4"` | 4 |
| 4 | 4 | `6` | `6` | `"6"` | 5 |
| 6 | 5 | `8` | `9` | `"8->9"` | 7 |

### Code

```python
def summary_ranges_break_points(nums: list[int]) -> list[str]:
    if not nums:
        return []
    ends = [i for i in range(len(nums) - 1) if nums[i] + 1 != nums[i + 1]]
    ends.append(len(nums) - 1)  # the last run always ends at the last index
    out: list[str] = []
    start = 0
    for b in ends:
        out.append(format_range(nums[start], nums[b]))
        start = b + 1
    return out
```

### Common mistake

> **Watch out.** The misconception is that "a run ends where the chain breaks" is the complete rule.
> The **final** run does not end at a break — it ends because the array does. Nothing after it
> announces it, so it must be appended by hand.

Omitting `ends.append(len(nums) - 1)` gives, measured on `[0, 2, 3, 4, 6, 8, 9]`:

```
['0', '2->4', '6']
```

Three ranges instead of four: `"8->9"` is simply gone. Every emitted range is correct, the count is
plausible, and the values are in order — nothing about the output looks damaged, which is why this
omission survives a visual check. The habit worth taking away: whenever a loop emits on a
**transition**, ask what flushes the last group.

### Complexity and when to use this

**Time `O(n)`, space `O(k)` for `k` runs.** Time is two linear passes: one comparing neighbours, one
walking the break list, which is at most `n` long. Space is one integer per run rather than one per
element — strictly better than Approach 3, and the reason this rung exists.

Use it when the break positions themselves are the answer: "how many runs", "where does the third run
start", "split this array at its discontinuities" all fall straight out of `ends`. For this problem
it still makes two passes over a list that must survive the first, which is exactly what the last
rung removes.

---

## Approach 5 — One walk with an anchor (optimal)

### The idea

*If a range can be written down the moment its break is seen, why keep the break positions at all?*
Remember only where the current run started, advance while the next value continues the chain, and
emit the instant it stops. Nothing survives the pass except one number.

This fixes Approach 4's weakness: **a second pass over a list of break positions that grows with the
number of runs.** The output is built in the same walk that finds the runs.

### How to think about it

> **Intuition.** Drop an **anchor** at the start of a run, then drift forward while each next value is
> exactly one more than the current one. When the drift stops you are standing on the run's last
> value — the anchor and your feet are the two numbers the output needs, so write the range and pull
> the anchor up one step further along. The inner drift never revisits an index the outer walk has
> passed, so the two loops together touch each element exactly once. A lone value is a run whose
> drift moved zero steps, which is the whole of the bare-value rule.

### Worked example

`nums = [0, 2, 3, 4, 6, 8, 9]`. The anchor's value is `start`; `i` drifts to the run's end.

| outer `i` | `start` | inner drift | `i` lands on | `nums[i]` | emitted | `out` after |
|---|---|---|---|---|---|---|
| 0 | `0` | `nums[1] = 2`, not `1` — no drift | 0 | `0` | `start == nums[i]`, bare | `["0"]` |
| 1 | `2` | `3 == 3`, `4 == 4`, then `6 != 5` | 3 | `4` | `2 != 4`, arrow | `["0", "2->4"]` |
| 4 | `6` | `8 != 7` — no drift | 4 | `6` | bare | `["0", "2->4", "6"]` |
| 5 | `8` | `9 == 9`, then `i + 1` is past the end | 6 | `9` | arrow | `["0", "2->4", "6", "8->9"]` |

After the last emit `i` becomes 7, the outer condition `i < 7` fails, and the walk ends. Each of the
seven indices was visited once, by either the anchor or the drift — never both.

### Code

```python
def summary_ranges_anchor_walk(nums: list[int]) -> list[str]:
    out: list[str] = []
    n = len(nums)
    i = 0
    while i < n:
        start = nums[i]
        # drift along the chain of +1 steps; i lands on the run's last value
        while i + 1 < n and nums[i + 1] == nums[i] + 1:
            i += 1
        out.append(format_range(start, nums[i]))
        i += 1
    return out
```

The empty array needs no guard: `0 < 0` is false, so the loop never runs and `[]` is returned.

### Common mistake

> **Watch out.** The misconception is that a single-value run is a degenerate range and may be printed
> as one. The problem says otherwise: `"6->6"` is a **wrong answer**, not an ugly one. This is the
> whole reason `format_range` is a named helper rather than an inline f-string repeated five times.

Formatting unconditionally as `f"{start}->{nums[i]}"` gives, measured on `[0, 2, 3, 4, 6, 8, 9]`:

```
['0->0', '2->4', '6->6', '8->9']
```

The run boundaries are perfect and two of the four strings are wrong. It passes cleanly on any input
whose every run has length two or more — exactly the sort of input people invent when testing by hand
— and the statement's own second example, with its three lone values, exists to catch it.

### Complexity and when to use this

**Time `O(n)`, space `O(1)` beyond the output.** Time is one pass: the inner drift advances the same
`i` the outer loop uses, so no index is examined twice and the nesting is not a multiplication. Space
is a single `start` value and an index, regardless of how many runs there are — the output list is
required by the problem and is not counted against the algorithm.

This is the rung to write. It is the shortest of the five, needing no allocation, no key, no second
pass and no empty-array guard, and its shape — **anchor, drift, emit on the break** — is the engine
behind merge-intervals, remove-duplicates-from-sorted-array and every other "collapse adjacent things
that belong together" problem.

---

## The Overall Arc

Every step on this ladder chases one principle: **stop paying for anything the answer never asked
for.** The first instinct refuses to reason at all — lay out the number line from the smallest value
to the largest, light up the numbers you were given, and read the unbroken stretches straight off —
which is correct, and quietly charges you for every integer *between* your values, so two numbers a
billion apart cost a billion steps and on the real bounds the line cannot be allocated at all. The
escape is the observation the whole problem turns on: inside a consecutive run the difference
`value - index` never changes, and it jumps at every gap, so runs can be identified without ever
asking what lies between two values. Bucketing by that key touches each element once and the cost
finally follows the length of the input rather than the size of the numbers in it — but it then sorts
the keys to recover an ordering the input already had, and hashes every element to rebuild an
adjacency that was never lost, because the array was handed to you sorted. Drop the map and walk left
to right, appending each value to the current pile or starting a fresh one, and the same groups
appear with no keys and no re-sorting. That version stores every element, though, when only two
values per run — the first and the last — ever reach the output, so the next move keeps one number per
run instead of one per element by recording the positions where the chain breaks and pairing them
afterwards. And that still needs a second pass over a list that has to survive the first, which is
the last thing to go: a range can be written down the instant its break is seen, so nothing needs to
survive except the value the current run started at. Paint the line, key by the invariant, walk the
piles, keep the break points, keep one anchor — and threaded through all five is the formatting rule
that looks like a detail and is not, that a run of one prints bare, because it is the single decision
every rung must make identically and the one place where a technically well-formed range is still the
wrong answer.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Paint the number line | `O(hi - lo)` | `O(hi - lo)` | Makes the structure visible instead of inferring it; pays per **value** in the span, not per element | Values are dense and bounded — day numbers, ports, small ids. Forbidden here by `±2^31` |
| Bucket by `value - index` | `O(n log n)` | `O(n)` | Cost follows the input at last, but it sorts keys to recover an order the input already had | The input is **not** sorted, or you need the grouping itself |
| Split into run lists | `O(n)` | `O(n)` | One local comparison replaces the map; still copies every element | You need the runs' members, not just a summary of them |
| Collect the break points | `O(n)` | `O(k)` for `k` runs | One number per run instead of one per element; still two passes over a stored list | The break positions themselves are the answer |
| **One walk with an anchor** | `O(n)` | `O(1)` | Emits each range the moment its break is seen, so nothing survives the pass but the anchor | The default answer for this problem |

---

## Interview Priority

**Know cold — the anchor walk.** Seven lines, one pass, no allocation and no empty-array guard. You
should be able to write it without pausing over the inner loop's bound, and to say why the nesting is
still linear: the inner drift advances the *same* index the outer loop uses.

> **In an interview.** Lead with the invariant before writing anything: *"the array is sorted and
> distinct, so a consecutive run is exactly a block where `nums[i] - i` is constant — I will walk it
> and emit on each break."* Then say the two edge cases out loud before being asked: the empty array
> returns `[]`, and a run of length one prints bare rather than `"x->x"`. Those two sentences are
> what the interviewer is listening for; the code is the easy part.

**Know cold — the `value - index` invariant.** Not the bucketing code, the **fact**. It is the
sentence that explains why the anchor walk works, and it generalises: looking for a quantity that is
constant within a group and changes between groups turns grouping problems into scans, and it
reappears in longest-consecutive-sequence and in several subarray problems.

**Understand, do not memorize — collect the break points.** Worth being able to explain because its
failure mode is the most transferable lesson here: any loop that emits on a transition needs
something to flush the final group. Name that trap once and you will avoid it in half a dozen other
problems.

**Understand, do not memorize — split into run lists.** It is the right answer to a neighbouring
question ("return the runs themselves"), and the clearest illustration that storing members you will
not print is waste. As an answer to *this* problem it is a strictly heavier anchor walk.

**Understand, do not memorize — paint the number line.** Nothing to recall, one thing to recognise:
some costs follow the **span** rather than the length. Naming that and rejecting the technique on the
`±2^31` bound is a better answer than never having considered it.

---

## Full Runnable Script

Every approach above, the shared `format_range` helper, and a test suite covering the statement's
examples, the empty array — this problem's no-answer case — the smallest non-empty input, one
unbroken run, no run longer than one, negatives crossing zero, the 32-bit extremes that force the
painting rung to fall back, and 46 randomised cases including a batch pressed against the 32-bit
floor. Each is cross-checked against an independent oracle that finds run starts by set membership
rather than by scanning. The values are promised distinct, so there is no duplicate case to test.

```python
"""Collapse the Runs into Ranges - every approach in one file, plus a self-checking test suite.

Run: python summary_ranges_all.py
"""

from __future__ import annotations

import random


def format_range(first: int, last: int) -> str:
    """A one-value run prints bare; anything longer prints as first->last."""
    return str(first) if first == last else f"{first}->{last}"


# --- 1. Paint the number line --------------------------------------------------

def summary_ranges_paint_line(nums: list[int], span_limit: int = 1 << 20) -> list[str]:
    if not nums:
        return []
    lo, hi = nums[0], nums[-1]
    if hi - lo + 1 > span_limit:  # the small-span assumption fails; fall back
        return summary_ranges_anchor_walk(nums)
    present = [False] * (hi - lo + 1)  # one slot per VALUE in the span, not per element
    for x in nums:
        present[x - lo] = True
    out: list[str] = []
    v = lo
    while v <= hi:
        if not present[v - lo]:
            v += 1
            continue
        start = v
        while v <= hi and present[v - lo]:
            v += 1
        out.append(format_range(start, v - 1))  # v overshot by one past the run
    return out


# --- 2. Bucket by value minus index --------------------------------------------

def summary_ranges_value_minus_index(nums: list[int]) -> list[str]:
    groups: dict[int, list[int]] = {}
    for i, x in enumerate(nums):
        groups.setdefault(x - i, []).append(x)  # the key is constant inside a run
    out: list[str] = []
    for key in sorted(groups):
        run = groups[key]
        out.append(format_range(run[0], run[-1]))
    return out


# --- 3. Split into run lists ---------------------------------------------------

def summary_ranges_run_lists(nums: list[int]) -> list[str]:
    runs: list[list[int]] = []
    for x in nums:
        if runs and runs[-1][-1] + 1 == x:  # compare against the run's LAST value
            runs[-1].append(x)
        else:
            runs.append([x])
    return [format_range(run[0], run[-1]) for run in runs]


# --- 4. Collect the break points -----------------------------------------------

def summary_ranges_break_points(nums: list[int]) -> list[str]:
    if not nums:
        return []
    ends = [i for i in range(len(nums) - 1) if nums[i] + 1 != nums[i + 1]]
    ends.append(len(nums) - 1)  # the last run always ends at the last index
    out: list[str] = []
    start = 0
    for b in ends:
        out.append(format_range(nums[start], nums[b]))
        start = b + 1
    return out


# --- 5. One walk with an anchor (optimal) --------------------------------------

def summary_ranges_anchor_walk(nums: list[int]) -> list[str]:
    out: list[str] = []
    n = len(nums)
    i = 0
    while i < n:
        start = nums[i]
        # drift along the chain of +1 steps; i lands on the run's last value
        while i + 1 < n and nums[i + 1] == nums[i] + 1:
            i += 1
        out.append(format_range(start, nums[i]))
        i += 1
    return out


APPROACHES = [
    ("paint_line", summary_ranges_paint_line),
    ("value_minus_index", summary_ranges_value_minus_index),
    ("run_lists", summary_ranges_run_lists),
    ("break_points", summary_ranges_break_points),
    ("anchor_walk", summary_ranges_anchor_walk),
]


# --- test scaffolding, not part of any answer ----------------------------------

def summary_ranges_reference(nums: list[int]) -> list[str]:
    """Independent oracle: a run starts where x - 1 is absent, then grows by membership."""
    present = set(nums)
    out: list[str] = []
    for x in nums:
        if x - 1 not in present:
            last = x
            while last + 1 in present:
                last += 1
            out.append(format_range(x, last))
    return out


def main() -> None:
    cases: list[tuple[str, list[int]]] = [
        ("statement example", [0, 1, 2, 4, 5, 7]),
        ("three lone values", [0, 2, 3, 4, 6, 8, 9]),
        ("empty array - this problem's no-answer case", []),
        ("smallest non-empty input", [0]),
        ("one long run", [1, 2, 3, 4, 5]),
        ("no run longer than one", [1, 3, 5, 7, 9]),
        ("negatives crossing zero", [-3, -2, -1, 0, 1, 5]),
        ("32-bit extremes - paint_line must fall back", [-2147483648, 2147483647]),
        ("a run at the very bottom of the range", [-2147483648, -2147483647, 0]),
        ("full 20 values, one unbroken run", list(range(20))),
    ]
    # The values are promised DISTINCT, so there is no duplicate case to test; the
    # empty array is the only input with no range to emit, and it is covered above.

    rng = random.Random(20260912)
    for _ in range(40):
        n = rng.randint(0, 20)  # 20 is the stated maximum length
        cases.append((f"stress n={n}", sorted(rng.sample(range(-40, 40), n))))
    for _ in range(6):
        n = rng.randint(1, 20)
        floor = -2147483648
        cases.append((f"stress at the 32-bit floor n={n}",
                      sorted(rng.sample(range(floor, floor + 600), n))))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, nums in cases:
        print(f"\n{label}: nums={nums}")
        expected = summary_ranges_reference(nums)
        results = []
        for name, fn in APPROACHES:
            got = fn(list(nums))  # a copy each, so no approach can disturb another
            results.append(got)
            print(f"  {name:<{width}} -> {got}")
        agreed = all(r == expected for r in results)
        if not agreed:
            all_agreed = False
            print(f"  DISAGREEMENT: reference said {expected}")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED WITH THE REFERENCE ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```

