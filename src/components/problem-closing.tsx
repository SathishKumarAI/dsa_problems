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
  label = "The explanation",
}: {
  /** whose notes the rail carries */
  problemId?: string
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
      className="sticky top-16 hidden h-fit w-56 shrink-0 flex-col gap-1 border-l pl-4 xl:flex"
    >
      {sections.length > 0 && (
        <>
          <span className="flex items-center gap-1.5 pb-1 text-meta font-semibold text-foreground">
            <ListTreeIcon className="size-3.5 shrink-0 text-dim" aria-hidden />
            On this page
          </span>
          {sections.map((entry) => (
            <Entry key={entry.id} entry={entry} />
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
function Entry({ entry }: { entry: Outline }) {
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
        "-ml-4 border-l-2 border-transparent py-0.5 text-ui transition-[color,border-color,translate] hover:translate-x-0.5 hover:border-chart-1 hover:text-foreground",
        entry.level === 3 ? "pl-7 text-dim" : "pl-4 text-muted-foreground"
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
