// Maximum of Every Window, derived. Three rungs, and the middle one is the
// instructive failure: a heap remembers everything and cannot forget the one
// thing that just left the window.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/window-maximum/index.ts"

type N = Data<number> & { k: number }

export function windowMaxima(nums: number[], k: number) {
  const out: number[] = []
  for (let start = 0; start + k <= nums.length; start++)
    out.push(Math.max(...nums.slice(start, start + k)))
  return out
}

const windowMarks = (n: number, from: number, to: number, best: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) marks[i] = i >= from && i <= to ? "focus" : "dim"
  marks[best] = "answer"
  return marks
}

function* story({ nums, k }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `A window ${k} wide slides along the row one position at a time. Report the largest value inside it, at every position it takes.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Two neighbouring windows share all but two of their values, so re-reading each window from scratch throws away almost everything just learned. The question is what can be carried across the step — and, harder, what must be forgotten.",
  }
  const out = windowMaxima(nums, k)
  const dominated = nums.some((v, i) => i > 0 && v > nums[i - 1])
  yield {
    hold: 3,
    marks: windowMarks(nums.length, 0, k - 1, nums.indexOf(Math.max(...nums.slice(0, k)))),
    state: [{ label: "maxima", value: out.join(", ") }],
    answer: out,
    corner:
      k === 1
        ? "widthone"
        : k === nums.length
          ? "wholerow"
          : dominated
            ? "shadowed"
            : undefined,
    note:
      k === 1
        ? "A window one wide holds exactly one value, so the answer is the row itself. Legal, and the case where anything that assumes a window has an inside and an edge falls over."
        : k === nums.length
          ? `The window is as wide as the row, so there is exactly one of them and one answer: ${out[0]}. Also legal, and it means the count of windows can be as low as one.`
          : dominated
            ? `The maxima are ${out.join(", ")}. Notice a value here with something LARGER to its right: while both are in the window the smaller can never be reported, and the larger outlives it — so the smaller can be discarded the moment the bigger one arrives, permanently.`
            : `The maxima are ${out.join(", ")}, one per window position.`,
  }
}

function* scanEach({ nums, k }: N): Generator<DFrame> {
  const out: number[] = []
  for (let start = 0; start + k <= nums.length; start++) {
    let best = start
    for (let i = start; i < start + k; i++) if (nums[i] > nums[best]) best = i
    out.push(nums[best])
    yield {
      line: 6,
      marks: windowMarks(nums.length, start, start + k - 1, best),
      state: [
        { label: "window", value: `${start}…${start + k - 1}` },
        { label: "maximum", value: nums[best] },
      ],
      note: `Window ${start} to ${start + k - 1}: ${k} value${k === 1 ? "" : "s"} read, largest ${nums[best]}. The next window shares ${k - 1} of them and this rung will read every one again.`,
    }
  }
  yield {
    line: 8,
    answer: out,
    state: [{ label: "maxima", value: out.join(", ") }],
    note: `${out.join(", ")}. Correct, and each of the ${out.length} windows costs ${k} reads — with a wide window that is nearly the whole row, over and over.`,
  }
}

function* lazyHeap({ nums, k }: N): Generator<DFrame> {
  // (value, index) pairs kept sorted descending — the heap's behaviour, drawn
  // plainly, because what matters here is what it CANNOT do, not how it sifts
  const heap: [number, number][] = []
  const out: number[] = []
  for (let i = 0; i < nums.length; i++) {
    heap.push([nums[i], i])
    heap.sort((a, b) => b[0] - a[0] || a[1] - b[1])
    let stale = 0
    while (heap[0][1] <= i - k) {
      heap.shift()
      stale += 1
    }
    if (i >= k - 1) out.push(heap[0][0])
    yield {
      line: stale ? 9 : 7,
      marks: windowMarks(
        nums.length,
        Math.max(0, i - k + 1),
        i,
        i >= k - 1 ? heap[0][1] : i
      ),
      state: [
        { label: "held", value: heap.length },
        { label: "top", value: `${heap[0][0]} @ ${heap[0][1]}` },
      ],
      note: stale
        ? `${nums[i]} pushed. The top was ${stale} entr${stale === 1 ? "y" : "ies"} that already fell out of the window — they could not be removed when they left, only discarded now, on the way past. The top is ${heap[0][0]} at ${heap[0][1]}.`
        : `${nums[i]} pushed; ${heap.length} entr${heap.length === 1 ? "y" : "ies"} held, and the largest is ${heap[0][0]} at position ${heap[0][1]}${i >= k - 1 ? " — inside the window, so it is the answer" : ""}.`,
    }
  }
  yield {
    line: 12,
    answer: out,
    state: [
      { label: "maxima", value: out.join(", ") },
      { label: "still held", value: heap.length },
    ],
    note: `${out.join(", ")}, and ${heap.length} entr${heap.length === 1 ? "y" : "ies"} still sitting in the structure at the end. A heap can hand over its largest cheaply and cannot remove an arbitrary element at all — so everything ever pushed stays until it happens to reach the top.`,
  }
}

function* deque({ nums, k }: N): Generator<DFrame> {
  const best: number[] = []
  const out: number[] = []
  for (let i = 0; i < nums.length; i++) {
    let dropped = 0
    while (best.length && nums[best[best.length - 1]] <= nums[i]) {
      best.pop()
      dropped += 1
    }
    best.push(i)
    const expired = best[0] <= i - k
    if (expired) best.shift()
    if (i >= k - 1) out.push(nums[best[0]])
    yield {
      line: dropped ? 8 : expired ? 11 : 9,
      marks: {
        ...windowMarks(
          nums.length,
          Math.max(0, i - k + 1),
          i,
          i >= k - 1 ? best[0] : i
        ),
        ...(Object.fromEntries(
          best.slice(1).map((j) => [j, "anchor"])
        ) as Record<number, ChipRole>),
      },
      state: [
        { label: "candidates", value: best.map((j) => nums[j]).join(", ") },
        { label: "front", value: nums[best[0]] },
      ],
      note: `${nums[i]} arrives. ${dropped ? `${dropped} candidate${dropped === 1 ? "" : "s"} dropped from the back — each was smaller and older, so it can never be reported again while ${nums[i]} sits in the window with it, and ${nums[i]} outlives it. ` : ""}${expired ? `The front had fallen out of the window, so it left. ` : ""}The candidates now read ${best.map((j) => nums[j]).join(", ")} — always decreasing${i >= k - 1 ? `, and the front, ${nums[best[0]]}, is this window's answer` : ""}.`,
    }
  }
  yield {
    line: 14,
    answer: out,
    state: [{ label: "maxima", value: out.join(", ") }],
    note: `${out.join(", ")}. Nothing stale is ever held, so the front IS the answer with nothing to check. Each index is added once and removed once — ${nums.length} values, at most ${2 * nums.length} operations, whatever the window width.`,
  }
}

export const windowMaximum = deriveJourney(problem, {
  slug: "largest-in-every-window",
  subtitle: "what to carry across a step, and what to forget",
  reveals: ["sliding-window"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  params: [{ key: "k", label: "window width" }],
  classify: (d) => {
    const k = d.k as number
    const n = (d.nums as number[]).length
    return Number.isInteger(k) && k >= 1 && k <= n
      ? { ok: true }
      : { ok: false, warning: `the window width must be between 1 and ${n}` }
  },
  presets: {
    example: {
      label: "the example",
      nums: [1, 3, -1, -3, 5, 3, 6, 7],
      extra: { k: 3 },
    },
    widthone: {
      label: "a window of one",
      nums: [1, 3, -1, -3, 5],
      extra: { k: 1 },
      info: "the answer is the row itself",
    },
    wholerow: {
      label: "a window as wide as the row",
      nums: [4, 2, 1],
      extra: { k: 3 },
      info: "exactly one window",
    },
    shadowed: {
      label: "everything is beaten from the right",
      nums: [1, 2, 3, 4, 5],
      extra: { k: 3 },
      info: "each value outlived by a larger one",
    },
    falling: {
      label: "it only falls",
      nums: [9, 7, 5, 3, 1],
      extra: { k: 2 },
      info: "nothing is ever dropped from the back",
    },
    long: {
      label: "a longer row",
      nums: [4, 1, 9, 2, 8, 3, 7, 0, 6, 5, 10, 2],
      extra: { k: 4 },
    },
  },
  edges: [
    {
      key: "widthone",
      name: "a window one wide",
      example: "k = 1 → the row itself",
      why: "Every window holds a single value, so the answer is the input unchanged. Anything assuming a window has an interior, or that at least one value gets discarded per step, breaks here.",
      think: "Does your first window produce an answer before anything has been evicted?",
      preset: "widthone",
      constraint: 3,
    },
    {
      key: "wholerow",
      name: "the window is the whole row",
      example: "[4, 2, 1], k = 3 → [4]",
      why: "There is exactly one window and one answer, and nothing ever leaves. The count of answers is length − k + 1, which can legitimately be 1.",
      think: "How many answers should there be, and does your loop produce exactly that many?",
      preset: "wholerow",
      constraint: 2,
    },
    {
      key: "shadowed",
      name: "every value is beaten from the right",
      example: "[1, 2, 3, 4, 5], k = 3 → [3, 4, 5]",
      why: "Each value has a larger one arriving later that also outlives it, so it can never be reported again. Anything that keeps such values around is carrying entries it will only ever discard.",
      think: "When a bigger value arrives, is the smaller one still a candidate for anything?",
      preset: "shadowed",
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
        "given: a row of integers and a window width k",
        "the window starts at the front and slides one position at a time",
        "report the largest value inside it, every time",
        "answers: length − k + 1 of them, in order",
      ],
      tools: [
        {
          name: "Array of integers",
          role: "a row addressed by position, with a fixed-width view sliding across it. Consecutive views overlap in all but two positions, which is the entire opportunity.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is one value per window position, so nothing can be skipped",
        "neighbouring windows share k − 1 values: recomputing is throwing away what you just learned",
        "the hard half is not remembering — it is forgetting the value that just fell out",
      ],
      quiz: [
        {
          q: "A value has a larger value to its right, both inside the window. Can the smaller one ever be reported?",
          choices: [
            "yes, once the larger one leaves",
            "no — the larger one leaves the window later, so it beats it for the rest of its life",
          ],
          answer: 1,
          explain:
            "Windows only move right, so anything to the right survives at least as long. A value with a bigger, younger neighbour is finished the moment that neighbour arrives.",
        },
      ],
      run: story,
    },
    {
      key: "scan",
      name: "Read every window",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "For each window position, walk its k values and take the largest. Start fresh every time.",
      takeaways: [
        "n windows times k reads each",
        "with a wide window that is close to reading the row once per position",
        "and the k − 1 values shared with the previous window are re-read every single step",
      ],
      run: scanEach,
    },
    {
      key: "heap",
      name: "Remember everything, discard on the way past",
      short: "log n, and it cannot forget",
      from: 1,
      insight:
        "Re-reading the shared values is obviously wasteful, so remember them — put every value into a structure that can hand back the largest cheaply. Then the trouble starts.",
      idea: "Push each value with its position into a heap. Before reading the top, discard any entries whose position has already fallen out of the window. What is left on top is the answer.",
      takeaways: [
        "a heap surrenders its largest cheaply and cannot remove an arbitrary element at all",
        "so the value that just left the window cannot be taken out — only skipped, later, if it reaches the top",
        "stale entries accumulate, and the top has to be checked before it can be trusted",
        "correct, and it holds entries long after they stopped being candidates",
      ],
      quiz: [
        {
          q: "Why can the element that just left the window not simply be removed?",
          choices: [
            "because it might come back",
            "because a heap only offers cheap access to its extreme, not to a particular element",
          ],
          answer: 1,
          explain:
            "Finding a specific element inside a heap means searching it. The lazy discard is a workaround for a structure that does not support the operation actually needed.",
        },
      ],
      run: lazyHeap,
    },
    {
      key: "deque",
      name: "Keep only what could still win",
      short: "one push and one pop each",
      insight:
        "The heap holds values that are already finished — a value with a larger, younger neighbour can never be reported again. Throw those away as they are beaten, and what remains is a decreasing list whose front is the answer, with nothing stale to skip.",
      idea: problem.whyNow!,
      takeaways: [
        "a new value evicts every smaller one behind it: they are older and beaten, so they are finished forever",
        "what survives is decreasing from front to back, and the front is the window's maximum",
        "the front, and only the front, can expire — check its position once per step",
        "each index is added once and removed once, so the whole pass is linear whatever the width",
      ],
      quiz: [
        {
          q: "Why is the list of candidates always decreasing?",
          choices: [
            "because the input is sorted",
            "because every arrival removes the smaller values behind it before joining",
          ],
          answer: 1,
          explain:
            "It is an invariant the algorithm maintains, not a property of the input. Anything a new value out-ranks is gone before that value is added.",
        },
      ],
      run: deque,
    },
  ],
})
