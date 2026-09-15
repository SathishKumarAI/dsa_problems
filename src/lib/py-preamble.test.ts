// The browser's preamble and the differential runner's must stay the same
// scaffolding, or a block runs one way in CI and another way on the page —
// which is exactly the drift this repo's gates exist to prevent.

import assert from "node:assert/strict"
import { test } from "node:test"
import { readFileSync } from "node:fs"
import { PREAMBLE, PY_NODES } from "./py-preamble.ts"

test("the node classes match the ones the Java/C++ gate drives Python with", () => {
  const driver = readFileSync("scripts/localsmith/run.mjs", "utf8").replace(
    /\r\n/g,
    "\n"
  )
  // `PY_NODES` in run.mjs is a template literal opening with a newline; compare
  // the CONTENT, not the quoting, so a reformat there does not fail this.
  const start = driver.indexOf("export const PY_NODES = `")
  assert.notEqual(start, -1, "run.mjs no longer exports PY_NODES")
  const body = driver
    .slice(start + "export const PY_NODES = `".length)
    .split("`")[0]
  const strip = (s: string) =>
    s
      .split("\n")
      .map((l) => l.trimEnd())
      .filter((l) => l.trim())
      .join("\n")
  assert.equal(
    strip(PY_NODES),
    strip(body),
    "the page and the gate declare different scaffolding"
  )
})

test("the preamble declares what the fences actually reference", () => {
  for (const name of ["Optional", "List", "Node", "ListNode", "TreeNode"])
    assert.match(
      PREAMBLE,
      new RegExp(`\\b${name}\\b`),
      `${name} is referenced by the corpus and is not in the preamble`
    )
  // declared only when absent, so a block's own class always wins
  assert.match(PREAMBLE, /try: Node\nexcept NameError:/)
})
