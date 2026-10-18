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
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react"
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
        // STICKY, and that is what lets the facts appear exactly once. The
        // target complexity is the number you check while reading a rung three
        // thousand words below it, so it was copied into the right rail — and
        // a fact in two places is the duplication this page spent a branch
        // removing. It stays on screen instead. The blur is the same treatment
        // every floating surface here uses; the anchors clear it because
        // `scroll-mt-20` (80px) is already deeper than this bar is tall.
        "sticky top-0 z-10 -mt-2 bg-background/80 pt-2 backdrop-blur-md",
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
  id,
  label,
  count,
  fold,
  open = false,
  children,
  className,
}: {
  /** an anchor, so the contents rail can offer this section. `scroll-mt`
   *  because the shell parks a sticky bar over the top of the page. */
  id?: string
  label: string
  count?: string
  /** render as a `<details>` the reader can close. Opt-in: a band that is
   *  three lines long costs a click to read and saves nothing. */
  fold?: boolean
  /** the state to START in, and to be PUSHED to — the page's "read it all"
   *  switch flips this and every fold answers. A reader's own click wins
   *  until the switch moves again. */
  open?: boolean
  children: React.ReactNode
  className?: string
}) {
  // THE SWITCH PUSHES, THE READER WINS UNTIL IT MOVES AGAIN. A render-time
  // adjust rather than an effect: react-hooks v7 forbids a synchronous
  // setState in an effect, and `key`-ing the band on the switch would remount
  // it and throw away a player's position and an editor's draft.
  const [pushed, setPushed] = useState(open)
  const [isOpen, setIsOpen] = useState(open)
  if (open !== pushed) {
    setPushed(open)
    setIsOpen(open)
  }

  // A HEADING, NOT AN EYEBROW. Measured 2026-10-18 on the problem page: every
  // section heading was 13px regular uppercase — the smallest, lightest text
  // on the page, under 15px semibold sub-headings and 17px body. A reader
  // could not tell a section from a label, which the owner put as "nothing has
  // any priority". The ladder is now 28 title · 22 section · 19 sub-heading ·
  // 17 body. Labels are authored lowercase ("the problem"); the first letter is
  // raised here rather than in every call site.
  const heading = (
    <h2 className="flex items-baseline gap-3 font-heading text-heading font-semibold text-foreground">
      {fold && (
        // the only chrome the fold adds: the affordance. `group-open` on the
        // details below turns it, so there is no second source of truth for
        // whether the section is open.
        <ChevronRightIcon
          aria-hidden
          className="size-4 shrink-0 translate-y-[0.1em] text-dim transition-transform group-open:rotate-90"
        />
      )}
      {/* `::first-letter` applies to block containers, and the h2 is flex —
          so the raising happens on an inline-block span, not on the h2 */}
      <span className="inline-block first-letter:uppercase">{label}</span>
      {/* the rule IS the separator. A filled divider would add a third
          horizontal line to a page that already has borders and code
          blocks, and the page's job is to look like one document. */}
      <span
        aria-hidden
        className="h-px flex-1 translate-y-[-0.15em] bg-gradient-to-r from-border to-transparent"
      />
      {count && (
        <span className="font-mono text-meta text-dim normal-case">{count}</span>
      )}
    </h2>
  )

  // A SECTION BY DEFAULT, and that is the right default: a band three lines
  // long costs a click to read and saves nothing.
  if (!fold)
    return (
      <section
        id={id}
        className={cn("flex scroll-mt-20 flex-col gap-3", className)}
      >
        {heading}
        {children}
      </section>
    )

  // FOLDED: `<details>`, not a hand-rolled disclosure.
  //
  // The platform gives the whole contract for free — the button role, the
  // expanded state, space and enter, find-in-page reaching inside a closed
  // one. What it does NOT give is React knowing the reader clicked, which is
  // what `onToggle` is for: it fires on a programmatic `open` too, so
  // `lib/scroll-to.ts` opening a band on its way to an anchor keeps this state
  // honest rather than racing it.
  //
  // `group`, so the chevron above can read `group-open`. `list-none` and
  // `[&::-webkit-details-marker]` take the browser's own triangle off — the
  // chevron is the affordance, and two of them read as a rendering fault.
  return (
    <details
      id={id}
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
      className={cn("group scroll-mt-20", className)}
    >
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        {heading}
      </summary>
      <div className="flex flex-col gap-3 pt-3">{children}</div>
    </details>
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
