// The check for lib/figure-scale.ts — the arithmetic a constraint figure draws.
import assert from "node:assert/strict"
import { test } from "node:test"
import { compact, logWidth } from "./figure-scale.ts"

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
