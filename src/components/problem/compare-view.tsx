// The comparison view — two rungs, side by side, and nothing else.
//
// It is a DIFFERENT PAGE, not a band. Rendering the comparison inline left the
// reader four screens above the thing they asked for, on a page that looked
// entirely correct in the code; it was only visible in a browser. A reader who
// asks to compare two rungs is asking one question: answer it, keep the orient
// bar so they still know where they are, and let Back return the page.
import { ArrowLeftIcon } from "lucide-react"
import { Fact, OrientBar } from "@/components/ui/band"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ApproachCompare } from "../approach-compare"
import type { Rung } from "@/lib/ladder"
import type { Problem } from "@/data"

export function CompareView({
  problem,
  pair,
  rungs,
  reading,
  onPick,
}: {
  problem: Problem
  pair: [Rung, Rung]
  rungs: Rung[]
  /** the reader is reading: the bar slides out of the way, as on the page */
  reading: boolean
  /** "" closes the comparison and returns the page */
  onPick: (value: string) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-reading flex-col gap-6">
      {/* hides while reading, same as the page's own bar */}
      <OrientBar
        className={cn(
          "transition-[transform,opacity] duration-(--duration-reveal)",
          reading
            ? "pointer-events-none invisible -translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPick("")}
          className="-ml-2 min-h-11 text-muted-foreground lg:min-h-7"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          {problem.title}
        </Button>
        <Fact label="comparing">
          <span className="font-mono">
            {pair[0].key} · {pair[1].key}
          </span>
        </Fact>
      </OrientBar>
      <ApproachCompare
        pair={pair}
        rungs={rungs}
        onPick={onPick}
        onBack={() => onPick("")}
      />
    </div>
  )
}
