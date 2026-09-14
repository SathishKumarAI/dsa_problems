// window-maximum — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "Recomputing the maximum for each window re-reads k − 1 values it already saw. What could you carry forward instead?",
  "A value with a LARGER value to its right can never be the answer again — it will always be beaten while it remains in the window.",
  "So keep the surviving candidates in a deque, largest at the front, and evict from the back anything a new arrival makes irrelevant.",
]
