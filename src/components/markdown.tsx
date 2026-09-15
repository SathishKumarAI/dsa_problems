// Renders the blocks `lib/markdown.ts` produces. Owns presentation only — it
// decides nothing about what a reader is allowed to see (that is the page) and
// parses nothing (that is the parser).
//
// Two decisions worth keeping:
//   * a fence renders through `CodeBlock`, so the runnable script at the foot
//     of every deep document arrives with the copy button the rest of the app
//     already has, instead of a second code style nobody maintains.
//   * prose is capped at 35em per DESIGN.md, while tables and code are NOT —
//     they scroll inside their own box, so a wide comparison table never makes
//     the page scroll sideways.
import { Fragment } from "react"
import type { Block, Span } from "@/lib/markdown"
import { inlineSpans, slugify } from "@/lib/markdown"
import { cn } from "@/lib/utils"
import { CodeBlock } from "./code-block"
import { RunnableCode } from "./runnable-code"

function Inline({ text }: { text: string }) {
  return (
    <>
      {inlineSpans(text).map((span: Span, i) => {
        if (span.kind === "code")
          return (
            <code
              key={i}
              // `text-ui`, not `text-[0.9em]`. A relative size is a SEVENTH
              // type step that changes with wherever it lands: 0.9em rendered
              // 15.3px inside body prose and 13.5px inside a table cell, so
              // the same inline code was three different sizes on one page
              // (103 nodes measured on contains-duplicate). DESIGN.md's rule
              // is the role, never the size — and mono one step below its sans
              // sibling, which beside `text-body` is exactly `text-ui`. The
              // table cells drop theirs to `text-meta` for the same reason.
              className="rounded bg-muted px-1 py-0.5 font-mono text-ui text-foreground"
            >
              {span.text}
            </code>
          )
        if (span.kind === "link")
          return (
            <a
              key={i}
              href={span.href}
              // an outside link opens away; an in-repo one (../RESOURCES.md,
              // sibling.md) would 404 in the app, so it is not a link there
              {...(/^https?:/.test(span.href)
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
              className="text-chart-1 underline-offset-2 hover:underline"
            >
              <Inline text={span.text} />
            </a>
          )
        // Bold and italic re-enter, because the corpus nests code inside them
        // — "**Time — `O(n)`.**" is how every complexity bullet is written.
        // Without this the inner backticks render as literal characters.
        if (span.kind === "bold")
          return (
            <b key={i} className="font-semibold text-foreground">
              <Inline text={span.text} />
            </b>
          )
        if (span.kind === "italic")
          return (
            <i key={i} className="italic">
              <Inline text={span.text} />
            </i>
          )
        return <Fragment key={i}>{span.text}</Fragment>
      })}
    </>
  )
}

// The four callout labels the corpus uses, each earning its own accent. "Watch
// out" is a trap and reads as one; the others are all explanation, so they
// share the accent the problem page already uses for `whyNow`.
const ACCENT: Record<string, string> = {
  "Watch out.": "border-destructive/60",
  "In an interview.": "border-chart-4/60",
}
const DEFAULT_ACCENT = "border-chart-1/60"

export function Markdown({
  blocks,
  runnable = false,
  problemId,
  scaffold,
}: {
  blocks: Block[]
  /** whose first test case the Run button calls a definition-only block with */
  problemId?: string
  /** the document's own script, which every fence above it was written against */
  scaffold?: string
  /**
   * B82/B83. Give every ```python fence a Run button, and the LAST one an
   * editor as well.
   *
   * Why the last one: by the house format (`docs/deep/README.md`) a teaching
   * document ends in its "Full Runnable Script" — every approach in the
   * document plus a differential test over random inputs — and that is the
   * block `scripts/verify-deep.mjs` extracts and executes on every pull
   * request. It is the one block a reader wants to change, because it already
   * contains everything. The fences above it are excerpts of it.
   *
   * Off by default: this is a property of the LEARN PAGE corpus, not of
   * markdown. A fence in a dialog is illustration.
   */
  runnable?: boolean
}) {
  // The "which fence is the full script" heuristic is gone with the thing it
  // decided. It picked the LAST python fence and made only that one editable;
  // every block is editable now, so there is nothing left to guess.
  // min-w-0: a flex child sizes to `min-width: auto` by default, so the widest
  // comparison table would push this column open and take the whole page
  // sideways with it. Measured at 1440: scrollWidth 1440 against clientWidth
  // 1430 — exactly the scrollbar — until this was set.
  return (
    <div className="flex min-w-0 flex-col gap-5">
      {blocks.map((block, i) => {
        switch (block.kind) {
          // the page renders the document's own title in its header
          case "heading":
            if (block.level === 1) return null
            return block.level === 2 ? (
              <h2
                key={i}
                id={slugify(block.text)}
                className="scroll-mt-6 border-b pt-6 pb-2 text-title font-semibold"
              >
                <Inline text={block.text} />
              </h2>
            ) : (
              <h3
                key={i}
                id={slugify(block.text)}
                className="scroll-mt-6 pt-2 text-narration font-semibold"
              >
                <Inline text={block.text} />
              </h3>
            )

          case "paragraph":
            return (
              <p
                key={i}
                className="max-w-[35em] text-body text-muted-foreground"
              >
                <Inline text={block.text} />
              </p>
            )

          case "quote":
            return (
              <blockquote
                key={i}
                className={cn(
                  "flex max-w-[35em] flex-col gap-2 border-l-2 bg-card/40 py-2 pr-3 pl-4",
                  ACCENT[block.label ?? ""] ?? DEFAULT_ACCENT
                )}
              >
                {block.paragraphs.map((text, j) => (
                  <p key={j} className="text-body text-muted-foreground">
                    {j === 0 && block.label && (
                      <span className="font-semibold text-foreground">
                        {block.label}{" "}
                      </span>
                    )}
                    <Inline text={text} />
                  </p>
                ))}
              </blockquote>
            )

          // `w-0 min-w-full`: a <pre> does not wrap, so its min-content width
          // is its longest LINE — measured at 966px for the runnable script —
          // and that floor propagates up through the column, the article and
          // the shell's flex row until the whole page is 10px too wide and
          // scrolls sideways. Width zero with a percentage minimum renders
          // full width while contributing nothing to the parent's min-content.
          case "code":
            if (runnable && /^py(thon)?$/i.test(block.lang))
              return (
                <RunnableCode
                  key={i}
                  id={`block-${i}`}
                  code={block.code}
                  problemId={problemId}
                  scaffold={scaffold}
                  className="w-0 min-w-full"
                />
              )
            return (
              <CodeBlock key={i} code={block.code} className="w-0 min-w-full" />
            )

          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-lg border">
                <table className="w-full border-collapse text-ui">
                  <thead>
                    <tr className="border-b bg-card/60">
                      {block.head.map((cell, j) => (
                        <th
                          key={j}
                          className="px-3 py-2 text-left font-semibold text-foreground [&_code]:text-meta"
                        >
                          <Inline text={cell} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr
                        key={j}
                        className="border-b transition-colors last:border-0 hover:bg-muted/40"
                      >
                        {row.map((cell, k) => (
                          <td
                            key={k}
                            className="px-3 py-2 align-top text-muted-foreground [&_code]:text-meta"
                          >
                            <Inline text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          case "list":
            return (
              <ul key={i} className="flex max-w-[35em] flex-col gap-2 pl-5">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="list-disc text-body text-muted-foreground marker:text-border"
                  >
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            )

          // The hints fold, and the Java/C++ blocks. Closed by default is the
          // point: the generated page puts the hints behind one so a reader
          // chooses when to be nudged — the gate belongs to the learner.
          case "details":
            return (
              <details
                key={i}
                className="max-w-[35em] rounded-lg border bg-card/40 px-4 py-3 [&[open]]:max-w-full"
              >
                <summary className="cursor-pointer text-body font-medium text-foreground transition-colors marker:text-muted-foreground hover:text-chart-1">
                  <Inline text={block.summary} />
                </summary>
                <div className="pt-3">
                  <Markdown blocks={block.blocks} />
                </div>
              </details>
            )

          case "rule":
            return <hr key={i} className="border-border/60" />
        }
      })}
    </div>
  )
}
