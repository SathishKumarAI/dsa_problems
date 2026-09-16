// The contrast gate for the figure palette.
//
// Read straight out of `src/index.css` rather than from a copy: a palette test
// that keeps its own values is a test of the copy, and the copy is what drifts.
//
// Why a gate at all. The world this page is built in — viridis for ordered
// data, Okabe–Ito for categorical roles — is chosen because both are
// colour-vision-safe BY CONSTRUCTION. That property is worth nothing if a
// later hand nudges a hue by eye until it looks right on one monitor. The
// donation this borrows is from the direction it beat: solve contrast
// numerically, then publish the number.
import assert from "node:assert/strict"
import { test } from "node:test"
import { readFileSync } from "node:fs"

const css = readFileSync("src/index.css", "utf8")

/** the custom properties of one block, by its selector */
function block(selector: string): Record<string, string> {
  const at = css.indexOf(selector)
  assert.ok(at >= 0, `${selector} not found in index.css`)
  const body = css.slice(at, css.indexOf("\n}", at))
  const out: Record<string, string> = {}
  for (const [, k, v] of body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g))
    out[k] = v
  return out
}

const channel = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4

function luminance(hex: string): number {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h
  const [r, g, b] = (full.match(/../g) ?? [])
    .slice(0, 3)
    .map((x) => channel(parseInt(x, 16) / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const THEMES = [
  { name: "light", selector: ":root {\n  /* ── THE FIGURE PALETTE" },
  { name: "dark", selector: ".dark {" },
]

test("every text role clears WCAG AA on both of its grounds", () => {
  for (const { name, selector } of THEMES) {
    const p = block(selector)
    for (const role of ["--foreground", "--muted-foreground", "--dim"])
      for (const ground of ["--background", "--card"]) {
        const r = contrast(p[role], p[ground])
        assert.ok(
          r >= 4.5,
          `${name}: ${role} on ${ground} is ${r.toFixed(2)}:1, want >= 4.5`
        )
      }
  }
})

test("every chip role is readable on its ground — colour that teaches must be legible", () => {
  for (const { name, selector } of THEMES) {
    const p = block(selector)
    for (const role of ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"]) {
      const r = contrast(p[role], p["--background"])
      assert.ok(
        r >= 4.5,
        `${name}: ${role} is ${r.toFixed(2)}:1 on the ground, want >= 4.5`
      )
    }
  }
})

/** OKLab, so "different enough" is measured the way an eye judges it */
function oklab(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h
  const [r, g, b] = (full.match(/../g) ?? [])
    .slice(0, 3)
    .map((x) => channel(parseInt(x, 16) / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s2 = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s2,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s2,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s2,
  ]
}

const perceptualDistance = (a: string, b: string) => {
  const [l1, a1, b1] = oklab(a)
  const [l2, a2, b2] = oklab(b)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

test("the five chip roles stay distinguishable from each other", () => {
  // Four of them mark cells side by side on the stage. Two roles a reader
  // cannot tell apart are two roles that teach nothing, and a palette can pass
  // every contrast check against the GROUND while failing this.
  for (const { name, selector } of THEMES) {
    const p = block(selector)
    const roles = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"]
    for (let i = 0; i < roles.length; i++)
      for (let j = i + 1; j < roles.length; j++) {
        // OKLab distance, NOT a contrast ratio. Contrast measures luminance
        // only, so it calls orange and blue at the same lightness identical —
        // 1.22:1 — when no reader would confuse them. Distinguishability is a
        // perceptual question and needs a perceptual space.
        const d = perceptualDistance(p[roles[i]], p[roles[j]])
        assert.ok(
          d >= 0.1,
          `${name}: ${roles[i]} and ${roles[j]} are ${d.toFixed(3)} apart in OKLab, want >= 0.1`
        )
      }
  }
})

test("the ordered ramp really is ordered — this is the whole point of viridis", () => {
  // Equal steps in the data are equal steps in PERCEIVED lightness. A ramp
  // whose luminance is not monotonic is five colours, not a scale, and a
  // ladder drawn in it stops reading as a sequence.
  for (const { name, selector } of THEMES) {
    const p = block(selector)
    const ramp = [0, 1, 2, 3, 4].map((i) => p[`--ramp-${i}`])
    assert.ok(ramp.every(Boolean), `${name}: the ramp is incomplete`)
    // Monotonic in ONE direction, either one. Dark mode climbs into the light
    // end of viridis; a light ground has to walk the other way, because the
    // bright end of the map is invisible on white. What matters is that the
    // direction never reverses — a ramp that turns round mid-scale reads as
    // five colours rather than as an order.
    const ls = ramp.map(luminance)
    const rising = ls[1] > ls[0]
    for (let i = 1; i < ls.length; i++)
      assert.ok(
        rising ? ls[i] > ls[i - 1] : ls[i] < ls[i - 1],
        `${name}: the ramp reverses at step ${i} — that is five colours, not a scale`
      )
  }
})
