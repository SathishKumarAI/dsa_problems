// A word in a sentence that carries its own definition.
//
// The reader's problem this solves: a sentence says "average O(1), because a
// hash map…" and the reader does not know — or is not sure they know — what a
// hash map is. Leaving the page to find out costs them the sentence. So the
// word is a link with the one-line definition ON HOVER, and the link goes to
// the entry if they want the rest.
//
// Three decisions, all of them reversible in this one file:
//
//   * A DOTTED underline, not a solid one. The page already uses a solid
//     underline for "this navigates somewhere else"; a definition is a
//     different promise and should not look identical.
//   * The popover is the `short` field and nothing more. An entry's first
//     paragraph in a tooltip is a wall, and a reader hovering a word wants a
//     sentence, not an article.
//   * A term that resolves to NOTHING renders as plain text, never as a
//     broken link. The build gate fails on an unresolved `[[…]]`, so this is
//     belt and braces — but a reader must never meet a link to a 404.
import { termHref, termOf } from "@/glossary"
import type { Term as TermRecord } from "@/glossary"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function TermLink({
  target,
  children,
}: {
  /** what the `[[…]]` named: a slug, the term itself, or one of its aliases */
  target: string
  children: React.ReactNode
}) {
  const term: TermRecord | undefined = termOf(target)
  if (!term) return <>{children}</>
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            href={termHref(term.slug)}
            data-term={term.slug}
            className="underline decoration-dotted decoration-from-font underline-offset-4 hover:decoration-solid"
          >
            {children}
          </a>
        }
      />
      <TooltipContent className="max-w-xs text-pretty">
        {term.short.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) =>
          (b ?? a).trim()
        )}
      </TooltipContent>
    </Tooltip>
  )
}
