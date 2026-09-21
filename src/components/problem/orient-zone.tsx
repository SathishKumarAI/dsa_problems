// ZONE 1 · ORIENT — the four facts, in one sticky band.
//
// This file owns the top of a problem page: where am I, how hard is it, what
// do I have to beat, have I done it — plus the two page-level switches (read
// it all, solved). Each fact changes what the reader does in the next thirty
// seconds; nothing else qualified.
//
// It owns none of the page's state. Everything it needs arrives as a prop, so
// the page still decides what is true and this decides only how it is said.
import { ArrowLeftIcon, ScrollTextIcon } from "lucide-react"
import { Fact, OrientBar } from "@/components/ui/band"
import { ComplexityMark, DifficultyMeter } from "@/components/ui/tick-meter"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { difficultyClass } from "@/lib/difficulty"
import { MASKED_NAME } from "@/lib/disclosure"
import type { Pattern, Problem } from "@/data"

export function OrientZone({
  problem,
  pattern,
  hidden,
  reading,
  solved,
  onToggleSolved,
  expandAll,
  onExpandAll,
  onBack,
}: {
  problem: Problem
  pattern: Pattern
  /** the journey is still withholding this pattern's name (B45) */
  hidden: boolean
  /** the reader is reading: the bar slides out of the way */
  reading: boolean
  solved: boolean
  onToggleSolved: () => void
  expandAll: boolean
  onExpandAll: (next: boolean) => void
  onBack: () => void
}) {
  return (
    <>
      {/* ── ZONE 1 · ORIENT ─────────────────────────────────────────────
    Four facts, one row: where am I, how hard is it, what do I have to
    beat, have I done it. Each changes what you do in the next thirty
    seconds; nothing else qualified.

    What was here before: a 28px back-link band, the difficulty badge up
    in the title row, and a THIRD row under the buttons carrying the
    glyph, the time, the space and the solved box. Three bands all
    answering "what is this", none of them together.

    The glyph is gone — it restated the pattern the back link already
    names and spent the accent doing it. The mask still holds: the back
    link is what renders `· · ·` while a journey is mid-flight (B45). */}
      {/* THE BAR GETS OUT OF THE WAY WHILE YOU READ, on the gesture the two
    sidebars use — see `lib/use-reading-room.ts`. It SLIDES rather than
    disappearing: a sticky bar that vanishes reads as a rendering fault,
    and one that moves reads as making room. `invisible` lands only at
    the end of the travel, so it cannot be tabbed into while it is off
    screen but is still animating on the way there. */}
      <OrientBar
        className={cn(
          "transition-[transform,opacity] duration-(--duration-reveal)",
          reading
            ? "pointer-events-none invisible -translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        )}
      >
        {/* TWO ROWS ON PURPOSE. Measured at 1440 with both columns open the
      reading column is 830px and this row wants ~1040, so it wrapped —
      and a wrap puts the break wherever it lands. It landed between the
      two FACTS: "difficulty" beside the title, "target" under the back
      link, which reads as an accident rather than as a header. Named
      rows put the break where it belongs — the trail and the page-level
      switches above, the name and its facts below. */}
        <div className="flex w-full items-center gap-x-5 gap-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-ml-2 min-h-11 text-muted-foreground lg:min-h-7"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            {hidden ? MASKED_NAME : pattern.name}
          </Button>
          {/* In the STICKY bar on purpose: a switch that opens the whole page is
      useless if you have to scroll back to the top to reach it. */}
          <button
            type="button"
            aria-pressed={expandAll}
            // the long read is FETCHED, not merely hidden, so asking for
            // everything has to ask for it too — the page owns that, and this
            // only reports the press (`onExpandAll` in `problem-detail.tsx`)
            onClick={() => onExpandAll(!expandAll)}
            className={cn(
              "ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-md border px-2.5 text-meta transition-colors lg:min-h-7",
              expandAll
                ? "border-edge/60 bg-accent text-foreground"
                : "text-muted-foreground hover:border-edge/40 hover:text-foreground"
            )}
          >
            <ScrollTextIcon className="size-3.5 shrink-0 text-dim" />
            {expandAll ? "everything open" : "read it all"}
          </button>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-ui text-muted-foreground lg:min-h-7">
            <Checkbox checked={solved} onCheckedChange={onToggleSolved} />
            solved
          </label>
        </div>
        <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2">
          {/* THE NAME SITS WITH ITS FACTS. It used to head the raised card
      below, which put "Contains Duplicate" in one box and the four
      things you want to know about it in another — two bands answering
      "what is this", stacked, and the name scrolled away while the
      facts stayed. One row now, and the card below opens on the brief.

      Still the page's h1 and still the first heading in the document:
      this moved the element, not the outline. */}
          <h1 className="font-heading text-title font-semibold">
            {problem.title}
          </h1>
          <Fact label="difficulty">
            <DifficultyMeter difficulty={problem.difficulty} />
            <span
              className={difficultyClass[problem.difficulty].split(" ").pop()}
            >
              {problem.difficulty}
            </span>
          </Fact>
          {/* the bar to clear. Each rung carries its own cost; this is the one
      the best rung reaches. */}
          <Fact label="target">
            <ComplexityMark value={problem.complexity.time} />
            <span className="font-mono">{problem.complexity.time}</span>
            <span className="text-dim">·</span>
            <ComplexityMark value={problem.complexity.space} />
            <span className="font-mono">{problem.complexity.space}</span>
            {/* the bound is a label until you can reproduce the count; the
        title carries the counting argument on the bar, and every rung
        carries its own below (`Solution.costWhy`) */}
            {problem.costWhy && (
              <span
                title={problem.costWhy}
                className="cursor-help text-meta text-dim underline decoration-dotted underline-offset-4"
              >
                why?
              </span>
            )}
          </Fact>
        </div>
      </OrientBar>
    </>
  )
}
