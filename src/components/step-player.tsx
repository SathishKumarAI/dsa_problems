// Walkthrough player. Terminal-styled card rendering Frame[] (data/types):
// array cells with colored roles + pointer labels, or a monospace diagram.
// Autoplay, scrubber, arrow-key navigation.
//
// The arrow keys are scoped to the card, not to the window. A window listener
// stole the arrow keys from the whole page — including from the hint accordion
// beside it — and two players on one page both answered every press.
import { useEffect, useRef, useState } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CellRole, Frame } from "@/data"

const roleClass: Record<CellRole, string> = {
  focus:
    "border-chart-1 bg-chart-1/15 text-chart-1 shadow-[0_0_16px_-2px] shadow-chart-1/40 scale-110",
  compare:
    "border-chart-4 bg-chart-4/15 text-chart-4 shadow-[0_0_16px_-2px] shadow-chart-4/40",
  window: "border-chart-2 bg-chart-2/15 text-chart-2",
  done: "border-chart-3/40 bg-chart-3/10 text-chart-3/80",
}

const legend: { role: CellRole; label: string }[] = [
  { role: "focus", label: "current" },
  { role: "compare", label: "comparing" },
  { role: "window", label: "in window" },
  { role: "done", label: "settled" },
]

function Cells({ frame }: { frame: NonNullable<Frame["cells"]> }) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-2">
      {frame.values.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-lg border font-mono text-base tabular-nums transition-all duration-300",
              frame.marks?.[i]
                ? roleClass[frame.marks[i]]
                : "border-border/60 bg-background/60 text-foreground/80"
            )}
          >
            {v}
          </div>
          <span
            className={cn(
              "flex h-4 items-center font-mono text-meta transition-colors",
              frame.labels?.[i] ? "text-primary" : "text-muted-foreground/40"
            )}
          >
            {frame.labels?.[i] ?? i}
          </span>
        </div>
      ))}
    </div>
  )
}

export function StepPlayer({ frames }: { frames: Frame[] }) {
  const [step, setStep] = useState(0)
  const [wantPlay, setPlaying] = useState(false)
  const frame = frames[step]
  const last = frames.length - 1
  const usesCells = frames.some((f) => f.cells)
  // derived, so reaching the end never needs a setState inside the effect
  const playing = wantPlay && step < last

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, last)), 1800)
    return () => clearTimeout(t)
  }, [playing, step, last])

  const card = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = card.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
      e.preventDefault() // otherwise the page scrolls sideways as well
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, last))
      else setStep((s) => Math.max(s - 1, 0))
    }
    el.addEventListener("keydown", onKey)
    return () => el.removeEventListener("keydown", onKey)
  }, [last])

  return (
    <div
      ref={card}
      tabIndex={0}
      role="group"
      aria-label={`walkthrough, ${frames.length} steps — arrow keys step through it`}
      className="overflow-hidden rounded-xl border bg-card shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {/* terminal chrome */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b bg-background/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-chart-5/60" />
        <span className="size-2.5 rounded-full bg-chart-4/60" />
        <span className="size-2.5 rounded-full bg-chart-3/60" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          walkthrough — step {String(step + 1).padStart(2, "0")}/
          {String(frames.length).padStart(2, "0")}
        </span>
        {usesCells && (
          <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
            {legend.map((l) => (
              <span
                key={l.role}
                className="flex items-center gap-1.5 text-meta text-muted-foreground"
              >
                <span
                  className={cn("size-2 rounded-sm border", roleClass[l.role])}
                />
                {l.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* stage — key remount animates each frame in */}
      <div
        key={step}
        className="flex min-h-48 animate-in items-center justify-center px-6 py-8 duration-300 fade-in slide-in-from-bottom-1"
      >
        {frame.cells ? (
          <Cells frame={frame.cells} />
        ) : (
          <pre className="overflow-x-auto font-mono text-sm leading-relaxed whitespace-pre text-foreground/90">
            {frame.text}
          </pre>
        )}
      </div>

      {/* narration */}
      <p className="min-h-12 border-t bg-background/40 px-6 py-3 text-center font-mono text-[13px] leading-relaxed text-muted-foreground">
        <span className="text-primary">›</span> {frame.caption}
      </p>

      {/* controls */}
      <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setPlaying(false)
            setStep(0)
          }}
          disabled={step === 0}
          aria-label="Restart"
        >
          <RotateCcwIcon />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            aria-label="Previous step"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            size="icon-sm"
            onClick={() => {
              if (playing) return setPlaying(false)
              if (step === last) setStep(0)
              setPlaying(true)
            }}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setStep((s) => Math.min(s + 1, last))}
            disabled={step === last}
            aria-label="Next step"
          >
            <ChevronRightIcon />
          </Button>
        </div>

        {/* scrubber */}
        <div className="flex items-center gap-1.5">
          {frames.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-muted hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
