// The approach ladder: the language strip, one rung's code, and the rungs
// themselves — worst to best, each carrying the weakness in the one below it.
//
// Split out of `problem-detail.tsx` (843 lines against this repo's 500-line
// ceiling, holding six unrelated things). This file owns the LADDER and
// nothing else: it decides how a rung is drawn, and decides nothing about
// which rungs exist — `lib/ladder.ts` does that, and the PAGE computes the
// ladder once because the header needs `capped` too.
import { ComplexityMark } from "@/components/ui/tick-meter"
import { Band } from "@/components/ui/band"
import { cn } from "@/lib/utils"
import type { Code, Problem } from "@/data"
import type { AnyJourney } from "@/engine"
import { compareHref } from "@/lib/ladder"
import type { Ladder, Rung } from "@/lib/ladder"
import { ArrowRightIcon } from "lucide-react"
import { href } from "@/lib/route"
import { CodeBlock } from "./code-block"
import { setPref, usePrefs } from "@/lib/store"

const LANGS: { key: keyof Code; label: string }[] = [
  { key: "python", label: "Python 3" },
  { key: "java", label: "Java" },
  { key: "cpp", label: "C++" },
]

// One language strip for the whole ladder. It was repeated per rung, and since
// every copy wrote the same `codeTab` pref, three controls moved as one — which
// reads as a bug whichever one you touch.
function LanguageStrip({ langs }: { langs: (keyof Code)[] }) {
  const { codeTab } = usePrefs()
  if (langs.length < 2) return null
  const lang = langs.includes(codeTab as keyof Code) ? codeTab : "python"
  return (
    <div className="flex gap-0.5" role="tablist" aria-label="language">
      {LANGS.filter((l) => langs.includes(l.key)).map((l) => (
        <button
          key={l.key}
          role="tab"
          aria-selected={l.key === lang}
          onClick={() => setPref("codeTab", l.key)}
          className={cn(
            // the language tabs are tapped repeatedly while reading a rung, so
            // they take the touch target below lg (measured at 390px: 26px)
            "inline-flex min-h-11 items-center rounded-md px-2.5 py-1 text-meta font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:min-h-7",
            l.key === lang
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

function RungCode({ code }: { code: Code }) {
  const { codeTab } = usePrefs()
  const lang = (code[codeTab as keyof Code] ? codeTab : "python") as keyof Code
  return <CodeBlock code={code[lang] ?? code.python} />
}

// The ladder. Rungs read in build order; the "why now" line sits BETWEEN them,
// because it belongs to the step from one to the next, not to either rung.
export function ApproachLadder({
  problem,
  journey,
  ladder,
  onCompare,
}: {
  problem: Problem
  journey?: AnyJourney
  /** open `?compare=a,b` — offered only between rungs the ledger has earned */
  onCompare: (value: string) => void
  /** computed by the PAGE, not here: the header needs `capped` too, to decide
   *  whether the full-explanation door may be opened, and computing the same
   *  ladder twice is how two controls drift into disagreeing about the ledger */
  ladder: Ladder
}) {
  const { rungs, capped, hidden } = ladder
  const langs = LANGS.map((l) => l.key).filter((k) =>
    rungs.some((r) => r.code[k])
  )
  const id = (r: Rung) => `rung-${r.key.replace(/\W+/g, "-")}`

  return (
    <Band
      label="approaches"
      // "worst to best" promised a monotone climb the data does not always make:
      // on island-count the middle rung is a generalisation the prose then argues
      // is overkill, not a step up. What IS true of every pair is that each rung
      // answers the one before it, which is exactly what `whyNow` says (V8).
      count={`${rungs.length} ${rungs.length === 1 ? "way" : "ways"} in, each answering the one before it`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <LanguageStrip langs={langs} />
        {rungs.length > 1 && (
          <nav
            aria-label="jump to an approach"
            className="flex flex-wrap gap-x-3 gap-y-1"
          >
            {rungs.map((r, i) => (
              <a
                key={r.key}
                href={`#${id(r)}`}
                onClick={(e) => {
                  // A BARE `#id` href in a hash-routed app is a ROUTE change,
                  // not a scroll. Measured before this guard: clicking
                  // "01 Brute Force" set location.hash to "#rung-brute", the
                  // router parsed that as the route `rung-brute`, and the app
                  // rendered HOME — the problem page you were reading was
                  // gone. `learn-page-view.tsx` has guarded this since it was
                  // written; this call site never got the same treatment.
                  //
                  // Scroll instead, and let `scroll-padding-top` (index.css)
                  // keep the landing clear of the phone's sticky bar.
                  e.preventDefault()
                  document
                    .getElementById(id(r))
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
                className="inline-flex min-h-11 items-center text-meta text-muted-foreground underline-offset-2 hover:text-foreground hover:underline lg:min-h-7"
              >
                <span className="font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>{" "}
                {r.name}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="flex flex-col gap-6 pt-1" aria-label="approach ladder">
        {rungs.map((r, i) => (
          <div
            key={r.key}
            id={id(r)}
            className="flex scroll-mt-4 flex-col gap-3"
          >
            {r.whyNow && (
              <p className="max-w-[35em] border-l-2 border-chart-1/60 pl-4 text-body text-chart-1">
                {r.whyNow}
              </p>
            )}
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-mono text-meta text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <b className="text-body">{r.name}</b>
              {/* B79. A rung the teaching document teaches and the journey
                  skips — a baseline the animation has no reason to walk, or a
                  variant it argues against. Marked rather than hidden: a
                  learner should be able to tell which rungs they were walked
                  through and which are being handed over as reading. */}
              {r.aside && (
                <span className="rounded-sm border border-chart-4/45 bg-chart-4/10 px-1.5 font-mono text-meta text-chart-4">
                  reading only
                </span>
              )}
              {/* the second channel on the whole ladder: read DOWN the rungs
                  and the bars visibly shrink. That climb is what the prose
                  between the rungs is describing, and this is it drawn. */}
              <span className="inline-flex items-center gap-2 font-mono text-meta text-muted-foreground">
                <ComplexityMark cost={r.cost} />
                {r.cost}
              </span>
            </div>
            <p className="max-w-[35em] text-body text-muted-foreground">
              {r.idea}
            </p>
            {/* Where the bound comes from. The ladder has always shown the
                cost and never the COUNT, so a reader could carry away
                "the set one is O(n)" without being able to derive it — and
                deriving it is the transferable half. A `details`, because it
                is the second reading of a rung and not the first. */}
            {r.costWhy && (
              <details className="max-w-[35em] rounded-lg border px-4 py-3">
                <summary className="min-h-11 cursor-pointer list-none text-ui text-muted-foreground marker:content-none hover:text-foreground lg:min-h-7">
                  <span className="font-mono text-meta text-chart-2">
                    {r.cost}
                  </span>{" "}
                  — how that was counted
                </summary>
                <p className="pt-2 text-body text-muted-foreground">
                  {r.costWhy}
                </p>
              </details>
            )}
            <RungCode code={r.code} />
            {/* The pair worth comparing is this rung and the one it answers:
                `whyNow` right above makes a claim about exactly that step, and
                this is the button that shows it. Never on the first rung,
                which has nothing below it. */}
            {i > 0 && (
              <button
                onClick={() => onCompare(compareHref(rungs[i - 1], r))}
                className="inline-flex min-h-11 w-fit items-center font-mono text-meta text-muted-foreground underline-offset-2 hover:text-foreground hover:underline lg:min-h-7"
              >
                compare with {rungs[i - 1].name.toLowerCase()} &rarr;
              </button>
            )}
          </div>
        ))}
        {/* The idea the whole ladder shares, after the rungs that earned it.
            Never while the ladder is capped: it names where the climb ends. */}
        {problem.arc && !capped && (
          // a <b> here would join the rung names the UI test reads out of this
          // container — the label is a span for that reason
          <p className="max-w-[35em] border-t border-border/60 pt-4 text-body text-muted-foreground">
            <span className="font-semibold text-foreground">The arc.</span>{" "}
            {problem.arc}
          </p>
        )}
        {capped && journey && (
          <p className="max-w-[35em] text-ui text-muted-foreground">
            {hidden} more {hidden === 1 ? "approach is" : "approaches are"}{" "}
            still ahead of you.{" "}
            <a
              href={href(`/journey/${journey.slug}`)}
              className="group inline-flex items-center gap-1 text-chart-1 underline-offset-2 hover:underline"
            >
              Continue the journey
              <ArrowRightIcon aria-hidden className="size-3.5 shrink-0" />
            </a>{" "}
            — each one opens when the previous one runs out of road.
          </p>
        )}
      </div>
    </Band>
  )
}
