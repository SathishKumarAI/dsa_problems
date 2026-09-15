// One problem's long EXPLANATION, for the problems whose document is still
// Markdown — `docs/learn/<id>.md`, read by `src/lib/learn-pages.ts`.
//
// It used to emit a whole PAGE, and that was right while `#/learn/<id>` was a
// separate route: a page that stands alone has to open with the title, the
// statement, what the input promises, the examples, the hints and every rung in
// three languages. The explanation is a section of the problem page now, which
// shows all six of those directly above it, so emitting them here put the same
// words on the screen twice. Measured: the 127 generated files went from
// 93,055 lines to 59,372 — 36% of the corpus was a restatement.
//
// What is left is what the problem page does NOT already carry:
//   * the long teaching body — intuition, worked traces, the bug you are about
//     to write, measured numbers, drills                      -> AUTHORED, in
//     `docs/deep/<id>_explained.md`, spliced in verbatim.
//   * one runnable script: the authored one where a deep document exists (it
//     carries the buggy variants and the measurements `verify-deep` runs),
//     otherwise the vector-driven one built here — which is the ONLY thing 59
//     problems get, and the reason this generator still exists.
//   * where the problem sits: the pattern's blurb and its siblings.
//
// A problem with none of those gets NO FILE. The door on the problem page is
// decided by whether a file exists, so an empty one would promise an
// explanation and open onto nothing.
//
// SPOILERS, on purpose. The app gates a journey's unearned rungs behind the
// ledger; a file on disk has no ledger, so this shows everything. The page
// renders it only when the ladder is NOT capped (see `problem-detail.tsx`).
// That is the deliberate trade, written down so nobody has to rediscover it.
//
// Run:  npm run docs:learn                    # write docs/learn/**
//       node scripts/gen-learn.mjs --check    # fail if the tree is stale

import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { PATTERNS, PROBLEMS } from "../src/data/index.ts"
import { ladderOf, leetcodeUrl } from "../src/lib/ladder.ts"
import { VECTORS } from "./localsmith/vectors.mjs"
import { PY_CANON, PY_NODES, pyEntry, pyLit } from "./localsmith/run.mjs"

export const OUT_DIR = join(import.meta.dirname, "..", "docs", "learn")
const DEEP_DIR = join(import.meta.dirname, "..", "docs", "deep")

/** The authored teaching document for a problem, split into the body and its
 *  runnable script — the script goes last on the merged page, after the
 *  generated ladder, so the page reads problem -> teaching -> code -> run. */
export function deepDocument(id) {
  let raw
  try {
    raw = readFileSync(join(DEEP_DIR, `${id}_explained.md`), "utf8")
  } catch {
    return null
  }
  // CRLF: git checks these out with Windows endings, and every pattern
  // below is written for newlines (CLAUDE.md, the trap that has now bitten
  // five scripts in this repo)
  const md = raw.replace(/\r\n/g, "\n")
  // drop the document's own H1 — the merged page has already printed one
  const withoutTitle = md.replace(/^#[^\n]*\n+/, "")
  const cut = withoutTitle.search(/^## Full Runnable Script\s*$/m)
  return cut === -1
    ? { body: withoutTitle.trim(), script: null }
    : {
        body: withoutTitle.slice(0, cut).trim(),
        script: withoutTitle.slice(cut).trim(),
      }
}

const snake = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

/** Rename a rung's entry point so every rung can live in one script. Every
 *  occurrence of the identifier moves, not only the `def` line — a recursive
 *  rung calls itself, and a renamed def with an unrenamed call is a NameError
 *  that only shows up when you run it. */
const rename = (src, from, to) =>
  src.replace(new RegExp(`\\b${from}\\b`, "g"), to)

/** first sentence, cheap: up to the first ". " that is not inside "O(n log n)" */
const firstSentence = (s) => {
  const m = s.match(/^.*?[.](?=\s[A-Z(])/s)
  return (m ? m[0] : s).replace(/\s+/g, " ").trim()
}

const fence = (lang, code) => `\`\`\`${lang}\n${code.trim()}\n\`\`\``

const tab = (label, lang, code) =>
  code
    ? `<details>\n<summary>${label}</summary>\n\n${fence(lang, code)}\n\n</details>`
    : ""

// ---------- the runnable script ----------

/** true when an argument or the answer is a linked list or a tree, and the
 *  script therefore needs the driver's builders and its canonical printer */
const isStructural = (v) =>
  [...v.params, v.ret].some((t) => t === "list" || t === "tree")

/** All rungs in one file, each callable by name, printed against the vectors.
 *  Returns null when a rung has no entry point the driver could name — a page
 *  without a script is better than a page with a script that will not run. */
export function runnableScript(problem, rungs) {
  const v = VECTORS[problem.id]
  if (!v) return null

  const used = new Set()
  const parts = []
  const names = []
  for (const r of rungs) {
    // a class-shaped problem (B62) has no entry function: the class itself is
    // the rung, constructed once and then driven by a stream of calls
    const entry = v.shape === "class" ? v.klass : pyEntry(r.code.python)
    if (!entry) return null
    let name = `${entry}_${snake(r.name)}`
    while (used.has(name)) name += "_"
    used.add(name)
    names.push(name)
    parts.push(rename(r.code.python.trim(), entry, name))
  }

  const structural = isStructural(v)
  const cases = v.cases
    .map((args) => {
      const lits = args.map((a, i) => pyLit(a, v.params[i])).join(", ")
      // a thunk, not a value: a linked-list argument is CONSUMED by the rung
      // that walks it, so every rung has to be handed a fresh one
      return `    lambda: (${lits}${args.length === 1 ? "," : ""}),`
    })
    .join("\n")

  const width = Math.max(...names.map((n) => n.length)) + 2
  const call = structural ? "__canon(fn(*make()))" : "fn(*make())"

  const main =
    v.shape === "class"
      ? [
          `if __name__ == "__main__":`,
          `    for cls in APPROACHES:`,
          `        answers = []`,
          `        for make in CASES:`,
          `            *ctor, stream = make()  # constructor args, then the calls`,
          `            try:`,
          `                obj = cls(*ctor)`,
          `                answers.append([obj.${v.method}(x) for x in stream])`,
          `            except BaseException as exc:  # a rung that raises names itself`,
          `                answers.append(f"!{exc}")`,
          `        print(f"{cls.__name__:<${width}} -> {answers}")`,
        ]
      : [
          `if __name__ == "__main__":`,
          `    for fn in APPROACHES:`,
          `        answers = []`,
          `        for make in CASES:`,
          `            try:`,
          `                answers.append(${call})`,
          `            except BaseException as exc:  # a rung that raises names itself`,
          `                answers.append(f"!{exc}")`,
          `        print(f"{fn.__name__:<${width}} -> {answers}")`,
        ]

  return [
    structural ? PY_NODES.trim() : null,
    parts.join("\n\n\n"),
    structural ? PY_CANON.trim() : null,
    `APPROACHES = [\n${names.map((n) => `    ${n},`).join("\n")}\n]`,
    `# the same inputs npm run verify:run drives the Java and C++ blocks with:\n` +
      `# ${v.exercises}\nCASES = [\n${cases}\n]`,
    main.join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n")
}

// ---------- one page ----------

export function renderProblem(problem) {
  const pattern = PATTERNS.find((p) => p.id === problem.pattern)
  const { rungs } = ladderOf(problem, undefined, 0)
  const deep = deepDocument(problem.id)

  // The authored teaching document, verbatim. Its headings are already `##`
  // and `###`, which is why it is spliced at top level rather than nested —
  // nesting it would push sections to `####`, a level the app's reader does
  // not render.
  // The authored document, verbatim, and no stub where there is none: a
  // heading saying "not written yet" is an empty promise with a scrollbar.
  // `docs/LEARN-GAPS.md` is where an absent document is counted.
  const teaching = deep ? [deep.body, ``] : []

  const siblings = PROBLEMS.filter(
    (p) => p.pattern === problem.pattern && p.id !== problem.id
  )

  const where = [
    ``,
    `---`,
    ``,
    `## Where this sits`,
    ``,
    `**Pattern — ${pattern?.name ?? problem.pattern}.** ${pattern?.blurb ?? ""}`.trim(),
    ``,
    ...(siblings.length
      ? [
          `The other ${siblings.length} problem${siblings.length === 1 ? "" : "s"} on the same pattern:`,
          ``,
          siblings.map((p) => `[${p.title}](${p.id}.md)`).join(" · "),
          ``,
        ]
      : []),
    `**Drills and outside reading** for this pattern: [\`docs/RESOURCES.md\`](../RESOURCES.md).`,
    `**The interactive version**, which gates each approach until you have earned it:`,
    `run the app and open this problem.`,
    ``,
  ]

  // One script per page. The authored one wins where it exists: it carries the
  // buggy variants and the measurements the prose quotes, and `verify-deep`
  // runs it. Otherwise the vector-driven one built above, which is what
  // `verify:run` drives the Java and C++ blocks with.
  const generated = runnableScript(problem, rungs)
  const tail = deep?.script
    ? [``, `---`, ``, deep.script, ``]
    : generated
      ? [
          ``,
          `---`,
          ``,
          `## Full runnable script`,
          ``,
          `Every rung in one file, printed against the inputs \`npm run verify:run\``,
          `drives the Java and C++ blocks with. Run it: \`python learn.py\`.`,
          ...(VECTORS[problem.id].unordered
            ? [
                ``,
                `Order is not part of this answer, so two rungs printing it differently are`,
                `both right — compare the contents, not the line.`,
              ]
            : []),
          ``,
          fence("python", generated),
        ]
      : []

  // The explanation, and nothing the problem page already shows. What used to
  // be emitted here and is not any more: the title, the statement, `## What the
  // input promises`, `## Examples`, the hints fold, `## Rung N` for every rung
  // in three languages, and `## The arc` with its comparison table. All seven
  // are on the problem page directly above this, and `git log -p` for this
  // commit is where they went.
  //
  // Nothing to say -> no file. `pages()` drops an empty one, because the door
  // on the problem page is decided by whether a file exists.
  if (!deep && !tail.length) return null
  return [...teaching, ...where, ...tail, ``].join("\n").replace(/^\n+/, "")
}

/** The ladder needs an introduction when a teaching document precedes it, or a
 *  reader meets a second set of approaches with no idea why they are there. */
function ladderHeading(deep) {
  if (!deep) return []
  return [
    ``,
    `---`,
    ``,
    `## The same ladder, in Python, Java and C++`,
    ``,
    `The explanation above works in Python. This is the app's own ladder for this`,
    `problem — the approaches it teaches, in build order — with every rung in all`,
    `three languages. Where the two differ, the explanation above may carry extra`,
    `rungs; each is labelled where it appears.`,
    ``,
  ]
}

// ---------- the index ----------

export function renderIndex() {
  const rows = PATTERNS.flatMap((pattern) => {
    const mine = PROBLEMS.filter((p) => p.pattern === pattern.id)
    if (!mine.length) return []
    return [
      ``,
      `### ${pattern.name}  \`${pattern.glyph}\``,
      ``,
      `| Problem | Difficulty | Rungs |`,
      `|---|---|---|`,
      ...mine.map((p) => {
        const n = ladderOf(p, undefined, 0).rungs.length
        return `| [${p.title}](${p.id}.md) | ${p.difficulty} | ${n} |`
      }),
    ]
  })

  return [
    `# \`docs/learn/\` — one page per problem, everything on it`,
    ``,
    `**Generated. Do not edit a page here** — \`npm run docs:learn\` rewrites all of them`,
    `from \`src/data/problems/**\`, and \`scripts/gen-learn.test.mjs\` fails when the tree on`,
    `disk has drifted from the data.`,
    ``,
    `## Change → file`,
    ``,
    `| Change | File |`,
    `|---|---|`,
    `| A problem's statement, rungs, prose or code | \`src/data/problems/<pattern>/<id>.ts\` |`,
    `| The page layout — headings, tables, what a rung shows | \`scripts/gen-learn.mjs\` |`,
    `| The inputs the runnable script prints | \`scripts/localsmith/vectors.mjs\` |`,
    `| Which rungs a page shows, and in what order | \`src/lib/ladder.ts\` |`,
    ``,
    `A page carries the problem, its constraints and examples, hints behind a fold, then the`,
    `approach ladder worst → best — each rung with the weakness in the one before it, its cost,`,
    `and Python, Java and C++ — and closes with a runnable script holding every rung at once.`,
    ``,
    `A journeyed problem's acts are **not** read here: the journey gates them behind the ledger`,
    `and a file on disk cannot. These pages show only what the problem page already shows.`,
    ``,
    `${PROBLEMS.length} problems.`,
    ...rows,
    ``,
  ].join("\n")
}

// ---------- writing ----------

export function pages() {
  const out = new Map([["README.md", renderIndex()]])
  for (const p of PROBLEMS) {
    const text = renderProblem(p)
    if (text) out.set(`${p.id}.md`, text)
  }
  return out
}

function main() {
  const check = process.argv.includes("--check")
  const want = pages()

  if (check) {
    const have = new Set(
      (() => {
        try {
          return readdirSync(OUT_DIR)
        } catch {
          return []
        }
      })()
    )
    // git checks these out with CRLF on Windows and the generator writes LF:
    // compare the content, not the bytes, or a fresh clone reads as all-stale
    const lf = (s) => s.replace(/\r\n/g, "\n")
    const stale = [...want].filter(([name, text]) => {
      try {
        return lf(readFileSync(join(OUT_DIR, name), "utf8")) !== lf(text)
      } catch {
        return true
      }
    })
    const extra = [...have].filter((f) => !want.has(f))
    for (const [name] of stale) console.log(`  · stale ${name}`)
    for (const f of extra) console.log(`  · orphan ${f}`)
    console.log(
      stale.length || extra.length
        ? `docs/learn is stale — run npm run docs:learn`
        : `docs/learn matches the data (${want.size} files)`
    )
    process.exitCode = stale.length || extra.length ? 1 : 0
    return
  }

  rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })
  for (const [name, text] of want) writeFileSync(join(OUT_DIR, name), text)
  // Two kinds of script reach a page and they are worth counting apart: the
  // authored one out of a deep document (gated by verify-deep) and the
  // vector-driven one built here (gated by verify:run). A page with neither is
  // the number that matters, because that is a page you cannot run.
  const has = (p, needle) => want.get(`${p.id}.md`)?.includes(needle) ?? false
  const authored = PROBLEMS.filter((p) => has(p, "## Full Runnable Script")).length
  const generated = PROBLEMS.filter((p) => has(p, "## Full runnable script")).length
  const taught = PROBLEMS.filter((p) => deepDocument(p.id)).length
  console.log(
    `wrote ${want.size} files to docs/learn\n` +
      `  ${taught}/${PROBLEMS.length} carry an authored teaching document\n` +
      `  ${authored} authored scripts · ${generated} generated · ` +
      `${PROBLEMS.length - want.size + 1} problems have nothing to explain yet`
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main()
