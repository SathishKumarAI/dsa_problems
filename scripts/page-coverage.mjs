// How much of the problem page each problem actually fills in.
//
// `docs/PROBLEM-PAGE-PLAYBOOK.md` §2 is a table of these numbers, and a table
// of numbers in a document is a claim about a moment. This is the reading, so
// the claim can be re-taken rather than believed — run it after a batch and
// paste the output over §2.
//
// Every band of the page degrades to nothing when its field is absent, which
// is why 152 pages render today and look thin rather than broken. That is also
// why nothing here fails: this is a MEASUREMENT, not a gate. The gates that
// must fail live in `problems.test.ts`.
//
//   node --experimental-strip-types scripts/page-coverage.mjs        the table
//   node --experimental-strip-types scripts/page-coverage.mjs --thin  what to do next
import { PROBLEMS } from "../src/data/index.ts"

/** the fields the playbook asks an author to write, in the order it asks */
const FIELDS = [
  ["examples", (p) => !!p.examples?.length],
  ["hints", (p) => !!p.hints?.length],
  ["arc", (p) => !!p.arc],
  ["walkthrough", (p) => !!p.walkthrough?.length],
  ["keyed alternatives", (p) => !!p.alternatives?.some((a) => a.key)],
  ["unlocks", (p) => !!p.unlocks?.length],
  ["unlocks with a figure", (p) => !!p.unlocks?.some((u) => u.figure)],
  ["checks", (p) => !!p.checks?.length],
  ["reading", (p) => !!p.reading?.length],
  ["costWhy (page target)", (p) => !!p.costWhy],
  [
    "costWhy on every rung",
    (p) => !!p.alternatives?.length && p.alternatives.every((a) => a.costWhy),
  ],
  [
    "whyNow on every alternative",
    (p) => !!p.alternatives?.length && p.alternatives.every((a) => a.whyNow),
  ],
]

/** the five the playbook actually costs you per problem (§3) */
const AUTHORED = new Set([
  "unlocks",
  "checks",
  "reading",
  "costWhy (page target)",
  "costWhy on every rung",
])

const n = PROBLEMS.length
const rows = FIELDS.map(([name, has]) => ({
  name,
  count: PROBLEMS.filter(has).length,
}))

if (process.argv.includes("--thin")) {
  // Which problems have none of the five, i.e. the whole queue. Printed as ids
  // so a batch can be cut straight from it.
  const bare = PROBLEMS.filter(
    (p) => !FIELDS.some(([name, has]) => AUTHORED.has(name) && has(p))
  ).map((p) => p.id)
  console.log(`${bare.length} of ${n} problems carry none of the five fields\n`)
  for (const id of bare) console.log(id)
  process.exit(0)
}

const width = Math.max(...rows.map((r) => r.name.length))
console.log(`${n} problems\n`)
for (const { name, count } of rows) {
  const pct = `${Math.round((100 * count) / n)}%`
  const mark = AUTHORED.has(name) ? "·" : " "
  console.log(
    `${mark} ${name.padEnd(width)}  ${String(count).padStart(4)}  ${pct.padStart(4)}`
  )
}
console.log(`\n· = one of the five fields the playbook asks you to author`)
