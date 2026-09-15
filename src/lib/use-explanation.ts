// Which problems have a long explanation, and fetching one.
//
// TWO SOURCES while the migration runs, and the order is the point:
//
//   1. `src/problems/<id>/doc.ts` — the teaching document as a TYPED object
//      beside the record it teaches. Flattened to parts by `teaching-parts.ts`
//      and rendered as sections, with no Markdown string in the middle.
//   2. `docs/learn/<id>.md` — GENERATED from the authored `docs/deep/` document
//      plus one runnable script, for the problems the conversion has not
//      reached. Parsed in the browser.
//
// Forty-five problems have no authored document at all; most of those still get
// a file, because the vector-driven runnable script is worth a section on its
// own. A problem with neither has no explanation and no door — an empty section
// promising one would be worse than no section. `docs/LEARN-GAPS.md` counts
// them.
//
// Owns the fetch and the fork. Owns no gate: the caller decides whether to ask
// at all, because the ledger's cap is the page's business.

import { useEffect, useState } from "react"
import { hasContent, loadContent } from "@/lib/content"
import { hasExplanationMarkdown, loadExplanationMarkdown } from "@/lib/learn-pages"
import { outlineOf, parseMarkdown } from "@/lib/markdown"
import type { Block, Outline } from "@/lib/markdown"
import { outlineOfParts, partsOf } from "@/lib/teaching-parts"
import type { Part } from "@/lib/teaching-parts"

export type Explanation =
  | { present: false }
  | { present: true; ready: false }
  | { present: true; ready: true; kind: "typed"; parts: Part[]; outline: Outline[] }
  | { present: true; ready: true; kind: "markdown"; blocks: Block[]; outline: Outline[] }

/** whether a problem has an explanation at all — answered from the glob's KEYS,
 *  with no fetch, so the door can be decided during render */
export const hasExplanation = (id: string) =>
  hasContent(id) || hasExplanationMarkdown(id)

/**
 * `allowed` is the ledger's gate — a started, unfinished journey has not earned
 * the ending. `open` is the reader's: the explanation runs to 15–30 screens, so
 * it is collapsed until asked for, and NOT FETCHED until then either. Whether
 * one exists is answered from the glob's keys with no fetch at all, so the door
 * can be decided during render while the document stays on disk.
 */
export function useExplanation(
  id: string,
  allowed: boolean,
  open: boolean
): Explanation {
  const present = allowed && hasExplanation(id)
  const [loaded, setLoaded] = useState<Explanation | undefined>()

  // No state reset here: the page is mounted with `key={id}`, so a different
  // problem is a different component instance and starts empty. A synchronous
  // setState in an effect is also what react-hooks v7 forbids.
  useEffect(() => {
    if (!present || !open) return
    let live = true
    const fetchIt = async (): Promise<Explanation> => {
      if (hasContent(id)) {
        const doc = await loadContent(id)
        if (doc) {
          const parts = partsOf(doc)
          return {
            present: true,
            ready: true,
            kind: "typed",
            parts,
            outline: outlineOfParts(parts),
          }
        }
      }
      const md = await loadExplanationMarkdown(id)
      const blocks = parseMarkdown(md ?? "")
      return {
        present: true,
        ready: true,
        kind: "markdown",
        blocks,
        outline: outlineOf(blocks),
      }
    }
    fetchIt().then((e) => live && setLoaded(e))
    return () => {
      live = false
    }
  }, [id, present, open])

  if (!present) return { present: false }
  if (!open) return { present: true, ready: false }
  return loaded ?? { present: true, ready: false }
}
