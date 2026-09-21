// The rail may never offer a section the page did not draw.
//
// That rule has been stated in a comment since the rail was built and never
// once been tested, because it lived inside an 821-line `.tsx` that
// `node --test` cannot load. It is a plain module now, so here it is.
//
// The failure it guards against is specific and silent: the rail is built from
// one array and the bands from a set of conditions, and when the two drift a
// reader clicks a contents entry and the page does not move. Nothing errors.
import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { PROBLEMS } from "../../data/index.ts"
import { ladderOf } from "../../lib/ladder.ts"
import { pageShapeOf } from "./page-sections.ts"
import type { Explanation } from "../../lib/use-explanation.ts"

const NO_DOC: Explanation = { present: false }

const shapeOf = (id: string, explanation: Explanation = NO_DOC) => {
  const problem = PROBLEMS.find((p) => p.id === id)
  assert.ok(problem, `${id} is not in the catalogue`)
  return {
    problem,
    shape: pageShapeOf({
      problem,
      rungs: ladderOf(problem, undefined, 99).rungs,
      hasJourney: false,
      explanation,
    }),
  }
}

describe("the problem page's shape", () => {
  // The whole corpus, because the rail is built once and rendered on 153
  // pages: a condition that is right for the pilot and wrong for a problem
  // with no checks is exactly the drift this catches.
  test("every section the rail offers is one the page's own conditions draw", () => {
    for (const problem of PROBLEMS) {
      const { shape } = shapeOf(problem.id)
      for (const s of shape.sections) {
        switch (s.id) {
          case "before-you-solve-it":
            assert.ok(
              problem.checks?.length,
              `${problem.id}: the rail offers "before you solve it" with no checks authored`
            )
            break
          case "walkthrough":
            assert.ok(
              problem.walkthrough?.length,
              `${problem.id}: the rail offers a walkthrough the page will not draw`
            )
            break
          case "reading-the-calculations":
            assert.ok(
              shape.calculations,
              `${problem.id}: the rail offers the calculations section with nothing in it`
            )
            break
          case "explanation":
            assert.ok(
              shape.closing?.length,
              `${problem.id}: the rail offers "taking it with you" with nothing left over`
            )
            break
          default:
            break
        }
      }
    }
  })

  test("the two bands every page draws are always offered, and in order", () => {
    for (const problem of PROBLEMS) {
      const ids = shapeOf(problem.id).shape.sections.map((s) => s.id)
      assert.ok(ids.includes("the-problem"), `${problem.id}: no problem band`)
      assert.ok(ids.includes("approaches"), `${problem.id}: no approaches band`)
      assert.ok(
        ids.indexOf("the-problem") < ids.indexOf("approaches"),
        `${problem.id}: the ladder is offered above the statement`
      )
      assert.equal(
        new Set(ids).size,
        ids.length,
        `${problem.id}: the rail offers the same anchor twice`
      )
    }
  })

  // A page with no document must not claim one. `#/learn/<id>` redirects to
  // `?read=explanation`, so an "explanation" anchor with nothing behind it
  // sends a reader to an offset that does not exist.
  test("a problem with no document offers no document sections", () => {
    const { shape } = shapeOf("implement-trie")
    assert.equal(shape.folded, null)
    assert.deepEqual(shape.outline, [])
    assert.ok(!shape.sections.some((s) => s.id === "explanation"))
    assert.equal(shape.closing, undefined)
  })

  // A TYPED document still renders whole, so its own outline is what the rail
  // lists. A folded one is placed through the page, so it must NOT also be
  // listed — that is the "no second list" rule, and it is one boolean away
  // from showing every heading twice.
  test("a typed document keeps its outline; a folded one hands it back", () => {
    const typed: Explanation = {
      present: true,
      ready: true,
      kind: "typed",
      parts: [],
      outline: [{ id: "x", text: "X", level: 2 }],
      scaffold: "",
    }
    const { shape } = shapeOf("implement-trie", typed)
    assert.deepEqual(shape.outline, [{ id: "x", text: "X", level: 2 }])
    assert.equal(shape.folded, null, "a typed document was folded")
  })
})
