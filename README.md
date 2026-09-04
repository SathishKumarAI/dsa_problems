# dsa.patterns — DSA Interview Prep Site

Pattern-organized interview practice: 10 DSA patterns × 3 problems, each with
progressive hints, an animated step-by-step walkthrough, and multiple solution
approaches (brute force → optimal). Plus SQL drills and statistics flashcards.

Vite + React + TS + Tailwind v4 + shadcn/ui (base-nova). Catppuccin Mocha, forced dark.
All problem statements, explanations, solutions, SQL questions and flashcards are
original write-ups of classic, public-knowledge interview material.

`npm run dev` to run, `npm run build` to typecheck + build.

| Change | File |
|---|---|
| Theme colors (Catppuccin token mapping) | `src/index.css` (`.dark` block) |
| Add/edit a DSA problem or its walkthrough/solutions | `src/data/problems/<pattern>.ts` |
| Pattern names, glyphs, sidebar order | `src/data/patterns.ts` |
| Content types (Problem, Frame, Solution…) | `src/data/types.ts` |
| Register a new pattern file | `src/data/index.ts` |
| SQL drills content | `src/data/sql.ts` |
| Flashcards content | `src/data/flashcards.ts` |
| Walkthrough player (cells, autoplay, scrubber) | `src/components/step-player.tsx` |
| Problem page (tabs: hints/walkthrough/solutions) | `src/components/problem-detail.tsx` |
| Problem list + difficulty badge colors | `src/components/problem-list.tsx` |
| Sidebar navigation + solved counts | `src/components/app-sidebar.tsx` |
| Home dashboard | `src/components/home-view.tsx` |
| SQL page | `src/components/sql-view.tsx` |
| Flashcards page | `src/components/flashcards-view.tsx` |
| Solved-state persistence (localStorage) | `src/lib/progress.ts` |
| View routing / layout shell | `src/App.tsx` |

Adding a problem: one entry in the pattern's data file — the list, detail page,
walkthrough player, and progress tracking pick it up automatically.
Adding a pattern: new `src/data/problems/<id>.ts`, entry in `patterns.ts`,
import in `data/index.ts`.

Walkthrough frames: `cells` (array values + colored role marks + pointer labels)
for array/string problems, `text` (monospace diagram) for lists/trees/graphs.
Roles: focus (mauve), compare (peach), window (blue), done (green).
