// The reader for one problem's learn page.
//
// Route: `#/learn/<problem-id>`. The document is fetched on arrival, never with
// the bundle.
//
// TWO SOURCES while the migration runs, and the order is the point:
//
//   1. `src/content/<id>.ts` — the teaching document as a TYPED object beside
//      the record it teaches, composed into the page at read time
//      (`lib/content.ts`). One file per problem, no generator, no third
//      artifact to keep in step.
//   2. `docs/learn/<id>.md` — the generated page, for the 81 problems the
//      conversion has not reached yet.
//
// The fallback goes when the last document is converted, and with it
// `scripts/gen-learn.mjs`, `docs/learn/` and `lib/learn-pages.ts`.
//
// It does NOT re-gate the content. The one door is the link on the problem
// page, which is hidden while a journey still has unearned rungs, exactly as
// the arc is (`problem-detail.tsx`). A learner who types the URL is a learner
// who has chosen to read ahead, and the app has never pretended otherwise —
// the same is true of `#/journey/<slug>?act=`.
import { useEffect, useState } from "react"
import { ArrowLeftIcon, ExternalLinkIcon, ListTreeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PATTERNS, PROBLEMS } from "@/data"
import { loadLearnPage } from "@/lib/learn-pages"
import { composeLearnPage, hasContent, loadContent } from "@/lib/content"
import { ladderOf } from "@/lib/ladder"
import { journeyForProblem } from "@/engine"
import { outlineOf, parseMarkdown, titleOf } from "@/lib/markdown"
import type { Block } from "@/lib/markdown"
import { href, navigate } from "@/lib/route"
import { leetcodeUrl } from "@/lib/ladder"
import { difficultyClass } from "@/lib/difficulty"
import { Badge } from "@/components/ui/badge"
import { DifficultyMeter } from "@/components/ui/tick-meter"
import { cn } from "@/lib/utils"
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
    const source = async () => {
      if (problem && hasContent(id)) {
        const doc = await loadContent(id)
        if (doc) {
          // the full ladder: this page is already gated by the door on the
          // problem page, so it shows the whole climb rather than the capped one
          const { rungs } = ladderOf(
            problem,
            journeyForProblem(problem.id),
            Number.MAX_SAFE_INTEGER
          )
          return composeLearnPage(problem, doc, rungs)
        }
      }
      return loadLearnPage(id)
    }
    source().then((text) => {
      if (!live) return
      if (text === undefined) setMissing(true)
      else setBlocks(parseMarkdown(text))
    })
    return () => {
      live = false
    }
  }, [id, problem])

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
                <DifficultyMeter difficulty={problem.difficulty} />
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
          <Markdown blocks={blocks} runnable />
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
          // `top-16`, not `top-6`: the shell parks a fixed search control at
          // `top-3 right-4`, and this rail is the only thing that shares that
          // corner. At 1280 the button was measured painting over the rail's
          // first entries — "Approach 6 — Direct indexing…" was unreachable.
          className="sticky top-16 hidden h-fit w-56 shrink-0 flex-col gap-1 border-l pl-4 xl:flex"
        >
          <span className="flex items-center gap-1.5 pb-1 text-meta font-semibold text-foreground">
            <ListTreeIcon className="size-3.5 shrink-0 text-dim" aria-hidden />
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
              // `-ml-4 border-l-2 border-transparent pl-4` puts each entry's
              // own indicator exactly on top of the rail's border, so the
              // hovered section lights that hairline instead of adding a
              // second line beside it. Border and colour only — the row never
              // moves, which is what would make a 30-entry rail jitter.
              className={cn(
                // `text-ui`, not `text-meta`: four of this document's section
                // labels run past 55 characters, which is the threshold the
                // repo's own audit uses to call something a SENTENCE rather
                // than a label — and a sentence is never set below the ui
                // step. The audit walks four routes and this is not one of
                // them, so nothing had ever flagged it.
                "-ml-4 border-l-2 border-transparent py-0.5 text-ui transition-colors hover:border-chart-1 hover:text-foreground",
                entry.level === 3
                  ? "pl-7 text-dim"
                  : "pl-4 text-muted-foreground"
              )}
            >
              {entry.text.replace(/`/g, "")}
            </a>
          ))}
          {problem && (
            <a
              href={href(`/p/${problem.pattern}/${problem.id}`)}
              className="mt-3 inline-flex items-center gap-1.5 border-t pt-3 text-meta text-chart-1 underline-offset-2 hover:underline"
            >
              <ArrowLeftIcon className="size-3.5 shrink-0" aria-hidden />
              back to the problem
            </a>
          )}
        </nav>
      )}
    </div>
  )
}
