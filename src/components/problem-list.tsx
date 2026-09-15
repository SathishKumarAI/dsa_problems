// One pattern's page: blurb header, filters, then compact problem rows.
// A pattern held three problems when this was a card list; it now holds up to
// twelve and the set is 127, so the row is one line and the filters are the
// navigation (backlog B37, B40).
//
// The filter set lives in `prefs` (lib/store.ts), not in useState: it survives
// a reload and follows you from one pattern to the next. That is only safe
// because it ANNOUNCES itself — a filtered list that looks like a short list
// is the bug, so while anything is set there is a banner saying what is on,
// how many rows it hid, and how to clear it.
import {
  FilterIcon,
  RouteIcon,
  SearchIcon,
  SearchXIcon,
} from "lucide-react"
import { href } from "@/lib/route"
import { Fact, OrientBar } from "@/components/ui/band"
import { PatternPlaybook } from "./pattern-playbook"
import { Badge } from "@/components/ui/badge"
import { DifficultyMeter } from "@/components/ui/tick-meter"
import { RowNudge } from "@/components/ui/row"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Difficulty, Pattern } from "@/data"
import { cardsOfPattern as problemsByPattern } from "@/data/manifest"
// the manifest answers "does this problem have a journey"; the journey itself
// belongs to `#/journey/<slug>` and is fetched there
import { cardForProblem as journeyForProblem } from "@/engine/manifest"
import { difficultyClass } from "@/lib/difficulty"
import {
  MASKED_GLYPH,
  MASKED_NAME,
  showSpoilers,
  usePatternMask,
} from "@/lib/disclosure"
import { toggleSolved, useSolved } from "@/lib/progress"
import type { Prefs } from "@/lib/store"
import { setPref, usePrefs } from "@/lib/store"

// One outbound reading. The mark says what KIND of source it is before the
// title says which one — a manual, a text, or a course are read differently
// and at different moments.

/** Where to go when this app runs out of road.
 *
 *  Hidden entirely while the pattern is MASKED, and that is not a detail: the
 *  titles are "Hash table", "Dijkstra's algorithm", "Binary search tree". A
 *  reading list is a pattern name written five different ways, so showing it
 *  during a journey that has not reached its reveal would hand over exactly
 *  the word the whole disclosure rule exists to withhold (B45, and the same
 *  reason the glyph and the back link are masked on the problem page). */

interface Props {
  pattern: Pattern
}

const LEVELS: Difficulty[] = ["easy", "medium", "hard"]

export function ProblemList({ pattern }: Props) {
  const {
    filterQuery: query,
    filterLevel: level,
    filterState: state,
  } = usePrefs()
  const setQuery = (v: string) => setPref("filterQuery", v)
  const setLevel = (v: Prefs["filterLevel"]) => setPref("filterLevel", v)
  const setState = (v: Prefs["filterState"]) => setPref("filterState", v)
  const clear = () => {
    setQuery("")
    setLevel("all")
    setState("all")
  }
  const solved = useSolved()
  const mask = usePatternMask()
  const hidden = mask.hidden.has(pattern.id)
  const all = problemsByPattern(pattern.id)
  // the two orient facts that are not just a length
  const withJourney = all.filter((p) => journeyForProblem(p.id)).length
  const doneHere = all.filter((p) => solved.has(p.id)).length
  const problems = all.filter((p) => {
    const done = solved.has(p.id)
    return (
      (p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.brief.toLowerCase().includes(query.toLowerCase())) &&
      (level === "all" || p.difficulty === level) &&
      (state === "all" || (state === "solved" ? done : !done))
    )
  })
  const filtering = query !== "" || level !== "all" || state !== "all"

  return (
    // max-w-page, not max-w-reading: twenty-one rows with a brief each is an
    // INDEX (DESIGN.md, Containers), and at 768 the brief truncated after six
    // words while two thirds of a 1440 screen stayed empty. The prose in the
    // header keeps its own 35em cap — the measure rule is about sentences, not
    // about the container they sit in.
    <div className="mx-auto flex w-full max-w-page flex-col gap-5">
      <header className="flex flex-col gap-2">
        {/* the glyph is the pattern's mark, so it sits ON the title's baseline
            rather than floating above it as an orphan line */}
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-mono text-ui text-primary">
            {hidden ? MASKED_GLYPH : pattern.glyph}
          </span>
          <h1 className="font-heading text-title font-semibold">
            {hidden ? MASKED_NAME : pattern.name}
          </h1>
        </div>
        {/* the one authored moment on this surface: a rule draws itself under
            the title. The title is already at full opacity above it. */}
        <span
          aria-hidden
          className="h-px w-full max-w-[35em] animate-edge-in-x bg-gradient-to-r from-primary/60 to-transparent"
        />
        {hidden ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-chart-1/40 bg-chart-1/5 p-3 text-ui">
            <span className="text-muted-foreground">
              You are midway through <b>{mask.by.get(pattern.id)}</b>, which
              builds this idea before naming it. The problems are all here — the
              name arrives at the reveal.
            </span>
            <Button size="sm" variant="outline" onClick={showSpoilers}>
              show names anyway
            </Button>
          </div>
        ) : (
          <p className="max-w-[35em] text-body text-muted-foreground">
            {pattern.blurb}
          </p>
        )}
      </header>

      {/* ── ORIENT ──────────────────────────────────────────────────────
          Three facts, and each one changes what you do next: how much there is,
          how much of it can be built up from nothing rather than read, and how
          much is behind you. Not "problems all-time" — that is review. */}
      <OrientBar>
        <Fact label="problems">
          <span className="font-mono">{all.length}</span>
        </Fact>
        <Fact label="with a journey">
          <RouteIcon className="size-3.5 shrink-0 text-chart-1" aria-hidden />
          <span className="font-mono">{withJourney}</span>
        </Fact>
        <Fact label="solved">
          <span className="font-mono">
            {doneHere}/{all.length}
          </span>
        </Fact>
      </OrientBar>

      {/* One panel: the filter bar is the head of the list it filters, not a
          separate floating control strip with the list somewhere below it.
          On the page ground these were three unrelated slabs. */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-3 p-3">
          <div className="relative">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              // a placeholder is not an accessible name: it is gone the moment
              // anything is typed, and it is announced inconsistently
              aria-label="Filter problems by title or brief"
              placeholder="Filter by title or brief…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <ToggleGroup
              size="sm"
              value={[level]}
              onValueChange={(v: string[]) =>
                setLevel((v[0] as Prefs["filterLevel"]) ?? "all")
              }
              aria-label="filter by difficulty"
            >
              <ToggleGroupItem value="all">all</ToggleGroupItem>
              {LEVELS.map((d) => (
                <ToggleGroupItem key={d} value={d}>
                  {d}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              size="sm"
              value={[state]}
              onValueChange={(v: string[]) =>
                setState((v[0] as Prefs["filterState"]) ?? "all")
              }
              aria-label="filter by solved state"
            >
              <ToggleGroupItem value="all">any</ToggleGroupItem>
              <ToggleGroupItem value="unsolved">unsolved</ToggleGroupItem>
              <ToggleGroupItem value="solved">solved</ToggleGroupItem>
            </ToggleGroup>
            <span
              className="ml-auto font-mono text-meta text-muted-foreground tabular-nums"
              aria-live="polite"
            >
              {problems.length}/{all.length}
            </span>
          </div>
        </div>

        {filtering && (
          <div
            data-testid="filter-banner"
            className="flex flex-wrap items-center gap-2 border-t border-chart-1/40 bg-chart-1/5 px-3 py-2 text-ui"
            aria-live="polite"
          >
            <FilterIcon className="size-4 shrink-0 text-chart-1" />
            <span className="text-muted-foreground">
              Filtered — showing{" "}
              <b className="text-foreground tabular-nums">{problems.length}</b>{" "}
              of <span className="tabular-nums">{all.length}</span>
            </span>
            {level !== "all" && (
              <Badge variant="outline" className="font-mono">
                {level}
              </Badge>
            )}
            {state !== "all" && (
              <Badge variant="outline" className="font-mono">
                {state}
              </Badge>
            )}
            {query !== "" && (
              <Badge variant="outline" className="max-w-40 truncate font-mono">
                “{query}”
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto text-muted-foreground"
              onClick={clear}
            >
              Clear filters
            </Button>
          </div>
        )}

        {problems.length === 0 ? (
          <Empty className="border-t">
            <EmptyHeader>
              {/* a wordless first read of the state, before the sentence */}
              <EmptyMedia variant="icon">
                <SearchXIcon />
              </EmptyMedia>
              <EmptyTitle>Nothing matches</EmptyTitle>
              <EmptyDescription>
                {all.length} problem{all.length === 1 ? "" : "s"} here, none of
                them matching these filters.
              </EmptyDescription>
            </EmptyHeader>
            <Button size="sm" variant="outline" onClick={clear}>
              Clear filters
            </Button>
          </Empty>
        ) : (
          <ul className="flex flex-col divide-y border-t">
            {problems.map((p) => {
              const done = solved.has(p.id)
              return (
                <li
                  key={p.id}
                  className="group flex items-center gap-3 px-3 py-2 transition-colors hover:bg-accent/40"
                >
                  <Checkbox
                    checked={done}
                    onCheckedChange={() => toggleSolved(p.id)}
                    aria-label={`Mark ${p.title} solved`}
                  />
                  {/* An ANCHOR, not a button. This is the app's catalogue —
                      the way into every problem — and a button cannot be
                      middle-clicked into a new tab, offers no "open in new
                      tab" on right-click, and shows the browser no
                      destination on hover. The sidebar's own header states
                      the rule ("every entry a hash link so back/forward and
                      middle-click work"); this row was the one place that
                      broke it, and it is the row that matters most. */}
                  <a
                    href={href(`/p/${pattern.id}/${p.id}`)}
                    className="flex min-w-0 flex-1 items-baseline gap-2 text-left"
                  >
                    {/* NOT shrink-0: at 390 the title and the difficulty badge
                        were both unshrinkable, so twelve of the twenty-one
                        rows drew the badge ON TOP of the last two words
                        (measured on a 390x844 screenshot). The title
                        truncates instead, and the brief — the first thing a
                        phone can afford to drop — appears from sm. */}
                    <span
                      className={cn(
                        "min-w-0 truncate text-body font-medium",
                        done && "text-muted-foreground line-through"
                      )}
                    >
                      {p.title}
                    </span>
                    {journeyForProblem(p.id) && (
                      <RouteIcon
                        className="size-3.5 shrink-0 text-chart-1"
                        aria-label="has a full journey"
                      />
                    )}
                    <span className="hidden truncate text-ui text-muted-foreground sm:block">
                      {p.brief}
                    </span>
                  </a>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 font-mono",
                      difficultyClass[p.difficulty]
                    )}
                  >
                    <DifficultyMeter difficulty={p.difficulty} />
                    {p.difficulty}
                  </Badge>
                  {/* hidden on a phone: there is no hover there for it to
                      answer, and the row needs every pixel for the title */}
                  <RowNudge className="hidden sm:block" />
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* ── REVIEW ───────────────────────────────────────────────────────
          How to recognise this pattern and how to write it, then where to read
          about it properly. Both were on `#/resources`, a second page about the
          same pattern; this page had the references and not the moves, that one
          had the moves and the same references. One noun, one page.

          A masked pattern shows NEITHER. A playbook is the pattern's name
          written a dozen different ways — "two pointers converging", "hash map
          as an index" — so rendering one during a journey that has not reached
          its reveal hands over the exact word the rule exists to withhold. */}
      {!hidden && (
        <PatternPlaybook name={pattern.name} playbook={pattern.playbook ?? []} />
      )}
    </div>
  )
}
