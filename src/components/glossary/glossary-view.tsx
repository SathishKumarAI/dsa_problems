// The glossary: an index of every entry, and a page per entry.
//
// It is the reference half of the site — a reader arrives here from a word in
// a sentence, reads one screen, and goes back. So the page is ordered by what
// that reader came for: the definition, then the costs, then the trap, then
// where the word is used on this site, and reading last.
//
// WHAT LINKS HERE is the part that makes this a wiki rather than a list, and
// it is COMPUTED — from other entries' prose and from the problem records — so
// it can never claim a link that is not there. A definition read alone is
// trivia; read beside the four problems that turn on it, it is a tool.
//
// The entries are pure data (`src/glossary/`), so nothing on this page decides
// what a word means. See `src/glossary/README.md`.
import { backlinksOf, TERMS, TOPICS, termHref, termOf } from "@/glossary"
import type { Term } from "@/glossary"
import { PROBLEMS } from "@/data"
import { Band } from "@/components/ui/band"
import { NotFound } from "@/components/not-found"
import { TermLink } from "./term-link"
import { TermProse } from "./term-prose"

/** the problem prose a `[[…]]` may be authored in, flattened once */
const problemText = (p: (typeof PROBLEMS)[number]) =>
  [
    p.brief,
    p.statement,
    p.approach,
    p.arc ?? "",
    p.costWhy ?? "",
    ...(p.unlocks ?? []).map((u) => u.what),
  ].join("\n")

export function GlossaryIndex() {
  return (
    <div className="mx-auto flex w-full max-w-(--container-page) flex-col gap-8 p-4 md:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-title font-semibold">Glossary</h1>
        <p className="max-w-measure text-body text-muted-foreground">
          {TERMS.length} entries. Every one is a word this site uses in a claim
          about cost or correctness, defined with the exception that breaks it —
          a bound with no stated exception is a bound you will trust in the one
          place it does not hold.
        </p>
      </header>
      {TOPICS.map((topic) => (
        <Band key={topic.id} id={topic.id} label={topic.title} count={`${topic.terms.length}`}>
          <p className="max-w-measure text-body text-muted-foreground">
            {topic.blurb}
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {topic.terms.map((t) => (
              <li key={t.slug}>
                <a
                  href={termHref(t.slug)}
                  className="flex h-full flex-col gap-1 rounded-lg border border-border/60 p-3 hover:border-border hover:bg-muted/40"
                >
                  <span className="text-ui font-semibold">{t.term}</span>
                  <span className="text-meta text-muted-foreground">
                    {t.short.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) =>
                      (b ?? a).trim()
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Band>
      ))}
    </div>
  )
}

function Costs({ costs }: { costs: NonNullable<Term["costs"]> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2 pr-4 text-meta font-medium tracking-wide text-dim uppercase">
              operation
            </th>
            <th className="py-2 pr-4 text-meta font-medium tracking-wide text-dim uppercase">
              cost
            </th>
            <th className="py-2 text-meta font-medium tracking-wide text-dim uppercase">
              unless
            </th>
          </tr>
        </thead>
        <tbody>
          {costs.map((c) => (
            <tr key={c.op} className="border-b border-border/40 align-baseline">
              <td className="py-2 pr-4 text-ui">
                <TermProse.Inline text={c.op} />
              </td>
              <td className="py-2 pr-4 font-mono text-ui whitespace-nowrap">
                {c.bound}
              </td>
              <td className="py-2 text-meta text-muted-foreground">
                {c.unless ? <TermProse.Inline text={c.unless} /> : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function GlossaryTerm({ slug }: { slug: string }) {
  const term = termOf(slug)
  if (!term) return <NotFound path={`/g/${slug}`} back="/g" />
  const links = backlinksOf(
    term.slug,
    PROBLEMS.map((p) => ({ id: p.id, title: p.title, text: problemText(p) }))
  )
  const pages = PROBLEMS.filter((p) => links.pages.some((x) => x.id === p.id))

  return (
    <div className="mx-auto flex w-full max-w-(--container-reading) flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col gap-2">
        <a
          href="#/g"
          className="text-meta text-muted-foreground hover:text-foreground"
        >
          ‹ glossary
        </a>
        <h1 className="font-heading text-title font-semibold">{term.term}</h1>
        <p className="prose-set max-w-measure text-body">
          <TermProse.Inline text={term.short} />
        </p>
        {term.aliases?.length ? (
          <p className="text-meta text-dim">
            also: {term.aliases.join(" · ")}
          </p>
        ) : null}
      </header>

      <TermProse paragraphs={term.body} />

      {term.costs?.length ? (
        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-ui font-semibold">What it costs</h2>
          <Costs costs={term.costs} />
        </section>
      ) : null}

      {term.trap && (
        <section className="flex flex-col gap-1.5 rounded-lg border-l-2 border-l-chart-1 bg-muted/40 p-3">
          <span className="text-meta tracking-wide text-dim uppercase">
            the trap
          </span>
          <p className="text-body">
            <TermProse.Inline text={term.trap} />
          </p>
        </section>
      )}

      {/* WHAT LINKS HERE — computed, never authored. */}
      {(links.terms.length > 0 || pages.length > 0) && (
        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-ui font-semibold">
            What links here
          </h2>
          {pages.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {pages.map((p) => (
                <li key={p.id}>
                  <a
                    href={`#/p/${p.pattern}/${p.id}`}
                    className="inline-block rounded-md border border-border/60 px-2 py-1 text-meta hover:border-border hover:bg-muted/40"
                  >
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {links.terms.length > 0 && (
            <p className="text-meta text-muted-foreground">
              entries:{" "}
              {links.terms.map((t, i) => (
                <span key={t.slug}>
                  {i > 0 && " · "}
                  <TermLink target={t.slug}>{t.term}</TermLink>
                </span>
              ))}
            </p>
          )}
        </section>
      )}

      {term.seeAlso?.length ? (
        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-ui font-semibold">See also</h2>
          <p className="text-body text-muted-foreground">
            {term.seeAlso.map((s, i) => (
              <span key={s}>
                {i > 0 && " · "}
                <TermLink target={s}>{termOf(s)?.term ?? s}</TermLink>
              </span>
            ))}
          </p>
        </section>
      ) : null}

      {term.reading?.length ? (
        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-ui font-semibold">Read further</h2>
          <ul className="flex flex-col gap-2">
            {term.reading.map((r) => (
              <li key={r.url} className="flex flex-col">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ui text-foreground underline underline-offset-2"
                >
                  {r.title} ↗
                </a>
                {r.note && (
                  <span className="text-meta text-muted-foreground">
                    {r.note}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {term.source && (
        <p className="text-meta text-dim">
          Written from: {term.source}. A definition is a claim; this is where it
          came from.
        </p>
      )}
    </div>
  )
}
