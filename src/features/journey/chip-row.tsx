// The array, drawn as chips. Owns the chip grammar — colour is never the
// only channel (colourblind-safe):
//   fill   = state    neutral / focus (yellow) / answer (green)
//   marker = role     ▲ above = anchor (held / left pointer) · ring = focus (current / right pointer)
//   icon   = outcome  ✓ above = part of the answer
//   fade   = eliminated
//   beat   = the chip just became the answer (one 520 ms pulse, not a state)
// Change the grammar here and in <Legend/> together.

import { cn } from "@/lib/utils"
import type { ChipModel } from "@/engine"

const ROLE = {
  base: "relative flex h-14 min-w-14 items-center justify-center rounded-lg border px-2.5 font-mono text-xl font-medium tabular-nums transition-[background-color,border-color,color,opacity] duration-300",
  neutral: "border-border bg-card text-foreground",
  anchor:
    "border-chart-4 bg-chart-4/15 text-chart-4 before:absolute before:-top-5 before:text-xs before:text-chart-4 before:content-['▲']",
  focus:
    "border-foreground bg-[var(--yellow)]/20 text-foreground ring-2 ring-foreground/80 ring-offset-2 ring-offset-background",
  answer:
    "border-chart-3 bg-chart-3/20 text-chart-3 animate-answer-pulse before:absolute before:-top-5 before:text-xs before:text-chart-3 before:content-['✓']",
  dim: "opacity-25",
}

export function Chip({ chip, index }: { chip: ChipModel; index?: number }) {
  const r = chip.roles
  return (
    <div className="flex flex-col items-center gap-1.5 pt-5" data-k={chip.key}>
      <div
        className={cn(
          ROLE.base,
          r.includes("answer")
            ? ROLE.answer
            : r.includes("focus")
              ? ROLE.focus
              : r.includes("anchor")
                ? ROLE.anchor
                : ROLE.neutral,
          r.includes("anchor") && r.includes("focus") && "ring-2",
          r.includes("dim") && ROLE.dim
        )}
      >
        {chip.value}
        {chip.sub && (
          <span className="absolute -right-1 -bottom-1 rounded bg-background px-0.5 font-mono text-[11px] leading-none text-muted-foreground">
            {chip.sub}
          </span>
        )}
      </div>
      {index !== undefined && (
        <span
          className={cn(
            "font-mono text-xs leading-none",
            r.includes("dim")
              ? "text-muted-foreground/30"
              : "text-muted-foreground/70"
          )}
        >
          {index}
        </span>
      )}
    </div>
  )
}

export function ChipRow({
  chips,
  indexed = true,
  className,
}: {
  chips: ChipModel[]
  indexed?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-center gap-2.5",
        className
      )}
      aria-label="array"
    >
      {chips.map((c, i) => (
        <Chip key={c.key} chip={c} index={indexed ? i : undefined} />
      ))}
    </div>
  )
}

export function Legend() {
  const item = (cls: string, marker: string, label: string) => (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn(
          "relative inline-flex size-3.5 items-center justify-center rounded border",
          cls
        )}
      >
        {marker && (
          <span className="absolute -top-2.5 text-[7px]">{marker}</span>
        )}
      </span>
      {label}
    </span>
  )
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2" aria-label="legend">
      {item(
        "border-chart-4 bg-chart-4/15 text-chart-4",
        "▲",
        "held · left pointer"
      )}
      {item(
        "border-foreground ring-1 ring-foreground/80",
        "",
        "current · right pointer"
      )}
      {item("border-chart-3 bg-chart-3/20 text-chart-3", "✓", "answer")}
      {item("border-border opacity-30", "", "eliminated")}
    </div>
  )
}
