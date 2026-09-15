// replace-words — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "For one word you want the shortest prefix that is a root. In what order does a trie walk encounter a word's prefixes?",
  "Shortest first, by construction — so the FIRST flagged node you reach walking down is the answer, and you can stop there.",
  "Falling off the trie before reaching any flag means no root applies, and the word is kept as it is.",
]
