// Run the "Full Runnable Script" out of every docs/deep/*_explained.md.
//
// These documents are AUTHORED, not generated, and their central promise is
// that every approach in them was executed and agreed. A promise nobody
// re-checks is a promise that rots: a document can be edited, an approach can
// be added, and the script quietly stops running or stops agreeing.
//
// So: extract the last ```python block from each document — that is the full
// script by the house format (docs/deep/README.md) — run it, and require both
// a clean exit AND a final line saying the approaches agreed. A document whose
// script errors, hangs, or reports a disagreement fails here rather than in
// front of a learner.
//
// Run:  node scripts/verify-deep.mjs            # all of them
//       node scripts/verify-deep.mjs --id pair-sum
//       node scripts/verify-deep.mjs --quiet    # one line per document

import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

const arg = (k) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? process.argv[i + 1] : undefined
}
const quiet = process.argv.includes("--quiet")
const only = arg("--id")

const DIR = "docs/deep"
const AGREED = /all approaches agreed/i

// Two sources while the conversion runs. A problem with a typed document
// (`src/content/<id>.ts`) hands over a STRING FIELD; the rest still need the
// last python fence of their Markdown parsed out of prose.
//
// The field is the better arrangement and this script is the reason to say so:
// "the last ```python block" is a convention that a document can break by
// adding a code sample after its script, and the CRLF note below is what
// parsing prose for a program costs.
const CONTENT = "src/content"
const typed = new Map()
if (existsSync(CONTENT))
  for (const f of readdirSync(CONTENT)) {
    if (!f.endsWith(".ts") || f === "types.ts" || f.endsWith(".test.ts")) continue
    const id = f.replace(/\.ts$/, "")
    if (only && id !== only) continue
    const mod = await import(pathToFileURL(resolve(CONTENT, f)).href)
    typed.set(id, mod.doc.script)
  }

const files = readdirSync(DIR)
  .filter((f) => f.endsWith("_explained.md"))
  .filter((f) => !only || f === `${only}_explained.md`)
  .filter((f) => !typed.has(f.replace(/_explained\.md$/, "")))
  .sort()

if (!files.length && !typed.size) {
  console.log(`no documents matched${only ? ` --id ${only}` : ""}`)
  process.exit(1)
}

const tmp = mkdtempSync(join(tmpdir(), "deep-"))
const bad = []
let ok = 0

/** run one script and record the verdict — the half both sources share */
function runScript(id, script, source) {
  const path = join(tmp, `${id.replace(/-/g, "_")}.py`)
  writeFileSync(path, script)
  let out = ""
  try {
    out = execFileSync("python", [path], { encoding: "utf8", timeout: 120_000 })
  } catch (e) {
    const why = String(e.stderr || e.message)
      .trim()
      .split(/\r?\n/)
      .at(-1)
    bad.push([id, why.slice(0, 160)])
    return
  }
  if (!AGREED.test(out)) {
    bad.push([id, "ran clean, but never says the approaches agreed"])
    return
  }
  ok++
  if (!quiet) console.log(`ok  ${id.padEnd(30)} ${source}`)
}

for (const [id, script] of typed) runScript(id, script, "src/content")

for (const file of files) {
  const id = file.replace(/_explained\.md$/, "")
  // normalise the line endings before matching: git checks these out with
  // CRLF on Windows, and a fence pattern written as "```python\n" then finds
  // NOTHING and reports a document with no code in it (CLAUDE.md, the CRLF
  // trap — it has now bitten three separate scripts in this repo)
  const md = readFileSync(join(DIR, file), "utf8").replace(/\r\n/g, "\n")
  const blocks = [...md.matchAll(/```python\n([\s\S]*?)```/g)].map((m) => m[1])
  if (!blocks.length) {
    bad.push([id, "no python block at all"])
    continue
  }
  const script = blocks.at(-1)
  const path = join(tmp, `${id.replace(/-/g, "_")}.py`)
  writeFileSync(path, script)
  let out = ""
  try {
    // a stress case that hangs is a failure, not a wait: cap it
    out = execFileSync("python", [path], { encoding: "utf8", timeout: 120_000 })
  } catch (e) {
    const why = String(e.stderr || e.message)
      .trim()
      .split(/\r?\n/)
      .at(-1)
    bad.push([id, why.slice(0, 160)])
    continue
  }
  if (!AGREED.test(out)) {
    bad.push([id, "ran clean, but never says the approaches agreed"])
    continue
  }
  ok++
  if (!quiet) {
    const last = out.trim().split(/\r?\n/).at(-1)
    console.log(`ok   ${id.padEnd(28)} ${last.slice(0, 80)}`)
  }
}

rmSync(tmp, { recursive: true, force: true })

for (const [id, why] of bad) console.log(`FAIL ${id.padEnd(28)} ${why}`)
console.log(
  `\n${ok}/${files.length} deep documents ran clean and reported agreement` +
    (bad.length ? `, ${bad.length} did not` : "")
)
process.exitCode = bad.length ? 1 : 0
