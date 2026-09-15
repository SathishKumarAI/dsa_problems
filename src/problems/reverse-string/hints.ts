// reverse-string — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "The first character has to end up last. Which other character has an equally obvious destination?",
  "Position i and position n - 1 - i trade places, and that one pairing covers every character in the string.",
  "So walk one index in from each end, swap, and stop when they meet: n/2 swaps, no second buffer, and the middle of an odd string is already home.",
]
