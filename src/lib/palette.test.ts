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
import { readFileSync, readdirSync } from "node:fs"

const css = readFileSync("src/index.css", "utf8")

/** the custom properties of one block, by its selector */
function block(selector: string): Record<string, string> {
  const at = css.indexOf(selector)
  assert.ok(at >= 0, `${selector} not found in index.css`)
  const body = css.slice(at, css.indexOf("\n}", at))
  const out: Record<string, string> = {}
  for (const [, k, v] of body.matchAll(
    /(--[\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g
  ))
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
    for (const role of [
      "--chart-1",
      "--chart-2",
      "--chart-3",
      "--chart-4",
      "--chart-5",
    ]) {
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
    const roles = [
      "--chart-1",
      "--chart-2",
      "--chart-3",
      "--chart-4",
      "--chart-5",
    ]
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

// ── chrome may not borrow a data colour ──────────────────────────────────
//
// The rule the world rests on: HUE MEANS DATA. A cell is orange because it is
// the focus; a bar is dark because it is the largest. Hover, focus, selection
// and "you are here" are none of those things — they are the interface talking
// about itself, and drawing them in a role colour makes the page say "focus"
// in a place where nothing is focused.
//
// It is enforced here because it is exactly the rule that erodes by hand. The
// largest offender when this was written was the page's own background wash,
// painted in a gradient of `--chart-1` and `--chart-2` — the focus and window
// hues, spread across the biggest surface on the screen. Nobody sees a wash
// and thinks "that is data", which is precisely why it survived.

const SRC = "src"

/** every `.tsx` under src, as [path, text] */
function sources(): [string, string][] {
  const out: [string, string][] = []
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`
      if (e.isDirectory()) walk(p)
      else if (e.name.endsWith(".tsx")) out.push([p, readFileSync(p, "utf8")])
    }
  }
  walk(SRC)
  return out
}

test("no interaction state is painted in a data colour", () => {
  // Mechanical half of the rule, and the half that drifts: a `hover:` or
  // `focus-visible:` variant naming a chart role. `--edge` exists so there is
  // somewhere right to put these, which is what makes the ban enforceable
  // rather than merely disapproving.
  const offenders: string[] = []
  for (const [path, text] of sources())
    for (const [m] of text.matchAll(
      /(hover|focus|focus-visible|active|group-hover):[\w-]*-chart-\d/g
    ))
      offenders.push(`${path}: ${m}`)
  assert.deepEqual(
    offenders,
    [],
    "interaction states belong on --edge, not on a data role"
  )
})

test("chrome's accent is not one of the data colours", () => {
  // `--edge` and `--ring` are the interface's own voice. If either is ever set
  // to a chart value the rule has been kept in the markup and lost in the
  // token, which is the harder version to see.
  for (const { name, selector } of THEMES) {
    const p = block(selector)
    const data = [1, 2, 3, 4, 5]
      .map((i) => p[`--chart-${i}`])
      .concat([0, 1, 2, 3, 4].map((i) => p[`--ramp-${i}`]))
      .filter(Boolean)
      .map((v) => v.toLowerCase())
    for (const key of ["--edge", "--ring"]) {
      assert.ok(p[key], `${name}: ${key} is missing`)
      assert.ok(
        !data.includes(p[key].toLowerCase()),
        `${name}: ${key} is a data colour — chrome may not borrow one`
      )
      // WCAG 1.4.11: a non-text UI indicator needs 3:1 against its ground.
      // A focus ring that clears the rule by hue alone is a focus ring that
      // vanishes on the display it was not designed on.
      const r = contrast(p[key], p["--background"])
      assert.ok(
        r >= 3,
        `${name}: ${key} is ${r.toFixed(2)}:1 against the ground, needs 3`
      )
    }
  }
})
