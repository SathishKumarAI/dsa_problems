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
import { Markdown } from "./markdown"
import type { Block } from "@/lib/markdown"
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
  folded,
  arcDoc,
  onWantDoc,
  expandAll = false,
}: {
  /** the document's own "The Overall Arc", folded under the ladder's arc line
   *  rather than running as a second closing section — see lib/doc-sections.ts */
  arcDoc?: Block[] | null
  /** the page's "read it all" switch — every fold on the ladder opens with it.
   *  `key`ed on the value rather than merely bound to it, so flipping the
   *  switch sets the folds and a reader can still close one afterwards
   *  without the switch fighting them for it. */
  expandAll?: boolean
  /** what the teaching document still has to say about each rung, by key —
   *  the worked example, the mistake, and whatever else that rung owns. Null
   *  until the document is fetched, which is what `onWantDoc` asks for. */
  folded?: Record<string, Block[]> | null
  /** the reader opened a rung's full account: fetch the document */
  onWantDoc?: () => void
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
      id="approaches"
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
              <p className="max-w-measure border-l-2 border-chart-1/60 pl-4 prose-set text-body text-chart-1">
                {r.whyNow}
              </p>
            )}
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-mono text-meta text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <b className="text-body font-semibold">{r.name}</b>
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
            <p className="max-w-measure prose-set text-body text-muted-foreground">
              {r.idea}
            </p>
            {/* Where the bound comes from. The ladder has always shown the
                cost and never the COUNT, so a reader could carry away
                "the set one is O(n)" without being able to derive it — and
                deriving it is the transferable half. A `details`, because it
                is the second reading of a rung and not the first. */}
            {r.costWhy && (
              <details
                key={`cost-${expandAll}`}
                open={expandAll}
                className="rounded-lg border px-4 py-3"
              >
                <summary className="min-h-11 cursor-pointer list-none text-ui text-muted-foreground marker:content-none hover:text-foreground lg:min-h-7">
                  <span className="font-mono text-meta text-chart-2">
                    {r.cost}
                  </span>{" "}
                  — how that was counted
                </summary>
                <p className="max-w-measure pt-2 prose-set text-body text-muted-foreground">
                  {r.costWhy}
                </p>
              </details>
            )}
            <RungCode code={r.code} />
            {/* ── THE RUNG'S OWN ACCOUNT ───────────────────────────────────
                The teaching document used to repeat this whole ladder at the
                foot of the page — 4,222 of contains-duplicate's 7,807 words
                were per-approach, and three of every approach's six
                subsections (the idea, the code, the complexity) were the same
                content as the rung above. The reader was asked to read the
                same three approaches twice, in two shapes.
                The half that is NOT a duplicate — how to think about it, a
                worked trace, the mistake you are about to make — belongs to
                the rung, so it is here, collapsed. See lib/doc-sections.ts. */}
            {onWantDoc && (
              <details
                key={`doc-${expandAll}`}
                open={expandAll}
                // No measure on this BOX: its `px-4` would come out of the
                // 576 twice over, once here and again on the callouts nested
                // inside it — measured 547 on a page where every other
                // sentence ends at 576. The document's own paragraphs carry
                // the measure, which is where it belongs.
                className="rounded-lg border px-4 py-3"
                onToggle={(e) => {
                  if ((e.currentTarget as HTMLDetailsElement).open) onWantDoc()
                }}
              >
                <summary className="min-h-11 cursor-pointer list-none text-ui text-muted-foreground marker:content-none hover:text-foreground lg:min-h-7">
                  Work it through — a traced example, and the mistake
                </summary>
                <div className="pt-3">
                  {folded?.[r.key]?.length ? (
                    <Markdown blocks={folded[r.key]} problemId={problem.id} />
                  ) : (
                    <p className="text-ui text-muted-foreground">
                      {folded ? "nothing further for this rung" : "loading…"}
                    </p>
                  )}
                </div>
              </details>
            )}
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
          <div className="flex max-w-measure flex-col gap-3 border-t border-border/60 pt-4">
            <p className="prose-set text-body text-muted-foreground">
              <span className="font-semibold text-foreground">The arc.</span>{" "}
              {problem.arc}
            </p>
            {/* The document's own arc, UNDER the record's. They are the same
                job — the same three rungs, the same trade, the same closing
                principle — and running both as sections put two closing
                arguments 200 words apart, sharing almost no phrasing, which is
                why no string comparison ever saw it. Neither is redundant, so
                the long one folds under the short one, exactly as a rung's own
                account folds under its rung. */}
            {arcDoc && arcDoc.length > 0 && (
              <details
                key={`arc-${expandAll}`}
                open={expandAll}
                className="rounded-lg border px-4 py-3"
              >
                <summary className="min-h-11 cursor-pointer list-none text-ui text-muted-foreground marker:content-none hover:text-foreground lg:min-h-7">
                  The same arc, at length — where each rung&apos;s cost goes
                </summary>
                <div className="pt-3">
                  <Markdown blocks={arcDoc} problemId={problem.id} />
                </div>
              </details>
            )}
          </div>
        )}
        {capped && journey && (
          <p className="max-w-measure text-body text-muted-foreground">
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
