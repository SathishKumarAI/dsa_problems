// First and Last Position of a Value, derived. Ordinary binary search finds
// SOME occurrence, and the whole journey is about the gap between "some" and
// "the first" — a gap that a walk outward closes badly and a bias closes for
// free.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/binary-search/first-last-position.ts"

type N = Data<number> & { target: number }

export function rangeOf(nums: number[], target: number) {
  const first = nums.indexOf(target)
  return first < 0 ? [-1, -1] : [first, nums.lastIndexOf(target)]
}

const ruledOut = (n: number, lo: number, hi: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) if (i < lo || i > hi) marks[i] = "dim"
  return marks
}

function* story({ nums, target }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `A sorted row that may hold ${target} many times over, and two positions to return: where the run of ${target}s begins and where it ends.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Finding SOME occurrence is the search you already know. Finding the FIRST one is a different question, and the difference is the entire problem: landing on a match is no longer a reason to stop.",
  }
  if (!nums.length) {
    yield {
      hold: 3,
      answer: [-1, -1],
      corner: "empty",
      note: "An empty row. Both answers are −1, and a search whose range starts at [0, length − 1] opens with hi = −1, which had better mean 'nothing to look at' rather than a crash.",
    }
    return
  }
  const [first, last] = rangeOf(nums, target)
  yield {
    hold: 3,
    marks:
      first >= 0
        ? (Object.fromEntries(
            Array.from({ length: last - first + 1 }, (_, i) => [
              first + i,
              "answer",
            ])
          ) as Record<number, ChipRole>)
        : {},
    state: [{ label: "answer", value: `${first}, ${last}` }],
    answer: [first, last],
    corner:
      first < 0
        ? "absent"
        : last - first + 1 === nums.length
          ? "allsame"
          : undefined,
    note:
      first < 0
        ? `${target} is not in this row at all, so the answer is −1, −1 — a pair of real answers rather than a failure. Whatever records a position must therefore start at −1 and be allowed to stay there.`
        : last - first + 1 === nums.length
          ? `Every position holds ${target}, so the answer is 0, ${last}. Watch what this does to anything that finds one occurrence and then walks outward: the walk covers the entire row, and the search that found the foothold saved nothing at all.`
          : `${target} occupies positions ${first} to ${last} — ${last - first + 1} of them.`,
  }
}

function* scanEnds({ nums, target }: N): Generator<DFrame> {
  let first = -1
  let last = -1
  for (let i = 0; i < nums.length; i++) {
    const hit = nums[i] === target
    yield {
      line: 4,
      marks: { [i]: hit ? "answer" : "focus" },
      state: [{ label: "from the front", value: i }],
      note: hit
        ? `${nums[i]} at ${i} is the target — the first occurrence, because nothing before it was.`
        : `${nums[i]} at ${i} is not ${target}. Keep walking forward.`,
    }
    if (hit) {
      first = i
      break
    }
  }
  for (let i = nums.length - 1; i >= 0; i--) {
    const hit = nums[i] === target
    yield {
      line: 8,
      marks: { [i]: hit ? "answer" : "focus" },
      state: [{ label: "from the back", value: i }],
      note: hit
        ? `And from the other end: ${i} is the last occurrence.`
        : `${nums[i]} at ${i} is not ${target}. Keep walking backward.`,
    }
    if (hit) {
      last = i
      break
    }
  }
  yield {
    line: 11,
    answer: [first, last],
    state: [{ label: "answer", value: `${first}, ${last}` }],
    note: `${first}, ${last}. Two walks, and neither of them read the one thing the input guarantees — that the row is ordered. On an absent target both walks cover the whole row.`,
  }
}

function* findThenWalk({ nums, target }: N): Generator<DFrame> {
  let lo = 0
  let hi = nums.length - 1
  let at = -1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const marks = {
      ...ruledOut(nums.length, lo, hi),
      [mid]: "focus" as ChipRole,
    }
    if (nums[mid] === target) {
      at = mid
      yield {
        line: 6,
        marks: { ...marks, [mid]: "answer" },
        state: [{ label: "foothold", value: mid }],
        note: `Position ${mid} holds ${target}. A foothold — but which occurrence is it? Nothing here says. Stop searching and start feeling outward.`,
      }
      break
    }
    const right = nums[mid] < target
    yield {
      line: right ? 9 : 11,
      marks,
      state: [{ label: "lo·hi", value: `${lo}·${hi}` }],
      note: `${nums[mid]} at ${mid} is ${right ? "below" : "above"} ${target}: half the range goes.`,
    }
    if (right) lo = mid + 1
    else hi = mid - 1
  }
  if (at < 0) {
    yield {
      line: 13,
      answer: [-1, -1],
      note: `${target} was never found, so −1, −1 — and this half cost the same handful of probes a plain search would.`,
    }
    return
  }
  let first = at
  let steps = 0
  while (first > 0 && nums[first - 1] === target) {
    first -= 1
    steps += 1
    yield {
      line: 16,
      marks: { [first]: "answer", [at]: "anchor" },
      state: [
        { label: "first", value: first },
        { label: "steps", value: steps },
      ],
      note: `Position ${first} is another ${target}. Step left again — one position at a time, because nothing here halves anything.`,
    }
  }
  let last = at
  while (last + 1 < nums.length && nums[last + 1] === target) {
    last += 1
    steps += 1
    yield {
      line: 19,
      marks: { [last]: "answer", [at]: "anchor" },
      state: [
        { label: "last", value: last },
        { label: "steps", value: steps },
      ],
      note: `And ${last} is another. Step right.`,
    }
  }
  yield {
    line: 20,
    answer: [first, last],
    state: [
      { label: "answer", value: `${first}, ${last}` },
      { label: "steps walked", value: steps },
    ],
    note: `${first}, ${last} — found in a few probes, then ${steps} single step${steps === 1 ? "" : "s"} outward. On this row that is cheap; on a row that is entirely ${target}, those steps are the whole array and the search bought nothing.`,
  }
}

function* biased({ nums, target }: N): Generator<DFrame> {
  const bound = function* (
    first: boolean
  ): Generator<DFrame, number, unknown> {
    let lo = 0
    let hi = nums.length - 1
    let found = -1
    let probes = 0
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      probes += 1
      const marks = {
        ...ruledOut(nums.length, lo, hi),
        [mid]: "focus" as ChipRole,
      }
      if (nums[mid] === target) {
        found = mid
        yield {
          line: first ? 8 : 10,
          marks: { ...marks, [mid]: "answer" },
          state: [
            { label: first ? "first so far" : "last so far", value: found },
            { label: "probes", value: probes },
          ],
          note: `Position ${mid} holds ${target}. Record it — and do NOT stop: keep searching to the ${first ? "left, where an earlier" : "right, where a later"} one would be. ${first ? "hi" : "lo"} = ${first ? mid - 1 : mid + 1}.`,
        }
        if (first) hi = mid - 1
        else lo = mid + 1
        continue
      }
      const right = nums[mid] < target
      yield {
        line: right ? 12 : 14,
        marks,
        state: [
          { label: "lo·hi", value: `${lo}·${hi}` },
          { label: "probes", value: probes },
        ],
        note: `${nums[mid]} at ${mid} is ${right ? "below" : "above"} ${target}: half the range goes, exactly as in an ordinary search.`,
      }
      if (right) lo = mid + 1
      else hi = mid - 1
    }
    yield {
      line: 15,
      marks: found >= 0 ? { [found]: "answer" } : {},
      state: [
        { label: first ? "first" : "last", value: found },
        { label: "probes", value: probes },
      ],
      note: `The range is empty. The last thing recorded was ${found}${found < 0 ? " — nothing was ever recorded, so the answer is −1" : `, which is therefore the ${first ? "earliest" : "latest"} occurrence: every later probe went ${first ? "left" : "right"} and found nothing better`}. ${probes} probe${probes === 1 ? "" : "s"}.`,
    }
    return found
  }
  const first = yield* bound(true)
  const last = yield* bound(false)
  yield {
    line: 19,
    answer: [first, last],
    marks:
      first >= 0
        ? (Object.fromEntries(
            Array.from({ length: last - first + 1 }, (_, i) => [
              first + i,
              "answer",
            ])
          ) as Record<number, ChipRole>)
        : {},
    state: [{ label: "answer", value: `${first}, ${last}` }],
    note: `${first}, ${last}. Two searches, each still halving every step — so a run of a million equal values costs exactly what a run of one costs. And the absent case needed no branch of its own: nothing was recorded, so −1 stood.`,
  }
}

const nonDecreasing = (nums: number[]) =>
  nums.every((v, i) => i === 0 || nums[i - 1] <= v)

export const firstLastPosition = deriveJourney<number>(problem, {
  slug: "both-ends-of-a-run",
  subtitle: "why landing on the target is not a reason to stop",
  reveals: ["binary-search"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  params: [{ key: "target", label: "target" }],
  classify: (d) =>
    nonDecreasing(d.nums as number[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "the row must be in non-decreasing order — duplicates are welcome, disorder is not",
        },
  presets: {
    example: {
      label: "the example",
      nums: [5, 7, 7, 8, 8, 10],
      extra: { target: 8 },
    },
    absent: {
      label: "the target is missing",
      nums: [5, 7, 7, 8, 8, 10],
      extra: { target: 6 },
      info: "it would slot between 5 and 7",
    },
    empty: {
      label: "an empty row",
      nums: [],
      extra: { target: 3 },
      info: "nothing to search at all",
    },
    allsame: {
      label: "every value is the target",
      nums: [4, 4, 4, 4, 4, 4, 4],
      extra: { target: 4 },
      info: "the run is the whole row",
    },
    once: {
      label: "it appears exactly once",
      nums: [1, 3, 5, 7],
      extra: { target: 5 },
      info: "first and last are the same position",
    },
    long: {
      label: "a longer row",
      nums: [1, 2, 2, 2, 5, 5, 9, 9, 9, 9, 9, 11, 14, 14, 20],
      extra: { target: 9 },
    },
  },
  edges: [
    {
      key: "empty",
      name: "an empty row",
      example: "[], target 3 → [-1, -1]",
      why: "A range of [0, length − 1] opens as [0, −1] here. That has to read as 'nothing to look at' and end the search immediately, not as a position to probe.",
      think: "What is your range on an empty row, and does your loop condition reject it?",
      preset: "empty",
      constraint: 0,
    },
    {
      key: "absent",
      name: "the target is not there",
      example: "[5, 7, 7, 8, 8, 10], target 6 → [-1, -1]",
      why: "-1, -1 is the answer, not an error. Whatever records a found position has to start at -1 and be allowed to finish there without any special branch.",
      think: "Where does your answer come from when nothing was ever found?",
      preset: "absent",
      constraint: 3,
    },
    {
      key: "allsame",
      name: "the run is the whole row",
      example: "[4, 4, 4, 4, 4, 4, 4], target 4 → [0, 6]",
      why: "Finding one occurrence and walking outward covers every position here, so the logarithmic search saved nothing. This is the input that separates 'log n plus the run' from 'log n'.",
      think: "How long can the run of equal values be, and does your cost grow with it?",
      preset: "allsame",
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
        "given: a row in non-decreasing order, duplicates allowed",
        "given: a target that may occupy a run of positions",
        "task: return the first and the last of them",
        "absent, or empty: return −1, −1",
      ],
      tools: [
        {
          name: "Sorted array with duplicates",
          role: "a row whose values never decrease. Equal values are therefore contiguous — a run, never scattered — which is what makes 'first and last' a well-posed pair rather than a list.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "equal values in a sorted row are always contiguous, so the answer is a range",
        "two answers, and −1, −1 is a legitimate one",
        "finding some occurrence is the easy part; knowing WHICH one you found is the problem",
      ],
      quiz: [
        {
          q: "An ordinary binary search lands on the target. Which occurrence has it found?",
          choices: [
            "the first one",
            "the middle one",
            "no way to tell — whichever the halving happened to land on",
          ],
          answer: 2,
          explain:
            "The probe sequence depends only on the range, not on the values, so where in the run it lands is an accident of arithmetic.",
        },
      ],
      run: story,
    },
    {
      key: "scan",
      name: "Walk in from both ends",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk forward until the target appears — that is the first occurrence. Walk backward until it appears — that is the last. Two passes, no cleverness.",
      takeaways: [
        "obviously correct, and it never reads the ordering at all",
        "an absent target costs two full passes",
        "the ends are the right places to start, which is the one idea worth keeping from this rung",
      ],
      run: scanEnds,
    },
    {
      key: "walk",
      name: "Find one, then feel outward",
      short: "log n, plus the run",
      from: 1,
      insight:
        "The scan ignores the ordering entirely. Halving finds an occurrence in a handful of probes — but it finds an arbitrary one, so the ends still have to be located by stepping.",
      idea: "Binary search for any occurrence. From that foothold, step left while the neighbour is still the target, then step right the same way. The two stopping points are the answer.",
      takeaways: [
        "the foothold is cheap; the stepping is not",
        "cost is log n plus the LENGTH OF THE RUN, and the run can be the whole row",
        "a row that is entirely the target degrades this to a full scan with extra steps",
      ],
      quiz: [
        {
          q: "On [4, 4, 4, 4, 4, 4, 4] with target 4, what does this rung cost?",
          choices: [
            "about three probes",
            "a few probes plus a walk across every position",
          ],
          answer: 1,
          explain:
            "The search lands in the middle immediately, and then steps outward one position at a time to both ends. The halving saved nothing.",
        },
      ],
      run: findThenWalk,
    },
    {
      key: "biased",
      name: "Record the hit and keep halving",
      short: "log n, whatever the run",
      insight:
        "The walk exists only because the search threw away its own progress: it stopped the moment it found something, in a structure that could have kept halving. Do not stop — record, and carry on into the side that could hold a better answer.",
      idea: problem.whyNow!,
      takeaways: [
        "on a hit, record the position and keep going — left for the first, right for the last",
        "the last thing recorded is the answer, because every later probe searched a better side and failed",
        "both searches still halve every step, so the length of the run costs nothing at all",
        "and the absent case needs no branch: nothing was recorded, so −1 stands",
      ],
      quiz: [
        {
          q: "Searching for the FIRST occurrence, why is the last recorded position the answer?",
          choices: [
            "because the search visits positions in increasing order",
            "because after every hit the search continues strictly left, so anything recorded later is strictly earlier",
          ],
          answer: 1,
          explain:
            "Each recorded hit is further left than the one before it. When the range finally empties, no earlier occurrence exists — otherwise the search would have found it.",
        },
      ],
      run: biased,
    },
  ],
})
