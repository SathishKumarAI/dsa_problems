// Smash the Two Heaviest Stones, derived. Two rungs asking the same question
// every round — what are the two largest? — and disagreeing about how much
// order you have to rebuild to answer it after only one thing changed.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/heaps/last-stone-weight.ts"

type N = Data<number>

export function lastStone(stones: number[]) {
  const pile = [...stones]
  while (pile.length > 1) {
    pile.sort((a, b) => a - b)
    const first = pile.pop()!
    const second = pile.pop()!
    if (first !== second) pile.push(first - second)
  }
  return pile.length ? pile[0] : 0
}

// How many rounds put a remainder back — the story act quotes it.
function remaindersPushed(stones: number[]) {
  const pile = [...stones]
  let pushed = 0
  while (pile.length > 1) {
    pile.sort((a, b) => a - b)
    const first = pile.pop()!
    const second = pile.pop()!
    if (first !== second) {
      pile.push(first - second)
      pushed += 1
    }
  }
  return pushed
}

// A max-heap, sifted properly: the third rung's claim is log n per round, and
// a sort wearing a heap's name would make the animation a lie about that.
function heapPush(heap: number[], x: number) {
  heap.push(x)
  let i = heap.length - 1
  while (i > 0) {
    const parent = (i - 1) >> 1
    if (heap[parent] >= heap[i]) break
    ;[heap[parent], heap[i]] = [heap[i], heap[parent]]
    i = parent
  }
}

function heapPop(heap: number[]) {
  const top = heap[0]
  const last = heap.pop()!
  if (heap.length) {
    heap[0] = last
    let i = 0
    for (;;) {
      const l = 2 * i + 1
      const r = l + 1
      let big = i
      if (l < heap.length && heap[l] > heap[big]) big = l
      if (r < heap.length && heap[r] > heap[big]) big = r
      if (big === i) break
      ;[heap[big], heap[i]] = [heap[i], heap[big]]
      i = big
    }
  }
  return top
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Take the two heaviest stones and smash them. Equal weights destroy each other; otherwise the heavier one survives, lighter by the weight of the other. Keep going until at most one stone is left.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Every round asks exactly the same question — which two are heaviest NOW? — of a pile that has changed by at most one stone. That gap, between how much changed and how much gets recomputed, is the whole problem.",
  }
  const answer = lastStone(nums)
  const pushed = remaindersPushed(nums)
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((v, i) => [i, v === Math.max(...nums) ? "answer" : "dim"])
    ) as Record<number, ChipRole>,
    state: [{ label: "last stone", value: answer }],
    answer,
    corner:
      nums.length === 1
        ? "single"
        : answer === 0
          ? "allgone"
          : pushed > 0
            ? "remainder"
            : undefined,
    note:
      nums.length === 1
        ? `One stone and nothing to smash it against, so it survives: ${answer}. A loop that runs while stones remain, rather than while TWO remain, smashes it against nothing.`
        : answer === 0
          ? "Everything cancels out and the pile ends empty. The answer is 0 — a stated answer, not a missing one, and code that reads the first remaining stone has nothing to read."
          : pushed > 0
            ? `The last stone weighs ${answer}. ${pushed} round${pushed === 1 ? "" : "s"} put a remainder back into the pile, and a remainder is a genuinely new weight — it can be heavier than stones that have not been touched yet, so it has to rejoin the ordering rather than sit at the end.`
            : `The last stone weighs ${answer}.`,
  }
}

function* resort({ nums }: N): Generator<DFrame> {
  const pile = [...nums]
  let rounds = 0
  while (pile.length > 1) {
    pile.sort((a, b) => a - b)
    rounds += 1
    const first = pile.pop()!
    const second = pile.pop()!
    const left = first - second
    if (left) pile.push(left)
    yield {
      line: 3,
      row: [...pile].sort((a, b) => a - b),
      marks: {},
      state: [
        { label: "smashed", value: `${first} · ${second}` },
        { label: "rounds", value: rounds },
      ],
      note: `Sorted the whole pile to find the two heaviest: ${first} and ${second}. ${left ? `${left} goes back in.` : "Equal — both are gone."} The pile is now ${[...pile].sort((a, b) => a - b).join(", ") || "empty"}, and the next round will sort all of it again.`,
    }
  }
  const answer = pile.length ? pile[0] : 0
  yield {
    line: 8,
    answer,
    state: [
      { label: "last stone", value: answer },
      { label: "rounds", value: rounds },
    ],
    note: `${answer}, after ${rounds} round${rounds === 1 ? "" : "s"}. Each of them rebuilt a total order to read two positions of it — and between rounds at most one stone had changed.`,
  }
}

function* heap({ nums }: N): Generator<DFrame> {
  const h: number[] = []
  for (const s of nums) heapPush(h, s)
  yield {
    line: 5,
    hold: 2,
    state: [{ label: "largest", value: h[0] }],
    note: `All ${nums.length} stone${nums.length === 1 ? "" : "s"} arranged so that the heaviest is on top — and only that much is arranged. The rest is in no particular order, which is exactly as much order as the question needs.`,
  }
  let rounds = 0
  while (h.length > 1) {
    rounds += 1
    const first = heapPop(h)
    const second = heapPop(h)
    const left = first - second
    if (left) heapPush(h, left)
    yield {
      line: left ? 10 : 9,
      state: [
        { label: "smashed", value: `${first} · ${second}` },
        { label: "largest left", value: h.length ? h[0] : 0 },
      ],
      note: `${first} and ${second} come off the top in that order — two log-n operations, no sorting. ${left ? `${left} drops back in and settles into place without disturbing anything else.` : "Equal, so nothing goes back."} ${h.length ? `The heaviest remaining is ${h[0]}.` : "The pile is empty."}`,
    }
  }
  const answer = h.length ? h[0] : 0
  yield {
    line: 11,
    answer,
    state: [
      { label: "last stone", value: answer },
      { label: "rounds", value: rounds },
    ],
    note: `${answer}. Each round cost two pops and at most one push instead of a full sort, because the structure only ever maintained the one fact being asked for: what is the largest.`,
  }
}

export const lastStoneWeight = deriveJourney(problem, {
  slug: "smash-the-heaviest",
  subtitle: "how much order do you rebuild when one thing changed",
  reveals: ["heaps"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a bigger pile" },
  classify: (d) =>
    (d.nums as number[]).every((v) => v > 0)
      ? { ok: true }
      : { ok: false, warning: "every stone must weigh at least 1" },
  presets: {
    example: { label: "the example", nums: [2, 7, 4, 1, 8, 1] },
    single: { label: "one stone", nums: [5], info: "nothing to smash it against" },
    allgone: {
      label: "everything cancels",
      nums: [3, 3, 5, 5],
      info: "the pile ends empty",
    },
    remainder: {
      label: "a remainder rejoins",
      nums: [10, 4, 2, 2],
      info: "the leftover is heavier than untouched stones",
    },
    long: {
      label: "a bigger pile",
      nums: [9, 3, 14, 7, 2, 11, 5, 8, 6, 1, 13],
    },
  },
  edges: [
    {
      key: "single",
      name: "one stone",
      example: "[5] → 5",
      why: "There is nothing to smash it against, so it survives untouched. A loop that continues while any stone remains, rather than while two remain, tries to pop a second one that is not there.",
      think: "What is your loop condition — stones remaining, or PAIRS remaining?",
      preset: "single",
      constraint: 0,
    },
    {
      key: "allgone",
      name: "the pile ends empty",
      example: "[3, 3, 5, 5] → 0",
      why: "Every stone is cancelled by another, so the answer is 0. Code that finishes by reading the first remaining stone has nothing to read.",
      think: "Where does your answer come from when nothing is left?",
      preset: "allgone",
      constraint: 3,
    },
    {
      key: "remainder",
      name: "a remainder rejoins the pile",
      example: "[10, 4, 2, 2] → 2",
      why: "10 and 4 leave 6, which is heavier than either stone still waiting. A remainder is a genuinely new weight and has to take its place in the ordering, not be appended at the end.",
      think: "When you put the leftover back, does it land where its weight says it should?",
      preset: "remainder",
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
        "given: a pile of stone weights",
        "each round: take the two heaviest",
        "equal → both destroyed; otherwise the difference goes back",
        "task: the weight of the last stone, or 0",
      ],
      tools: [
        {
          name: "Array of weights",
          role: "a bag, not a row — position means nothing here. What is asked of it, over and over, is only ever 'what is the largest?'",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the pile shrinks every round, so the process always ends",
        "a remainder is a new weight and can outrank stones that have not been touched",
        "an empty pile answers 0, and one stone answers itself",
        "every round asks the same question of a pile that changed by one",
      ],
      quiz: [
        {
          q: "After a smash, where does the remainder belong?",
          choices: [
            "at the end of the pile — it has already been used",
            "wherever its weight says, since it may be heavier than stones still waiting",
          ],
          answer: 1,
          explain:
            "It is just another stone. Treating it as spent, or appending it without regard to weight, silently changes which pair is picked next.",
        },
      ],
      run: story,
    },
    {
      key: "sort",
      name: "Re-sort every round",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Sort the pile, take the two largest off the end, put any remainder back, and sort again for the next round.",
      takeaways: [
        "correct, and the remainder lands in the right place because everything is re-sorted",
        "a full ordering is rebuilt to read two positions of it",
        "and between rounds at most one stone changed",
      ],
      quiz: [
        {
          q: "How much of the pile changes between two rounds?",
          choices: ["all of it", "two stones leave and at most one arrives"],
          answer: 1,
          explain:
            "Almost nothing changes, and almost everything is recomputed. That gap is what the next rung closes.",
        },
      ],
      run: resort,
    },
    {
      key: "heap",
      name: "Keep only the top in order",
      short: "log n a round",
      insight:
        "A total order is far more than the question needs — 'which two are heaviest' is two answers, not n. Maintain just enough structure that the largest is always known, and a changed pile costs a repair rather than a rebuild.",
      idea: problem.whyNow!,
      takeaways: [
        "the largest is always available, and taking it repairs the structure in log n",
        "the remainder drops back in and settles by weight without touching anything else",
        "each round is two removals and at most one insertion — never a sort",
        "this is the max-heap, and 'what is the largest, repeatedly' is the question it exists for",
      ],
      quiz: [
        {
          q: "What does this rung maintain that a sorted pile does not?",
          choices: [
            "more order, for faster lookups",
            "less order — only enough to know the largest, which is all that is ever asked",
          ],
          answer: 1,
          explain:
            "Everything below the top is deliberately unordered. Maintaining less is exactly what makes each round cheap.",
        },
      ],
      run: heap,
    },
  ],
})
