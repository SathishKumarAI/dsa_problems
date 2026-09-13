# The brief — for writing one teaching document

Paste this, fill the four placeholders, hand it to whoever is writing (a subagent, a local model, or
yourself on a bad day). It is deliberately written as instructions to a person who has not read this
repo, because that is the reader who gets it wrong.

The shape of this brief is not arbitrary — `docs/AGENTS.md` records which parts were repaid: *read
first, in order* · *exact file ownership* · *the traps named specifically* · *verification as
commands to run and output to paste* · *report what you deliberately left out*. Generic warnings are
ignored; specific ones are acted on.

---

## The brief

> You are writing ONE long-form teaching document for the problem **`<PROBLEM-ID>`** in the repo at
> `<REPO-PATH>`. You own exactly one file: `docs/deep/<PROBLEM-ID>_explained.md`. Do not edit any
> other file. Other people may be writing different documents in that same folder — touch only
> yours.
>
> **Read first, in this order:**
> 1. `docs/deep/README.md` — the house spec. It is the standard you will be held to.
> 2. `docs/deep/TEMPLATE.md` — the skeleton, including the four readers you are writing for.
> 3. `src/data/problems/<PATTERN>/<PROBLEM-ID>.ts` — **the spine.** Its approaches and its Python
>    are what the app teaches. Build on them; do not invent a parallel ladder.
> 4. `docs/deep/pair-sum_explained.md` — a finished document at the bar you are aiming for. Note
>    especially its "Reading the Calculations" section and its `_bug_*` functions.
>
> **What this problem is really about.** <ONE OR TWO SENTENCES: the idea the problem exists to
> teach, so the writer writes ABOUT something instead of narrating code. If you cannot state this,
> stop and work it out before briefing anyone.>
>
> **The traps, named.** <SPECIFIC ONES. "Three-sum's stress check needs sorted triples or it reports
> false disagreements." "This problem's values reach the 32-bit limits, so a sentinel cannot be an
> int." Generic warnings get ignored; these get acted on.>
>
> **Rules that do not bend:**
> - Never copy text from LeetCode or any other site. The statement is written in our own words.
> - Every "common mistake" must be RUN. If you claim a bug returns `40`, run it and quote what it
>   actually returns. One document claimed container-water's returns 40; it returns 8.
> - Every complexity you assert about the code in THIS document must be true of that code. If the
>   data file's label disagrees with what you measure, say so in the prose and file it — do not
>   quietly repeat it, and do not quietly change the data.
> - Any approach you add beyond the data file's ladder gets `*(an addition — not in the data file's
>   ladder)*` on its heading.
> - Prose is capped at 35em on screen; hard-wrap at 100 columns.
> - `_underscores_` are not italics in this corpus, `*asterisks*` are. Headings go no deeper than
>   `###`. No images, no nested lists, no numbered lists.
>
> **Verification — run these and paste the output:**
> ```
> python <the extracted script>                      # every approach agrees
> node scripts/verify-deep.mjs --id <PROBLEM-ID>     # the gate
> node scripts/learn-gaps.mjs --strict               # no undisclosed added rungs
> ```
>
> **Reply with:** the file path, the gate output, the measured numbers your prose quotes, and —
> this is the part that matters — **anything you deliberately left out and why**. A test case that
> violated the problem's own constraints, a rung you could not verify, a claim in the data file you
> think is wrong. That is where the real findings come from.

---

## Variants of the brief

**Retrofitting an existing document** (the common case — 126 of 127 are missing sections):

> The document already exists and is good. Do NOT rewrite it. Add the missing sections only:
> `<LIST FROM docs/LEARN-GAPS.md>`. Keep every existing sentence unless it is factually wrong. If
> you add a measured claim, add the code that measures it to the script at the foot of the file, so
> the number is printed rather than remembered. Then run the three commands above.

**Writing the edge cases** (for the centralised list):

> For `<PROBLEM-ID>`, list every input that breaks a plausible solution: empty, one element, all
> equal, negatives, the value at the constraint's limit, the shape that defeats the naive approach.
> For each, say which approach it breaks and what that approach returns on it — **run it**. Do not
> list an edge case the constraints forbid; a case the input cannot produce teaches nothing.

**Auditing rather than writing:**

> Read `<FILE>` and report only FACTS with line numbers: claims you can check and found false,
> numbers that disagree with the data, approaches whose complexity you measured and found different.
> Do not suggest improvements. Do not rewrite. If you could not determine something, say so
> explicitly rather than guessing — a confident wrong finding costs more than a missing one.
