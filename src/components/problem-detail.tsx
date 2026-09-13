// One problem's page, read top to bottom: statement, constraints and examples,
// then the hint ladder, the walkthrough, and every approach in build order, each
// rung carrying the weakness in the one before it (R1). The primary action is
// solving it on LeetCode, because this page explains and does not host an editor.
//
// It is NOT tabbed (B38). 42 of 87 problems have no journey, so tabs were doing
// hiding that no ledger asked for — three sections behind clicks on a page whose
// whole job is to explain. Where gating IS due it is already done by the ledger:
// `ladderOf` caps the rungs a started journey has not earned, and MiniPlayer
// caps the walkthrough the same way. Hints stay collapsed because that gate
// belongs to the learner, not to the page.
import {
  ArrowLeftIcon,
  BookOpenIcon,
  ExternalLinkIcon,
  RouteIcon,
} from "lucide-react"
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
import { cn } from "@/lib/utils"
import type { Code, Pattern, Problem } from "@/data"
import { toggleSolved, useSolved } from "@/lib/progress"
import { journeyForProblem } from "@/engine"
import type { AnyJourney } from "@/engine"
import {
  MASKED_GLYPH,
  MASKED_NAME,
  usePatternMask,
} from "@/lib/disclosure"
import { ladderOf, leetcodeUrl } from "@/lib/ladder"
import type { Rung } from "@/lib/ladder"
import { K, useStored } from "@/lib/store"
import { href } from "@/lib/route"
import { hasDeepDoc } from "@/lib/deep-docs"
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

// A labelled band. The label states what the section holds and how much of it,
// so the page advertises its own depth instead of making the reader click to
// find out there was nothing there.
function Section({
  label,
  count,
  children,
}: {
  label: string
  count?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-baseline gap-3 text-meta tracking-wide text-muted-foreground uppercase">
        {label}
        {/* the rule is the separator: a filled divider would add a third
            horizontal line to a page that already has borders and code blocks */}
        <span
          aria-hidden
          className="h-px flex-1 translate-y-[-0.15em] bg-gradient-to-r from-border to-transparent"
        />
        {count && <span className="font-mono normal-case text-dim">{count}</span>}
      </h2>
      {children}
    </section>
  )
}

// One language strip for the whole ladder. It was repeated per rung, and since
// every copy wrote the same `codeTab` pref, three controls moved as one — which
// reads as a bug whichever one you touch.
function LanguageStrip({ langs }: { langs: (keyof Code)[] }) {
  const { codeTab } = usePrefs()
  if (langs.length < 2) return null
  const lang = langs.includes(codeTab as keyof Code) ? codeTab : "python"
  return (
    <div className="flex gap-0.5" role="tablist" aria-label="language">
      {LANGS.filter((l) => langs.includes(l.key)).map((l) => (
        <button
          key={l.key}
          role="tab"
          aria-selected={l.key === lang}
          onClick={() => setPref("codeTab", l.key)}
          className={cn(
            "rounded-md px-2.5 py-1 text-meta font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            l.key === lang
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

function RungCode({ code }: { code: Code }) {
  const { codeTab } = usePrefs()
  const lang = (code[codeTab as keyof Code] ? codeTab : "python") as keyof Code
  return <CodeBlock code={code[lang] ?? code.python} />
}

// The ladder. Rungs read in build order; the "why now" line sits BETWEEN them,
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
  const langs = LANGS.map((l) => l.key).filter((k) =>
    rungs.some((r) => r.code[k])
  )
  const id = (r: Rung) => `rung-${r.key.replace(/\W+/g, "-")}`

  return (
    <Section
      label="approaches"
      // "worst to best" promised a monotone climb the data does not always make:
      // on island-count the middle rung is a generalisation the prose then argues
      // is overkill, not a step up. What IS true of every pair is that each rung
      // answers the one before it, which is exactly what `whyNow` says (V8).
      count={`${rungs.length} ${rungs.length === 1 ? "way" : "ways"} in, each answering the one before it`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <LanguageStrip langs={langs} />
        {rungs.length > 1 && (
          <nav
            aria-label="jump to an approach"
            className="flex flex-wrap gap-x-3 gap-y-1"
          >
            {rungs.map((r, i) => (
              <a
                key={r.key}
                href={`#${id(r)}`}
                className="text-meta text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                <span className="font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>{" "}
                {r.name}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="flex flex-col gap-6 pt-1" aria-label="approach ladder">
        {rungs.map((r, i) => (
          <div key={r.key} id={id(r)} className="flex scroll-mt-4 flex-col gap-3">
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
              <span className="font-mono text-meta text-muted-foreground">
                {r.cost}
              </span>
            </div>
            <p className="max-w-[35em] text-body text-muted-foreground">
              {r.idea}
            </p>
            <RungCode code={r.code} />
          </div>
        ))}
        {/* The idea the whole ladder shares, after the rungs that earned it.
            Never while the ladder is capped: it names where the climb ends. */}
        {problem.arc && !capped && (
          // a <b> here would join the rung names the UI test reads out of this
          // container — the label is a span for that reason
          <p className="max-w-[35em] border-t border-border/60 pt-4 text-body text-muted-foreground">
            <span className="font-semibold text-foreground">The arc.</span>{" "}
            {problem.arc}
          </p>
        )}
        {/* The long-form document, when one is written. Gated exactly as the
            arc is: it walks the whole ladder, so offering it while a journey
            still has unearned rungs would hand over the ending. */}
        {hasDeepDoc(problem.id) && !capped && (
          <a
            href={href(`/deep/${problem.id}`)}
            className="flex max-w-[35em] items-center gap-3 rounded-lg border bg-card/40 px-4 py-3 text-body transition-colors hover:border-chart-1/60 hover:bg-card"
          >
            <BookOpenIcon className="size-4 shrink-0 text-chart-1" />
            <span className="text-muted-foreground">
              {/* a <b> here joins the rung names the UI test reads out of this
                  container — the arc's label is a span for the same reason */}
              <span className="font-semibold text-foreground">
                Read the deep dive
              </span>{" "}
              — how someone who cannot yet see the answer gets there: worked
              traces, the bug you are about to write, and a runnable script.
            </span>
          </a>
        )}
        {capped && journey && (
          <p className="text-ui max-w-[35em] text-muted-foreground">
            {hidden} more {hidden === 1 ? "approach is" : "approaches are"}{" "}
            still ahead of you.{" "}
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
    </Section>
  )
}

export function ProblemDetail({ problem, pattern, onBack }: Props) {
  const solved = useSolved()
  const journey = journeyForProblem(problem.id)
  const steps = journey ? undefined : problem.walkthrough?.length
  // B45. The ladder was already capped by the ledger, but the page names its
  // PATTERN twice — in the back link and in the glyph strip — and a pattern
  // name is exactly what a journey mid-flight has not handed over yet. The
  // catalogue has masked it since B8; this page was the hole. Measured
  // 2026-09-09: two problems (sorted-pair-sum, container-water) showed
  // "Two Pointers" while the journey teaching it was unfinished.
  const mask = usePatternMask()
  const hidden = mask.hidden.has(pattern.id)

  return (
    <div className="mx-auto flex w-full max-w-reading flex-col gap-8">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          {hidden ? MASKED_NAME : pattern.name}
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
        <p className="max-w-[35em] text-body text-muted-foreground">
          {problem.brief}
        </p>
        {/* the page explains; the learner writes and submits the code on
            LeetCode, so that is the primary action and there is no editor */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={leetcodeUrl(problem.leetcode)}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary px-3 text-ui font-medium text-[var(--primary-foreground)] transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Solve on LeetCode
            <ExternalLinkIcon className="size-4" />
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ui text-muted-foreground">
          <span className="font-mono">
            {hidden ? MASKED_GLYPH : pattern.glyph}
          </span>
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

      <Section label="the problem">
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
              className="overflow-x-auto rounded-lg border bg-card p-3 font-mono text-ui"
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
                <div className="mt-1 text-meta text-muted-foreground">
                  {ex.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section
        label="hints"
        count={`${problem.hints.length}, each one further in`}
      >
        <Accordion multiple={false} className="w-full">
          {problem.hints.map((hint, i) => (
            <AccordionItem key={i} value={`hint-${i}`}>
              <AccordionTrigger className="font-mono text-ui">
                hint {i + 1} of {problem.hints.length}
              </AccordionTrigger>
              <AccordionContent className="max-w-[35em] text-body text-muted-foreground">
                {hint}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {(journey || problem.walkthrough) && (
        <Section
          label="walkthrough"
          count={steps ? `${steps} steps` : "from the journey, as far as you have earned"}
        >
          {/* one source of truth: a problem with a journey draws the
              journey's own frames, not a second hand-written copy (B1) */}
          {journey ? (
            <MiniPlayer journey={journey} />
          ) : (
            <StepPlayer frames={problem.walkthrough!} />
          )}
        </Section>
      )}

      <ApproachLadder problem={problem} journey={journey} />
    </div>
  )
}
