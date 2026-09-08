// Longest Substring Without Repeats, derived. The row on screen holds
// characters rather than numbers — the first journey to do so, which is why
// `cells: "characters"` exists. Everything the Problem already carries comes
// from ../problems/sliding-window/longest-unique-substring.ts; this file is
// the act framing, the quiz, the corner cases and one generator per rung.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../problems/sliding-window/longest-unique-substring.ts"

type S = Data<string>

const span = (from: number, to: number, role: ChipRole = "focus") =>
  Object.fromEntries(
    Array.from({ length: Math.max(0, to - from + 1) }, (_, k) => [
      from + k,
      role,
    ])
  ) as Record<number, ChipRole>

const show = (nums: string[], from: number, to: number) =>
  `"${nums.slice(from, to + 1).join("")}"`

// The longest clean run, by exhaustion — the narration quotes it, so it is
// computed rather than asserted.
export function longestUnique(nums: string[]) {
  let best = 0
  let at = 0
  for (let i = 0; i < nums.length; i++) {
    const seen = new Set<string>()
    for (let j = i; j < nums.length; j++) {
      if (seen.has(nums[j])) break
      seen.add(nums[j])
      if (j - i + 1 > best) [best, at] = [j - i + 1, i]
    }
  }
  return { best, at }
}

// The left edge is dragged backwards by a stale entry exactly when a repeat
// sits further back than the edge already is — the bug the `>= left` guard in
// the jump exists to stop, and the reason "abba" is a corner case.
const dragsBackwards = (nums: string[]) => {
  const last = new Map<string, number>()
  let left = 0
  for (let r = 0; r < nums.length; r++) {
    const seen = last.get(nums[r])
    if (seen !== undefined && seen < left) return true
    if (seen !== undefined) left = seen + 1
    last.set(nums[r], r)
  }
  return false
}

function* story({ nums }: S): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "A string, and one rule: inside the stretch you pick, no character may appear twice. Take the longest stretch that obeys it, and return how long it is.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Contiguous again, so this is a run of neighbours — you cannot skip the offending character and carry on. And the answer is a length, not the text: two different stretches that tie are the same answer.",
  }
  if (!nums.length) {
    yield {
      hold: 3,
      corner: "empty",
      answer: 0,
      note: "Nothing to read, so nothing to return but 0. Worth deciding now rather than at the first crash: the shortest legal input has no first character to look at.",
    }
    return
  }
  const { best, at } = longestUnique(nums)
  yield {
    hold: 3,
    note: `${nums.length} character${nums.length === 1 ? "" : "s"}: ${show(nums, 0, nums.length - 1)}. Every stretch either obeys the rule or breaks it, and the moment it breaks, every longer stretch from the same start breaks too.`,
  }
  yield {
    hold: 3,
    marks: span(at, at + best - 1),
    state: [{ label: "answer", value: best }],
    answer: best,
    corner: dragsBackwards(nums)
      ? "backjump"
      : nums.includes(" ")
        ? "spaces"
        : undefined,
    note: `The answer is ${best} — ${show(nums, at, at + best - 1)}${dragsBackwards(nums) ? ". Notice that a repeat here sits further back than a clean stretch has already reached: anything that jumps to a remembered position has to check whether that position is still in play" : nums.includes(" ") ? ". One of the repeating characters is a space, which is a character like any other — a solution that only counts letters is answering a different question" : ""}.`,
  }
}

function* brute({ nums }: S): Generator<DFrame> {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const window = nums.slice(i, j + 1)
      const clean = new Set(window).size === window.length
      if (clean && window.length > best) best = window.length
      yield {
        line: 5,
        marks: { ...span(i, j, clean ? "focus" : "dim"), [i]: "anchor" },
        state: [
          { label: "length", value: window.length },
          { label: "best", value: best },
        ],
        note: `${show(nums, i, j)} — ${clean ? `no repeats, length ${window.length}. ${window.length === best ? "The longest clean stretch so far." : `Best is still ${best}.`}` : "a character appears twice, so this stretch is out. Every longer stretch from this same start is out too, and this loop will check them all anyway."}`,
      }
    }
  }
  yield {
    line: 7,
    answer: best,
    state: [{ label: "best", value: best }],
    note: `${best}. Correct, and it builds a fresh set for every stretch — the work of checking "abc" is thrown away before checking "abca", which is the same three characters plus one.`,
  }
}

function* jump({ nums }: S): Generator<DFrame> {
  const last = new Map<string, number>()
  let left = 0
  let best = 0
  for (let right = 0; right < nums.length; right++) {
    const ch = nums[right]
    const seen = last.get(ch)
    const stale = seen !== undefined && seen < left
    if (seen !== undefined && seen >= left) {
      left = seen + 1
      yield {
        line: 5,
        marks: { ...span(left, right), [seen]: "dim", [right]: "anchor" },
        state: [
          { label: "left", value: left },
          { label: "best", value: best },
        ],
        note: `'${ch}' was last at ${seen}, which is inside the stretch, so the left edge jumps straight to ${left} — past it in one move rather than one character at a time.`,
      }
    }
    last.set(ch, right)
    const size = right - left + 1
    const record = size > best
    best = Math.max(best, size)
    yield {
      line: 7,
      marks: { ...span(left, right, record ? "answer" : "focus") },
      state: [
        { label: "left", value: left },
        { label: "best", value: best },
      ],
      note: `${show(nums, left, right)} is clean, length ${size}${record ? ", the longest yet" : `, best still ${best}`}.${stale ? ` And note what the guard just saved: '${ch}' is remembered at ${seen}, behind the left edge, so that memory is stale and must be ignored — following it would drag the edge backwards and re-admit characters that already left.` : ""}`,
    }
  }
  yield {
    line: 8,
    answer: best,
    state: [{ label: "best", value: best }],
    note: `${best}, one pass. The cost is the table: before this can move at all it needs somewhere to remember every character it has ever seen, and a guard on every read of it.`,
  }
}

function* window({ nums }: S): Generator<DFrame> {
  const inside = new Set<string>()
  let left = 0
  let best = 0
  for (let right = 0; right < nums.length; right++) {
    const ch = nums[right]
    while (inside.has(ch)) {
      yield {
        line: 6,
        marks: { ...span(left, right - 1), [left]: "dim", [right]: "anchor" },
        state: [
          { label: "left", value: left },
          { label: "best", value: best },
        ],
        note: `'${ch}' is already inside, so the stretch is broken. Drop '${nums[left]}' from the left and look again — the only way to fix it is to make room.`,
      }
      inside.delete(nums[left])
      left += 1
    }
    inside.add(ch)
    const size = right - left + 1
    const record = size > best
    best = Math.max(best, size)
    yield {
      line: 9,
      marks: span(left, right, record ? "answer" : "focus"),
      state: [
        { label: "left", value: left },
        { label: "best", value: best },
      ],
      note: `${show(nums, left, right)} obeys the rule, length ${size}${record ? ", the longest yet" : `, best still ${best}`}. The stretch is valid after every single step, which is why reading its size every step is enough.`,
    }
  }
  yield {
    line: 10,
    answer: best,
    state: [{ label: "best", value: best }],
    note: `${best}. Each character is added once and dropped at most once, so the two edges together walk the string twice — linear, with nothing remembered but what is currently in play.`,
  }
}

export const longestUniqueSubstring = deriveJourney<string>(problem, {
  slug: "longest-clean-run",
  subtitle: "two edges, one rule, and nothing remembered that has already left",
  reveals: ["sliding-window"],
  cells: "characters",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer string" },
  presets: {
    example: { label: "the example", nums: [..."abcabcbb"] },
    empty: {
      label: "the empty string",
      nums: [],
      info: "nothing to read at all",
    },
    allsame: {
      label: "one character, repeated",
      nums: [..."bbbb"],
      info: "every character is a repeat — is the answer 0 or 1?",
    },
    backjump: {
      label: "a repeat left behind",
      nums: [..."abba"],
      info: "a character repeats from further back than the stretch reaches",
    },
    spaces: {
      label: "spaces repeat too",
      nums: [..."a b b"],
      info: "the repeating character is a space",
    },
    long: { label: "a longer string", nums: [..."pwwkewabcdeffgh"] },
  },
  edges: [
    {
      key: "empty",
      name: "the empty string",
      example: '"" → 0',
      why: "Any solution that reads the first character, or seeds its answer from it, has nothing to read here.",
      think: "What does your first line do when there is no first character?",
      preset: "empty",
      constraint: 0,
    },
    {
      key: "backjump",
      name: "a repeat from further back",
      example: '"abba" → 2, not 3',
      why: "The second 'a' was last seen at index 0, but by then the stretch already begins at index 2. Following that remembered position moves the left edge BACKWARDS and quietly re-admits the 'b' that already left.",
      think: "When you remember where a character was, how do you know that memory is still worth anything?",
      preset: "backjump",
      constraint: 2,
    },
    {
      key: "spaces",
      name: "the repeat is a space",
      example: '"a b b" → 3',
      why: "A solution that tracks only letters, or indexes a 26-slot table by letter, either crashes or silently allows a duplicate space.",
      think: "Which characters can actually appear, and does your storage hold all of them?",
      preset: "spaces",
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
        "given: a string, any characters at all",
        "a stretch = neighbours, no gaps",
        "legal(stretch) = no character appears twice in it",
        "task: return the LENGTH of the longest legal stretch",
      ],
      tools: [
        {
          name: "String as a row of characters",
          role: "addressed by position, like an array. A stretch is a start and an end, and every character between them counts — including spaces and symbols.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "the answer is a length, not the text — ties do not need breaking",
        "contiguous: you cannot skip the repeat and keep going",
        "once a stretch breaks the rule, every longer stretch from that same start breaks it too",
      ],
      quiz: [
        {
          q: 'The string is "bbbb". What is the answer?',
          choices: ["0", "1", "4"],
          answer: 1,
          explain:
            'Every pair of neighbours repeats, so the longest legal stretch is a single "b" — length 1. Only the empty string answers 0.',
        },
      ],
      run: story,
    },
    {
      key: "brute",
      name: "Test every stretch",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Take every start and every end, collect the characters between them, and check whether any repeats. Keep the longest that comes back clean.",
      takeaways: [
        "n² stretches, and checking each one costs its own length — cubic",
        "it already knows that a broken stretch cannot be fixed by growing it, and it checks the longer ones anyway",
      ],
      quiz: [
        {
          q: 'Checking "abca" finds a repeat. What does this loop do next?',
          choices: [
            'it abandons the start at "a" and moves on',
            'it goes on to check "abcab", "abcabc", and the rest',
          ],
          answer: 1,
          explain:
            "Nothing tells the inner loop that a broken stretch stays broken, so it keeps growing it and rebuilding the set from scratch each time.",
        },
      ],
      run: brute,
    },
    {
      key: "jump",
      name: "Remember where each one was",
      short: "one pass, one table",
      from: 1,
      insight:
        "The honest loop rediscovers a repeat it has already seen, over and over. If the position of every character is written down as it goes past, the start of the stretch can move straight to the far side of a repeat instead of feeling its way there.",
      idea: "Keep a table of the last position of every character. When the incoming one is already in the table AND that position still lies inside the current stretch, move the start just past it. The length is then the distance between the two edges.",
      takeaways: [
        "a remembered position is only useful while it is still inside the stretch",
        "without that guard the start moves backwards and silently re-admits characters",
        "the table grows to the size of the alphabet, and every read of it needs checking",
      ],
      quiz: [
        {
          q: 'On "abba", the second \'a\' is remembered at index 0 while the stretch already starts at index 2. What must happen?',
          choices: [
            "move the start to index 1, just past the remembered position",
            "ignore the memory — it is behind the start, so it is stale",
          ],
          answer: 1,
          explain:
            "Moving to index 1 would drag the start backwards and re-admit the 'b' that already left, answering 3 for a string whose answer is 2.",
        },
      ],
      run: jump,
    },
    {
      key: "window",
      name: "Hold only what is inside",
      short: "one pass, no history",
      insight:
        "That table remembers every character the string has ever held, including the ones long gone, and every read of it has to ask whether the memory is stale. Nothing outside the current stretch matters — so nothing outside it needs keeping.",
      idea: problem.whyNow!,
      takeaways: [
        "hold the contents of the stretch, not the history of the string: nothing can be stale",
        "one rule — grow on the right, shrink on the left while it is broken — and it is valid after every step",
        "each character is added once and dropped at most once, so two edges walk the string twice",
        "this is the sliding window, and the guard the previous rung needed is what its shape makes unnecessary",
      ],
      quiz: [
        {
          q: "Why is it enough to read the length after every single step?",
          choices: [
            "because the longest stretch is always the last one",
            "because the stretch is legal after every step, so every length read is a real candidate",
          ],
          answer: 1,
          explain:
            "The shrink runs until the rule holds again, so the invariant is restored before the length is read. That is what makes a running maximum correct here.",
        },
      ],
      run: window,
    },
  ],
})
