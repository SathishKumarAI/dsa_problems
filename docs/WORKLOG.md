# Worklog

Newest first. One dated entry per working session; what shipped, with PR numbers.

## 2026-09-03 — AI-platform research round (Ropes, Cosmo, Boot.dev, Exercism, CodeCrafters)

- `docs/RESEARCH.md`: per-platform steal/skip analysis. Ropes' assessment
  mechanics inverted into teaching (hint ladder, skill scorecard, adaptive
  difficulty); Cosmo validates practice-first gates; CodeCrafters → capstone.
- Backlog grew items 26–31. Headline innovation: #26 "your code is the
  animation" — learner's challenge solution instrumented to drive the
  visualization; no surveyed platform closes that loop.
- Google Code Jam/Kick Start/Foobar (discontinued 2023) mined for mechanics:
  dual test sets (small passes, large explodes — complexity felt), story-
  wrapped challenges. Backlog items 32–35 cover graphs, DS explorer pages,
  and those mechanics — locked behind flagship completion.

## 2026-09-03 — research + 25-item backlog, repo CLAUDE.md

- Researched Khan Academy (step diagrams, in-browser coding challenges, quizzes),
  Brilliant (learn-by-doing, progress celebration), AlgoMonster/NeetCode
  (pattern-first roadmap, quiz gates), Manim (morphing animation feel).
- Wrote `docs/BACKLOG.md`: 25 prioritized items. Strategy locked: depth before
  breadth — flagship deep build of Two Sum + two-pointers pattern (items 1–8),
  then generalize. Patterns and visualizations merge into this one project.
- Created repo `CLAUDE.md` (where-to-look table, working agreements) and this
  worklog.

## 2026-09-03 — production polish, five feature branches (PRs #2–#6)

Each branch: built → node tests + live Chrome verification → PR → squash-merge.

- **#2 theme**: Catppuccin Latte light theme via `[data-theme=light]` var
  overrides; `js/ui-prefs.js` sets theme pre-paint; persisted.
- **#3 panels**: draggable sidebar resize (220–600px clamp), width persisted per
  page, dblclick reset; handle injected by JS, no per-page markup.
- **#4 focus**: `body.focus` hides header/sidebar/journey bar; `f` toggles, `Esc`
  exits; button lives in footer so the exit control survives the mode.
- **#5 settings**: native `<details>` gear injected into every header — theme,
  default speed (two-way sync with footer slider), reduce motion.
- **#6 progressive disclosure**: journey bar renders only unlocked acts + a "?"
  node; act completion shows a gate button ("I get it — what's the weakness?");
  unlock persists per page; chart and copy de-spoiled. Content files untouched.

## 2026-09-01 — LeetCode learning journeys (PR #1)

- `problems/` engine (`journey.js`/`journey.css`) + Single Number and Two Sum
  pages: story act, then approaches naive→optimal, each act introduced by the
  insight fixing the previous weakness; edge presets include contract-breaking
  inputs on purpose.

## 2026-08-30 — sorting visualizer (initial)

- `index.html` + `js/`: six sorts + binary search as step generators, precomputed
  frame timeline (step-back, scrub), pseudocode highlight sync, keyboard controls.
