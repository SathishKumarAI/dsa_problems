// The gate on `split-record.mjs`: a record that moved is the SAME record.
//
// Not a spot check. The script slices values out of the source as text and
// re-emits them as exports, and the one way that goes wrong without anything
// failing is a dedent reaching inside a template literal — a four-space Python
// body becoming a two-space one is valid Python that means something else.
// So: split every record that has already moved, in memory, and deep-equal the
// assembled object against the one the app actually imports.
//
// It runs on the problems ALREADY under `src/problems/<id>/index.ts`, which is
// the set whose original file is gone — so what it compares is the emitter's
// output today against the record in use. A change to `split-record.mjs` that
// would have corrupted a past migration fails here.

import assert from "node:assert/strict"
import { test } from "node:test"
import { existsSync, readdirSync } from "node:fs"
import { PROBLEMS } from "../src/data/index.ts"

const moved = readdirSync("src/problems", { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(`src/problems/${d.name}/index.ts`))
  .map((d) => d.name)

test("a split record is the record the app imports", async () => {
  assert.ok(moved.length > 0, "no record has moved yet — did the glob change?")
  for (const id of moved) {
    const mod = await import(`../src/problems/${id}/index.ts`)
    const inApp = PROBLEMS.find((p) => p.id === id)
    assert.ok(inApp, `${id}: the directory exists but the catalogue has no such problem`)
    assert.deepEqual(
      mod.problem,
      inApp,
      `${id}: the assembled record is not the one the catalogue carries`
    )
  }
})

// The dedent trap, asserted directly rather than trusted. Every code block in a
// moved record has to survive the move byte for byte: these are run against a
// Python oracle by `verify:run` and compiled by `verify:code`, and a body whose
// indentation shifted would still compile in Java and C++ and would still be
// valid Python — it would just be a different program.
test("a moved record's code kept its indentation", async () => {
  for (const id of moved) {
    const { problem } = await import(`../src/problems/${id}/index.ts`)
    const blocks = [
      ["optimal/python", problem.python],
      ...(problem.alternatives ?? []).flatMap((a) => [
        [`${a.key ?? a.name}/python`, a.python],
      ]),
    ]
    for (const [where, code] of blocks) {
      if (!code) continue
      assert.ok(
        !/^\n/.test(code),
        `${id}/${where}: the block starts with a newline — a template literal lost its first line`
      )
      // Python's own parser rejects a body indented by an amount that does not
      // nest, so every indented line must be a multiple of the block's smallest
      // indent. A dedent that reached inside the template takes 2 off some
      // lines and not others, which breaks exactly this.
      const indents = code
        .split("\n")
        .filter((l) => /^\s+\S/.test(l))
        .map((l) => l.match(/^ */)[0].length)
      if (!indents.length) continue
      const unit = Math.min(...indents)
      assert.ok(
        indents.every((n) => n % unit === 0),
        `${id}/${where}: indentation is not a multiple of ${unit} — the dedent reached inside the template`
      )
    }
  }
})
