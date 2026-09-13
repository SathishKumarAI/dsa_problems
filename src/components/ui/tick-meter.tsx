// Rising ticks: a small number said as a HEIGHT instead of a word.
//
// What this file owns
// -------------------
//   * `TickMeter`       — the shape. `lit` of `of` ticks, each one taller than
//                         the last, the lit ones in a colour you pass.
//   * `DifficultyMeter` — easy / medium / hard as 1 / 2 / 3 ticks.
//   * `ComplexityMark`  — where an `O(…)` sits on the growth ladder, 1 of 6
//                         (constant) to 6 of 6 (exponential).
//
// What it does NOT own
// --------------------
//   * the difficulty colours — `lib/difficulty.ts` is the one place the three
//     roles are mapped, so the meter and the badge around it cannot disagree.
//   * the classification — `lib/complexity.ts`, which has its own test.
//   * the words. Every one of these is drawn BESIDE its own label and never
//     instead of it. DESIGN.md: colour is never the only channel; neither is
//     shape. Check any change to this file in greyscale — the CLIMB has to
//     still read when the colour is gone, which is why the ticks rise.
//
// Why the complexity mark is monochrome while the difficulty one is coloured:
// the palette's semantic colours are already spent — green means "correct",
// peach means "held", red means "wrong". Difficulty borrowed them years ago
// and the badge around it is already those colours, so the meter agrees with
// its own container. A complexity mark in green/amber/red would be the SAME
// three colours meaning a THIRD thing on the same screen, which is worse than
// no colour at all. It rises; that is the whole signal.
import type { Difficulty } from "@/data"
import { growthOf, growthOfCost, growthRank } from "@/lib/complexity"
import { difficultyClass } from "@/lib/difficulty"
import { cn } from "@/lib/utils"

// The raw pixel values in here (2px gap, 3px wide, 3–8px tall) are DRAWING,
// not layout and not type: the 4px grid governs the space between elements and
// the six-step scale governs words. This is a mark, the same way the 7px
// chip-legend glyph is (DESIGN.md, B58).
const TICK_W = 3
const TICK_GAP = 2
const BASE_H = 3
const STEP_H = 1.6

export function TickMeter({
  lit,
  of,
  litClass = "bg-foreground",
  title,
  className,
}: {
  lit: number
  of: number
  /** background utility for a lit tick — a token class, never a literal */
  litClass?: string
  title?: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      title={title}
      className={cn("inline-flex shrink-0 items-end", className)}
      style={{ gap: `${TICK_GAP}px` }}
    >
      {Array.from({ length: of }, (_, i) => (
        <span
          key={i}
          style={{
            width: `${TICK_W}px`,
            height: `${BASE_H + i * STEP_H}px`,
          }}
          className={cn(
            "rounded-[1px]",
            // the unlit tick is the quiet layer, which is a COLOUR (--dim,
            // 5.8:1) and not an opacity — a faded tick is an invisible one
            i < lit ? litClass : "bg-dim"
          )}
        />
      ))}
    </span>
  )
}

/** how many of the three ticks each level lights — the whole scale, one place */
const LEVEL: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 }

export function DifficultyMeter({
  difficulty,
  className,
}: {
  difficulty: Difficulty
  className?: string
}) {
  return (
    <TickMeter
      lit={LEVEL[difficulty]}
      of={3}
      // the badge around it already carries this role's text colour, so the
      // meter takes `currentColor` and can never drift away from its container
      litClass="bg-current"
      title={difficulty}
      className={cn(difficultyClass[difficulty].split(" ").pop(), className)}
    />
  )
}

/**
 * Where a complexity sits on the growth ladder.
 *
 * Pass `cost` for a rung's packed `"O(n) time · O(1) space"` string (the TIME
 * half is what the ladder climbs) or `value` for a bare `"O(n)"`. The mark is
 * the second channel: on the approach ladder the bars visibly SHRINK as you
 * read down the rungs, which is the climb the prose is describing, drawn.
 */
export function ComplexityMark({
  value,
  cost,
  className,
}: {
  value?: string
  cost?: string
  className?: string
}) {
  const source = cost ?? value ?? ""
  const growth = cost ? growthOfCost(cost) : growthOf(source)
  return (
    <TickMeter
      lit={growthRank(growth)}
      of={6}
      title={`${growth} growth`}
      className={className}
    />
  )
}
