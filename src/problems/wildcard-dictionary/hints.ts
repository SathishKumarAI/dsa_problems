// wildcard-dictionary — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "Without dots this is a plain trie walk. Where exactly does a dot break that walk?",
  "At a dot you do not know which child to follow, so try them all — that turns the walk into a recursion over the children.",
  "Every branch still consumes one character of the pattern, so the recursion depth is the pattern's length and it always terminates.",
]
