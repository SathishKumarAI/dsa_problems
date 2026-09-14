// The gate on typed teaching documents.
//
// This is the test that makes the migration worth doing. `scripts/learn-gaps.mjs`
// had to GREP 127 Markdown files for headings and print a table of what each one
// was missing; the answer was a report nobody could fail a build on. Here the
// same questions are assertions, and the most important one — does this document
// teach an approach the problem has no record for — is the 45-of-82 gap that
// took three months to notice.

import assert from "node:assert/strict"
import { test } from "node:test"
import { readdirSync } from "node:fs"
import { PROBLEMS } from "../data/index.ts"
import { JOURNEYS } from "../engine/index.ts"
import { ladderOf } from "../lib/ladder.ts"
import type { TeachingDoc } from "./types.ts"

const ids = readdirSync(new URL(".", import.meta.url))
  .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && f !== "types.ts")
  .map((f) => f.replace(/\.ts$/, ""))

const docs: [string, TeachingDoc][] = []
for (const id of ids) {
  const mod = (await import(`./${id}.ts`)) as { doc: TeachingDoc }
  docs.push([id, mod.doc])
}

test("content: there is at least one typed document, and it names its problem", () => {
  assert.ok(docs.length > 0, "no content modules — did the glob move?")
  for (const [id, doc] of docs) {
    assert.equal(doc.problemId, id, `${id}: the module's id does not match its filename`)
    assert.ok(
      PROBLEMS.some((p) => p.id === id),
      `${id}: no such problem`
    )
  }
})

// THE point of the type. A document used to be free to teach an approach the
// data file had no entry for, as long as the heading said so — 45 of the 82
// documents did, and the app could not name, rank or compare any of them.
test("content: every approach names a rung, and every rung is taught", () => {
  for (const [id, doc] of docs) {
    const problem = PROBLEMS.find((p) => p.id === id)!
    const journey = JOURNEYS.find((j) => j.problemId === id)
    const { rungs } = ladderOf(problem, journey, Number.MAX_SAFE_INTEGER)
    const keys = new Set(rungs.map((r) => r.key))

    const taught = new Set<string>()
    for (const a of doc.approaches) {
      assert.ok(
        a.rung,
        `${id}/"${a.title}": no rung. The converter leaves this blank rather ` +
          `than guessing — set it to the key of the rung this section teaches.`
      )
      assert.ok(
        keys.has(a.rung),
        `${id}/"${a.title}": rung "${a.rung}" is not on the ladder ` +
          `(${[...keys].join(", ")}). Either the key is wrong, or this ` +
          `approach needs a record in the problem file.`
      )
      assert.ok(!taught.has(a.rung), `${id}: two sections teach rung "${a.rung}"`)
      taught.add(a.rung)
    }

    for (const r of rungs)
      assert.ok(
        taught.has(r.key),
        `${id}: rung "${r.key}" (${r.name}) is on the ladder and the document ` +
          `never explains it`
      )
  }
})

test("content: every section the format requires is present and is not a stub", () => {
  for (const [id, doc] of docs) {
    const long = (s: string, n: number, what: string) =>
      assert.ok(
        s.trim().length > n,
        `${id}: ${what} is ${s.trim().length} characters — the format asks for more`
      )
    long(doc.understanding, 200, "Understanding the Problem")
    long(doc.arc, 200, "The Overall Arc")
    long(doc.interview, 150, "Interview Priority")
    assert.ok(
      doc.comparison.rows.length >= doc.approaches.length,
      `${id}: the comparison table has ${doc.comparison.rows.length} rows for ` +
        `${doc.approaches.length} approaches`
    )
    for (const a of doc.approaches) {
      long(a.idea, 100, `${a.rung}: the idea`)
      long(a.intuition, 100, `${a.rung}: how to think about it`)
      long(a.worked, 100, `${a.rung}: the worked example`)
      long(a.mistake, 100, `${a.rung}: the common mistake`)
      long(a.cost, 80, `${a.rung}: complexity and when to use this`)
      assert.ok(a.code.includes("def "), `${a.rung}: the code is not a Python function`)
    }
  }
})

// `scripts/verify-deep.mjs` runs this string on every pull request, and the
// browser runs it on a Run click. A script that does not end by saying whether
// its approaches agreed is a script whose result nobody can read.
test("content: the runnable script exercises every approach and reports agreement", () => {
  for (const [id, doc] of docs) {
    assert.ok(doc.script.split("\n").length > 20, `${id}: the script is a stub`)
    assert.match(
      doc.script,
      /agree/i,
      `${id}: the script never says whether the approaches agreed`
    )
    assert.ok(
      !doc.script.includes("```"),
      `${id}: the script still carries a markdown fence`
    )
  }
})
