// Squeeze Out the Duplicates, derived. Two rungs, both linear. The argument
// is not about speed at all — it is about whether the ordering the input
// handed you gets used or thrown away and rebuilt.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/remove-duplicates-sorted/index.ts"

type N = Data<number>

export function distinctInOrder(nums: number[]) {
  const out: number[] = []
  for (const x of nums) if (!out.length || out[out.length - 1] !== x) out.push(x)
  return out
}

function* story({ nums }: N): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A sorted row with repeats in it. Keep one of each value, in the order they already stand, and do it inside the row you were handed rather than in a new one.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "The sortedness is the entire gift, and it is worth naming precisely: equal values are always NEXT TO each other. So 'have I seen this before?' collapses into 'is this the same as the one before it?' — a question about one neighbour, not about everything so far.",
  }
  const out = distinctInOrder(nums)
  const runs = nums.filter((v, i) => i > 0 && v === nums[i - 1]).length
  const longest = (() => {
    let best = 1
    let run = 1
    for (let i = 1; i < nums.length; i++) {
      run = nums[i] === nums[i - 1] ? run + 1 : 1
      best = Math.max(best, run)
    }
    return best
  })()
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((v, i) => [i, i === 0 || v !== nums[i - 1] ? "answer" : "dim"])
    ) as Record<number, ChipRole>,
    state: [{ label: "survivors", value: out.join(", ") }],
    answer: out,
    corner:
      runs === 0
        ? "alldistinct"
        : out.length === 1
          ? "allsame"
          : longest >= 3
            ? "longrun"
            : undefined,
    note:
      runs === 0
        ? "Nothing repeats, so every value survives and nothing may move. The input is already the answer — and a solution that writes unconditionally still gets it right here while doing work it did not need to."
        : out.length === 1
          ? `Every value is ${out[0]}, so one survivor and the rest go. Whatever marks where the next survivor belongs never advances past position 1, and everything behind it is stale.`
          : longest >= 3
            ? `${nums.join(", ")} becomes ${out.join(", ")}. There is a run of ${longest} equal values here, so the writer falls several places behind the reader — a comparison against the READER's previous value rather than the last thing WRITTEN would let a duplicate through.`
            : `${nums.join(", ")} becomes ${out.join(", ")} — ${out.length} distinct value${out.length === 1 ? "" : "s"} of ${nums.length}.`,
  }
}

function* copyOut({ nums }: N): Generator<DFrame> {
  const out: number[] = []
  for (let i = 0; i < nums.length; i++) {
    const keep = !out.length || out[out.length - 1] !== nums[i]
    if (keep) out.push(nums[i])
    yield {
      line: 3,
      marks: { [i]: keep ? "answer" : "dim" },
      state: [{ label: "collected", value: out.join(", ") }],
      note: keep
        ? `${nums[i]} differs from the last one collected, so it joins the copy — ${out.length} so far.`
        : `${nums[i]} is the same as the last one collected. Dropped.`,
    }
  }
  yield {
    line: 5,
    row: [...out],
    answer: [...out],
    state: [{ label: "survivors", value: out.join(", ") }],
    note: `${out.join(", ")}. Correct, linear, and the ordering was preserved for free — the values were collected in the order they were met. The only complaint is the second row it built to hold them.`,
  }
}

function* readWrite({ nums }: N): Generator<DFrame> {
  const out = [...nums]
  let write = 1
  for (let read = 1; read < out.length; read++) {
    const keep = out[read] !== out[write - 1]
    if (keep) {
      out[write] = out[read]
      write += 1
    }
    yield {
      line: keep ? 4 : 3,
      row: [...out],
      marks: {
        ...Object.fromEntries(
          out.map((_, i) => [i, i < write ? "answer" : "dim"])
        ) as Record<number, ChipRole>,
        [read]: "focus",
      },
      state: [
        { label: "read·write", value: `${read}·${write}` },
        { label: "behind by", value: read - write + 1 },
      ],
      note: keep
        ? `${out[read]} differs from ${out[write - 2] ?? out[0]}, the last value WRITTEN, so it is written at ${write - 1} and the writer advances. Note the comparison: against what was kept, never against the reader's own neighbour.`
        : `${out[read]} equals the last value written. Skip it — the reader moves on, the writer stays, and the gap between them is exactly how many duplicates have gone past.`,
    }
  }
  const kept = out.slice(0, write)
  yield {
    line: 6,
    row: kept,
    answer: kept,
    state: [{ label: "survivors", value: kept.join(", ") }],
    note: `${kept.join(", ")}, written over the front of the original row. One pass, no second array, and the ordering survived because the writer only ever writes values in the order the reader met them.`,
  }
}

const nonDecreasing = (nums: number[]) =>
  nums.every((v, i) => i === 0 || nums[i - 1] <= v)

export const removeDuplicatesSorted = deriveJourney(problem, {
  slug: "one-of-each-in-place",
  subtitle: "sorted means a duplicate is always next door",
  reveals: ["two-pointers"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer row" },
  classify: (d) =>
    nonDecreasing(d.nums as number[])
      ? { ok: true }
      : {
          ok: false,
          warning:
            "the row must be sorted — comparing with one neighbour only works because equal values are adjacent",
        },
  presets: {
    example: { label: "the example", nums: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] },
    alldistinct: {
      label: "nothing repeats",
      nums: [1, 2, 3, 4],
      info: "nothing should move",
    },
    allsame: {
      label: "every value the same",
      nums: [5, 5, 5, 5],
      info: "one survivor",
    },
    longrun: {
      label: "a run of four",
      nums: [1, 2, 2, 2, 2, 3],
      info: "the writer falls well behind",
    },
    single: { label: "one value", nums: [9], info: "nothing to compare" },
    long: {
      label: "a longer row",
      nums: [-3, -3, -1, 0, 0, 0, 2, 2, 5, 7, 7, 7, 9],
    },
  },
  edges: [
    {
      key: "alldistinct",
      name: "nothing repeats",
      example: "[1, 2, 3, 4] → unchanged",
      why: "Every value survives and nothing may move. A solution that writes unconditionally is still correct here while doing pointless work — which is why this input cannot catch that mistake and the long run can.",
      think: "On a row with nothing to remove, does your code write anything?",
      preset: "alldistinct",
      constraint: 2,
    },
    {
      key: "allsame",
      name: "every value the same",
      example: "[5, 5, 5, 5] → [5]",
      why: "One survivor, and the writer never advances past position 1. Everything behind it is stale data that must not be reported as part of the answer.",
      think: "How does your caller know where the survivors stop?",
      preset: "allsame",
      constraint: 3,
    },
    {
      key: "longrun",
      name: "a run of three or more",
      example: "[1, 2, 2, 2, 2, 3] → [1, 2, 3]",
      why: "The writer falls several places behind the reader. Comparing against the READER's previous value instead of the last value WRITTEN happens to work on a run of two and lets a duplicate through here.",
      think: "Which value are you comparing against — the one you last read, or the one you last kept?",
      preset: "longrun",
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
        "given: a row in non-decreasing order, repeats allowed",
        "keep one of each value, in the order they stand",
        "so: equal values are always ADJACENT",
        "task: rearrange the row itself and say where the survivors end",
      ],
      tools: [
        {
          name: "Sorted array",
          role: "a row whose equal values are guaranteed to sit next to each other. That turns a question about everything seen so far into a question about one neighbour.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "sorted means a duplicate is always adjacent to its twin",
        "so 'seen this before?' becomes 'same as the last one kept?'",
        "in place: the survivors end up at the front of the same row",
      ],
      quiz: [
        {
          q: "Why is comparing with one neighbour enough here?",
          choices: [
            "because there are few duplicates",
            "because the row is sorted, so equal values cannot be separated by anything",
          ],
          answer: 1,
          explain:
            "On an unsorted row a duplicate could be anywhere and you would need a set. The ordering is what makes one comparison sufficient.",
        },
      ],
      run: story,
    },
    {
      key: "copy",
      name: "Collect into a new row",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk the row, collecting each value that differs from the last one collected, into a fresh list.",
      takeaways: [
        "linear and obviously right, and the order is preserved for free",
        "the comparison is already the correct one: against the last value KEPT",
        "and it builds a second row the size of the input to hold the answer",
      ],
      run: copyOut,
    },
    {
      key: "readwrite",
      name: "One reader, one writer",
      short: "in place, one pass",
      insight:
        "The copy is filled in exactly the order the original is read, and it is never longer than what has already been consumed. So the positions it needs are positions the reader has already passed — the second row can be the first.",
      idea: problem.whyNow!,
      takeaways: [
        "the reader visits every position; the writer advances only when a value is kept",
        "the writer can never overtake the reader, so nothing unread is overwritten",
        "compare against the last value WRITTEN, not the reader's own neighbour — a long run is where those differ",
        "the gap between the two is exactly how many duplicates have gone past",
      ],
      quiz: [
        {
          q: "On [1, 2, 2, 2, 3], what goes wrong if you compare each value with the one before it in the ORIGINAL row?",
          choices: [
            "nothing — it gives the same answer",
            "nothing here, but it is the same comparison by accident; on a run the two differ and a duplicate slips through",
          ],
          answer: 1,
          explain:
            "Inside a run the previous original value and the last kept value are the same, so it looks fine. The distinction bites once the writer has fallen behind and the array has been overwritten beneath it.",
        },
      ],
      run: readWrite,
    },
  ],
})
