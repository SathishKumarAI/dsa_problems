// Is the List a Palindrome?, derived.
//
// The ladder climbs in MEMORY, not in time: both rungs are one pass and O(n)
// comparisons. The array version is shorter and safe; the in-place one costs
// constant space and pays for it by mutating the caller's list, which the
// recap states rather than hiding.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/linked-list/palindrome-list.ts"

type N = Data<number>

/** The reference: does the list read the same in both directions? */
export const isPalindromeList = (nums: number[]) =>
  nums.every((v, i) => v === nums[nums.length - 1 - i])

const marksOf = (n: number, pick: (i: number) => ChipRole | undefined) => {
  const marks: Record<number, ChipRole> = {}
  for (let i = 0; i < n; i++) {
    const r = pick(i)
    if (r) marks[i] = r
  }
  return marks
}

const view = (
  values: number[],
  label: string,
  marks?: Record<number, ChipRole>,
  labels?: Record<number, string>
) => ({ values, label, marks, labels })

/** The first index where the list disagrees with its reverse, or -1. */
const firstMismatch = (nums: number[]) => {
  for (let i = 0, j = nums.length - 1; i < j; i++, j--)
    if (nums[i] !== nums[j]) return i
  return -1
}

function* story({ nums }: N): Generator<DFrame> {
  const answer = isPalindromeList(nums)
  const bad = firstMismatch(nums)
  yield {
    hold: 3,
    noChips: true,
    note: "A singly linked list. Does it read the same forwards and backwards?",
  }
  yield {
    hold: 3,
    list: view(nums, "one way only"),
    state: [{ label: "nodes", value: nums.length }],
    note: "The difficulty is the word BACKWARDS. A singly linked list can only be walked forwards, so 'the same in reverse' is a question the structure has no way to answer directly — something has to be built or rearranged first.",
  }
  yield {
    hold: 3,
    list: view(
      nums,
      answer ? "a palindrome" : `${nums[bad]} ≠ ${nums[nums.length - 1 - bad]}`,
      marksOf(nums.length, (i) =>
        answer
          ? "answer"
          : i === bad || i === nums.length - 1 - bad
            ? "focus"
            : "dim"
      )
    ),
    answer,
    corner:
      nums.length <= 1
        ? "tiny"
        : answer
          ? nums.length % 2 === 0
            ? "even"
            : "odd"
          : "mismatch",
    note:
      nums.length <= 1
        ? "A list of one node — or none — reads the same either way. True, and it is the case where a version that reverses a half has no half to reverse."
        : answer
          ? nums.length % 2 === 0
            ? "A palindrome of even length: every node has a partner, and the two halves meet exactly in the middle."
            : "A palindrome of odd length. The middle node is its own partner and is compared against itself, which is why it never needs a case of its own."
          : `Not a palindrome: position ${bad} holds ${nums[bad]} while its partner holds ${nums[nums.length - 1 - bad]}.`,
  }
}

/** Rung 1 — copy the values out and compare the array. */
function* copyOut({ nums }: N): Generator<DFrame> {
  const values: number[] = []
  yield {
    line: 1,
    list: view(nums, "values: none yet"),
    state: [{ label: "copied", value: 0 }],
    note: "If the list cannot be read backwards, copy it into something that can. An array indexes both ends for free.",
  }
  for (let i = 0; i < nums.length; i++) {
    values.push(nums[i])
    yield {
      line: 4,
      list: view(
        nums,
        `values: ${values.join(" ")}`,
        marksOf(nums.length, (k) =>
          k === i ? "focus" : k < i ? "dim" : undefined
        )
      ),
      state: [{ label: "copied", value: values.length }],
      note: `${nums[i]} copied out. One pass, and the list itself is left exactly as it was — nothing here modifies the caller's data.`,
    }
  }
  const answer = isPalindromeList(nums)
  const bad = firstMismatch(nums)
  yield {
    line: 5,
    answer,
    list: view(
      nums,
      answer ? "the same reversed" : "different reversed",
      marksOf(nums.length, (i) =>
        answer
          ? "answer"
          : i === bad || i === nums.length - 1 - bad
            ? "focus"
            : "dim"
      )
    ),
    state: [
      { label: "values", value: values.join(" ") || "empty" },
      { label: "reversed", value: [...values].reverse().join(" ") || "empty" },
      { label: "answer", value: String(answer) },
    ],
    corner: !answer ? "mismatch" : nums.length <= 1 ? "tiny" : undefined,
    note: `${answer}, by comparing the array with its own reverse. Short, obvious, and it holds a second copy of the whole list — which is the only thing wrong with it, and only when n is large.`,
  }
}

/** Rung 2 — find the middle, reverse the back half, walk in from both ends. */
function* reverseHalf({ nums }: N): Generator<DFrame> {
  let slow = 0
  let fast = 0
  yield {
    line: 1,
    list: view(
      nums,
      "find the middle first",
      marksOf(nums.length, (i) => (i === 0 ? "focus" : undefined)),
      { 0: "slow · fast" }
    ),
    state: [{ label: "nodes", value: nums.length }],
    note: "Two runners again, and for the same reason: the middle is needed and the length is not known. Everything after slow is the half that will be turned around.",
  }
  while (fast < nums.length && fast + 1 < nums.length) {
    slow += 1
    fast += 2
    yield {
      line: 4,
      list: view(
        nums,
        `slow at ${nums[slow]}`,
        marksOf(nums.length, (i) =>
          i === slow ? "focus" : i === fast ? "anchor" : undefined
        ),
        {
          [slow]: "slow",
          ...(fast < nums.length ? { [fast]: "fast" } : {}),
        }
      ),
      state: [{ label: "slow", value: nums[slow] }],
      note: `Slow reaches ${nums[slow]}. When fast falls off the end, slow marks where the second half begins.`,
    }
  }
  const back = nums.slice(slow).reverse()
  yield {
    line: 9,
    list: view(
      [...nums.slice(0, slow), ...back],
      "back half reversed",
      marksOf(nums.length, (i) => (i >= slow ? "anchor" : undefined))
    ),
    state: [
      { label: "front", value: nums.slice(0, slow).join(" ") || "empty" },
      { label: "back, reversed", value: back.join(" ") },
    ],
    corner: nums.length <= 1 ? "tiny" : undefined,
    note: `The second half now points backwards: ${back.join(" → ")}. This is the part that costs nothing in memory and something in trust — the caller's list has been rewired, and unless it is put back, they no longer own the list they handed over.`,
  }
  const front = nums.slice(0, slow)
  for (let k = 0; k < back.length && k < front.length + 1; k++) {
    const left = front[k]
    const right = back[k]
    if (left === undefined) break
    if (left !== right) {
      yield {
        line: 16,
        answer: false,
        list: view(
          nums,
          `${left} ≠ ${right}`,
          marksOf(nums.length, (i) =>
            i === k || i === nums.length - 1 - k ? "focus" : "dim"
          )
        ),
        state: [
          { label: "front", value: left },
          { label: "back", value: right },
        ],
        corner: "mismatch",
        note: `${left} against ${right} — they differ, so this is not a palindrome. The walk stops here, having compared ${k + 1} ${k === 0 ? "pair" : "pairs"}.`,
      }
      return
    }
    yield {
      line: 18,
      list: view(
        nums,
        `${left} = ${right}`,
        marksOf(nums.length, (i) =>
          i === k || i === nums.length - 1 - k ? "answer" : "dim"
        )
      ),
      state: [
        { label: "pair", value: `${left} · ${right}` },
        { label: "matched", value: k + 1 },
      ],
      corner:
        nums.length % 2 === 1 && k === back.length - 1 ? "odd" : undefined,
      note:
        nums.length % 2 === 1 && k === back.length - 1
          ? `${left} against ${right}. On an odd-length list the middle node ends up compared with itself, which is always true — so the odd case needs no special handling at all.`
          : `${left} matches ${right}. Two pointers walking inward, and nothing has been copied.`,
    }
  }
  const answer = isPalindromeList(nums)
  yield {
    line: 20,
    answer,
    list: view(
      nums,
      "a palindrome",
      marksOf(nums.length, () => "answer")
    ),
    state: [
      { label: "answer", value: String(answer) },
      { label: "extra memory", value: "two pointers" },
    ],
    corner: nums.length <= 1 ? "tiny" : nums.length % 2 === 0 ? "even" : "odd",
    note: `${answer}, in constant extra space. The price is on the other side of the ledger: the list was rewired to get here, so a well-behaved version reverses that half back before returning — and a version that forgets has quietly corrupted its caller's data while returning the right answer.`,
  }
}

export const palindromeList = deriveJourney<number>(problem, {
  slug: "read-it-both-ways",
  subtitle: "a one-way list, asked a two-way question",
  reveals: ["linked-list"],
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer list" },
  classify: () => ({ ok: true }),
  presets: {
    example: {
      label: "the example",
      nums: [1, 2, 2, 1],
      info: "a palindrome",
    },
    odd: {
      label: "odd length",
      nums: [1, 2, 3, 2, 1],
      info: "the middle pairs with itself",
    },
    mismatch: {
      label: "not a palindrome",
      nums: [1, 2, 3, 4],
      info: "fails at the first pair",
    },
    tiny: { label: "one node", nums: [7], info: "true" },
    empty: { label: "an empty list", nums: [], info: "true" },
    pair: {
      label: "two equal nodes",
      nums: [5, 5],
      info: "the smallest real one",
    },
    negatives: {
      label: "negative values",
      nums: [-3, 8, -3],
      info: "values are only compared",
    },
    long: {
      label: "a longer list",
      nums: [1, 2, 3, 4, 5, 4, 3, 2, 1],
      info: "nine nodes",
    },
  },
  edges: [
    {
      key: "tiny",
      name: "one node, or none",
      example: "[7] → true",
      why: "There is nothing to compare, so the answer is true. It is also the input where a version that reverses the second half finds no second half — the loop must be able to run zero times.",
      think: "What does your comparison loop do when there are no pairs?",
      preset: "tiny",
      constraint: 0,
    },
    {
      key: "odd",
      name: "an odd number of nodes",
      example: "[1, 2, 3, 2, 1] → true",
      why: "The middle node has no partner but itself. Compared against itself it always matches, so no special case is needed — but only if the halves are cut so that the middle falls on the side being walked.",
      think:
        "Where does your middle node end up, and is it compared to anything?",
      preset: "odd",
      constraint: 2,
    },
    {
      key: "even",
      name: "an even number of nodes",
      example: "[1, 2, 2, 1] → true",
      why: "Every node has a distinct partner and the halves are equal. It is the case where an off-by-one in the split shows up as comparing a node with itself, which passes and hides the bug.",
      think: "How many pairs should an n-node list compare?",
      preset: "example",
      constraint: 0,
    },
    {
      key: "mismatch",
      name: "the first pair already disagrees",
      example: "[1, 2, 3, 4] → false",
      why: "The answer is decided immediately, and a version that compares whole reversed copies still builds both first. Worth seeing as the cheapest possible false.",
      think: "Does your comparison stop at the first disagreement?",
      preset: "mismatch",
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
        "given: the head of a singly linked list, possibly empty",
        "the links only go forwards",
        "task: return whether the values read the same in both directions",
        "a list of one node reads the same either way",
      ],
      tools: [
        {
          name: "Singly linked list",
          role: "drawn from the row. Only forward steps exist, which is the whole difficulty: 'the same backwards' is a question the structure cannot answer without something being copied or rewired.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the list can only be walked forwards, and the question is about backwards",
        "so either copy the values somewhere indexable, or turn part of the list around",
        "one node, or none, is a palindrome",
      ],
      quiz: [
        {
          q: "Why is this harder on a linked list than on an array?",
          choices: [
            "the values are harder to compare",
            "an array can be read from either end; a singly linked list only goes forwards",
          ],
          answer: 1,
          explain:
            "Everything below is a way of buying backwards access — with memory, or by rewiring the list.",
        },
      ],
      run: story,
    },
    {
      key: "copy",
      name: "Copy the values out",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Walk the list once, collecting the values into an array, then compare that array with its reverse.",
      takeaways: [
        "one pass, and the list is left exactly as it was",
        "an array can be read from both ends, which is the whole point of copying",
        "and it holds a second copy of every value",
      ],
      run: copyOut,
    },
    {
      key: "reverse",
      name: "Turn the back half around",
      short: "constant space",
      insight:
        "Copying every value buys backwards access with memory proportional to the list — when the list itself could provide it, if part of it pointed the other way.",
      idea: problem.approach,
      takeaways: [
        "find the middle with two runners, reverse everything after it, then walk inward from both ends",
        "the extra memory is two pointers, whatever the length",
        "an odd middle compares with itself and needs no special case",
        "and the caller's list has been REWIRED — a considerate version restores it before returning",
      ],
      quiz: [
        {
          q: "What does this version cost that the array version does not?",
          choices: [
            "time — it makes two passes",
            "it mutates the caller's list, so it has to put the links back before returning",
          ],
          answer: 1,
          explain:
            "Both are linear. The trade here is memory against side effects, which is a different axis from the usual one.",
        },
      ],
      run: reverseHalf,
    },
  ],
})
