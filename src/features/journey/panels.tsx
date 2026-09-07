// The approach panel: everything a PanelModel can be, plus <Stage/> which
// draws a whole StageModel (chips + panel) and FLIPs between frames.
// Owns drawing only. Add a panel kind = one case here + one in engine/types.

import { useRef } from "react"
import { cn } from "@/lib/utils"
import type { BitRowModel, PanelModel, StageModel, SumModel } from "@/engine"
import { ChipRow } from "./chip-row"
import { HashMapView } from "./hash-map-view"
import { useFlip } from "./use-flip"

function SumEq({
  eq,
  need,
}: {
  eq?: SumModel
  need?: { need: number; hit: boolean; target: number; x: number }
}) {
  if (need) {
    return (
      <div className="flex items-baseline justify-center gap-3 font-mono text-2xl">
        <span className="text-muted-foreground">need</span>
        <b
          className={cn(
            "text-display",
            need.hit ? "text-chart-3" : "text-foreground"
          )}
        >
          {need.need}
        </b>
        <span className="text-sm text-muted-foreground">
          {need.target} − {need.x}
        </span>
      </div>
    )
  }
  if (!eq) return null
  const ok = eq.sum === eq.target
  return (
    <div className="flex items-baseline justify-center gap-2 font-mono text-2xl">
      <span>{eq.a}</span>
      <span className="text-muted-foreground">+</span>
      <span>{eq.b}</span>
      <span className="text-muted-foreground">=</span>
      <b className={cn("text-display", ok ? "text-chart-3" : "text-chart-5")}>
        {eq.sum}
      </b>
      <span className="ml-2 text-sm text-muted-foreground">
        target {eq.target}
      </span>
    </div>
  )
}

function BitRow({ row }: { row: BitRowModel }) {
  const cells = []
  for (let b = row.bits - 1; b >= 0; b--) {
    const on = (row.value >> b) & 1
    const flip = (row.flip >> b) & 1
    cells.push(
      <span
        key={b}
        className={cn(
          "flex size-9 items-center justify-center rounded border font-mono text-base tabular-nums transition-colors",
          on
            ? "border-chart-2 bg-chart-2/20 text-chart-2"
            : "border-border/60 text-muted-foreground/50",
          flip && "ring-2 ring-chart-5/80 ring-offset-1 ring-offset-background"
        )}
      >
        {on}
      </span>
    )
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-10 font-mono text-sm text-muted-foreground">
        {row.tag}
      </span>
      {cells}
      <span className="ml-2 font-mono text-base tabular-nums">
        = {row.value}
      </span>
    </div>
  )
}

// a + b + c = sum against a target (or "need" when the last term is unknown),
// then the distinct answers found so far; the newest is ringed, a dropped
// repeat is shown struck through.
function Terms({ p }: { p: Extract<PanelModel, { kind: "terms" }> }) {
  const sum = p.terms.reduce((a, b) => a + b, 0)
  const complete = p.need === undefined && p.terms.length > 0
  const ok = complete && sum === p.target
  return (
    <div className="flex flex-col gap-4">
      {p.terms.length > 0 && (
        <div className="flex flex-wrap items-baseline justify-center gap-2 font-mono text-2xl">
          {p.terms.map((t, i) => (
            <span key={i} className="contents">
              {i > 0 && <span className="text-muted-foreground">+</span>}
              <span>{t}</span>
            </span>
          ))}
          {p.need !== undefined ? (
            <>
              <span className="text-muted-foreground">+</span>
              <b
                className={cn(
                  "text-display",
                  p.hit ? "text-chart-3" : "text-foreground"
                )}
              >
                {p.need}
              </b>
              <span className="text-muted-foreground">= {p.target}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                need {p.need} — {p.hit ? "seen" : "not seen"}
              </span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">=</span>
              <b
                className={cn(
                  "text-display",
                  ok ? "text-chart-3" : "text-chart-5"
                )}
              >
                {sum}
              </b>
              <span className="ml-2 text-sm text-muted-foreground">
                target {p.target}
              </span>
            </>
          )}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <div className="text-meta tracking-wide text-muted-foreground uppercase">
          found — distinct triples ({p.found.length})
        </div>
        <div className="flex flex-wrap gap-2" aria-label="found">
          {p.found.length === 0 && (
            <span className="font-mono text-sm text-muted-foreground/60">
              none yet
            </span>
          )}
          {p.found.map((t, i) => (
            <span
              key={t.join(",")}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-sm tabular-nums",
                i === p.found.length - 1 && p.hit && !p.dup
                  ? "border-chart-3 bg-chart-3/15 text-chart-3"
                  : "border-border bg-card"
              )}
            >
              [{t.join(", ")}]
            </span>
          ))}
          {p.dup && p.terms.length === 3 && (
            <span className="rounded-md border border-chart-5/60 px-2.5 py-1 font-mono text-sm text-chart-5 line-through">
              [{[...p.terms].sort((a, b) => a - b).join(", ")}]
            </span>
          )}
        </div>
      </div>
      {p.map && <HashMapView map={p.map} />}
    </div>
  )
}

function Recap({ p }: { p: Extract<PanelModel, { kind: "recap" }> }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-meta tracking-wide text-muted-foreground uppercase">
        {p.caption}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-body">
          <thead>
            <tr className="text-left text-meta tracking-wide text-muted-foreground uppercase">
              <th className="py-1 pr-3 font-medium">approach</th>
              <th className="py-1 pr-3 font-medium text-chart-1">built from</th>
              <th className="py-1 pr-3 font-medium">cost</th>
              <th className="py-1 font-medium">
                the insight that got you there
              </th>
            </tr>
          </thead>
          <tbody>
            {p.rows.map((r) => (
              <tr key={r.name} className="border-t border-border/60 align-top">
                <td className="py-2 pr-3 font-medium">{r.name}</td>
                <td className="py-2 pr-3 text-chart-1">{r.built}</td>
                <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">
                  {r.cost}
                </td>
                <td className="py-2 text-muted-foreground">{r.insight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-body text-muted-foreground">{p.note}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {p.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="rounded-lg border bg-background/40 p-3 transition-colors hover:border-primary/60"
          >
            <b className="text-sm">{l.label} ▸</b>
            <div className="text-xs text-muted-foreground">{l.detail}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

// Heights as columns. The water is drawn INSIDE each column of the span
// rather than as one absolutely positioned rectangle, so it needs no
// measuring and cannot drift from the bars it belongs to: a translucent
// block from the floor up to the shorter wall, with the bar itself painted
// over it. A wall taller than the water therefore sticks out of it, which is
// the physical fact the problem turns on.
function Bars({ p }: { p: Extract<PanelModel, { kind: "bars" }> }) {
  const max = Math.max(...p.bars.map((b) => b.value), 1)
  const pct = (v: number) => `${(v / max) * 88}%`
  const showValues = p.bars.length <= 24
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex h-56 items-stretch justify-center gap-[3px]"
        aria-label="heights as bars"
      >
        {p.bars.map((b, i) => {
          const wet =
            p.water !== undefined && i >= p.water.from && i <= p.water.to
          const r = b.roles
          const fill = r.includes("answer")
            ? "bg-chart-3"
            : r.includes("anchor")
              ? "bg-chart-4"
              : r.includes("focus")
                ? "bg-[var(--yellow)]"
                : r.includes("dim")
                  ? "bg-muted/60 opacity-40"
                  : "bg-chart-2/70"
          return (
            <div
              key={b.key}
              data-k={b.key}
              className="relative flex min-w-1 flex-1 flex-col items-center justify-end gap-1"
              style={{ maxWidth: 40 }}
            >
              {wet && (
                <div
                  className="absolute inset-x-0 bottom-0 rounded-t-[2px] bg-chart-2/25"
                  style={{ height: pct(p.water!.height) }}
                  aria-hidden
                />
              )}
              {showValues && (
                <span
                  className={cn(
                    "z-10 font-mono text-[10px] tabular-nums",
                    r.length ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {b.value}
                </span>
              )}
              <div
                className={cn(
                  "z-10 w-full origin-bottom rounded-t-[4px]",
                  fill
                )}
                style={{ height: pct(b.value), minHeight: 3 }}
              />
            </div>
          )
        })}
      </div>
      {p.water && (
        <div className="text-center font-mono text-lg tabular-nums">
          <span className={p.water.best ? "text-chart-3" : "text-foreground"}>
            {p.water.label}
          </span>
        </div>
      )}
      {p.best && (
        <div className="text-center font-mono text-meta text-muted-foreground">
          {p.best}
        </div>
      )}
    </div>
  )
}

export function Panel({
  panel,
  challenge,
}: {
  panel: PanelModel
  challenge?: React.ReactNode
}) {
  switch (panel.kind) {
    case "none":
      return null
    case "story":
      return (
        <div className="py-8 text-center text-5xl tracking-widest">
          {panel.glyph}
        </div>
      )
    case "sum":
      return <SumEq eq={panel.eq} />
    case "need":
      return (
        <div className="flex flex-col gap-4">
          <SumEq need={panel} />
          <HashMapView map={panel.map} />
        </div>
      )
    case "hash":
      return <HashMapView map={panel.map} />
    case "sorted":
      return (
        <div className="flex flex-col gap-3">
          <div className="text-meta tracking-wide text-muted-foreground uppercase">
            {panel.label}
          </div>
          <ChipRow chips={panel.chips} indexed={false} />
          {panel.eq && <SumEq eq={panel.eq} />}
        </div>
      )
    case "bits":
      return (
        <div className="flex flex-col gap-2">
          <div className="text-meta tracking-wide text-muted-foreground uppercase">
            accumulator (bit view) — ring = bits that just flipped
          </div>
          {panel.rows.map((r) => (
            <BitRow key={r.tag} row={r} />
          ))}
        </div>
      )
    case "bars":
      return <Bars p={panel} />
    case "terms":
      return <Terms p={panel} />
    case "recap":
      return <Recap p={panel} />
    case "challenge":
      return <>{challenge}</>
  }
}

// The two containers are FLIPped separately: sorted-copy rows reuse the
// input row's keys, and one flat map would morph a chip into a stranger.
export function Stage({
  model,
  stepDelay,
  challenge,
}: {
  model: StageModel
  stepDelay: number
  challenge?: React.ReactNode
}) {
  const arrayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  useFlip(arrayRef, model, stepDelay)
  useFlip(panelRef, model, stepDelay)
  return (
    <>
      <div
        ref={arrayRef}
        // the row reserves chip height only when there are chips: a bars panel
        // owns the whole stage, and an empty 6rem band above it reads as a bug
        className={cn(
          "flex items-end justify-center px-2",
          model.chips && "min-h-24"
        )}
      >
        {model.chips ? (
          <ChipRow chips={model.chips} />
        ) : (
          // no chips has two meanings: the story act deliberately withholding
          // the data ("the need comes first"), and a panel that IS the whole
          // stage (bars). Only the first one wants a placeholder.
          model.panel.kind === "story" && (
            <div className="text-sm text-muted-foreground">
              the stage is empty on purpose — the need comes first
            </div>
          )
        )}
      </div>
      <div
        ref={panelRef}
        className={cn(
          "px-2",
          model.panel.kind !== "none" && "border-t border-border/60 pt-4"
        )}
      >
        <Panel panel={model.panel} challenge={challenge} />
      </div>
    </>
  )
}
