// "Before you solve it" — two or three questions about the STATEMENT, asked
// between the problem and the hints.
//
// Why it exists: the page went statement → hints → approaches, so the first
// thing it offered a reader who had just finished reading was a way out of
// thinking. A reader who cannot yet say what the question asks reads three
// rungs of a ladder without any of them landing, and leaves believing they
// have learned a solution to a problem they never modelled.
//
// The rules that keep this from being a quiz:
//   * every question is answerable from the statement and the constraints
//     ABOVE it. Nothing here needs an approach, so nothing here can spoil one.
//   * answering is optional and nothing is scored, stored or gated. The
//     ledger's `unlocked:` keys are the journey's, and this must never write
//     one — progressive disclosure is a promise about approach NAMES.
//   * the reason shows on either answer. A reader who guessed right and cannot
//     say why is exactly the reader this is for.
//
// State is per mount and deliberately not persisted: this is a thing you do
// once, on the way in, not a score you come back to.
import { useState } from "react"
import { CheckIcon, XIcon } from "lucide-react"
import { Band } from "@/components/ui/band"
import { cn } from "@/lib/utils"
import type { Check } from "@/data"

function Question({ check, n, of }: { check: Check; n: number; of: number }) {
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const right = picked === check.answer

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <p className="flex max-w-measure gap-2 text-body">
        <span className="shrink-0 font-mono text-meta text-dim">
          {n}/{of}
        </span>
        {check.ask}
      </p>
      <div
        role="radiogroup"
        aria-label={check.ask}
        className="flex flex-col gap-1"
      >
        {check.options.map((opt, i) => {
          const isAnswer = i === check.answer
          const chosen = picked === i
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={chosen}
              disabled={answered}
              onClick={() => setPicked(i)}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-md border px-3 text-left text-ui transition-colors lg:min-h-9",
                !answered && "hover:border-edge/60 hover:bg-accent/40",
                // once answered the right one is always marked, so a wrong
                // pick teaches rather than just failing
                answered && isAnswer && "border-chart-3/60 bg-chart-3/10",
                answered &&
                  chosen &&
                  !isAnswer &&
                  "border-chart-4/60 bg-chart-4/10",
                answered &&
                  !chosen &&
                  !isAnswer &&
                  "text-muted-foreground opacity-60"
              )}
            >
              {answered && isAnswer && (
                <CheckIcon
                  className="size-4 shrink-0 text-chart-3"
                  aria-hidden
                />
              )}
              {answered && chosen && !isAnswer && (
                <XIcon className="size-4 shrink-0 text-chart-4" aria-hidden />
              )}
              {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <p
          className="max-w-measure animate-edge-in-y border-l-2 border-border pl-4 prose-set text-body text-muted-foreground"
          aria-live="polite"
        >
          <span
            className={cn(
              "font-medium",
              right ? "text-chart-3" : "text-chart-4"
            )}
          >
            {right ? "Yes. " : "Not quite. "}
          </span>
          {check.because}
        </p>
      )}
    </div>
  )
}

export function PreSolveCheck({ checks }: { checks: Check[] }) {
  if (checks.length === 0) return null
  return (
    <Band
      id="before-you-solve-it"
      label="before you solve it"
      count="answerable from the statement alone"
    >
      <p className="max-w-measure prose-set text-body text-muted-foreground">
        Nothing here is scored or remembered, and none of it needs an approach.
        It is the reading check you would give yourself out loud before writing
        a line.
      </p>
      <div className="flex flex-col gap-2">
        {checks.map((c, i) => (
          <Question key={c.ask} check={c} n={i + 1} of={checks.length} />
        ))}
      </div>
    </Band>
  )
}
