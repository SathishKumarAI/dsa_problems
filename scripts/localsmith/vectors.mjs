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
  "group-anagrams": {
    params: ["string[]"],
    ret: "string[][]",
    exercises:
      "two words that share letters in DIFFERENT numbers, which a careless key would merge — ['aab','abb']; and the empty string, which is a group of its own",
    cases: [
      [["eat", "tea", "tan", "ate", "nat", "bat"]],
      [[""]],
      [["aab", "abb", "bab"]],
      [["a"]],
      [["abc", "cba", "bac", "xyz"]],
    ],
  },
  "sort-colors": {
    params: ["int[]"],
    ret: "int[]",
    exercises:
      "a 2 swapped down from the back that must NOT be skipped over — [2,0,2,1,1,0] puts a 0 where mid stands; and arrays already sorted or fully reversed",
    cases: [
      [[2, 0, 2, 1, 1, 0]],
      [[2, 0, 1]],
      [[0]],
      [[2, 2, 2]],
      [[2, 1, 0]],
      [[0, 1, 2]],
    ],
  },
  "permutation-in-string": {
    params: ["string", "string"],
    ret: "bool",
    exercises:
      "the same letters present but never adjacent — 'eidboaoo' is false where 'eidbaooo' is true; and a pattern longer than the text",
    cases: [
      // a needed letter repeated in the text, where the agreement count must
      // fall as well as rise
      ["ab", "aaab"],
      // the window leaving a letter behind must undo its own agreement
      ["ab", "bidboaoo"],
      ["ab", "eidbaooo"],
      ["ab", "eidboaoo"],
      ["abc", "ab"],
      ["a", "a"],
      ["aab", "aaab"],
    ],
  },
  "window-maximum": {
    params: ["int[]", "int"],
    ret: "int[]",
    exercises:
      "a maximum FALLING OUT of the window, so the deque must evict from the front — [1,3,-1,-3,5,3,6,7] with k=3; plus k=1 and k=n at the extremes",
    cases: [
      [[1, 3, -1, -3, 5, 3, 6, 7], 3],
      [[4, 2, 1], 3],
      [[1, 2, 3], 1],
      [[9, 8, 7, 6], 2],
      [[1, 1, 1, 1], 2],
    ],
  },
  "generate-parens": {
    params: ["int"],
    ret: "string[]",
    exercises:
      "n large enough that the pruning matters and both nesting shapes appear — n=3 has five answers including '((()))' and '()()()'",
    cases: [[1], [2], [3], [4]],
  },
  "rotated-search": {
    params: ["int[]", "int"],
    ret: "int",
    exercises:
      "a target in the half that is NOT sorted, which is the branch a naive binary search gets wrong — 0 in [4,5,6,7,0,1,2]; plus an un-rotated array and an absent target",
    cases: [
      // two elements where nums[lo] == nums[mid]: the left half is sorted
      // trivially, and a strict `<` there loses the answer
      [[2, 1], 1],
      // target sitting exactly ON the right end of the sorted half
      [[5, 6, 1, 2, 3, 4], 4],
      [[4, 5, 6, 7, 0, 1, 2], 0],
      [[4, 5, 6, 7, 0, 1, 2], 3],
      [[1], 1],
      [[1, 2, 3, 4], 4],
      [[5, 1, 2, 3, 4], 5],
    ],
  },
  "kth-largest-element": {
    params: ["int[]", "int"],
    ret: "int",
    exercises:
      "a duplicate occupying a rank of its own — [3,3,1] with k=2 answers 3, not 1; and k at both ends of the range",
    cases: [
      [[3, 2, 1, 5, 6, 4], 2],
      [[3, 3, 1], 2],
      [[1], 1],
      [[7, 6, 5, 4, 3, 2, 1], 7],
      [[-1, -2, -3], 1],
    ],
  },
  "word-search": {
    params: ["string[]", "string"],
    ret: "bool",
    exercises:
      "a path that must BACK OUT of a dead end and reuse a cell it already released — ['abce','sfcs','adee'] with 'abcced'; and a word needing a cell twice, which must fail",
    cases: [
      // the only route to the final e goes UP from the bottom row, so a lost
      // upward move — or one that forgets to advance the character — fails it
      [["axe", "bcd"], "abcde"],
      [["abce", "sfcs", "adee"], "abcced"],
      [["abce", "sfcs", "adee"], "abcb"],
      [["a"], "a"],
      [["ab", "cd"], "abdc"],
      [["aaa", "aaa", "aaa"], "aaaaaaaaa"],
    ],
  },
  "max-subarray": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "an all-negative array, where an empty run is not allowed and the answer is the least bad element — [-3,-1,-2] answers -1, not 0",
    cases: [
      [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
      [[-3, -1, -2]],
      [[5]],
      [[1, 2, 3, 4]],
      [[-1, 4, -2, 4, -8]],
    ],
  },
  "longest-common-subsequence": {
    params: ["string", "string"],
    ret: "int",
    exercises:
      "a match that must SKIP characters in both strings — 'abcde' and 'ace' answer 3; and two strings sharing nothing, which answer 0",
    cases: [
      // a shared letter that must NOT be counted twice across the diagonal
      ["aecde", "ae"],
      ["abcde", "ace"],
      ["abc", "def"],
      ["a", "a"],
      ["abcba", "abcbcba"],
      ["ab", "ba"],
    ],
  },
  "subarray-sum-k": {
    params: ["int[]", "int"],
    ret: "int",
    exercises:
      "a prefix sum REVISITED because of negatives, so the map must count occurrences rather than store one index — [1,-1,0] with k=0 answers 3; and a stretch starting at index 0, which only the seeded {0:1} finds",
    cases: [
      [[1, 1, 1], 2],
      [[1, -1, 0], 0],
      [[3], 3],
      [[1, 2, 3], 3],
      [[-1, -1, 1], 0],
    ],
  },
  "move-zeroes": {
    params: ["int[]"],
    ret: "int[]",
    exercises:
      "a run of zeroes at the FRONT, where a swap-based version would reorder the survivors — [0,0,1]; plus arrays with no zeroes and all zeroes",
    cases: [[[0, 1, 0, 3, 12]], [[0, 0, 1]], [[0]], [[1, 2, 3]], [[0, 0, 0]]],
  },
  "sorted-squares": {
    params: ["int[]"],
    ret: "int[]",
    exercises:
      "negatives whose squares outrank the positives, so the order genuinely inverts — [-4,-1,0,3,10]; and an all-negative array, which reverses completely",
    cases: [
      [[-4, -1, 0, 3, 10]],
      [[-3, -2, -1]],
      [[1]],
      [[-2, 2]],
      [[0, 1, 2]],
    ],
  },
  "asteroid-collision": {
    params: ["int[]"],
    ret: "int[]",
    exercises:
      "one arrival causing a CHAIN of collisions — [10,2,-5] kills 2 then dies to 10; and equal magnitudes, which destroy each other rather than leaving a survivor",
    cases: [
      [[5, 10, -5]],
      [[8, -8]],
      [[10, 2, -5]],
      [[-2, -1, 1, 2]],
      [[1, -2, -2, -2]],
    ],
  },
  "valid-parenthesis-string": {
    params: ["string"],
    ret: "bool",
    exercises:
      "a star that must be read as '(' to balance — '(*))'; a string where no reading works — '(((*)'; and one where the low bound must be CLAMPED at zero rather than going negative",
    cases: [["()"], ["(*))"], ["(((*)"], ["*"], [")("], ["(*)"]],
  },
  "first-last-position": {
    params: ["int[]", "int"],
    ret: "int[]",
    exercises:
      "a RUN of the target, so a search that stops at the first hit gets the wrong end — [5,7,7,8,8,10] with 8; an absent target; and an array that is entirely the target",
    cases: [
      [[5, 7, 7, 8, 8, 10], 8],
      [[5, 7, 7, 8, 8, 10], 6],
      [[1], 1],
      [[2, 2, 2, 2], 2],
      [[1, 2, 3], 3],
    ],
  },
  "count-provinces": {
    params: ["int[][]"],
    ret: "int",
    exercises:
      "a CHAIN a-b-c where a and c are not directly linked, so transitivity is required — [[1,1,0],[1,1,1],[0,1,1]] is one province; and a matrix with no links at all",
    cases: [
      [
        [
          [1, 1, 0],
          [1, 1, 0],
          [0, 0, 1],
        ],
      ],
      [
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
      ],
      [[[1]]],
      [
        [
          [1, 1, 0],
          [1, 1, 1],
          [0, 1, 1],
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
  "network-delay": {
    params: ["int[][]", "int", "int"],
    ret: "int",
    exercises:
      "a node reachable only by the LONGER of two routes, and an unreachable node that must answer -1 because the edge points the wrong way — [[1,2,1]] from k=2",
    cases: [
      [
        [
          [2, 1, 1],
          [2, 3, 1],
          [3, 4, 1],
        ],
        4,
        2,
      ],
      [[[1, 2, 1]], 2, 2],
      [[[1, 2, 1]], 2, 1],
      [
        [
          [1, 2, 1],
          [1, 3, 4],
          [2, 3, 1],
        ],
        3,
        1,
      ],
      [[[1, 2, 5]], 2, 1],
    ],
  },
  "counting-bits": {
    params: ["int"],
    ret: "int[]",
    exercises:
      "a power of two, where the count DROPS back to one instead of rising — n=5 covers 4; and n=0, whose answer is [0] rather than empty",
    cases: [[2], [5], [0], [1], [8]],
  },
  "partition-equal-subset": {
    params: ["int[]"],
    ret: "bool",
    exercises:
      "the same value appearing twice, which an upward inner sweep would reuse as one element — [1,5,11,5]; and an odd total, rejected before any table is built",
    cases: [
      [[1, 5, 11, 5]],
      [[1, 2, 3, 5]],
      [[2, 2]],
      [[1]],
      [[3, 3, 3, 4, 5]],
    ],
  },
  "majority-element": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "a stretch where a NON-majority takes the lead and is later knocked out — [2,2,1,1,1,2,2] hands the candidacy to 1 midway; plus a single element and an alternating run",
    cases: [
      [[3, 2, 3]],
      [[2, 2, 1, 1, 1, 2, 2]],
      [[1]],
      [[1, 2, 1]],
      [[5, 5, 5, 1, 2]],
    ],
  },
  "longest-common-prefix": {
    params: ["string[]"],
    ret: "string",
    exercises:
      "a list sharing NOTHING, which must stop at the first column — ['dog','racecar','car']; and one where the shortest string is itself the answer",
    cases: [
      [["flower", "flow", "flight"]],
      [["dog", "racecar", "car"]],
      [["a"]],
      [["ab", "ab"]],
      [["abc", "ab", "abcd"]],
    ],
  },
  "isomorphic-strings": {
    params: ["string", "string"],
    ret: "bool",
    exercises:
      "a pair that is consistent FORWARD but not backward — 'badc' and 'baba' — which a one-map solution accepts wrongly; plus a self-mapping and a clean relabelling",
    cases: [
      ["egg", "add"],
      ["foo", "bar"],
      ["badc", "baba"],
      ["a", "a"],
      ["paper", "title"],
    ],
  },
  "remove-duplicates-sorted": {
    params: ["int[]"],
    ret: "int[]",
    exercises:
      "a run of three or more equal values, so the writer must fall several places behind the reader — [0,0,1,1,1,2,2,3,3,4]; plus an array with no duplicates at all",
    cases: [
      [[1, 1, 2]],
      [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]],
      [[1]],
      [[1, 2, 3]],
      [[2, 2, 2]],
    ],
  },
  "is-subsequence": {
    params: ["string", "string"],
    ret: "bool",
    exercises:
      "a character of s that appears in t but too EARLY to be used in order — 'axc' against 'ahbgdc'; plus the empty s, which is always a subsequence",
    cases: [
      ["abc", "ahbgdc"],
      ["axc", "ahbgdc"],
      ["", "abc"],
      ["abc", "abc"],
      ["ba", "ab"],
    ],
  },
  "max-ones-after-flips": {
    params: ["int[]", "int"],
    ret: "int",
    exercises:
      "a window that must SHRINK past a zero it had already paid for — [1,1,0,0,1,1,1] with k=1; plus k=0 on an all-zero array, which answers 0",
    cases: [
      [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2],
      [[0, 0, 0], 0],
      [[1], 0],
      [[1, 1, 0, 0, 1, 1, 1], 1],
      [[0, 0, 1, 1], 4],
    ],
  },
  "min-subarray-sum": {
    params: ["int", "int[]"],
    ret: "int",
    exercises:
      "a target no subarray can reach, which must answer 0 — 11 against [1,1,1,1]; and a case where the shortest window is NOT at the front, so the left edge must travel",
    cases: [
      [7, [2, 3, 1, 2, 4, 3]],
      [11, [1, 1, 1, 1]],
      [4, [1, 4, 4]],
      [1, [1]],
      [15, [1, 2, 3, 4, 5]],
    ],
  },
  "decode-string": {
    params: ["string"],
    ret: "string",
    exercises:
      "a NESTED group, where the inner expansion must finish before the outer repeat — '3[a2[c]]'; a multi-digit count; and letters sitting outside any group",
    cases: [["3[a]2[bc]"], ["3[a2[c]]"], ["2[abc]3[cd]ef"], ["10[a]"], ["abc"]],
  },
  "remove-k-digits": {
    params: ["string", "int"],
    ret: "string",
    exercises:
      "a LEADING ZERO exposed by the removals — '10200' with k=1 answers '200'; and removing every digit, which must answer '0' rather than an empty string",
    cases: [
      ["1432219", 3],
      ["10200", 1],
      ["10", 2],
      ["112", 1],
      ["9", 1],
    ],
  },
  "search-insert-position": {
    params: ["int[]", "int"],
    ret: "int",
    exercises:
      "a target PAST the end, whose answer is the array length — 7 in [1,3,5,6]; a target before the start; and an absent target that lands between two values",
    cases: [
      [[1, 3, 5, 6], 5],
      [[1, 3, 5, 6], 7],
      [[1, 3, 5, 6], 2],
      [[1, 3, 5, 6], 0],
      [[1], 1],
    ],
  },
  "find-peak-element": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "an array with SEVERAL peaks, where the halving must still land on one — [1,2,1,3,5,6,4]; a single element, which is a peak by the infinity rule; and a strictly decreasing array, whose peak is the first index",
    cases: [
      // a plateau-free array whose peak is NOT the last rise, so a `<=` slope
      // test walks past it
      [[1, 2, 1, 3, 5, 4, 4]],
      [[1, 2, 3, 1]],
      [[1, 2, 1, 3, 5, 6, 4]],
      [[1]],
      [[3, 2, 1]],
      [[1, 2]],
    ],
  },
  "single-in-sorted": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "the loner at the FRONT, in the MIDDLE and at the END, since each sends the halving a different way — [1,1,2,3,3,4,4] has it in the middle, [1,1,2] at the end",
    cases: [
      [[1, 1, 2, 3, 3, 4, 4, 8, 8]],
      [[3, 3, 7, 7, 10, 11, 11]],
      [[1]],
      [[1, 1, 2]],
      [[1, 2, 2]],
    ],
  },
  "unique-paths": {
    params: ["int", "int"],
    ret: "int",
    exercises:
      "a grid one cell wide, whose answer is 1 rather than 0 — m=1; and a rectangular grid where the two dimensions differ, so a transposed recurrence would still look right on a square",
    cases: [
      [3, 7],
      [3, 2],
      [1, 1],
      [1, 5],
      [2, 3],
    ],
  },
  "word-break": {
    params: ["string", "string[]"],
    ret: "bool",
    exercises:
      "a string where an early long match DEAD-ENDS and a shorter one is needed — 'catsandog' with both 'cats' and 'cat'; and a word reused twice",
    cases: [
      ["leetcode", ["leet", "code"]],
      ["applepenapple", ["apple", "pen"]],
      ["catsandog", ["cats", "dog", "sand", "and", "cat"]],
      ["a", ["a"]],
      ["ab", ["a"]],
    ],
  },
  "min-cost-stairs": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "a stair expensive enough that STEPPING OVER it wins — [1,100,1,...]; and the two-stair case, where the answer is simply the cheaper start",
    cases: [
      [[10, 15, 20]],
      [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]],
      [[1, 2]],
      [[5, 5]],
      [[0, 0, 0, 1]],
    ],
  },
  "surrounded-regions": {
    params: ["int[][]"],
    ret: "int[][]",
    exercises:
      "a region that TOUCHES the border and must survive, beside an enclosed one that must not — [[1,1,1,1],[1,0,0,1],[1,1,0,1],[1,0,1,1]]; and a single-cell grid, which is all border",
    cases: [
      // one grid per direction the border flood must be able to travel:
      // up, down, left and right each rescue a region nothing else reaches
      [
        [
          [1, 0, 1],
          [1, 0, 1],
          [1, 1, 1],
        ],
      ],
      [
        [
          [1, 1, 1],
          [1, 0, 1],
          [1, 0, 1],
        ],
      ],
      [
        [
          [1, 1, 1, 1],
          [0, 0, 0, 1],
          [1, 1, 0, 1],
          [1, 0, 1, 1],
        ],
      ],
      [
        [
          [1, 1, 1, 1],
          [1, 0, 0, 0],
          [1, 1, 0, 1],
          [1, 0, 1, 1],
        ],
      ],
      [
        [
          [1, 1, 1],
          [1, 0, 0],
          [1, 1, 1],
        ],
      ],
      [
        [
          [1, 1, 1, 1],
          [1, 0, 0, 1],
          [1, 1, 0, 1],
          [1, 0, 1, 1],
        ],
      ],
      [[[0]]],
      [[[1]]],
      [
        [
          [0, 0],
          [0, 0],
        ],
      ],
      [
        [
          [1, 1, 1],
          [1, 0, 1],
          [1, 1, 1],
        ],
      ],
    ],
  },
  "sort-by-frequency": {
    params: ["string"],
    ret: "string",
    exercises:
      "a TIE in frequency, which the character order must break the same way every time — 'tree' puts r before t; and a string where every character is distinct",
    cases: [["tree"], ["cccaaa"], ["a"], ["Aabb"], ["abcabc"]],
  },
  "kth-smallest-matrix": {
    params: ["int[][]", "int"],
    ret: "int",
    exercises:
      "a matrix where a row's LAST value exceeds the next row's first, so it is not one sorted sequence — [[1,5,9],[10,11,13],[12,13,15]]; plus k at both ends of the range",
    cases: [
      [
        [
          [1, 5, 9],
          [10, 11, 13],
          [12, 13, 15],
        ],
        8,
      ],
      [[[-5]], 1],
      [
        [
          [1, 2],
          [1, 3],
        ],
        2,
      ],
      [
        [
          [1, 2],
          [3, 4],
        ],
        4,
      ],
      [
        [
          [1, 2],
          [3, 4],
        ],
        1,
      ],
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
  // ---- structural inputs (B30). A `list` case is a row of ints, or
  // `{list, cycle}` when the tail has to point back; a `tree` case is level
  // order with `null` for an absent child, the shape LeetCode prints. ----
  "reverse-list": {
    params: ["list"],
    ret: "list",
    exercises:
      "the pointer flip that must not lose the rest — [1,2] is the smallest list where prev, curr and next are three different nodes, and [] has no first node to flip",
    cases: [[[1, 2, 3, 4, 5]], [[1, 2]], [[1]], [[]], [[1, 2, 3]]],
  },
  "cycle-detect": {
    params: ["list"],
    ret: "bool",
    exercises:
      "fast outrunning slow — a one-node self-loop catches a fast pointer that steps before it checks, and [1,2,3] with no cycle is the walk that must reach the end",
    cases: [
      [{ list: [3, 2, 0, -4], cycle: 1 }],
      [{ list: [1, 2], cycle: 0 }],
      [{ list: [1], cycle: 0 }],
      [[1]],
      [[1, 2, 3]],
      [[]],
    ],
  },
  "merge-two-sorted": {
    params: ["list", "list"],
    ret: "list",
    exercises:
      "the tail left over when one list runs out first — [5] against [1,2,3] drains b entirely before a moves, and two empties have no dummy to return",
    cases: [
      [
        [1, 2, 4],
        [1, 3, 4],
      ],
      [[], []],
      [[], [0]],
      [[5], [1, 2, 3]],
      [
        [1, 1],
        [1, 1],
      ],
    ],
  },
  "middle-of-list": {
    params: ["list"],
    ret: "node",
    exercises:
      "which middle an even list gets — [1,2,3,4] must answer the SECOND of the two, which is the difference between checking fast and checking fast.next",
    cases: [[[1, 2, 3, 4, 5]], [[1, 2, 3, 4]], [[1]], [[1, 2]], [[]]],
  },
  "palindrome-list": {
    params: ["list"],
    ret: "bool",
    exercises:
      "the odd-length middle that belongs to neither half — [1,2,1] must ignore it, and [1,2,2,3] fails only on the last comparison",
    cases: [
      [[1, 2, 2, 1]],
      [[1, 2]],
      [[1]],
      [[1, 2, 3, 2, 1]],
      [[1, 2, 2, 3]],
      [[]],
    ],
  },
  "remove-nth-from-end": {
    params: ["list", "int"],
    ret: "list",
    exercises:
      "removing the HEAD, which is the only case with no previous node — [1,2],2 and [1],1 both hit it, and [1,2],1 removes the tail instead",
    cases: [
      [[1, 2, 3, 4, 5], 2],
      [[1], 1],
      [[1, 2], 1],
      [[1, 2], 2],
      [[1, 2, 3], 3],
    ],
  },
  "max-depth": {
    params: ["tree"],
    ret: "int",
    exercises:
      "the deeper side winning — [1,2,null,3,null,4] is a left-leaning chain of 4, so a max/min slip or a depth counted from 0 shows up immediately",
    cases: [
      [[3, 9, 20, null, null, 15, 7]],
      [[]],
      [[1]],
      [[1, 2, null, 3, null, 4]],
      [[1, null, 2, null, 3]],
    ],
  },
  "validate-bst": {
    params: ["tree"],
    ret: "bool",
    exercises:
      "the grandchild that breaks the rule while its parent looks fine — [5,1,4,null,null,3,6] passes every local check and is not a BST; [2,1,2] repeats the root on the RIGHT, which is the only place a loosened lower bound shows",
    cases: [
      [[2, 1, 3]],
      [[5, 1, 4, null, null, 3, 6]],
      [[]],
      [[1]],
      [[10, 5, 15, null, null, 6, 20]],
      [[2, 2]],
      [[2, 1, 2]],
    ],
  },
  "level-order": {
    params: ["tree"],
    ret: "int[][]",
    exercises:
      "the level boundary — [1,2,3,4,null,null,5] has a ragged last row, so a queue read live instead of snapshotted merges two levels into one",
    cases: [
      [[3, 9, 20, null, null, 15, 7]],
      [[]],
      [[1]],
      [[1, 2, 3, 4, null, null, 5]],
      [[1, null, 2]],
    ],
  },
  "same-tree": {
    params: ["tree", "tree"],
    ret: "bool",
    exercises:
      "same values, different shape — [1,2] against [1,null,2] holds the same two numbers and is not the same tree; [1,2,3] against [1,2,4] differs on ONE side only, which is what separates `and` from `or`",
    cases: [
      [
        [1, 2, 3],
        [1, 2, 3],
      ],
      [
        [1, 2],
        [1, null, 2],
      ],
      [
        [1, 2, 1],
        [1, 1, 2],
      ],
      [[], []],
      [[1], []],
      [
        [1, 2, 3],
        [1, 2, 4],
      ],
    ],
  },
  "invert-tree": {
    params: ["tree"],
    ret: "tree",
    exercises:
      "the swap happening at every level, not only the root — [4,2,7,1,3,6,9] is symmetric in shape, so only the leaf order proves the recursion went all the way down",
    cases: [
      [[4, 2, 7, 1, 3, 6, 9]],
      [[2, 1, 3]],
      [[]],
      [[1, 2]],
      [[1, null, 2]],
    ],
  },
  "balanced-tree": {
    params: ["tree"],
    ret: "bool",
    exercises:
      "a difference of exactly 2, which is the first unbalanced one — [1,2,null,3] fails and [1,2,3,4] does not, so an off-by-one in the comparison flips the answer",
    cases: [
      [[3, 9, 20, null, null, 15, 7]],
      [[1, 2, 2, 3, 3, null, null, 4, 4]],
      [[]],
      [[1, 2, null, 3]],
      [[1]],
    ],
  },
  "bst-ancestor": {
    params: ["tree", "int", "int"],
    ret: "int",
    exercises:
      "the split point — [6,2,8,…] with 2 and 4 answers 2 itself, the case that separates 'a node can be its own ancestor' from 'walk past it'; (2,0), (8,9) and (9,8) stand ON the node with the other key to one side, which is where a loosened `<` or `>` walks one step too far",
    cases: [
      [[6, 2, 8, 0, 4, 7, 9], 2, 8],
      [[6, 2, 8, 0, 4, 7, 9], 2, 4],
      [[2, 1], 1, 2],
      [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 3, 5],
      [[6, 2, 8, 0, 4, 7, 9], 7, 9],
      [[6, 2, 8, 0, 4, 7, 9], 2, 0],
      [[6, 2, 8, 0, 4, 7, 9], 8, 9],
      [[6, 2, 8, 0, 4, 7, 9], 9, 8],
    ],
  },
  // ---- a rung that is a CLASS (B62). A case is the constructor's arguments
  // followed by the stream of calls, and the answer is the row of results. ----
  "kth-largest-stream": {
    shape: "class",
    klass: "KthLargest",
    method: "add",
    ctor: ["int", "int[]"],
    params: ["int", "int[]", "int[]"],
    ret: "int[]",
    exercises:
      "the heap being trimmed to k and staying there — [4,5,8,2] with k=3 must drop the 2 in the CONSTRUCTOR, and k=1 on an empty start has nothing to trim until the first add",
    cases: [
      [3, [4, 5, 8, 2], [3, 5, 10, 9, 4]],
      [1, [], [-3, -2, -4, 0, 4]],
      [2, [0], [-1, 1, -2, -4, 3]],
      [4, [7, 7, 7, 7, 8, 3], [2, 10, 9, 9]],
    ],
  },

  // ---- a rung that is a CLASS (B62). A case is the constructor's arguments
  // followed by the stream of calls, and the answer is the row of results. ----
  "kth-largest-stream": {
    shape: "class",
    klass: "KthLargest",
    method: "add",
    ctor: ["int", "int[]"],
    params: ["int", "int[]", "int[]"],
    ret: "int[]",
    exercises:
      "the heap being trimmed to k and staying there — [4,5,8,2] with k=3 must drop the 2 in the CONSTRUCTOR, and k=1 on an empty start has nothing to trim until the first add",
    cases: [
      [3, [4, 5, 8, 2], [3, 5, 10, 9, 4]],
      [1, [], [-3, -2, -4, 0, 4]],
      [2, [0], [-1, 1, -2, -4, 3]],
      [4, [7, 7, 7, 7, 8, 3], [2, 10, 9, 9]],
    ],
  },
  "rotate-array": {
    params: ["int[]", "int"],
    ret: "int[]",
    exercises:
      "reducing k before rotating — [1,2] with k=5 needs k % n, and [1,2,3] with k=3 must come back untouched",
    cases: [
      [[1, 2, 3, 4, 5, 6, 7], 3],
      [[-1, -100, 3, 99], 2],
      [[1], 0],
      [[1, 2], 5],
      [[1, 2, 3], 3],
      [[1, 2, 3, 4, 5, 6], 4],
    ],
  },
  "missing-number": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "the gap at either end of the range — [0,1] is missing n itself and [1] is missing 0, which an interior-only scan never finds",
    cases: [[[3, 0, 1]], [[0, 1]], [[9, 6, 4, 2, 3, 5, 7, 0, 1]], [[0]], [[1]]],
  },
  "find-all-duplicates": {
    params: ["int[]"],
    ret: "int[]",
    // the rungs disagree on ORDER and the problem does not: the pairwise scan
    // reports first-sighting order, the rest report ascending. Sorting both
    // sides is the honest way to say order is not part of the answer.
    unordered: true,
    exercises:
      "the second sighting of a value — [2,2] repeats immediately, [1] repeats nothing and must return an empty list",
    cases: [
      [[4, 3, 2, 7, 8, 2, 3, 1]],
      [[1, 1, 2]],
      [[1]],
      [[2, 2]],
      [[3, 1, 3, 4, 2]],
    ],
  },
  "plus-one": {
    params: ["int[]"],
    ret: "int[]",
    exercises:
      "the carry running off the front — [9] and [9,9,9] grow by one digit, [1,9,9] carries twice and stops",
    cases: [
      [[1, 2, 3]],
      [[4, 3, 2, 1]],
      [[9]],
      [[9, 9, 9]],
      [[0]],
      [[1, 9, 9]],
    ],
  },
  "first-missing-positive": {
    params: ["int[]"],
    ret: "int",
    exercises:
      "an answer that is not adjacent to any value present — [7,8,9,11,12] answers 1 with nothing in range, and [2,2,2] is the duplicate that makes an unguarded index-swap spin forever",
    cases: [
      [[1, 2, 0]],
      [[3, 4, -1, 1]],
      [[7, 8, 9, 11, 12]],
      [[1]],
      [[2, 2, 2]],
      [[-5]],
      [[2, 1]],
      [[2, 2, 1]],
    ],
  },
  "summary-ranges": {
    params: ["int[]"],
    ret: "string[]",
    exercises:
      "a run of length one, which must print bare rather than as x->x — [0,2,3,4,6,8,9] has three of them, and [] must produce nothing without reading nums[0]",
    cases: [
      [[0, 1, 2, 4, 5, 7]],
      [[0, 2, 3, 4, 6, 8, 9]],
      [[]],
      [[-1]],
      [[1, 2]],
      [[-3, -2, -1, 2]],
    ],
  },
  "intersection-of-arrays": {
    params: ["int[]", "int[]"],
    ret: "int[]",
    exercises:
      "multiplicity rather than membership — [1,1,1] against [1,1] must yield exactly two 1s, and [1] against [2] must yield an empty answer",
    cases: [
      [
        [1, 2, 2, 1],
        [2, 2],
      ],
      [
        [4, 9, 5],
        [9, 4, 9, 8, 4],
      ],
      [[1], [1]],
      [[1], [2]],
      [
        [1, 1, 1],
        [1, 1],
      ],
      [
        [3, 1, 2],
        [2, 1, 3],
      ],
    ],
  },
  // Batch C vectors — paste into VECTORS in scripts/localsmith/vectors.mjs.
  // Inputs only; the repo's own Python is the oracle.

  "remove-element": {
    params: ["int[]", "int"],
    ret: "int[]",
    exercises:
      "the writer that lags behind the reader — [0,1,2,2,3,0,4,2] has two matches in a row, and [2,2,2] never lets the writer move at all",
    cases: [
      [[3, 2, 2, 3], 3],
      [[0, 1, 2, 2, 3, 0, 4, 2], 2],
      [[], 0],
      [[2, 2, 2], 2],
      [[1], 2],
    ],
  },
  "reverse-string": {
    params: ["string"],
    ret: "string",
    exercises:
      "the loop that stops when the pointers MEET — 'abc' leaves a middle character unpaired, and '' must not swap once",
    cases: [["hello"], ["abc"], [""], ["a"], ["ab"], ["Hannah"]],
  },
  "merge-sorted-array": {
    params: ["int[]", "int", "int[]", "int"],
    ret: "int[]",
    exercises:
      "filling from the BACK into a's padding — [4,5,6,0,0,0] with b=[1,2,3] overwrites a live value if you write forward, and m=0 leaves the read index at -1",
    cases: [
      [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3],
      [[4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3],
      [[1], 1, [], 0],
      [[0], 0, [1], 1],
      [[2, 0], 1, [1], 1],
      [[1, 2, 4, 5, 6, 0], 5, [3], 1],
    ],
  },
  "three-sum-closest": {
    params: ["int[]", "int"],
    ret: "int",
    exercises:
      "the pointer step chosen by which side of the target the sum falls on — [-2,0,1,3] with target 0 ties two triples and forces the smaller-sum tie-break, and [1,1,1,0] with target -100 never brackets anything",
    cases: [
      [[-1, 2, 1, -4], 1],
      [[-2, 0, 1, 3], 0],
      [[0, 0, 0], 1],
      [[1, 1, 1, 0], -100],
      [[4, 0, 5, -5, 3, 3, 0, -4, -5], -2],
      [[0, -2, 0, 1, 3], 0],
      [[-2, 0, 0, 3], 0],
    ],
  },
  // ---- batch E: six more linked-list problems (B30 follow-on). A `list`
  // case is a plain row of ints; the driver builds the nodes and prints the
  // result as [1,2,3]. Every row below carries the empty list and the corner
  // case the problem's own constraints name. ----
  "add-two-numbers": {
    params: ["list", "list"],
    ret: "list",
    exercises:
      "the carry that runs past the end of BOTH lists — [9,9,9] + [1] needs a fourth digit no input node holds, and [] + [1,2] must count a missing node as a zero rather than as the end of the sum",
    cases: [
      [
        [2, 4, 3],
        [5, 6, 4],
      ],
      [[9, 9, 9], [1]],
      [[0], [0]],
      [
        [9, 9],
        [9, 9],
      ],
      [[], [1, 2]],
      [[], []],
    ],
  },
  "odd-even-list": {
    params: ["list"],
    ret: "list",
    exercises:
      "the last node of the even chain, which has to be cut loose — [1,2,3,4] ends on an even node while [1,2,3,4,5] ends on an odd one, and [1,2] has a single even node the runner must not step past",
    cases: [
      [[1, 2, 3, 4, 5]],
      [[2, 1, 3, 5, 6, 4, 7]],
      [[1, 2, 3, 4]],
      [[1, 2]],
      [[1]],
      [[]],
    ],
  },
  "remove-list-elements": {
    params: ["list", "int"],
    ret: "list",
    exercises:
      "removing the HEAD, and then removing everything — [7,7,7,7] with 7 must come back empty, which is the one answer a walk anchored at the original head can never produce",
    cases: [
      [[1, 2, 6, 3, 4, 5, 6], 6],
      [[7, 7, 7, 7], 7],
      [[6, 1, 6], 6],
      [[1, 2, 3], 4],
      [[1], 1],
      [[], 1],
    ],
  },
  "swap-pairs": {
    params: ["list"],
    ret: "list",
    exercises:
      "the odd tail with no partner — [1,2,3] must leave 3 exactly where it is, and [1] and [] have no pair at all, so the guard has to test the node AND the node after it",
    cases: [[[1, 2, 3, 4]], [[1, 2, 3]], [[1, 2]], [[1]], [[]]],
  },
  "rotate-list": {
    params: ["list", "int"],
    ret: "list",
    exercises:
      "k larger than the list — [0,1,2] with k=4 is one rotation and not four, [1,2] with k=2 is no rotation at all, and [] has no length to take that modulus against",
    cases: [
      [[1, 2, 3, 4, 5], 2],
      [[0, 1, 2], 4],
      [[1, 2], 2],
      [[1, 2, 3], 0],
      [[1], 3],
      [[], 0],
    ],
  },
  "reorder-list": {
    params: ["list"],
    ret: "list",
    exercises:
      "the middle node an odd length strands at the end — [1,2,3,4,5] must finish on 3, [1,2,3,4] pairs every node, and [1,2] is already folded so nothing may move",
    cases: [
      [[1, 2, 3, 4]],
      [[1, 2, 3, 4, 5]],
      [[1, 2, 3]],
      [[1, 2]],
      [[1]],
      [[]],
    ],
  },
  "backspace-compare": {
    params: ["string", "string"],
    ret: "bool",
    exercises:
      "the '#' that has nothing to delete — '#a' against 'a' is true only if a leading backspace is a no-op, while 'ab##' against 'c#d#' checks that two empty texts still count as equal",
    cases: [
      ["ab#c", "ad#c"],
      ["ab##", "c#d#"],
      ["a#c", "b"],
      ["#a", "a"],
      ["", ""],
      ["a##c", "#a#c"],
      ["bxj##tw", "bxj###tw"],
      ["a", ""],
      ["#", "t"],
      ["#t", ""],
      ["xxj##tw", "bxjt##tw"],
    ],
  },
  "boats-to-save": {
    params: ["int[]", "int"],
    ret: "int",
    exercises:
      "the boat that must sail with a seat empty — [3,5,3,4] at limit 5 pairs nobody and costs four boats, while [1,2] at limit 3 pairs everyone into one",
    cases: [
      [[1, 2], 3],
      [[3, 2, 2, 1], 3],
      [[3, 5, 3, 4], 5],
      [[1], 1],
      [[2, 2], 6],
      [[5, 5, 5], 5],
      [[1, 1, 1, 1, 1, 1, 1, 1], 2],
    ],
  },
  "next-permutation": {
    params: ["int[]"],
    ret: "int[]",
    exercises:
      "the wrap and the tail — [3,2,1] has no pivot at all and must come back as [1,2,3], while [1,1,5] shows duplicates are one arrangement and [1,3,5,4,2] needs the tail reversed rather than merely swapped",
    cases: [
      [[1, 2, 3]],
      [[3, 2, 1]],
      [[1, 1, 5]],
      [[1]],
      [[1, 3, 5, 4, 2]],
      [[2, 3, 1]],
      [[1, 4, 5, 4, 2]],
      [[3, 2, 2, 1]],
    ],
  },
}

/* Nothing is excused any more (B30, B62). Every problem in VECTORS is RUN in
   all three languages: a `list` or `tree` argument is built from its literal,
   and a problem that is a class rather than a function is driven as a
   constructor plus a stream of calls. The export stays, empty, because the
   next problem shaped in a way the driver cannot reach belongs here rather
   than absent from VECTORS — an invisible gap reads as a pass. */
export const NOT_YET_RUNNABLE = {}
