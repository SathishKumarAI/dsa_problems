// The reader for one problem's learn page (`docs/learn/<id>.md`).
//
// Route: `#/learn/<problem-id>`. The document is fetched on arrival, never with
// the bundle — see `lib/deep-docs.ts` for why.
//
// It does NOT re-gate the content. The one door is the link on the problem
// page, which is hidden while a journey still has unearned rungs, exactly as
// the arc is (`problem-detail.tsx`). A learner who types the URL is a learner
// who has chosen to read ahead, and the app has never pretended otherwise —
// the same is true of `#/journey/<slug>?act=`.
import { useEffect, useState } from "react"
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PATTERNS, PROBLEMS } from "@/data"
import { loadLearnPage } from "@/lib/learn-pages"
import { outlineOf, parseMarkdown, titleOf } from "@/lib/markdown"
import type { Block } from "@/lib/markdown"
import { href, navigate } from "@/lib/route"
import { leetcodeUrl } from "@/lib/ladder"
import { difficultyClass } from "@/lib/difficulty"
import { Badge } from "@/components/ui/badge"
import { Markdown } from "./markdown"

export function LearnPageView({ id }: { id: string }) {
  const [blocks, setBlocks] = useState<Block[] | undefined>()
  const [missing, setMissing] = useState(false)
  const problem = PROBLEMS.find((p) => p.id === id)
  const pattern = PATTERNS.find((p) => p.id === problem?.pattern)

  // No state reset here: App mounts this with `key={id}`, so a different
  // document is a different component instance and starts empty anyway. A
  // synchronous setState in an effect is also what react-hooks v7 forbids.
  useEffect(() => {
    let live = true
    loadLearnPage(id).then((source) => {
      if (!live) return
      if (source === undefined) setMissing(true)
      else setBlocks(parseMarkdown(source))
    })
    return () => {
      live = false
    }
  }, [id])

  const back = () =>
    problem && pattern
      ? navigate(`/p/${pattern.id}/${problem.id}`)
      : navigate("/")

  if (missing)
    return (
      <div className="mx-auto flex max-w-(--container-reading) flex-col gap-4">
        <Button variant="ghost" size="sm" className="self-start" onClick={back}>
          <ArrowLeftIcon /> Back
        </Button>
        <p className="text-body text-muted-foreground">
          No learn page for <code className="font-mono">{id}</code> yet. The
          ones that exist are linked from their problem page.
        </p>
      </div>
    )

  const outline = blocks ? outlineOf(blocks) : []
  const title = (blocks && titleOf(blocks)) ?? problem?.title ?? id

  return (
    <div className="mx-auto flex w-full max-w-(--container-page) gap-10">
      <article className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 self-start text-muted-foreground"
            onClick={back}
          >
            <ArrowLeftIcon /> {problem ? problem.title : "Back"}
          </Button>
          <h1 className="text-display font-semibold tracking-tight">{title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-meta">
              learn page
            </Badge>
            {problem && (
              <Badge
                variant="outline"
                className={difficultyClass[problem.difficulty]}
              >
                {problem.difficulty}
              </Badge>
            )}
            {problem?.leetcode && (
              <a
                className="inline-flex items-center gap-1 text-meta text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                href={leetcodeUrl(problem.leetcode)}
                target="_blank"
                rel="noreferrer"
              >
                solve it on LeetCode <ExternalLinkIcon className="size-3" />
              </a>
            )}
          </div>
        </div>

        {blocks ? (
          <Markdown blocks={blocks} />
        ) : (
          <p className="text-ui text-muted-foreground">loading the document…</p>
        )}
      </article>

      {/* The contents rail. A deep document runs to a few thousand words with
          one section per approach, so the sections ARE the navigation. Hidden
          below xl, where there is no room for a second column. */}
      {outline.length > 0 && (
        <nav
          aria-label="contents"
          className="sticky top-6 hidden h-fit w-56 shrink-0 flex-col gap-1 border-l pl-4 xl:flex"
        >
          <span className="pb-1 text-meta font-semibold text-foreground">
            Contents
          </span>
          {outline.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              onClick={(e) => {
                // a bare `#id` href would replace the hash ROUTE and navigate
                // the app home; scroll to the heading instead
                e.preventDefault()
                document.getElementById(entry.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }}
              className={
                entry.level === 3
                  ? "pl-3 text-meta text-dim hover:text-foreground"
                  : "text-meta text-muted-foreground hover:text-foreground"
              }
            >
              {entry.text.replace(/`/g, "")}
            </a>
          ))}
          {problem && (
            <a
              href={href(`/p/${problem.pattern}/${problem.id}`)}
              className="mt-3 border-t pt-3 text-meta text-chart-1 underline-offset-2 hover:underline"
            >
              ◂ back to the problem
            </a>
          )}
        </nav>
      )}
    </div>
  )
}
