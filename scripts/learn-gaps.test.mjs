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

// Measured 2026-09-13, tightened 2026-09-14 when the first document was
// converted to `src/content/`. Lower these as documents are written or
// converted; never raise them without saying why in the commit.
//
// A CONVERTED document is counted as taught with no missing sections, and that
// is not a loophole: the sections it used to be graded on by grepping headings
// are fields of a type, and `src/content/content.test.ts` fails the build when
// one is absent or a stub. The grep could only produce a number; the type
// produces an error. Three of these moved by one on the day of the first
// conversion, and this ratchet is what noticed.
const BASELINE = {
  untaught: 45, // problems with no teaching document at all
  calculations: 116, // missing "Reading the Calculations"
  fluent: 116, // missing "How to Get Fluent"
  hood: 116, // missing an "Under the hood" callout
  interview: 45,
  arc: 45,
  comparison: 45,
  undisclosed: 0, // documents adding rungs without saying so — cleared 2026-09-13
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

test("no document adds an approach without saying it is an addition", () => {
  // This one is at zero, so it is a real gate rather than a ratchet: 45 of 81
  // documents teach a rung the data file lacks, and every one of them now says
  // so. The next document that does not will fail here.
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
