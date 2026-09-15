// three-sum-closest — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "Every triple is a candidate. The only real question is how many of them you can avoid looking at.",
  "Sorting tells you which direction helps: if the current sum is under the target, the only way to raise it is to reach for a bigger value.",
  "Fix the first value and put two pointers on the rest. Each step either raises the sum or lowers it and retires one index, so a whole inner scan finishes in linear time — and a sum that lands exactly on the target cannot be beaten, so you can stop there.",
]
