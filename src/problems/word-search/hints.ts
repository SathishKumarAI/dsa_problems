// word-search — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "Every cell whose letter matches the first character is a possible start. Try each.",
  "From a cell, the walk can only continue into the four neighbours whose letter is the next character.",
  "Mark a cell as used before recursing and UNMARK it after. That undo is what makes it a search rather than one greedy guess.",
]
