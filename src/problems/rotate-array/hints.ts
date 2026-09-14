// rotate-array — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "Rotating by n leaves the array exactly as it was, so only k % n matters. Reduce k before you touch a single value.",
  "After the rotation the array is two blocks that swapped places: the last k values, then the first n - k.",
  "Reversing the whole array puts both blocks on the correct side, each one backwards. Reverse each block to undo that.",
]
