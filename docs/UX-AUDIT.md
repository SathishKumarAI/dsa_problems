# UI/UX audit — 2026-09-05

Every screen of the app, measured rather than eyeballed. Numbers come from the built app
(`vite preview`) driven over the DevTools protocol at 1440 × 1000, 1024 × 800 and 390 × 844, with
a seeded ledger (three journeys finished, 140 XP) so nothing was hidden behind a lock.

Findings are ranked by what they cost the learner, not by how easy they are to fix. Each one has
the evidence, the reasoning, the fix with real values, and an effort estimate. They are filed as
**U1–U14** in [`BACKLOG.md`](BACKLOG.md).

---

## 1. How this was measured, including what I got wrong

| Measured | How |
|---|---|
| Contrast | Every element with its own text: composite the text colour **and every ancestor background** onto a 1 × 1 canvas, read the pixel, compute WCAG 2.1 ratio against the composited background. 97–135 text nodes per route. |
| Focus visibility | Real `Tab` keypresses through CDP `Input.dispatchKeyEvent`, then read `:focus-visible` state and the computed outline/ring on `document.activeElement`. 26 stops. |
| Type scale | Every rendered `font-size`/`font-weight` pair, counted. |
| Spacing, radii, shadows | Every computed `gap`, `padding-top`, `padding-left`, `margin-top`, `border-radius`, `box-shadow`, counted. |
| Line length | Rendered width ÷ (font-size × 0.5) for every paragraph over 60 characters. |
| Targets | Bounding boxes of every button, link, input, select and tab. |
| Layout | Container widths, scroll heights, and whether the page scrolls sideways. |

**Two measurements were wrong on the first pass, and the corrected numbers changed the
conclusions.** Worth recording, because both mistakes are easy to repeat:

1. **Contrast.** The palette computes to `oklab()` with alpha. Parsing those numbers as RGB
   produced ratios like `1.12` and a scary list of "failures" — all fictional. Compositing on a
   canvas is the only honest way to ask "what does the eye actually see".
2. **Focus.** Calling `element.focus()` does not set `:focus-visible` — that state depends on the
   input modality. The first pass reported *40 of 40 controls have no focus indicator*, which was
   false. Real `Tab` presses show **26 of 26 stops have a visible ring**.

If a check tells you everything is broken, suspect the check first.

---

## 2. The verdict

The **stage is genuinely good**: the chip grammar carries state in three channels (fill, marker,
icon) so it survives colourblindness and greyscale, motion is continuous, and the hash-map
"iceberg" is a real piece of information design rather than decoration. The accessibility floor is
solid — a median contrast of **8.4 : 1**, one failing string in the whole app, and a focus ring on
every single tab stop.

What holds it back is **not the pixels, it is the frame around them**. Three problems repeat on
every surface:

- **The reading is small and the measure is long.** The most common text size in the app is 12 px
  (32 occurrences on the journey page); the problem statement runs to 110 characters per line.
  This is a product about reading carefully, rendered at documentation-chrome scale.
- **The interface has no system, only conventions.** 16 type steps, 10 spacing values, 4 radii and
  5 container widths across 6 surfaces. Nothing looks broken; everything looks slightly unrelated.
- **Mobile is the desktop layout, stacked.** 45 % of a phone screen is spent on chrome before the
  stage begins.

Fix those three and the app stops looking like a very good prototype.

---

## 3. What is already right — do not "improve" these

| Strength | Evidence |
|---|---|
| **Colour is never the only channel.** anchor = peach + ▲, focus = ring, answer = green + ✓, eliminated = fade. | `chip-row.tsx`; legible in greyscale |
| **Contrast floor is high.** Median 8.4 : 1, minimum 5.65 : 1 outside one string, 0 failures on 5 of 6 routes and both dialogs. | 630 text nodes measured |
| **Focus is never lost.** Every tab stop shows a ring or outline; `:focus-visible` matched at all 26 stops. | real Tab traversal |
| **No horizontal scroll anywhere.** 390, 1024 and 1440 all report `scrollWidth == clientWidth`. | 22 route/viewport combinations |
| **Motion has a governor.** FLIP duration is `clamp(80, delay × 0.4, 280) × motion`, `prefers-reduced-motion` forces 0, and the new write pulse respects both. | `use-flip.ts`, `index.css` |
| **The disclosure masking is a real idea.** Hiding a pattern's name only while a started journey is building it — with a one-click opt-out — is the kind of detail most learning products never attempt. | `lib/disclosure.ts` |

---

## 4. Findings

### Severity 1 — costs the learner something now

#### U1 · The narration, the "star of the page", gets clipped

**Evidence.** On the recap act the stage's own scroll container is 816 px tall with 975 px of
content. The narration line sits at y = 954 — inside the overflow. On any long panel (recap table,
hash map with a full bucket grid, the challenge editor) the sentence explaining *what just
happened* is below the fold of a box that scrolls independently of the page.

**Why it matters.** `ARCHITECTURE.md` calls the narration "the star of the page", and the whole
pedagogy depends on it: the animation shows *what*, the sentence says *why*. A star you have to
scroll for is a caption.

**The fix.** Make the narration a **sticky footer inside the stage**: `position: sticky; bottom: 0`
with the existing `bg-background/40` promoted to an opaque token plus a 1 px top border and a
`backdrop-blur-sm`. The transport can join it as one persistent "control bar". Cost: one class
change plus a background token; nothing about layout order changes.

**Effort.** S (1–2 h including a UI test that asserts the narration's rect stays within the
viewport on the recap act).

#### U2 · A phone spends 45 % of the screen before the stage starts

**Evidence.** At 390 × 844: header 378 px, of which the act stepper alone is 214 px (it wraps into
four rows of chips). The stage begins at y = 463.

**Why it matters.** The stage is the product. On a phone the learner sees the title, a wrapped
breadcrumb, XP, a restart button and seven act chips before a single chip of the array.

**The fix.** Below `lg`, collapse the stepper into one row: `act 05 / 07 · One-Pass Hash ▾` that
opens the full stepper in a sheet (the sheet component is already in the project for the mobile
sidebar). Move XP and "restart journey" into an overflow menu next to it. Target: ≤ 140 px of
chrome, so the stage starts above 200 px and the array plus the narration are visible together.

**Effort.** M (half a day).

#### U3 · The visualizer ignores a deep link changed in-app

**Evidence.** Load `#/algorithms?algo=quick`, then set the hash to `?algo=dijkstra`: 16 bars before,
16 bars after. A full page load works. This is the same class of bug as the journey deep link fixed
today (BACKLOG G1) — a query parameter read only in a `useState` initializer.

**Why it matters.** Sharing a link to *this algorithm* is the visualizer's only sharing surface, and
it silently no-ops for anyone who already has the page open.

**The fix.** Copy the pattern from `use-journey.ts`: a render-time adjust comparing the previous
`?algo=` to the current one. Add it to the UI smoke test beside the journey's equivalent.

**Effort.** S (30 min).

#### U4 · The settings dialog is wearing the operating system's clothes

**Evidence.** The speed slider renders in the browser's default blue, not the app's mauve; the
"reading column" control is a raw `<input type="checkbox">`, also blue, while the practice list uses
the styled `Checkbox`. The transport's slider *is* styled (`accent-primary`).

**Why it matters.** Settings is where a user forms their model of "how considered is this
product". Two default-blue controls inside a Catppuccin dialog reads as unfinished, and it is the
one screen where every control is visible at once.

**The fix.** `accent-primary` on the range input (one class, matching the transport), the shadcn
`Checkbox` for the boolean, and the motion/code-tab `<select>`s either styled to match the data
controls or swapped for a segmented control — motion has four values and code tab has four, both
ideal for segments and both easier to compare when all options are visible.

**Effort.** S (1 h).

### Severity 2 — costs comprehension or trust

#### U5 · Two notations for one number

**Evidence.** For the same journey at the same moment, the sidebar badge reads `1/7` (acts
unlocked / acts total) and the home card reads `0/6 earned` (unlocked − 1 / acts − 1).

**Why it matters.** The learner cannot tell whether these are the same fact. One of them is also
wrong on its own terms: after finishing everything the sidebar shows `✓` while the card shows
`complete`, so the two never reconcile even at the end.

**The fix.** One notation everywhere: **`n of m acts earned`**, where "earned" means *left behind*
(act 1 is not an achievement). Sidebar badge `0/6`, home card `0/6 earned`, both from one helper in
`lib/progress.ts`.

**Effort.** S.

#### U6 · The interface is set two steps too small for the job

**Evidence.** Type sizes in use on the journey page, by frequency: **12 px × 32**, 14 px × 28,
15 px × 14, 12.8 px × 8, 12 px semibold × 7 … 16 distinct size/weight pairs. The reading column
(the place a learner reads *paragraphs*) is 15 px; the takeaways, tools and legend are 12–14 px.

**Why it matters.** 12 px is a chrome size — labels, badges, metadata. This product asks people to
read explanations, corner cases and code commentary for minutes at a time. Body copy that small
raises reading effort exactly where comprehension is the product.

**The fix.** A six-step scale, applied as tokens rather than ad-hoc classes:

| Token | px / line-height | Use |
|---|---|---|
| `text-meta` | 12 / 16 | badges, act keys, counts |
| `text-ui` | 14 / 20 | buttons, controls, table cells |
| `text-body` | **16 / 26** | reading column, dialog prose, takeaways |
| `text-narration` | **19 / 30** | the narration line |
| `text-title` | 24 / 30 | page and act titles |
| `text-display` | 32 / 38 | the equation and the answer |

Everything currently at 15 px moves to 16; everything at 12 px that is a *sentence* moves to 14.
Mono stays one step below its sans sibling, as it already does.

**Effort.** M — mechanical, but it touches every component, so it wants the UI smoke test rerun and
a screenshot pass.

#### U7 · The measure is too long to read comfortably

**Evidence.** Characters per line: problem statement **110**, help dialog prose **89**, home intro
**86**, journey narration **81**. The comfortable band is 45–75.

**Why it matters.** Past ~80 characters the eye loses the line on the return sweep. This is the
single cheapest legibility win available.

**The fix.** `max-width: 68ch` on prose containers (problem statement, dialog body, reading column
paragraphs, narration). The narration is centred, so it also needs `mx-auto`.

**Effort.** S.

#### U8 · The reading-column toggle floats over the text it belongs to

**Evidence.** The sticky toggle sits at (1201, 940) with the "what to understand" card underneath —
`elementFromPoint` immediately left of it hits that card's `div`.

**Why it matters.** A control that overlaps content reads as a bug, and it obscures the last line of
whatever is under it at exactly the moment the learner scrolls there.

**The fix.** Give the reading column `padding-bottom: 3.5rem` so the sticky control has its own
lane, or dock the toggle to the column's header instead of its foot. The sidebar's collapse control
already lives in a footer with its own background — match that treatment.

**Effort.** S.

#### U9 · The visualizer wastes the bottom half of the screen

**Evidence.** At 1440 × 1000 the page's content ends around y = 600; the stage is a fixed 224 px of
bars with the algorithm list (13 items in one column) beside it.

**Why it matters.** The bars are the whole point and they are rendered in a quarter of the available
height. Meanwhile the picker — chosen once per session — occupies a full column.

**The fix.** Give the bars the same treatment the journey stage got: a viewport-height inset with
the stage taking the free space (`flex-1`, `min-height: 380px`). Collapse the picker into a grouped
`<select>` or a horizontal segmented row above the stage; keep the pseudocode and legend in the
right rail.

**Effort.** M.

#### U10 · The one real contrast failure

**Evidence.** "the stage is empty on purpose — the need comes first": 12 px at **3.64 : 1**
(`rgb(109,113,134)` on `rgb(24,24,37)`). Everything else on that route passes.

**Why it matters.** It is the first sentence a first-time learner reads on act 1, and it is the
least readable text in the app.

**The fix.** `text-muted-foreground` at full opacity (7.4 : 1) at 14 px, not `/60` at 12 px.

**Effort.** XS.

### Severity 3 — polish, worth doing as a batch

#### U11 · Touch targets in the transport

28 × 28 px icon buttons (back / step / restart / help) and a 6 px-tall timeline. WCAG 2.5.8 asks for
24 px, so this passes AA, but the comfortable minimum on touch is 44 px. **Fix:** on `< lg`, size
the transport buttons to `h-11 w-11` and the range track to 12 px with a 20 px thumb.

#### U12 · The design system, written down

Currently in use: **10 spacing values** (8 × 95, 4 × 32, 12 × 27, 16 × 21, 6 × 17, 10 × 11, 2, 20,
24, 32), **4 radii** (8, 10, 14, 4), **5 container widths** (768, 896, 1136, 1280, 1760), one shadow.
Nothing is wrong; nothing is decided.

**Fix:** a `docs/DESIGN.md` (or a `@theme` block) that names the decisions — a 4 px spacing grid
(4, 8, 12, 16, 24, 32, 48), three radii (`sm 6`, `md 10`, `lg 14`), and three container widths:
`prose 68ch`, `page 1120px`, `stage 1760px`. Then the odd 2, 6 and 10 px gaps get corrected as they
are touched, and a new page has an obvious width to pick.

#### U13 · Home does not know you

The home page renders identically whether you have never opened a journey or finished all three.
There is a streak, an XP count and three cards with progress bars, but no "continue where you left
off", no "due for review", no difference between 0 % and untouched. **Fix:** a single "Continue"
card at the top when any journey is between 1 and complete, deep-linking to `?act=` — the data is
already in the ledger, and it makes the streak mean something.

#### U14 · The stepper is the only wayfinding, and it wraps

Seven act chips fit one row at 1440, wrap to two at 1024, and four at 390. **Fix** (with U2): a
compact form below `xl`, and consider numbering the acts in the stage header too (`act 05 · 07`)
so position is legible without looking up.

---

## 5. Surface-by-surface notes

**Home.** Clear hierarchy, good use of the journey cards. The practice grid below repeats the
sidebar's list — consider making it a *pattern map* (the DAG from B9) rather than a second nav.
The intro paragraph is 86 ch and one step too small.

**Journey.** The strongest screen in the app; the act strip, stage, narration, interruptions and
reading column are correctly ordered by importance. Its weaknesses are all frame problems (U1, U2,
U6, U8). One content note: on act 1 the reading column carries insight, "how to read this problem"
and "bring three inputs" — three cards before "what this approach is built from". That is a lot of
reading before the first play; consider collapsing the corner-case list to its four titles with the
detail behind a disclosure.

**Problem page.** The 110 ch statement is the worst measure in the app. The language strip
(Python/Java/C++) is a genuinely nice touch and should be the model for the settings selects (U4).

**Visualizer.** Vertical dead space (U9) and the deep-link bug (U3). The legend is good; the new
"write" row explains the pulse in words, which is exactly right.

**SQL drills / flashcards.** The only surfaces with no visual identity — plain cards on a 768 px
column, 2 784 px of scroll for SQL with no in-page navigation. When the SQL track grows (`PROBLEMS.md`
S1–S4) it needs the same treatment as the journeys: a stage, a step player, and grouping.

**Dialogs.** Help and shortcuts are well structured and pass every contrast check; settings needs
U4. All three lack a visible close affordance other than the corner ✕ — an `Esc` hint in the footer
would help.

**Mobile.** Everything fits and nothing scrolls sideways, which is more than most sites manage. The
cost is chrome (U2) and touch targets (U11). The hover-peek rails are correctly mouse-only, but
that leaves phones with no equivalent — the buttons are there, so this is acceptable.

---

## 6. What I would build, in order

| Order | Items | Why first |
|---|---|---|
| 1 | **U10, U7, U5, U3** | Four small, unambiguous corrections. Half a day for a visibly tidier product. |
| 2 | **U1, U8, U4** | The stage's own legibility and the settings polish. One day. |
| 3 | **U6 + U12** | The type scale and the written system, done together so the scale has somewhere to live. Two days, touches everything, wants the smoke test and a screenshot pass. |
| 4 | **U2, U14, U11** | Mobile as a designed layout rather than a stacked desktop. Two days. |
| 5 | **U9, U13** | The visualizer's vertical space and a home page that knows you. |

None of this changes the pedagogy, the engine or the API. It is all frame.
