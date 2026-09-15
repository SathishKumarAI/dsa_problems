// "The problem" — the statement, what the input promises, and the examples.
//
// It used to be one undifferentiated column: a paragraph, an all-caps label
// over a bullet list, then two mono boxes. Three different kinds of content
// under one heading, so nothing in it was addressable, nothing was linkable,
// and a screen reader's heading list jumped from the page title straight to
// "hints". They are three `h3`s now, under the band's own `h2`.
//
// The constraints are the part that changed most. They were grey bullets in
// the muted role — the quietest text on the page — which is backwards: a bound
// is what turns a corner case from trivia into a decision (R2), and half of
// them here are the reason an approach is possible at all. Each is a row that
// lights on hover, and where the record says what a bound BUYS (`unlocks`),
// that sentence sits under it instead of two thousand words away in the
// explanation.
//
// This file owns the three sections. It does not own the examples' motion —
// that is `example-viewer.tsx` — and it decides nothing about the ladder.
import { ExampleViewer } from "./example-viewer"
import { runsOf } from "@/lib/notation"
import { cn } from "@/lib/utils"
import type { Problem } from "@/data"

/** the sub-heading inside a band: the level between `Band`'s h2 and prose */
function Part({
  id,
  title,
  hint,
  children,
}: {
  id: string
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex scroll-mt-20 flex-col gap-2" id={id}>
      <h3 className="flex items-baseline gap-2 font-heading text-ui font-semibold">
        {title}
        {hint && (
          <span className="font-sans text-meta font-normal text-dim">
            {hint}
          </span>
        )}
      </h3>
      {children}
    </div>
  )
}

function Constraints({ problem }: { problem: Problem }) {
  const buys = new Map(
    (problem.unlocks ?? []).map((u) => [u.constraint, u.what])
  )
  return (
    // `aria-label="constraints"` is load-bearing: a UI check reads this list
    // by that name to prove the bounds reach the page at all (R2).
    //
    // A DEFINITION LIST, not a bulleted one. The first cut set a `·` before
    // every bound and a `→` before every explanation, which is punctuation
    // standing in for structure — and each glyph plus its gap ate 16px off the
    // measure, so the bound wrapped at 550 and its explanation at 539 while
    // every paragraph around them ended at 576. Eight right edges in one
    // column is what reads as text nobody set.
    //
    // The term and its definition are distinguished by POSITION and VOICE now
    // — the bound on its own line, the sentence beneath it in the muted role —
    // so every line in the section starts and ends on the column's own edges.
    <ul aria-label="constraints" className="flex flex-col gap-3">
      {problem.constraints.map((c, i) => {
        const what = buys.get(c)
        return (
          <li
            key={c}
            // staggered so the list reads as a sequence rather than appearing
            // as a block — one reveal token, delayed, not a second duration.
            // `-mx-3 px-3`: the hover highlight needs padding, and padding
            // would push this text right of the paragraph above it. The
            // negative margin spends it outward instead, so the text keeps the
            // column's left edge (the contents rail does the same).
            className="-mx-3 flex animate-edge-in-y flex-col gap-1 rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-chart-1/40 hover:bg-accent/40"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            {/* Mono for the NOTATION and the reading face for the words.
                Three quarters of the corpus's 668 constraint lines are English
                sentences, and setting those in the data face reads as
                something the reader is meant to type — DESIGN.md gives mono to
                values, indices and notation glyphs, not to prose. The hybrids
                are why this splits per run: "1 <= nums[i] <= n — every value is
                a legal index" is both, in one line. */}
            {/* `font-medium` on the TERM. A bound set in mono already reads
                as the thing being defined, but the constraints that are
                English sentences do not — at the same weight and a smaller
                step than the explanation beneath them, the term looked like a
                weaker version of its own definition. Weight and colour carry
                the distinction; the size never has to. */}
            <p className="max-w-measure text-ui font-medium">
              {runsOf(c).map((run, j) =>
                run.mono ? (
                  <span key={j} className="font-mono">
                    {run.text}
                  </span>
                ) : (
                  <span key={j}>{run.text}</span>
                )
              )}
            </p>
            {what && (
              <p className="max-w-measure text-body text-muted-foreground">
                {what}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function ProblemStatement({ problem }: { problem: Problem }) {
  const explained = (problem.unlocks ?? []).length
  return (
    <div className="flex flex-col gap-6">
      <Part id="what-it-asks" title="What it asks">
        <p className="max-w-measure text-body">{problem.statement}</p>
      </Part>

      <Part
        id="what-you-are-promised"
        title="What you are promised"
        hint={
          explained
            ? `${problem.constraints.length} bounds · ${explained} say what they buy`
            : `${problem.constraints.length} bounds`
        }
      >
        <Constraints problem={problem} />
      </Part>

      <Part
        id="examples"
        title="Examples"
        hint={cn(
          problem.examples.length === 1
            ? "1 case"
            : `${problem.examples.length} cases`
        )}
      >
        <ExampleViewer examples={problem.examples} />
      </Part>
    </div>
  )
}
