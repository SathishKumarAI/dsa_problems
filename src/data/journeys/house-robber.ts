// Non-Adjacent Maximum Take, derived. The ladder is the standard DP descent —
// cached recursion, then a table filled in order, then the two variables the
// table collapses to — and the story act's job is to kill the greedy idea
// before any of it starts.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/dp/house-robber.ts"

type N = Data<number>

// The best legal take, by exhaustion over every subset with no two adjacent.
// Exponential, and only ever called on a preset-sized row — it exists so the
// narration can quote a number nobody had to trust.
export function bestTake(nums: number[]) {
  const best = (i: number): number =>
    i < 0 ? 0 : Math.max(best(i - 1), nums[i] + best(i - 2))
  const chosen: number[] = []
  let i = nums.length - 1
  while (i >= 0) {
    if (nums[i] + best(i - 2) >= best(i - 1)) {
      chosen.unshift(i)
      i -= 2
    } else i -= 1
  }
  return { best: best(nums.length - 1), chosen }
}

// Take the largest value still available, forbid its neighbours, repeat. The
// obvious idea, and the story act's whole job is to show where it breaks.
function greedyTake(nums: number[]) {
  const blocked = new Set<number>()
  let total = 0
  for (;;) {
    let pick = -1
    for (let i = 0; i < nums.length; i++)
      if (!blocked.has(i) && (pick < 0 || nums[i] > nums[pick])) pick = i
    if (pick < 0) break
    total += nums[pick]
    blocked.add(pick).add(pick - 1).add(pick + 1)
  }
  return total
}

const took = (chosen: number[]) =>
  Object.fromEntries(chosen.map((i) => [i, "answer"])) as Record<
    number,
    ChipRole
  >

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A row of values, and one rule about which you may take: never two that sit side by side. Take as much as you can, and return the total.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Every value is non-negative, so there is no reason to skip anything except the rule itself. Skipping is never a gain — it is only ever the price of taking something better next door.",
  }
  const { best, chosen } = bestTake(nums)
  const greedy = greedyTake(nums)
  yield {
    hold: 3,
    marks: took(chosen),
    state: [{ label: "answer", value: best }],
    answer: best,
    corner:
      nums.length === 1
        ? "single"
        : greedy < best
          ? "greedy"
          : nums.every((v) => v === 0)
            ? "allzero"
            : undefined,
    note:
      nums.length === 1
        ? `One value and no neighbour to conflict with, so take it: ${best}. Note for later — a rule written in terms of "the element two back" has to survive there being no such element.`
        : greedy < best
          ? `The answer is ${best}, from positions ${chosen.join(" and ")}. Now try the obvious idea — repeatedly take the largest value still allowed — and it gets ${greedy}. Grabbing ${Math.max(...nums)} forbids BOTH of its neighbours, and the two of them together are worth more. Local choices cannot see that.`
          : nums.every((v) => v === 0)
            ? "Every value is 0, so every legal choice ties at 0. Nothing has to be taken and nothing is lost by taking — which is the clue that this is a maximisation with a floor, not a search for something."
            : `The answer is ${best}, from position${chosen.length === 1 ? "" : "s"} ${chosen.join(" and ")}.`,
  }
}

// The memo, flattened: one frame per subproblem, in the order the recursion
// actually reaches them — the point is that each is computed once and every
// later request is a lookup.
function* memo({ nums }: N): Generator<DFrame> {
  const cache = new Map<number, number>()
  const order: number[] = []
  const best = (i: number): number => {
    if (i < 0) return 0
    const hit = cache.get(i)
    if (hit !== undefined) return hit
    const v = Math.max(best(i - 1), nums[i] + best(i - 2))
    cache.set(i, v)
    order.push(i)
    return v
  }
  const answer = best(nums.length - 1)
  for (const i of order) {
    const take = nums[i] + (cache.get(i - 2) ?? 0)
    const skip = cache.get(i - 1) ?? 0
    yield {
      line: 7,
      marks: {
        [i]: "focus",
        ...(i - 2 >= 0 ? { [i - 2]: "anchor" as ChipRole } : {}),
      },
      state: [
        { label: `best(${i})`, value: cache.get(i)! },
        { label: "cached", value: order.indexOf(i) + 1 },
      ],
      note: `best(${i}) asks two questions and takes the better answer: skip position ${i} and keep ${skip}, or take ${nums[i]} on top of best(${i - 2}) = ${cache.get(i - 2) ?? 0}, which is ${take}. ${take >= skip ? "Taking wins" : "Skipping wins"} — best(${i}) = ${cache.get(i)}, written down and never computed again.`,
    }
  }
  yield {
    line: 9,
    answer,
    state: [{ label: "answer", value: answer }],
    note: `${answer}. Each of the ${order.length} subproblems was solved exactly once — but they were solved from the top down, so every one of them was sitting on the stack waiting while the ones below it finished.`,
  }
}

function* table({ nums }: N): Generator<DFrame> {
  const dp = new Array<number>(nums.length + 2).fill(0)
  for (let i = 0; i < nums.length; i++) {
    dp[i + 2] = Math.max(dp[i + 1], nums[i] + dp[i])
    const taking = nums[i] + dp[i] > dp[i + 1]
    yield {
      line: 5,
      marks: {
        [i]: taking ? "answer" : "dim",
        ...(i - 2 >= 0 ? { [i - 2]: "anchor" as ChipRole } : {}),
      },
      state: [
        { label: "skip it", value: dp[i + 1] },
        { label: "take it", value: nums[i] + dp[i] },
      ],
      note: `Position ${i} holds ${nums[i]}. Skipping leaves ${dp[i + 1]}; taking adds it to ${dp[i]}, everything up to two back, for ${nums[i] + dp[i]}. ${taking ? "Take" : "Skip"} — entry ${i} is ${dp[i + 2]}. The two entries it needed were already there, because they were filled first.`,
    }
  }
  const answer = dp[dp.length - 1]
  yield {
    line: 6,
    answer,
    state: [{ label: "answer", value: answer }],
    note: `${answer}. No stack, and the order of computation is now visible on the page — but look at which entries each step actually read: the one before, and the one before that. Never anything older.`,
  }
}

function* rolling({ nums }: N): Generator<DFrame> {
  let skip = 0
  let take = 0
  for (let i = 0; i < nums.length; i++) {
    const nextSkip = Math.max(skip, take)
    const nextTake = skip + nums[i]
    yield {
      line: 3,
      marks: {
        [i]: nextTake > nextSkip ? "answer" : "focus",
        ...(i - 2 >= 0 ? { [i - 2]: "anchor" as ChipRole } : {}),
      },
      state: [
        { label: "skip", value: nextSkip },
        { label: "take", value: nextTake },
      ],
      note: `Position ${i}: "best without ${i}" becomes the better of the two numbers carried in, ${nextSkip}. "Best with ${i}" is ${nums[i]} plus whatever was best WITHOUT position ${i - 1}, which is ${skip} — ${nextTake}. Two numbers in, two numbers out.`,
    }
    skip = nextSkip
    take = nextTake
  }
  const answer = Math.max(skip, take)
  yield {
    line: 4,
    answer,
    state: [{ label: "answer", value: answer }],
    note: `${answer}, in one pass and two variables. The array was a record of decisions nobody looked back at: every entry was read by the next two steps and then never again.`,
  }
}

export const houseRobber = deriveJourney(problem, {
  slug: "non-adjacent-take",
  subtitle: "why the biggest value is the wrong thing to grab first",
  reveals: ["dp"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  presets: {
    example: { label: "the example", nums: [2, 7, 9, 3, 1] },
    greedy: {
      label: "the biggest one is a trap",
      nums: [4, 5, 4],
      info: "taking the largest value first loses",
    },
    single: {
      label: "one value",
      nums: [5],
      info: "no neighbour to conflict with",
    },
    pair: {
      label: "two values",
      nums: [2, 1],
      info: "you may have exactly one of them",
    },
    allzero: {
      label: "everything is zero",
      nums: [0, 0, 0, 0],
      info: "every legal choice ties",
    },
    long: {
      label: "a longer row",
      nums: [6, 1, 2, 7, 9, 3, 1, 8, 4, 2, 11, 5, 3],
    },
  },
  edges: [
    {
      key: "single",
      name: "one value",
      example: "[5] → 5",
      why: "Every rule here is written in terms of the element two positions back, and on a one-element row that element does not exist. The recurrence has to treat 'off the front' as 0, not as an error.",
      think: "What does your rule return for a position that is off the start of the row?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "greedy",
      name: "the largest value is a trap",
      example: "[4, 5, 4] → 8, not 5",
      why: "Taking 5 forbids both of its neighbours, and those two together are worth 8. Any rule that decides one position at a time by looking only at that position is wrong here.",
      think: "When you take a value, what does it cost you — and can you see that cost from where you are standing?",
      preset: "greedy",
      constraint: 2,
    },
    {
      key: "allzero",
      name: "every value is zero",
      example: "[0, 0, 0, 0] → 0",
      why: "Values are non-negative, so skipping never gains anything and the answer has a floor of 0. A solution written as if something must be taken, or one that tracks a best starting below zero, has assumed a rule the problem does not have.",
      think: "Is 'take nothing' a legal answer, and does your starting value say so?",
      preset: "allzero",
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
        "given: a row of non-negative values",
        "choose any set of positions, no two adjacent",
        "value(choice) = the sum of what you chose",
        "task: return the largest value(choice)",
      ],
      tools: [
        {
          name: "Array of values",
          role: "a row addressed by position. Adjacency is the only constraint, and it is defined by position alone — the values have no say in which choices are legal.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is the total, not the set of positions that produced it",
        "values are non-negative, so skipping is never a gain in itself",
        "taking a value costs you both of its neighbours — that cost is invisible from the value alone",
      ],
      quiz: [
        {
          q: "The row is [4, 5, 4]. Taking the biggest value first gives what?",
          choices: ["8, the right answer", "5, and it is wrong"],
          answer: 1,
          explain:
            "Taking 5 forbids both 4s. The right answer takes the two ends for 8 — the greedy choice is beaten by what it forbade.",
        },
      ],
      run: story,
    },
    {
      key: "memo",
      name: "Ask, and write the answer down",
      short: "each subproblem once",
      from: 0,
      insight: "",
      idea: "Define one question — what is the best total using only the first i+1 positions? — and answer it by asking two smaller versions of itself: skip position i, or take it and jump two back. Cache each answer so no question is ever asked twice.",
      takeaways: [
        "the two branches are exhaustive and never overlap: position i is either in the choice or it is not",
        "'take it' must jump two back, because taking i forbids i−1",
        "without the cache the same subproblems are recomputed exponentially often",
        "with it, each is computed once — and each still waits on the stack while its children finish",
      ],
      quiz: [
        {
          q: "Why does the 'take it' branch add best(i − 2) rather than best(i − 1)?",
          choices: [
            "to skip a value that is probably smaller",
            "because taking position i makes position i − 1 illegal, so its best is unusable",
          ],
          answer: 1,
          explain:
            "best(i − 1) is allowed to include position i − 1, which would sit next to the one just taken. Only best(i − 2) is guaranteed compatible.",
        },
      ],
      run: memo,
    },
    {
      key: "table",
      name: "Fill it in order",
      short: "no stack, visible order",
      from: 1,
      insight:
        "The cache already computes every subproblem exactly once — the recursion around it only decides what order they happen in, and pays a stack frame per level for the privilege. Fill them front to back instead and the answers each step needs are already there.",
      idea: "Build an array where entry i is the best total using the first i positions, filling it left to right. Each entry is the better of its predecessor and the current value plus the entry two back. The last entry is the answer.",
      takeaways: [
        "bottom-up removes the stack: nothing is waiting on anything",
        "the two leading zero entries are how 'off the front of the row' becomes a real number",
        "the array can be read afterwards to recover WHICH positions were taken — the compressed version cannot",
        "and every entry is read by exactly the next two steps, then never again",
      ],
      run: table,
    },
    {
      key: "rolling",
      name: "Two numbers",
      short: "one pass, constant space",
      insight:
        "The table holds n entries for a rule that only ever looks two positions back. Everything older is dead the moment the walk passes it, and storage for dead values is just storage.",
      idea: problem.whyNow!,
      takeaways: [
        "carry 'best without the previous position' and 'best with it', and nothing else",
        "the two assignments must happen together — computing one from the other's new value is the classic bug",
        "constant space, and the cost is that you can no longer say which positions were taken",
        "this is dynamic programming with the table rolled up: same recurrence, same order, less memory",
      ],
      quiz: [
        {
          q: "What is lost by replacing the array with two variables?",
          choices: [
            "nothing at all",
            "the ability to recover which positions the answer used",
          ],
          answer: 1,
          explain:
            "The total survives; the record does not. If a problem asks for the choice and not just its value, the table is the version to keep.",
        },
      ],
      run: rolling,
    },
  ],
})
