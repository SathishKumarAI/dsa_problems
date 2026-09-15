// The Run button appends `print(<entry>(args))` to a block that only defines
// things. Both halves of that sentence are decided here, so both are tested
// against real blocks from the corpus rather than invented ones.

import assert from "node:assert/strict"
import { test } from "node:test"
import { printsSomething, pyEntry } from "./py-entry.ts"

test("the entry point is the def nobody else calls", () => {
  assert.equal(pyEntry("def is_balanced(s):\n    return True"), "is_balanced")

  // subarray-sum-k's failing-window rung carries a helper, and the helper is
  // the one that is CALLED — picking the first def would invoke `at_most` with
  // the wrong arity and print a TypeError under the reader's nose.
  const withHelper = [
    "def at_most(nums, limit):",
    "    return 0",
    "",
    "def subarray_sum(nums, k):",
    "    return at_most(nums, k) - at_most(nums, k - 1)",
  ].join("\n")
  assert.equal(pyEntry(withHelper), "subarray_sum")

  // rpn-eval's tree rung has the same shape: `apply_op` is scaffolding
  const withHelperFirst = [
    "def apply_op(op, left, right):",
    "    return 0",
    "",
    "def eval_rpn(tokens):",
    "    return apply_op('+', 1, 2)",
  ].join("\n")
  assert.equal(pyEntry(withHelperFirst), "eval_rpn")

  assert.equal(pyEntry("x = 1"), null, "a block with no def has no entry")
})

test("only a top-level print or a main guard prints on its own", () => {
  assert.equal(
    printsSomething("def f(x):\n    return x"),
    false,
    "a bare definition prints nothing — this is the case the Run button fixes"
  )
  assert.equal(
    printsSomething("def f(x):\n    return x\n\nprint(f(1))"),
    true,
    "a block that already prints must be left exactly as written"
  )

  // The case that caught the first version of this check, which asked whether
  // the block had any top-level STATEMENT. balanced-brackets' opening fence
  // declares `PAIRS = {...}` at module scope, so it passed that test and still
  // printed nothing in a real browser. A constant is not output.
  assert.equal(
    printsSomething(
      ["PAIRS = {')': '('}", "", "def f(s):", "    return PAIRS"].join("\n")
    ),
    false,
    "a module-level constant is not output"
  )

  assert.equal(
    printsSomething(
      [
        "def main():",
        "    pass",
        "",
        'if __name__ == "__main__":',
        "    main()",
      ].join("\n")
    ),
    true,
    "a guarded main() starts itself — every full script in the corpus does this"
  )

  assert.equal(
    printsSomething("def f():\n    print(1)"),
    false,
    "a print INSIDE a function does not run until something calls it"
  )
})
