// A typed teaching document, rendered as sections of the problem page.
//
// This replaces a round trip. `lib/content.ts` used to turn the document back
// into one Markdown STRING, which `lib/markdown.ts` re-parsed into blocks,
// which `components/markdown.tsx` rendered: object → text → blocks → UI, with
// every typed table flattened to pipe-delimited text on the way out and split
// on `|` on the way back in. A cell holding a bitwise `a | b` — which this
// corpus is full of — would have torn the row in half. Here the fields are
// rendered as what they are, and only the PROSE goes through the parser.
//
// The section list is DATA and lives in `lib/teaching-parts.ts`, so the
// contents rail and this renderer read the same array. This file owns markup
// and nothing else: no order, no ids, no policy about who may read one (that is
// `problem-detail.tsx`, which applies the ledger's cap).
import type { Part } from "@/lib/teaching-parts"
import { parseMarkdown } from "@/lib/markdown"
import { Markdown } from "./markdown"
import { RunnableCode } from "./runnable-code"

/** prose — the only thing here that is still Markdown, and deliberately so */
const Prose = ({ text }: { text: string }) => (
  <Markdown blocks={parseMarkdown(text)} />
)

/** the same markup a parsed table gets, reached through the same renderer so
 *  there is one table style and not two. Built as a block rather than
 *  re-serialised to pipes: a cell may hold any character, `|` included. */
const Table = ({ head, rows }: { head: string[]; rows: string[][] }) => (
  <Markdown blocks={[{ kind: "table", head, rows }]} />
)

function Body({
  part,
  problemId,
  scaffold,
}: {
  part: Part
  problemId: string
  scaffold: string
}) {
  switch (part.kind) {
    case "heading":
      return null
    case "prose":
      return <Prose text={part.text} />
    case "table":
      return <Table head={part.head} rows={part.rows} />
    case "prose+table":
      return (
        <>
          <Prose text={part.text} />
          <Table head={part.head} rows={part.rows} />
          {part.after && <Prose text={part.after} />}
        </>
      )
    case "code":
      return (
        <RunnableCode
          id={part.id}
          code={part.code}
          problemId={problemId}
          scaffold={scaffold}
          className="w-0 min-w-full"
        />
      )
  }
}

export function TeachingDocView({
  parts,
  problemId,
  scaffold,
}: {
  parts: Part[]
  problemId: string
  scaffold: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-5">
      {parts.map((part) => (
        <section key={part.id} className="flex min-w-0 flex-col gap-5">
          {part.level === 2 ? (
            <h2
              id={part.id}
              className="scroll-mt-6 border-b pt-6 pb-2 text-title font-semibold"
            >
              {part.title}
            </h2>
          ) : (
            <h3
              id={part.id}
              className="scroll-mt-6 pt-2 text-narration font-semibold"
            >
              {part.title}
            </h3>
          )}
          <Body part={part} problemId={problemId} scaffold={scaffold} />
        </section>
      ))}
    </div>
  )
}
