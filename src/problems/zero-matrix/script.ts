// zero-matrix — every approach in one file, cross-checked
//
// Converted from docs/deep/zero-matrix_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.

export const scriptNote = `All three approaches in one file, plus the false start kept visibly outside the agreement check.
\`copy_of\` is **harness scaffolding, not an answer**: every approach here mutates its argument, so each
one is handed its own deep copy. Sharing one grid between them would feed approach 2 the answer
approach 1 just wrote, and three approaches would "agree" on garbage.

Tests cover the worked example, all three of the statement's examples, the smallest legal inputs
(\`1 × 1\` with and without a zero), single-row and single-column grids where the margin *is* the whole
grid, a grid with no zeros, a grid of nothing but zeros, overlapping wipes, a zero at the \`(0,0)\`
corner that does the bookkeeping, and 2000 random grids checked against a deliberately obvious
reference. There is no no-valid-answer case — every grid has a well-defined result.`

export const script = `"""One Zero Wipes Its Row and Column - every approach in one file, cross-checked.

Run: python zero_matrix.py
"""

from __future__ import annotations

import random

Matrix = list[list[int]]


def copy_of(matrix: Matrix) -> Matrix:
    """Harness scaffolding, not an answer.

    Every approach here mutates its argument, so each one must be handed its own
    deep copy. row[:] per row is the point: [matrix[0]] * rows would alias ONE
    list and blanking any "row" would blank them all.
    """
    return [row[:] for row in matrix]


def zero_matrix_copy(matrix: Matrix) -> Matrix:
    rows, cols = len(matrix), len(matrix[0])
    out = [row[:] for row in matrix]     # row[:] per row: * rows would alias one list
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
    want = reference(copy_of(matrix))
    # every approach MUTATES its input, so each one gets its own deep copy
    results = [(name, fn(copy_of(matrix))) for name, fn in APPROACHES]
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
    print(f"    false start    -> {zero_matrix_false_start(copy_of(seed))}")
    print(f"    correct        -> {reference(copy_of(seed))}")
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
        want = reference(copy_of(m))
        for name, fn in APPROACHES:
            got = fn(copy_of(m))
            if got != want:
                bad += 1
                ok = False
                print(f"  STRESS DISAGREEMENT {name} on {m}: got {got}, want {want}")
    print(f"stress: 2000 random matrices up to 6x6, all three approaches, {bad} disagreements")

    print()
    print("ALL APPROACHES AGREED ON EVERY CASE." if ok else "APPROACHES DISAGREED - see above.")


if __name__ == "__main__":
    main()`

export const scriptOutput = `\`\`\`
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
\`\`\``
