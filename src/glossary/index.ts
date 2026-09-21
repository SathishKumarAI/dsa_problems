// The glossary's one door: the registry, the resolver, and the backlinks.
//
// This file owns lookup and the link graph. It does not own a single
// definition — those live one per topic under `terms/`, so adding a word is
// one edit to one small file and never a merge conflict with someone adding a
// different word.
//
// `[[hash map]]` in any authored prose resolves HERE, by slug or by alias, and
// a link that resolves to nothing is a build failure (`glossary.test.ts`), not
// a dead link a reader discovers.
import { COMPLEXITY_TERMS } from "./terms/complexity.ts"
import { STRUCTURE_TERMS } from "./terms/structures.ts"
import { TECHNIQUE_TERMS } from "./terms/techniques.ts"
import type { Term } from "./types.ts"

export type { Term, TermCost, TermSource } from "./types.ts"

/** every entry, in one array. Order here is not the order anything renders. */
export const TERMS: Term[] = [
  ...STRUCTURE_TERMS,
  ...TECHNIQUE_TERMS,
  ...COMPLEXITY_TERMS,
]

/** the topics, for the index page. A topic is a FILE, so this cannot drift. */
export const TOPICS: { id: string; title: string; blurb: string; terms: Term[] }[] =
  [
    {
      id: "structures",
      title: "Structures",
      blurb: "What holds the data, and what each hold costs.",
      terms: STRUCTURE_TERMS,
    },
    {
      id: "techniques",
      title: "Techniques",
      blurb: "The moves — what each one is for, and its tell in a statement.",
      terms: TECHNIQUE_TERMS,
    },
    {
      id: "complexity",
      title: "Cost",
      blurb: "How work is counted, and what the counting hides.",
      terms: COMPLEXITY_TERMS,
    },
  ]

/**
 * slug and alias → entry.
 *
 * Case- and space-insensitive, because prose writes "Hash Map", "hash map" and
 * "hash-map" for the same thing and asking every author to remember which is
 * how a glossary becomes a list of broken links.
 */
const key = (s: string) => s.toLowerCase().replace(/[\s_]+/g, "-")

const BY_KEY = new Map<string, Term>()
for (const t of TERMS) {
  BY_KEY.set(key(t.slug), t)
  BY_KEY.set(key(t.term), t)
  for (const a of t.aliases ?? []) BY_KEY.set(key(a), t)
}

/** the route an entry lives at. One place, because it is written into prose
 *  and into three components. */
export const termHref = (slug: string) => `#/g/${slug}`

/** the entry a `[[…]]` names, or undefined if it names nothing */
export const termOf = (name: string): Term | undefined => BY_KEY.get(key(name))

/** every `[[target]]` / `[[target|shown]]` in a piece of prose, as targets */
export function termLinksIn(text: string): string[] {
  const out: string[] = []
  for (const m of text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
    out.push(m[1].trim())
  }
  return out
}

/**
 * What links here — the half of a wiki that makes it one.
 *
 * A definition read alone is trivia; read with "and it is why these four
 * problems are solvable in one pass" it is a tool. Computed from the prose,
 * never authored, so it cannot claim a link that is not there.
 *
 * Problems are passed in rather than imported: this module must stay loadable
 * by a node test with no data, and the page already holds the catalogue.
 */
export function backlinksOf(
  slug: string,
  from: { id: string; title: string; text: string }[] = []
): { terms: Term[]; pages: { id: string; title: string }[] } {
  const target = termOf(slug)
  if (!target) return { terms: [], pages: [] }
  const hits = (text: string) =>
    termLinksIn(text).some((name) => termOf(name)?.slug === target.slug)
  // EVERY authored field, not just the body: `collision` names [[hash map]] in
  // its one-liner, and a backlinks index that only read paragraphs reported
  // that link as absent — the failure mode this whole section exists to avoid.
  const proseOf = (t: Term) => [
    t.short,
    ...t.body,
    t.trap ?? "",
    ...(t.costs ?? []).map((c) => `${c.op} ${c.unless ?? ""}`),
  ]
  return {
    terms: TERMS.filter(
      (t) => t.slug !== target.slug && proseOf(t).some(hits)
    ).sort((a, b) => a.term.localeCompare(b.term)),
    pages: from
      .filter((p) => hits(p.text))
      .map(({ id, title }) => ({ id, title })),
  }
}
