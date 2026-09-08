import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "remove-k-digits",
  title: "Smallest Number After Removing k Digits",
  pattern: "stack",
  difficulty: "medium",
  leetcode: "remove-k-digits",
  brief: "Delete k digits to leave the smallest possible number.",
  statement:
    'Given a non-negative number as a string and an integer k, remove exactly k digits so the number that remains is as small as possible. Return it without leading zeroes, or "0" if nothing is left.',
  constraints: [
    "1 <= num.length <= 10^5, digits only, no leading zeroes unless the number is 0",
    "0 <= k <= num.length",
    'removing every digit leaves "0", not the empty string',
    'leading zeroes must be stripped from the result, so "10200" with k=1 gives "200"',
  ],
  examples: [
    { input: 'num = "1432219", k = 3', output: '"1219"' },
    {
      input: 'num = "10200", k = 1',
      output: '"200"',
      note: "Stripping the leading zero shortens the answer further.",
    },
    { input: 'num = "10", k = 2', output: '"0"' },
  ],
  hints: [
    "Scanning left to right, when is a digit definitely worth deleting? When the digit after it is smaller.",
    "That makes the kept digits non-decreasing — so keep them on a stack and pop while the top is larger than the newcomer.",
    "If budget remains after the whole scan, the sequence is already non-decreasing, so drop from the END.",
  ],
  whyNow:
    "Trying every combination of removals is exponential in k, and almost all of those combinations differ only in a prefix that a single comparison settles. A digit followed by a smaller one is always worth removing — the leftmost such removal lowers the most significant position it can — so greedy popping reaches the same answer in one pass.",
  approach:
    'Keep the digits on a stack, and before pushing a digit, pop any larger digit on top while budget remains. That leaves the kept digits non-decreasing, which is the smallest arrangement reachable by deletion alone. If budget is still unspent afterwards the sequence never decreased, so the removals must come off the end, where they cost the least. Finally strip leading zeroes and return "0" if nothing survives.',
  complexity: { time: "O(n)", space: "O(n)" },
  python: `def remove_k_digits(num: str, k: int) -> str:
    stack: list[str] = []
    budget = k
    for ch in num:
        while budget > 0 and stack and stack[-1] > ch:
            stack.pop()
            budget -= 1
        stack.append(ch)
    while budget > 0 and stack:
        stack.pop()
        budget -= 1
    out = "".join(stack).lstrip("0")
    return out if out else "0"`,
  walkthrough: [
    {
      cells: { values: ["1", "4", "3", "2", "2", "1", "9"] },
      caption:
        'num = "1432219", k = 3. Kept digits will end up non-decreasing.',
    },
    {
      cells: {
        values: ["1", "4", "3", "2", "2", "1", "9"],
        marks: { 0: "window", 1: "compare", 2: "focus" },
      },
      caption: "3 arrives and 4 is larger → pop 4. Budget 2 left.",
    },
    {
      cells: {
        values: ["1", "4", "3", "2", "2", "1", "9"],
        marks: { 2: "compare", 3: "focus" },
      },
      caption: "2 arrives and 3 is larger → pop 3. Budget 1.",
    },
    {
      cells: {
        values: ["1", "4", "3", "2", "2", "1", "9"],
        marks: { 3: "compare", 5: "focus" },
      },
      caption: "1 arrives and 2 is larger → pop 2. Budget spent.",
    },
    {
      cells: {
        values: ["1", "2", "1", "9"],
        marks: { 0: "done", 1: "done", 2: "done", 3: "done" },
      },
      caption:
        '"1219". Each pop removed a digit that a smaller one immediately followed.',
    },
  ],
  alternatives: [
    {
      name: "Pick the smallest digit at each step",
      summary:
        "Choose the answer one digit at a time: for each position, scan the window of digits still allowed and take the smallest, then continue after it.",
      complexity: { time: "O(n · k)", space: "O(n)" },
      python: `def remove_k_digits(num: str, k: int) -> str:
    keep = len(num) - k
    out = ""
    start = 0
    for slot in range(keep):
        limit = len(num) - (keep - slot)
        best = start
        for j in range(start, limit + 1):
            if num[j] < num[best]:
                best = j
        out += num[best]
        start = best + 1
    out = out.lstrip("0")
    return out if out else "0"`,
    },
  ],
}
