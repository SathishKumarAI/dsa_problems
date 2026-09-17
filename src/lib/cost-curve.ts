// Where each rung sits on the climb, and the curve drawn through them.
//
// The first cut placed a rung by its POSITION in the ladder: four rungs, four
// evenly spaced heights. That is right exactly while no two rungs cost the
// same, and two-sum breaks it on the page — "Two-Pass Hash" and "One-Pass Hash"
// are both O(n), and drawing the second lower says the second is cheaper. It
// is not. It is the same bound arrived at in one sweep instead of two, and
// saying otherwise on a chart teaches a thing the ladder's own prose then has
// to argue against.
//
// So height comes from the BOUND. Equal bounds get equal height, the curve
// runs flat between them, and a reader sees the real shape: the cost stops
// falling, and the last step is a refinement rather than a speed-up.
//
// NOTHING HERE PARSES A COMPLEXITY. The corpus has 44 distinct time strings —
// `O(rows · cols)`, `O(n + m + k log k)`, `O(n! · n log(n!))`, `O(32)` — and a
// classifier over that is a parser that will eventually rank one of them wrong
// and state it in a picture. It does not need one: the ladder is ALREADY
// ordered worst to best, and `problems.test.ts` fails when it is not. The only
// thing position cannot express is a TIE, and a tie is two strings being the
// same string. That is all this decides.

/**
 * Two bounds that are the same bound written differently.
 *
 * Deliberately shallow: case, spacing, the two superscript digits the corpus
 * actually uses, and the three glyphs it spells multiplication with. Anything
 * this does not fold stays distinct, which errs toward drawing a step that is
 * really a tie — visible, and honest — rather than a tie that is really a step.
 */
export const normaliseBound = (s: string) =>
  s
    .toLowerCase()
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/[·×*]/g, "*")
    .replace(/\s+/g, " ")
    .trim()

/**
 * A y for every rung, 0 (costliest) to 1 (cheapest).
 *
 * Ranked over the DISTINCT bounds, so a ladder of four rungs on three bounds
 * uses three heights and the repeated one lands twice at the same place.
 *
 * One distinct bound is not a curve — every rung costs the same — so they all
 * sit at 0 and the caller draws a flat line, which is the truth about that
 * ladder.
 */
export function levels(bounds: string[]): number[] {
  const seen: string[] = []
  for (const b of bounds) {
    const key = normaliseBound(b)
    if (!seen.includes(key)) seen.push(key)
  }
  const steps = seen.length - 1
  return bounds.map((b) => {
    const rank = seen.indexOf(normaliseBound(b))
    return steps === 0 ? 0 : rank / steps
  })
}

/**
 * A smooth path through the points, in a 0–100 box.
 *
 * Cubic segments whose control points share their endpoint's y — a "flat
 * tangent" curve. It is smooth, and unlike Catmull-Rom it can never overshoot:
 * a spline fitted through a step down then a flat run dips BELOW the flat run
 * before recovering, which on this chart would draw a rung cheaper than any
 * rung that exists.
 *
 * `points` are [x, y] already in box coordinates. Fewer than two is not a path.
 */
export function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return ""
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const dx = (x1 - x0) / 3
    d += ` C ${x0 + dx} ${y0}, ${x1 - dx} ${y1}, ${x1} ${y1}`
  }
  return d
}
