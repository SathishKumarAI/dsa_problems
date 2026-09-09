// One journey on screen. Owns layout only — the stage (data, narration,
// approach panel, timeline, transport) on the left, the test-case drawer
// beside it (R4: a column that pushes, not an overlay), the reading column
// (the problem panel, insight, tools, code, takeaways, chart, legend,
// resources) on the right, the act stepper on top. On lg the header stays put and the two columns
// scroll independently (App gives the inset the viewport height). The
// reading column collapses to an icon rail (toggle at its foot, pref
// `reading`) that peeks open on hover.
// Every behaviour comes from useJourney. Panel map: docs/FEATURES.md §Journey page.

import {
  ArrowLeftIcon,
  FlameIcon,
  FlaskConicalIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  RotateCcwIcon,
  StarIcon,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AnyJourney } from "@/engine"
import { PATTERNS, PROBLEMS } from "@/data"
import { href } from "@/lib/route"
import { setPref, usePrefs } from "@/lib/store"
import { ActStepper } from "./act-stepper"
import { EdgeCaseCard, HintLadder, PredictCard, QuizCard } from "./cards"
import { ChallengeEditor } from "./challenge-editor"
import { DrawerTabs } from "./drawer-tabs"
import { DataControls, Transport } from "./controls"
import { Stage } from "./panels"
import { useJourney } from "./use-journey"

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-meta tracking-wide text-muted-foreground uppercase">
      {children}
    </div>
  )
}

// The foot of the reading column (or its rail). It sits in a bordered lane of
// its own rather than floating over the card beneath it — UX audit U8.
function ReadingToggle({ open }: { open: boolean }) {
  return (
    <div className="sticky bottom-0 mt-auto flex w-full justify-end border-t bg-background/95 py-2 backdrop-blur-sm lg:justify-center">
      <Button
        size="icon-sm"
        variant="outline"
        className="bg-card text-muted-foreground"
        aria-label={open ? "hide reading column" : "show reading column"}
        aria-expanded={open}
        title={open ? "hide reading column (focus)" : "show reading column"}
        onClick={() => setPref("reading", !open)}
      >
        {open ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
      </Button>
    </div>
  )
}

export function JourneyPage({ journey }: { journey: AnyJourney }) {
  const j = useJourney(journey)
  const problem = PROBLEMS.find((p) => p.id === journey.problemId)
  const pattern = problem && PATTERNS.find((p) => p.id === problem.pattern)
  const { act, model, frame } = j
  const { reading, drawer } = usePrefs()
  const edge = frame?.corner
    ? journey.edgeCases.find((e) => e.key === frame.corner)
    : undefined
  const [peek, setPeek] = useState(false)
  const storyAct = j.actIndex === 0
  // one element, two homes: the drawer above lg, the stage footer below it
  const data = (
    <DataControls
      journey={journey}
      presetKey={j.presetKey}
      onPreset={j.applyPreset}
      onNew={j.newFromPreset}
      text={j.data ? journey.describe(j.data) : ""}
      params={Object.fromEntries(
        (journey.params ?? []).map((p) => [
          p.key,
          String(j.data?.[p.key] ?? ""),
        ])
      )}
      onApply={j.applyCustom}
    />
  )

  return (
    // `h-full` at EVERY width, not just lg. SidebarInset is min-h-svh and
    // <main> is flex-1 inside it, so this resolves to "the space left under
    // the chrome" — which is what lets the regions below scroll internally
    // instead of the document scrolling. That is the whole mechanism behind
    // the transport staying put (spec 1.1).
    <div className="mx-auto flex h-full w-full max-w-stage flex-col gap-4 overflow-hidden">
      {/* header */}
      <header className="flex flex-col gap-2 lg:gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {problem && pattern ? (
            <a
              href={href(`/p/${pattern.id}/${problem.id}`)}
              title={`back to ${problem.title}`}
              className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 hover:text-foreground"
            >
              {/* the trail only — the title itself belongs to the h1 below,
                and having it in both places said the same thing twice */}
              <ArrowLeftIcon className="size-4" /> {pattern.name}
            </a>
          ) : (
            <a
              href={href("/")}
              className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" /> home
            </a>
          )}
          <span
            className="ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-xs"
            aria-label="experience points"
          >
            <StarIcon className="size-3 text-chart-4" /> {j.xp} XP
          </span>
          <Button
            size="icon-sm"
            variant={drawer ? "secondary" : "ghost"}
            className="hidden size-8 text-muted-foreground lg:inline-flex"
            onClick={() => setPref("drawer", !drawer)}
            aria-expanded={drawer}
            aria-controls="test-cases"
            title={drawer ? "hide test cases" : "change the input"}
            aria-label="test cases"
          >
            <FlaskConicalIcon />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="min-h-11 text-muted-foreground lg:min-h-8"
            onClick={j.restart}
            title="re-lock every act and start again"
            aria-label="restart journey"
          >
            <RotateCcwIcon data-icon="inline-start" />
            <span className="hidden sm:inline">restart journey</span>
          </Button>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-heading text-title font-semibold tracking-tight">
            {journey.title}
          </h1>
          {journey.leetcode && (
            <span className="font-mono text-xs text-muted-foreground">
              LeetCode {journey.leetcode}
            </span>
          )}
          <p className="hidden text-ui text-muted-foreground md:block">
            {journey.subtitle}
          </p>
        </div>
        <ActStepper
          journey={journey}
          unlocked={j.unlocked}
          active={j.actKey}
          done={j.done}
          revealed={j.revealed}
          onSelect={j.setAct}
        />
      </header>

      <div
        className={cn(
          // one column below lg: the stage takes the space that is left and
          // the reading column is capped, so both scroll inside themselves
          // rather than growing the document
          "grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-5 lg:grid-rows-none",
          reading
            ? "lg:grid-cols-[minmax(0,1fr)_24rem]"
            : "lg:grid-cols-[minmax(0,1fr)_2.75rem]"
        )}
      >
        {/* ---------- the stage, and the drawer it makes room for ---------- */}
        <div className="flex min-h-0 min-w-0 gap-4">
          <section
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-lg"
            aria-label="stage"
          >
            <div className="flex items-center gap-3 border-b bg-background/40 px-4 py-2">
              {/* the act NUMBER only. The stepper directly above already says
                the act's name and its subtitle, and repeating it here was the
                same words twice in adjacent rows (spec 3.2). */}
              <span className="font-mono text-ui text-muted-foreground">
                act {String(j.actIndex + 1).padStart(2, "0")}
              </span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {act.complexity}
              </span>
            </div>

            {/* the middle scrolls; the narration and the controls below it do
              not, so the sentence explaining the step is always on screen
              (UX audit U1) */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {(j.warning || j.info) && (
                <p
                  className={cn(
                    "border-b px-4 py-2 text-sm",
                    j.warning
                      ? "bg-chart-5/10 text-chart-5"
                      : "bg-chart-2/10 text-chart-2"
                  )}
                  role={j.warning ? "alert" : "status"}
                >
                  {j.warning ? "⚠ " + j.warning : j.info}
                </p>
              )}

              {j.data && "target" in j.data && (
                <div className="px-4 pt-4 font-mono text-base text-muted-foreground">
                  target ={" "}
                  <b className="text-foreground">{String(j.data.target)}</b>
                </div>
              )}

              <div className="flex flex-col gap-5 px-3 py-8 md:px-6">
                {model ? (
                  <Stage
                    model={model}
                    stepDelay={j.delay}
                    challenge={
                      journey.challenge && j.data ? (
                        <ChallengeEditor
                          slug={journey.slug}
                          challenge={journey.challenge}
                          data={j.data as { nums: number[]; target?: number }}
                          onPass={j.onChallengePass}
                          onTrace={j.setTrace}
                        />
                      ) : null
                    }
                  />
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    loading…
                  </div>
                )}
              </div>

              {/* a corner case biting on this very frame */}
              {edge && (
                <div className="border-t px-4 py-3">
                  <EdgeCaseCard edge={edge} />
                </div>
              )}
            </div>

            {/* Narration: the star of the page. It lives below the scrolling
            middle, so no panel can push it out of view (UX audit U1). */}
            <div className="border-t bg-background/40">
              <p
                className="mx-auto min-h-16 max-w-[35em] px-6 py-4 text-center text-body lg:text-narration"
                aria-live="polite"
              >
                <span className="mr-1 text-primary">›</span>
                {frame?.note ?? ""}
              </p>
            </div>

            {/* interruptions: predict / quiz / hints / reveal */}
            {(j.predict || j.quiz || j.hints || j.nextButton || j.adaptive) && (
              <div className="flex flex-col gap-3 border-t px-4 py-3">
                {j.predict && (
                  <PredictCard
                    key={frame?.note}
                    predict={j.predict.predict}
                    onDone={j.predict.resolve}
                  />
                )}
                {j.quiz && (
                  <QuizCard
                    key={j.actKey}
                    quiz={j.quiz.quiz}
                    onWrong={j.quiz.onWrong}
                    onPass={j.quiz.onPass}
                  />
                )}
                {j.nextButton && (
                  <div
                    className={cn(
                      "flex",
                      j.nextButton.reveal &&
                        "animate-in duration-(--duration-reveal) fade-in slide-in-from-bottom-1"
                    )}
                  >
                    <Button
                      onClick={j.nextButton.onClick}
                      className={cn(
                        j.nextButton.reveal &&
                          "bg-chart-3 text-[var(--primary-foreground)] hover:bg-chart-3/90"
                      )}
                    >
                      {j.nextButton.label}
                    </Button>
                  </div>
                )}
                {j.adaptive && (
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-chart-4/40 bg-chart-4/5 p-3 text-sm">
                    <FlameIcon className="size-4 text-chart-4" /> Flawless — no
                    wrong answers, first-try green.
                    <Button size="sm" variant="outline" onClick={j.adaptive.go}>
                      {j.adaptive.label}
                    </Button>
                  </div>
                )}
                {j.hints && !storyAct && (
                  <HintLadder
                    hints={j.hints.hints}
                    tier={j.hints.tier}
                    onMore={j.hints.more}
                  />
                )}
              </div>
            )}

            {/* The transport stays here, at the foot of the stage, and that is
              a measured decision rather than an oversight.
              At lg it is ALREADY pinned: the stage is a fixed-height flex
              column and only its middle scrolls, so play/scrub never leave
              the viewport (measured at 1536x776: the page does not scroll).
              Below lg the page scrolls and the transport leaves with the
              stage. Two fixes were tried and rejected:
              · into the header — the phone test budgets the header at 220px
                and the stage top at 320px, and an 85px transport blows both
                (test/ui-smoke.test.mjs, U2/U14/U11).
              · sticky bottom-0 — a NO-OP here, measured: the transport is the
                last child of its containing block, so `bottom: 0` has no
                leftover space to travel in and it tracks the scroll 1:1.
              Pinning it below lg needs `fixed`, which is a chrome-budget
              decision, not a bug fix. */}
            <div className="flex flex-col gap-3 border-t px-4 py-3">
              <Transport
                pos={j.player.pos}
                last={j.player.last}
                playing={j.player.playing}
                onToggle={j.player.toggle}
                onStep={() => {
                  j.player.pause()
                  j.player.step()
                }}
                onBack={() => j.seek(j.player.pos - 1)}
                onReset={() => j.seek(0)}
                onSeek={j.seek}
                speed={j.speed}
                onSpeed={j.setSpeed}
              />
              {/* below lg there is no room to push anything aside, so the
                controls stay where they have always been */}
              <div className="lg:hidden">{data}</div>
            </div>
          </section>

          {/* The test-case drawer (R4). It is a column of the flex row, not an
            overlay: opening it pushes the stage narrower instead of covering
            the thing you are about to change. `inert` while closed so its
            fields stay out of the tab order at width 0. */}
          <aside
            id="test-cases"
            aria-label="test cases"
            inert={!drawer}
            // Esc closes it, but only from inside: the global Esc belongs to
            // dialogs (B26), and a drawer is not a dialog (R7)
            onKeyDown={(e) => {
              if (e.key !== "Escape") return
              e.stopPropagation()
              setPref("drawer", false)
              document
                .querySelector<HTMLElement>('[aria-controls="test-cases"]')
                ?.focus()
            }}
            className={cn(
              "hidden shrink-0 overflow-hidden transition-[width] duration-(--duration-reveal) lg:block",
              drawer ? "w-72" : "w-0"
            )}
          >
            <div className="flex w-72 flex-col gap-3 rounded-xl border bg-card p-4">
              <Label>test cases</Label>
              {data}
            </div>
          </aside>
        </div>

        {/* ---------- the reading column (or its rail) ---------- */}
        {!reading ? (
          <aside
            className="relative flex rounded-xl border bg-card p-1 lg:flex-col"
            aria-label="approach (collapsed)"
            onMouseEnter={() => setPeek(true)}
            onMouseLeave={() => setPeek(false)}
          >
            {peek && (
              <div
                className="absolute top-0 right-0 z-20 hidden max-h-full w-[26rem] flex-col gap-4 overflow-y-auto rounded-xl border bg-card p-3 text-body shadow-2xl lg:flex"
                data-testid="reading-peek"
              >
                <DrawerTabs j={j} journey={journey} problem={problem} />
              </div>
            )}
            <ReadingToggle open={false} />
          </aside>
        ) : (
          <aside
            className="flex max-h-[45svh] min-h-0 flex-col gap-4 overflow-y-auto text-body lg:max-h-none lg:pr-1"
            aria-label="approach"
          >
            <DrawerTabs j={j} journey={journey} problem={problem} />
            <ReadingToggle open />
          </aside>
        )}
      </div>
    </div>
  )
}
