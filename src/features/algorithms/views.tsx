// Drawing for the visualizer page. BarsView: one column per value, keyed
// by value+occurrence so a swap FLIPs the two columns past each other
// instead of blinking heights. GraphView: SVG nodes and edges with
// visited / frontier / current states and Dijkstra's distance labels.
// Owns drawing only.

import { useRef } from "react"
import { cn } from "@/lib/utils"
import type { ArrayFrame, GraphFrame } from "@/engine/algorithms"
import { useFlip } from "@/features/journey/use-flip"
import { usePrefs } from "@/lib/store"

export function BarsView({
  frame,
  stepDelay,
}: {
  frame: ArrayFrame
  stepDelay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useFlip(ref, frame, stepDelay)
  // a swap moves two bars past each other and FLIP shows it; a write replaces
  // a value in place, where there is nothing to move — so it gets a pulse
  const { motion } = usePrefs()
  const seen = new Map<number, number>()
  const max = Math.max(...frame.arr, 1)
  const sorted = new Set(frame.sorted)
  const discard = new Set(frame.discard)
  const showValues = frame.arr.length <= 24
  return (
    <div
      ref={ref}
      className="flex h-56 items-stretch justify-center gap-[3px]"
      aria-label="array as bars"
    >
      {frame.arr.map((v, i) => {
        const n = seen.get(v) ?? 0
        seen.set(v, n + 1)
        const mark = frame.marks[i]
        const state =
          mark === "compare"
            ? "bg-yellow"
            : mark === "swap"
              ? "bg-chart-5"
              : mark === "write"
                ? "bg-chart-1"
                : mark === "pivot"
                  ? "bg-chart-4"
                  : sorted.has(i)
                    ? "bg-chart-3"
                    : discard.has(i)
                      ? "bg-muted/60 opacity-40"
                      : "bg-chart-2/70"
        return (
          <div
            key={`${v}#${n}`}
            data-k={`v${v}#${n}`}
            className="flex h-full min-w-1 flex-1 flex-col items-center justify-end gap-1"
            style={{ maxWidth: 40 }}
          >
            {showValues && (
              <span
                className={cn(
                  "font-mono text-[10px] tabular-nums",
                  mark ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {v}
              </span>
            )}
            <div
              className={cn(
                "w-full origin-bottom rounded-t-[4px] transition-[background-color,opacity] duration-200",
                state,
                mark === "write" && motion !== "off" && "animate-write-pulse"
              )}
              style={{ height: `${(v / max) * 88}%`, minHeight: 4 }}
            />
          </div>
        )
      })}
    </div>
  )
}

interface GraphProps {
  graph: {
    nodes: { x: number; y: number }[]
    edges: [number, number, number][]
  }
  frame: GraphFrame
  weighted: boolean
}

export function GraphView({ graph, frame, weighted }: GraphProps) {
  const visited = new Set(frame.visited)
  const frontier = new Set(frame.frontier)
  const isActive = (u: number, v: number) =>
    frame.activeEdge &&
    ((frame.activeEdge[0] === u && frame.activeEdge[1] === v) ||
      (frame.activeEdge[0] === v && frame.activeEdge[1] === u))
  return (
    <svg
      viewBox="0 0 100 100"
      className="mx-auto h-80 w-full max-w-xl"
      role="img"
      aria-label="graph"
    >
      {graph.edges.map(([u, v, w]) => {
        const a = graph.nodes[u]
        const b = graph.nodes[v]
        const active = isActive(u, v)
        return (
          <g key={`${u}-${v}`}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={cn(
                "transition-[stroke] duration-200",
                active ? "stroke-yellow" : "stroke-border"
              )}
              strokeWidth={active ? 1.2 : 0.6}
            />
            {weighted && (
              <text
                x={(a.x + b.x) / 2}
                y={(a.y + b.y) / 2}
                fontSize={3}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground font-mono"
              >
                {w}
              </text>
            )}
          </g>
        )
      })}
      {graph.nodes.map((n, i) => {
        const cur = frame.current === i
        const fill = cur
          ? "fill-yellow"
          : visited.has(i)
            ? "fill-chart-3"
            : frontier.has(i)
              ? "fill-chart-4"
              : "fill-card"
        const stroke = cur
          ? "stroke-foreground"
          : visited.has(i)
            ? "stroke-chart-3"
            : frontier.has(i)
              ? "stroke-chart-4"
              : "stroke-muted-foreground"
        const d = frame.dist?.[i]
        return (
          <g key={i}>
            <circle
              cx={n.x}
              cy={n.y}
              r={4.2}
              className={cn(
                "transition-[fill,stroke] duration-200",
                fill,
                stroke
              )}
              strokeWidth={0.8}
            />
            <text
              x={n.x}
              y={n.y}
              fontSize={3.2}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn(
                "font-mono",
                cur || visited.has(i) || frontier.has(i)
                  ? "fill-background"
                  : "fill-foreground"
              )}
            >
              {i}
            </text>
            {d !== undefined && (
              <text
                x={n.x}
                y={n.y - 6}
                fontSize={3}
                textAnchor="middle"
                className="fill-foreground font-mono"
              >
                {d === null || d === Infinity ? "∞" : d}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
