# One Zero Wipes Its Row and Column — explained

## Understanding the Problem

You are handed a grid of numbers. Wherever a zero sits, its entire row and its entire column are
blanked out — every cell in that row becomes 0, every cell in that column becomes 0. Hand back the
grid after all of that has happened.

The word doing the most work in that description is **all of that has happened**, and it hides the
only real difficulty. The wipes are decided by the grid you were *given*. They all happen at once,
like a simultaneous move in a board game. A cell that turns 0 because some other zero wiped its row
is a *casualty*, not a trigger — it must not go on to wipe its own column.

**The core question: which rows and which columns are doomed?** Once you know those two lists the
answer is one pass of arithmetic. The naive approach is slow — and worse, wrong — because it tries
to answer that question and apply the answer at the same time, in the same grid, so from the second
row onward it is reading zeros it wrote itself.

### The false start, and what it actually returns

This is the instinctive first attempt, and it is worth writing down precisely because it *looks*
right:

```python
for r in range(rows):
    for c in range(cols):
        if matrix[r][c] == 0:
            blank row r
            blank column c
```

Run it on the grid used throughout this document:

```
in       [[1, 2, 3, 4], [5, 0, 7, 8], [9, 1, 2, 3], [0, 4, 5, 6]]
out      [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
correct  [[0, 0, 3, 4], [0, 0, 0, 0], [0, 0, 2, 3], [0, 0, 0, 0]]
```

Every cell is gone. That is not a rounding error, it is a chain reaction: the zero at `(1,1)` blanks
row 1 and column 1, which plants a zero at `(2,1)`, which the sweep meets two steps later and treats
as a real one, which blanks row 2, and so on until the grid is ash. (This run is reproduced by the
script at the bottom of this document, where it is deliberately kept *outside* the agreement check —
it is the bug, not an approach.)

The fix is a discipline, not a trick, and it is the first of the two things this problem teaches:

> **Decide in one pass. Apply in another.** Never let a sweep write into the structure whose contents
> it is still consulting.

Every approach below obeys that rule. They differ only in *where the decision is parked* between the
two passes — in a whole second grid, in two small lists, or inside the input itself.

### The constraints, and what each one unlocks

| Constraint | What it means for you |
|---|---|
| `1 <= rows, columns <= 200` | At most 40 000 cells. Every approach here is O(rows · cols), so time is never the interesting axis on this problem — **space is**. It also means a 1 × 1 grid is legal, and a single-row or single-column grid is legal, which is exactly where the constant-space rung's index juggling is easiest to get wrong. |
| `-2^31 <= value < 2^31` | The full 32-bit range is in play, so **no value can be reserved as a private marker**. This is the constraint that kills the popular "write `-1000000` into doomed cells and sweep for it afterwards" idea: any sentinel you pick might be real data. It is also why the O(1) rung marks with a plain `0` in cells whose *position* carries the meaning, rather than with a magic number. |
| the zeros that trigger a wipe are the ones in the **input** | This is the decide-then-apply rule, stated as a constraint. It is the whole problem. |
| wipes overlap freely | One zero can blank a row that another zero's column already crossed, and a cell can be doomed twice. Nothing needs de-duplicating — "doomed" is a boolean, not a count — which is why a **set** (or a boolean array, or a single marker cell) is the right shape for the bookkeeping and a list of coordinates is not. |
| the follow-up asks for **O(1) extra memory** | **This is the constraint that unlocks the last rung.** It forbids the two marker arrays, and the only place left to put one bit per row and one bit per column is a row and a column of the matrix itself. |

The follow-up is where the real content is. Note the shape of the information being stored: at most
`rows + cols` bits — 400 of them for the largest legal grid — to describe a 40 000-cell answer. Two
marker arrays are already a big win over copying the grid. The last rung notices that the grid
already *contains* a row of length `cols` and a column of length `rows`, which is exactly the storage
needed, and moves the marks in there.

The worked example used in every section below:

```
matrix = [[1, 2, 3, 4],
          [5, 0, 7, 8],
          [9, 1, 2, 3],
          [0, 4, 5, 6]]

answer = [[0, 0, 3, 4],
          [0, 0, 0, 0],
          [0, 0, 2, 3],
          [0, 0, 0, 0]]
```

Two zeros: one at `(1,1)`, in the interior, and one at `(3,0)`, sitting in column 0. So rows 1 and 3
are doomed and columns 0 and 1 are doomed. It was chosen because the zero at `(3,0)` lands in the
very column the last approach wants to use as scratch space — which is where that approach's one
subtlety lives.

---

## Approach 1 — Write the answer into a copy

### The idea

*How do I stop the sweep reacting to its own output?* Give it somewhere else to write. Read every
decision from the original grid, write every zero into a fresh grid of the same size, and hand the
fresh one back. The original is never modified while it is still being consulted, so the chain
reaction has nothing to chain through.

### How to think about it

Think of a photograph and a sheet of tracing paper laid over it. You look only at the photograph and
you draw only on the tracing paper. When you spot a zero in the photograph you black out the
corresponding row and column *on the tracing paper*, and because you never look at the tracing paper,
the marks you make can never be mistaken for something you found. The two-pass discipline is
enforced by physics here rather than by care: the read surface and the write surface are different
objects. That is the safest possible version of decide-then-apply, and it is also the most
expensive, because the tracing paper is as big as the photograph.

### Worked example

`matrix = [[1,2,3,4], [5,0,7,8], [9,1,2,3], [0,4,5,6]]`.

`out` starts as an exact copy. The scan then walks the **original** row by row:

| scan position | original value | action | `out` after |
|---|---|---|---|
| (0,0)…(0,3) | 1, 2, 3, 4 | nothing | `[[1,2,3,4],[5,0,7,8],[9,1,2,3],[0,4,5,6]]` |
| (1,0) | 5 | nothing | unchanged |
| (1,1) | **0** | blank row 1 and column 1 **in `out`** | `[[1,0,3,4],[0,0,0,0],[9,0,2,3],[0,0,5,6]]` |
| (1,2), (1,3) | 7, 8 | nothing — note `out[1][2]` is already 0, but the scan reads the **original** | unchanged |
| (2,0)…(2,3) | 9, 1, 2, 3 | nothing | unchanged |
| (3,0) | **0** | blank row 3 and column 0 **in `out`** | `[[0,0,3,4],[0,0,0,0],[0,0,2,3],[0,0,0,0]]` |
| (3,1)…(3,3) | 4, 5, 6 | nothing | unchanged |

Final: `[[0,0,3,4],[0,0,0,0],[0,0,2,3],[0,0,0,0]]`. ✅

The decisive row of that table is `(1,2)`. By then `out[1][2]` is already 0, but the scan looks at
`matrix[1][2]`, which is still 7, so nothing fires. In the false start the same cell *is* the 0 and
the cascade begins there.

### Code

```python
def zero_matrix_copy(matrix: list[list[int]]) -> list[list[int]]:
    rows, cols = len(matrix), len(matrix[0])
    out = [row[:] for row in matrix]     # row[:] copies each row; [matrix[0]] * rows would alias one row
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == 0:        # the decision ALWAYS reads the original
                for k in range(cols):
                    out[r][k] = 0
                for k in range(rows):
                    out[k][c] = 0
    for r in range(rows):
        matrix[r] = out[r]               # the caller asked for the input to be updated
    return matrix
```

### Common mistake

Writing `if out[r][c] == 0:` instead of `if matrix[r][c] == 0:`. The copy exists, the two passes
look separate, and the whole point has still been thrown away — the scan is once again reading the
surface it is writing to, so the cascade is back with a second grid to pay for. On the worked example
it returns

```
[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
```

which is exactly what the false start returns. Making a copy is not the safety property; *reading
from the one you are not writing to* is. If you find yourself unable to say out loud which of the two
grids each line touches, the bug is already in.

The sibling slip is `out = [matrix[0][:]] * rows`, or `out = [[0] * cols] * rows`. In Python `* rows`
repeats a **reference**, so all four "rows" are the same list, and blanking one blanks all of them.
Use a comprehension or `row[:]` per row.

### Complexity and when to use this

**Time O(rows · cols · (rows + cols)).** Every cell is visited once, and each of the zeros found
costs a full row-blank plus a full column-blank; on a grid that is mostly zeros that inner work
dominates. **Space O(rows · cols)** — a second grid, the same size as the input.

Use it when the problem does *not* demand in-place work and clarity is worth more than memory, or
when the input genuinely must not be modified (a caller still holding a reference to it). It is also
the right thing to write first at a whiteboard: it makes the decide-then-apply rule visible in the
shape of the code, and every later rung is introduced by asking what part of it is waste.

---

## Approach 2 — Two lists of doomed lines

### The idea

*The copy holds 40 000 numbers in order to remember at most 400 facts — can the decision be stored in
its own natural size?* Yes. The only thing the second pass needs is the answer to "is this row
doomed?" and "is this column doomed?". Collect those two sets in one pass, then blank in another.
This fixes the copy's weakness — **it duplicates the whole grid to record information worth one bit
per line.**

### How to think about it

Picture a spreadsheet with a checkbox at the head of every row and every column. Walk the cells once
and every time you meet a zero, tick its row's box and its column's box — you are not editing any
cell yet, only marking margins. Walk the cells a second time and blank any cell whose row box or
column box is ticked. The margins are separate from the data, so nothing you write during the first
pass can be mistaken for data during it; and because "doomed" is a yes/no, ticking a box twice is
harmless, which is why overlapping wipes need no special handling at all.

### Worked example

`matrix = [[1,2,3,4], [5,0,7,8], [9,1,2,3], [0,4,5,6]]`.

**Pass 1 — decide.** Nothing is written to the grid.

| cell | value | `dead_rows` | `dead_cols` |
|---|---|---|---|
| (0,0)…(0,3) | 1,2,3,4 | `{}` | `{}` |
| (1,0) | 5 | `{}` | `{}` |
| **(1,1)** | **0** | `{1}` | `{1}` |
| (1,2)…(2,3) | 7,8,9,1,2,3 | `{1}` | `{1}` |
| **(3,0)** | **0** | `{1, 3}` | `{0, 1}` |
| (3,1)…(3,3) | 4,5,6 | `{1, 3}` | `{0, 1}` |

**Pass 2 — apply.** Blank every cell whose row is in `{1,3}` or whose column is in `{0,1}`:

| row | before | why | after |
|---|---|---|---|
| 0 | `[1, 2, 3, 4]` | columns 0 and 1 are doomed | `[0, 0, 3, 4]` |
| 1 | `[5, 0, 7, 8]` | the whole row is doomed | `[0, 0, 0, 0]` |
| 2 | `[9, 1, 2, 3]` | columns 0 and 1 are doomed | `[0, 0, 2, 3]` |
| 3 | `[0, 4, 5, 6]` | the whole row is doomed | `[0, 0, 0, 0]` |

Final: `[[0,0,3,4],[0,0,0,0],[0,0,2,3],[0,0,0,0]]`. ✅ Same answer as approach 1, with two small sets
instead of a second grid.

### Code

```python
def zero_matrix_marker_lists(matrix: list[list[int]]) -> list[list[int]]:
    rows, cols = len(matrix), len(matrix[0])
    dead_rows: set[int] = set()
    dead_cols: set[int] = set()
    for r in range(rows):                     # pass 1: decide, write nothing
        for c in range(cols):
            if matrix[r][c] == 0:
                dead_rows.add(r)
                dead_cols.add(c)
    for r in range(rows):                     # pass 2: apply, decide nothing
        for c in range(cols):
            if r in dead_rows or c in dead_cols:
                matrix[r][c] = 0
    return matrix
```

### Common mistake

Merging the two loops "to save a pass" — collecting into the sets and blanking in the same nested
walk:

```python
for r in range(rows):
    for c in range(cols):
        if matrix[r][c] == 0:
            dead_rows.add(r); dead_cols.add(c)
        if r in dead_rows or c in dead_cols:   # BUG: applying while still deciding
            matrix[r][c] = 0
```

This does not cascade — the sets are still fed from the original values, so it is not as catastrophic
as the false start — but it applies each verdict *only to the cells it has not yet passed*. A row
discovered doomed at column 3 has columns 0 to 2 already behind the scan and they never get blanked.
On the worked example it returns

```
[[1, 2, 3, 4], [5, 0, 0, 0], [9, 0, 2, 3], [0, 0, 0, 0]]
```

against the correct `[[0,0,3,4],[0,0,0,0],[0,0,2,3],[0,0,0,0]]`. Row 0 is untouched because both
doomed columns were discovered after it, and row 1 keeps its 5 for the same reason. The two passes
are not a stylistic choice; the second one exists to reach backwards.

### Complexity and when to use this

**Time O(rows · cols).** Two flat passes over the grid; unlike approach 1, the blanking is folded
into the second pass rather than repeated per zero, so this is strictly linear in the cell count.
**Space O(rows + cols)** — one bit per line, at most 400 entries for the largest legal input.

This is the answer to give if the follow-up is never asked, and it is the one to reach for under
pressure: it needs no argument beyond "decide, then apply", it has no edge cases, and it is very hard
to get subtly wrong. It also generalises — the same decide-then-apply shape with auxiliary marks is
how you handle game-of-life, flood fills with simultaneous semantics, and any grid update where the
new state is a function of the old one. Know that the next rung exists; write this one if you have
sixty seconds.

---

## Approach 3 — Store the marks in the first row and first column (optimal)

### The idea

*Two arrays of booleans is already small — but the follow-up says O(1) extra memory. Where can
`rows + cols` bits live if not in new memory?* Inside the matrix. Row 0 has exactly `cols` cells and
column 0 has exactly `rows` cells, which is precisely the shape of the two marker arrays. Use
`matrix[0][c]` as "column c is doomed" and `matrix[r][0]` as "row r is doomed". This fixes the
previous rung's only remaining cost — **the `O(rows + cols)` of marker storage** — and its price is
one new obligation: row 0 and column 0 are about to be overwritten with marks, so **their own fate
must be recorded before that happens**, in two booleans.

### How to think about it

The grid has a margin already built into it: its top edge and its left edge. Scribbling the
bookkeeping in the margin costs nothing extra because the margin is part of the page — but whatever
was written in the margin is lost, so you read the margin first and remember, in two words, whether
the margin itself was doomed. From then on the order is forced, and it is the same order in reverse
for reading and writing: the marks are written into the margin, the *interior* is blanked from the
marks, and only when nobody will read the margin again is the margin itself blanked. Every bug in
this approach is a violation of that ordering, not of the idea.

### Worked example

`matrix = [[1,2,3,4], [5,0,7,8], [9,1,2,3], [0,4,5,6]]`.

**Step 0 — record the margin's own fate, before anything is written.**

- Row 0 is `[1, 2, 3, 4]` — no zero. `first_row_zero = False`.
- Column 0 is `1, 5, 9, 0` — there is a zero at `(3,0)`. `first_col_zero = True`.

That second flag is the one this example exists to exercise. The `0` at `(3,0)` is a *real* zero in
the input, and it is sitting in the very column about to be used as scratch space.

**Step 1 — mark, scanning only the interior (`r >= 1`, `c >= 1`).**

| cell | value | marks written |
|---|---|---|
| (1,1) | **0** | `matrix[1][0] = 0` (row 1 doomed), `matrix[0][1] = 0` (column 1 doomed) |
| (1,2), (1,3) | 7, 8 | none |
| (2,1)…(2,3) | 1, 2, 3 | none |
| (3,1)…(3,3) | 4, 5, 6 | none |

The grid is now

```
[[1, 0, 3, 4],      <- matrix[0][1] = 0 is a MARK, not data: "column 1 is doomed"
 [0, 0, 7, 8],      <- matrix[1][0] = 0 is a MARK: "row 1 is doomed"
 [9, 1, 2, 3],
 [0, 4, 5, 6]]      <- matrix[3][0] = 0 was already 0, and it means BOTH things at once
```

Look at `(3,0)`. It is an original zero *and* it now reads as the mark "row 3 is doomed" — which
happens to be true, since a zero in row 3 does doom row 3. That coincidence is not luck, it is the
invariant that makes the trick work: a zero anywhere in row `r` doomed row `r`, so column 0 carrying
an original zero at `r` says the right thing by accident. What it does *not* say is that column 0
itself is doomed — hence the separate `first_col_zero` flag.

**Step 2 — apply to the interior, reading the marks.**

| cell | `matrix[r][0]` | `matrix[0][c]` | blanked? |
|---|---|---|---|
| (1,1) | 0 | 0 | yes |
| (1,2) | 0 | 3 | yes (row mark) |
| (1,3) | 0 | 4 | yes (row mark) |
| (2,1) | 9 | 0 | yes (column mark) |
| (2,2) | 9 | 3 | no |
| (2,3) | 9 | 4 | no |
| (3,1) | **0** | 0 | yes |
| (3,2) | **0** | 3 | yes (row mark — the original zero at (3,0) doing double duty) |
| (3,3) | **0** | 4 | yes |

```
[[1, 0, 3, 4],
 [0, 0, 0, 0],
 [9, 0, 2, 3],
 [0, 0, 0, 0]]
```

**Step 3 — the margin, last, now that nothing will read it again.** `first_row_zero` is False, so row
0 keeps its values. `first_col_zero` is True, so column 0 is blanked:

```
[[0, 0, 3, 4],
 [0, 0, 0, 0],
 [0, 0, 2, 3],
 [0, 0, 0, 0]]
```

✅ — identical to approaches 1 and 2, with two booleans of extra memory.

### Code

```python
def zero_matrix_first_line_marks(matrix: list[list[int]]) -> list[list[int]]:
    rows, cols = len(matrix), len(matrix[0])
    # read the margin's own fate FIRST: the next loop is about to overwrite it
    first_row_zero = any(matrix[0][c] == 0 for c in range(cols))
    first_col_zero = any(matrix[r][0] == 0 for r in range(rows))

    for r in range(1, rows):              # interior only: row 0 and column 0 are now storage
        for c in range(1, cols):
            if matrix[r][c] == 0:
                matrix[r][0] = 0          # this row is doomed
                matrix[0][c] = 0          # so is this column

    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0

    if first_row_zero:                    # last, so the marks survive until they are read
        for c in range(cols):
            matrix[0][c] = 0
    if first_col_zero:
        for r in range(rows):
            matrix[r][0] = 0
    return matrix
```

### Common mistake

Computing the two flags **after** the marking loop instead of before it. The line reads identically,
the variable names are identical, and it is wrong, because by then row 0 and column 0 are full of
marks that were never data. Any interior zero at all now makes at least one of the flags true, and
the margin gets wiped for a reason that does not exist. On the worked example:

```
buggy    [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 2, 3], [0, 0, 0, 0]]
correct  [[0, 0, 3, 4], [0, 0, 0, 0], [0, 0, 2, 3], [0, 0, 0, 0]]
```

Row 0 was destroyed because `matrix[0][1]` had been set to 0 as a *mark* for column 1 — the code read
its own handwriting as evidence. On `[[1,2,3],[4,0,6],[7,8,9]]` the same bug returns
`[[0,0,0],[0,0,0],[0,0,9]]` where the answer is `[[1,0,3],[0,0,0],[7,0,9]]`: two extra lines wiped,
both traceable to a single mark.

The opposite ordering error is just as easy: blanking the margin **before** the interior apply loop.
Then the marks are all zeros by the time the apply loop reads them and the entire grid goes to zero.
And dropping the flags altogether — never blanking the margin at all — silently under-wipes: on the
statement's `[[1,0],[1,1]]` that returns `[[1,0],[1,0]]` instead of `[[0,0],[1,0]]`, because the zero
in row 0 blanked column 1 and was never allowed to blank its own row.

There is one more, quieter than the rest: running the mark loop from `r = 0` or `c = 0`. Then the
margin cells are treated as interior cells, an original zero at `(0,c)` writes a "row 0 is doomed"
mark into `matrix[0][0]`, and `matrix[0][0]` is simultaneously the row-0 mark and the column-0 mark —
one cell, two meanings, which is precisely why the two flags exist and why the loops start at 1.

### Complexity and when to use this

**Time O(rows · cols).** Four passes, all linear in the cell count: two to read the flags (really
`rows + cols`), one to mark, one to apply, and a bounded tidy-up of the margin. **Space O(1)** —
`first_row_zero`, `first_col_zero`, and the loop counters. Nothing allocated scales with the input.

This is the expected answer once the follow-up is asked, which on this problem it always is. Its real
value is transferable rather than local: *information worth one bit per line does not need storage of
its own when the structure already contains a line that can hold it*, and the price of borrowing that
storage is always the same — the borrowed cells need their own state saved before they are
overwritten, and restored after everything has read them. That pattern shows up again in in-place
array marking (negating `nums[abs(x) - 1]` to record "I have seen `x`" in first-missing-positive and
find-all-duplicates) and in cycle-encoding tricks. Recognise the shape and the two booleans stop
feeling like a hack.

---

## The Overall Arc

The principle this problem chases is *separate the reading of a structure from the writing of it, and
then shrink the thing that carries the decision across the gap*. The trouble starts because the
problem's semantics are simultaneous — every wipe is triggered by the grid as it was handed to you —
while a program is unavoidably sequential, so the instinctive single sweep begins consulting zeros it
planted itself and a four-by-four grid collapses to nothing. Fixing that is not an optimisation, it
is the problem: **decide in one pass, apply in another**, and the only design question left is where
the decision waits in between. The first honest answer is a second grid: read the photograph, draw on
the tracing paper, and the two surfaces cannot be confused because they are different objects — safe,
obvious, and 40 000 numbers used to record at most 400 facts. Naming that ratio is what forces the
next step, because the thing actually being remembered is one bit per row and one bit per column, so
two sets of line indices hold it exactly and the grid is touched only twice, once to fill the margins
and once to blank from them. Then the follow-up asks for constant memory and there is nowhere left to
put the marks except the input itself — which turns out to already contain a row of length `cols` and
a column of length `rows`, exactly the two arrays just discarded, sitting unused as storage. Moving
the marks in there costs nothing and buys everything, with one honest debt: those two lines are data
as well as scratch space, so their own fate is read into two booleans before the first mark is
written and applied only after the last mark has been read. That ordering — save the borrowed cells,
mark, apply, restore — is the whole of the final rung, and every bug in it is a line in the wrong
place rather than an idea in the wrong shape. Two habits come out of this. First, whenever an update
rule is phrased in terms of the *original* state, expect to need two passes and say so before writing
a line; game-of-life, simultaneous graph relabelling and double-buffered rendering are the same
question wearing different clothes. Second, when an algorithm needs a small amount of side memory,
check whether the input already contains somewhere to put it — and if it does, remember that
borrowing space is always a loan with interest, and the interest is recording what was there first.

---

## Comparison

| Approach | Time | Space | Core trade-off | Best used when |
|---|---|---|---|---|
| Write into a copy | O(rows · cols · (rows + cols)) | O(rows · cols) | Buys safety with a whole second grid; the read surface and write surface are physically different, so the cascade is impossible by construction | The input must not be modified, or you are establishing the decide-then-apply rule out loud before optimising |
| Two lists of doomed lines | O(rows · cols) | O(rows + cols) | Stores the decision at its natural size — one bit per line — at the cost of two auxiliary containers | In-place is fine but constant space was not demanded; the version to derive under pressure, and the one with no edge cases |
| Marks in the first row and column | O(rows · cols) | O(1) | Borrows storage from the input itself; pays for it by having to save and restore the two borrowed lines in the right order | The follow-up asks for O(1) extra memory — which on this problem it always does |

---

## Interview Priority

**Know cold: the marks-in-the-first-row-and-column version.** This problem is asked *because* of its
follow-up, and an answer that stops at marker arrays is an answer that stops one question early. What
must be automatic is not the code but the ordering, and you should be able to state it before you
write anything: read the two flags, mark from the interior only, apply to the interior only, blank
the margin last. If you can say why the loops start at index 1 — because `matrix[0][0]` would
otherwise have to mean both "row 0 is doomed" and "column 0 is doomed" at once — you have shown the
examiner the actual insight rather than a memorised shape.

**Know cold: the decide-then-apply discipline itself, and the false start it corrects.** Open with
it. "The naive sweep writes into the grid it is reading, so it starts reacting to its own output —
watch it turn this 4 × 4 into all zeros" is thirty seconds that proves you understand the semantics,
and every rung afterwards is then a natural answer to a question you have already framed. The two
marker lists are the honest first implementation of it; they are worth writing quickly and then
improving, not skipping.

**Understand but do not drill: the copy.** Its job is to make the read/write separation obvious and
to be the reference the fast versions are checked against — which is what it does in the script
below. Say it, price its memory against the grid it duplicates, and move on. Worth ten seconds.

One trap worth being able to refuse out loud: marking doomed cells with a sentinel value such as
`-10**9` and sweeping for it afterwards. It is a tempting O(1) answer and the constraints forbid it,
because values span the full 32-bit range and any sentinel might be genuine data. Saying that
unprompted is worth more than most of the code.

---

## Full Runnable Script

All three approaches in one file, plus the false start kept visibly outside the agreement check. The
tests cover the document's worked example, all three of the statement's examples, the smallest legal
inputs (1 × 1 with and without a zero), single-row and single-column grids where the margin *is* the
whole grid, a grid with no zeros, a grid of nothing but zeros, overlapping wipes, a zero at the
`(0,0)` corner that does the bookkeeping, and 2000 random grids cross-checked against a
deliberately-obvious reference.

Note the harness rule this problem forces: **every approach mutates its input**, so each one is
handed its own deep copy. Sharing one grid between them would feed approach 2 the answer approach 1
just wrote, and three approaches would "agree" on garbage.

There is no no-valid-answer case: every grid has a well-defined result, including the empty-ish ones.

```python
"""One Zero Wipes Its Row and Column - every approach in one file, cross-checked.

Run: python zero_matrix.py
"""

from __future__ import annotations

import random

Matrix = list[list[int]]


def zero_matrix_copy(matrix: Matrix) -> Matrix:
    rows, cols = len(matrix), len(matrix[0])
    out = [row[:] for row in matrix]
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == 0:          # the decision always reads the ORIGINAL
                for k in range(cols):
                    out[r][k] = 0
                for k in range(rows):
                    out[k][c] = 0
    for r in range(rows):
        matrix[r] = out[r]
    return matrix


def zero_matrix_marker_lists(matrix: Matrix) -> Matrix:
    rows, cols = len(matrix), len(matrix[0])
    dead_rows: set[int] = set()
    dead_cols: set[int] = set()
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == 0:
                dead_rows.add(r)
                dead_cols.add(c)
    for r in range(rows):
        for c in range(cols):
            if r in dead_rows or c in dead_cols:
                matrix[r][c] = 0
    return matrix


def zero_matrix_first_line_marks(matrix: Matrix) -> Matrix:
    rows, cols = len(matrix), len(matrix[0])
    first_row_zero = any(matrix[0][c] == 0 for c in range(cols))
    first_col_zero = any(matrix[r][0] == 0 for r in range(rows))

    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][c] == 0:
                matrix[r][0] = 0      # this row is doomed
                matrix[0][c] = 0      # so is this column

    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0

    if first_row_zero:                 # last, so the marks survive until they are read
        for c in range(cols):
            matrix[0][c] = 0
    if first_col_zero:
        for r in range(rows):
            matrix[r][0] = 0
    return matrix


def zero_matrix_false_start(matrix: Matrix) -> Matrix:
    """NOT an approach - the wrong answer this problem is built to punish.

    It wipes as it reads, so from the second row on it is reacting to zeros it
    wrote itself. Kept here, outside APPROACHES, so its damage is visible.
    """
    rows, cols = len(matrix), len(matrix[0])
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == 0:
                for k in range(cols):
                    matrix[r][k] = 0
                for k in range(rows):
                    matrix[k][c] = 0
    return matrix


def reference(matrix: Matrix) -> Matrix:
    """Deliberately slow and obvious: build the answer from scratch."""
    rows, cols = len(matrix), len(matrix[0])
    dead_rows = {r for r in range(rows) if any(matrix[r][c] == 0 for c in range(cols))}
    dead_cols = {c for c in range(cols) if any(matrix[r][c] == 0 for r in range(rows))}
    return [
        [0 if r in dead_rows or c in dead_cols else matrix[r][c] for c in range(cols)]
        for r in range(rows)
    ]


APPROACHES = [
    ("copy", zero_matrix_copy),
    ("marker lists", zero_matrix_marker_lists),
    ("first row/col", zero_matrix_first_line_marks),
]


def run_case(label: str, matrix: Matrix) -> bool:
    want = reference([row[:] for row in matrix])
    # every approach MUTATES its input, so each one gets its own deep copy
    results = [(name, fn([row[:] for row in matrix])) for name, fn in APPROACHES]
    agree = all(got == want for _, got in results)
    print(label)
    print(f"  in      {matrix}")
    for name, got in results:
        print(f"    {name:<14} -> {got}")
    print(f"    all agree with reference: {agree}")
    return agree


def main() -> None:
    ok = True

    # The false start, shown failing. It is deliberately NOT in APPROACHES: it is
    # the bug the whole problem is about, and the harness would be lying if a
    # cross-check it cannot pass were counted as agreement.
    seed = [[1, 2, 3, 4], [5, 0, 7, 8], [9, 1, 2, 3], [0, 4, 5, 6]]
    print("the false start (wipes while it reads) - excluded from the agreement check")
    print(f"  in      {seed}")
    print(f"    false start    -> {zero_matrix_false_start([row[:] for row in seed])}")
    print(f"    correct        -> {reference([row[:] for row in seed])}")
    print()

    # the worked example used in every section of the document
    ok &= run_case("the document's worked example", [[1, 2, 3, 4], [5, 0, 7, 8], [9, 1, 2, 3], [0, 4, 5, 6]])

    ok &= run_case("example 1 from the statement", [[1, 1, 1], [1, 0, 1], [1, 1, 1]])
    ok &= run_case("example 2 (zeros in row 0 and col 0)", [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]])
    ok &= run_case("example 3 (the in-place trap)", [[1, 0], [1, 1]])

    ok &= run_case("smallest legal input, no zero", [[7]])
    ok &= run_case("smallest legal input, one zero", [[0]])

    ok &= run_case("single row", [[1, 0, 3, 4]])
    ok &= run_case("single column", [[1], [0], [3]])

    ok &= run_case("no zeros at all", [[1, 2], [3, 4]])
    ok &= run_case("all zeros", [[0, 0], [0, 0]])

    # duplicates: two zeros sharing a row, and overlapping wipes
    ok &= run_case("overlapping wipes", [[1, 0, 3], [0, 5, 6], [7, 8, 9]])
    # the only zero sits at the corner that does the bookkeeping
    ok &= run_case("zero at (0,0)", [[0, 2, 3], [4, 5, 6], [7, 8, 9]])
    # a zero in the interior, so the marks are actually written
    ok &= run_case("interior zero only", [[1, 2, 3], [4, 0, 6], [7, 8, 9]])

    random.seed(7)
    bad = 0
    for _ in range(2000):
        rows = random.randint(1, 6)
        cols = random.randint(1, 6)
        # ~25% zeros so wipes are common but not total
        m = [[0 if random.random() < 0.25 else random.randint(1, 9) for _ in range(cols)]
             for _ in range(rows)]
        want = reference([row[:] for row in m])
        for name, fn in APPROACHES:
            got = fn([row[:] for row in m])
            if got != want:
                bad += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} on {m}: got {got}, want {want}")
    print(f"stress: 2000 random matrices up to 6x6, all three approaches, {bad} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()
```

### Output when run

```
the false start (wipes while it reads) - excluded from the agreement check
  in      [[1, 2, 3, 4], [5, 0, 7, 8], [9, 1, 2, 3], [0, 4, 5, 6]]
    false start    -> [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    correct        -> [[0, 0, 3, 4], [0, 0, 0, 0], [0, 0, 2, 3], [0, 0, 0, 0]]

the document's worked example
  in      [[1, 2, 3, 4], [5, 0, 7, 8], [9, 1, 2, 3], [0, 4, 5, 6]]
    copy           -> [[0, 0, 3, 4], [0, 0, 0, 0], [0, 0, 2, 3], [0, 0, 0, 0]]
    marker lists   -> [[0, 0, 3, 4], [0, 0, 0, 0], [0, 0, 2, 3], [0, 0, 0, 0]]
    first row/col  -> [[0, 0, 3, 4], [0, 0, 0, 0], [0, 0, 2, 3], [0, 0, 0, 0]]
    all agree with reference: True
example 1 from the statement
  in      [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
    copy           -> [[1, 0, 1], [0, 0, 0], [1, 0, 1]]
    marker lists   -> [[1, 0, 1], [0, 0, 0], [1, 0, 1]]
    first row/col  -> [[1, 0, 1], [0, 0, 0], [1, 0, 1]]
    all agree with reference: True
example 2 (zeros in row 0 and col 0)
  in      [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]
    copy           -> [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]
    marker lists   -> [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]
    first row/col  -> [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]
    all agree with reference: True
example 3 (the in-place trap)
  in      [[1, 0], [1, 1]]
    copy           -> [[0, 0], [1, 0]]
    marker lists   -> [[0, 0], [1, 0]]
    first row/col  -> [[0, 0], [1, 0]]
    all agree with reference: True
smallest legal input, no zero
  in      [[7]]
    copy           -> [[7]]
    marker lists   -> [[7]]
    first row/col  -> [[7]]
    all agree with reference: True
smallest legal input, one zero
  in      [[0]]
    copy           -> [[0]]
    marker lists   -> [[0]]
    first row/col  -> [[0]]
    all agree with reference: True
single row
  in      [[1, 0, 3, 4]]
    copy           -> [[0, 0, 0, 0]]
    marker lists   -> [[0, 0, 0, 0]]
    first row/col  -> [[0, 0, 0, 0]]
    all agree with reference: True
single column
  in      [[1], [0], [3]]
    copy           -> [[0], [0], [0]]
    marker lists   -> [[0], [0], [0]]
    first row/col  -> [[0], [0], [0]]
    all agree with reference: True
no zeros at all
  in      [[1, 2], [3, 4]]
    copy           -> [[1, 2], [3, 4]]
    marker lists   -> [[1, 2], [3, 4]]
    first row/col  -> [[1, 2], [3, 4]]
    all agree with reference: True
all zeros
  in      [[0, 0], [0, 0]]
    copy           -> [[0, 0], [0, 0]]
    marker lists   -> [[0, 0], [0, 0]]
    first row/col  -> [[0, 0], [0, 0]]
    all agree with reference: True
overlapping wipes
  in      [[1, 0, 3], [0, 5, 6], [7, 8, 9]]
    copy           -> [[0, 0, 0], [0, 0, 0], [0, 0, 9]]
    marker lists   -> [[0, 0, 0], [0, 0, 0], [0, 0, 9]]
    first row/col  -> [[0, 0, 0], [0, 0, 0], [0, 0, 9]]
    all agree with reference: True
zero at (0,0)
  in      [[0, 2, 3], [4, 5, 6], [7, 8, 9]]
    copy           -> [[0, 0, 0], [0, 5, 6], [0, 8, 9]]
    marker lists   -> [[0, 0, 0], [0, 5, 6], [0, 8, 9]]
    first row/col  -> [[0, 0, 0], [0, 5, 6], [0, 8, 9]]
    all agree with reference: True
interior zero only
  in      [[1, 2, 3], [4, 0, 6], [7, 8, 9]]
    copy           -> [[1, 0, 3], [0, 0, 0], [7, 0, 9]]
    marker lists   -> [[1, 0, 3], [0, 0, 0], [7, 0, 9]]
    first row/col  -> [[1, 0, 3], [0, 0, 0], [7, 0, 9]]
    all agree with reference: True
stress: 2000 random matrices up to 6x6, all three approaches, 0 disagreements

ALL APPROACHES AGREED ON EVERY CASE.
```
