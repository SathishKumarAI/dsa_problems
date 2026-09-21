# `components/problem` — the problem page, by zone

`problem-detail.tsx` was 821 lines against this repo's 500-line ceiling, and the
cost was not tidiness: the rule *"the contents rail may never offer a section the
page did not draw"* lived inside a `.tsx`, which `node --test` cannot load, so it
had been a comment for as long as the rail had existed.

## Change → file

| Change                                                                  | File                     |
| ------------------------------------------------------------------------- | ------------------------ |
| Which bands exist, where each half of the document goes, what the rail offers | `page-sections.ts` — **plain `.ts`, gated by `page-sections.test.ts`** |
| The sticky top band: back link, title, difficulty, target, solved, read-it-all | `orient-zone.tsx`        |
| The brief, the climb, and the three things you can do with a problem     | `act-zone.tsx`           |
| Two rungs side by side (`?compare=a,b`)                                  | `compare-view.tsx`       |
| What is left of the document once the page has placed the rest           | `closing-bands.tsx`      |
| The page itself — state, routing, the review bands                       | `../problem-detail.tsx`  |
| The statement, bounds and examples                                       | `../problem-statement.tsx` |
| The rungs                                                                | `../approach-ladder.tsx` |
| The rail and the reading list                                            | `../problem-closing.tsx` |
| What the page still owes its reader                                      | `../problem-debt.tsx`    |

## The rule these files follow

**A zone owns how something is said; the page owns what is true.** Every file here
takes props and holds no page state — no `useRoute`, no store reads, no ledger.
That is what let `page-sections.ts` become plain `.ts`, and a rule that must fail
the build cannot live anywhere the build's tests cannot reach (the same reason
`watchable.ts` and `doc-sections.ts` are plain).

Node has no path-alias resolver, so `page-sections.ts` imports its siblings with
relative paths and `.ts` extensions — the convention `engine/` and `api/` already
use, for the same reason.
