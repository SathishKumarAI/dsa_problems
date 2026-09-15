// `demos.ts` is generated and committed, so it can go stale in silence. This
// rebuilds it in memory and fails when it has — the same bargain
// `manifest.test.ts` strikes, for the same reason: a generated file that is not
// on disk breaks a fresh clone, and one that is stale is worse than absent.

import assert from "node:assert/strict"
import { test } from "node:test"
import { execFileSync } from "node:child_process"
import { DEMOS } from "./demos.ts"
import { CATALOGUE } from "./manifest.ts"

test("demos.ts matches what the vectors render today", () => {
  // the generator's own --check, so there is one definition of "stale"
  execFileSync("node", ["scripts/gen-demos.mjs", "--check"], { stdio: "pipe" })
})

test("every demo names a problem that exists", () => {
  const ids = new Set(CATALOGUE.map((p) => p.id))
  const orphans = Object.keys(DEMOS).filter((id) => !ids.has(id))
  assert.deepEqual(orphans, [], "a demo points at a problem that is gone")
})

// The Run button appends `print(entry(<these args>))`. An empty argument list
// would produce `print(entry())` — a TypeError under the reader's nose — and an
// unbalanced one would be a SyntaxError, so both are worth one line here.
test("every demo is a usable argument list", () => {
  for (const [id, args] of Object.entries(DEMOS)) {
    assert.ok(args.trim().length > 0, `${id}: an empty argument list`)
    const open = (args.match(/[([]/g) ?? []).length
    const close = (args.match(/[)\]]/g) ?? []).length
    assert.equal(open, close, `${id}: brackets do not balance — ${args.slice(0, 60)}`)
    assert.ok(
      !/\b(true|false|null)\b/.test(args),
      `${id}: JSON literals, not Python — ${args.slice(0, 60)}`
    )
  }
})

test("most of the catalogue can be called in one line", () => {
  // 126 of 127 at the time of writing; the one that cannot is `shape: "class"`,
  // whose entry point is a class to instantiate against a script of operations.
  assert.ok(
    Object.keys(DEMOS).length >= CATALOGUE.length - 5,
    `only ${Object.keys(DEMOS).length} of ${CATALOGUE.length} problems have a demo call`
  )
})
