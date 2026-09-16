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
import { journeyBySlug } from "@/engine"
import type { AnyJourney } from "@/engine"
import { PATTERNS, PROBLEMS } from "@/data"
import { href } from "@/lib/route"
import { setPref, usePrefs } from "@/lib/store"
import { ActStepper } from "./act-stepper"
import { EdgeCaseCard, HintLadder, PredictCard, QuizCard } from "./cards"
import { ChallengeEditor } from "./challenge-editor"
import { DrawerTabs } from "./drawer-tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  BookOpenIcon,
  LightbulbIcon,
  ListTreeIcon,
  SplitIcon,
} from "lucide-react"
import { DataControls, Transport } from "./controls"
import { Stage } from "./panels"
import { useJourney } from "./use-journey"

// The phone's reading bar. Four destinations, the same four the reading
// column shows as tabs at lg — one place naming them, so the bar and the
// column can never drift apart.
const READING_TABS = [
  { v: "explain", label: "Explain", Icon: BookOpenIcon },
  { v: "hints", label: "Hints", Icon: LightbulbIcon },
  { v: "edges", label: "Edge cases", Icon: SplitIcon },
  { v: "trace", label: "Trace", Icon: ListTreeIcon },
] as const

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

/**
 * Takes a SLUG, not a journey.
 *
 * `App.tsx` decides whether the route exists by asking the manifest, and hands
 * over the slug; this component — which is lazy — resolves the real journey
 * from the registry. That one indirection is what keeps `@/engine` out of the
 * first chunk: before it, App imported `journeyBySlug` to answer "is this a
 * route", and answering it dragged all 93 journeys, their frame generators and
 * their prose into the shell. Measured at 567.7 KB over the wire.
 *
 * The slug is checked against the manifest before this renders, so the lookup
 * cannot miss — but it is guarded anyway rather than asserted, because a
 * manifest that has drifted should show a page, not throw.
 */
export function JourneyPage({
  slug,
  embedded = false,
}: {
  slug: string
  /**
   * Rendered INSIDE a problem page rather than as its own route.
   *
   * Two things have to go when it is: the trail, which would send a reader
   * "back" to the page they are already on, and the 28px title, which would be
   * a second one under the problem's own. Everything else — the stage, the
   * transport, XP, restart, the acts, the ledger — is identical, because it is
   * the same component and not a copy of it.
   */
  embedded?: boolean
}) {
  const journey = journeyBySlug(slug)
  if (!journey) return null
  return <JourneyView journey={journey} embedded={embedded} />
}

function JourneyView({
  journey,
  embedded = false,
}: {
  journey: AnyJourney
  embedded?: boolean
}) {
  const j = useJourney(journey)
  const problem = PROBLEMS.find((p) => p.id === journey.problemId)
  const pattern = problem && PATTERNS.find((p) => p.id === problem.pattern)
  const { act, model, frame } = j
  const { reading, drawer, motion } = usePrefs()
  // F5. The real wait for the frame on screen, so the bar under Play counts
  // down the actual hold rather than a guess. Nothing to count when paused,
  // and nothing at all when the learner has asked for no motion.
  const holdMs =
    j.player.playing && motion !== "off"
      ? j.delay * (j.frames[j.player.pos]?.hold ?? 1)
      : 0
  const edge = frame?.corner
    ? journey.edgeCases.find((e) => e.key === frame.corner)
    : undefined
  const [peek, setPeek] = useState(false)
  // which reading tab the phone sheet is showing; null = closed
  const [sheetTab, setSheetTab] = useState<string | null>(null)
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
        {/* One bar from lg — the trail and title on the left, the transport in
            the middle, XP and restart on the right (spec 1.1). Stacked below
            lg, where there is no width to put them side by side. */}
        {/* `lg:flex-nowrap` is right on the route, where this row has the
            1760px stage to spread across. Embedded it has a reading column,
            and the same row overflowed it by 36px — so embedded it wraps. */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 text-ui text-muted-foreground",
            !embedded && "lg:flex-nowrap"
          )}
        >
          {embedded ? null : problem && pattern ? (
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
            className={cn(
              "hidden min-w-0 items-baseline gap-3",
              // embedded, the problem page's own h1 names this already
              embedded ? "lg:hidden" : "lg:flex"
            )}
          >
            {/* the title does not shrink — the subtitle is the one that gives
                way, because an ellipsis on the name of the page is worse than
                an ellipsis on its gloss */}
            <span className="max-w-[22rem] shrink-0 truncate font-heading text-title font-semibold tracking-tight text-foreground">
              {journey.title}
            </span>
            <span className="hidden truncate text-ui text-muted-foreground xl:inline">
              {journey.subtitle}
            </span>
          </span>
          <span
            className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-meta"
            aria-label="experience points"
          >
            <StarIcon className="size-3 text-chart-4" /> {j.xp} XP
          </span>
          {/* The transport lives up here from lg, where it is always in view
              however far the reading column is scrolled. Below lg it stays at
              the foot of the stage: the header is budgeted at 220px on a
              390px phone (test/ui-smoke.test.mjs, U2/U14/U11) and an 85px
              transport blows that. Same handlers either way, so the two can
              never disagree. */}
          <div className="ml-2 hidden shrink-0 lg:flex">
            <Transport
              inline
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
              holdMs={holdMs}
            />
          </div>
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
        {/* B19. Restart re-locks every act, and a confirm dialog in front of it
          would tax the clicks that meant it to protect the one that did not.
          The click goes through; the ledger it destroyed is held for five
          seconds and this offers it back. `role=status` so a screen reader is
          told without having focus stolen. */}
        {j.undoRestart && (
          <div
            role="status"
            className="flex flex-wrap items-center gap-3 rounded-lg border border-chart-1/40 bg-chart-1/5 px-3 py-2 text-ui"
            aria-label="restart undo"
          >
            <span className="text-muted-foreground">
              Every act is locked again.
            </span>
            <Button
              size="sm"
              variant="secondary"
              className="min-h-8"
              onClick={j.undoRestart}
            >
              undo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto min-h-8 text-muted-foreground"
              onClick={j.dismissUndo}
              aria-label="dismiss undo"
            >
              dismiss
            </Button>
          </div>
        )}
        {/* Below lg the header bar has no room for the title, so it is
            restated here. Embedded, there is nothing to restate: the problem
            page's own h1 is six inches up the same page, and two identical
            28px titles is the duplication this page keeps removing. */}
        <div
          className={cn(
            "flex-wrap items-baseline gap-x-4 gap-y-1 lg:hidden",
            embedded ? "hidden" : "flex"
          )}
        >
          <h1 className="font-heading text-title font-semibold tracking-tight">
            {journey.title}
          </h1>
          {journey.leetcode && (
            <span className="font-mono text-meta text-muted-foreground">
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
            ? "lg:grid-cols-[minmax(0,1fr)_21rem]"
            : "lg:grid-cols-[minmax(0,1fr)_2.75rem]"
        )}
      >
        {/* ---------- the stage, with the drawer floating over it ---------- */}
        <div className="relative flex min-h-0 min-w-0 gap-4">
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
              <span className="ml-auto font-mono text-meta text-muted-foreground">
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
                    "border-b px-4 py-2 text-ui",
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
                <div className="px-4 pt-4 font-mono text-body text-muted-foreground">
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
                  <div className="py-8 text-center text-meta text-muted-foreground">
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
                className="mx-auto min-h-16 max-w-measure px-6 py-4 text-center text-body lg:text-narration"
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
                          "bg-chart-3 text-primary-foreground hover:bg-chart-3/90"
                      )}
                    >
                      {j.nextButton.label}
                    </Button>
                  </div>
                )}
                {j.adaptive && (
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-chart-4/40 bg-chart-4/5 p-3 text-ui">
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
            <div className="flex flex-col gap-3 border-t px-4 py-3 lg:hidden">
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
                holdMs={holdMs}
              />
              {/* below lg there is no room to push anything aside, so the
                controls stay where they have always been */}
              <div className="lg:hidden">{data}</div>
            </div>
          </section>

          {/* The test-case drawer (R4, B59). It FLOATS over the stage's right
            edge rather than taking a column of the row. Measured 2026-09-09 at
            1536px: as a column it cost the stage 862px → 574px, a third of its
            width, to show a short list of preset names. The stage is the
            product and the drawer is a control, so the control gives way. Same
            shape as the reading column's hover-peek next door. `inert` while
            closed so its fields stay out of the tab order. */}
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
              "absolute top-0 right-0 z-20 hidden w-72 transition-opacity duration-(--duration-reveal) lg:block",
              drawer ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <div className="flex w-72 flex-col gap-3 rounded-xl border bg-card p-4 shadow-2xl">
              <Label>test cases</Label>
              {data}
            </div>
          </aside>
        </div>

        {/* ---------- the reading column (or its rail) ---------- */}
        {!reading ? (
          <aside
            className="relative hidden rounded-xl border bg-card p-1 lg:flex lg:flex-col"
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
            className="hidden max-h-[45svh] min-h-0 flex-col gap-4 overflow-y-auto text-body lg:flex lg:max-h-none lg:pr-1"
            aria-label="approach"
          >
            <DrawerTabs j={j} journey={journey} problem={problem} />
            <ReadingToggle open />
          </aside>
        )}

        {/* ---------- below lg: the reading column IS a bottom nav bar ----------
            Measured on a 390x844 phone before this: the stage — the thing the
            product IS — got 197px, 23% of the viewport, while the reading
            column below it took `max-h-[45svh]`, nearly twice as much. A
            learner on a phone was watching the algorithm through a letterbox
            in order to keep four tabs permanently on screen.

            So below lg the column is gone and its four destinations are a bar:
            56px instead of ~380px, which hands the stage back about 45% of the
            screen. Each button opens the SAME `DrawerTabs` in a bottom sheet,
            controlled straight to that tab — one component, one set of tab
            names (READING_TABS), so the bar and the column cannot drift.

            `lg` and up is untouched: the column is still a column, and the
            tests that read `aside[aria-label="approach"]` run at 1440. */}
        <nav
          aria-label="reading"
          className="flex items-stretch gap-1 border-t pt-2 lg:hidden"
        >
          {READING_TABS.map(({ v, label, Icon }) => (
            <button
              key={v}
              onClick={() => setSheetTab(v)}
              aria-haspopup="dialog"
              className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 text-meta text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </button>
          ))}
        </nav>
        <Sheet
          open={sheetTab !== null}
          onOpenChange={(o: boolean) => !o && setSheetTab(null)}
        >
          <SheetContent
            side="bottom"
            className="flex max-h-[80svh] flex-col lg:hidden"
          >
            <SheetHeader>
              <SheetTitle>{problem?.title ?? journey.title}</SheetTitle>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 text-body">
              <DrawerTabs
                j={j}
                journey={journey}
                problem={problem}
                value={sheetTab ?? "explain"}
                onValueChange={setSheetTab}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
