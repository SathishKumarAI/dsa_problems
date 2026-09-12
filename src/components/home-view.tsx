// Landing page: the method in one line, the two journeys (the deep builds)
// with earned-act progress, the streak, then the pattern grid.
import { useState } from "react"
import {
  ChevronDownIcon,
  FlameIcon,
  PlayIcon,
  RouteIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PATTERNS, PROBLEMS, problemsByPattern } from "@/data"
import { JOURNEYS } from "@/engine"
import { MASKED_GLYPH, MASKED_NAME, usePatternMask } from "@/lib/disclosure"
import { earnedOf, useEarned, useSolved } from "@/lib/progress"
import { href } from "@/lib/route"
import { K, getStored, streakOf, useStored, useStoreVersion } from "@/lib/store"
import { cn } from "@/lib/utils"

function JourneyCard({
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
    <a
      href={href(`/journey/${slug}`)}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/60"
    >
      <div className="flex items-center gap-2">
        <RouteIcon className="size-4 text-chart-1" />
        <span className="font-medium">{title}</span>
        <span className="ml-auto font-mono text-meta text-muted-foreground">
          {earned.done ? "complete" : `${earned.short} earned`}
        </span>
      </div>
      <p className="text-ui text-muted-foreground">{subtitle}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-chart-1 transition-[width]"
          style={{ width: `${earned.pct}%` }}
        />
      </div>
    </a>
  )
}

// The one journey worth resuming: started, unfinished, and the furthest along.
// Without this the page looks identical whether you have finished nothing or
// everything, and the streak has nothing to be about (UX audit U13).
function ResumeCard() {
  // one key per journey is more than a hook may subscribe to in a loop, so
  // re-render on any store write and then read the plain getters
  useStoreVersion()
  const ledger = JOURNEYS.map((j) => ({
    journey: j,
    earned: earnedOf(getStored<number>(K.unlocked(j.slug), 1), j.acts.length),
  }))
  const next = ledger
    .filter((r) => r.earned.earned > 0 && !r.earned.done)
    .sort((a, b) => b.earned.earned - a.earned.earned)[0]
  if (!next) return null
  const { journey, earned } = next
  const act = journey.acts[Math.min(earned.earned, journey.acts.length - 1)]
  return (
    <a
      href={href(`/journey/${journey.slug}?act=${act.key}`)}
      className="flex flex-col gap-2 rounded-xl border border-chart-1/40 bg-chart-1/5 p-4 transition-colors hover:border-chart-1"
    >
      <div className="flex items-center gap-2">
        <PlayIcon className="size-4 text-chart-1" />
        <span className="text-meta tracking-wide text-chart-1 uppercase">
          pick up where you left off
        </span>
        <span className="ml-auto font-mono text-meta text-muted-foreground">
          {earned.long}
        </span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3">
        <b className="text-body">{journey.title}</b>
        <span className="text-ui text-muted-foreground">
          next: {act.name} · {act.short}
        </span>
      </div>
    </a>
  )
}

export function HomeView({
  onNavigate,
}: {
  onNavigate: (view: string) => void
}) {
  const [allJourneys, setAllJourneys] = useState(false)
  // one key per journey is more than a hook may subscribe to in a loop, so
  // re-render on any store write and read the plain getters
  useStoreVersion()
  const ledger = JOURNEYS.map((j) => ({
    journey: j,
    earned: earnedOf(getStored<number>(K.unlocked(j.slug), 1), j.acts.length),
  }))
  // 45 cards buried the practice set four screens down. Lead with what is in
  // play — started and unfinished first, then the next few — and put the
  // catalogue behind one click.
  const started = ledger.filter((r) => r.earned.earned > 0 && !r.earned.done)
  const shownJourneys = allJourneys
    ? JOURNEYS
    : [...started, ...ledger.filter((r) => r.earned.earned === 0)]
        .slice(0, Math.max(4, started.length))
        .map((r) => r.journey)
  const solved = useSolved()
  const days = useStored<string[]>(K.days, [])
  const xp = useStored<number>(K.xp, 0)
  const streak = streakOf(days)
  const mask = usePatternMask()
  const total = PROBLEMS.length
  const done = PROBLEMS.filter((p) => solved.has(p.id)).length

  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-8">
      <header className="flex flex-col gap-3 pt-4">
        <h1 className="font-mono text-display font-semibold tracking-tight">
          dsa<span className="text-primary">.patterns</span>
        </h1>
        <p className="max-w-[35em] text-body text-muted-foreground">
          Feel the weakness, earn the insight, then learn its name. Three
          problems are built all the way down — story, the corner cases to
          bring, approaches you unlock one at a time, your own code as the
          animation, the reveal. The rest of the catalogue has hints, a
          walkthrough and worked code.
        </p>
        <div className="flex flex-wrap gap-4 text-meta text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <FlameIcon className="size-3.5 text-chart-4" /> {streak} day streak
          </span>
          <span className="font-mono">★ {xp} XP</span>
        </div>
      </header>

      <ResumeCard />

      <section className="flex flex-col gap-3">
        <div className="text-meta tracking-wide text-muted-foreground uppercase">
          learning journeys
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {shownJourneys.map((j) => (
            <JourneyCard
              key={j.slug}
              slug={j.slug}
              title={j.title}
              subtitle={j.subtitle}
              acts={j.acts.length}
            />
          ))}
          {/* Both ways, for the same reason as the sidebar: this used to hide
              itself once expanded, stranding the reader in a 46-card list. */}
          {(allJourneys || JOURNEYS.length > shownJourneys.length) && (
            <Button
              variant="outline"
              className="h-auto justify-start py-4 text-muted-foreground sm:col-span-2"
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
          <a
            href={href("/algorithms")}
            className="flex items-center gap-3 rounded-xl border border-dashed bg-card/50 p-4 text-ui transition-colors hover:border-primary/60 sm:col-span-2"
          >
            <SlidersHorizontalIcon className="size-4 text-chart-2" />
            <span>
              <b>Algorithm visualizer</b>{" "}
              <span className="text-muted-foreground">
                — six sorts, binary search, BFS / DFS / Dijkstra, step by step
              </span>
            </span>
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-meta tracking-wide text-muted-foreground uppercase">
            practice set
          </span>
          <span className="font-mono text-ui tabular-nums">
            {done}/{total} solved
          </span>
        </div>
        <Progress value={total ? (done / total) * 100 : 0} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {PATTERNS.map((p) => {
          const problems = problemsByPattern(p.id)
          const patternDone = problems.filter((pr) => solved.has(pr.id)).length
          // masked while a started journey is still building this idea
          const hidden = mask.hidden.has(p.id)
          return (
            <Card
              key={p.id}
              className="cursor-pointer transition-colors hover:border-primary/50"
              onClick={() => onNavigate(p.id)}
            >
              <CardHeader>
                <div className="font-mono text-meta text-primary">
                  {hidden ? MASKED_GLYPH : p.glyph}
                </div>
                <CardTitle
                  className={hidden ? "text-body italic" : "text-body"}
                >
                  {hidden ? MASKED_NAME : p.name}
                </CardTitle>
                <CardDescription>
                  {hidden
                    ? `the name arrives at the end of ${mask.by.get(p.id)}`
                    : p.blurb}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="font-mono text-meta text-muted-foreground tabular-nums">
                  {patternDone}/{problems.length} solved
                </span>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
