<!--
Thanks for contributing. The sections below are the ones a reviewer actually reads.
Delete any row that genuinely does not apply, but do not delete Verification.
-->

## Why

<!-- The problem or gap this closes. One or two sentences. If it closes a backlog item, name it: B68, G11. -->

## What changed

<!-- What a reader of the diff would want told to them, not a restatement of the diff. -->

## Scope

<!-- What you deliberately did NOT do, and why. A PR that names its own edges is easier to trust. -->

## Verification

**Fill this in with real output, not assertions.** "Should work" and a green diff are not
verification. If something is unverified, say which part and why.

| Gate | Result |
|---|---|
| `npm run check` | <!-- e.g. 758 tests, 0 failed --> |
| `npm run test:ui` | <!-- e.g. 166 checks, 0 failed · or "not applicable, no rendered change" --> |
| `npm run verify:code` | <!-- only if you touched a Java or C++ block --> |
| `npm run verify:run` | <!-- only if you touched solution code --> |
| `node scripts/verify-deep.mjs` | <!-- only if you touched docs/deep/** --> |
| `node scripts/learn-gaps.mjs --strict` | <!-- only if you touched docs/deep/** --> |

**Measured numbers**, if this PR makes a claim about cost or correctness:

<!--
Instrument the bound, do not quote it. Exact counts (probes, comparisons, allocations)
reproduce anywhere and are preferred; timings are fine if you say they are one machine's
and name the shape of the column as the claim.
-->

**Behaviour verified the way a user would hit it** — driving the page, not reading the code:

<!-- Which route, which click, what you saw. -->

## Checklist

- [ ] Branch is `type/scope-slug`; commits are conventional, and the body says **why** and **what was measured**
- [ ] `npm run check` exits 0
- [ ] Ledger updated **in this same commit** — `docs/BACKLOG.md` item ticked, `docs/FEATURES.md` row added, ratchet lowered
- [ ] Docs updated where this change invalidates them
- [ ] No text copied from LeetCode or any other site — statements and examples are written in our own words
- [ ] Nothing left half-migrated behind a flag nobody knows about
- [ ] Any bug I found outside this PR's scope is **fixed or filed** — and I said which

### If this touches a teaching document

- [ ] All three required sections present: *Reading the Calculations*, *How to Get Fluent*, and an
      `Under the hood` callout **carrying a measured number**
- [ ] Every number in the prose is printed by the document's own script
- [ ] Timings are labelled as one machine's, with the column's shape named as the claim
- [ ] Any approach the document adds beyond the data file's ladder is **disclosed** in its heading

### If this touches a journey

- [ ] No unearned act or pattern name anywhere a learner can see — stepper, banners, chart, hints,
      quiz, URL
- [ ] Every declared corner case is tagged by a frame on its own preset
- [ ] If this problem previously had a static `walkthrough`, it is **deleted in this same commit**
