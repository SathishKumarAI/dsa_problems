// Which problems have a learn page, and how to fetch one.
//
// `docs/learn/<id>.md` is the single page for a problem — the statement, the
// hints, the authored teaching document where one exists, every rung in three
// languages, and a runnable script. It is GENERATED (`npm run docs:learn`).
// This module owns the bridge between that folder and the app, and nothing else:
// no parsing (see `components/markdown.tsx`), no policy about who may read one
// (see `problem-detail.tsx`, which applies the same cap the arc gets).
//
// The glob is LAZY on purpose. The pages are about four megabytes of
// prose; loading them all to find out which ids exist would undo the point of
// the page. Vite gives every match its own chunk and the keys without reading
// a byte, so `hasDeepDoc` costs nothing and `loadDeepDoc` costs one fetch.

const MODULES = import.meta.glob("/docs/learn/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>

const byId = new Map<string, () => Promise<string>>(
  Object.entries(MODULES).map(([path, load]) => [
    path.replace(/^.*\/(.+)\.md$/, "$1"),
    load,
  ])
)

export const hasLearnPage = (id: string) => byId.has(id)

// Which problems carry an AUTHORED long-form document, as opposed to a page
// the generator assembled from the problem data alone.
//
// The distinction is real and worth surfacing: `scripts/gen-learn.mjs` splices
// `docs/deep/<id>_explained.md` into the learn page VERBATIM when one exists
// (81 of 127 do), so `docs/learn/pair-sum.md` is 1503 lines of which 1262 are
// the authored document. Without this flag the app offers both kinds behind
// the same words, and a learner cannot tell whether the link leads to a worked
// trace with mental models and the bug they are about to write, or to the
// ladder they have just finished reading.
//
// Keys only — `import.meta.glob` hands back the paths without reading a byte,
// so asking the question costs nothing. Nothing here ever LOADS a deep file:
// its content is already inside the learn page, and fetching it twice would
// double four megabytes of prose for no new words.
// `query: "?raw"` is not optional even though nothing here ever calls the
// loader: without it Vite treats each match as a MODULE to parse, and the
// production build dies with one error per file (81 of them, measured).
// With it, the glob is a lazy map of path → loader — keys now, bytes never.
const DEEP = import.meta.glob("/docs/deep/*_explained.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>

const deepIds = new Set(
  Object.keys(DEEP).map((path) =>
    path.replace(/^.*\/(.+)_explained\.md$/, "$1")
  )
)

export const hasDeepDoc = (id: string) => deepIds.has(id)

/** how many problems have an authored document — 81 of 127 at the time of
 *  writing, and the number the UI quotes so it can never drift from the disk */
export const deepDocCount = deepIds.size

// README.md is in the folder too; it is not a problem, so it never matches an id
export const learnPageCount = byId.size - 1

export async function loadLearnPage(id: string): Promise<string | undefined> {
  const load = byId.get(id)
  return load ? await load() : undefined
}
