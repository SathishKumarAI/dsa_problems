// Statistics flashcards: click to flip, filter by tag, shuffle order.
//
// The card actually FLIPS now, and that is not decoration — the page's own
// copy has always said "click a card to flip it" while the card swapped its
// text in place. A promise the interface does not keep is the cheapest way to
// make a product feel assembled rather than built.
//
// How the flip is built, and why this way:
//   * Both faces live in the SAME grid cell (`[grid-area:1/1]`), so the card
//     is as tall as its taller face and NEVER changes height when you flip it.
//     A fixed height would have to guess (answers run to 257 characters here,
//     questions to 70) and a height that changes on click makes the whole grid
//     reflow under the pointer — the one thing DESIGN.md says never to animate.
//   * The motion is a `rotateY` on the parent — a transform, so it composites,
//     and the only property that changes. `backface-visibility: hidden` is
//     what makes the back face invisible until it comes round.
//   * 320ms on the token curve: the second of the two durations, named because
//     this is something appearing. It used to be `duration-200`, a THIRD
//     duration that only escaped the R6 audit because that audit walks home,
//     the journey and the visualizer — not this route.
//   * `prefers-reduced-motion` zeroes the duration globally (index.css), so
//     the card swaps instantly there instead of spinning. No guard needed here.
//
// The four arbitrary properties (`perspective`, `transform-style`,
// `backface-visibility`, `grid-area`) are arbitrary PROPERTIES, not colours
// and not type — the two things the design system forbids inlining. They are
// local to the one component in the app that turns over in 3D.
import { useMemo, useState } from "react"
import { RotateCwIcon, ShuffleIcon, SigmaIcon, UndoIcon } from "lucide-react"
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
  const turned = visible.filter((i) => flipped.has(i)).length

  return (
    <div className="mx-auto flex w-full max-w-reading flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-ui text-primary">
          <SigmaIcon className="size-4 shrink-0" aria-hidden />
          P(A|B) = P(B|A)·P(A)/P(B)
        </div>
        <h1 className="font-heading text-title font-semibold">
          Statistics Flashcards
        </h1>
        <p className="max-w-measure text-body text-muted-foreground">
          Click a card to flip it. The answer should come to you before the flip
          does.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          value={[tag]}
          onValueChange={(v: string[]) => setTag(v[0] ?? "all")}
          aria-label="filter by topic"
        >
          <ToggleGroupItem value="all">all</ToggleGroupItem>
          {tags.map((t) => (
            <ToggleGroupItem key={t} value={t}>
              {t}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {/* how far through the deck you are, in the data face with tabular
            figures so the count does not jitter as it climbs */}
        <span
          className="ml-auto font-mono text-meta text-dim tabular-nums"
          aria-live="polite"
        >
          {turned}/{visible.length} turned
        </span>
        {turned > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFlipped(new Set())}
            className="text-muted-foreground"
          >
            <UndoIcon data-icon="inline-start" />
            Turn back
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={shuffle}>
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
              aria-pressed={isFlipped}
              aria-label={`${card.tag} — ${card.q}`}
              className="group/card rounded-xl text-left [perspective:1000px]"
            >
              <span
                className={cn(
                  "grid min-h-36 transition-transform duration-(--duration-reveal) [transform-style:preserve-3d]",
                  isFlipped && "[transform:rotateY(180deg)]"
                )}
              >
                <Face tag={card.tag} flipped={isFlipped}>
                  <span className="text-body leading-relaxed font-medium">
                    {card.q}
                  </span>
                </Face>
                <Face tag={card.tag} flipped={isFlipped} back>
                  <span className="text-body leading-relaxed text-muted-foreground">
                    {card.a}
                  </span>
                </Face>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** One side of a card. Both sides occupy the same grid cell, so the card is as
 *  tall as its taller face and holding still is the default. */
function Face({
  tag,
  flipped,
  back = false,
  children,
}: {
  tag: string
  flipped: boolean
  back?: boolean
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "flex flex-col gap-2 rounded-xl border bg-card p-4 [backface-visibility:hidden] [grid-area:1/1]",
        // the lit border follows the FACE you are looking at, so the answer
        // side reads as the earned one
        back
          ? "[transform:rotateY(180deg)] border-primary/40"
          : "group-hover/card:border-primary/40"
      )}
    >
      <span className="flex items-center gap-2">
        <Badge variant="secondary" className="w-fit font-mono text-meta">
          {tag}
        </Badge>
        {/* the affordance says what the click does, and then shows it happened:
            the glyph turns with the card. Transform only — no reflow. */}
        <RotateCwIcon
          aria-hidden
          className={cn(
            "ml-auto size-3.5 shrink-0 text-dim transition-transform duration-(--duration-reveal) group-hover/card:text-foreground",
            flipped && "rotate-180"
          )}
        />
      </span>
      {children}
    </span>
  )
}
