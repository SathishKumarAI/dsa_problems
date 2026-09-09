// The runner compiles one driver per block and runs every case inside it
// (B31). That trades process isolation for in-driver isolation, so the two
// things that used to come free need a check of their own:
//
//   1. a process that dies part-way still reports the cases it finished, and
//      blames the case that killed it — not the whole block;
//   2. a driver really does emit one print per case, in order.
//
// Run:  node --test "scripts/**/*.test.mjs"   (npm test runs it)

import { execFileSync } from "node:child_process"
import test from "node:test"
import assert from "node:assert/strict"
import { caseLines, cppDriver, javaDriver, pythonDriver } from "./run.mjs"
import { NOT_YET_RUNNABLE, VECTORS } from "./vectors.mjs"

test("a driver that dies mid-run keeps the lines it printed and blames the rest", () => {
  const { lines, err } = caseLines(
    () =>
      execFileSync(
        process.execPath,
        ["-e", 'console.log("first");console.log("second");process.exit(7)'],
        { stdio: "pipe" }
      ),
    4
  )
  assert.equal(lines.length, 4)
  assert.deepEqual(lines.slice(0, 2), ["first", "second"])
  assert.ok(lines[2].startsWith("!ERROR"), lines[2])
  assert.ok(lines[3].startsWith("!ERROR"), lines[3])
  assert.ok(err, "the death itself must be reported")
})

test("a clean run yields exactly one line per case", () => {
  const { lines, err } = caseLines(
    () =>
      execFileSync(
        process.execPath,
        ["-e", 'console.log("a");console.log("b");console.log("c")'],
        { stdio: "pipe" }
      ),
    3
  )
  assert.deepEqual(lines, ["a", "b", "c"])
  assert.equal(err, null)
})

const CASES = [[[1, 2]], [[3]], [[4, 5, 6]]]

test("every driver emits one guarded print per case", () => {
  const py = pythonDriver("def f(nums):\n    return nums[0]\n", "f", CASES)
  assert.equal(py.match(/^try:$/gm).length, 3)
  assert.equal(py.match(/^except BaseException as __e:$/gm).length, 3)
  // the arguments are emitted as literals, in order
  assert.ok(py.includes("f([1,2])") && py.includes("f([4,5,6])"), py)

  const java = javaDriver(
    "",
    "public int f(int[] nums) { return nums[0]; }",
    "f",
    CASES,
    ["int[]"]
  )
  assert.equal(java.match(/catch \(Throwable __t\)/g).length, 3)
  assert.ok(java.includes("new int[]{4,5,6}"), java)

  const cpp = cppDriver(
    "",
    "",
    "int f(vector<int> nums) { return nums[0]; }",
    "f",
    CASES,
    ["int[]"]
  )
  assert.equal(cpp.match(/catch \(\.\.\.\)/g).length, 3)
  // each case declares its own arguments, so nothing a block mutates leaks
  assert.ok(cpp.includes("a0_0") && cpp.includes("a2_0"), cpp)
})

test("a value carrying a newline cannot shift the cases after it", () => {
  const py = pythonDriver("def f(s):\n    return s\n", "f", CASES)
  assert.ok(py.includes(String.raw`.replace("\n", "\\n")`), py)
})

// B35. Mutation testing (mutate.mjs) proves the cases can tell a change in the
// REFERENCE. It cannot reach a slip that only exists in the translation — the
// rotting-fruit BFS read a live queue size, which Python cannot express. The
// only defence against that class is a case chosen on purpose, so every vector
// set has to say which of its cases makes the characteristic step happen.
test("every vector set names the step its cases force", () => {
  for (const [id, spec] of Object.entries(VECTORS)) {
    assert.ok(
      typeof spec.exercises === "string" && spec.exercises.length > 30,
      `${id}: needs an \`exercises\` line naming the characteristic step and the case that forces it`
    )
    assert.ok(spec.cases.length >= 3, `${id}: three cases is the floor`)
  }
})

test("nothing is both runnable and excused", () => {
  for (const id of Object.keys(NOT_YET_RUNNABLE))
    assert.ok(!VECTORS[id], `${id} is in NOT_YET_RUNNABLE and yet has vectors`)
})

// B30. A list or a tree cannot be spelled as a literal, so the driver BUILDS
// one — and it has to build it out of the class the block's own signature
// names, because this repo's Python calls a list node `Node` and LeetCode calls
// it `ListNode`, and different rungs of one problem use different ones.
test("a structural argument is built out of the block's own node class", () => {
  const cases = [[[1, 2, 3]], [[]]]

  const py = pythonDriver("def f(head):\n    return head\n", "f", cases, [
    "list",
  ])
  assert.ok(py.includes("f(__mklist([1,2,3], -1))"), py)
  assert.ok(py.includes("def __mklist"), "the builder has to be in the driver")

  // Node, because that is what THIS signature says — not the default
  const java = javaDriver("", "public Node f(Node head) { return head; }", "f", cases, ["list"])
  assert.ok(java.includes("__mkNode(new int[]{1,2,3}, -1)"), java)
  assert.ok(java.includes("static Node __mkNode(int[] v, int cyc)"), java)

  const cpp = cppDriver("", "", "ListNode* f(ListNode* head) { return head; }", "f", cases, ["list"])
  assert.ok(cpp.includes("ListNode* a0_0 = __mklist<ListNode>({1,2,3}, -1)"), cpp)
})

test("a cycle is part of the SHAPE, not a second argument", () => {
  const py = pythonDriver("def f(h):\n    return h\n", "f", [[{ list: [1, 2, 3], cycle: 1 }]], ["list"])
  // one argument still, and the tail points back at index 1
  assert.ok(py.includes("f(__mklist([1,2,3], 1))"), py)
})

test("an absent child is spelled the way each language spells it", () => {
  const tree = [[[1, null, 2]]]
  const py = pythonDriver("def f(r):\n    return r\n", "f", tree, ["tree"])
  assert.ok(py.includes("__mktree([1,None,2])"), py)

  const java = javaDriver("", "public TreeNode f(TreeNode r) { return r; }", "f", tree, ["tree"])
  assert.ok(java.includes("__mkTree(new Integer[]{1,null,2})"), java)

  // C++ cannot put a null in a vector<int>, so it is INT_MIN there
  const cpp = cppDriver("", "", "TreeNode* f(TreeNode* r) { return r; }", "f", tree, ["tree"])
  assert.ok(cpp.includes("__mktree<TreeNode>({1,INT_MIN,2})"), cpp)
})
