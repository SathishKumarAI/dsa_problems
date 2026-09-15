// hamming-weight — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "Reading the lowest bit is n & 1, and dropping it is n >> 1. That gives one step per bit.",
  "But a number with one set bit in 32 still costs 32 steps. Can you jump straight to the next set bit?",
  "n & (n - 1) clears exactly the lowest set bit and leaves everything above it alone. Count how many times you can do that.",
]
