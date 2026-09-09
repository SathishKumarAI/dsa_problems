// The six named type steps are `text-<word>`, and so is every named colour.
// tailwind-merge files an unknown `text-<word>` under COLOUR, so a size and a
// colour in the same `cn()` looked like a conflict and the size lost — silently,
// with no build error and no visual clue beyond "that looks a bit big".
//
// Measured on 2026-09-09 before the fix: the algorithm visualizer's bar labels
// rendered at 16px inheriting rather than the 12px they asked for, and the
// answer panel's `text-display` never applied.
import test from "node:test"
import assert from "node:assert/strict"
import { cn } from "./utils.ts"

test("a named type step survives being merged with a colour", () => {
  for (const step of [
    "text-meta",
    "text-ui",
    "text-body",
    "text-narration",
    "text-title",
    "text-display",
  ]) {
    const out = cn(step, "text-muted-foreground")
    assert.ok(out.includes(step), `${step} was dropped: "${out}"`)
    assert.ok(out.includes("text-muted-foreground"), out)
  }
})

test("two named type steps still conflict, and the last one wins", () => {
  assert.equal(cn("text-meta", "text-title"), "text-title")
})

test("a size still beats an arbitrary one, both ways round", () => {
  assert.equal(cn("text-[10px]", "text-meta"), "text-meta")
  assert.equal(cn("text-meta", "text-[10px]"), "text-[10px]")
})
