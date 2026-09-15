// find-all-duplicates — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "You are asked which values repeat, not where — so you need a record of what has been seen, one entry per value.",
  "The values are 1..n and the array has n slots. A value is a slot number: value v can be recorded at position v - 1.",
  "Every value is positive, so the sign of nums[v - 1] is a free flag: flip it the first time v is seen, and a value that lands on an already-negative slot is a repeat.",
]
