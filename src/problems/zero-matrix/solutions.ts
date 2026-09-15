// zero-matrix — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The KEYS on
// `alternatives` are load-bearing where a journey exists: `lib/ladder.ts`
// merges an alternative with the act that shares its key, and `from:` in the
// journey must then name that key rather than an array index.
//
// Two arcs, and they are not duplicates. The one here is the short paragraph
// the PROBLEM page renders under the ladder; `arc.ts` holds the long one the
// teaching document ends on. Changing either does not oblige the other.

import type { Solution } from "../../data/types.ts"

export const approach = "Read whether the first row and the first column contain a zero of their own, and keep those as two booleans. Then use row 0 as the column marks and column 0 as the row marks: for every inner cell that is zero, blank its row's mark and its column's mark. Apply the marks to the inner cells, then — last, so their marks survive until they are read — blank the first row and the first column if their booleans said so. Two sweeps, constant extra memory."

export const whyNow = "Two marker arrays are already linear and correct, but they allocate memory proportional to the matrix's sides to hold one bit per row and per column — and the matrix already has a row and a column that can hold exactly that many bits. Moving the marks into the first row and first column makes the extra memory two booleans, and the only price is deciding the fate of that row and column before they are overwritten."

export const arc = "Two ideas, both worth keeping. The first is sequencing: a sweep that writes into the same structure it reads from will start reacting to its own output, so DECIDE in one pass and APPLY in another. That is the whole reason the naive in-place attempt fails, and the same discipline shows up in game-of-life and in any grid update with simultaneous semantics. The second is the space trick: information worth one bit per row and per column does not need arrays of its own when the matrix already contains a row and a column that can hold it. Storing marks inside the input is a genuine O(1) technique, and its price is always the same — the cells doing the storing need their own fate recorded first, which is exactly what the two booleans are for."

export const complexity = { time: "O(rows · cols)", space: "O(1)" }

export const python = `def zero_matrix(matrix: list[list[int]]) -> list[list[int]]:
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

    if first_row_zero:
        for c in range(cols):
            matrix[0][c] = 0
    if first_col_zero:
        for r in range(rows):
            matrix[r][0] = 0
    return matrix`

export const java = `public int[][] zeroMatrix(int[][] matrix) {
    int rows = matrix.length, cols = matrix[0].length;
    boolean firstRowZero = false, firstColZero = false;
    for (int c = 0; c < cols; c++) if (matrix[0][c] == 0) firstRowZero = true;
    for (int r = 0; r < rows; r++) if (matrix[r][0] == 0) firstColZero = true;
    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            if (matrix[r][c] == 0) {
                matrix[r][0] = 0;
                matrix[0][c] = 0;
            }
    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;
    if (firstRowZero) for (int c = 0; c < cols; c++) matrix[0][c] = 0;
    if (firstColZero) for (int r = 0; r < rows; r++) matrix[r][0] = 0;
    return matrix;
}`

export const cpp = `vector<vector<int>> zeroMatrix(vector<vector<int>> matrix) {
    int rows = (int)matrix.size(), cols = (int)matrix[0].size();
    bool firstRowZero = false, firstColZero = false;
    for (int c = 0; c < cols; c++) if (matrix[0][c] == 0) firstRowZero = true;
    for (int r = 0; r < rows; r++) if (matrix[r][0] == 0) firstColZero = true;
    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            if (matrix[r][c] == 0) {
                matrix[r][0] = 0;
                matrix[0][c] = 0;
            }
    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;
    if (firstRowZero) for (int c = 0; c < cols; c++) matrix[0][c] = 0;
    if (firstColZero) for (int r = 0; r < rows; r++) matrix[r][0] = 0;
    return matrix;
}`

export const alternatives: Solution[] = [
  {
    name: "Write into a copy",
    summary:
      "Build a second matrix: read the original to decide, write into the copy, hand the copy back. This is the rung that names the actual hazard — every later approach writes zeros into the grid it is still reading, so a cell blanked early would be mistaken for an original zero and wipe a row that was never doomed.",
    complexity: { time: "O(rows · cols)", space: "O(rows · cols)" },
    python: `def zero_matrix(matrix: list[list[int]]) -> list[list[int]]:
    rows, cols = len(matrix), len(matrix[0])
    out = [row[:] for row in matrix]
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == 0:
                for k in range(cols):
                    out[r][k] = 0
                for k in range(rows):
                    out[k][c] = 0
    for r in range(rows):
        matrix[r] = out[r]
    return matrix`,
    java: `public int[][] zeroMatrix(int[][] matrix) {
    int rows = matrix.length, cols = matrix[0].length;
    int[][] out = new int[rows][cols];
    for (int r = 0; r < rows; r++) out[r] = matrix[r].clone();
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (matrix[r][c] == 0) {
                for (int k = 0; k < cols; k++) out[r][k] = 0;
                for (int k = 0; k < rows; k++) out[k][c] = 0;
            }
    for (int r = 0; r < rows; r++) matrix[r] = out[r];
    return matrix;
}`,
    cpp: `vector<vector<int>> zeroMatrix(vector<vector<int>> matrix) {
    int rows = (int)matrix.size(), cols = (int)matrix[0].size();
    vector<vector<int>> out = matrix;
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (matrix[r][c] == 0) {
                for (int k = 0; k < cols; k++) out[r][k] = 0;
                for (int k = 0; k < rows; k++) out[k][c] = 0;
            }
    return out;
}`,
  },
  {
    name: "Two lists of doomed lines",
    summary:
      "One pass collects the rows and columns holding a zero; a second blanks every cell on those lists. The full copy is gone and the hazard with it, and what remains is rows + cols of bookkeeping — two lists the matrix could store in its own first row and column.",
    complexity: { time: "O(rows · cols)", space: "O(rows + cols)" },
    whyNow:
      "The copy doubles the memory to hold information worth one bit per row and per column — a 200 × 200 matrix duplicates 40 000 values to remember at most 400 facts. Which rows and columns are doomed is all the second pass needs.",
    python: `def zero_matrix(matrix: list[list[int]]) -> list[list[int]]:
    rows, cols = len(matrix), len(matrix[0])
    dead_rows = set()
    dead_cols = set()
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == 0:
                dead_rows.add(r)
                dead_cols.add(c)
    for r in range(rows):
        for c in range(cols):
            if r in dead_rows or c in dead_cols:
                matrix[r][c] = 0
    return matrix`,
    java: `public int[][] zeroMatrix(int[][] matrix) {
    int rows = matrix.length, cols = matrix[0].length;
    boolean[] deadRows = new boolean[rows];
    boolean[] deadCols = new boolean[cols];
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (matrix[r][c] == 0) {
                deadRows[r] = true;
                deadCols[c] = true;
            }
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (deadRows[r] || deadCols[c]) matrix[r][c] = 0;
    return matrix;
}`,
    cpp: `vector<vector<int>> zeroMatrix(vector<vector<int>> matrix) {
    int rows = (int)matrix.size(), cols = (int)matrix[0].size();
    vector<bool> deadRows(rows, false), deadCols(cols, false);
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (matrix[r][c] == 0) {
                deadRows[r] = true;
                deadCols[c] = true;
            }
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (deadRows[r] || deadCols[c]) matrix[r][c] = 0;
    return matrix;
}`,
  },
]
