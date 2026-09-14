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
  ArrowRightIcon,
  BookOpenIcon,
  ExternalLinkIcon,
  RouteIcon,
  ScrollTextIcon,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Band, Fact, OrientBar } from "@/components/ui/band"
import { ComplexityMark, DifficultyMeter } from "@/components/ui/tick-meter"
import { RowNudge } from "@/components/ui/row"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { Code, Pattern, Problem } from "@/data"
import { toggleSolved, useSolved } from "@/lib/progress"
import { journeyForProblem } from "@/engine"
import type { AnyJourney } from "@/engine"
import { MASKED_NAME, usePatternMask } from "@/lib/disclosure"
import { ladderOf, leetcodeUrl } from "@/lib/ladder"
import type { Ladder, Rung } from "@/lib/ladder"
import { K, useStored } from "@/lib/store"
import { href } from "@/lib/route"
import { hasDeepDoc, hasLearnPage } from "@/lib/learn-pages"
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
            // the language tabs are tapped repeatedly while reading a rung, so
            // they take the touch target below lg (measured at 390px: 26px)
            "inline-flex min-h-11 items-center rounded-md px-2.5 py-1 text-meta font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:min-h-7",
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
  ladder,
}: {
  problem: Problem
  journey?: AnyJourney
  /** computed by the PAGE, not here: the header needs `capped` too, to decide
   *  whether the full-explanation door may be opened, and computing the same
   *  ladder twice is how two controls drift into disagreeing about the ledger */
  ladder: Ladder
}) {
  const { rungs, capped, hidden } = ladder
  const langs = LANGS.map((l) => l.key).filter((k) =>
    rungs.some((r) => r.code[k])
  )
  const id = (r: Rung) => `rung-${r.key.replace(/\W+/g, "-")}`

  return (
    <Band
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
                onClick={(e) => {
                  // A BARE `#id` href in a hash-routed app is a ROUTE change,
                  // not a scroll. Measured before this guard: clicking
                  // "01 Brute Force" set location.hash to "#rung-brute", the
                  // router parsed that as the route `rung-brute`, and the app
                  // rendered HOME — the problem page you were reading was
                  // gone. `learn-page-view.tsx` has guarded this since it was
                  // written; this call site never got the same treatment.
                  //
                  // Scroll instead, and let `scroll-padding-top` (index.css)
                  // keep the landing clear of the phone's sticky bar.
                  e.preventDefault()
                  document
                    .getElementById(id(r))
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
                className="inline-flex min-h-11 items-center text-meta text-muted-foreground underline-offset-2 hover:text-foreground hover:underline lg:min-h-0"
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
              {/* the second channel on the whole ladder: read DOWN the rungs
                  and the bars visibly shrink. That climb is what the prose
                  between the rungs is describing, and this is it drawn. */}
              <span className="inline-flex items-center gap-2 font-mono text-meta text-muted-foreground">
                <ComplexityMark cost={r.cost} />
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
        {capped && journey && (
          <p className="text-ui max-w-[35em] text-muted-foreground">
            {hidden} more {hidden === 1 ? "approach is" : "approaches are"}{" "}
            still ahead of you.{" "}
            <a
              href={href(`/journey/${journey.slug}`)}
              className="group inline-flex items-center gap-1 text-chart-1 underline-offset-2 hover:underline"
            >
              Continue the journey
              <ArrowRightIcon aria-hidden className="size-3.5 shrink-0" />
            </a>{" "}
            — each one opens when the previous one runs out of road.
          </p>
        )}
      </div>
    </Band>
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
  // One ladder for the whole page. The header's "read the full explanation"
  // door and the ladder itself are gated by the SAME `capped` flag, because
  // they are held back for the same reason: both hand over the ending.
  const unlocked = Math.max(
    useStored<number>(K.unlocked(journey?.slug ?? ""), 1),
    1
  )
  const ladder = ladderOf(problem, journey, unlocked)
  const deep = hasDeepDoc(problem.id)

  return (
    <div className="mx-auto flex w-full max-w-reading flex-col gap-8">
      {/* ── ZONE 1 · ORIENT ─────────────────────────────────────────────
          Four facts, one row: where am I, how hard is it, what do I have to
          beat, have I done it. Each changes what you do in the next thirty
          seconds; nothing else qualified.

          What was here before: a 28px back-link band, the difficulty badge up
          in the title row, and a THIRD row under the buttons carrying the
          glyph, the time, the space and the solved box. Three bands all
          answering "what is this", none of them together.

          The glyph is gone — it restated the pattern the back link already
          names and spent the accent doing it. The mask still holds: the back
          link is what renders `· · ·` while a journey is mid-flight (B45). */}
      <OrientBar>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2 min-h-11 text-muted-foreground lg:min-h-7"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          {hidden ? MASKED_NAME : pattern.name}
        </Button>
        <Fact label="difficulty">
          <DifficultyMeter difficulty={problem.difficulty} />
          <span className={difficultyClass[problem.difficulty].split(" ").pop()}>
            {problem.difficulty}
          </span>
        </Fact>
        {/* the bar to clear. Each rung carries its own cost; this is the one
            the best rung reaches. */}
        <Fact label="target">
          <ComplexityMark value={problem.complexity.time} />
          <span className="font-mono">{problem.complexity.time}</span>
          <span className="text-dim">·</span>
          <ComplexityMark value={problem.complexity.space} />
          <span className="font-mono">{problem.complexity.space}</span>
        </Fact>
        <label className="ml-auto flex min-h-11 cursor-pointer items-center gap-2 text-ui text-muted-foreground lg:min-h-7">
          <Checkbox
            checked={solved.has(problem.id)}
            onCheckedChange={() => toggleSolved(problem.id)}
          />
          solved
        </label>
      </OrientBar>

      {/* ── ZONE 2 · ACT ────────────────────────────────────────────────
          The one thing this page exists to make you do, and the ONE raised
          surface on the screen (DESIGN.md allows exactly one per page; the
          journey invitation below is a bordered panel, not a second dock).

          This page explains and hosts no editor, so the primary action leaves
          for LeetCode. The second door is the written explanation, and it
          names which kind it opens: 81 of the 127 problems carry an authored
          document in `docs/deep/` spliced into the learn page verbatim, the
          other 46 get one assembled from the data. The phrase "Learn this
          problem" is load-bearing — a UI test reads it to prove the ledger
          still hides this mid-journey. */}
      <div
        data-surface="raised"
        className="flex flex-col gap-3 rounded-xl border bg-card p-5 md:p-6"
      >
        <h1 className="font-heading text-title font-semibold">
          {problem.title}
        </h1>
        <p className="max-w-[35em] text-body text-muted-foreground">
          {problem.brief}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href={leetcodeUrl(problem.leetcode)}
            target="_blank"
            rel="noopener"
            className="btn-glow inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-ui font-medium text-primary-foreground transition-[background-color,box-shadow] hover:bg-primary/90 active:translate-y-px lg:min-h-9"
          >
            Solve on LeetCode
            <ExternalLinkIcon className="size-4" />
          </a>
          {hasLearnPage(problem.id) && !ladder.capped && (
            <a
              href={href(`/learn/${problem.id}`)}
              className="group inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-ui font-medium hover:border-chart-1/60 lg:min-h-9"
            >
              {deep ? (
                <ScrollTextIcon className="size-4 shrink-0 text-chart-1" />
              ) : (
                <BookOpenIcon className="size-4 shrink-0 text-chart-1" />
              )}
              Learn this problem
              <span className="hidden font-normal text-muted-foreground sm:inline">
                {deep
                  ? "— the long explanation"
                  : "— every approach, one page"}
              </span>
              <RowNudge />
            </a>
          )}
        </div>
      </div>

      {/* ── ZONE 3 · REVIEW — the material, as bands. A band is a heading and
          a hairline, never a card: a card says "this has its own actions" and
          none of these do. */}
      {journey && (
        <a
          href={href(`/journey/${journey.slug}`)}
          className="group flex items-center gap-3 rounded-xl border border-chart-1/40 bg-chart-1/5 p-4 transition-colors hover:border-chart-1"
        >
          <RouteIcon className="size-5 shrink-0 text-chart-1" />
          <span className="flex min-w-0 flex-col">
            <b className="text-body">Start the learning journey</b>
            <span className="text-ui text-muted-foreground">
              {journey.acts.length} acts: the need, every approach earned by the
              last one's weakness, your own code animated, then the reveal.
            </span>
          </span>
          <RowNudge as="arrow" className="ml-auto size-5" />
        </a>
      )}

      <Band label="the problem">
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
                <span className="text-dim">·</span>
                <span className="font-mono">{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          {problem.examples.map((ex, i) => (
            <div
              key={i}
              className="overflow-x-auto rounded-lg border p-3 font-mono text-ui"
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
      </Band>

      <Band
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
      </Band>

      {(journey || problem.walkthrough) && (
        <Band
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
        </Band>
      )}

      <ApproachLadder problem={problem} journey={journey} ladder={ladder} />
    </div>
  )
}
