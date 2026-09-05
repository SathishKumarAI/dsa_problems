// The learner-facing interruptions that live under the narration: the quiz
// gate, the mid-playback prediction, the hint ladder, the corner-case
// callout — plus the story act's reading-column cards (corner cases to
// bring, how to read the problem). Owns their look and their small local
// state; the journey hook owns when they appear.

import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EdgeCase, Predict, Quiz } from "@/engine"

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
              "rounded-md border px-3 py-2 text-left text-body transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
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
      <div className="text-meta tracking-wide text-chart-1 uppercase">
        check yourself ({qi + 1}/{quiz.length})
      </div>
      <p className="text-body font-medium">{q.q}</p>
      <Choices
        choices={q.choices}
        answer={q.answer}
        onPick={pick}
        locked={picked === q.answer}
        picked={picked}
      />
      {feedback && (
        <p className="text-body text-muted-foreground">{feedback}</p>
      )}
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
      <div className="text-meta tracking-wide text-chart-2 uppercase">
        you drive — predict the next move
      </div>
      <p className="text-body font-medium">{predict.q}</p>
      <Choices
        choices={predict.choices}
        answer={predict.answer}
        onPick={pick}
        locked={picked !== null}
        picked={picked}
      />
      {picked !== null && (
        <p className="text-body text-muted-foreground">
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
      <div className="text-meta tracking-wide text-muted-foreground uppercase">
        stuck? earn it with a smaller push
      </div>
      {hints.slice(0, tier).map((h, i) => (
        <p key={i} className="text-body text-muted-foreground">
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

// A corner case biting right now: shown under the narration while the frame
// tagged `edge` is on screen. Name + example are the journey's; the frame's
// own note already says what THIS approach did about it.
export function EdgeCaseCard({ edge }: { edge: EdgeCase }) {
  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-teal/40 bg-teal/5 p-4"
      aria-live="polite"
      data-edge={edge.key}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 text-xs tracking-wide text-teal uppercase">
        <span>corner case · {edge.name}</span>
        <span className="font-mono tracking-normal text-muted-foreground normal-case">
          {edge.example}
        </span>
      </div>
      <p className="text-body">{edge.why}</p>
      <p className="text-body text-muted-foreground">
        <span className="mr-2 font-mono text-meta text-teal">think</span>
        {edge.think}
      </p>
    </div>
  )
}

// The story act's "bring your inputs" card (Khamies §3.1.4: an empty-case,
// a medium-case and a corner-case input before any code). One button per
// corner case loads its preset so the learner can watch it bite.
export function EdgeCaseList({
  edges,
  current,
  onLoad,
}: {
  edges: EdgeCase[]
  current: string
  onLoad: (preset: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-teal/30 bg-card p-4">
      <div className="text-meta tracking-wide text-teal uppercase">
        bring three inputs before any code
      </div>
      <p className="text-muted-foreground">
        A plain input shows the flow. The smallest legal input and the corner
        cases below show where a first draft breaks. Load one, then step through
        the approaches you have earned — each explains the case when it hits it.
      </p>
      <ul className="flex flex-col gap-3" aria-label="corner cases">
        {edges.map((e) => (
          <li
            key={e.key}
            className={cn(
              "flex flex-col gap-1.5 rounded-lg border p-3",
              current === e.preset
                ? "border-teal/60 bg-teal/5"
                : "border-border/60 bg-background/40"
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <b>{e.name}</b>
              <span className="font-mono text-sm text-muted-foreground">
                {e.example}
              </span>
            </div>
            <p className="text-muted-foreground">{e.why}</p>
            <p className="text-muted-foreground">
              <span className="mr-2 font-mono text-xs text-teal">think</span>
              {e.think}
            </p>
            <div>
              <Button
                size="sm"
                variant={current === e.preset ? "secondary" : "outline"}
                onClick={() => onLoad(e.preset)}
                aria-pressed={current === e.preset}
              >
                {current === e.preset ? "loaded ✓" : "load this input"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// The story act's hints, visible up front (they are about READING the
// problem — reread, formalize, bring inputs — not about solving it), one
// click each so the learner still chooses to look.
export function HintList({ hints }: { hints: string[] }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <div className="text-meta tracking-wide text-muted-foreground uppercase">
        how to read this problem
      </div>
      <Accordion multiple={false} className="w-full">
        {hints.map((h, i) => (
          <AccordionItem key={i} value={`hint-${i}`}>
            <AccordionTrigger className="font-mono text-sm">
              {["reread", "formalize", "bring inputs"][i] ?? `hint ${i + 1}`}
            </AccordionTrigger>
            <AccordionContent className="text-body text-muted-foreground">
              {h}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
