// ONE page per problem — everything there is to learn about it, in one file.
//
// Before this existed, a problem's knowledge was spread over four places: the
// data file (statement, constraints, hints, the ladder in three languages),
// `docs/explained/` (a generated shortish page), `docs/deep/` (the authored
// teaching document) and the journey. A reader had to know which to open. An
// audit on 2026-09-13 counted the overlap and the answer was to stop having
// two generated shapes: `docs/learn/<id>.md` is now the single page, and
// `docs/explained/` is gone.
//
// What each block comes from, because the difference matters:
//   * the problem, the ladder, the three languages, the arc   -> GENERATED
//     from `src/data/problems/**`, through the app's own `ladderOf`, so a page
//     can never disagree with the problem page.
//   * the long teaching body — intuition, worked traces, the bug you are about
//     to write, measured numbers, drills                      -> AUTHORED, in
//     `docs/deep/<id>_explained.md`, spliced in verbatim. 81 of 127 have one.
//   * the runnable script: the authored one when a deep document exists (it
//     carries the buggy variants and the measurements), otherwise the
//     vector-driven one built here.
//
// SPOILERS, on purpose. The app gates a journey's unearned rungs behind the
// ledger; a file on disk has no ledger, so this page shows everything. The app
// links to it only when the ladder is NOT capped (see `problem-detail.tsx`).
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

  const head = [
    `# ${problem.title}`,
    ``,
    `<!-- Generated by scripts/gen-learn.mjs from src/data/problems/${problem.pattern}/${problem.id}.ts`,
    `     ${deep ? `and docs/deep/${problem.id}_explained.md` : `(no deep document yet — see docs/BACKLOG.md)`}.`,
    `     Edit those, then run \`npm run docs:learn\`. Edits here are overwritten. -->`,
    ``,
    `**${pattern?.name ?? problem.pattern}** · ${problem.difficulty} · [the same question on LeetCode](${leetcodeUrl(problem.leetcode)})`,
    ``,
    `> Everything about this problem is on this page: the question, what the input`,
    `> promises, the hints, ${deep ? `the long explanation, ` : ``}every approach in Python, Java and C++,`,
    `> and a script you can run. It **does not hide anything** — if you are partway`,
    `> through the journey for this problem, it will show you the ending.`,
    ``,
    problem.statement,
    ``,
    `## What the input promises`,
    ``,
    ...problem.constraints.map((c) => `- ${c}`),
    ``,
    `## Examples`,
    ``,
    `| Input | Output | Why |`,
    `|---|---|---|`,
    ...problem.examples.map(
      (e) =>
        `| \`${e.input}\` | \`${e.output}\` | ${e.note ?? "—"} |`
    ),
    ``,
    `<details>`,
    `<summary>Hints, one nudge at a time — open them in order</summary>`,
    ``,
    ...problem.hints.map((h, i) => `${i + 1}. ${h}`),
    ``,
    `</details>`,
  ]

  // The authored teaching document, verbatim. Its headings are already `##`
  // and `###`, which is why it is spliced at top level rather than nested —
  // nesting it would push sections to `####`, a level the app's reader does
  // not render.
  const teaching = deep
    ? [``, `---`, ``, deep.body, ``]
    : [
        ``,
        `---`,
        ``,
        `## The long explanation is not written yet`,
        ``,
        `This problem has no document in \`docs/deep/\` — 81 of ${PROBLEMS.length} do. What follows`,
        `is the ladder itself: every approach in build order, each with the weakness in the`,
        `one before it, in all three languages.`,
        ``,
      ]

  const body = rungs.flatMap((r, i) => [
    ``,
    `---`,
    ``,
    `## Rung ${i + 1} — ${r.name}`,
    ``,
    ...(r.whyNow ? [`> **Why now.** ${r.whyNow}`, ``] : []),
    r.idea,
    ``,
    fence("python", r.code.python),
    ``,
    `**${r.cost}**`,
    ...(r.code.java || r.code.cpp
      ? [
          ``,
          tab("The same rung in Java", "java", r.code.java),
          tab("The same rung in C++", "cpp", r.code.cpp),
        ].filter(Boolean)
      : []),
  ])

  const siblings = PROBLEMS.filter(
    (p) => p.pattern === problem.pattern && p.id !== problem.id
  )

  const arc = [
    ``,
    `---`,
    ``,
    `## The arc`,
    ``,
    // The closing narrative, when the problem carries one. A deep document has
    // its own "Overall Arc" section, which is the same idea expanded — printing
    // both would say the same thing twice on one page (found by the 2026-09-13
    // audit), so the short one is dropped where the long one exists.
    ...(problem.arc && !deep ? [problem.arc, ``] : []),
    ...(problem.arc && deep
      ? [`The narrative version is **The Overall Arc**, above. In one line:`, ``, `> ${firstSentence(problem.arc)}`, ``]
      : []),
    `| # | Approach | Cost | What it adds |`,
    `|---|---|---|---|`,
    ...rungs.map((r, i) => {
      // `whyNow` is the honest answer to this column and 193 of the 306 rungs
      // carry one. Where the data has none, the rung's own first sentence says
      // what it teaches — better than a blank cell, and never invented here.
      const adds = i === 0 ? "the baseline — nothing before it" : (r.whyNow ?? firstSentence(r.idea))
      return `| ${i + 1} | ${r.name} | ${r.cost} | ${adds} |`
    }),
  ]

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

  // problem -> the authored teaching -> the ladder in three languages -> the
  // arc and the comparison -> where it sits -> one script you can run
  return [
    ...head,
    ...teaching,
    ...ladderHeading(deep),
    ...body,
    ...arc,
    ...where,
    ...tail,
    ``,
  ].join("\n")
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
  for (const p of PROBLEMS) out.set(`${p.id}.md`, renderProblem(p))
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
  const authored = PROBLEMS.filter((p) =>
    want.get(`${p.id}.md`).includes("## Full Runnable Script")
  ).length
  const generated = PROBLEMS.filter((p) =>
    want.get(`${p.id}.md`).includes("## Full runnable script")
  ).length
  const taught = PROBLEMS.filter((p) => deepDocument(p.id)).length
  console.log(
    `wrote ${want.size} files to docs/learn\n` +
      `  ${taught}/${PROBLEMS.length} carry an authored teaching document\n` +
      `  ${authored} authored scripts · ${generated} generated · ` +
      `${PROBLEMS.length - authored - generated} pages with no script at all`
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main()
