// The "Explained, one approach at a time" docs: one markdown page per problem,
// rendered from the data the app already ships (B?? — docs/BACKLOG.md).
//
// Nothing here is authored. The ladder, the prose, the complexities and the
// three code blocks all come from `src/data/problems/**`; the runnable script
// at the foot of each page is built from the SAME vectors `verify:run` uses, so
// a page can never quote code the differential runner has not executed.
//
// The ladder is read through `src/lib/ladder.ts` (the app's own builder) with
// no journey passed, deliberately: a journeyed problem's acts are gated by the
// ledger, and a markdown file on disk has no ledger. Alternatives + the optimal
// are already visible on the problem page, so a page here spoils nothing that
// the app is holding back (the disclosure rule in CLAUDE.md).
//
// Run:  npm run docs:explained          # write docs/explained/**
//       node scripts/gen-explained.mjs --check   # fail if the tree is stale

import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { PATTERNS, PROBLEMS } from "../src/data/index.ts"
import { ladderOf, leetcodeUrl } from "../src/lib/ladder.ts"
import { VECTORS } from "./localsmith/vectors.mjs"
import { PY_CANON, PY_NODES, pyEntry, pyLit } from "./localsmith/run.mjs"

export const OUT_DIR = join(import.meta.dirname, "..", "docs", "explained")

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

  const head = [
    `# ${problem.title} — Explained, One Approach at a Time`,
    ``,
    `<!-- Generated by scripts/gen-explained.mjs from src/data/problems/${problem.pattern}/${problem.id}.ts.`,
    `     Edit the data, then run \`npm run docs:explained\`. Edits here are overwritten. -->`,
    ``,
    `**${pattern?.name ?? problem.pattern}** · ${problem.difficulty} · [the same question on LeetCode](${leetcodeUrl(problem.leetcode)})`,
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

  const body = rungs.flatMap((r, i) => [
    ``,
    `---`,
    ``,
    `## ${i + 1}. ${r.name}`,
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

  const arc = [
    ``,
    `---`,
    ``,
    `## The arc`,
    ``,
    // the closing narrative, when the problem carries one: the idea every rung
    // shares, which the per-rung "why now" lines cannot say on their own
    ...(problem.arc ? [problem.arc, ``] : []),
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

  const script = runnableScript(problem, rungs)
  const tail = script
    ? [
        ``,
        `---`,
        ``,
        `## Full runnable script`,
        ``,
        `Every rung in one file, printed against the inputs \`npm run verify:run\``,
        `drives the Java and C++ blocks with. Run it: \`python explained.py\`.`,
        ...(VECTORS[problem.id].unordered
          ? [
              ``,
              `Order is not part of this answer, so two rungs printing it differently are`,
              `both right — compare the contents, not the line.`,
            ]
          : []),
        ``,
        fence("python", script),
      ]
    : []

  return [...head, ...body, ...arc, ...tail, ``].join("\n")
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
    `# \`docs/explained/\` — one page per problem, every approach in order`,
    ``,
    `**Generated. Do not edit a page here** — \`npm run docs:explained\` rewrites all of them`,
    `from \`src/data/problems/**\`, and \`scripts/gen-explained.test.mjs\` fails when the tree on`,
    `disk has drifted from the data.`,
    ``,
    `## Change → file`,
    ``,
    `| Change | File |`,
    `|---|---|`,
    `| A problem's statement, rungs, prose or code | \`src/data/problems/<pattern>/<id>.ts\` |`,
    `| The page layout — headings, tables, what a rung shows | \`scripts/gen-explained.mjs\` |`,
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
        ? `docs/explained is stale — run npm run docs:explained`
        : `docs/explained matches the data (${want.size} files)`
    )
    process.exitCode = stale.length || extra.length ? 1 : 0
    return
  }

  rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })
  for (const [name, text] of want) writeFileSync(join(OUT_DIR, name), text)
  const scripts = PROBLEMS.filter((p) =>
    want.get(`${p.id}.md`).includes("## Full runnable script")
  ).length
  console.log(
    `wrote ${want.size} files to docs/explained — ${scripts}/${PROBLEMS.length} with a runnable script`
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main()
