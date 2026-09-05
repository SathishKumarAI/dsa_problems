// The learner's arc, made visible without spoiling it: one node per
// UNLOCKED act, then a single anonymous "?" for everything still locked.
// Owns the ribbon only; unlock policy lives in use-journey.ts.

import { LockIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AnyJourney } from "@/engine"

interface Props {
  journey: AnyJourney
  unlocked: number
  active: string
  done: Set<string>
  revealed: string | null
  onSelect: (key: string) => void
}

export function ActStepper({
  journey,
  unlocked,
  active,
  done,
  revealed,
  onSelect,
}: Props) {
  const acts = journey.acts.slice(0, unlocked)
  const locked = unlocked < journey.acts.length
  return (
    <nav
      aria-label="learning journey"
      className="flex flex-wrap items-stretch gap-1"
    >
      {acts.map((a, i) => {
        const isActive = a.key === active
        const isDone = done.has(a.key)
        return (
          <div key={a.key} className="flex items-stretch gap-1">
            {i > 0 && (
              <span
                className="self-center text-muted-foreground/40"
                aria-hidden
              >
                →
              </span>
            )}
            <button
              type="button"
              aria-current={isActive ? "step" : undefined}
              onClick={() => onSelect(a.key)}
              className={cn(
                "flex min-w-24 flex-col rounded-lg border px-3 py-1.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50",
                a.key === revealed &&
                  "animate-in duration-700 zoom-in-95 fade-in"
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <span
                  className={cn(
                    "font-mono text-[10px]",
                    isDone ? "text-chart-3" : "text-muted-foreground"
                  )}
                >
                  {isDone ? "✓" : String(i + 1).padStart(2, "0")}
                </span>
                {a.name}
              </span>
              <span className="font-mono text-meta text-muted-foreground">
                {a.short}
              </span>
            </button>
          </div>
        )
      })}
      {locked && (
        <div className="flex items-stretch gap-1">
          <span className="self-center text-muted-foreground/40" aria-hidden>
            →
          </span>
          <div
            className="flex min-w-24 flex-col rounded-lg border border-dashed border-border px-3 py-1.5 text-muted-foreground"
            title="finish this act to unlock"
          >
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <LockIcon className="size-3" />?
            </span>
            <span className="font-mono text-meta">
              {journey.acts.length - unlocked} more · locked
            </span>
          </div>
        </div>
      )}
    </nav>
  )
}
