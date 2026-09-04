// Landing page: the method in one line, the two journeys (the deep builds)
// with earned-act progress, the streak, then the pattern grid.
import { FlameIcon, RouteIcon, SlidersHorizontalIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PATTERNS, PROBLEMS, problemsByPattern } from "@/data"
import { JOURNEYS } from "@/engine"
import { useSolved } from "@/lib/progress"
import { href } from "@/lib/route"
import { K, streakOf, useStored } from "@/lib/store"

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
  const unlocked = Math.min(useStored<number>(K.unlocked(slug), 1), acts)
  const pct = ((unlocked - 1) / (acts - 1)) * 100
  return (
    <a
      href={href(`/journey/${slug}`)}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/60"
    >
      <div className="flex items-center gap-2">
        <RouteIcon className="size-4 text-chart-1" />
        <span className="font-medium">{title}</span>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {unlocked >= acts ? "complete" : `${unlocked - 1}/${acts - 1} earned`}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-chart-1 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </a>
  )
}

export function HomeView({
  onNavigate,
}: {
  onNavigate: (view: string) => void
}) {
  const solved = useSolved()
  const days = useStored<string[]>(K.days, [])
  const xp = useStored<number>(K.xp, 0)
  const streak = streakOf(days)
  const total = PROBLEMS.length
  const done = PROBLEMS.filter((p) => solved.has(p.id)).length

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-3 pt-4">
        <h1 className="font-mono text-3xl font-semibold tracking-tight">
          dsa<span className="text-primary">.patterns</span>
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Feel the weakness, earn the insight, then learn its name. Two problems
          are built all the way down — story, four approaches you unlock one at
          a time, your own code as the animation, the reveal. The rest of the
          catalogue has hints, a walkthrough and worked Python.
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <FlameIcon className="size-3.5 text-chart-4" /> {streak} day streak
          </span>
          <span className="font-mono">★ {xp} XP</span>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
          learning journeys
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {JOURNEYS.map((j) => (
            <JourneyCard
              key={j.slug}
              slug={j.slug}
              title={j.title}
              subtitle={j.subtitle}
              acts={j.acts.length}
            />
          ))}
          <a
            href={href("/algorithms")}
            className="flex items-center gap-3 rounded-xl border border-dashed bg-card/50 p-4 text-sm transition-colors hover:border-primary/60 sm:col-span-2"
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
          <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
            practice set
          </span>
          <span className="font-mono text-sm tabular-nums">
            {done}/{total} solved
          </span>
        </div>
        <Progress value={total ? (done / total) * 100 : 0} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {PATTERNS.map((p) => {
          const problems = problemsByPattern(p.id)
          const patternDone = problems.filter((pr) => solved.has(pr.id)).length
          return (
            <Card
              key={p.id}
              className="cursor-pointer transition-colors hover:border-primary/50"
              onClick={() => onNavigate(p.id)}
            >
              <CardHeader>
                <div className="font-mono text-xs text-primary">{p.glyph}</div>
                <CardTitle className="text-base">{p.name}</CardTitle>
                <CardDescription>{p.blurb}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
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
