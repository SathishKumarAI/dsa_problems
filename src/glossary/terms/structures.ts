// What holds the data. One entry per structure the corpus actually reaches
// for — nothing here is an encyclopaedia entry for its own sake.
//
// House rules for writing one, learned from the teaching documents:
//   * `short` must survive being read ALONE, in a popover, by someone who
//     stopped mid-sentence. No "see below".
//   * the cost table is the operations this repo's problems perform, with the
//     `unless` column carrying the case that breaks the bound. A bound with no
//     stated exception is a bound a reader will trust in the one place it
//     does not hold.
//   * `trap` is the thing someone who has just learned the word still gets
//     wrong. If there isn't one, the entry is probably too shallow.
import type { Term } from "../types.ts"

export const STRUCTURE_TERMS: Term[] = [
  {
    slug: "hash-map",
    term: "hash map",
    aliases: ["hash table", "dictionary", "dict", "map", "hashmap"],
    short:
      "A table that turns a key into a position with arithmetic instead of a search, so lookup costs about the same whether it holds ten keys or ten million.",
    body: [
      "A [[hash function]] maps a key to a slot index. Storing and finding a key is then index arithmetic — no scan — which is why swapping a nested loop for a hash map is the single most common way a problem on this site goes from O(n²) to O(n). The price is space and ORDER: you gave up the ability to ask for the smallest key, or the keys in sorted order, and you pay real memory per entry.",
      "The O(1) is average, not worst. Two keys can land in the same slot — a [[collision]] — and every implementation has a fallback that is slower: CPython probes other slots (open addressing), Java's `HashMap` chains entries in a bucket and, past a threshold, re-hangs that bucket as a balanced tree. An adversary who can choose the keys can force every one of them into the same slot and turn your O(1) lookup into O(n); this is a real denial-of-service class, which is why Python randomises string hashing per process by default.",
      "What it is NOT is a free lunch on iteration. Walking a hash map is O(capacity), not O(size), and the order you get back is an implementation detail — insertion order in CPython since 3.7 as a language guarantee, arbitrary in Java, arbitrary in C++'s `unordered_map`.",
    ],
    costs: [
      { op: "lookup, insert, delete", bound: "O(1)", unless: "average case — adversarial or badly distributed keys degrade to O(n)" },
      { op: "iterate every key", bound: "O(capacity)", unless: "never O(size): a table emptied of a million keys still walks a million slots" },
      { op: "smallest / sorted keys", bound: "O(n log n)", unless: "you sort them yourself; the structure cannot answer this" },
    ],
    trap: "Insert-then-look-up pairs an element with itself. A one-pass two-sum that stores `3` and then asks for `6 − 3` finds its own index; look up first, then insert.",
    seeAlso: ["hash-function", "collision", "set", "big-o", "amortized-analysis"],
    reading: [
      { title: "CPython: how dictionaries are implemented", url: "https://docs.python.org/3/faq/design.html#how-are-dictionaries-implemented-in-cpython", note: "open addressing, from the people who wrote it" },
      { title: "Python: time complexity of the built-in containers", url: "https://wiki.python.org/moin/TimeComplexity", note: "the amortised table this page's bounds come from" },
      { title: "Abseil: Swiss tables", url: "https://abseil.io/about/design/swisstables", note: "Google's open-addressing design, and why probing beats chaining on modern hardware" },
      { title: "Meta engineering: F14, a 14-way probing hash table", url: "https://engineering.fb.com/2019/04/25/developer-tools/f14/", note: "the same trade measured at production scale" },
    ],
    source: "Xu & Gunawardane, Coding Interview Patterns (2024), ch. hash maps & sets",
  },
  {
    slug: "hash-function",
    term: "hash function",
    aliases: ["hashing", "hash"],
    short:
      "A function that turns a key of any size into a fixed-size number, used to pick which slot of a [[hash map]] the key belongs in.",
    body: [
      "Two properties matter here and only here. It must be DETERMINISTIC — the same key gives the same number every time within one run — and it should spread keys evenly, because a function that sends half its keys to one slot has built a linked list with extra steps. Cryptographic strength is a different requirement entirely and costs far more than a table lookup needs.",
      "The number is then reduced to a slot, usually with a mask or a modulo. This is where a subtle failure lives: if the low bits of your hashes are correlated (say, keys that are all multiples of 16), masking keeps exactly the bits that are all the same. Java's `HashMap` mixes the high bits down into the low ones for that reason; CPython's small-integer hash is the integer itself, which is a deliberate trade — fast, and pathological for keys spaced exactly one table-size apart.",
    ],
    trap: "`hash(x)` is not stable across processes for strings in Python — hash randomisation is on by default. Never persist it, never use it as an id.",
    seeAlso: ["hash-map", "collision"],
    reading: [
      { title: "Hash table (Wikipedia)", url: "https://en.wikipedia.org/wiki/Hash_table" },
      { title: "Sedgewick & Wayne, Algorithms 4: hash tables", url: "https://algs4.cs.princeton.edu/34hash/", note: "the uniform-hashing assumption stated properly, with the maths" },
    ],
  },
  {
    slug: "collision",
    term: "collision",
    aliases: ["hash collision", "collisions"],
    short:
      "Two different keys landing in the same slot of a [[hash map]] — expected, not a bug, and the reason its O(1) is an average rather than a guarantee.",
    body: [
      "Collisions are unavoidable: there are more possible keys than slots. The birthday problem makes them common far earlier than intuition suggests — with 23 keys in a 365-slot table the odds of at least one collision are already about even. So every hash map ships a resolution strategy, and which one it is determines how it degrades.",
      "Chaining hangs colliding entries off the slot in a list (Java, C++'s `unordered_map`). Open addressing probes for another free slot (CPython, Abseil's Swiss tables, Meta's F14), which keeps everything in one cache-friendly block but makes deletion awkward — a removed entry has to leave a tombstone or the probe sequence breaks and lookups start missing keys that are present.",
    ],
    trap: "Deleting from an open-addressed table by clearing the slot silently breaks every key whose probe ran through it. This is why tombstones exist, and why a table full of tombstones needs a rebuild.",
    seeAlso: ["hash-map", "hash-function"],
    reading: [
      { title: "Open addressing (Wikipedia)", url: "https://en.wikipedia.org/wiki/Open_addressing" },
      { title: "java.util.HashMap", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html", note: "states the load factor and the bucket-to-tree threshold in the contract" },
    ],
  },
  {
    slug: "set",
    term: "set",
    aliases: ["hash set", "seen set"],
    short:
      "A [[hash map]] with keys and no values: it answers \"have I seen this\" in O(1) and nothing else.",
    body: [
      "Almost every \"is there a duplicate\", \"is this a member\", \"how many distinct\" problem is a set. Reaching for a map when you never read the values costs memory and says the wrong thing to a reader: a set in the code is a claim that only membership matters.",
      "The cost profile is the map's, including the parts people forget — no order, O(capacity) iteration, and a worst case that is linear under adversarial keys. A sorted alternative (`SortedSet`, a balanced tree, or just sorting first) trades O(1) membership for the ability to ask for neighbours, which is exactly the trade `longest-consecutive-run` makes on its page.",
    ],
    seeAlso: ["hash-map", "big-o"],
    reading: [
      { title: "Python: time complexity of set operations", url: "https://wiki.python.org/moin/TimeComplexity" },
    ],
  },
  {
    slug: "dynamic-array",
    term: "dynamic array",
    aliases: ["array", "list", "vector", "arraylist"],
    short:
      "A block of contiguous memory with spare room at the end, so appending is O(1) on average even though the block itself never grows in place.",
    body: [
      "Indexing is one multiply and one load, which is why an array beats every other structure at reading position i, and why [[cache locality]] makes a linear scan over one dramatically faster than the same number of pointer hops. Appending is O(1) [[amortized analysis|amortised]]: when the block fills, a bigger one is allocated and everything is copied, and the doubling makes the average cost of a push constant even though one push in n is O(n).",
      "Insertion or deletion anywhere else is O(n), because every element after the hole has to move. That single fact decides a surprising number of problems on this site: `move-zeroes` is fast because it never inserts — it overwrites with a write index — and the naive version that removes zeroes one at a time is quadratic for exactly this reason.",
    ],
    costs: [
      { op: "read or write a[i]", bound: "O(1)" },
      { op: "append", bound: "O(1)", unless: "amortised — the resize copy is O(n) and lands on one push in n" },
      { op: "insert or delete in the middle", bound: "O(n)" },
      { op: "search for a value", bound: "O(n)", unless: "sorted, where [[binary search]] makes it O(log n)" },
    ],
    trap: "Deleting while iterating forwards skips elements: removing index i shifts i+1 down into i, and the loop then steps past it. Iterate backwards, or write to a second index.",
    seeAlso: ["amortized-analysis", "cache-locality", "linked-list", "binary-search"],
    reading: [
      { title: "CPython list implementation", url: "https://github.com/python/cpython/blob/main/Objects/listobject.c", note: "the over-allocation growth pattern, in the source" },
      { title: "Python: time complexity of list operations", url: "https://wiki.python.org/moin/TimeComplexity" },
    ],
  },
  {
    slug: "linked-list",
    term: "linked list",
    aliases: ["list node", "singly linked list"],
    short:
      "Nodes each holding a value and a pointer to the next one, so inserting or removing at a known position is O(1) and reaching position i is O(i).",
    body: [
      "The trade against a [[dynamic array]] is exact and it goes both ways. A list wins when you already hold the node and want to splice — no elements move — and loses at everything positional, because there is no arithmetic that finds the i-th node. It also loses badly on [[cache locality]]: each hop is a pointer dereference to wherever the allocator put that node, and on real hardware that can be an order of magnitude slower than walking an array of the same length.",
      "Almost every list problem in this corpus is one or two standard moves composed: a dummy head (so the real head has a predecessor and the delete-the-first case stops being special), fast-and-slow pointers, an in-place three-pointer reverse, or split-and-weave. The invariant is what people break, not the move — see the linked-list table in `docs/RESOURCES.md`.",
    ],
    costs: [
      { op: "insert or delete, given the node before", bound: "O(1)" },
      { op: "reach position i", bound: "O(i)", unless: "there is no arithmetic that finds the i-th node — this is the cost an array does not pay" },
      { op: "find a value", bound: "O(n)", unless: "and each step is a pointer hop, so the constant is far worse than an array's O(n) — see [[cache locality]]" },
    ],
    trap: "Returning `head` after a splice. If the first node can change, the answer is `dummy.next` — `head` went stale the moment anything moved.",
    seeAlso: ["dynamic-array", "two-pointers", "cache-locality"],
    reading: [
      { title: "Linked list (Wikipedia)", url: "https://en.wikipedia.org/wiki/Linked_list", note: "the variants; the moves this repo teaches are in `docs/RESOURCES.md`" },
    ],
    source: "Khamies, How to Solve Algorithm Problems (2023), ch. 6",
  },
  {
    slug: "stack",
    term: "stack",
    aliases: ["lifo"],
    short:
      "Last in, first out: push and pop at one end, both O(1). The structure of anything nested — brackets, calls, undo.",
    body: [
      "A stack is the right answer whenever the thing you are matching can nest, because nesting means the most recent unfinished item is always the one that must close next. `balanced-brackets` is the pure case; a [[depth-first search]] written iteratively is the same structure holding the call frames the recursion would have.",
      "Python uses a [[dynamic array]] for this (`list.append` / `list.pop`), which is why both ends are not equal: popping the LAST element is O(1), popping the first is O(n) because everything shifts. A `deque` gives you both ends in O(1) and is what a [[queue]] should use.",
    ],
    trap: "Recursion IS a stack, with a limit you did not choose. CPython's default recursion limit is 1000 frames; a DFS over a 10⁵-node path overflows it and the iterative version is the fix, not a bigger limit.",
    seeAlso: ["queue", "depth-first-search", "monotonic-stack", "dynamic-array"],
    reading: [
      { title: "collections.deque", url: "https://docs.python.org/3/library/collections.html#collections.deque", note: "O(1) at both ends, unlike a list" },
    ],
  },
  {
    slug: "queue",
    term: "queue",
    aliases: ["fifo", "deque"],
    short:
      "First in, first out: add at one end, remove from the other. The structure [[breadth-first search]] is built on.",
    body: [
      "A queue visits things in the order they were discovered, which is what makes BFS find the shortest path in an unweighted graph: everything one step away is dequeued before anything two steps away. Swap the queue for a [[stack]] and the same code becomes a depth-first walk that finds *a* path, not the shortest.",
      "Implement it with a `deque`, never with a list. `list.pop(0)` is O(n) — it shifts every remaining element — so a BFS written that way is quadratic in the number of nodes and will time out on the larger constraints in this corpus while looking completely correct.",
    ],
    costs: [
      { op: "enqueue / dequeue on a deque", bound: "O(1)" },
      { op: "dequeue with `list.pop(0)`", bound: "O(n)", unless: "never use it; this is the classic accidental quadratic" },
    ],
    seeAlso: ["stack", "breadth-first-search", "heap"],
    reading: [
      { title: "collections.deque", url: "https://docs.python.org/3/library/collections.html#collections.deque" },
    ],
  },
  {
    slug: "heap",
    term: "heap",
    aliases: ["priority queue", "min heap", "binary heap"],
    short:
      "A tree kept in an array where every parent beats its children, so the best element is at index 0 and push and pop cost O(log n).",
    body: [
      "Use it when you repeatedly need the smallest or largest of a changing set — the k-th largest, a merge of k sorted runs, the next event by time. The ordering is PARTIAL: a heap knows its minimum and nothing else. Reading it out in order costs n pops, which is O(n log n) and is simply heapsort.",
      "The k-largest pattern is the one worth memorising: keep a min-heap of size k, push each element, pop when the heap exceeds k. That is O(n log k) and O(k) space against O(n log n) for sorting everything — a real win when k is small and n is huge, and a loss when k approaches n, which is the sentence most ladders leave out.",
    ],
    costs: [
      { op: "read the best element", bound: "O(1)" },
      { op: "push / pop", bound: "O(log n)" },
      { op: "build from an existing array", bound: "O(n)", unless: "pushing one at a time instead, which is O(n log n)" },
      { op: "find an arbitrary element", bound: "O(n)", unless: "you kept an external index; a heap cannot search" },
    ],
    trap: "Python's `heapq` is a MIN-heap only. For a max-heap, push negated values — and remember to negate them back, including inside comparisons on tuples.",
    seeAlso: ["queue", "big-o", "binary-search-tree"],
    reading: [
      { title: "heapq — the heap invariant, and `nlargest`", url: "https://docs.python.org/3/library/heapq.html", note: "the docs state the O(n) heapify and when nlargest beats sorting" },
    ],
  },
  {
    slug: "binary-search-tree",
    term: "binary search tree",
    aliases: ["bst", "balanced tree", "search tree"],
    short:
      "A tree where everything left of a node is smaller and everything right is larger, so search, insert and delete are O(height).",
    body: [
      "The whole structure rests on that one invariant, and it is global rather than local: `node.left.val < node.val` at every node is NOT enough — the entire left subtree must be below the node, which is why validating one correctly means carrying a (low, high) range down the recursion rather than comparing neighbours.",
      "O(height) is O(log n) only if the tree is balanced. Insert sorted data into a plain BST and it degenerates into a [[linked list]] with O(n) operations — the reason real libraries ship red-black or AVL trees, and the reason a [[hash map]] is usually the better answer unless you need ordered traversal, ranges, or the nearest key.",
    ],
    costs: [
      { op: "search / insert / delete", bound: "O(log n)", unless: "unbalanced, where it is O(n) — sorted input is the usual cause" },
      { op: "in-order traversal", bound: "O(n)", unless: "and it yields the keys in sorted order, which is the thing a hash map cannot do" },
    ],
    seeAlso: ["hash-map", "depth-first-search", "linked-list"],
    reading: [
      { title: "Binary search tree (Wikipedia)", url: "https://en.wikipedia.org/wiki/Binary_search_tree", note: "the invariant stated globally, which is the half people drop" },
    ],
  },
  {
    slug: "trie",
    term: "trie",
    aliases: ["prefix tree", "radix tree"],
    short:
      "A tree keyed by the characters of a string, so every node IS a prefix and finding all words starting with one is a walk down the path that spells it.",
    body: [
      "A [[hash map]] answers \"is this exact word present\" faster. A trie answers a question the map cannot: \"which words start with this\", and it answers it without scanning the dictionary. Autocomplete, IP routing tables and wildcard matching are all this shape. The cost of a lookup is O(length of the key) and — this is the part that matters — independent of how many words are stored.",
      "The space cost is real: a node per character per distinct prefix, each with a child map. For 10⁵ words of length 10 that is millions of pointers, and the usual answer is either a compressed trie (a radix tree, collapsing single-child chains) or admitting a hash map was enough.",
    ],
    costs: [
      { op: "insert / search a key of length L", bound: "O(L)", unless: "independent of the number of keys stored" },
      { op: "all keys with a prefix", bound: "O(L + size of the subtree)" },
      { op: "space", bound: "O(total characters)", unless: "compressed, which collapses single-child chains" },
    ],
    seeAlso: ["hash-map", "depth-first-search"],
    reading: [
      { title: "Trie (Wikipedia)", url: "https://en.wikipedia.org/wiki/Trie" },
    ],
  },
  {
    slug: "union-find",
    term: "union-find",
    aliases: ["disjoint set union", "dsu", "disjoint-set"],
    short:
      "A structure that answers \"are these two in the same group\" and \"merge these two groups\" in near-constant time, without ever building the groups.",
    body: [
      "Each element points at a parent; the root names the group. Two optimisations are what make it fast, and both are required: path compression (every node touched by a find is re-pointed straight at the root) and union by rank or size (the smaller tree is hung under the larger). With both, m operations on n elements cost O(m·α(n)), where α is the inverse Ackermann function and is below 5 for any n that fits in this universe.",
      "Reach for it when connectivity is built up incrementally — counting provinces, detecting the edge that creates a cycle, Kruskal's minimum spanning tree. It cannot do the thing a [[graph]] traversal does: it knows WHETHER two nodes are connected, never the path between them, and it cannot un-merge.",
    ],
    costs: [
      { op: "find / union, with both optimisations", bound: "O(α(n))", unless: "effectively constant; without path compression it is O(log n), without either O(n)" },
      { op: "the path between two nodes", bound: "—", unless: "it cannot answer this at all; use [[breadth-first search]]" },
    ],
    seeAlso: ["graph", "breadth-first-search"],
    reading: [
      { title: "Disjoint-set data structure (Wikipedia)", url: "https://en.wikipedia.org/wiki/Disjoint-set_data_structure" },
      { title: "Sedgewick & Wayne: union-find", url: "https://algs4.cs.princeton.edu/15uf/", note: "the cost of each variant measured, not asserted" },
    ],
  },
  {
    slug: "graph",
    term: "graph",
    aliases: ["adjacency list", "adjacency matrix", "digraph"],
    short:
      "Nodes and the edges between them — the shape of anything relational, and the structure a grid, a dependency list and a social network all secretly are.",
    body: [
      "Most problems that look like graph problems never say the word. A grid is a graph whose neighbours are the four cells around a cell; a course-prerequisite list is a directed graph; a word ladder is a graph whose edges are one-letter changes. Recognising the shape is most of the work, and it is what makes [[breadth-first search]] and [[depth-first search]] apply.",
      "Representation decides cost. An adjacency list (a map from node to its neighbours) is O(V + E) space and is right for the sparse graphs interviews use. An adjacency matrix is O(V²) and only pays when the graph is dense or you need \"is there an edge between exactly these two\" in O(1).",
    ],
    costs: [
      { op: "visit everything, adjacency list", bound: "O(V + E)" },
      { op: "visit everything, adjacency matrix", bound: "O(V²)", unless: "the graph is dense, where the two coincide" },
    ],
    trap: "A visited set is not optional and it must be marked on ENQUEUE, not on dequeue — marking on dequeue lets the same node enter the queue many times and turns a linear BFS quadratic.",
    seeAlso: ["breadth-first-search", "depth-first-search", "union-find", "topological-sort"],
    reading: [
      { title: "Breadth-first search (Wikipedia)", url: "https://en.wikipedia.org/wiki/Breadth-first_search" },
    ],
  },
]
