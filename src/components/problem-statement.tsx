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
    <ul aria-label="constraints" className="grid gap-3 sm:grid-cols-2">
      {problem.constraints.map((c, i) => {
        const what = buys.get(c)
        return (
          <li
            key={c}
            // Each bound is its own CARD, at the owner's request. Noting the
            // tension rather than hiding it: DESIGN.md reserves a card for a
            // thing with its own actions, and the U-series counted 21
            // non-interactive bordered boxes as a defect. These rows lift on
            // hover and nothing else — so the affordance is honest about being
            // a highlight, not a click.
            //
            // The motion is ONE token. `animate-edge-in-y` on the reveal
            // duration, staggered 60ms a card so the four land as a sequence;
            // the hover is the shared `--shadow-lift` with a 1px rise. The
            // transition names its properties as LONGHANDS — `transition-all`
            // would report three durations to the R6 audit, and a bare
            // `transition-colors` utility silently resets transition-property,
            // which is how the card lift on home never ran (DESIGN.md).
            className="group flex animate-edge-in-y flex-col gap-2 rounded-xl border bg-card/40 p-4 transition-[box-shadow,transform,border-color] hover:-translate-y-px hover:border-chart-1/40 hover:shadow-(--shadow-lift)"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Mono for the NOTATION and the reading face for the words.
                Three quarters of the corpus's 668 constraint lines are English
                sentences, and setting those in the data face reads as
                something the reader is meant to type — DESIGN.md gives mono to
                values, indices and notation glyphs, not to prose. The hybrids
                are why this splits per run: "1 <= nums[i] <= n — every value is
                a legal index" is both, in one line. */}
            <p className="text-ui font-medium">
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
              // NO `prose-set` here, and that is why the utility is opt-in.
              // Justification works at the column's ~90 characters because the
              // word spaces have room to absorb the difference; a 337px card is
              // ~40 characters a line, where the same setting opens exactly the
              // rivers justification gets blamed for — visible in a screenshot
              // two cards deep. A narrow measure is set ragged.
              <p className="border-t pt-2 text-body text-muted-foreground">
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
        <p className="max-w-measure prose-set text-body">{problem.statement}</p>
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
