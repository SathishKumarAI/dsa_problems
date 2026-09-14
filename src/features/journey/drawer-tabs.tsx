// The reading column, as tabs instead of one long scroll (spec 5.2):
// Explain / Hints / Edge cases / Trace, one panel visible at a time.
//
// It does NOT use <ProblemPanel>. That component bundles three things behind
// one accordion — the statement, the "how to read this" hints, and the corner
// cases — and the spec wants the last two as tabs of their own. Rendering its
// three parts here directly is what keeps the split clean; using it as well
// would show the hints and the corner cases in two places at once.
//
// Nothing from the old column was dropped: statement, examples and the
// current input are in Explain, the hints and the corner cases have a tab
// each, and the trace is unchanged.

import { ExternalLinkIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AnyJourney } from "@/engine"
import type { Problem } from "@/data"
import { EdgeCaseList } from "./cards"
import { Legend } from "./chip-row"
import { CodePanel } from "./code-panel"
import { StepsChart } from "./steps-chart"
import { TracePanel } from "./trace-panel"
import type { JourneyController } from "./use-journey"

// same three labels the problem panel used, so the ladder reads identically
const HINT_LABELS = ["reread", "formalize", "bring inputs"]

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-meta tracking-wide text-muted-foreground uppercase">
      {children}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      {children}
    </div>
  )
}

const PANEL = "flex min-h-0 flex-col gap-4 overflow-y-auto"

export function DrawerTabs({
  j,
  journey,
  problem,
  value,
  onValueChange,
}: {
  j: JourneyController
  journey: AnyJourney
  problem?: Problem
  /** controlled tab — the phone's bottom nav bar opens straight to one.
   *  Omit both and the strip stays uncontrolled, opening on Explain. */
  value?: string
  onValueChange?: (v: string) => void
}) {
  const { act, frame } = j
  const input = j.data ? journey.describe(j.data) : ""
  const hints = journey.acts[0]?.hints ?? []
  return (
    <Tabs
      {...(value === undefined
        ? { defaultValue: "explain" }
        : { value, onValueChange: (v: string) => onValueChange?.(v) })}
      className="flex min-h-0 flex-1 flex-col gap-3"
    >
      {/* Base UI's Tabs gives arrow-key movement and a roving tabindex for
        free — the reason not to hand-roll a tab strip. */}
      <TabsList variant="line" aria-label="approach panels">
        <TabsTrigger value="explain">Explain</TabsTrigger>
        <TabsTrigger value="hints">Hints</TabsTrigger>
        <TabsTrigger value="edges">Edge cases</TabsTrigger>
        <TabsTrigger value="trace">Trace</TabsTrigger>
      </TabsList>

      <TabsContent value="explain" className={PANEL}>
        <Card>
          {act.insight && (
            <p className="font-semibold text-chart-1">{act.insight}</p>
          )}
          <p className="max-w-[35em] text-muted-foreground">{act.idea}</p>
        </Card>

        <Card>
          <Label>the problem</Label>
          <p className="max-w-[35em] text-muted-foreground">
            {problem?.statement ?? journey.subtitle}
          </p>
          {problem?.examples.map((e, i) => (
            <div key={i} className="flex flex-col gap-0.5 font-mono text-ui">
              <span className="text-muted-foreground">
                in <span className="text-foreground">{e.input}</span>
              </span>
              <span className="text-muted-foreground">
                out <span className="text-foreground">{e.output}</span>
              </span>
              {e.note && (
                <span className="font-sans text-meta text-muted-foreground">
                  {e.note}
                </span>
              )}
            </div>
          ))}
          {input && (
            <p className="font-mono text-ui text-muted-foreground">
              on screen now <span className="text-foreground">{input}</span>
            </p>
          )}
        </Card>

        {act.tools?.length ? (
          <Card>
            <Label>what this approach is built from</Label>
            {act.tools.map((t) => (
              <div key={t.name}>
                <b>{t.name}</b>{" "}
                <span className="text-muted-foreground">— {t.role}</span>
              </div>
            ))}
          </Card>
        ) : null}

        <CodePanel code={act.code} line={frame?.line ?? -1} />

        <Card>
          <Label>what to understand</Label>
          <ul className="flex flex-col gap-1.5 text-muted-foreground">
            {act.takeaways.map((t, i) => (
              <li key={i} className="flex max-w-[35em] gap-2">
                <span className="text-chart-1">›</span>
                {t}
              </li>
            ))}
          </ul>
        </Card>

        {j.chart.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <StepsChart rows={j.chart} active={j.actKey} />
          </div>
        )}

        <Card>
          <Label>legend</Label>
          <Legend />
        </Card>

        <p className="max-w-[35em] text-ui text-muted-foreground">
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
      </TabsContent>

      <TabsContent value="hints" className={PANEL}>
        <Card>
          <Label>how to read this problem</Label>
          {hints.length ? (
            hints.map((h, i) => (
              <p key={i} className="max-w-[35em] text-muted-foreground">
                <span className="mr-2 font-mono text-meta text-primary">
                  {HINT_LABELS[i] ?? `hint ${i + 1}`}
                </span>
                {h}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">
              This journey has no reading hints — the story act carries them
              instead.
            </p>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="edges" className={PANEL}>
        <Card>
          <Label>bring three inputs before any code</Label>
          <EdgeCaseList
            edges={journey.edgeCases}
            current={j.presetKey}
            onLoad={j.applyPreset}
          />
        </Card>
      </TabsContent>

      <TabsContent value="trace" className={PANEL}>
        <TracePanel frames={j.frames} pos={j.player.pos} onSeek={j.seek} />
      </TabsContent>
    </Tabs>
  )
}
