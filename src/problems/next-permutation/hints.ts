// next-permutation — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "The next arrangement differs from this one as far to the RIGHT as possible — the front stays put as long as it can.",
  "Scan from the right for the first position whose value is smaller than its neighbour. Everything past it is descending, which means it is already the largest it can be.",
  "Swap that position with the smallest value to its right that still beats it, then make the tail as small as possible. The tail is descending, so reversing it is all that takes.",
]
