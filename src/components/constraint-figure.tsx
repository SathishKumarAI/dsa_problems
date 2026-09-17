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
import { compact, logWidth, ratio } from "@/lib/figure-scale"
import { cn } from "@/lib/utils"
import type { ConstraintFigure } from "@/data"

// NO CATEGORICAL HUE HERE. These bars are quantities in an ORDER — the work
// each approach costs, largest to smallest — and the page's rule is that an
// ordered thing is drawn in the ordered scale. Five role colours would say
// "five kinds"; the ramp says "a climb", which is what the figure is about.
//
// Rank, not value, picks the step: the whole point of a perceptually uniform
// map is that equal steps along it look equally far apart, so the rungs read
// as evenly spaced however lopsided the numbers are.
const rampStep = (rank: number, total: number) =>
  `var(--ramp-${Math.min(4, Math.round((rank / Math.max(1, total - 1)) * 4))})`

function Quantities({
  items,
}: {
  items: { label: string; value: number; tone?: "bad" | "good" | "plain" }[]
}) {
  const values = items.map((i) => i.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  // biggest first, so the ramp runs the same way the numbers do
  const order = [...items]
    .map((it, i) => ({ i, v: it.value }))
    .sort((a, b) => b.v - a.v)
    .map((x) => x.i)
  // THE SENTENCE THE BARS WERE ALREADY MAKING. The scale is logarithmic
  // because the gap is too large to draw honestly, and the cost of that is
  // exactly the thing worth knowing: a reader looking at two bars cannot tell
  // three times from fifty thousand. So it is written, once, at the top.
  const gap = ratio(max, min)
  return (
    <div className="flex flex-col gap-2">
      {gap && (
        <p className="flex items-baseline gap-1.5">
          <span className="font-mono text-body font-semibold text-foreground tabular-nums">
            {gap}
          </span>
          <span className="text-meta text-muted-foreground">
            between the worst and the best
          </span>
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={item.label} className="grid grid-cols-[1fr_auto] gap-x-2">
            <span className="truncate text-meta text-muted-foreground">
              {item.label}
            </span>
            <span className="font-mono text-meta text-foreground tabular-nums">
              {compact(item.value)}
            </span>
            {/* The bar spans BOTH columns, so its length is the card's width
                and not the label column's — the value used to sit in a column
                the bar could not reach, which quietly shortened every bar by
                the width of the longest number. */}
            <span
              aria-hidden
              className="col-span-2 h-2 w-full overflow-hidden rounded-full bg-border/30"
            >
              <span
                className="block h-full animate-edge-in-x origin-left rounded-full"
                style={{
                  backgroundColor: rampStep(order.indexOf(i), items.length),
                  width: `${logWidth(item.value, max)}%`,
                  animationDelay: `${120 + i * 90}ms`,
                  animationFillMode: "backwards",
                }}
              />
            </span>
          </li>
        ))}
      </ul>
      <p className="text-meta text-dim">log scale — each step is ×10</p>
    </div>
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
    <div className="flex flex-col gap-2">
      {/* THE COUNT IS THE POINT. This figure exists to show sparsity, and
          sparsity is a RATIO between how many values you will hold and how
          many could occur — so the count leads, the way the ratio leads on a
          quantities figure. */}
      <p className="flex items-baseline gap-1.5">
        <span className="font-mono text-body font-semibold text-foreground tabular-nums">
          {marks.length}
        </span>
        <span className="text-meta text-muted-foreground">
          values, anywhere in the range
        </span>
      </p>
      {/* An AXIS, with ticks and room for its own labels.
          
          What was here: the dots floated above a hairline, and the two end
          labels were absolutely positioned into the same 8px band as the
          note underneath, so at a 337px card "−10⁹" and "10⁹" collided with
          the sentence below them — measured on the pilot, two cards in.
          
          Now the axis owns a fixed band and the labels sit under their own
          ticks in normal flow, where nothing can land on top of them. */}
      <div className="flex flex-col gap-1">
        <div className="relative h-5">
          <span
            aria-hidden
            className="absolute top-2.5 left-0 h-px w-full animate-edge-in-x origin-left bg-border"
          />
          {/* the ends, so the line reads as a measured interval rather than
              as a rule that happens to stop */}
          <span
            aria-hidden
            className="absolute top-1 left-0 h-3 w-px bg-border"
          />
          <span
            aria-hidden
            className="absolute top-1 right-0 h-3 w-px bg-border"
          />
          {marks.map((pct, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute top-1.5 size-2.5 -translate-x-1/2 rounded-full border border-background bg-chart-1"
              style={{
                left: `${pct}%`,
                animation: `edge-in-y var(--duration-reveal) cubic-bezier(0.16,1,0.3,1) ${200 + i * 70}ms backwards`,
              }}
            />
          ))}
        </div>
        <div className="flex items-baseline justify-between font-mono text-meta text-dim">
          <span>{from}</span>
          <span>{to}</span>
        </div>
      </div>
      {note && <p className="text-meta text-muted-foreground">{note}</p>}
    </div>
  )
}

/** a literal array, small enough to count */
function Cells({ values, caption }: { values: string[]; caption?: string }) {
  // AN ARRAY HAS INDICES, and on these figures the index IS the lesson: the
  // base cases in this corpus are off-by-ones, and "a sweep starting at i = 0
  // reads position −1" is a claim about a SLOT. Drawing the boxes without
  // numbering them left the reader to count, which is the step that goes
  // wrong. A leading "?" is that out-of-range slot, so it is drawn as a void
  // — dashed, dim, and indexed −1 — rather than as another value.
  const off = values[0] === "?" ? 1 : 0
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2" aria-hidden>
        {values.map((v, i) => {
          const index = i - off
          const void_ = v === "?"
          return (
            <span key={i} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-md font-mono text-ui tabular-nums",
                  void_
                    ? "border border-dashed border-border text-dim"
                    : "border border-border/60 bg-background/60 text-foreground"
                )}
                style={{
                  animation: `edge-in-y var(--duration-reveal) cubic-bezier(0.16,1,0.3,1) ${150 + i * 80}ms backwards`,
                }}
              >
                {v}
              </span>
              <span
                className={cn(
                  "font-mono text-meta tabular-nums",
                  void_ ? "text-dim" : "text-muted-foreground"
                )}
              >
                {index}
              </span>
            </span>
          )
        })}
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
