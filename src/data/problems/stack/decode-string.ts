import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "decode-string",
  title: "Expand a Nested Encoding",
  pattern: "stack",
  difficulty: "medium",
  leetcode: "decode-string",
  brief: "Expand k[...] groups, including nested ones.",
  statement:
    "Given a string encoded as k[substring], where the substring repeats k times and groups may nest, return the decoded string.",
  constraints: [
    "1 <= s.length <= 30, and the input is always well formed",
    "1 <= k <= 300, and k may have more than one digit",
    "groups NEST, so an inner group must be fully expanded before its enclosing group repeats it",
    "letters may appear outside any group, before or after it",
  ],
  examples: [
    { input: 's = "3[a]2[bc]"', output: '"aaabcbc"' },
    {
      input: 's = "3[a2[c]]"',
      output: '"accaccacc"',
      note: "The inner group expands first.",
    },
  ],
  hints: [
    "When a '[' arrives, the text built so far and the count in front of it must be set aside and resumed later.",
    "Set-aside-and-resume in the opposite order is exactly a stack.",
    "A multi-digit count must be accumulated across characters before the '[' is reached.",
  ],
  whyNow:
    "Recursion expresses the nesting naturally but re-enters the parser for every group and carries the position awkwardly across returns. A stack makes the suspended state explicit — one entry per open bracket — and the whole decoding is a single left-to-right pass with no backtracking.",
  approach:
    "Walk left to right building the current text. A digit accumulates into the pending count, since a count may be several digits. A '[' pushes the current text and count onto stacks and starts a fresh, empty text. A ']' pops them, repeats the just-finished text by its count, and appends it to the resumed text. A letter simply appends. Everything the enclosing group had built is waiting on the stack, which is why nesting needs no special case.",
  complexity: { time: "O(n · k)", space: "O(n)" },
  python: `def decode_string(s: str) -> str:
    counts: list[int] = []
    texts: list[str] = []
    current = ""
    number = 0
    for ch in s:
        if ch.isdigit():
            number = number * 10 + int(ch)
        elif ch == "[":
            counts.append(number)
            texts.append(current)
            number = 0
            current = ""
        elif ch == "]":
            current = texts.pop() + current * counts.pop()
        else:
            current += ch
    return current`,
  walkthrough: [
    {
      cells: { values: ["3", "[", "a", "2", "[", "c", "]", "]"] },
      caption:
        '"3[a2[c]]". Two stacks travel with the walk: pending counts and suspended text.',
    },
    {
      cells: {
        values: ["3", "[", "a", "2", "[", "c", "]", "]"],
        marks: { 0: "focus", 1: "focus" },
      },
      caption:
        "Count 3 accumulated, then '[' suspends the empty text. Stacks: [3], [\"\"].",
    },
    {
      cells: {
        values: ["3", "[", "a", "2", "[", "c", "]", "]"],
        marks: { 2: "window", 3: "focus", 4: "focus" },
      },
      caption:
        'Current is "a"; then 2 and a second \'[\' suspend it too. Stacks: [3,2], ["","a"].',
    },
    {
      cells: {
        values: ["3", "[", "a", "2", "[", "c", "]", "]"],
        marks: { 5: "window", 6: "focus" },
      },
      caption: 'The first \']\' pops: "a" + "c"×2 = "acc".',
    },
    {
      cells: {
        values: ["3", "[", "a", "2", "[", "c", "]", "]"],
        marks: { 7: "focus" },
      },
      caption:
        'The second \']\' pops: "" + "acc"×3 = "accaccacc". Nesting needed no special case.',
    },
  ],
  alternatives: [
    {
      name: "Recursive descent",
      summary:
        "Parse the string with a recursive function that consumes a count, an opening bracket, the group inside it, and the closing bracket, calling itself for each nested group.",
      complexity: { time: "O(n · k)", space: "O(n)" },
      python: `def parse(s: str, at: int) -> tuple[str, int]:
    out = ""
    number = 0
    while at < len(s):
        ch = s[at]
        if ch.isdigit():
            number = number * 10 + int(ch)
            at += 1
        elif ch == "[":
            inner, at = parse(s, at + 1)
            out += inner * number
            number = 0
        elif ch == "]":
            return out, at + 1
        else:
            out += ch
            at += 1
    return out, at


def decode_string(s: str) -> str:
    return parse(s, 0)[0]`,
    },
  ],
}
