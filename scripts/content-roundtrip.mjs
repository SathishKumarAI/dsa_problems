// Did the conversion lose anything?
//
// `scripts/md-to-content.mjs` moves a teaching document out of Markdown and
// into a typed object. The repo's own rule about extracting shared markup is
// that you snapshot the output and diff it after — because markup that looks
// identical often is not, and the difference is content.
//
// The first version of this script compared the RENDERED page before and after,
// out of a real browser. That was the wrong instrument: the composed page
// legitimately renders a different number of code blocks, writes its own
// heading for a section, and word-wraps differently, so the diff was 40 lines
// of noise around an unknown number of real losses. It also counted eight EMPTY
// `<pre>` elements in the old page as lost content.
//
// This compares the SOURCE DOCUMENT against the FIELDS, which is the question
// actually being asked: did every line the author wrote land somewhere in the
// record? No renderer, no browser, no ambiguity — and it runs in 200 ms across
// all 82 documents instead of one page at a time.
//
// Run:  node scripts/content-roundtrip.mjs --id cycle-detect
//       node scripts/content-roundtrip.mjs --all

import { readFileSync, existsSync, readdirSync } from "node:fs"
import { join } from "node:path"

const arg = (k) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? process.argv[i + 1] : undefined
}

const DEEP = "docs/deep"
const OUT = "src/problems"

/** every line of the source that carries the author's words */
function sourceLines(md) {
  const out = []
  let fence = false
  for (const raw of md.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim()
    if (/^```/.test(line)) {
      fence = !fence
      continue
    }
    if (fence) {
      out.push({ kind: "code", text: line })
      continue
    }
    if (!line) continue
    if (line === "---") continue
    // headings are STRUCTURE — the type carries them as field names and the
    // composer writes them back, so a heading that changes wording is not a
    // lost sentence. Everything else is the author's.
    if (/^#{1,6}\s/.test(line)) continue
    out.push({ kind: "prose", text: line })
  }
  return out
}

/** every string the module holds, concatenated */
function fieldText(src) {
  // the emitted module is a TS literal; read it as text rather than importing
  // it, so this script needs no bundler and no alias resolution
  return src.replace(/\s+/g, " ")
}

const norm = (s) => s.replace(/\s+/g, " ").trim()

/** every `.ts` under one problem's directory, concatenated.
 *
 *  The document is a DIRECTORY now, so "did this line survive" is a question
 *  about the whole of it — a paragraph that moved from `understanding.ts` to
 *  `traps.ts` has not been lost, and a check that read one file would say it
 *  had. The record half (index/problem/hints/solutions) is in here too, which
 *  costs nothing: it can only make a line easier to find, and no md line is
 *  sourced from it. */
function moduleText(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(moduleText(p))
    else if (e.name.endsWith(".ts")) out.push(readFileSync(p, "utf8"))
  }
  return out.join("\n")
}

function check(id) {
  const mdPath = join(DEEP, `${id}_explained.md`)
  const dir = join(OUT, id)
  if (!existsSync(mdPath) || !existsSync(join(dir, "doc.ts"))) return null

  const lines = sourceLines(readFileSync(mdPath, "utf8"))
  const haystack = fieldText(moduleText(dir))

  const present = (t) => {
    if (t.length < 12) return true // a lone pipe, a bullet marker, a separator
    // Three encodings, because the emitter uses two. Prose fields are TEMPLATE
    // literals (backtick and dollar-brace escaped); `unlocks` and `comparison`
    // are JSON (quote and backslash escaped). A row carrying a quoted word — a
    // "visited" stamp — is present in the module and absent from a search that
    // only knows about template literals, which is how this reported a loss on
    // a row that was sitting right there.
    const tmpl = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`")
    const json = JSON.stringify(t).slice(1, -1)
    return (
      haystack.includes(t) || haystack.includes(tmpl) || haystack.includes(json)
    )
  }

  const lost = lines.filter((l) => {
    const t = norm(l.text)
    // A TABLE ROW is not carried through as a row: `unlocks` and `comparison`
    // are parsed into CELLS, which is the whole point of typing them. So a row
    // survives when every one of its cells does. Comparing whole lines reported
    // 17 losses on a document that had lost nothing.
    if (l.kind === "prose" && t.startsWith("|")) {
      const cells = t
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c && !/^-+$/.test(c))
      // A table HEADER is structure, like a heading: the type names the columns
      // (`constraint` / `what`) and the composer writes the header back. Only
      // the body rows carry the author's words.
      if (cells.every((c) => c.length < 40) && !/[.:;]/.test(t)) return false
      return !cells.every(present)
    }
    return !present(t)
  })

  return { id, total: lines.length, lost }
}

// `--all` means "every module that still has a source to compare against".
//
// It used to enumerate every `.ts` under the output dir bar `types.ts`, which
// picked up `content.test` — never a document — and `cycle-detect`, whose
// Markdown was deleted once it round-tripped. So the gate the fan-out was told
// to satisfy could never say "ok" again after the first conversion: it was
// unreachable by construction, and an agent had to work that out from a
// confusing failure list.
const ids = process.argv.includes("--all")
  ? readdirSync(OUT, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(OUT, d.name, "doc.ts")))
      .map((d) => d.name)
      .filter((id) => existsSync(join(DEEP, `${id}_explained.md`)))
  : [arg("--id")].filter(Boolean)

if (!ids.length) {
  console.error("usage: node scripts/content-roundtrip.mjs --id <problem-id> | --all")
  process.exit(1)
}

let failed = 0
for (const id of ids) {
  const r = check(id)
  if (!r) {
    // asked for by --id with no source: already converted and deleted, which is
    // the finished state, not a failure
    console.log(`--    ${id.padEnd(28)} no source document — already migrated`)
    continue
  }
  const ok = r.lost.length === 0
  if (!ok) failed++
  console.log(
    `${ok ? "ok  " : "LOST"}  ${id.padEnd(28)} ${r.total} lines${
      ok ? "" : `, ${r.lost.length} not carried through`
    }`
  )
  for (const l of r.lost.slice(0, 8))
    console.log(`        ${l.kind.padEnd(5)} ${l.text.slice(0, 120)}`)
  if (r.lost.length > 8) console.log(`        … and ${r.lost.length - 8} more`)
}

console.log(
  failed
    ? `\nFAIL — ${failed} document${failed === 1 ? "" : "s"} lost content.`
    : `\nok — every line of ${ids.length} document${ids.length === 1 ? "" : "s"} is carried through.`
)
process.exit(failed ? 1 : 0)
