// redundant-connection — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "Add the edges one at a time and ask, before each one, whether its two endpoints are already connected.",
  "The first edge whose endpoints are already connected is the one that closes the cycle — and because you are going in input order, it is also the last such edge in the answer's sense.",
  "Answering 'already connected?' quickly is what disjoint-set union is for: each node points at a representative, and two nodes are connected exactly when their representatives match.",
]
