// Wire a batch of new problem files into the barrels and the vector table.
//
// Six agents wrote 20 problem files in parallel and were kept OUT of the three
// shared files on purpose: a barrel, `src/data/index.ts` and `vectors.mjs` are
// exactly where six writers collide. This does that part once, from what is
// actually on disk, so the wiring cannot disagree with the files.
//
// It is idempotent: a file already in its barrel is left alone, and a vector
// set already in VECTORS is skipped rather than duplicated.
//
// Run:  node scripts/wire-batch.mjs           # report only
//       node scripts/wire-batch.mjs --write   # rewrite the barrels + vectors

import { readFileSync, readdirSync, writeFileSync, existsSync, rmSync } from "node:fs"
import { join } from "node:path"

const ROOT = "src/data/problems"
const write = process.argv.includes("--write")

/** camelCase import name from a file id: "rotate-array" -> "rotateArray" */
const camel = (id) => id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())

/** the exported const name a barrel uses, e.g. arrays-hashing -> arraysHashing */
const BARREL_EXPORT = {
  "arrays-hashing": "arraysHashing",
  "two-pointers": "twoPointers",
  "sliding-window": "slidingWindow",
  "binary-search": "binarySearch",
  "linked-list": "linkedList",
  trees: "trees",
  heaps: "heaps",
  graphs: "graphs",
  stack: "stack",
  dp: "dp",
}

const report = { added: {}, vectors: [], skipped: [] }

for (const pattern of readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)) {
  const dir = join(ROOT, pattern)
  const files = readdirSync(dir)
  const problems = files
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => f.replace(/\.ts$/, ""))
    .sort()
  const barrelPath = join(dir, "index.ts")
  if (!existsSync(barrelPath)) continue
  const barrel = readFileSync(barrelPath, "utf8")

  // the ids already wired, in the order the barrel lists them — that order is
  // the order the site shows them in, so keep it and append the new ones
  const wired = [...barrel.matchAll(/from "\.\/([a-z0-9-]+)\.ts"/g)].map(
    (m) => m[1]
  )
  const fresh = problems.filter((p) => !wired.includes(p))
  if (!fresh.length) continue
  report.added[pattern] = fresh

  const order = [...wired, ...fresh]
  const name = BARREL_EXPORT[pattern] ?? camel(pattern)
  const out =
    `import type { Problem } from "../../types.ts"\n` +
    order.map((id) => `import { problem as ${camel(id)} } from "./${id}.ts"`).join("\n") +
    `\n\nexport const ${name}: Problem[] = [\n` +
    order.map((id) => `  ${camel(id)},`).join("\n") +
    `\n]\n`
  if (write) writeFileSync(barrelPath, out, "utf8")
}

// ---------- the vector fragments ----------

const VEC = "scripts/localsmith/vectors.mjs"
let vectors = readFileSync(VEC, "utf8").replace(/\r\n/g, "\n")
const fragments = []
for (const pattern of readdirSync(ROOT)) {
  const dir = join(ROOT, pattern)
  let files = []
  try {
    files = readdirSync(dir)
  } catch {
    continue
  }
  for (const f of files.filter((f) => f.endsWith(".vectors.txt")))
    fragments.push(join(dir, f))
}

for (const path of fragments) {
  const text = readFileSync(path, "utf8").replace(/\r\n/g, "\n").trim()
  // one entry per problem id at the top level of the fragment
  const ids = [...text.matchAll(/^\s{0,2}"([a-z0-9-]+)":\s*\{/gm)].map((m) => m[1])
  const fresh = ids.filter((id) => !vectors.includes(`  "${id}": {`))
  report.vectors.push({ path, ids, fresh })
  if (!fresh.length || !write) continue
  // splice in before the closing brace of VECTORS
  const close = vectors.indexOf("\n}\n", vectors.indexOf("export const VECTORS"))
  vectors = vectors.slice(0, close + 1) + text + "\n" + vectors.slice(close + 1)
}

if (write && fragments.length) {
  writeFileSync(VEC, vectors, "utf8")
  for (const path of fragments) rmSync(path)
}

console.log(JSON.stringify(report, null, 1))
console.log(
  write ? "\nwired." : "\nreport only — pass --write to apply."
)
