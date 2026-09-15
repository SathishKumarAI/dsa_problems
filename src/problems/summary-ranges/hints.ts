// summary-ranges — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "The input is already sorted with no duplicates, so a run is exactly a stretch where each value is one more than the value before it.",
  "Per run you only ever need two numbers: where it started and where it stopped. Everything between them is implied by consecutiveness.",
  "Remember the start, walk forward while the next value is +1, and emit the moment the chain breaks — the lone-value case is simply start == end.",
]
