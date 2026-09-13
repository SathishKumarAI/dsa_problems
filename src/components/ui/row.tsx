// The parts a LIST ROW is built from — the two marks that were being retyped
// in every list on the site.
//
// What this file owns
// -------------------
//   * `RowNudge`    — the "this row opens something" affordance at the end of
//                     a row: an arrow or a chevron that is quiet at rest and
//                     brightens + slides 3px when the row is hovered OR
//                     anything inside it takes keyboard focus.
//   * `RowProgress` — a row's progress, drawn as the row's own bottom
//                     hairline rather than as a bar inside it.
//
// What this file does NOT own
// ---------------------------
//   * the row itself (padding, the hover tint, what it links to) — that is
//     the list's job: `home-view.tsx`, `problem-list.tsx`.
//   * the motion and the resting colour of the nudge. Those live in ONE place,
//     `src/index.css`, under `[data-affordance="nudge"]`, and the reason is a
//     trap this repo has already paid for: a `transition-*` UTILITY beats
//     anything in `@layer base` whatever the specificity, so writing
//     `transition-colors` here would silently drop `transform` from the
//     property list and the slide would never run. One rule, one place.
//
// Why they are components and not two lines of JSX each: the nudge appeared
// six times and the hairline twice, and every copy is a chance for one of them
// to drift into a different size, a different colour or a different duration —
// which is exactly the "conventions but no system" the design audit found.
//
// DESIGN.md rules these obey, so a later edit does not quietly break them:
//   * "Rows tint on hover; surfaces lift" — neither of these lifts a row.
//   * never animate a layout property in a list — the nudge moves by
//     `transform`, the hairline by `width` on an absolutely positioned
//     element, so neither one reflows its siblings.
//   * a row at 0 % draws NO hairline, so an untouched list of eighty rows
//     stays quiet instead of showing eighty empty troughs.
import { ArrowRightIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The end-of-row affordance.
 *
 * `chevron` (the default) for a row inside a list — it says "there is more of
 * this one". `arrow` for a single call to action that leaves the page — it
 * says "go". Both are `aria-hidden`: the row's own link text is the accessible
 * name, and an icon that repeats it just makes a screen reader say the row
 * twice.
 */
export function RowNudge({
  as = "chevron",
  className,
}: {
  as?: "chevron" | "arrow"
  className?: string
}) {
  const Icon = as === "arrow" ? ArrowRightIcon : ChevronRightIcon
  return (
    <Icon
      aria-hidden
      // read by src/index.css — see the header above before changing it
      data-affordance="nudge"
      className={cn("size-4 shrink-0", className)}
    />
  )
}

/**
 * A row's progress, as the row's own bottom hairline.
 *
 * The parent row must be `relative`. `tone` picks which of the two meanings
 * the bar carries, and both are roles the palette already assigns:
 * `primary` (mauve) for "how far through this journey you are" and `done`
 * (chart-3 green) for "how many of these you have solved". Nothing else may
 * be passed — a third colour here would be colour spent on decoration, and in
 * this app colour is load-bearing.
 */
export function RowProgress({
  pct,
  tone = "primary",
}: {
  pct: number
  tone?: "primary" | "done"
}) {
  if (pct <= 0) return null
  return (
    <span
      aria-hidden
      className={cn(
        // animate-edge-in-x is the existing 320ms "an edge draws itself"
        // utility, the same authored moment home's dock and the pattern
        // page's title rule use. The row underneath is already at full
        // opacity, so a reader who arrives late has missed a line being
        // drawn, not the content.
        "absolute bottom-0 left-0 h-px animate-edge-in-x",
        tone === "done" ? "bg-chart-3" : "bg-primary"
      )}
      style={{ width: `${pct}%` }}
    />
  )
}
