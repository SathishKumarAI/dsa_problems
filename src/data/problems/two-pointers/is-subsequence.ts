import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "is-subsequence",
  title: "Is One String Hidden in the Other?",
  pattern: "two-pointers",
  difficulty: "easy",
  leetcode: "is-subsequence",
  brief: "Do s's characters appear in t, in order?",
  statement:
    "Given strings s and t, return true if s is a subsequence of t — that is, if s can be formed by deleting some characters from t without reordering the rest.",
  constraints: [
    "0 <= s.length <= 100, and 0 <= t.length <= 10^4",
    "both consist of lowercase English letters",
    "order must be preserved, but the characters need not be adjacent",
    "the empty string is a subsequence of anything, including of the empty string",
  ],
  examples: [
    { input: 's = "abc", t = "ahbgdc"', output: "true" },
    {
      input: 's = "axc", t = "ahbgdc"',
      output: "false",
      note: "The x is never available.",
    },
  ],
  hints: [
    "One pointer per string. Advance through t always; advance through s only when the characters match.",
    "Never go back: a match taken as early as possible is always at least as good as a later one.",
    "s is a subsequence exactly when its pointer reaches the end.",
  ],
  whyNow:
    "Searching for each character of s from the start of t re-walks ground already covered, and a long t makes that quadratic. Carrying the position in t means each of its characters is examined once — and taking the earliest match is safe, because an earlier match leaves strictly more of t available for what follows.",
  approach:
    "Walk t with one pointer and s with another. Every time the characters agree, the s pointer advances; otherwise only the t pointer does. Taking a match at the first opportunity is never worse than waiting for a later one, since it leaves the longest possible remainder of t — that greedy step is what makes a single pass correct. If the s pointer reaches the end, every character was placed in order.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def is_subsequence(s: str, t: str) -> bool:
    i = 0
    for ch in t:
        if i < len(s) and s[i] == ch:
            i += 1
    return i == len(s)`,
  java: `public boolean isSubsequence(String s, String t) {
    int i = 0;
    for (int j = 0; j < t.length(); j++) {
        if (i < s.length() && s.charAt(i) == t.charAt(j)) i++;
    }
    return i == s.length();
}`,
  cpp: `bool isSubsequence(const string& s, const string& t) {
    size_t i = 0;
    for (char ch : t) {
        if (i < s.size() && s[i] == ch) i++;
    }
    return i == s.size();
}`,
  alternatives: [
    {
      name: "Search for each character in turn",
      summary:
        "For each character of s, scan t from the position after the previous match, restarting the scan from the beginning each time.",
      complexity: { time: "O(n · m)", space: "O(1)" },
      python: `def is_subsequence(s: str, t: str) -> bool:
    at = 0
    for ch in s:
        found = -1
        for j in range(at, len(t)):
            if t[j] == ch:
                found = j
                break
        if found < 0:
            return False
        at = found + 1
    return True`,
      java: `public boolean isSubsequence(String s, String t) {
    int at = 0;
    for (int k = 0; k < s.length(); k++) {
        char ch = s.charAt(k);
        int found = -1;
        for (int j = at; j < t.length(); j++) {
            if (t.charAt(j) == ch) {
                found = j;
                break;
            }
        }
        if (found < 0) return false;
        at = found + 1;
    }
    return true;
}`,
      cpp: `bool isSubsequence(const string& s, const string& t) {
    int at = 0;
    for (char ch : s) {
        int found = -1;
        for (int j = at; j < (int)t.size(); j++) {
            if (t[j] == ch) {
                found = j;
                break;
            }
        }
        if (found < 0) return false;
        at = found + 1;
    }
    return true;
}`,
    },
  ],
}
