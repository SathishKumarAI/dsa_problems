# Content patterns — making one problem page learnable, then the next

The owner's brief, 2026-10-17, on `#/p/two-pointers/sorted-pair-sum`: _a page to learn from, not
to read and memorise. Paragraphs into points. Nothing said twice. The long tail shorter. Run
should run the example we have been discussing._ This file is what that pass found, written so
the next page takes an hour instead of an afternoon. Two kinds of entry: **patterns** to apply, and
**findings** that each turned out to be site-wide. The pilot is sorted-pair-sum; the numbers are
from it unless a row says otherwise.

Pair it with `docs/PROBLEM-PAGE-PLAYBOOK.md`, which says what to **author** (the five fields).
This file says how to make what is already authored **read**, and how to prove the page works.

## 1. The read-through — do this before changing a word

Read the page the way a learner meets it, in a real browser, and measure. Reading the source
files finds none of the things below; four of the six were invisible in the `.ts`.

| Step                                                                | How                                                                                           | What it caught on the pilot                                                                                                           |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Dump the rendered text, count words and screens                     | `main.innerText`, `scrollHeight / innerHeight` at 1440                                        | 5 937 words, 23.0 screens — the explanation was 56 % of the page                                                                      |
| Read each section **against the sections above it**                 | ask of every paragraph: is this already on the screen?                                        | "Understanding" restated the statement and the four bound cards; "Calculations" repeated the optimal rung's trace and its proof twice |
| Look for Markdown the renderer cannot draw                          | tables inside blockquotes, `1.` lists, nested lists (`lib/markdown.ts` has none of the three) | a measured table rendered as one line of literal pipes; six drills rendered as one run-on paragraph                                   |
| **Press every Run button** and read the output                      | script it: click, wait for `exit 0` or `error ·`, read the panel                              | 3 of 6 raised `SyntaxError: 'return' outside function`; the other 3 printed `[]`                                                      |
| Click every in-page link, read where it landed                      | heading's `getBoundingClientRect().top` after 3 s                                             | the rail's second "Code" landed 148px above the viewport (fixed site-wide in #128)                                                    |
| Check the tab is actually painting before trusting any of the above | `document.visibilityState === "visible"`                                                      | an occluded tab froze rAF and made every anchor look dead                                                                             |

## 2. Writing patterns — apply in this order

Each pattern names the section it governs, what it replaces, and the pilot's before/after.

### P1 · Say it once — the cards own the bounds, the statement owns the task

"Understanding the problem" used to open with a paraphrase of the statement and close with a
four-row table of the constraints. Both are on the screen directly above it: the statement under
"What it asks", the constraints as the bound cards with their figures. Everything restated is a
reason to skim.

What stays: **the one question under the statement**, then **the two or three facts that decide
every approach**, as points, then **the tell** that says which world you are in.

```
**The question under the statement:** for each value, does its partner — `target − value` — sit
somewhere else in the list?

Three facts decide everything that follows:

- **The list is sorted.** Where a value sits already says how big it is. …
- **Exactly one answer exists.** Stop at the first hit. …
- **O(1) extra space.** No map, no copy. …

Two worlds, one tell: if the input is **not** sorted, the hash map is the right answer …
```

### P2 · Points, with a bold lead — one idea per line

A paragraph of five sentences hides its structure; the reader has to find the joints. Write the
joints. Each bullet opens with the two-to-five words that are its point, in bold, then one or two
sentences. Five bullets is the ceiling; past that it is a list, not a thought.

Applies to: "How to think about it", "Common mistake", the arc, "Interview priority", any
paragraph over four sentences.

### P3 · A mistake is bug / what it does / the fix

```
- **The bug:** `while i <= j`. At `i == j` an element is added to itself — a `6` with
  `target = 12` returns `[2, 2]`. The condition is the strict `i < j`.
- **Its cousin:** moving the wrong pointer. …
```

Name the exact line, the exact input that exposes it, the exact wrong output. A mistake described
in the abstract ("off-by-one errors are common") teaches nothing a reader can check.

### P4 · Intuition is a picture in five bullets, and the last one is the picture to keep

Two fingers, a guest list, a dial. One image per approach, built up over three or four bullets,
and the final bullet says **"Keep this picture:"** and names it. That last line is what comes back
a month later.

### P5 · Cost is one bold line, then "reach for it when"

```
**Time O(n), space O(1).** Each iteration moves one pointer inward and no pointer ever moves back,
so the starting gap of n − 1 bounds the loop. Two indices and a sum.

Reach for it when the input is sorted … Strictly better than the map here on space and no worse
on time, and it is the move three-sum, k-sum and container-with-most-water are built on.
```

The first paragraph COUNTS the bound. The second says when to choose this rung over its
neighbours. Nothing else belongs here; the trace is in "Worked example".

### P6 · A measured claim is a table in the flow, then three take-aways

Never inside a blockquote: `lib/markdown.ts` parses a `>` block as prose, so a table in it
renders as literal pipes. The pilot's dict-versus-pointer timings had shipped that way since the
conversion. Put the table in the flow, two or three rows, and follow it with the bullets that say
what the numbers mean — the sentence that refutes the paragraph above it is the one worth keeping.

### P7 · Drills are bullets, each ending in "Done when"

The renderer has no ordered lists, so `1. … 2. …` arrives as one paragraph. Bullets, bold lead,
and every drill ends with a test the reader can apply to themselves: _Done when you can say what
`while lo < hi` protects against._

### P8 · The arc is one principle, one bullet per rung, one template to carry out

```
One principle: **stop re-deriving what you already know.**

- Brute force keeps nothing between outer steps …
- The hash map writes down every value it passes …
- The converging pointers cash that fact in …

**The template to carry out:** a sorted sequence plus a quantity that moves one way as each end
moves means converging pointers apply …
```

The template is the sentence that transfers to the sibling problems; name the siblings.

### P9 · A bound card is two or three sentences about what the bound BUYS

Not what the bound is — the card's header already shows the line. Why it is there, which rung it
rules in or out, and the trap in reading it wrong. The pilot's four cards went from 60–70 words
each to 30–40 and lost nothing a learner uses.

### P10 · Keep what only this page has

Cut duplication, not substance. On the pilot, three things exist nowhere else and stayed: the
**symbol table** (what `lo` and `hi` MEAN, not what they do), the **printed elimination** (the
script's own output showing what one comparison throws away), and the **counted table** (n against
pairs examined, from the script). If a section is the only place a fact lives, it is not the long
tail — it is the page.

## 3. Tone — the lecture pattern worth borrowing

The owner pointed at a long-form DSA lecture series (Scaler's full-course playlist) as the
explanation style to learn from. No transcript was read for this; the pattern below is the
structure such lectures share, matched to where each beat already lives on a page here. The point
is not to imitate anyone — it is that this ordering is why those explanations land.

| Lecture beat                                                                                   | Where it lives on the page                                                               | The rule it implies                                                                         |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Start with one concrete example, and never leave it.** Every idea is shown on the same array | the statement's example, the walkthrough, every worked table, **the Run button's input** | one example per page, verbatim everywhere — see finding F2                                  |
| **Say the brute force out loud first**, and count what it costs                                | rung 01 and its cost                                                                     | the baseline is named before anything clever; its cost is a number, not "slow"              |
| **"Can we do better?" — then the observation**, not the technique's name                       | `whyNow` between rungs; the journey's `insight`                                          | insight before name (the product rule); the observation is a question the reader can answer |
| **Dry-run on the example, as a table of state**                                                | "Worked example"                                                                         | one row per step, the same columns on every rung, the winning row in bold                   |
| **Complexity counted, per approach**, with what each term is                                   | "Complexity and when to use this"; `costWhy`                                             | P5 — count it, then say when to reach for it                                                |
| **Edge cases named with the input that triggers each**                                         | "Common mistake"; the bound cards                                                        | P3 — exact line, exact input, exact wrong output                                            |
| **Code last, and short**, after the idea is already owned                                      | the rung's code, the explanation's `Code`                                                | code is transcription of the sentence above it; the sentence comes first                    |
| **"What if…" — the variations that reuse the move**                                            | "the same move, elsewhere"; the arc's template                                           | P8 — the template, then the siblings by name                                                |
| **Ask the listener before telling them**                                                       | "Before you solve it"; the journey's predicts                                            | a check is answerable from the statement alone, and says WHY the answer is right            |

Voice: second person, present tense, short sentences, the picture before the term. A paragraph
that could be read aloud in one breath is the right length. Anything that sounds like a textbook
heading ("Approach 2: Hash Map Technique") is a smell; anything that sounds like a teacher at a
whiteboard ("look at what it is remembering") is the target.

## 4. Mechanics that must hold on every page — now gated

These are not style. Each one shipped broken on the pilot and each now has a test.

| Rule                                                                                                                                           | Why it failed                                                                                                                                                                           | Where it is enforced                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **R1 — every rung's Python defines a function.** Run appends a call to it                                                                      | the early journeys wrote act code tabs as the BODY alone, line-for-line with the animation; Run raised `'return' outside function` on all three rungs                                   | `ladderOf` takes the record's code when the act's is body-only, and wraps the act's lines in the record's signature when no record rung exists; `problems.test.ts` asserts the list of rungs without a function is EMPTY |
| **R2 — Run uses the statement's example** when the vectors carry it                                                                            | the demo was `vectors[0]`, and the vectors put the nastiest case first on purpose (`[2], 4`), so Run printed `[]` under a page about `[1, 3, 6, 9]`                                     | `scripts/gen-demos.mjs` matches `examples[0].input` against the cases — 130 of 152 now; `demos.test.ts` pins two                                                                                                         |
| **R3 — the output names the call.** `sorted_pair_sum([1,3,6,9], 12)`                                                                           | the appended line went to Python, never to the screen; "the input is not given"                                                                                                         | `runnable-code.tsx`, the output header                                                                                                                                                                                   |
| **R4 — an alternative that an act names carries the act's `key`.**                                                                             | `rungKey` slugs "Brute force" to `brute-force`; the act is `brute`; they never met, so the rung had no `costWhy`, no `whyNow` fallback and no code                                      | seven alternatives across four problems gained their keys the same day; the R1 gate fails on any new one                                                                                                                 |
| **R6 — a Markdown document's `###` ids are scoped under their `##`.** `approach-1-brute-force-code`, the shape the typed documents already use | every approach writes the same six `###`; slugged alone they collided — 125 duplicate-key warnings from the rail on pair-sum, and a second "Code" entry that could only reach the first | `lib/markdown.ts` `headingIds`; `markdown.test.ts` _identical sub-headings under different sections get distinct ids_; the per-rung folds pass `idPrefix`                                                                |
| **R5 — every in-page jump goes through `lib/scroll-to.ts`.**                                                                                   | the reading room's reflow moved the target mid-scroll; landed 148px above the viewport                                                                                                  | `ui-smoke`: _a jump from the rail lands on its heading_ (#128)                                                                                                                                                           |

## 5. Findings — dated, with status

| Date       | Finding                                                                                                                                | Scope measured                                                                                                                    | Status                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 2026-10-17 | Rail anchors overshoot after the chrome hides                                                                                          | every anchor site, 6 call sites                                                                                                   | fixed site-wide, #128                                                                                                   |
| 2026-10-17 | Code editors a fixed 320px whatever the code                                                                                           | every runnable block                                                                                                              | fixed site-wide, #128                                                                                                   |
| 2026-10-17 | Understanding restates the statement and the bound cards                                                                               | pilot; likely every converted document                                                                                            | fixed on the pilot (#129); **pattern P1 for the rest**                                                                  |
| 2026-10-17 | Tables inside blockquotes render as pipes                                                                                              | pilot's hash rung; grep `> \|` to find more                                                                                       | fixed on the pilot; **P6**                                                                                              |
| 2026-10-17 | Numbered drills render as one paragraph                                                                                                | every `fluent` with `1.` — 10 documents                                                                                           | fixed on the pilot; **P7**                                                                                              |
| 2026-10-17 | Ladder Python is body-only, Run raises                                                                                                 | 19 of 238 acts site-wide                                                                                                          | fixed site-wide: ladder rule + keys on 9 alternatives + a wrap for the 2 acts with no record rung — **0 remain**, gated |
| 2026-10-17 | Run's input is the vectors' edge case, not the example                                                                                 | 152 demos; 130 now match the example                                                                                              | fixed site-wide                                                                                                         |
| 2026-10-17 | Alternatives without `key` never meet their act                                                                                        | 20 of 238 acts matched by key                                                                                                     | fixed on every journey that needed it — 29 of 238 acts now key-linked                                                   |
| 2026-10-17 | Markdown documents give every approach's sub-headings the same id; the rail's keys collide and its links reach only the first approach | every Markdown-documented problem (the duplicate-key warning first seen on container-water was this, from a cached pair-sum rail) | fixed site-wide — **R6**                                                                                                |
| 2026-10-17 | On a typed document the rung's "Work it through" fold and the explanation's per-approach sections cover the same ground                | every typed document with a journey                                                                                               | **open — B100's second half**, a renderer change, not a rewrite                                                         |

**Every rung on every page can be called** (the R1 gate holds an empty list). Two acts have no
record rung at all — pair-sum's two-pass hash, single-number's brute force — and show the act's
lines under the record's `def` line; their bodies use the record's parameter names, which is what
makes that honest. A new act written as a body alone fails the gate until its alternative carries
the act's `key`, or the record's signature fits it.

## 6. The checklist — copy it into the PR

```
Read-through (before)
- [ ] rendered words / screens at 1440 recorded
- [ ] every Run pressed: input shown, output non-empty, no traceback
- [ ] every rail link lands on its heading
- [ ] Markdown the renderer cannot draw: no `> |`, no `1.`, no nested lists

Writing
- [ ] P1  Understanding = one question + 2–3 facts + the tell; no statement, no bound table
- [ ] P2  no paragraph over four sentences without a reason
- [ ] P3  every mistake is bug / what it does / fix, with the exact input
- [ ] P4  every intuition ends with the picture to keep
- [ ] P5  every cost is one counted line + "reach for it when"
- [ ] P6  measured tables in the flow, followed by their take-aways
- [ ] P7  drills are bullets ending in "Done when"
- [ ] P8  arc = principle, one bullet per rung, the template, the siblings
- [ ] P9  cards ≤ 3 sentences about what the bound buys
- [ ] P10 the page's unique material named and kept

Mechanics
- [ ] R1  every rung's Python has `def` (the gate's list did not grow)
- [ ] R2  Run's input is the statement's example (or say why the vectors cannot carry it)
- [ ] R4  alternatives carry their act's `key`

After
- [ ] words / screens recorded again; `npm run check`; `npm run test:ui`
- [ ] this file's findings table updated if anything new turned up
```
