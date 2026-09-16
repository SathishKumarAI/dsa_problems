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

export interface Folded {
  /** blocks to render inside a rung, by rung key */
  byRung: Record<string, Block[]>
  /** everything that is not about one rung — plus any approach the ladder does
   *  not carry, kept whole so no section is lost */
  shared: Block[]
  /** approach sections the binding leaves unbound, by document order */
  unbound: number[]
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
 */
export function foldDoc(
  blocks: Block[],
  binding: (string | null)[],
  hasCost: ReadonlySet<string> = new Set()
): Folded {
  const byRung: Record<string, Block[]> = {}
  const shared: Block[] = []
  const unbound: number[] = []

  let approach = -1 // index into `binding`, -1 while outside an approach
  let key: string | null = null
  let dropping = false // inside a `###` the rung already shows

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
      shared.push(b)
      continue
    }

    if (key === null) {
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

  return { byRung, shared, unbound }
}
