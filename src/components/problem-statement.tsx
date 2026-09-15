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
    <ul aria-label="constraints" className="flex flex-col gap-1">
      {problem.constraints.map((c, i) => {
        const what = buys.get(c)
        return (
          <li
            key={c}
            // staggered so the list reads as a sequence rather than appearing
            // as a block — one reveal token, delayed, not a second duration
            className="animate-edge-in-y rounded-md border border-transparent px-2 py-1.5 transition-colors hover:border-chart-1/40 hover:bg-accent/40"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <div className="flex max-w-[35em] items-baseline gap-2">
              <span aria-hidden className="text-dim">
                ·
              </span>
              <span className="font-mono text-ui">{c}</span>
            </div>
            {what && (
              <div className="flex max-w-[35em] items-baseline gap-2 pl-4">
                <span aria-hidden className="text-chart-1">
                  →
                </span>
                <span className="text-ui text-muted-foreground">{what}</span>
              </div>
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
        <p className="max-w-[35em] text-body">{problem.statement}</p>
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
