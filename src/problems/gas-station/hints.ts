// gas-station — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page.

export const hints = [
  "First a global question with no route in it: under what condition can any start possibly work?",
  "If the tank goes negative somewhere between start s and station i, could any station between them have worked instead?",
  "No — each of those starts has less fuel at i than s did. So the next candidate is i+1, and the scan never goes back.",
]
