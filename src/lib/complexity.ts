// A complexity string → the growth class it belongs to.
//
// Why this exists: `O(n log n)` is a thing you READ. A learner who has not yet
// internalised the ladder cannot tell at a glance that it sits between `O(n)`
// and `O(n²)` — and "where does this sit on the ladder" is the single question
// an algorithm designer asks first. This file turns the string into a rank, so
// `ui/tick-meter.tsx` can draw it as a height you take in without reading.
//
// What it owns: the classification, and nothing else. No markup, no colour.
// What it does NOT own: the words. The string is ALWAYS rendered beside the
// mark — this is a second channel, never a replacement (DESIGN.md: "colour is
// never the only channel", and neither is shape).
//
// It is a CUE, not a proof. The corpus has ~90 distinct time strings written
// by hand ("O(rows · cols · 4^L)", "O(n log max(piles))", "O(n) amortized"),
// and a parser that tried to be right about all of them would be a small CAS.
// The rules below are ordered worst-growth-first and stop at the first hit.
// Two known and accepted misreadings, both of which the adjacent word fixes:
//   * `O(m + log n)` reads as `log` — the `m` term is the real dominator.
//   * `O(m · n)` reads as `linear` — for a grid that IS linear in cells, which
//     is why it is not treated as quadratic, but for two independent inputs it
//     is not.
// Widen a rule only with a case added to complexity.test.ts in the same edit.

/** the six rungs of the growth ladder, cheapest first — the INDEX is the rank */
export const GROWTH = [
  "constant",
  "logarithmic",
  "linear",
  "linearithmic",
  "polynomial",
  "exponential",
] as const

export type Growth = (typeof GROWTH)[number]

/** how many of the six ticks a class lights: constant lights 1, exponential 6 */
export const growthRank = (g: Growth) => GROWTH.indexOf(g) + 1

export function growthOf(complexity: string): Growth {
  const s = complexity.toLowerCase().replace(/\s+/g, " ")

  // n!, 2^n, 3^n, 4^n, 8^(n²), 2^(m+n), 2ⁿ — a DIGIT raised to anything with a
  // letter in it. `n^2` does not match, because the base there is the variable.
  if (/!/.test(s) || /ⁿ/.test(s) || /\d\s*\^\s*\(?[^)]*[a-z]/.test(s))
    return "exponential"

  // n², n^2, n³, (rows · cols)² — a letter or a closing paren raised to 2 or 3
  if (/[a-z)]\s*(²|³|\^\s*[23])/.test(s)) return "polynomial"

  // a PRODUCT with a log in it: "n log n", "e log v", "k log n", "n·log k".
  // The char before `log` decides: a variable or a paren means multiplication,
  // a `+` or a `(` means the log is a separate, smaller term.
  if (/[a-z0-9)\]]\s*[·×*]?\s*log/.test(s)) return "linearithmic"

  // log n, log(m · n), and O(h) — a tree height is a log in disguise, and the
  // corpus uses it that way on every balanced-tree problem.
  if (/log/.test(s) || /^o\(\s*h\s*\)/.test(s)) return "logarithmic"

  if (/^o\(\s*1\s*\)/.test(s)) return "constant"

  return "linear"
}

/** `"O(n log n) time · O(n) space"` → the growth of the TIME half.
 *  A rung's cost packs both; time is what the ladder is climbing. */
export const growthOfCost = (cost: string) => growthOf(cost.split(/\btime\b/)[0])
