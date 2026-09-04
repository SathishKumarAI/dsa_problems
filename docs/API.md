# API — the HTTP contract

Base path `/api`. JSON in, JSON out. Stateless: every response is a pure function of the request.
Implemented once in `src/api/routes.ts`; mounted by the Vite dev/preview server, by
`npm run api` (port 8787, CORS `*`), and in-process by `src/api/client.ts` on static builds.

Errors are `{ "error": "<message>" }` with 400 (bad input), 404 (unknown id), 405 (wrong method),
500 (a generator threw — a content bug).

## Problems

### `GET /api/problems`

Every practice-set problem, summarised. `journey` is the slug of the journey that deepens this
problem, or `null`.

```json
[{ "id": "pair-sum", "title": "Pair With Target Sum", "pattern": "arrays-hashing",
   "difficulty": "easy", "brief": "…", "journey": "two-sum" }, …]
```

### `GET /api/problems/:id`

The full problem (statement, examples, hints, approach, complexity, python, walkthrough,
alternatives) plus `journey`.

## Journeys

### `GET /api/journeys`

```json
[{ "slug": "two-sum", "title": "Two Sum", "problemId": "pair-sum", "acts": 7 },
 { "slug": "single-number", "title": "Single Number", "problemId": "single-number", "acts": 5 }]
```

### `GET /api/journeys/:slug`

Journey meta — everything that survives JSON. Functions (`run`, `view`, review `check`s) are not
included; the client keeps those in-process.

```json
{
  "slug": "two-sum", "title": "Two Sum", "subtitle": "…", "problemId": "pair-sum", "leetcode": 1,
  "acts": [{ "key": "story", "name": "The Problem", "short": "start here", "complexity": "…",
             "insight": "", "idea": "…", "tools": [{ "name": "Array", "role": "…" }],
             "code": { "pseudo": ["…"], "python": ["…"], "java": ["…"], "cpp": ["…"] },
             "takeaways": ["…"], "hints": ["…"], "quiz": [{ "q": "…", "choices": ["…"], "answer": 1, "explain": "…" }],
             "gate": null, "chart": true, "nextLabel": null }, …],
  "resources": [{ "label": "LeetCode 1", "url": "…" }],
  "edgeCases": [{ "key": "duplicates", "name": "two equal values", "example": "[3, 1, 3, 8], target 6 → [0, 2]",
                  "why": "…", "think": "…", "preset": "duplicates" }, …],
  "presets": { "random": { "label": "random", "info": null }, "big": { "label": "big (n = 20)", "info": "…" } },
  "defaultPreset": "random",
  "harder": { "preset": "big", "label": "…" },
  "params": [{ "key": "target", "label": "target" }],
  "challenge": { "fname": "twoSum", "signature": "…", "starter": "…", "cases": [ … ],
                 "reference": "…", "review": ["…"], "big": { "n": 400 } },
  "sample": { "nums": [2, 7, 11, 15], "target": 9 }
}
```

> Disclosure note: this endpoint returns **all** acts. It is meta for authors and clients, not a
> learner surface. Learner-facing clients must mask acts past their own `unlocked` count — the
> React app does. The `chart` endpoint filters server-side because its rows are learner-facing.

### `POST /api/journeys/:slug/preset` — `{ "preset": "big" }`

```json
{ "data": { "nums": [ … ], "target": 43 }, "info": "n = 20. …" }
```
404 for an unknown preset. Presets are random where the label says so; call again for a new input.

### `POST /api/journeys/:slug/parse` — `{ "text": "1, 2 3", "params": { "target": "5" } }`

```json
{ "data": { "nums": [1, 2, 3], "target": 5 } }
```
400 when the text does not parse (Two Sum: ≥ 2 integers in 0–999 and an integer target;
Single Number: ≥ 1 integer in 0–127).

### `POST /api/journeys/:slug/classify` — `{ "data": { … } }`

```json
{ "ok": false, "warning": "Contract broken: no pair sums to 99. …" }
```
`ok: true` carries extra fields per journey (`pair`, `single`). Broken inputs are *allowed*; the
warning is what the UI shows.

### `POST /api/journeys/:slug/run` — `{ "act": "hash", "data": { … }, "trace": null }`

```json
{ "frames": [
  { "line": 3, "i": 0, "need": 7, "seen": [], "hit": false, "note": "at 2: I need 7 — haven't seen it yet" },
  { "line": 4, "i": 0, "seen": [[2, 0]], "predict": { "q": "…", "choices": ["…"], "answer": 0 }, "note": "remember: 2 lives at index 0" },
  …
] }
```
Every frame has `note`; the client prepends its own frame 0 ("press play"). `trace` is the
learner's execution (`{ events: [{op, i, v}], result, error }`) and only the challenge act reads
it. 404 for an unknown act, 400 when `data.nums` is not an integer array, 500 if a generator
throws or exceeds 10 000 frames.

### `POST /api/journeys/:slug/chart` — `{ "data": { … }, "upto": 3 }`

```json
[{ "act": "brute", "name": "Brute Force", "steps": 23 }, { "act": "twoptr", "name": "Two Pointers", "steps": 9 }]
```
Steps per algorithm act on this input, for acts with index `< upto` only (the story act, the
challenge and the recap never appear). Omit `upto` for every act — author use only.

## Algorithms

### `GET /api/algorithms`

```json
[{ "key": "bubble", "name": "Bubble Sort", "kind": "sort", "complexity": "O(n²) time · O(1) space" }, …
 { "key": "binary", "kind": "search", … }, { "key": "bfs", "kind": "graph", … }]
```

### `GET /api/algorithms/:key` → `{ key, name, kind, complexity, pseudocode: [] }`

### `POST /api/algorithms/:key/run`

Sorts and search: `{ "array": [3, 1, 2], "target": 2 }` (target for `binary`; the array is
sorted first for search).

```json
{ "frames": [{ "arr": [3,1,2], "marks": {}, "sorted": [], "discard": [], "line": -1, "note": "press play — or step through", "cmp": 0, "swp": 0 },
             { "arr": [3,1,2], "marks": { "0": "compare", "1": "compare" }, "sorted": [], "discard": [], "line": 2, "note": "compare 3 and 1", "cmp": 1, "swp": 0 }, …] }
```
Each frame is a complete snapshot (`marks` values: `compare` · `swap` · `pivot`; `sorted` and
`discard` are index lists; `cmp`/`swp` running counters).

Graphs: `{ "n": 9 }` → `{ "graph": { "nodes": [{x, y}], "edges": [[u, v, w]] }, "frames": [ … ] }`
with frames `{ visited: [], frontier: [], current, activeEdge: [u, v] | null, dist: [] | null, line, note }`.
`dist` uses `null` for ∞ after JSON.

## Client (`src/api/client.ts`)

```ts
api.problems() · api.journeys()
api.preset(slug, key) · api.parse(slug, text, params) · api.classify(slug, data)
api.run(slug, act, data, trace?) · api.chart(slug, data, upto)
api.runArray(key, array, target?) · api.runGraph(key, n)
apiMode() → "http" | "local"
```
Transport: HTTP when `import.meta.env.DEV` (Vite mounts `/api`) or `VITE_API_URL` is set;
otherwise in-process against the same `route()`. Components never call `fetch`.

## Running it

```
npm run dev          # UI + API on the Vite port
npm run api          # standalone: http://localhost:8787/api/problems   (PORT env overrides)
VITE_API_URL=http://localhost:8787 npm run build   # a static build that talks to the server
```

## Not in the API, on purpose

- **Learner code execution.** `node:vm` is not a sandbox. The challenge runs in a browser Worker.
  Backlog B23 covers a real sandbox if a non-browser client ever needs it.
- **Any state.** No progress, no sessions. Progress is localStorage until B24.
