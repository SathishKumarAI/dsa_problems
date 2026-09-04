// One journey on screen. Owns layout only — the stage (data, narration,
// approach panel, timeline, controls) on the left, the reading column
// (insight, tools, code, takeaways, chart, legend, resources) on the right,
// the act stepper on top. The reading column collapses to an icon rail
// (toggle at its foot, pref `reading`) so the stage can take the width.
// Every behaviour comes from useJourney. Panel map: docs/FEATURES.md §Journey page.

import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  FlameIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  RotateCcwIcon,
  StarIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AnyJourney } from "@/engine"
import { PATTERNS, PROBLEMS } from "@/data"
import { href } from "@/lib/route"
import { setPref, usePrefs } from "@/lib/store"
import { ActStepper } from "./act-stepper"
import { HintLadder, PredictCard, QuizCard } from "./cards"
import { ChallengeEditor } from "./challenge-editor"
import { Legend } from "./chip-row"
import { CodePanel } from "./code-panel"
import { DataControls, Transport } from "./controls"
import { Stage } from "./panels"
import { StepsChart } from "./steps-chart"
import { useJourney } from "./use-journey"

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs tracking-wide text-muted-foreground uppercase">
      {children}
    </div>
  )
}

// sits at the foot of the reading column / its rail; sticky so it is reachable mid-scroll
function ReadingToggle({ open }: { open: boolean }) {
  return (
    <div className="sticky bottom-4 mt-auto flex w-full justify-end lg:justify-center">
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
  const reading = usePrefs().reading

  return (
    <div className="mx-auto flex w-full max-w-[110rem] flex-col gap-5">
      {/* header */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {problem && pattern ? (
            <a
              href={href(`/p/${pattern.id}/${problem.id}`)}
              className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" /> {problem.title} ·{" "}
              {pattern.name}
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
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={j.restart}
            title="re-lock every act and start again"
          >
            <RotateCcwIcon data-icon="inline-start" />
            restart journey
          </Button>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {journey.title}
          </h1>
          {journey.leetcode && (
            <span className="font-mono text-xs text-muted-foreground">
              LeetCode {journey.leetcode}
            </span>
          )}
          <p className="text-sm text-muted-foreground">{journey.subtitle}</p>
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
          "grid gap-5",
          reading
            ? "lg:grid-cols-[minmax(0,1fr)_24rem]"
            : "lg:grid-cols-[minmax(0,1fr)_2.75rem]"
        )}
      >
        {/* ---------- the stage ---------- */}
        <section
          className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-lg"
          aria-label="stage"
        >
          <div className="flex items-center gap-3 border-b bg-background/40 px-4 py-2">
            <span className="font-mono text-sm text-muted-foreground">
              act {String(j.actIndex + 1).padStart(2, "0")} · {act.name}
            </span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {act.complexity}
            </span>
          </div>

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

          {/* narration: the star of the page */}
          <p
            className="min-h-16 border-t bg-background/40 px-6 py-4 text-center text-base leading-relaxed lg:text-lg"
            aria-live="polite"
          >
            <span className="mr-1 text-primary">›</span>
            {frame?.note ?? ""}
          </p>

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
                      "animate-in duration-500 fade-in slide-in-from-bottom-1"
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
              {j.hints && (
                <HintLadder
                  hints={j.hints.hints}
                  tier={j.hints.tier}
                  onMore={j.hints.more}
                />
              )}
            </div>
          )}

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
          </div>
        </section>

        {/* ---------- the reading column (or its rail) ---------- */}
        {!reading ? (
          <aside
            className="flex rounded-xl border bg-card p-1 lg:flex-col"
            aria-label="approach (collapsed)"
          >
            <ReadingToggle open={false} />
          </aside>
        ) : (
          <aside
            className="flex flex-col gap-4 text-[15px] leading-relaxed"
            aria-label="approach"
          >
            <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
              {act.insight && (
                <p className="font-semibold text-chart-1">{act.insight}</p>
              )}
              <p className="text-muted-foreground">{act.idea}</p>
            </div>

            {act.tools?.length ? (
              <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
                <Label>what this approach is built from</Label>
                {act.tools.map((t) => (
                  <div key={t.name}>
                    <b>{t.name}</b>{" "}
                    <span className="text-muted-foreground">— {t.role}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <CodePanel code={act.code} line={frame?.line ?? -1} />

            <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
              <Label>what to understand</Label>
              <ul className="flex flex-col gap-1.5 text-muted-foreground">
                {act.takeaways.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-chart-1">›</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {j.chart.length > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <StepsChart rows={j.chart} active={j.actKey} />
              </div>
            )}

            <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
              <Label>legend</Label>
              <Legend />
            </div>

            <p className="text-sm text-muted-foreground">
              same problem elsewhere:{" "}
              {journey.resources.map((r, i) => (
                <span key={r.url}>
                  {i > 0 && " · "}
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-0.5 underline-offset-2 hover:text-foreground hover:underline"
                  >
                    {r.label} <ExternalLinkIcon className="size-3" />
                  </a>
                </span>
              ))}
            </p>
            <ReadingToggle open />
          </aside>
        )}
      </div>
    </div>
  )
}
