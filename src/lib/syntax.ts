// A lexer for the four languages this site teaches in, so code reads as code.
//
// Owns: splitting a block of source into tokens with a ROLE. Owns nothing
// about colour (that is `index.css`) and nothing about markup (that is
// `components/code-tokens.tsx`).
//
// WHY NOT A HIGHLIGHTER DEPENDENCY. Shiki is a WASM engine plus a grammar per
// language; Prism with four languages is ~25 KB gzipped. The bundle here is
// already the thing that got audited down 76% (B95), and the code on this site
// is TEACHING code: four languages, no macros, no JSX, no template DSLs. A
// lexer is the smaller answer — and it is a lexer rather than a pile of
// regexes over the whole string, because scanning left to right is the only
// way a `#` inside a string stays a `#` and a `'{'` stays a character literal.
// The repo's own rule says it: to find code, parse it.
//
// JSON-safe and DOM-free, so a node test can hold it (`syntax.test.ts`), and
// the invariant that test leans on is: the tokens concatenate back to exactly
// the input, character for character. A highlighter that loses a character is
// worse than no highlighter.

/** what a token IS, which is what decides its colour */
export type TokenKind =
  /** `def`, `if`, `return`, `SELECT` — the language's own words */
  | "keyword"
  /** a string or character literal, with its quotes and prefix */
  | "string"
  /** a numeric literal */
  | "number"
  /** a comment, including its marker */
  | "comment"
  /** a type or a built-in: `int`, `vector`, `len`, `String` */
  | "type"
  /** the name being defined or called — the subject of the line */
  | "name"
  /** everything else: identifiers, operators, punctuation, whitespace */
  | "plain"

export interface Token {
  kind: TokenKind
  text: string
}

interface Lang {
  /** line comment markers */
  line: string[]
  /** block comment pairs */
  block: [string, string][]
  /** quote marks that open a string; longest first, so `"""` beats `"` */
  quotes: string[]
  /** a letter that may prefix a quote: python's f/r/b, C++'s R */
  prefixes: RegExp
  keywords: Set<string>
  types: Set<string>
  /** keywords are case-insensitive (SQL) */
  fold?: boolean
}

const set = (s: string) => new Set(s.split(/\s+/).filter(Boolean))

const PYTHON: Lang = {
  line: ["#"],
  block: [],
  // triple quotes FIRST: a docstring opens with `"""`, and matching `"` first
  // would close it on its own second character
  quotes: ['"""', "'''", '"', "'"],
  prefixes: /[fFrRbBuU]{0,2}$/,
  keywords: set(`
    def class lambda return yield if elif else for while break continue pass
    import from as with try except finally raise assert del global nonlocal
    and or not in is None True False async await match case
  `),
  types: set(`
    int float str bool bytes list dict set tuple frozenset complex object
    len range enumerate zip sorted reversed min max sum abs all any map filter
    print isinstance type input open round divmod pow iter next format repr
    List Dict Set Tuple Optional Iterable Sequence Counter defaultdict deque
    heapq bisect math itertools self cls
  `),
}

const JAVA: Lang = {
  line: ["//"],
  block: [["/*", "*/"]],
  quotes: ['"', "'"],
  prefixes: /$^/,
  keywords: set(`
    public private protected static final abstract synchronized native
    class interface enum extends implements package import new return
    if else for while do switch case default break continue
    try catch finally throw throws instanceof this super
    null true false void record sealed yield var
  `),
  types: set(`
    int long short byte double float char boolean String Integer Long Double
    Character Boolean Object List ArrayList LinkedList Map HashMap TreeMap
    LinkedHashMap Set HashSet TreeSet LinkedHashSet Queue Deque ArrayDeque
    PriorityQueue Stack Iterator Comparator Collections Arrays Math
    StringBuilder Optional Stream IntStream Function Entry
  `),
}

const CPP: Lang = {
  line: ["//"],
  block: [["/*", "*/"]],
  quotes: ['"', "'"],
  prefixes: /[uULR]{0,2}8?$/,
  keywords: set(`
    class struct union enum namespace using template typename typedef
    public private protected virtual override final explicit friend operator
    new delete return if else for while do switch case default break continue
    goto try catch throw noexcept static const constexpr consteval mutable
    inline extern volatile this nullptr true false sizeof decltype
    auto static_cast dynamic_cast const_cast reinterpret_cast
  `),
  types: set(`
    int long short char bool float double void unsigned signed size_t
    string wstring vector array deque forward_list map unordered_map
    set unordered_set multiset multimap pair tuple stack queue priority_queue
    bitset optional variant shared_ptr unique_ptr function std
    int32_t int64_t uint32_t uint64_t ptrdiff_t ostream istream
  `),
}

const SQL: Lang = {
  line: ["--"],
  block: [["/*", "*/"]],
  quotes: ['"', "'", "`"],
  prefixes: /$^/,
  fold: true,
  keywords: set(`
    select from where group by order having limit offset as and or not null
    is in exists between like ilike union all distinct case when then else end
    join inner left right full outer cross on using insert into values update
    set delete create table view index drop alter add primary key foreign
    references with recursive over partition rows range unbounded preceding
    following current row asc desc if nulls first last returning
  `),
  types: set(`
    count sum avg min max round coalesce nullif cast concat substring length
    row_number rank dense_rank lag lead first_value last_value ntile
    date datetime timestamp int integer bigint smallint decimal numeric real
    double float char varchar text boolean json interval extract now
  `),
}

const LANGS: Record<string, Lang> = {
  python: PYTHON,
  py: PYTHON,
  java: JAVA,
  cpp: CPP,
  "c++": CPP,
  c: CPP,
  sql: SQL,
}

/** the language a block is tagged with, or null for "do not colour this" */
function langOf(tag?: string): Lang | null {
  if (!tag) return null
  return LANGS[tag.trim().toLowerCase()] ?? null
}

/** whether a tag is one this lexer knows — for a caller deciding what to draw */
export const colourable = (tag?: string) => langOf(tag) !== null

const isWordStart = (c: string) => /[A-Za-z_$]/.test(c)
const isWord = (c: string) => /[A-Za-z0-9_$]/.test(c)
const isDigit = (c: string) => c >= "0" && c <= "9"

/**
 * Split source into tokens.
 *
 * One pass, left to right, longest match first. An unknown or absent language
 * returns the whole block as one `plain` token, which renders exactly as it did
 * before any of this existed.
 */
export function tokenize(code: string, tag?: string): Token[] {
  const lang = langOf(tag)
  if (!lang) return code ? [{ kind: "plain", text: code }] : []

  const out: Token[] = []
  // runs of plain text accumulate, so `a + b` is one token rather than five
  let plain = ""
  const flush = () => {
    if (plain) out.push({ kind: "plain", text: plain })
    plain = ""
  }
  const push = (kind: TokenKind, text: string) => {
    flush()
    out.push({ kind, text })
  }

  let i = 0
  while (i < code.length) {
    const rest = code.slice(i)

    // ── comments ────────────────────────────────────────────────────────
    const line = lang.line.find((m) => rest.startsWith(m))
    if (line) {
      const nl = code.indexOf("\n", i)
      const end = nl === -1 ? code.length : nl
      push("comment", code.slice(i, end))
      i = end
      continue
    }
    const blk = lang.block.find(([open]) => rest.startsWith(open))
    if (blk) {
      const close = code.indexOf(blk[1], i + blk[0].length)
      const end = close === -1 ? code.length : close + blk[1].length
      push("comment", code.slice(i, end))
      i = end
      continue
    }

    // ── strings ─────────────────────────────────────────────────────────
    const quote = lang.quotes.find((q) => rest.startsWith(q))
    if (quote) {
      // a prefix already sits in `plain` (python's f, C++'s R) and belongs to
      // the literal, not to the identifier before it
      const pre = lang.prefixes.exec(plain)?.[0] ?? ""
      if (pre) plain = plain.slice(0, plain.length - pre.length)
      let j = i + quote.length
      while (j < code.length) {
        if (code[j] === "\\") {
          j += 2
          continue
        }
        if (code.startsWith(quote, j)) {
          j += quote.length
          break
        }
        // a single-quoted string does not cross a line in any of these four
        // languages, and an unterminated quote would otherwise paint the whole
        // rest of the block as a string
        if (code[j] === "\n" && quote.length === 1) break
        j++
      }
      push("string", pre + code.slice(i, Math.min(j, code.length)))
      i = Math.min(j, code.length)
      continue
    }

    // ── numbers ─────────────────────────────────────────────────────────
    // `.5` counts; a digit after a word character does not — it belongs to the
    // identifier it is inside (`int32_t`, `v2`)
    if (isDigit(code[i]) || (code[i] === "." && isDigit(code[i + 1]))) {
      if (isWord(code[i - 1] ?? " ")) {
        plain += code[i++]
        continue
      }
      let j = i
      while (j < code.length && /[0-9a-fA-FxXoObB._']/.test(code[j])) j++
      // an exponent's sign (`1e-9`), then C++'s suffixes (`1LL`, `2.0f`)
      if (/[eEpP]/.test(code[j - 1] ?? "") && /[+-]/.test(code[j] ?? "")) {
        j++
        while (j < code.length && /[0-9a-zA-Z]/.test(code[j])) j++
      }
      while (j < code.length && /[uUlLfF]/.test(code[j])) j++
      push("number", code.slice(i, j))
      i = j
      continue
    }

    // ── words ───────────────────────────────────────────────────────────
    if (isWordStart(code[i])) {
      let j = i
      while (j < code.length && isWord(code[j])) j++
      const word = code.slice(i, j)
      const key = lang.fold ? word.toLowerCase() : word
      // A NAME IS DECIDED BY WHAT FOLLOWS IT — a call's open paren — or by a
      // declaring keyword before it. Lexical, which is as far as a lexer can
      // honestly go, and it is where the eye looks anyway.
      const called = /^\s*\(/.test(code.slice(j))
      const declared =
        /\b(?:def|class|struct|interface|enum|namespace)\s+$/.test(
          code.slice(Math.max(0, i - 24), i)
        )
      const kind: TokenKind = lang.keywords.has(key)
        ? "keyword"
        : lang.types.has(key)
          ? "type"
          : declared || called
            ? "name"
            : "plain"
      if (kind === "plain") plain += word
      else push(kind, word)
      i = j
      continue
    }

    plain += code[i++]
  }
  flush()
  return out
}

/**
 * The same tokens, split into lines — for a panel that lights one row at a
 * time (the journey's code view, where the lit row is the teaching).
 *
 * A token may span lines (a block comment, a docstring), so it is cut at each
 * newline and keeps its kind on both sides.
 */
export function tokenizeLines(code: string, tag?: string): Token[][] {
  const lines: Token[][] = [[]]
  for (const t of tokenize(code, tag)) {
    const parts = t.text.split("\n")
    parts.forEach((part, k) => {
      if (k > 0) lines.push([])
      if (part) lines[lines.length - 1].push({ kind: t.kind, text: part })
    })
  }
  return lines
}
