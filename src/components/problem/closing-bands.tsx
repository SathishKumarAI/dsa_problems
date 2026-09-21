// What is left of the teaching document, once the page has placed the rest.
//
// There is no door any more. "Understanding" sits with the problem, "Reading
// the calculations" before the rungs whose costs it explains, the comparison
// and the unbound approaches inside the approaches band, and each rung's own
// account on its rung. What reaches here is the part that is about none of
// those: the interview script, the fluency drills, the runnable script.
//
// Two paths, and they are not symmetrical yet. A MARKDOWN document is folded
// and placed section by section, so this renders only the leftovers. A TYPED
// document still renders whole and keeps its own band — folding that is a
// field read rather than a parse, and a different branch.
//
// The band keeps `id="explanation"`: `#/learn/<id>` redirects to
// `?read=explanation`, and something has to be at that offset.
import { Band } from "@/components/ui/band"
import { Markdown } from "../markdown"
import { ExplanationBody } from "../explanation"
import type { Explanation } from "@/lib/use-explanation"
import type { Folded } from "@/lib/doc-sections"

export function ClosingBands({
  problemId,
  closing,
  folded,
  explanation,
}: {
  problemId: string
  /** the document's sections this page found no better home for */
  closing?: Folded["sections"]
  /** null when the document is typed, or not ready: then it renders whole */
  folded: Folded | null
  explanation: Explanation
}) {
  return (
    <>
      {closing && closing.length > 0 && (
        <Band
          id="explanation"
          label="taking it with you"
          count="the parts that belong to no single rung"
        >
          {closing.map((sec) => (
            <div key={sec.title} className="flex flex-col gap-3">
              <h3 className="font-heading text-body font-semibold">
                {sec.title}
              </h3>
              <Markdown
                blocks={sec.blocks}
                runnable
                problemId={problemId}
                scaffold={
                  explanation.present && explanation.ready
                    ? explanation.scaffold
                    : undefined
                }
              />
            </div>
          ))}
        </Band>
      )}

      {!folded && explanation.present && (
        <Band id="explanation" label="the long explanation">
          <ExplanationBody state={explanation} problemId={problemId} />
        </Band>
      )}
    </>
  )
}
