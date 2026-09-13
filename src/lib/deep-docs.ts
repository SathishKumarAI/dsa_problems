// Which problems have a long-form teaching document, and how to fetch one.
//
// The documents live in `docs/deep/<id>_explained.md` — authored, gated by
// `scripts/verify-deep.mjs`, and until now readable only in an editor. This
// module owns the bridge between that folder and the app, and nothing else:
// no parsing (see `components/markdown.tsx`), no policy about who may read one
// (see `problem-detail.tsx`, which applies the same cap the arc gets).
//
// The glob is LAZY on purpose. Eighty documents are about three megabytes of
// prose; loading them all to find out which ids exist would undo the point of
// the page. Vite gives every match its own chunk and the keys without reading
// a byte, so `hasDeepDoc` costs nothing and `loadDeepDoc` costs one fetch.

const MODULES = import.meta.glob("/docs/deep/*_explained.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>

const byId = new Map<string, () => Promise<string>>(
  Object.entries(MODULES).map(([path, load]) => [
    path.replace(/^.*\/(.+)_explained\.md$/, "$1"),
    load,
  ])
)

export const hasDeepDoc = (id: string) => byId.has(id)

export const deepDocCount = byId.size

export async function loadDeepDoc(id: string): Promise<string | undefined> {
  const load = byId.get(id)
  return load ? await load() : undefined
}
