// The debt rules, and the two ways this feature could quietly become a lie.
//
// A page that owes nothing must say nothing (or the band becomes furniture),
// and a page that owes something must name it in the READER's terms — every
// entry has to carry what the reader loses, not what the author skipped.
import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { PROBLEMS } from "../data/index.ts"
import { DEBT_IDS, debtsOf } from "./page-debt.ts"
import type { Problem } from "../data/types.ts"

const complete = (): Problem => {
  const pilot = PROBLEMS.find((p) => p.id === "contains-duplicate")
  assert.ok(pilot, "the pilot problem is missing from the catalogue")
  return pilot
}

describe("page debt", () => {
  // The pilot is the one page that has been taken all the way. If it starts
  // owing something, either it regressed or a new rule was added without the
  // content that satisfies it — both worth failing the build over.
  test("the finished page owes nothing", () => {
    const debts = debtsOf(complete(), { journey: true, explanation: true })
    assert.deepEqual(
      debts.map((d) => d.id),
      [],
      `the pilot page now owes: ${debts.map((d) => d.id).join(", ")}`
    )
  })

  test("an empty record owes every kind of debt it can", () => {
    const bare = {
      ...complete(),
      unlocks: undefined,
      checks: undefined,
      costWhy: undefined,
      arc: undefined,
      reading: undefined,
    } as Problem
    const ids = debtsOf(bare, { journey: false, explanation: false }).map(
      (d) => d.id
    )
    for (const expected of [
      "journey",
      "explanation",
      "unlocks",
      "checks",
      "cost-why",
      "arc",
      "reading",
    ]) {
      assert.ok(ids.includes(expected as never), `no debt reported for ${expected}`)
    }
    // `figures` and `rung-cost-why` are REFINEMENTS: they only apply once the
    // coarser field exists. Reporting both "no bounds explained" and "no bound
    // drawn" on the same page says one gap twice.
    assert.ok(!ids.includes("figures"), "figures reported with no unlocks at all")
    assert.ok(
      !ids.includes("rung-cost-why"),
      "per-rung counts reported with no page-level count at all"
    )
  })

  test("a bound explained but never drawn asks for the drawing", () => {
    const p = {
      ...complete(),
      unlocks: [{ constraint: "1 <= n <= 10^5", what: "rules out O(n²)" }],
    } as Problem
    const ids = debtsOf(p, { journey: true, explanation: true }).map((d) => d.id)
    assert.deepEqual(ids, ["figures"])
  })

  test("every debt says what the READER loses, not what the author skipped", () => {
    const bare = {
      ...complete(),
      unlocks: undefined,
      checks: undefined,
      costWhy: undefined,
      arc: undefined,
      reading: undefined,
    } as Problem
    for (const d of debtsOf(bare, { journey: false, explanation: false })) {
      assert.ok(d.cost.length > 20, `${d.id}: the cost line says nothing`)
      assert.ok(
        !/missing|TODO|not written|author/i.test(d.label),
        `${d.id}: the label is ledger language, not reader language`
      )
      assert.ok(DEBT_IDS.includes(d.id), `${d.id} is not in DEBT_IDS`)
    }
  })

  // The corpus-wide claim the ledger makes, asserted here so a batch that
  // silently drops a field cannot pass while the markdown says otherwise.
  test("every problem in the catalogue can be measured without throwing", () => {
    for (const p of PROBLEMS) {
      const debts = debtsOf(p, { journey: false, explanation: false })
      assert.ok(Array.isArray(debts))
      assert.ok(
        debts.length <= DEBT_IDS.length,
        `${p.id} reported more debts than there are kinds`
      )
    }
  })
})
