// The moves. Each entry answers three things in this order: what the move IS,
// its TELL in a problem statement, and the invariant that makes it correct —
// because the invariant is what people break, not the loop.
//
// The tell matters more than the definition. A reader who can define a sliding
// window and cannot recognise one in a statement has learned a word.
import type { Term } from "../types.ts"

export const TECHNIQUE_TERMS: Term[] = [
  {
    slug: "two-pointers",
    term: "two pointers",
    aliases: ["two-pointer", "converging pointers", "fast and slow"],
    short:
      "Two indices walking one or two sequences under a rule that lets you discard a whole side of the search at each step, turning a nested loop into one pass.",
    body: [
      "Two flavours get conflated and should not be. CONVERGING: `lo` and `hi` start at the ends of a sorted array and move toward each other — it terminates because the gap shrinks every iteration, and it is correct only when moving an end can never make the answer better. PARALLEL: two indices walk forward, usually over two inputs (`is-subsequence`, `merge-two-sorted`) — it terminates because at least one index advances every iteration, which is the condition you actually have to check as you write it.",
      "Fast-and-slow is the same idea on a [[linked list]]: two pointers at different speeds, or the same speed with a fixed gap, give you the middle, cycle detection, or the n-th from the end in one pass and O(1) space.",
      "The tell: \"sorted array\", \"find two\", \"the most water\", \"is it a palindrome\", \"in place\", \"O(1) extra space\" — the answer is a pair or a span, and moving an end changes the score monotonically.",
    ],
    trap: "Moving the wrong end, and being unable to say why the other is safe to discard. In `container-water`, moving the taller wall can never increase the area — the width shrinks and the height is still capped by the shorter wall. If you cannot state that sentence, the loop is a guess.",
    seeAlso: ["sliding-window", "binary-search", "linked-list", "in-place"],
    reading: [
      { title: "Sedgewick & Wayne, Algorithms 4", url: "https://algs4.cs.princeton.edu/home/", note: "the partitioning and merging code these walks generalise" },
    ],
    source: "Xu & Gunawardane, Coding Interview Patterns (2024), ch. two pointers",
  },
  {
    slug: "sliding-window",
    term: "sliding window",
    aliases: ["window", "variable window"],
    short:
      "A span [left, right] over a sequence that grows on the right and shrinks on the left, so every element is added once and removed at most once — O(n) instead of O(n²).",
    body: [
      "Fixed-size windows answer \"the best block of exactly k\"; variable windows answer \"the longest or shortest block satisfying a condition\". The variable one has a shape: extend right, and while the condition is violated, advance left. The inner `while` is not a nested loop — left only moves forward across the whole run, which is what keeps the pass linear.",
      "It requires MONOTONICITY: extending the window must only ever push the condition one way. Sums of non-negative numbers qualify (adding never decreases the sum), which is exactly why `subarray-sum-k` allows negatives and therefore forbids a window — use [[prefix sum]] with a [[hash map]] there instead. Getting this wrong produces a solution that passes every example and fails the one test with a negative in it.",
      "The tell: \"contiguous\", \"substring\", \"subarray\", \"at most k distinct\", \"longest / shortest such that…\".",
    ],
    trap: "Recomputing the window's contents on every step. If the inner work is O(k), the whole thing is O(nk) and the window bought nothing — maintain the count/sum incrementally as the edges move.",
    seeAlso: ["two-pointers", "prefix-sum", "hash-map", "big-o"],
    source: "Xu & Gunawardane, Coding Interview Patterns (2024), ch. sliding windows",
  },
  {
    slug: "prefix-sum",
    term: "prefix sum",
    aliases: ["cumulative sum", "running total", "prefix sums"],
    short:
      "Precompute running totals so the sum of any range is one subtraction: `sum(i..j) = prefix[j+1] − prefix[i]`.",
    body: [
      "It converts a read-only array and many range questions into O(1) answers after an O(n) pass. The same idea runs in both directions (`product-except-self` builds a prefix and a suffix) and in two dimensions for grids, where a rectangle's sum is four lookups.",
      "Paired with a [[hash map]] it answers \"how many subarrays sum to k\" in one pass: store how many times each running total has been seen, and at each index ask for `running − k`. The seed matters — the map starts holding one occurrence of sum 0, or every subarray that starts at index 0 is missed and `[1, 1], k = 1` returns 1 instead of 2.",
      "The tell: \"contiguous subarray\", \"sum equals k\", \"range query\", \"product of everything else\"; the array is read-only and the same question is asked at every index.",
    ],
    trap: "Off-by-one in the indexing. Build the prefix array with a leading zero (`prefix[0] = 0`) and the range formula stops needing a special case for i = 0.",
    seeAlso: ["sliding-window", "hash-map", "dynamic-programming"],
    reading: [
      { title: "Prefix sum (Wikipedia)", url: "https://en.wikipedia.org/wiki/Prefix_sum" },
    ],
  },
  {
    slug: "binary-search",
    term: "binary search",
    aliases: ["bisect", "binary search on the answer"],
    short:
      "Halve a sorted search space each step: O(log n). The harder half of the idea is that the space does not have to be an array.",
    body: [
      "On an array it needs the array sorted, and it returns in about 20 steps for a million elements. The generalisation — \"binary search on the answer\" — is what interviews are actually testing: if you can write a monotone predicate `feasible(x)` (false, false, …, true, true), you can binary search over the ANSWER's range even when there is no array at all. Minimum capacity to ship packages in d days, smallest divisor, the k-th smallest in a matrix: all the same shape.",
      "Write it with an invariant, not by feel. Decide whether your range is closed `[lo, hi]` or half-open `[lo, hi)`, keep it true at every step, and the off-by-one that makes it loop forever stops being a guessing game. Python's `bisect_left` / `bisect_right` already implement both boundaries correctly and are the right answer when you just need a position.",
    ],
    trap: "`(lo + hi) / 2` overflows in fixed-width integer languages. Joshua Bloch's 2006 post showed the bug had been sitting in the JDK — and in Programming Pearls — for years; write `lo + (hi − lo) // 2`. Python integers do not overflow, so this is a Java/C++ bug your Python tests cannot catch.",
    seeAlso: ["two-pointers", "big-o", "dynamic-array"],
    reading: [
      { title: "Binary search (Wikipedia)", url: "https://en.wikipedia.org/wiki/Binary_search" },
      { title: "Google Research: nearly all binary searches and mergesorts are broken", url: "https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/", note: "Bloch on the overflow bug, in the JDK, found after nine years" },
    ],
  },
  {
    slug: "depth-first-search",
    term: "depth-first search",
    aliases: ["dfs"],
    short:
      "Follow one path as far as it goes, then back up and take the next branch — the walk a recursive function performs naturally.",
    body: [
      "DFS is the right tool when you need to explore every possibility, detect a cycle, or compute something about a subtree that depends on its children — anything where the answer for a node is assembled from the answers below it. It finds *a* path, not the shortest one; for shortest in an unweighted [[graph]] you need [[breadth-first search]].",
      "Recursive is the readable form and uses the call [[stack]]; iterative with an explicit stack is the same walk and is what you write when the depth can exceed the interpreter's recursion limit (1000 frames in CPython by default — a 10⁵-node path blows it).",
    ],
    costs: [
      { op: "visit every node and edge", bound: "O(V + E)" },
      { op: "space", bound: "O(V)", unless: "the recursion depth is the height, which on a balanced tree is O(log V)" },
    ],
    trap: "A visited set is what separates a search from an infinite loop on any graph with a cycle — a grid counts, because every step back is a cycle of length two.",
    seeAlso: ["breadth-first-search", "graph", "stack", "backtracking"],
    reading: [
      { title: "Depth-first search (Wikipedia)", url: "https://en.wikipedia.org/wiki/Depth-first_search" },
    ],
  },
  {
    slug: "breadth-first-search",
    term: "breadth-first search",
    aliases: ["bfs", "level order"],
    short:
      "Visit everything one step away, then everything two steps away — which is why it finds the SHORTEST path in an unweighted graph.",
    body: [
      "The [[queue]] is the whole algorithm: nodes come out in the order they were discovered, so the first time you reach a node you reached it by a shortest path. That guarantee holds only when every edge costs the same; with weights you need Dijkstra, which is the same walk with a [[heap]] instead of a queue.",
      "Level-order traversal is the same code with the level boundary tracked: take the queue's current length before the loop and that many pops are exactly one level. This is how \"the shortest transformation\", \"the minimum number of moves\" and \"how many levels deep\" problems are all one implementation.",
    ],
    costs: [
      { op: "visit every node and edge", bound: "O(V + E)" },
      { op: "space", bound: "O(V)", unless: "the frontier can be the whole width of the graph, which on a grid is O(min(rows, cols))" },
    ],
    trap: "Mark visited on ENQUEUE, never on dequeue. Marking on dequeue lets the same node enter the queue many times over and turns a linear BFS quadratic.",
    seeAlso: ["depth-first-search", "queue", "graph", "heap"],
    reading: [
      { title: "Breadth-first search (Wikipedia)", url: "https://en.wikipedia.org/wiki/Breadth-first_search" },
    ],
    source: "Khamies, How to Solve Algorithm Problems (2023), §5.2",
  },
  {
    slug: "backtracking",
    term: "backtracking",
    short:
      "A [[depth-first search]] over decisions, where each step makes a choice, recurses, and then UNDOES the choice before trying the next one.",
    body: [
      "Permutations, combinations, subsets, n-queens, sudoku, word search: all the same skeleton — choose, explore, un-choose. The un-choosing is what makes one mutable state object serve the whole search instead of copying it at every node, and forgetting it is the single most common bug in this family.",
      "The cost is exponential by nature, so the only real optimisation is PRUNING: cut a branch as soon as it cannot lead to an answer. Sorting the candidates first, skipping duplicates at the same depth, and bounding the partial sum are the three that turn a timeout into a pass.",
    ],
    costs: [
      { op: "subsets of n", bound: "O(2ⁿ · n)", unless: "the n is copying each subset out" },
      { op: "permutations of n", bound: "O(n! · n)" },
    ],
    trap: "Appending the working list to the results appends a REFERENCE. Later mutation rewrites every answer already collected — append a copy.",
    seeAlso: ["depth-first-search", "dynamic-programming"],
    reading: [
      { title: "Backtracking (Wikipedia)", url: "https://en.wikipedia.org/wiki/Backtracking" },
    ],
  },
  {
    slug: "dynamic-programming",
    term: "dynamic programming",
    aliases: ["dp"],
    short:
      "Solve a problem by solving its overlapping subproblems once and reusing the answers — recursion with the repetition removed.",
    body: [
      "Two conditions have to hold. OPTIMAL SUBSTRUCTURE: the best answer is built from best answers to smaller instances. OVERLAPPING SUBPROBLEMS: those smaller instances recur, which is what makes caching pay. Miss the second and you have divide and conquer; miss the first and no amount of caching helps.",
      "Write the recurrence first, in words, then in code — `best(i) = max(best(i−1), best(i−2) + v[i])` — and only then choose top-down [[memoization]] or a bottom-up table. Top-down is closer to how you reasoned and only computes states you reach; bottom-up avoids the recursion limit and usually lets you drop the table to O(1) rows when the recurrence only looks back a fixed distance.",
    ],
    trap: "Greedy is not DP, and the difference is not stylistic: `coin-change-min` is the standard proof that taking the largest coin first gives a wrong answer for coins {1, 3, 4} and target 6.",
    seeAlso: ["memoization", "greedy", "backtracking", "prefix-sum"],
    reading: [
      { title: "Dynamic programming (Wikipedia)", url: "https://en.wikipedia.org/wiki/Dynamic_programming" },
    ],
  },
  {
    slug: "memoization",
    term: "memoization",
    aliases: ["memoise", "caching results"],
    short:
      "Cache a pure function's result by its arguments so the second call with the same arguments is a lookup, not a computation.",
    body: [
      "This is the top-down half of [[dynamic programming]], and in Python it is one decorator: `@functools.cache` on the recursive function. The subproblem count times the work per subproblem is the new bound — fib goes from O(φⁿ) to O(n) because there are n distinct arguments.",
      "It is only sound for a PURE function: same arguments, same result, no side effects. Memoising a function that reads mutable state, or whose arguments are unhashable, is a correctness bug rather than a slow program.",
    ],
    trap: "An unbounded cache on a long-running process is a memory leak. `functools.lru_cache(maxsize=…)` exists for that; `cache` is `lru_cache(maxsize=None)`.",
    seeAlso: ["dynamic-programming", "hash-map"],
    reading: [
      { title: "Memoization (Wikipedia)", url: "https://en.wikipedia.org/wiki/Memoization" },
      { title: "functools.cache / lru_cache", url: "https://docs.python.org/3/library/functools.html#functools.cache" },
    ],
  },
  {
    slug: "greedy",
    term: "greedy",
    aliases: ["greedy algorithm"],
    short:
      "Take the locally best choice at every step and never reconsider — fast, and correct only when you can prove the local choice is safe.",
    body: [
      "When it works it is usually the cleanest solution on the page: interval scheduling by earliest finish time, `jump-game`'s furthest-reach sweep, Huffman coding. The proof obligation is real though — an exchange argument, showing any optimal solution can be rewritten to include your greedy choice without getting worse.",
      "When it fails it fails silently on inputs that look ordinary. The honest ladder keeps both rungs on the page: `coin-change-min` shows the greedy answer being wrong, which is more instructive than any rule of thumb about when to reach for it.",
    ],
    trap: "\"It passed the examples\" is not a proof. Greedy's failures are constructed, not random — look for the case where a slightly worse choice now unlocks a much better one later.",
    seeAlso: ["dynamic-programming"],
    reading: [
      { title: "Greedy algorithm (Wikipedia)", url: "https://en.wikipedia.org/wiki/Greedy_algorithm" },
    ],
  },
  {
    slug: "topological-sort",
    term: "topological sort",
    aliases: ["toposort", "kahn's algorithm"],
    short:
      "An ordering of a directed acyclic graph in which every edge points forward — the order you can actually do the tasks in.",
    body: [
      "Course prerequisites, build dependencies, and task schedulers are all this. Kahn's algorithm is the readable form: count each node's incoming edges, start a [[queue]] with the zero-count nodes, and every time you remove one, decrement its neighbours and enqueue the ones that hit zero.",
      "It doubles as CYCLE DETECTION, which is the part that makes it worth knowing: if the ordering you produce is shorter than the number of nodes, the leftovers are in a cycle and no valid order exists. That is the whole answer to \"can these courses be finished\".",
    ],
    costs: [
      { op: "order a graph", bound: "O(V + E)", unless: "there is a cycle, in which case there is no ordering at all and the algorithm's job is to say so" },
    ],
    seeAlso: ["graph", "breadth-first-search", "queue"],
    reading: [
      { title: "Topological sorting (Wikipedia)", url: "https://en.wikipedia.org/wiki/Topological_sorting" },
    ],
  },
  {
    slug: "monotonic-stack",
    term: "monotonic stack",
    short:
      "A [[stack]] kept sorted as you push — pop everything that breaks the order first — which answers \"the next greater element\" for a whole array in one pass.",
    body: [
      "Daily temperatures, next greater element, largest rectangle in a histogram, trapping rain water: each is O(n²) with a nested scan and O(n) with this. The insight is that an element which is smaller than the one arriving can never be the answer for anything further right, so popping it is not losing information — it is discarding a candidate that is provably dead.",
      "Every element is pushed once and popped once, which is why a loop with a `while` inside it is still linear. Whether the stack holds values or INDICES is the design decision: indices, almost always, because the distance between positions is usually part of the answer.",
    ],
    trap: "Leftovers on the stack at the end are the elements with no next-greater — they need an explicit answer (often 0 or −1), not to be forgotten.",
    seeAlso: ["stack", "sliding-window", "big-o"],
    source: "Xu & Gunawardane, Coding Interview Patterns (2024), ch. stacks",
  },
]
