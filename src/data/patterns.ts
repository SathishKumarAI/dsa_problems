import type { Pattern } from "./types.ts"

// Order here = order in the sidebar (rough difficulty ramp).
export const PATTERNS: Pattern[] = [
  {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    glyph: "{ k→v }",
    blurb: "Trade memory for speed: one pass with a hash map replaces a nested scan.",
    references: [
      {
        title: "Hash table",
        href: "https://en.wikipedia.org/wiki/Hash_table",
        kind: "reference",
        note: "What the table actually does with your key - buckets, collisions, and why O(1) is an average and not a promise.",
      },
      {
        title: "Sedgewick & Wayne, Hash Tables",
        href: "https://algs4.cs.princeton.edu/34hash/",
        kind: "course",
        note: "Separate chaining and linear probing, built up from code. Read this when you want to know what your language is doing for you.",
      },
      {
        title: "Python: dict and set",
        href: "https://docs.python.org/3/library/stdtypes.html",
        kind: "docs",
        note: "The guarantees you may actually rely on - including that insertion order is a language promise in CPython, and hash order is not.",
      },
    ],
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    glyph: "i→ ←j",
    blurb: "Sorted or symmetric input: move two indices toward each other instead of trying all pairs.",
    references: [
      {
        title: "USACO Guide: Two Pointers",
        href: "https://usaco.guide/silver/two-pointers",
        kind: "course",
        note: "The converging and parallel forms side by side, with the termination argument for each - the part people skip and then get wrong.",
      },
      {
        title: "Cycle detection",
        href: "https://en.wikipedia.org/wiki/Cycle_detection",
        kind: "reference",
        note: "Why a fast pointer and a slow one must meet inside a cycle. The proof is short, and it is the thing an interviewer asks for.",
      },
      {
        title: "Tortoise and hare",
        href: "https://cp-algorithms.com/others/tortoise_and_hare.html",
        kind: "reference",
        note: "The same algorithm written as code, plus how to recover the START of the cycle once you know one exists.",
      },
    ],
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    glyph: "[■■□]→",
    blurb: "Best contiguous run: grow the right edge, shrink the left when the window breaks a rule.",
    references: [
      {
        title: "Sliding window minimum",
        href: "https://cp-algorithms.com/data_structures/stack_queue_modification.html",
        kind: "reference",
        note: "The monotonic deque: how to keep the minimum of a moving window in O(1) amortised, which is the one hard version of this pattern.",
      },
      {
        title: "Amortized analysis",
        href: "https://en.wikipedia.org/wiki/Amortized_analysis",
        kind: "reference",
        note: "Why a window with a nested-looking inner loop is still O(n). If you cannot explain that, you cannot defend the solution.",
      },
      {
        title: "USACO Guide: Two Pointers",
        href: "https://usaco.guide/silver/two-pointers",
        kind: "course",
        note: "Files the sliding window under two pointers, which is the honest taxonomy - the window IS two indices with a rule about the gap.",
      },
    ],
  },
  {
    id: "stack",
    name: "Stack",
    glyph: "[≡]↕",
    blurb: "Most-recent-first matching: parentheses, previous-greater, undo of the last open thing.",
    references: [
      {
        title: "Stack (abstract data type)",
        href: "https://en.wikipedia.org/wiki/Stack_(abstract_data_type)",
        kind: "reference",
        note: "The operations and their costs, and the call-stack connection that makes every recursive solution a stack solution in disguise.",
      },
      {
        title: "Python: collections.deque",
        href: "https://docs.python.org/3/library/collections.html",
        kind: "docs",
        note: "Why a list is a fine stack and a terrible queue, and what deque costs at each end.",
      },
      {
        title: "Minimum stack, minimum queue",
        href: "https://cp-algorithms.com/data_structures/stack_queue_modification.html",
        kind: "reference",
        note: "Keeping a running minimum in O(1) alongside the stack itself - the trick behind the monotonic-stack problems here.",
      },
    ],
  },
  {
    id: "binary-search",
    name: "Binary Search",
    glyph: "lo·mid·hi",
    blurb: "Monotonic answer space: halve it every step — search values, not just indices.",
    references: [
      {
        title: "Binary search",
        href: "https://en.wikipedia.org/wiki/Binary_search",
        kind: "reference",
        note: "The invariant, the overflow-safe midpoint, and the two boundary variants that return different answers on duplicates.",
      },
      {
        title: "Binary search on the answer",
        href: "https://cp-algorithms.com/num_methods/binary_search.html",
        kind: "reference",
        note: "The step up: search a space of ANSWERS rather than a position in an array. Most hard problems in this pattern are this.",
      },
      {
        title: "Python: bisect",
        href: "https://docs.python.org/3/library/bisect.html",
        kind: "docs",
        note: "bisect_left versus bisect_right stated precisely - the same off-by-one you will hand-write, already named.",
      },
    ],
  },
  {
    id: "linked-list",
    name: "Linked List",
    glyph: "•→•→∅",
    blurb: "Pointer surgery: fast/slow runners, reversal, and dummy heads solve most of it.",
    references: [
      {
        title: "Linked list",
        href: "https://en.wikipedia.org/wiki/Linked_list",
        kind: "reference",
        note: "The variants and their trade-offs, and why every operation is cheap except the one you need most: finding a node.",
      },
      {
        title: "Cycle detection",
        href: "https://en.wikipedia.org/wiki/Cycle_detection",
        kind: "reference",
        note: "Floyd and Brent. The proof that the runners meet, and how to find where the loop begins.",
      },
      {
        title: "Sedgewick & Wayne, Bags, Queues, and Stacks",
        href: "https://algs4.cs.princeton.edu/13stacks/",
        kind: "course",
        note: "Linked structures built from nothing, with the memory cost of a node counted honestly.",
      },
    ],
  },
  {
    id: "trees",
    name: "Trees",
    glyph: "┌┴┐",
    blurb: "Recursion mirrors the structure: define the answer for a node from its children's answers.",
    references: [
      {
        title: "Binary search tree",
        href: "https://en.wikipedia.org/wiki/Binary_search_tree",
        kind: "reference",
        note: "The ordering invariant, and how it degrades to a linked list on sorted input - which is the whole reason balancing exists.",
      },
      {
        title: "Tree traversal",
        href: "https://en.wikipedia.org/wiki/Tree_traversal",
        kind: "reference",
        note: "Pre-, in-, post- and level-order in one place, with the iterative forms. In-order on a BST giving sorted output is the fact most problems lean on.",
      },
      {
        title: "Sedgewick & Wayne, Binary Search Trees",
        href: "https://algs4.cs.princeton.edu/32bst/",
        kind: "course",
        note: "Insert, delete and the analysis. Delete is the one nobody can write from memory, and this is where to learn why.",
      },
    ],
  },
  {
    id: "heaps",
    name: "Heaps",
    glyph: "▲ top",
    blurb: "Repeated min/max of a changing set: a heap gives it in O(log n) per operation.",
    references: [
      {
        title: "Binary heap",
        href: "https://en.wikipedia.org/wiki/Binary_heap",
        kind: "reference",
        note: "The array-as-a-tree layout, sift-up and sift-down, and why BUILDING a heap is O(n) and not O(n log n).",
      },
      {
        title: "Python: heapq",
        href: "https://docs.python.org/3/library/heapq.html",
        kind: "docs",
        note: "The module every Python solution here uses - including the min-heap-only limitation and the negate-to-invert workaround.",
      },
      {
        title: "Sedgewick & Wayne, Priority Queues",
        href: "https://algs4.cs.princeton.edu/24pq/",
        kind: "course",
        note: "Priority queues and heapsort, with the top-k discussion these problems are really about.",
      },
    ],
  },
  {
    id: "graphs",
    name: "Graphs",
    glyph: "v—e—v",
    blurb: "Explicit or implicit networks: BFS for shortest hops, DFS for reachability and cycles.",
    references: [
      {
        title: "Breadth-first search",
        href: "https://cp-algorithms.com/graph/breadth-first-search.html",
        kind: "reference",
        note: "BFS with the proof that it finds shortest paths on an UNWEIGHTED graph - the precondition that decides BFS versus Dijkstra.",
      },
      {
        title: "Dijkstra's algorithm",
        href: "https://cp-algorithms.com/graph/dijkstra.html",
        kind: "reference",
        note: "Both implementations and their costs, plus why a negative edge breaks the greedy argument outright.",
      },
      {
        title: "Sedgewick & Wayne, Undirected Graphs",
        href: "https://algs4.cs.princeton.edu/41graph/",
        kind: "course",
        note: "Representations first - adjacency list versus matrix - because choosing wrong is what actually makes graph code slow.",
      },
    ],
  },
  {
    id: "dp",
    name: "Dynamic Programming",
    glyph: "dp[i-1]",
    blurb: "Overlapping subproblems: define state, write the recurrence, fill the table.",
    references: [
      {
        title: "Dynamic programming",
        href: "https://en.wikipedia.org/wiki/Dynamic_programming",
        kind: "reference",
        note: "Optimal substructure and overlapping subproblems: the two properties that decide whether DP is even applicable.",
      },
      {
        title: "USACO Guide: Introduction to DP",
        href: "https://usaco.guide/gold/intro-dp",
        kind: "course",
        note: "Worked problems that force you to name the state before writing the recurrence - the step that makes the rest mechanical.",
      },
      {
        title: "MIT 6.006, Introduction to Algorithms",
        href: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
        kind: "course",
        note: "Full lectures and notes. The DP sequence is the clearest free treatment of how to choose a subproblem.",
      },
    ],
  },
]
