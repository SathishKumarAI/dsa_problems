// remove-list-elements — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "To unlink a node you need the node BEFORE it, which a forward-only list will not hand you after the fact.",
  "After removing prev.next, do not advance — the new prev.next may match too.",
  "The head has no node before it. Invent one: a throwaway node in front of the head makes the head an ordinary case.",
]
