// insert-interval — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "The list is already sorted and disjoint. Anything that ends before the newcomer starts is finished; anything that starts after it ends is untouched.",
  "That splits the list into three runs: strictly before, overlapping, strictly after. Only the middle run changes.",
  "The merged middle is one interval: min of the starts and max of the ends across the newcomer and everything it touched.",
]
