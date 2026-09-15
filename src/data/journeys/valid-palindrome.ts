// Palindrome, Ignoring the Noise, derived. Two rungs, and the difference is
// whether you build a clean copy of the string or read the original in place.
// The trap is not the reversal — it is skipping before comparing.

import { deriveJourney } from "../../engine/derive.ts"
import type { DFrame, Data } from "../../engine/derive.ts"
import type { ChipRole } from "../../engine/types.ts"
import { problem } from "../../problems/valid-palindrome/index.ts"

type S = Data<string>

const alnum = (c: string) => /[a-z0-9]/i.test(c)

export function isPalindrome(chars: string[]) {
  const cleaned = chars.filter(alnum).map((c) => c.toLowerCase())
  return cleaned.join("") === [...cleaned].reverse().join("")
}

function* story({ nums }: S): Generator<DFrame> {
  yield {
    hold: 3,
    noChips: true,
    note: "Does this read the same forwards and backwards? Only the letters and digits count — spaces and punctuation are invisible, and upper case matches lower.",
  }
  yield {
    hold: 3,
    noChips: true,
    note: "Two rules, and they are different in kind. Case is a rule about how to COMPARE two characters. Punctuation is a rule about which characters take part at all — and mixing those two up is where the first draft goes wrong.",
  }
  const answer = isPalindrome(nums)
  const noise = nums.some((c) => !alnum(c))
  const kept = nums.filter(alnum)
  const cased = kept.some(
    (c, i) => c !== kept[kept.length - 1 - i] && c.toLowerCase() === kept[kept.length - 1 - i].toLowerCase()
  )
  yield {
    hold: 3,
    marks: Object.fromEntries(
      nums.map((c, i) => [i, alnum(c) ? "focus" : "dim"])
    ) as Record<number, ChipRole>,
    state: [{ label: "answer", value: answer ? "true" : "false" }],
    answer,
    corner: !kept.length
      ? "nonealnum"
      : cased
        ? "case"
        : noise
          ? "punct"
          : undefined,
    note: !kept.length
      ? "Not one letter or digit in the whole string. What is left to compare is nothing at all, and nothing reads the same in both directions — so the answer is TRUE. An empty palindrome is still a palindrome."
      : cased
        ? `Reading only the letters and digits: "${kept.join("")}" — ${answer ? "a palindrome" : "not a palindrome"}. Characters here match across the middle only once case is set aside, so the comparison is between characters folded to one case, never between the raw ones.`
        : noise
          ? `The characters that count spell "${kept.join("")}" — ${answer ? "a palindrome" : "not a palindrome"}. Everything else is not a MISMATCH but a non-participant: meeting a comma means step past it, not fail.`
          : `"${nums.join("")}" is ${answer ? "a palindrome" : "not a palindrome"}.`,
  }
}

function* cleanCopy({ nums }: S): Generator<DFrame> {
  const cleaned: string[] = []
  for (let i = 0; i < nums.length; i++) {
    if (alnum(nums[i])) cleaned.push(nums[i].toLowerCase())
    yield {
      line: 1,
      marks: { [i]: alnum(nums[i]) ? "answer" : "dim" },
      state: [{ label: "cleaned", value: cleaned.join("") || "—" }],
      note: alnum(nums[i])
        ? `'${nums[i]}' counts — lowercased and appended: "${cleaned.join("")}".`
        : `'${nums[i] === " " ? "space" : nums[i]}' is not a letter or digit, so it never enters the copy.`,
    }
  }
  const answer = cleaned.join("") === [...cleaned].reverse().join("")
  yield {
    line: 2,
    row: cleaned.length ? cleaned : [""],
    answer,
    state: [{ label: "answer", value: answer ? "true" : "false" }],
    note: `"${cleaned.join("")}" against its own reverse: ${answer ? "the same" : "different"}. Two lines, obviously right — and it built a whole second string in order to read it exactly once, then threw it away.`,
  }
}

function* twoEnds({ nums }: S): Generator<DFrame> {
  let i = 0
  let j = nums.length - 1
  while (i < j) {
    while (i < j && !alnum(nums[i])) {
      yield {
        line: 4,
        marks: { [i]: "dim", [j]: "anchor" },
        state: [{ label: "i·j", value: `${i}·${j}` }],
        note: `'${nums[i] === " " ? "space" : nums[i]}' at ${i} does not take part. Step the left pointer past it WITHOUT comparing — this is the line that separates skipping from failing.`,
      }
      i += 1
    }
    while (i < j && !alnum(nums[j])) {
      yield {
        line: 6,
        marks: { [i]: "anchor", [j]: "dim" },
        state: [{ label: "i·j", value: `${i}·${j}` }],
        note: `'${nums[j] === " " ? "space" : nums[j]}' at ${j} does not take part either. Step the right pointer in.`,
      }
      j -= 1
    }
    const same = nums[i].toLowerCase() === nums[j].toLowerCase()
    yield {
      line: 7,
      marks: { [i]: same ? "answer" : "focus", [j]: same ? "answer" : "focus" },
      state: [
        { label: "pair", value: `${nums[i]} · ${nums[j]}` },
        { label: "i·j", value: `${i}·${j}` },
      ],
      note: same
        ? `'${nums[i]}' against '${nums[j]}' — the same character once case is folded away. Both pointers move inward.`
        : `'${nums[i]}' against '${nums[j]}' — different, and both are real participants. That settles it: not a palindrome, and the rest of the string need never be read.`,
    }
    if (!same) {
      yield { line: 8, answer: false, note: "Return false." }
      return
    }
    i += 1
    j -= 1
  }
  yield {
    line: 11,
    answer: true,
    state: [{ label: "answer", value: "true" }],
    note: "The pointers met without ever disagreeing, so it is a palindrome. No copy was built, and a string that fails on its first pair costs two comparisons rather than a full rebuild.",
  }
}

export const validPalindrome = deriveJourney<string>(problem, {
  slug: "reads-the-same-both-ways",
  subtitle: "skip first, compare second",
  reveals: ["two-pointers"],
  cells: "characters",
  defaultPreset: "example",
  harder: { preset: "long", label: "a longer line" },
  presets: {
    example: { label: "the example", nums: [..."A man, a plan, a canal: Panama"] },
    nonealnum: {
      label: "nothing but punctuation",
      nums: [..." .,"],
      info: "an empty palindrome",
    },
    case: {
      label: "case only",
      nums: [..."Aa"],
      info: "the same letter, differently written",
    },
    punct: {
      label: "punctuation in the middle",
      nums: [..."a.b.a"],
      info: "a comma is not a mismatch",
    },
    no: { label: "not a palindrome", nums: [..."race a car"] },
    long: {
      label: "a longer line",
      nums: [..."Was it a car or a cat I saw?"],
    },
  },
  edges: [
    {
      key: "nonealnum",
      name: "nothing that counts",
      example: '" .," → true',
      why: "Every character is skipped, so there is nothing left to compare — and nothing is trivially a palindrome. The answer is true, which is the opposite of what a loop that never ran might be expected to produce.",
      think: "What does your code return when the two pointers meet immediately?",
      preset: "nonealnum",
      constraint: 2,
    },
    {
      key: "case",
      name: "the same letter, differently written",
      example: '"Aa" → true',
      why: "Case is a rule about how to compare, not about what to skip. A comparison on raw characters fails here on a string that is plainly a palindrome.",
      think: "Are you comparing the characters, or a folded version of them?",
      preset: "case",
      constraint: 3,
    },
    {
      key: "punct",
      name: "punctuation between the letters",
      example: '"a.b.a" → true',
      why: "A '.' is not a mismatch — it is a non-participant. Compare before you skip and the dot fails a perfectly good palindrome.",
      think: "When a pointer lands on punctuation, does your next action compare or advance?",
      preset: "punct",
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
        "given: a string of anything at all",
        "only letters and digits take part",
        "case is ignored when comparing",
        "task: does what remains read the same both ways?",
      ],
      tools: [
        {
          name: "String as a row of characters",
          role: "addressed by position, and containing two kinds of character: those that take part in the comparison and those that are simply not there for this purpose.",
        },
      ],
      hints: problem.hints,
      takeaways: [
        "two different rules: what to skip, and how to compare what is left",
        "punctuation is a non-participant, not a mismatch",
        "a string with nothing that counts is an empty palindrome — true",
      ],
      quiz: [
        {
          q: 'A pointer lands on a comma. What should happen?',
          choices: [
            "compare it with the other pointer's character",
            "advance past it without comparing anything",
          ],
          answer: 1,
          explain:
            "Comparing first is the classic bug: the comma will not match a letter, and a perfectly good palindrome fails.",
        },
      ],
      run: story,
    },
    {
      key: "clean",
      name: "Clean a copy, then reverse it",
      short: "the honest one",
      from: 0,
      insight: "",
      idea: "Build a lowercase copy holding only the letters and digits, then compare it with its own reverse.",
      takeaways: [
        "the two rules are separated cleanly, which is why this version is so easy to get right",
        "it holds a second string the size of the input to read it once",
        "and it always processes the whole string, even when the very first pair already disagrees",
      ],
      run: cleanCopy,
    },
    {
      key: "ends",
      name: "Walk in from both ends",
      short: "in place, and it stops early",
      insight:
        "The clean copy exists only so that the two ends line up. But the ends can be found in the original by stepping over the characters that do not count — no copy needed, and a disagreement can end the whole thing immediately.",
      idea: problem.whyNow!,
      takeaways: [
        "skip first, compare second — always, on both sides",
        "the skip loops must respect the pointers meeting, or they walk past each other",
        "a mismatch is final, so a bad string costs two comparisons rather than a full pass",
        "constant space: the original string is read where it stands",
      ],
      quiz: [
        {
          q: "Why must the skipping loops also check that the pointers have not met?",
          choices: [
            "for speed",
            "because a string of nothing but punctuation would otherwise walk them past each other and off the string",
          ],
          answer: 1,
          explain:
            "With nothing that counts, the left pointer never finds a reason to stop. The meeting condition is the only thing holding it.",
        },
      ],
      run: twoEnds,
    },
  ],
})
