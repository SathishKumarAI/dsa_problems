// Content gate for the practice set: ids unique and pattern-valid, every code
// block is a function, and a problem that has a journey carries Java and C++
// beside Python for the optimal approach and every alternative (the
// three-language rule in docs/PROBLEMS.md). Run: npm test

import assert from "node:assert/strict"
import { test } from "node:test"
import { JOURNEYS } from "../engine/index.ts"
import { PATTERNS, PROBLEMS } from "./index.ts"
import { ladderOf } from "../lib/ladder.ts"
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

test("problems: every problem states its constraints, in our own words", () => {
  for (const p of PROBLEMS) {
    assert.ok(
      p.constraints.length >= 2,
      `${p.id}: at least two constraints — the bounds and what the input promises`
    )
    for (const c of p.constraints) {
      assert.ok(c.trim().length > 0, `${p.id}: an empty constraint`)
      assert.ok(
        !/^constraints?:/i.test(c.trim()),
        `${p.id}: "${c}" repeats the heading the UI already draws`
      )
    }
  }
})

test("problems: the approach ladder is well-formed, worst → best", () => {
  for (const p of PROBLEMS) {
    // the ladder a learner who has never opened the journey sees
    const journey = JOURNEYS.find((j) => j.problemId === p.id)
    const { rungs } = ladderOf(p, journey, Number.MAX_SAFE_INTEGER)
    assert.ok(rungs.length >= 1, `${p.id}: no rungs`)
    assert.equal(rungs[0].whyNow, undefined, `${p.id}: the first rung has nothing before it`)
    // the bar is presence, not length: an authored rung writes a sentence or
    // two, while a journey act's `insight` is a deliberately short question
    // ("The map costs memory — what if the drawer organized itself?")
    for (const r of rungs.slice(1))
      assert.ok(
        (r.whyNow ?? "").length > 25,
        `${p.id}/${r.name}: a rung needs the weakness in the one below it`
      )
    for (const r of rungs) {
      assert.ok(r.name.trim(), `${p.id}: a rung with no name`)
      assert.ok(/O\(/.test(r.cost), `${p.id}/${r.name}: cost does not read as a complexity`)
      assert.ok(r.idea.trim().length > 40, `${p.id}/${r.name}: the idea needs a sentence or two`)
      assert.ok(r.code.python.trim(), `${p.id}/${r.name}: no Python`)
    }
  }
})

test("problems: every LeetCode slug is a slug, and unique", () => {
  const slugs = PROBLEMS.map((p) => p.leetcode)
  for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/, `bad slug "${s}"`)
  assert.equal(new Set(slugs).size, slugs.length, "two problems point at one LeetCode page")
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

// Java and C++ are optional until a problem has a journey, but the moment a
// block exists it is held to the same bar as a hand-written one — it must open
// with a function signature, balance its braces, and carry no imports, no
// main() and no explanatory prose. This is what makes a generated translation
// safe to accept: nothing about it is taken on trust.
test("problems: any Java or C++ block present is well-formed", () => {
  const balanced = (src: string) => {
    let d = 0
    for (const c of src) {
      if (c === "{") d++
      if (c === "}") d--
      if (d < 0) return false
    }
    return d === 0
  }
  for (const p of PROBLEMS) {
    const rungs = [
      { where: p.id, code: p },
      ...(p.alternatives ?? []).map((a) => ({
        where: `${p.id}/${a.name}`,
        code: a,
      })),
    ]
    for (const { where, code } of rungs)
      for (const lang of ["java", "cpp"] as const) {
        const src = code[lang]
        if (!src) continue
        checkCode(where, code, [lang])
        assert.ok(balanced(src), `${where}: ${lang} braces do not balance`)
        assert.ok(
          !/\bimport\b|#include|using namespace|static void main/.test(src),
          `${where}: ${lang} carries imports or a main()`
        )
        assert.ok(
          !/```/.test(src),
          `${where}: ${lang} contains a markdown fence`
        )
        assert.ok(
          src.split("\n").length >= 3,
          `${where}: ${lang} is too short to be a function`
        )
      }
  }
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

// B45. The journey's own disclosure gate checks ACT prose against later ACT
// names. Nothing checked what the PROBLEM PAGE renders, which is a different
// question: `ladderOf` picks the rungs, from the journey when there is one and
// from `alternatives` when there is not, and it is the picker that has to hold
// the line. Measured 2026-09-09 with the ledger at 2: the ladder was already
// capped correctly — the leak was the pattern NAME in the page header, which
// the catalogue has masked since B8 and this page did not.
test("problems: the ladder never shows a rung the ledger has not earned", () => {
  for (const j of JOURNEYS) {
    const p = PROBLEMS.find((x) => x.id === j.problemId)
    if (!p) continue
    // a learner one act in: everything from act 2 on is unearned
    const { rungs, capped, hidden } = ladderOf(p, j, 2)
    const later = j.acts.slice(2).map((a) => a.name.toLowerCase())
    for (const r of rungs)
      assert.ok(
        !later.includes(r.name.toLowerCase()),
        `${p.id}: the ladder shows "${r.name}", which is act ${j.acts.findIndex((a) => a.name === r.name)} and not yet earned`
      )
    if (j.acts.length > 2) {
      assert.equal(capped, true, `${p.id}: a mid-flight ladder must say it is capped`)
      assert.ok(hidden > 0, `${p.id}: capped, but claims to hide nothing`)
    }
  }
})

test("problems: a finished journey shows the whole ladder", () => {
  for (const j of JOURNEYS) {
    const p = PROBLEMS.find((x) => x.id === j.problemId)
    if (!p) continue
    const { capped, hidden } = ladderOf(p, j, j.acts.length)
    assert.equal(capped, false, `${p.id}: finished and still capped`)
    assert.equal(hidden, 0, `${p.id}: finished and still hiding ${hidden}`)
  }
})

// B36. The harness supplies `import java.util.*` and `using namespace std;`,
// so a block that writes `java.util.HashMap` or `std::vector` is teaching a
// second style in the same tab strip for no reason — and the reader cannot
// tell which one the judge wants. 62 uses across 12 files on 2026-09-09,
// removed; this keeps them gone. What the SCAFFOLDING supplies is in one
// place (scripts/localsmith/verify.mjs), and the blocks stay bare.
test("problems: no block qualifies what the scaffolding already imports", () => {
  const banned = [
    ["java", "java.util."],
    ["cpp", "std::"],
  ] as const
  for (const p of PROBLEMS) {
    const rungs = [
      ["optimal", p] as const,
      ...(p.alternatives ?? []).map((a) => [a.name, a] as const),
    ]
    for (const [key, code] of rungs)
      for (const [lang, prefix] of banned) {
        const src = code[lang]
        if (!src) continue
        assert.ok(
          !src.includes(prefix),
          `${p.id}/${key} [${lang}]: writes "${prefix}", which the harness already imports`
        )
      }
  }
})
