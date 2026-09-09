// Word Search, derived. The board arrives as one token per ROW (cells:
// "words"), which is how the problem's own examples are written, and the word
// is a string param — so a learner can change either half.
//
// The middle rung is DELIBERATELY WRONG, like the greedy rung in fewest-coins.
// It differs from the correct version by one line — the restore on the way out
// — and it is the single most common bug in this problem, so it is taught by
// being run rather than by being described.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/graphs/word-search.ts"

type B = Data<string> & { word: string }

const USED = "#"

const cellsOf = (rows: string[]) => rows.map((r) => [...r])

/** The reference: can the word be spelled, with no cell reused in one path? */
export function canSpell(rows: string[], word: string): boolean {
  if (!word) return true
  const g = cellsOf(rows)
  const R = g.length
  const C = g[0]?.length ?? 0
  const walk = (r: number, c: number, at: number): boolean => {
    if (at === word.length) return true
    if (r < 0 || c < 0 || r >= R || c >= C) return false
    if (g[r][c] !== word[at]) return false
    const keep = g[r][c]
    g[r][c] = USED
    const found =
      walk(r + 1, c, at + 1) ||
      walk(r - 1, c, at + 1) ||
      walk(r, c + 1, at + 1) ||
      walk(r, c - 1, at + 1)
    g[r][c] = keep
    return found
  }
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) if (walk(r, c, 0)) return true
  return false
}

/** The same walk without the restore — the bug this journey exists to show. */
export function canSpellGreedy(rows: string[], word: string): boolean {
  if (!word) return true
  const g = cellsOf(rows)
  const R = g.length
  const C = g[0]?.length ?? 0
  const walk = (r: number, c: number, at: number): boolean => {
    if (at === word.length) return true
    if (r < 0 || c < 0 || r >= R || c >= C) return false
    if (g[r][c] !== word[at]) return false
    g[r][c] = USED
    return (
      walk(r + 1, c, at + 1) ||
      walk(r - 1, c, at + 1) ||
      walk(r, c + 1, at + 1) ||
      walk(r, c - 1, at + 1)
    )
  }
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) if (walk(r, c, 0)) return true
  return false
}

const board = (
  g: string[][],
  label: string,
  mark?: (r: number, c: number) => ChipRole | undefined
) => {
  const marks: Record<string, ChipRole> = {}
  g.forEach((row, r) =>
    row.forEach((_, c) => {
      const m = mark?.(r, c)
      if (m) marks[`${r},${c}`] = m
    })
  )
  return { cells: g.map((row) => [...row]), marks, label }
}

const wellFormed = (nums: string[], word: unknown) =>
  nums.length > 0 &&
  nums.every((r) => r.length === nums[0].length && /^[a-z]+$/.test(r)) &&
  typeof word === "string" &&
  /^[a-z]+$/.test(word)

function* story({ nums, word }: B): Generator<DFrame> {
  const g = cellsOf(nums)
  const answer = canSpell(nums, word)
  const greedy = canSpellGreedy(nums, word)
  yield {
    hold: 3,
    noChips: true,
    note: `A board of letters and a word. Can "${word}" be spelled by stepping between neighbouring cells — up, down, left, right — without standing on any cell twice?`,
  }
  const starts = g.flatMap((row, r) =>
    row.map((ch, c) => (ch === word[0] ? [r, c] : null)).filter(Boolean)
  ) as number[][]
  yield {
    hold: 3,
    grid: board(g, `starts with "${word[0]}"`, (r, c) =>
      starts.some(([sr, sc]) => sr === r && sc === c) ? "focus" : undefined
    ),
    state: [
      { label: "word", value: word },
      { label: "possible starts", value: starts.length },
    ],
    note: `${starts.length} ${starts.length === 1 ? "cell holds" : "cells hold"} the first letter, so there ${starts.length === 1 ? "is one place" : "are that many places"} the path could begin. Each has to be tried — nothing about the board says which one leads anywhere.`,
  }
  yield {
    hold: 3,
    grid: board(
      g,
      answer ? `"${word}" is on the board` : `"${word}" is not on the board`
    ),
    state: [{ label: "answer", value: String(answer) }],
    answer,
    corner:
      answer !== greedy
        ? "restore"
        : !answer
          ? "reuse"
          : word.length === 1
            ? "single"
            : undefined,
    note:
      answer !== greedy
        ? `The answer is ${answer}. Hold on to this board: it is one where a wrong path has to be given BACK. A search that keeps every cell it ever stepped on answers ${greedy} here, and the difference is one line.`
        : !answer
          ? `${answer}. Somewhere the letters run out or the path would have to stand on a cell it is already using — and a cell may not be reused within one path, however tempting.`
          : word.length === 1
            ? "A single letter, so the answer is just whether that letter appears anywhere. No path, no reuse question — and the base case that ends every longer search."
            : `${answer}. Note what has to be true at each step: the neighbour must hold the NEXT letter, not any letter, so most branches die immediately.`,
  }
}

/** Rung 1 — enumerate paths of the word's length, then check them. */
function* enumerate({ nums, word }: B): Generator<DFrame> {
  const g = cellsOf(nums)
  const R = g.length
  const C = g[0].length
  let built = 0
  let checked = 0
  let hit: number[][] | null = null
  const paths: number[][][] = []
  const grow = (path: number[][]) => {
    if (hit) return
    if (path.length === word.length) {
      built++
      paths.push(path)
      checked++
      if (path.every(([r, c], i) => g[r][c] === word[i])) hit = path
      return
    }
    const [r, c] = path[path.length - 1]
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue
      if (path.some(([pr, pc]) => pr === nr && pc === nc)) continue
      grow([...path, [nr, nc]])
      if (hit) return
    }
  }
  yield {
    line: 1,
    grid: board(g, "every walk of the right length"),
    state: [{ label: "word length", value: word.length }],
    note: `Forget the letters for a moment. Build every path of ${word.length} ${word.length === 1 ? "cell" : "cells"} that never repeats a cell, then look at each one and ask whether it spells the word.`,
  }
  for (let r = 0; r < R && !hit; r++)
    for (let c = 0; c < C && !hit; c++) {
      grow([[r, c]])
      yield {
        line: 5,
        grid: board(g, `paths built: ${built}`, (rr, cc) =>
          rr === r && cc === c ? "anchor" : undefined
        ),
        state: [
          { label: "paths built", value: built },
          { label: "paths checked", value: checked },
        ],
        note: hit
          ? `Starting from ${r},${c} one of them spells "${word}". It was found by checking whole paths, most of which went wrong at the second letter and were built to the full length anyway.`
          : `Every path starting at ${r},${c} has been built and checked: ${built} so far, none of them the word. Nothing stopped a path that was already spelling nonsense.`,
      }
    }
  const answer = canSpell(nums, word)
  yield {
    line: 8,
    answer,
    grid: board(g, answer ? "found" : "not on the board", (r, c) =>
      hit && (hit as number[][]).some(([hr, hc]) => hr === r && hc === c)
        ? "answer"
        : undefined
    ),
    state: [
      { label: "answer", value: String(answer) },
      { label: "paths built", value: built },
    ],
    corner: word.length === 1 ? "single" : undefined,
    note: `${answer}, after building ${built} ${built === 1 ? "path" : "paths"}. The waste is structural: a walk whose second letter is already wrong is still extended to the full length of the word before anyone looks at it.`,
  }
}

/** Rung 2 — DFS matching as it goes, but never freeing a cell. THE BUG. */
function* greedyWalk({ nums, word }: B): Generator<DFrame> {
  const g = cellsOf(nums)
  const R = g.length
  const C = g[0].length
  let steps = 0
  const burned: number[][] = []
  function* walk(r: number, c: number, at: number): Generator<DFrame, boolean> {
    if (at === word.length) return true
    if (r < 0 || c < 0 || r >= R || c >= C) return false
    if (g[r][c] !== word[at]) return false
    g[r][c] = USED
    burned.push([r, c])
    steps++
    yield {
      line: 6,
      grid: board(g, `matched "${word.slice(0, at + 1)}"`, (rr, cc) =>
        rr === r && cc === c ? "focus" : g[rr][cc] === USED ? "dim" : undefined
      ),
      state: [
        { label: "matched", value: word.slice(0, at + 1) },
        { label: "cells consumed", value: burned.length },
      ],
      note: `${r},${c} holds "${word[at]}", so the path extends. The cell is blanked so the walk cannot stand on it again — and in THIS version it is never un-blanked.`,
    }
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ])
      if (yield* walk(r + dr, c + dc, at + 1)) return true
    return false
  }
  let found = false
  for (let r = 0; r < R && !found; r++)
    for (let c = 0; c < C && !found; c++) found = yield* walk(r, c, 0)
  const answer = canSpellGreedy(nums, word)
  const truth = canSpell(nums, word)
  yield {
    line: 9,
    answer,
    grid: board(g, answer ? "spelled it" : "gave up", (r, c) =>
      g[r][c] === USED ? "dim" : undefined
    ),
    state: [
      { label: "this version says", value: String(answer) },
      { label: "cells consumed", value: burned.length },
      { label: "steps", value: steps },
    ],
    corner: answer !== truth ? "restore" : undefined,
    note:
      answer !== truth
        ? `This version answers ${answer}. The right answer is ${truth}. Look at the dim cells: they were consumed by branches that FAILED, and they stayed consumed, so a later path that needed them found a blank where a letter should be. The board was permanently damaged by a guess.`
        : `${answer}, and it happens to be right on this board — which is exactly what makes the bug dangerous. Nothing here failed and backed off, so nothing needed the cells it burned. Try the board where a path has to be given back.`,
  }
}

/** Rung 3 — the same walk, with the restore. */
function* backtrack({ nums, word }: B): Generator<DFrame> {
  const g = cellsOf(nums)
  const R = g.length
  const C = g[0].length
  let restores = 0
  let steps = 0
  function* walk(r: number, c: number, at: number): Generator<DFrame, boolean> {
    if (at === word.length) return true
    if (r < 0 || c < 0 || r >= R || c >= C) return false
    if (g[r][c] !== word[at]) return false
    const keep = g[r][c]
    g[r][c] = USED
    steps++
    yield {
      line: 7,
      grid: board(g, `matched "${word.slice(0, at + 1)}"`, (rr, cc) =>
        rr === r && cc === c
          ? "focus"
          : g[rr][cc] === USED
            ? "anchor"
            : undefined
      ),
      state: [
        { label: "matched", value: word.slice(0, at + 1) },
        { label: "path length", value: at + 1 },
      ],
      note: `${r},${c} holds "${word[at]}". Blanked while this path uses it — the ban on reuse applies to the PATH, and the path is what is on screen.`,
    }
    let found = false
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      found = yield* walk(r + dr, c + dc, at + 1)
      if (found) break
    }
    if (!found) {
      g[r][c] = keep
      restores++
      yield {
        line: 12,
        grid: board(g, `gave ${keep} back`, (rr, cc) =>
          rr === r && cc === c
            ? "answer"
            : g[rr][cc] === USED
              ? "anchor"
              : undefined
        ),
        state: [
          { label: "restored", value: keep },
          { label: "restores", value: restores },
        ],
        corner: restores === 1 ? "restore" : undefined,
        note: `Nothing beyond ${r},${c} spelled the rest of "${word}", so this path is abandoned — and the cell goes back on the board exactly as it was. That single line is the difference between a search and one greedy guess: a cell is unavailable while a path holds it, not forever.`,
      }
    }
    return found
  }
  let found = false
  for (let r = 0; r < R && !found; r++)
    for (let c = 0; c < C && !found; c++) found = yield* walk(r, c, 0)
  const answer = canSpell(nums, word)
  yield {
    line: 14,
    answer,
    grid: board(g, answer ? `"${word}" found` : `"${word}" is not there`),
    state: [
      { label: "answer", value: String(answer) },
      { label: "steps", value: steps },
      { label: "cells given back", value: restores },
    ],
    corner:
      !answer && word.length > 1
        ? "reuse"
        : word.length === 1
          ? "single"
          : undefined,
    note: `${answer}, in ${steps} ${steps === 1 ? "step" : "steps"}, with ${restores} ${restores === 1 ? "cell given back" : "cells given back"}. Every branch that failed left the board exactly as it found it, which is why a later start is judged on the real board rather than on the wreckage of an earlier attempt.`,
  }
}

export const wordSearch = deriveJourney<string>(problem, {
  slug: "give-the-square-back",
  subtitle: "a cell is unavailable while a path holds it, not forever",
  reveals: ["graphs"],
  cells: "words",
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger board" },
  params: [{ key: "word", label: "word", kind: "string" }],
  classify: (d) =>
    wellFormed(d.nums as string[], (d as B).word)
      ? { ok: true }
      : {
          ok: false,
          warning:
            "one lowercase row per token, all the same length, and a lowercase word to look for",
        },
  presets: {
    example: {
      label: "the example",
      nums: ["abce", "sfcs", "adee"],
      extra: { word: "abcced" },
      info: "true — the path turns twice",
    },
    reuse: {
      label: "a letter that would be reused",
      nums: ["abce", "sfcs", "adee"],
      extra: { word: "abcb" },
      info: "false — the second b is the first b",
    },
    restore: {
      label: "a path that must be given back",
      nums: ["aaa", "aba"],
      extra: { word: "aaaaa" },
      info: "true — but only if cells come back",
    },
    single: {
      label: "a one-letter word",
      nums: ["abc", "def"],
      extra: { word: "e" },
      info: "true if the letter is anywhere",
    },
    missing: {
      label: "a letter not on the board",
      nums: ["abc", "def"],
      extra: { word: "az" },
      info: "false at the second step",
    },
    long: {
      label: "a bigger board",
      nums: ["abcedf", "sfcsad", "adeeba", "cbadea", "afghij"],
      extra: { word: "abcced" },
      info: "five rows of six",
    },
  },
  edges: [
    {
      key: "restore",
      name: "a cell freed by a failed path must come back",
      example: '"aaaaa" on ["aaa", "aba"] → true, and false without the restore',
      why: "The ban on reuse is per PATH. A version that blanks a cell and never restores it lets one failed branch destroy the board for every later attempt, and the answer comes back false on a word that is really there.",
      think:
        "When a branch fails, what state is left behind for the next branch to work with?",
      preset: "restore",
      constraint: 3,
    },
    {
      key: "reuse",
      name: "the same cell twice in one path",
      example: '"abcb" on ["abce","sfcs","adee"] → false',
      why: "The second b would have to be the first b. Without a used-marker the walk happily steps back and forth between two cells and spells anything with a repeated pair of letters.",
      think:
        "What stops your walk from stepping straight back where it came from?",
      preset: "reuse",
      constraint: 2,
    },
    {
      key: "single",
      name: "a one-letter word",
      example: '"e" on a board containing e → true',
      why: "No movement is needed, so the answer is decided entirely by the base case. Code that checks bounds or neighbours before checking whether the word is already finished gets this wrong at the boundary.",
      think:
        "Which test comes first: 'is the word finished' or 'is this cell on the board'?",
      preset: "single",
      constraint: 1,
    },
  ],
  rungs: [
    {
      key: "story",
      name: "The Problem",
      short: "start here",
      insight: "",
      idea: problem.statement,
      pseudo: [
        "given: a rectangular board of lowercase letters, and a word",
        "a path steps between cells sharing an edge — up, down, left, right",
        "no cell may be used twice WITHIN one path",
        "task: return whether the word can be spelled along some path",
      ],
      tools: [
        {
          name: "Board",
          role: "one token per row, drawn as a grid. Each cell is a node with an edge to its four neighbours — but only the neighbours holding the NEXT letter are worth walking to.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "every cell holding the first letter is a possible start, and each has to be tried",
        "the reuse ban is per path, so what is unavailable changes as the search moves",
        "a wrong step must be undone completely, board included",
      ],
      quiz: [
        {
          q: "A path fails halfway. What happens to the cells it was standing on?",
          choices: [
            "they stay used — they were tried and did not work",
            "they become available again, because the ban applies to that path and the path is gone",
          ],
          answer: 1,
          explain:
            "Another path may need exactly those cells. Keeping them consumed answers a question nobody asked.",
        },
      ],
      run: story,
    },
    {
      key: "paths",
      name: "Build every walk, then read it",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Enumerate every non-repeating path with as many cells as the word has letters, then check each one letter by letter.",
      takeaways: [
        "it separates the two ideas cleanly: make the paths, then test them",
        "and that separation is the waste — a path already spelling nonsense is still built to full length",
        "the count of paths explodes with the word's length, not with the board's size",
      ],
      run: enumerate,
    },
    {
      key: "greedy",
      name: "Match as you walk — and keep what you take",
      short: "a warning",
      from: 0,
      insight:
        "Building whole paths before testing them explores enormous numbers of walks that went wrong at the second letter. Check the letter as you step, and a wrong branch dies immediately.",
      idea: "Walk from each matching cell, requiring the next letter at every step, and blank each cell as it is used so the path cannot cross itself.",
      takeaways: [
        "checking as you go is right, and it is the whole speed-up",
        "but a cell blanked by a failed branch stays blanked, so the board is permanently damaged by a guess",
        "on many boards it still gets the right answer, which is what makes it hard to catch",
        "this rung is a warning, not a step forward — the next one differs from it by one line",
      ],
      quiz: [
        {
          q: "This version is fast and often right. What exactly is wrong with it?",
          choices: [
            "it can visit a cell twice",
            "a cell consumed by a path that failed is never given back, so later paths see a board with holes in it",
          ],
          answer: 1,
          explain:
            "It is too strict, not too loose: it forbids reuse across the whole search rather than within one path.",
        },
      ],
      run: greedyWalk,
    },
    {
      key: "backtrack",
      name: "Put the letter back on the way out",
      short: "one more line",
      insight:
        "Blanking a cell is right while a path is standing on it. Leaving it blank after that path has failed turns a rule about one path into a rule about the whole search — and quietly answers a different question.",
      idea: problem.approach,
      takeaways: [
        "restore the cell when the branch returns false: the board is exactly as it was found",
        "that undo is what makes this a search rather than a single greedy guess",
        "the state being maintained is the current path, and it lives in the recursion",
        "cost is unchanged — the fix is one assignment, not a different algorithm",
      ],
      quiz: [
        {
          q: "Where does the restore belong?",
          choices: [
            "at the very end of the whole search",
            "when this cell's branch returns, so the next branch sees the board unchanged",
          ],
          answer: 1,
          explain:
            "Each frame undoes exactly its own change. That is what makes the state at any moment equal to the path currently being walked.",
        },
      ],
      run: backtrack,
    },
  ],
})
