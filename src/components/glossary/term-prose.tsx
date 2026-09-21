// Glossary prose, rendered.
//
// It reuses the site's own inline grammar (`lib/markdown.ts`) rather than
// inventing a second one, so `code`, **bold**, *italic* and `[[term]]` mean
// the same thing in an entry as they do in a teaching document. The only thing
// this file adds is where a `[[term]]` GOES, which is `term-link.tsx`.
import { Fragment } from "react"
import { inlineSpans } from "@/lib/markdown"
import type { Span } from "@/lib/markdown"
import { TermLink } from "./term-link"

function InlineProse({ text }: { text: string }) {
  return (
    <>
      {inlineSpans(text).map((span: Span, i) => {
        if (span.kind === "code")
          return (
            <code
              key={i}
              className="rounded bg-muted px-1 py-0.5 font-mono text-ui text-foreground"
            >
              {span.text}
            </code>
          )
        if (span.kind === "term")
          return (
            <TermLink key={i} target={span.target}>
              {span.text}
            </TermLink>
          )
        if (span.kind === "link")
          return (
            <a
              key={i}
              href={span.href}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              {span.text}
            </a>
          )
        if (span.kind === "bold")
          return (
            <b key={i} className="font-semibold text-foreground">
              <InlineProse text={span.text} />
            </b>
          )
        if (span.kind === "italic")
          return (
            <i key={i} className="italic">
              <InlineProse text={span.text} />
            </i>
          )
        return <Fragment key={i}>{span.text}</Fragment>
      })}
    </>
  )
}

export function TermProse({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      {paragraphs.map((p, i) => (
        <p key={i} className="prose-set max-w-measure text-body">
          <InlineProse text={p} />
        </p>
      ))}
    </div>
  )
}

TermProse.Inline = InlineProse
