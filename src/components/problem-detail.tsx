// One problem's page — the ONLY page for a problem, read top to bottom:
// statement, constraints and examples, then the hint ladder, the walkthrough,
// every approach in build order each carrying the weakness in the one before it
// (R1), and then the long explanation in full. The primary action is solving it
// on LeetCode, because this page explains and does not host an editor.
//
// The explanation used to be a SECOND page at `#/learn/<id>`, reached through a
// door in zone 2, and it opened by restating the statement, the constraints,
// the examples and the whole ladder — because a separate page has to stand on
// its own. Merged, all four of those are the screen above it. `#/learn/<id>`
// still resolves; it redirects here and jumps to the explanation.
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
  ExternalLinkIcon,
  ListTreeIcon,
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
import { PROBLEMS } from "@/data"
import type { Code, Pattern, Problem } from "@/data"
import { toggleSolved, useSolved } from "@/lib/progress"
import { journeyForProblem } from "@/engine"
import type { AnyJourney } from "@/engine"
import { MASKED_NAME, usePatternMask } from "@/lib/disclosure"
import { compareHref, ladderOf, leetcodeUrl, parseCompare } from "@/lib/ladder"
import type { Ladder, Rung } from "@/lib/ladder"
import { K, useStored } from "@/lib/store"
import { href, navigate, useRoute } from "@/lib/route"
import { useEffect } from "react"
import { ExplanationBody } from "./explanation"
import { useExplanation } from "@/lib/use-explanation"
import type { Outline } from "@/lib/markdown"
import { MiniPlayer } from "@/features/journey/mini-player"
import { CodeBlock } from "./code-block"
import { ApproachCompare } from "./approach-compare"
import { difficultyClass } from "@/lib/difficulty"
import { setPref, usePrefs } from "@/lib/store"
import { StepPlayer } from "./step-player"

interface Props {
  /** the id, not the record: this component is lazy, so it resolves the record
   *  from its own chunk rather than having the shell import all 127 to pass one */
  problemId: string
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
  onCompare,
}: {
  problem: Problem
  journey?: AnyJourney
  /** open `?compare=a,b` — offered only between rungs the ledger has earned */
  onCompare: (value: string) => void
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
              {/* B79. A rung the teaching document teaches and the journey
                  skips — a baseline the animation has no reason to walk, or a
                  variant it argues against. Marked rather than hidden: a
                  learner should be able to tell which rungs they were walked
                  through and which are being handed over as reading. */}
              {r.aside && (
                <span className="rounded-sm border border-chart-4/45 bg-chart-4/10 px-1.5 font-mono text-meta text-chart-4">
                  reading only
                </span>
              )}
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
            {/* The pair worth comparing is this rung and the one it answers:
                `whyNow` right above makes a claim about exactly that step, and
                this is the button that shows it. Never on the first rung,
                which has nothing below it. */}
            {i > 0 && (
              <button
                onClick={() => onCompare(compareHref(rungs[i - 1], r))}
                className="inline-flex min-h-11 w-fit items-center font-mono text-meta text-muted-foreground underline-offset-2 hover:text-foreground hover:underline lg:min-h-7"
              >
                compare with {rungs[i - 1].name.toLowerCase()} &rarr;
              </button>
            )}
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

/**
 * Resolves the record, then renders it.
 *
 * Split in two so the lookup can return early without sitting between hooks —
 * the id is checked against the manifest before this route renders, so the miss
 * is unreachable, but a manifest that has drifted should show a page rather
 * than break the rules of hooks.
 */
export function ProblemDetail({ problemId, pattern, onBack }: Props) {
  const problem = PROBLEMS.find((p) => p.id === problemId)
  if (!problem) return null
  return <ProblemPage problem={problem} pattern={pattern} onBack={onBack} />
}

function ProblemPage({
  problem,
  pattern,
  onBack,
}: {
  problem: Problem
  pattern: Pattern
  onBack: () => void
}) {
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
  // The explanation, fetched on arrival and never with the bundle: a typed
  // document is ~30 KB of prose and the Markdown ones are larger. Not fetched
  // at all while the ladder is CAPPED — a started journey has not earned the
  // ending, and the cheapest way to not leak it is to not ask for it.
  const explanation = useExplanation(problem.id, !ladder.capped)
  // `?compare=a,b` is state that belongs in the URL: the comparison is a claim
  // worth sending to someone, and the back button should undo it. Resolved
  // against the rungs the LADDER returned, never against the problem, so a
  // hand-typed key cannot walk past the ledger's cap.
  const { path, query } = useRoute()
  const pair = parseCompare(query.get("compare"), ladder.rungs)
  // `?read=explanation` — what `#/learn/<id>` becomes. The section is at the
  // foot of the page and its content is FETCHED, so the jump cannot happen at
  // navigation time: it waits until the explanation is actually on screen.
  // `ready` in the dependency is what makes this fire exactly once, on the
  // render where the document arrives. Above the `?compare=` early return,
  // because a hook after a conditional return is a hook that changes order.
  const jumpToExplanation =
    query.get("read") === "explanation" && explanation.present && explanation.ready
  useEffect(() => {
    if (!jumpToExplanation) return
    document
      .getElementById("explanation")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [jumpToExplanation])
  // `navigate`, not `replaceQuery`: the comparison has to be a history entry or
  // Back cannot undo it, and Back is the only way out a reader will guess.
  // Measured in a real browser first — `replaceQuery` uses `history.replaceState`
  // and left the reader with no way back to the ladder but the button.
  const compare = (value: string) => {
    navigate(path, value ? { compare: value } : {})
    window.scrollTo({ top: 0 })
  }

  // `?compare=` is a FOCUSED view, not a section appended to the page.
  //
  // The first cut rendered the comparator at the foot, below the statement,
  // the hints and the walkthrough — so pressing "compare with the visited set"
  // scrolled you to the top of a problem statement you had already read, with
  // the thing you asked for four screens down. Looked at in a real browser
  // before this was noticed; nothing about the code said it was wrong.
  //
  // A reader who asks to compare two rungs is asking one question. Answer it,
  // keep the orient bar so they know where they are, and let Back return the
  // page. Everything else on this page is the context they just came from.
  if (pair)
    return (
      <div className="mx-auto flex w-full max-w-reading flex-col gap-6">
        <OrientBar>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => compare("")}
            className="-ml-2 min-h-11 text-muted-foreground lg:min-h-7"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            {problem.title}
          </Button>
          <Fact label="comparing">
            <span className="font-mono">
              {pair[0].key} · {pair[1].key}
            </span>
          </Fact>
        </OrientBar>
        <ApproachCompare
          pair={pair}
          rungs={ladder.rungs}
          onPick={compare}
          onBack={() => compare("")}
        />
      </div>
    )

  const outline = explanation.present && explanation.ready ? explanation.outline : []

  return (
    <div className="mx-auto flex w-full max-w-(--container-page) gap-10">
      {/* min-w-0: a flex item's default `min-width: auto` is its content's
          min-content width, and the widest comparison table would push this
          column open and take the whole document sideways with it. */}
      <div className="mx-auto flex w-full min-w-0 max-w-reading flex-col gap-8">
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
          for LeetCode. The second door is the written explanation, which is
          now FURTHER DOWN THIS PAGE rather than on another route — so it
          scrolls rather than navigates. The phrase "Learn this problem" is
          load-bearing: a UI test reads it to prove the ledger still hides this
          mid-journey. */}
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
          {explanation.present && (
            <a
              // A bare `#id` href is a ROUTE change in a hash-routed app, not a
              // scroll: it would set the route to `explanation` and render
              // home. Every in-page anchor here needs both of these lines.
              href="#explanation"
              onClick={(e) => {
                e.preventDefault()
                document
                  .getElementById("explanation")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
              className="group inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-ui font-medium hover:border-chart-1/60 lg:min-h-9"
            >
              <ScrollTextIcon className="size-4 shrink-0 text-chart-1" />
              Learn this problem
              <span className="hidden font-normal text-muted-foreground sm:inline">
                — the long explanation, further down
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

      <ApproachLadder
        problem={problem}
        journey={journey}
        ladder={ladder}
        onCompare={compare}
      />

      {/* ── THE EXPLANATION ─────────────────────────────────────────────
          The long-form document, in full, at the foot of the page it belongs
          to. Gated by the SAME `capped` flag as the ladder and the arc: it
          walks the whole climb, and a journey mid-flight has not earned that.

          It is the last thing on the page on purpose. A reader who wants it
          presses the door in zone 2 and is scrolled here; a reader who wants
          the ladder never meets it. */}
      {explanation.present && (
        <section
          id="explanation"
          className="flex min-w-0 scroll-mt-6 flex-col gap-6 border-t pt-8"
        >
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-title font-semibold">
              The long explanation
            </h2>
            <p className="max-w-[35em] text-body text-muted-foreground">
              Every approach in full: the idea, the mental model, a worked
              trace, the bug you are about to write, and a script you can run.
            </p>
          </div>
          <ExplanationBody state={explanation} />
        </section>
      )}
      </div>

      {/* The contents rail. The explanation runs to a few thousand words with
          one section per approach, so the sections ARE the navigation. Hidden
          below xl, where there is no second column to put it in. It lists the
          SAME array the page renders (`partsOf`), so it cannot offer a section
          that is not there. */}
      {outline.length > 0 && <ContentsRail outline={outline} />}
    </div>
  )
}

/** `top-16`, not `top-6`: the shell parks a fixed search control at
 *  `top-3 right-4` and this rail is the only thing that shares that corner. At
 *  1280 the button was measured painting over the rail's first entries. */
function ContentsRail({ outline }: { outline: Outline[] }) {
  return (
    <nav
      aria-label="contents"
      className="sticky top-16 hidden h-fit w-56 shrink-0 flex-col gap-1 border-l pl-4 xl:flex"
    >
      <span className="flex items-center gap-1.5 pb-1 text-meta font-semibold text-foreground">
        <ListTreeIcon className="size-3.5 shrink-0 text-dim" aria-hidden />
        The explanation
      </span>
      {outline.map((entry) => (
        <a
          key={entry.id}
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
            "-ml-4 border-l-2 border-transparent py-0.5 text-ui transition-colors hover:border-chart-1 hover:text-foreground",
            entry.level === 3 ? "pl-7 text-dim" : "pl-4 text-muted-foreground"
          )}
        >
          {entry.text.replace(/`/g, "")}
        </a>
      ))}
    </nav>
  )
}
