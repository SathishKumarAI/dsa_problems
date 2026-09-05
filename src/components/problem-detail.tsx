// One problem's page: statement + examples, progressive hints, walkthrough
// visualization, approach + solution. Tabs keep spoilers behind a click.
import { ArrowLeftIcon, RouteIcon } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Code, Pattern, Problem } from "@/data"
import { toggleSolved, useSolved } from "@/lib/progress"
import { journeyForProblem } from "@/engine"
import { href } from "@/lib/route"
import { MiniPlayer } from "@/features/journey/mini-player"
import { CodeBlock } from "./code-block"
import { difficultyClass } from "@/lib/difficulty"
import { setPref, usePrefs } from "@/lib/store"
import { StepPlayer } from "./step-player"

interface Props {
  problem: Problem
  pattern: Pattern
  onBack: () => void
}

const LANGS: { key: keyof Code; label: string }[] = [
  { key: "python", label: "Python 3" },
  { key: "java", label: "Java" },
  { key: "cpp", label: "C++" },
]

// One approach: cost line, summary, code with a language strip. The language
// is the same `codeTab` pref the journey uses (its "pseudo" maps to Python here).
function SolutionBlock({
  summary,
  time,
  space,
  code,
}: {
  summary: string
  time: string
  space: string
  code: Code
}) {
  const { codeTab } = usePrefs()
  const langs = LANGS.filter((l) => code[l.key])
  const lang =
    langs.find((l) => l.key === codeTab)?.key ?? ("python" as keyof Code)
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex gap-4 font-mono text-xs text-muted-foreground">
        <span>time {time}</span>
        <span>space {space}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
      {langs.length > 1 && (
        <div className="flex gap-0.5" role="tablist" aria-label="language">
          {langs.map((l) => (
            <button
              key={l.key}
              role="tab"
              aria-selected={l.key === lang}
              onClick={() => setPref("codeTab", l.key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                l.key === lang
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
      <CodeBlock code={code[lang] ?? code.python} />
    </div>
  )
}

export function ProblemDetail({ problem, pattern, onBack }: Props) {
  const solved = useSolved()
  const journey = journeyForProblem(problem.id)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          {pattern.name}
        </Button>
      </div>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold">
            {problem.title}
          </h1>
          <Badge
            variant="outline"
            className={cn("font-mono", difficultyClass[problem.difficulty])}
          >
            {problem.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-mono">{pattern.glyph}</span>
          <span className="font-mono">time {problem.complexity.time}</span>
          <span className="font-mono">space {problem.complexity.space}</span>
          <label className="ml-auto flex items-center gap-2">
            <Checkbox
              checked={solved.has(problem.id)}
              onCheckedChange={() => toggleSolved(problem.id)}
            />
            solved
          </label>
        </div>
      </header>

      <Separator />

      {journey && (
        <a
          href={href(`/journey/${journey.slug}`)}
          className="flex items-center gap-3 rounded-xl border border-chart-1/40 bg-chart-1/5 p-4 transition-colors hover:border-chart-1"
        >
          <RouteIcon className="size-5 shrink-0 text-chart-1" />
          <span className="flex flex-col">
            <b className="text-sm">Start the learning journey ▸</b>
            <span className="text-xs text-muted-foreground">
              {journey.acts.length} acts: the need, every approach earned by the
              last one's weakness, your own code animated, then the reveal.
            </span>
          </span>
        </a>
      )}

      <section className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed">{problem.statement}</p>
        <div className="flex flex-col gap-2">
          {problem.examples.map((ex, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-3 font-mono text-sm"
            >
              <div>
                <span className="text-muted-foreground">in&nbsp;&nbsp;</span>
                {ex.input}
              </div>
              <div>
                <span className="text-muted-foreground">out&nbsp;</span>
                {ex.output}
              </div>
              {ex.note && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {ex.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Tabs defaultValue="hints">
        <TabsList>
          <TabsTrigger value="hints">Hints</TabsTrigger>
          {(journey || problem.walkthrough) && (
            <TabsTrigger value="walkthrough">Walkthrough</TabsTrigger>
          )}
          <TabsTrigger value="solution">Approach & Solution</TabsTrigger>
        </TabsList>

        <TabsContent value="hints">
          <Accordion multiple={false} className="w-full">
            {problem.hints.map((hint, i) => (
              <AccordionItem key={i} value={`hint-${i}`}>
                <AccordionTrigger className="font-mono text-sm">
                  hint {i + 1} of {problem.hints.length}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {hint}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        {(journey || problem.walkthrough) && (
          <TabsContent value="walkthrough">
            {/* one source of truth: a problem with a journey draws the
                journey's own frames, not a second hand-written copy (B1) */}
            {journey ? (
              <MiniPlayer journey={journey} />
            ) : (
              <StepPlayer frames={problem.walkthrough!} />
            )}
          </TabsContent>
        )}

        <TabsContent value="solution">
          {problem.alternatives?.length ? (
            <Tabs defaultValue="optimal">
              <TabsList variant="line">
                {problem.alternatives.map((alt) => (
                  <TabsTrigger key={alt.name} value={alt.name}>
                    {alt.name}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="optimal">Optimal</TabsTrigger>
              </TabsList>
              {problem.alternatives.map((alt) => (
                <TabsContent key={alt.name} value={alt.name}>
                  <SolutionBlock
                    summary={alt.summary}
                    time={alt.complexity.time}
                    space={alt.complexity.space}
                    code={alt}
                  />
                </TabsContent>
              ))}
              <TabsContent value="optimal">
                <SolutionBlock
                  summary={problem.approach}
                  time={problem.complexity.time}
                  space={problem.complexity.space}
                  code={problem}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <SolutionBlock
              summary={problem.approach}
              time={problem.complexity.time}
              space={problem.complexity.space}
              code={problem}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
