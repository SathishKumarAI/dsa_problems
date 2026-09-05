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
| `text-meta` | 12 / 16 | labels, counts, act keys, eyebrow captions, legend entries |
| `text-ui` | 14 / 20 | buttons, controls, table cells, breadcrumbs, subtitles |
| `text-body` | **16 / 26** | anything a learner reads as a sentence: the reading column, dialog prose, quiz and predict questions, corner cases, problem statements, hints |
| `text-narration` | **19 / 30** | the narration line under the stage (`lg` and up; `text-body` below) |
| `text-title` | 24 / 30 | page and act titles |
| `text-display` | 32 / 38 | the equation and the answer on the stage |

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

FLIP duration is `clamp(80, delay × 0.4, 280) × motion`, where motion is the stored preference
(calm 0.6 · normal 1 · cinematic 1.8 · off 0). `prefers-reduced-motion` forces 0. A one-off
animation (the merge-sort write pulse, 260 ms) stays inside that envelope and skips itself when the
preference is `off`.

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
