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
  arc: "Greedy plus a monotonic stack, and the greedy is the part to be able to justify: removing a digit that is larger than the digit after it always lowers the number, because the more significant position improves. So scan left to right, pop while the stack top is larger and removals remain, and the result is the smallest possible arrangement in order. Two details finish it — leftover removals are taken from the END, since a non-decreasing remainder is smallest when truncated, and leading zeros must be stripped with an empty result meaning zero. Those two are where almost every failure lives, and they are worth writing as separate lines rather than folding into the loop.",
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
  java: `public String removeKdigits(String num, int k) {
    StringBuilder kept = new StringBuilder();
    int budget = k;
    for (int i = 0; i < num.length(); i++) {
        char ch = num.charAt(i);
        while (budget > 0 && kept.length() > 0 && kept.charAt(kept.length() - 1) > ch) {
            kept.deleteCharAt(kept.length() - 1);
            budget--;
        }
        kept.append(ch);
    }
    while (budget > 0 && kept.length() > 0) {
        kept.deleteCharAt(kept.length() - 1);
        budget--;
    }
    int start = 0;
    while (start < kept.length() && kept.charAt(start) == '0') start++;
    String out = kept.substring(start);
    return out.isEmpty() ? "0" : out;
}`,
  cpp: `string removeKdigits(const string& num, int k) {
    string kept;
    int budget = k;
    for (char ch : num) {
        while (budget > 0 && !kept.empty() && kept.back() > ch) {
            kept.pop_back();
            budget--;
        }
        kept += ch;
    }
    while (budget > 0 && !kept.empty()) {
        kept.pop_back();
        budget--;
    }
    size_t start = 0;
    while (start < kept.size() && kept[start] == '0') start++;
    string out = kept.substr(start);
    return out.empty() ? "0" : out;
}`,
  alternatives: [
    {
      name: "Pick the smallest digit at each step",
      summary:
        "Build the answer one digit at a time: for each output position, scan the window of digits still reachable, take the smallest, and continue from just past it. Directly greedy and correct, and each of the n output positions rescans a window of up to k digits, which the stack collapses into a single pass.",
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
      java: `public String removeKdigits(String num, int k) {
    int keep = num.length() - k;
    StringBuilder picked = new StringBuilder();
    int start = 0;
    for (int slot = 0; slot < keep; slot++) {
        int limit = num.length() - (keep - slot);
        int best = start;
        for (int j = start; j <= limit; j++) {
            if (num.charAt(j) < num.charAt(best)) best = j;
        }
        picked.append(num.charAt(best));
        start = best + 1;
    }
    int at = 0;
    while (at < picked.length() && picked.charAt(at) == '0') at++;
    String out = picked.substring(at);
    return out.isEmpty() ? "0" : out;
}`,
      cpp: `string removeKdigits(const string& num, int k) {
    int keep = (int)num.size() - k;
    string picked;
    int start = 0;
    for (int slot = 0; slot < keep; slot++) {
        int limit = (int)num.size() - (keep - slot);
        int best = start;
        for (int j = start; j <= limit; j++) {
            if (num[j] < num[best]) best = j;
        }
        picked += num[best];
        start = best + 1;
    }
    size_t at = 0;
    while (at < picked.size() && picked[at] == '0') at++;
    string out = picked.substr(at);
    return out.empty() ? "0" : out;
}`,
    },
  ],
}
