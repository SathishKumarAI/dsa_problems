// One pattern's page: blurb header + filterable problem rows.
import { useState } from "react"
import { SearchIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"
import { cn } from "@/lib/utils"
import type { Pattern } from "@/data"
import { problemsByPattern } from "@/data"
import { difficultyClass } from "@/lib/difficulty"
import { toggleSolved, useSolved } from "@/lib/progress"

interface Props {
  pattern: Pattern
  onOpen: (problemId: string) => void
}

export function ProblemList({ pattern, onOpen }: Props) {
  const [query, setQuery] = useState("")
  const solved = useSolved()
  const problems = problemsByPattern(pattern.id).filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="font-mono text-sm text-primary">{pattern.glyph}</div>
        <h1 className="font-heading text-2xl font-semibold">{pattern.name}</h1>
        <p className="text-sm text-muted-foreground">{pattern.blurb}</p>
      </header>

      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Filter problems…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {problems.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No matches</EmptyTitle>
            <EmptyDescription>No problem title contains “{query}”.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {problems.map((p) => (
            <Item key={p.id} variant="outline">
              <div className="flex w-full items-center gap-3">
                <Checkbox
                  checked={solved.has(p.id)}
                  onCheckedChange={() => toggleSolved(p.id)}
                  aria-label={`Mark ${p.title} solved`}
                />
                <button className="flex-1 text-left" onClick={() => onOpen(p.id)}>
                  <ItemContent>
                    <ItemTitle className={cn(solved.has(p.id) && "text-muted-foreground line-through")}>
                      {p.title}
                    </ItemTitle>
                    <ItemDescription>{p.brief}</ItemDescription>
                  </ItemContent>
                </button>
                <Badge variant="outline" className={cn("font-mono", difficultyClass[p.difficulty])}>
                  {p.difficulty}
                </Badge>
              </div>
            </Item>
          ))}
        </div>
      )}
    </div>
  )
}
