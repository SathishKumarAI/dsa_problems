// tree-diameter — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "Any path has a highest node — the point where it bends. Fix that node and the path is just the deepest reach left plus the deepest reach right.",
  "So the answer is the maximum, over every node, of depth(left) + depth(right).",
  "Computing depth separately per node re-walks the same subtrees over and over. One walk can return a depth AND update the best bend it has seen.",
]
