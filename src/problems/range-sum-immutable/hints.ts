// range-sum-immutable — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "Every query re-adds values that earlier queries already added. What could be computed once instead?",
  "Store the total of everything BEFORE each index. Then a range is the difference of two of those totals.",
  "Decide what prefix[0] means and stick to it: the sum of nothing, which is 0, gives the empty prefix a home and kills the off-by-one.",
]
