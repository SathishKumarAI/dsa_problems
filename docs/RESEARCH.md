# Platform research — what to steal, what to skip

Study of AI-era coding platforms feeding `BACKLOG.md`. Each section: what the
platform does, the mechanism worth stealing, and how it lands here (item #).
Earlier research (Khan Academy, Brilliant, AlgoMonster, Manim) lives in the
BACKLOG intro; this file covers the AI-coding-platform sweep.

## Ropes (ropes.ai) — AI coding assessments

Hiring tool, not a learning tool — but its assessment mechanics invert cleanly
into teaching mechanics:

| Ropes feature | Inverted for learning | Backlog |
|---|---|---|
| Tracks *how* candidates solve (approach, efficiency), not just test-pass | Skill scorecard after the code challenge: correctness, step-efficiency vs optimal, edge cases handled | #28 |
| Dynamic hints when stuck on syntax; harder follow-ups when cruising | Hint ladder (nudge → concept → pseudocode line) + harder-variant offers | #27, #30 |
| Generates problems from a job description / docs | We already do this: LeetCode URL → Claude generates the content file | schema, #8 |
| Detailed scorecards per assessment | Same data, but shown TO the learner as growth, not gatekeeping | #28 |

## CodeSignal Cosmo — "Duolingo for job skills"

Practice-first micro-lessons in a chat with an AI tutor that remembers you and
**checks mastery before letting you move on**. Their published lesson design:
no passive video, every screen is a doing-screen. Validates our quiz-gate +
predict-mode direction (#2, #3); the persistent-profile idea maps to our
localStorage progress (#10) without needing their backend.

## Boot.dev — gamified backend curriculum

XP/levels/quests + mascot AI tutor ("Boots") that **gives hints, never
answers**. The hint-not-answer discipline is the single rule worth copying
into our hint ladder (#27). Their "don't let students get bored" pacing =
short acts, which we already have.

## Exercism — free, mentor-reviewed practice

8,600+ exercises, 83 languages, human mentors review your solution. We can't
ship humans, but the *structured self-review* transfers: after the code
challenge, a checklist diff against the reference solution ("did you handle
the empty array? did you exit early?") — #30.

## CodeCrafters — learn by building the real thing

"Build your own Redis/Git/shell." Deepest retention of the lot: you don't
learn hash maps by using one, you learn by **implementing one**. Lands as the
capstone tier (#29): after mastering a pattern through problems, build the
data structure itself in the browser challenge harness.

## Google's coding competitions (Code Jam, Kick Start, Foobar) — discontinued, mineable

All shut down in 2023 — which makes their mechanics free to replicate:

| Mechanic | Why it taught well | Lands here |
|---|---|---|
| **Two test sets per problem**: small (visible, brute force passes) + large (hidden, brute force times out) | Complexity is *felt*, not asserted — your solution literally fails at scale | #34: run learner code on n=10 (passes) then n=10⁵ (watch the step counter explode vs the optimal's) |
| Story-wrapped problems (Foobar's narrative frame) | Motivation before mechanics | Validates our story acts; #35 wraps challenge mode in narrative |
| Tiered rounds (Kick Start's guided difficulty ramp) | A ramp, not a wall | Roadmap DAG (#9) ordering |

## Topic expansion — beyond arrays

Current engine renders bars (sorts) and chips (arrays). Graphs, trees, heaps,
stacks/queues need their own render kinds — and their own "why this exists"
motivation (graph = routes/social networks, heap = schedulers, stack = undo).
Items #32–#33. The generator-yields-frames architecture already supports this:
a BFS generator yields `visit`/`frontier` frames; only the render layer is new.

## The innovation these platforms point at (and none of them do)

Every platform separates *watching* (visualizer, video, animation) from
*writing* (editor, tests). The gap — and our differentiator:

> **Your code is the animation.** The learner writes the two-pointer loop in
> the in-browser editor; we instrument it (yield per iteration) and drive the
> SAME chip visualization from *their* execution. Off-by-one? They watch their
> own pointer walk past the answer. No platform in this sweep closes that loop.

This is backlog #26 and the north star for the flagship build: learn and
implement stop being separate modes.

## Sources

- [Ropes AI overview](https://creati.ai/ai-tools/ropes-ai/) · [features/review](https://opentools.ai/tools/ropes-ai) · [screening review](https://declom.com/ropes/)
- [Cosmo launch (VentureBeat)](https://venturebeat.com/infrastructure/codesignals-new-ai-tutoring-app-cosmo-wants-to-be-the-duolingo-for-job-skills) · [CodeSignal on AI tutoring](https://codesignal.com/blog/engineering/what-we-learned-when-we-gave-developers-access-to-an-ai-powered-tutor/) · [practice-first (Forbes)](https://www.forbes.com/sites/rayravaglia/2025/08/20/codesignal-cosmo-and-the-future-of-practice-first-learning/)
- [Boot.dev alternatives comparison](https://scrimba.com/articles/best-boot-dev-alternatives-2026/) · [Boot.dev review](https://coddy.tech/vs/boot-dev)
- [Coding challenge sites roundup (Exercism, CodeCrafters)](https://rockstardeveloperuniversity.com/best-coding-challenge-websites/)
- [Code Jam discontinued (Wikipedia)](https://en.wikipedia.org/wiki/Google_Code_Jam) · [Google's farewell rounds](https://developers.googleblog.com/en/celebrate-googles-coding-competitions-with-a-final-round-of-programming-fun/) · [Kick Start prep guide](https://www.geeksforgeeks.org/dsa/prepare-google-kickstart/)
