// Run every code FENCE the way the page runs it, and report the ones that fail.
//
// `verify-deep.mjs` runs each document's FULL SCRIPT, which is self-contained by
// construction. Nobody was running the fences — the per-approach blocks a reader
// actually presses Run on — and they are excerpts: they inherit imports, node
// classes and helpers from the document around them.
//
// That went unnoticed because the fences printed nothing whether they worked or
// not. Once the Run button appends a call (`src/data/demos.ts`) the difference
// is visible, and this is the gate that keeps it visible: same preamble, same
// appended call, same Python.
//
// Run:  node scripts/verify-fences.mjs
//       node scripts/verify-fences.mjs --id pair-sum
//       node scripts/verify-fences.mjs --quiet

import { execFileSync } from "node:child_process"
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const arg = (k) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? process.argv[i + 1] : undefined
}
const quiet = process.argv.includes("--quiet")
const only = arg("--id")

const { DEMOS } = await import("../src/data/demos.ts")
const { PREAMBLE, stripFuture } = await import("../src/lib/py-preamble.ts")
const { pyEntry, printsSomething } = await import("../src/lib/py-entry.ts")

const { parseMarkdown } = await import("../src/lib/markdown.ts")

/** every problem's fences, from whichever of the two homes its document has */
async function fencesOf(id) {
  const typed = join("src/problems", id, "doc.ts")
  if (existsSync(typed)) {
    const { doc } = await import(`../src/problems/${id}/doc.ts`)
    return {
      blocks: doc.approaches.map((a) => ({ name: a.rung, code: a.code })),
      script: doc.script,
    }
  }
  const page = join("docs/learn", `${id}.md`)
  if (!existsSync(page)) return null
  const fences = parseMarkdown(readFileSync(page, "utf8")).filter(
    (b) => b.kind === "code" && /^py(thon)?$/i.test(b.lang)
  )
  if (fences.length < 2) return null
  return {
    blocks: fences.slice(0, -1).map((b, i) => ({ name: `fence-${i + 1}`, code: b.code })),
    script: fences[fences.length - 1].code,
  }
}

const ids = readdirSync("src/problems", { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join("src/problems", d.name, "doc.ts")))
  .map((d) => d.name)
  .concat(
    readdirSync("docs/learn")
      .filter((f) => f.endsWith(".md") && f !== "README.md")
      .map((f) => f.replace(/\.md$/, ""))
      .filter((id) => !existsSync(join("src/problems", id, "doc.ts")))
  )
  .filter((id) => !only || id === only)

const tmp = mkdtempSync(join(tmpdir(), "fences-"))
const bad = []
let ran = 0
let skipped = 0

for (const id of ids) {
  const found = await fencesOf(id)
  if (!found) continue
  const args = DEMOS[id]
  for (const a of found.blocks) {
    const src = a.code
    if (printsSomething(src)) continue // a full script runs as written
    const entry = pyEntry(src)
    if (!entry || args === undefined) {
      skipped++
      continue
    }
    // A fence is an excerpt of the document's script, and it inherits that
    // script's module-level scaffolding — `format_range`, `seed_sum`, `PAIRS`,
    // the imports. Prepend the script with its `__main__` guard removed, so the
    // helpers exist; the fence's own definitions come after and win.
    const scaffold = stripFuture(found.script.split(/^if __name__/m)[0])
    const program = `${PREAMBLE}${scaffold}\n${stripFuture(src)}\n\nprint(${entry}(${args}))\n`
    const file = join(tmp, `${id}_${a.name}.py`.replace(/-/g, "_"))
    writeFileSync(file, program)
    try {
      execFileSync("python", [file], { stdio: "pipe", timeout: 20_000 })
      ran++
    } catch (e) {
      const why = String(e.stderr || e.message)
        .trim()
        .split(/\r?\n/)
        .at(-1)
      bad.push([`${id}/${a.name}`, why.slice(0, 110)])
    }
  }
}
rmSync(tmp, { recursive: true, force: true })

if (!quiet) for (const [where, why] of bad) console.log(`  · ${where}: ${why}`)
// A RATCHET, not a target. The seven are where the entry-point guess lands on a
// helper (`midpoint`, `_run_length_from`) or where the fence is a deliberate
// FRAGMENT — a "common mistake" block showing three broken lines, which is not a
// function and was never meant to run. Lower it as they are fixed; never raise
// it without saying why.
const BASELINE = 7

console.log(
  `\n${ran} fences ran clean, ${bad.length} failed (baseline ${BASELINE}), ` +
    `${skipped} had no call to make`
)
if (bad.length > BASELINE)
  console.log(
    `\nthat is ${bad.length - BASELINE} more than the baseline — a fence that ` +
      `used to run does not any more`
  )
if (bad.length < BASELINE)
  console.log(`\nbetter than the baseline: lower BASELINE to ${bad.length}`)
process.exitCode = bad.length > BASELINE ? 1 : 0
