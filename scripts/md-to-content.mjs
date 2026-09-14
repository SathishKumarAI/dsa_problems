// Convert one `docs/deep/<id>_explained.md` into `src/content/<id>.ts` — the
// typed teaching document (`src/content/types.ts`).
//
// This script is the point of the migration, not the one file it produces.
// There are 82 documents; hand-converting them is 82 chances to drop a
// paragraph, and the repo's own rule about extracting shared markup says to
// snapshot the rendered output and diff it after. So: parse mechanically,
// carry every byte of prose through unchanged, and let the round-trip check
// (`scripts/content-roundtrip.mjs`) prove nothing was lost.
//
// What it maps, per `docs/deep/README.md` §"Required structure":
//
//   ## Understanding the Problem        -> understanding  (+ the unlocks table)
//   ## Reading the Calculations         -> calculations   (10 of 127 have it)
//   ## Approach N: <title>              -> approaches[]   (six ### parts each)
//   ## The Overall Arc                  -> arc
//   ## Comparison                       -> comparison     (parsed to head/rows)
//   ## Interview Priority               -> interview
//   ## How to Get Fluent                -> fluent         (10 of 127 have it)
//   ## Full Runnable Script             -> script         (the python fence)
//
// The `rung` on each approach cannot be inferred from prose — the heading says
// "Nested walk", the record says `brute` — so it is matched against the
// problem's rung keys by name similarity and LEFT BLANK when unsure. A blank
// rung fails `content.test.ts`, which is the intended outcome: a human decides,
// once, and the type keeps it decided.
//
// Run:  node scripts/md-to-content.mjs --id cycle-detect
//       node scripts/md-to-content.mjs --all --dry

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs"
import { join } from "node:path"

const arg = (k) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? process.argv[i + 1] : undefined
}
const has = (k) => process.argv.includes(k)

const DEEP = "docs/deep"
const OUT = "src/content"

/** split a markdown body on `## ` headings, keeping order */
function sections(md) {
  const out = []
  let current = null
  for (const line of md.split("\n")) {
    const h2 = /^##\s+(.*)$/.exec(line)
    // a `## ` inside a fenced block is not a heading
    if (h2 && !inFence) {
      current = { title: h2[1].trim(), lines: [] }
      out.push(current)
      continue
    }
    if (/^```/.test(line)) inFence = !inFence
    if (current) current.lines.push(line)
  }
  return out.map((s) => ({ title: s.title, body: s.lines.join("\n").trim() }))
}
let inFence = false

/** split one section's body on `### ` headings */
function parts(body) {
  const out = new Map()
  let key = ""
  let buf = []
  let fence = false
  for (const line of body.split("\n")) {
    if (/^```/.test(line)) fence = !fence
    const h3 = !fence && /^###\s+(.*)$/.exec(line)
    if (h3) {
      if (key) out.set(key, buf.join("\n").trim())
      key = h3[1].trim().toLowerCase()
      buf = []
      continue
    }
    buf.push(line)
  }
  if (key) out.set(key, buf.join("\n").trim())
  return out
}

/** the first fenced block of a given language, without its fence lines */
function fence(body, lang = "python") {
  const re = new RegExp("```" + lang + "\\n([\\s\\S]*?)```", "m")
  const m = re.exec(body)
  return m ? m[1].replace(/\n+$/, "") : ""
}

/** the LAST fenced python block — the house format's full runnable script */
function lastFence(body, lang = "python") {
  const re = new RegExp("```" + lang + "\\n([\\s\\S]*?)```", "gm")
  let m
  let last = ""
  while ((m = re.exec(body))) last = m[1]
  return last.replace(/\n+$/, "")
}

/** a markdown pipe table -> { head, rows } */
function table(body) {
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"))
  if (lines.length < 3) return undefined
  const cells = (l) =>
    l
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim())
  const head = cells(lines[0])
  const rows = lines.slice(2).map(cells)
  return { head, rows }
}

/** strip the `*(an addition — not in the data file's ladder)*` disclosure:
 *  the record makes it unnecessary, because there is no longer a ladder the
 *  document can be an addition TO */
const cleanTitle = (t) =>
  t
    .replace(/^Approach\s+\d+:\s*/i, "")
    .replace(/\s*\*\([^)]*\)\*\s*$/, "")
    .trim()

/** a TS template literal, with the three things that can break one escaped */
const lit = (s) =>
  "`" + String(s).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`"

function convert(id, rungKeys) {
  // CRLF, normalised on read. Without this `/^##\s+(.*)$/` never matches: `.`
  // does not match a line terminator, so the capture stops before the CR and
  // the anchor can never match.
  // cannot then match. The first run reported "0 approaches" on a document with
  // four — it is in CLAUDE.md's trap list for exactly this reason.
  const md = readFileSync(join(DEEP, `${id}_explained.md`), "utf8").replace(
    /\r\n?/g,
    "\n"
  )
  inFence = false
  const secs = sections(md)
  const find = (re) => secs.find((s) => re.test(s.title))

  const understanding = find(/^Understanding the Problem/i)
  const unlocksSec = understanding && parts(understanding.body)
  const unlockTable = unlocksSec
    ? table([...unlocksSec.values()].find((v) => v.includes("|")) ?? "")
    : undefined

  const approaches = secs
    .filter((s) => /^Approach\s+\d+/i.test(s.title))
    .map((s) => {
      const p = parts(s.body)
      const get = (re) => {
        for (const [k, v] of p) if (re.test(k)) return v
        return ""
      }
      const title = cleanTitle(s.title)
      // match the heading against the problem's rung keys; blank when unsure,
      // which fails the gate on purpose rather than guessing
      const slug = title.toLowerCase()
      const rung =
        rungKeys.find((k) => slug.replace(/[^a-z]/g, "").includes(k)) ??
        rungKeys.find((k) => slug.split(/[\s—-]+/).includes(k)) ??
        ""
      return {
        rung,
        title,
        idea: get(/^the idea/),
        intuition: get(/^how to think/),
        worked: get(/^worked example/),
        code: fence(get(/^code/)),
        mistake: get(/^common mistake/),
        cost: get(/^complexity/),
      }
    })

  const comparison = table(find(/^Comparison/i)?.body ?? "")
  const scriptSec = find(/^Full Runnable Script/i)

  return {
    problemId: id,
    understanding: understanding
      ? understanding.body.split(/^###\s/m)[0].trim()
      : "",
    unlocks: unlockTable
      ? unlockTable.rows.map((r) => ({ constraint: r[0], what: r[1] }))
      : undefined,
    calculations: find(/^Reading the Calculations/i)?.body,
    approaches,
    arc: find(/^The Overall Arc/i)?.body ?? "",
    comparison: comparison ?? { head: [], rows: [] },
    interview: find(/^Interview Priority/i)?.body ?? "",
    fluent: find(/^How to Get Fluent/i)?.body,
    // everything in the section that is NOT the fence: the house format puts
    // real teaching there — which helpers are scaffolding rather than part of
    // the answer, and the step limit a cyclic read-back needs or the harness
    // hangs. The first conversion took the fence and discarded this.
    scriptNote: scriptSec
      ? scriptSec.body.split("```")[0].trim() || undefined
      : undefined,
    script: lastFence(scriptSec?.body ?? md),
  }
}

function emit(doc) {
  const a = (x) => `  {
    rung: ${JSON.stringify(x.rung)},
    title: ${JSON.stringify(x.title)},
    idea: ${lit(x.idea)},
    intuition: ${lit(x.intuition)},
    worked: ${lit(x.worked)},
    code: ${lit(x.code)},
    mistake: ${lit(x.mistake)},
    cost: ${lit(x.cost)},
  },`

  return `// ${doc.problemId} — the teaching document, as data.
//
// Converted from docs/deep/${doc.problemId}_explained.md by
// scripts/md-to-content.mjs. Every byte of prose carried through unchanged;
// what changed is that the STRUCTURE is now a type (src/content/types.ts)
// rather than a heading convention a script had to grep for.
//
// Reached only through \`lib/content.ts\`'s glob — never import this file.

import type { TeachingDoc } from "./types.ts"

export const doc: TeachingDoc = {
  problemId: ${JSON.stringify(doc.problemId)},
  understanding: ${lit(doc.understanding)},
${doc.unlocks ? `  unlocks: ${JSON.stringify(doc.unlocks, null, 4).replace(/\n/g, "\n  ")},\n` : ""}${doc.calculations ? `  calculations: ${lit(doc.calculations)},\n` : ""}  approaches: [
${doc.approaches.map(a).join("\n")}
  ],
  arc: ${lit(doc.arc)},
  comparison: ${JSON.stringify(doc.comparison, null, 4).replace(/\n/g, "\n  ")},
  interview: ${lit(doc.interview)},
${doc.fluent ? `  fluent: ${lit(doc.fluent)},\n` : ""}${doc.scriptNote ? `  scriptNote: ${lit(doc.scriptNote)},\n` : ""}  script: ${lit(doc.script)},
}

export default doc
`
}

// ── main ────────────────────────────────────────────────────────────────────
const { PROBLEMS } = await import("../src/data/index.ts")
const ids = has("--all")
  ? readdirSync(DEEP)
      .filter((f) => f.endsWith("_explained.md"))
      .map((f) => f.replace("_explained.md", ""))
  : [arg("--id")].filter(Boolean)

if (!ids.length) {
  console.error("usage: node scripts/md-to-content.mjs --id <problem-id> | --all")
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })
let blanks = 0
for (const id of ids) {
  const problem = PROBLEMS.find((p) => p.id === id)
  if (!problem) {
    console.error(`${id}: no such problem`)
    process.exitCode = 1
    continue
  }
  const rungKeys = [
    ...(problem.alternatives ?? []).map((s) => s.key).filter(Boolean),
    "optimal",
  ]
  const doc = convert(id, rungKeys)
  const missing = doc.approaches.filter((a) => !a.rung).length
  blanks += missing
  if (!has("--dry")) writeFileSync(join(OUT, `${id}.ts`), emit(doc), "utf8")
  console.log(
    `${id}: ${doc.approaches.length} approaches` +
      `${missing ? `, ${missing} with no rung (decide by hand)` : ""}` +
      `, script ${doc.script.split("\n").length} lines` +
      `${doc.comparison.rows.length ? `, comparison ${doc.comparison.rows.length} rows` : ", NO COMPARISON"}`
  )
}
if (blanks)
  console.log(
    `\n${blanks} approach${blanks === 1 ? "" : "es"} could not be matched to a rung key.\n` +
      `That is the one judgement call in this conversion — set it by hand; content.test.ts fails until you do.`
  )
