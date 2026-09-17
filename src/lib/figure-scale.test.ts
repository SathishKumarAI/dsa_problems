// The check for lib/figure-scale.ts — the arithmetic a constraint figure draws.
import assert from "node:assert/strict"
import { test } from "node:test"
import { compact, feelsLike, logWidth, ratio } from "./figure-scale.ts"

test("a log scale keeps four orders of magnitude all visible", () => {
  // the real figure: comparisons at n = 10^5
  const max = 5e9
  const pair = logWidth(5e9, max)
  const nlogn = logWidth(1.7e6, max)
  const linear = logWidth(1e5, max)
  assert.equal(pair, 100, "the largest fills the row")
  assert.ok(
    nlogn > 55 && nlogn < 75,
    `n log n should read as most of the row, got ${nlogn}`
  )
  assert.ok(
    linear > 45 && linear < 65,
    `n should still be clearly drawn, got ${linear}`
  )
  // and the ORDER survives, which is the only thing a reader takes from it
  assert.ok(pair > nlogn && nlogn > linear)
})

test("a linear scale would have made the small bar invisible — that is why this is log", () => {
  const linearPct = (1e5 / 5e9) * 100
  assert.ok(linearPct < 0.01, "sanity: linear really is invisible here")
  assert.ok(logWidth(1e5, 5e9) > 40, "log keeps it readable")
})

test("nothing is ever drawn as a zero-width bar", () => {
  assert.equal(logWidth(1, 1e9), 8, "the floor holds")
  assert.equal(logWidth(0, 1e9), 0, "…but a real zero draws nothing")
  assert.equal(logWidth(-5, 1e9), 0)
})

test("big numbers are written the way a reader says them", () => {
  assert.equal(compact(5e9), "5·10⁹")
  assert.equal(compact(1e5), "10⁵", "a mantissa of 1 is noise")
  assert.equal(compact(2e9), "2·10⁹")
  assert.equal(compact(1.7e6), "1.7·10⁶")
})

test("small numbers stay themselves", () => {
  assert.equal(compact(12), "12")
  assert.equal(compact(1000), "1 000")
  assert.equal(compact(0), "0")
})

test("a ratio says the thing the bars only imply", () => {
  // the pilot's own two figures
  // spelled out, not in powers: this is the card's 17px headline, and a
  // superscript there reads as a stray quote mark
  assert.equal(ratio(5e9, 1e5), "50 000×")
  assert.equal(ratio(2e9, 1e5), "20 000×")
  // order must not matter — the caller should not have to sort first
  assert.equal(ratio(1e5, 5e9), "50 000×")
  // until the digits are the unreadable half
  assert.equal(ratio(1e12, 1), "10¹²×")
  // small, real gaps are still worth saying
  assert.equal(ratio(34, 10), "3.4×")
  // and the ones that are not
  assert.equal(ratio(10, 10), null, "1× is not a finding")
  assert.equal(ratio(14, 10), null, "1.4× is not a finding")
  assert.equal(ratio(5, 0), null, "a ratio against nothing is not a quantity")
  assert.equal(ratio(-5, 10), null)
  assert.equal(ratio(Infinity, 10), null)
})

test("an operation count is turned into a wait a reader has sat through", () => {
  // the pilot's own three quantities
  assert.equal(feelsLike(5e9), "≈5 s") //  every pair, at 10^5 elements
  assert.equal(feelsLike(1.7e6), "≈2 ms") //  sort, then sweep
  assert.equal(feelsLike(1e5), "under a ms") //  one pass
  // the boundaries, because each one is a different sentence
  assert.equal(feelsLike(1e6), "≈1 ms")
  // a unit switches only once there are TWO of the next one, so nothing ever
  // rounds to "2 min" when it is really ninety seconds
  assert.equal(feelsLike(9e10), "≈90 s")
  assert.equal(feelsLike(1.5e11), "≈3 min")
  assert.equal(feelsLike(1e13), "≈3 hours")
  // and the non-quantities
  assert.equal(feelsLike(0), null)
  assert.equal(feelsLike(-1), null)
  assert.equal(feelsLike(Infinity), null)
})
