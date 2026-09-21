// The glossary's gate.
//
// A glossary rots in three specific ways, and each of them is a test here:
// a `[[link]]` whose target was renamed, an entry that is a definition with no
// consequence, and a "source" that cannot be checked. None of those is visible
// in a diff — the page renders, the word is underlined, and the link goes
// nowhere — which is exactly the class of defect this repo writes gates for.
//
// What it does NOT do is fetch the reading URLs. A test that needs the network
// fails on a train; the URLs are checked by hand when an entry is written and
// by `scripts/check-links.mjs` on demand. What is enforced here is that every
// one is an absolute https URL with no duplicate inside an entry.
import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { TERMS, TOPICS, backlinksOf, termLinksIn, termOf } from "./index.ts"

const ALL_PROSE = (t: (typeof TERMS)[number]) =>
  [t.short, ...t.body, t.trap ?? "", ...(t.costs ?? []).map((c) => `${c.op} ${c.unless ?? ""}`)]

describe("glossary", () => {
  test("every slug is unique, and so is every alias", () => {
    const seen = new Map<string, string>()
    for (const t of TERMS) {
      for (const k of [t.slug, t.term, ...(t.aliases ?? [])]) {
        const key = k.toLowerCase().replace(/[\s_]+/g, "-")
        const owner = seen.get(key)
        // An entry colliding with ITSELF is fine and common: "hash map" and
        // the slug `hash-map` normalise to the same key. Two DIFFERENT entries
        // claiming one word is the bug — `[[…]]` would resolve to whichever
        // file loaded last.
        assert.ok(
          owner === undefined || owner === t.slug,
          `"${k}" is claimed by both ${owner} and ${t.slug}`
        )
        seen.set(key, t.slug)
      }
    }
  })

  test("every [[link]] in any prose resolves to an entry", () => {
    for (const t of TERMS) {
      for (const text of ALL_PROSE(t)) {
        for (const name of termLinksIn(text)) {
          assert.ok(
            termOf(name),
            `${t.slug} links to [[${name}]], which is not an entry`
          )
        }
      }
    }
  })

  test("no entry links to itself — a definition that cites itself says nothing", () => {
    for (const t of TERMS) {
      for (const text of ALL_PROSE(t)) {
        for (const name of termLinksIn(text)) {
          assert.notEqual(
            termOf(name)?.slug,
            t.slug,
            `${t.slug} links to itself`
          )
        }
      }
    }
  })

  test("every see-also names an entry that exists", () => {
    for (const t of TERMS) {
      for (const s of t.seeAlso ?? []) {
        assert.ok(termOf(s), `${t.slug} sees also "${s}", which is not an entry`)
      }
    }
  })

  // The popover shows `short` and nothing else. It has to stand alone: a
  // reader who reads only that sentence must not be misled, and a sentence
  // that ends in a colon or says "see below" fails that on its face.
  test("the one-line definition stands alone", () => {
    for (const t of TERMS) {
      assert.ok(
        t.short.length >= 60,
        `${t.slug}: the one-liner is ${t.short.length} chars — too short to define anything`
      )
      assert.ok(
        t.short.length <= 260,
        `${t.slug}: the one-liner is ${t.short.length} chars — too long for a popover`
      )
      assert.ok(
        /[.!?]$/.test(t.short.trim()),
        `${t.slug}: the one-liner is not a sentence`
      )
      assert.ok(
        !/see (below|the page)/i.test(t.short),
        `${t.slug}: the one-liner defers instead of defining`
      )
    }
  })

  test("an entry says something beyond its own definition", () => {
    for (const t of TERMS) {
      assert.ok(
        t.body.length >= 2,
        `${t.slug} has ${t.body.length} paragraph(s) — an entry with no consequence is a dictionary, not a glossary`
      )
    }
  })

  // A bound with no stated exception is the failure this repo has already
  // paid for on the approach ladder: the reader trusts it in the one place it
  // does not hold. Every cost table must state at least one `unless`.
  test("a cost table names at least one case that breaks a bound", () => {
    for (const t of TERMS) {
      if (!t.costs?.length) continue
      assert.ok(
        t.costs.some((c) => c.unless),
        `${t.slug}: every bound in the table is unconditional — name the case that breaks one`
      )
    }
  })

  test("every reading link is an absolute https URL, listed once", () => {
    for (const t of TERMS) {
      const urls = (t.reading ?? []).map((r) => r.url)
      for (const u of urls) {
        assert.match(u, /^https:\/\//, `${t.slug}: "${u}" is not an https URL`)
      }
      assert.equal(
        new Set(urls).size,
        urls.length,
        `${t.slug} lists the same URL twice`
      )
    }
  })

  test("every entry belongs to exactly one topic", () => {
    const counted = TOPICS.flatMap((t) => t.terms)
    assert.equal(counted.length, TERMS.length)
    assert.equal(new Set(counted.map((t) => t.slug)).size, TERMS.length)
  })

  // What links here is COMPUTED. This proves it reads the prose rather than
  // an authored list — the thing that makes the backlinks trustworthy.
  test("what-links-here finds a link that exists and invents none", () => {
    const back = backlinksOf("hash-map")
    assert.ok(
      back.terms.some((t) => t.slug === "collision"),
      "collision links to [[hash map]] and was not found"
    )
    assert.ok(
      !back.terms.some((t) => t.slug === "hash-map"),
      "an entry was listed as linking to itself"
    )
    const pages = backlinksOf("hash-map", [
      { id: "x", title: "X", text: "uses a [[hash map]] to do it" },
      { id: "y", title: "Y", text: "mentions a hash map in plain prose" },
    ]).pages
    assert.deepEqual(
      pages.map((p) => p.id),
      ["x"],
      "a page was matched on the WORD rather than on an authored link"
    )
  })

  test("an alias resolves, and an unknown word resolves to nothing", () => {
    assert.equal(termOf("hash table")?.slug, "hash-map")
    assert.equal(termOf("Hash Table")?.slug, "hash-map")
    assert.equal(termOf("dict")?.slug, "hash-map")
    assert.equal(termOf("quantum-sort"), undefined)
  })
})
