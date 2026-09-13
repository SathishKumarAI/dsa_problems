// Does every deep document still agree with the data file it was written from?
//
// `verify-deep.mjs` runs each document's script and checks the approaches AGREE
// with each other. That is a check on the code and says nothing about the
// prose: a document can add an approach the app never teaches, rename a rung,
// or quote a complexity the data contradicts, and the gate stays green. An
// audit on 2026-09-13 found exactly that drift on the two problems it sampled,
// so this script asks the question across all of them at once.
//
// It compares, per problem:
//   * how many approaches the document has (`## Approach …` headings) against
//     the data's ladder (`alternatives.length + 1`)
//   * whether a document with MORE approaches says so — `docs/deep/README.md`
//     requires an added rung to be labelled an addition
//
// Run:  node scripts/check-deep-drift.mjs           # the table
//       node scripts/check-deep-drift.mjs --strict  # exit 1 on undisclosed drift

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { PROBLEMS } from "../src/data/index.ts"

const strict = process.argv.includes("--strict")
const DIR = "docs/deep"

// "an addition", "not in the data file", "(an addition — …)" all count: the
// spec asks for the fact to be stated, not for one exact phrasing
const DISCLOSES = /\ban addition\b|not in the data file|beyond the app's ladder|addition to the app/i

const rows = []
for (const file of readdirSync(DIR).filter((f) => f.endsWith("_explained.md")).sort()) {
  const id = file.replace(/_explained\.md$/, "")
  const problem = PROBLEMS.find((p) => p.id === id)
  if (!problem) {
    rows.push({ id, dataRungs: null, docApproaches: null, note: "no problem with this id" })
    continue
  }
  const md = readFileSync(join(DIR, file), "utf8").replace(/\r\n/g, "\n")
  // headings only, never a mention inside prose or a fence
  const approaches = [...md.matchAll(/^## Approach\b[^\n]*/gm)].map((m) => m[0])
  const dataRungs = (problem.alternatives?.length ?? 0) + 1
  const extra = approaches.length - dataRungs
  rows.push({
    id,
    dataRungs,
    docApproaches: approaches.length,
    extra,
    disclosed: DISCLOSES.test(md),
  })
}

const drifted = rows.filter((r) => r.extra > 0)
const undisclosed = drifted.filter((r) => !r.disclosed)
const fewer = rows.filter((r) => r.extra !== undefined && r.extra < 0)

const pad = (s, n) => String(s).padEnd(n)
console.log(`${pad("problem", 30)} ${pad("data", 6)} ${pad("doc", 5)} ${pad("extra", 6)} disclosed`)
for (const r of rows) {
  if (r.dataRungs === null) {
    console.log(`${pad(r.id, 30)} ${r.note}`)
    continue
  }
  if (r.extra === 0) continue
  console.log(
    `${pad(r.id, 30)} ${pad(r.dataRungs, 6)} ${pad(r.docApproaches, 5)} ` +
      `${pad(r.extra > 0 ? `+${r.extra}` : r.extra, 6)} ${r.disclosed ? "yes" : "NO"}`
  )
}

console.log(
  `\n${rows.length} documents · ${rows.length - drifted.length - fewer.length} match their data ` +
    `· ${drifted.length} add approaches (${undisclosed.length} without saying so) ` +
    `· ${fewer.length} have fewer`
)

if (strict && (undisclosed.length || fewer.length)) {
  console.error(
    `\nFAIL: ${undisclosed.length} document(s) add an approach the data file does not have and ` +
      `never say it is an addition; ${fewer.length} have fewer approaches than the data. ` +
      `docs/deep/README.md requires an added rung to be labelled.`
  )
  process.exit(1)
}
