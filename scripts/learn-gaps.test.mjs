// A ratchet, not a wall.
//
// 126 of 127 problems are missing sections the spec requires, so a test that
// demanded them all would fail on day one and be switched off by the afternoon
// — which is how a gate becomes decoration. This one records where we are and
// fails only when it gets WORSE: a new document that skips a section, or an
// added rung that never says it is an addition.
//
// The baseline lives here, in code, on purpose. Moving it is a deliberate edit
// that shows up in a diff and has to be explained in a commit message, which is
// exactly the friction a number like this needs.
//
// When you close a gap, lower the number. It should only ever go down.

import assert from "node:assert/strict"
import { test } from "node:test"
import { PROBLEMS } from "../src/data/index.ts"
import { audit } from "./learn-gaps.mjs"

// Measured 2026-09-13. Lower these as documents are written; never raise them
// without saying why in the commit.
const BASELINE = {
  untaught: 46, // problems with no teaching document at all
  calculations: 126, // missing "Reading the Calculations"
  fluent: 126, // missing "How to Get Fluent"
  hood: 126, // missing an "Under the hood" callout
  interview: 46,
  arc: 46,
  comparison: 46,
  undisclosed: 23, // documents adding rungs without saying so
}

const rows = audit()
const missing = (key) => rows.filter((r) => r.missing.includes(key)).length

test("every problem still has a data file the audit can read", () => {
  assert.equal(rows.length, PROBLEMS.length)
})

for (const key of ["calculations", "fluent", "hood", "interview", "arc", "comparison"]) {
  test(`the "${key}" gap does not grow`, () => {
    const now = missing(key)
    assert.ok(
      now <= BASELINE[key],
      `${now} problems are missing "${key}", up from ${BASELINE[key]}. ` +
        `A new document skipped a required section — see docs/deep/TEMPLATE.md.`
    )
  })
}

test("the number of problems with no teaching document does not grow", () => {
  const now = rows.filter((r) => !r.taught).length
  assert.ok(
    now <= BASELINE.untaught,
    `${now} problems have no teaching document, up from ${BASELINE.untaught}`
  )
})

test("no NEW document adds an approach without saying it is an addition", () => {
  const now = rows.filter((r) => r.taught && r.extra > 0 && !r.disclosed)
  assert.ok(
    now.length <= BASELINE.undisclosed,
    `${now.length} documents add rungs without disclosing it, up from ` +
      `${BASELINE.undisclosed}: ${now.map((r) => r.problem.id).join(", ")}. ` +
      `docs/deep/README.md requires an added rung to be labelled.`
  )
})

test("the baseline is honest — it is not set above the real numbers", () => {
  // A ratchet set loose is worse than no ratchet: it passes while the tree
  // rots. Every baseline must be exactly what the tree currently measures.
  const actual = {
    untaught: rows.filter((r) => !r.taught).length,
    calculations: missing("calculations"),
    fluent: missing("fluent"),
    hood: missing("hood"),
    interview: missing("interview"),
    arc: missing("arc"),
    comparison: missing("comparison"),
    undisclosed: rows.filter((r) => r.taught && r.extra > 0 && !r.disclosed).length,
  }
  const slack = Object.entries(BASELINE)
    .filter(([k, v]) => v > actual[k])
    .map(([k, v]) => `${k}: baseline ${v}, actual ${actual[k]}`)
  assert.deepEqual(
    slack,
    [],
    `the baseline is looser than the tree — tighten it:\n  ${slack.join("\n  ")}`
  )
})
