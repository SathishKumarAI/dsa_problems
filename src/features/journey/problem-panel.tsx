// The problem itself, reachable from every act (backlog R3).
//
// Until now the statement lived on the problem page, and the story act's two
// cards — how to read it, which corner cases to bring — rendered only while
// actIndex === 0. From act 3 on, "what was the input again?" meant walking
// back to act 1 and losing the step you were on.
//
// So: one accordion in the reading column, present on every act. Question and
// corner cases open on the story act (they are that act's content); everything
// closed from act 2 on, where the stage is the point and this is a reference.
// The learner's own choice wins from the first click and persists (pref
// `problemSections`; null means "never touched, use the act default").
//
// Owns the panel's shape only. The corner-case list itself is EdgeCaseList in
// cards.tsx, shared with nothing else; hints here are journey.acts[0].hints —
// about READING the problem, not solving it. The in-play hint ladder that the
// 45 s idle timer offers is a different thing and stays under the narration.

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { AnyJourney } from "@/engine"
import type { Problem } from "@/data"
import { setPref, usePrefs } from "@/lib/store"
import { EdgeCaseList } from "./cards"

const HINT_LABELS = ["reread", "formalize", "bring inputs"]

export function ProblemPanel({
  journey,
  problem,
  storyAct,
  input,
  current,
  onLoad,
}: {
  journey: AnyJourney
  problem?: Problem
  storyAct: boolean
  input: string
  current: string
  onLoad: (preset: string) => void
}) {
  const stored = usePrefs().problemSections
  const open = stored ?? (storyAct ? ["question", "edges"] : [])
  const hints = journey.acts[0]?.hints ?? []

  return (
    <div className="flex flex-col rounded-xl border bg-card px-4">
      <Accordion
        multiple
        value={open}
        onValueChange={(v) => setPref("problemSections", v as string[])}
      >
        <AccordionItem value="question">
          <AccordionTrigger>the problem</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3 pb-4 text-body">
            <p className="text-muted-foreground">
              {problem?.statement ?? journey.subtitle}
            </p>
            {problem?.examples.map((e, i) => (
              <div key={i} className="flex flex-col gap-0.5 font-mono text-ui">
                <span className="text-muted-foreground">
                  in <span className="text-foreground">{e.input}</span>
                </span>
                <span className="text-muted-foreground">
                  out <span className="text-foreground">{e.output}</span>
                </span>
                {e.note && (
                  <span className="font-sans text-meta text-muted-foreground">
                    {e.note}
                  </span>
                )}
              </div>
            ))}
            {input && (
              <p className="font-mono text-ui text-muted-foreground">
                on screen now <span className="text-foreground">{input}</span>
              </p>
            )}
          </AccordionContent>
        </AccordionItem>

        {hints.length > 0 && (
          <AccordionItem value="hints">
            <AccordionTrigger>how to read this problem</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2 pb-4 text-body">
              {hints.map((h, i) => (
                <p key={i} className="text-muted-foreground">
                  <span className="mr-2 font-mono text-meta text-primary">
                    {HINT_LABELS[i] ?? `hint ${i + 1}`}
                  </span>
                  {h}
                </p>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="edges">
          <AccordionTrigger className="text-teal">
            bring three inputs before any code
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-body">
            <EdgeCaseList
              edges={journey.edgeCases}
              current={current}
              onLoad={onLoad}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
