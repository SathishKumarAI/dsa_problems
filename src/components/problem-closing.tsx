// The two closing sections of a problem page: the reading list, and the
// contents rail for the long explanation.
//
// Split out of `problem-detail.tsx`. Both are leaves — they render what they
// are handed and decide nothing — which is exactly what made them the cheapest
// 130 lines to move out of a file that had grown to 843.
import {
  BookOpenIcon,
  ExternalLinkIcon,
  FileCodeIcon,
  GraduationCapIcon,
  ListTreeIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { setPref, usePrefs } from "@/lib/store"
import { ProblemNotes } from "./problem-notes"
import { cn } from "@/lib/utils"
import type { Pattern, Problem } from "@/data"
import type { Outline } from "@/lib/markdown"

/** which mark a source gets — a text, an official manual, or a course */
const KIND_ICON = {
  reference: BookOpenIcon,
  docs: FileCodeIcon,
  course: GraduationCapIcon,
} as const

/**
 * The pattern's reading, on the PROBLEM page.
 *
 * It used to sit on the pattern page. A reference is attached to a pattern and
 * not to a problem on purpose — there is an authoritative page on hash tables
 * and none on "Pair With Target Sum" — but the moment a reader wants it is the
 * moment they are stuck on a problem, not the moment they are choosing one.
 * Same rows, same notes, moved to where they are reached for.
 *
 * Masked with everything else: a source titled "Two pointers" names the idea a
 * journey mid-flight is still withholding.
 */
/**
 * The reading list: this problem's own sources first, then the pattern's.
 *
 * References hang off a PATTERN on purpose (see `data/types.ts`) — the good
 * sources are about the technique, and attaching them per problem would have
 * meant 153 rows of the same three links. That argument holds for a textbook
 * chapter on hashing and does NOT hold for a second site's write-up of THIS
 * problem, which is wrong on every other problem in the pattern. So both, in
 * that order, and the row says which kind it is.
 */
export function ReadFurther({
  pattern,
  problem,
}: {
  pattern: Pattern
  problem: Problem
}) {
  const own = problem.reading ?? []
  const refs = [...own, ...(pattern.references ?? [])]
  if (refs.length === 0) return null
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-baseline gap-3 px-4 py-3">
        <span className="text-meta tracking-wide text-muted-foreground uppercase">
          read further
        </span>
        <span className="ml-auto font-mono text-meta text-dim tabular-nums">
          {own.length ? `${own.length} on this problem · ` : ""}
          {refs.length} sources
        </span>
      </div>
      <ul className="divide-y border-t">
        {refs.map((r) => {
          const Icon = KIND_ICON[r.kind]
          return (
            <li key={r.href + r.title}>
              <a
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
              >
                <Icon
                  className="mt-0.5 size-4 shrink-0 text-chart-2"
                  aria-hidden
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1.5 text-ui font-medium">
                    {r.title}
                    <ExternalLinkIcon
                      className="size-3 shrink-0 text-dim"
                      aria-hidden
                    />
                  </span>
                  <span className="max-w-measure text-ui text-muted-foreground">
                    {r.note}
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** `top-16`, not `top-6`: the shell parks a fixed search control at
 *  `top-3 right-4` and this rail is the only thing that shares that corner. At
 *  1280 the button was measured painting over the rail's first entries. */
export function ContentsRail({
  outline,
  sections = [],
  problemId,
  aside,
  label = "The explanation",
}: {
  /** whose notes the rail carries */
  problemId?: string
  /** what the reader CONSULTS rather than reads: the cost to beat, and the
   *  problems that use the same move. Both were in the flow — the target
   *  scrolls away with the orient bar, and the siblings sat at the very foot,
   *  which is the one place you cannot look at while working. */
  aside?: React.ReactNode
  /** the PAGE's own sections, always known — the document's outline needs a
   *  fetch, so a rail that waited for it left the right column empty on
   *  arrival and filled it only once the reader opened the long read. At 1283
   *  that was 317px of dead width on the most-used state of the page. */
  sections?: Outline[]
  outline: Outline[]
  /** what the section this rail indexes is CALLED. Once the per-approach half
   *  folds into the rungs, that section is "The rest of the story" and a rail
   *  headed "The explanation" is indexing something the page no longer has. */
  label?: string
}) {
  const { pageRail } = usePrefs()

  // WHERE THE READER IS, tracked so the rail can say so.
  //
  // On a twenty-screen page a contents list that never moves is a map with no
  // "you are here": it says what exists and nothing about where you got to. An
  // observer is the cheap way to know — no scroll handler, no measurement every
  // frame — and its callback is asynchronous, so nothing here is the
  // synchronous setState in an effect that the React Compiler rules forbid.
  const [here, setHere] = useState<string | null>(null)
  const ids = sections.map((x) => x.id).join(",")
  useEffect(() => {
    const els = ids
      .split(",")
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const ratio = new Map<string, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratio.set(e.target.id, e.intersectionRatio)
        // the FIRST section with anything on screen, not the largest: a reader
        // is in the section they are reading down into
        const first = els.find((el) => (ratio.get(el.id) ?? 0) > 0)
        if (first) setHere(first.id)
      },
      // a band across the top of the viewport, so "here" follows the eye
      // rather than whichever section happens to be tallest
      { rootMargin: "-80px 0px -60% 0px", threshold: [0, 0.01] }
    )
    for (const el of els) io.observe(el)
    return () => io.disconnect()
  }, [ids])

  // CLOSED: a thin strip holding the control that reopens it, which is the
  // pattern the left sidebar and the journey's reading column already use —
  // a rail that vanishes entirely leaves no way back, and a reader who
  // closed it is exactly the reader who will not go looking in settings.
  //
  // The reading column takes the freed width by itself: it is
  // `max-w-reading` inside a flex row, so removing 224px of rail and its gap
  // widens the text from 689 to 768 with no arithmetic here.
  if (!pageRail)
    return (
      <div className="sticky top-16 hidden h-fit shrink-0 xl:block">
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="show the page rail"
          title="show the page rail — notes and contents (f)"
          className="text-muted-foreground"
          onClick={() => setPref("pageRail", true)}
        >
          <PanelRightOpenIcon />
        </Button>
      </div>
    )

  return (
    <nav
      aria-label="contents"
      // A STICKY COLUMN TALLER THAN THE VIEWPORT CAN NEVER SHOW ITS OWN BOTTOM.
      // `h-fit` with no bound measured 735px against a 632px viewport: the
      // notes box and the control that hides the rail sat 167px below the fold
      // and there was no way to reach them — sticky means it does not scroll
      // with the page, and nothing here scrolled on its own.
      //
      // So it is bounded by the viewport minus its own offset (`top-16`, plus
      // room to breathe) and scrolls inside itself. `overscroll-contain` keeps
      // that scroll from chaining to the document once it hits the end, which
      // is what makes a short inner column feel like a trapdoor.
      className="sticky top-16 hidden max-h-[calc(100svh-5rem)] w-56 shrink-0 flex-col gap-1 overflow-y-auto overscroll-contain border-l pl-4 xl:flex"
    >
      {sections.length > 0 && (
        <>
          <span className="flex items-center gap-1.5 pb-1 text-meta font-semibold text-foreground">
            <ListTreeIcon className="size-3.5 shrink-0 text-dim" aria-hidden />
            On this page
          </span>
          {sections.map((entry) => (
            <Entry key={entry.id} entry={entry} active={entry.id === here} />
          ))}
        </>
      )}
      {outline.length > 0 && (
        <span
          className={cn(
            "flex items-center gap-1.5 pb-1 text-meta font-semibold text-foreground",
            sections.length > 0 && "pt-4"
          )}
        >
          <ListTreeIcon className="size-3.5 shrink-0 text-dim" aria-hidden />
          {label}
        </span>
      )}
      {outline.map((entry) => (
        <Entry key={entry.id} entry={entry} />
      ))}

      {problemId && (
        <div className="pt-5">
          <ProblemNotes problemId={problemId} />
        </div>
      )}

      {/* ORDERED BY WHAT A READER REACHES FOR. "On this page" is used
          continuously while reading, the notes are written as you go, and the
          sibling problems are for when the page is behind you — so they close
          the column rather than opening it, which is where they were. */}
      {aside && <div className="flex flex-col gap-4 pt-5">{aside}</div>}

      {/* at the FOOT, like the sidebar's own collapse — the control that hides
          a column belongs at the end of it, not over its first entry */}
      <div className="flex justify-end pt-4">
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="hide the page rail"
          title="hide the page rail — wider text to read (f)"
          className="text-muted-foreground"
          onClick={() => setPref("pageRail", false)}
        >
          <PanelRightCloseIcon />
        </Button>
      </div>
    </nav>
  )
}

/** one row of the rail — the same row for the page's sections and the
 *  document's, because they are the same kind of destination */
function Entry({
  entry,
  active = false,
}: {
  entry: Outline
  active?: boolean
}) {
  return (
    <a
      href={`#${entry.id}`}
      onClick={(e) => {
        // a bare `#id` href would replace the hash ROUTE and navigate the
        // app home; scroll to the heading instead (CLAUDE.md, the trap)
        e.preventDefault()
        document
          .getElementById(entry.id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }}
      // `-ml-4 border-l-2 border-transparent pl-4` puts each entry's own
      // indicator exactly on the rail's border, so the hovered section
      // lights that hairline instead of adding a second line beside it.
      // Border and colour only — the row never moves, which is what would
      // make a 30-entry rail jitter.
      className={cn(
        // `text-ui`, not `text-meta`: several section labels run past 55
        // characters, which is the threshold this repo's own audit uses to
        // call something a SENTENCE rather than a label — and a sentence is
        // never set below the ui step.
        // The hover moves the row 2px toward its own text as the
        // indicator lights — the smallest gesture that says "this one".
        // LONGHANDS, not `transition-colors`: that utility sets
        // transition-property to the colour longhands only, so the
        // translate beside it would never animate. It is the same trap
        // that stopped home's card lift from ever running (DESIGN.md).
        "-ml-4 border-l-2 py-0.5 text-ui transition-[color,border-color,translate] hover:translate-x-0.5 hover:border-chart-1 hover:text-foreground",
        entry.level === 3 ? "pl-7 text-dim" : "pl-4 text-muted-foreground",
        // Where you are, drawn on the rail's own hairline — the same 2px
        // accent edge the sidebar uses for its active row, so "here" means
        // one thing everywhere in the app.
        active
          ? "border-chart-1 font-medium text-foreground"
          : "border-transparent"
      )}
    >
      {/* A heading's text is MARKDOWN, so it carries the author's
              emphasis markers. Backticks were already stripped; asterisks and
              underscores were not, so the rail printed
              `*(an addition — not in the data file's ladder)*` with the stars
              showing, three lines deep. Strip the marks, keep the words. */}
      {entry.text.replace(/[`*_]/g, "")}
    </a>
  )
}
