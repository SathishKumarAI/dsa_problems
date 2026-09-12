import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "generate-parens",
  title: "Every Well-Formed Bracket String",
  pattern: "stack",
  difficulty: "medium",
  leetcode: "generate-parentheses",
  brief: "All balanced strings of n pairs of brackets.",
  statement:
    "Given n, produce every string of n opening and n closing brackets that is well formed — every closing bracket matches an earlier opening one.",
  constraints: [
    "1 <= n <= 8",
    "the answer has the nth Catalan number of entries, which is 1430 at n = 8 — small enough to list, large enough that filtering all 2^2n strings is wasteful",
    "well formed means a running count of open brackets never goes negative and ends at zero",
    "the strings are returned in the order the construction produces them, so the answer is unambiguous",
  ],
  examples: [
    { input: "n = 1", output: '["()"]' },
    {
      input: "n = 2",
      output: '["(())", "()()"]',
      note: "Two of the four possible arrangements are balanced.",
    },
  ],
  hints: [
    "Build the string one character at a time and ask, at each step, which characters are still legal.",
    "An opening bracket is legal while fewer than n have been used. A closing bracket is legal only while it has something to close.",
    "That second rule is the whole problem: it prunes the invalid branch before it is built, instead of rejecting it afterwards.",
  ],
  whyNow:
    "Generating all 2^(2n) strings and filtering does exponential work to throw most of it away — at n = 8 that is 65 536 strings for 1430 answers. Checking legality at the moment of the choice means an invalid prefix is never extended, so the recursion visits only the answers and the partial strings that lead to them.",
  arc:
    "The move that matters is generating only what can still be valid instead of filtering afterwards. Two counters — openings used and closings used — give two rules: you may open while openings remain, and you may close only while closings trail openings. Those rules prune the tree so hard that the output size, the Catalan number, is the cost. That is backtracking in its purest form: choose, recurse, undo, with the legality test at the choice rather than at the leaf. Carry the habit of pushing constraints as early as possible into the recursion, and note that the undo step here is just truncating the string, which is why the path is built in a mutable buffer rather than by concatenation.",
  approach:
    "Grow a string by recursion, carrying how many opening and closing brackets have been placed. Add an opening bracket while fewer than n are used; add a closing bracket only while closes trail opens, which is exactly the condition that keeps the running balance non-negative. When both counts reach n the string is complete. The stack the pattern names is the call stack here — the balance being tracked is the depth of brackets still waiting to close.",
  complexity: { time: "O(4^n / √n)", space: "O(n)" },
  python: `def build(n: int, opened: int, closed: int, current: str, out: list[str]) -> None:
    if len(current) == 2 * n:
        out.append(current)
        return
    if opened < n:
        build(n, opened + 1, closed, current + "(", out)
    if closed < opened:
        build(n, opened, closed + 1, current + ")", out)


def generate_parenthesis(n: int) -> list[str]:
    out: list[str] = []
    build(n, 0, 0, "", out)
    return out`,
  java: `public void build(int n, int opened, int closed, StringBuilder current, List<String> out) {
    if (current.length() == 2 * n) {
        out.add(current.toString());
        return;
    }
    if (opened < n) {
        current.append('(');
        build(n, opened + 1, closed, current, out);
        current.deleteCharAt(current.length() - 1);
    }
    if (closed < opened) {
        current.append(')');
        build(n, opened, closed + 1, current, out);
        current.deleteCharAt(current.length() - 1);
    }
}

public List<String> generateParenthesis(int n) {
    List<String> out = new ArrayList<>();
    build(n, 0, 0, new StringBuilder(), out);
    return out;
}`,
  cpp: `void build(int n, int opened, int closed, string& current, vector<string>& out) {
    if ((int)current.size() == 2 * n) {
        out.push_back(current);
        return;
    }
    if (opened < n) {
        current.push_back('(');
        build(n, opened + 1, closed, current, out);
        current.pop_back();
    }
    if (closed < opened) {
        current.push_back(')');
        build(n, opened, closed + 1, current, out);
        current.pop_back();
    }
}

vector<string> generateParenthesis(int n) {
    vector<string> out;
    string current;
    build(n, 0, 0, current, out);
    return out;
}`,
  alternatives: [
    {
      name: "Generate everything, then filter",
      summary:
        "Produce all 2^(2n) strings of brackets, then keep the ones whose running balance never goes negative and ends at zero, sorted so the answer matches the order the construction below produces.",
      complexity: { time: "O(2^(2n) · n)", space: "O(n)" },
      python: `def balanced(s: str) -> bool:
    depth = 0
    for ch in s:
        depth += 1 if ch == "(" else -1
        if depth < 0:
            return False
    return depth == 0


def generate_parenthesis(n: int) -> list[str]:
    out: list[str] = []
    for mask in range(1 << (2 * n)):
        s = "".join("(" if mask & (1 << i) else ")" for i in range(2 * n))
        if balanced(s):
            out.append(s)
    return sorted(out)`,
      java: `public boolean balanced(String s) {
    int depth = 0;
    for (int i = 0; i < s.length(); i++) {
        depth += s.charAt(i) == '(' ? 1 : -1;
        if (depth < 0) return false;
    }
    return depth == 0;
}

public List<String> generateParenthesis(int n) {
    List<String> out = new ArrayList<>();
    for (int mask = 0; mask < (1 << (2 * n)); mask++) {
        StringBuilder s = new StringBuilder();
        for (int i = 0; i < 2 * n; i++) {
            s.append((mask & (1 << i)) != 0 ? '(' : ')');
        }
        if (balanced(s.toString())) out.add(s.toString());
    }
    Collections.sort(out);
    return out;
}`,
      cpp: `bool balanced(const string& s) {
    int depth = 0;
    for (char ch : s) {
        depth += ch == '(' ? 1 : -1;
        if (depth < 0) return false;
    }
    return depth == 0;
}

vector<string> generateParenthesis(int n) {
    vector<string> out;
    for (int mask = 0; mask < (1 << (2 * n)); mask++) {
        string s;
        for (int i = 0; i < 2 * n; i++) {
            s += (mask & (1 << i)) ? '(' : ')';
        }
        if (balanced(s)) out.push_back(s);
    }
    sort(out.begin(), out.end());
    return out;
}`,
    },
  ],
}
