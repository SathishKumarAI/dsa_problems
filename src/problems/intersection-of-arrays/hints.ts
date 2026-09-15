// intersection-of-arrays — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "'Is this value present?' is the wrong question. Ask how MANY times it is present, on each side.",
  "For every value the answer takes min(count in nums1, count in nums2) copies of it — so one number per distinct value is all the bookkeeping needed.",
  "You only need one count table if you SPEND a count the moment its match walks past — and hashing the shorter array is what keeps memory small when the other one is huge.",
]
