// Split a teaching document that is still ONE file into the directory shape:
// `src/problems/<id>/doc.ts` -> understanding.ts, traps.ts, approaches/<rung>.ts,
// arc.ts, interview.ts, script.ts, notes.ts, and a `doc.ts` that assembles them.
//
// WHY THIS EXISTS AND `md-to-content.mjs` DOES NOT DO IT. Thirteen documents were
// converted to a single typed module before the directory shape was decided, and
// their Markdown was deleted once `content-roundtrip.mjs` said nothing had been
// lost — which is the right rule and leaves no source to re-convert from. They
// are the only files in `src/problems/` over the 500-line ceiling: 928 lines at
// the worst. So this does to a document exactly what `split-record.mjs` does to
// a record, through the same scanner (`ts-literal.mjs`).
//
// It cannot silently drop a section: every top-level key is claimed by a file,
// and an unknown one throws. That rule is in both scripts because the first
// version of the Markdown converter did not have it and ate 456 lines.
//
// Run:  node scripts/split-doc.mjs --id cycle-detect
//       node scripts/split-doc.mjs --all --dry

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { dedent, keyedEntries, literalBody, valueOf } from "./ts-literal.mjs"

const arg = (k) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? process.argv[i + 1] : undefined
}
const has = (k) => process.argv.includes(k)

const OUT = "src/problems"

/** where a top-level key of `TeachingDoc` goes. `approaches` is handled apart:
 *  it becomes one file per element rather than one file. */
const LAYOUT = {
  "understanding.ts": {
    keys: ["understanding", "unlocks"],
    types: { unlocks: "Unlock[]" },
    owns: '"Understanding the Problem", and the constraints table',
    note: `// The constraints are DATA here rather than prose: each row is a permission
// slip an approach below cashes in, and the page renders them as a table.`,
  },
  "traps.ts": {
    keys: ["traps"],
    types: { traps: "{ intro: string; rows: Trap[]; outro?: string }" },
    owns: "the ways a solution to this problem is wrong, numbered",
    note: `// The numbers are load-bearing: the approaches cite "failure 1/2/3" rather than
// restating the case, so a list renumbered in one place and not the others still
// reads as correct.`,
  },
  "calculations.ts": {
    keys: ["calculations"],
    types: {},
    owns: "the symbol table, and how to trace it by hand",
    note: `// Ten of 127 documents have this section. It is the one a reader who follows
// the prose and then stalls at the arithmetic has nowhere to go without.`,
  },
  "arc.ts": {
    keys: ["arc", "comparison"],
    types: { comparison: "Comparison" },
    owns: "the closing narrative, and the rungs side by side",
    note: `// The LONG arc — one connected story of what every rung had in common. The
// short paragraph the problem page renders under its ladder is \`arc\` in
// solutions.ts; the two are written for different readers and neither is a copy
// of the other.`,
  },
  "interview.ts": {
    keys: ["interview", "fluent"],
    types: {},
    owns: "which rungs to know cold, and the drills",
    note: `// Which two or three to have in recall, and why the rest are for understanding
// rather than for typing out under time.`,
  },
  "script.ts": {
    keys: ["scriptNote", "script", "scriptOutput"],
    types: {},
    owns: "every approach in one file, cross-checked",
    note: `// scripts/verify-deep.mjs runs this string on every pull request, and the Run
// button on the page runs it in the browser. It ends by saying whether the
// approaches agreed, because a result nobody can read is not a check.`,
  },
  "notes.ts": {
    keys: ["notes"],
    types: { notes: "Note[]" },
    owns: "the sections the format has no field for",
    note: `// Kept in document order rather than dropped — a section naming the sibling
// problems that use the same move, an aside under the comparison table.`,
  },
}

/** a rung key as a JS identifier — `delete` is a reserved word, `deleteRung` is not */
const ident = (key, i) =>
  (key ? key.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()) : `approach${i + 1}`) + "Rung"

const approachFile = (key, i) => `approaches/${key || `${i + 1}-unassigned`}.ts`

const header = (id, owns, note) => `// ${id} — ${owns}.
//
${note}
//
// Split out of a single-file \`doc.ts\` by scripts/split-doc.mjs. The prose is
// byte-for-byte what was there; only the file it lives in changed.
`

export function split(id) {
  const file = join(OUT, id, "doc.ts")
  if (!existsSync(file)) throw new Error(`${id}: no ${file}`)
  const src = readFileSync(file, "utf8").replace(/\r\n/g, "\n")
  if (src.includes('from "./approaches/'))
    throw new Error(`${id}: already split`)

  const found = keyedEntries(
    literalBody(src, /export const doc\s*:\s*TeachingDoc\s*=\s*\{/)
  )
  const byKey = new Map(found.map((e) => [e.key, e]))

  const claimed = new Set([
    "problemId",
    "approaches",
    ...Object.values(LAYOUT).flatMap((f) => f.keys),
  ])
  const unknown = found.map((e) => e.key).filter((k) => !claimed.has(k))
  if (unknown.length)
    throw new Error(`${id}: no home for ${unknown.join(", ")} — extend LAYOUT`)

  const files = new Map()
  for (const [name, spec] of Object.entries(LAYOUT)) {
    const mine = spec.keys.filter((k) => byKey.has(k))
    if (!mine.length) continue
    const typeNames = [
      ...new Set(
        mine.flatMap((k) => (spec.types[k] ?? "").match(/\b(Unlock|Trap|Comparison|Note)\b/g) ?? [])
      ),
    ]
    files.set(
      name,
      header(id, spec.owns, spec.note) +
        (typeNames.length
          ? `\nimport type { ${typeNames.sort().join(", ")} } from "../../content/types.ts"\n`
          : "") +
        "\n" +
        mine
          .map((k) => {
            const { comments, value } = valueOf(byKey.get(k))
            const type = spec.types[k] ? `: ${spec.types[k]}` : ""
            return dedent(
              `${comments ? comments + "\n" : ""}export const ${k}${type} = ${value}`
            )
          })
          .join("\n\n") +
        "\n"
    )
  }

  // ── one file per approach ─────────────────────────────────────────────────
  // The array's ELEMENTS, split the same way its parent object was. Each one
  // names the rung it teaches, and that name becomes the file: changing an
  // approach's worked example should open one ~90-line file, which is the whole
  // reason this script exists.
  const elements = elementsOf(literalBody(src, /approaches\s*:\s*\[/, "["))
  elements.forEach((text, i) => {
    const rung = /\brung\s*:\s*"([^"]*)"/.exec(text)?.[1] ?? ""
    const title = /\btitle\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(text)?.[1] ?? `approach ${i + 1}`
    files.set(
      approachFile(rung, i),
      `// ${id} — approach ${i + 1} — ${title}.
//
// All six parts docs/deep/README.md §3 requires. \`rung\` binds this section to
// the problem's own ladder, in both directions: a document may not teach an
// approach with no record, and a rung may not go untaught.
//
// Split out of a single-file \`doc.ts\` by scripts/split-doc.mjs.

import type { ApproachDoc } from "../../../content/types.ts"

export const approach: ApproachDoc = ${dedent(text.trim(), 2)}
`
    )
  })

  // ── the entry point ───────────────────────────────────────────────────────
  const has_ = (k) => byKey.has(k)
  const imports = [
    `import { understanding${has_("unlocks") ? ", unlocks" : ""} } from "./understanding.ts"`,
    has_("traps") ? `import { traps } from "./traps.ts"` : "",
    has_("calculations") ? `import { calculations } from "./calculations.ts"` : "",
    ...elements.map((text, i) => {
      const rung = /\brung\s*:\s*"([^"]*)"/.exec(text)?.[1] ?? ""
      return `import { approach as ${ident(rung, i)} } from "./${approachFile(rung, i)}"`
    }),
    `import { arc, comparison } from "./arc.ts"`,
    `import { interview${has_("fluent") ? ", fluent" : ""} } from "./interview.ts"`,
    `import { ${has_("scriptNote") ? "scriptNote, " : ""}script${has_("scriptOutput") ? ", scriptOutput" : ""} } from "./script.ts"`,
    has_("notes") ? `import { notes } from "./notes.ts"` : "",
  ].filter(Boolean)

  const fields = [
    `  problemId: ${JSON.stringify(id)},`,
    "  understanding,",
    has_("unlocks") ? "  unlocks," : "",
    has_("traps") ? "  traps," : "",
    has_("calculations") ? "  calculations," : "",
    `  approaches: [${elements
      .map((text, i) => ident(/\brung\s*:\s*"([^"]*)"/.exec(text)?.[1] ?? "", i))
      .join(", ")}],`,
    "  arc,",
    "  comparison,",
    "  interview,",
    has_("fluent") ? "  fluent," : "",
    has_("scriptNote") ? "  scriptNote," : "",
    "  script,",
    has_("scriptOutput") ? "  scriptOutput," : "",
    has_("notes") ? "  notes," : "",
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
${fields.join("\n")}
}

export default doc
`
  )
  return files
}

/** the top-level elements of an ARRAY body, as text */
function elementsOf(body) {
  const out = []
  let depth = 0
  let start = 0
  let i = 0
  while (i < body.length) {
    const c = body[i]
    if (c === '"' || c === "'" || c === "`") {
      const quote = c
      i++
      while (i < body.length) {
        if (body[i] === "\\") i += 2
        else if (body[i] === quote) {
          i++
          break
        } else i++
      }
      continue
    }
    if (c === "/" && body[i + 1] === "/") {
      while (i < body.length && body[i] !== "\n") i++
      continue
    }
    if (c === "/" && body[i + 1] === "*") {
      i = body.indexOf("*/", i) + 2
      continue
    }
    if ("{[(".includes(c)) depth++
    else if ("}])".includes(c)) depth--
    else if (c === "," && depth === 0) {
      out.push(body.slice(start, i))
      start = i + 1
    }
    i++
  }
  const tail = body.slice(start)
  if (tail.trim()) out.push(tail)
  return out.map((t) => t.replace(/^\n+/, "").replace(/\s+$/, ""))
}

// ── main ────────────────────────────────────────────────────────────────────
if (process.argv[1]?.endsWith("split-doc.mjs")) {
  const ids = has("--all")
    ? readdirSync(OUT, { withFileTypes: true })
        .filter(
          (d) =>
            d.isDirectory() &&
            existsSync(join(OUT, d.name, "doc.ts")) &&
            !existsSync(join(OUT, d.name, "approaches"))
        )
        .map((d) => d.name)
    : (arg("--id") ?? "").split(",").filter(Boolean)
  if (!ids.length) {
    console.error("usage: node scripts/split-doc.mjs --id <id>[,<id>…] | --all [--dry]")
    process.exit(1)
  }
  for (const id of ids) {
    const files = split(id)
    if (!has("--dry")) {
      rmSync(join(OUT, id, "doc.ts"))
      mkdirSync(join(OUT, id, "approaches"), { recursive: true })
      for (const [name, body] of files) writeFileSync(join(OUT, id, name), body, "utf8")
    }
    console.log(
      `${id}: ${files.size} files` + (has("--dry") ? "  [dry]" : "")
    )
  }
}
