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

Measured after: **0 nodes below 13px** at home, 2 on the problem page (both
deliberate sub-scale marks), and **0 below WCAG AA** anywhere.

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
| Resting surfaces | A 1px highlight along the top edge, and a shadow with both an offset and a blur | A panel a millimetre above the page. A zero-offset halo would be decoration |
| Floating surfaces | `backdrop-filter: blur(14px)` — sidebar, dialogs, hover-peek rails, the test-case drawer | These sit ON TOP of a stage that is usually mid-animation: opaque would hide it, transparent would be unreadable |
| Where you are | A 2px accent edge on the active rail row plus a 22px glow | The rail is the only place that needs a persistent "you are here" |
| Hover | A 1px lift and a deeper shadow — never a colour change | Colour is load-bearing here (the chip roles); it cannot be spent on hover |
| Arrival | `main` settles in from a 6px blur over 320ms, exponential ease-out | One authored moment, from an already-visible default, so a reader who lands mid-animation still sees the page |

Selection, caret, scrollbars and the focus ring are themed from the palette as
well: they ship with browser defaults that belong to no design system, and they
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

## Containers

Three widths, so a new page has an obvious one to pick.

| Token | Width | For |
|---|---|---|
| `max-w-reading` | 768 px | a single document: a problem, a drill, a flashcard deck |
| `max-w-page` | 1120 px | an index or an overview: home |
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
