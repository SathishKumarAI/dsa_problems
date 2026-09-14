// `#/resources` — how to recognise a pattern and how to write it, per pattern.
//
// Owns the page. Owns no content: every row is a `Pattern.playbook` entry and
// every link a `Pattern.references` row, so adding a pattern's playbook is
// filling a table in `data/patterns.ts` and nothing here changes.
//
// Why this page exists. `docs/RESOURCES.md` held the best writing in the
// repository — the six array ideas and the five list moves, each with the tell
// in the statement, where to practise it and the mistake people actually make —
// in Markdown tables that nothing in `src/` could read. It reached no screen at
// all. The references had the opposite problem: 30 checked sources, each with a
// note saying what it answers, rendered as one strip in a pattern header with
// the notes dropped.
//
// DISCLOSURE. A masked pattern is hidden ENTIRELY, not just by name. This page
// is a pattern name written a dozen different ways — "Two pointers converging",
// "Hash map as an index" — so rendering one during a journey that has not
// reached its reveal would hand over the exact word the whole rule exists to
// withhold. Same call `ReadFurther` already makes in `problem-list.tsx`, same
// reason.
import { BookOpenIcon, FileCodeIcon, GraduationCapIcon } from "lucide-react"
import { Band, Fact, OrientBar } from "@/components/ui/band"
import { PATTERNS, PROBLEMS } from "@/data"
import type { Move, Pattern } from "@/data"
import { usePatternMask } from "@/lib/disclosure"
import { href, navigate, useRoute } from "@/lib/route"
import { cn } from "@/lib/utils"

const KIND_ICON = {
  reference: BookOpenIcon,
  docs: FileCodeIcon,
  course: GraduationCapIcon,
} as const

const titleOf = (id: string) => PROBLEMS.find((p) => p.id === id)?.title ?? id

const routeOf = (id: string) => {
  const p = PROBLEMS.find((x) => x.id === id)
  return p ? `/p/${p.pattern}/${p.id}` : "/"
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

      <p className="max-w-[35em] text-body text-muted-foreground">
        {move.idea}
      </p>

      {/* The tell is the reason to read this page rather than a textbook: it is
          the only part that works BEFORE you know which technique applies. */}
      <div className="flex flex-col gap-1">
        <span className="text-meta tracking-wide text-dim uppercase">
          the tell
        </span>
        <p className="max-w-[35em] border-l-2 border-chart-2/60 pl-3 text-body text-chart-2">
          {move.tell}
        </p>
      </div>

      {move.invariant && (
        <div className="flex flex-col gap-1">
          <span className="text-meta tracking-wide text-dim uppercase">
            keep this true
          </span>
          <p className="max-w-[35em] text-body text-muted-foreground">
            {move.invariant}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-meta tracking-wide text-dim uppercase">
          the classic mistake
        </span>
        <p className="max-w-[35em] border-l-2 border-chart-5/60 pl-3 text-body text-muted-foreground">
          {move.mistake}
        </p>
      </div>

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

export function ResourcesView() {
  const { query } = useRoute()
  const mask = usePatternMask()

  // a pattern is offered only when it has something to show AND its name is
  // not being withheld
  const open = PATTERNS.filter(
    (p) =>
      (p.playbook?.length || p.references?.length) && !mask.hidden.has(p.id)
  )

  const wanted = query.get("p")
  const pattern: Pattern | undefined =
    open.find((p) => p.id === wanted) ?? open[0]

  const pick = (id: string) => navigate("/resources", { p: id })

  if (!pattern)
    return (
      <div className="mx-auto flex w-full max-w-reading flex-col gap-4 py-12">
        <h1 className="text-title">Resources</h1>
        <p className="max-w-[35em] text-body text-muted-foreground">
          Every pattern's playbook is withheld while one of its journeys is
          still running — the moves are the pattern's name written a dozen
          different ways. Finish a journey, or reveal it, and they appear here.
        </p>
      </div>
    )

  const playbook = pattern.playbook ?? []
  const refs = pattern.references ?? []
  const problems = PROBLEMS.filter((p) => p.pattern === pattern.id)

  return (
    <div className="mx-auto flex w-full max-w-reading flex-col gap-8">
      {/* ── ORIENT ─────────────────────────────────────────────────────── */}
      <OrientBar>
        <span className="font-mono text-meta text-muted-foreground">
          {pattern.glyph}
        </span>
        <Fact label="pattern">
          <span>{pattern.name}</span>
        </Fact>
        <Fact label="moves">
          <span className="font-mono">{playbook.length || "—"}</span>
        </Fact>
        <Fact label="problems">
          <span className="font-mono">{problems.length}</span>
        </Fact>
      </OrientBar>

      <div className="flex flex-col gap-3">
        <h1 className="text-title">Resources</h1>
        <p className="max-w-[35em] text-body text-muted-foreground">
          How to recognise a pattern from the statement alone, what to keep true
          while you write it, and the mistake people actually make. Attached to
          the pattern rather than to a problem: the good material is about the
          technique, not about one instance of it.
        </p>
        <nav
          aria-label="pattern"
          className="flex flex-wrap gap-x-2 gap-y-1 pt-1"
        >
          {open.map((p) => (
            <button
              key={p.id}
              onClick={() => pick(p.id)}
              aria-current={p.id === pattern.id}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md border px-2.5 text-meta transition-colors lg:min-h-8",
                p.id === pattern.id
                  ? "border-chart-1/60 bg-chart-1/10 font-medium text-foreground"
                  : "text-muted-foreground hover:border-input hover:text-foreground"
              )}
            >
              {p.name}
              {!p.playbook && (
                <span className="ml-1.5 font-mono text-dim">sources only</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── ACT ────────────────────────────────────────────────────────── */}
      {playbook.length > 0 ? (
        <Band
          label="the playbook"
          count={`${playbook.length} moves that cover most of it`}
        >
          <div className="flex flex-col gap-6">
            {playbook.map((m, i) => (
              <MoveRow key={m.name} move={m} n={i + 1} />
            ))}
          </div>
        </Band>
      ) : (
        <Band label="the playbook" count="not written yet">
          <p className="max-w-[35em] text-body text-muted-foreground">
            {pattern.name} has its reading below, but nobody has written its
            moves down yet. The shape is{" "}
            <code className="font-mono text-meta">Pattern.playbook</code> in{" "}
            <code className="font-mono text-meta">src/data/patterns.ts</code> —
            the move, the tell, the invariant, where to practise it, and the
            mistake.
          </p>
        </Band>
      )}

      {/* ── REVIEW ─────────────────────────────────────────────────────── */}
      {refs.length > 0 && (
        <Band label="read further" count={`${refs.length} sources`}>
          <ul className="flex flex-col gap-4">
            {refs.map((r) => {
              const Icon = KIND_ICON[r.kind]
              return (
                <li key={r.href} className="flex gap-3">
                  <Icon
                    aria-hidden
                    className="mt-1 size-4 shrink-0 text-chart-2"
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-body font-medium underline-offset-2 hover:text-chart-1 hover:underline"
                    >
                      {r.title}
                    </a>
                    {/* the note is why THIS source — a bare link is a chore */}
                    <span className="max-w-[35em] text-ui text-muted-foreground">
                      {r.note}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </Band>
      )}

      <Band
        label="problems on this pattern"
        count={`${problems.length} — every one inherits the rows above`}
      >
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {problems.map((p) => (
            <a
              key={p.id}
              href={href(`/p/${p.pattern}/${p.id}`)}
              className="inline-flex min-h-11 items-center rounded-md border px-2 text-meta text-muted-foreground transition-colors hover:border-chart-1/60 hover:text-foreground lg:min-h-7"
            >
              {p.title}
            </a>
          ))}
        </div>
      </Band>
    </div>
  )
}
