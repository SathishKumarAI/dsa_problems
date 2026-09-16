// Splitting a teaching document into the parts that belong to ONE RUNG and the
// parts that belong to the problem.
//
// Why this exists. The page showed the ladder — name, cost, summary, code — and
// then the document said all of it again, one `## Approach` section per rung.
// Measured on `contains-duplicate`: 7,807 words, of which **4,222 (54%)** are
// per-approach and three of every approach's six subsections are the same
// content as the rung above them. A reader was being asked to read the same
// three approaches twice, in two different shapes.
//
// What this file decides: which blocks go inside which rung, and which stay in
// a section of their own. It decides nothing about markup and runs no fetch.
//
// WHAT IT DOES NOT DO: it does not guess which rung a heading means. "Approach
// 4 — A set with an early exit (optimal)" is the rung `set` because a human
// said so in `src/data/rung-bindings.json`, which already existed for exactly
// this judgement — the converter reads the same file. A heading-to-key match
// would be a name match, and this repo's own rule is that two things with the
// same name are often two different things.
import type { Block } from "@/lib/markdown"

/** the three subsections of an approach that the RUNG already renders */
const RUNG_ALREADY_SHOWS = {
  /** the rung's `summary` / the act's `idea` */
  "The idea": "idea",
  /** the rung's code block, in up to three languages */
  Code: "code",
  /** the rung's `costWhy` disclosure — only when one is authored */
  "Complexity and when to use this": "cost",
} as const

/** the one `###` inside the shared half that the PAGE renders better */
const CONSTRAINTS_HEADING = "The constraints, and what each one unlocks"

/** the `##` that says the same thing as the ladder's own arc line */
const ARC_HEADING = /^the overall arc$/i

export interface Folded {
  /** blocks to render inside a rung, by rung key */
  byRung: Record<string, Block[]>
  /** everything that is not about one rung — plus any approach the ladder does
   *  not carry, kept whole so no section is lost */
  shared: Block[]
  /** approach sections the binding leaves unbound, by document order */
  unbound: number[]
  /**
   * The document's own "The Overall Arc", pulled out of the shared half.
   *
   * The ladder already ends on `Problem.arc` — the same three rungs, the same
   * trade, the same closing principle, in fewer words. Two sections doing one
   * job, 200 words apart, is duplication a string comparison cannot see: they
   * share almost no phrasing and say the same thing.
   *
   * Neither is deleted, because neither is redundant: the record's arc is the
   * one a reader always gets, and the document's is the full treatment. So the
   * long one folds UNDER the short one, which is exactly what the per-approach
   * halves already do on their rungs.
   */
  arc: Block[]
  /**
   * The shared half GROUPED BY ITS `##` HEADINGS, so the page can place each
   * part where it belongs instead of stacking all of them behind one door.
   *
   * `shared` is the same blocks, flat and in order, for a caller that still
   * wants the lot.
   */
  sections: { title: string; blocks: Block[] }[]
}

const isApproachHeading = (b: Block) =>
  b.kind === "heading" && b.level === 2 && /^approach\b/i.test(b.text)

/**
 * @param blocks   the parsed document
 * @param binding  one rung key per `## Approach` section IN DOCUMENT ORDER;
 *                 `null` for an approach the ladder does not carry, which then
 *                 stays in `shared` under its own heading
 * @param hasCost  rung keys whose `costWhy` is authored — only for those is the
 *                 document's own complexity section a duplicate. Without it the
 *                 fold would DELETE the only account of the cost on the page.
 * @param hasUnlocks the record carries `unlocks`, so the page draws every bound
 *                 as a card with a figure. The document's own constraints TABLE
 *                 is then the same content twice — measured on
 *                 contains-duplicate, one row matched the card word for word.
 *                 Only the HEADING and the TABLE go: the rest of that
 *                 subsection is the worked-example note and its fence, which
 *                 belong to the document. Lifting the whole `###` is a mistake
 *                 this repo has already made once, and it cost four documents
 *                 their prose.
 * @param hasArc   the record carries `arc`, which the ladder renders under the
 *                 rungs. The document's "The Overall Arc" is then the same job
 *                 in more words — collected into `arc` and folded under that
 *                 line rather than left to run as a second closing section.
 */
export function foldDoc(
  blocks: Block[],
  binding: (string | null)[],
  hasCost: ReadonlySet<string> = new Set(),
  hasUnlocks = false,
  hasArc = false
): Folded {
  const byRung: Record<string, Block[]> = {}
  const shared: Block[] = []
  const unbound: number[] = []
  const arc: Block[] = []
  let inArc = false

  let approach = -1 // index into `binding`, -1 while outside an approach
  let key: string | null = null
  let dropping = false // inside a `###` the rung already shows
  let atConstraints = false // the `###` the bound CARDS replace

  for (const b of blocks) {
    if (isApproachHeading(b)) {
      approach += 1
      key = binding[approach] ?? null
      dropping = false
      if (key === null) {
        unbound.push(approach)
        shared.push(b)
      } else {
        byRung[key] ??= []
        // the `## Approach 2 — Sort…` heading itself is the rung's own name,
        // already the biggest text in the rung. Dropped, not re-rendered.
      }
      continue
    }
    // a level-2 heading that is not an approach ends the approach region
    if (b.kind === "heading" && b.level === 2) {
      approach = -1
      key = null
      dropping = false
      // the arc section is collected rather than shared: the ladder renders
      // it under its own arc line
      inArc = hasArc && ARC_HEADING.test(b.text.trim())
      if (inArc) continue
      shared.push(b)
      continue
    }
    if (inArc) {
      arc.push(b)
      continue
    }

    if (key === null) {
      // the constraints `###`: drop its heading and the table under it, and
      // nothing else — the note and fence that follow are the document's
      if (b.kind === "heading" && b.level === 3) {
        atConstraints = hasUnlocks && b.text.trim() === CONSTRAINTS_HEADING
        if (atConstraints) continue
      }
      if (atConstraints && b.kind === "table") {
        atConstraints = false
        continue
      }
      shared.push(b)
      continue
    }

    if (b.kind === "heading" && b.level === 3) {
      const already =
        RUNG_ALREADY_SHOWS[b.text as keyof typeof RUNG_ALREADY_SHOWS]
      dropping =
        already === "idea" ||
        already === "code" ||
        (already === "cost" && hasCost.has(key))
      if (dropping) continue
    }
    if (dropping) continue
    byRung[key].push(b)
  }

  // Grouped by the document's own `##` headings. The page reads this rather
  // than `shared` so that "Understanding the problem" can sit with the problem
  // and "Reading the calculations" with the approaches, instead of every one of
  // them queueing behind a single door labelled "read it".
  const sections: { title: string; blocks: Block[] }[] = []
  for (const b of shared) {
    if (b.kind === "heading" && b.level === 2)
      sections.push({ title: b.text, blocks: [] })
    else if (sections.length) sections[sections.length - 1].blocks.push(b)
    else sections.push({ title: "", blocks: [b] })
  }

  return { byRung, shared, unbound, arc, sections }
}
