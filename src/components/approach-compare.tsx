// Two rungs of one problem, side by side, with the lines that differ marked.
//
// Owns the comparison VIEW: the two columns, the trade-off rows, the picker
// that swaps either side. Owns no selection state — the two rung keys live in
// the URL (`?compare=set,floyd`), so a comparison is a link you can send and
// the back button undoes it. Owns no diffing either: `lib/rung-diff.ts`.
//
// Why a route rather than a panel: the whyNow sentence between two rungs makes
// a claim ("the set is linear memory on a problem whose point is constant
// space") and the reader's next question is always "show me". A panel answers
// that and loses it on the next click; a URL answers it and keeps it.
//
// DISCLOSURE: this view is reachable only from the ladder, and the ladder only
// offers rungs the ledger has already handed over. It re-checks anyway — a
// hand-typed `?compare=` must not be a way past the cap — by resolving keys
// against the rungs `ladderOf` returned rather than against the problem.
import { ArrowLeftIcon } from "lucide-react"
import { Band } from "@/components/ui/band"
import { ComplexityMark } from "@/components/ui/tick-meter"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Code } from "@/data"
import type { Rung } from "@/lib/ladder"
import { compareHref } from "@/lib/ladder"
import { differingLines } from "@/lib/rung-diff"
import { setPref, usePrefs } from "@/lib/store"

const LANGS: { key: keyof Code; label: string }[] = [
  { key: "python", label: "Python 3" },
  { key: "java", label: "Java" },
  { key: "cpp", label: "C++" },
]

function Column({
  rung,
  other,
  lang,
}: {
  rung: Rung
  other: Rung
  lang: keyof Code
}) {
  const code = rung.code[lang] ?? rung.code.python
  const against = other.code[lang] ?? other.code.python
  const marks = differingLines(code, against)
  const lines = code.split("\n")
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="rounded-sm bg-accent px-1.5 font-mono text-meta text-foreground">
          {rung.key}
        </span>
        <b className="text-body">{rung.name}</b>
      </div>
      <span className="inline-flex items-center gap-2 font-mono text-meta text-muted-foreground">
        <ComplexityMark cost={rung.cost} />
        {rung.cost}
      </span>
      <p className="text-ui text-muted-foreground">{rung.idea}</p>
      <div className="overflow-x-auto rounded-lg border bg-card py-3">
        <pre className="w-fit min-w-full font-mono text-ui leading-relaxed">
          {lines.map((line, i) => (
            <span
              key={i}
              data-diff={marks[i] ? "" : undefined}
              className={cn(
                "block border-l-2 px-3",
                marks[i]
                  ? "border-edge bg-accent text-foreground"
                  : "border-transparent text-muted-foreground"
              )}
            >
              {line || " "}
            </span>
          ))}
        </pre>
      </div>
    </div>
  )
}

export function ApproachCompare({
  pair,
  rungs,
  onPick,
  onBack,
}: {
  pair: [Rung, Rung]
  /** every rung the ledger has handed over — the only ones offered */
  rungs: Rung[]
  onPick: (value: string) => void
  onBack: () => void
}) {
  const [left, right] = pair
  const { codeTab } = usePrefs()
  // a language is offered only when BOTH sides have it: half a comparison is
  // worse than none, because the missing half reads as "this rung has no Java"
  const langs = LANGS.filter((l) => left.code[l.key] && right.code[l.key])
  const lang = (
    langs.some((l) => l.key === codeTab) ? codeTab : "python"
  ) as keyof Code

  const shared = differingLines(
    left.code[lang] ?? left.code.python,
    right.code[lang] ?? right.code.python
  ).filter(
    (d, i) => !d && (left.code[lang] ?? left.code.python).split("\n")[i].trim()
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2 min-h-11 text-muted-foreground lg:min-h-7"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          the whole ladder
        </Button>
        {langs.length > 1 && (
          <div className="flex gap-0.5" role="tablist" aria-label="language">
            {langs.map((l) => (
              <button
                key={l.key}
                role="tab"
                aria-selected={l.key === lang}
                onClick={() => setPref("codeTab", l.key)}
                className={cn(
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
        )}
      </div>

      <Band
        label="compare"
        count={
          shared.length === 1
            ? "1 line in common"
            : `${shared.length} lines in common`
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Column rung={left} other={right} lang={lang} />
          <Column rung={right} other={left} lang={lang} />
        </div>

        {/* The sentence the ladder puts BETWEEN these two rungs is the claim
            this page exists to show, so it is repeated here rather than left
            behind on the page the reader just came from. */}
        {right.whyNow && (
          <p className="max-w-measure border-l-2 border-border pl-3 text-body text-muted-foreground">
            {right.whyNow}
          </p>
        )}

        {rungs.length > 2 && (
          <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
            <span className="text-meta text-dim">
              compare with another rung
            </span>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {rungs
                .filter((r) => r !== left && r !== right)
                .map((r) => (
                  <button
                    key={r.key}
                    onClick={() => onPick(compareHref(left, r))}
                    className="inline-flex min-h-11 items-center font-mono text-meta text-muted-foreground underline-offset-2 hover:text-foreground hover:underline lg:min-h-7"
                  >
                    {left.key} · {r.key}
                  </button>
                ))}
            </div>
          </div>
        )}
      </Band>
    </div>
  )
}
