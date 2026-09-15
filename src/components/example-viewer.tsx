// The worked examples, as something you can watch instead of read.
//
// What was here: two mono lines per example, `in  nums = [1, 2, 3, 1]` over
// `out true`. Correct, and completely static — the page that teaches an array
// walk printed its array as a string. A reader asked the obvious question:
// where do I SEE the input change?
//
// So each example that names an array gets a row of cells and a transport.
// Stepping moves a `focus` mark along the row and settles everything behind
// it; the last step reveals the output with the same pulse the journey uses
// for an answer. Scalars (`target = 9`) sit beside the row as labelled chips,
// because they are inputs too and the string used to be the only place a
// reader could see them.
//
// WHAT THIS DELIBERATELY DOES NOT DO: it does not run the algorithm. The
// cursor is a READER — "element 3 of 4" — not a solution. An animation that
// implied the answer would be the walkthrough, which is the band below this
// one, generated from the journey's own frames and correct per problem. This
// is the input, moving; nothing here knows what the problem is.
//
// An example whose input does not parse (a tree, a grid, prose) keeps the
// mono block verbatim — see `lib/example-shape.ts`, which refuses rather than
// guesses.
import { useEffect, useRef, useState } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  RotateCcwIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cellRest, roleClass } from "@/lib/cell-roles"
import { shapeOf, walkable } from "@/lib/example-shape"
import type { Arg } from "@/lib/example-shape"
import { cn } from "@/lib/utils"
import { usePrefs } from "@/lib/store"
import type { Example } from "@/data"

const TRANSPORT = "size-11 lg:size-8"

/** one labelled value that is not the array — `target = 9`, `k = 2` */
function ScalarChip({ arg }: { arg: Arg & { kind: "scalar" } }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-md border px-2 py-1 font-mono text-meta">
      <span className="text-dim">{arg.name}</span>
      <span className="text-foreground">{arg.value}</span>
    </span>
  )
}

function Cells({
  values,
  cursor,
}: {
  values: string[]
  /** -1 before the walk starts, values.length once it has finished */
  cursor: number
}) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-lg border font-mono text-body tabular-nums transition-all duration-(--duration-reveal)",
              i === cursor
                ? roleClass.focus
                : cursor > i
                  ? roleClass.done
                  : cellRest
            )}
          >
            {v}
          </div>
          <span
            className={cn(
              "flex h-4 items-center font-mono text-meta transition-colors",
              i === cursor ? "text-primary" : "text-dim"
            )}
          >
            {i}
          </span>
        </div>
      ))}
    </div>
  )
}

function WalkableExample({ example, args }: { example: Example; args: Arg[] }) {
  const list = walkable(args)!
  const scalars = args.filter(
    (a): a is Arg & { kind: "scalar" } => a.kind === "scalar"
  )
  const last = list.values.length
  const [cursor, setCursor] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const { motion } = usePrefs()
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Autoplay walks to the end and stays there — the output is the point of
  // arriving, so it never loops back over it.
  //
  // The end condition is "nothing left to schedule", NOT `setPlaying(false)`:
  // a synchronous setState inside an effect is a cascading render and the
  // React Compiler lint rules reject it (CLAUDE.md). `done` is derived below
  // and it is what the button reads, so the flag never needs clearing.
  useEffect(() => {
    if (!playing || cursor >= last) return
    timer.current = setTimeout(
      () => setCursor((c) => c + 1),
      motion === "off" ? 0 : 420
    )
    return () => clearTimeout(timer.current)
  }, [playing, cursor, last, motion])

  const done = cursor >= last
  const step = (d: number) =>
    setCursor((c) => Math.max(-1, Math.min(last, c + d)))

  return (
    // `p-4`, the one box inset on this page — see problem-statement.tsx
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-meta text-dim">{list.name}</span>
        {scalars.map((a) => (
          <ScalarChip key={a.name} arg={a} />
        ))}
        {/* `size-11 lg:size-8`: a transport is the most-tapped control in this
            card and `icon-sm` renders 28px, under the 44px touch floor
            DESIGN.md sets — the phone audit fails the build on it. */}
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            size="icon-sm"
            variant="ghost"
            className={TRANSPORT}
            aria-label="previous value"
            disabled={cursor < 0}
            onClick={() => {
              setPlaying(false)
              step(-1)
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className={TRANSPORT}
            aria-label={done ? "walk it again" : "walk the input"}
            onClick={() => {
              if (done) {
                setCursor(-1)
                setPlaying(true)
              } else setPlaying((p) => !p)
            }}
          >
            {done ? <RotateCcwIcon /> : <PlayIcon />}
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className={TRANSPORT}
            aria-label="next value"
            disabled={done}
            onClick={() => {
              setPlaying(false)
              step(1)
            }}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      {list.values.length > 0 ? (
        <Cells values={list.values} cursor={cursor} />
      ) : (
        <p className="font-mono text-ui text-dim">[ ] — empty</p>
      )}

      {/* where the cursor is, in words. A row of boxes with one lit is a
          picture; a reader needs the count to connect it to `n`. */}
      {/* left, not centred. Three centred paragraphs in a document of 56
          left-aligned ones is what reads as "not justified" — the diagram
          above is centred because it is a picture; its caption is prose. */}
      <p className="font-mono text-meta text-muted-foreground">
        {cursor < 0
          ? `${last} value${last === 1 ? "" : "s"} — step or play`
          : done
            ? "end of the input"
            : `value ${cursor + 1} of ${last}`}
      </p>

      <div
        className={cn(
          "flex items-baseline gap-2 border-t pt-2 font-mono text-ui transition-opacity duration-(--duration-reveal)",
          done ? "opacity-100" : "opacity-40"
        )}
      >
        <span className="text-dim">out</span>
        <span className={cn(done && "animate-answer-pulse text-chart-3")}>
          {example.output}
        </span>
      </div>
      {example.note && (
        <p className="max-w-[35em] text-meta text-muted-foreground">
          {example.note}
        </p>
      )}
    </div>
  )
}

/** the fallback: exactly what this section printed before, for every input
 *  shape the parser refuses */
function PlainExample({ example }: { example: Example }) {
  return (
    <div className="overflow-x-auto rounded-lg border p-4 font-mono text-ui">
      <div>
        <span className="text-muted-foreground">in&nbsp;&nbsp;</span>
        {example.input}
      </div>
      <div>
        <span className="text-muted-foreground">out&nbsp;</span>
        {example.output}
      </div>
      {example.note && (
        <div className="mt-1 text-meta text-muted-foreground">
          {example.note}
        </div>
      )}
    </div>
  )
}

export function ExampleViewer({ examples }: { examples: Example[] }) {
  return (
    <div className="flex flex-col gap-2">
      {examples.map((ex, i) => {
        const args = shapeOf(ex.input)
        return walkable(args) ? (
          <WalkableExample key={i} example={ex} args={args} />
        ) : (
          <PlainExample key={i} example={ex} />
        )
      })}
    </div>
  )
}
