// The learner's arc, made visible without spoiling it: one node per
// UNLOCKED act, then a single anonymous "?" for everything still locked.
//
// Two shapes. Above `xl` it is the ribbon. Below, where seven acts wrapped
// into four rows and ate 214 px of an 844 px phone (UX audit U2, U14), it is
// one row — "act 05 / 07 · One-Pass Hash" — that opens the ribbon in a sheet.
// Owns the shapes only; unlock policy lives in use-journey.ts.

import { useState } from "react"
import { ChevronDownIcon, LockIcon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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

export function ActStepper(props: Props) {
  const [open, setOpen] = useState(false)
  const { journey, unlocked, active, done, onSelect } = props
  // The act that entered `done` since the last render, so its node can flash
  // once (R8): an act used to just *be* green the next time you looked at the
  // ribbon, with no moment of closure. A render-time adjust, not an effect.
  const [seen, setSeen] = useState(done)
  const [justDone, setJustDone] = useState<string | null>(null)
  if (done !== seen) {
    const fresh = [...done].find((k) => !seen.has(k))
    setSeen(done)
    if (fresh) setJustDone(fresh)
  }
  const index = journey.acts.findIndex((a) => a.key === active)
  const act = journey.acts[index]
  const pick = (key: string) => {
    onSelect(key)
    setOpen(false)
  }
  return (
    <>
      {/* phone and tablet: one row, the ribbon behind it */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex min-h-11 w-full items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:border-primary active:bg-primary/10 xl:hidden"
      >
        <span className="font-mono text-meta text-muted-foreground">
          act {String(index + 1).padStart(2, "0")} / {journey.acts.length}
        </span>
        <span className="truncate text-ui font-medium">{act?.name}</span>
        <span className="ml-auto flex items-center gap-1 font-mono text-meta text-muted-foreground">
          {unlocked < journey.acts.length && (
            <LockIcon className="size-3" aria-label="more locked" />
          )}
          <ChevronDownIcon className="size-4" />
        </span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[80svh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{journey.title}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <Ribbon {...props} onSelect={pick} justDone={justDone} stacked />
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden xl:block">
        <Ribbon {...props} justDone={justDone} />
      </div>
    </>
  )
}

function Ribbon({
  journey,
  unlocked,
  active,
  done,
  revealed,
  onSelect,
  justDone = null,
  stacked = false,
}: Props & { justDone?: string | null; stacked?: boolean }) {
  const acts = journey.acts.slice(0, unlocked)
  const locked = unlocked < journey.acts.length
  return (
    <nav
      aria-label="learning journey"
      className={cn(
        "flex items-stretch gap-1",
        stacked ? "flex-col" : "flex-wrap"
      )}
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
                {stacked ? "↓" : "→"}
              </span>
            )}
            <button
              type="button"
              aria-current={isActive ? "step" : undefined}
              onClick={() => onSelect(a.key)}
              className={cn(
                "flex min-h-11 min-w-24 flex-col justify-center rounded-lg border px-3 py-1.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                stacked && "w-full",
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50 active:border-primary active:bg-primary/10",
                a.key === revealed &&
                  "animate-in duration-(--duration-reveal) zoom-in-95 fade-in",
                a.key === justDone && "animate-step-done"
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
            {stacked ? "↓" : "→"}
          </span>
          <div
            className={cn(
              "flex min-h-11 min-w-24 flex-col justify-center rounded-lg border border-dashed border-border px-3 py-1.5 text-muted-foreground",
              stacked && "w-full"
            )}
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
