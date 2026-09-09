// Widest Container (LeetCode 11) — journey content: story act + two
// approaches (brute → converging pointers that always retire the shorter
// wall) as frame generators, then the code challenge and the recap. Owns this
// problem's narrative, generators, presets and contract check. Owns no
// rendering: each act's view() returns a StageModel and src/features/journey
// draws it — here through the `bars` panel kind, which arrives with this
// problem (docs/AUTHORING.md).
//
// The pedagogy of THIS problem is a discard argument. Two Sum's squeeze moves
// the pointer that cannot reach; this one moves the pointer that cannot HELP,
// and the reason is a proof rather than a search: the shorter wall caps every
// pairing it is part of, so keeping it can only cost width.
//
// Pedagogy: no act names a later act (enforced by journeys.test.ts).

import { chipRow, range } from "../chips.ts"
import { randInt } from "../random.ts"
import type {
  Act,
  BarModel,
  Frame,
  Journey,
  StageModel,
  WaterModel,
} from "../types.ts"

export interface ContainerData {
  nums: number[]
}

type F = Frame<{
  i?: number
  j?: number
  L?: number
  R?: number
  area?: number
  best?: number
  bestSpan?: number[]
  record?: boolean // this frame BEAT the running best, rather than tying it
  answer?: number[]
  done?: boolean
  op?: "get" | "set"
}>

// ---------- the problem's promise ----------

export const areaOf = (nums: number[], i: number, j: number) =>
  (j - i) * Math.min(nums[i], nums[j])

export function bestContainer(nums: number[]) {
  let best = 0
  let span: [number, number] = [0, 0]
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++) {
      const a = areaOf(nums, i, j)
      if (a > best) {
        best = a
        span = [i, j]
      }
    }
  return { best, span }
}

export function classifyContainer(nums: number[]) {
  if (nums.length < 2)
    return {
      ok: false,
      warning:
        "Contract broken: a container needs two walls, and this input has fewer than two lines. Every approach below returns 0 without ever entering its loop.",
    }
  if (nums.some((v) => v < 0))
    return {
      ok: false,
      warning:
        "Contract broken: a height below zero. The area formula still computes something, and that something is meaningless — watch the numbers rather than trusting them.",
    }
  const { best } = bestContainer(nums)
  if (best === 0)
    return {
      ok: false,
      warning:
        "Every container here holds nothing: some wall of every pair has height 0. The answer 0 is correct, and it is the case where a running maximum that starts at 0 hides a bug.",
    }
  return { ok: true }
}

// ---------- generators ----------

const allEqual = (nums: number[]) => nums.every((v) => v === nums[0])

function* runStory({ nums }: ContainerData): Generator<F> {
  yield {
    hold: 3,
    noChips: true,
    note: "Why does this problem exist? A row of fence posts of different heights stands on flat ground. Pick exactly TWO of them, and the water you can hold between them is bounded on the sides by those two posts — nothing in between gets in the way.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Water finds its own level, so it can only rise to the SHORTER of the two posts; anything above that spills over. The area is therefore the distance between them times that shorter height. Find the pair that holds the most.",
  }
  const { best, span } = bestContainer(nums)
  yield {
    hold: 3,
    note: `${nums.length} posts. The widest container you can build is the one using the two ends — that is the most width there is, and every other pair trades some of it away for a taller cap.`,
  }
  if (best === 0) {
    yield {
      hold: 3,
      corner: "zeros",
      note: "…and every pair here holds nothing, because one of its walls has height 0. The answer is 0, which is also what a running maximum says before it has measured anything — keep that coincidence in mind.",
    }
    return
  }
  const widest = areaOf(nums, 0, nums.length - 1)
  yield {
    hold: 3,
    bestSpan: [0, nums.length - 1],
    best: widest,
    note: `The widest pair holds ${widest}. Is that the answer? Only if no narrower pair is tall enough to make up the difference — and on this row it ${best > widest ? "is not: something narrower does better" : "happens to be exactly right"}.`,
  }
  yield {
    hold: 3,
    bestSpan: span,
    best,
    answer: span,
    corner: best > widest ? "notwidest" : undefined,
    note: `The answer is ${best}, held between posts ${span[0]} and ${span[1]}${best > widest ? " — narrower than the ends, and taller enough to win. Widest is not the same as best" : ""}. Return the AREA, not the two positions.`,
  }
}

function* runBrute({ nums }: ContainerData): Generator<F> {
  let best = 0
  let bestSpan: number[] = []
  let zeroShown = false
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const area = areaOf(nums, i, j)
      const beat = area > best
      if (beat) {
        best = area
        bestSpan = [i, j]
      }
      const zero = !zeroShown && Math.min(nums[i], nums[j]) === 0
      if (zero) zeroShown = true
      yield {
        line: 2,
        i,
        j,
        area,
        best,
        bestSpan,
        record: beat,
        corner: zero ? "zeros" : undefined,
        hold: zero ? 2 : undefined,
        note: `posts ${i} and ${j}: width ${j - i} × height ${Math.min(nums[i], nums[j])} = ${area}${beat ? " — a new best" : ""}${zero ? ". A post of height 0 caps the container at nothing, however far away its partner is" : ""}`,
      }
    }
  }
  yield {
    hold: 2,
    line: 4,
    best,
    bestSpan,
    answer: bestSpan,
    done: true,
    note: `every pair measured: the best is ${best}. Correct — and it asked about n²/2 containers to find one number.`,
  }
}

function* runSqueeze({ nums }: ContainerData): Generator<F> {
  let L = 0
  let R = nums.length - 1
  let best = 0
  let bestSpan: number[] = []
  let askedL = false
  let askedR = false
  const flat = allEqual(nums)
  yield {
    hold: 2,
    line: 1,
    L,
    R,
    corner: nums.length === 2 ? "tiny" : flat ? "flat" : undefined,
    note: `start at the two ends — the most width available${nums.length === 2 ? ". n = 2: this is the only container there is, and the loop is about to end before it begins" : flat ? ". Every post here is the same height, so width alone decides: the widest pair is the answer and nothing narrower can tie it" : ""}`,
  }
  while (L < R) {
    const area = areaOf(nums, L, R)
    const beat = area > best
    if (beat) {
      best = area
      bestSpan = [L, R]
    }
    yield {
      line: 2,
      L,
      R,
      area,
      best,
      bestSpan,
      record: beat,
      corner:
        beat && bestSpan[1] - bestSpan[0] < nums.length - 1
          ? "notwidest"
          : undefined,
      note: `width ${R - L} × height ${Math.min(nums[L], nums[R])} = ${area}${beat ? ` — a new best${bestSpan[1] - bestSpan[0] < nums.length - 1 ? ", and it is narrower than the row itself: the taller cap paid for the lost width" : ""}` : `, which does not beat ${best}`}`,
    }
    const choices = [
      "the shorter post — it caps every pairing it is in",
      "the taller post — it has more to offer",
      "whichever is further from the middle",
    ]
    if (nums[L] < nums[R]) {
      yield {
        line: 3,
        L,
        R,
        area,
        best,
        bestSpan,
        predict: askedL
          ? undefined
          : {
              q: `Post ${L} is the shorter wall. Every remaining pair is narrower than this one. Which post can be retired?`,
              choices,
              answer: 0,
            },
        note: `post ${L} (height ${nums[L]}) is the shorter wall. It has just been paired with the furthest partner it will ever have; any other partner is closer, so its container can only be smaller. Retire it.`,
      }
      askedL = true
      L++
    } else {
      yield {
        line: 4,
        L,
        R,
        area,
        best,
        bestSpan,
        predict: askedR
          ? undefined
          : {
              q: `Post ${R} is the shorter wall (or a tie). Which one can be retired without risking the answer?`,
              choices,
              answer: 0,
            },
        note: `post ${R} (height ${nums[R]}) is the shorter wall${nums[L] === nums[R] ? " — a tie, and with a tie either side may go: whichever stays is still capped at the same height, with less width" : ""}. Its best partner was the furthest one, and that pairing is measured. Retire it.`,
      }
      askedR = true
      R--
    }
  }
  yield {
    hold: 2,
    line: 5,
    L,
    R,
    best,
    bestSpan,
    answer: bestSpan,
    done: true,
    note: `the posts met: ${best}. Each step retired exactly one post, so the walk was n steps — and every pair it skipped was provably no better than one it had already measured.`,
  }
}

// ---------- shared view helpers ----------

function bars(nums: number[], roles: Record<number, string[]>): BarModel[] {
  const seen = new Map<number, number>()
  return nums.map((value, i) => {
    const n = seen.get(value) ?? 0
    seen.set(value, n + 1)
    return {
      // keyed by value AND occurrence, as the visualizer does, so FLIP morphs
      // a column instead of blinking its height
      key: `v${value}#${n}`,
      value,
      roles: (roles[i] ?? []) as BarModel["roles"],
    }
  })
}

function water(
  nums: number[],
  from: number,
  to: number,
  best: boolean
): WaterModel {
  const height = Math.min(nums[from], nums[to])
  return {
    from,
    to,
    height,
    label: `width ${to - from} × height ${height} = ${(to - from) * height}`,
    best,
  }
}

// The stage for both approaches: the row of posts, the water between the pair
// under inspection, and the best area found so far as a line underneath.
function barStage(
  f: F,
  d: ContainerData,
  a: number | undefined,
  b: number | undefined
): StageModel {
  const roles: Record<number, string[]> = {}
  // The best pair keeps its highlight from the frame that set it onward, not
  // only at the end — so once the pointers have moved past the winner it is
  // still obvious which pair won. This discloses nothing early: the same
  // frame already prints "best so far N — posts a and b" underneath.
  if (f.bestSpan?.length) {
    roles[f.bestSpan[0]] = ["answer"]
    roles[f.bestSpan[1]] = ["answer"]
  }
  if (!f.done && a !== undefined && b !== undefined) {
    // pushed onto whatever the best-pair pass left, so a bar that is both the
    // winner and a live pointer keeps both facts; the caret still names it
    roles[a] = [...(roles[a] ?? []), "anchor"]
    roles[b] = [...(roles[b] ?? []), "focus"]
    // append, never overwrite: a retired post that is still the best pair has
    // to keep its highlight, and that is precisely the case this whole
    // highlight exists for — the pointers have moved past the winner
    for (const k of range(d.nums.length))
      if (k < a || k > b) roles[k] = [...(roles[k] ?? []), "dim"]
  }
  const span =
    f.done && f.bestSpan?.length
      ? ([f.bestSpan[0], f.bestSpan[1]] as const)
      : a !== undefined && b !== undefined
        ? ([a, b] as const)
        : undefined
  return {
    chips: null,
    panel: {
      kind: "bars",
      bars: bars(d.nums, roles),
      water: span
        ? water(
            d.nums,
            span[0],
            span[1],
            f.done === true ||
              (f.best !== undefined && f.area !== undefined && f.area >= f.best)
          )
        : undefined,
      best:
        f.best !== undefined && f.bestSpan?.length
          ? `best so far ${f.best} — posts ${f.bestSpan[0]} and ${f.bestSpan[1]}`
          : undefined,
      record: f.record,
    },
  }
}

// ---------- acts ----------

const story: Act<ContainerData, F> = {
  key: "story",
  name: "The Problem",
  short: "start here",
  complexity: "no code yet — just the shape",
  insight: "",
  tools: [
    {
      name: "Array of heights",
      role: "a row of posts, addressed by position. The distance between two of them is width, and their heights decide the cap — that is the whole model.",
    },
  ],
  idea: "In plain words: each number is the height of a vertical post, and the water held between two posts is the distance between them times the SHORTER of the two heights. Return the largest such area. Note what is not asked for: not the positions, not the pair — one number.",
  code: {
    pseudo: [
      "given: heights, one per position",
      "water(i, j) = (j - i) × min(heights[i], heights[j])",
      "promise: nothing between the posts matters",
      "task: return the largest water(i, j)",
    ],
  },
  hints: [
    "Reread the formula and say it aloud: width times the SHORTER height. Which of the two numbers is doing the limiting?",
    "Formalize it: input = an array of non-negative heights; output = a single number, the maximum over all pairs. Two quantities fight each other — width wants the ends, height wants the tall posts.",
    "Bring three inputs before any code: the smallest legal one (two posts), a flat row where every post is the same, and a row with a 0 in it. Load one below and watch what the area does.",
  ],
  takeaways: [
    "the answer is one number — the area — not the pair that produced it",
    "the shorter of the two posts caps the container, however tall the other one is",
    "width and height pull in opposite directions: that tension is the entire problem",
  ],
  quiz: [
    {
      q: "Two posts of heights 8 and 3 stand 5 apart. How much water?",
      choices: ["5 × 8 = 40", "5 × 3 = 15", "5 × 11 = 55"],
      answer: 1,
      explain:
        "Water rises only to the shorter post — anything above that spills over the low side. The 8 is wasted height.",
    },
    {
      q: "What does the problem ask you to return?",
      choices: [
        "the two positions",
        "the largest area",
        "the heights of the best pair",
      ],
      answer: 1,
      explain:
        "One number. It is easy to build a solution that tracks the pair and then forgets to report the area itself.",
    },
  ],
  run: runStory,
  view(f, d) {
    if (f.noChips)
      return { chips: null, panel: { kind: "story", glyph: "🏞️ → 🧱 → ❓" } }
    if (f.bestSpan?.length)
      return barStage({ ...f, done: true }, d, f.bestSpan[0], f.bestSpan[1])
    return { chips: null, panel: { kind: "bars", bars: bars(d.nums, {}) } }
  },
}

const brute: Act<ContainerData, F> = {
  key: "brute",
  name: "Brute Force",
  short: "O(n²)",
  complexity: "O(n²) time · O(1) space",
  insight: "First instinct — measure every container and keep the biggest.",
  tools: [
    {
      name: "Array only",
      role: "nothing built beside it: two loops and a running maximum. Its space bill is already as low as it can go, which is why the complaint against it is never about memory.",
    },
  ],
  idea: "Take every pair of posts, compute width times the shorter height, and remember the largest. It is correct and it needs no extra memory — but it measures about n²/2 containers to report one number, and it never uses the fact that it just measured the widest one first.",
  code: {
    pseudo: [
      "best = 0",
      "for i in 0..n-1:",
      "  for j in i+1..n-1:",
      "    best = max(best, (j - i) × min(h[i], h[j]))",
      "return best",
    ],
    python: [
      "best = 0",
      "for i in range(len(h)):",
      "    for j in range(i + 1, len(h)):",
      "        best = max(best, (j - i) * min(h[i], h[j]))",
      "return best",
    ],
    java: [
      "int best = 0;",
      "for (int i = 0; i < h.length; i++)",
      "    for (int j = i + 1; j < h.length; j++)",
      "        best = Math.max(best, (j - i) * Math.min(h[i], h[j]));",
      "return best;",
    ],
    cpp: [
      "int best = 0;",
      "for (int i = 0; i < (int)h.size(); i++)",
      "    for (int j = i + 1; j < (int)h.size(); j++)",
      "        best = max(best, (j - i) * min(h[i], h[j]));",
      "return best;",
    ],
  },
  hints: [
    "Why does best start at 0 rather than at the first area you compute?",
    "Because 0 is the smallest legal answer: a row where every container holds nothing is legal input, and starting from the first pair would still be correct here — but starting from 0 says so out loud.",
    "The line to stare at: best = max(best, …) — a running maximum is the only state this approach carries.",
  ],
  takeaways: [
    "the baseline is correct and already O(1) in space — the objection is the question count",
    "a running maximum starting at 0 is safe because 0 is a legal answer",
    "it measures the widest container first and then forgets that it did — that waste is the opening",
  ],
  quiz: [
    {
      q: "This approach is already constant-space. So what is the complaint?",
      choices: [
        "it can miss the best pair",
        "it measures every pair when most of them are provably hopeless",
        "it needs the heights to be sorted",
      ],
      answer: 1,
      explain:
        "Correct and cheap in memory. It simply asks far more questions than it needs to, and the ones it wastes are the ones a single comparison could have ruled out.",
    },
  ],
  run: runBrute,
  view(f, d) {
    return barStage(f, d, f.i, f.j)
  },
}

const squeeze: Act<ContainerData, F> = {
  key: "squeeze",
  name: "Two Pointers",
  short: "O(n)",
  complexity: "O(n) time · O(1) space — the interview answer",
  insight:
    "Every pair gets measured, but most of them were hopeless before they were asked about. Which ones, and how would you know?",
  tools: [
    {
      name: "Two indices",
      role: "one at each end, walking inward. They never search: each step is a small proof that one post cannot be part of a better container.",
    },
  ],
  idea: "Start at the two ends — the most width there is — and measure. Then look at the two posts and retire the SHORTER one. It has just been paired with the furthest partner it will ever have; every remaining partner is closer, so every container it could still be part of is narrower AND still capped at its own height. Nothing it could do is better than what you just measured, so it can go. One post retired per step means the whole row is done in n steps.",
  code: {
    pseudo: [
      "best = 0; L = 0; R = n - 1",
      "while L < R:",
      "  best = max(best, (R - L) × min(h[L], h[R]))",
      "  if h[L] < h[R]: L = L + 1",
      "  else: R = R - 1",
      "return best",
    ],
    python: [
      "best, L, R = 0, 0, len(h) - 1",
      "while L < R:",
      "    best = max(best, (R - L) * min(h[L], h[R]))",
      "    if h[L] < h[R]: L += 1",
      "    else: R -= 1",
      "return best",
    ],
    java: [
      "int best = 0, L = 0, R = h.length - 1;",
      "while (L < R) {",
      "    best = Math.max(best, (R - L) * Math.min(h[L], h[R]));",
      "    if (h[L] < h[R]) L++;",
      "    else R--;",
      "} return best;",
    ],
    cpp: [
      "int best = 0, L = 0, R = (int)h.size() - 1;",
      "while (L < R) {",
      "    best = max(best, (R - L) * min(h[L], h[R]));",
      "    if (h[L] < h[R]) L++;",
      "    else R--;",
      "} return best;",
    ],
  },
  hints: [
    "Start at the ends. Now ask: of these two posts, which one could still be part of a container you have not measured that beats this one?",
    "Move the TALLER post inward and the width drops while the short post still caps the height — that can never improve on what you just measured. So the taller one is the wrong one to move.",
    "The line to stare at: if h[L] < h[R]: L = L + 1 — retire the shorter wall, and on a tie either side may go.",
  ],
  takeaways: [
    "retiring the shorter wall is a proof, not a heuristic: its best partner has already been measured",
    "one post retired per comparison means n steps, not n²/2",
    "on a tie either side may be retired — whichever stays is capped at the same height with less width",
  ],
  quiz: [
    {
      q: "Why is it safe to retire the SHORTER post rather than the taller one?",
      choices: [
        "the shorter post is worth less",
        "its widest possible partner has just been measured, and every other partner is closer",
        "the taller post is more likely to be in the answer",
      ],
      answer: 1,
      explain:
        "It is an argument about width, not about height. The short post has already had its best shot; keeping it can only produce narrower containers with the same cap.",
    },
    {
      q: "Both posts are the same height. Which one do you move?",
      choices: [
        "either — both choices are safe",
        "always the left",
        "neither; stop the walk",
      ],
      answer: 0,
      explain:
        "With a tie, whichever post stays is still capped at that same height, and every remaining container is narrower. Both discards are provably safe.",
    },
  ],
  run: runSqueeze,
  view(f, d) {
    return barStage(f, d, f.L, f.R)
  },
}

// ---------- the challenge ----------

export const CONTAINER_CHALLENGE = {
  fname: "maxArea",
  answers: "value" as const,
  signature: "function maxArea(nums) {",
  starter:
    "// nums[i] is the height of the post at position i\n// return ONE number: the largest area\nlet best = 0, L = 0, R = nums.length - 1;\n\n",
  cases: [
    { nums: [1, 8, 6, 2, 5, 4, 8, 3, 7], expected: 49 },
    { nums: [1, 1], expected: 1, tag: "smallest legal" },
    { nums: [4, 4, 4, 4], expected: 12, tag: "flat row" },
    { nums: [0, 2, 0], expected: 0, tag: "a zero wall" },
    { nums: [1, 2, 4, 3], expected: 4, tag: "answer is not the widest" },
    { nums: [2, 3, 4, 5, 18, 17, 6], expected: 17, tag: "tall pair inside" },
  ],
  review: [
    {
      q: "One walk, not nested loops",
      check: (c: string) => (c.match(/\bfor\b|\bwhile\b/g) || []).length <= 1,
    },
    {
      q: "The area uses the SHORTER wall — a min, not a max",
      check: (c: string) => /Math\.min\(/.test(c),
    },
    {
      q: "The pointer that moves is the one at the shorter wall",
      check: (c: string) => {
        const short =
          /nums\[L\]\s*<\s*nums\[R\]|nums\[R\]\s*<\s*nums\[L\]/.test(c)
        return short ? true : undefined
      },
    },
    {
      q: "Say the discard argument out loud: what have you proved about the post you just retired?",
    },
    {
      q: "Could you re-derive that argument cold tomorrow, without the reference?",
    },
  ],
  big: {
    n: 400,
    make: () => {
      const nums = Array.from({ length: 400 }, () => randInt(0, 400))
      return { nums, expected: bestContainer(nums).best }
    },
  },
  reference:
    "let best = 0, L = 0, R = nums.length - 1;\n" +
    "while (L < R) {\n" +
    "  best = Math.max(best, (R - L) * Math.min(nums[L], nums[R]));\n" +
    "  if (nums[L] < nums[R]) L++;\n" +
    "  else R--;\n" +
    "}\nreturn best;",
}

const challenge: Act<ContainerData, F> = {
  key: "challenge",
  name: "Code It",
  short: "prove it",
  complexity: "your turn — all 6 cases must pass",
  insight:
    "Watching is not writing. The argument is yours when your fingers can produce it.",
  tools: [
    {
      name: "Your call",
      role: "two loops or two indices. Both are correct; only one of them can explain why the containers it never measured did not matter.",
    },
  ],
  idea: "Write the body of maxArea(nums) in the editor under the posts. Your code runs in a sandboxed Worker against the same cases the site tests itself with — a flat row, a zero wall, an answer that is not the widest pair, and a tall pair sitting in the middle. Return ONE number.",
  code: { pseudo: squeeze.code.pseudo },
  takeaways: [
    "reproduce the argument, not just the loop — the discard is the part worth remembering",
    "a nested-loop answer passes every case; read which review line it failed",
    "the zero-wall case is where a running maximum that started wrong shows itself",
  ],
  gate: "pass",
  chart: false,
  hints: [
    "Say the plan in one sentence before typing: measure the current pair, then retire whichever post has already had its best shot.",
    "Two indices and a running best. Three lines in the loop: measure, compare the two heights, move one index.",
    "Skeleton to fill: let best = 0, L = 0, R = nums.length - 1 → while (L < R) → best = Math.max(best, (R - L) * Math.min(nums[L], nums[R])) → move L or R.",
  ],
  nextLabel: "It is green — show me what I earned ▸",
  *run({ nums }, ctx) {
    if (!ctx.trace) {
      yield {
        hold: 2,
        line: -1,
        note: "write the function body in the editor below, hit Run tests — or trace it and WATCH your own code walk the row of posts",
      }
      return
    }
    const { events, result, error } = ctx.trace
    if (!events.length)
      yield {
        hold: 2,
        note: "your code never touched nums 🤨 — it returned without reading a single height",
      }
    for (let n = 0; n < events.length; n++) {
      const e = events[n]
      yield {
        i: e.i,
        op: e.op,
        note: `access #${n + 1}: your code ${e.op === "get" ? `read nums[${e.i}] (${e.v})` : `wrote nums[${e.i}] = ${e.v}`}`,
      }
    }
    if (error) {
      yield { hold: 2, note: `then it threw: ${error}` }
      return
    }
    const want = bestContainer(nums).best
    const ok = result === want
    yield {
      hold: 3,
      best: ok ? want : undefined,
      bestSpan: ok ? bestContainer(nums).span : undefined,
      done: ok,
      note: ok
        ? `returned ${want} — correct, in ${events.length} array accesses. A row of ${nums.length} posts: count the ratio, that IS your approach.`
        : `returned ${JSON.stringify(result)}, and the largest container here holds ${want}. Watch where the walk went wrong.`,
    }
  },
  // the editor IS the panel here, so the row of heights is drawn as chips
  // rather than bars: the trace needs a position to highlight, and chips are
  // what every other challenge act highlights
  view(f, d) {
    return {
      chips: chipRow(d.nums, {
        focus: f.op === "get" && f.i !== undefined ? [f.i] : [],
        anchor: f.op === "set" && f.i !== undefined ? [f.i] : [],
        answer: f.done && f.bestSpan?.length ? f.bestSpan : [],
      }),
      panel: { kind: "challenge" },
    }
  },
}

const recap: Act<ContainerData, F> = {
  key: "recap",
  name: "The Reveal",
  short: "what you earned",
  complexity: "journey complete 🏁",
  insight: "The move you argued for has a name — and a second shape.",
  tools: [
    {
      name: "Array of heights",
      role: "the given. Nothing about it is sorted, which is why this squeeze is a different animal from the one on a sorted row.",
    },
    {
      name: "Two indices",
      role: "buys the search with an ARGUMENT rather than with order: each step retires a candidate that has already had its best chance.",
    },
  ],
  idea: "You have now met converging pointers twice, and they were not the same trick. On a sorted row, the comparison tells you which side to move because the values are ordered. Here nothing is ordered — the move is justified by a proof about WIDTH: the shorter wall has already been paired with the furthest partner it will ever have. Same shape on screen, different reason underneath, and the reason is the part that transfers.",
  code: {
    pseudo: [
      "what transfers to the next problem:",
      "  1. write the brute force and count its questions",
      "  2. ask which of them were hopeless before being asked",
      "  3. find the ONE comparison that proves a candidate is finished",
      "  4. retire it, and the loop becomes a walk",
      "  5. a greedy discard needs a proof, not a feeling",
    ],
  },
  takeaways: [
    "converging pointers are a shape; the reason for each move is the actual lesson",
    "a discard is safe when the candidate has already been given its best case",
    "width and height traded against each other is a pattern you will meet again",
  ],
  chart: false,
  *run({ nums }) {
    const { best, span } = bestContainer(nums)
    yield {
      hold: 3,
      best,
      bestSpan: span,
      done: true,
      note: "the walk you argued for in act 3 has a name: TWO POINTERS, in its converging form — and here it moved for a reason that had nothing to do with sorting. Here is the scorecard.",
    }
  },
  view(_f, d) {
    const rows = [brute, squeeze].map((a) => ({
      name: a.name,
      built: (a.tools ?? []).map((t) => t.name).join(" + "),
      cost: a.complexity,
      insight: a.insight,
    }))
    return {
      chips: chipRow(d.nums, { answer: range(d.nums.length) }),
      panel: {
        kind: "recap",
        caption: "the journey, side by side — the middle column is the story",
        rows,
        note: "Two approaches, one array, and no extra structure in either of them. The difference is not what was built beside the input — nothing was — but how much of the search could be thrown away with a proof. That is the other way to buy speed.",
        links: [
          {
            label: "Study the pattern: Two Pointers",
            detail:
              "the shape on its own — converge and chase, beyond this problem",
            href: "#/p/two-pointers",
          },
          {
            label: "Next problem: Single Buy/Sell Profit",
            detail:
              "one walk again, but this time what you carry is a running minimum",
            href: "#/p/sliding-window/best-trade",
          },
        ],
      },
    }
  },
}

// ---------- presets and page config ----------

function makeContainer(n: number, hi = 20): ContainerData {
  for (let tries = 0; tries < 40; tries++) {
    const nums = Array.from({ length: n }, () => randInt(1, hi))
    const { best, span } = bestContainer(nums)
    // a row whose answer is simply the two ends teaches nothing, so keep
    // asking until the widest pair is beaten by something narrower
    if (best > 0 && span[1] - span[0] < n - 1) return { nums }
  }
  return { nums: [1, 8, 6, 2, 5, 4, 8, 3, 7] }
}

export const containerWater: Journey<ContainerData> = {
  slug: "container-water",
  title: "Widest Container",
  subtitle:
    "two walls, one number — and most of the pairs are hopeless before you measure them",
  problemId: "container-water",
  leetcode: 11,
  acts: [story, brute, squeeze, challenge, recap],
  resources: [
    {
      label: "LeetCode 11",
      url: "https://leetcode.com/problems/container-with-most-water/",
    },
    {
      label: "GeeksforGeeks: container with most water",
      url: "https://www.geeksforgeeks.org/dsa/container-with-most-water/",
    },
  ],
  presets: {
    random: { label: "random", make: () => makeContainer(randInt(7, 9)) },
    classic: {
      label: "the textbook row",
      make: () => ({ nums: [1, 8, 6, 2, 5, 4, 8, 3, 7] }),
      info: "The row from the problem statement. The answer is 49, held between the two 8s and the 7 — not between the two ends, which hold only 8.",
    },
    tiny: {
      label: "n = 2 (smallest legal)",
      make: () => ({ nums: [1, 1] }),
      info: "Two posts: the only container there is. The smallest legal input is where a loop that runs one time too few shows itself.",
    },
    flat: {
      label: "every post the same height",
      make: () => ({ nums: [4, 4, 4, 4, 4, 4] }),
      info: "Every post is the same height, so height cannot decide anything and width alone does. The widest pair wins, and every comparison along the way is a tie.",
    },
    zeros: {
      label: "a wall of height 0",
      make: () => ({ nums: [0, 2, 0] }),
      info: "Some post has height 0, and a container with a zero wall holds nothing however wide it is. The correct answer here is 0 — which is also what an empty running maximum reports.",
    },
    inside: {
      label: "the tall pair sits inside",
      make: () => ({ nums: [2, 3, 4, 5, 18, 17, 6] }),
      info: "The two tallest posts stand next to each other in the middle. Width is nearly nothing and height is nearly everything — the opposite trade from the ends.",
    },
    big: {
      label: "big (n = 20)",
      make: () => makeContainer(20, 40),
      info: "n = 20. Same code, twenty posts. Watch the chart: one bar measures about n²/2 containers and the other stays flat at n.",
    },
  },
  defaultPreset: "random",
  harder: { preset: "big", label: "Take on n = 20 — watch your code scale ▸" },
  classify: (d) => classifyContainer(d.nums),
  describe: (d) => d.nums.join(", "),
  parse: (text) => {
    const nums = text
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
      .filter((v) => Number.isInteger(v) && v >= 0 && v <= 999)
    return nums.length >= 2 ? { nums } : null
  },
  challenge: CONTAINER_CHALLENGE,
  reveals: ["two-pointers"],
  sample: { nums: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
  edgeCases: [
    {
      key: "tiny",
      name: "smallest legal input",
      example: "[1, 1] → 1",
      why: "Two posts is one container and nothing to choose between. A loop that stops one iteration early, or one that never runs because it was written to compare three things, returns 0 here — and 0 looks like a legal answer rather than a bug.",
      think:
        "Bring the smallest legal input first and trace it by hand. Ask what your loop does when there is exactly one thing to measure.",
      constraint:
        "2 <= height.length <= 10^5 — two posts is the smallest legal row",
      preset: "tiny",
    },
    {
      key: "flat",
      name: "every post the same height",
      example: "[4, 4, 4, 4, 4, 4] → 20",
      why: "When no post is taller than another, height stops deciding anything and width alone does. Every comparison between two posts is a tie, so any code whose choice depends on one being strictly taller has to say what it does when neither is.",
      think:
        "Ask what happens on a tie, in every comparison you write. A tie is not an edge case that might occur — on a flat input it is the only case there is.",
      constraint:
        "0 <= height[i] <= 10^4 — nothing promises the heights differ from each other",
      preset: "flat",
    },
    {
      key: "zeros",
      name: "a wall of height 0",
      example: "[0, 2, 0] → 0",
      why: "A post of height 0 caps its container at nothing, however far away its partner stands. The correct answer for a row like this is 0 — which is exactly what a running maximum holds before it has measured anything, so a bug that skips every measurement is invisible here.",
      think:
        "Bring an input whose correct answer is the same as your starting value, and check that the code actually measured something rather than never running.",
      constraint:
        "0 <= height[i] <= 10^4 — zero is a legal height, so zero is a legal answer",
      preset: "zeros",
    },
    {
      key: "notwidest",
      name: "the answer is not the widest pair",
      example: "[1, 2, 4, 3] → 4, between positions 1 and 3, not 0 and 3",
      why: "The two ends give the most width available, so it is tempting to assume they give the most water. A taller pair standing closer together can beat them — and a solution built on the assumption that width wins will be wrong on rows like this without ever looking wrong.",
      think:
        "Before trusting an intuition, find the input that breaks it. Ask what the answer would be if the tall posts stood near each other instead of at the edges.",
      constraint:
        "the container is capped by the shorter line and widened by the distance between them — two quantities, pulling opposite ways",
      preset: "inside",
    },
  ],
}
