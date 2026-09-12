// One pattern's page: blurb header, filters, then compact problem rows.
// A pattern held three problems when this was a card list; it now holds up to
// twelve and the set is 87, so the row is one line and the filters are the
// navigation (backlog B37, B40).
import { useState } from "react"
import { RouteIcon, SearchIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Difficulty, Pattern } from "@/data"
import { problemsByPattern } from "@/data"
import { journeyForProblem } from "@/engine"
import { difficultyClass } from "@/lib/difficulty"
import {
  MASKED_GLYPH,
  MASKED_NAME,
  showSpoilers,
  usePatternMask,
} from "@/lib/disclosure"
import { toggleSolved, useSolved } from "@/lib/progress"

interface Props {
  pattern: Pattern
  onOpen: (problemId: string) => void
}

const LEVELS: Difficulty[] = ["easy", "medium", "hard"]

export function ProblemList({ pattern, onOpen }: Props) {
  const [query, setQuery] = useState("")
  const [level, setLevel] = useState<Difficulty | "all">("all")
  const [state, setState] = useState<"all" | "unsolved" | "solved">("all")
  const solved = useSolved()
  const mask = usePatternMask()
  const hidden = mask.hidden.has(pattern.id)
  const all = problemsByPattern(pattern.id)
  const problems = all.filter((p) => {
    const done = solved.has(p.id)
    return (
      (p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.brief.toLowerCase().includes(query.toLowerCase())) &&
      (level === "all" || p.difficulty === level) &&
      (state === "all" || (state === "solved" ? done : !done))
    )
  })
  const filtering = query !== "" || level !== "all" || state !== "all"

  return (
    <div className="mx-auto flex w-full max-w-reading flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="font-mono text-ui text-primary">
          {hidden ? MASKED_GLYPH : pattern.glyph}
        </div>
        <h1 className="font-heading text-title font-semibold">
          {hidden ? MASKED_NAME : pattern.name}
        </h1>
        {hidden ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-chart-1/40 bg-chart-1/5 p-3 text-ui">
            <span className="text-muted-foreground">
              You are midway through <b>{mask.by.get(pattern.id)}</b>, which
              builds this idea before naming it. The problems are all here — the
              name arrives at the reveal.
            </span>
            <Button size="sm" variant="outline" onClick={showSpoilers}>
              show names anyway
            </Button>
          </div>
        ) : (
          <p className="text-ui text-muted-foreground">{pattern.blurb}</p>
        )}
      </header>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            // a placeholder is not an accessible name: it is gone the moment
            // anything is typed, and it is announced inconsistently
            aria-label="Filter problems by title or brief"
            placeholder="Filter by title or brief…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <ToggleGroup
            size="sm"
            value={[level]}
            onValueChange={(v: string[]) =>
              setLevel((v[0] as Difficulty | "all") ?? "all")
            }
            aria-label="filter by difficulty"
          >
            <ToggleGroupItem value="all">all</ToggleGroupItem>
            {LEVELS.map((d) => (
              <ToggleGroupItem key={d} value={d}>
                {d}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            size="sm"
            value={[state]}
            onValueChange={(v: string[]) =>
              setState((v[0] as "all" | "unsolved" | "solved") ?? "all")
            }
            aria-label="filter by solved state"
          >
            <ToggleGroupItem value="all">any</ToggleGroupItem>
            <ToggleGroupItem value="unsolved">unsolved</ToggleGroupItem>
            <ToggleGroupItem value="solved">solved</ToggleGroupItem>
          </ToggleGroup>
          <span
            className="ml-auto font-mono text-meta text-muted-foreground tabular-nums"
            aria-live="polite"
          >
            {problems.length}/{all.length}
          </span>
        </div>
      </div>

      {problems.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Nothing matches</EmptyTitle>
            <EmptyDescription>
              {all.length} problem{all.length === 1 ? "" : "s"} here, none of
              them matching these filters.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setQuery("")
              setLevel("all")
              setState("all")
            }}
          >
            Clear filters
          </Button>
        </Empty>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {problems.map((p) => {
            const done = solved.has(p.id)
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-accent/40"
              >
                <Checkbox
                  checked={done}
                  onCheckedChange={() => toggleSolved(p.id)}
                  aria-label={`Mark ${p.title} solved`}
                />
                <button
                  className="flex min-w-0 flex-1 items-baseline gap-2 text-left"
                  onClick={() => onOpen(p.id)}
                >
                  <span
                    className={cn(
                      "shrink-0 text-body font-medium",
                      done && "text-muted-foreground line-through"
                    )}
                  >
                    {p.title}
                  </span>
                  {journeyForProblem(p.id) && (
                    <RouteIcon
                      className="size-3.5 shrink-0 text-chart-1"
                      aria-label="has a full journey"
                    />
                  )}
                  <span className="truncate text-ui text-muted-foreground">
                    {p.brief}
                  </span>
                </button>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 font-mono",
                    difficultyClass[p.difficulty]
                  )}
                >
                  {p.difficulty}
                </Badge>
              </li>
            )
          })}
        </ul>
      )}
      {filtering && problems.length > 0 && (
        <Button
          size="sm"
          variant="ghost"
          className="self-start text-muted-foreground"
          onClick={() => {
            setQuery("")
            setLevel("all")
            setState("all")
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}
