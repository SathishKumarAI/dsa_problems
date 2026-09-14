// Reading a TypeScript object literal as TEXT, without parsing it.
//
// Two scripts need the same thing and for the same reason: a problem's record
// and its teaching document are both one big literal that has to be split into
// files, and both are mostly template literals holding Python, Java and C++
// whose indentation IS the program. Importing the module and re-serialising it
// would reformat every one of those blocks. So: slice the source.
//
// Everything here is string-and-depth aware, because a `{` inside a C++ block
// is a brace in a program, not structure. That distinction is the whole file.

/**
 * Walk past a string literal that starts at `i`, returning the index after its
 * closing quote. Handles `"`, `'` and backticks, and the escape before either.
 */
function skipString(src, i) {
  const quote = src[i++]
  while (i < src.length) {
    if (src[i] === "\\") i += 2
    else if (src[i] === quote) return i + 1
    else i++
  }
  throw new Error("unterminated string literal")
}

/** past a `//` line comment or a `/* *\/` block comment starting at `i` */
function skipComment(src, i) {
  if (src[i + 1] === "/") {
    while (i < src.length && src[i] !== "\n") i++
    return i
  }
  const end = src.indexOf("*/", i)
  return end === -1 ? src.length : end + 2
}

const isString = (c) => c === '"' || c === "'" || c === "`"
const isComment = (src, i) => src[i] === "/" && (src[i + 1] === "/" || src[i + 1] === "*")

/**
 * The body of the literal a declaration opens — the text between its outermost
 * `{ }` or `[ ]`.
 *
 * `open` says which bracket to expect, so this reads both
 * `export const doc: TeachingDoc = { … }` and an `approaches: [ … ]` array.
 */
export function literalBody(src, declaration, open = "{") {
  const close = open === "{" ? "}" : "]"
  const at = src.search(declaration)
  if (at === -1) throw new Error(`no match for ${declaration}`)
  const start = src.indexOf(open, at)
  if (start === -1) throw new Error(`no ${open} after ${declaration}`)
  let depth = 0
  let i = start
  while (i < src.length) {
    const c = src[i]
    if (isString(c)) {
      i = skipString(src, i)
      continue
    }
    if (isComment(src, i)) {
      i = skipComment(src, i)
      continue
    }
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) return src.slice(start + 1, i)
    }
    i++
  }
  throw new Error(`unbalanced ${open}${close}`)
}

/**
 * Split a literal's body into its top-level entries, as TEXT.
 *
 * Comments above an entry travel WITH it. They are the reasoning, and reasoning
 * that does not move with the code it explains is how a comment starts lying —
 * which this repo has a rule about.
 */
export function entries(body) {
  const out = []
  let depth = 0
  let start = 0
  let i = 0
  while (i < body.length) {
    const c = body[i]
    if (isString(c)) {
      i = skipString(body, i)
      continue
    }
    if (isComment(body, i)) {
      i = skipComment(body, i)
      continue
    }
    if ("{[(".includes(c)) depth++
    else if ("}])".includes(c)) depth--
    else if (c === "," && depth === 0) {
      out.push(body.slice(start, i))
      start = i + 1
    }
    i++
  }
  const tail = body.slice(start)
  if (tail.trim()) out.push(tail)
  return out.map((text) => text.replace(/^\n+/, "").replace(/\s+$/, ""))
}

// Leading comments: however many lines, however indented. The first version
// required each `//` line to be followed immediately by the next with nothing
// between them, which is not how a comment block inside an object literal is
// written — every line after the first is indented. cycle-detect's seven-line
// note above `alternatives:` threw "no key in entry", and it is the only one in
// the corpus that has one.
const LEADING_COMMENTS = /^(?:\s*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/))*\s*/

/** the same split, plus each entry's key — for an object literal */
export function keyedEntries(body) {
  return entries(body).map((text) => {
    const bare = text.replace(LEADING_COMMENTS, "")
    const m = /^\s*(["'`]?)([A-Za-z_]\w*)\1\s*:/.exec(bare)
    if (!m) throw new Error(`no key in entry: ${text.trim().slice(0, 60)}`)
    return { key: m[2], text }
  })
}

/** an entry's value, without its `key:` and without its leading comments */
export function valueOf(entry) {
  const text = typeof entry === "string" ? entry : entry.text
  const comments = LEADING_COMMENTS.exec(text)[0]
  const rest = text.slice(comments.length)
  const m = /^(["'`]?)([A-Za-z_]\w*)\1\s*:\s*([\s\S]*)$/.exec(rest)
  if (!m) throw new Error(`cannot split entry: ${rest.slice(0, 60)}`)
  return { comments: comments.trim(), key: m[2], value: m[3].trim() }
}

/**
 * Take one level of indentation off, WITHOUT touching the inside of a template
 * literal.
 *
 * This is the one operation here that could corrupt content rather than lose
 * it. These literals are mostly `python: \`…\`` blocks whose body lines are
 * written at their REAL indentation, flush with the left margin — so a blanket
 * dedent turns a four-space Python body into a two-space one. That is valid
 * Python which means something else, and nothing in this repo would fail.
 */
export function dedent(text, width = 2) {
  let inTemplate = false
  const strip = new RegExp(`^ {1,${width}}`)
  return text
    .split("\n")
    .map((line) => {
      const out = inTemplate ? line : line.replace(strip, "")
      // a backtick on this line flips the state for the NEXT one; an escaped
      // backtick is a character, not a delimiter
      for (let i = 0; i < line.length; i++) {
        if (line[i] === "\\") i++
        else if (line[i] === "`") inTemplate = !inTemplate
      }
      return out
    })
    .join("\n")
}
