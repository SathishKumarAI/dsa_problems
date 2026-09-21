// ZONE 2 · ACT — the brief, the climb, and the three things you can do.
//
// The one raised surface on a problem page (DESIGN.md allows exactly one), and
// the mode bar: work it up from nothing (the journey), read it in full, or go
// and solve it. Those were three different shapes in three places until #97,
// which is what made the app read as though "journeys" and "patterns" were two
// products.
//
// It owns the shape of the act zone and nothing else: the page decides whether
// a journey exists, what the ladder holds, and what happens when the button is
// pressed.
import { ExternalLinkIcon, RouteIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { leetcodeUrl } from "@/lib/ladder"
import type { Ladder } from "@/lib/ladder"
import { TheClimb } from "../the-climb"
import type { Problem } from "@/data"
import type { AnyJourney } from "@/engine/types"

export function ActZone({
  problem,
  ladder,
  journey,
  earned,
  building,
  onBuild,
}: {
  problem: Problem
  ladder: Ladder
  journey?: AnyJourney
  /** acts earned of acts there are — the notation every surface uses */
  earned: { earned: number }
  /** the journey is already open below */
  building: boolean
  onBuild: () => void
}) {
  // Why this zone is shaped the way it is — kept as prose rather than as a
  // JSX comment, which would be a second root element:
  // The one thing this page exists to make you do, and the ONE raised
  // surface on the screen (DESIGN.md allows exactly one per page; the
  // journey invitation below is a bordered panel, not a second dock).
  //
  // THE MODE BAR. A problem is one noun and these are the three things
  // you can do with it: work it up from nothing (the journey), read it in
  // full (the explanation), or go and solve it. They were three different
  // shapes in three places — a primary button here, a bordered panel
  // below, and a list in the sidebar — which is what made the app read as
  // "journeys" and "patterns" being two products.
  //
  // The journey still opens full-screen, because its stage needs the
  // viewport; it is simply never reached except from here. The
  // explanation opens IN PLACE. The phrase "Learn this problem" is
  // load-bearing: a UI test reads it to prove the ledger still hides this
  // mid-journey.
  return (
    <div
      data-surface="raised"
      // ONE HEADER, NOT TWO BOXES. The title and its four facts were in a
      // sticky bar and the brief and the actions were in a bordered card
      // under it — two stacked surfaces both answering "what is this", with
      // a seam between them. The bar above is the top of this region now
      // and the border is gone: the brief reads as the line under the
      // title, which is what it is.
      //
      // `-mt-2` closes the gap the flex column would otherwise leave, so
      // the two halves read as one block rather than as siblings.
      className="-mt-4 flex flex-col gap-4"
    >
      <p className="max-w-measure text-body text-muted-foreground">
        {problem.brief}
      </p>
      {/* THE CLIMB. What replaced a sentence and two buttons with something
      a reader can look AT: how many ways in there are, how far apart they
      are, and which ones the ledger is still holding. */}
      <TheClimb ladder={ladder} />
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* The journey is the PRIMARY action where one exists: it is the way
        this app teaches, and everything else on the page is what you
        read once you have. LeetCode takes the primary slot only when
        there is no journey to offer. */}
        {journey ? (
          // A BUTTON, not a link. It navigated to `#/journey/<slug>`: a
          // different page, a different scroll position, and no way back
          // except a trail that returned you to the TOP of this one. The
          // journey opens in place now — the route still exists for deep
          // links and the sidebar's Continue.
          <button
            type="button"
            aria-expanded={building}
            onClick={onBuild}
            className="btn-glow inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-ui font-medium text-primary-foreground transition-[background-color,box-shadow] hover:bg-primary/90 active:translate-y-px lg:min-h-9"
          >
            <RouteIcon className="size-4 shrink-0" />
            {earned.earned > 0 ? "Continue the journey" : "Build it up"}
            <span className="font-mono text-meta opacity-80">
              {earned.earned}/{journey.acts.length}
            </span>
          </button>
        ) : null}
        <a
          href={leetcodeUrl(problem.leetcode)}
          target="_blank"
          rel="noopener"
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-ui font-medium transition-[background-color,box-shadow] active:translate-y-px lg:min-h-9",
            journey
              ? "border hover:border-edge/60"
              : "btn-glow bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          Solve on LeetCode
          <ExternalLinkIcon className="size-4" />
        </a>
      </div>
      {/* What a journey IS — the one sentence the deleted panel carried, and
      only while it is unstarted. Once earning has begun the button's
      "3/5" says everything a returning reader needs. */}
      {journey && earned.earned === 0 && (
        <p className="max-w-measure prose-set text-body text-muted-foreground">
          {journey.acts.length} acts: the need, every approach earned by the
          last one's weakness, your own code animated, then the reveal.
        </p>
      )}
    </div>
  )
}
