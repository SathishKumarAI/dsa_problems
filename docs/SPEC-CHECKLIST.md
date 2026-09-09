# Widest Container spec — the checklist, item by item

The build prompt for this screen shipped with a 34-line verification checklist. This is that
checklist against the real app, on `feat/ui-audit-and-fixes`, with the evidence for each line.

**Ticked means measured**, not read off the JSX. Where something is argued rather than measured, it
says so. One line is deliberately unticked and says why.

Gates behind every claim below: `npm run check` exit 0 (tsc 0, eslint 0, **356 tests**) and
`npm run test:ui` exit 0 (**83 checks**).

---

## Layout & chrome

| | Item | Evidence |
|---|---|---|
| ☑ | Title in exactly one place | The `h1` said "Best Contiguous Run" and the breadcrumb said "Best Contiguous Run · Dynamic Programming". Breadcrumb is the trail alone now. `titleDuplicated: false`. |
| ☑ | Transport visible while scrolling | At 1536×776: inset height exactly 776, document does not scroll, all eight scrollable regions scrolled to their ends, Play moves **0px** and stays visible. Below `lg` this needed `App.tsx` to stop gating `h-svh overflow-hidden` behind `lg:` — measured cause: SidebarInset grew to 1202px against a 788px viewport. **Not measured at 900px**: the browser would not resize after three agents shared it, so that width is argued from the CSS being ungated. The 390px checks in the suite still pass. |
| ☑ | Three columns, independently scrolling | Sidebar / main / reading column, eight scrollable regions, document itself does not scroll. |
| ☐ | **No responsive breakpoints** | **Deliberately not done.** Asked directly and the answer was "keep responsive". `test:ui` also carries a 390px no-horizontal-scroll check and a phone-chrome budget that would have to be deleted with them. Unticked by decision, not by omission. |

## Sidebar

| | Item | Evidence |
|---|---|---|
| ☑ | Colour-coded progress rings | Conic gradient with an inner disc punching the hole. Three states read back as computed colours: grey `rgb(166,173,200)` at 0% hollow, amber `rgb(250,179,135)` at 25% hollow, green `rgb(166,227,161)` at 100% filled. |
| ☑ | Tool entries: distinct icon, no ring, no count | Already true before this pass; verified rather than rebuilt. |
| ☑ | Collapses to an icon rail and back | Pre-existing; unchanged. |
| ☑ | Collapsed rows still expose their name | Better than the spec asked: a real `Tooltip`, not a `title` attribute. Verified present on every row. |
| ☑ | Settings popover; speed slider live | Slider needed no change and that was **proved, not assumed**: `usePlayer` re-arms a `setTimeout` per frame with `delay` in its deps. Playing at 2080ms/frame, the slider was moved at t=300ms without pausing and the next frame arrived 123ms later — **490ms total against 2080ms**. |
| ☑ | Reduced-motion checkbox stops transitions | New (`prefs.reduceMotion`, backlog B3's long-open item). `usePrefs` derives `motion: "off"` from it, so `use-flip` and the algorithms page obey without knowing it exists. **All 582** transitioning elements go 0.15s → 1e-05s. Persists across reload. |
| ☑ | Shortcuts popover | Pre-existing keyboard map. |
| ☑ | Only one popover open at a time | Settings open → `["Settings"]`; clicking Shortcuts → `["Keyboard shortcuts"]`, replaced not stacked. |
| ☑ | Click-outside / Escape closes | Escape → `[]`. |

## Problem content

| | Item | Evidence |
|---|---|---|
| ☑ | Two-line act stepper | Pre-existing: title plus subtitle per step, locked steps labelled. |
| ☑ | Act label does not repeat the stepper | Was `act 01 · The Problem` under a stepper already saying "The Problem". Now `actLabel: "act 01"`, `actLabelRepeatsName: false`, state note kept. |
| ☑ | Quiz clickable, right/wrong, explanation | Pre-existing `QuizCard`; verified scoring and the explanation swap. |

## Visualizer

| | Item | Evidence |
|---|---|---|
| ☑ | Bars from the real array | Pre-existing: the `bars` panel is built from the journey's data. |
| ☑ | Steps from a real algorithm run | Pre-existing: every act is a generator over the actual input, and the content gate drains each one on every preset. |
| ☑ | Bracket and L/R carets track the pair | **Built.** Positioned from `centre(i) = (i + 0.5) / n` as a percentage — no `getBoundingClientRect`. Bracket width agrees with the readout's width on **all 17 frames** of `[1,8,6,2,5,4,8,3,7]`. Carets follow the anchor/focus roles, not the water span, because on the closing frame that span is the winning pair and labelling it L/R would misstate where the pointers are. |
| ☑ | Readout and "best so far" badge, record frame flagged | Readout was already right. The badge is new, and needed a `record` field on the frame: `best` means "is the best so far", which is **also true on a tie**, and a view holding one frame cannot tell the difference. Fires at frames 2 and 6, not at 8. On a flat row `[5,5,5,5,5,5]` where every pair ties, it fires **exactly once** across 13 frames. |
| ☑ | Winning pair keeps its highlight | Applied only on the final frame before, so it never did its job. Fixing it exposed a second bug: the dim pass wrote `roles[k] = ["dim"]`, **overwriting** the answer role, so the winner went dark the moment the pointers passed it — exactly the case the highlight exists for. Now: 0 winning bars before frame 2, 2 from frame 2 on, still 2 at frames 8–15. |
| ☑ | Play/prev/next/scrub agree on one frame | Single `frame` state; verified by the trace rows moving the same player. |
| ☑ | Keys only when the stage has focus | Scoped listener; `BUTTON` and `A` added to the ignore list, which the trace panel made necessary — space on a focused row would otherwise fire the button *and* toggle playback. |

## Context drawer

| | Item | Evidence |
|---|---|---|
| ☑ | Rail and drawer never both visible | Pre-existing collapse; unchanged. |
| ☑ | Explain / Hints / Edge cases / Trace | **Built, and corrected once.** The first attempt shipped Explain/Problem/Code/Trace *and patched three tests to match that naming* — wrong twice: the spec names the tabs, and rewriting a test to fit a rename is not a test fix. Verified live: `["Explain","Hints","Edge cases","Trace"]`, `cornerCards: 4`, exactly one panel visible. Nothing culled — `ProblemPanel` is deliberately unused because it would show hints and edge cases twice. |
| ☑ | Trace list from the same data | The same drained frames the player uses. |
| ☑ | Clicking a trace row jumps the player | Row 3 → scrub 3, row 1 → scrub 1 (backwards works). |
| ☑ | Highlight follows in both directions | Follows Step forward, Step back and the scrubber; `aria-current="step"`. |

## Visual system

| | Item | Evidence |
|---|---|---|
| ☑ | Colours are shared tokens | Everything reaches through `src/index.css`; no raw hex added. |
| ☑ | Manrope + JetBrains Mono | `document.fonts.check` true for both in the built app; computed families correct on body, h1 and a mono element. **Self-hosted** via `@fontsource-variable`, not a Google `<link>` — an external stylesheet on the critical path is a render-blocking third-party request, and these pages are read offline. |
| ☑ | Thin, themed scrollbars | `scrollbar-width: thin`, `scrollbar-color` set, and the WebKit thumb rule present in a stylesheet. |

## Accessibility

| | Item | Evidence |
|---|---|---|
| ☑ | Every icon-only button has an `aria-label` | 52 interactive elements on the journey page, **0 without an accessible name**. |
| ☑ | Visible focus ring on every interactive element | This was **worse than missing**: the shadcn button ships `outline-none` and replaces the ring with a box-shadow that computed **fully transparent**, so no button had any focus indicator. A rule in `@layer base` did nothing, because Tailwind's utilities are a later layer and a later layer beats any specificity. The rule is **unlayered** now, which beats every layer without `!important`. Measured after: **62 focusable elements, 0 without a visible indicator.** Also removed an `outline-none` on `TabsContent` that had no replacement. |
| ☑ | OS-level `prefers-reduced-motion` respected | Already present; the media query and the in-app class are two independent layers. |

---

## What this pass also found that the spec did not ask about

- **Home was 4184px — 5.81 screens** — with 46 journeys, pushing the practice set 3282px down the
  page. The sidebar carried 59 links. Now 1698px and 20 links. The filed ticket (B37) was about the
  pattern page; the pattern page was the smaller problem.
- **Two blocks of full sentences set at 12px with no measure cap**, in the hash-map view and the
  mini player. They had been wrong for as long as they had existed and nothing caught them, because
  both lived behind a tab that was closed by default. **A rule only holds where something looks.**
- **Twelve language pickers that were really one** — every ladder rung rendered its own
  Python/Java/C++ strip and all of them wrote the same preference, so clicking one moved all three.
- **`navigator.clipboard.writeText` rejects** in an insecure context or on a denied permission, and
  that rejection was unhandled — the copy button silently did nothing.
- **`brief` was stored and never rendered**, which is the same shape of bug as B40's difficulty.
  Worth a sweep for others; filed as B55/V10.

Ten more findings are in `docs/UX-AUDIT.md` as V1–V10, six fixed and four filed with file:line and a
repro.
