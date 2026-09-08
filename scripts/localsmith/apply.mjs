// Write generated Java/C++ blocks into src/data/problems/*.ts.
//
// Editing TypeScript source with a script is a sharp tool, so this one is
// deliberately timid: it inserts only after an EXACT anchor (the closing
// backtick of the python block it belongs to), refuses a rung that already has
// the language, refuses anything the gate did not pass, and prints a diff-sized
// summary rather than working silently.
//
// Run:  node scripts/localsmith/apply.mjs --in scripts/localsmith/out/codegen-all.json [--dry]

import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { PROBLEMS } from "../../src/data/index.ts"

const arg = (k, d) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? (process.argv[i + 1] ?? true) : d
}
const dry = process.argv.includes("--dry")
// write blocks the cross-model check flagged, and let the runner judge them
const accept = process.argv.includes("--accept-disagreed")

// One problem per file (B34); index.ts files are barrels, not content.
const FILES = readdirSync("src/data/problems", { recursive: true })
  .map((f) => String(f).split("\\").join("/"))
  .filter((f) => f.endsWith(".ts") && !f.endsWith("index.ts"))
  .map((f) => `src/data/problems/${f}`)

// Two independent translations of the same Python rarely land on identical
// loop counts — one writes a for, the other a while plus a guard — so exact
// equality flags far more than it should. What actually distinguishes "same
// algorithm, different hand" from "different algorithm" is the branching: the
// sort-vs-heap disagreement on top-k-frequent showed up as 2 ifs against 0.
// So: loops may differ by one, branches may not.
export function adjudicate(agree) {
  if (agree === "agree" || agree === "unchecked") return null
  const m = String(agree).match(/DISAGREE (\{.*?\}) vs (\{.*?\})/)
  if (!m) return String(agree).slice(0, 70) // second model errored — review it
  const [a, b] = [JSON.parse(m[1]), JSON.parse(m[2])]
  if (a.ifs !== b.ifs) return `branching differs (${a.ifs} vs ${b.ifs} ifs)`
  if (Math.abs(a.loops - b.loops) > 1)
    return `loop count differs by ${Math.abs(a.loops - b.loops)}`
  return null
}

/** the file whose text contains this problem id */
function fileFor(id) {
  for (const f of FILES) {
    const s = readFileSync(f, "utf8")
    if (s.includes(`id: "${id}",`)) return f
  }
  throw new Error(`no file holds ${id}`)
}

/** a string as it is WRITTEN inside a template literal, not as it reads */
const escaped = (code) =>
  code.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")

/** the exact python literal as it appears in source, so we can anchor on it */
function pythonLiteral(src, python, from) {
  // The value a template literal produces is not the bytes on disk: a Python
  // line-continuation is ONE backslash in the string and TWO in the source, so
  // anchoring on the raw value can never match. Use the written form — the
  // same escaping block() emits. CRLF is the sibling trap, handled by the
  // caller. This cost validate-bst every run until 2026-09-08.
  const needle = "python: `" + escaped(python) + "`,"
  const at = src.indexOf(needle, from)
  if (at < 0) throw new Error("python literal not found verbatim")
  return { at, end: at + needle.length }
}

const block = (indent, lang, code) =>
  `\n${indent}${lang}: \`${escaped(code)}\`,`

function main() {
  const gen = JSON.parse(readFileSync(arg("--in"), "utf8"))
  const report = {
    written: 0,
    skipped: [],
    failed: [],
    disagreed: [],
    accepted: [],
  }

  for (const [id, rungs] of Object.entries(gen)) {
    const problem = PROBLEMS.find((p) => p.id === id)
    if (!problem) {
      report.failed.push(`${id}: unknown problem`)
      continue
    }
    const file = fileFor(id)
    // The working tree is CRLF on Windows, but a template literal normalises
    // CRLF to LF in its VALUE — so the string this script imported can never
    // match the bytes on disk. Work in LF; git puts the line endings back.
    let src = readFileSync(file, "utf8").replaceAll("\r\n", "\n")
    // stay inside this problem's object literal
    const start = src.indexOf(`id: "${id}",`)

    for (const [key, out] of Object.entries(rungs)) {
      if (out.error) {
        report.failed.push(`${id}/${key}: ${out.error.slice(0, 60)}`)
        continue
      }
      const verdict = adjudicate(out.agree)
      if (verdict && !accept) {
        // Two models modelling the same Python differently is a smell, not a
        // verdict. It was the only automatic semantic signal when this was
        // written; since B27 the differential runner executes the block
        // against the Python and is strictly stronger — on 2026-09-08 it
        // caught a rotting-fruit BFS both models agreed on and both got wrong.
        // So: still the default gate, but --accept-disagreed hands the
        // decision to `verify:code` + `verify:run` instead of dropping the
        // block on the floor.
        report.disagreed.push(`${id}/${key}: ${verdict}`)
        continue
      }
      if (verdict) report.accepted.push(`${id}/${key}: ${verdict}`)
      const rung =
        key === "optimal"
          ? problem
          : (problem.alternatives ?? []).find((a) => a.name === key)
      if (!rung) {
        report.failed.push(`${id}/${key}: rung vanished`)
        continue
      }
      if (rung.java && rung.cpp) {
        report.skipped.push(`${id}/${key}: already has both`)
        continue
      }
      let loc
      try {
        loc = pythonLiteral(src, rung.python, start)
      } catch (e) {
        report.failed.push(`${id}/${key}: ${e.message}`)
        continue
      }
      // indentation of the `python:` key, so the new keys line up with it
      const lineStart = src.lastIndexOf("\n", loc.at) + 1
      const indent = src.slice(lineStart, loc.at)
      let insert = ""
      if (!rung.java) insert += block(indent, "java", out.java)
      if (!rung.cpp) insert += block(indent, "cpp", out.cpp)
      src = src.slice(0, loc.end) + insert + src.slice(loc.end)
      report.written++
    }
    if (!dry) writeFileSync(file, src)
  }

  console.log(`written ${report.written}`)
  for (const k of ["accepted", "disagreed", "failed", "skipped"])
    if (report[k].length)
      console.log(`\n${k} (${report[k].length}):\n  ${report[k].join("\n  ")}`)
  if (dry) console.log("\n--dry: nothing was saved")
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main()
