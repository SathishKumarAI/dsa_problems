// The check for lib/complexity.ts. Every case here is a string that actually
// appears in src/data/problems — including the two the file admits it reads
// wrongly, so a future "fix" cannot quietly change them without failing here.
import assert from "node:assert/strict"
import { test } from "node:test"
import { GROWTH, growthOf, growthOfCost, growthRank } from "./complexity.ts"

const cases: [string, string][] = [
  ["O(1)", "constant"],
  ["O(1) beyond the answer", "constant"],
  ["O(log n)", "logarithmic"],
  ["O(log (m · n))", "logarithmic"],
  ["O(h)", "logarithmic"],
  ["O(n)", "linear"],
  ["O(n) amortized", "linear"],
  ["O(n + m)", "linear"],
  ["O(rows · cols)", "linear"],
  ["O(V + E)", "linear"],
  ["O(26 · n)", "linear"],
  ["O(n log n)", "linearithmic"],
  ["O(n log k)", "linearithmic"],
  ["O(E log V)", "linearithmic"],
  ["O(n log(sum))", "linearithmic"],
  ["O(n²)", "polynomial"],
  ["O(n^2)", "polynomial"],
  ["O(n³)", "polynomial"],
  ["O(n² log n)", "polynomial"],
  ["O((rows · cols)²)", "polynomial"],
  ["O(2^n)", "exponential"],
  ["O(2ⁿ)", "exponential"],
  ["O(4^n / √n)", "exponential"],
  ["O(8^(n²))", "exponential"],
  ["O(n! · n log(n!))", "exponential"],
  ["O(rows · cols · 4^L)", "exponential"],
]

test("every growth class in the corpus is read off its string", () => {
  for (const [input, want] of cases)
    assert.equal(growthOf(input), want, `${input} should read as ${want}`)
})

test("the two known misreadings stay known, so a widening rule fails here", () => {
  // the `m` term dominates, but there is no product form for the rule to see
  assert.equal(growthOf("O(m + log n)"), "logarithmic")
  // linear in CELLS, which is what the grid problems mean by it
  assert.equal(growthOf("O(m · n)"), "linear")
})

test("a rung's packed cost is classified on its time half, not its space half", () => {
  assert.equal(growthOfCost("O(n log n) time · O(1) space"), "linearithmic")
  // the space half must not drag the rank down…
  assert.equal(growthOfCost("O(n²) time · O(1) space"), "polynomial")
  // …nor up: an O(1)-time lookup with O(n) of table behind it is still O(1)
  assert.equal(growthOfCost("O(1) time · O(n) space"), "constant")
})

test("the rank is 1-based and spans the six ticks the meter draws", () => {
  assert.equal(growthRank("constant"), 1)
  assert.equal(growthRank("exponential"), 6)
  assert.equal(GROWTH.length, 6)
})
