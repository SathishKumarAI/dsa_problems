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

// README.md is in the folder too; it is not a problem, so it never matches an id
export const learnPageCount = byId.size - 1

export async function loadLearnPage(id: string): Promise<string | undefined> {
  const load = byId.get(id)
  return load ? await load() : undefined
}
