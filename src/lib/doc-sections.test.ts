// The check for lib/doc-sections.ts, run against the REAL document — the fold
// deletes content from the page's second region, so the thing that must be
// true is that nothing is lost, and a synthetic fixture cannot prove that.
import assert from "node:assert/strict"
import { test } from "node:test"
import { readFileSync } from "node:fs"
import { parseMarkdown } from "./markdown.ts"
import { foldDoc, foldParts } from "./doc-sections.ts"
import type { Part } from "./teaching-parts.ts"
import bindings from "../data/rung-bindings.json" with { type: "json" }

const DOC = "docs/deep/contains-duplicate_explained.md"
const blocks = parseMarkdown(readFileSync(DOC, "utf8"))
const binding = (bindings as Record<string, (string | null)[]>)[
  "contains-duplicate"
]
const RUNGS = new Set(["brute", "sort", "set"])

test("the binding names one rung per approach section, or null", () => {
  const approaches = blocks.filter(
    (b) => b.kind === "heading" && b.level === 2 && /^approach\b/i.test(b.text)
  )
  assert.equal(
    binding.length,
    approaches.length,
    `the binding has ${binding.length} entries for ${approaches.length} approach sections`
  )
  for (const key of binding)
    assert.ok(
      key === null || RUNGS.has(key),
      `"${key}" is not a rung on this problem's ladder`
    )
})

test("every rung the binding names gets blocks, and they are that rung's", () => {
  const { byRung } = foldDoc(blocks, binding, new Set(["brute", "sort", "set"]))
  for (const key of binding.filter((k): k is string => k !== null)) {
    const got = byRung[key] ?? []
    assert.ok(got.length > 0, `${key}: the fold gave it nothing`)
    // what a rung keeps is the half the ladder does NOT already render
    const heads = got
      .filter((b) => b.kind === "heading")
      .map((b) => (b as { text: string }).text)
    assert.ok(
      heads.includes("Worked example") && heads.includes("Common mistake"),
      `${key}: expected the worked example and the mistake — got ${JSON.stringify(heads)}`
    )
  }
})

test("the three subsections the rung already shows are dropped", () => {
  const { byRung } = foldDoc(blocks, binding, new Set(["brute", "sort", "set"]))
  const heads = Object.values(byRung)
    .flat()
    .filter((b) => b.kind === "heading" && b.level === 3)
    .map((b) => (b as { text: string }).text)
  for (const dup of ["The idea", "Code", "Complexity and when to use this"])
    assert.ok(
      !heads.includes(dup),
      `"${dup}" survived the fold into a rung — the rung renders it already, so this is the duplicate reading`
    )
})

test("an UNBOUND approach keeps all six of its own subsections", () => {
  // it has no rung to be a duplicate of, so dropping its idea or its code
  // would delete the only copy
  const { shared, unbound } = foldDoc(blocks, binding, RUNGS)
  const heads = shared
    .filter((b) => b.kind === "heading" && b.level === 3)
    .map((b) => (b as { text: string }).text)
  for (const kept of ["The idea", "Code"])
    assert.equal(
      heads.filter((h) => h === kept).length,
      unbound.length,
      `expected "${kept}" once per unbound approach (${unbound.length})`
    )
})

test("a rung with no authored costWhy KEEPS the document's complexity section", () => {
  // the whole point of the `hasCost` argument: without it the fold would
  // delete the only account of the cost the page has
  const { byRung } = foldDoc(blocks, binding, new Set())
  const heads = (byRung.brute ?? [])
    .filter((b) => b.kind === "heading")
    .map((b) => (b as { text: string }).text)
  assert.ok(
    heads.includes("Complexity and when to use this"),
    "the cost section was dropped from a rung that does not carry one"
  )
})

test("an unbound approach stays whole, under its own heading", () => {
  const { shared, unbound } = foldDoc(blocks, binding, RUNGS)
  assert.deepEqual(unbound, [2, 4], "expected the two approaches with no rung")
  const heads = shared
    .filter((b) => b.kind === "heading" && b.level === 2)
    .map((b) => (b as { text: string }).text)
  assert.equal(
    heads.filter((h) => /^approach/i.test(h)).length,
    2,
    `expected both unbound approaches kept: ${JSON.stringify(heads)}`
  )
})

test("nothing is lost: every block lands somewhere, or is a known duplicate", () => {
  const { byRung, shared } = foldDoc(blocks, binding, RUNGS)
  const kept = Object.values(byRung).flat().length + shared.length
  // what the fold removes is exactly the dropped `###` headings and their
  // bodies; count them off the original rather than trusting the difference
  let dropped = 0
  let inside = false
  let approach = -1
  for (const b of blocks) {
    if (b.kind === "heading" && b.level === 2) {
      if (/^approach\b/i.test(b.text)) {
        approach += 1
        inside = false
        if (binding[approach] !== null) dropped += 1 // the heading itself
      } else {
        approach = -1
        inside = false
      }
      continue
    }
    if (approach >= 0 && binding[approach] !== null) {
      if (b.kind === "heading" && b.level === 3)
        inside = [
          "The idea",
          "Code",
          "Complexity and when to use this",
        ].includes(b.text)
      if (inside) dropped += 1
    }
  }
  assert.equal(
    kept + dropped,
    blocks.length,
    `${blocks.length} blocks in, ${kept} kept + ${dropped} deliberately dropped`
  )
})

test("the constraints table goes when the page draws the bounds as cards", () => {
  const withCards = foldDoc(blocks, binding, RUNGS, true)
  const without = foldDoc(blocks, binding, RUNGS, false)
  const heads = (f: ReturnType<typeof foldDoc>) =>
    f.shared
      .filter((b) => b.kind === "heading")
      .map((b) => (b as { text: string }).text)
  assert.ok(
    heads(without).includes("The constraints, and what each one unlocks"),
    "without unlocks the document keeps its own table"
  )
  assert.ok(
    !heads(withCards).includes("The constraints, and what each one unlocks"),
    "with unlocks it is the same content twice"
  )
  // exactly one table fewer, and nothing else lost
  const tables = (f: ReturnType<typeof foldDoc>) =>
    f.shared.filter((b) => b.kind === "table").length
  assert.equal(tables(without) - tables(withCards), 1)
  assert.equal(
    without.shared.length - withCards.shared.length,
    2,
    "the heading and its table — and NOT the worked-example note under them"
  )
})

test("…and the note and fence under that heading survive", () => {
  const withCards = foldDoc(blocks, binding, RUNGS, true)
  const text = withCards.shared
    .filter((b) => b.kind === "paragraph")
    .map((b) => (b as { text: string }).text)
    .join(" ")
  assert.match(
    text,
    /worked example traced in every section below/,
    "the document's own note was taken with the table"
  )
  assert.ok(
    withCards.shared.some((b) => b.kind === "code"),
    "the fence under it went too"
  )
})

test("the document's arc is folded onto the ladder, not left as a second ending", () => {
  const withArc = foldDoc(blocks, binding, RUNGS, true, true)
  const without = foldDoc(blocks, binding, RUNGS, true, false)
  const h2s = (f: ReturnType<typeof foldDoc>) =>
    f.shared
      .filter((b) => b.kind === "heading" && b.level === 2)
      .map((b) => (b as { text: string }).text)

  assert.ok(
    h2s(without).some((t) => /overall arc/i.test(t)),
    "without a record arc the document keeps its own section"
  )
  assert.ok(
    !h2s(withArc).some((t) => /overall arc/i.test(t)),
    "with one, two closing arguments run 200 words apart"
  )
  assert.ok(withArc.arc.length > 0, "…and it is COLLECTED, not deleted")
  // nothing vanished: what left `shared` arrived in `arc`, plus its heading
  assert.equal(
    without.shared.length - withArc.shared.length,
    withArc.arc.length + 1,
    "the arc blocks moved; only the heading itself was dropped"
  )
})

// ── the typed half ──────────────────────────────────────────────────────────
//
// Synthetic parts in the exact shape `partsOf` emits: ids `approach-<n>-<slug>-<which>`.
// (`teaching-parts.ts` itself reaches for `@/lib/markdown`, which node cannot
// resolve, so the real builder is exercised by the browser suite instead.)
const typedParts = (): Part[] => [
  {
    id: "understanding",
    title: "Understanding the problem",
    level: 2,
    kind: "prose",
    text: "The question.",
  },
  {
    id: "calculations",
    title: "Reading the calculations",
    level: 2,
    kind: "prose",
    text: "Count it, do not argue it.",
  },
  {
    id: "approach-1-brute-force",
    title: "Approach 1: Brute force",
    level: 2,
    kind: "heading",
  },
  {
    id: "approach-1-brute-force-idea",
    title: "The idea",
    level: 3,
    kind: "prose",
    text: "Every pair.",
  },
  {
    id: "approach-1-brute-force-intuition",
    title: "How to think about it",
    level: 3,
    kind: "prose",
    text: "Two fingers.",
  },
  {
    id: "approach-1-brute-force-worked",
    title: "Worked example",
    level: 3,
    kind: "prose",
    text: "A trace.",
  },
  {
    id: "approach-1-brute-force-code",
    title: "Code",
    level: 3,
    kind: "code",
    code: "def brute(): pass",
  },
  {
    id: "approach-1-brute-force-mistake",
    title: "Common mistake",
    level: 3,
    kind: "prose",
    text: "Off by one.",
  },
  {
    id: "approach-1-brute-force-cost",
    title: "Complexity and when to use this",
    level: 3,
    kind: "prose",
    text: "O(n²).",
  },
  {
    id: "approach-2-counting-sort",
    title: "Approach 2: Counting sort",
    level: 2,
    kind: "heading",
  },
  {
    id: "approach-2-counting-sort-idea",
    title: "The idea",
    level: 3,
    kind: "prose",
    text: "Count them.",
  },
  {
    id: "approach-2-counting-sort-code",
    title: "Code",
    level: 3,
    kind: "code",
    code: "def count(): pass",
  },
  {
    id: "approach-2-counting-sort-cost",
    title: "Complexity and when to use this",
    level: 3,
    kind: "prose",
    text: "O(n + k).",
  },
  {
    id: "approach-2-counting-sort-note-0",
    title: "why it is stable",
    level: 3,
    kind: "prose",
    text: "Because.",
  },
  {
    id: "the-overall-arc",
    title: "The overall arc",
    level: 2,
    kind: "prose",
    text: "One principle.",
  },
  {
    id: "interview-priority",
    title: "Interview priority",
    level: 2,
    kind: "prose",
    text: "Know it cold.",
  },
  {
    id: "full-runnable-script",
    title: "Full runnable script",
    level: 2,
    kind: "prose",
    text: "Every approach.",
  },
  {
    id: "full-runnable-script-code",
    title: "The script",
    level: 3,
    kind: "code",
    code: "print(1)",
    editable: true,
  },
]

test("typed: a carried rung keeps how-to-think, worked and mistake, and drops idea and code", () => {
  const { byRung } = foldParts(
    typedParts(),
    ["brute", "count"],
    new Set(["brute", "count"]),
    new Set(["brute"]),
    true
  )
  const heads = byRung.brute
    .filter((b) => b.kind === "heading")
    .map((b) => b.text)
  assert.deepEqual(heads, [
    "How to think about it",
    "Worked example",
    "Common mistake",
  ])
  assert.ok(
    !byRung.brute.some((b) => b.kind === "code"),
    "the rung's code came back in the fold"
  )
})

test("typed: a rung with no authored costWhy keeps the document's complexity section", () => {
  const { byRung } = foldParts(
    typedParts(),
    ["brute", "count"],
    new Set(["brute", "count"]),
    new Set(["brute"]),
    true
  )
  const heads = byRung.count
    .filter((b) => b.kind === "heading")
    .map((b) => b.text)
  assert.deepEqual(heads, [
    "Complexity and when to use this",
    "why it is stable",
  ])
})

test("typed: an approach the ladder does not carry stays whole, under its own heading", () => {
  const { sections, unbound, byRung } = foldParts(
    typedParts(),
    ["brute", "count"],
    new Set(["brute"]),
    new Set(["brute"]),
    true
  )
  assert.deepEqual(unbound, [1])
  assert.equal(byRung.count, undefined)
  const whole = sections.find((s) => s.title === "Approach 2: Counting sort")
  assert.ok(whole, "the uncarried approach lost its section")
  const heads = whole.blocks
    .filter((b) => b.kind === "heading")
    .map((b) => b.text)
  assert.deepEqual(heads, [
    "The idea",
    "Code",
    "Complexity and when to use this",
    "why it is stable",
  ])
  assert.ok(
    whole.blocks.some(
      (b) => b.kind === "code" && b.code === "def count(): pass"
    )
  )
})

test("typed: the arc folds onto the ladder, the script and its parts stay one section", () => {
  const { arc, sections } = foldParts(
    typedParts(),
    ["brute", "count"],
    new Set(["brute", "count"]),
    new Set(),
    true
  )
  assert.ok(arc.length > 0, "the arc was not collected")
  assert.ok(
    !sections.some((s) => /overall arc/i.test(s.title)),
    "the arc is also a section"
  )
  const script = sections.find((s) => s.title === "Full runnable script")
  assert.ok(
    script?.blocks.some((b) => b.kind === "heading" && b.text === "The script")
  )
  assert.ok(
    script?.blocks.some((b) => b.kind === "code" && b.code === "print(1)")
  )
  assert.deepEqual(
    sections.map((s) => s.title),
    [
      "Understanding the problem",
      "Reading the calculations",
      "Interview priority",
      "Full runnable script",
    ]
  )
})

test("typed: nothing is lost — every part lands in a rung, the arc, or a section", () => {
  const parts = typedParts()
  const { byRung, arc, sections } = foldParts(
    parts,
    ["brute", "count"],
    new Set(["brute", "count"]),
    new Set(["brute"]),
    true
  )
  const texts = [
    ...Object.values(byRung).flat(),
    ...arc,
    ...sections.flatMap((s) => s.blocks),
  ].map((b) =>
    b.kind === "paragraph"
      ? b.text
      : b.kind === "code"
        ? b.code
        : b.kind === "heading"
          ? b.text
          : ""
  )
  const dropped = [
    "Every pair.",
    "def brute(): pass",
    "O(n²).",
    "Count them.",
    "def count(): pass",
  ]
  for (const p of parts) {
    if (p.kind === "heading") continue
    const body = p.kind === "code" ? p.code : "text" in p ? p.text : ""
    const expected = !dropped.includes(body)
    assert.equal(
      texts.some((t) => t.includes(body.split("\n")[0])),
      expected,
      `${p.id}: ${expected ? "lost" : "a known duplicate came back"}`
    )
  }
})
