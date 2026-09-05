// Content gate for the practice set: ids unique and pattern-valid, every code
// block is a function, and a problem that has a journey carries Java and C++
// beside Python for the optimal approach and every alternative (the
// three-language rule in docs/PROBLEMS.md). Run: npm test

import assert from "node:assert/strict"
import { test } from "node:test"
import { JOURNEYS } from "../engine/index.ts"
import { PATTERNS, PROBLEMS } from "./index.ts"
import type { Code } from "./types.ts"

const looksLikeFunction = {
  python: /^(from |import |def |class )/m,
  java: /^\s*(public|private|static).*\(.*\)\s*\{/m,
  cpp: /^\s*[\w:<>,\s&*]+\s+\w+\(.*\)\s*\{/m,
}

function checkCode(where: string, code: Code, langs: (keyof Code)[]) {
  for (const lang of langs) {
    const src = code[lang]
    assert.ok(src && src.trim().length > 0, `${where}: ${lang} missing`)
    assert.ok(
      looksLikeFunction[lang].test(src),
      `${where}: ${lang} does not look like a function`
    )
  }
}

test("problems: ids unique, patterns exist", () => {
  const ids = PROBLEMS.map((p) => p.id)
  assert.equal(new Set(ids).size, ids.length)
  const patterns = new Set(PATTERNS.map((p) => p.id))
  for (const p of PROBLEMS) assert.ok(patterns.has(p.pattern), p.id)
})

test("problems: every Python block is a function; alternatives are worst → best", () => {
  for (const p of PROBLEMS) {
    checkCode(p.id, p, ["python"])
    for (const a of p.alternatives ?? [])
      checkCode(`${p.id}/${a.name}`, a, ["python"])
  }
})

test("journeys: every revealed pattern id exists, and covers the journey's own pattern", () => {
  const patterns = new Set(PATTERNS.map((p) => p.id))
  for (const j of JOURNEYS) {
    for (const id of j.reveals ?? [])
      assert.ok(patterns.has(id), `${j.slug} reveals unknown pattern "${id}"`)
    // the pattern its own problem sits under is the one the recap names, so
    // leaving it out would leak that name in the catalogue while the journey
    // is midway through teaching it
    const own = PROBLEMS.find((p) => p.id === j.problemId)?.pattern
    if (own)
      assert.ok(
        (j.reveals ?? []).includes(own),
        `${j.slug} does not mask its own pattern "${own}"`
      )
  }
})

test("problems: a journeyed problem has no hand-written walkthrough (one source of truth)", () => {
  const journeyed = new Set(JOURNEYS.map((j) => j.problemId))
  for (const p of PROBLEMS)
    if (journeyed.has(p.id))
      assert.equal(
        p.walkthrough,
        undefined,
        `${p.id} has both a journey and a static walkthrough — they drift (B1)`
      )
    else
      assert.ok(p.walkthrough?.length, `${p.id} has no walkthrough at all`)
})

test("problems: journeyed problems carry Java and C++ for every approach", () => {
  const journeyed = new Set(JOURNEYS.map((j) => j.problemId))
  assert.ok(journeyed.size >= 2)
  for (const p of PROBLEMS) {
    if (!journeyed.has(p.id)) continue
    checkCode(p.id, p, ["python", "java", "cpp"])
    for (const a of p.alternatives ?? [])
      checkCode(`${p.id}/${a.name}`, a, ["python", "java", "cpp"])
  }
})
