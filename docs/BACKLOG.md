# Backlog — production DSA learning platform

The goal: one project that merges **DSA patterns** (AlgoMonster/NeetCode style) with
**DSA visualizations** (this repo), teaching the way Khan Academy and Brilliant do —
learn by doing, one earned insight at a time — with animation quality inspired by
Manim (3Blue1Brown's engine: states *morph* into each other, they don't teleport).

**Strategy: depth before breadth.** Build the complete experience for ONE problem
(Two Sum — it already exists and carries the two-pointers pattern), then replicate
the machinery for every other problem. Items marked `[flagship]` are the Two Sum
deep build; everything else generalizes later.

Research this backlog is built on:
- Khan Academy algorithms (with CLRS author Thomas Cormen): step-by-step diagrams,
  interactive visualizations, in-browser coding challenges with unit tests, quizzes.
- Brilliant: interaction beats video; progress celebration (streaks/XP) sustains
  motivation; play reduces anxiety of unfamiliar concepts.
- AlgoMonster/NeetCode: ~90% of interview problems reduce to ~20–48 named patterns;
  teach the pattern template first, then map problems onto it; quiz after each
  concept; roadmap DAG with prerequisites.
- Manim: precise programmatic animation — objects move/morph/fade smoothly, which
  is what makes an explanation *feel* continuous instead of flickering.

## How to use this file

Pick the top unchecked P0, build it on its own `type/scope-slug` branch, verify in
the browser, PR, squash-merge, check it off **in the same commit**. One item = one
branch = one increment.

## P0 — the flagship Two Sum experience

| # | Item | Why | Size |
|---|---|---|---|
| 1 | ☑ `[flagship]` **Pattern layer: two-pointers page** — a `patterns/two-pointers.html` teaching the *shape* (opposite ends converging, same-direction chase) with its own mini-visualization, linked from Two Sum's recap. New `patterns/` dir mirroring `problems/` structure. | The patterns+visualizer merge starts here. Pattern is the reusable knowledge; the problem is just one instance. | L |
| 2 | ☑ `[flagship]` **Quiz gates** — 1–2 check questions per act (e.g. "why must the array be sorted for two pointers?") answered before the unlock button appears. Content schema gains `quiz: [{q, choices, answer, explain}]`. Wrong answer → explanation, retry. | Khan/AlgoMonster both quiz immediately after a concept; self-reported "I get it" lets you lie to yourself. | M |
| 3 | ☑ `[flagship]` **Predict mode** (Brilliant learn-by-doing) — at key steps playback pauses and asks "where does the left pointer go next?"; learner clicks a chip; right/wrong feedback, then the real step plays. Frames gain an optional `predict` field. | Interaction is ~6x video for retention. Watching an animation is still watching. | L |
| 4 | ☑ `[flagship]` **Morph animations** (Manim feel) — chips FLIP-transition between frames (translate/scale from old to new position) instead of innerHTML re-render teleporting them. Respect reduce-motion. | The single biggest "production feel" upgrade; continuity is what made you like Manim output. | M |
| 5 | ☑ `[flagship]` **In-browser code challenge** — final act: an editable JS function body run in a Web Worker against the same unit cases as `test_two_sum.js`, green/red per case. No backend, no eval in main thread. | Khan's coding challenges are the "prove it" step; watching ≠ writing. | L |
| 6 | ☑ `[flagship]` **Recap screen** — after the last act: complexity table across approaches, the pattern named + linked (the reveal!), takeaways, "next problem using this pattern". | Closes the loop; the pattern name lands harder after you've earned it. | S |
| 7 | ☑ `[flagship]` **Story act upgrade: "why this exists"** — open with the real-world need (find two prices that hit a gift-card balance) before any array chips. | Motivation before mechanics; your stated goal — show the *need* for the structure. | S |
| 8 | ☑ **Content schema v2** — one `PROBLEM` object per content file (acts, quizzes, predicts, pattern refs, resources) + a `node problems/validate.js` that checks shape. | Makes items 1–7 authorable for every future problem, and makes "give Claude a LeetCode URL → page" mechanical. | M |

## P1 — flow & UX

| # | Item | Why | Size |
|---|---|---|---|
| 9 | ☑ **Roadmap page** — patterns→problems DAG with lock/done states (AlgoMonster style), replacing the flat problem list as home for `problems/`. | A visible path is the difference between a toy and a curriculum. | M |
| 10 | ☑ **Progress dashboard** — per-problem acts done, quizzes passed, day streak; all localStorage. | Brilliant-style reinforcement; streaks sustain daily practice. | M |
| 11 | ☑ **Celebrations** — act-complete micro-animation + XP counter; honors reduce-motion. | Cheap dopamine, proven by Brilliant; keep it tasteful. | S |
| 12 | ☑ **Onboarding tour** — first visit: 3-step spotlight on play/scrub/focus controls, dismissible, never again (localStorage). | Controls are keyboard-rich and invisible to newcomers. | S |
| 13 | ☑ **`?` shortcut overlay** — modal listing all keyboard shortcuts, replacing the footer hint text. | Footer hint doesn't scale past 4 shortcuts. | S |
| 14 | ☑ **Reset/replay journey** — per-problem "restart journey" (re-lock acts) in settings gear. | Relearning is the point; currently requires devtools. | S |
| 15 | ☑ **Mobile pass** — touch targets ≥44px, chip sizing, stacked layout audit on a real phone viewport. | Learning happens on phones; current layout merely doesn't break. | M |
| 16 | ☑ **URL state deep links** — `?act=brute&step=12` restores position; share a exact moment. | Makes asking for help ("look at this step") possible. | S |

## P2 — aesthetics

| # | Item | Why | Size |
|---|---|---|---|
| 17 | ☑ **Type & spacing system** — modular type scale, consistent vertical rhythm, tabular numerals for stats; tokens in `:root` beside the palette. | Current sizing is ad-hoc rem values; production feel is mostly typography. | M |
| 18 | ☑ **Chip visual grammar** — one documented shape language (fill = state, ring = attention, icon = role) that is colorblind-safe (never color alone). | Legend currently maps 6 colors with no redundancy channel. | M |
| 19 | ☑ **Landing page redesign** — hero stating the method ("feel the weakness, earn the insight"), problem cards with progress rings, pattern chips. | index.html is a tool, not a welcome; first impression sells the pedagogy. | M |
| 20 | ☑ **Contrast & focus audit** — AA contrast both themes, `:focus-visible` outlines on every interactive element. | Accessibility basics; also required for keyboard-first users. | S |

## P3 — platform & backend (static-first, honest about need)

| # | Item | Why | Size |
|---|---|---|---|
| 21 | ☑ **DOM smoke tests** — Playwright (or node+jsdom) script: every page boots, zero console errors, journey unlock round-trips. Run pre-merge. | Current node tests cover algorithms only; every UI branch was hand-verified in Chrome. | M |
| 22 | ☑ **Progress export/import** — settings gear: download/upload progress JSON. | Cross-device sync v0 with zero backend. | S |
| 23 | ☐ **Sync backend (only after 22 hurts)** — smallest possible store (Supabase/KV) keyed by a login-less token; syncs the same JSON. | Real backend only when export/import friction is proven. | L |
| 24 | ☐ **Spaced-repetition queue** — "you earned the XOR trick 5 days ago — solve Single Number cold?" resurfaces finished problems on a decay schedule; localStorage scheduler. | Retention is the actual goal; one pass teaches, review keeps. | M |
| 25 | ☐ **Stall analytics (local)** — log which act/step learners linger or quit on, render in dashboard; no network, no tracking. | Tells you which explanation is failing; data-driven content fixes. | M |

## P0–P2 — AI-platform round (from `docs/RESEARCH.md`)

| # | Item | Why | Size |
|---|---|---|---|
| 26 | ☐ `[flagship]` **Your code is the animation** — instrument the learner's code-challenge solution (yield per loop iteration) and drive the chip visualization from *their* execution; watch your own off-by-one walk past the answer. Extends #5's Worker harness. | The learn/implement merge no surveyed platform does; our differentiator. | L |
| 27 | ☐ **Hint ladder** — stuck detection (no progress N seconds / repeated wrong quiz) offers tiered hints: nudge → concept → pseudocode line. Never the answer (Boot.dev's rule). Static per-act hint arrays in content schema. | Ropes' dynamic-hint mechanic, inverted for learning. | M |
| 28 | ☐ **Skill scorecard** — after the code challenge: correctness per case, step-efficiency vs reference (we already count steps), edge cases attempted. Shown as growth, stored locally. | Ropes tracks *how* you solve, not just pass/fail; learners deserve the same mirror. | M |
| 29 | ☐ **Capstone: build the structure itself** — after a pattern's problems: implement the hash map / sorted-array scan in the challenge harness (CodeCrafters model). | Using a structure teaches; implementing it cements. | L |
| 30 | ☐ **Structured self-review** — post-challenge checklist diffing learner solution against reference ("empty array? early exit?") — Exercism's mentor review, automated. | Review is where the learning consolidates. | S |
| 31 | ☐ **Adaptive difficulty** — ace the quiz + challenge fast → offer the harder preset/variant next (Ropes' harder follow-ups). | Keeps strong learners out of boredom, weak ones out of despair. | M |

## Future content expansion (post-flagship — do NOT start before items 1–8)

| # | Item | Why | Size |
|---|---|---|---|
| 32 | ☐ **Graph render kind** — nodes+edges layout, BFS/DFS/shortest-path acts; generators yield `visit`/`frontier`/`relax` frames, render layer is the only new code (engine already algorithm-agnostic). | Graphs are the largest DSA territory the engine can't draw yet. | L |
| 33 | ☐ **Data-structure explorer pages** — per DS (stack, queue, heap, tree, graph): the real-world need first (undo stack, scheduler heap, route graph), then operations animated. | Your stated goal: show the *need* for learning each structure, Khan-style. | L |
| 34 | ☐ **Dual test sets (Code Jam mechanic)** — learner code runs on small n (passes) then large n (brute force's step counter explodes on screen next to optimal's). | Complexity felt, not asserted; the best weakness-teacher ever designed. | M |
| 35 | ☐ **Story challenge mode (Foobar mechanic)** — optional timed challenges reusing earned patterns, wrapped in narrative. | Retrieval practice with stakes; fits the earned-insight arc. | M |

## Sources

- [Khan Academy × Dartmouth algorithms course](https://blog.khanacademy.org/algorithms-on-khan-academy-a-collaboration-with-dartmouth-college-professors/) · [teaching approach](https://cs-blog.khanacademy.org/2014/11/teaching-algorithms-on-khan-academy.html)
- [Brilliant × ustwo design case study](https://ustwo.com/work/brilliant/) · [Brilliant's Rive animations](https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations)
- [AlgoMonster roadmap](https://algo.monster/problems/roadmap) · [20 DSA patterns](https://blog.algomaster.io/p/20-dsa-patterns)
- [Manim (3b1b animation engine)](https://github.com/3b1b/manim)
