// merge-intervals — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "In the input's own order, two overlapping intervals can be arbitrarily far apart. Is there an order in which they are always adjacent?",
  "Sort by start. Then everything that overlaps the stretch you are building is what comes next — nothing behind you can reach forward.",
  "While merging, the end of the merged stretch is max(current end, new end), never just the new end: [1,10] followed by [2,3] still ends at 10.",
]
