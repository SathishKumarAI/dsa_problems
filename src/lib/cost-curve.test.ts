import assert from "node:assert/strict"
import { test } from "node:test"
import { levels, normaliseBound, smoothPath } from "./cost-curve.ts"

test("the same bound written differently is the same bound", () => {
  // the three spellings the corpus really uses for a square
  assert.equal(normaliseBound("O(n²)"), normaliseBound("O(n^2)"))
  assert.equal(normaliseBound("O(n³)"), normaliseBound("O(n^3)"))
  // and the three glyphs it spells multiplication with
  assert.equal(
    normaliseBound("O(rows · cols)"),
    normaliseBound("O(rows × cols)")
  )
  assert.equal(normaliseBound("O(n · k)"), normaliseBound("O(n * k)"))
  // spacing and case
  assert.equal(normaliseBound("O(N  LOG N)"), normaliseBound("o(n log n)"))
})

test("what it does NOT fold, it leaves alone", () => {
  // These are genuinely different strings and this file does not know whether
  // they are the same bound. Leaving them distinct draws a step where there
  // may be a tie — visible and arguable. Folding them would draw a tie where
  // there is a step, which is a claim nobody can see is wrong.
  assert.notEqual(normaliseBound("O(n + m)"), normaliseBound("O(m + n)"))
  assert.notEqual(
    normaliseBound("O(n)"),
    normaliseBound("O(n) for practical purposes")
  )
})

test("equal bounds land at equal heights — this is the whole point", () => {
  // two-sum, the ladder that exposed the bug: four rungs, three bounds
  const ys = levels(["O(n²)", "O(n log n)", "O(n)", "O(n)"])
  assert.deepEqual(ys, [0, 0.5, 1, 1])
  assert.equal(ys[2], ys[3], "two O(n) rungs must sit at the same height")
})

test("a ladder on one bound is flat, not a climb", () => {
  assert.deepEqual(levels(["O(n)", "O(n)", "O(n)"]), [0, 0, 0])
})

test("heights run costliest to cheapest, and span the whole box", () => {
  const ys = levels(["O(2^n)", "O(n²)", "O(n log n)", "O(n)", "O(1)"])
  assert.equal(ys[0], 0, "the worst rung anchors the top")
  assert.equal(ys[ys.length - 1], 1, "the best rung anchors the bottom")
  for (let i = 1; i < ys.length; i++)
    assert.ok(ys[i] > ys[i - 1], `height ${i} did not descend`)
})

test("the curve never overshoots a point it passes through", () => {
  // A step down into a flat run is where a Catmull-Rom spline dips BELOW the
  // flat run before recovering — which on this chart would draw a rung cheaper
  // than any rung that exists. Every control point here shares its endpoint's
  // y, so the path is bounded by its own endpoints.
  const pts: [number, number][] = [
    [0, 10],
    [50, 90],
    [100, 90],
  ]
  const d = smoothPath(pts)
  const ys = [...d.matchAll(/[-\d.]+ ([-\d.]+)/g)].map((m) => Number(m[1]))
  assert.ok(Math.max(...ys) <= 90, `overshot below: ${d}`)
  assert.ok(Math.min(...ys) >= 10, `overshot above: ${d}`)
})

test("a path needs two points", () => {
  assert.equal(smoothPath([]), "")
  assert.equal(smoothPath([[0, 0]]), "")
  assert.ok(
    smoothPath([
      [0, 0],
      [10, 10],
    ]).startsWith("M 0 0 C ")
  )
})
