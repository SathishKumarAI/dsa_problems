# Design system — the decisions, written down

The audit found the interface had conventions but no system: 16 type steps, 10 spacing values, 4
radii and 5 container widths across six surfaces (`UX-AUDIT.md` U6, U12). Nothing looked broken;
everything looked slightly unrelated. This file is the decision, and `src/index.css` is where it
lives in code. When the two disagree, the CSS wins and this file gets fixed in the same commit.

**One rule above all the others:** reach for the **role**, not the size. `text-body` because it is
a sentence someone reads, `text-meta` because it is a label. A raw `text-[13px]` in a component is
how the sixteen steps happened.

## Type

Six steps. Line heights ship with them, so `text-body` is a full type setting, not a size.

| Token | px / line-height | Use it for |
|---|---|---|
| `text-meta` | 13 / 18 | labels, counts, act keys, eyebrow captions, legend entries |
| `text-ui` | 15 / 22 | buttons, controls, table cells, breadcrumbs, subtitles |
| `text-body` | **17 / 28** | anything a learner reads as a sentence: the reading column, dialog prose, quiz and predict questions, corner cases, problem statements, hints |
| `text-narration` | **20 / 31** | the narration line under the stage (`lg` and up; `text-body` below) |
| `text-title` | 28 / 34 | page and act titles |
| `text-display` | 40 / 44 | the equation and the answer on the stage |

**Raised one step on 2026-09-12, and the reason is a measurement rather than a
taste.** Every text node on four routes was read out of a real browser with its
computed size and contrast: **51 of the 121 nodes on the problem page rendered
below 13px**, 35 of 55 on the visualizer, 28 of 64 at home. Nothing was broken —
it was simply small, in a product whose entire job is reading. Every step moved
together, so the ratios between them are unchanged and no component had to be
touched. The same pass converted the **154 remaining raw Tailwind sizes**
(`text-xs`, `text-sm`, `text-2xl`, …) to their roles across 39 files: those were
the real source of the 12px, not the tokens.

Measured after: **0 nodes below 13px on any route** and **0 below WCAG AA**
anywhere. The last three raw sizes went with them — `text-[0.8rem]` in the
shadcn button and toggle `sm` variants, `text-[12.5px]` in the challenge editor
and `text-[13.5px]` in the code panel; the two code surfaces went UP to
`text-ui`, because code here is read at length rather than glanced at. The only
type left below the scale is the 7px ▲ / ✓ in the chip legend, which sits on a
swatch beside its own label and is a mark rather than a word (B58).

## The quiet layer — `text-dim`

`text-muted-foreground` at 7.4:1 is the secondary voice. Below it there was an
OPACITY habit: `text-muted-foreground/40` for an index under a chip, `/50` for a
disabled label. Measured against the real page those render at **1.02:1 to
1.14:1** — not dim, invisible: 13 of the nodes on the problem page.

So the quiet layer is a colour now, not an alpha. `text-dim` is Mocha `overlay2`
(**5.8:1**) and Latte `subtext1` (**5.5:1**) — the dimmest this palette can say
and still be read. Anything quieter than `text-dim` is not text, it is
decoration, and it should be drawn rather than typed.

## The surface — what the room looks like

The palette did not change on 2026-09-12; the light in the room did.

| Layer | What it is | Why |
|---|---|---|
| Page ground | `crust`, with a mauve wash top-left and a blue one bottom-right | A flat fill reads as a document. The two hues are the ones the chip grammar already uses for *focus* and *window*, so the room is lit by the product's own colours |
| Grid | 64px hairlines at 7% of the foreground, masked out below 62% | Depth and scale without competing for attention — felt more than seen |
| Resting surfaces | `--shadow-panel`: a 1px highlight along the top edge, and a shadow with both an offset and a blur | A panel a millimetre above the page. A zero-offset halo would be decoration |
| The one primary surface | `--shadow-raised` on `[data-surface="raised"]`: a tight contact shadow under the near edge PLUS a long soft cast | Two shadows is what separates *lifted* from *outlined*. **One per screen** — home's dock. A second one is a page with no primary |
| Floating surfaces | `backdrop-filter: blur(14px)` — sidebar, dialogs, hover-peek rails, the test-case drawer | These sit ON TOP of a stage that is usually mid-animation: opaque would hide it, transparent would be unreadable |
| Where you are | A 2px accent edge on the active rail row plus a 22px glow | The rail is the only place that needs a persistent "you are here" |
| The rail | A hairline of light down its inner edge, and a shadow cast ACROSS the page | The border alone drew a seam; this draws an edge, and the content column reads as sitting in FRONT of the navigation |
| Hover | A 1px lift and a deeper shadow — never a colour change (`--shadow-lift`) | Colour is load-bearing here (the chip roles); it cannot be spent on hover |
| Arrival | `main` settles in from a 6px blur over 320ms, exponential ease-out | One authored moment, from an already-visible default, so a reader who lands mid-animation still sees the page |
| Per surface | ONE more each: `animate-edge-in-y` (home's dock draws its accent edge) and `animate-edge-in-x` (the pattern page draws a rule under its title) | The same idea both times — an edge drawing itself along a thing that is ALREADY at full opacity. Nothing fades in, so nothing is missed by arriving late |

**Write a transition as longhands, not the `transition:` shorthand.** The
shorthand repeats the duration once per property, so `getComputedStyle` reports
`"0.15s, 0.15s, 0.15s"` and the R6 audit — which compares that string against
the two tokens — fails a page that is in fact using one duration.

And a `transition-*` UTILITY beats anything in `@layer base` whatever the
specificity. `transition-colors` on the cards silently reset
`transition-property` to the colour longhands, so the hover lift documented in
the row above had never once run: measured 2026-09-12, `transitionProperty` was
`"color, background-color, …"` on every card on home. The utilities are gone
from the surfaces that lift.

Selection, caret, `accent-color` (the native checkbox, radio and the speed
range in settings — without it the browser's own blue, the one colour this
palette does not contain), scrollbars and the focus ring are themed from the
palette as well: they ship with browser defaults that belong to no design system, and they
are the cheapest tell that a page was assembled rather than built. Mono numerals
carry `tabular-nums slashed-zero` — every number on the stage is measurement.

## The two faces

| Role | Face | Where |
|---|---|---|
| prose | **Manrope Variable** (`--font-sans`, and `--font-heading` follows it) | anything read as a sentence, every heading, every control label |
| data | **JetBrains Mono Variable** (`--font-mono`) | values, indices, counts, act keys, code blocks, the chip row, notation glyphs |

Both are **self-hosted** through `@fontsource-variable/*`, imported at the top of `src/index.css` —
not a Google Fonts `<link>`. An external stylesheet on the critical path is a render-blocking
request to somebody else's server, and these pages are read offline as often as not. Changing a
face is one npm package plus one line in the `@theme inline` block; nothing in the components names
a font.

The mono stack falls back to `ui-monospace` rather than a generic sans, because every number on the
stage is set in it and the fallback still has to give tabular figures.

Replaced Geist, 2026-09-08.

Mono (`font-mono`) sits **one step below** its sans sibling in the same block — code at `text-ui`
beside body prose, a hash pill at `text-meta` beside a `text-ui` label. Code blocks keep their own
size (13.5 px) because they are read a line at a time, not in paragraphs.

Uppercase labels take `tracking-wide`. Nothing else does.

## Measure

Prose is capped at **`35em`** — about 68 characters at any step, which is inside the 45–75 band.

> `ch` is **not** a character. It is the width of the "0" glyph, roughly 1.3× the average character
> in a proportional face, so a `68ch` cap renders about 90 characters. Use `em` at 0.5 em per
> character. This cost one round trip during U7 and is the kind of thing a system file exists for.

## Shape — how a surface is built

The audit's word for the old home was *the lazy container*: four stacks of
same-size cards, where a journey you were halfway through and a pattern you had
never opened had the same weight, the same width and the same shadow. 1738 px of
page at 1440, and nothing on it said *here*.

Three tiers, and an element picks exactly one:

| Tier | What it is | On home |
|---|---|---|
| **the dock** | ONE raised surface, `[data-surface="raised"]` — the thing you came back to do | resume the started journey, or, when nothing is started, start one. It is never absent: a page whose most important element is conditional has no shape on the day it matters most |
| **rows** | a bordered panel, `divide-y`, one line each, scannable | the journeys in play; the catalogue |
| **a strip** | a single bordered line, its own thing | the algorithm visualizer |

Rules that keep it honest:

- **A card inside a card is always wrong.** A panel holds rows; a row holds
  text. If a row needs a card, it is not a row.
- **A row's progress is its own bottom hairline**, `h-px` at `width: pct%`. At
  0 % it draws nothing, so an untouched list stays quiet instead of showing ten
  empty troughs.
- **Rows tint on hover; surfaces lift.** A row is not a surface — a background
  tint is the right affordance for a line in a list, `--shadow-lift` the right
  one for a panel.

## Containers

Three widths, so a new page has an obvious one to pick.

| Token | Width | For |
|---|---|---|
| `max-w-reading` | 768 px | a single document: a problem, a drill, a flashcard deck |
| `max-w-page` | 1120 px | an index or an overview: home, **a pattern's problem list** |
| `max-w-stage` | 1760 px | the journey and the visualizer, which earn the width |

## Spacing

A **4 px grid**: `1 · 2 · 3 · 4 · 6 · 8 · 12` in Tailwind steps (4, 8, 12, 16, 24, 32, 48 px).
`1.5` (6 px) and `2.5` (10 px) are allowed **inside a compact control** — an icon beside its label,
a chip's inner padding — and nowhere else. `0.5` (2 px) is a hairline, not a gap.

## Radius

Four, all derived from `--radius: 0.625rem`, and nothing arbitrary:

| Token | px | For |
|---|---|---|
| `rounded-sm` | 6 | chips, pills, inline marks |
| `rounded-md` | 8 | buttons, inputs, small controls |
| `rounded-lg` | 10 | panels inside a card, code blocks |
| `rounded-xl` | 14 | cards and the stage |

## Colour

The palette is Catppuccin Mocha, mapped to roles in `src/index.css`; components use the role, never
a hex. `chart-1` mauve is the accent — insight, the current act, links inside the stage. Semantic
colour is separate from the accent and means one thing each:

| Role | Token | Means |
|---|---|---|
| answer, pass, "in final place" | `chart-3` green | this is correct |
| warning, broken promise, swap | `chart-5` red | this is wrong, or it moved |
| held, pivot, anchor | `chart-4` peach | the thing being held |
| current, comparing | `yellow` | the thing being looked at |
| corner case | `teal` | a case you were told to bring |

**Colour is never the only channel.** Every state on the stage also carries a marker (▲), a ring, an
icon (✓) or a fade. Check a change in greyscale before shipping it.

## Motion

**One curve, two durations.** `--default-transition-timing-function` is `cubic-bezier(0.2, 0, 0, 1)`
and `--default-transition-duration` is 150 ms, both set in a plain `@theme` block, so every
transition on the site — including the ones inside shadcn components — takes them without being
asked. A class names a duration only when it differs.

| Token | Value | For |
|---|---|---|
| default | 150 ms | hover, press, focus, any colour change |
| `duration-(--duration-reveal)` | 320 ms | something appearing, resizing or sliding: the drawer, a chip changing role, a bar growing, a revealed act |

A UI check fails the build if any element under `main` on the journey, the visualizer or home uses a
third duration or a second curve.

FLIP is the exception and keeps its own envelope: `clamp(80, delay × 0.4, 280) × motion`, where
motion is the stored preference (calm 0.6 · normal 1 · cinematic 1.8 · off 0), because it has to
track playback speed. `prefers-reduced-motion` forces 0. Two one-off accents — the merge-sort write
pulse (260 ms) and the XOR survivor's beat (520 ms) — are deliberate and say so where they are
defined.

## Targets

24 px is the floor (WCAG 2.5.8). **44 px is the target on touch** — below `lg`, transport buttons
are `h-11 w-11` and a range track is 12 px with a 20 px thumb.

## What this replaced

| Was | Now |
|---|---|
| 16 size/weight pairs on the journey page; 12 px the most common size | six named steps; `text-body` is 16 |
| `text-[15px]`, `text-[11px]`, `text-xs` used as roles | `text-body`, `text-meta`, `text-ui` |
| five container widths (768, 896, 1136, 1280, 1760) | three tokens |
| `max-w-prose` / `68ch` (which renders ~90 characters) | `35em` |
