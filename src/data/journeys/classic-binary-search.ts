// Find a Target in Sorted Array, derived. The first derived journey with a
// scalar beside the row (`params: [target]`), and the first whose input can be
// ILLEGAL — an unsorted row would make every rung past the first animate a lie,
// so `classify` refuses it rather than drawing it.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/classic-binary-search/index.ts"

type N = Data<number> & { target: number }

// Everything outside [lo, hi] has been ruled out — drawn as such, because the
// discard is the entire idea and a row that never dims does not show it.
const ruledOut = (n: number, lo: number, hi: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) if (i < lo || i > hi) marks[i] = "dim"
  return marks
}

export const indexOfTarget = (nums: number[], target: number) =>
  nums.indexOf(target)

function* story({ nums, target }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `A row that is already in ascending order, and a number to find: ${target}. Return where it sits, or −1 if it is not there at all.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The ordering is not decoration, it is the promise the input makes, and the promise is what makes a sub-linear answer possible at all. Read any single element and it tells you something about every element on both sides of it.",
  }
  const at = indexOfTarget(nums, target)
  yield {
    hold: 3,
    marks: at >= 0 ? { [at]: "answer" } : {},
    state: [
      { label: "target", value: target },
      { label: "answer", value: at },
    ],
    answer: at,
    corner:
      nums.length === 1
        ? "single"
        : at < 0
          ? "absent"
          : at === nums.length - 1
            ? "last"
            : undefined,
    note:
      nums.length === 1
        ? `One element, so there is one place to look and the answer is ${at}. A search that opens by computing a midpoint between two ends must still cope when the two ends are the same position.`
        : at < 0
          ? `${target} is not here. It would belong between two neighbours that are already beside each other, so the range being searched has to be allowed to close to nothing — that emptiness IS the −1.`
          : at === nums.length - 1
            ? `${target} sits at ${at}, the very last position. Worth remembering: a search whose range excludes its own upper end never looks here, and answers −1 for a value it is standing next to.`
            : `${target} sits at ${at}. Reading it directly is cheating — the question is how few elements you can read and still be certain.`,
  }
}

function* scan({ nums, target }: N): Generator<DFrame> {
  for (let i = 0; i < nums.length; i++) {
    const hit = nums[i] === target
    yield {
      line: 2,
      marks: { [i]: hit ? "answer" : "focus" },
      state: [
        { label: "at", value: i },
        { label: "value", value: nums[i] },
      ],
      note: hit
        ? `${nums[i]} is the target. Return ${i}.`
        : `${nums[i]} is not ${target}. Move on — and note that this step learned nothing about anything except position ${i}.`,
    }
    if (hit) {
      yield { line: 3, answer: i, note: `Return ${i}.` }
      return
    }
  }
  yield {
    line: 4,
    answer: -1,
    note: `Every position read, ${target} nowhere. Correct, and it never once used the fact that the row is in order — this same code answers an unsorted row just as well, which is exactly what is wrong with it here.`,
  }
}

// The recursion, flattened into frames: `go(lo, hi)` becomes one frame per
// call, and the pseudocode line is the branch that call took.
function* recurse({ nums, target }: N): Generator<DFrame> {
  let lo = 0
  let hi = nums.length - 1
  let depth = 0
  for (;;) {
    if (lo > hi) {
      yield {
        line: 3,
        marks: ruledOut(nums.length, lo, hi),
        state: [{ label: "depth", value: depth }],
        note: `go(${lo}, ${hi}) — the range is empty, so there is nowhere left for ${target} to hide. Return −1 back up through ${depth} waiting call${depth === 1 ? "" : "s"}.`,
      }
      yield { line: 3, answer: -1, note: "Return −1." }
      return
    }
    const mid = Math.floor((lo + hi) / 2)
    const marks = { ...ruledOut(nums.length, lo, hi), [mid]: "focus" as ChipRole }
    if (nums[mid] === target) {
      yield {
        line: 6,
        marks: { ...marks, [mid]: "answer" },
        state: [{ label: "depth", value: depth }],
        note: `go(${lo}, ${hi}) reads position ${mid}: ${nums[mid]}, the target. Return ${mid} — and it unwinds through ${depth} call${depth === 1 ? "" : "s"} that are still on the stack doing nothing but waiting.`,
      }
      yield { line: 6, answer: mid, note: `Return ${mid}.` }
      return
    }
    const right = nums[mid] < target
    yield {
      line: right ? 8 : 9,
      marks,
      state: [
        { label: "depth", value: depth },
        { label: "mid", value: nums[mid] },
      ],
      note: `go(${lo}, ${hi}) reads ${nums[mid]} at ${mid}: ${right ? "smaller" : "larger"} than ${target}, so everything ${right ? "at and left of" : "at and right of"} ${mid} is out. Call go(${right ? mid + 1 : lo}, ${right ? hi : mid - 1}) — a new frame, stacked on this one.`,
    }
    if (right) lo = mid + 1
    else hi = mid - 1
    depth += 1
  }
}

function* loop({ nums, target }: N): Generator<DFrame> {
  let lo = 0
  let hi = nums.length - 1
  let probes = 0
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    probes += 1
    const marks = { ...ruledOut(nums.length, lo, hi), [mid]: "focus" as ChipRole }
    if (nums[mid] === target) {
      yield {
        line: 5,
        marks: { ...marks, [mid]: "answer" },
        state: [
          { label: "probes", value: probes },
          { label: "lo·hi", value: `${lo}·${hi}` },
        ],
        note: `Probe ${probes}: position ${mid} holds ${nums[mid]}. Found, at ${mid}, having read ${probes} of ${nums.length} elements and nothing on the stack but three integers.`,
      }
      yield { line: 5, answer: mid, note: `Return ${mid}.` }
      return
    }
    const right = nums[mid] < target
    yield {
      line: right ? 7 : 9,
      marks,
      state: [
        { label: "probes", value: probes },
        { label: "lo·hi", value: `${lo}·${hi}` },
      ],
      note: `Probe ${probes}: ${nums[mid]} at ${mid} is ${right ? "below" : "above"} ${target}, so ${right ? `${mid + 1 - lo}` : `${hi - mid + 1}`} position${(right ? mid + 1 - lo : hi - mid + 1) === 1 ? "" : "s"} leave the range. ${right ? `lo = ${mid + 1}` : `hi = ${mid - 1}`} — mid ± 1, never mid itself, or the range would stop shrinking and the loop would never end.`,
    }
    if (right) lo = mid + 1
    else hi = mid - 1
  }
  yield {
    line: 10,
    answer: -1,
    state: [{ label: "probes", value: probes }],
    note: `lo passed hi: the range is empty and ${target} was never in it. −1, after ${probes} probe${probes === 1 ? "" : "s"} — the same halvings as before, with nothing kept but two integers.`,
  }
}

const sortedAscending = (nums: number[]) =>
  nums.every((v, i) => i === 0 || nums[i - 1] < v)

export const classicBinarySearch = deriveJourney<number>(problem, {
  slug: "find-in-sorted",
  subtitle: "the promise the input makes, and how few elements you must read",
  reveals: ["binary-search"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  params: [{ key: "target", label: "target" }],
  // Every rung past the linear scan is only correct because the row is
  // ordered; animating one on an unsorted row would teach a false rule.
  classify: (d) =>
    sortedAscending(d.nums as number[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "the row must be in ascending order with no repeats — that promise is what the halving rests on",
        },
  presets: {
    example: {
      label: "the example",
      nums: [-3, 0, 4, 9, 12],
      extra: { target: 9 },
    },
    absent: {
      label: "not in the row",
      nums: [-3, 0, 4, 9, 12],
      extra: { target: 2 },
      info: "2 would belong between two neighbours",
    },
    single: {
      label: "one element",
      nums: [5],
      extra: { target: 5 },
      info: "both ends are the same position",
    },
    last: {
      label: "at the very end",
      nums: [-3, 0, 4, 9, 12],
      extra: { target: 12 },
      info: "the position a half-open range never reaches",
    },
    long: {
      label: "a longer row",
      nums: [-40, -31, -12, -5, 0, 3, 7, 11, 18, 24, 29, 33, 41, 55, 62],
      extra: { target: 29 },
    },
  },
  edges: [
    {
      key: "single",
      name: "one element",
      example: "[5], target 5 → 0",
      why: "The midpoint of a range whose two ends are the same position is that position, so the very first probe must be allowed to be the answer.",
      think: "Does your loop run at all when lo and hi start equal?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "absent",
      name: "the target is not there",
      example: "[-3, 0, 4, 9, 12], target 2 → -1",
      why: "2 belongs between 0 and 4, which are already neighbours. The range has to be allowed to close to nothing, and that emptiness is the only signal that the answer is -1.",
      think: "What is the state of your range at the moment you know the answer is -1?",
      preset: "absent",
      constraint: 3,
    },
    {
      key: "last",
      name: "the target sits at the very end",
      example: "[-3, 0, 4, 9, 12], target 12 → 4",
      why: "A range that excludes its own upper end never reads the last position, and answers -1 for a value that is sitting right there.",
      think: "Is the upper end of your range inside the search or outside it — and does every line agree?",
      preset: "last",
      constraint: 2,
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
        "given: a row in ascending order, all values distinct",
        "given: a target to find",
        "promise: reading one element says something about both sides of it",
        "task: return its position, or −1",
      ],
      tools: [
        {
          name: "Sorted array",
          role: "a row addressed by position whose values only ever increase. That single promise is the entire input — without it none of what follows is correct.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is a position, and −1 is a real answer, not an error",
        "the ordering is a promise about elements you have not read yet",
        "the cost to beat is reading every element; the question is how few you can get away with",
      ],
      quiz: [
        {
          q: "You read one element in the middle and it is smaller than the target. What do you now know?",
          choices: [
            "only that this one element is not the target",
            "that it and everything to its left cannot be the target",
          ],
          answer: 1,
          explain:
            "The row only increases, so everything left of a value smaller than the target is smaller still. One read ruled out half the row — that is the promise being spent.",
        },
      ],
      run: story,
    },
    {
      key: "scan",
      name: "Read them all",
      short: "the honest one",
      from: "scan",
      insight: "",
      idea: "Walk from the front comparing each element with the target, and return the first position that matches. If the walk finishes, return −1.",
      takeaways: [
        "n reads worst case, and correct on any row at all",
        "it never uses the ordering — the same code works, and costs the same, on a shuffled row",
        "an approach that ignores what the input promises is leaving the whole problem on the table",
      ],
      quiz: [
        {
          q: "What would change about this rung if the row were shuffled?",
          choices: ["it would break", "nothing at all"],
          answer: 1,
          explain:
            "Nothing — which is precisely the complaint. The input's one guarantee is worth nothing to an approach that never reads it.",
        },
      ],
      run: scan,
    },
    {
      key: "recurse",
      name: "Halve the range",
      short: "log n reads, n frames",
      from: "recurse",
      insight:
        "Reading front to back throws away what each comparison tells you about everything else. Read the MIDDLE instead and the answer to one comparison rules out half the row — then ask the same question of what is left.",
      idea: "Look at the midpoint of the range still in play. Equal means done. Smaller means the target can only be to the right, larger only to the left. Ask the same question of that half, and again, until the range is empty.",
      takeaways: [
        "each read halves what remains, so a row of a million costs about twenty reads",
        "'ask the same question of a smaller range' is the definition of the recursion",
        "the empty range is the base case, and it is what −1 means",
        "every call still waiting for its answer costs a stack frame that holds nothing but two integers",
      ],
      quiz: [
        {
          q: "The range is empty (lo has passed hi). What does that mean?",
          choices: [
            "the search failed and the target is absent",
            "the search should restart from the whole row",
          ],
          answer: 0,
          explain:
            "Every element was ruled out by some comparison, so there is nowhere left the target could be hiding. Emptiness is the answer, not an error.",
        },
      ],
      run: recurse,
    },
    {
      key: "loop",
      name: "The same halving, without the stack",
      short: "log n reads, three integers",
      insight:
        "Each call does its work and hands the answer straight back up untouched — nothing waits on the return, so nothing needs to be remembered while it happens. A frame per halving buys precisely nothing.",
      idea: problem.whyNow!,
      takeaways: [
        "when a call does nothing after its own recursive call returns, the stack is dead weight",
        "the range is inclusive on both ends, so the loop runs while lo <= hi — not <",
        "move to mid ± 1, never to mid itself, or the range stops shrinking and the loop spins forever",
        "this is binary search, and every off-by-one bug in it lives in those two lines",
      ],
      quiz: [
        {
          q: "Why must the update be mid + 1 or mid − 1 rather than mid?",
          choices: [
            "to skip an element that cannot be the answer",
            "because mid has already been ruled out, and a range that keeps it can stop shrinking",
          ],
          answer: 1,
          explain:
            "Both are true, but the second is the one that bites: on a two-element range mid can equal lo, so setting lo = mid leaves the range identical and the loop never ends.",
        },
      ],
      run: loop,
    },
  ],
})
