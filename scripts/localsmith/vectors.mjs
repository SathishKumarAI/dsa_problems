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
  "pair-sum": {
    params: ["int[]", "int"],
    ret: "int[]",
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
    cases: [[[100, 4, 200, 1, 3, 2]], [[]], [[1, 2, 0, 1]], [[-5, -4, -3, 9]]],
  },
  "single-number": {
    params: ["int[]"],
    ret: "int",
    cases: [[[2, 2, 1]], [[7]], [[0, 4, 4]], [[1, 1, 2, 2, 9]]],
  },
  "sorted-pair-sum": {
    params: ["int[]", "int"],
    ret: "int[]",
    cases: [
      [[1, 3, 6, 9], 12],
      [[2, 7, 11, 15], 9],
      [[1, 2], 3],
      [[-5, -2, 0, 2, 7], 0],
    ],
  },
  "container-water": {
    params: ["int[]"],
    ret: "int",
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
    unordered: true,
    cases: [[[-1, 0, 1, 2, -1, -4]], [[0, 0, 0, 0]], [[1, 2, 3]], [[-2, 0, 1, 1, 2]]],
  },
  "best-trade": {
    params: ["int[]"],
    ret: "int",
    cases: [[[7, 1, 5, 3, 6, 4]], [[7, 6, 4, 3, 1]], [[2]], [[1, 2]]],
  },
  "longest-unique-substring": {
    params: ["string"],
    ret: "int",
    cases: [["abcabcbb"], ["bbbbb"], [""], ["pwwkew"], ["dvdf"]],
  },
  "min-cover-substring": {
    params: ["string", "string"],
    ret: "string",
    cases: [
      ["ADOBECODEBANC", "ABC"],
      ["a", "a"],
      ["a", "aa"],
      ["aa", "aa"],
    ],
  },
  "balanced-brackets": {
    params: ["string"],
    ret: "bool",
    cases: [["()"], ["()[]{}"], ["(]"], ["([)]"], ["{[]}"], ["]"]],
  },
  "daily-warmer": {
    params: ["int[]"],
    ret: "int[]",
    cases: [[[73, 74, 75, 71, 69, 72, 76, 73]], [[30, 40, 50, 60]], [[30]], [[50, 40, 30]]],
  },
  "largest-rectangle": {
    params: ["int[]"],
    ret: "int",
    cases: [[[2, 1, 5, 6, 2, 3]], [[2, 4]], [[0]], [[5, 5, 5]], [[6, 5, 4, 3, 2, 1]]],
  },
  "classic-binary-search": {
    params: ["int[]", "int"],
    ret: "int",
    cases: [
      [[-1, 0, 3, 5, 9, 12], 9],
      [[-1, 0, 3, 5, 9, 12], 2],
      [[5], 5],
      [[5], -5],
    ],
  },
  "rotated-minimum": {
    params: ["int[]"],
    ret: "int",
    cases: [[[3, 4, 5, 1, 2]], [[4, 5, 6, 7, 0, 1, 2]], [[11, 13, 15, 17]], [[2, 1]], [[1]]],
  },
  "koko-bananas": {
    params: ["int[]", "int"],
    ret: "int",
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
    cases: [
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
    cases: [
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
    cases: [[1], [2], [3], [10], [30]],
  },
  "house-robber": {
    params: ["int[]"],
    ret: "int",
    cases: [[[1, 2, 3, 1]], [[2, 7, 9, 3, 1]], [[5]], [[0, 0]]],
  },
  "coin-change-min": {
    params: ["int[]", "int"],
    ret: "int",
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
