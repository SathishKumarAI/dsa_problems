// lru-cache — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "Two questions have to be constant at once: where is this key, and which key is oldest? One structure rarely answers both.",
  "A hash map answers the first. For the second you need an order you can move an entry within — cheaply, from the middle.",
  "A doubly linked list lets you unlink a node and re-attach it at the front in constant time, if the map stores the NODE rather than the value.",
]
