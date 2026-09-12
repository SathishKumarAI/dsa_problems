// A hash map drawn as a hash map: the code's view (pills) above the
// waterline, the machine below — bucket table, chains, a live load meter
// and the lookup arithmetic. Draws engine/hashmap's HashModel; owns no math.

import { cn } from "@/lib/utils"
import type { HashModel } from "@/engine"
import { HASH_LOAD } from "@/engine/hashmap"

const fmt = (m: HashModel, e: { key: number; value: number }) =>
  m.fmt === "times" ? `${e.key} ×${e.value}` : `${e.key} @ ${e.value}`

export function HashMapView({ map }: { map: HashModel }) {
  const probing = map.probe !== null
  return (
    <div className="flex flex-col gap-3" aria-label="hash map">
      <div className="text-meta tracking-wide text-muted-foreground uppercase">
        {map.label}
      </div>

      {/* above the waterline: what the code sees */}
      <div className="flex min-h-8 flex-wrap gap-1.5">
        {map.entries.length === 0 && (
          <span className="font-mono text-meta text-dim">
            {"{ }"} empty
          </span>
        )}
        {map.entries.map((e) => {
          const isProbe = e.key === map.probe
          return (
            <span
              key={e.key}
              data-k={`m${e.key}`}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-ui tabular-nums transition-colors",
                isProbe && map.hit
                  ? "border-chart-3 bg-chart-3/20 text-chart-3"
                  : isProbe
                    ? "border-foreground/60 bg-muted text-foreground"
                    : "border-border bg-card text-foreground/80"
              )}
            >
              {fmt(map, e)}
            </span>
          )
        })}
      </div>

      {/* the waterline */}
      <div className="flex items-center gap-2 text-meta text-muted-foreground">
        <span className="h-px flex-1 bg-gradient-to-r from-chart-2/60 to-transparent" />
        under the surface — what{" "}
        <code className="font-mono text-chart-2">map[x]</code> actually does
        <span className="h-px flex-1 bg-gradient-to-l from-chart-2/60 to-transparent" />
      </div>

      {/* below: the bucket table */}
      <div className="overflow-x-auto">
        <div
          className="grid min-w-max gap-1 sm:min-w-0"
          style={{
            gridTemplateColumns: `repeat(${map.buckets}, minmax(3.25rem, 1fr))`,
          }}
        >
          {map.chains.map((chain, b) => {
            const active = b === map.slot
            return (
              <div
                key={b}
                className={cn(
                  "flex min-h-14 flex-col items-center gap-1 rounded-md border p-1 transition-colors",
                  active && map.hit
                    ? "border-chart-3 bg-chart-3/10"
                    : active
                      ? "border-foreground/50 bg-muted/60"
                      : "border-border/60 bg-background/40"
                )}
              >
                <span className="font-mono text-meta text-muted-foreground">
                  {b}
                </span>
                {chain.length === 0 && (
                  <span className="text-dim">·</span>
                )}
                {chain.map((e, k) => {
                  const mark = e.key === map.probe
                  return (
                    <span key={e.key} className="flex flex-col items-center">
                      <span
                        data-k={`b${e.key}`}
                        className={cn(
                          "rounded border px-1.5 font-mono text-meta tabular-nums",
                          mark && map.hit
                            ? "border-chart-3 bg-chart-3/20 text-chart-3"
                            : mark
                              ? "border-foreground/60 bg-muted text-foreground"
                              : "border-border bg-card text-foreground/80"
                        )}
                      >
                        {fmt(map, e)}
                      </span>
                      {k < chain.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="text-meta leading-none text-dim"
                        >
                          ↓
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* facts: the arithmetic, the load meter, the collisions */}
      {/* These are sentences, not labels, so they take the ui step and the
          35em measure like any other prose (U6, U7). They were invisible to
          the UI suite until the walkthrough stopped living behind a closed
          tab — a reminder that a rule only holds where something looks. */}
      <div className="flex max-w-[35em] flex-col gap-1.5 text-ui text-muted-foreground">
        {probing && (
          <div>
            lookup:{" "}
            <b className="font-mono text-foreground">
              hash({map.probe}) = {map.probe} mod {map.buckets} = bucket{" "}
              {map.slot}
            </b>
            {map.probe! < 0 && (
              <span className="text-meta">
                {" "}
                (the mod that wraps negatives up, like Python's %)
              </span>
            )}{" "}
            —{" "}
            {map.present ? (
              <span className={cn(map.hit && "text-chart-3")}>
                key found after {map.hops} hop{map.hops === 1 ? "" : "s"} down
                that bucket's chain
              </span>
            ) : map.hops ? (
              <span>
                {map.hops} key{map.hops === 1 ? "" : "s"} live there, none of
                them {map.probe} — miss, but you still walked the chain to prove
                it
              </span>
            ) : (
              <span>bucket empty — miss, without touching a single key</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span>
            {map.entries.length} key{map.entries.length === 1 ? "" : "s"} in{" "}
            {map.buckets} buckets — load{" "}
            <b className="font-mono text-foreground">{map.load.toFixed(2)}</b>
          </span>
          <span
            className="relative h-1.5 w-24 overflow-hidden rounded-full bg-muted"
            aria-label={`load ${map.load.toFixed(2)} of ${HASH_LOAD}`}
          >
            <span
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-[width] duration-(--duration-reveal)",
                map.load > HASH_LOAD * 0.9 ? "bg-chart-4" : "bg-chart-2"
              )}
              style={{
                width: `${Math.min(100, (map.load / HASH_LOAD) * 100)}%`,
              }}
            />
          </span>
          {map.resized && (
            <span className="text-chart-4">
              load crossed {HASH_LOAD}, so the table doubled and every key was
              rehashed — that one "O(1) insert" quietly did O(n) work
            </span>
          )}
        </div>
        <div>
          {map.collisions ? (
            <>
              <span className="text-chart-4">
                {map.collisions} bucket{map.collisions === 1 ? "" : "s"} holding
                more than one key
              </span>{" "}
              — a lookup there walks the chain. This is why O(1) is an average,
              not a promise
            </>
          ) : (
            "no collisions yet — every lookup is one hop straight to the answer"
          )}
        </div>
      </div>
    </div>
  )
}
