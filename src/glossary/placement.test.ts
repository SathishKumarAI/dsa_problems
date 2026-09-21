// WHERE a glossary link is allowed to appear, enforced.
//
// A glossary link names a technique. Put one above the ladder — in the
// statement, a bound's "what it buys", a hint, a pre-solve check — and the
// page has handed a learner the approach the journey is still teaching them
// to earn. That is the disclosure rule in the root `CLAUDE.md`, and it is the
// pedagogy this whole app exists to protect.
//
// Two fields are allowed, and both render strictly below the ladder:
//
//   arc          the ladder renders it only when it is NOT capped
//   costWhy      per rung, inside a rung the ledger has already handed over
//
// The page-level `costWhy` is allowed too: it appears as the orient bar's
// "why?" title and in the calculations band, neither of which names a rung.
//
// Nothing here is a style preference. A link in the wrong field is a spoiler,
// and a spoiler is invisible in a diff.
import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { PROBLEMS } from "../data/index.ts"
import { termLinksIn, termOf } from "./index.ts"

/** every authored string on a problem, with where it renders */
function fieldsOf(p: (typeof PROBLEMS)[number]) {
  const above: [string, string][] = [
    ["brief", p.brief],
    ["statement", p.statement],
    ["approach", p.approach],
    ...p.constraints.map(
      (c, i) => [`constraints[${i}]`, c] as [string, string]
    ),
    ...p.hints.map((h, i) => [`hints[${i}]`, h] as [string, string]),
    ...(p.unlocks ?? []).map(
      (u, i) => [`unlocks[${i}].what`, u.what] as [string, string]
    ),
    ...(p.checks ?? []).flatMap((c, i) => [
      [`checks[${i}].ask`, c.ask] as [string, string],
      [`checks[${i}].because`, c.because] as [string, string],
      ...c.options.map(
        (o, j) => [`checks[${i}].options[${j}]`, o] as [string, string]
      ),
    ]),
    ...(p.examples ?? []).flatMap((e, i) => [
      [`examples[${i}].input`, e.input] as [string, string],
      [`examples[${i}].output`, e.output] as [string, string],
    ]),
  ]
  const below: [string, string][] = [
    ["arc", p.arc ?? ""],
    ["costWhy", p.costWhy ?? ""],
    ["whyNow", p.whyNow ?? ""],
    ...(p.alternatives ?? []).flatMap((a, i) => [
      [`alternatives[${i}].costWhy`, a.costWhy ?? ""] as [string, string],
      [`alternatives[${i}].summary`, a.summary ?? ""] as [string, string],
      [`alternatives[${i}].whyNow`, a.whyNow ?? ""] as [string, string],
    ]),
  ]
  return { above, below }
}

describe("where a glossary link may appear", () => {
  test("no term is linked above the ladder, where it would spoil a journey", () => {
    for (const p of PROBLEMS) {
      for (const [field, text] of fieldsOf(p).above) {
        const links = termLinksIn(text).filter((n) => termOf(n))
        assert.deepEqual(
          links,
          [],
          `${p.id} → ${field} links ${links.join(", ")}. A technique name above the ladder hands the learner the approach the journey is still teaching (CLAUDE.md, the disclosure rule).`
        )
      }
    }
  })

  test("every term linked below the ladder resolves to an entry", () => {
    for (const p of PROBLEMS) {
      for (const [field, text] of fieldsOf(p).below) {
        for (const name of termLinksIn(text)) {
          // an array literal is not a link — the parser requires a letter, and
          // this mirrors that rule so a record cannot smuggle one in
          if (!/^[A-Za-z]/.test(name)) continue
          assert.ok(
            termOf(name),
            `${p.id} → ${field} links [[${name}]], which is not a glossary entry`
          )
        }
      }
    }
  })

  // A page where every occurrence of "hash map" is underlined reads as though
  // a machine did it. The first mention is the one a reader needs.
  test("a field links a term at most once", () => {
    for (const p of PROBLEMS) {
      for (const [field, text] of fieldsOf(p).below) {
        const slugs = termLinksIn(text)
          .map((n) => termOf(n)?.slug)
          .filter(Boolean)
        assert.equal(
          new Set(slugs).size,
          slugs.length,
          `${p.id} → ${field} links the same term twice`
        )
      }
    }
  })

  // The corpus has to actually USE the glossary, or the entries are a list
  // nobody arrives at. A RATCHET: 13 distinct terms are reached today and the
  // floor moves up with the content, never down. Lowering it is how a gate
  // stops meaning anything.
  test("the glossary is reached from the corpus", () => {
    const linked = new Set<string>()
    for (const p of PROBLEMS) {
      for (const [, text] of fieldsOf(p).below) {
        for (const name of termLinksIn(text)) {
          const slug = termOf(name)?.slug
          if (slug) linked.add(slug)
        }
      }
    }
    assert.ok(
      linked.size >= 13,
      `only ${linked.size} distinct terms are linked from any problem — the glossary is a list nobody arrives at`
    )
  })
})
