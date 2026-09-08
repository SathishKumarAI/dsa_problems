// Inputs for the differential runner (B27). Inputs only — never expected
// outputs, because the repo's own Python computes those. Hand-writing
// expectations is how a test ends up asserting the bug.
//
// `params` names the shape of each argument so the driver can emit it as a
// literal in three languages. `ret` names the shape coming back so results can
// be compared as text. `unordered` marks answers where order is not part of
// the answer (a set of triples, the k closest points) and both sides get
// sorted before the comparison.
//
// Cases lean on the corner cases the journeys teach: smallest legal input,
// duplicates, negatives, a broken promise, the answer at an extreme.

/** @type {Record<string, {params: string[], ret: string, unordered?: boolean, cases: unknown[][]}>} */
export const VECTORS = {
  "contains-duplicate": {
    params: ["int[]"],
    ret: "bool",
    exercises:
      "the early return on a repeat — [1,1] repeats at the second element, [1,2,3,4] never does",
    cases: [[[1, 2, 3, 1]], [[1, 2, 3, 4]], [[1]], [[1, 1]], [[-1, 0, -1, 5]]],
  },
  "valid-anagram": {
    params: ["string", "string"],
    ret: "bool",
    exercises:
      "counts, not membership — ['aab','abb'] uses the same letters in different numbers",
    cases: [
      // a loop that stops one short still matches every other letter
      ["mab", "abm"],
      ["anagram", "nagaram"],
      ["rat", "car"],
      ["a", "a"],
      ["ab", "abc"],
      ["aab", "abb"],
    ],
  },
  "product-except-self": {
    params: ["int[]"],
    ret: "int[]",
    exercises:
      "the zero, which is why division is banned — one zero ([-1,1,0,-3,3]) and two ([0,0,4])",
    cases: [
      [[1, 2, 3, 4]],
      [[-1, 1, 0, -3, 3]],
      [[2, 3]],
      [[0, 0, 4]],
      [[-2, -3, -4]],
    ],
  },
  "valid-palindrome": {
    params: ["string"],
    ret: "bool",
    exercises:
      "skipping non-alphanumerics without comparing them — ' ' is all skip, '0P' is the case-folding trap",
    cases: [
      ["A man, a plan, a canal: Panama"],
      ["race a car"],
      [" "],
      ["ab, BA"],
      ["0P"],
    ],
  },
  "trap-rain-water": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "a dip bounded on BOTH sides — [4,2,0,3,2,5]; the monotonic runs trap nothing",
    cases: [
      [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]],
      [[4, 2, 0, 3, 2, 5]],
      [[3]],
      [[1, 2, 3, 4]],
      [[5, 4, 1, 2]],
    ],
  },
  "char-replacement": {
    params: ["string", "int"],
    ret: "int",
    exercises:
      "a window that must SHRINK — ['AABABBA',1] forces the left edge to move; k=0 never lets it grow",
    cases: [
      ["AABABBA", 1],
      ["ABBB", 2],
      ["A", 0],
      ["ABAB", 0],
      ["AAAA", 2],
    ],
  },
  "rpn-eval": {
    params: ["string[]"],
    ret: "int",
    exercises:
      "operand order on a non-commutative operator, and truncation toward zero — ['-7','2','/'] is -3, not -4",
    cases: [
      [["2", "1", "+", "3", "*"]],
      [["4", "13", "5", "/", "+"]],
      [["7"]],
      [["-7", "2", "/"]],
      [["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]],
    ],
  },
  "search-2d-matrix": {
    params: ["int[][]", "int"],
    ret: "bool",
    exercises:
      "a midpoint that lands in a different ROW than the target — the 3x4 cases cross rows twice",
    cases: [
      [
        [
          [1, 3, 5, 7],
          [10, 11, 16, 20],
          [23, 30, 34, 60],
        ],
        3,
      ],
      [
        [
          [1, 3, 5, 7],
          [10, 11, 16, 20],
          [23, 30, 34, 60],
        ],
        13,
      ],
      [[[1]], 1],
      [[[1]], 2],
      [
        [
          [1, 2],
          [3, 4],
        ],
        4,
      ],
    ],
  },
  "last-stone-weight": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "the heap reordering after a smash pushes a remainder back — [10,4,2,10] destroys a pair first",
    cases: [[[2, 7, 4, 1, 8, 1]], [[1]], [[3, 3]], [[10, 4, 2, 10]], [[1, 3]]],
  },
  "max-island-area": {
    params: ["int[][]"],
    ret: "int",
    exercises:
      "a fill that must walk UP to finish an island — [[1,0,1],[1,1,1]]; diagonals stay separate",
    cases: [
      // a U: the right arm is reachable only by walking UP
      [
        [
          [1, 0, 1],
          [1, 1, 1],
        ],
      ],
      // an island reached only by walking LEFT, so a dropped -1 loses a cell
      [
        [
          [1, 0, 1],
          [0, 1, 1],
          [1, 0, 1],
        ],
      ],
      [
        [
          [1, 1, 0],
          [1, 0, 0],
          [0, 0, 1],
        ],
      ],
      [
        [
          [0, 0],
          [0, 0],
        ],
      ],
      [[[1]]],
      [
        [
          [1, 0, 1],
          [0, 1, 0],
          [1, 0, 1],
        ],
      ],
      [
        [
          [1, 1],
          [1, 1],
        ],
      ],
    ],
  },
  "longest-increasing-run": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "a tail being REPLACED rather than appended — [10,9,2,5,3,7,101,18] replaces four times",
    cases: [
      [[10, 9, 2, 5, 3, 7, 101, 18]],
      [[7, 7, 7]],
      [[4]],
      [[1, 2, 3, 4, 5]],
      [[5, 4, 3, 2, 1]],
    ],
  },
  "pair-sum": {
    params: ["int[]", "int"],
    ret: "int[]",
    exercises:
      "the complement arriving before its partner is stored — [3,3] needs the map, [3,1,3,8] has a decoy",
    cases: [
      [[2, 7, 11, 15], 9],
      [[3, 2, 4], 6],
      [[3, 3], 6],
      [[3, 1, 3, 8], 6],
      [[-3, 4, 3, 90], 0],
    ],
  },
  "top-k-frequent": {
    params: ["int[]", "int"],
    ret: "int[]",
    exercises:
      "a tie in frequency and a k that excludes something — [4,4,4,5,5,6,6,6,6] with k=2",
    unordered: true,
    cases: [
      [[1, 1, 1, 2, 2, 3], 2],
      [[1], 1],
      [[4, 4, 4, 5, 5, 6, 6, 6, 6], 2],
    ],
  },
  "longest-consecutive-run": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "a run that must be found from its START, not from any member — [100,4,200,1,3,2]",
    cases: [[[100, 4, 200, 1, 3, 2]], [[]], [[1, 2, 0, 1]], [[-5, -4, -3, 9]]],
  },
  "single-number": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "the loner in first, last and only position — [2,2,1], [0,4,4], [7]",
    cases: [[[2, 2, 1]], [[7]], [[0, 4, 4]], [[1, 1, 2, 2, 9]]],
  },
  "sorted-pair-sum": {
    params: ["int[]", "int"],
    ret: "int[]",
    exercises:
      "the pointers converging from both ends, and refusing to reuse one element — [[2],4] returns []",
    cases: [
      // pointers meeting on one element: `i <= j` would return [0, 0],
      // using the same element twice
      [[2], 4],
      [[1, 3, 6, 9], 12],
      [[2, 7, 11, 15], 9],
      [[1, 2], 3],
      [[-5, -2, 0, 2, 7], 0],
    ],
  },
  "container-water": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "the shorter wall deciding which pointer moves, including on a tie — [4,4,4,4]",
    cases: [
      [[1, 8, 6, 2, 5, 4, 8, 3, 7]],
      [[1, 1]],
      [[4, 4, 4, 4]],
      [[0, 2, 0]],
      [[1, 2, 4, 3]],
    ],
  },
  "three-sum-zero": {
    params: ["int[]"],
    ret: "int[][]",
    exercises:
      "duplicate triples that must be collapsed — [0,0,0,0,0] and [-1,0,1,2,-1,-4]",
    unordered: true,
    cases: [
      // the inner pointer must start AFTER k, or k pairs with itself
      [[-1, 0, 1, 2, -4]],
      // exactly three elements: an outer loop one short finds nothing
      [[0, 0, 0]],
      // five zeros: a dedup walk that steps the wrong way runs off the end
      [[0, 0, 0, 0, 0]],
      [[-1, 0, 1, 2, -1, -4]],
      [[0, 0, 0, 0]],
      [[1, 2, 3]],
      [[-2, 0, 1, 1, 2]],
    ],
  },
  "best-trade": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "the minimum arriving AFTER a higher price — [7,1,5,3,6,4]; a falling series trades nothing",
    cases: [[[7, 1, 5, 3, 6, 4]], [[7, 6, 4, 3, 1]], [[2]], [[1, 2]]],
  },
  "longest-unique-substring": {
    params: ["string"],
    ret: "int",
    exercises:
      "the left edge jumping past a repeat rather than stepping — 'abcabcbb', 'pwwkew'",
    cases: [["abcabcbb"], ["bbbbb"], [""], ["pwwkew"], ["dvdf"]],
  },
  "min-cover-substring": {
    params: ["string", "string"],
    ret: "string",
    exercises:
      "ties on window length, where the FIRST shortest must win — 'ADOAECODEBANC' with 'EBC'",
    cases: [
      // ties on window length: `<=` would keep the LATER window
      ["ADOAECODEBANC", "EBC"],
      // the +1 in the width is load-bearing on both sides
      ["ADOBECODEBAN", "AEC"],
      ["ANOBECODEBANC", "BC"],
      ["ADOBECODEBANC", "ABC"],
      ["a", "a"],
      ["a", "aa"],
      ["aa", "aa"],
    ],
  },
  "balanced-brackets": {
    params: ["string"],
    ret: "bool",
    exercises:
      "a mismatch of the right shape but wrong kind, and a close with nothing open — '(]', ']'",
    cases: [["()"], ["()[]{}"], ["(]"], ["([)]"], ["{[]}"], ["]"]],
  },
  "daily-warmer": {
    params: ["int[]"],
    ret: "int[]",
    exercises:
      "equal temperatures, which are NOT warmer — [50,40,30,30] answers all zeros",
    cases: [
      // equal temperatures are NOT warmer — a `<=` pop answers 1 here
      [[50, 40, 30, 30]],
      [[73, 74, 75, 71, 69, 72, 76, 73]],
      [[30, 40, 50, 60]],
      [[30]],
      [[50, 40, 30]],
    ],
  },
  "largest-rectangle": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "a bar whose rectangle extends past its neighbours on both sides — [2,1,5,6,2,3]",
    cases: [
      [[2, 1, 5, 6, 2, 3]],
      [[2, 4]],
      [[0]],
      [[5, 5, 5]],
      [[6, 5, 4, 3, 2, 1]],
    ],
  },
  "classic-binary-search": {
    params: ["int[]", "int"],
    ret: "int",
    exercises:
      "a target past both ends of the array — [[3],5] would read off the end if hi started at n",
    cases: [
      // hi must start at n-1: a target past the end reads off the array
      [[3], 5],
      [[-1, 0, 3, 5, 9, 12], 9],
      [[-1, 0, 3, 5, 9, 12], 2],
      [[5], 5],
      [[5], -5],
    ],
  },
  "rotated-minimum": {
    params: ["int[]"],
    ret: "int",
    exercises: "the pivot, with a duplicate straddling it — [3,4,5,1,2,2]",
    cases: [
      // duplicate at the pivot boundary, where `>` and `>=` diverge
      [[3, 4, 5, 1, 2, 2]],
      [[3, 4, 5, 1, 2]],
      [[4, 5, 6, 7, 0, 1, 2]],
      [[11, 13, 15, 17]],
      [[2, 1]],
      [[1]],
    ],
  },
  "koko-bananas": {
    params: ["int[]", "int"],
    ret: "int",
    exercises:
      "the answer sitting at a boundary of the feasible range — a pile that must be eaten in one hour",
    cases: [
      [[3, 6, 7, 11], 8],
      [[30, 11, 23, 4, 20], 5],
      [[30, 11, 23, 4, 20], 6],
      [[1], 1],
    ],
  },
  "k-closest-points": {
    params: ["int[][]", "int"],
    ret: "int[][]",
    exercises:
      "the heap evicting a farther point when a closer one arrives — ties are answer-ambiguous",
    unordered: true,
    cases: [
      [
        [
          [1, 3],
          [-2, 2],
        ],
        1,
      ],
      [
        [
          [3, 3],
          [5, -1],
          [-2, 4],
        ],
        2,
      ],
      [[[0, 1]], 1],
    ],
  },
  "task-cooldown": {
    params: ["string[]", "int"],
    ret: "int",
    exercises:
      "an idle gap that must be counted — a single task type repeated forces the cooldown to dominate",
    cases: [
      [["A", "A", "A", "B", "B", "B"], 2],
      [["A", "A", "A", "B", "B", "B"], 0],
      [["A", "C", "A", "B", "D", "B"], 1],
      [["A"], 5],
    ],
  },
  "island-count": {
    params: ["int[][]"],
    ret: "int",
    exercises:
      "a fill that must walk UP and LEFT — [[1,0,1],[1,1,1]] and [[0,0,1],[1,1,1],[1,0,0]]",
    cases: [
      // a U: the last arm is reachable only by walking UP, and the row-major
      // scan starts at the top-left, so nothing else forces that direction
      [
        [
          [1, 0, 1],
          [1, 1, 1],
        ],
      ],
      // reachable only by walking LEFT after descending
      [
        [
          [0, 0, 1],
          [1, 1, 1],
          [1, 0, 0],
        ],
      ],
      [
        [
          [1, 1, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
      ],
      [[[0]]],
      [[[1]]],
      [
        [
          [1, 0, 1],
          [0, 0, 0],
          [1, 0, 1],
        ],
      ],
    ],
  },
  "course-order": {
    params: ["int", "int[][]"],
    ret: "int[]",
    exercises:
      "a cycle, which must answer [] rather than a partial order — [[1,0],[0,1]]; and a diamond, where two orders are both valid",
    cases: [
      [2, [[1, 0]]],
      [1, []],
      [
        2,
        [
          [1, 0],
          [0, 1],
        ],
      ],
    ],
  },
  "rotting-fruit": {
    params: ["int[][]"],
    ret: "int",
    exercises:
      "a WIDENING frontier, so a level loop that re-reads the queue size bleeds — [[1,1,1],[1,2,1],[1,1,1]]",
    cases: [
      // a WIDENING frontier: one rotten centre infects four neighbours at once.
      // Every other case here is chain-shaped, where a level loop that re-reads
      // the queue size still happens to terminate correctly.
      [
        [
          [1, 1, 1],
          [1, 2, 1],
          [1, 1, 1],
        ],
      ],
      [
        [
          [1, 1, 1, 1, 1],
          [1, 1, 2, 1, 1],
          [1, 1, 1, 1, 1],
        ],
      ],
      [
        [
          [2, 1, 1],
          [1, 1, 0],
          [0, 1, 1],
        ],
      ],
      [
        [
          [2, 1, 1],
          [0, 1, 1],
          [1, 0, 1],
        ],
      ],
      [[[0, 2]]],
    ],
  },
  "stair-ways": {
    params: ["int"],
    ret: "int",
    exercises:
      "the recurrence past its base cases — n=1 and n=2 are the bases, larger n exercises the sum",
    cases: [[1], [2], [3], [10], [30]],
  },
  "house-robber": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "the skip being worth more than the take — a large value two positions away",
    cases: [[[1, 2, 3, 1]], [[2, 7, 9, 3, 1]], [[5]], [[0, 0]]],
  },
  "coin-change-min": {
    params: ["int[]", "int"],
    ret: "int",
    exercises:
      "an amount unreachable with the given coins, which must answer -1, not a wrong count",
    cases: [
      [[1, 3, 4], 6],
      [[2], 3],
      [[1], 0],
      [[1, 2, 5], 11],
    ],
  },
}

// Linked-list, tree and stateful-class problems need node builders in three
// languages before they can be driven this way. Named here rather than left
// silent, so the runner can report what it is NOT covering.
export const NOT_YET_RUNNABLE = {
  "reverse-list": "linked list in, linked list out",
  "cycle-detect": "needs a list with a deliberate cycle",
  "merge-two-sorted": "two lists in, one list out",
  "max-depth": "binary tree in",
  "validate-bst": "binary tree in",
  "level-order": "binary tree in",
  "kth-largest-stream": "a stateful class, not a function",
}
