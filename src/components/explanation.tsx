// The long explanation's body — whichever of the two forms a problem has.
//
// Which form, and fetching it, is `lib/use-explanation.ts`. This file is the
// fork and the markup, and nothing else.
import type { Explanation } from "@/lib/use-explanation"
import { Markdown } from "./markdown"
import { TeachingDocView } from "./teaching-doc"

export function ExplanationBody({ state }: { state: Explanation }) {
  if (!state.present) return null
  if (!state.ready)
    return <p className="text-ui text-muted-foreground">loading the explanation…</p>
  return state.kind === "typed" ? (
    <TeachingDocView parts={state.parts} />
  ) : (
    // `runnable`: by the house format a Markdown document ends in its full
    // script, and that is the block a reader wants to change. The typed side
    // needs no such heuristic — there the script is a field.
    <Markdown blocks={state.blocks} runnable />
  )
}
