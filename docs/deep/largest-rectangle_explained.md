# Largest Rectangle in Histogram — explained

## Understanding the Problem

A histogram is a row of bars standing side by side, each exactly one unit wide and as tall as the
number given for it. Draw any axis-aligned rectangle you like on top of that picture, as long as
every part of it sits **under** the bars — no part may stick out into empty air. Return the area of
the biggest such rectangle.

The thing that makes this hard is that a rectangle is defined by two edges you get to choose, and
there are `O(n²)` pairs of edges. But there is a second way to describe the very same rectangle, and
it is the whole problem: **any rectangle that fits under the bars is capped by the shortest bar it
spans.** Push it taller and it pokes out through that shortest bar; that bar is what decides its
height.

> **Intuition.** Think of the rectangle as water poured into a channel: it rises until it reaches the
> lowest wall it touches, and no further. The low wall, not the two ends, is what sets the level.

That reframing converts "choose two edges" into "choose one bar". **Fix each bar in turn as the
rectangle's height, and ask how far it can extend left and right before something *shorter* stops
it.** Every rectangle worth considering is the widest one at some bar's exact height, so checking one
per bar checks them all. Now the unknown has a name, and it is a familiar one: *where is the first
shorter bar on each side?* — a **next-smaller-element** question, asked twice.

**The core question is therefore: for each bar, where is the first strictly shorter bar to its left,
and to its right?** The naive approach is slow because it answers that by physically walking outward
from every bar, and a histogram of equal bars makes each of those walks cross the entire array.

### The constraints, and what each one unlocks

| Constraint | What it unlocks |
|---|---|
| `1 <= heights.length <= 10^5` | **This is what prices out both non-linear rungs.** A quadratic scan is `10^10` operations on a flat histogram, where every bar spreads across every other bar. It also kills divide & conquer's *worst* case specifically: that approach is `O(n log n)` only when the minimum tends to land mid-array, and degrades to `O(n²)` on sorted input — which `[1, 2, 3, …, 10^5]` is. The lower bound means the array is never empty, so `n = 1` is a real input and its answer is that bar's own height. |
| `0 <= heights[i] <= 10^4` | **Heights are non-negative, and that is what makes a `0` sentinel legal.** A trailing bar of height `0` is shorter than or equal to every real bar, so appending one forces the stack to drain completely — if heights could be negative, `0` would not dominate and the sentinel would have to be `-inf`. A `0` is also a legal *real* bar, and a histogram of all zeroes has a largest rectangle of area `0`, so "no rectangle" is a genuine answer rather than an error. |
| the rectangle spans consecutive bars and is capped by the shortest of them | **This is the permission slip for the entire "fix a bar as the height" reframing.** Because the cap is the shortest spanned bar, every maximal rectangle has its height equal to some bar exactly, so iterating over `n` candidate heights — one per bar — is exhaustive rather than a heuristic. Without this, you would be searching a two-dimensional space of edges. |

The worked example used in every section below is the statement's own:

```
heights = [2, 1, 5, 6, 2, 3]        answer: 10   (height 5 spanning bars 2 and 3)
```

Worth noting before you start: the answer `10` uses height `5` across two bars, beating both the
tallest single bar (`6 × 1 = 6`) and the widest possible span (`1 × 6 = 6`). Neither "go tall" nor
"go wide" is the answer, which is exactly why the shortest-bar framing is needed.

---

## Approach 1 — Brute force: spread outward from every bar

### The idea

*How wide can a rectangle of this bar's exact height be?* Stand on each bar in turn and walk outward
in both directions for as long as the neighbours are **at least as tall** as you, since anything
shorter would poke a hole in the rectangle. Multiply the bar's height by the span you reached, and
keep the best.

### How to think about it

> **Intuition.** Stand on a bar and hold a **plank** at exactly your own height, then push it sideways
> in both directions. It slides freely over bars taller than you — they are above the plank, so they
> do not obstruct it — and jams the moment it meets a bar shorter than you, because the plank would
> have nothing to rest on. Where it jams on each side is the rectangle's edge.

Do that from every bar and you have measured every candidate. The waste is that the plank from bar 4
re-crosses ground the plank from bar 3 has just finished crossing, learning the same thing twice.

### Worked example

`heights = [2, 1, 5, 6, 2, 3]`. There is no stack in this approach — that absence is the point of the
rung, and the "state" column shows what little is carried: nothing between rows, only the current
spread.

| Bar `i` | `heights[i]` | Spreads left to | Spreads right to | Width | Area |
|---|---|---|---|---|---|
| 0 | 2 | 0 | 0 (bar 1 is `1`, shorter) | 1 | 2 |
| 1 | 1 | 0 | 5 (nothing is shorter) | 6 | 6 |
| 2 | 5 | 2 (bar 1 is `1`, shorter) | 3 (bar 4 is `2`, shorter) | 2 | **10** |
| 3 | 6 | 3 | 3 | 1 | 6 |
| 4 | 2 | 2 (bar 1 is `1`, shorter) | 5 | 4 | 8 |
| 5 | 3 | 5 | 5 | 1 | 3 |

Best area **10**, from bar 2. Read row 1 and row 2 together and the redundancy is visible: bar 1
walked across the entire array, bars 2 and 4 then re-walked overlapping parts of it, and every one of
those walks was asking the same question — *where does it get shorter?* — about the same bars.

### Code

```python
def largest_rectangle_brute_force(heights: list[int]) -> int:
    best = 0
    n = len(heights)
    for i, h in enumerate(heights):
        left = i
        while left > 0 and heights[left - 1] >= h:  # >=, so equal bars do not stop the spread
            left -= 1
        right = i
        while right < n - 1 and heights[right + 1] >= h:
            right += 1
        best = max(best, h * (right - left + 1))
    return best
```

### Common mistake

Writing the spread condition as `>` instead of `>=`, so an equally tall neighbour halts the walk.

> **Watch out.** The misconception is that a rectangle is **owned** by one particular bar, so equal
> neighbours must be somebody else's territory. They are not: a bar of the same height supports your
> plank perfectly well, and refusing to walk over it truncates the rectangle to a fragment. The rule
> is that only a **strictly shorter** bar stops the spread.

Run that variant on `[2, 2, 2]` and it returns `2` where the correct answer is `6` — every bar stops
immediately at its identical neighbour, so the three-wide rectangle is never even considered. And it
hides beautifully: on this document's worked example it returns `10`, the correct answer, because
that histogram has no adjacent equal bars. Put a plateau in your test data or you will not see this.

### Complexity and when to use this

**Time `O(n²)`, space `O(1)`.** The cost comes from the two walks at each bar: on a flat histogram
every bar spreads across the whole array, giving `n` walks of length `n`. Space is three scalars —
nothing is remembered from one bar to the next, which is precisely the inefficiency.

Use it to make the "fix a bar as the height" framing concrete — it *is* that sentence transcribed —
and as the oracle the fast versions are stress-tested against, which is its job at the foot of this
document. At the stated `n = 10^5` it is `10^10` operations on flat input; name that and move up.

---

## Approach 2 — Divide and conquer at the shortest bar

### The idea

*The brute force re-measures the same neighbours from every bar — can one observation settle many
bars at once?* Yes. Find the shortest bar in the range. Any rectangle either avoids it entirely,
lying wholly to its left or wholly to its right, or it spans it — and if it spans it, its height can
be at most that minimum, so the best spanning rectangle is `minimum × full width`. Three cases, two of
them recursive. This fixes brute force's weakness — **every bar paying for its own outward walk** — by
making the work follow the recursion instead of the bar pairs.

### How to think about it

> **Intuition.** The shortest bar is a **fence post** across the channel. Any rectangle you draw
> either steps over that post — in which case the post caps its height, and the widest such rectangle
> is obviously the one spanning the whole range — or it stays strictly on one side of it, which is a
> smaller copy of the same puzzle. Solve the two smaller puzzles the same way and take the best of
> the three answers.

The appeal is that one glance at the minimum settles every rectangle that crosses it, however many
there are. The catch is that it settles *nothing* about the two sides, so the recursion's shape
depends entirely on where the minimum happens to fall.

### Worked example

`heights = [2, 1, 5, 6, 2, 3]`. The state here is the **call stack**, not a data stack — which is
itself worth noticing, because it is the same last-in-first-out structure showing up as recursion
instead of as an array. Indentation is depth; each row shows the range, its minimum, and the spanning
candidate.

| Call | Range | Min at (height) | Spanning candidate | Returns |
|---|---|---|---|---|
| `solve(0,5)` | `[2,1,5,6,2,3]` | 1 (`h=1`) | `1 × 6 = 6` | **10** |
| `solve(0,0)` | `[2]` | 0 (`h=2`) | `2 × 1 = 2` | 2 |
| `solve(2,5)` | `[5,6,2,3]` | 4 (`h=2`) | `2 × 4 = 8` | 10 |
| `solve(2,3)` | `[5,6]` | 2 (`h=5`) | `5 × 2 = 10` | **10** |
| `solve(3,3)` | `[6]` | 3 (`h=6`) | `6 × 1 = 6` | 6 |
| `solve(5,5)` | `[3]` | 5 (`h=3`) | `3 × 1 = 3` | 3 |

Unwinding: `solve(2,3)` returns `max(10, 0, 6) = 10`; `solve(2,5)` returns `max(8, 10, 3) = 10`; the
root returns `max(6, 2, 10) = 10`. Answer **10**.

Notice that the winning rectangle appeared as a *spanning* candidate at `solve(2,3)` — the range
`[5, 6]` whose minimum is `5`. That is the same rectangle the brute force found at bar 2, arrived at
from the opposite direction: instead of asking how far bar 2 spreads, this asked what the minimum of
an already-chosen range is.

### Code

```python
def largest_rectangle_divide_and_conquer(heights: list[int]) -> int:
    def solve(lo: int, hi: int) -> int:
        if lo > hi:
            return 0
        m = min(range(lo, hi + 1), key=heights.__getitem__)
        spanning = heights[m] * (hi - lo + 1)  # the only rectangle that may cross the minimum
        return max(spanning, solve(lo, m - 1), solve(m + 1, hi))

    return solve(0, len(heights) - 1)
```

### Common mistake

Recursing on `solve(lo, m)` and `solve(m + 1, hi)` — that is, letting the minimum bar stay inside the
left half instead of excluding it.

> **Watch out.** The misconception is treating this like a **binary search split**, where the two
> halves must cover everything so nothing gets missed. Here the middle element has already been fully
> accounted for by the `spanning` candidate, so including it again is not thoroughness, it is
> non-termination: when the minimum is the first element, `m == lo`, and `solve(lo, m)` is the call
> you are already inside.

Running that variant on this document's worked example raises `RecursionError` rather than returning a
wrong number. The three cases must **partition** the range — strictly left of the minimum, the
minimum itself, strictly right of it — and `m - 1` is what makes the left piece strict.

### Complexity and when to use this

**Time `O(n log n)` typical, `O(n²)` worst case; space `O(log n)` typical, `O(n)` worst.** The cost is
the linear scan for the minimum at every node of the recursion: when the minimum lands near the middle
the range halves each time, giving `log n` levels of `O(n)` work. When the input is sorted the minimum
is always at one end, one side is empty, the recursion is `n` deep, and the scans sum to `n²/2` — with
a call stack `n` frames deep to match.

It is worth understanding and not worth shipping here, because a later rung beats it on every axis.
Its real value is transferable: "split at the extreme element, handle the three cases" is the same
move behind Cartesian trees and range-minimum problems, and with an `O(1)` range-minimum structure the
scan disappears and this becomes genuinely `O(n)`. Mention it, price its worst case against the stated
`10^5`, and move on.

---

## Approach 3 — Monotonic stack of unfinished bars (optimal)

### The idea

*Both previous rungs go looking for boundaries — can the boundaries announce themselves instead?* Yes.
Sweep left to right, keeping on a stack the bars whose rectangle is **not yet finished**, in
non-decreasing height order. When a bar arrives that is shorter than the stack top, that top bar's
rectangle is finished: the arriving bar is its right boundary, and the bar below it on the stack is
its left boundary. Pop, compute, repeat. This fixes what both earlier rungs share — **searching for
the two shorter bars** — by having each bar discover its own boundaries the moment they exist.

### How to think about it

> **Intuition.** The stack is a row of bars with **unfinished business**, each still hoping to extend
> further right. They sit in non-decreasing order because any bar that arrives shorter than the ones
> already waiting has just ended their hopes, and is served before joining. When a short bar walks in,
> everybody taller than it settles up and leaves — from the top down, tallest first — and each one
> learns both its edges as it goes: the newcomer on its right, and whoever it finds beneath it on its
> left.

The two next-smaller questions the problem needs are answered by the **same** pop, from opposite
sides, which is why one pass suffices where the brute force needed two walks per bar.

### Worked example

`heights = [2, 1, 5, 6, 2, 3]`, with a **sentinel** `0` appended at index 6. The stack is shown as
`index:height`, top on the right; heights along it never decrease.

| `i` | incoming `h` | Pops — each with `height × (i − left)` | Stack after (idx:h) | `best` |
|---|---|---|---|---|
| 0 | 2 | — | `[0:2]` | 0 |
| 1 | 1 | idx 0 (`h=2`), left = 0, width `1−0=1` → area 2 | `[1:1]` | 2 |
| 2 | 5 | — | `[1:1, 2:5]` | 2 |
| 3 | 6 | — | `[1:1, 2:5, 3:6]` | 2 |
| 4 | 2 | idx 3 (`h=6`), left = 3, width `4−3=1` → area 6;<br>idx 2 (`h=5`), left = 2, width `4−2=2` → area **10** | `[1:1, 4:2]` | **10** |
| 5 | 3 | — | `[1:1, 4:2, 5:3]` | 10 |
| 6 | **0 (sentinel)** | idx 5 (`h=3`), left = 5, width `6−5=1` → area 3;<br>idx 4 (`h=2`), left = 2, width `6−2=4` → area 8;<br>idx 1 (`h=1`), left = 0, width `6−0=6` → area 6 | `[6:sentinel]` | 10 |

Answer **10**, found at step 4 when bar 2's rectangle was closed by the arrival of the `2`.

Three things to take from that table. At step 4, popping index 3 then index 2 gives them *different*
left boundaries — `3` and `2` — because after index 3 leaves, the bar beneath it is index 2, and that
is what "the new stack top is the left boundary" means in practice. At step 6 the sentinel closes out
the three bars that were still waiting, including index 1, whose rectangle is the full six-wide span
— **none of these three had been measured before the sentinel arrived.** And the stack is
non-decreasing in every single row, which is the invariant that makes the left boundary lookup a
single array read.

### Why it works

> **Why it works.** Two separate claims, and both are needed.
>
> **The boundaries are correct.** When index `j` is popped by the arrival of index `i`, `i` is the
> first index to the right of `j` with a strictly smaller height — because every index between them
> was pushed and then popped by something no taller, and `i` is the first to undercut `j` itself. The
> new stack top is the **nearest index to the left of `j` that is strictly shorter**, because the
> stack is non-decreasing and everything between them has already been popped. So `left = top + 1` and
> the width `i − left` is exactly the maximal span at height `heights[j]`.
>
> **The linear-time claim.** There is a `while` inside a `for`, and one iteration can pop most of the
> array — step 6 above pops three — so the page looks quadratic. It is not. **Each index is pushed
> exactly once and popped at most once**, so the total number of pops across the whole run is bounded
> by `n`, however unevenly they clump. An expensive iteration is expensive only *because* the cheap
> ones before it did the pushing, and it cannot happen twice without `n` more pushes first. Total
> work: `n` pushes, at most `n` pops, `O(1)` each — `O(n)`.

The sentinel deserves its own line. The loop only ever measures a bar when something **shorter**
arrives, so any bar left on the stack at the end has never been measured at all. Appending a bar of
height `0` — legal precisely because heights are non-negative, so nothing is shorter — guarantees
every remaining bar is popped and priced before the loop exits.

### Code

```python
SENTINEL_HEIGHT: int = 0  # <= every legal height, so it drains the stack completely


def largest_rectangle_monotonic_stack(heights: list[int]) -> int:
    best = 0
    st: list[int] = []  # indices of unfinished bars, heights non-decreasing
    for i, h in enumerate(heights + [SENTINEL_HEIGHT]):
        while st and heights[st[-1]] > h:
            height = heights[st.pop()]
            left = st[-1] + 1 if st else 0  # the bar below is the first shorter one on the left
            best = max(best, height * (i - left))
        st.append(i)
    return best
```

`heights + [SENTINEL_HEIGHT]` builds a copy for the loop to walk, so the caller's list is never
mutated; the pops index the original `heights`, which the sentinel's own index never reaches because
nothing follows it.

### Common mistake

Leaving out the sentinel and iterating over `heights` alone.

> **Watch out.** The misconception is that the loop **finishes the job** — that by the time you have
> read every bar, every bar has been priced. It has not. A bar is only ever measured when something
> shorter arrives to close it, so every bar still on the stack at the end has **never been measured**,
> and those are exactly the bars in the final non-decreasing run. Sentinel or explicit drain loop, you
> must do one of them.

This is the single most-missed detail in this problem, and it hides better than almost any bug in this
repo: run the no-sentinel variant on this document's worked example and it returns **10**, the correct
answer, because `[2, 1, 5, 6, 2, 3]` ends on a bar that gets popped anyway. Run it on `[1, 2, 3, 4, 5]`
and it returns **0** against a correct **9** — nothing ever pops, so no area is ever computed. On the
smallest legal input `[5]` it returns **0** against a correct **5**. A test set without an ascending
tail will pass this bug straight through.

### Complexity and when to use this

**Time `O(n)`, space `O(n)`.** Time is the amortised argument above — `n` pushes and at most `n` pops,
each `O(1)` — and it holds on every input, not on average. Space is the stack, and the bound is tight:
an ascending histogram like `[1, 2, 3, …]` pushes every index and pops nothing until the sentinel, so
all `n` indices are resident at once.

This is the answer to ship, and it is the ceiling of the monotonic-stack family — if you can derive
this one, `daily-warmer` and next-greater-element are the same loop with the comparison and the
payload changed. It is also a building block: **maximal rectangle in a binary matrix** is literally
this routine run once per row, over a running array of column heights, which turns a hard 2-D problem
into `n` calls to a function you already have.

---

## The Overall Arc

The principle every step here chases is *name the unknown so that it becomes a question you already
know how to answer*. Stated as given, the problem is a search over pairs of edges, and there are
quadratically many pairs — but a rectangle under a histogram is capped by the **shortest bar it
spans**, so every maximal rectangle has its height equal to some bar exactly. Fix each bar as the
height and the two-dimensional search collapses into `n` one-dimensional ones: how far does this bar
extend before something shorter stops it? That is a next-smaller-element question asked on both
sides, and the moment it has that name the ladder is forced. Answer it by walking outward from every
bar and you have the brute force — correct, quadratic, and wasteful in a precise way, since the
neighbours bar 4 crosses are the neighbours bar 3 has just crossed. Try to settle many bars at once
and you get divide & conquer: the shortest bar in a range caps every rectangle that spans it, so one
glance settles all of those, and the two sides recurse — elegant, `O(n log n)` when the minimum lands
mid-array, and quietly `O(n²)` on sorted input, which is exactly the input the constraints invite.
The fix is to stop searching for boundaries and let them announce themselves: sweep once, keeping on
a stack the bars whose rectangles are unfinished, in non-decreasing height order, and when a shorter
bar arrives it *is* the right boundary of everything it undercuts, while the bar left beneath each
popped one *is* its left boundary. Both next-smaller questions are answered by the same pop, from
opposite sides, and the width falls out of two indices with no second pass. The inner `while` makes
the page look quadratic and is not, for the reason that carries this entire pattern: each index enters
the stack once and leaves once, so the total pop count is bounded by `n` no matter how lumpily the
pops distribute — an expensive iteration is paid for by the cheap ones that filled the stack. What
remains is the detail that most implementations get wrong, and it follows straight from the
mechanism: a bar is measured only when something shorter arrives, so whatever is still on the stack
when the input ends was never measured at all. Append a zero-height sentinel — legal only because
heights are non-negative — and the stack drains, every leftover priced on the way out. That is the
difference between this problem and `daily-warmer`, where the leftovers already hold their correct
answer of `0` and need no flush; and once both are in hand, the family is yours — next greater, next
smaller, previous greater, stock span, and maximal rectangle in a matrix, which is this routine run
once per row.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Brute force spread | `O(n²)` | `O(1)` | Transcribes "fix a bar as the height" literally; every bar re-walks its neighbour's ground | Making the reframing concrete, and as the oracle the fast versions are stress-tested against |
| Divide & conquer | `O(n log n)` avg, `O(n²)` worst | `O(log n)` avg, `O(n)` worst | One glance at the minimum settles every spanning rectangle, but the recursion's shape is at the data's mercy | Teaching the "split at the extreme" move; genuinely `O(n)` only if paired with an `O(1)` range-minimum structure |
| Monotonic stack | `O(n)` | `O(n)` | Both boundaries fall out of one pop, at the cost of `O(n)` storage and a sentinel you must not forget | Always — and as the inner loop of maximal-rectangle-in-a-matrix |

---

## Interview Priority

**Memorise cold: the monotonic stack, and the reframing that produces it.** The code is ten lines, but
the reframing is what is actually being assessed, and it has to come first.

> **In an interview.** Open with the reframing, before any code: *"a rectangle is capped by its
> shortest bar, so I'll fix each bar as the height and find the first shorter bar on each side —
> that's next-smaller-element twice, and one stack answers both."* Then write it, and volunteer the
> two things you will be asked anyway: **why the inner `while` is still linear** (each index is pushed
> once and popped once, so at most `n` pops in total) and **why the sentinel exists** (a bar is only
> measured when something shorter arrives, so the final ascending run would never be measured). The
> follow-up is usually maximal rectangle in a binary matrix — say that it is this function called once
> per row over running column heights.

**Memorise second: the brute-force spread, including the `>=`.** Not to ship, but because it is how
you explain the reframing in ten seconds and how you sanity-check the fast version when it disagrees
with you at a whiteboard. Getting the `>=` right matters even here: equal bars must not stop the
spread, and being able to say why — an equal bar supports the plank fine — shows you understand what
the boundary actually is.

**Understand but do not drill: divide & conquer.** It is a genuinely nice idea and it is the wrong
answer to give, because its worst case is `O(n²)` on sorted input and sorted input is not exotic. Know
the three-case split, know that `m - 1` and `m + 1` must both exclude the minimum or it does not
terminate, know that an `O(1)` range-minimum structure would rescue it, and spend your preparation
time on the stack instead.

---

## Full Runnable Script

All three approaches in one file, cross-checked on every case. Coverage: the statement's example; the
smallest legal input (`n = 1`); `0` as a legal height and an all-zero histogram, which is the
no-rectangle case the constraints allow; both monotone shapes, since a strictly ascending histogram is
what the missing-sentinel bug fails on; a plateau of equal bars, which is what the `>=` bug fails on;
and a randomised stress test in two regimes, one of them deliberately tie-heavy.

```python
"""Largest Rectangle in Histogram - every approach in one file, cross-checked.

Run: python largest_rectangle.py
"""

from __future__ import annotations

import random
import sys

SENTINEL_HEIGHT: int = 0  # <= every legal height, so it drains the stack completely


def largest_rectangle_brute_force(heights: list[int]) -> int:
    best = 0
    n = len(heights)
    for i, h in enumerate(heights):
        left = i
        while left > 0 and heights[left - 1] >= h:  # >=, so equal bars do not stop the spread
            left -= 1
        right = i
        while right < n - 1 and heights[right + 1] >= h:
            right += 1
        best = max(best, h * (right - left + 1))
    return best


def largest_rectangle_divide_and_conquer(heights: list[int]) -> int:
    def solve(lo: int, hi: int) -> int:
        if lo > hi:
            return 0
        m = min(range(lo, hi + 1), key=heights.__getitem__)
        spanning = heights[m] * (hi - lo + 1)  # the only rectangle that may cross the minimum
        return max(spanning, solve(lo, m - 1), solve(m + 1, hi))

    return solve(0, len(heights) - 1)


def largest_rectangle_monotonic_stack(heights: list[int]) -> int:
    best = 0
    st: list[int] = []  # indices of unfinished bars, heights non-decreasing
    for i, h in enumerate(heights + [SENTINEL_HEIGHT]):
        while st and heights[st[-1]] > h:
            height = heights[st.pop()]
            left = st[-1] + 1 if st else 0  # the bar below is the first shorter one on the left
            best = max(best, height * (i - left))
        st.append(i)
    return best


APPROACHES: list[tuple[str, object]] = [
    ("brute force", largest_rectangle_brute_force),
    ("divide & conquer", largest_rectangle_divide_and_conquer),
    ("monotonic stack", largest_rectangle_monotonic_stack),
]


def run_case(label: str, heights: list[int]) -> bool:
    results = [(name, fn(list(heights))) for name, fn in APPROACHES]  # own copy each
    agree = all(r == results[0][1] for _, r in results)
    print(label)
    print(f"  heights={heights}")
    for name, r in results:
        print(f"    {name:<17} -> {r}")
    print(f"    all agree: {agree}")
    return agree


def main() -> None:
    ok = True

    ok &= run_case("statement example", [2, 1, 5, 6, 2, 3])

    # Smallest legal input: one bar is its own rectangle.
    ok &= run_case("smallest legal input (n = 1)", [5])

    # Height 0 is legal, and a histogram of nothing but zeroes holds no rectangle at all.
    ok &= run_case("zero height is legal", [0])
    ok &= run_case("no rectangle with any area", [0, 0, 0])

    # The two monotone shapes - the ascending one is what a missing sentinel breaks.
    ok &= run_case("strictly increasing (nothing ever pops early)", [1, 2, 3, 4, 5])
    ok &= run_case("strictly decreasing", [5, 4, 3, 2, 1])

    # Equal bars: the whole span is one rectangle. This is what the `>` spread bug breaks.
    ok &= run_case("all equal", [3, 3, 3, 3])

    # A zero in the middle splits the histogram in two.
    ok &= run_case("split by a zero", [4, 4, 0, 5, 5])

    # Tall-narrow versus short-wide, decided by the shortest bar.
    ok &= run_case("tall spike beside a wide plateau", [1, 1, 1, 1, 9])

    # Stress against brute force. n is kept small: divide & conquer recurses once per bar
    # on sorted input and brute force is quadratic - the worst cases of both are stated
    # analytically in the document above, not measured here. The second regime uses only
    # three distinct heights so plateaus and ties are common.
    rng = random.Random(5)
    for _ in range(1500):
        heights = [rng.randint(0, 9) for _ in range(rng.randint(1, 40))]
        results = [fn(list(heights)) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT heights={heights} -> {results}")
    for _ in range(300):
        heights = [rng.choice([0, 1, 2]) for _ in range(rng.randint(1, 30))]
        results = [fn(list(heights)) for _, fn in APPROACHES]
        if any(r != results[0] for r in results):
            ok = False
            print(f"  STRESS DISAGREEMENT heights={heights} -> {results}")
    print("stress: 1500 random + 300 tie-heavy histograms cross-checked")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    sys.setrecursionlimit(10000)  # divide & conquer recurses once per bar on sorted input
    main()
```
