// subarray-sum-k — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "The sum of the stretch from i to j is (running total up to j) − (running total up to i−1). Two prefix sums, one subtraction.",
  "So for each position, the question becomes: how many earlier prefix sums equal (running total − k)?",
  "A map of prefix sum → how many times it has occurred answers that in constant time. Seed it with one occurrence of 0.",
]
