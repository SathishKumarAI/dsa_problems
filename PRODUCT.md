# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person's own interview and algorithms practice, open-sourced rather than sold
(`docs/PRD.md`, `docs/RESEARCH.md`). The reader is a working or aspiring software engineer
studying data structures and algorithms — the same person who would otherwise be grinding a
LeetCode list — and the owner is the first and most demanding of them.

Confirmed 2026-09-16: there is no single dominant reading scene. The product has to hold up
**bright and dark, long sittings and short ones** — an evening's deep study, twenty minutes
grabbed between other work, and the days before an interview when it is scanned rather than
read.

## Product Purpose

**Teach the IDEA before its name.** A learner meets a problem, feels why the obvious approach
runs out of road, and only then is told what the technique is called. Success is a reader who
can re-derive an approach months later, not one who has memorised that "this is a two-pointer
problem".

The counter-metric the repo measures itself on: a claim on a page that does not survive being
RUN. Several shipped approaches labelled "optimal" were measured slower than the rung below
them; finding and fixing those is treated as the product working.

## Positioning

A neighbouring product could copy the problem list. It could not truthfully copy:

- **The ledger-gated ladder.** Approach names, the arc, and the long explanation are withheld
  while a journey is mid-flight, so the reader cannot skip to the answer. Progressive
  disclosure is enforced by tests, not by convention.
- **Every claim is run.** `verify:run` compares every Java and C++ block against the Python
  oracle; `verify:vectors` mutation-tests the cases; `verify-deep` executes all 82 teaching
  scripts. Complexity claims are timed, not asserted.
- **One page per problem.** Statement, bounds, checks, hints, the animated walkthrough, every
  approach in build order, and the full teaching document are one document with no second
  route and nothing behind a door.

## Operating Context

Read in a browser, often beside a LeetCode tab (the page explains and deliberately hosts no
editor; "Solve on LeetCode" is a link out). Python in the page runs through Pyodide. Content
is authored as typed records and Markdown teaching documents, gated in CI.

## Capabilities and Constraints

- **153 problems, 19 patterns, 93 journeys.** 84 problems have a typed directory; 82 have a
  teaching document; 71 have none.
- A **journey** is acts with a stage, transport, predict, quiz, hint ladder and a code
  challenge. It owns a canvas: embedded in a page it is opened fullscreen.
- The **engine is DOM-free and JSON-safe**, with an HTTP API (`docs/API.md`).
- Eight gates. CI runs six of them; `verify:vectors` is currently RED with 22 unexplained
  survivors across 11 problems (G12).
- Terminology that is load-bearing and must not drift: **pattern, problem, journey, act, rung,
  the ladder, the arc, bound, corner case**.

## Brand Commitments

- **Name: Patternsmith.** Tagline: *earn the insight, then the name*. Repo slug stays
  `dsa_problems` so no link breaks.
- **The chip grammar is taught vocabulary and may not be redesigned away** (confirmed
  2026-09-16): the four cell roles — focus, compare, window, settled — and their marks are
  read across 93 journeys. A reader learns them once and relies on them everywhere.
- **Mono for data, sans for prose** (confirmed 2026-09-16). Values, indices, counts, act keys,
  code and notation are monospace; sentences are not. Enforced across 668 constraint lines by
  `lib/notation.ts`.
- **The palette is NOT committed** (confirmed 2026-09-16). The owner asked for a modern,
  futuristic colour world and explicitly rejected "AI slop".

## Evidence on Hand

Real, and unusually strong for a product this size — all of it measured in-repo, none of it
invented:

- Timings that contradict the labels: `top-k-frequent`'s "optimal" bucket rung at **13.2 ms**
  against **3.7 ms** for the heap; `contains-duplicate`'s `len(set(nums))` beating the
  early-exit rung by 60% on the worst case and losing by **33×** on the best.
- Corpus counts: 668 constraint lines, 170 notation and 498 English. 7,807 words in one
  teaching document, 54% of it per-approach.
- Gate output: 831 node tests, 178 real-Chrome checks, 82/82 teaching scripts, 338 fences
  clean against a baseline of 7.

**Absences that must not be fabricated:** no users beyond the owner, no traffic, no testimonials,
no revenue, no benchmarks against other products.

## Product Principles

1. **Insight before name.** Nothing may leak an approach's name, the arc, or the ending to a
   reader who has not earned it.
2. **Measure, do not infer.** A number on a page is a reading, not a belief. Claims that are
   not run are treated as defects.
3. **One place per thing.** Everything about a problem lives on its page, and nothing on that
   page is said twice.
4. **The gate moves with the design, never around it.** When a decision changes what is true,
   the test is rewritten to assert the new truth — never deleted to let the change through.
5. **Reading is the product.** Type, measure and contrast serve long reading; decoration that
   competes with the stage, the code or the numbers is a defect.

## Accessibility & Inclusion

Enforced today and not to be regressed: every sentence at 14px or larger, 0 text nodes below
WCAG AA, a 44px touch floor below `lg`, one focus ring on `:focus-visible` app-wide, a
reduced-motion override that zeroes every transition, and prose within a measure the U7 gate
bounds.
