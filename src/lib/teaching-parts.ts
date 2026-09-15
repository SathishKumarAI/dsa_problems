// A typed teaching document, flattened into the sections a page renders — as
// DATA, with no markup in it.
//
// ONE array, two consumers: `components/teaching-doc.tsx` renders it and the
// contents rail lists it, so a rail offering a section the page does not render
// is a bug this shape makes impossible. That is the only reason this is a list
// rather than a component per field.
//
// Pure and DOM-free on purpose. It is here rather than in the `.tsx` because a
// component module that also exports a plain function breaks fast refresh for
// the whole module — the same rule `lib/ladder.ts` was split out for — and
// because a part list with no JSX in it can be asserted against in a node test.
//
// Prose stays MARKDOWN. The drift the typed document removed was never inside a
// paragraph; it was over which sections exist. Typing the structure removes it,
// typing every sentence would buy nothing.

import type { TeachingDoc } from "@/content/types"
import { slugify } from "@/lib/markdown"
import type { Outline } from "@/lib/markdown"

export type Part = {
  id: string
  title: string
  level: 2 | 3
} & (
  | { kind: "prose"; text: string }
  | { kind: "table"; head: string[]; rows: string[][] }
  /** a heading with nothing under it — the approach's own `##`, whose content
   *  is the six `###` parts that follow it */
  | { kind: "heading" }
  /** Python with a Run button. `editable` is the full script, which is the one
   *  block a reader wants to change — SET, never inferred from "the last fence
   *  on the page", which is what the Markdown renderer had to guess. */
  | { kind: "code"; code: string; editable?: boolean }
  /** prose, then a table, then prose — the failure-mode list and the unlocks */
  | { kind: "prose+table"; text: string; head: string[]; rows: string[][]; after?: string }
)

const prose = (id: string, title: string, text: string, level: 2 | 3 = 2): Part => ({
  id,
  title,
  level,
  kind: "prose",
  text,
})

/**
 * The document in the order a reader meets it — and NOT the parts the page
 * already carries.
 *
 * The statement, the constraints, the examples and the ladder in three
 * languages were all in the old `composeLearnPage` output, because the learn
 * page was a separate route and had to stand on its own. The explanation is a
 * section of the problem page now, which shows all four above it, so repeating
 * them would be the same words twice on one screen. That dedupe is the point of
 * merging the two routes, not a side effect of it.
 */
export function partsOf(doc: TeachingDoc): Part[] {
  const parts: Part[] = []

  parts.push(
    doc.unlocks?.length
      ? {
          id: "understanding",
          title: "Understanding the problem",
          level: 2,
          kind: "prose+table",
          text: doc.understanding,
          head: ["Constraint", "What it forces or permits"],
          rows: doc.unlocks.map((u) => [u.constraint, u.what]),
        }
      : prose("understanding", "Understanding the problem", doc.understanding)
  )

  // The document's own numbered failure list, straight after the constraints
  // that make each one possible and before the first approach, because every
  // approach's "Common mistake" cites these by number. The numbers are the ROW
  // POSITIONS — a list that stores its own indices can disagree with itself, so
  // they are counted here and nowhere else.
  if (doc.traps)
    parts.push({
      id: "failure-modes",
      title: "The failure modes — the whole test suite",
      level: 2,
      kind: "prose+table",
      text: doc.traps.intro,
      head: ["#", "Failure", "Example", "What the code must check"],
      rows: doc.traps.rows.map((t, i) => [`**${i + 1}**`, t.name, t.example, t.check]),
      after: doc.traps.outro,
    })

  if (doc.calculations)
    parts.push(prose("calculations", "Reading the calculations", doc.calculations))

  doc.approaches.forEach((a, i) => {
    const base = `approach-${i + 1}-${slugify(a.title)}`
    parts.push(
      { id: base, title: `Approach ${i + 1}: ${a.title}`, level: 2, kind: "heading" },
      prose(`${base}-idea`, "The idea", a.idea, 3),
      prose(`${base}-intuition`, "How to think about it", a.intuition, 3),
      prose(`${base}-worked`, "Worked example", a.worked, 3),
      { id: `${base}-code`, title: "Code", level: 3, kind: "code", code: a.code }
    )
    if (a.codeNote)
      parts.push(prose(`${base}-code-note`, "About that code", a.codeNote, 3))
    parts.push(
      prose(`${base}-mistake`, "Common mistake", a.mistake, 3),
      prose(`${base}-cost`, "Complexity and when to use this", a.cost, 3)
    )
    // the parts the six named ones do not cover, in the order they were
    // written: the `> **Why it works.**` argument the format demands of every
    // greedy and every two-pointer solution, and the cost-of-mutation notes
    for (const [j, note] of (a.notes ?? []).entries())
      parts.push(prose(`${base}-note-${j}`, note.title, note.body, 3))
  })

  parts.push(prose("the-overall-arc", "The overall arc", doc.arc))

  if (doc.comparison.rows.length)
    parts.push({
      id: "comparison",
      title: "Comparison",
      level: 2,
      kind: "table",
      head: doc.comparison.head,
      rows: doc.comparison.rows,
    })

  parts.push(prose("interview-priority", "Interview priority", doc.interview))
  if (doc.fluent) parts.push(prose("how-to-get-fluent", "How to get fluent", doc.fluent))

  parts.push({
    id: "full-runnable-script",
    title: "Full runnable script",
    level: 2,
    kind: "prose",
    text:
      "Every approach above, plus a differential test over random inputs. This is the script `scripts/verify-deep.mjs` executes on every pull request — and the one the Run button below runs in your browser." +
      // the author's note on the script: which helpers are scaffolding, and the
      // guards the harness needs
      (doc.scriptNote ? `\n\n${doc.scriptNote}` : ""),
  })
  parts.push({
    id: "full-runnable-script-code",
    title: "The script",
    level: 3,
    kind: "code",
    code: doc.script,
    editable: true,
  })
  if (doc.scriptOutput)
    parts.push(prose("output-when-run", "Output when run", doc.scriptOutput, 3))

  // anything the house format carries that has no field of its own — a section
  // naming the sibling problems that use the same move, an aside under the
  // comparison table. In document order rather than dropped.
  for (const note of doc.notes ?? [])
    parts.push(prose(slugify(note.title), note.title, note.body))

  return parts
}

/** the document's own runnable script with its `__main__` guard removed — the
 *  module-level scaffolding every fence in it was written against. Without it
 *  45 of the 184 fences raise NameError on a helper the document defines once
 *  at the top (`format_range`, `seed_sum`, `PAIRS`). */
export const scaffoldOf = (doc: TeachingDoc) =>
  doc.script.split(/^if __name__/m)[0]

export const outlineOfParts = (parts: Part[]): Outline[] =>
  parts.map(({ id, title, level }) => ({ id, text: title, level }))
