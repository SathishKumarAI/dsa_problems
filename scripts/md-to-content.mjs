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
const BINDINGS = JSON.parse(readFileSync("scripts/rung-bindings.json", "utf8"))
/** `###` parts under a `##` section that has a field but no room for them */
let leftover = []
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
    // both forms: the house format uses "Approach 1: Title" and "Approach 1 — Title"
    .replace(/^Approach\s+\d+\s*[:—–-]\s*/i, "")
    .replace(/\s*\*\([^)]*\)\*\s*$/, "")
    .trim()

/** a TS template literal, with the three things that can break one escaped */
const lit = (s) =>
  "`" + String(s).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`"

function convert(id, rungKeys) {
  // CRLF, normalised on read. Without this `/^##\s+(.*)$/` never matches: `.`
  // does not match a line terminator, so the capture stops before the CR and the
  // anchor can never match. The first run reported "0 approaches" on a document
  // with four; it is in CLAUDE.md's trap list for exactly this reason.
  const md = readFileSync(join(DEEP, `${id}_explained.md`), "utf8").replace(
    /\r\n?/g,
    "\n"
  )
  inFence = false
  leftover = []
  const secs = sections(md)

  // Every section is CLAIMED exactly once, and anything left over is an error
  // rather than a silent loss. The first converter read the sections it knew
  // about and dropped the rest: a seventh `###` part in an approach, the prose
  // inside `### Code`, everything after the script fence, an unrecognised `##`.
  // Twelve documents lost 456 lines between them and only a separate round-trip
  // check noticed. A converter that cannot place something should say so.
  const unclaimed = new Set(secs)
  const claim = (sec) => {
    unclaimed.delete(sec)
    return sec
  }
  const find = (re) => {
    const sec = secs.find((s) => re.test(s.title))
    return sec ? claim(sec) : undefined
  }

  // ── Understanding: the WHOLE section bar the unlocks table ────────────────
  const understanding = find(/^Understanding the Problem/i)
  let unlocks
  let understandingBody = ""
  if (understanding) {
    const rows = []
    const kept = []
    let inTable = false
    for (const line of understanding.body.split("\n")) {
      const t = line.trim()
      if (t.startsWith("|")) {
        inTable = true
        rows.push(t)
        continue
      }
      // the heading that introduces the table goes with the table
      if (inTable && !t) continue
      inTable = false
      kept.push(line)
    }
    const parsed = table(rows.join("\n"))
    unlocks = parsed
      ? parsed.rows.map((r) => ({ constraint: r[0], what: r[1] }))
      : undefined
    // drop the now-empty "### The constraints, and what each one unlocks"
    understandingBody = kept
      .join("\n")
      .replace(/^###\s+The constraints[^\n]*$/im, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }

  // ── approaches ────────────────────────────────────────────────────────────
  const KNOWN = [
    ["idea", /^the idea/],
    ["intuition", /^how to think/],
    ["worked", /^worked example/],
    ["code", /^code$/],
    ["mistake", /^common mistake/],
    ["cost", /^complexity/],
  ]

  const approaches = secs
    .filter((s) => /^Approach\s+\d+/i.test(s.title))
    .map((s, i) => {
      claim(s)
      const p = parts(s.body)
      const out = {}
      const seen = new Set()
      for (const [field, re] of KNOWN)
        for (const [k, v] of p)
          if (re.test(k) && !seen.has(k)) {
            out[field] = v
            seen.add(k)
            break
          }

      // `### Code` carries prose as well as the fence on 7 of 12 documents
      const codeBody = out.code ?? ""
      const codeFence = fence(codeBody)
      const codeNote = codeBody
        .replace(/```[\s\S]*?```/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim()

      // everything else, in document order — the `> **Why it works.**` argument
      // the format demands of every greedy and every two-pointer solution
      const notes = [...p.entries()]
        .filter(([k]) => !seen.has(k))
        .map(([title, body]) => ({ title, body }))

      return {
        rung: bindingFor(id, i) ?? guessRung(s.title, rungKeys),
        title: cleanTitle(s.title),
        idea: out.idea ?? "",
        intuition: out.intuition ?? "",
        worked: out.worked ?? "",
        code: codeFence,
        codeNote: codeNote || undefined,
        mistake: out.mistake ?? "",
        cost: out.cost ?? "",
        notes: notes.length ? notes : undefined,
      }
    })

  // ── the rest ──────────────────────────────────────────────────────────────
  const arcSec = find(/^The Overall Arc/i)
  const comparisonSec = find(/^Comparison/i)
  const interviewSec = find(/^Interview Priority/i)
  const fluentSec = find(/^How to Get Fluent/i)
  const calcSec = find(/^Reading the Calculations/i)
  const scriptSec = find(/^Full Runnable Script/i)

  // The script section is prose, then the script, then `### Output when run`.
  // Splitting on the first fence kept the prose and threw away the output —
  // 291 of 456 lost lines across the first batch.
  let scriptNote, script, scriptOutput
  if (scriptSec) {
    const sp = parts(scriptSec.body)
    const head = scriptSec.body.split(/^###\s/m)[0]
    scriptNote = head.replace(/```[\s\S]*?```/g, "").trim() || undefined
    script = lastFence(head) || lastFence(scriptSec.body)
    const outPart = [...sp.entries()].find(([k]) => /output|when run/i.test(k))
    if (outPart) scriptOutput = outPart[1]
    // any other `###` under the script section joins the document's notes
    for (const [k, v] of sp)
      if (!/output|when run/i.test(k)) leftover.push({ title: k, body: v })
  }

  const comparison = table(comparisonSec?.body ?? "")
  // A `## Comparison` section is usually nothing but its table — but not always:
  // group-anagrams closes with two sentences under it, and the first converter
  // parsed the table and dropped them. Anything in that section which is not a
  // table row joins the document's notes rather than vanishing.
  if (comparisonSec) {
    const aside = comparisonSec.body
      .split("\n")
      .filter((l) => !l.trim().startsWith("|"))
      .join("\n")
      .trim()
    if (aside) leftover.push({ title: "Comparison", body: aside })
  }

  // anything the converter could not place
  const notes = [
    ...leftover,
    ...[...unclaimed].map((s) => ({ title: s.title, body: s.body })),
  ]

  return {
    problemId: id,
    understanding: understandingBody,
    unlocks,
    calculations: calcSec?.body,
    approaches,
    arc: arcSec?.body ?? "",
    comparison: comparison ?? { head: [], rows: [] },
    interview: interviewSec?.body ?? "",
    fluent: fluentSec?.body,
    scriptNote,
    script: script ?? "",
    scriptOutput,
    notes: notes.length ? notes : undefined,
  }
}

/** the hand-decided rung for approach `i` of `id`, if one has been recorded */
function bindingFor(id, i) {
  return BINDINGS[id]?.[i]
}

/**
 * A guess, only where no binding exists, and deliberately weak.
 *
 * It used to build its candidate list from `alternatives[].key` plus a literal
 * "optimal", which is wrong on every journeyed problem: `ladderOf` takes those
 * keys from the journey's ACT keys, so container-water's rungs are `brute` and
 * `squeeze`, not `brute` and `optimal`. The guess was confidently wrong rather
 * than blank on three of twelve. Candidates come from the real ladder now, and
 * anything short of an exact word match stays blank so a human decides.
 */
function guessRung(heading, rungKeys) {
  const words = cleanTitle(heading)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  return rungKeys.find((k) => words.includes(k)) ?? ""
}

function emit(doc) {
  const notes = (ns, indent) =>
    ns
      .map(
        (n) =>
          `${indent}  { title: ${JSON.stringify(n.title)}, body: ${lit(n.body)} },`
      )
      .join("\n")

  const a = (x) => `  {
    rung: ${JSON.stringify(x.rung)},
    title: ${JSON.stringify(x.title)},
    idea: ${lit(x.idea)},
    intuition: ${lit(x.intuition)},
    worked: ${lit(x.worked)},
    code: ${lit(x.code)},${x.codeNote ? `\n    codeNote: ${lit(x.codeNote)},` : ""}
    mistake: ${lit(x.mistake)},
    cost: ${lit(x.cost)},${x.notes ? `\n    notes: [\n${notes(x.notes, "    ")}\n    ],` : ""}
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
${doc.fluent ? `  fluent: ${lit(doc.fluent)},\n` : ""}${doc.scriptNote ? `  scriptNote: ${lit(doc.scriptNote)},\n` : ""}  script: ${lit(doc.script)},${doc.scriptOutput ? `\n  scriptOutput: ${lit(doc.scriptOutput)},` : ""}${doc.notes ? `\n  notes: [\n${notes(doc.notes, "  ")}\n  ],` : ""}
}

export default doc
`
}

// ── main ────────────────────────────────────────────────────────────────────
const { PROBLEMS } = await import("../src/data/index.ts")
const { JOURNEYS } = await import("../src/engine/index.ts")
const { ladderOf } = await import("../src/lib/ladder.ts")
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
  // the REAL ladder's keys. On a journeyed problem `ladderOf` takes them from
  // the journey's ACT keys, so `alternatives[].key` plus a literal "optimal"
  // named rungs that do not exist — confidently wrong on three of the first
  // twelve (container-water's rungs are `brute` and `squeeze`, not `optimal`).
  const { rungs } = ladderOf(
    problem,
    JOURNEYS.find((j) => j.problemId === problem.id),
    Number.MAX_SAFE_INTEGER
  )
  const rungKeys = rungs.map((r) => r.key)
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
