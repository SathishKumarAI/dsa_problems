// The check for lib/notation.ts. Every line here is a REAL constraint from
// src/data/problems — including the hybrids, which are the only reason this
// splits per run rather than per line.
import assert from "node:assert/strict"
import { test } from "node:test"
import { runsOf } from "./notation.ts"
import { PROBLEMS } from "../data/index.ts"

/** the line rebuilt from its runs — the only invariant that really matters */
const rejoin = (line: string) =>
  runsOf(line)
    .map((r) => r.text)
    .join("")

const mono = (line: string) =>
  runsOf(line)
    .filter((r) => r.mono)
    .map((r) => r.text.trim())
    .join(" | ")

const prose = (line: string) =>
  runsOf(line)
    .filter((r) => !r.mono)
    .map((r) => r.text.trim())
    .filter(Boolean)
    .join(" ")

test("no constraint in the corpus loses a character to the split", () => {
  for (const p of PROBLEMS)
    for (const c of p.constraints)
      assert.equal(rejoin(c), c, `${p.id}: the runs do not rebuild the line`)
})

test("a pure bound is all notation", () => {
  for (const line of [
    "1 <= nums.length <= 10^5",
    "-10^9 <= nums[i] <= 10^9",
    "2 <= nums.length <= 10^4",
  ])
    assert.equal(prose(line), "", `${line}: expected no prose`)
})

test("a pure sentence keeps the reading face", () => {
  for (const line of [
    "a single element cannot repeat, so a one-element array is always false",
    "the answer is unique — no tie spans the k-th place",
    "duplicates are allowed and do not lengthen a run",
  ])
    assert.equal(mono(line), "", `${line}: expected no mono`)
})

test("a hybrid splits at the boundary, bound in mono and the rest in English", () => {
  const line = "1 <= nums[i] <= n — every value is a legal index of the array"
  assert.equal(mono(line), "1 <= nums[i] <= n")
  assert.match(prose(line), /^— every value is a legal index of the array$/)
})

test("a trailing clause after a bound stays English", () => {
  const line = "0 <= words[i].length <= 100, lowercase English letters"
  assert.equal(mono(line), "0 <= words[i].length <= 100,")
  assert.equal(prose(line), "lowercase English letters")
})

test("a bare name is notation beside a comparison and a word without one", () => {
  // `n` is the bound's right-hand side here
  assert.match(mono("1 <= k <= n"), /\bn\b/)
  // …and a word here, with no comparison anywhere near it
  assert.equal(mono("s and t consist of lowercase English letters"), "")
})

test("the whole corpus classifies without swallowing sentences", () => {
  let allMono = 0
  let allProse = 0
  let hybrid = 0
  for (const p of PROBLEMS)
    for (const c of p.constraints) {
      const runs = runsOf(c)
      const m = runs.some((r) => r.mono)
      const s = runs.some((r) => !r.mono && r.text.trim())
      if (m && s) hybrid++
      else if (m) allMono++
      else allProse++
    }
  // the counts are pinned so a change to the rule has to be looked at rather
  // than merely re-run: measured 2026-09-15 over 668 lines
  assert.ok(allMono > 120, `only ${allMono} lines read as pure notation`)
  assert.ok(allProse > 300, `only ${allProse} lines read as pure prose`)
  assert.ok(hybrid > 40, `only ${hybrid} hybrids — the rule stopped splitting`)
})
