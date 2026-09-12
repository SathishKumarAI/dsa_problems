import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "valid-parenthesis-string",
  title: "Brackets With a Wildcard",
  pattern: "stack",
  difficulty: "medium",
  leetcode: "valid-parenthesis-string",
  brief: "'*' may be an open bracket, a close bracket, or nothing.",
  statement:
    "Given a string of '(', ')' and '*', decide whether it can be read as a balanced bracket string, where each '*' may stand for a single '(', a single ')', or the empty string.",
  constraints: [
    "1 <= s.length <= 100",
    "s contains only '(', ')' and '*'",
    "each '*' is chosen independently — two stars in the same string need not play the same role",
    'the empty reading of \'*\' is allowed, so "(*)" and "()" and "(*" all behave differently',
  ],
  examples: [
    { input: 's = "()"', output: "true" },
    {
      input: 's = "(*))"',
      output: "true",
      note: "Read the star as '(' and the string is (()), which balances.",
    },
    {
      input: 's = "(((*)"',
      output: "false",
      note: "Even a star as ')' leaves two unmatched opens.",
    },
  ],
  hints: [
    "You cannot decide what a star means when you meet it. So do not decide — track a RANGE of possible open counts.",
    "Carry the lowest and highest number of unmatched '(' that any reading could have right now.",
    "The low end can never drop below zero, because a reading that went negative was never legal and is simply discarded.",
  ],
  whyNow:
    "Trying both meanings for every star is exponential in the number of stars, and most of those branches differ only in a count nobody can distinguish later. What actually matters at any point is how many opens are outstanding — so tracking the smallest and largest that count could be collapses the entire tree into two integers.",
  arc:
    "Two rungs, two entirely different mental models, and both are worth owning. Trying both meanings of every star is exponential and obviously correct. The linear version tracks a RANGE of possible open counts — a low and a high — where a star pushes the low down and the high up; the answer is valid when the range can still reach zero and the high never goes negative. Clamping the low at zero is the subtle step, because a negative low would mean unmatched closers that the stars cannot undo. That 'carry an interval of possible states instead of enumerating states' idea is the transferable one, and it reappears whenever a wildcard makes the state space branch.",
  approach:
    "Sweep left to right carrying two numbers: `low`, the fewest unmatched opens any legal reading could have, and `high`, the most. An '(' raises both. A ')' lowers both. A '*' lowers `low` (read it as ')') and raises `high` (read it as '('), and the empty reading is covered because the range spans it. If `high` ever goes negative there are more closes than any reading can match, so the answer is false immediately. Clamp `low` at zero — a reading that dipped below zero was already illegal and must not drag the range down. The string is valid when `low` returns to zero, meaning some reading closed everything it opened.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def check_valid_string(s: str) -> bool:
    low = 0
    high = 0
    for ch in s:
        if ch == "(":
            low += 1
            high += 1
        elif ch == ")":
            low -= 1
            high -= 1
        else:
            low -= 1
            high += 1
        if high < 0:
            return False
        if low < 0:
            low = 0
    return low == 0`,
  java: `public boolean checkValidString(String s) {
    int low = 0, high = 0;
    for (int i = 0; i < s.length(); i++) {
        char ch = s.charAt(i);
        if (ch == '(') {
            low++;
            high++;
        } else if (ch == ')') {
            low--;
            high--;
        } else {
            low--;
            high++;
        }
        if (high < 0) return false;
        if (low < 0) low = 0;
    }
    return low == 0;
}`,
  cpp: `bool checkValidString(const string& s) {
    int low = 0, high = 0;
    for (char ch : s) {
        if (ch == '(') {
            low++;
            high++;
        } else if (ch == ')') {
            low--;
            high--;
        } else {
            low--;
            high++;
        }
        if (high < 0) return false;
        if (low < 0) low = 0;
    }
    return low == 0;
}`,
  alternatives: [
    {
      name: "Try both meanings for every star",
      summary:
        "Recurse over the string; at each '*' branch three ways — open, close, or nothing — and report whether any branch balances.",
      complexity: { time: "O(3^n)", space: "O(n)" },
      python: `def walk(s: str, at: int, open_count: int) -> bool:
    if open_count < 0:
        return False
    if at == len(s):
        return open_count == 0
    if s[at] == "(":
        return walk(s, at + 1, open_count + 1)
    if s[at] == ")":
        return walk(s, at + 1, open_count - 1)
    return (
        walk(s, at + 1, open_count + 1)
        or walk(s, at + 1, open_count - 1)
        or walk(s, at + 1, open_count)
    )


def check_valid_string(s: str) -> bool:
    return walk(s, 0, 0)`,
      java: `public boolean walk(String s, int at, int openCount) {
    if (openCount < 0) return false;
    if (at == s.length()) return openCount == 0;
    char ch = s.charAt(at);
    if (ch == '(') return walk(s, at + 1, openCount + 1);
    if (ch == ')') return walk(s, at + 1, openCount - 1);
    return walk(s, at + 1, openCount + 1)
        || walk(s, at + 1, openCount - 1)
        || walk(s, at + 1, openCount);
}

public boolean checkValidString(String s) {
    return walk(s, 0, 0);
}`,
      cpp: `bool walk(const string& s, int at, int openCount) {
    if (openCount < 0) return false;
    if (at == (int)s.size()) return openCount == 0;
    char ch = s[at];
    if (ch == '(') return walk(s, at + 1, openCount + 1);
    if (ch == ')') return walk(s, at + 1, openCount - 1);
    return walk(s, at + 1, openCount + 1)
        || walk(s, at + 1, openCount - 1)
        || walk(s, at + 1, openCount);
}

bool checkValidString(const string& s) {
    return walk(s, 0, 0);
}`,
    },
  ],
}
