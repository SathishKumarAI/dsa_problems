// Squares of a Sorted Array, derived. Two rungs, and the whole argument is
// about a promise: the input arrives sorted, squaring breaks that ordering,
// and the question is whether you throw the promise away and buy a new one or
// notice what shape it turned into.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/sorted-squares/index.ts"

type N = Data<number>

export const squaresSorted = (nums: number[]) =>
  nums.map((v) => v * v).sort((a, b) => a - b)

// Everything between the two pointers is still unread; everything outside has
// already been placed. Drawing that is the point — the row is consumed from
// both ends inwards, which is not a shape a single index can have.
const between = (n: number, i: number, j: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let k = 0; k < n; k++) if (k < i || k > j) marks[k] = "dim"
  return marks
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A row that is already in order, smallest to largest. Square every value, and hand back the squares in order too.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "If every value were non-negative there would be nothing to do: squaring preserves the order and the answer is the input, squared, in place. The negatives are the problem — squaring makes the most negative value the LARGEST, so the ordering folds.",
  }
  const out = squaresSorted(nums)
  const mirrored = nums.some((v, i) => nums.some((w, j) => j > i && v === -w))
  yield {
    hold: 3,
    marks: {
      0: "anchor",
      [nums.length - 1]: "anchor",
    },
    state: [{ label: "answer", value: out.join(", ") }],
    answer: out,
    corner:
      nums.length === 1
        ? "single"
        : nums.every((v) => v < 0)
          ? "allneg"
          : mirrored
            ? "mirrored"
            : undefined,
    note:
      nums.length === 1
        ? `One value, so one square: ${out[0]}. Both ends of the row are the same position here, which any approach that walks inward from two ends has to survive.`
        : nums.every((v) => v < 0)
          ? `Every value is negative, so the order reverses completely: ${nums.join(", ")} squares to ${out.join(", ")}. The largest square came from the FRONT of the row.`
          : mirrored
            ? `Two values here have the same magnitude and opposite signs, so they square to the same number and the answer holds it twice: ${out.join(", ")}. Whichever end you take first, the answer is the same — but only if the comparison lets a tie be resolved either way.`
            : `${nums.join(", ")} squares to ${out.join(", ")}. The largest square is at one end of the row, the smallest somewhere in the middle — that shape is what is left of the ordering after squaring.`,
  }
}

function* squareSort({ nums }: N): Generator<DFrame> {
  const squares = nums.map((v) => v * v)
  yield {
    line: 1,
    row: squares,
    hold: 2,
    state: [{ label: "squared", value: squares.join(", ") }],
    note: `Every value squared: ${squares.join(", ")}. And look what happened to the ordering that the input handed over for free — ${squares.every((v, i) => i === 0 || squares[i - 1] <= v) ? "it happens to have survived here, because nothing was negative" : "it is gone"}.`,
  }
  const out = [...squares].sort((a, b) => a - b)
  yield {
    line: 1,
    row: out,
    answer: out,
    state: [{ label: "answer", value: out.join(", ") }],
    note: `Sorted: ${out.join(", ")}. Correct, in one short line — and it paid n log n to rebuild an ordering the input had already given it, in a different form, for nothing.`,
  }
}

function* twoPointers({ nums }: N): Generator<DFrame> {
  const n = nums.length
  const out = new Array<number>(n).fill(0)
  let i = 0
  let j = n - 1
  for (let at = n - 1; at >= 0; at--) {
    const left = nums[i] * nums[i]
    const right = nums[j] * nums[j]
    const takeLeft = left > right
    out[at] = takeLeft ? left : right
    yield {
      line: takeLeft ? 7 : 10,
      marks: {
        ...between(n, i, j),
        [takeLeft ? i : j]: "answer",
        [takeLeft ? j : i]: "focus",
      },
      state: [
        { label: "slot", value: at },
        { label: "wrote", value: out[at] },
      ],
      note: `Ends of what is left: ${nums[i]} squares to ${left}, ${nums[j]} squares to ${right}. ${takeLeft ? `The left end is bigger` : left === right ? `They tie, and the tie is broken to the right — either choice writes the same number` : `The right end is bigger`}, so ${out[at]} goes into slot ${at}, the last one still empty. ${takeLeft ? "The left pointer moves in." : "The right pointer moves in."}`,
    }
    if (takeLeft) i += 1
    else j -= 1
  }
  yield {
    line: 12,
    row: out,
    answer: out,
    state: [{ label: "answer", value: out.join(", ") }],
    note: `${out.join(", ")}. One pass, filled from the back, and nothing was ever compared except the two ends — because after squaring, the largest value left can only ever be at one end or the other.`,
  }
}

const nonDecreasing = (nums: number[]) =>
  nums.every((v, i) => i === 0 || nums[i - 1] <= v)

export const sortedSquares = deriveJourney(problem, {
  slug: "squares-in-order",
  subtitle: "the ordering is still there, folded around zero",
  reveals: ["two-pointers"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  // Every claim the second rung makes rests on the input being ordered;
  // animating it on a shuffled row would teach a rule that is not true.
  classify: (d) =>
    nonDecreasing(d.nums as number[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "the row must arrive in non-decreasing order — that is the promise the whole problem is about",
        },
  presets: {
    example: { label: "the example", nums: [-4, -1, 0, 3, 10] },
    allneg: {
      label: "every value negative",
      nums: [-3, -2, -1],
      info: "the order reverses completely",
    },
    allpos: {
      label: "no negatives at all",
      nums: [1, 2, 3],
      info: "squaring keeps the order — there is nothing to fix",
    },
    single: { label: "one value", nums: [5], info: "both ends are one place" },
    mirrored: {
      label: "equal magnitudes",
      nums: [-3, -1, 1, 3],
      info: "two values square to the same number",
    },
    long: {
      label: "a longer row",
      nums: [-9, -7, -7, -2, 0, 1, 4, 4, 6, 11],
    },
  },
  edges: [
    {
      key: "single",
      name: "one value",
      example: "[5] → [25]",
      why: "Two pointers walking inward start on the same position here, so the very first comparison compares a value with itself. It has to place that value exactly once, not twice or zero times.",
      think: "What happens on your first step when both ends are the same element?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "allneg",
      name: "every value is negative",
      example: "[-3, -2, -1] → [1, 4, 9]",
      why: "The order reverses completely: the largest square comes from the FIRST position. Anything that assumes the biggest square is near the end is wrong on every element here.",
      think: "Where does the largest square live, and is that ever a fixed place?",
      preset: "allneg",
      constraint: 2,
    },
    {
      key: "mirrored",
      name: "equal magnitudes, opposite signs",
      example: "[-3, -1, 1, 3] → [1, 1, 9, 9]",
      why: "-3 and 3 square to the same number, so the two ends tie. The answer holds the value twice, which means the tie must be resolved by taking one end and moving only that pointer — never both, and never neither.",
      think: "When the two ends are equal, how many values do you place and how many pointers move?",
      preset: "mirrored",
      constraint: 3,
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
        "given: a row in non-decreasing order, negatives allowed",
        "square every value",
        "promise broken: squaring does not preserve that order",
        "task: return the squares, in non-decreasing order",
      ],
      tools: [
        {
          name: "Sorted array with negatives",
          role: "a row addressed by position whose values increase — but whose MAGNITUDES fall to a minimum somewhere in the middle and rise again to both ends. That second shape is the one squaring cares about.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "with no negatives there is nothing to do: squaring keeps the order",
        "the most negative value has the largest square, so the ordering folds around zero",
        "after squaring, the largest value is always at one end of the row or the other — never in the middle",
      ],
      quiz: [
        {
          q: "In a sorted row that contains negatives, where is the LARGEST square?",
          choices: [
            "at the end of the row",
            "at one of the two ends, and which one depends on the values",
            "wherever the largest value is",
          ],
          answer: 1,
          explain:
            "Magnitude is smallest in the middle and grows toward both ends, so the biggest square is at one end — the front if the negatives run deeper than the positives run high.",
        },
      ],
      run: story,
    },
    {
      key: "sort",
      name: "Square, then sort",
      short: "the honest one",
      from: "sort",
      insight: "",
      idea: "Replace every value with its square and hand the result to a sort. One line, obviously correct, and it never looks at the order the input arrived in.",
      takeaways: [
        "n log n, and it works on any row at all — sorted or not",
        "it throws away a guarantee the input made and then pays to rebuild it",
        "'obviously correct in one line' is worth something; it is just not worth n log n here",
      ],
      quiz: [
        {
          q: "What would change about this rung if the input arrived shuffled?",
          choices: ["it would break", "nothing at all"],
          answer: 1,
          explain:
            "Nothing — which is the complaint. A solution that behaves identically on a sorted and an unsorted row has, by definition, extracted nothing from the sortedness.",
        },
      ],
      run: squareSort,
    },
    {
      key: "twoends",
      name: "Read from both ends, write from the back",
      short: "one pass, no sort",
      insight:
        "The ordering was never destroyed, only folded: magnitudes now fall to the middle and rise to both ends. That means the largest remaining square is always at one of the two ends — so the answer can be built largest-first without searching for anything.",
      idea: problem.whyNow!,
      takeaways: [
        "two pointers, one at each end, walking inward — the shape of the data decides the shape of the walk",
        "fill the output from the BACK, because what you can identify cheaply is the largest, not the smallest",
        "each step places exactly one value and consumes exactly one input, so the walk is linear",
        "this is the two-pointer sweep, and it exists because the interesting values sit at both ends rather than one",
      ],
      quiz: [
        {
          q: "Why is the output filled from the back rather than the front?",
          choices: [
            "because the input is read backwards",
            "because the two ends make the LARGEST remaining square easy to find, and the largest belongs at the back",
          ],
          answer: 1,
          explain:
            "The smallest square is somewhere in the middle and would have to be searched for. The largest is always at an end, so building the answer largest-first is the direction the data makes cheap.",
        },
      ],
      run: twoPointers,
    },
  ],
})
