# Authoring — turning a problem into a journey without regressing the pedagogy

This is the checklist and the copy-paste prompt for adding a journey. It encodes the rules the
whole product rests on; the content test (`src/engine/journeys.test.ts`) enforces the ones that
can be enforced.

## The shape of a journey

One file, `src/engine/journeys/<slug>.ts`, exporting a `Journey<D>`; one line in
`src/engine/index.ts`; one `Problem` in `src/data/problems/<pattern>.ts` with the same id as
`problemId` (so the practice-set page gets the CTA). Nothing else — no HTML, no route, no
sidebar entry: the registry drives all of it.

```ts
export const twoSum: Journey<TwoSumData> = {
  slug, title, subtitle, problemId, leetcode,
  acts: [story, brute, twoptr, twopass, hash, challenge, recap],   // learning order
  resources, presets, defaultPreset, harder?, params?,
  classify, describe, parse, challenge?, sample,
}
```

An act:

```ts
const hash: Act<TwoSumData, F> = {
  key, name, short, complexity,
  insight,      // the WEAKNESS of the previous act, phrased as a question or a wish — never a name
  idea,         // the mechanism in plain words
  tools,        // what the approach is built from — structures, not algorithms
  code: { pseudo, python?, java?, cpp? },   // line-for-line
  takeaways, hints?, quiz?, gate?, chart?, nextLabel?,
  run: function* (data, ctx) { … },         // yields frames
  view(frame, data) { return { chips, panel } },
}
```

## The act arc (do not reorder)

1. **The Problem** — the *need* before any data (`noChips` frames), then the promise, then the
   answer shown so the learner knows what "done" looks like. Quiz: what must you return, what does
   the input promise.
2. **First instinct** — brute force. Show the shape (nested loop) and let the chart bar explode
   on the big preset. Quiz: why is it O(n²).
3..n. **Each next act opens with the previous act's weakness.** "Trying every pair repeats work —
   order the values and walk inward." Each act adds one structure (`tools`) and the cost follows
   from the structure. Reveal nothing about the act after it.
- **Code It** (optional, `gate: "pass"`, `chart: false`) — the challenge harness. The learner's
  trace drives the chips when `ctx.trace` is set.
- **The Reveal** (`chart: false`) — *now* the names: pattern names, the side-by-side table, links
  to the pattern page and the next problem.

## Rules, each with the test that guards it

| Rule | Guarded by |
|---|---|
| No act's `name`, `short`, `insight`, `idea`, `complexity`, `takeaways`, `hints`, `tools`, `quiz`, frame `note`s or `predict` text names a **later** act. Generic names (`The Problem`, `Code It`, `The Reveal`, `start here`…) are exempt. | disclosure test |
| No preset `info` names any act past the story act (banners show from act 1). | disclosure test |
| `reveals` lists every pattern id whose **name** the journey withholds until its recap, and must include the pattern its own problem sits under. The catalogue masks those names while the journey is started and unfinished. | `data/problems.test.ts` |
| No `edgeCases` prose (`name`, `example`, `why`, `think`) names any act past the story act — it sits on act 0. Describe what breaks, never what fixes it. | disclosure test |
| ≥ 3 `edgeCases`, unique keys, each `preset` exists, and on that preset **some act tags a frame `corner: key`** — every corner case is explained in play at least once. No frame tags an unknown key. | edge-case test |
| Every frame has a non-empty `note`, present tense, one sentence. | drain test |
| `python` / `java` / `cpp` have exactly as many lines as `pseudo`. Pad with a closing brace on the same line (`seen.put(nums[i], i); }`) rather than a separate `}` line. | line-count test |
| `frame.line` < `pseudo.length`. | drain test |
| Every preset's `make()` produces data every act can drain; `classify` returns `{ok}`. | preset test |
| Frames are JSON-safe (arrays, numbers, strings — spread Maps into `[...map]`). | JSON round-trip test |
| Quiz: ≥ 2 choices, `answer` in range, `explain` present. Predict: same minus `explain`. | schema test |
| Every approach returns the contract's answer on the trap inputs. | **you write this** — add cases to the correctness suite at the bottom of `journeys.test.ts` |

Rules the test cannot check — review by hand:

- **Insight before name.** The insight line is a weakness or a wish, not a term of art.
- **Broken promises are presets, not bugs.** Include at least one contract-breaking preset and
  make `classify` explain what each approach will do with it.
- **Predict at the learning moment, once.** The first time a pointer moves in each direction; the
  first time the map is asked. Not every step.
- **Hints go nudge → concept → the line to stare at.** Never the answer.
- **The recap's table has a "built from" column.** The point of the whole journey is that the
  approaches are data-structure choices.

## Render kinds you can use in `view()`

| `panel.kind` | Draws | Helper |
|---|---|---|
| `none` | nothing | — |
| `story` | a glyph scene on an empty stage | — |
| `sum` | `a + b = sum` vs target | — |
| `need` | `need n` line + the hash map | `hashLayout(entriesOf(pairs), { probe, hit, label })` |
| `hash` | the hash map iceberg | same |
| `sorted` | a second chip row (with `subs` = original indices) + optional sum | `chipRow(values, { subs })` |
| `bits` | bit rows with flipped bits ringed | `{ tag, value, flip, bits }` |
| `terms` | `a + b + c = sum` vs target (or `need` for an unknown last term), the distinct answers found so far (newest ringed, a dropped repeat struck through), optional hash map | `{ terms, target, need?, hit?, dup?, found, map? }` |
| `recap` | table + note + links | — |
| `challenge` | the editor (the page injects it) | — |

Chips: `chipRow(values, { anchor, focus, dim, answer, subs })` → roles: anchor = held / left
pointer (▲), focus = current / right pointer (ring), answer (✓), dim = eliminated.

**Need a new kind?** Add a member to `PanelModel` in `src/engine/types.ts`, a case in
`src/features/journey/panels.tsx`, and a row above. Known gaps: linked list, tree.

## Presets

```ts
presets: {
  random: { label: "random", make: () => … },                      // defaultPreset
  edge:   { label: "…", make: () => …, info: "what to watch" },     // info = the blue banner
  broken: { label: "… (broken promise)", make: () => … },          // classify() will warn
}
harder: { preset: "big", label: "Take on n = 20 ▸" }               // adaptive-difficulty offer
params: [{ key: "target", label: "target" }]                       // scalar inputs beside the array
```

`parse(text, params)` must reject silently (`null`) — the UI shows "couldn't read that input".

## Corner cases (required)

Khamies, *How to Solve Algorithm Problems* §3.1.4: bring three inputs before any code — an
empty (or smallest legal) case, a medium case, a corner case. A journey ships that list as data,
and each entry is taught twice: read in the story act, then watched biting in play.

```ts
edgeCases: [
  {
    key: "duplicates",
    name: "two equal values",                   // shown as "CORNER CASE · two equal values"
    example: "[3, 1, 3, 8], target 6 → [0, 2]", // mono
    why: "3 + 3 hits the target, but a value may not pair with itself. Anything that remembers a value must check BEFORE it records …",
    think: "Ask: can both indices be the same? Can two indices hold the same value? …",
    preset: "duplicates",                       // the "load this input" button applies this
  },
]
```

Then, in the generator, tag the frame where it bites — and let the **note** say what this
approach did about it (the note may name the technique; the act is unlocked by then):

```ts
yield {
  …,
  corner: equal ? "duplicates" : undefined,
  note: `return [${i}, ${j}]${equal ? ". Two different slots, same price — legal, because j started at i + 1" : ""}`,
}
```

The story act's `hints` are shown up front (not on the idle ladder) as **reread · formalize ·
bring inputs** — write them about reading the problem, not solving it.

## The challenge (optional)

```ts
challenge: {
  fname, signature: "function twoSum(nums, target) {", starter,
  cases: [{ nums, target?, expected, tag?, anyPair? }],   // expected pre-sorted; [] = no solution
  reference: "…",                                          // counted with the same touch counter
  review: [{ q, check?: (code) => boolean | undefined }],  // undefined = honest checkbox
  big?: { n, make: () => case },                           // Set 2
}
```
Cases should include the traps the approaches lean on (equal values, duplicates, answer at the
extremes, n = 1). The act with `gate: "pass"` finishes on green tests, not on its last frame; its
`run` should replay `ctx.trace` when present.

## The copy-paste prompt

> Author a learning journey for **<LeetCode problem>** in `src/engine/journeys/<slug>.ts`,
> following `docs/AUTHORING.md`. Acts in order: The Problem (need before data, promise, answer
> shown), brute force, then one act per approach in naive → optimal order, each opening with the
> previous act's weakness and adding exactly one structure in `tools`; optionally Code It with
> ≥ 5 cases including the traps; The Reveal with a built-from table and links. No act may name a
> later act anywhere — not in insight, idea, tools, hints, quiz, notes or preset banners. Every
> frame has a `note`. Python/Java/C++ match the pseudocode line-for-line. Include ≥ 1
> contract-breaking preset and a `classify` that says what each approach does with it. Predict
> once at each learning moment. Hints nudge → concept → line. Register it in
> `src/engine/index.ts`, add the `Problem` to `src/data/problems/`, add correctness cases to
> `journeys.test.ts`, run `npm run check`, then open `#/journey/<slug>` and play every act to the
> reveal. Report the test output and what you saw.

## Definition of done for a journey

- [ ] `npm run check` exits 0 (typecheck, lint, all content + correctness tests)
- [ ] Every act played to its last frame in the browser; every predict answered; every quiz passed
- [ ] The reveal reached from a fresh `unlocked = 1`, XP accounted for
- [ ] A contract-breaking preset shows the warning and every act ends sanely
- [ ] `FEATURES.md` §4.8 has a row; `WORKLOG.md` has an entry
