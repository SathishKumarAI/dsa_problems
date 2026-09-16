// A bound, drawn.
//
// The prose under each constraint already explains what the number buys. This
// draws the number itself, because "10⁵ elements makes O(n²) about 5·10⁹
// comparisons" is a sentence a reader nods at and does not feel — three bars,
// on a log scale, and the gap between brute force and a single pass stops being
// a claim and becomes a picture.
//
// Three kinds, and they are deliberately few. Each is a SHAPE the corpus's
// constraints actually take, not a chart type:
//
//   quantities — two or more amounts that must be compared. The work at the
//                input's ceiling; what you could hold against what you will.
//   span       — a range with the values you will actually see marked on it.
//                This is the picture of sparsity, which is the argument
//                against indexing by value.
//   cells      — a literal array, small enough to count. The base cases.
//
// The figure is AUTHORED per constraint (`Unlock.figure`), never inferred from
// the string — a number in a sentence is not a number a chart may assume.
//
// Motion is the house's, not new: `animate-edge-in-x` is the bar drawing itself
// from the left on the reveal duration and the one curve, which is what the
// pattern page already uses for the rule under its title.
import { compact, logWidth } from "@/lib/figure-scale"
import { cn } from "@/lib/utils"
import type { ConstraintFigure } from "@/data"

const TONE = {
  bad: "bg-chart-4/70",
  good: "bg-chart-3/70",
  plain: "bg-chart-2/60",
} as const

function Quantities({
  items,
}: {
  items: { label: string; value: number; tone?: keyof typeof TONE }[]
}) {
  const max = Math.max(...items.map((i) => i.value))
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li key={item.label} className="flex flex-col gap-0.5">
          <span className="flex items-baseline justify-between gap-2 text-meta">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-mono text-foreground tabular-nums">
              {compact(item.value)}
            </span>
          </span>
          <span
            aria-hidden
            className="h-1.5 w-full overflow-hidden rounded-full bg-border/40"
          >
            <span
              className={cn(
                "block h-full animate-edge-in-x origin-left rounded-full",
                TONE[item.tone ?? "plain"]
              )}
              style={{
                width: `${logWidth(item.value, max)}%`,
                animationDelay: `${120 + i * 90}ms`,
                animationFillMode: "backwards",
              }}
            />
          </span>
        </li>
      ))}
    </ul>
  )
}

/** a range, with the handful of values you will actually hold marked on it */
function Span({
  from,
  to,
  marks,
  note,
}: {
  from: string
  to: string
  marks: number[]
  note?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative h-8">
        {/* the range itself */}
        <span
          aria-hidden
          className="absolute top-3.5 left-0 h-px w-full animate-edge-in-x origin-left bg-border"
        />
        {marks.map((pct, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute top-2 size-2 -translate-x-1/2 rounded-full bg-chart-1"
            style={{
              left: `${pct}%`,
              animation: `edge-in-y var(--duration-reveal) cubic-bezier(0.16,1,0.3,1) ${200 + i * 70}ms backwards`,
            }}
          />
        ))}
        <span className="absolute top-5 left-0 font-mono text-meta text-dim">
          {from}
        </span>
        <span className="absolute top-5 right-0 font-mono text-meta text-dim">
          {to}
        </span>
      </div>
      {note && <p className="text-meta text-muted-foreground">{note}</p>}
    </div>
  )
}

/** a literal array, small enough to count */
function Cells({ values, caption }: { values: string[]; caption?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5" aria-hidden>
        {values.map((v, i) => (
          <span
            key={i}
            className="flex size-9 items-center justify-center rounded-md border border-border/60 bg-background/60 font-mono text-ui tabular-nums"
            style={{
              animation: `edge-in-y var(--duration-reveal) cubic-bezier(0.16,1,0.3,1) ${150 + i * 80}ms backwards`,
            }}
          >
            {v}
          </span>
        ))}
      </div>
      {caption && <p className="text-meta text-muted-foreground">{caption}</p>}
    </div>
  )
}

export function ConstraintFigureView({ figure }: { figure: ConstraintFigure }) {
  switch (figure.kind) {
    case "quantities":
      return <Quantities items={figure.items} />
    case "span":
      return (
        <Span
          from={figure.from}
          to={figure.to}
          marks={figure.marks}
          note={figure.note}
        />
      )
    case "cells":
      return <Cells values={figure.values} caption={figure.caption} />
  }
}
