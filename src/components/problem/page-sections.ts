// Which sections a problem page draws, and in what order.
//
// This is the page's SHAPE, decided before a single element is rendered: where
// each half of the teaching document goes, and therefore what the contents
// rail is allowed to offer. It was 110 lines in the middle of an 821-line
// component, which is the one place a rule like "the rail may never name a
// section the page did not draw" cannot be tested — a `.tsx` will not load
// under `node --test`.
//
// Plain `.ts`, no JSX, no hooks, no DOM: `page-sections.test.ts` holds the
// invariant now. Same reason `watchable.ts` and `doc-sections.ts` are plain.
//
// It decides WHAT and WHERE, never how anything looks.
import { foldDoc } from "../../lib/doc-sections.ts"
import type { Folded } from "../../lib/doc-sections.ts"
import BINDINGS from "../../data/rung-bindings.json" with { type: "json" }
import type { Problem } from "../../data/index.ts"
import type { Rung } from "../../lib/ladder.ts"
import type { Explanation } from "../../lib/use-explanation.ts"

/** a heading the contents rail may offer */
export interface RailSection {
  id: string
  text: string
  level: 2
}

/** The explanation state, as this module needs to read it.
 *
 *  Taken straight from the hook's own union rather than re-declared: a looser
 *  local shape ("present: boolean, ready: boolean") does not accept
 *  `{ present: false }`, which is the state every page starts in. */
export type ExplanationState = Explanation

export interface PageShape {
  /** the document split into the half that belongs to the rungs and the rest */
  folded: Folded | null
  understanding?: Folded["sections"][number]
  calculations?: Folded["sections"][number]
  comparison?: Folded["sections"][number]
  extraApproaches?: Folded["sections"]
  /** what the document carries that no band has a better home for */
  closing?: Folded["sections"]
  /** the page's own bands, in render order */
  sections: RailSection[]
  /** a TYPED document still renders whole and keeps its own outline */
  outline: { id: string; text: string; level: 2 | 3 }[]
}

export function pageShapeOf({
  problem,
  rungs,
  hasJourney,
  explanation,
}: {
  problem: Problem
  rungs: Rung[]
  hasJourney: boolean
  explanation: ExplanationState
}): PageShape {
  // ── THE FOLD ──────────────────────────────────────────────────────────
  // The document's per-approach half belongs to the rungs, not to a second
  // pass over the same ladder at the foot of the page. `foldDoc` splits it;
  // the ladder renders `byRung`, and the section below renders what is left.
  //
  // Only the Markdown documents for now. The typed half already stores one
  // file per rung (`src/problems/<id>/approaches/<rung>.ts`), so folding that
  // is a field read rather than a parse — a different branch.
  const binding = (BINDINGS as Record<string, (string | null)[]>)[problem.id]
  const folded =
    explanation.present &&
    explanation.ready &&
    explanation.kind === "markdown" &&
    binding
      ? foldDoc(
          explanation.blocks,
          binding,
          // a rung whose costWhy is authored already says where its bound comes
          // from; one without it must keep the document's own account
          new Set(rungs.filter((r) => r.costWhy).map((r) => r.key)),
          // the page draws every bound as a card with a figure, so the
          // document's own constraints table is the same content twice
          (problem.unlocks?.length ?? 0) > 0,
          // and the ladder closes on `arc`, so the document's own arc section
          // is the same job in more words — it folds under that line instead
          Boolean(problem.arc)
        )
      : null

  /**
   * One section of the document, by the heading it was written under — so the
   * page can put it beside the thing it is about.
   *
   * Matching on the TITLE rather than an index: a document that gains a section
   * should not silently shift every other one into the wrong place, and one
   * that is missing a section should render nothing rather than its neighbour.
   */
  const docSection = (re: RegExp) =>
    folded?.sections.find((x) => re.test(x.title.trim()))
  const placed = new Set<string>()
  const take = (re: RegExp) => {
    const hit = docSection(re)
    if (hit) placed.add(hit.title)
    return hit
  }
  const understanding = take(/^understanding the problem$/i)
  const calculations = take(/^reading the calculations$/i)
  const comparison = take(/^comparison$/i)
  const extraApproaches = folded?.sections.filter((x) => {
    const isApproach = /^approach(\s|$)/i.test(x.title.trim())
    if (isApproach) placed.add(x.title)
    return isApproach
  })
  // whatever the document carries that this page has no better home for — the
  // interview script, the fluency drills, the runnable script
  const closing = folded?.sections.filter(
    (x) => x.title && !placed.has(x.title)
  )

  // The page's OWN sections, in the order it renders them — the same
  // conditions, so the rail can never offer a section the page did not draw.
  // It used to list only the document's headings, which need a fetch, so the
  // right column stood empty on arrival and filled only once the reader opened
  // the long read: 317px of dead width on the page's most common state.
  const sections: RailSection[] = [
    { id: "the-problem", text: "The problem", level: 2 },
    ...(problem.checks?.length
      ? [
          {
            id: "before-you-solve-it",
            text: "Before you solve it",
            level: 2 as const,
          },
        ]
      : []),
    { id: "hints", text: "Hints", level: 2 },
    ...(hasJourney || problem.walkthrough
      ? [{ id: "walkthrough", text: "Walkthrough", level: 2 as const }]
      : []),
    ...(calculations
      ? [
          {
            id: "reading-the-calculations",
            text: "Reading the calculations",
            level: 2 as const,
          },
        ]
      : []),
    { id: "approaches", text: "Approaches", level: 2 },
    // NOT "the same move, elsewhere". This rail only exists from xl, and from
    // xl that section is `xl:hidden` because the rail carries the list itself —
    // so an entry here would offer a jump to something invisible. The rail may
    // never name a section the page did not draw.
    ...(closing?.length
      ? [{ id: "explanation", text: "Taking it with you", level: 2 as const }]
      : []),
  ]

  // the rail lists what the SECTION renders, which is now the shared half
  // NO second list. The document's sections used to be a rail group of their
  // own because they all lived behind one door; they are placed through the
  // page now, so `sections` above already names every heading a reader can
  // jump to. A typed document still has its own outline, because it still
  // renders whole.
  const outline =
    folded || !explanation.present || !explanation.ready
      ? []
      : explanation.outline

  return {
    folded,
    understanding,
    calculations,
    comparison,
    extraApproaches,
    closing,
    sections,
    outline,
  }
}
