// find-pivot-index — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "Recomputing one side from scratch at every index redoes almost all of the same additions.",
  "The total never changes. If you know the running sum of everything before i, what is the sum of everything after it?",
  "total - running - nums[i]. One pass, two numbers, and the whole array's sum computed once up front.",
]
