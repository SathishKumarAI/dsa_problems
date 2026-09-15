// word-search — the ladder: every way in, worst first.
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

export const approach = "From every cell matching the first letter, walk the grid depth-first, requiring each step to match the next character. Blank out the current cell before recursing so the path cannot cross itself, then restore it on the way out — that restore is the difference between a path constraint and a global one, and forgetting it is the classic bug here. Success at the end of the word propagates straight back up; failure unwinds and tries the next direction."

export const whyNow = "Enumerating every path of the word's length and then checking it explores enormous numbers of walks that went wrong at the second letter. Matching character by character abandons a path the moment it stops spelling the word, so the search only ever extends prefixes that are still correct."

export const arc = "Two ideas carry this, and the second is where the problem is usually lost. The first is pruning: generating every walk of the word's length and checking it afterwards explores enormous numbers of paths that stopped spelling the word at the second letter, so the match has to happen as you step, killing a branch the instant a character is wrong. The second is the SCOPE of the visited mark. A cell may not be reused within one path, but it must be free again for the next path, so the blank-out before recursing has to be undone on the way back out. The rung above the answer is a warning rather than a step — the same code minus one restore, it reads as correct, and it fails on any board where a path backs out of a dead end and needs a cell it already touched. Read the two line by line. Restoring state on the way out of a branch is the whole of backtracking, and it is the same discipline as n-queens, sudoku and permutations."

export const complexity = { time: "O(rows · cols · 4^L)", space: "O(L)" }

export const python = `def walk(grid: list[list[str]], word: str, r: int, c: int, at: int) -> bool:
    if at == len(word):
        return True
    if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]):
        return False
    if grid[r][c] != word[at]:
        return False
    keep = grid[r][c]
    grid[r][c] = "#"
    found = (
        walk(grid, word, r + 1, c, at + 1)
        or walk(grid, word, r - 1, c, at + 1)
        or walk(grid, word, r, c + 1, at + 1)
        or walk(grid, word, r, c - 1, at + 1)
    )
    grid[r][c] = keep
    return found


def exist(board: list[str], word: str) -> bool:
    grid = [list(row) for row in board]
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if walk(grid, word, r, c, 0):
                return True
    return False`

export const java = `public boolean walk(char[][] grid, String word, int r, int c, int at) {
    if (at == word.length()) return true;
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return false;
    if (grid[r][c] != word.charAt(at)) return false;
    char keep = grid[r][c];
    grid[r][c] = '#';
    boolean found = walk(grid, word, r + 1, c, at + 1)
        || walk(grid, word, r - 1, c, at + 1)
        || walk(grid, word, r, c + 1, at + 1)
        || walk(grid, word, r, c - 1, at + 1);
    grid[r][c] = keep;
    return found;
}

public boolean exist(String[] board, String word) {
    char[][] grid = new char[board.length][];
    for (int r = 0; r < board.length; r++) grid[r] = board[r].toCharArray();
    for (int r = 0; r < grid.length; r++) {
        for (int c = 0; c < grid[0].length; c++) {
            if (walk(grid, word, r, c, 0)) return true;
        }
    }
    return false;
}`

export const cpp = `bool walk(vector<string>& grid, const string& word, int r, int c, int at) {
    if (at == (int)word.size()) return true;
    if (r < 0 || r >= (int)grid.size() || c < 0 || c >= (int)grid[0].size()) return false;
    if (grid[r][c] != word[at]) return false;
    char keep = grid[r][c];
    grid[r][c] = '#';
    bool found = walk(grid, word, r + 1, c, at + 1)
        || walk(grid, word, r - 1, c, at + 1)
        || walk(grid, word, r, c + 1, at + 1)
        || walk(grid, word, r, c - 1, at + 1);
    grid[r][c] = keep;
    return found;
}

bool exist(vector<string> board, const string& word) {
    for (int r = 0; r < (int)board.size(); r++) {
        for (int c = 0; c < (int)board[0].size(); c++) {
            if (walk(board, word, r, c, 0)) return true;
        }
    }
    return false;
}`

export const alternatives: Solution[] = [
  {
    name: "Mark used cells and never unmark",
    summary:
      "The same depth-first walk, but a cell consumed by a failed branch stays consumed. This rung is a WARNING, not a step on the way: it reads almost identically to the correct version and is wrong on any board where a path must back out of a dead end and retry through a cell it already touched. Compare the two line by line — the difference is one restore.",
    complexity: { time: "O(rows · cols · 4^L)", space: "O(L)" },
    python: `def walk_greedy(grid: list[list[str]], word: str, r: int, c: int, at: int) -> bool:
    if at == len(word):
        return True
    if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]):
        return False
    if grid[r][c] != word[at]:
        return False
    grid[r][c] = "#"
    return (
        walk_greedy(grid, word, r + 1, c, at + 1)
        or walk_greedy(grid, word, r - 1, c, at + 1)
        or walk_greedy(grid, word, r, c + 1, at + 1)
        or walk_greedy(grid, word, r, c - 1, at + 1)
    )


def exist(board: list[str], word: str) -> bool:
    grid = [list(row) for row in board]
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if walk_greedy(grid, word, r, c, 0):
                return True
    return False`,
    java: `public boolean walkGreedy(char[][] grid, String word, int r, int c, int at) {
    if (at == word.length()) return true;
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return false;
    if (grid[r][c] != word.charAt(at)) return false;
    grid[r][c] = '#';
    return walkGreedy(grid, word, r + 1, c, at + 1)
        || walkGreedy(grid, word, r - 1, c, at + 1)
        || walkGreedy(grid, word, r, c + 1, at + 1)
        || walkGreedy(grid, word, r, c - 1, at + 1);
}

public boolean exist(String[] board, String word) {
    char[][] grid = new char[board.length][];
    for (int r = 0; r < board.length; r++) grid[r] = board[r].toCharArray();
    for (int r = 0; r < grid.length; r++) {
        for (int c = 0; c < grid[0].length; c++) {
            if (walkGreedy(grid, word, r, c, 0)) return true;
        }
    }
    return false;
}`,
    cpp: `bool walkGreedy(vector<string>& grid, const string& word, int r, int c, int at) {
    if (at == (int)word.size()) return true;
    if (r < 0 || r >= (int)grid.size() || c < 0 || c >= (int)grid[0].size()) return false;
    if (grid[r][c] != word[at]) return false;
    grid[r][c] = '#';
    return walkGreedy(grid, word, r + 1, c, at + 1)
        || walkGreedy(grid, word, r - 1, c, at + 1)
        || walkGreedy(grid, word, r, c + 1, at + 1)
        || walkGreedy(grid, word, r, c - 1, at + 1);
}

bool exist(vector<string> board, const string& word) {
    for (int r = 0; r < (int)board.size(); r++) {
        for (int c = 0; c < (int)board[0].size(); c++) {
            if (walkGreedy(board, word, r, c, 0)) return true;
        }
    }
    return false;
}`,
  },
]
