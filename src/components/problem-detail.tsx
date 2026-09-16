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
import { PROBLEMS } from "@/data"
import type { Pattern, Problem } from "@/data"
import { earnedOf, toggleSolved, useSolved } from "@/lib/progress"
import { journeyForProblem } from "@/engine"
import { MASKED_NAME, usePatternMask } from "@/lib/disclosure"
import { ladderOf, leetcodeUrl, parseCompare } from "@/lib/ladder"
import { K, useStored } from "@/lib/store"
// `href` went with the journey link: the primary action is a button now
import { navigate, useRoute } from "@/lib/route"
import { useEffect, useState } from "react"
import { ExplanationBody } from "./explanation"
import { useExplanation } from "@/lib/use-explanation"
import { foldDoc } from "@/lib/doc-sections"
import { outlineOf } from "@/lib/markdown"
import { Markdown } from "./markdown"
import BINDINGS from "@/data/rung-bindings.json"
import { MiniPlayer } from "@/features/journey/mini-player"
import { JourneyEmbed } from "./journey-embed"
import { ApproachCompare } from "./approach-compare"
import { difficultyClass } from "@/lib/difficulty"
import { StepPlayer } from "./step-player"
import { ApproachLadder } from "./approach-ladder"
import { ContentsRail, ReadFurther } from "./problem-closing"
import { ProblemStatement } from "./problem-statement"
import { PreSolveCheck } from "./pre-solve-check"
import { SimilarProblems } from "./similar-problems"

interface Props {
  /** the id, not the record: this component is lazy, so it resolves the record
   *  from its own chunk rather than having the shell import all 127 to pass one */
  problemId: string
  pattern: Pattern
  onBack: () => void
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
  // the ledger, as the mode bar reads it: how many acts this learner has earned
  const earned = earnedOf(unlocked, journey?.acts.length ?? 0)
  // The explanation, fetched on arrival and never with the bundle: a typed
  // document is ~30 KB of prose and the Markdown ones are larger. Not fetched
  // at all while the ladder is CAPPED — a started journey has not earned the
  // ending, and the cheapest way to not leak it is to not ask for it.
  // The explanation is 15–30 screens. Collapsed until asked for, and not
  // fetched until then either — `pair-sum` measured 33.8 screens with it open
  // against 4.1 without, so rendering it on arrival made the ladder the first
  // twelve percent of the page.
  const [opened, setOpened] = useState(false)
  // "Read it all" — one switch for every fold on the page.
  //
  // Measured before it existed: 9.8 screens on arrival, 38.1 with everything
  // open, and ELEVEN separate toggles between the two — three cost folds,
  // three per-rung accounts, three hints, the explanation's own door. A reader
  // who wants the whole thing had to hunt for all eleven. Nothing here is
  // hidden for disclosure: the ledger's cap is a different mechanism and this
  // switch cannot touch it.
  const [expandAll, setExpandAll] = useState(false)
  // The journey, open on THIS page. It was a route, and leaving a problem to
  // work it — then coming back to the top of it — is the attention shift this
  // page has spent the branch removing.
  const [building, setBuilding] = useState(false)
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
  // `?read=explanation` — what `#/learn/<id>` becomes. It has to OPEN the
  // section as well as scroll to it. DERIVED, not an effect that sets state:
  // react-hooks v7 forbids a synchronous setState in an effect, and there is
  // nothing to store here anyway — the URL already says it.
  const asked = query.get("read") === "explanation"
  const reading = opened || asked
  const explanation = useExplanation(problem.id, !ladder.capped, reading)
  // the scroll still waits for the document to arrive, because until then
  // there is nothing at that offset to scroll to
  const jumpToExplanation = asked && explanation.present && explanation.ready
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

  // ── THE FOLD ──────────────────────────────────────────────────────────
  // The document's per-approach half belongs to the rungs, not to a second
  // pass over the same ladder at the foot of the page. `foldDoc` splits it;
  // the ladder renders `byRung`, and the section below renders what is left.
  //
  // Only the Markdown documents for now. The typed half already stores one
  // file per rung (`src/problems/<id>/approaches/<rung>.ts`), so folding that
  // is a field read rather than a parse — a different branch.
  const binding = (BINDINGS as Record<string, (string | null)[]>)[problem.id]
  const folded =
    explanation.present &&
    explanation.ready &&
    explanation.kind === "markdown" &&
    binding
      ? foldDoc(
          explanation.blocks,
          binding,
          // a rung whose costWhy is authored already says where its bound comes
          // from; one without it must keep the document's own account
          new Set(ladder.rungs.filter((r) => r.costWhy).map((r) => r.key)),
          // the page draws every bound as a card with a figure, so the
          // document's own constraints table is the same content twice
          (problem.unlocks?.length ?? 0) > 0,
          // and the ladder closes on `arc`, so the document's own arc section
          // is the same job in more words — it folds under that line instead
          Boolean(problem.arc)
        )
      : null

  // The page's OWN sections, in the order it renders them — the same
  // conditions, so the rail can never offer a section the page did not draw.
  // It used to list only the document's headings, which need a fetch, so the
  // right column stood empty on arrival and filled only once the reader opened
  // the long read: 317px of dead width on the page's most common state.
  const sections = [
    { id: "the-problem", text: "The problem", level: 2 as const },
    ...(problem.checks?.length
      ? [
          {
            id: "before-you-solve-it",
            text: "Before you solve it",
            level: 2 as const,
          },
        ]
      : []),
    { id: "hints", text: "Hints", level: 2 as const },
    ...(journey || problem.walkthrough
      ? [{ id: "walkthrough", text: "Walkthrough", level: 2 as const }]
      : []),
    { id: "approaches", text: "Approaches", level: 2 as const },
    // NOT "the same move, elsewhere". This rail only exists from xl, and from
    // xl that section is `xl:hidden` because the rail carries the list itself —
    // so an entry here would offer a jump to something invisible. The rail may
    // never name a section the page did not draw.
    ...(explanation.present
      ? [
          {
            id: "explanation",
            text: binding ? "The rest of the story" : "The long explanation",
            level: 2 as const,
          },
        ]
      : []),
  ]

  // the rail lists what the SECTION renders, which is now the shared half
  const outline = folded
    ? outlineOf(folded.shared)
    : explanation.present && explanation.ready
      ? explanation.outline
      : []

  return (
    <div className="mx-auto flex w-full max-w-(--container-page) gap-10">
      {/* min-w-0: a flex item's default `min-width: auto` is its content's
          min-content width, and the widest comparison table would push this
          column open and take the whole document sideways with it. */}
      <div className="mx-auto flex w-full max-w-reading min-w-0 flex-col gap-8">
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
            <span
              className={difficultyClass[problem.difficulty].split(" ").pop()}
            >
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
            {/* the bound is a label until you can reproduce the count; the
              title carries the counting argument on the bar, and every rung
              carries its own below (`Solution.costWhy`) */}
            {problem.costWhy && (
              <span
                title={problem.costWhy}
                className="cursor-help text-meta text-dim underline decoration-dotted underline-offset-4"
              >
                why?
              </span>
            )}
          </Fact>
          {/* In the STICKY bar on purpose: a switch that opens the whole page is
            useless if you have to scroll back to the top to reach it. */}
          <button
            type="button"
            aria-pressed={expandAll}
            onClick={() => {
              const next = !expandAll
              setExpandAll(next)
              // the long read is fetched, not merely hidden, so asking for
              // everything has to ask for it too
              if (next) setOpened(true)
            }}
            className={cn(
              "ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-md border px-2.5 text-meta transition-colors lg:min-h-7",
              expandAll
                ? "border-chart-1/50 bg-chart-1/10 text-foreground"
                : "text-muted-foreground hover:border-chart-1/40 hover:text-foreground"
            )}
          >
            <ScrollTextIcon className="size-3.5 shrink-0 text-chart-1" />
            {expandAll ? "everything open" : "read it all"}
          </button>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-ui text-muted-foreground lg:min-h-7">
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

          THE MODE BAR. A problem is one noun and these are the three things
          you can do with it: work it up from nothing (the journey), read it in
          full (the explanation), or go and solve it. They were three different
          shapes in three places — a primary button here, a bordered panel
          below, and a list in the sidebar — which is what made the app read as
          "journeys" and "patterns" being two products.

          The journey still opens full-screen, because its stage needs the
          viewport; it is simply never reached except from here. The
          explanation opens IN PLACE. The phrase "Learn this problem" is
          load-bearing: a UI test reads it to prove the ledger still hides this
          mid-journey. */}
        <div
          data-surface="raised"
          // `px-4` is the page's one box inset: the H1 used to start 25px right
          // of every heading below it, which is the misalignment a reader sees
          // first. Vertical padding stays generous — this is the raised surface.
          className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-5 md:py-6"
        >
          <h1 className="font-heading text-title font-semibold">
            {problem.title}
          </h1>
          <p className="max-w-measure text-body text-muted-foreground">
            {problem.brief}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* The journey is the PRIMARY action where one exists: it is the way
              this app teaches, and everything else on the page is what you
              read once you have. LeetCode takes the primary slot only when
              there is no journey to offer. */}
            {journey ? (
              // A BUTTON, not a link. It navigated to `#/journey/<slug>`: a
              // different page, a different scroll position, and no way back
              // except a trail that returned you to the TOP of this one. The
              // journey opens in place now — the route still exists for deep
              // links and the sidebar's Continue.
              <button
                type="button"
                aria-expanded={building}
                onClick={() => {
                  setBuilding(true)
                  requestAnimationFrame(() =>
                    document
                      .getElementById("build-it-up")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  )
                }}
                className="btn-glow inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-ui font-medium text-primary-foreground transition-[background-color,box-shadow] hover:bg-primary/90 active:translate-y-px lg:min-h-9"
              >
                <RouteIcon className="size-4 shrink-0" />
                {earned.earned > 0 ? "Continue the journey" : "Build it up"}
                <span className="font-mono text-meta opacity-80">
                  {earned.earned}/{journey.acts.length}
                </span>
              </button>
            ) : null}
            <a
              href={leetcodeUrl(problem.leetcode)}
              target="_blank"
              rel="noopener"
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-ui font-medium transition-[background-color,box-shadow] active:translate-y-px lg:min-h-9",
                journey
                  ? "border hover:border-chart-1/60"
                  : "btn-glow bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              Solve on LeetCode
              <ExternalLinkIcon className="size-4" />
            </a>
            {explanation.present && (
              <button
                type="button"
                aria-expanded={reading}
                aria-controls="explanation"
                onClick={() => {
                  setOpened(true)
                  // the section is below the fold and its content is FETCHED, so
                  // the scroll waits for the render that brings it — see the
                  // `?read=explanation` effect above, which this reuses
                  if (reading)
                    document
                      .getElementById("explanation")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
                className="group inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-ui font-medium hover:border-chart-1/60 lg:min-h-9"
              >
                <ScrollTextIcon className="size-4 shrink-0 text-chart-1" />
                {/* The three actions are ONE ROW. Measured at 1440: they need
                    745.4px against 735 available and wrapped by 10.4px, and
                    the whole overflow was this suffix — 376 of those 745 were
                    this one button. It was also stale: the section it opens is
                    called "the rest of the story" now, because the per-approach
                    half of the document lives on the rungs. The heading below
                    says what it is; the button only has to name the action. */}
                Learn this problem
                <RowNudge />
              </button>
            )}
          </div>
          {/* What a journey IS — the one sentence the deleted panel carried, and
            only while it is unstarted. Once earning has begun the button's
            "3/5" says everything a returning reader needs. */}
          {journey && earned.earned === 0 && (
            <p className="max-w-measure prose-set text-body text-muted-foreground">
              {journey.acts.length} acts: the need, every approach earned by the
              last one's weakness, your own code animated, then the reveal.
            </p>
          )}
        </div>

        {/* ── ZONE 3 · REVIEW — the material, as bands. A band is a heading and
          a hairline, never a card: a card says "this has its own actions" and
          none of these do.

          The bordered journey panel that used to open this zone is gone. It
          said the same thing the mode bar above now says, in a second shape and
          a second place — three doors into one journey (a panel here, a primary
          button there, a list in the sidebar) is what made the app read as two
          products. Its one irreplaceable sentence, what a journey actually IS,
          moved up under the mode bar where the button is. */}

        {/* Three `h3` sections, not one column of three kinds of thing — and
          the examples are watchable rather than printed. See
          `problem-statement.tsx`, which owns all three. */}
        <Band id="the-problem" label="the problem">
          <ProblemStatement problem={problem} />
        </Band>

        {/* Between the statement and the hints on purpose: the first thing this
          page used to offer a reader who had finished reading was a way out of
          thinking. Absent unless the record authors questions. */}
        {problem.checks?.length ? (
          <PreSolveCheck checks={problem.checks} />
        ) : null}

        <Band
          id="hints"
          label="hints"
          count={`${problem.hints.length}, each one further in`}
        >
          {/* `multiple`: reading hint 3 used to close hint 2, so a ladder meant
            to be read in order could only ever show one rung of itself. */}
          <Accordion
            multiple
            // keyed so the switch SETS the hints and then lets go: a reader can
            // close one afterwards without the switch reopening it
            key={`hints-${expandAll}`}
            defaultValue={
              expandAll ? problem.hints.map((_, i) => `hint-${i}`) : []
            }
            className="w-full"
          >
            {problem.hints.map((hint, i) => (
              <AccordionItem key={i} value={`hint-${i}`}>
                <AccordionTrigger className="font-mono text-ui">
                  hint {i + 1} of {problem.hints.length}
                </AccordionTrigger>
                <AccordionContent className="max-w-measure text-body text-muted-foreground">
                  {hint}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Band>

        {(journey || problem.walkthrough) && (
          <Band
            id={building ? "build-it-up" : "walkthrough"}
            label={building ? "building it up" : "walkthrough"}
            count={
              building
                ? "the whole journey, on this page"
                : steps
                  ? `${steps} steps`
                  : "from the journey, as far as you have earned"
            }
          >
            {/* one source of truth: a problem with a journey draws the
              journey's own frames, not a second hand-written copy (B1) */}
            {journey ? (
              building ? (
                <JourneyEmbed
                  openFull
                  slug={journey.slug}
                  earned={earned.earned}
                  acts={journey.acts.length}
                  onClose={() => setBuilding(false)}
                />
              ) : (
                <MiniPlayer journey={journey} />
              )
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
          expandAll={expandAll}
          arcDoc={folded?.arc ?? null}
          folded={folded?.byRung ?? null}
          // opening a rung's account is a reason to fetch the document, the
          // same as opening the section below — one fetch serves every rung
          onWantDoc={
            explanation.present && binding ? () => setOpened(true) : undefined
          }
        />

        {/* The pattern's reading, above the explanation because it is short and
          the explanation is thirty screens folded shut. Hidden with the rest
          while a journey is still withholding this pattern's name. */}
        {/* Where this move goes next. Above the reading list because a sibling
          problem is a cheaper next step than a textbook chapter, and hidden
          with everything else while a journey is still withholding the
          pattern's name. */}
        {/* `xl:hidden` — this list lives in the RAIL from xl up, where it can
            be looked at instead of scrolled to. Below xl there is no rail, so
            it stays here rather than disappearing. One component and the same
            props in both places: two lists of the same thing is how the two
            come to disagree. */}
        {!hidden && (
          <div className="xl:hidden">
            <SimilarProblems
              problem={problem}
              pattern={pattern}
              all={PROBLEMS}
            />
          </div>
        )}

        {/* ── THE EXPLANATION ─────────────────────────────────────────────
          The long-form document, in full, at the foot of the page it belongs
          to. Gated by the SAME `capped` flag as the ladder and the arc: it
          walks the whole climb, and a journey mid-flight has not earned that.

          It is the last thing on the page, and CLOSED until asked for. Open,
          it is 15 to 30 screens: pair-sum measured 33.8 with it against 4.1
          without, which made the ladder the first twelve percent of its own
          page. Closed it is a heading and a sentence, and the document is not
          even fetched — `hasExplanation` answers from the glob's keys. */}
        {explanation.present && (
          <section
            id="explanation"
            className="flex min-w-0 scroll-mt-6 flex-col gap-6 border-t pt-8"
          >
            {/* The SAME heading treatment as the other eight sections. This
                one was a 28px title while every other section on the page is a
                13px label with a rule — so the last section read as a second
                page rather than as part of this one. `Band` owns that look;
                writing it out here again is how the two drift apart. */}
            <div className="flex flex-col gap-1">
              <h2 className="flex items-baseline gap-3 text-meta tracking-wide text-muted-foreground uppercase">
                {binding ? "the rest of the story" : "the long explanation"}
                <span
                  aria-hidden
                  className="h-px flex-1 translate-y-[-0.15em] bg-gradient-to-r from-border to-transparent"
                />
                <span className="font-mono text-meta text-dim normal-case">
                  {folded
                    ? "what belongs to no single rung"
                    : "every approach in full"}
                </span>
              </h2>
              <p className="max-w-measure prose-set text-body text-muted-foreground">
                {binding
                  ? "What is not about any single approach: how to read the problem, where the cost actually goes, the comparison, what to say in an interview, and a script you can run."
                  : "Every approach in full: the idea, the mental model, a worked trace, the bug you are about to write, and a script you can run."}
              </p>
              {!reading && (
                <button
                  type="button"
                  onClick={() => setOpened(true)}
                  className="group mt-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border px-4 text-ui font-medium hover:border-chart-1/60 lg:min-h-9"
                >
                  <ScrollTextIcon className="size-4 shrink-0 text-chart-1" />
                  Read it
                  <RowNudge />
                </button>
              )}
            </div>
            {folded ? (
              // the shared half only — each rung's own account is on the rung
              <Markdown
                blocks={folded.shared}
                runnable
                problemId={problem.id}
                scaffold={explanation.ready ? explanation.scaffold : undefined}
              />
            ) : (
              <ExplanationBody state={explanation} problemId={problem.id} />
            )}
          </section>
        )}

        {/* LAST. It was above the long explanation, which sent a reader
            off-site before the page's own deepest content. Everything here
            leaves Patternsmith, so it belongs at the end of the road. */}
        {!hidden && <ReadFurther pattern={pattern} problem={problem} />}
      </div>

      {/* The contents rail. The explanation runs to a few thousand words with
          one section per approach, so the sections ARE the navigation. Hidden
          below xl, where there is no second column to put it in. It lists the
          SAME array the page renders (`partsOf`), so it cannot offer a section
          that is not there. */}
      <ContentsRail
        sections={sections}
        outline={outline}
        problemId={problem.id}
        // NO copy of the difficulty or the target here. They are in the
        // orient bar, and putting them in both is the duplication this page
        // has spent the whole branch removing. The orient bar STICKS instead,
        // so the facts stay on screen at every width — the rail does not exist
        // below xl, so a rail-only copy would simply lose them there.
        aside={
          <>
            {!hidden && (
              <SimilarProblems
                problem={problem}
                pattern={pattern}
                all={PROBLEMS}
                compact
              />
            )}
          </>
        }
        label={binding ? "The rest of the story" : "The explanation"}
      />
    </div>
  )
}
