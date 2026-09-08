// Task: give every practice-set approach its Java and C++ block, translated
// from the Python that is already there (docs/PROBLEMS.md, cross-cutting item).
//
// Why this task is safe to hand to a local model: it is a translation with a
// fixed shape, and every property that matters is machine-checkable — the
// signature, the brace balance, the absence of markdown, the control-flow
// shape against the Python it came from. What is NOT checkable here is
// execution: this machine has no javac or g++, so the last line of defence is
// cross-model agreement plus a human read. Both are wired in below.
//
// Run:  node scripts/localsmith/codegen.mjs --list
//       node scripts/localsmith/codegen.mjs --id best-trade
//       node scripts/localsmith/codegen.mjs --all --limit 5

import { writeFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { PROBLEMS } from "../../src/data/index.ts"
import { ENDPOINTS, completeJson } from "./client.mjs"

const arg = (k, d) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? (process.argv[i + 1] ?? true) : d
}
const has = (k) => process.argv.includes(k)

const PRIMARY = {
  base: arg("--base", ENDPOINTS.lmstudio),
  model: arg("--model", "openai/gpt-oss-20b"),
}
// the second opinion: a different model, ideally a different family
const SECOND = {
  base: arg("--base2", ENDPOINTS.ollama),
  model: arg("--model2", "qwen2.5-coder:14b"),
}

// ---------- the house style, shown rather than described ----------

const SHOTS = `EXAMPLE 1
python:
def pair_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []
java:
public int[] pairSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (seen.containsKey(need)) return new int[]{seen.get(need), i};
        seen.put(nums[i], i);
    }
    return new int[0];
}
cpp:
vector<int> pairSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        auto it = seen.find(target - nums[i]);
        if (it != seen.end()) return {it->second, i};
        seen[nums[i]] = i;
    }
    return {};
}

EXAMPLE 2
python:
def max_area(heights: list[int]) -> int:
    i, j = 0, len(heights) - 1
    best = 0
    while i < j:
        best = max(best, (j - i) * min(heights[i], heights[j]))
        if heights[i] < heights[j]:
            i += 1
        else:
            j -= 1
    return best
java:
public int maxArea(int[] h) {
    int i = 0, j = h.length - 1, best = 0;
    while (i < j) {
        best = Math.max(best, (j - i) * Math.min(h[i], h[j]));
        if (h[i] < h[j]) i++;
        else j--;
    }
    return best;
}
cpp:
int maxArea(const vector<int>& h) {
    int i = 0, j = (int)h.size() - 1, best = 0;
    while (i < j) {
        best = max(best, (j - i) * min(h[i], h[j]));
        if (h[i] < h[j]) i++;
        else j--;
    }
    return best;
}`

const RULES = `RULES, all mandatory:
- One free function per language, exactly as in the examples: Java is a "public" method, C++ takes containers by const reference. No class wrapper, no imports, no "using namespace", no main().
- Same algorithm as the Python, step for step. Do NOT improve it, do NOT change its complexity: a deliberately naive version must stay naive.
- No comments. No markdown fences. No prose.
- Java uses Math.max/Math.min; C++ uses max/min and (int) casts on .size().
- Return the empty result the way the examples do.
- Output STRICT JSON only: {"java": "...", "cpp": "..."} with real newlines escaped as \\n.`

// ---------- machine-checkable gates ----------

const LOOKS = {
  java: /^\s*(public|private|static).*\(.*\)\s*\{/m,
  cpp: /^\s*[\w:<>,\s&*]+\s+\w+\(.*\)\s*\{/m,
}

const balanced = (s) => {
  let d = 0
  for (const c of s) {
    if (c === "{") d++
    if (c === "}") d--
    if (d < 0) return false
  }
  return d === 0
}

// control-flow fingerprint: how many loops, ifs, returns. A translation that
// changes the shape of the algorithm changes this, and that is the closest
// thing to a semantic check available without a compiler.
export function shape(src, lang) {
  const loops =
    lang === "python"
      ? (src.match(/^\s*(for|while)\b/gm) || []).length
      : (src.match(/\b(for|while)\s*\(/g) || []).length
  const ifs =
    lang === "python"
      ? (src.match(/^\s*(if|elif)\b/gm) || []).length
      : (src.match(/\bif\s*\(/g) || []).length
  const returns = (src.match(/\breturn\b/g) || []).length
  return { loops, ifs, returns }
}

// Python compresses: Counter(), a comprehension and set() are all loops the
// C-family has to write out. So the translation may ADD loops and branches —
// what it must never do is DROP one, because that is how a deliberately naive
// rung silently becomes a faster algorithm than the one being taught.
const noStepLost = (py, out) =>
  out.loops >= py.loops &&
  out.ifs >= py.ifs &&
  Math.abs(out.returns - py.returns) <= 1

// two translations of the same Python should model it the same way; this one
// is symmetric, because neither model is the reference
const sameShape = (a, b) =>
  a.loops === b.loops && a.ifs === b.ifs && Math.abs(a.returns - b.returns) <= 1

export function gate(out, python) {
  const problems = []
  for (const lang of ["java", "cpp"]) {
    const src = out[lang]
    if (typeof src !== "string" || !src.trim()) {
      problems.push(`${lang}: empty`)
      continue
    }
    if (/```|^\s*(Here|This|The)\b/m.test(src))
      problems.push(`${lang}: prose or fences`)
    if (!LOOKS[lang].test(src))
      problems.push(`${lang}: does not open with a function signature`)
    if (!balanced(src)) problems.push(`${lang}: unbalanced braces`)
    if (/\bimport\b|#include|using namespace|static void main/.test(src))
      problems.push(`${lang}: imports or main()`)
    if (/\/\/|\/\*/.test(src)) problems.push(`${lang}: contains comments`)
    const s = shape(src, lang)
    const p = shape(python, "python")
    if (!noStepLost(p, s))
      problems.push(
        `${lang}: a step of the Python is missing (python ${p.loops}L/${p.ifs}I/${p.returns}R vs ${s.loops}L/${s.ifs}I/${s.returns}R — the translation may add loops, never drop them)`
      )
  }
  return problems.length ? problems.join("; ") : null
}

// ---------- generation ----------

const promptFor = (name, python) =>
  `Translate this Python into Java and C++ for a DSA teaching app.\n\n${SHOTS}\n\n${RULES}\n\nAPPROACH NAME: ${name}\npython:\n${python}`

async function translate(server, name, python) {
  return completeJson(
    {
      ...server,
      prompt: promptFor(name, python),
      temperature: 0.1,
      maxTokens: 1400,
    },
    (v) => gate(v, python)
  )
}

/** every approach on a problem that still lacks java or cpp */
export function pending(p) {
  const rungs = [
    { key: "optimal", name: p.approach.slice(0, 40), code: p },
    ...(p.alternatives ?? []).map((a) => ({
      key: a.name,
      name: a.name,
      code: a,
    })),
  ]
  return rungs.filter((r) => !r.code.java || !r.code.cpp)
}

async function main() {
  const targets = has("--all")
    ? PROBLEMS
    : PROBLEMS.filter((p) => p.id === arg("--id"))
  if (has("--list")) {
    let total = 0
    for (const p of PROBLEMS) {
      const n = pending(p).length
      total += n
      if (n) console.log(`${p.id.padEnd(26)} ${n} rung(s)`)
    }
    console.log(`\n${total} blocks pending across the practice set`)
    return
  }
  const limit = Number(arg("--limit", 999))
  const out = {}
  let done = 0
  let tokens = 0
  let inTokens = 0
  let outTokens = 0
  const t0 = Date.now()
  for (const p of targets) {
    const rungs = pending(p)
    if (!rungs.length) continue
    out[p.id] = {}
    for (const r of rungs) {
      if (done >= limit) break
      const py = r.code.python
      process.stdout.write(`${p.id} / ${r.key} … `)
      try {
        const a = await translate(PRIMARY, r.name, py)
        tokens += a.tokens
        inTokens += a.inTokens ?? 0
        outTokens += a.outTokens ?? 0
        // the second opinion: same task, different model. Agreement on the
        // control-flow fingerprint is the only automatic semantic signal
        // available without a compiler, so disagreement is surfaced, never hidden.
        let agree = "unchecked"
        if (!has("--no-second")) {
          try {
            const b = await translate(SECOND, r.name, py)
            tokens += b.tokens
            inTokens += b.inTokens ?? 0
            outTokens += b.outTokens ?? 0
            const fa = shape(a.value.java, "java")
            const fb = shape(b.value.java, "java")
            agree = sameShape(fa, fb)
              ? "agree"
              : `DISAGREE ${JSON.stringify(fa)} vs ${JSON.stringify(fb)}`
          } catch (e) {
            agree = `second model failed: ${e.message.slice(0, 60)}`
          }
        }
        out[p.id][r.key] = { ...a.value, agree, attempts: a.attempts }
        console.log(`ok (${a.attempts} try, ${agree})`)
        done++
      } catch (e) {
        console.log(`FAILED ${e.message.slice(0, 120)}`)
        out[p.id][r.key] = { error: e.message }
      }
    }
  }
  const file = arg("--out", "scripts/localsmith/out/codegen.json")
  writeFileSync(file, JSON.stringify(out, null, 2))
  console.log(
    `\n${done} blocks in ${((Date.now() - t0) / 1000).toFixed(0)}s → ${file}
local tokens: ${inTokens} in + ${outTokens} out = ${inTokens + outTokens}${done ? ` (${Math.round((inTokens + outTokens) / done)} per block)` : ""}`
  )
}

// Windows: a bare `file://` + path never equals import.meta.url (drive
// letters take three slashes), so build the URL properly.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main()
