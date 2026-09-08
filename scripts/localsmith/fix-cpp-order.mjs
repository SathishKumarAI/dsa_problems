// C++ needs a name declared before it is used, and a model asked for "the
// entry point plus its helper" writes them in the order a reader wants: entry
// first. In one translation unit that does not compile.
//
// Rather than nag the prompt about it, reorder the blocks: split the body into
// top-level functions and move any function that another one calls above its
// caller. Python and Java do not care, so only C++ is touched.
//
// Run:  node scripts/localsmith/fix-cpp-order.mjs [--dry]

import { readFileSync, writeFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { PROBLEMS } from "../../src/data/index.ts"

const FILES = [
  "arrays-hashing", "binary-search", "dp", "graphs", "heaps",
  "linked-list", "sliding-window", "stack", "trees", "two-pointers",
].map((n) => `src/data/problems/${n}.ts`)

/** split a C++ body into top-level definitions, keyed by the name they define */
export function definitions(src) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "{") depth++
    else if (src[i] === "}") {
      depth--
      if (depth === 0) {
        const text = src.slice(start, i + 1).trim()
        const name = text.match(/([A-Za-z_]\w*)\s*\([^)]*\)\s*\{/)?.[1] ?? ""
        out.push({ text, name })
        start = i + 1
      }
    }
  }
  const tail = src.slice(start).trim()
  return { defs: out, tail }
}

/** move callees above their callers; returns null when nothing needed moving */
export function reorder(src) {
  const { defs, tail } = definitions(src)
  if (defs.length < 2) return null
  const ordered = []
  const placed = new Set()
  // a definition may be emitted once everything it calls is already out
  const calls = (d) =>
    defs.filter(
      (o) => o !== d && o.name && new RegExp(`\\b${o.name}\\s*\\(`).test(d.text)
    )
  let guard = 0
  while (ordered.length < defs.length && guard++ < 50) {
    for (const d of defs) {
      if (placed.has(d)) continue
      if (calls(d).every((c) => placed.has(c))) {
        ordered.push(d)
        placed.add(d)
      }
    }
  }
  // mutual recursion, or nothing to do
  if (ordered.length !== defs.length) return null
  const result = ordered.map((d) => d.text).join("\n\n") + (tail ? "\n" + tail : "")
  return result === src.trim() ? null : result
}

function main() {
  const dry = process.argv.includes("--dry")
  let fixed = 0
  for (const file of FILES) {
    let src = readFileSync(file, "utf8").replaceAll("\r\n", "\n")
    let touched = false
    for (const p of PROBLEMS) {
      const rungs = [p, ...(p.alternatives ?? [])]
      for (const r of rungs) {
        if (!r.cpp) continue
        const better = reorder(r.cpp)
        if (!better) continue
        const needle = "cpp: `" + r.cpp + "`,"
        if (!src.includes(needle)) continue
        src = src.replace(needle, "cpp: `" + better + "`,")
        touched = true
        fixed++
        console.log(`reordered ${p.id}${r === p ? "" : "/" + r.name}`)
      }
    }
    if (touched && !dry) writeFileSync(file, src)
  }
  console.log(`\n${fixed} C++ blocks reordered${dry ? " (dry)" : ""}`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main()
