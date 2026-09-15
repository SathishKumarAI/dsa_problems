// partition-labels — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "A part cannot end before the last occurrence of any letter it contains. What do you need to know up front?",
  "Record the last index of each letter in one pass — 26 numbers.",
  "Then sweep, carrying the furthest last-occurrence seen so far. When the current index reaches it, that is the earliest legal cut.",
]
