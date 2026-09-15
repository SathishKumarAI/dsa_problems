// A pattern's playbook: the moves that cover most of it, as cards.
//
// This was `#/resources`, a SECOND page about a pattern. That page carried the
// playbook and the references and a list of the pattern's problems; the pattern
// page carried the name, the blurb, the references and a filterable list of the
// same problems. Two pages about one noun, overlapping on two of four sections
// and neither one complete — the same duplication the sidebar, home, the
// problem page and the search palette each had, one level up.
//
// The playbook lives here now and the pattern page renders it, so `#/resources`
// is a redirect. Nothing about the CONTENT changed: every field is still a
// `Pattern.playbook` row in `data/patterns.ts`, so writing a pattern's moves is
// still filling a table and nothing in this file changes.
//
// Owns markup only. The disclosure call — a masked pattern shows no playbook at
// all, because a playbook is the pattern's name written a dozen ways — belongs
// to the page, which already makes it for the references.
import { href } from "@/lib/route"
import type { Move } from "@/data"
import { CATALOGUE as PROBLEMS } from "@/data/manifest"

const titleOf = (id: string) => PROBLEMS.find((p) => p.id === id)?.title ?? id

const routeOf = (id: string) => {
  const p = PROBLEMS.find((x) => x.id === id)
  return p ? `/p/${p.pattern}/${p.id}` : "/"
}

/** one labelled paragraph — the sub-headings that give a move its shape */
function Part({
  label,
  accent,
  children,
}: {
  label: string
  /** a left rule in the part's own colour, for the two that are claims rather
   *  than description: the tell, and the mistake */
  accent?: "tell" | "mistake"
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-meta tracking-wide text-dim uppercase">{label}</span>
      <p
        className={
          accent === "tell"
            ? "max-w-measure border-l-2 border-chart-2/60 pl-3 text-body text-chart-2"
            : accent === "mistake"
              ? "max-w-measure border-l-2 border-chart-5/60 pl-3 text-body text-muted-foreground"
              : "max-w-measure text-body text-muted-foreground"
        }
      >
        {children}
      </p>
    </div>
  )
}

function MoveRow({ move, n }: { move: Move; n: number }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border/60 pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="font-mono text-meta text-muted-foreground">
          {String(n).padStart(2, "0")}
        </span>
        <b className="text-body">{move.name}</b>
      </div>

      <p className="max-w-measure text-body text-muted-foreground">{move.idea}</p>

      {/* The tell is the reason to read this rather than a textbook: it is the
          only part that works BEFORE you know which technique applies. */}
      <Part label="the tell" accent="tell">
        {move.tell}
      </Part>

      {move.invariant && (
        <Part label="keep this true">{move.invariant}</Part>
      )}

      <Part label="the classic mistake" accent="mistake">
        {move.mistake}
      </Part>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-meta text-dim">practise it on</span>
        {move.learnOn.map((id) => (
          <a
            key={id}
            href={href(routeOf(id))}
            className="inline-flex min-h-11 items-center rounded-md border px-2 font-mono text-meta text-muted-foreground transition-colors hover:border-chart-1/60 hover:text-foreground lg:min-h-7"
          >
            {titleOf(id)}
          </a>
        ))}
      </div>
    </div>
  )
}

export function PatternPlaybook({
  name,
  playbook,
}: {
  name: string
  playbook: Move[]
}) {
  // An EMPTY FRAME, never nothing. Eight of the ten patterns have no playbook
  // written, and a section that disappears until it has content is invisible to
  // exactly the reader who would have written it. It says what is missing and
  // where the shape lives.
  if (playbook.length === 0)
    return (
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-baseline gap-3 px-4 py-3">
          <span className="text-meta tracking-wide text-muted-foreground uppercase">
            the playbook
          </span>
          <span className="ml-auto font-mono text-meta text-dim tabular-nums">
            not written yet
          </span>
        </div>
        <p className="max-w-measure border-t px-4 py-4 text-body text-muted-foreground">
          {name} has its reading below, but nobody has written its moves down
          yet. The shape is{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-meta">
            Pattern.playbook
          </code>{" "}
          in{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-meta">
            src/data/patterns.ts
          </code>{" "}
          — the move, the tell, the invariant, where to practise it, and the
          mistake people actually make.
        </p>
      </section>
    )

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-baseline gap-3 px-4 py-3">
        <span className="text-meta tracking-wide text-muted-foreground uppercase">
          the playbook
        </span>
        <span className="ml-auto font-mono text-meta text-dim tabular-nums">
          {playbook.length} moves that cover most of it
        </span>
      </div>
      <div className="flex flex-col gap-6 border-t p-4">
        {playbook.map((m, i) => (
          <MoveRow key={m.name} move={m} n={i + 1} />
        ))}
      </div>
    </section>
  )
}
