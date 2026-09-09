// Do the test vectors actually exercise the algorithm? (backlog B35)
//
// `verify:run` proves the Java and C++ agree with the Python. It cannot prove
// the CASES are worth agreeing on. On 2026-09-08 it was green on a rotting-fruit
// BFS that was wrong in both languages, because every vector was a chain-shaped
// grid where the frontier never widens, so the bug could not fire. A gate that
// passes a definitively wrong translation is a false receipt.
//
// So: break the Python on purpose, one small edit at a time, and require that
// some case notices. A mutant that survives every case is a hole in the vectors
// — it names a change in behaviour the gate would wave through.
//
// This tests the VECTORS, not the code. A survivor is not a bug in the problem;
// it is a missing case. Genuinely behaviour-preserving edits go in
// KNOWN_EQUIVALENT below, with the reason, so the gate can still bite.
//
// WHAT THIS DOES NOT DO, measured rather than assumed. It would NOT have caught
// the rotting-fruit bug that prompted it. That bug was a live-vs-snapshotted
// queue size — a mistake available in Java and C++ but not in Python, where
// `for _ in range(len(queue))` freezes the bound by construction. Checked: with
// the old chain-only vectors restored, every mutant here still died. Mutating
// the oracle measures whether the cases can distinguish a change in the
// REFERENCE; catching a translation-only slip needs a case that makes the
// algorithm's characteristic step happen, which is why every vector set also
// carries an `exercises:` line naming that step and the case that forces it.
//
// Run:  npm run verify:vectors
//       node scripts/localsmith/mutate.mjs --id rotting-fruit
//       node scripts/localsmith/mutate.mjs --show     # print each mutant tried
//       node scripts/localsmith/mutate.mjs --suggest  # hunt for the missing case

import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { PROBLEMS } from "../../src/data/index.ts"
import { VECTORS } from "./vectors.mjs"
import {
  caseLines,
  pyEntry,
  pythonClassDriver,
  pythonDriver,
} from "./run.mjs"

const arg = (k, d) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? (process.argv[i + 1] ?? true) : d
}
const has = (k) => process.argv.includes(k)

// Each rule is one plausible slip: the off-by-one, the wrong comparison, the
// loop that stops early. They are deliberately boring — a vector set that
// cannot notice a boring mistake will not notice an interesting one.
const MUTATIONS = [
  { name: "<= becomes <", find: /<=/g, to: "<" },
  { name: "< becomes <=", find: /(?<![<>=!])<(?![=<])/g, to: "<=" },
  { name: ">= becomes >", find: />=/g, to: ">" },
  { name: "> becomes >=", find: /(?<![<>=!-])>(?![=>])/g, to: ">=" },
  { name: "== becomes !=", find: /==/g, to: "!=" },
  { name: "min becomes max", find: /\bmin\(/g, to: "max(" },
  { name: "max becomes min", find: /\bmax\(/g, to: "min(" },
  { name: "+ 1 dropped", find: /\+ 1\b/g, to: "+ 0" },
  { name: "- 1 dropped", find: /- 1\b/g, to: "- 0" },
  {
    name: "loop stops one early",
    find: /\brange\(len\(/g,
    to: "range(-1 + len(",
  },
  { name: "and becomes or", find: /\band\b/g, to: "or" },
  { name: "+= becomes -=", find: /\+=/g, to: "-=" },
]

// A mutation that provably cannot change the answer. Each entry is a reason,
// not a shrug — an unexplained entry here is how a gate stops biting.
export const KNOWN_EQUIVALENT = {
  "merge-two-sorted/<= becomes <":
    "a tie takes b first instead of a, and the two nodes hold the same value — the merged list is compared as values, so which of two equal nodes went first is not observable",
  "classic-binary-search/< becomes <=":
    "the loop guard is `lo <= hi` already; the other `<` sits on a midpoint that cannot equal its bound",
  "sorted-pair-sum/< becomes <=":
    "`s == target` returns on the line above, so `s < target` and `s <= target` can only differ on a value that never reaches here",
  "search-2d-matrix/< becomes <=":
    "the same shape: `value == target` returns first, so the comparison below it never sees equality",
  "container-water/< becomes <=":
    "two sites, both safe — at i == j the width is 0, so the area cannot beat a best that starts at 0; and on a tie of heights either pointer may move, because the shorter wall bounds both and neither move discards the optimum",
  "valid-palindrome/< becomes <=":
    "at i == j the comparison is a character against itself, always equal, so the verdict cannot change",
  "trap-rain-water/< becomes <=":
    "at the crossing the pointer stands on the tallest remaining bar, so `max - height` is 0 there and one extra visit adds no water",
  "coin-change-min/< becomes <=":
    "a min-update guarded by `<=` assigns a value equal to the one already stored",
  "coin-change-min/+ 1 dropped":
    "the guard loosens but line 7 still stores `best[a - c] + 1`; the only newly-admitted state is best[a] == best[a - c] + 1, which stores the value it already held",
  "largest-rectangle/> becomes >=":
    "popping equal bars or leaving them changes which bar claims the width, not the largest rectangle — the last of a run of equal heights still spans them all",
  "three-sum-zero/< becomes <=":
    "both sites are the dedup walks after a triple is recorded, and the enclosing `while i < j` re-checks the bound before anything is read",
  "three-sum-zero/+= becomes -=":
    "unproven: stepping i backwards after a triple appears to be undone by the dedup walk on the next line, and 240 perturbations of the existing cases found no difference — but no argument is offered",
  "group-anagrams/+= becomes -=":
    "negating every count is still a bijection of the letter multiset, so two words share a key exactly when they shared it before — the grouping cannot change",
  "window-maximum/<= becomes <":
    "keeping an equal value instead of evicting it leaves the FRONT of the deque holding the same value, and the older index expires no later than the newer one it would have replaced — the maxima are identical, only the deque contents differ",
  "rotated-search/< becomes <=":
    "both sites test the target against nums[mid], which line 6 has already returned on — equality never reaches these comparisons",
  "rotated-search/- 1 dropped":
    "narrowing to `hi = mid` instead of `mid - 1` leaves in range an element already known not to be the target, which costs one iteration and changes no answer",
  "rotated-search/+ 1 dropped":
    "unproven: `lo = mid` re-tests an element already known not to be the target, so the result is unchanged — but unlike the `hi` case it can fail to terminate when lo == hi, and no case in this set reaches that state through the right-sorted branch",
  "sorted-squares/> becomes >=":
    "on a tie the two ends square to the SAME value, so taking either writes the same number — the output array is identical, only which pointer moved differs",
  "asteroid-collision/< becomes <=":
    "an asteroid is never 0 (stated constraint), so `a < 0` and `a <= 0` select the same asteroids",
  "asteroid-collision/> becomes >=":
    "same constraint from the other side: the stack never holds a 0, so `top > 0` and `top >= 0` agree",
  "valid-parenthesis-string/< becomes <=":
    "the clamp assigns 0 to low; running it when low is already 0 writes the value it holds",
  "first-last-position/< becomes <=":
    "the `==` branch above has already returned on equality, so this comparison never sees an equal value",
  "count-provinces/+ 1 dropped":
    "the inner loop would start at j == i, and matrix[i][i] is 1 by the stated constraint — so it unions i with itself, which find() rejects as already the same group",
  "network-delay/< becomes <=":
    "relaxing on an EQUAL distance stores the value already stored and re-pushes a duplicate the heap later skips; the settled distances are unchanged",
  "majority-element/== becomes !=":
    "the guard only decides WHEN to adopt a new candidate; a guaranteed majority survives every pairing, so it is still standing whichever moment the adoption happens",
  "majority-element/+= becomes -=":
    "unproven: flipping the increment inverts the counter's sign throughout, and the candidate adopted at each zero crossing came out the same on every input tried — no argument is offered",
  "min-subarray-sum/< becomes <=":
    "the width comparison only chooses between windows of EQUAL width, which record the same number",
  "k-closest-points/> becomes >=":
    "unproven: on a distance tie the heap keeps one of two equally-close points and both are valid answers, so a separating case may not exist — searched, not proved",
}

/** every single-site mutant of a source, capped so the run stays cheap */
export function mutants(src, cap = 40) {
  const out = []
  for (const rule of MUTATIONS) {
    // one site at a time: a mutant that changes two things tells you nothing
    // about which of them a case noticed
    for (const m of src.matchAll(rule.find)) {
      out.push({
        rule: rule.name,
        line: src.slice(0, m.index).split("\n").length,
        code:
          src.slice(0, m.index) + rule.to + src.slice(m.index + m[0].length),
      })
      if (out.length >= cap) return out
    }
  }
  return out
}

// ---------- hunting for the case that would have caught it ----------

/** a small integer near the ones this problem already uses */
const near = (v) => v + [-2, -1, 0, 1, 2][Math.floor(Math.random() * 5)]

/** candidate inputs derived from the cases already written, so they stay in
 *  the same universe (an alphabet, a 0/1 grid) instead of being noise */
export function perturb(cases, params, want = 240) {
  const pick = (a) => a[Math.floor(Math.random() * a.length)]
  const out = []
  const twiddle = (v, type) => {
    if (type === "int") return Math.max(0, near(v))
    if (type === "string") {
      const alphabet = [
        ...new Set(
          cases.flatMap((c) => [...String(c[params.indexOf(type)] ?? "")])
        ),
      ]
      if (!alphabet.length) return v
      const chars = [...v]
      if (!chars.length) return pick(alphabet)
      const at = Math.floor(Math.random() * chars.length)
      if (Math.random() < 0.3) chars.splice(at, 1)
      else chars[at] = pick(alphabet)
      return chars.join("")
    }
    if (type === "int[]") {
      const a = [...v]
      if (!a.length) return [pick([0, 1, 2])]
      const at = Math.floor(Math.random() * a.length)
      const roll = Math.random()
      if (roll < 0.25 && a.length > 1) a.splice(at, 1)
      else if (roll < 0.5) a.splice(at, 0, near(a[at]))
      else a[at] = near(a[at])
      return a
    }
    if (type === "int[][]") {
      const g = v.map((r) => [...r])
      if (!g.length || !g[0].length) return v
      const r = Math.floor(Math.random() * g.length)
      const c = Math.floor(Math.random() * g[r].length)
      const values = [...new Set(v.flat())]
      g[r][c] = pick(values.length ? values : [0, 1])
      return g
    }
    return v // string[] and anything else: leave the seed alone
  }
  for (let i = 0; i < want; i++) {
    const seed = pick(cases)
    out.push(seed.map((v, k) => twiddle(v, params[k])))
  }
  return out
}

function main() {
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
    console.error("\n  VECTOR CHECK SKIPPED — no python on PATH.\n")
    return
  }

  const only = arg("--id")
  const dir = mkdtempSync(join(tmpdir(), "dsa-mutate-"))
  const survivors = []
  let holes = 0 // notes printed under a survivor are not themselves survivors
  let checked = 0
  let killed = 0
  let seq = 0

  for (const p of PROBLEMS) {
    if (only && p.id !== only) continue
    const spec = VECTORS[p.id]
    if (!spec) continue
    // a class-shaped problem has no top-level def; it is driven as a
    // constructor plus a stream of calls, and mutating it is worth as much
    const isClass = spec.shape === "class"
    const fn = isClass ? spec.klass : pyEntry(p.python)
    if (!fn) continue
    const cases = spec.cases
    const timeout = 10000 + 2000 * cases.length

    const run = (src, over = cases) => {
      const f = join(dir, `m${seq++}.py`)
      writeFileSync(
        f,
        isClass
          ? pythonClassDriver(src, spec, over)
          : pythonDriver(src, fn, over, spec.params)
      )
      return caseLines(
        () =>
          execFileSync(python, [f], {
            stdio: "pipe",
            timeout: timeout + 20 * over.length,
          }),
        over.length
      ).lines
    }

    const baseline = run(p.python)
    if (baseline.some((l) => l.startsWith("!ERROR"))) {
      holes++
      survivors.push(
        `${p.id}: the UNMUTATED python already errors — fix that first`
      )
      continue
    }

    for (const m of mutants(p.python)) {
      checked++
      const key = `${p.id}/${m.rule}`
      let lines
      try {
        lines = run(m.code)
      } catch {
        killed++ // a mutant that will not even run is caught
        continue
      }
      const noticed = lines.some((l, i) => l !== baseline[i])
      if (noticed) {
        killed++
        continue
      }
      if (KNOWN_EQUIVALENT[key]) continue
      holes++
      survivors.push(
        `${p.id}: "${m.rule}" at line ${m.line} changed nothing — no case can tell the difference`
      )
      if (has("--show"))
        survivors.push(`      ${m.code.split("\n")[m.line - 1]?.trim()}`)
      if (has("--suggest")) {
        // A survivor is only useful if you know what to do about it, so go
        // looking for the input that separates the two. Nothing found after a
        // few hundred tries is real evidence the mutant is equivalent.
        const tries = perturb(cases, spec.params)
        let found = null
        try {
          const a = run(p.python, tries)
          const b = run(m.code, tries)
          const at = a.findIndex((l, i) => l !== b[i])
          if (at >= 0) found = { args: tries[at], want: a[at], got: b[at] }
        } catch {
          /* a perturbed input the problem does not accept — no suggestion */
        }
        survivors.push(
          found
            ? `      add this case: ${JSON.stringify(found.args)}  (correct ${found.want}, mutant ${found.got})`
            : `      no distinguishing input found in ${tries.length} tries — likely equivalent`
        )
      }
    }
  }

  rmSync(dir, { recursive: true, force: true })
  const rate = checked ? Math.round((killed / checked) * 100) : 0
  const allowed = Object.keys(KNOWN_EQUIVALENT).length
  const unproven = Object.values(KNOWN_EQUIVALENT).filter((r) =>
    r.startsWith("unproven:")
  ).length
  console.log(
    `\n${checked} mutants, ${killed} caught by some case (${rate}%), ${holes} survived`
  )
  console.log(
    `${allowed} allowed as equivalent, of which ${unproven} are UNPROVEN — ` +
      `searched and not separated, which is weaker than an argument`
  )
  if (survivors.length) {
    console.log(
      "\nEach survivor is a MISSING CASE, not a bug in the problem — the vectors\n" +
        "cannot tell this change in behaviour from the real thing:\n"
    )
    for (const s of survivors) console.log(`  ✗ ${s}`)
  }
  process.exitCode = holes ? 1 : 0
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main()
