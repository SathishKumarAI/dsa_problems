// The check for lib/example-shape.ts. Every `input` here is copied out of a
// real record, and the failing half matters more than the passing half: the
// viewer draws cells only when this returns something, so a string it reads
// WRONGLY becomes a diagram that lies about the problem's input.
import assert from "node:assert/strict"
import { test } from "node:test"
import { shapeOf, walkable } from "./example-shape.ts"

test("one named array is one list argument", () => {
  assert.deepEqual(shapeOf("nums = [1, 2, 3, 1]"), [
    { name: "nums", kind: "list", values: ["1", "2", "3", "1"] },
  ])
})

test("two arguments split on the top-level comma, not the ones inside", () => {
  assert.deepEqual(shapeOf("nums = [2, 7, 11, 15], target = 9"), [
    { name: "nums", kind: "list", values: ["2", "7", "11", "15"] },
    { name: "target", kind: "scalar", value: "9" },
  ])
})

test("a comma inside a quoted string is not a split", () => {
  assert.deepEqual(shapeOf('s = "a,b", t = "b,a"'), [
    { name: "s", kind: "scalar", value: '"a,b"' },
    { name: "t", kind: "scalar", value: '"b,a"' },
  ])
})

test("an empty list is a list, not a refusal", () => {
  assert.deepEqual(shapeOf("nums = []"), [
    { name: "nums", kind: "list", values: [] },
  ])
})

// ---- the refusals. Each of these must draw nothing rather than draw wrong ----

test("a nested list is refused — this row cannot draw a grid", () => {
  assert.deepEqual(shapeOf("grid = [[1, 2], [3, 4]]"), [])
})

test("prose with no assignment is refused", () => {
  assert.deepEqual(shapeOf("the root of the tree above"), [])
})

test("a comparison is not an assignment", () => {
  assert.deepEqual(shapeOf("n == 4"), [])
})

test("an unclosed bracket is refused", () => {
  assert.deepEqual(shapeOf("nums = [1, 2"), [])
})

test("a name that is not an identifier is refused", () => {
  assert.deepEqual(shapeOf("nums[0] = 3"), [])
})

// ---- which argument gets walked ----

test("the walkable argument is the longest list", () => {
  const args = shapeOf("a = [1], b = [1, 2, 3], k = 2")
  assert.equal(walkable(args)?.name, "b")
})

test("nothing is walkable when no argument is a list", () => {
  assert.equal(walkable(shapeOf('s = "abc"')), undefined)
})
