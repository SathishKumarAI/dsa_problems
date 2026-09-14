import type { Pattern } from "./types.ts"

// Order here = order in the sidebar (rough difficulty ramp).
export const PATTERNS: Pattern[] = [
  {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    glyph: "{ k→v }",
    blurb:
      "Trade memory for speed: one pass with a hash map replaces a nested scan.",
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
    // The six ideas, lifted out of docs/RESOURCES.md, which nothing in src/
    // could read, so the best writing in the repository reached no screen.
    // Order is the order they are worth learning, not difficulty.
    playbook: [
      {
        name: "Two pointers converging",
        idea: "One index from each end, walking inward; each step moves the end that cannot be part of a better answer.",
        tell: '"sorted array", "find two", "the most water", "is it a palindrome" — the answer is a pair or a span, and moving an end changes the score monotonically.',
        invariant:
          "Everything outside [lo, hi] has been ruled out on purpose, and you can say why. The gap shrinks every iteration, which is the whole termination argument.",
        learnOn: ["sorted-pair-sum", "valid-palindrome", "container-water"],
        mistake:
          "Moving the wrong end, and being unable to say why the other one is safe to discard. In container-water, moving the TALLER wall can never increase the area — the width shrinks and the height is still capped by the shorter wall. If you cannot state that sentence, the loop is a guess.",
      },
      {
        name: "Read index and write index",
        idea: "One pointer reads every element, a second writes only the ones that survive — the array is compacted in place behind it.",
        tell: '"in place", "O(1) extra space", "return the new length", "the order of the rest must be preserved".',
        invariant:
          "Everything before write is final, everything from read on is untouched, and the gap between them is garbage you are allowed to clobber.",
        learnOn: ["move-zeroes", "remove-duplicates-sorted", "sort-colors"],
        mistake:
          "Advancing the write index on an element you skipped, so a survivor gets overwritten. The write index moves only when something is written.",
      },
      {
        name: "Prefix sums",
        idea: "Precompute running totals once, so any range answer becomes a single subtraction.",
        tell: '"contiguous subarray", "sum equals k", "product of everything else", "range query" — the array is read-only and the same question is asked at every index.',
        learnOn: ["subarray-sum-k", "product-except-self", "max-subarray"],
        mistake:
          "Forgetting the empty prefix. subarray-sum-k seeds its map with one occurrence of sum 0; without it every subarray starting at index 0 is missed, and [1, 1] with k = 1 returns 1 instead of 2. The second mistake is reaching for a sliding window: with negative values the running sum is not monotonic, which is why that problem's constraints say so out loud.",
      },
      {
        name: "Hash map as an index",
        idea: 'Turn "have I seen X" or "where is X" from a scan into a lookup.',
        tell: '"return the indices", "any duplicate", "group these", "how many times" — or a nested loop whose inner loop only searches.',
        learnOn: [
          "pair-sum",
          "contains-duplicate",
          "group-anagrams",
          "valid-anagram",
        ],
        mistake:
          "Inserting before looking up, so an element pairs with itself: on nums = [3, 4] with target 6, a one-pass Two Sum that stores 3 and then asks for 6 − 3 finds its own index. Look up, then insert. The other one is trusting iteration order — it is insertion order in CPython, an implementation detail, not something to build an answer on.",
      },
      {
        name: "Sort, then scan",
        idea: "Pay O(n log n) once to make the useful elements adjacent, then answer in one linear pass.",
        tell: '"duplicates", "anagrams", "k-th largest", "intervals" — the naive answer is quadratic and the property you need is about neighbours, not positions.',
        learnOn: [
          "contains-duplicate",
          "group-anagrams",
          "longest-consecutive-run",
        ],
        mistake:
          "Sorting when the INDICES are the answer — pair-sum returns positions, and a sort destroys them unless you carry each original index with its value. And sorting out of habit when an O(n) pass exists: longest-consecutive-run keeps both rungs on the page precisely so you can watch the sort get beaten.",
      },
      {
        name: "The value names its own slot",
        idea: "When values are confined to a small known range, the value itself says which index it belongs at — so the array becomes its own hash table.",
        tell: '"values are in the range 1..n", "colours 0, 1, 2", "find the missing or the duplicated one", together with "O(1) extra space".',
        learnOn: ["sort-colors", "missing-number", "first-missing-positive"],
        mistake:
          "Using if where the swap needs while: after swapping a value into its home, the value swapped BACK also needs placing, so you re-test the same index until it settles. And the sign-marking variant silently breaks on a 0, which has no sign to flip.",
      },
    ],
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    glyph: "i→ ←j",
    blurb:
      "Sorted or symmetric input: move two indices toward each other instead of trying all pairs.",
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
    blurb:
      "Best contiguous run: grow the right edge, shrink the left when the window breaks a rule.",
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
    blurb:
      "Most-recent-first matching: parentheses, previous-greater, undo of the last open thing.",
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
    blurb:
      "Monotonic answer space: halve it every step — search values, not just indices.",
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
    blurb:
      "Pointer surgery: fast/slow runners, reversal, and dummy heads solve most of it.",
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
    // The five moves, lifted out of docs/RESOURCES.md. Every row names its
    // invariant, because the invariant is what people break — the move itself
    // is three lines.
    playbook: [
      {
        name: "Dummy head",
        idea: "Allocate a node in front of the real head and build from it, so the first node is not a special case.",
        tell: "The head itself can be deleted, replaced, or is the answer; the list can be empty; you catch yourself writing the same None check twice.",
        invariant:
          "dummy.next is the answer at all times, so head goes stale the moment anything changes and must never be returned. Whatever tail points at is the last COMMITTED node.",
        learnOn: [
          "merge-two-sorted",
          "remove-nth-from-end",
          "remove-list-elements",
        ],
        mistake:
          "Returning head instead of dummy.next — correct on every input where the first node survives, and wrong on exactly the case the dummy was added for.",
      },
      {
        name: "Fast and slow",
        idea: "Two pointers at different speeds, or the same speed with a fixed gap, so one pass learns something about the list's length or shape.",
        tell: '"the middle", "is there a cycle", "the nth from the end", "in one pass, O(1) space".',
        invariant:
          "Before every dereference both fast and fast.next exist — that is what the two-part while condition buys. With a gap, the gap is EXACTLY n for the whole walk, so it must be established before the joint walk starts.",
        learnOn: ["cycle-detect", "middle-of-list", "remove-nth-from-end"],
        mistake:
          "The even-length middle. Testing fast and fast.next leaves slow on the SECOND of the two middles; testing fast.next and fast.next.next leaves it on the first. Both are correct loops for different problems — choose on purpose, and test a four-node list.",
      },
      {
        name: "Reverse in place",
        idea: "Three pointers — previous, current and next — walking the list once and turning every arrow around as they pass.",
        tell: '"reverse", "compare front to back", "reorder" — anything needing a backwards walk through a structure with no back pointers.',
        invariant:
          "At the top of every iteration: previous heads the already-reversed prefix, current heads the untouched suffix, and no node is orphaned — which means the next pointer is saved BEFORE current.next is overwritten.",
        learnOn: ["reverse-list", "palindrome-list", "reorder-list"],
        mistake:
          "Returning current — it is None when the loop ends — instead of previous. Worth knowing too that the loop is already correct on the empty list and the single node with no special case: if you wrote one, you did not trust the invariant.",
      },
      {
        name: "Split and weave",
        idea: "Find the middle, reverse or reorder one half, then compare or interleave the two.",
        tell: '"palindrome", "reorder the list", "is the second half like the first" — the answer needs both ends at once.',
        invariant:
          "Decide whether the front half's tail is terminated. palindrome-list deliberately does NOT terminate it, which is safe only because the comparison stops when the reversed side runs out. If you WEAVE rather than compare you must null the first half's tail or you build a cycle.",
        learnOn: ["palindrome-list", "reorder-list"],
        mistake:
          "Assuming the caller's list survives. Reversing a half mutates the input; if the list is read again after your call you owe it a second reverse to restore it. Say which contract you are honouring.",
      },
      {
        name: "Two-pass with a length",
        idea: "Count the nodes, then walk to a computed position — the version you can always derive under pressure.",
        tell: '"the nth from the end", "the middle", "rotate by k" where k can exceed the length, so k mod n is needed anyway.',
        invariant:
          "The list must not change between the passes, and both passes count from the same end. To DELETE at position i you must stop at i−1, so the walk is one step shorter than the one that merely finds it.",
        learnOn: ["remove-nth-from-end", "middle-of-list", "rotate-list"],
        mistake:
          "Walking n − k steps when you need n − k − 1 to hold the predecessor. This is the whole reason a dummy head earns its allocation: with it the first node has a predecessor and the off-by-one disappears.",
      },
    ],
  },
  {
    id: "trees",
    name: "Trees",
    glyph: "┌┴┐",
    blurb:
      "Recursion mirrors the structure: define the answer for a node from its children's answers.",
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
    blurb:
      "Repeated min/max of a changing set: a heap gives it in O(log n) per operation.",
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
    blurb:
      "Explicit or implicit networks: BFS for shortest hops, DFS for reachability and cycles.",
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
    blurb:
      "Overlapping subproblems: define state, write the recurrence, fill the table.",
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
