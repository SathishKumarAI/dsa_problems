# Read the Matrix in a Spiral — explained

## Understanding the Problem

You have a grid of numbers and you must read every one of them aloud in a particular order: along the
top row left to right, down the right-hand side, back along the bottom row right to left, up the
left-hand side — and then the same again on the smaller rectangle you have left, winding inward until
nothing remains.

**The core question:** how do you know when to turn? There is no clever algorithm here and nothing to
optimise away: every cell must be read exactly once, so `O(rows · cols)` is both the floor and the
ceiling. What separates the rungs is **how much memory the code spends discovering something the
shape of the walk already determines**, and whether the turn condition is stated correctly at the
very last ring.

> **Watch out.** The misconception that costs people this problem is *"the spiral is four loops
> repeated, so I write four loops and repeat them."* Four loops is right for every ring except
> possibly the last. When the remaining rectangle is a single row, the top run has already taken it
> and there is no bottom row to walk back along; when it is a single column, the right run has
> already taken it and there is no left column to climb. A version without that guard does not crash
> — it **emits those cells a second time**, which is why `[[1, 2, 3, 4]]` and `[[1], [2], [3]]` are
> the first two tests to write, not an afterthought.

### The constraints, and what each one unlocks

| Constraint | What it unlocks, or forbids |
|---|---|
| `1 <= rows, cols <= 10` | Never empty, so `matrix[0]` always exists and no rung needs an empty-matrix branch. Ten by ten is a hundred cells, so **every rung here is fast enough** — the ladder is about memory and correctness at the edges, not speed. |
| the matrix need not be square | The rings are **rectangles**, not squares, so a ring's four sides have different lengths and the innermost leftover may be a strip rather than a single cell. This is what makes the final-ring guard necessary at all: on a square matrix the leftover is always a cell or a full ring. |
| `-100 <= value <= 100` | Values may repeat and may be negative, so **no value can serve as a "not yet visited" marker** in the matrix itself. Approach 2 therefore pays for a separate grid of flags rather than writing sentinels into the input. |
| every value appears exactly once, so the answer's length is `rows × cols` | A one-line self-check that catches the double-emission bug instantly: if the output is longer than `rows × cols`, a run walked over something twice. |
| a single row or a single column is a legal matrix | **The permission slip is really a warning.** These are the inputs the guards exist for, and the ones a hand-written test is least likely to include. |

The worked example used in every section below is the statement's own, chosen because it ends on a
single leftover cell — the smallest version of the final-ring problem:

```
matrix = [[1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]]        answer: [1, 2, 3, 6, 9, 8, 7, 4, 5]
```

### A note on the ladder

The problem's data carries three rungs — the visited grid, the ring peel, and the boundary walk.
**Two more are added here**, and they are marked as additions where they appear: the
peel-and-rotate one-liner, because it is the instinctive first answer and skipping it skips the most
educational step, and the run-length walk, because it is the clearest statement that the spiral's
geometry is known in closed form.

### Shared scaffolding

Two rungs step cell by cell in a heading that rotates clockwise. The heading table is one constant at
module scope rather than four literal tuples inside two loop bodies.

```python
DIRECTIONS = ((0, 1), (1, 0), (0, -1), (-1, 0))  # right, down, left, up - in turn order
```

Turning right is then `heading = (heading + 1) % 4`, and that single expression is the only place the
turn order is encoded.

---

## Approach 1 — Peel the top row and rotate the rest *(an addition to the data file's ladder)*

### The idea

*Is there a way to avoid thinking about turns at all?* Yes — the top row is always the next thing to
read, so read it and throw it away. Then turn the **remaining** matrix a quarter turn anticlockwise,
which brings the side you would have walked next up to the top, and repeat.

### How to think about it

> **Intuition.** Instead of walking around the grid, keep the walker still and rotate the grid. You
> only ever perform one action — *take the top row* — and between actions you spin what is left so
> that the correct side is facing you. It is the same trick as turning a map rather than turning your
> body. The method is beautifully short and completely honest about its cost: **you are rebuilding
> the remaining matrix after every row you take.**

### Worked example

`matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]`.

| step | top row taken | `out` after | what is left, after the anticlockwise turn |
|---|---|---|---|
| 1 | `[1, 2, 3]` | `[1, 2, 3]` | `[[6, 9], [5, 8], [4, 7]]` |
| 2 | `[6, 9]` | `[1, 2, 3, 6, 9]` | `[[8, 7], [5, 4]]` |
| 3 | `[8, 7]` | `[1, 2, 3, 6, 9, 8, 7]` | `[[4], [5]]` |
| 4 | `[4]` | `[1, 2, 3, 6, 9, 8, 7, 4]` | `[[5]]` |
| 5 | `[5]` | `[1, 2, 3, 6, 9, 8, 7, 4, 5]` | `[]` — loop ends |

Notice step 1: after taking `[1, 2, 3]` the remainder is `[[4, 5, 6], [7, 8, 9]]`, and turning it
anticlockwise puts its right-hand column, `6` then `9`, on top — which is exactly the run the spiral
does next.

### Code

```python
def spiral_order_peel_and_rotate(matrix: list[list[int]]) -> list[int]:
    rest = [list(row) for row in matrix]  # this rung consumes what it walks
    out: list[int] = []
    while rest:
        out.extend(rest.pop(0))
        # turning the remainder anticlockwise puts the next side on top
        rest = [list(col) for col in zip(*rest)][::-1]
    return out
```

### Common mistake

> **Watch out.** The misconception is that "rotate the rest" is a direction-free instruction. The
> transpose `zip(*rest)` is only half a rotation; which half you finish with decides the direction,
> and **turning clockwise walks the spiral anticlockwise.** `zip(*rest)` then reversing the row order
> turns anticlockwise; reversing the rows *before* transposing turns clockwise.

Writing `rest = [list(col) for col in zip(*rest[::-1])]` gives, measured on the 3 × 3:

```
[1, 2, 3, 7, 4, 9, 8, 6, 5]
```

Nine values, every cell exactly once, and the order is wrong from the fourth element on: after the
top row it walks *up the left column* — `7` then `4` — instead of down the right. The output passes a
length check and a contents check, so only comparing the actual sequence catches it.

### Complexity and when to use this

**Time `O(rows · cols · min(rows, cols))`, space `O(rows · cols)`.** The time is the sting: each peel
rebuilds every remaining cell, and there is one peel per row *and* per column. Instrumented, the
largest allowed matrix — 10 × 10 — takes 19 peels and copies **615 cells** to emit 100 values; the
3 × 3 above takes 5 peels and 13 copies to emit 9. Space is a full copy of the remainder, replaced on
every iteration. On a hundred cells none of this matters; on a large matrix it is the difference
between linear and cubic, and that growth is analytic — the harness only runs up to the stated
10 × 10 limit.

Use it when the matrix is small and the code will be read more often than run — five lines with no
index arithmetic and no boundary conditions is a real virtue. It is also genuinely the right tool for
the closely related "rotate an image" problems, where transpose-and-reverse *is* the answer rather
than a means to one. Everything below exists because this rung pays memory to avoid thinking.

---

## Approach 2 — A visited grid and four directions *(from the data file)*

### The idea

*If rebuilding the matrix is too expensive, can the walker move instead?* Step cell by cell in the
current heading, marking each cell as seen. When the next step would leave the matrix or land on a
cell already seen, turn right and step there instead. Stop once every cell has been taken.

This fixes Approach 1's weakness: **it rebuilds the entire remaining matrix after every row**, when
the walk only ever needs to move one cell at a time.

### How to think about it

> **Intuition.** A robot vacuum with a simple rule: go straight until you bump into something, then
> turn right. The two things it can bump into are the **wall** of the matrix and its **own trail** —
> and in a spiral those are the only two things that ever stop it, which is why this rule alone
> produces the whole pattern with no geometry at all. The cost of that simplicity is the trail: a
> boolean for every cell, recording something the shape already determined.

### Worked example

`matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]`. `DIRECTIONS[heading]` starts as `(0, 1)`, right.

| step | at `(r, c)` | emits | heading | next cell | blocked by | after |
|---|---|---|---|---|---|---|
| 1 | `(0, 0)` | `1` | right | `(0, 1)` | — | move to `(0, 1)` |
| 2 | `(0, 1)` | `2` | right | `(0, 2)` | — | move to `(0, 2)` |
| 3 | `(0, 2)` | `3` | right | `(0, 3)` | **wall** | turn down, move to `(1, 2)` |
| 4 | `(1, 2)` | `6` | down | `(2, 2)` | — | move to `(2, 2)` |
| 5 | `(2, 2)` | `9` | down | `(3, 2)` | **wall** | turn left, move to `(2, 1)` |
| 6 | `(2, 1)` | `8` | left | `(2, 0)` | — | move to `(2, 0)` |
| 7 | `(2, 0)` | `7` | left | `(2, -1)` | **wall** | turn up, move to `(1, 0)` |
| 8 | `(1, 0)` | `4` | up | `(0, 0)` | **own trail** | turn right, move to `(1, 1)` |
| 9 | `(1, 1)` | `5` | right | — | loop count reached `9` | stop |

Step 8 is the whole reason `seen` exists: `(0, 0)` is comfortably inside the matrix, so a bounds check
alone would happily walk back onto it.

### Code

```python
def spiral_order_visited_grid(matrix: list[list[int]]) -> list[int]:
    rows, cols = len(matrix), len(matrix[0])
    seen = [[False] * cols for _ in range(rows)]
    r = c = heading = 0
    out: list[int] = []
    for _ in range(rows * cols):  # exactly one emission per cell
        out.append(matrix[r][c])
        seen[r][c] = True
        dr, dc = DIRECTIONS[heading]
        nr, nc = r + dr, c + dc
        if not (0 <= nr < rows and 0 <= nc < cols) or seen[nr][nc]:
            heading = (heading + 1) % 4
            dr, dc = DIRECTIONS[heading]
            nr, nc = r + dr, c + dc
        r, c = nr, nc
    return out
```

### Common mistake

> **Watch out.** The misconception is that the matrix edge is what makes the walker turn. The edge
> causes the first three turns of the outer ring; **every turn after that is caused by the trail**,
> not the wall. Keeping only the bounds check produces a walker that laps the outside forever.

Dropping the `or seen[nr][nc]` test gives, measured on the 3 × 3:

```
[1, 2, 3, 6, 9, 8, 7, 4, 1]
```

Nine values, as the loop count demands — but the ninth is `1`, emitted for the second time, and the
centre cell `5` never appears at all. At step 8 the walker heads up from `(1, 0)` to `(0, 0)`, finds
it inside the matrix, and re-enters the ring it has already walked.

### Complexity and when to use this

**Time `O(rows · cols)`, space `O(rows · cols)`.** Time is one emission per cell with a constant
amount of turn-checking, which is optimal. Space is the `seen` grid — one boolean per cell, and the
entire reason this rung is not the final answer.

Use it when the path is **not** a known shape: the same "step, mark, turn when blocked" skeleton
solves diagonal traversal, boustrophedon scans and flood-fill-shaped walks where no closed-form
boundary exists. Here the shape *is* known, so paying `rows · cols` booleans to rediscover it is the
weakness the next three rungs remove.

---

## Approach 3 — Walk a known list of run lengths *(an addition to the data file's ladder)*

### The idea

*If the walk never revisits a cell, why record where it has been?* The spiral is four straight runs
repeated, and their lengths are fixed before you start: `cols`, then `rows - 1`, then `cols - 1`, then
`rows - 2`, each one shorter than the run two turns earlier. Compute that list, then walk it.

This fixes Approach 2's weakness: **a boolean per cell spent recording a shape that was never in
doubt.** A spiral cannot revisit anything, so "have I been here?" was only ever standing in for "has
this side already been used up?", and the run lengths answer that directly in four integers.

### How to think about it

> **Intuition.** Think of the spiral as a set of instructions you could hand to someone with their
> eyes shut: *three steps right, two down, two left, one up, one right.* Each run is one shorter than
> the run two turns back, because taking a row consumes one row from the column-runs that follow, and
> taking a column consumes one column from the row-runs. The list of lengths is the whole geometry,
> written down once. What is left is a walker that turns when told to, never looks at a boundary and
> never checks anything.

### Worked example

`matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]`, so `rows = cols = 3`. Build the run lengths, starting
from `[cols, rows - 1] = [3, 2]` and repeatedly appending `runs[-2] - 1` until a run of length 0
appears:

| appended | `runs` so far |
|---|---|
| — | `[3, 2]` |
| `3 - 1 = 2` | `[3, 2, 2]` |
| `2 - 1 = 1` | `[3, 2, 2, 1]` |
| `2 - 1 = 1` | `[3, 2, 2, 1, 1]` |
| `1 - 1 = 0` | `[3, 2, 2, 1, 1, 0]` — stop |

The lengths sum to `3 + 2 + 2 + 1 + 1 + 0 = 9`, which is `rows × cols`. Now walk them, starting at
`(0, -1)` — just off the left edge, so that the first step lands on `(0, 0)`:

| turn | heading | run | cells visited | emits | `out` after |
|---|---|---|---|---|---|
| 0 | right | 3 | `(0,0) (0,1) (0,2)` | `1, 2, 3` | `[1, 2, 3]` |
| 1 | down | 2 | `(1,2) (2,2)` | `6, 9` | `[1, 2, 3, 6, 9]` |
| 2 | left | 2 | `(2,1) (2,0)` | `8, 7` | `[1, 2, 3, 6, 9, 8, 7]` |
| 3 | up | 1 | `(1,0)` | `4` | `[1, 2, 3, 6, 9, 8, 7, 4]` |
| 4 | right | 1 | `(1,1)` | `5` | `[1, 2, 3, 6, 9, 8, 7, 4, 5]` |
| 5 | down | 0 | none | — | unchanged |

The single-row case falls out with no special handling: `[[1, 2, 3, 4]]` gives
`runs = [4, 0]`, the first run takes all four cells, and the second run has length 0, so the walk
simply stops. The guard the other rungs need is here expressed as a **length of zero**.

### Code

```python
def spiral_order_run_lengths(matrix: list[list[int]]) -> list[int]:
    rows, cols = len(matrix), len(matrix[0])
    runs = [cols, rows - 1]
    while runs[-1] > 0:
        runs.append(runs[-2] - 1)  # each run is one shorter than the one two turns back
    r, c = 0, -1  # just off the left edge, so the first step lands on (0, 0)
    out: list[int] = []
    for turn, run in enumerate(runs):
        dr, dc = DIRECTIONS[turn % 4]
        for _ in range(run):
            r, c = r + dr, c + dc
            out.append(matrix[r][c])
    return out
```

### Common mistake

> **Watch out.** The misconception is that a walk starts *on* its first cell. Here the loop is written
> as **step then emit**, so the starting position must be one cell *before* the first one. Starting at
> `(0, 0)` makes the first run emit `(0,0) (0,1) (0,2)` while leaving the walker at `(0, 3)` — one
> past the end — and every later run is then offset by one cell.

Starting at `r, c = 0, 0` with the emit before the step gives, measured on the 3 × 3:

```
IndexError: list index out of range
```

It survives the first run — leaving the walker at `(0, 3)`, one column past the edge — and dies on the
first emission of the second run, reading `matrix[0][3]`. That it raises at all is luck: the same
off-by-one on a wider matrix walks one cell late through every run and can return a full-length,
entirely plausible, wrong answer.

### Complexity and when to use this

**Time `O(rows · cols)`, space `O(1)` beyond the output.** Time is one emission per cell plus building
a run list of at most `rows + cols` entries. Space is that run list and four scalars — constant in the
sense that matters, since the list grows with the perimeter rather than the area.

Use it when you need the *k*-th element of the spiral without walking the first *k*, because the run
lengths let you jump straight to the right run — a genuine advantage no other rung has. The reason it
is not the final answer is robustness: the `runs[-2] - 1` recurrence is correct but not obvious, and
a reader cannot check it at a glance. The last two rungs make the geometry visible instead of
encoded.

---

## Approach 4 — Peel one ring at a time *(from the data file)*

### The idea

*Can the geometry be written so a reader can see it rather than verify a recurrence?* Index the rings
from the outside in. Ring `layer` has its top at row `layer`, its bottom at `rows - 1 - layer`, and
the same for columns — so the four sides of every ring are derived directly from one counter.

This fixes Approach 3's weakness: **the run lengths are correct but opaque**, a recurrence a reader
has to trust. Layer arithmetic states the same shape in terms a reader can point at on the grid.

### How to think about it

> **Intuition.** An onion. Ring 0 is the outside of the whole matrix; ring 1 is the outside of the
> matrix with one cell shaved off every side; and so on. Because each ring's bounds come straight
> from its layer number, the four runs need no state carried between iterations — every ring is
> computed from scratch. The number of rings is `(min(rows, cols) + 1) // 2`, the `+ 1` being what
> keeps the odd middle strip rather than dropping it.

### Worked example

`matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]`. There are `(3 + 1) // 2 = 2` layers.

| layer | `top`, `bottom` | `left`, `right` | top run | right run | one-line ring? | bottom run | left run |
|---|---|---|---|---|---|---|---|
| 0 | `0`, `2` | `0`, `2` | `1, 2, 3` | `6, 9` | no — `0 != 2` both ways | `8, 7` | `4` |
| 1 | `1`, `1` | `1`, `1` | `5` | none — `range(2, 2)` | **yes — `top == bottom`** | skipped | skipped |

`out` after layer 0 is `[1, 2, 3, 6, 9, 8, 7, 4]`; layer 1 adds `5`, and the guard stops it from
emitting `5` a second and third time.

### Code

```python
def spiral_order_rings(matrix: list[list[int]]) -> list[int]:
    rows, cols = len(matrix), len(matrix[0])
    out: list[int] = []
    for layer in range((min(rows, cols) + 1) // 2):
        top, bottom = layer, rows - 1 - layer
        left, right = layer, cols - 1 - layer
        for c in range(left, right + 1):
            out.append(matrix[top][c])
        for r in range(top + 1, bottom + 1):
            out.append(matrix[r][right])
        if top == bottom or left == right:
            continue  # a one-line ring was already fully read by the two runs above
        for c in range(right - 1, left - 1, -1):
            out.append(matrix[bottom][c])
        for r in range(bottom - 1, top, -1):
            out.append(matrix[r][left])
    return out
```

### Common mistake

> **Watch out.** The misconception is that the guard is defensive coding for a case that "probably
> cannot happen". It happens on every matrix with an odd `min(rows, cols)` and on every single-row or
> single-column input — and crucially, **the statement's own example does not expose it.**

Dropping `if top == bottom or left == right: continue` gives, measured:

| input | without the guard | correct |
|---|---|---|
| `[[1, 2, 3], [4, 5, 6], [7, 8, 9]]` | `[1, 2, 3, 6, 9, 8, 7, 4, 5]` | same — **passes** |
| `[[1, 2, 3, 4]]` | `[1, 2, 3, 4, 3, 2, 1]` | `[1, 2, 3, 4]` |

Read the second row carefully: seven values from a four-cell matrix. The top run takes `1, 2, 3, 4`,
the right run is empty, and then the bottom run walks the *same single row* back again. The 3 × 3
passes because its final ring is a single **cell**, where the bottom run's `range(right - 1, left - 1, -1)`
happens to be empty — so the bug hides behind exactly the example most people test with.

### Complexity and when to use this

**Time `O(rows · cols)`, space `O(1)`.** Time is one emission per cell: the rings partition the matrix,
so no cell belongs to two layers. Space is six integers, independent of the matrix size.

Use it when you need to address a ring by number — "rotate the image by one ring", "sum the *k*-th
layer", "print only the border" — because `layer` is a first-class handle that the boundary version
does not expose. As a spiral reader it is equal to the final rung in cost and slightly worse in
shape: the four runs each need their bounds adjusted by `±1` in different ways, and those adjustments
are a second place to make a mistake.

---

## Approach 5 — Four shrinking boundaries (optimal) *(from the data file)*

### The idea

*Can the shrinking be carried by the code rather than recomputed from a layer number?* Keep four
numbers — `top`, `bottom`, `left`, `right` — and move each one inward the moment its run is finished.
The loop then continues for as long as the rectangle between them is non-empty.

This fixes Approach 4's weakness: **every ring recomputes its four bounds from `layer`, and each of
the four runs needs its own `±1` correction** to avoid re-reading a corner. Closing a boundary
immediately after its run means the next run's bounds are already correct with no adjustment at all.

### How to think about it

> **Intuition.** Four walls closing in. Walk the top wall left to right and then push the top wall
> down one row — it is finished, and nothing will ever touch it again. Walk the right wall downward
> and push it in a column. Each run is followed by retiring the line it just consumed, so the four
> numbers always describe **exactly the rectangle that is still unread**. The loop condition is then
> the honest question: is that rectangle still non-empty?

> **Why it works.** The two guards are precisely the single-row and single-column tests, and you can
> see why by looking at what the first two runs did. The top run consumes row `top` and then advances
> `top`; if the rectangle had only one row, `top` now exceeds `bottom`, and the bottom run —
> `matrix[bottom][...]` — would walk the row the top run just took. The right run consumes column
> `right` and then retracts `right`; if the rectangle had only one column, `left` now exceeds `right`,
> and the left run would climb the column the right run just took. So `if top <= bottom` means "there
> is still a row I have not used", and `if left <= right` means "there is still a column" — which is
> why a version with the first guard but not the second is still broken on a single **column**, and
> vice versa.

### Worked example

`matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]`. Boundaries start at `top = 0`, `bottom = 2`, `left = 0`,
`right = 2`.

| pass | run | cells emitted | boundary moved | `top, bottom, left, right` after |
|---|---|---|---|---|
| 1 | top row, `c = 0..2` | `1, 2, 3` | `top` → 1 | `1, 2, 0, 2` |
| 1 | right column, `r = 1..2` | `6, 9` | `right` → 1 | `1, 2, 0, 1` |
| 1 | `top <= bottom` (1 ≤ 2) — bottom row, `c = 1..0` | `8, 7` | `bottom` → 1 | `1, 1, 0, 1` |
| 1 | `left <= right` (0 ≤ 1) — left column, `r = 1..1` | `4` | `left` → 1 | `1, 1, 1, 1` |
| 2 | top row, `c = 1..1` | `5` | `top` → 2 | `2, 1, 1, 1` |
| 2 | right column, `r = 2..1` — empty | none | `right` → 0 | `2, 1, 1, 0` |
| 2 | `top <= bottom`? `2 <= 1` is **false** | **skipped** | — | `2, 1, 1, 0` |
| 2 | `left <= right`? `1 <= 0` is **false** | **skipped** | — | `2, 1, 1, 0` |
| 3 | loop condition `top <= bottom` fails | — | — | done |

`out` is `[1, 2, 3, 6, 9, 8, 7, 4, 5]`. Pass 2 is the final ring: a single cell, taken once by the top
run, with both guards refusing to take it again.

The single-row case, for contrast — `matrix = [[1, 2, 3, 4]]`:

| pass | run | emitted | boundary moved | `top, bottom, left, right` after |
|---|---|---|---|---|
| start | — | — | — | `0, 0, 0, 3` |
| 1 | top row, `c = 0..3` | `1, 2, 3, 4` | `top` → 1 | `1, 0, 0, 3` |
| 1 | right column, `r = 1..0` — empty | none | `right` → 2 | `1, 0, 0, 2` |
| 1 | `top <= bottom`? `1 <= 0` is **false** | **skipped** — this is the guard earning its place | — | `1, 0, 0, 2` |
| 1 | `left <= right`? `0 <= 2` is true, but `range(bottom, top - 1, -1)` is `range(0, 0, -1)` — empty | none | `left` → 1 | `1, 0, 1, 2` |
| 2 | loop condition fails | — | — | done |

### Code

```python
def spiral_order_boundaries(matrix: list[list[int]]) -> list[int]:
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    out: list[int] = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            out.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            out.append(matrix[r][right])
        right -= 1
        if top <= bottom:  # a row is still left to walk back along
            for c in range(right, left - 1, -1):
                out.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:  # and a column to climb
            for r in range(bottom, top - 1, -1):
                out.append(matrix[r][left])
            left += 1
    return out
```

### Common mistake

> **Watch out.** The misconception is that the two guards are one guard written twice, so adding the
> first is enough. They are **different tests for different degeneracies**: `top <= bottom` protects
> against a leftover single row, `left <= right` against a leftover single column. Adding only the
> one you thought of leaves the other input broken.

Guarding the bottom run but not the left run gives, measured:

| input | one guard only | correct |
|---|---|---|
| `[[1, 2, 3], [4, 5, 6], [7, 8, 9]]` | `[1, 2, 3, 6, 9, 8, 7, 4, 5]` | same — **passes** |
| `[[1], [2], [3]]` | `[1, 2, 3, 2]` | `[1, 2, 3]` |

Four values from a three-cell matrix: the top run takes `1`, the right run takes `2, 3` — the whole
column — and the unguarded left run then climbs that same column and emits `2` again. The 3 × 3
passes, so a half-fix looks like a whole one right up until a single-column test runs.

The length check catches both halves in one line: the answer must be exactly `rows × cols` long.

### Complexity and when to use this

**Time `O(rows · cols)`, space `O(1)`.** Time is one emission per cell — the four boundaries partition
the matrix into runs that never overlap, so no cell is read twice — and that is optimal, since every
cell must appear in the output. Space is four integers regardless of the matrix's size, which is as
low as it goes.

This is the rung to write. It is the only one that is simultaneously optimal in time, constant in
space, and readable without a recurrence to verify — and its structure, *walk a line then retire it*,
is the same shape used by rotate-image, set-matrix-zeroes' border tricks and matrix-layer problems
generally.

---

## The Overall Arc

Every step on this ladder chases one principle: **stop spending memory to rediscover a shape you
already know.** There is no faster-than-linear answer to find here, and that is the point — the
difficulty is entirely at the boundaries, which makes this a rehearsal for writing loops that are
correct at the edges rather than correct on average. The instinctive answer refuses to think about
geometry at all: take the top row, turn the rest of the matrix a quarter turn so the next side is
facing you, repeat — five lines, no index arithmetic, and a full rebuild of everything that remains
after every single row, which is the price of not thinking. Moving the walker instead of the grid
fixes that, and the walker needs only one rule, go straight until you bump into something and then
turn right; but the things it bumps into are the wall *and its own trail*, so it pays a boolean for
every cell to remember a path that by construction can never cross itself. That trail is the waste
the rest of the ladder removes, and the first way to remove it is to notice that the run lengths are
fixed in advance — `cols`, `rows - 1`, `cols - 1`, `rows - 2`, each one shorter than the run two turns
back — so four integers and a heading replace the whole grid, with the degenerate final ring falling
out as a run of length zero. That version is correct and opaque: a reader cannot check the recurrence
at a glance, so the next move re-states the same geometry in terms anyone can point at on the grid,
indexing rings from the outside in and deriving each ring's four sides from its layer number. And the
last move notices that recomputing bounds per ring forces every run to carry its own `±1` correction,
which is a second place to be wrong — so instead of recomputing, retire each line the moment its run
finishes, and let four numbers always describe exactly the rectangle still unread. Rotate the grid,
mark the trail, count the runs, index the rings, close the walls — and threaded through all five is
the one thing that actually breaks implementations: the final ring may be a single row or a single
column, in which case the top and right runs have already taken it, and a version that walks back
along it does not crash but emits those cells twice, which is why `[[1, 2, 3, 4]]` and `[[1], [2], [3]]`
are the first two tests to write and why the statement's own tidy 3 × 3 is the last input that will
tell you anything.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Peel the top row and rotate the rest | `O(rows · cols · min(rows, cols))` | `O(rows · cols)` | No turns, no indices, no boundary conditions — bought by rebuilding the remainder after every row | The matrix is small and the code is read more than it is run; rotate-image problems |
| A visited grid and four directions | `O(rows · cols)` | `O(rows · cols)` | One simple local rule covers every turn; pays a boolean per cell to record a path that cannot self-cross | The path is **not** a known shape — diagonal scans, flood-fill-shaped walks |
| Walk a known list of run lengths | `O(rows · cols)` | `O(1)` | Constant space and no guards at all; the `runs[-2] - 1` recurrence is correct but not checkable at a glance | You need the *k*-th spiral element without walking the first *k* |
| Peel one ring at a time | `O(rows · cols)` | `O(1)` | Same cost, geometry visible on the grid; each of the four runs carries its own `±1` correction | You need to address a ring by number — rotate a layer, sum a border |
| **Four shrinking boundaries** | `O(rows · cols)` | `O(1)` | Retiring each line as its run finishes means no run needs an adjustment; two guards carry the whole difficulty | The default answer for this problem |

---

## Interview Priority

**Know cold — four shrinking boundaries.** This is the expected answer, and the part being assessed is
not the four loops but the two `if`s between them.

> **In an interview.** Say the hard case before you write it: *"the walk is four runs per ring, but
> the last ring may be a single row or a single column — after the top and right runs there may be
> nothing left to walk back along, so the bottom and left runs each need a guard."* Then write it,
> and when you test, reach for `[[1, 2, 3, 4]]` and `[[1], [2], [3]]` rather than the 3 × 3, and say
> why: the square example passes with the guards missing. The follow-up is usually rotate-image,
> which uses the same retire-a-line-at-a-time shape.

**Know cold — the length invariant.** Not code, a check: the answer must be exactly `rows × cols`
long. It catches every double-emission bug on this problem in one line, and stating it out loud is
how you show you know where the failure lives.

**Understand, do not memorize — the visited grid.** Worth being able to describe in one sentence,
because it is the right tool the moment the path stops being a known shape, and because articulating
*why* it is overkill here — a spiral cannot revisit a cell, so the trail records nothing new — is
exactly the reasoning that produces the boundary version.

**Understand, do not memorize — peel one ring at a time.** Equal in cost to the boundary walk and
genuinely better when a ring needs to be addressed by number. As a spiral reader it distributes the
same difficulty across four `±1` corrections instead of concentrating it in two guards.

**Understand, do not memorize — peel and rotate, and the run-length walk.** One is the instinctive
answer whose cost you should be able to name — a rebuild per row — and the other is the observation
that the spiral's geometry is closed-form. Mention either as a variant; write neither as your answer.

---

## Full Runnable Script

Every approach above, the shared `DIRECTIONS` constant, and a test suite covering the statement's
example, the smallest legal input, a single row, a single column, both rectangular orientations,
repeated values, negatives, an even-sided matrix with no centre cell, the largest allowed 10 × 10, and
40 randomised matrices from 1 × 1 to 10 × 10. Every approach is cross-checked against the visited-grid
rung, which is the brute force here because it follows the path itself rather than deriving it; where
the values are distinct the result is additionally checked to be a real spiral — every cell exactly
once, and every consecutive pair of outputs an orthogonal neighbour. The first rung consumes what it
walks, so every approach is handed its own copy. Every legal matrix has at least one cell, so there is
no no-answer case to test.

```python
"""Read the Matrix in a Spiral - every approach in one file, plus a self-checking test suite.

Run: python spiral_order_all.py
"""

from __future__ import annotations

import random

Matrix = list[list[int]]

DIRECTIONS = ((0, 1), (1, 0), (0, -1), (-1, 0))  # right, down, left, up - in turn order


# --- 1. Peel the top row and rotate the rest -----------------------------------

def spiral_order_peel_and_rotate(matrix: Matrix) -> list[int]:
    rest = [list(row) for row in matrix]  # this rung consumes what it walks
    out: list[int] = []
    while rest:
        out.extend(rest.pop(0))
        # turning the remainder anticlockwise puts the next side on top
        rest = [list(col) for col in zip(*rest)][::-1]
    return out


# --- 2. A visited grid and four directions -------------------------------------

def spiral_order_visited_grid(matrix: Matrix) -> list[int]:
    rows, cols = len(matrix), len(matrix[0])
    seen = [[False] * cols for _ in range(rows)]
    r = c = heading = 0
    out: list[int] = []
    for _ in range(rows * cols):  # exactly one emission per cell
        out.append(matrix[r][c])
        seen[r][c] = True
        dr, dc = DIRECTIONS[heading]
        nr, nc = r + dr, c + dc
        if not (0 <= nr < rows and 0 <= nc < cols) or seen[nr][nc]:
            heading = (heading + 1) % 4
            dr, dc = DIRECTIONS[heading]
            nr, nc = r + dr, c + dc
        r, c = nr, nc
    return out


# --- 3. Walk a known list of run lengths ---------------------------------------

def spiral_order_run_lengths(matrix: Matrix) -> list[int]:
    rows, cols = len(matrix), len(matrix[0])
    runs = [cols, rows - 1]
    while runs[-1] > 0:
        runs.append(runs[-2] - 1)  # each run is one shorter than the one two turns back
    r, c = 0, -1  # just off the left edge, so the first step lands on (0, 0)
    out: list[int] = []
    for turn, run in enumerate(runs):
        dr, dc = DIRECTIONS[turn % 4]
        for _ in range(run):
            r, c = r + dr, c + dc
            out.append(matrix[r][c])
    return out


# --- 4. Peel one ring at a time ------------------------------------------------

def spiral_order_rings(matrix: Matrix) -> list[int]:
    rows, cols = len(matrix), len(matrix[0])
    out: list[int] = []
    for layer in range((min(rows, cols) + 1) // 2):
        top, bottom = layer, rows - 1 - layer
        left, right = layer, cols - 1 - layer
        for c in range(left, right + 1):
            out.append(matrix[top][c])
        for r in range(top + 1, bottom + 1):
            out.append(matrix[r][right])
        if top == bottom or left == right:
            continue  # a one-line ring was already fully read by the two runs above
        for c in range(right - 1, left - 1, -1):
            out.append(matrix[bottom][c])
        for r in range(bottom - 1, top, -1):
            out.append(matrix[r][left])
    return out


# --- 5. Four shrinking boundaries (optimal) ------------------------------------

def spiral_order_boundaries(matrix: Matrix) -> list[int]:
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    out: list[int] = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            out.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            out.append(matrix[r][right])
        right -= 1
        if top <= bottom:  # a row is still left to walk back along
            for c in range(right, left - 1, -1):
                out.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:  # and a column to climb
            for r in range(bottom, top - 1, -1):
                out.append(matrix[r][left])
            left += 1
    return out


APPROACHES = [
    ("peel_and_rotate", spiral_order_peel_and_rotate),
    ("visited_grid", spiral_order_visited_grid),
    ("run_lengths", spiral_order_run_lengths),
    ("rings", spiral_order_rings),
    ("boundaries", spiral_order_boundaries),
]


# --- test scaffolding, not part of any answer ----------------------------------

def is_a_spiral(matrix: Matrix, out: list[int]) -> bool:
    """Every cell exactly once, and every step lands on an orthogonal neighbour.

    Needs distinct values to locate a cell by its value, so callers skip it otherwise.
    """
    rows, cols = len(matrix), len(matrix[0])
    cells = [v for row in matrix for v in row]
    if len(set(cells)) != len(cells):
        return True  # not checkable on this input; the cross-check still applies
    if len(out) != rows * cols or sorted(out) != sorted(cells):
        return False
    where = {matrix[r][c]: (r, c) for r in range(rows) for c in range(cols)}
    for a, b in zip(out, out[1:]):
        (ra, ca), (rb, cb) = where[a], where[b]
        if abs(ra - rb) + abs(ca - cb) != 1:
            return False
    return True


def grid(rows: int, cols: int) -> Matrix:
    """A matrix of distinct ascending values, for the shape check to bite on."""
    return [[r * cols + c + 1 for c in range(cols)] for r in range(rows)]


def main() -> None:
    cases: list[tuple[str, Matrix]] = [
        ("statement example", [[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
        ("smallest legal input", [[7]]),
        ("a single row - breaks a missing bottom guard", [[1, 2, 3, 4]]),
        ("a single column - breaks a missing left guard", [[1], [2], [3]]),
        ("taller than it is wide", [[1, 2], [3, 4], [5, 6]]),
        ("wider than it is tall", [[1, 2, 3, 4], [5, 6, 7, 8]]),
        ("repeated values", [[5, 5], [5, 5]]),
        ("negatives", [[-1, -2, -3], [-4, -5, -6]]),
        ("an even side, so no single centre cell", grid(4, 4)),
        ("the largest allowed matrix", grid(10, 10)),
    ]
    # Every legal matrix has at least one cell, so there is no "no answer" case; the
    # single row and single column above are the inputs that break a missing guard.

    rng = random.Random(20260912)
    for _ in range(40):
        rows, cols = rng.randint(1, 10), rng.randint(1, 10)
        cases.append((f"stress {rows}x{cols}",
                      [[rng.randint(-100, 100) for _ in range(cols)] for _ in range(rows)]))

    width = max(len(name) for name, _ in APPROACHES)
    all_agreed = True

    for label, matrix in cases:
        print(f"\n{label}: {len(matrix)}x{len(matrix[0])}")
        # the visited-grid rung is the brute force: it follows the path rather than deriving it
        expected = spiral_order_visited_grid([row[:] for row in matrix])
        results = []
        for name, fn in APPROACHES:
            got = fn([row[:] for row in matrix])  # a copy each: rung 1 consumes its input
            results.append(got)
            short = got if len(got) <= 12 else got[:12] + ["..."]
            print(f"  {name:<{width}} -> {short}")
        agreed = all(r == expected for r in results)
        shaped = is_a_spiral(matrix, expected)
        if not agreed or not shaped:
            all_agreed = False
            print(f"  DISAGREEMENT (agreed={agreed}, walk is a real spiral={shaped})")

    print(f"\n{len(cases)} cases, {len(APPROACHES)} approaches.")
    print(
        "ALL APPROACHES AGREED ON EVERY CASE."
        if all_agreed
        else "MISMATCH: the approaches did NOT all agree."
    )


if __name__ == "__main__":
    main()
```

