// Run every Python block in docs/statistics/*.md.
//
// These chapters teach by SIMULATION — the Central Limit Theorem by sampling,
// what "95% confident" means by building a thousand intervals and counting how
// many contain the truth. Numbers quoted in the prose come from those runs. So
// a block that no longer executes is not a broken snippet, it is a chapter
// whose evidence has quietly evaporated, and the reader cannot tell.
//
// Blocks run CUMULATIVELY within a chapter — block 3 is executed with blocks 1
// and 2 prepended — because that is the order a reader meets them in, and a
// chapter is allowed to establish its imports and its dataset once at the top
// rather than repeating twenty lines of setup in every listing.
//
// What that does NOT excuse is a block depending on something never shown. The
// first run of this gate found eight of sixteen blocks failing standalone on
// missing imports and undefined names; run in reading order they pass, which is
// the honest contract. If a block fails even cumulatively, the chapter is
// broken as written and no reader could run it.
//
// Run:  node scripts/verify-statistics.mjs
//       node scripts/verify-statistics.mjs --file 03-sampling-and-the-clt.md
//       node scripts/verify-statistics.mjs --show    # print each block's output

import { execFileSync } from "node:child_process"
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const arg = (k) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? process.argv[i + 1] : undefined
}
const show = process.argv.includes("--show")
const only = arg("--file")

const DIR = "docs/statistics"
const files = readdirSync(DIR)
  .filter((f) => /^\d\d-.*\.md$/.test(f))
  .filter((f) => !only || f === only)
  .sort()

if (!files.length) {
  console.log(`no chapters matched${only ? ` --file ${only}` : ""}`)
  process.exit(1)
}

const tmp = mkdtempSync(join(tmpdir(), "stats-"))
const bad = []
let blocks = 0

for (const file of files) {
  // normalise line endings before matching: git checks these out with CRLF on
  // Windows and a fence pattern written "```python\n" then finds nothing
  const md = readFileSync(join(DIR, file), "utf8").replace(/\r\n/g, "\n")
  const found = [...md.matchAll(/```python\n([\s\S]*?)```/g)].map((m) => m[1])
  if (!found.length) {
    bad.push([file, "—", "no python block in the chapter"])
    continue
  }
  const sofar = []
  for (const [i, code] of found.entries()) {
    blocks++
    sofar.push(code)
    const path = join(tmp, `${file.replace(/\W+/g, "_")}_${i + 1}.py`)
    // the chapter as a reader has it so far, not this listing in isolation
    writeFileSync(path, sofar.join("\n"))
    try {
      // simulations are slow by nature; a chapter that needs longer than this
      // is a chapter whose demo a reader will abandon
      const out = execFileSync("python", [path], {
        encoding: "utf8",
        timeout: 180_000,
      })
      if (show) console.log(`--- ${file} block ${i + 1}\n${out.trim()}\n`)
      else console.log(`ok   ${file} block ${i + 1}`)
    } catch (e) {
      const why = String(e.stderr || e.message)
        .trim()
        .split(/\r?\n/)
        .at(-1)
      bad.push([file, `block ${i + 1}`, why.slice(0, 160)])
    }
  }
}

rmSync(tmp, { recursive: true, force: true })

for (const [file, where, why] of bad) console.log(`FAIL ${file} ${where}: ${why}`)
console.log(
  `\n${blocks - bad.length}/${blocks} python blocks ran clean across ${files.length} chapter${files.length === 1 ? "" : "s"}`
)
process.exitCode = bad.length ? 1 : 0
