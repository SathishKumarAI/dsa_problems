// merge-sorted-array — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "Merging two sorted runs is easy when there is somewhere to put the result. Look at where the free space in a actually is.",
  "Filling from the front overwrites a[0] before you have read it. Which end of a can be written without destroying anything?",
  "Start three indices — the last real value of a, the last value of b, and the last slot of a — take the larger of the two values, write it, and step that index back. When b runs dry you can stop: whatever is left of a is already sitting where it belongs.",
]
