// The manifests are generated and committed, which is the arrangement B72 had
// to undo on `docs/learn`. It is allowed here on one condition: this test
// rebuilds them from the records in memory and fails if the checked-in copies
// disagree.
//
// A committed derivative with a drift test is a cache. A committed derivative
// without one is a second source of truth, and this session spent its day
// removing those.

import assert from "node:assert/strict"
import { test } from "node:test"
import { PROBLEMS, PATTERNS } from "./index.ts"
import { CATALOGUE, cardOf, cardsOfPattern } from "./manifest.ts"
import { JOURNEYS } from "../engine/index.ts"
import { JOURNEY_CARDS, cardBySlug, cardForProblem } from "../engine/manifest.ts"

test("manifest: every problem has a card, and it matches the record", () => {
  assert.equal(
    CATALOGUE.length,
    PROBLEMS.length,
    `${CATALOGUE.length} cards for ${PROBLEMS.length} problems — run node scripts/gen-manifest.mjs`
  )
  for (const p of PROBLEMS) {
    const card = cardOf(p.id)
    assert.ok(card, `${p.id}: no card — run node scripts/gen-manifest.mjs`)
    assert.deepEqual(
      card,
      {
        id: p.id,
        title: p.title,
        pattern: p.pattern,
        difficulty: p.difficulty,
        brief: p.brief,
        leetcode: p.leetcode,
      },
      `${p.id}: the card has drifted from the record`
    )
  }
})

test("manifest: every journey has a card, and it matches the registry", () => {
  assert.equal(
    JOURNEY_CARDS.length,
    JOURNEYS.length,
    `${JOURNEY_CARDS.length} cards for ${JOURNEYS.length} journeys — run node scripts/gen-manifest.mjs`
  )
  for (const j of JOURNEYS) {
    const card = cardBySlug(j.slug)
    assert.ok(card, `${j.slug}: no card — run node scripts/gen-manifest.mjs`)
    assert.equal(card.title, j.title, `${j.slug}: title drifted`)
    assert.equal(card.problemId, j.problemId, `${j.slug}: problemId drifted`)
    // the count is what `lib/disclosure.ts` compares the ledger against, so a
    // wrong one silently un-masks a pattern mid-journey or masks it forever
    assert.equal(
      card.acts.length,
      j.acts.length,
      `${j.slug}: act count drifted — the disclosure mask reads this`
    )
    assert.deepEqual(
      card.acts.map((a) => a.key),
      j.acts.map((a) => a.key),
      `${j.slug}: act keys drifted — home's dock deep-links by key`
    )
    assert.deepEqual(
      card.reveals,
      j.reveals ?? [],
      `${j.slug}: reveals drifted — this decides which pattern names are withheld`
    )
  }
})

test("manifest: the lookups agree with the records they stand in for", () => {
  for (const pattern of PATTERNS) {
    const cards = cardsOfPattern(pattern.id).map((c) => c.id)
    const real = PROBLEMS.filter((p) => p.pattern === pattern.id).map((p) => p.id)
    assert.deepEqual(cards, real, `${pattern.id}: the pattern's problems drifted`)
  }
  for (const j of JOURNEYS)
    assert.equal(
      cardForProblem(j.problemId)?.slug,
      JOURNEYS.find((x) => x.problemId === j.problemId)?.slug,
      `${j.problemId}: journey lookup drifted`
    )
})

// The point of the manifest is that it is SMALL. If it ever grows a field that
// belongs to a route — a statement, a hint, a code block — the first load pays
// for it on every problem at once, which is the thing being fixed.
test("manifest: a card carries no field that belongs to a route", () => {
  // the journey card is allowed act LABELS and nothing heavier
  for (const j of JOURNEY_CARDS)
    for (const a of j.acts)
      assert.deepEqual(
        Object.keys(a).sort(),
        ["key", "name", "short"],
        `${j.slug}: an act card grew a field — the act itself belongs to its route`
      )

  const allowed = new Set([
    "id",
    "title",
    "pattern",
    "difficulty",
    "brief",
    "leetcode",
  ])
  for (const card of CATALOGUE)
    for (const key of Object.keys(card))
      assert.ok(
        allowed.has(key),
        `the catalogue grew "${key}" — that field belongs to the problem page, ` +
          `and putting it here costs the first load 127 copies of it`
      )
  const big = CATALOGUE.filter((c) => JSON.stringify(c).length > 400)
  assert.deepEqual(
    big.map((c) => c.id),
    [],
    "a card is over 400 bytes — something route-sized is being carried"
  )
})
