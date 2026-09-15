// counting-bits — the progressive nudges.
//
// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.

export const hints = [
  "Every number is some smaller number with one more bit's worth of information. Which smaller number?",
  "Shifting i right by one drops its lowest bit. So bits(i) = bits(i >> 1) plus whether that lowest bit was set.",
  "i >> 1 is always less than i, so the entry you need is always already filled.",
]
