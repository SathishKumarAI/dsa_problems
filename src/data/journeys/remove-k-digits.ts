// Smallest Number After Removing k Digits, derived. Two rungs. The greedy
// rule is the whole lesson and it is one sentence long — a digit followed by a
// smaller one is always worth deleting, because position beats value.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/stack/remove-k-digits.ts"

type S = Data<string> & { k: number }

export function smallestAfterRemoving(digits: string[], k: number) {
  const kept: string[] = []
  let budget = k
  for (const ch of digits) {
    while (budget > 0 && kept.length && kept[kept.length - 1] > ch) {
      kept.pop()
      budget -= 1
    }
    kept.push(ch)
  }
  while (budget > 0 && kept.length) {
    kept.pop()
    budget -= 1
  }
  const out = kept.join("").replace(/^0+/, "")
  return out || "0"
}

const keptMarks = (n: number, alive: boolean[], at: number) =>
  Object.fromEntries(
    Array.from({ length: n }, (_, i) => [
      i,
      i === at ? "focus" : alive[i] ? "answer" : "dim",
    ])
  ) as Record<number, ChipRole>

function* story({ nums, k }: S): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: `Delete exactly ${k} digit${k === 1 ? "" : "s"} and leave the smallest number you can. The digits that remain keep their order — you are choosing what to remove, not rearranging anything.`,
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Position beats value here, and that decides everything. A smaller digit further left is worth more than any improvement further right, because it lowers a more significant place — so the leftmost place you can improve is the one to fix first.",
  }
  const out = smallestAfterRemoving(nums, k)
  const leadingZero = (() => {
    const kept: string[] = []
    let budget = k
    for (const ch of nums) {
      while (budget > 0 && kept.length && kept[kept.length - 1] > ch) {
        kept.pop()
        budget -= 1
      }
      kept.push(ch)
    }
    while (budget > 0 && kept.length) {
      kept.pop()
      budget -= 1
    }
    return kept[0] === "0"
  })()
  const ascending = nums.every((c, i) => i === 0 || nums[i - 1] <= c)
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((_, i) => [i, "dim"])
    ) as Record<number, ChipRole>,
    state: [
      { label: "removing", value: k },
      { label: "answer", value: out },
    ],
    answer: out,
    corner:
      k >= nums.length
        ? "everything"
        : leadingZero
          ? "leadingzero"
          : ascending
            ? "ascending"
            : undefined,
    note:
      k >= nums.length
        ? `Every digit goes, and what is left is nothing at all — which must be reported as "0", not as an empty string. A number with no digits is not a number.`
        : leadingZero
          ? `"${nums.join("")}" with ${k} removed becomes "${out}". Removing a digit here exposes a zero at the front, and leading zeroes are stripped — which makes the answer SHORTER than the digits that survived, an outcome nothing about the removal rule predicts.`
          : ascending
            ? `These digits never decrease, so no digit is ever followed by a smaller one and there is nothing worth deleting from the middle at all. The removals have to come off the END: "${out}".`
            : `"${nums.join("")}" with ${k} removed becomes "${out}".`,
  }
}

function* pickSmallest({ nums, k }: S): Generator<DFrame> {
  const keep = nums.length - k
  const picked: string[] = []
  let start = 0
  for (let slot = 0; slot < keep; slot++) {
    const limit = nums.length - (keep - slot)
    let best = start
    for (let j = start; j <= limit; j++) if (nums[j] < nums[best]) best = j
    picked.push(nums[best])
    yield {
      line: 9,
      marks: {
        ...Object.fromEntries(
          nums.map((_, i) => [i, i >= start && i <= limit ? "focus" : "dim"])
        ) as Record<number, ChipRole>,
        [best]: "answer",
      },
      state: [
        { label: "window", value: `${start}…${limit}` },
        { label: "picked", value: picked.join("") },
      ],
      note: `Slot ${slot}: the digit here may come from anywhere in ${start}…${limit} — no later, or there will not be enough digits left to fill the rest. The smallest available is '${nums[best]}' at ${best}. Take it and resume just after.`,
    }
    start = best + 1
  }
  const out = picked.join("").replace(/^0+/, "") || "0"
  yield {
    line: 13,
    answer: out,
    state: [{ label: "answer", value: out }],
    note: `"${out}". Correct, and it makes the priority explicit — fill the most significant slot first, from the widest window it can legally use. The cost is that every slot rescans a window its predecessor already walked.`,
  }
}

function* monotonic({ nums, k }: S): Generator<DFrame> {
  const kept: string[] = []
  const alive = nums.map(() => false)
  const index: number[] = []
  let budget = k
  for (let i = 0; i < nums.length; i++) {
    const ch = nums[i]
    let removed = 0
    while (budget > 0 && kept.length && kept[kept.length - 1] > ch) {
      kept.pop()
      alive[index.pop()!] = false
      budget -= 1
      removed += 1
    }
    kept.push(ch)
    index.push(i)
    alive[i] = true
    yield {
      line: removed ? 4 : 7,
      marks: keptMarks(nums.length, alive, i),
      state: [
        { label: "kept", value: kept.join("") },
        { label: "budget", value: budget },
      ],
      note: removed
        ? `'${ch}' arrives and ${removed} kept digit${removed === 1 ? " is" : "s are"} larger than it. Each of those sits further LEFT, so deleting it lowers a more significant place than anything '${ch}' could do later — delete, ${budget} of the budget left. Kept: "${kept.join("")}".`
        : `'${ch}' is no smaller than the last digit kept, so nothing before it is worth deleting for its sake. Keep it: "${kept.join("")}".`,
    }
  }
  while (budget > 0 && kept.length) {
    kept.pop()
    alive[index.pop()!] = false
    budget -= 1
    yield {
      line: 10,
      marks: keptMarks(nums.length, alive, -1),
      state: [
        { label: "kept", value: kept.join("") },
        { label: "budget", value: budget },
      ],
      note: `Budget left over, and what remains never decreases — so no deletion inside it can help. Drop from the END, where the least significant digit is. Kept: "${kept.join("")}".`,
    }
  }
  const raw = kept.join("")
  const out = raw.replace(/^0+/, "") || "0"
  yield {
    line: 12,
    answer: out,
    state: [
      { label: "kept", value: raw || "nothing" },
      { label: "answer", value: out },
    ],
    note: `"${raw || "nothing"}" with leading zeroes stripped is "${out}". One pass: every digit is added once and removed at most once, and what survives never decreases — which is exactly the shape of the smallest number those digits can spell in order.`,
  }
}

export const removeKDigits = deriveJourney<string>(problem, {
  slug: "smallest-after-removals",
  subtitle: "a digit followed by a smaller one is always worth deleting",
  reveals: ["stack"],
  cells: "characters",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer number" },
  params: [{ key: "k", label: "digits to remove" }],
  classify: (d) => {
    const nums = d.nums as string[]
    const k = d.k as number
    if (!nums.every((c) => /^[0-9]$/.test(c)))
      return { ok: false, warning: "every cell must be a single digit" }
    return Number.isInteger(k) && k >= 0 && k <= nums.length
      ? { ok: true }
      : { ok: false, warning: `remove between 0 and ${nums.length} digits` }
  },
  presets: {
    example: { label: "the example", nums: [..."1432219"], extra: { k: 3 } },
    leadingzero: {
      label: "a zero is exposed",
      nums: [..."10200"],
      extra: { k: 1 },
      info: "the answer gets shorter still",
    },
    everything: {
      label: "remove every digit",
      nums: [..."10"],
      extra: { k: 2 },
      info: 'nothing left means "0"',
    },
    ascending: {
      label: "the digits never decrease",
      nums: [..."12345"],
      extra: { k: 2 },
      info: "nothing in the middle is worth deleting",
    },
    none: {
      label: "remove nothing",
      nums: [..."4321"],
      extra: { k: 0 },
      info: "the number is already the answer",
    },
    long: { label: "a longer number", nums: [..."7238146590"], extra: { k: 4 } },
  },
  edges: [
    {
      key: "everything",
      name: "every digit is removed",
      example: '"10" with k = 2 → "0"',
      why: 'Nothing is left, and the answer for nothing is "0" rather than an empty string. A number with no digits is not a number.',
      think: "What does your code return when the survivors run out?",
      preset: "everything",
      constraint: 2,
    },
    {
      key: "leadingzero",
      name: "a removal exposes a leading zero",
      example: '"10200" with k = 1 → "200"',
      why: 'Deleting the 1 leaves "0200", and stripping the leading zero makes the answer three digits long rather than four. The removal rule alone never predicts that the answer gets shorter.',
      think: "Is the length of your answer always the number of survivors?",
      preset: "leadingzero",
      constraint: 3,
    },
    {
      key: "ascending",
      name: "the digits never decrease",
      example: '"12345" with k = 2 → "123"',
      why: "No digit is ever followed by a smaller one, so nothing in the middle is worth deleting. The budget has to be spent from the END, and code that only deletes on a comparison never spends it at all.",
      think: "What happens to your leftover budget when the scan finds nothing to remove?",
      preset: "ascending",
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
        "given: a number as digits, and a count k",
        "remove exactly k of them; the rest keep their order",
        "task: leave the smallest number possible",
        'nothing left, or leading zeroes: report "0" and strip',
      ],
      tools: [
        {
          name: "Digits as a row",
          role: "a row where position is significance: the leftmost digit is worth more than everything to its right put together. That is why an improvement further left always wins.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "position beats value — lowering an earlier digit beats any change later",
        "the survivors keep their order; nothing is rearranged",
        "leading zeroes are stripped, so the answer can be shorter than the survivors",
        'nothing left means "0"',
      ],
      quiz: [
        {
          q: 'You may delete one digit from "45". Which?',
          choices: ["the 5, leaving 4", "the 4, leaving 5"],
          answer: 0,
          explain:
            "Deleting the 4 promotes the 5 into the tens place. Improving an earlier position is worth more than anything that happens later — here it is the difference between 4 and 5.",
        },
      ],
      run: story,
    },
    {
      key: "pick",
      name: "Choose each digit in turn",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Build the answer one slot at a time. For each slot, look at every digit still legally available — not so late that the remaining slots cannot be filled — and take the smallest.",
      takeaways: [
        "it states the priority outright: the most significant slot is settled first",
        "the window's right edge is what enforces 'enough digits left to finish'",
        "and each slot rescans a window the previous slot already walked",
      ],
      quiz: [
        {
          q: "Why does the window for each slot have a right-hand limit?",
          choices: [
            "to bound the running time",
            "because taking a digit too late leaves fewer digits than there are slots still to fill",
          ],
          answer: 1,
          explain:
            "Exactly k are removed, so the answer's length is fixed. Every slot must leave enough behind for the ones after it.",
        },
      ],
      run: pickSmallest,
    },
    {
      key: "stack",
      name: "Delete on the way past",
      short: "one pass, each digit once",
      insight:
        "The scan for each slot is asking the same question over and over: is there anything kept so far that a smaller digit could replace? That question can be answered as each digit ARRIVES — a kept digit larger than the newcomer sits further left, so deleting it improves a more significant place than any later choice could.",
      idea: problem.whyNow!,
      takeaways: [
        "while the last kept digit is larger than the arrival, delete it and spend a unit of budget",
        "what survives never decreases, which is the shape of the smallest number those digits can spell",
        "leftover budget is spent from the END, where the least significant digits are",
        "each digit is added once and removed at most once, so one pass does it",
      ],
      quiz: [
        {
          q: "Why delete the kept digit rather than the newcomer, when the kept one is larger?",
          choices: [
            "because the newcomer is smaller",
            "because the kept one sits further left, so removing it lowers a more significant place",
          ],
          answer: 1,
          explain:
            "Both are true, but only the second is the reason. Significance is decided by position, and the earlier position is worth more than any later improvement.",
        },
      ],
      run: monotonic,
    },
  ],
})
