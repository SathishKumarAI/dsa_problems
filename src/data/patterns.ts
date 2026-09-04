import type { Pattern } from "./types"

// Order here = order in the sidebar (rough difficulty ramp).
export const PATTERNS: Pattern[] = [
  {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    glyph: "{ k→v }",
    blurb: "Trade memory for speed: one pass with a hash map replaces a nested scan.",
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    glyph: "i→ ←j",
    blurb: "Sorted or symmetric input: move two indices toward each other instead of trying all pairs.",
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    glyph: "[■■□]→",
    blurb: "Best contiguous run: grow the right edge, shrink the left when the window breaks a rule.",
  },
  {
    id: "stack",
    name: "Stack",
    glyph: "[≡]↕",
    blurb: "Most-recent-first matching: parentheses, previous-greater, undo of the last open thing.",
  },
  {
    id: "binary-search",
    name: "Binary Search",
    glyph: "lo·mid·hi",
    blurb: "Monotonic answer space: halve it every step — search values, not just indices.",
  },
  {
    id: "linked-list",
    name: "Linked List",
    glyph: "•→•→∅",
    blurb: "Pointer surgery: fast/slow runners, reversal, and dummy heads solve most of it.",
  },
  {
    id: "trees",
    name: "Trees",
    glyph: "┌┴┐",
    blurb: "Recursion mirrors the structure: define the answer for a node from its children's answers.",
  },
  {
    id: "heaps",
    name: "Heaps",
    glyph: "▲ top",
    blurb: "Repeated min/max of a changing set: a heap gives it in O(log n) per operation.",
  },
  {
    id: "graphs",
    name: "Graphs",
    glyph: "v—e—v",
    blurb: "Explicit or implicit networks: BFS for shortest hops, DFS for reachability and cycles.",
  },
  {
    id: "dp",
    name: "Dynamic Programming",
    glyph: "dp[i-1]",
    blurb: "Overlapping subproblems: define state, write the recurrence, fill the table.",
  },
]
