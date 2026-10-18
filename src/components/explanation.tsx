// The long explanation's body, for the one case the page cannot place it
// through the bands: a Markdown document with no entry in
// `src/data/rung-bindings.json`. Every other document — typed, or Markdown
// with a binding — is folded (`lib/doc-sections.ts`) and never reaches here.
//
// Which form, and fetching it, is `lib/use-explanation.ts`.
import type { Explanation } from "@/lib/use-explanation"
import { Markdown } from "./markdown"

export function ExplanationBody({
  state,
  problemId,
}: {
  state: Explanation
  problemId: string
}) {
  if (!state.present) return null
  if (!state.ready)
    return (
      <p className="text-ui text-muted-foreground">loading the explanation…</p>
    )
  // a typed document is always folded, so only the Markdown form can arrive
  if (state.kind === "typed") return null
  return (
    // `runnable`: by the house format a Markdown document ends in its full
    // script, and that is the block a reader wants to change.
    <Markdown
      blocks={state.blocks}
      runnable
      problemId={problemId}
      scaffold={state.scaffold}
    />
  )
}
