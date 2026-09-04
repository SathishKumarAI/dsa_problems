// The learner-facing interruptions that live under the narration: the quiz
// gate, the mid-playback prediction, and the hint ladder. Owns their look
// and their small local state; the journey hook owns when they appear.

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Predict, Quiz } from "@/engine"

function Choices({
  choices,
  answer,
  onPick,
  locked,
  picked,
}: {
  choices: string[]
  answer: number
  onPick: (i: number) => void
  locked: boolean
  picked: number | null
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {choices.map((c, i) => {
        const right = locked && i === answer
        const wrong = picked === i && i !== answer
        return (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => onPick(i)}
            className={cn(
              "rounded-md border px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              right
                ? "border-chart-3 bg-chart-3/15 text-chart-3"
                : wrong
                  ? "border-chart-5 bg-chart-5/10 text-chart-5"
                  : "border-border bg-background/40 hover:border-primary/60 disabled:opacity-60"
            )}
          >
            {c}
          </button>
        )
      })}
    </div>
  )
}

// Wrong answer → explanation, retry; right → next question or onPass.
export function QuizCard({
  quiz,
  onWrong,
  onPass,
}: {
  quiz: Quiz[]
  onWrong: () => void
  onPass: () => void
}) {
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const q = quiz[qi]
  const pick = (i: number) => {
    setPicked(i)
    if (i === q.answer) {
      setFeedback(null)
      setTimeout(() => {
        if (qi + 1 < quiz.length) {
          setQi(qi + 1)
          setPicked(null)
        } else onPass()
      }, 500)
    } else {
      setFeedback(q.explain)
      onWrong()
    }
  }
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-chart-1/40 bg-chart-1/5 p-4"
      aria-live="polite"
    >
      <div className="text-[11px] tracking-wide text-chart-1 uppercase">
        check yourself ({qi + 1}/{quiz.length})
      </div>
      <p className="text-sm font-medium">{q.q}</p>
      <Choices
        choices={q.choices}
        answer={q.answer}
        onPick={pick}
        locked={picked === q.answer}
        picked={picked}
      />
      {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}
    </div>
  )
}

// Playback paused BEFORE the next frame: call the move, then watch it.
export function PredictCard({
  predict,
  onDone,
}: {
  predict: Predict
  onDone: (right: boolean) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const pick = (i: number) => {
    setPicked(i)
    const right = i === predict.answer
    setTimeout(() => onDone(right), right ? 700 : 1600)
  }
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-chart-2/40 bg-chart-2/5 p-4"
      aria-live="polite"
    >
      <div className="text-[11px] tracking-wide text-chart-2 uppercase">
        you drive — predict the next move
      </div>
      <p className="text-sm font-medium">{predict.q}</p>
      <Choices
        choices={predict.choices}
        answer={predict.answer}
        onPick={pick}
        locked={picked !== null}
        picked={picked}
      />
      {picked !== null && (
        <p className="text-sm text-muted-foreground">
          {picked === predict.answer
            ? "exactly — watch:"
            : "not quite — watch what actually happens:"}
        </p>
      )}
    </div>
  )
}

// nudge → concept → line to stare at. Never the answer.
export function HintLadder({
  hints,
  tier,
  onMore,
}: {
  hints: string[]
  tier: number
  onMore: () => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-background/40 p-4">
      <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
        stuck? earn it with a smaller push
      </div>
      {hints.slice(0, tier).map((h, i) => (
        <p key={i} className="text-sm text-muted-foreground">
          <span className="mr-2 font-mono text-xs text-chart-1">
            {["nudge", "concept", "the line"][i] ?? `hint ${i + 1}`}
          </span>
          {h}
        </p>
      ))}
      {tier < hints.length && (
        <div>
          <Button size="sm" variant="outline" onClick={onMore}>
            {tier === 0 ? "give me a nudge" : "a bigger hint"}
          </Button>
        </div>
      )}
    </div>
  )
}
