// Copy the five files a Pyodide runtime actually needs out of node_modules and
// into `public/pyodide/`, where Vite serves them as static assets.
//
// Why SELF-HOSTED rather than the official CDN: the same argument `index.css`
// already makes about the fonts. An external request on the critical path is a
// render-blocking dependency on somebody else's server, and these pages are read
// offline as often as not. A Python runtime is a bigger version of that bet — it
// is executable code, from a third-party origin, that this app hands the
// learner's own keystrokes to. Pinned in package.json, served from our own
// origin, no integrity hash to keep in step with anything.
//
// Why COPIED rather than committed: `public/pyodide/` is 10.6 MB of build output
// with a version number in package.json. Committing it is the mistake B72 just
// undid on docs/learn — a derived artifact wearing a source file's clothes. This
// script runs in `predev` / `prebuild` / `pretest:ui` beside `docs:learn`, skips
// the copy when the files are already current, and takes about 200 ms cold.
//
// The five files, and why each one:
//   pyodide.mjs        the loader the worker imports
//   pyodide.asm.js     the emscripten glue
//   pyodide.asm.wasm   CPython itself — 8.2 MB, the whole reason this is lazy
//   python_stdlib.zip  the standard library — 2.3 MB
//   pyodide-lock.json  the package index; the loader reads it at startup
//
// Run: node scripts/copy-pyodide.mjs   (--force to re-copy regardless)

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const FILES = [
  "pyodide.mjs",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
]

const FROM = "node_modules/pyodide"
const TO = "public/pyodide"
const force = process.argv.includes("--force")

const version = JSON.parse(
  readFileSync(join(FROM, "package.json"), "utf8")
).version

mkdirSync(TO, { recursive: true })

let copied = 0
let bytes = 0
for (const f of FILES) {
  const src = join(FROM, f)
  const dst = join(TO, f)
  const from = statSync(src)
  // size AND mtime: a version bump that happens to produce the same byte count
  // is unlikely, but `npm i` rewrites mtimes, which makes this cheap and honest
  let current = false
  if (!force) {
    try {
      const to = statSync(dst)
      current = to.size === from.size && to.mtimeMs >= from.mtimeMs
    } catch {
      current = false
    }
  }
  if (current) continue
  copyFileSync(src, dst)
  copied++
  bytes += from.size
}

console.log(
  copied === 0
    ? `pyodide ${version} already in ${TO}`
    : `pyodide ${version}: copied ${copied} file${copied === 1 ? "" : "s"}, ${(
        bytes /
        1024 /
        1024
      ).toFixed(1)} MB to ${TO}`
)
