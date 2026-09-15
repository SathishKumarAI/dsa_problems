// largest-rectangle — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "For each bar, the best rectangle using its full height extends to the first shorter bar on each side.",
  "A monotonic increasing stack finds both boundaries: a bar is finalized the moment a shorter one arrives.",
  "Append a sentinel height 0 so every bar gets flushed at the end.",
]
