import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "zero-matrix",
  title: "One Zero Wipes Its Row and Column",
  pattern: "arrays-hashing",
  difficulty: "medium",
  leetcode: "set-matrix-zeroes",
  brief:
    "Every zero in the matrix blanks its whole row and column — done in place.",
  statement:
    "Given a matrix, set the entire row and the entire column of every zero to 0. The wipe is decided by the ORIGINAL matrix, and the classic follow-up asks for it in place with constant extra memory.",
  constraints: [
    "1 <= rows, columns <= 200",
    "-2^31 <= value < 2^31, so no value can be reserved as a private marker",
    "the zeros that trigger a wipe are the ones in the INPUT — a cell blanked by one wipe must not trigger another",
    "wipes overlap freely: one zero can blank a row that another zero's column already crossed",
    "the follow-up asks for O(1) extra memory, which rules out remembering the rows and columns in separate arrays",
  ],
  examples: [
    {
      input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]",
      output: "[[1,0,1],[0,0,0],[1,0,1]]",
      note: "One zero blanks the middle row and the middle column.",
    },
    {
      input: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]",
      output: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]",
      note: "Two zeros in one row; their columns are both wiped.",
    },
    {
      input: "matrix = [[1,0],[1,1]]",
      output: "[[0,0],[1,0]]",
      note: "The trap for an in-place pass: blanking the first row as you go would make the 1 below look like a zero if the sweep is not ordered carefully.",
    },
  ],
  hints: [
    "Writing a zero as soon as you see one destroys the information you still need — the sweep would start reacting to its own output.",
    "So split it in two: first find WHICH rows and columns are doomed, then apply. Two passes, no interference.",
    "For constant memory, store those two lists inside the matrix itself — the first row and the first column are exactly the right shape, as long as you remember separately whether they were doomed to begin with.",
  ],
  whyNow:
    "Two marker arrays are already linear and correct, but they allocate memory proportional to the matrix's sides to hold one bit per row and per column — and the matrix already has a row and a column that can hold exactly that many bits. Moving the marks into the first row and first column makes the extra memory two booleans, and the only price is deciding the fate of that row and column before they are overwritten.",
  arc: "Two ideas, both worth keeping. The first is sequencing: a sweep that writes into the same structure it reads from will start reacting to its own output, so DECIDE in one pass and APPLY in another. That is the whole reason the naive in-place attempt fails, and the same discipline shows up in game-of-life and in any grid update with simultaneous semantics. The second is the space trick: information worth one bit per row and per column does not need arrays of its own when the matrix already contains a row and a column that can hold it. Storing marks inside the input is a genuine O(1) technique, and its price is always the same — the cells doing the storing need their own fate recorded first, which is exactly what the two booleans are for.",
  approach:
    "Read whether the first row and the first column contain a zero of their own, and keep those as two booleans. Then use row 0 as the column marks and column 0 as the row marks: for every inner cell that is zero, blank its row's mark and its column's mark. Apply the marks to the inner cells, then — last, so their marks survive until they are read — blank the first row and the first column if their booleans said so. Two sweeps, constant extra memory.",
  complexity: { time: "O(rows · cols)", space: "O(1)" },
  python: `def zero_matrix(matrix: list[list[int]]) -> list[list[int]]:
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
    return matrix`,
  java: `public int[][] zeroMatrix(int[][] matrix) {
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
}`,
  cpp: `vector<vector<int>> zeroMatrix(vector<vector<int>> matrix) {
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
}`,
  walkthrough: [
    {
      cells: {
        values: [1, 1, 1, 1, 0, 1, 1, 1, 1],
        marks: { 4: "focus" },
        labels: { 4: "the zero" },
      },
      caption:
        "A 3 × 3 matrix read row by row with one zero in the middle. Its row and its column are doomed, but writing them now would hide the original values.",
    },
    {
      cells: {
        values: [1, 0, 1, 0, 0, 1, 1, 1, 1],
        marks: { 1: "compare", 3: "compare" },
        labels: { 1: "col mark", 3: "row mark" },
      },
      caption:
        "First sweep: the zero writes a mark into its row's first cell and its column's first cell. Those two cells are the entire bookkeeping.",
    },
    {
      cells: {
        values: [1, 0, 1, 0, 0, 0, 1, 0, 1],
        marks: { 5: "done", 7: "done" },
      },
      caption:
        "Second sweep over the inner cells: a cell is blanked when its row mark or its column mark is zero. The marks themselves are not touched while they are being read.",
    },
    {
      cells: {
        values: [1, 0, 1, 0, 0, 0, 1, 0, 1],
        marks: { 0: "window", 3: "window" },
        labels: { 0: "flags" },
      },
      caption:
        "Finally the first row and column are handled from the two booleans recorded before anything was overwritten — here neither held an original zero, so they keep their values.",
    },
    {
      cells: {
        values: [1, 0, 1, 1],
        marks: { 1: "focus" },
        labels: { 1: "in row 0" },
      },
      caption:
        "The corner case [[1,0],[1,1]]: the zero IS in the first row, so the mark and the original zero are the same cell — which is why the boolean is read before the sweeps, not after.",
    },
  ],
  alternatives: [
    {
      name: "Write into a copy",
      summary:
        "Build a second matrix. Read the original to decide, write the answer into the copy, and hand the copy back — so nothing ever reacts to its own output.",
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
        "One pass collects the rows and columns that hold a zero; a second pass blanks every cell whose row or column is on those lists. No copy of the matrix.",
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
  ],
}
