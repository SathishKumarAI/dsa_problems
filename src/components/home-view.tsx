// Landing page: overall progress + pattern grid.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PATTERNS, PROBLEMS, problemsByPattern } from "@/data"
import { useSolved } from "@/lib/progress"

export function HomeView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const solved = useSolved()
  const total = PROBLEMS.length
  const done = PROBLEMS.filter((p) => solved.has(p.id)).length

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-2 pt-4">
        <h1 className="font-mono text-3xl font-semibold tracking-tight">
          dsa<span className="text-primary">.patterns</span>
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Interview prep organized the way problems are actually solved: by the pattern that
          cracks them. Each problem has progressive hints, a step-by-step walkthrough of the
          approach, and a worked Python solution.
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">progress</span>
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
