// What a glossary entry IS. One file, so the shape is read in one screen.
//
// The entry answers a reader who hit a word mid-sentence — "a hash map does
// this in O(1)" — and does not want to leave the problem to find out what that
// means. So an entry is small on purpose: one sentence they can read in a
// popover, then a page if they want the rest.
//
// Nothing here is generated. A definition is a claim, and a claim gets a
// source: `source` names the book and section it was written from, `reading`
// names where to go next, and both are checked by `glossary.test.ts`.

/** the cost of one operation, for the entries where cost is the point */
export interface TermCost {
  /** what you are doing — "lookup", "insert at the head", "pop the min" */
  op: string
  /** the bound, written the way the page writes bounds: `O(1)` */
  bound: string
  /** when the bound does NOT hold. Omitted means it always holds */
  unless?: string
}

export interface TermSource {
  title: string
  url: string
  /** why this link and not another — one clause, not a summary */
  note?: string
}

export interface Term {
  /** the URL segment: `#/g/<slug>` */
  slug: string
  /** the heading, lower case unless the term is a proper noun */
  term: string
  /**
   * Other spellings `[[…]]` may use. The registry resolves them to this entry,
   * so prose can write the word that fits the sentence — "hash table",
   * "dictionary" — without every author having to know the canonical slug.
   */
  aliases?: string[]
  /**
   * ONE sentence. This is what the popover shows, and it has to stand alone:
   * a reader who reads only this must not be misled by it.
   */
  short: string
  /**
   * The rest, as paragraphs. May contain `[[slug]]` links to other entries —
   * that is what makes this a web rather than a list, and `backlinksOf`
   * reads them.
   */
  body: string[]
  /** the cost table, where an entry is about cost */
  costs?: TermCost[]
  /** the trap: what a reader who now "knows this word" will still get wrong */
  trap?: string
  /** related entries, by slug. Reciprocal links are NOT implied */
  seeAlso?: string[]
  /** where to read more. Every URL is checked by the gate */
  reading?: TermSource[]
  /** where this definition came from, named so it can be argued with */
  source?: string
}
