// Second-opinion pass: re-translate every generated block with a DIFFERENT
// model and record whether the two modelled the same Python the same way.
//
// Split out from codegen.mjs because running the two models on two servers at
// once made them fight over one GPU — 200s a block instead of 30. Sequential
// passes against the same LM Studio instance let it manage its own VRAM.
//
// Run:  node scripts/localsmith/review.mjs --in scripts/localsmith/out/codegen-all.json
//       node scripts/localsmith/review.mjs --in ... --model2 qwen/qwen3.5-9b

import { readFileSync, writeFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { PROBLEMS } from "../../src/data/index.ts"
import { ENDPOINTS, completeJson } from "./client.mjs"
import { gate, shape } from "./codegen.mjs"

const arg = (k, d) => {
  const i = process.argv.indexOf(k)
  return i > -1 ? (process.argv[i + 1] ?? true) : d
}

const SECOND = {
  base: arg("--base2", ENDPOINTS.lmstudio),
  model: arg("--model2", "qwen/qwen3.5-9b"),
}

const rungOf = (p, key) =>
  key === "optimal" ? p : (p.alternatives ?? []).find((a) => a.name === key)

// deliberately terser than the author's prompt: a second opinion that is given
// the same few-shot examples tends to reproduce the same answer, which would
// make agreement meaningless
const prompt = (python) =>
  `Translate this Python function into Java and C++.
Keep the SAME algorithm and the same complexity — do not improve it.
One free function per language, no class, no imports, no main, no comments, no markdown.
Output strict JSON only: {"java": "...", "cpp": "..."}

${python}`

async function main() {
  const file = arg("--in", "scripts/localsmith/out/codegen-all.json")
  const gen = JSON.parse(readFileSync(file, "utf8"))
  let checked = 0
  let flagged = 0
  const t0 = Date.now()

  for (const [id, rungs] of Object.entries(gen)) {
    const p = PROBLEMS.find((x) => x.id === id)
    for (const [key, out] of Object.entries(rungs)) {
      if (out.error) continue
      const rung = rungOf(p, key)
      if (!rung) continue
      process.stdout.write(`${id} / ${key} … `)
      try {
        const b = await completeJson(
          {
            ...SECOND,
            prompt: prompt(rung.python),
            temperature: 0.1,
            maxTokens: 1400,
          },
          (v) => gate(v, rung.python)
        )
        const fa = shape(out.java, "java")
        const fb = shape(b.value.java, "java")
        const same =
          fa.ifs === fb.ifs && Math.abs(fa.loops - fb.loops) <= 1
        out.agree = same
          ? "agree"
          : `DISAGREE ${JSON.stringify(fa)} vs ${JSON.stringify(fb)}`
        out.second = b.value.java
        if (!same) flagged++
        console.log(same ? "agree" : "DISAGREE")
      } catch (e) {
        out.agree = `second model failed: ${e.message.slice(0, 60)}`
        console.log("second model failed")
      }
      checked++
    }
  }
  writeFileSync(file, JSON.stringify(gen, null, 2))
  console.log(
    `\n${checked} checked, ${flagged} flagged for review, ${((Date.now() - t0) / 1000).toFixed(0)}s → ${file}`
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main()
