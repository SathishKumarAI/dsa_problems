// SQL practice page: accordion of problems, each with schema, hints, solution.
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { SQL_PROBLEMS } from "@/data/sql"
import { CodeBlock } from "./code-block"
import { difficultyClass } from "./problem-list"

export function SqlView() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="font-mono text-sm text-primary">SELECT ⋯ OVER ()</div>
        <h1 className="font-heading text-2xl font-semibold">SQL Interview Drills</h1>
        <p className="text-sm text-muted-foreground">
          The window-function and join patterns that show up in every data round: dedupe,
          top-N per group, running totals, gaps and islands.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {SQL_PROBLEMS.map((p) => (
          <div key={p.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">{p.title}</h2>
              <Badge variant="outline" className={cn("font-mono", difficultyClass[p.difficulty])}>
                {p.difficulty}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.question}</p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-background/60 p-3 font-mono text-xs text-muted-foreground">
              {p.schema}
            </pre>
            <Tabs defaultValue="hints" className="mt-3">
              <TabsList variant="line">
                <TabsTrigger value="hints">Hints</TabsTrigger>
                <TabsTrigger value="solution">Solution</TabsTrigger>
              </TabsList>
              <TabsContent value="hints">
                <Accordion multiple={false} className="w-full">
                  {p.hints.map((h, i) => (
                    <AccordionItem key={i} value={`h-${i}`}>
                      <AccordionTrigger className="font-mono text-sm">
                        hint {i + 1}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {h}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              <TabsContent value="solution">
                <div className="flex flex-col gap-3 pt-2">
                  <CodeBlock code={p.solution} />
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.explanation}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ))}
      </div>
    </div>
  )
}
