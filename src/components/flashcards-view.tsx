// Statistics flashcards: click to flip, filter by tag, shuffle order.
import { useMemo, useState } from "react"
import { ShuffleIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { FLASHCARDS } from "@/data/flashcards"

export function FlashcardsView() {
  const tags = useMemo(() => [...new Set(FLASHCARDS.map((c) => c.tag))], [])
  const [tag, setTag] = useState<string>("all")
  const [order, setOrder] = useState<number[]>(() =>
    FLASHCARDS.map((_, i) => i)
  )
  const [flipped, setFlipped] = useState<Set<number>>(new Set())

  const shuffle = () => {
    const next = [...order]
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[next[i], next[j]] = [next[j], next[i]]
    }
    setOrder(next)
    setFlipped(new Set())
  }

  const toggle = (i: number) =>
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const visible = order.filter(
    (i) => tag === "all" || FLASHCARDS[i].tag === tag
  )

  return (
    <div className="mx-auto flex w-full max-w-reading flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="font-mono text-ui text-primary">
          P(A|B) = P(B|A)·P(A)/P(B)
        </div>
        <h1 className="font-heading text-title font-semibold">
          Statistics Flashcards
        </h1>
        <p className="text-ui text-muted-foreground">
          Click a card to flip it. The answer should come to you before the flip
          does.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          value={[tag]}
          onValueChange={(v: string[]) => setTag(v[0] ?? "all")}
        >
          <ToggleGroupItem value="all">all</ToggleGroupItem>
          {tags.map((t) => (
            <ToggleGroupItem key={t} value={t}>
              {t}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button
          variant="outline"
          size="sm"
          onClick={shuffle}
          className="ml-auto"
        >
          <ShuffleIcon data-icon="inline-start" />
          Shuffle
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((i) => {
          const card = FLASHCARDS[i]
          const isFlipped = flipped.has(i)
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={cn(
                "flex min-h-36 flex-col gap-2 rounded-xl border p-4 text-left transition-all",
                isFlipped
                  ? "border-primary/40 bg-card"
                  : "bg-card hover:border-primary/40"
              )}
            >
              <Badge
                variant="secondary"
                className="w-fit font-mono text-meta"
              >
                {card.tag}
              </Badge>
              {isFlipped ? (
                <p className="animate-in text-ui leading-relaxed text-muted-foreground duration-200 fade-in">
                  {card.a}
                </p>
              ) : (
                <p className="text-ui leading-relaxed font-medium">{card.q}</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
