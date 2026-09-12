// The drift gate for docs/explained/**: the tree on disk IS the data, or the
// build fails. A generated file nobody regenerates is a stale map, and a stale
// map costs more than no map.

import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { PROBLEMS } from "../src/data/index.ts"
import { ladderOf } from "../src/lib/ladder.ts"
import { OUT_DIR, pages, renderProblem, runnableScript } from "./gen-explained.mjs"

const onDisk = readdirSync(OUT_DIR)

// git hands these files back with CRLF on Windows (`core.autocrlf`), and the
// generator writes LF. Comparing the bytes would call every page stale on a
// fresh clone, which is a gate that cries wolf — compare the CONTENT.
const lf = (s) => s.replace(/\r\n/g, "\n")

test("every page on disk matches what the data renders today", () => {
  const want = pages()
  const stale = [...want]
    .filter(([name, text]) => {
      try {
        return lf(readFileSync(join(OUT_DIR, name), "utf8")) !== lf(text)
      } catch {
        return true
      }
    })
    .map(([name]) => name)
  assert.deepEqual(
    stale,
    [],
    `stale pages — run \`npm run docs:explained\`: ${stale.join(", ")}`
  )
  assert.deepEqual(
    onDisk.filter((f) => !want.has(f)),
    [],
    "orphan pages: a problem was renamed or removed and its page stayed behind"
  )
})

test("one page per problem, plus the index", () => {
  assert.equal(onDisk.length, PROBLEMS.length + 1)
})

test("a page shows every rung the problem page shows, in the same order", () => {
  for (const problem of PROBLEMS) {
    const { rungs } = ladderOf(problem, undefined, 0)
    const page = renderProblem(problem)
    const headings = [...page.matchAll(/^## (\d+)\. (.+)$/gm)].map((m) => m[2])
    assert.deepEqual(
      headings,
      rungs.map((r) => r.name),
      `${problem.id}: headings drifted from the ladder`
    )
    for (const r of rungs)
      assert.ok(
        page.includes(r.code.python.trim()),
        `${problem.id}: the "${r.name}" rung's Python is not on the page`
      )
  }
})

test("the runnable script names each rung once — a duplicate def silently wins", () => {
  for (const problem of PROBLEMS) {
    const { rungs } = ladderOf(problem, undefined, 0)
    const script = runnableScript(problem, rungs)
    if (!script) continue
    const defs = [...script.matchAll(/^(?:def|class) ([A-Za-z_]\w*)[(:]/gm)].map((m) => m[1])
    const listed = script
      .match(/APPROACHES = \[([\s\S]*?)\]/)[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    assert.equal(
      new Set(listed).size,
      listed.length,
      `${problem.id}: two rungs share an entry name`
    )
    for (const name of listed)
      assert.ok(defs.includes(name), `${problem.id}: APPROACHES names ${name}, no def does`)
  }
})
