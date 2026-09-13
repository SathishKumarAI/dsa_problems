// Home, in three tiers rather than one grid.
//
// It used to be four stacks of same-size cards — a dock-less console, where a
// journey you are halfway through and a pattern you have never opened had the
// same weight, the same width and the same shadow. 1738 px of page at 1440,
// and nothing on it said "here".
//
// Now: ONE raised surface (the dock — resume, or start), then dense rows for
// the journeys, then denser rows for the catalogue. A row is a row: nothing on
// this page is a card inside a card, and the only thing that lifts off the
// page is the thing you came back to do.
import { useState } from "react"
import {
  ChevronDownIcon,
  CircleCheckIcon,
  FlameIcon,
  PlayIcon,
  RouteIcon,
  SlidersHorizontalIcon,
  StarIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RowNudge, RowProgress } from "@/components/ui/row"
import { PATTERNS, PROBLEMS, problemsByPattern } from "@/data"
import { JOURNEYS } from "@/engine"
import { MASKED_GLYPH, MASKED_NAME, usePatternMask } from "@/lib/disclosure"
import { earnedOf, useEarned, useSolved } from "@/lib/progress"
import type { Earned } from "@/lib/progress"
import { href } from "@/lib/route"
import { K, getStored, streakOf, useStored, useStoreVersion } from "@/lib/store"
import { cn } from "@/lib/utils"

// one store key per journey is more than a hook may subscribe to in a loop, so
// callers re-render on any store write (useStoreVersion) and read the getters
const ledgerOf = () =>
  JOURNEYS.map((j) => ({
    journey: j,
    earned: earnedOf(getStored<number>(K.unlocked(j.slug), 1), j.acts.length),
  }))

// ---------------------------------------------------------------------------
// tier 1 — the dock
// ---------------------------------------------------------------------------

/** The acts, as a row of tick marks. It says nothing a learner has not already
 *  earned — the count beside it is the same number in words — but it turns
 *  "2 of 6" into a shape you read without counting. */
function ActTicks({ earned }: { earned: Earned }) {
  return (
    <div aria-hidden className="flex gap-1">
      {Array.from({ length: earned.total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 w-6 rounded-full",
            // an EARNED tick draws itself in, left to right, on the same
            // 320ms edge the dock's accent bar uses — so the shape of "how
            // far you got" is the thing that moves when you come back, and
            // the unearned ones sit still. Reduced motion zeroes it globally.
            i < earned.earned ? "animate-edge-in-x bg-primary" : "bg-border"
          )}
        />
      ))}
    </div>
  )
}

/** The one primary surface on the page. Resuming when something is started and
 *  unfinished, an invitation when nothing is — but it is ALWAYS here, because
 *  a home page whose most important element is conditional is a home page with
 *  no shape on the day it matters most (U13 fixed the content; this fixes the
 *  hierarchy). The copy differs, and only the resuming one says "pick up where
 *  you left off" — the UI test reads that phrase as the signal. */
function Dock() {
  useStoreVersion()
  const ledger = ledgerOf()
  const resuming = ledger
    .filter((r) => r.earned.earned > 0 && !r.earned.done)
    .sort((a, b) => b.earned.earned - a.earned.earned)[0]
  const next =
    resuming ?? ledger.find((r) => r.earned.earned === 0) ?? ledger[0]
  if (!next) return null
  const { journey, earned } = next
  const act = journey.acts[Math.min(earned.earned, journey.acts.length - 1)]
  return (
    <a
      href={href(`/journey/${journey.slug}?act=${act.key}`)}
      data-surface="raised"
      data-testid="dock"
      className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-primary/25 bg-card p-5 md:p-6"
    >
      {/* the authored moment: the accent edge draws itself down the surface */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[2px] animate-edge-in-y bg-primary"
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <PlayIcon className="size-4 shrink-0 text-primary" />
        <span className="text-meta font-medium tracking-wide text-primary uppercase">
          {resuming ? "pick up where you left off" : "start here"}
        </span>
        <span className="ml-auto font-mono text-meta text-dim tabular-nums">
          {earned.long}
        </span>
        <RowNudge as="arrow" />
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <b className="font-heading text-title font-semibold">{journey.title}</b>
        <span className="text-ui text-muted-foreground">
          {resuming ? "next" : "opens with"}: {act.name} · {act.short}
        </span>
      </div>
      <ActTicks earned={earned} />
    </a>
  )
}

// ---------------------------------------------------------------------------
// tier 2 — the journeys, as rows
// ---------------------------------------------------------------------------

/** A row, not a card. Its progress is the row's own bottom hairline, which is
 *  the cheapest bar there is: at 0 % it draws nothing, so an unstarted list
 *  stays quiet instead of showing eleven empty troughs. */
function JourneyRow({
  slug,
  title,
  subtitle,
  acts,
}: {
  slug: string
  title: string
  subtitle: string
  acts: number
}) {
  const earned = useEarned(slug, acts)
  return (
    <li>
      <a
        href={href(`/journey/${slug}`)}
        className="group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
      >
        <RouteIcon className="size-4 shrink-0 text-chart-1" />
        <span className="min-w-0 flex-1 truncate text-ui font-medium md:w-52 md:flex-none md:shrink-0">
          {title}
        </span>
        <span className="hidden min-w-0 flex-1 truncate text-ui text-muted-foreground md:block">
          {subtitle}
        </span>
        <span className="ml-auto shrink-0 font-mono text-meta text-dim tabular-nums">
          {earned.done ? "complete" : `${earned.short} earned`}
        </span>
        <RowNudge />
        <RowProgress pct={earned.pct} />
      </a>
    </li>
  )
}

// ---------------------------------------------------------------------------
// tier 3 — the catalogue, as rows
// ---------------------------------------------------------------------------

function PatternRow({
  id,
  glyph,
  name,
  blurb,
  done,
  total,
  masked,
  onOpen,
}: {
  id: string
  glyph: string
  name: string
  blurb: string
  done: number
  total: number
  masked: boolean
  onOpen: (id: string) => void
}) {
  const pct = total ? (done / total) * 100 : 0
  return (
    // `min-w-0`: a grid item's default `min-width: auto` makes the column no
    // narrower than the row's MIN-CONTENT — glyph + text + count + chevron —
    // and adding the chevron pushed that floor past half the container, taking
    // the whole page 10px sideways at 1440 (scrollWidth 1440 vs clientWidth
    // 1430, measured). Same trap, same fix, as the markdown column.
    <li className="min-w-0 border-t sm:even:border-l">
      <button
        className="group relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40"
        onClick={() => onOpen(id)}
      >
        <span className="w-20 shrink-0 pt-0.5 font-mono text-meta text-primary">
          {glyph}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              "truncate text-ui font-medium",
              masked && "text-muted-foreground italic"
            )}
          >
            {name}
          </span>
          {/* two lines, not one: every blurb in the set fits inside two at
              this column width, and `truncate` was cutting the half of the
              sentence that says what the pattern is FOR. */}
          <span className="line-clamp-2 text-ui text-muted-foreground">
            {blurb}
          </span>
        </span>
        <span className="shrink-0 pt-0.5 font-mono text-meta text-dim tabular-nums">
          {done}/{total}
        </span>
        <RowNudge className="mt-0.5" />
        <RowProgress pct={pct} tone="done" />
      </button>
    </li>
  )
}

// ---------------------------------------------------------------------------

export function HomeView({
  onNavigate,
}: {
  onNavigate: (view: string) => void
}) {
  const [allJourneys, setAllJourneys] = useState(false)
  useStoreVersion()
  const ledger = ledgerOf()
  // 87 rows is a catalogue, not a menu. Lead with what is in play — started
  // and unfinished first, then the next few — and put the rest behind a click.
  const started = ledger.filter((r) => r.earned.earned > 0 && !r.earned.done)
  const shownJourneys = allJourneys
    ? JOURNEYS
    : [...started, ...ledger.filter((r) => r.earned.earned === 0)]
        .slice(0, Math.max(5, started.length))
        .map((r) => r.journey)
  const solved = useSolved()
  const days = useStored<string[]>(K.days, [])
  const xp = useStored<number>(K.xp, 0)
  const streak = streakOf(days)
  const mask = usePatternMask()
  const total = PROBLEMS.length
  const done = PROBLEMS.filter((p) => solved.has(p.id)).length

  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 className="font-mono text-display font-semibold tracking-tight">
            dsa<span className="text-primary">.patterns</span>
          </h1>
          {/* the readout: three numbers, hairline-separated, set in the data
              face with tabular figures so they do not jitter as they climb */}
          <div className="flex items-center gap-3 divide-x divide-border font-mono text-meta text-dim tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <FlameIcon className="size-3.5 text-chart-4" />
              {streak} day streak
            </span>
            <span className="inline-flex items-center gap-1.5 pl-3">
              <StarIcon className="size-3.5" aria-hidden />
              {xp} XP
            </span>
            <span className="inline-flex items-center gap-1.5 pl-3">
              <CircleCheckIcon className="size-3.5" aria-hidden />
              {done}/{total} solved
            </span>
          </div>
        </div>
        <p className="max-w-[35em] text-body text-muted-foreground">
          Feel the weakness, earn the insight, then learn its name. Three
          problems are built all the way down — story, the corner cases to
          bring, approaches you unlock one at a time, your own code as the
          animation, the reveal. The rest of the catalogue has hints, a
          walkthrough and worked code.
        </p>
      </header>

      <Dock />

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-baseline gap-3 px-4 py-3">
          <span className="text-meta tracking-wide text-muted-foreground uppercase">
            learning journeys
          </span>
          <span className="ml-auto font-mono text-meta text-dim tabular-nums">
            {shownJourneys.length}/{JOURNEYS.length}
          </span>
        </div>
        <ul className="divide-y border-t">
          {shownJourneys.map((j) => (
            <JourneyRow
              key={j.slug}
              slug={j.slug}
              title={j.title}
              subtitle={j.subtitle}
              acts={j.acts.length}
            />
          ))}
        </ul>
        {/* Both ways, for the same reason as the sidebar: this used to hide
            itself once expanded, stranding the reader in an 87-row list. */}
        {(allJourneys || JOURNEYS.length > shownJourneys.length) && (
          <Button
            variant="ghost"
            className="w-full justify-start rounded-none border-t px-4 text-muted-foreground"
            onClick={() => setAllJourneys((v) => !v)}
            aria-expanded={allJourneys}
          >
            <ChevronDownIcon
              data-icon="inline-start"
              className={cn(
                "transition-transform",
                allJourneys && "rotate-180"
              )}
            />
            {allJourneys
              ? "Show only the journeys in play"
              : `Show all ${JOURNEYS.length} journeys`}
          </Button>
        )}
      </section>

      <a
        href={href("/algorithms")}
        className="group flex items-center gap-3 rounded-xl border border-dashed bg-card/50 px-4 py-3 text-ui"
      >
        <SlidersHorizontalIcon className="size-4 shrink-0 text-chart-2" />
        <span className="min-w-0">
          <b>Algorithm visualizer</b>{" "}
          <span className="text-muted-foreground">
            — six sorts, binary search, BFS / DFS / Dijkstra, step by step
          </span>
        </span>
        <RowNudge as="arrow" className="ml-auto" />
      </a>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-baseline gap-3 px-4 py-3">
          <span className="text-meta tracking-wide text-muted-foreground uppercase">
            practice set
          </span>
          <span className="ml-auto font-mono text-meta text-dim tabular-nums">
            {done}/{total} solved
          </span>
        </div>
        <ul className="grid sm:grid-cols-2">
          {PATTERNS.map((p) => {
            const problems = problemsByPattern(p.id)
            const patternDone = problems.filter((pr) =>
              solved.has(pr.id)
            ).length
            // masked while a started journey is still building this idea
            const hidden = mask.hidden.has(p.id)
            return (
              <PatternRow
                key={p.id}
                id={p.id}
                glyph={hidden ? MASKED_GLYPH : p.glyph}
                name={hidden ? MASKED_NAME : p.name}
                blurb={
                  hidden
                    ? `the name arrives at the end of ${mask.by.get(p.id)}`
                    : p.blurb
                }
                done={patternDone}
                total={problems.length}
                masked={hidden}
                onOpen={onNavigate}
              />
            )
          })}
        </ul>
      </section>
    </div>
  )
}
