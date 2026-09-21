// How work is counted, and what the counting hides.
//
// These entries exist because the corpus makes claims in this vocabulary on
// every page — "O(n) time, O(1) space", "amortised", "in place" — and a reader
// who half-knows the words reads those claims as stronger than they are. Each
// entry therefore names what the notation DROPS as prominently as what it says.
import type { Term } from "../types.ts"

export const COMPLEXITY_TERMS: Term[] = [
  {
    slug: "big-o",
    term: "big-O notation",
    aliases: ["big o", "time complexity", "asymptotic complexity", "complexity"],
    short:
      "An upper bound on how the work grows as the input grows, with constants and lower-order terms deliberately thrown away.",
    body: [
      "O(n) means the work grows at most proportionally to n for large enough n. It is a statement about GROWTH, not about speed: an O(n) algorithm with a large constant loses to an O(n log n) one at every size you will ever run. That is not a technicality — timing the rungs on five problems in this repo found the designated optimal rung losing on the clock in three of them.",
      "Read a constraint before you choose a bound. At roughly 10⁸–10⁹ simple operations per second, n ≤ 10⁵ rules out O(n²) (10¹⁰ operations), n ≤ 5000 allows it, and n ≤ 20 is a hint that an exponential search over subsets is intended. The constraint is the problem telling you which bound it will accept.",
      "Three siblings are worth keeping straight: O is an upper bound, Ω a lower bound, Θ both at once. Saying an algorithm \"is O(n²)\" when it is Θ(n) is technically true and practically misleading.",
    ],
    trap: "A bound is per-call. `if x in seen` inside a loop over n items is O(n) only when `seen` is a [[set]]; if it is a list, the same line is O(n²) and reads identically.",
    seeAlso: ["amortized-analysis", "space-complexity", "cache-locality"],
    reading: [
      { title: "Big O notation (Wikipedia)", url: "https://en.wikipedia.org/wiki/Big_O_notation" },
      { title: "Python: time complexity of the built-in containers", url: "https://wiki.python.org/moin/TimeComplexity", note: "the per-operation table the bounds on this site are counted from" },
    ],
  },
  {
    slug: "amortized-analysis",
    term: "amortized analysis",
    aliases: ["amortised", "amortized", "amortised cost"],
    short:
      "The average cost per operation over a whole sequence, when one occasional expensive step pays for many cheap ones.",
    body: [
      "Appending to a [[dynamic array]] is the canonical case: almost every append is O(1), and the one that finds the block full copies everything, O(n). Because the block DOUBLES, those copies are rare enough that n appends cost O(n) in total — so each is O(1) amortised, and the bound is honest rather than a rounding-off.",
      "It is not the same as average-case. Average-case averages over INPUTS and can be defeated by an unlucky one; amortised averages over a SEQUENCE of operations and holds for every sequence. The distinction matters where a single slow operation is unacceptable — a real-time frame budget or a latency SLO cares about the O(n) copy, not about the average.",
    ],
    trap: "Growth by a constant amount instead of a constant factor destroys the bound: adding 10 slots each time makes n appends O(n²).",
    seeAlso: ["dynamic-array", "big-o", "hash-map"],
    reading: [
      { title: "Amortized analysis (Wikipedia)", url: "https://en.wikipedia.org/wiki/Amortized_analysis" },
    ],
  },
  {
    slug: "space-complexity",
    term: "space complexity",
    aliases: ["extra space", "auxiliary space", "memory"],
    short:
      "How much memory the algorithm uses beyond its input, counted the same way time is.",
    body: [
      "Almost every statement that says \"O(1) extra space\" means auxiliary space — the input does not count, the output usually does not either. That convention is why an [[in-place]] reversal is O(1) despite holding a whole array: it was given that array.",
      "The one people forget is the call stack. A recursive [[depth-first search]] on a skewed tree is O(n) space even though the code allocates nothing, and that is exactly the case that overflows — the space is real whether or not you typed it.",
    ],
    seeAlso: ["in-place", "big-o", "depth-first-search"],
    reading: [
      { title: "In-place algorithm (Wikipedia)", url: "https://en.wikipedia.org/wiki/In-place_algorithm" },
    ],
  },
  {
    slug: "in-place",
    term: "in place",
    aliases: ["in-place", "o(1) extra space"],
    short:
      "Transforming the input using O(1) extra memory, by overwriting it rather than building a copy.",
    body: [
      "The read-index / write-index pair is the standard move: one pointer reads every element, a second writes only the survivors, and everything before the write index is final. `move-zeroes`, `remove-duplicates-sorted` and `sort-colors` are all this shape.",
      "In place has a cost the bound does not show — it destroys the caller's data. If the input is read again afterwards you either owe it a restoration pass or you owe the caller a documented contract, and \"which contract am I honouring\" is a question worth answering out loud rather than discovering in review.",
    ],
    trap: "Advancing the write index on an element you skipped overwrites a survivor. The invariant is: everything before `write` is final, everything from `read` on is untouched, and the gap between them is garbage you may clobber.",
    seeAlso: ["space-complexity", "two-pointers", "dynamic-array"],
    reading: [
      { title: "In-place algorithm (Wikipedia)", url: "https://en.wikipedia.org/wiki/In-place_algorithm" },
    ],
  },
  {
    slug: "stable-sort",
    term: "stable sort",
    aliases: ["stability", "stable sorting"],
    short:
      "A sort that keeps equal elements in their original relative order — which is what makes sorting by two keys, one after the other, work.",
    body: [
      "Sort by name, then by department with a stable sort, and within each department the names are still in order. With an unstable sort that second pass scrambles the first, and the bug shows up only on inputs with ties.",
      "Python's `sorted` and `list.sort` are stable and guaranteed so by the language; they run Timsort, which exploits runs already present in the data and is O(n) on sorted input. Java's `Arrays.sort` is stable for objects and NOT for primitives; C++'s `std::sort` is not stable at all — `std::stable_sort` is the one that is. This is a portability trap for anyone translating a solution between the three languages, which this repo does on every rung.",
    ],
    costs: [
      { op: "comparison sort, lower bound", bound: "O(n log n)", unless: "you are not comparing — counting sort and radix sort beat it by using the keys' structure" },
      { op: "Timsort on already-sorted input", bound: "O(n)" },
    ],
    seeAlso: ["big-o", "dynamic-array"],
    reading: [
      { title: "Sorting algorithm: stability (Wikipedia)", url: "https://en.wikipedia.org/wiki/Sorting_algorithm" },
      { title: "CPython: listsort.txt", url: "https://github.com/python/cpython/blob/main/Objects/listsort.txt", note: "Tim Peters' own description of the run-detection that makes it O(n) on ordered data" },
    ],
  },
  {
    slug: "cache-locality",
    term: "cache locality",
    aliases: ["locality of reference", "cache friendly"],
    short:
      "The reason two algorithms with the same big-O can differ by 10× — memory that sits next to memory you just read is effectively free, and memory that does not costs a trip to RAM.",
    body: [
      "A cache line is 64 bytes, so walking a [[dynamic array]] brings the next several elements along for free. Walking a [[linked list]] of the same length dereferences a pointer per node to wherever the allocator put it, and each miss is on the order of a hundred nanoseconds against about one for an L1 hit. Same O(n), very different wall clock.",
      "This is why [[big-O notation]] is a statement about growth and not about speed, and why the honest way to rank two implementations is to run them. It is also why modern hash tables (Abseil's Swiss tables, Meta's F14) probe within a contiguous block instead of chasing chains.",
    ],
    seeAlso: ["big-o", "dynamic-array", "linked-list", "hash-map"],
    reading: [
      { title: "Locality of reference (Wikipedia)", url: "https://en.wikipedia.org/wiki/Locality_of_reference" },
      { title: "Latency numbers every programmer should know", url: "https://colin-scott.github.io/personal_website/research/interactive_latency.html", note: "the L1-vs-RAM gap, by year, which is the whole argument" },
    ],
  },
]
