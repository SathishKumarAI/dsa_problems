// SQL practice page: one card per drill — schema, hints, solution.
//
// Three defects fixed here on 2026-09-13, all of them the same kind: this
// route was written before the design system and never audited against it,
// because the UI tests walk home, the journey, the visualizer and the problem
// pages, and this page is on none of those paths.
//
//   * The schema was a bare <pre> at `text-meta` with no copy button — the one
//     code surface in the app that was neither. It goes through `CodeBlock`
//     now, which is where every other fence in the product already renders, so
//     it arrives at `text-ui` (DESIGN.md raised the code surfaces because code
//     here is READ at length, not glanced at) and with the copy button.
//   * The question and the explanation were `text-ui`. They are sentences a
//     learner reads — a drill's question is a problem statement — so they are
//     `text-body`, the role DESIGN.md assigns to exactly that.
//   * The difficulty badge carried a word and no second channel, while every
//     other difficulty badge in the app had grown a meter.
//
// Each section still advertises its own depth (the hint count is on its tab),
// which is the same rule `problem-detail.tsx` follows: never make a reader
// click to discover there was nothing behind it.
import { DatabaseIcon } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { DifficultyMeter } from "@/components/ui/tick-meter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { SQL_PROBLEMS } from "@/data/sql"
import { CodeBlock } from "./code-block"
import { difficultyClass } from "@/lib/difficulty"

export function SqlView() {
  return (
    <div className="mx-auto flex w-full max-w-reading flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-ui text-primary">
          <DatabaseIcon className="size-4 shrink-0" aria-hidden />
          SELECT ⋯ OVER ()
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h1 className="font-heading text-title font-semibold">
            SQL Interview Drills
          </h1>
          <span className="font-mono text-meta text-dim tabular-nums">
            {SQL_PROBLEMS.length} drills
          </span>
        </div>
        <p className="max-w-measure text-body text-muted-foreground">
          The window-function and join patterns that show up in every data
          round: dedupe, top-N per group, running totals, gaps and islands.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {SQL_PROBLEMS.map((p) => (
          <div key={p.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-body font-semibold">{p.title}</h2>
              <Badge
                variant="outline"
                className={cn("font-mono", difficultyClass[p.difficulty])}
              >
                <DifficultyMeter difficulty={p.difficulty} />
                {p.difficulty}
              </Badge>
            </div>
            <p className="mt-2 max-w-measure text-body text-muted-foreground">
              {p.question}
            </p>
            {/* the tables you are querying — code, so it renders as code:
                same size, same copy button, same block as every other fence */}
            <CodeBlock code={p.schema} className="mt-3" />
            <Tabs defaultValue="hints" className="mt-3">
              <TabsList variant="line">
                <TabsTrigger value="hints">
                  Hints
                  <span className="font-mono text-meta text-dim tabular-nums">
                    {p.hints.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="solution">Solution</TabsTrigger>
              </TabsList>
              <TabsContent value="hints">
                <Accordion multiple={false} className="w-full">
                  {p.hints.map((h, i) => (
                    <AccordionItem key={i} value={`h-${i}`}>
                      <AccordionTrigger className="font-mono text-ui">
                        hint {i + 1} of {p.hints.length}
                      </AccordionTrigger>
                      <AccordionContent className="max-w-measure text-body text-muted-foreground">
                        {h}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              <TabsContent value="solution">
                <div className="flex flex-col gap-3 pt-2">
                  <CodeBlock code={p.solution} />
                  <p className="max-w-measure text-body leading-relaxed text-muted-foreground">
                    {p.explanation}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ))}
      </div>
    </div>
  )
}
