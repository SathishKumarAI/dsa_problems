# Roadmap — where this goes

The backlog says *what next*; this file says *why the next three quarters look the way they do*,
so a session six weeks from now can tell a good idea from a good idea at the wrong time.

## The thesis, restated

Depth before breadth. Two journeys built to completion are worth more than twenty built to the
"tab bar of approaches" level, because the machinery — earned unlocks, predictions, the learner's
own code as the animation, the hash map drawn as a hash map — is what transfers. Once it is proven
on two problems and authorable from one content file, breadth is a content problem, not an
engineering one.

## Now (this branch, shipped 2026-09-04)

One repo. Two journeys. A React stage over a typed, tested, DOM-free engine. An HTTP API in front
of the same engine. Docs that let the next session start from fact.

## Next — Q4 2026: the curriculum layer (B1–B12)

**Goal:** a learner who finishes Two Sum knows where to go next without reading the sidebar.

- Parity work that protects the pedagogy first (B1–B8): the shell must stop leaking pattern
  names, the settings gear returns the motion dial and export/import, focus tiers and the `?`
  overlay come back, and the UI gets an automated smoke test so the next ten features are not
  hand-verified over a debugging socket.
- Then the roadmap page, the dashboard and the two-pointers pattern page (B9–B11), because the
  recap's "study the pattern" link should land on the earned shape, not a list.
- **Exit criterion:** a third journey (candidate: Valid Anagram or Contains Duplicate — both sit
  on the hash-map insight already earned) is authored from `AUTHORING.md` in one sitting, and the
  content gate catches at least one spoiler in review.

## Later — Q1 2027: breadth on proven machinery (B13–B17, third to sixth journey)

**Goal:** one journey per pattern for the first six patterns, each ≤ 1 day to author.

- Structure explorers (stack, queue, hash map) so "need before name" exists for structures, not
  only for problems.
- Spaced repetition and stall analytics: retention and author feedback. Both are local.
- Light theme, first-visit tour.
- Journeys 3–6. Each new journey is expected to add at most one new panel kind
  (`engine/types.ts` `PanelModel`) — a linked-list view and a tree view are the two known gaps.
- **Exit criterion:** the practice-set problem page for every journeyed problem renders its
  walkthrough from the engine (B1 generalised), and `legacy/visualizer/` is deleted (B25).

## Much later — 2027 H2: reach

- Sync (B24) only after export/import has visibly annoyed someone.
- Server-side challenge execution (B23) only when a client that is not a browser exists.
- Sharing (B21): per-moment previews are the one viral surface a no-backend site has.

## Things this roadmap deliberately does not contain

- **An LLM tutor.** The hint ladder is static on purpose: a hint that can be *asked for* is a
  hint that gets asked for. If this changes, it changes as a separate product decision with its
  own PRD, not as a backlog item.
- **A leaderboard.** XP is a private mirror, not a race.
- **Video.** Interaction beats video on retention (see `RESEARCH.md`); the animation is the video.

## Risks to the plan

| Risk | Signal | Mitigation |
|---|---|---|
| Authoring a journey stays a 2-day job | The third journey takes longer than Two Sum's port | Invest in `AUTHORING.md`'s prompt and the content gate before journeys 4–6 |
| The React Compiler lint rules keep fighting the player | Every hook change costs a lint round | Keep state adjustments in event handlers or render-time adjusts; see `use-player.ts` for the pattern |
| The bundle grows with each panel kind | > 300 kB gzip | B22 code splitting; lazy-load features |
| Nobody uses restart / relearn | Restart count stays 0 in the dashboard | Spaced repetition (B15) makes relearning the default path |
