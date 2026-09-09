// The act's frames as a clickable list: click a row, the player jumps there.
// Built from the same drained frames the player reads (useJourney.frames), so
// it cannot drift from what is on the stage — the row highlighted is always
// the frame being drawn, whether you got there by playing, scrubbing or
// clicking here.

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { BaseFrame } from "@/engine"

export function TracePanel({
  frames,
  pos,
  onSeek,
}: {
  frames: BaseFrame[]
  pos: number
  onSeek: (i: number) => void
}) {
  const current = useRef<HTMLLIElement>(null)
  // follow the player in both directions; `nearest` so it never yanks the
  // reading column around when the row is already visible
  useEffect(() => {
    current.current?.scrollIntoView({ block: "nearest" })
  }, [pos])

  // one frame is not a trace, it is a picture
  if (frames.length < 2) return null

  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="text-meta tracking-wide text-muted-foreground uppercase">
        trace · {frames.length} steps
      </div>
      {/* min-w-0 the whole way down: a note is long prose, and every box
        between the reading column and the truncating span has to be allowed
        to shrink below its content or the column widens until the PAGE
        scrolls sideways. Measured: 2042px of scrollWidth in a 902px viewport
        before this was right. */}
      <ol
        className="-mx-1 flex max-h-64 min-w-0 flex-col overflow-y-auto"
        aria-label="trace"
      >
        {frames.map((f, i) => {
          const here = i === pos
          return (
            <li key={i} className="min-w-0" ref={here ? current : undefined}>
              <button
                type="button"
                onClick={() => onSeek(i)}
                aria-current={here ? "step" : undefined}
                className={cn(
                  "flex w-full items-baseline gap-2 rounded px-1 py-1 text-left text-meta",
                  "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  here
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "w-6 shrink-0 text-right font-mono tabular-nums",
                    here ? "text-primary" : "text-muted-foreground/60"
                  )}
                >
                  {i}
                </span>
                {/* line-clamp-1, NOT truncate: `truncate` sets white-space
                  nowrap, which makes this row's max-content the whole note
                  and widens the reading column until the page scrolls
                  sideways (measured: 1778px of scrollWidth in a 502px
                  viewport). line-clamp gives one line and an ellipsis while
                  the text stays wrappable, so the box never forces width. */}
                <span className="min-w-0 line-clamp-1">{f.note}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
