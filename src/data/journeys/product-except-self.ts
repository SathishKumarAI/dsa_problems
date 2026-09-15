// Product of Everything Else, derived. The interesting thing about this
// problem is what it forbids: no division. That single ban is what turns a
// one-line answer into a lesson about prefix products — and it is also why
// zeros stop being a special case.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/product-except-self/index.ts"

type N = Data<number>

export function productsExceptSelf(nums: number[]) {
  return nums.map((_, i) =>
    nums.reduce((acc, v, j) => (j === i ? acc : acc * v), 1)
  )
}

const sides = (n: number, i: number) => {
  const marks: Record<number, ChipRole> = {}
  for (let k = 0; k < n; k++) if (k !== i) marks[k] = "dim"
  marks[i] = "focus"
  return marks
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Every position gets its own answer: the product of every OTHER value in the row. One row in, one row of the same length out.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "There is an obvious one-liner — multiply everything, then divide by each value — and the problem forbids it. That ban is not an arbitrary handicap: divide by a zero and the whole approach collapses, so the forbidden method was never safe to begin with.",
  }
  const out = productsExceptSelf(nums)
  const zeros = nums.filter((v) => v === 0).length
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((_, i) => [i, out[i] === 0 ? "dim" : "focus"])
    ) as Record<number, ChipRole>,
    state: [{ label: "answers", value: out.join(", ") }],
    answer: out,
    corner:
      zeros >= 2
        ? "twozeros"
        : zeros === 1
          ? "onezero"
          : nums.some((v) => v < 0)
            ? "negatives"
            : undefined,
    note:
      zeros >= 2
        ? `Two values are 0, so every answer is 0 — each position still has a zero somewhere among the others. Total product divided by anything cannot express this: the total is 0 and 0 ÷ 0 is nothing at all.`
        : zeros === 1
          ? `Exactly one 0, and look at the shape of the answer: every position is 0 except the zero's own, which is ${out[nums.indexOf(0)]}. The total product is 0, so dividing gives 0 everywhere — including the one place where it is wrong.`
          : nums.some((v) => v < 0)
            ? `The answers are ${out.join(", ")}. The signs flip around: a position's answer is negative exactly when an odd number of the OTHER values are.`
            : `The answers are ${out.join(", ")} — each one the product of everything except the value beneath it.`,
  }
}

function* brute({ nums }: N): Generator<DFrame> {
  const out: number[] = []
  for (let i = 0; i < nums.length; i++) {
    let product = 1
    for (let j = 0; j < nums.length; j++) if (j !== i) product *= nums[j]
    out.push(product)
    yield {
      line: 5,
      marks: sides(nums.length, i),
      state: [
        { label: "position", value: i },
        { label: "product", value: product },
      ],
      note: `Position ${i} holds ${nums[i]}. Multiply the other ${nums.length - 1} value${nums.length === 2 ? "" : "s"} together: ${product}. Then start again from scratch for the next position.`,
    }
  }
  yield {
    line: 6,
    answer: out,
    state: [{ label: "answers", value: out.join(", ") }],
    note: `${out.join(", ")}. Right, and n² multiplications — the run of values to the left of position 4 was multiplied out afresh for positions 4, 5, 6 and every other one after it.`,
  }
}

function* prefixArrays({ nums }: N): Generator<DFrame> {
  const n = nums.length
  const left = new Array<number>(n).fill(1)
  const right = new Array<number>(n).fill(1)
  for (let i = 1; i < n; i++) {
    left[i] = left[i - 1] * nums[i - 1]
    yield {
      line: 5,
      marks: {
        ...(Object.fromEntries(
          Array.from({ length: i }, (_, k) => [k, "anchor"])
        ) as Record<number, ChipRole>),
        [i]: "focus",
      },
      state: [{ label: `left[${i}]`, value: left[i] }],
      note: `Everything strictly before position ${i} multiplies to ${left[i]} — which is the answer for position ${i - 1}'s left side times ${nums[i - 1]}, so it costs one multiplication, not ${i}.`,
    }
  }
  for (let i = n - 2; i >= 0; i--) {
    right[i] = right[i + 1] * nums[i + 1]
    yield {
      line: 7,
      marks: {
        ...(Object.fromEntries(
          Array.from({ length: n - 1 - i }, (_, k) => [i + 1 + k, "anchor"])
        ) as Record<number, ChipRole>),
        [i]: "focus",
      },
      state: [{ label: `right[${i}]`, value: right[i] }],
      note: `And everything strictly after position ${i} multiplies to ${right[i]}, built the same way from the far end inwards.`,
    }
  }
  const out = nums.map((_, i) => left[i] * right[i])
  yield {
    line: 8,
    answer: out,
    state: [{ label: "answers", value: out.join(", ") }],
    note: `Each answer is its left product times its right product: ${out.join(", ")}. Two passes instead of n, and the price is two whole arrays — each of which is read exactly once, at the very end.`,
  }
}

function* twoSweeps({ nums }: N): Generator<DFrame> {
  const n = nums.length
  const out = new Array<number>(n).fill(1)
  let running = 1
  for (let i = 0; i < n; i++) {
    out[i] = running
    running *= nums[i]
    yield {
      line: 5,
      row: [...out],
      marks: { [i]: "answer" },
      state: [{ label: "running", value: running }],
      note: `Write the running product into position ${i} BEFORE folding ${nums[i]} into it — that ordering is the whole trick, and it is what makes the value written exclude its own position. Output so far: ${out.slice(0, i + 1).join(", ")}.`,
    }
  }
  running = 1
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= running
    running *= nums[i]
    yield {
      line: 9,
      row: [...out],
      marks: { [i]: "answer" },
      state: [{ label: "running", value: running }],
      note: `Coming back the other way: position ${i} already held everything to its left, so multiplying in everything to its right finishes it at ${out[i]}.`,
    }
  }
  yield {
    line: 10,
    answer: out,
    row: [...out],
    state: [{ label: "answers", value: out.join(", ") }],
    note: `${out.join(", ")}. Two passes, one running number each, and no storage beyond the answer that had to be built anyway. Nothing was ever divided, which is why the zeros needed no special case at all.`,
  }
}

export const productExceptSelf = deriveJourney(problem, {
  slug: "product-of-the-others",
  subtitle: "what the ban on division is really teaching you",
  reveals: ["arrays-hashing", "prefix-sums"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  presets: {
    example: { label: "the example", nums: [1, 2, 3, 4] },
    onezero: {
      label: "exactly one zero",
      nums: [1, 2, 0, 4],
      info: "one answer survives, the rest collapse",
    },
    twozeros: {
      label: "two zeros",
      nums: [0, 3, 0, 5],
      info: "every answer is 0",
    },
    negatives: {
      label: "mixed signs",
      nums: [-2, 3, -4, 5],
      info: "the sign of each answer is its own question",
    },
    pair: {
      label: "two values",
      nums: [6, 7],
      info: "the smallest legal row — each answer is the other value",
    },
    long: {
      label: "a longer row",
      nums: [2, -3, 1, 5, -1, 4, 2, 3, -2],
    },
  },
  edges: [
    {
      key: "onezero",
      name: "exactly one zero",
      example: "[1, 2, 0, 4] → [0, 0, 8, 0]",
      why: "The total product is 0, so dividing it by each value gives 0 everywhere — including at the zero's own position, where the true answer is the product of all the others.",
      think: "If you multiplied everything together first, could you still recover the one answer that is not 0?",
      preset: "onezero",
      constraint: 3,
    },
    {
      key: "twozeros",
      name: "two zeros",
      example: "[0, 3, 0, 5] → [0, 0, 0, 0]",
      why: "Every position still has a zero among the others, so every answer is 0. A solution that special-cases 'exactly one zero' has to notice this second case exists.",
      think: "How many zeros does your reasoning assume there are?",
      preset: "twozeros",
      constraint: 3,
    },
    {
      key: "negatives",
      name: "mixed signs",
      example: "[-2, 3, -4, 5] → [-60, 40, -30, 24]",
      why: "Each answer's sign depends on how many of the OTHER values are negative, which differs from position to position. Tracking one overall sign is not enough.",
      think: "Is the sign of an answer a property of the row, or of the position?",
      preset: "negatives",
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
        "given: a row of integers, at least two",
        "for EVERY position: the product of all the others",
        "forbidden: division",
        "task: return one answer per position, in linear time",
      ],
      tools: [
        {
          name: "Array of integers",
          role: "a row addressed by position. Every position's answer is built from two disjoint stretches — everything before it and everything after it — and those stretches overlap heavily between neighbours.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer at a position is (everything to its left) × (everything to its right)",
        "those are two independent questions, and neither involves the position itself",
        "division is banned, and a zero in the row is why that ban is a kindness",
      ],
      quiz: [
        {
          q: "The row is [1, 2, 0, 4]. What does 'total product ÷ each value' give at position 2?",
          choices: [
            "8, the right answer",
            "0 ÷ 0, which is nothing at all",
          ],
          answer: 1,
          explain:
            "The total product is 0 because of that very zero. Dividing by it is undefined, and the true answer there — 1 × 2 × 4 = 8 — is exactly the one the shortcut cannot produce.",
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Multiply the others, each time",
      short: "the honest one",
      from: "brute",
      insight: "",
      idea: "For each position, walk the whole row multiplying together everything except that position. No division, no cleverness, n answers each costing n − 1 multiplications.",
      takeaways: [
        "n² multiplications, and no storage beyond the answer",
        "zeros and negatives need no special handling — nothing is ever divided",
        "the same runs of values are multiplied out again for every position that shares them",
      ],
      run: brute,
    },
    {
      key: "prefix",
      name: "Two rows of running products",
      short: "linear, and two arrays",
      from: "prefix",
      insight:
        "Every position wants the product of everything to its left — and its neighbour wants almost the same thing, one value different. Computing each from the one before it costs a single multiplication instead of a whole walk.",
      idea: "Build one array where entry i is the product of everything strictly before position i, and another where entry i is the product of everything strictly after. The answer at each position is the two multiplied together.",
      takeaways: [
        "a running product turns 'everything before me' into one multiplication per position",
        "left and right are independent, so they are two separate sweeps in opposite directions",
        "the position's own value is excluded by where each sweep starts — not by dividing it out",
        "and both arrays exist only to be read once, at the very end",
      ],
      quiz: [
        {
          q: "Why must the left array hold the product of everything STRICTLY before position i?",
          choices: [
            "so the two arrays are the same length",
            "because including position i would put its own value into its own answer",
          ],
          answer: 1,
          explain:
            "The whole problem is 'everything except me'. The exclusion is built into where each running product starts and stops, which is what replaces the forbidden division.",
        },
      ],
      run: prefixArrays,
    },
    {
      key: "sweeps",
      name: "Fold the second pass into the answer",
      short: "two passes, no extra rows",
      insight:
        "Both arrays are built, then read exactly once, then thrown away. An array whose every entry is consumed by a single later step is not a data structure — it is a variable that has been written down 100 000 times.",
      idea: problem.whyNow!,
      takeaways: [
        "the output array can carry the left products while it waits for the right ones",
        "write the running product BEFORE folding the current value in — that ordering IS the exclusion",
        "the second sweep multiplies rather than assigns, which is how the two halves meet",
        "no division anywhere, so zeros, one or many, are ordinary values",
      ],
      quiz: [
        {
          q: "In the first sweep, why is the running product written into position i before nums[i] is folded into it?",
          choices: [
            "to save a multiplication",
            "because once nums[i] is folded in, the running product is no longer 'everything except me'",
          ],
          answer: 1,
          explain:
            "Swapping those two lines is the classic bug: every answer then includes its own value, and the row comes back as the total product repeated.",
        },
      ],
      run: twoSweeps,
    },
  ],
})
