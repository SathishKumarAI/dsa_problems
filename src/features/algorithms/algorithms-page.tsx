// Sorting / searching / graph visualizer. Owns: the algorithm picker, the
// input generators, and the page layout. Bars and graph drawing live in
// views.tsx; frames come from the API (api.runArray / api.runGraph) and
// play through the same usePlayer the journeys use.

import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "@/api/client"
import { cn } from "@/lib/utils"
import { ALGORITHMS } from "@/engine/algorithms"
import type { ArrayFrame, GraphFrame } from "@/engine/algorithms"
import { CodePanel } from "@/features/journey/code-panel"
import { Transport } from "@/features/journey/controls"
import { delayFor, usePlayer } from "@/features/journey/use-player"
import { replaceQuery, useRoute } from "@/lib/route"
import { setPref, usePrefs } from "@/lib/store"
import { BarsView, GraphView } from "./views"

type Gen = "random" | "nearly" | "reversed" | "few"
const GENERATORS: Record<
  Gen,
  { label: string; make: (n: number) => number[] }
> = {
  random: {
    label: "random",
    make: (n) =>
      Array.from({ length: n }, () => 5 + Math.floor(Math.random() * 95)),
  },
  nearly: {
    label: "nearly sorted",
    make: (n) => {
      const a = Array.from(
        { length: n },
        (_, i) => 5 + Math.round((i / n) * 95)
      )
      for (let k = 0; k < Math.max(1, n / 8); k++) {
        const i = Math.floor(Math.random() * n)
        const j = Math.floor(Math.random() * n)
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    },
  },
  reversed: {
    label: "reversed",
    make: (n) =>
      Array.from({ length: n }, (_, i) => 5 + Math.round(((n - i) / n) * 95)),
  },
  few: {
    label: "few unique",
    make: (n) =>
      Array.from(
        { length: n },
        () => [15, 35, 55, 75, 95][Math.floor(Math.random() * 5)]
      ),
  },
}

const GROUPS: { label: string; keys: string[] }[] = [
  {
    label: "sorting",
    keys: ["bubble", "selection", "insertion", "merge", "quick", "heap"],
  },
  { label: "searching", keys: ["binary"] },
  { label: "graphs", keys: ["bfs", "dfs", "dijkstra"] },
]

type Timeline =
  | { kind: "array"; frames: ArrayFrame[] }
  | {
      kind: "graph"
      frames: GraphFrame[]
      graph: {
        nodes: { x: number; y: number }[]
        edges: [number, number, number][]
      }
    }

export function AlgorithmsPage() {
  const route = useRoute()
  const prefs = usePrefs()
  const initial = route.query.get("algo")
  const [algoKey, setAlgoKey] = useState(
    initial && ALGORITHMS[initial] ? initial : "bubble"
  )
  const algo = ALGORITHMS[algoKey]
  const [size, setSize] = useState(16)
  const [gen, setGen] = useState<Gen>("random")
  const [array, setArray] = useState<number[]>(() => GENERATORS.random.make(16))
  const [target, setTarget] = useState<number>(() => array[3])
  const [nodes, setNodes] = useState(9)
  const [seed, setSeed] = useState(0) // bump to regenerate a graph
  const [timeline, setTimeline] = useState<Timeline>({
    kind: "array",
    frames: [],
  })

  const regenerate = useCallback(() => {
    const a = GENERATORS[gen].make(size)
    setArray(a)
    setTarget(a[Math.floor(Math.random() * a.length)])
    setSeed((s) => s + 1)
  }, [gen, size])

  useEffect(() => {
    let live = true
    if (algo.kind === "graph") {
      api
        .runGraph(algoKey, nodes)
        .then(
          (r) =>
            live &&
            setTimeline({ kind: "graph", frames: r.frames, graph: r.graph })
        )
    } else {
      api
        .runArray(algoKey, array, algo.kind === "search" ? target : undefined)
        .then((r) => live && setTimeline({ kind: "array", frames: r.frames }))
    }
    return () => {
      live = false
    }
  }, [algoKey, algo.kind, array, target, nodes, seed])

  useEffect(() => replaceQuery({ algo: algoKey }), [algoKey])

  const delay = delayFor(prefs.speed)
  const frames = timeline.frames as { hold?: number }[]
  const player = usePlayer(frames, delay)
  const frame = timeline.frames[player.pos]
  const stats = useMemo(
    () => (timeline.kind === "array" && frame ? (frame as ArrayFrame) : null),
    [timeline.kind, frame]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName)) return
      if (e.key === " ") {
        e.preventDefault()
        player.toggle()
      } else if (e.key === "ArrowRight") {
        player.pause()
        player.step()
      } else if (e.key === "ArrowLeft") player.back()
      else if (e.key === "r") player.reset()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [player])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Algorithm visualizer
        </h1>
        <p className="text-sm text-muted-foreground">
          Every algorithm is a generator of steps; the stage knows nothing about
          the algorithm. Bars morph, they don't teleport.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)_20rem]">
        {/* picker */}
        <nav className="flex flex-col gap-4" aria-label="algorithms">
          {GROUPS.map((g) => (
            <div key={g.label} className="flex flex-col gap-1">
              <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
                {g.label}
              </div>
              {g.keys.map((k) => (
                <button
                  key={k}
                  onClick={() => setAlgoKey(k)}
                  aria-current={k === algoKey ? "page" : undefined}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    k === algoKey
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {ALGORITHMS[k].name}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* stage */}
        <section
          className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-lg"
          aria-label="stage"
        >
          <div className="flex items-center gap-3 border-b bg-background/40 px-4 py-2">
            <span className="text-sm font-medium">{algo.name}</span>
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">
              {algo.complexity}
            </span>
          </div>
          <div className="px-4 py-5">
            {timeline.kind === "graph" && frame ? (
              <GraphView
                graph={timeline.graph}
                frame={frame as GraphFrame}
                weighted={algo.kind === "graph" && !!algo.weighted}
              />
            ) : timeline.kind === "array" && frame ? (
              <BarsView frame={frame as ArrayFrame} stepDelay={delay} />
            ) : (
              <div className="py-16 text-center text-xs text-muted-foreground">
                loading…
              </div>
            )}
          </div>
          <p
            className="min-h-12 border-t bg-background/40 px-5 py-3 text-center text-sm"
            aria-live="polite"
          >
            <span className="mr-1 text-primary">›</span>
            {frame?.note ?? ""}
          </p>
          <div className="flex flex-col gap-3 border-t px-4 py-3">
            <Transport
              pos={player.pos}
              last={player.last}
              playing={player.playing}
              onToggle={player.toggle}
              onStep={() => {
                player.pause()
                player.step()
              }}
              onBack={player.back}
              onReset={player.reset}
              onSeek={(i) => {
                player.pause()
                player.seek(i)
              }}
              speed={prefs.speed}
              onSpeed={(v) => setPref("speed", v)}
            />
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {algo.kind === "graph" ? (
                <label className="flex items-center gap-2">
                  nodes{" "}
                  <input
                    type="range"
                    min={4}
                    max={14}
                    value={nodes}
                    onChange={(e) => setNodes(Number(e.target.value))}
                    className="w-24 accent-primary"
                  />{" "}
                  <span className="font-mono">{nodes}</span>
                </label>
              ) : (
                <>
                  <label className="flex items-center gap-2">
                    size{" "}
                    <input
                      type="range"
                      min={4}
                      max={60}
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-24 accent-primary"
                    />{" "}
                    <span className="font-mono">{size}</span>
                  </label>
                  <select
                    value={gen}
                    onChange={(e) => setGen(e.target.value as Gen)}
                    className="h-7 rounded-md border bg-background px-2 text-xs"
                    aria-label="array shape"
                  >
                    {(Object.keys(GENERATORS) as Gen[]).map((k) => (
                      <option key={k} value={k}>
                        {GENERATORS[k].label}
                      </option>
                    ))}
                  </select>
                  {algo.kind === "search" && (
                    <label className="flex items-center gap-1">
                      target{" "}
                      <input
                        type="number"
                        value={target}
                        onChange={(e) => setTarget(Number(e.target.value))}
                        className="h-7 w-16 rounded-md border bg-background px-2 font-mono text-xs"
                      />
                    </label>
                  )}
                </>
              )}
              <button
                onClick={regenerate}
                className="rounded-md border px-2.5 py-1 hover:border-primary/60"
              >
                new {algo.kind === "graph" ? "graph" : "array"}
              </button>
              {stats && (
                <span className="ml-auto font-mono tabular-nums">
                  {stats.cmp} compares · {stats.swp} writes
                </span>
              )}
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <CodePanel
            code={{ pseudo: algo.pseudocode }}
            line={frame?.line ?? -1}
          />
          <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
            <div className="mb-2 text-[11px] tracking-wide uppercase">
              legend
            </div>
            <div className="flex flex-col gap-1">
              <span>
                <i className="mr-2 inline-block size-2.5 rounded-sm bg-yellow" />
                comparing
              </span>
              <span>
                <i className="mr-2 inline-block size-2.5 rounded-sm bg-chart-5" />
                swap
              </span>
              <span>
                <i className="mr-2 inline-block size-2.5 rounded-sm bg-chart-1" />
                write (merge sort stores in place — the bar pulses)
              </span>
              <span>
                <i className="mr-2 inline-block size-2.5 rounded-sm bg-chart-4" />
                pivot / range
              </span>
              <span>
                <i className="mr-2 inline-block size-2.5 rounded-sm bg-chart-3" />
                in final place
              </span>
              <span>
                <i className="mr-2 inline-block size-2.5 rounded-sm bg-muted/60 opacity-40" />
                discarded (faded, not greyed)
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            space play/pause · ← → step · r reset
          </p>
        </aside>
      </div>
    </div>
  )
}
