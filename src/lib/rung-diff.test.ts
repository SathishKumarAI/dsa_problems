import assert from "node:assert/strict"
import { test } from "node:test"
import { differingLines, divergence } from "./rung-diff.ts"

const SET = `def has_cycle(head) -> bool:
    seen = set()
    while head:
        if id(head) in seen:
            return True
        seen.add(id(head))
        head = head.next
    return False`

const FLOYD = `def has_cycle(head) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`

test("the two lines that state the answer are the two the rungs share", () => {
  const marks = differingLines(SET, FLOYD)
  const shared = SET.split("\n").filter((_, i) => !marks[i])
  assert.deepEqual(shared, [
    "def has_cycle(head) -> bool:",
    "            return True",
    "    return False",
  ])
})

test("a line that only moved is shared, not a delete plus an insert", () => {
  const a = "one\ntwo\nthree"
  const b = "three\ntwo\none"
  assert.deepEqual(differingLines(a, b), [false, false, false])
})

test("a repeated line is matched once per occurrence, not once per value", () => {
  // two `return True` on the left and one on the right: the second is unique
  assert.deepEqual(
    differingLines("x\nreturn True\nreturn True", "return True"),
    [true, false, true]
  )
})

test("blank lines are spacing, never a difference", () => {
  assert.deepEqual(differingLines("a\n\n\nb", "a\nb"), [false, false, false, false])
})

test("identical code diverges by zero; unrelated code by one", () => {
  assert.equal(divergence(SET, SET), 0)
  assert.equal(divergence("a\nb", "c\nd"), 1)
})
