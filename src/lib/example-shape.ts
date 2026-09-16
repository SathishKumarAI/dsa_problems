// An `Example.input` string, read as the arguments it names.
//
// The examples are authored as the problem states them — `nums = [1, 2, 3, 1]`,
// `s = "anagram", t = "nagaram"` — because that is what a reader compares
// against LeetCode. That string is a fine caption and a poor diagram: a reader
// cannot see the array being walked, which is the one thing the page is for.
//
// So it is PARSED, not guessed at. Two rules and no cleverness:
//   * split on commas that are not inside a bracket, brace or quote
//   * each piece is `name = value`; a value in [] or {} is a list, anything
//     else is a scalar
//
// Anything that does not fit BOTH rules returns an empty list and the caller
// falls back to printing the string. That is deliberate: 153 problems state
// their inputs in more shapes than a parser should chase, and a wrong diagram
// is worse than no diagram. `shapeOf` is the guard, not a best effort.
//
// This file owns the reading of one input string. It does not own how the
// values are drawn (`components/example-viewer.tsx`) and knows nothing about
// any algorithm — no argument here is "the array the answer scans".

export type Arg =
  | { name: string; kind: "list"; values: string[] }
  | { name: string; kind: "scalar"; value: string }

/** split on top-level commas — the ones not inside (), [], {} or a quote */
function topLevelSplit(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let quote: string | null = null
  let start = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (quote) {
      if (c === quote && s[i - 1] !== "\\") quote = null
      continue
    }
    if (c === '"' || c === "'") quote = c
    else if (c === "[" || c === "(" || c === "{") depth++
    else if (c === "]" || c === ")" || c === "}") depth--
    else if (c === "," && depth === 0) {
      out.push(s.slice(start, i))
      start = i + 1
    }
  }
  out.push(s.slice(start))
  return out.map((p) => p.trim()).filter(Boolean)
}

const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/

export function shapeOf(input: string): Arg[] {
  const args: Arg[] = []
  for (const piece of topLevelSplit(input)) {
    const eq = piece.indexOf("=")
    // no `=` at all, or an `==` inside an expression: not an argument list
    if (eq < 1 || piece[eq + 1] === "=") return []
    const name = piece.slice(0, eq).trim()
    const value = piece.slice(eq + 1).trim()
    if (!NAME.test(name) || !value) return []
    const list = value.startsWith("[") || value.startsWith("{")
    if (list) {
      const inner = value.slice(1, -1).trim()
      const closed =
        (value.startsWith("[") && value.endsWith("]")) ||
        (value.startsWith("{") && value.endsWith("}"))
      if (!closed) return []
      // a nested list (a grid, a list of pairs) is a shape this row cannot
      // draw; the caller prints the string instead of drawing half of it
      if (inner.includes("[") || inner.includes("{")) return []
      args.push({
        name,
        kind: "list",
        values: inner ? topLevelSplit(inner) : [],
      })
    } else {
      args.push({ name, kind: "scalar", value })
    }
  }
  return args
}

/** the argument a walkthrough steps through: the first and longest list */
export function walkable(args: Arg[]): (Arg & { kind: "list" }) | undefined {
  const lists = args.filter(
    (a): a is Arg & { kind: "list" } => a.kind === "list"
  )
  if (lists.length === 0) return undefined
  return lists.reduce((best, a) =>
    a.values.length > best.values.length ? a : best
  )
}
