// Grid, tree and list — the three shapes the chip row cannot draw, and the
// reason 34 of the practice set's problems had no journey (backlog B41).
// Owns drawing only; the models are in engine/types.ts.
//
// One decision runs through all three: they reuse the SAME role vocabulary as
// the chip row (anchor / focus / answer / dim), so a learner who has read one
// journey can read any of them. Change the grammar here and in <Legend/>
// together, exactly as chip-row.tsx says.

import { cn } from "@/lib/utils"
import type { CellModel } from "@/engine"

const ROLE = {
  base: "relative flex items-center justify-center rounded-md border font-mono tabular-nums transition-[background-color,border-color,color,opacity] duration-(--duration-reveal)",
  neutral: "border-border bg-card text-foreground",
  anchor: "border-chart-4 bg-chart-4/15 text-chart-4",
  focus:
    "border-foreground bg-[var(--yellow)]/20 text-foreground ring-2 ring-foreground/80",
  answer: "border-chart-3 bg-chart-3/20 text-chart-3",
  dim: "opacity-25",
}

function roleClass(cell: CellModel) {
  const r = cell.roles
  return cn(
    ROLE.base,
    r.includes("answer")
      ? ROLE.answer
      : r.includes("focus")
        ? ROLE.focus
        : r.includes("anchor")
          ? ROLE.anchor
          : ROLE.neutral,
    r.includes("dim") && ROLE.dim
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-meta tracking-wide text-muted-foreground uppercase">
      {children}
    </div>
  )
}

// ---------- grid ----------

export function GridView({
  rows,
  label,
}: {
  rows: CellModel[][]
  label: string
}) {
  const cols = rows[0]?.length ?? 0
  return (
    <div className="flex flex-col items-center gap-3">
      <Label>{label}</Label>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 2.75rem))` }}
      >
        {rows.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={cell.key}
              data-k={cell.key}
              className={cn(roleClass(cell), "h-11 text-ui")}
              // the only accessible name a grid cell has: without it a screen
              // reader hears a wall of bare numbers with no coordinates
              aria-label={`row ${r} column ${c}, ${cell.value}`}
            >
              {cell.value}
              {cell.label && (
                <span className="absolute -top-1.5 -right-1 rounded bg-background px-0.5 text-meta leading-none text-muted-foreground">
                  {cell.label}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ---------- tree ----------

// Level-order slots: the node at i has children 2i+1 and 2i+2. Depth and
// horizontal position both fall out of the index, so nothing has to be laid
// out by hand — and the same indexing IS how a binary heap is stored, which is
// why the heap journeys can use this view unchanged.
const depthOf = (i: number) => Math.floor(Math.log2(i + 1))
const centreOf = (i: number) => {
  const d = depthOf(i)
  const first = 2 ** d - 1
  return ((i - first + 0.5) / 2 ** d) * 100
}

const ROW = 74 // px between one depth and the next
const NODE = 40

export function TreeView({
  slots,
  label,
}: {
  slots: (CellModel | null)[]
  label: string
}) {
  const last = slots.reduce((acc, s, i) => (s ? i : acc), 0)
  const depth = depthOf(last) + 1
  const height = depth * ROW
  const edges: { from: number; to: number }[] = []
  for (let i = 0; i < slots.length; i++) {
    if (!slots[i]) continue
    for (const child of [2 * i + 1, 2 * i + 2])
      if (slots[child]) edges.push({ from: i, to: child })
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <Label>{label}</Label>
      <div className="relative w-full" style={{ height }}>
        <svg
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          {edges.map((e) => (
            <line
              key={`${e.from}-${e.to}`}
              x1={`${centreOf(e.from)}%`}
              y1={depthOf(e.from) * ROW + NODE / 2}
              x2={`${centreOf(e.to)}%`}
              y2={depthOf(e.to) * ROW + NODE / 2}
              className="stroke-border"
              strokeWidth={1.5}
            />
          ))}
        </svg>
        {slots.map((cell, i) =>
          cell ? (
            <div
              key={cell.key}
              data-k={cell.key}
              className={cn(roleClass(cell), "absolute text-ui")}
              style={{
                left: `${centreOf(i)}%`,
                top: depthOf(i) * ROW,
                width: NODE,
                height: NODE,
                transform: "translateX(-50%)",
              }}
            >
              {cell.value}
              {cell.label && (
                <span className="absolute top-full mt-0.5 text-meta whitespace-nowrap text-muted-foreground">
                  {cell.label}
                </span>
              )}
            </div>
          ) : null
        )}
      </div>
    </div>
  )
}

// ---------- linked list ----------

export function ListView({
  nodes,
  cycleTo,
  label,
}: {
  nodes: CellModel[]
  cycleTo?: number
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Label>{label}</Label>
      <div className="relative flex flex-wrap items-center justify-center gap-1">
        {nodes.map((cell, i) => (
          <div key={cell.key} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div
                data-k={cell.key}
                className={cn(roleClass(cell), "h-11 min-w-11 px-2 text-ui")}
              >
                {cell.value}
              </div>
              <span className="h-4 text-meta leading-4 text-muted-foreground">
                {cell.label ?? ""}
              </span>
            </div>
            <span
              aria-hidden="true"
              className="self-start pt-3 text-ui text-muted-foreground"
            >
              {i === nodes.length - 1
                ? cycleTo === undefined
                  ? "∅"
                  : "↩"
                : "→"}
            </span>
          </div>
        ))}
      </div>
      {cycleTo !== undefined && (
        <div className="text-meta text-muted-foreground">
          the last node links back to position {cycleTo} — the list has no end
        </div>
      )}
    </div>
  )
}
