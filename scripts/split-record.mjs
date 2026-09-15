// Move one problem's RECORD out of `src/data/problems/<pattern>/<id>.ts` and
// into `src/problems/<id>/`, one file per concern.
//
// The other half of the same migration `md-to-content.mjs` does: that one turns
// the teaching document into a directory, this one turns the record into the
// same directory. Together they are "everything about one problem in one
// place", which is the whole point (B97).
//
// WHY A SCRIPT. 68 problems still to move, and the alternative is 68 chances to
// drop a field. This one cannot drop one: it walks the object literal, claims
// every top-level key it knows, and THROWS on a key it does not — the same rule
// the document converter learned after it silently ate 456 lines.
//
// It carries the value text VERBATIM. No parse, no re-serialise: a record is
// full of template literals holding Python, Java and C++ whose indentation is
// load-bearing, and `JSON.stringify` of an imported module would reformat every
// one of them. So the values are sliced out of the source as text, comments
// above them included.
//
// Run:  node scripts/split-record.mjs --id plus-one
//       node scripts/split-record.mjs --id plus-one --dry

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const arg = (k) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? process.argv[i + 1] : undefined
}
const has = (k) => process.argv.includes(k)

const SRC = "src/data/problems"
const OUT = "src/problems"

/** where a top-level key of the record goes, and what it is called there */
const LAYOUT = {
  "problem.ts": {
    keys: ["id", "title", "pattern", "difficulty", "leetcode", "brief", "statement", "constraints", "examples"],
    types: { difficulty: "Difficulty", examples: "Example[]", constraints: "string[]" },
    owns: "what the problem IS, before any answer to it",
    note: `// Owns no algorithm (\`solutions.ts\`), no nudges (\`hints.ts\`) and no teaching
// prose (\`doc.ts\` and its parts).`,
  },
  "hints.ts": {
    keys: ["hints"],
    types: {},
    owns: "the progressive nudges",
    note: `// A push toward the shape, then the idea, then the thing people actually get
// wrong. Read in order by the problem page, and by a journey's story act.`,
  },
  "solutions.ts": {
    keys: ["approach", "whyNow", "arc", "complexity", "python", "java", "cpp", "alternatives"],
    types: { alternatives: "Solution[]" },
    owns: "the ladder: every way in, worst first",
    note: `// Each rung carries the weakness in the one below it. The KEYS on
// \`alternatives\` are load-bearing where a journey exists: \`lib/ladder.ts\`
// merges an alternative with the act that shares its key, and \`from:\` in the
// journey must then name that key rather than an array index.
//
// Two arcs, and they are not duplicates. The one here is the short paragraph
// the PROBLEM page renders under the ladder; \`arc.ts\` holds the long one the
// teaching document ends on. Changing either does not oblige the other.`,
  },
  "walkthrough.ts": {
    keys: ["walkthrough"],
    types: { walkthrough: "Frame[]" },
    owns: "the stepped visualization, for a problem with no journey",
    note: `// A journeyed problem must NOT have one — \`problems.test.ts\` forbids carrying
// both, because two sources for one animation is one source and one lie.`,
  },
}

/**
 * Split an object literal's body into its top-level entries, as TEXT.
 *
 * Depth-aware and string-aware: a record is mostly template literals holding
 * code, and a `{` inside one is a brace in a C++ block, not structure. Comments
 * above a key travel with it — they are the reasoning, and reasoning that does
 * not move with the code it explains is how a comment starts lying.
 */
function entries(body) {
  const out = []
  let depth = 0
  let start = 0
  let i = 0
  const skipString = (quote) => {
    i++
    while (i < body.length) {
      if (body[i] === "\\") i += 2
      else if (body[i] === quote) return i++
      else i++
    }
    throw new Error("unterminated string")
  }
  while (i < body.length) {
    const c = body[i]
    if (c === '"' || c === "'" || c === "`") {
      skipString(c)
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
  return out.map((text) => {
    const stripped = text.replace(/^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*/, "")
    const key = /^\s*(["'`]?)([A-Za-z_]\w*)\1\s*:/.exec(stripped)
    if (!key) throw new Error(`no key in entry: ${text.trim().slice(0, 60)}`)
    return { key: key[2], text: text.replace(/^\n+/, "").replace(/\s+$/, "") }
  })
}

/** the record's object literal, as the text between its outermost braces */
function recordBody(src) {
  const at = src.search(/export const problem\s*:\s*Problem\s*=\s*\{/)
  if (at === -1) throw new Error("no `export const problem: Problem = {`")
  const open = src.indexOf("{", at)
  let depth = 0
  let i = open
  while (i < src.length) {
    const c = src[i]
    if (c === '"' || c === "'" || c === "`") {
      const quote = c
      i++
      while (i < src.length) {
        if (src[i] === "\\") i += 2
        else if (src[i] === quote) {
          i++
          break
        } else i++
      }
      continue
    }
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++
      continue
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i) + 2
      continue
    }
    if (c === "{") depth++
    else if (c === "}") {
      depth--
      if (depth === 0) return src.slice(open + 1, i)
    }
    i++
  }
  throw new Error("unbalanced record literal")
}

const header = (id, owns, note) => `// ${id} — ${owns}.
//
${note}
`

/**
 * Take the object literal's two-space indent off, WITHOUT touching the inside
 * of a template literal.
 *
 * This is the one thing in the script that could corrupt content rather than
 * lose it. A record is mostly `python: \`…\`` blocks whose body lines are
 * written at their REAL indentation, flush with the left margin — so a blanket
 * dedent would turn a four-space Python body into a two-space one. That is
 * valid Python which means something else, and nothing in the repo would fail.
 * So: track whether each line begins inside a template literal, and outdent
 * only the ones that do not.
 */
function dedent(text) {
  let inTemplate = false
  return text
    .split("\n")
    .map((line) => {
      const out = inTemplate ? line : line.replace(/^ {1,2}/, "")
      // a backtick on this line flips the state for the NEXT one; an escaped
      // backtick is a character, not a delimiter
      for (let i = 0; i < line.length; i++) {
        if (line[i] === "\\") i++
        else if (line[i] === "`") inTemplate = !inTemplate
      }
      return out
    })
    .join("\n")
}

/** `key: value` -> `export const key: Type = value` */
function exportOf(entry, types) {
  const m = /^(\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\n)*)\s*(["'`]?)([A-Za-z_]\w*)\2\s*:\s*([\s\S]*)$/.exec(
    entry.text
  )
  if (!m) throw new Error(`cannot split entry ${entry.key}`)
  const [, comments, , key, value] = m
  const type = types[key] ? `: ${types[key]}` : ""
  return dedent(
    `${comments.trim() ? comments.trim() + "\n" : ""}export const ${key}${type} = ${value.trim()}`
  )
}

export function split(id) {
  const file = readdirSync(SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(SRC, d.name, `${id}.ts`))
    .find((p) => existsSync(p))
  if (!file) throw new Error(`${id}: no record under ${SRC}`)

  const src = readFileSync(file, "utf8").replace(/\r\n/g, "\n")
  const found = entries(recordBody(src))
  const byKey = new Map(found.map((e) => [e.key, e]))

  // Every key is CLAIMED, and an unknown one is an error rather than a silent
  // loss. A record that grows a field should fail this script, not quietly
  // leave it behind in a file nobody reads again.
  const claimed = new Set(Object.values(LAYOUT).flatMap((f) => f.keys))
  const unknown = found.map((e) => e.key).filter((k) => !claimed.has(k))
  if (unknown.length)
    throw new Error(`${id}: no home for ${unknown.join(", ")} — extend LAYOUT`)

  const files = new Map()
  for (const [name, spec] of Object.entries(LAYOUT)) {
    const mine = spec.keys.filter((k) => byKey.has(k))
    if (!mine.length) continue
    const typeNames = [
      ...new Set(
        mine
          .map((k) => spec.types[k]?.replace(/\[\]$/, ""))
          .filter((t) => t && t !== "string")
      ),
    ]
    files.set(
      name,
      header(id, spec.owns, spec.note) +
        (typeNames.length
          ? `\nimport type { ${typeNames.sort().join(", ")} } from "../../data/types.ts"\n`
          : "") +
        "\n" +
        mine.map((k) => exportOf(byKey.get(k), spec.types)).join("\n\n") +
        "\n"
    )
  }

  // The assembled record. EAGER — it is on the static chain from
  // `src/data/index.ts`, so it must never reach `doc.ts` or the prose it
  // imports lands in the first chunk (B95).
  const spread = {
    "problem.ts": LAYOUT["problem.ts"].keys.filter((k) => byKey.has(k)),
    "hints.ts": ["hints"],
    "solutions.ts": LAYOUT["solutions.ts"].keys.filter((k) => byKey.has(k)),
    "walkthrough.ts": byKey.has("walkthrough") ? ["walkthrough"] : [],
  }
  const imports = Object.entries(spread)
    .filter(([, keys]) => keys.length)
    .map(([name, keys]) => `import { ${keys.join(", ")} } from "./${name}"`)
  files.set(
    "index.ts",
    `// ${id} — the problem record, assembled from the files beside it.
//
// EAGER: this module is on the static import chain from \`src/data/index.ts\`,
// so everything it reaches is in the catalogue's chunk. Keep it to the record.
//
// The teaching document is NOT reachable from here — it hangs off \`doc.ts\`,
// which is imported only by \`lib/content.ts\`'s glob, so its prose stays in a
// chunk of its own (B95).

import type { Problem } from "../../data/types.ts"
${imports.join("\n")}

export const problem: Problem = {
${Object.values(spread)
  .flat()
  .map((k) => `  ${k},`)
  .join("\n")}
}
`
  )
  return { file, files }
}

// ── main ────────────────────────────────────────────────────────────────────
if (process.argv[1]?.endsWith("split-record.mjs")) {
  const ids = arg("--id")?.split(",").filter(Boolean) ?? []
  if (!ids.length) {
    console.error("usage: node scripts/split-record.mjs --id <problem-id>[,<id>…] [--dry]")
    process.exit(1)
  }
  for (const id of ids) {
    const { file, files } = split(id)
    if (!has("--dry")) {
      mkdirSync(join(OUT, id), { recursive: true })
      for (const [name, body] of files) writeFileSync(join(OUT, id, name), body, "utf8")
    }
    console.log(
      `${id}: ${[...files.keys()].join(" ")}  (from ${file})` +
        (has("--dry") ? "  [dry]" : "")
    )
  }
}
