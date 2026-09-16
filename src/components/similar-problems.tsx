// "Where this move goes next" — the other problems in the same pattern, at the
// foot of the page.
//
// The page ended at the explanation, which meant the only way on from a
// finished problem was the sidebar or the back link. A pattern is a move you
// are meant to recognise somewhere else; the page that just taught one should
// say where else it shows up.
//
// Sorted by difficulty and then by title, so the row a reader is most likely
// to want next is nearest the top, and the one they just solved is not in the
// list at all. Solved rows are struck through the way the sidebar's are —
// one vocabulary for "done" everywhere.
import { ArrowRightIcon } from "lucide-react"
import { Band } from "@/components/ui/band"
import { DifficultyMeter } from "@/components/ui/tick-meter"
import { difficultyClass } from "@/lib/difficulty"
import { href } from "@/lib/route"
import { useSolved } from "@/lib/progress"
import { cn } from "@/lib/utils"
import type { Difficulty, Pattern, Problem } from "@/data"

const ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 }

export function SimilarProblems({
  problem,
  pattern,
  all,
  compact = false,
}: {
  /** the RAIL rendering: no band, no chrome, titles and a difficulty tick.
   *  Same component and the same props as the flow copy on purpose — two
   *  lists of the same thing is how the two come to disagree. */
  compact?: boolean
  problem: Problem
  pattern: Pattern
  /** every problem in the app; this filters to the pattern itself */
  all: Problem[]
}) {
  const solved = useSolved()
  const siblings = all
    .filter((p) => p.pattern === pattern.id && p.id !== problem.id)
    .sort(
      (a, b) =>
        ORDER[a.difficulty] - ORDER[b.difficulty] ||
        a.title.localeCompare(b.title)
    )
  if (siblings.length === 0) return null

  if (compact)
    return (
      <section className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-meta font-semibold text-foreground">
          <ArrowRightIcon className="size-3.5 shrink-0 text-dim" aria-hidden />
          The same move
        </span>
        <ul className="flex flex-col">
          {siblings.slice(0, 6).map((p) => (
            <li key={p.id}>
              <a
                href={href(`/p/${pattern.id}/${p.id}`)}
                className="-ml-4 flex items-center gap-2 border-l-2 border-transparent py-1 pl-4 text-ui transition-[color,border-color,translate] hover:translate-x-0.5 hover:border-edge hover:text-foreground"
              >
                <DifficultyMeter difficulty={p.difficulty} />
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-muted-foreground",
                    solved.has(p.id) && "text-dim line-through"
                  )}
                >
                  {p.title}
                </span>
              </a>
            </li>
          ))}
        </ul>
        {siblings.length > 6 && (
          <a
            href={href(`/p/${pattern.id}`)}
            className="text-meta text-dim underline-offset-4 hover:text-foreground hover:underline"
          >
            {siblings.length - 6} more in {pattern.name}
          </a>
        )}
      </section>
    )

  return (
    <Band
      id="the-same-move-elsewhere"
      label="the same move, elsewhere"
      count={`${siblings.length} more in ${pattern.name}`}
    >
      <ul className="flex flex-col divide-y rounded-lg border">
        {siblings.map((p) => (
          <li key={p.id}>
            <a
              href={href(`/p/${pattern.id}/${p.id}`)}
              className="group flex min-h-11 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/40"
            >
              <DifficultyMeter difficulty={p.difficulty} />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-ui font-medium",
                  solved.has(p.id) && "text-muted-foreground line-through"
                )}
              >
                {p.title}
              </span>
              <span
                className={cn(
                  "hidden text-meta sm:inline",
                  difficultyClass[p.difficulty].split(" ").pop()
                )}
              >
                {p.difficulty}
              </span>
              <ArrowRightIcon className="size-4 shrink-0 text-dim transition-colors group-hover:text-foreground" />
            </a>
          </li>
        ))}
      </ul>
      <a
        href={href(`/p/${pattern.id}`)}
        className="w-fit text-ui text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        The whole {pattern.name} pattern — its playbook and every problem
      </a>
    </Band>
  )
}
