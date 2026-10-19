// The lexer's gate. Every case here is a way a highlighter goes wrong that
// LOOKS right in a screenshot of some other block.
import assert from "node:assert/strict"
import { test } from "node:test"
import { tokenize, tokenizeLines, colourable } from "./syntax.ts"
import { PROBLEMS } from "../data/index.ts"

const kinds = (code: string, lang: string) =>
  tokenize(code, lang).map((t) => `${t.kind}:${t.text}`)

const find = (code: string, lang: string, text: string) =>
  tokenize(code, lang).find((t) => t.text === text)?.kind

test("the tokens put the source back together, character for character", () => {
  // THE INVARIANT EVERYTHING ELSE RESTS ON. A highlighter that drops a
  // character renders code that does not compile, and the reader has no way to
  // know which side is wrong.
  let blocks = 0
  for (const p of PROBLEMS) {
    const rungs = [
      { python: p.python, java: p.java, cpp: p.cpp },
      ...(p.alternatives ?? []),
    ]
    for (const r of rungs)
      for (const lang of ["python", "java", "cpp"] as const) {
        const code = r[lang]
        if (typeof code !== "string" || !code) continue
        blocks++
        assert.equal(
          tokenize(code, lang)
            .map((t) => t.text)
            .join(""),
          code,
          `${p.id} ${lang}: the lexer lost or gained a character`
        )
      }
  }
  // the count is the coverage: a run that tokenised nothing passes vacuously
  assert.ok(blocks > 500, `only ${blocks} code blocks reached the lexer`)
})

test("a # inside a string is not a comment, and a quote inside a comment is not a string", () => {
  assert.deepEqual(kinds('s = "a#b"', "python"), ["plain:s = ", 'string:"a#b"'])
  // the comment runs to the end of the line and takes the apostrophe with it
  assert.deepEqual(kinds("x = 1  # don't split here", "python"), [
    "plain:x = ",
    "number:1",
    "plain:  ",
    "comment:# don't split here",
  ])
})

test("a brace in a character literal is a string, not structure", () => {
  // The repo has been bitten twice by counting `'{'` as a brace (problems.test
  // and localsmith/run.mjs). A lexer is the answer, so it had better be right.
  assert.equal(find("if (ch == '{') depth++;", "cpp", "'{'"), "string")
  assert.equal(find('if (ch == "{") depth++;', "java", '"{"'), "string")
})

test("a docstring is one token, and does not end on its own second quote", () => {
  const code = '"""Two sums.\n\nReturns indices.\n"""\nx = 1'
  const first = tokenize(code, "python")[0]
  assert.equal(first.kind, "string")
  assert.equal(
    first.text,
    '"""Two sums.\n\nReturns indices.\n"""',
    'the docstring was cut short — `"` matched before `"""`'
  )
})

test("an f-string keeps its prefix, and the identifier before it keeps its own letters", () => {
  assert.deepEqual(kinds('msg = f"n={n}"', "python"), [
    "plain:msg = ",
    'string:f"n={n}"',
  ])
  // A BUILT-IN BEATS A CALL. `len(` is `len`, not "some name being called" —
  // the eye should see the same colour for `len` wherever it appears. And the
  // `f` ending `self` is not a string prefix: the prefix only comes off a run
  // that is about to meet a quote.
  assert.deepEqual(kinds('len("ab")', "python"), [
    "type:len",
    "plain:(",
    'string:"ab"',
    "plain:)",
  ])
  assert.deepEqual(kinds('self.seen = f"{x}"', "python"), [
    "type:self",
    "plain:.seen = ",
    'string:f"{x}"',
  ])
})

test("a number is a number, and a digit inside a name is not", () => {
  assert.equal(find("x = 1e-9", "python", "1e-9"), "number")
  assert.equal(find("0xff | 0b1010", "cpp", "0xff"), "number")
  assert.equal(find("long n = 1LL;", "cpp", "1LL"), "number")
  assert.equal(find("int32_t v2 = 0;", "cpp", "int32_t"), "type")
  // `v2` is an identifier: plain, and in ONE token with what surrounds it
  assert.ok(
    tokenize("int32_t v2 = 0;", "cpp").some(
      (t) => t.kind === "plain" && t.text.includes("v2")
    ),
    "the 2 of v2 was torn off as a number"
  )
})

test("a name is the thing being called or defined", () => {
  assert.equal(find("def two_sum(nums):", "python", "two_sum"), "name")
  assert.equal(find("class Solution:", "python", "Solution"), "name")
  assert.equal(find("seen.add(x)", "python", "add"), "name")
  // a bare identifier is not a name — it is the plain run
  assert.equal(find("total = 0", "python", "total"), undefined)
})

test("SQL keywords are case-insensitive, and its -- is a comment", () => {
  assert.equal(find("SELECT id FROM t", "sql", "SELECT"), "keyword")
  assert.equal(find("select id from t", "sql", "select"), "keyword")
  assert.equal(find("count(*)", "sql", "count"), "type")
  assert.deepEqual(kinds("-- why\nx", "sql"), ["comment:-- why", "plain:\nx"])
})

test("an untagged or unknown block is left exactly as it was", () => {
  assert.equal(colourable(undefined), false)
  assert.equal(colourable("rust"), false)
  assert.equal(colourable("Python"), true)
  assert.deepEqual(kinds("def f(): pass", ""), ["plain:def f(): pass"])
})

test("a block comment that is never closed ends at the end of the block", () => {
  const out = tokenize("/* open\nint x = 1;", "cpp")
  assert.equal(out.length, 1)
  assert.equal(out[0].kind, "comment")
})

test("the lines split where the source does, and a docstring keeps its kind on every one", () => {
  const lines = tokenizeLines('"""a\nb"""\nx = 1', "python")
  assert.equal(lines.length, 3)
  assert.deepEqual(
    lines.map((l) => l.map((t) => t.kind)),
    [["string"], ["string"], ["plain", "number"]]
  )
  // and the text of each line is the line
  assert.deepEqual(
    lines.map((l) => l.map((t) => t.text).join("")),
    ['"""a', 'b"""', "x = 1"]
  )
})

test("an empty line survives as an empty line", () => {
  assert.equal(tokenizeLines("a\n\nb", "python").length, 3)
})
