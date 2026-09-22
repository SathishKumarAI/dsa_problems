// Time every rung of a problem, at the constraint's ceiling.
//
// B71 exists because writing five teaching documents accidentally discovered
// that the rung a page LABELS optimal was the slowest real rung on the clock
// in three of them. A bound ranks algorithms; a clock ranks implementations,
// and the page makes a claim about which one to reach for.
//
//   node scripts/time-rungs.mjs                 # every problem with a bench
//   node scripts/time-rungs.mjs --id pair-sum
//   node scripts/time-rungs.mjs --rounds 5
//
// It reports, per problem, each rung's best-of-N wall time and whether the
// page's TOP rung actually won. It exits 1 when one did not, because that is
// a claim on a live page that the clock disagrees with — not a crash, a
// finding, and the fix is either a relabel or a sentence saying when the
// lower rung wins. Silence is the unacceptable outcome.
//
// Two honesty rules baked in, both learned the hard way:
//
//   * A rung whose bound says it cannot survive the ceiling is timed at a
//     SMALLER size and scaled by its own bound, and every scaled number is
//     marked. Timing a quadratic rung at n = 10^5 measures patience.
//   * A bench must obey the problem's own constraints. Violating them is how
//     `product-except-self` was once timed on numbers with tens of thousands
//     of digits and never returned.
import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { PROBLEMS } from "../src/data/index.ts"
import { PY_NODES, pyEntry } from "./localsmith/run.mjs"
import { BENCHES } from "./benches.mjs"

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name)
  return i === -1 ? fallback : process.argv[i + 1]
}
const ROUNDS = Number(arg("--rounds", 3))
const ONLY = arg("--id", null)

const python = (() => {
  for (const c of ["python", "python3", "py"]) {
    try {
      execFileSync(c, ["--version"], { stdio: "pipe" })
      return c
    } catch {
      /* next */
    }
  }
  return null
})()
if (!python) {
  console.error("\n  TIMING SKIPPED — no python on PATH.\n")
  process.exit(0)
}

const dir = mkdtempSync(join(tmpdir(), "dsa-time-"))
let seq = 0

/** best-of-N wall time for one rung, in milliseconds, or null if it failed */
function time(src, entry, bench, setup) {
  const file = join(dir, `t${seq++}.py`)
  writeFileSync(
    file,
    [
      "import time",
      PY_NODES,
      src,
      setup,
      `fn = ${entry}`,
      "best = float('inf')",
      `for _ in range(${ROUNDS}):`,
      "    __t = time.perf_counter()",
      `    ${bench.call}`,
      "    best = min(best, time.perf_counter() - __t)",
      "print(round(best * 1000, 3))",
    ].join("\n")
  )
  try {
    const out = execFileSync(python, [file], {
      stdio: "pipe",
      timeout: 120000,
    })
    const ms = Number(String(out).trim().split(/\r?\n/).pop())
    return Number.isFinite(ms) ? ms : null
  } catch (e) {
    const why = String(e.stderr ?? e.message ?? e)
    return {
      failed: /RecursionError/.test(why)
        ? "RecursionError"
        : /timeout|ETIMEDOUT|SIGTERM/i.test(why)
          ? "timed out"
          : why.trim().split("\n").pop()?.slice(0, 60),
    }
  }
}

/** how much slower a bound gets between two sizes — used only to scale, and
 *  always reported as an ESTIMATE rather than a measurement */
function factor(bound, from, to) {
  const b = bound.replace(/\s/g, "").toLowerCase()
  if (b.includes("n³") || b.includes("n^3")) return (to / from) ** 3
  if (b.includes("n²") || b.includes("n^2")) return (to / from) ** 2
  if (b.includes("nlogn"))
    return (to * Math.log2(to)) / (from * Math.log2(from))
  return to / from
}

const rows = []
let disagreements = 0

for (const p of PROBLEMS) {
  if (ONLY && p.id !== ONLY) continue
  const bench = BENCHES[p.id]
  if (!bench) continue

  // top-level first: this is the rung the page calls the answer
  const rungs = [
    {
      name: "— the page's answer —",
      src: p.python,
      bound: p.complexity.time,
      top: true,
    },
    ...(p.alternatives ?? []).map((a) => ({
      name: a.name,
      src: a.python,
      bound: a.complexity.time,
      top: false,
    })),
  ]

  const timed = []
  for (const r of rungs) {
    const entry = pyEntry(r.src)
    if (!entry) {
      timed.push({ ...r, ms: null, note: "no entry point" })
      continue
    }
    const slow =
      bench.slowAt &&
      /n²|n\^2|n³|n\^3/.test(r.bound.replace(/\s/g, "")) &&
      !r.top
    const setup = slow ? bench.slowAt.setup : bench.setup
    const got = time(r.src, entry, bench, setup)
    if (got && typeof got === "object") {
      timed.push({ ...r, ms: null, note: got.failed })
      continue
    }
    timed.push({
      ...r,
      ms: got,
      scaled: slow ? bench.slowAt.size : null,
    })
  }

  const ran = timed.filter((t) => typeof t.ms === "number")
  const fastest = ran.reduce((a, b) => (a && a.ms <= b.ms ? a : b), null)
  const top = timed.find((t) => t.top)
  const loses =
    fastest &&
    top &&
    typeof top.ms === "number" &&
    fastest !== top &&
    !fastest.scaled
  if (loses) disagreements++

  rows.push({ problem: p, timed, fastest, top, loses })
}

rmSync(dir, { recursive: true, force: true })

for (const { problem, timed, fastest, loses } of rows) {
  console.log(`\n${problem.id}  ${BENCHES[problem.id].note ?? ""}`)
  for (const t of timed) {
    const ms =
      typeof t.ms === "number"
        ? `${t.ms.toFixed(1).padStart(9)} ms`
        : `${(t.note ?? "—").padStart(12)}`
    const mark = t === fastest ? " ← fastest" : ""
    const scaled = t.scaled
      ? `  [timed at n = ${t.scaled}; ~${Math.round(
          factor(t.bound, t.scaled, 1e5)
        ).toLocaleString()}× at the ceiling]`
      : ""
    console.log(`  ${ms}  ${t.bound.padEnd(12)} ${t.name}${mark}${scaled}`)
  }
  if (loses) {
    console.log(
      `  ⚠  THE PAGE'S ANSWER IS NOT THE FASTEST RUNG HERE — relabel it, or`
    )
    console.log(
      `     add the sentence naming when the lower rung wins. Silence is the`
    )
    console.log(`     one unacceptable outcome (B71).`)
  }
}

console.log(
  `\n${rows.length} problem(s) timed, best of ${ROUNDS}. ${disagreements} where the page's answer lost on the clock.\n`
)
process.exitCode = disagreements ? 1 : 0
