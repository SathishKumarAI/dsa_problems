// The parts a PAGE's zones are built from — the counterpart to `row.tsx`,
// which builds the parts of a list row.
//
// RECOVERED 2026-09-13. This file was written for the problem-page redesign,
// was never committed, and was then deleted while that redesign was put into
// `git stash`. The stashed `problem-detail.tsx` imports it, so without this
// file `git stash pop` restores a page that cannot compile and there is no
// copy of these three components anywhere in the history. That is why it is
// here even though nothing imports it yet: a stash entry whose recovery
// instruction does not work is a destroyed change wearing a parked label.
//
// What this file owns
// -------------------
//   * `OrientBar` — one horizontal row of at most four facts, at the top of a
//                   page. Not a card.
//   * `Band`      — a region of a page: a label, a rule, and an optional
//                   count. Not a card either, and that is the whole point.
//   * `Fact`      — one labelled value inside the orient bar.
//
// What it does NOT own
// --------------------
//   * which facts are worth a slot, or what a band contains. That is the
//     page's decision.
//   * any surface. Neither draws a background or a shadow, on purpose:
//     `bg-card` in this app picks up `--shadow-panel` from `index.css`, so a
//     section wrapped in card chrome FLOATS, which tells a reader it is
//     interactive when it is not. Measured on the problem page: 26
//     bordered-and-filled boxes, 21 with no actions of their own, 12 carrying
//     a shadow — against a house limit of one raised surface per screen.
//
// The rule both encode: a card wraps a thing with its own actions and its own
// state; a region of a page gets a heading and a hairline.
import { cn } from "@/lib/utils"

/**
 * The orient zone: what you need to know before deciding what to do next.
 *
 * At most four facts, one row. The cap is the useful part — a fact earns a
 * slot only if it changes what you do in the next thirty seconds, and without
 * a number to point at, every later addition looks reasonable on its own.
 *
 * A `<div>`, not a `<section>`: it has no heading, and a landmark with no
 * accessible name is noise in a screen reader's landmark list.
 */
export function OrientBar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="orient-bar"
      className={cn(
        // wraps rather than scrolls below sm: four facts in one row at 390px
        // would either overflow the page or shrink the difficulty word to an
        // ellipsis, and the whole job of this bar is to be read at a glance
        "flex flex-wrap items-center gap-x-5 gap-y-2 border-b pb-3",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * One region of the review zone: a label, a rule running to the right, and a
 * count.
 *
 * The count is not decoration — it makes the section advertise its own depth,
 * so a reader never clicks into something to discover there was nothing there.
 */
export function Band({
  label,
  count,
  children,
  className,
}: {
  label: string
  count?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <h2 className="flex items-baseline gap-3 text-meta tracking-wide text-muted-foreground uppercase">
        {label}
        {/* the rule IS the separator. A filled divider would add a third
            horizontal line to a page that already has borders and code
            blocks, and the page's job is to look like one document. */}
        <span
          aria-hidden
          className="h-px flex-1 translate-y-[-0.15em] bg-gradient-to-r from-border to-transparent"
        />
        {count && (
          <span className="font-mono text-meta normal-case text-dim">
            {count}
          </span>
        )}
      </h2>
      {children}
    </section>
  )
}

/**
 * One fact in the orient bar: a quiet label above, the value below.
 *
 * Stacked rather than inline because the labels ("difficulty", "target") are
 * chrome and the values are the content — on one line the eye reads six words
 * where it should read three values.
 */
export function Fact({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-meta tracking-wide text-dim uppercase">
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-ui">{children}</span>
    </div>
  )
}
