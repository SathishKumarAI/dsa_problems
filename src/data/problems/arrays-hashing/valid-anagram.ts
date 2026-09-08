import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "valid-anagram",
  title: "Same Letters, Different Order",
  pattern: "arrays-hashing",
  difficulty: "easy",
  leetcode: "valid-anagram",
  brief: "Is one string a rearrangement of the other?",
  statement:
    "Given two strings s and t, return true if t uses exactly the same letters as s, each the same number of times — that is, if t is a rearrangement of s.",
  constraints: [
    "1 <= s.length, t.length <= 5 * 10^4",
    "s and t consist of lowercase English letters",
    "different lengths can never be anagrams, which is a free early exit",
    "counts matter, not just membership: 'aab' and 'abb' use the same letters and are not anagrams",
  ],
  examples: [
    { input: 's = "anagram", t = "nagaram"', output: "true" },
    {
      input: 's = "rat", t = "car"',
      output: "false",
      note: "Same length, different letters.",
    },
  ],
  hints: [
    "Length is the cheapest test there is. Do it before anything else.",
    "An anagram is a claim about counts: every letter appears the same number of times in both strings.",
    "Count up while reading s, count down while reading t. If nothing is left over, they match.",
  ],
  whyNow:
    "Sorting proves the claim by rebuilding both strings in a canonical order, which is more work than the question needs. Counting answers it directly in one pass over each string, and the alphabet is fixed so the tally never grows with the input.",
  approach:
    "Reject different lengths immediately. Then keep one tally of 26 counters: add one for each letter of s, subtract one for each letter of t. If t is a rearrangement, every counter returns to zero. A non-zero counter names a letter one string has more of than the other, which is exactly the disagreement.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    counts = [0] * 26
    for i in range(len(s)):
        counts[ord(s[i]) - 97] += 1
        counts[ord(t[i]) - 97] -= 1
    return all(c == 0 for c in counts)`,
  java: `public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] counts = new int[26];
    for (int i = 0; i < s.length(); i++) {
        counts[s.charAt(i) - 'a']++;
        counts[t.charAt(i) - 'a']--;
    }
    for (int c : counts) {
        if (c != 0) return false;
    }
    return true;
}`,
  cpp: `bool isAnagram(const string& s, const string& t) {
    if (s.size() != t.size()) return false;
    vector<int> counts(26, 0);
    for (size_t i = 0; i < s.size(); i++) {
        counts[s[i] - 'a']++;
        counts[t[i] - 'a']--;
    }
    for (int c : counts) {
        if (c != 0) return false;
    }
    return true;
}`,
  walkthrough: [
    {
      cells: { values: ["a", "n", "a", "g", "r", "a", "m"] },
      caption:
        's = "anagram", t = "nagaram". Same length, so the counting can start.',
    },
    {
      cells: {
        values: ["a", "n", "a", "g", "r", "a", "m"],
        marks: { 0: "focus" },
      },
      caption: "Read s[0] = 'a' → +1 for a. Read t[0] = 'n' → −1 for n.",
    },
    {
      cells: {
        values: ["a", "n", "a", "g", "r", "a", "m"],
        marks: { 0: "done", 1: "focus" },
      },
      caption:
        "s[1] = 'n' → +1 for n, cancelling the −1. t[1] = 'a' → −1 for a.",
    },
    {
      cells: {
        values: ["a", "n", "a", "g", "r", "a", "m"],
        marks: { 0: "done", 1: "done", 2: "done", 3: "focus" },
      },
      caption:
        "The tally swings above and below zero as the two strings disagree about ORDER — that is fine.",
    },
    {
      cells: {
        values: ["a", "n", "a", "g", "r", "a", "m"],
        marks: {
          0: "done",
          1: "done",
          2: "done",
          3: "done",
          4: "done",
          5: "done",
          6: "done",
        },
      },
      caption:
        "Every counter is back to 0 → true. Order never mattered, counts did.",
    },
  ],
  alternatives: [
    {
      name: "Sort both",
      summary:
        "Sort the letters of each string and compare the results — two anagrams share exactly one sorted form.",
      complexity: { time: "O(n log n)", space: "O(n)" },
      python: `def is_anagram(s: str, t: str) -> bool:
    return sorted(s) == sorted(t)`,
      java: `public boolean isAnagram(String s, String t) {
    char[] a = s.toCharArray();
    char[] b = t.toCharArray();
    Arrays.sort(a);
    Arrays.sort(b);
    return Arrays.equals(a, b);
}`,
      cpp: `bool isAnagram(string s, string t) {
    sort(s.begin(), s.end());
    sort(t.begin(), t.end());
    return s == t;
}`,
    },
  ],
}
