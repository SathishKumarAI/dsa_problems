// Wire one journey into the engine's registry, idempotently.
//
// `src/engine/index.ts` is a SHARED file: it holds one import and one array row
// per journey. When several journeys are written at once — by agents, or by a
// batch — hand-editing it is exactly where two writers collide and one of them
// silently loses its line (the reason `wire-batch.mjs` exists for problems).
//
// This does the same job for a journey: read what is on disk, add the import
// and the row if they are missing, leave everything else alone. Running it
// twice changes nothing, and running it for a journey that is already wired is
// a no-op rather than a duplicate.
//
// It also enforces the one rule a journeyed problem must satisfy (B1): the
// problem may not keep its static `walkthrough`, because the journey is the
// single source and the two drift. Pass --drop-walkthrough to remove it.
//
// Run:  node scripts/register-journey.mjs --file src/data/journeys/rotate-list.ts \
//         --export rotateList [--drop-walkthrough src/data/problems/linked-list/rotate-list.ts]

import { readFileSync, writeFileSync } from "node:fs"

const arg = (k) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? process.argv[i + 1] : undefined
}

const file = arg("--file")
const name = arg("--export")
const problemFile = arg("--drop-walkthrough")
if (!file || !name) {
  console.error(
    "usage: --file src/data/journeys/<slug>.ts --export <exportName> [--drop-walkthrough <problem file>]"
  )
  process.exit(2)
}

const REGISTRY = "src/engine/index.ts"
const rel = "../" + file.replace(/^src\//, "")
const importLine = `import { ${name} } from "${rel}"`
const rowLine = `  ${name} as unknown as AnyJourney,`

let src = readFileSync(REGISTRY, "utf8")
let changed = false

if (!src.includes(importLine)) {
  // after the LAST journey import, so the block stays one run of imports
  const imports = [...src.matchAll(/^import \{ \w+ \} from "\.\.\/data\/journeys\/[^"]+"$/gm)]
  if (!imports.length) throw new Error(`${REGISTRY}: no journey imports to anchor to`)
  const last = imports[imports.length - 1]
  src = src.slice(0, last.index + last[0].length) + "\n" + importLine + src.slice(last.index + last[0].length)
  changed = true
}

if (!src.includes(rowLine)) {
  const rows = [...src.matchAll(/^ {2}\w+ as unknown as AnyJourney,$/gm)]
  if (!rows.length) throw new Error(`${REGISTRY}: no journey rows to anchor to`)
  const last = rows[rows.length - 1]
  src = src.slice(0, last.index + last[0].length) + "\n" + rowLine + src.slice(last.index + last[0].length)
  changed = true
}

if (changed) writeFileSync(REGISTRY, src, "utf8")
console.log(changed ? `wired ${name}` : `${name} was already wired`)

if (problemFile) {
  // CRLF, every time. Git checks these files out with \r\n on Windows, so
  // searching for "\n  ],\n" finds nothing — and an unchecked indexOf of -1
  // turns the slice below into "keep everything from character 5", which
  // DUPLICATES the file instead of trimming it. That is what happened the
  // first time this ran (CLAUDE.md, the CRLF trap). Match either ending, and
  // fail loudly rather than writing something that only looks plausible.
  const text = readFileSync(problemFile, "utf8")
  const at = text.indexOf("  walkthrough: [")
  if (at === -1) {
    console.log("no walkthrough to drop")
  } else {
    const close = /\r?\n {2}\],\r?\n/g
    close.lastIndex = at
    const m = close.exec(text)
    if (!m)
      throw new Error(`${problemFile}: a walkthrough with no closing "]," — not touching it`)
    const out = text.slice(0, at) + text.slice(m.index + m[0].length)
    if (out.length >= text.length)
      throw new Error(`${problemFile}: the edit did not shrink the file — refusing to write`)
    writeFileSync(problemFile, out, "utf8")
    console.log(`dropped the static walkthrough from ${problemFile} (B1)`)
  }
}
