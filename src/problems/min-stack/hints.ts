// min-stack — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "getMin has to be constant, so the answer cannot be computed when it is asked — it has to be already known.",
  "The minimum of the stack changes only at pushes and pops. What if each entry remembered the minimum as of the moment it was pushed?",
  "Then popping restores the previous entry's record automatically, and no history has to be reconstructed.",
]
