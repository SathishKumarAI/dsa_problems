import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "longest-common-subsequence",
  title: "Longest Shared Subsequence",
  pattern: "dp",
  difficulty: "medium",
  leetcode: "longest-common-subsequence",
  brief: "Longest sequence of characters both strings contain, in order.",
  statement:
    "Given two strings, return the length of the longest subsequence present in both — characters that appear in the same relative order in each string, though not necessarily next to each other.",
  constraints: [
    "1 <= a.length, b.length <= 1000",
    "both strings are lowercase English letters",
    "a SUBSEQUENCE keeps order but allows gaps, unlike a substring",
    "no shared characters at all means a length of 0, which is an answer and not a failure",
  ],
  examples: [
    {
      input: 'a = "abcde", b = "ace"',
      output: "3",
      note: '"ace" — the b and d are skipped in a.',
    },
    {
      input: 'a = "abc", b = "def"',
      output: "0",
      note: "Nothing in common.",
    },
  ],
  hints: [
    "Compare the two strings from the ends. If the last characters match, that character is in some longest answer — take it and shrink both.",
    "If they do not match, at least one of the two last characters is unused. Try dropping each, and keep the better result.",
    "Those two rules ARE the recurrence. The table just stops you from computing the same pair of prefixes twice.",
  ],
  whyNow:
    "The recursion branches twice on every mismatch, so it re-solves the same pair of prefixes along many different paths — exponential work for a quadratic number of distinct questions. A table asks each question once. Filling it row by row also makes the dependency visible: every cell needs only the row above and the cell to its left.",
  arc:
    "Two rungs, one collapse: the recursion branches twice on every mismatch and so reaches the same pair of prefixes along many different routes, spending exponential work on a merely quadratic number of distinct questions. Indexing by how much of each string is left asks each question once. The recurrence is worth stating without looking — equal characters at the ends contribute one to the answer for the two shorter prefixes; unequal characters mean at least one of those ends goes unused, so take the better of dropping either. The zero row and zero column are not a base case bolted on, they are the claim that an empty string shares nothing, and they are what makes the table self-starting. Know this grid cold: edit distance, shortest common supersequence and the diff behind every version control tool are the same cells with a different rule. And since a cell reads only the row above and its left neighbour, the usual last step applies — two rows are enough.",
  approach:
    "Let best[i][j] be the answer for the first i characters of a and the first j of b. If a[i-1] equals b[j-1] the pair contributes one to the answer for the smaller prefixes, so best[i][j] = best[i-1][j-1] + 1. Otherwise the last character of one string is unused, so best[i][j] is the better of dropping a's or dropping b's. Row 0 and column 0 are zero — an empty string shares nothing — which is what makes the table self-starting rather than needing a base case per pair.",
  complexity: { time: "O(n · m)", space: "O(n · m)" },
  python: `def longest_common_subsequence(a: str, b: str) -> int:
    n, m = len(a), len(b)
    best = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                best[i][j] = best[i - 1][j - 1] + 1
            else:
                best[i][j] = max(best[i - 1][j], best[i][j - 1])
    return best[n][m]`,
  java: `public int longestCommonSubsequence(String a, String b) {
    int n = a.length(), m = b.length();
    int[][] best = new int[n + 1][m + 1];
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) {
                best[i][j] = best[i - 1][j - 1] + 1;
            } else {
                best[i][j] = Math.max(best[i - 1][j], best[i][j - 1]);
            }
        }
    }
    return best[n][m];
}`,
  cpp: `int longestCommonSubsequence(const string& a, const string& b) {
    int n = (int)a.size(), m = (int)b.size();
    vector<vector<int>> best(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1]) {
                best[i][j] = best[i - 1][j - 1] + 1;
            } else {
                best[i][j] = max(best[i - 1][j], best[i][j - 1]);
            }
        }
    }
    return best[n][m];
}`,
  alternatives: [
    {
      name: "Branch on every mismatch",
      summary:
        "Recurse from the ends of both strings: on a match take the character and shrink both, otherwise try dropping each end in turn and keep the better answer.",
      complexity: { time: "O(2^(n+m))", space: "O(n + m)" },
      python: `def walk(a: str, b: str, i: int, j: int) -> int:
    if i == 0 or j == 0:
        return 0
    if a[i - 1] == b[j - 1]:
        return walk(a, b, i - 1, j - 1) + 1
    return max(walk(a, b, i - 1, j), walk(a, b, i, j - 1))


def longest_common_subsequence(a: str, b: str) -> int:
    return walk(a, b, len(a), len(b))`,
      java: `public int walk(String a, String b, int i, int j) {
    if (i == 0 || j == 0) return 0;
    if (a.charAt(i - 1) == b.charAt(j - 1)) return walk(a, b, i - 1, j - 1) + 1;
    return Math.max(walk(a, b, i - 1, j), walk(a, b, i, j - 1));
}

public int longestCommonSubsequence(String a, String b) {
    return walk(a, b, a.length(), b.length());
}`,
      cpp: `int walk(const string& a, const string& b, int i, int j) {
    if (i == 0 || j == 0) return 0;
    if (a[i - 1] == b[j - 1]) return walk(a, b, i - 1, j - 1) + 1;
    return max(walk(a, b, i - 1, j), walk(a, b, i, j - 1));
}

int longestCommonSubsequence(const string& a, const string& b) {
    return walk(a, b, (int)a.size(), (int)b.size());
}`,
    },
  ],
}
