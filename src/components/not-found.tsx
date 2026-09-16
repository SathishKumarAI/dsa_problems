// The route that names nothing real. Owns the message and the ways out; owns
// no routing — App.tsx decides when nothing matched.
//
// Why it exists (B96). `View()` used to fall through to `<HomeView>`, so a
// renamed problem, a stale bookmark or a link copied short rendered a working
// home page with no signal that anything was missed. Same family as the bare
// `#id` anchor trap in CLAUDE.md: a route change that silently looks like it
// worked is the expensive kind of wrong.
//
// DISCLOSURE. The back link never names the pattern — a pattern name is the
// one word the journey rule withholds (`problem-list.tsx`, `resources-view.tsx`
// mask it), and this page has no ledger to check it against.
import { href } from "@/lib/route"

interface Props {
  /** the hash path that matched nothing, shown verbatim so the reader can see
   *  which part is wrong rather than being told "not found" */
  path: string
  /** a real route one level up, when the front of the path DID name something */
  back?: string
}

export function NotFound({ path, back }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-reading flex-col gap-4">
      <h1 className="font-heading text-title font-semibold">
        There is nothing at that address
      </h1>

      <code className="w-fit max-w-full overflow-x-auto rounded-lg border px-3 py-2 font-mono text-ui text-muted-foreground">
        #{path}
      </code>

      <p className="max-w-measure text-body text-muted-foreground">
        No pattern, problem, journey or page here goes by that name. It was
        probably renamed, or the link was copied short.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={href("/")}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-ui font-medium transition-colors hover:border-edge/60 lg:min-h-9"
        >
          go home
        </a>
        {back && (
          <a
            href={href(back)}
            className="inline-flex min-h-11 items-center text-ui text-muted-foreground underline-offset-2 hover:text-foreground hover:underline lg:min-h-9"
          >
            back to the problem list
          </a>
        )}
      </div>
    </div>
  )
}
