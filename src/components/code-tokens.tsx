// What a token LOOKS like — the one place a token role becomes a colour.
//
// Owns: the role → class map, and the two renderers every code surface on the
// site goes through. Owns nothing about what a token is (`lib/syntax.ts`) and
// nothing about the colours themselves (`index.css`, the `--code-*` roles).
//
// ONE MAP, because two would drift: the problem page's blocks and the journey's
// code panel colour the same Python and must colour it identically, or the
// reader learns that a keyword is violet here and something else there.
import { tokenize } from "@/lib/syntax"
import type { Token, TokenKind } from "@/lib/syntax"

/**
 * Four hues and three neutrals. The neutrals are not an afterthought — they
 * are the hierarchy:
 *
 *   - a NAME is the brightest thing in the block, because the function being
 *     defined or called is what the line is about;
 *   - identifiers, operators and punctuation sit at the block's quiet step, so
 *     the shape of the code recedes and its content comes forward;
 *   - a comment is the dimmest text the palette can still call text.
 *
 * All seven are `--code-*` roles, including the three neutrals. They were the
 * page's own `--foreground` / `--muted-foreground` / `--dim` until the imported
 * themes landed — an editor's palette brings its own greys, and a block mixing
 * them with the page's reads as half-converted.
 *
 * `plain` gets no span at all: a token that needs no colour needs no element,
 * and a 600-line block is 600 fewer nodes for it.
 */
const CLASS: Record<Exclude<TokenKind, "plain">, string> = {
  keyword: "text-code-keyword",
  string: "text-code-string",
  number: "text-code-number",
  type: "text-code-type",
  name: "text-code-name",
  comment: "text-code-comment",
}

/** one token's worth of markup, or its bare text when it needs none */
const draw = (t: Token, i: number) =>
  t.kind === "plain" ? (
    t.text
  ) : (
    <span key={i} className={CLASS[t.kind]}>
      {t.text}
    </span>
  )

/**
 * A whole block, coloured. An unknown or missing language renders as one plain
 * run — exactly what the block looked like before any of this existed.
 */
export function Tokens({ code, lang }: { code: string; lang?: string }) {
  return <>{tokenize(code, lang).map(draw)}</>
}

/**
 * ONE LINE of a block, coloured — for a panel that draws each row itself
 * because it lights one of them (the journey's code view). The caller owns the
 * row: its wash, its inset marker, its muting. This owns only what is inside
 * it, so a lit row keeps its background AND its tokens keep their colours — the
 * reader was sent to that line to read it.
 *
 * A component rather than a helper returning markup, because a `.tsx` that
 * exports both components and functions loses fast refresh (`react-refresh`
 * says so, and it is right: the module reloads differently either way).
 */
export function TokenLine({ tokens }: { tokens: Token[] }) {
  return <>{tokens.map(draw)}</>
}
