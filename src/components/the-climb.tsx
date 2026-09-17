// The ladder, at a glance, before you have read a word of it.
//
// What was here: a one-line brief and two buttons. Nothing on it could be
// LOOKED at — a reader arriving at the page could not see how many ways in
// there are, how far apart they are, or where the one they are being taught
// sits among them. The page then spends three thousand words on exactly that.
//
// A CURVE, NOT BARS, and the reason is two-sum. Bars placed each rung by its
// POSITION in the ladder, which is right exactly while no two rungs cost the
// same — and two-sum's "Two-Pass Hash" and "One-Pass Hash" are both O(n). Four
// evenly spaced bars drew the second one lower, which says it is cheaper. It is
// not: it is the same bound reached in one sweep instead of two. A curve whose
// height comes from the BOUND runs FLAT between them, and that flat segment is
// the lesson — the cost has stopped falling, and the last step buys something
// other than speed. See `lib/cost-curve.ts`.
//
// PROGRESSIVE DISCLOSURE SURVIVES IT. `ladderOf` has already capped the rungs a
// started journey has not earned. The curve simply STOPS at the last earned
// rung and continues as a dashed rule at that same height: a reader sees there
// is further to go, and the drawing claims nothing about how much further,
// because that would leak the thing the ledger is holding. Same rule the
// stepper, the chart and the URL obey (B45).
import { ComplexityMark } from "@/components/ui/tick-meter"
import { levels, smoothPath } from "@/lib/cost-curve"
import type { Ladder } from "@/lib/ladder"
import { cn } from "@/lib/utils"

/** the ordered ramp, by RANK — the page's rule for anything that is a sequence
 *  rather than a set of kinds. Five role colours would say "five kinds"; the
 *  ramp says "a climb", which is what this is. */
const rampStep = (rank: number, total: number) =>
  `var(--ramp-${Math.min(4, Math.round((rank / Math.max(1, total - 1)) * 4))})`

/** just the time bound out of "O(n) time · O(1) space" */
const timeOf = (cost: string) => cost.split(" time")[0]

// The drawing box. Coordinates are 0–100 in both axes and the SVG is stretched
// to whatever width the card has, so the STROKE would stretch with it —
// `vector-effect: non-scaling-stroke` is what keeps a 2px line 2px at 340px and
// at 900. The dots are HTML positioned by percentage rather than SVG circles
// for the same reason: a circle in a stretched viewBox is an ellipse.
const TOP = 14
const BOTTOM = 86

export function TheClimb({ ladder }: { ladder: Ladder }) {
  const shown = ladder.rungs.length
  const total = shown + ladder.hidden
  // one rung is not a climb, it is a fact — and the orient bar already has it
  if (total < 2) return null

  const ys = levels(ladder.rungs.map((r) => timeOf(r.cost)))
  // x is the centre of each column, so a dot sits over its own label
  const xOf = (i: number) => ((i + 0.5) / total) * 100
  const yOf = (i: number) => TOP + ys[i] * (BOTTOM - TOP)
  const points = ladder.rungs.map((_, i): [number, number] => [xOf(i), yOf(i)])
  const path = smoothPath(points)
  const lastX = points.length ? points[points.length - 1][0] : 0
  const lastY = points.length ? points[points.length - 1][1] : BOTTOM

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-meta text-dim">
        {ladder.capped
          ? `the climb — ${shown} of ${total} earned`
          : `the climb — ${total} ways in, worst to best`}
      </figcaption>

      <div className="relative h-24 w-full">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="climb-ramp" x1="0" y1="0" x2="1" y2="0">
              {[0, 1, 2, 3, 4].map((k) => (
                <stop
                  key={k}
                  offset={`${(k / 4) * 100}%`}
                  stopColor={`var(--ramp-${k})`}
                />
              ))}
            </linearGradient>
          </defs>
          {/* the ground the curve descends toward — without it the eye has
              nothing to read the fall against */}
          <line
            x1="0"
            y1={BOTTOM}
            x2="100"
            y2={BOTTOM}
            stroke="var(--border)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {path && (
            <>
              {/* the area, so the descent has weight rather than being a wire */}
              <path
                d={`${path} L ${lastX} ${BOTTOM} L ${points[0][0]} ${BOTTOM} Z`}
                fill="url(#climb-ramp)"
                opacity="0.14"
              />
              <path
                d={path}
                fill="none"
                stroke="url(#climb-ramp)"
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
          {/* IT CONTINUES, AND THAT IS ALL IT SAYS. A dashed rule held at the
              last earned height — drawing where the locked rungs land would
              leak how much further the ladder goes. */}
          {ladder.hidden > 0 && (
            <line
              x1={lastX}
              y1={lastY}
              x2="100"
              y2={lastY}
              stroke="var(--border)"
              strokeWidth="2"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {/* the rungs themselves: HTML, so a dot is round at every width */}
        {ladder.rungs.map((r, i) => (
          <span
            key={r.key}
            aria-hidden
            className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
            style={{
              left: `${xOf(i)}%`,
              top: `${yOf(i)}%`,
              backgroundColor: rampStep(i, total),
              animation: `edge-in-y var(--duration-reveal) cubic-bezier(0.16,1,0.3,1) ${120 + i * 90}ms backwards`,
            }}
          />
        ))}
      </div>

      <ol className="flex items-start gap-1.5" aria-label="approaches by cost">
        {Array.from({ length: total }, (_, i) => {
          const rung = ladder.rungs[i]
          return (
            <li
              key={rung?.key ?? `locked-${i}`}
              className="flex min-w-0 flex-1"
            >
              <Step
                rungKey={rung?.key}
                className="flex min-w-0 flex-1 flex-col gap-1 rounded-md px-1 py-1 text-left"
              >
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
