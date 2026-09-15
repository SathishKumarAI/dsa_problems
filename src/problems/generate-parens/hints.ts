// generate-parens — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "Build the string one character at a time and ask, at each step, which characters are still legal.",
  "An opening bracket is legal while fewer than n have been used. A closing bracket is legal only while it has something to close.",
  "That second rule is the whole problem: it prunes the invalid branch before it is built, instead of rejecting it afterwards.",
]
