// The ladder, at a glance, before you have read a word of it.
//
// What was here: a one-line brief and two buttons. Nothing on it could be
// LOOKED at — a reader arriving at the page could not see how many ways in
// there are, how far apart they are, or where the one they are being taught
// sits among them. The page then spends three thousand words on exactly that.
//
// So the top of the page draws it. One step per rung, worst on the left, and
// the step gets SHORTER as the cost comes down — the staircase descends, which
// is the shape of the lesson: every rung after the first exists because the one
// before it cost too much. Under each step, the bound in mono, so "n² → n log n
// → n" is a picture before it is an argument.
//
// PROGRESSIVE DISCLOSURE SURVIVES IT. `ladderOf` has already capped the rungs a
// started journey has not earned; those are drawn as blank steps with a "?" and
// no name and no cost. A reader can see that there is further to climb — which
// is motivating and gives nothing away — and cannot read what it is called.
// This is the same rule the stepper, the chart and the URL obey (B45).
import { ComplexityMark } from "@/components/ui/tick-meter"
import type { Ladder } from "@/lib/ladder"
import { cn } from "@/lib/utils"

/** the ordered ramp, by RANK — the page's rule for anything that is a sequence
 *  rather than a set of kinds. Five role colours would say "five kinds"; the
 *  ramp says "a climb", which is what this is. */
const rampStep = (rank: number, total: number) =>
  `var(--ramp-${Math.min(4, Math.round((rank / Math.max(1, total - 1)) * 4))})`

/** just the time bound out of "O(n) time · O(1) space" */
const timeOf = (cost: string) => cost.split(" time")[0]

/**
 * One step: a button when there is a rung under it, a plain span when the
 * ledger is still holding that rung back.
 *
 * A BARE `#id` HREF IS A ROUTE CHANGE. This is a hash-routed app, so
 * `href="#rung-set"` sets the route to `rung-set` and renders HOME — the page
 * the reader was looking at is simply gone. Every in-page jump on this site
 * goes through `scrollIntoView`, and this one is a button rather than an
 * anchor so there is no href to get that wrong in the first place.
 */
function Step({
  rungKey,
  className,
  children,
}: {
  rungKey?: string
  className: string
  children: React.ReactNode
}) {
  if (!rungKey) return <span className={className}>{children}</span>
  return (
    <button
      type="button"
      className={cn(className, "lift-3d cursor-pointer")}
      title="go to this approach"
      onClick={() =>
        document
          .getElementById(`rung-${rungKey}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    >
      {children}
    </button>
  )
}

export function TheClimb({ ladder }: { ladder: Ladder }) {
  const shown = ladder.rungs.length
  const total = shown + ladder.hidden
  // one rung is not a climb, it is a fact — and the orient bar already has it
  if (total < 2) return null

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-meta text-dim">
        {ladder.capped
          ? `the climb — ${shown} of ${total} earned`
          : `the climb — ${total} ways in, worst to best`}
      </figcaption>
      <ol
        className="flex items-end gap-1.5 border-b pb-px"
        aria-label="approaches by cost"
      >
        {Array.from({ length: total }, (_, i) => {
          const rung = ladder.rungs[i]
          // The step descends as the cost does. Rank, not the bound itself:
          // the bounds are incomparable as numbers (`O(n log n)` is not a
          // value), and rank is what the ladder's own order already asserts.
          //
          // MEASURED AND WIDENED. The first cut ran 44px down to 18 across
          // steps 252px wide, and at that aspect ratio three bars read as three
          // colour SWATCHES rather than as a descent — the shape was there and
          // nothing about it said "staircase". 72 down to 16 is a 4.5× range
          // instead of 2.4×, which is the difference between a chart you have
          // to be told about and one you see.
          const height = 72 - Math.round((i / (total - 1)) * 56)
          return (
            <li
              key={rung?.key ?? `locked-${i}`}
              className="flex min-w-0 flex-1"
            >
              <Step
                rungKey={rung?.key}
                className="flex min-w-0 flex-1 flex-col gap-1 rounded-md text-left"
              >
                <span
                  aria-hidden
                  style={{
                    height,
                    backgroundColor: rung ? rampStep(i, total) : undefined,
                    animationDelay: `${80 + i * 70}ms`,
                    animationFillMode: "backwards",
                  }}
                  className={cn(
                    "block w-full animate-edge-in-y rounded-t-sm",
                    // a rung the ledger is holding back is an OUTLINE: there is
                    // something here, and it is not yours yet
                    !rung && "border border-b-0 border-dashed border-border"
                  )}
                />
                <span className="truncate text-meta text-muted-foreground">
                  {rung ? rung.name : "?"}
                </span>
                {rung ? (
                  <span className="flex items-center gap-1 font-mono text-meta text-foreground tabular-nums">
                    <ComplexityMark value={timeOf(rung.cost)} />
                    <span className="truncate">{timeOf(rung.cost)}</span>
                  </span>
                ) : (
                  <span className="font-mono text-meta text-dim">—</span>
                )}
              </Step>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}
