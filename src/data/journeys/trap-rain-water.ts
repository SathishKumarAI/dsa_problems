// Water Held by an Elevation Map, derived. One reframing does all the work:
// stop looking at pools and ask what a single column holds. Everything after
// that is about how cheaply the two maxima can be known.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/two-pointers/trap-rain-water.ts"

type N = Data<number>

export function waterHeld(height: number[]) {
  let total = 0
  for (let i = 0; i < height.length; i++) {
    const left = Math.max(...height.slice(0, i + 1))
    const right = Math.max(...height.slice(i))
    total += Math.min(left, right) - height[i]
  }
  return total
}

const wet = (height: number[]) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < height.length; i++) {
    const left = Math.max(...height.slice(0, i + 1))
    const right = Math.max(...height.slice(i))
    marks[i] = Math.min(left, right) > height[i] ? "answer" : "dim"
  }
  return marks
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Each number is the height of a bar one unit wide, standing on flat ground. It rains until nothing more can be held. How many unit squares of water are left sitting between the bars?",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The instinct is to look for pools and measure them, and pools are awkward — they merge, they nest, they span the whole map. Ask a smaller question instead: how much water sits above ONE column? Add those up and the pools take care of themselves.",
  }
  const total = waterHeld(nums)
  const rising = nums.every((v, i) => i === 0 || v >= nums[i - 1])
  const falling = nums.every((v, i) => i === 0 || v <= nums[i - 1])
  yield {
    hold: 3,
    marks: wet(nums),
    state: [{ label: "water", value: total }],
    answer: total,
    corner:
      nums.length <= 2
        ? "tiny"
        : rising || falling
          ? "monotonic"
          : nums[0] === Math.max(...nums) || nums[nums.length - 1] === Math.max(...nums)
            ? "tallend"
            : undefined,
    note:
      nums.length <= 2
        ? `${nums.length} bar${nums.length === 1 ? "" : "s"}, so nothing can have a taller bar on both sides of it: the answer is 0. Water needs walls on either side, and the two ends of the map never have both.`
        : rising || falling
          ? `This map only ever ${rising ? "rises" : "falls"}, so every column has nothing taller on ${rising ? "its left" : "its right"} — and the answer is 0 however long the map gets. Size is not what makes water; shape is.`
          : nums[0] === Math.max(...nums) || nums[nums.length - 1] === Math.max(...nums)
            ? `${total} unit${total === 1 ? "" : "s"} of water. The tallest bar on the whole map is at one END here, which means one side's maximum is the same for every column — a nice reminder that the two maxima are rarely both interesting.`
            : `${total} unit${total === 1 ? "" : "s"} of water, resting wherever a column is lower than the shorter of the two walls that surround it.`,
  }
}

function* perColumn({ nums }: N): Generator<DFrame> {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    const left = Math.max(...nums.slice(0, i + 1))
    const right = Math.max(...nums.slice(i))
    const held = Math.min(left, right) - nums[i]
    total += held
    yield {
      line: 5,
      marks: {
        ...(Object.fromEntries(
          nums.map((_, k) => [k, "dim"])
        ) as Record<number, ChipRole>),
        [nums.indexOf(left)]: "anchor",
        [nums.lastIndexOf(right)]: "anchor",
        [i]: held > 0 ? "answer" : "focus",
      },
      state: [
        { label: "walls", value: `${left} · ${right}` },
        { label: "water", value: total },
      ],
      note: `Column ${i} stands ${nums[i]} high. The tallest bar at or left of it is ${left}, at or right of it ${right}; water rises to the SHORTER of those, ${Math.min(left, right)}, so this column holds ${held}. ${held === 0 ? "Nothing — it is at least as tall as one of its walls." : `Running total ${total}.`}`,
    }
  }
  yield {
    line: 6,
    answer: total,
    state: [{ label: "water", value: total }],
    note: `${total}. The reframing works — but each column rescans the entire map twice to find its two walls, and its neighbour then does exactly the same again.`,
  }
}

function* prefixMax({ nums }: N): Generator<DFrame> {
  const n = nums.length
  const left = new Array<number>(n).fill(0)
  const right = new Array<number>(n).fill(0)
  left[0] = nums[0]
  for (let i = 1; i < n; i++) {
    left[i] = Math.max(left[i - 1], nums[i])
    yield {
      line: 8,
      row: [...left],
      marks: { [i]: "focus", [i - 1]: "anchor" },
      state: [{ label: `tallest so far`, value: left[i] }],
      note: `Tallest bar at or before ${i}: the tallest before it was ${left[i - 1]}, and this bar is ${nums[i]}, so ${left[i]}. One comparison, not a scan.`,
    }
  }
  right[n - 1] = nums[n - 1]
  for (let i = n - 2; i >= 0; i--) {
    right[i] = Math.max(right[i + 1], nums[i])
    yield {
      line: 11,
      row: [...right],
      marks: { [i]: "focus", [i + 1]: "anchor" },
      state: [{ label: "tallest from the right", value: right[i] }],
      note: `And the same from the far end inwards: tallest at or after ${i} is ${right[i]}.`,
    }
  }
  const total = nums.reduce(
    (acc, h, i) => acc + Math.min(left[i], right[i]) - h,
    0
  )
  yield {
    line: 12,
    answer: total,
    marks: wet(nums),
    state: [{ label: "water", value: total }],
    note: `${total}, in three passes. Linear — and it reads the map three times and keeps ${2 * n} numbers alive, when every column only ever uses the SMALLER of its two walls.`,
  }
}

function* twoEnds({ nums }: N): Generator<DFrame> {
  let i = 0
  let j = nums.length - 1
  let leftMax = 0
  let rightMax = 0
  let total = 0
  while (i < j) {
    const fromLeft = nums[i] < nums[j]
    if (fromLeft) {
      leftMax = Math.max(leftMax, nums[i])
      total += leftMax - nums[i]
    } else {
      rightMax = Math.max(rightMax, nums[j])
      total += rightMax - nums[j]
    }
    yield {
      line: fromLeft ? 7 : 11,
      marks: {
        ...(Object.fromEntries(
          nums.map((_, k) => [k, k < i || k > j ? "dim" : "focus"])
        ) as Record<number, ChipRole>),
        [fromLeft ? i : j]: "answer",
        [fromLeft ? j : i]: "anchor",
      },
      state: [
        { label: "left·right max", value: `${leftMax} · ${rightMax}` },
        { label: "water", value: total },
      ],
      note: `${nums[i]} on the left against ${nums[j]} on the right: the ${fromLeft ? "left" : "right"} bar is ${fromLeft ? "shorter" : "no shorter"}, so the ${fromLeft ? "left" : "right"} side is the limiting one and its own maximum, ${fromLeft ? leftMax : rightMax}, is all this column needs to know. It holds ${fromLeft ? leftMax - nums[i] : rightMax - nums[j]}. Move that pointer inward.`,
    }
    if (fromLeft) i += 1
    else j -= 1
  }
  yield {
    line: 13,
    answer: total,
    marks: wet(nums),
    state: [{ label: "water", value: total }],
    note: `${total}, in one pass and four numbers. The trick is not the two pointers — it is that the SHORTER wall decides, and the pointer standing on the shorter wall already knows its own side's maximum for certain, whatever is hiding on the other side.`,
  }
}

export const trapRainWater = deriveJourney(problem, {
  slug: "water-between-bars",
  subtitle: "one column at a time, and which wall actually decides",
  reveals: ["two-pointers"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer map" },
  presets: {
    example: {
      label: "the example",
      nums: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
    },
    rising: {
      label: "it only goes up",
      nums: [1, 2, 3, 4],
      info: "nothing is trapped, at any size",
    },
    tiny: { label: "two bars", nums: [5, 2], info: "no column has two walls" },
    tallend: {
      label: "the tallest bar is at the end",
      nums: [2, 0, 1, 0, 9],
      info: "one side's maximum never changes",
    },
    dip: { label: "a single dip", nums: [4, 2, 3], info: "min(4, 3) − 2 = 1" },
    long: {
      label: "a longer map",
      nums: [4, 2, 0, 3, 2, 5, 1, 0, 2, 4, 1, 3, 0, 2],
    },
  },
  edges: [
    {
      key: "tiny",
      name: "fewer than three bars",
      example: "[5, 2] → 0",
      why: "Water needs a taller bar on BOTH sides. With two bars neither has that, so the answer is 0 — and a loop that walks inward from two ends must simply not run.",
      think: "How many bars does it take before any water is possible at all?",
      preset: "tiny",
      constraint: 2,
    },
    {
      key: "monotonic",
      name: "the map only rises, or only falls",
      example: "[1, 2, 3, 4] → 0",
      why: "Every column has nothing taller on one side, so the shorter wall is the column itself. Length is irrelevant: a million rising bars still trap nothing.",
      think: "Is your answer driven by how big the map is, or by its shape?",
      preset: "rising",
      constraint: 3,
    },
    {
      key: "tallend",
      name: "the tallest bar sits at one end",
      example: "[2, 0, 1, 0, 9] → 3",
      why: "One side's maximum is then the same for every column, and the other side does all the deciding. It is the clearest case of only ever needing the smaller of the two walls.",
      think: "Do you need both maxima exactly, or only the smaller one?",
      preset: "tallend",
      constraint: 0,
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
        "given: bar heights, each one unit wide",
        "water rests on a column only if taller bars stand on BOTH sides",
        "it rises to the SHORTER of those two walls",
        "task: return the total units of water held",
      ],
      tools: [
        {
          name: "Array of heights",
          role: "a row addressed by position, read as a skyline. What matters about a position is not its own height but the tallest thing on either side of it.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "ask what one column holds, not where the pools are — the pools are an illusion of the picture",
        "a column holds min(tallest left, tallest right) minus its own height, never less than zero",
        "the two ends hold nothing, because neither has walls on both sides",
      ],
      quiz: [
        {
          q: "A column of height 2 has a tallest-left of 7 and a tallest-right of 4. How much water sits on it?",
          choices: ["5", "2", "9"],
          answer: 1,
          explain:
            "Water rises only to the shorter wall, 4, and the column already occupies 2 of that. 4 − 2 = 2 — the 7 is irrelevant.",
        },
      ],
      run: story,
    },
    {
      key: "percolumn",
      name: "Measure every column",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "For each column, scan left for the tallest bar and right for the tallest bar, take the smaller, subtract the column's own height, and add it up.",
      takeaways: [
        "the reframing is the whole insight, and this rung has it already",
        "each column rescans the entire map, so the same prefix is walked n times",
        "n² — and the arithmetic per column was never the problem",
      ],
      run: perColumn,
    },
    {
      key: "prefix",
      name: "Tallest so far, from each side",
      short: "linear, three passes",
      from: 1,
      insight:
        "Each column recomputes maxima its neighbour already found. The tallest bar at or before a position is just the tallest before it compared against this one — one comparison instead of a scan.",
      idea: "Sweep left to right recording the tallest bar seen so far at every position, then right to left doing the same. A third pass reads both off and sums the differences.",
      takeaways: [
        "a running maximum turns a scan per column into one comparison per column",
        "linear, at the cost of two arrays the length of the map",
        "and every column only ever uses the SMALLER of the two numbers it stored",
      ],
      quiz: [
        {
          q: "Both maxima are stored for every position. How many of them does each column actually use?",
          choices: ["both", "one — the smaller"],
          answer: 1,
          explain:
            "The taller wall never enters the arithmetic. Half of everything stored here is read and discarded, which is the opening the next rung walks through.",
        },
      ],
      run: prefixMax,
    },
    {
      key: "ends",
      name: "Walk in from both ends",
      short: "one pass, four numbers",
      insight:
        "Only the shorter of the two walls matters — so you never need both maxima exactly, only to know which side is smaller. Standing on the shorter of two bars tells you that immediately, whatever is hiding beyond the other one.",
      idea: problem.whyNow!,
      takeaways: [
        "if the left bar is shorter than the right, the left side is the limit, whatever lies beyond the right pointer",
        "so the running maximum on the shorter side is already final for that column",
        "move the shorter pointer inward: it is the one whose column has just been settled",
        "one pass, constant space, and no array of maxima at all",
      ],
      quiz: [
        {
          q: "The left bar is shorter than the right. Why is the left-side maximum enough to settle this column?",
          choices: [
            "because the right side has been scanned already",
            "because some bar at least as tall as the right pointer exists to the right, so the right wall can only be taller — the left is the limit either way",
          ],
          answer: 1,
          explain:
            "You never learn the exact right maximum, and you do not need to. Knowing it is at least as tall as the shorter side is enough to know which side caps the water.",
        },
      ],
      run: twoEnds,
    },
  ],
})
