// One problem's page: statement, constraints and examples, then progressive
// hints, the walkthrough, and the approach ladder — every way in, worst to
// best, each rung carrying the weakness in the one before it (R1). Tabs keep
// spoilers behind a click; the primary action is solving it on LeetCode,
// because this page explains and does not host an editor.
import { ArrowLeftIcon, ExternalLinkIcon, RouteIcon } from "lucide-react"
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
import type { AnyJourney } from "@/engine"
import { ladderOf, leetcodeUrl } from "@/lib/ladder"
import { K, useStored } from "@/lib/store"
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
function SolutionBlock({ summary, code }: { summary: string; code: Code }) {
  const { codeTab } = usePrefs()
  const langs = LANGS.filter((l) => code[l.key])
  const lang =
    langs.find((l) => l.key === codeTab)?.key ?? ("python" as keyof Code)
  return (
    <div className="flex flex-col gap-4 pt-2">
      <p className="max-w-[35em] text-body text-muted-foreground">{summary}</p>
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

// The ladder. Rungs read worst → best; the "why now" line sits BETWEEN them,
// because it belongs to the step from one to the next, not to either rung.
function ApproachLadder({
  problem,
  journey,
}: {
  problem: Problem
  journey?: AnyJourney
}) {
  const unlocked = Math.max(
    useStored<number>(K.unlocked(journey?.slug ?? ""), 1),
    1
  )
  const { rungs, capped, hidden } = ladderOf(problem, journey, unlocked)
  return (
    <div className="flex flex-col gap-6 pt-2" aria-label="approach ladder">
      {rungs.map((r, i) => (
        <div key={r.key} className="flex flex-col gap-3">
          {r.whyNow && (
            <p className="max-w-[35em] border-l-2 border-chart-1/60 pl-3 text-body text-chart-1">
              {r.whyNow}
            </p>
          )}
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-mono text-meta text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <b className="text-body">{r.name}</b>
            <span className="font-mono text-xs text-muted-foreground">
              {r.cost}
            </span>
          </div>
          <SolutionBlock summary={r.idea} code={r.code} />
        </div>
      ))}
      {capped && journey && (
        <p className="text-ui text-muted-foreground">
          {hidden} more {hidden === 1 ? "approach is" : "approaches are"} still
          ahead of you.{" "}
          <a
            href={href(`/journey/${journey.slug}`)}
            className="text-chart-1 underline-offset-2 hover:underline"
          >
            Continue the journey ▸
          </a>{" "}
          — each one opens when the previous one runs out of road.
        </p>
      )}
    </div>
  )
}

export function ProblemDetail({ problem, pattern, onBack }: Props) {
  const solved = useSolved()
  const journey = journeyForProblem(problem.id)

  return (
    <div className="mx-auto flex w-full max-w-reading flex-col gap-6">
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
          <h1 className="font-heading text-title font-semibold">
            {problem.title}
          </h1>
          <Badge
            variant="outline"
            className={cn("font-mono", difficultyClass[problem.difficulty])}
          >
            {problem.difficulty}
          </Badge>
        </div>
        {/* the page explains; the learner writes and submits the code on
            LeetCode, so that is the primary action and there is no editor */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={leetcodeUrl(problem.leetcode)}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Solve on LeetCode
            <ExternalLinkIcon className="size-4" />
          </a>
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
            <b className="text-body">Start the learning journey ▸</b>
            <span className="text-ui text-muted-foreground">
              {journey.acts.length} acts: the need, every approach earned by the
              last one's weakness, your own code animated, then the reveal.
            </span>
          </span>
        </a>
      )}

      <section className="flex flex-col gap-4">
        <p className="max-w-[35em] text-body">{problem.statement}</p>
        {/* the promises the input makes — a corner case is trivia until a
            constraint makes it a decision (R2) */}
        <div className="flex flex-col gap-1.5" aria-label="constraints">
          <div className="text-meta tracking-wide text-muted-foreground uppercase">
            constraints
          </div>
          <ul className="flex flex-col gap-1">
            {problem.constraints.map((c, i) => (
              <li
                key={i}
                className="flex max-w-[35em] gap-2 text-ui text-muted-foreground"
              >
                <span className="text-chart-1">·</span>
                <span className="font-mono">{c}</span>
              </li>
            ))}
          </ul>
        </div>
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
          <TabsTrigger value="solution">Approaches</TabsTrigger>
        </TabsList>

        <TabsContent value="hints">
          <Accordion multiple={false} className="w-full">
            {problem.hints.map((hint, i) => (
              <AccordionItem key={i} value={`hint-${i}`}>
                <AccordionTrigger className="font-mono text-sm">
                  hint {i + 1} of {problem.hints.length}
                </AccordionTrigger>
                <AccordionContent className="max-w-[35em] text-body text-muted-foreground">
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
          <ApproachLadder problem={problem} journey={journey} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
