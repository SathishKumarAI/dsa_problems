// What a mark on a cell MEANS, as classes — one vocabulary, read by every
// surface that draws values in boxes.
//
// It lived inside `components/step-player.tsx`, which is the walkthrough and
// not the owner of the grammar. The example viewer needed the same four marks,
// and a second copy of these strings is how two surfaces start disagreeing
// about what orange means. Moved here verbatim, so nothing rendered changed.
//
// Plain data on purpose: a component module that also exports a constant
// breaks fast refresh for the whole module (the rule `lib/ladder.ts` and
// `lib/teaching-parts.ts` were split out for).
import type { CellRole } from "@/data"

export const roleClass: Record<CellRole, string> = {
  focus:
    "border-chart-1 bg-chart-1/15 text-chart-1 shadow-[0_0_16px_-2px] shadow-chart-1/40 scale-110",
  compare:
    "border-chart-4 bg-chart-4/15 text-chart-4 shadow-[0_0_16px_-2px] shadow-chart-4/40",
  window: "border-chart-2 bg-chart-2/15 text-chart-2",
  done: "border-chart-3/40 bg-chart-3/10 text-chart-3/80",
}

export const roleLegend: { role: CellRole; label: string }[] = [
  { role: "focus", label: "current" },
  { role: "compare", label: "comparing" },
  { role: "window", label: "in window" },
  { role: "done", label: "settled" },
]

/** a cell with no mark — the resting state, the same on every surface */
export const cellRest = "border-border/60 bg-background/60 text-foreground/80"
