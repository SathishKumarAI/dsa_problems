// Convert one `docs/deep/<id>_explained.md` into `src/problems/<id>/` — the
// typed teaching document (`src/content/types.ts`), one file per section,
// entered through `doc.ts`.
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
import { dirname, join } from "node:path"

const arg = (k) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? process.argv[i + 1] : undefined
}
const has = (k) => process.argv.includes(k)

const DEEP = "docs/deep"
const BINDINGS = JSON.parse(readFileSync("scripts/rung-bindings.json", "utf8"))
/** `###` parts under a `##` section that has a field but no room for them */
let leftover = []
const OUT = "src/problems"

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

/**
 * Lift one `### part` out of a section: its body, and the section without it.
 *
 * `## Understanding the Problem` is not one thing. It is prose plus any number
 * of `###` parts, and TWO of them are data rather than words — the constraints
 * table and the numbered failure list. Everything else is prose and stays.
 */
function liftPart(body, match) {
  const lines = body.split("\n")
  const start = lines.findIndex((l) => match.test(l))
  if (start === -1) return { body, part: undefined }
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++)
    if (/^###\s/.test(lines[i])) {
      end = i
      break
    }
  return {
    body: [...lines.slice(0, start), ...lines.slice(end)].join("\n"),
    part: lines.slice(start + 1, end),
  }
}

/**
 * The constraints table, as rows.
 *
 * Scoped to its OWN `###` part, and that is the whole fix. The first version
 * took every line in the section that started with a `|` and parsed the lot as
 * one table — which is right only while `## Understanding` holds exactly one.
 * Five of the twenty-five documents in the first batch hold two (a misconception
 * table, a "what 3Sum does differently" table, a false-start trace), and every
 * row of the second table was swallowed. `content-roundtrip.mjs` caught all
 * five; nothing else would have.
 */
function splitUnlocks(body) {
  const lines = body.split("\n")
  const start = lines.findIndex((l) => /^###\s+.*constraints?\b/i.test(l))
  if (start === -1) return { body, unlocks: undefined }
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++)
    if (/^###\s/.test(lines[i])) {
      end = i
      break
    }
  const part = lines.slice(start, end)

  // The FIRST contiguous run of pipe lines, and only that. Two rules learned
  // one failing round-trip at a time:
  //
  //   * the part is not only a table — four documents put a paragraph under
  //     that heading arguing what the bound actually buys, and zero-matrix's
  //     ("at most rows + cols bits describe a 40 000-cell answer") is the
  //     reason its last rung exists. Lifting the whole part lost fifteen
  //     documents' worth of that.
  //   * the part is not only ONE table — mirror-tree declares the three trees
  //     the document traces in a second one, under the same heading. Filtering
  //     every pipe line took that with it.
  const first = part.findIndex((l) => l.trim().startsWith("|"))
  let last = first
  while (last + 1 < part.length && part[last + 1].trim().startsWith("|")) last++
  const parsed = table(part.slice(first, last + 1).join("\n"))
  if (!parsed) return { body, unlocks: undefined }

  const kept = [...part.slice(0, first), ...part.slice(last + 1)]
  const prose = kept.slice(1).join("\n").trim()
  return {
    body: [
      ...lines.slice(0, start),
      ...(prose ? [kept[0], "", prose] : []),
      ...lines.slice(end),
    ].join("\n"),
    unlocks: parsed.rows.map((r) => ({ constraint: r[0], what: r[1] })),
  }
}

/**
 * Pull the document's own numbered failure list out of `## Understanding`.
 *
 * It has to come out BEFORE the unlocks table is stripped, because it is a
 * table too, and the line-based strip below would fold its rows into `unlocks`
 * without a word — three trap rows silently becoming three constraints. Found
 * on balanced-brackets, the first document with two tables in that section.
 */
function splitTraps(body) {
  const { body: rest, part: block } = liftPart(body, /^###\s+.*failure modes?\b/i)
  if (!block) return { body, traps: undefined }
  const first = block.findIndex((l) => l.trim().startsWith("|"))
  const last = block.findLastIndex((l) => l.trim().startsWith("|"))
  const parsed =
    first === -1 ? undefined : table(block.slice(first, last + 1).join("\n"))
  if (!parsed) return { body, traps: undefined }
  // the house table is `| # | Failure | Example | What the code must check |`.
  // The number is the row's POSITION, so it is not carried as data — a list
  // that stores its own indices is a list that can disagree with itself.
  const rows = parsed.rows.map((r) => ({ name: r[1], example: r[2], check: r[3] }))
  return {
    body: rest,
    traps: {
      intro: block.slice(0, first).join("\n").trim(),
      rows,
      outro: block.slice(last + 1).join("\n").trim() || undefined,
    },
  }
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
  let traps
  let understandingBody = ""
  if (understanding) {
    // two `###` parts are DATA and come out; every other one is prose and stays
    const withoutTraps = splitTraps(understanding.body)
    traps = withoutTraps.traps
    const withoutUnlocks = splitUnlocks(withoutTraps.body)
    unlocks = withoutUnlocks.unlocks
    understandingBody = withoutUnlocks.body.replace(/\n{3,}/g, "\n\n").trim()
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
    // a horizontal rule is not an aside. The house format ends most sections
    // with one, and carrying it through emitted a `notes` entry whose entire
    // body was `---` — a section on the page with no words in it.
    if (aside && aside.replace(/^-{3,}$/gm, "").trim())
      leftover.push({ title: "Comparison", body: aside })
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
    traps,
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

/** a rung key as a JS identifier — `delete` is a reserved word, `deleteRung` is not */
const ident = (key, i) =>
  (key ? key.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()) : `approach${i + 1}`) +
  "Rung"

/** the file an approach lives in. A blank rung is a decision nobody has made
 *  yet, so it is named by position and `content.test.ts` fails until it is. */
const approachFile = (key, i) => `approaches/${key || `${i + 1}-unassigned`}.ts`

const header = (id, owns) => `// ${id} — ${owns}
//
// Converted from docs/deep/${id}_explained.md by scripts/md-to-content.mjs.
// Every byte of prose carried through unchanged; what changed is that the
// STRUCTURE is a type (src/content/types.ts) rather than a heading convention.
`

/**
 * One problem's teaching document, as a DIRECTORY rather than one module.
 *
 * Why split: these run to 650 lines of prose apiece, and the house rule is ~300
 * with 500 the ceiling — a file you have to skim is a file you re-read every
 * session. Changing one approach's worked example should open one ~90-line
 * file, not scroll past two approaches to reach it.
 *
 * `doc.ts` is the only entry point, and the ONLY module `lib/content.ts`'s glob
 * matches. Everything here hangs off it and nothing else imports it, so Vite
 * still gives the whole directory one lazy chunk (B95) — the record half of the
 * directory (`index.ts`, `problem.ts`, `hints.ts`, `solutions.ts`) is eager and
 * must never be reachable from these files.
 */
function emit(doc) {
  const id = doc.problemId
  const files = new Map()
  const notes = (ns, indent) =>
    ns
      .map(
        (n) =>
          `${indent}  { title: ${JSON.stringify(n.title)}, body: ${lit(n.body)} },`
      )
      .join("\n")

  // ── understanding ─────────────────────────────────────────────────────────
  files.set(
    "understanding.ts",
    header(id, '"Understanding the Problem", and the constraints table') +
      `//
// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.
${doc.unlocks ? `\nimport type { Unlock } from "../../content/types.ts"\n` : ""}
export const understanding = ${lit(doc.understanding)}
${
  doc.unlocks
    ? `\nexport const unlocks: Unlock[] = ${JSON.stringify(doc.unlocks, null, 2)}\n`
    : ""
}`
  )

  // ── traps ─────────────────────────────────────────────────────────────────
  if (doc.traps)
    files.set(
      "traps.ts",
      header(id, "the ways a solution to this problem is wrong, numbered") +
        `//
// The numbers are load-bearing: the approaches below cite "failure 1/2/3"
// rather than restating the case, so a list renumbered in one place and not the
// others still reads as correct. That is why these are rows and not a paragraph.
//
// NOT the journey's \`edges\` (src/data/journeys/${id}.ts). Those are
// preset-bound cases that cite a line of \`constraints\` and load an animation;
// these are the document's own, with the line of code that catches each.

import type { Trap } from "../../content/types.ts"

export const intro = ${lit(doc.traps.intro)}

export const rows: Trap[] = ${JSON.stringify(doc.traps.rows, null, 2)}
${doc.traps.outro ? `\nexport const outro = ${lit(doc.traps.outro)}\n` : ""}`
    )

  // ── calculations ──────────────────────────────────────────────────────────
  if (doc.calculations)
    files.set(
      "calculations.ts",
      header(id, "the symbol table, and how to trace it by hand") +
        `\nexport const calculations = ${lit(doc.calculations)}\n`
    )

  // ── one file per approach ─────────────────────────────────────────────────
  doc.approaches.forEach((x, i) => {
    files.set(
      approachFile(x.rung, i),
      header(id, `approach ${i + 1} — ${x.title}`) +
        `//
// All six parts docs/deep/README.md §3 requires. \`rung\` binds this section to
// the problem's own ladder (solutions.ts), in both directions: a document may
// not teach an approach with no record, and a rung may not go untaught.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = {
  rung: ${JSON.stringify(x.rung)},
  title: ${JSON.stringify(x.title)},
  idea: ${lit(x.idea)},
  intuition: ${lit(x.intuition)},
  worked: ${lit(x.worked)},
  code: ${lit(x.code)},${x.codeNote ? `\n  codeNote: ${lit(x.codeNote)},` : ""}
  mistake: ${lit(x.mistake)},
  cost: ${lit(x.cost)},${x.notes ? `\n  notes: [\n${notes(x.notes, "  ")}\n  ],` : ""}
}
`
    )
  })

  // ── arc + comparison ──────────────────────────────────────────────────────
  files.set(
    "arc.ts",
    header(id, "the closing narrative, and the rungs side by side") +
      `//
// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is \`arc\` in
// solutions.ts; the two are written for different readers and neither is a
// copy of the other.

import type { Comparison } from "../../content/types.ts"

export const arc = ${lit(doc.arc)}

export const comparison: Comparison = ${JSON.stringify(doc.comparison, null, 2)}
`
  )

  // ── interview ─────────────────────────────────────────────────────────────
  files.set(
    "interview.ts",
    header(id, "which rungs to know cold, and the drills") +
      `\nexport const interview = ${lit(doc.interview)}
${doc.fluent ? `\nexport const fluent = ${lit(doc.fluent)}\n` : ""}`
  )

  // ── the runnable script ───────────────────────────────────────────────────
  files.set(
    "script.ts",
    header(id, "every approach in one file, cross-checked") +
      `//
// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.
${doc.scriptNote ? `\nexport const scriptNote = ${lit(doc.scriptNote)}\n` : ""}
export const script = ${lit(doc.script)}
${doc.scriptOutput ? `\nexport const scriptOutput = ${lit(doc.scriptOutput)}\n` : ""}`
  )

  // ── anything the house format carries with no field of its own ────────────
  if (doc.notes)
    files.set(
      "notes.ts",
      header(id, "the sections the format has no field for") +
        `\nimport type { Note } from "../../content/types.ts"

export const notes: Note[] = [
${notes(doc.notes, "")}
]
`
    )

  // ── the entry point ───────────────────────────────────────────────────────
  const imports = [
    `import { understanding${doc.unlocks ? ", unlocks" : ""} } from "./understanding.ts"`,
    doc.traps
      ? `import * as traps from "./traps.ts"`
      : "",
    doc.calculations ? `import { calculations } from "./calculations.ts"` : "",
    ...doc.approaches.map(
      (x, i) =>
        `import { approach as ${ident(x.rung, i)} } from "./${approachFile(x.rung, i).replace(/\.ts$/, ".ts")}"`
    ),
    `import { arc, comparison } from "./arc.ts"`,
    `import { interview${doc.fluent ? ", fluent" : ""} } from "./interview.ts"`,
    `import { ${doc.scriptNote ? "scriptNote, " : ""}script${doc.scriptOutput ? ", scriptOutput" : ""} } from "./script.ts"`,
    doc.notes ? `import { notes } from "./notes.ts"` : "",
  ].filter(Boolean)

  files.set(
    "doc.ts",
    `// ${id} — the teaching document, assembled from the files beside it.
//
// LAZY, and this is the whole point of the two entry files. This module is
// reached ONLY through \`lib/content.ts\`'s glob, so every part it imports lands
// in a chunk of its own. \`index.ts\` — the problem record — must never reach
// anything here, or 30 KB of prose per problem joins the first load (B95).

import type { TeachingDoc } from "../../content/types.ts"
${imports.join("\n")}

export const doc: TeachingDoc = {
  problemId: ${JSON.stringify(id)},
  understanding,${doc.unlocks ? "\n  unlocks," : ""}${
    doc.traps
      ? `\n  traps: { intro: traps.intro, rows: traps.rows${doc.traps.outro ? ", outro: traps.outro" : ""} },`
      : ""
  }${doc.calculations ? "\n  calculations," : ""}
  approaches: [${doc.approaches.map((x, i) => ident(x.rung, i)).join(", ")}],
  arc,
  comparison,
  interview,${doc.fluent ? "\n  fluent," : ""}${doc.scriptNote ? "\n  scriptNote," : ""}
  script,${doc.scriptOutput ? "\n  scriptOutput," : ""}${doc.notes ? "\n  notes," : ""}
}

export default doc
`
  )

  return files
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
  if (!has("--dry"))
    for (const [rel, body] of emit(doc)) {
      const dest = join(OUT, id, rel)
      mkdirSync(dirname(dest), { recursive: true })
      writeFileSync(dest, body, "utf8")
    }
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
