import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "char-replacement",
  title: "Longest Run After k Rewrites",
  pattern: "sliding-window",
  difficulty: "medium",
  leetcode: "longest-repeating-character-replacement",
  brief: "Longest single-letter run you can buy with k changes.",
  statement:
    "Given a string of uppercase letters and an integer k, you may change up to k characters to any other uppercase letter. Return the length of the longest run of one repeated letter you can produce.",
  constraints: [
    "1 <= s.length <= 10^5",
    "s consists of uppercase English letters",
    "0 <= k <= s.length",
    "k = 0 means no rewrites at all, so the answer is the longest run already present",
  ],
  examples: [
    {
      input: 's = "AABABBA", k = 1',
      output: "4",
      note: 'Rewrite the single B in "AABA" to get "AAAA".',
    },
    {
      input: 's = "ABBB", k = 2',
      output: "4",
      note: "Two rewrites turn the whole string into one letter.",
    },
  ],
  hints: [
    "A window is valid when the characters you would have to rewrite fit inside the budget.",
    "How many rewrites does a window need? Its length, minus the count of whatever letter is most common inside it.",
    "Grow the right edge always; move the left edge only when the window has become invalid.",
  ],
  whyNow:
    "Checking every substring re-counts letters it has already counted. A window carries those counts forward, so each character is added once and removed at most once — and the most-common count only ever needs to grow, because a smaller one could never have produced a longer answer.",
  approach:
    "Slide a window over the string keeping a tally of the letters inside it and the highest count that tally has ever reached. The window needs (length − highest count) rewrites; while that exceeds k, drop the leftmost character and shrink. Because the answer only cares about the largest window ever seen, the highest count never has to be recomputed downward — a window that shrinks can never beat the record that set it.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def character_replacement(s: str, k: int) -> int:
    counts = [0] * 26
    best = 0
    most = 0
    left = 0
    for right in range(len(s)):
        counts[ord(s[right]) - 65] += 1
        most = max(most, counts[ord(s[right]) - 65])
        while (right - left + 1) - most > k:
            counts[ord(s[left]) - 65] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
  java: `public int characterReplacement(String s, int k) {
    int[] counts = new int[26];
    int best = 0, most = 0, left = 0;
    for (int right = 0; right < s.length(); right++) {
        counts[s.charAt(right) - 'A']++;
        most = Math.max(most, counts[s.charAt(right) - 'A']);
        while ((right - left + 1) - most > k) {
            counts[s.charAt(left) - 'A']--;
            left++;
        }
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
  cpp: `int characterReplacement(const string& s, int k) {
    vector<int> counts(26, 0);
    int best = 0, most = 0, left = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        counts[s[right] - 'A']++;
        most = max(most, counts[s[right] - 'A']);
        while ((right - left + 1) - most > k) {
            counts[s[left] - 'A']--;
            left++;
        }
        best = max(best, right - left + 1);
    }
    return best;
}`,
  alternatives: [
    {
      name: "Every substring",
      summary:
        "Take each start and each end, count the letters in that substring, and check whether the rewrites it needs fit the budget.",
      complexity: { time: "O(n² · 26)", space: "O(1)" },
      python: `def character_replacement(s: str, k: int) -> int:
    best = 0
    for i in range(len(s)):
        counts = [0] * 26
        for j in range(i, len(s)):
            counts[ord(s[j]) - 65] += 1
            if (j - i + 1) - max(counts) <= k:
                best = max(best, j - i + 1)
    return best`,
      java: `public int characterReplacement(String s, int k) {
    int best = 0;
    for (int i = 0; i < s.length(); i++) {
        int[] counts = new int[26];
        for (int j = i; j < s.length(); j++) {
            counts[s.charAt(j) - 'A']++;
            int most = 0;
            for (int c : counts) most = Math.max(most, c);
            if ((j - i + 1) - most <= k) best = Math.max(best, j - i + 1);
        }
    }
    return best;
}`,
      cpp: `int characterReplacement(const string& s, int k) {
    int best = 0;
    int n = (int)s.size();
    for (int i = 0; i < n; i++) {
        vector<int> counts(26, 0);
        for (int j = i; j < n; j++) {
            counts[s[j] - 'A']++;
            int most = 0;
            for (int c : counts) most = max(most, c);
            if ((j - i + 1) - most <= k) best = max(best, j - i + 1);
        }
    }
    return best;
}`,
    },
  ],
}
