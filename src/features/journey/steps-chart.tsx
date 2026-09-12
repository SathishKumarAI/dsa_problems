// Steps per approach on the CURRENT input — one measure, one hue, direct
// labels, no legend (one series). The active act's bar carries the accent;
// the rest are a neutral tint. Locked acts are never in the rows (the API
// filters them by `upto`). Hover shows the exact count; numbers are text-
// coloured, never series-coloured.

import { cn } from "@/lib/utils"

export interface ChartRow {
  act: string
  name: string
  steps: number
}

export function StepsChart({
  rows,
  active,
}: {
  rows: ChartRow[]
  active: string
}) {
  if (!rows.length) return null
  const max = Math.max(...rows.map((r) => r.steps), 1)
  return (
    <figure
      className="flex flex-col gap-2"
      aria-label="steps per approach on this input"
    >
      <figcaption className="text-meta tracking-wide text-muted-foreground uppercase">
        work on this input (steps)
      </figcaption>
      <div className="flex flex-col gap-1.5" role="table">
        {rows.map((r) => {
          const w = Math.max(2, (r.steps / max) * 100)
          const isActive = r.act === active
          return (
            <div
              key={r.act}
              role="row"
              className="group grid grid-cols-[6.5rem_minmax(0,1fr)_2.5rem] items-center gap-2"
              title={`${r.name}: ${r.steps} steps`}
            >
              <span
                role="cell"
                className={cn(
                  "truncate text-meta",
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {r.name}
              </span>
              <span
                role="cell"
                className="relative h-3 rounded-[2px] bg-muted/40"
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-l-[2px] rounded-r-[4px] transition-[width] duration-(--duration-reveal)",
                    isActive
                      ? "bg-chart-1"
                      : "bg-chart-1/30 group-hover:bg-chart-1/50"
                  )}
                  style={{ width: `${w}%` }}
                />
              </span>
              <span
                role="cell"
                className={cn(
                  "text-right font-mono text-meta tabular-nums",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {r.steps}
              </span>
            </div>
          )
        })}
      </div>
    </figure>
  )
}
