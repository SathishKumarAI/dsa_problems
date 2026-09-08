// Differential runner (backlog B27): execute every Java and C++ block against
// the repo's own Python and compare the answers.
//
// The oracle is the Python that already ships. It is human-written, reviewed,
// and rendered on the page as the reference solution — so if a translation
// disagrees with it, one of the two is wrong and both are worth looking at.
// Nothing here hand-writes an expected value; vectors.mjs carries inputs only.
//
// Marshalling is done by emitting the arguments as LITERALS into a generated
// driver, rather than parsing JSON in three languages. The driver prints the
// answer in one canonical text form, and the three strings are compared.
//
// ONE DRIVER PER BLOCK, NOT PER CASE (B31). Every case for a rung goes into a
// single driver that prints one line each, so a block is compiled and launched
// once instead of once per case. That is ~4x fewer compiles, and it removes the
// Windows "refused to launch a freshly built .exe" flake that made this gate
// report a different number every run — 28 refusals one day, 66 the next.
// Isolation is kept by the driver rather than by the process: each case is
// wrapped in its own try/catch and prints "!ERROR ..." on the way out, and a
// process that dies outright still hands back the lines it flushed, so a crash
// is attributed to the case that caused it instead of hiding the rest.
//
// The one thing per-process isolation did better: a HARD crash (a C++ stack
// overflow is a crash, not an exception) also costs the cases queued behind it.
// They are reported as "!ERROR process died", never silently passed — and a
// crash is a finding in its own right — so the trade is a louder failure, not a
// quieter one. Measured: 7m17s and 508 builds became 1m38s and 120.
//
// Run:  node scripts/localsmith/run.mjs
//       node scripts/localsmith/run.mjs --id best-trade
//       node scripts/localsmith/run.mjs --keep      # leave the drivers on disk

import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { PROBLEMS } from "../../src/data/index.ts"
import { NOT_YET_RUNNABLE, VECTORS } from "./vectors.mjs"
import { toolchain } from "./verify.mjs"

const arg = (k, d) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? (process.argv[i + 1] ?? true) : d
}
const has = (k) => process.argv.includes(k)

/** Windows virus scanning holds a lock on a just-written .exe, which surfaces
 *  as an UNKNOWN spawn error. Retrying briefly is the difference between a
 *  flaky gate and a useful one. */
function runExe(cmd, args, opts) {
  let last
  for (let t = 0; t < 4; t++) {
    try {
      return execFileSync(cmd, args, opts)
    } catch (e) {
      last = e
      if (!/UNKNOWN|EBUSY|EPERM|ETXTBSY/.test(String(e.message ?? e))) throw e
      // a real blocking sleep: the retry is pointless if it does not wait
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300)
    }
  }
  throw last
}

/** run a driver and split its stdout into one line per case.
 *
 *  A C++ stack overflow is a crash, not an exception, so the process can die
 *  with some cases already printed. execFileSync still carries that output on
 *  the error, so read it: the lines that are missing name the case that killed
 *  the process, instead of the whole block reporting nothing. */
export function caseLines(run, n) {
  let out = ""
  let err = null
  try {
    out = run().toString()
  } catch (e) {
    out = String(e.stdout ?? "")
    // an empty stderr is an empty Buffer, and a Buffer is always truthy —
    // read it, then fall back to the spawn error itself
    err = String(e.stderr ?? "").trim() || String(e.message ?? e)
  }
  const lines = out.split(/\r?\n/)
  while (lines.length && lines.at(-1) === "") lines.pop()
  const why = err
    ? `!ERROR process died: ${err.slice(-140).replace(/\s+/g, " ")}`
    : "!ERROR no output for this case"
  while (lines.length < n) lines.push(why)
  return { lines, err }
}

// ---------- finding the entry point ----------

/** top-level definitions in a C-family block, as {name, text} */
function cDefs(src) {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "{") depth++
    else if (src[i] === "}") {
      depth--
      if (depth === 0) {
        const text = src.slice(start, i + 1)
        const name = text.match(
          /([A-Za-z_]\w*)\s*\([^)]*\)\s*(?:const\s*)?\{/
        )?.[1]
        if (name) out.push({ name, text })
        start = i + 1
      }
    }
  }
  return out
}

/** python top-level defs */
function pyDefs(src) {
  const out = []
  const lines = src.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^def ([A-Za-z_]\w*)/)
    if (m) out.push({ name: m[1], at: i })
  }
  return out
}

/** the definition nobody else calls — the way in */
function entry(defs, srcOf) {
  if (defs.length === 1) return defs[0].name
  const called = new Set()
  for (const d of defs)
    for (const o of defs)
      if (o !== d && new RegExp(`\\b${o.name}\\s*\\(`).test(srcOf(d)))
        called.add(o.name)
  const roots = defs.filter((d) => !called.has(d.name))
  return (roots.at(-1) ?? defs.at(-1)).name
}

const pyEntry = (src) => {
  const defs = pyDefs(src)
  if (!defs.length) return null
  const lines = src.split("\n")
  const bodyOf = (d) => {
    const next = defs.find((o) => o.at > d.at)
    return lines.slice(d.at, next ? next.at : lines.length).join("\n")
  }
  return entry(defs, bodyOf)
}
const cEntry = (src) => {
  const defs = cDefs(src)
  return defs.length ? entry(defs, (d) => d.text) : null
}

// ---------- literals ----------

const lit = {
  python: (v) => JSON.stringify(v),
  java: (v, t) => {
    if (t === "int") return String(v)
    if (t === "string") return JSON.stringify(v)
    if (t === "int[]") return `new int[]{${v.join(",")}}`
    if (t === "int[][]")
      return `new int[][]{${v.map((r) => `{${r.join(",")}}`).join(",")}}`
    if (t === "string[]")
      return `new String[]{${v.map((s) => JSON.stringify(s)).join(",")}}`
    throw new Error(`java literal for ${t}`)
  },
  cpp: (v, t) => {
    if (t === "int") return String(v)
    if (t === "string") return JSON.stringify(v)
    if (t === "int[]") return `{${v.join(",")}}`
    if (t === "int[][]")
      return `{${v.map((r) => `{${r.join(",")}}`).join(",")}}`
    if (t === "string[]")
      return `{${v.map((s) => JSON.stringify(s)).join(",")}}`
    throw new Error(`cpp literal for ${t}`)
  },
}

// C++ argument types must be spelled out, because a literal alone is ambiguous
const CPP_TYPE = {
  int: "int",
  string: "string",
  "int[]": "vector<int>",
  "int[][]": "vector<vector<int>>",
  "string[]": "vector<string>",
}

// ---------- drivers ----------

const PY_PRINT = `
def __canon(v):
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, str): return v
    if v is None: return "null"
    if isinstance(v, (list, tuple)):
        return "[" + ",".join(__canon(x) for x in v) + "]"
    return str(v)
`

/** one line per case. The try/except is what per-process isolation used to buy:
 *  a case that raises still lets the next one run, and names itself. */
export function pythonDriver(src, fn, cases) {
  const body = cases
    .map((args) => {
      const call = `${fn}(${args.map(lit.python).join(", ")})`
      return [
        `try:`,
        `    print(__canon(${call}).replace("\\n", "\\\\n"))`,
        `except BaseException as __e:`,
        `    print("!ERROR " + str(__e).replace("\\n", " "))`,
      ].join("\n")
    })
    .join("\n")
  return `${src}\n${PY_PRINT}\n${body}\n`
}

const JAVA_PRINT = `
    static String canon(Object o) {
        if (o == null) return "null";
        if (o instanceof int[] a) {
            StringBuilder b = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(a[i]); }
            return b.append("]").toString();
        }
        if (o instanceof int[][] a) {
            StringBuilder b = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(canon(a[i])); }
            return b.append("]").toString();
        }
        if (o instanceof Object[] a) {
            StringBuilder b = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(canon(a[i])); }
            return b.append("]").toString();
        }
        if (o instanceof java.util.Collection<?> c) {
            StringBuilder b = new StringBuilder("[");
            boolean first = true;
            for (Object x : c) { if (!first) b.append(","); first = false; b.append(canon(x)); }
            return b.append("]").toString();
        }
        return String.valueOf(o);
    }
`

/** the parameter types the block actually declares, e.g. int[][] vs List<List<Integer>> */
function javaParamTypes(block, fn) {
  const sig = block.match(new RegExp(`\\b${fn}\\s*\\(([^)]*)\\)`))
  if (!sig) return null
  return sig[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s+\w+$/, "").trim())
}

/** a literal in whatever shape the block asked for */
function javaArg(v, want, declared) {
  if (/List<List</.test(declared))
    return `new ArrayList<>(List.of(${v
      .map((r) => `List.of(${r.join(",")})`)
      .join(",")}))`
  if (/List</.test(declared)) return `new ArrayList<>(List.of(${v.join(",")}))`
  return lit.java(v, want)
}

export function javaDriver(nodes, block, fn, cases, params) {
  const isStatic = new RegExp(`static\\s[^;{]*\\b${fn}\\s*\\(`).test(block)
  const declared = javaParamTypes(block, fn) ?? []
  // Throwable, not Exception: the flood fill B27 caught blew the stack on a
  // 1x1 grid, and a StackOverflowError is an Error.
  const body = cases
    .map((args) => {
      const call = `${isStatic ? "" : "new Solution()."}${fn}(${args
        .map((v, i) => javaArg(v, params[i], declared[i] ?? params[i]))
        .join(", ")})`
      return [
        `        try { System.out.println(canon(${call}).replace("\\n", "\\\\n")); }`,
        `        catch (Throwable __t) { System.out.println("!ERROR " + String.valueOf(__t).replace("\\n", " ")); }`,
      ].join("\n")
    })
    .join("\n")
  return `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

${nodes}
public class Solution {
${block
  .split("\n")
  .map((l) => (l.trim() ? "    " + l : l))
  .join("\n")}
${JAVA_PRINT}
    public static void main(String[] a) {
${body}
    }
}
`
}

const CPP_PRINT = `
static string canon(int v) { return to_string(v); }
static string canon(long long v) { return to_string(v); }
static string canon(bool v) { return v ? "true" : "false"; }
static string canon(const string& v) { return v; }
template <class T> static string canon(const vector<T>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += canon(v[i]); }
    return s + "]";
}
/** a value carrying a newline would silently shift every later case up a line */
static string __esc(const string& s) {
    string o;
    for (char c : s) { if (c == '\\n') o += "\\\\n"; else o += c; }
    return o;
}
`

export function cppDriver(headers, nodes, block, fn, cases, params) {
  // each case gets its own scope, so nothing a block mutates leaks sideways
  const body = cases
    .map((args, k) => {
      const decls = args.map(
        (v, i) =>
          `        ${CPP_TYPE[params[i]]} a${k}_${i} = ${lit.cpp(v, params[i])};`
      )
      const call = `${fn}(${args.map((_, i) => `a${k}_${i}`).join(", ")})`
      return [
        `    {`,
        decls.join("\n"),
        `        try { cout << __esc(canon(${call})) << endl; }`,
        `        catch (...) { cout << "!ERROR c++ threw" << endl; }`,
        `    }`,
      ].join("\n")
    })
    .join("\n")
  return `${headers}
${nodes}
${block}
${CPP_PRINT}
int main() {
${body}
    return 0;
}
`
}

// ---------- comparison ----------

/** sort the elements of a one- or two-level list so order stops mattering */
function normalise(text, unordered) {
  if (!unordered) return text
  const inner = text.slice(1, -1)
  if (!inner) return text
  const parts = []
  let depth = 0
  let cur = ""
  for (const c of inner) {
    if (c === "[") depth++
    if (c === "]") depth--
    if (c === "," && depth === 0) {
      parts.push(cur)
      cur = ""
    } else cur += c
  }
  parts.push(cur)
  return "[" + parts.sort().join(",") + "]"
}

// ---------- the run ----------

function main() {
  const tools = toolchain()
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
    console.error(
      "\n  RUN SKIPPED — no python on PATH; it is the oracle here.\n"
    )
    return
  }
  if (!tools.java && !tools.cpp) {
    console.error("\n  RUN SKIPPED — no javac and no g++.\n")
    return
  }

  const dir = mkdtempSync(join(tmpdir(), "dsa-run-"))
  // reuse verify.mjs's scaffolding so the two gates agree on what a block may assume
  const headers = `#include <algorithm>
#include <cctype>
#include <climits>
#include <cmath>
#include <deque>
#include <functional>
#include <iostream>
#include <limits>
#include <map>
#include <numeric>
#include <queue>
#include <set>
#include <stack>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>
using namespace std;`

  const only = arg("--id")
  const failures = []
  const unrunnable = []
  let seq = 0
  let ran = 0
  let compared = 0
  let compiles = 0

  for (const p of PROBLEMS) {
    if (only && p.id !== only) continue
    const spec = VECTORS[p.id]
    if (!spec) continue
    const rungs = [
      { key: "optimal", code: p },
      ...(p.alternatives ?? []).map((a) => ({ key: a.name, code: a })),
    ]
    for (const r of rungs) {
      const pyFn = pyEntry(r.code.python)
      if (!pyFn) continue
      const cases = spec.cases
      // one process now runs every case, so the budget has to grow with them
      const timeout = 20000 + 5000 * cases.length

      // 1. the oracle, once for the whole rung
      const f = join(dir, `oracle${seq++}.py`)
      writeFileSync(f, pythonDriver(r.code.python, pyFn, cases))
      const oracle = caseLines(
        () => execFileSync(python, [f], { stdio: "pipe", timeout }),
        cases.length
      )
      const want = oracle.lines
      cases.forEach((args, i) => {
        if (want[i].startsWith("!ERROR"))
          failures.push(
            `${p.id}/${r.key} [python] on ${JSON.stringify(args)}: ${want[i]}`
          )
        else ran++
      })

      // 2. each translation, against it — compiled once, launched once
      for (const lang of ["java", "cpp"]) {
        const block = r.code[lang]
        if (!block || !tools[lang]) continue
        const fn = cEntry(block)
        if (!fn) continue
        let got
        try {
          if (lang === "java") {
            const src = join(dir, "Solution.java")
            writeFileSync(
              src,
              javaDriver(NODE_JAVA, block, fn, cases, spec.params)
            )
            execFileSync(tools.java, ["-nowarn", "-d", dir, src], {
              stdio: "pipe",
            })
            compiles++
            got = caseLines(
              () =>
                runExe(
                  join(tools.java, "..", "java.exe"),
                  ["-cp", dir, "Solution"],
                  { stdio: "pipe", timeout }
                ),
              cases.length
            )
          } else {
            // a fresh name per binary: Windows can still hold a lock on the
            // executable it just finished, and reusing one name turns that
            // into an intermittent UNKNOWN spawn error
            const stem = `prog${seq++}`
            const src = join(dir, `${stem}.cpp`)
            const exe = join(dir, `${stem}.exe`)
            writeFileSync(
              src,
              cppDriver(headers, NODE_CPP, block, fn, cases, spec.params)
            )
            execFileSync(tools.cpp, ["-std=c++17", "-w", "-o", exe, src], {
              stdio: "pipe",
            })
            compiles++
            got = caseLines(
              () => runExe(exe, [], { stdio: "pipe", timeout }),
              cases.length
            )
          }
        } catch (e) {
          // a build that fails is one finding about the block, not one per case
          const msg = String(e.stderr ?? e.message ?? e)
          const list = /UNKNOWN|EBUSY|EPERM|ETXTBSY/.test(msg)
            ? unrunnable
            : failures
          list.push(
            `${p.id}/${r.key} [${lang}] would not build: ${msg.slice(-160).replace(/\s+/g, " ")}`
          )
          continue
        }
        // Windows refusing to launch says nothing about the code; keep it out
        // of the findings, and say so in the summary
        if (got.err && /UNKNOWN|EBUSY|EPERM|ETXTBSY/.test(got.err)) {
          unrunnable.push(
            `${p.id}/${r.key} [${lang}]: ${got.err.slice(-120).replace(/\s+/g, " ")}`
          )
          continue
        }
        cases.forEach((args, i) => {
          if (want[i].startsWith("!ERROR")) return // nothing to compare against
          compared++
          const mine = got.lines[i]
          if (mine.startsWith("!ERROR")) {
            failures.push(
              `${p.id}/${r.key} [${lang}] on ${JSON.stringify(args)}: ${mine}`
            )
            return
          }
          if (
            normalise(want[i], spec.unordered) !==
            normalise(mine, spec.unordered)
          )
            failures.push(
              `${p.id}/${r.key} [${lang}] on ${JSON.stringify(args)}: python said ${want[i]}, ${lang} said ${mine}`
            )
        })
      }
    }
  }

  if (!has("--keep")) rmSync(dir, { recursive: true, force: true })
  const skipped = Object.keys(NOT_YET_RUNNABLE).length
  console.log(
    `\n${ran} oracle runs, ${compared} translations compared, ${failures.length} disagreed`
  )
  console.log(
    `${compiles} drivers built — one per block, not one per case (B31)`
  )
  if (unrunnable.length)
    console.log(
      `${unrunnable.length} blocks could not be built or launched (Windows refusing a ` +
        `freshly built exe; these say nothing about the code):`
    )
  for (const u of unrunnable) console.log(`  · ${u}`)
  console.log(`${skipped} problems not yet runnable this way:`)
  for (const [id, why] of Object.entries(NOT_YET_RUNNABLE))
    console.log(`  · ${id} — ${why}`)
  for (const f of failures) console.log(`  ✗ ${f}`)
  process.exitCode = failures.length ? 1 : 0
}

const NODE_JAVA = ""
const NODE_CPP = ""

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main()
