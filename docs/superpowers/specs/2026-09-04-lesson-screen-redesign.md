# The lesson screen — a redesign spec, and what of it is new

Requested 2026-09-04 as a worked design for the **Single Number** lesson screen. Filed here so the
reasoning survives; the shippable slices are [`BACKLOG.md`](../../BACKLOG.md) **R3–R8**, and the two decisions it forces
are **Q9** and **Q10**.

**Most of this screen already exists.** The value in the spec is not the feature list — it is the
*placement*: it wants the problem itself reachable from every act instead of only the first, and the
test-case controls off the critical path instead of under the stage. Read the mapping table before
building anything, or you will rebuild `DataControls` from scratch.

## What the spec asks for

| Region | Spec |
|---|---|
| Left sidebar | App name, grouped nav (DSA / patterns / SQL) with `x/y` progress badges, settings + collapse pinned at the foot |
| Header | Breadcrumb (back + problem + category), XP badge, restart, a flask toggling a test-case drawer, and a **persistent Play/Pause anchored top-right** |
| Title block | Title, `LeetCode 136` in monospace, one-line hook |
| Step row | Step chips left ("The problem" done, "6 more · locked"); prev/next/restart icons + a compact scrubber right, filling space that sits empty today |
| Problem panel | Accordion — **Question** open (statement, number chips for the current case, editorial pull-quote), **Hints** collapsed, **Edge cases** collapsed. All three reachable from the start of the lesson |
| Check yourself | One multiple-choice question, immediate correct/incorrect feedback with a one-line explanation |
| Test-case drawer | Off-canvas right, opened by the flask. Slides open and **pushes** the main column (no overlay). Preset dropdown, "New" random, editable array, Apply |

Motion and visual system it asks for: hover shift/tint on sidebar rows, hover scale on quiz options;
a **focus mode** where Play dims sidebar and secondary chrome and accents the panel border, Play
itself staying at full opacity; an **elimination animation** cancelling matching pairs one at a time
until the loner is left pulsing; flat surfaces and hairline borders, sentence case, one accent action
per view, semantic progress colour (green done, accent current, grey locked).

## What of it already exists

| Spec | Today | File |
|---|---|---|
| Sidebar nav with `x/y` badges | shipped (U5, `earnedOf()`) | `lib/progress.ts` |
| Breadcrumb, XP badge, restart | shipped | `journey-page.tsx` |
| Step chips with a locked count | shipped; locked acts are one "?" node by design | `act-stepper.tsx` |
| Hints as a collapsed accordion, one click each | shipped — but **story act only** | `cards.tsx` `HintList` |
| Edge cases listed, click to load that preset | shipped — but **story act only** | `cards.tsx` `EdgeCaseList` |
| Quiz with immediate feedback | shipped | `cards.tsx`, `panels.tsx` |
| Preset dropdown, random, custom array, apply | shipped — in the footer, not a drawer | `controls.tsx` `DataControls` |
| Prev/next/restart + scrubber | shipped — in the footer transport | `controls.tsx` `Transport` |
| Focus mode | shipped as **collapsible rails + `f`**, not as dimming | B4, B26 |
| Flat surfaces, sentence case, one accent, semantic progress | shipped and written down | [`DESIGN.md`](../../DESIGN.md) |

So the genuinely new work is four things: the problem panel **persisting across acts**, the **drawer**,
the **elimination animation**, and a header Play — and the last one is Q9.

## The two conflicts

### Q9 — a persistent header Play, against U1

[`UX-AUDIT.md`](../../UX-AUDIT.md) U1 (fixed 2026-09-05) made the stage stop being one scroll box: act strip fixed, a
scrolling middle, then narration + interruptions + **transport as a footer that cannot be pushed
away**. A sticky narration was tried first and rejected because it let the transport scroll under it.

The spec puts Play in the header *and* a second prev/next/scrubber row under the chips. That is
three places to look for playback on one screen, and it re-opens the problem U1 closed. The reason
the spec gives — "it never moves, so attention doesn't have to search for it" — is already satisfied
by a footer that cannot be scrolled away.

### Q10 — ghosted previews of locked steps, against the disclosure rule

Spec suggestion 6 replaces "6 locked" with a ghosted/blurred preview of upcoming step titles, to cut
the black-box feeling. Act titles are the pattern names the journey exists to earn: "One-Pass Hash",
"XOR". `journeys.test.ts` fails a build that puts an unearned name anywhere a learner can see, and
`CLAUDE.md` names this as the one rule not to regress. A blur is not a mask — it is legible at a
glance and copy-pasteable from the DOM.

The itch is real; the answer has to be a shape, not a name. See Q10 for the options.

## The rest of the spec's own suggestions

| Spec suggestion | Where it went |
|---|---|
| 1 · test at real target width | a check inside R4, not an item — U2 and U11 already did the responsive pass |
| 2 · hint-gating ("still stuck?") | already answered in the opposite direction: story-act hints are visible up front because they are about *reading* the problem, and a separate 45 s idle timer (`IDLE_MS`, `use-journey.ts`) offers in-play hints. Carried into R3 as a constraint, not re-litigated |
| 3 · state persistence for drawer/accordion | folded into R3 and R4 — every key goes through `lib/store.ts` |
| 4 · step-completion feedback | R8 |
| 5 · keyboard support | R7 |
| 6 · locked-step preview | **Q10** |
| 7 · input validation in the drawer | folded into R4; validation at a trust boundary is not optional |
| 8 · one motion system | R6 — `DESIGN.md` already carries a motion envelope; the job is to make the code obey it |
| 9 · touch equivalents for hover affordances | R7 |
