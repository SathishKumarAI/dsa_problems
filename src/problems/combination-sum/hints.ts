// combination-sum — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "Reuse is allowed, so after choosing a candidate you may choose it again — recurse on the SAME index, not the next one.",
  "To avoid the same multiset in two orders, never go back: a branch may only use candidates at or after the current index.",
  "The candidates are positive, so once the running sum passes the target the branch is dead. Stop it there rather than at the end.",
]
