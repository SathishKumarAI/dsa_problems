// implement-trie — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "Store one character per EDGE, not per node, and a word becomes a path from the root.",
  "Shared prefixes then share nodes automatically — which is where all the savings come from.",
  "search and startsWith walk identically. They differ only in what they ask of the node they land on: is this the end of a word, or merely reachable?",
]
