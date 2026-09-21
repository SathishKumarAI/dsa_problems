# `src/glossary` — the words, and the web between them

A reader hits "average O(1), because a hash map…" mid-sentence and is not sure
they know what that means. Leaving the page to find out costs them the sentence.
So every such word is a link that carries its own one-line definition, and
`#/g/<slug>` has the rest.

## Change → file

| Change                                                      | File                                       |
| ----------------------------------------------------------- | ------------------------------------------ |
| Add or edit a **structure** (hash map, heap, trie…)         | `terms/structures.ts`                      |
| Add or edit a **technique** (two pointers, DP, BFS…)        | `terms/techniques.ts`                      |
| Add or edit a **cost** word (big-O, amortised, in place…)   | `terms/complexity.ts`                      |
| A new topic FILE (and therefore a new section on the index) | `index.ts` — `TOPICS`                      |
| What a `[[link]]` may look like, how aliases resolve        | `index.ts` — `termOf`, `termLinksIn`       |
| What "what links here" counts                               | `index.ts` — `backlinksOf`                 |
| The shape of an entry                                       | `types.ts`                                 |
| How an entry is drawn                                       | `../components/glossary/glossary-view.tsx` |
| How a linked word looks and what its popover shows          | `../components/glossary/term-link.tsx`     |
| `[[…]]` parsing, for every other surface on the site        | `../lib/markdown.ts` — the `term` span     |

## Writing an entry

`[[hash map]]`, `[[hash-map]]`, `[[dict]]` and `[[hash-map|the table]]` all
resolve to the same entry — slug, term or alias, case- and space-insensitively.
A `[[…]]` that resolves to nothing **fails the build** (`glossary.test.ts`), so
a reader never meets a link to a 404.

Five rules, each of which the gate enforces:

| Rule                                                    | Why                                                                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `short` is one sentence, 60–260 chars, and stands alone | It is the whole popover. A reader who reads only that must not be misled                            |
| `body` is at least two paragraphs                       | A definition with no consequence is a dictionary entry. Say what it costs you, or what it rules out |
| A cost table states at least one `unless`               | A bound with no stated exception is a bound a reader will trust in the one place it does not hold   |
| No entry links to itself                                | A definition that cites itself says nothing                                                         |
| Every `reading` URL is absolute https, and listed once  | `npm run check:links` then hits every one for real — a reading link that 404s is worse than no link |

`source` names the book or paper the definition was written from. It is not a
URL and is not checked by a machine: it exists so the claim can be argued with.

## What is deliberately NOT here

- **No spoilers.** A glossary link names a technique, so linking one inside a
  problem's statement or hints would hand a learner the approach the journey is
  still teaching (the disclosure rule in the root `CLAUDE.md`). Link terms in the
  explanation, the arc, the approach prose and the glossary itself — never above
  the ladder on a problem whose journey is mid-flight.
- **No auto-linking.** Nothing scans prose for the WORD "hash map" and links it.
  A link is authored, which is why the backlinks index can be trusted.
