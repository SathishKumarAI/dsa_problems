// anagram-positions — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "Every candidate has exactly the pattern's length, so this is a fixed-size window sliding along the text.",
  "Comparing two letter counts decides one window. The question is how to get the next window's counts without recounting.",
  "Sliding by one adds one letter and removes one letter — two updates. And a full 26-way comparison per step can be replaced by a single counter of how many letters currently match.",
]
