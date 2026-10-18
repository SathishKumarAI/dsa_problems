// sorted-pair-sum — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.
//
// Rewritten 2026-10-17 so no hint names a technique before the reader has
// earned it: the first version opened with "the hash-map trick" and spoke of
// pointers, which is the name arriving before the insight — the one thing
// this product promises not to do. Each hint is now a question the reader can
// answer from the statement, and the third says what to DO without naming
// what it is called.

export const hints = [
  "You know the sum of the two values you are looking at. In a sorted list, what else do you know about every other pair that uses the smaller of the two?",
  "Start with the widest pair: the first value and the last. The sum is too small, too big, or right. In each case, which of the two values is to blame?",
  "Too small: the small end cannot do better than the large end it just failed with, so it is finished — step it right. Too big: the mirror — step the large end left. One step each time, never both.",
]
