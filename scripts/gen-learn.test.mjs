// The drift gate for docs/learn/**: the tree on disk IS the data, or the
// build fails. A generated file nobody regenerates is a stale map, and a stale
// map costs more than no map.
//
// The question these tests ask CHANGED when `#/learn/<id>` became a section of
// the problem page. It used to be "does the page show every rung the problem
// page shows, in the same order" — the right question for a page that stood
// alone and had to carry the ladder itself. Emitting the ladder now would put
// the same rungs on the screen twice, so the question is the opposite one:
// does this file restate anything the page above it already shows, and does it
// still carry the one thing only it has — a script you can run.

import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { PROBLEMS } from "../src/data/index.ts"
import { ladderOf } from "../src/lib/ladder.ts"
import { OUT_DIR, deepDocument, pages, runnableScript } from "./gen-learn.mjs"
import { VECTORS } from "./localsmith/vectors.mjs"

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
    `stale pages — run \`npm run docs:learn\`: ${stale.join(", ")}`
  )
  assert.deepEqual(
    onDisk.filter((f) => !want.has(f)),
    [],
    "orphan pages: a problem was renamed or removed and its page stayed behind"
  )
})

test("a page exists for every problem with something to explain", () => {
  // Not `PROBLEMS.length + 1` any more: a problem with no authored document
  // AND no vectors has nothing this file could hold, and gets no file — the
  // door on the problem page is decided by whether one exists, so an empty
  // page would promise an explanation and open onto nothing.
  const want = pages()
  assert.equal(onDisk.length, want.size, "disk and the generator disagree")
  const missing = PROBLEMS.filter(
    (p) => !want.has(`${p.id}.md`) && (deepDocument(p.id) || VECTORS[p.id])
  ).map((p) => p.id)
  assert.deepEqual(missing, [], "a problem with material got no page")
})

test("a page carries what only it has: a document, a script, or both", () => {
  for (const [name, text] of pages()) {
    if (name === "README.md") continue
    assert.ok(
      /^## /m.test(text),
      `${name}: no sections at all — it should not have been written`
    )
  }
})

// The dedupe this whole change exists for, asserted rather than eyeballed.
// Every heading below was emitted here until the two routes merged, and every
// one of them is on the problem page above the explanation.
test("a page does not restate the problem page", () => {
  const FORBIDDEN = [
    [/^# /m, "the title — the page already has an h1"],
    [/^## What the input promises/m, "the constraints"],
    [/^## Examples/m, "the examples"],
    [/^## Rung \d+ — /m, "the ladder, which the page renders in three languages"],
    [/^## The arc\s*$/m, "the arc"],
    [/<summary>Hints/, "the hints fold"],
  ]
  for (const [name, text] of pages()) {
    if (name === "README.md") continue
    // Fences out first. A Python comment legitimately starts a line with `#`,
    // and every generated script opens with
    // `# --- 1. Brute force: every pair ---`, which is not a heading and not a
    // restatement of anything.
    const prose = text.replace(/```[\s\S]*?```/g, "")
    for (const [re, what] of FORBIDDEN)
      assert.ok(
        !re.test(prose),
        `${name} restates ${what} — it is on the problem page directly above`
      )
  }
})

// The generated script is the ONLY thing 59 problems get out of this file, so
// "does it cover the whole ladder" is the question worth asking of it. Not by
// searching for each rung's Python verbatim: `runnableScript` renames every
// entry point so two rungs cannot collide, so the source is not on the page
// unchanged. Count the entries instead — one per rung, no more, no fewer.
test("the generated script runs every rung the ladder shows", () => {
  for (const problem of PROBLEMS) {
    const { rungs } = ladderOf(problem, undefined, 0)
    const script = runnableScript(problem, rungs)
    if (!script) continue
    const listed = script
      .match(/APPROACHES = \[([\s\S]*?)\]/)[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    assert.equal(
      listed.length,
      rungs.length,
      `${problem.id}: ${rungs.length} rungs on the ladder, ${listed.length} in the script`
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
