// The long explanation, for the problems whose document is still Markdown.
//
// `docs/learn/<id>.md` is GENERATED (`npm run docs:learn`) and holds exactly
// what the problem page does not already show: the authored teaching document
// from `docs/deep/<id>_explained.md` spliced in verbatim where one exists, one
// runnable script, and where the problem sits among its siblings. 14 problems
// have a TYPED document instead (`src/problems/<id>/doc.ts`, reached through
// `lib/content.ts`), and that one wins — see `components/explanation.tsx`.
//
// WHAT THIS MODULE STOPPED BEING. It used to answer two questions — does a page
// exist, and is it AUTHORED or merely assembled from the data — because
// `#/learn/<id>` was a separate route and the door had to say which kind it
// opened. There is one route now and the generated wrapper is gone with it, so
// the only question left is whether there is anything to read.
//
// The glob is LAZY on purpose: these are a few megabytes of prose, and loading
// them all to find out which ids exist would undo the point. `query: "?raw"` is
// not optional either — without it Vite treats each match as a MODULE to parse
// and the production build dies with one error per file (measured). With it the
// glob is a map of path → loader: keys now, bytes only when a reader opens one.

const MODULES = import.meta.glob("/docs/learn/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>

const byId = new Map<string, () => Promise<string>>(
  Object.entries(MODULES)
    // README.md is in the folder too; it is not a problem, so it never matches
    // an id — but excluding it by name keeps the count honest.
    .filter(([path]) => !path.endsWith("/README.md"))
    .map(([path, load]) => [path.replace(/^.*\/(.+)\.md$/, "$1"), load])
)

export const hasExplanationMarkdown = (id: string) => byId.has(id)

/** how many problems still carry a Markdown explanation — quoted by the UI, so
 *  the number cannot drift from what is on disk */
export const explanationMarkdownCount = byId.size

export async function loadExplanationMarkdown(
  id: string
): Promise<string | undefined> {
  const load = byId.get(id)
  return load ? await load() : undefined
}
