import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "longest-unique-substring",
  title: "Longest Substring Without Repeats",
  pattern: "sliding-window",
  difficulty: "medium",
  leetcode: "longest-substring-without-repeating-characters",
  brief: "Longest run of characters with no duplicates.",
  statement:
    "Given a string s, return the length of the longest contiguous substring containing no repeated character.",
  constraints: [
    "0 <= s.length <= 5 * 10^4",
    "s holds letters, digits, symbols and spaces",
    "the answer is a contiguous substring, not a subsequence",
  ],
  examples: [
    {
      input: 's = "abcabcbb"',
      output: "3",
      note: '"abc" is the longest clean run.',
    },
    { input: 's = "bbbb"', output: "1" },
  ],
  hints: [
    "Keep a window that always satisfies the rule: no duplicates inside.",
    "Extend right one character at a time. When the new character breaks the rule, what must leave?",
    "Shrink from the left until the duplicate is gone. A set (or last-seen index map) tells you when you're clean.",
  ],
  whyNow:
    "The jump version needs a table of last positions before it can move at all. A window plus a set of what is inside it needs only the characters in play and one rule - grow right, shrink left on a repeat - which is why this is the one to remember.",
  approach:
    "Two indices bound a window; a set holds the characters inside it. Push the right edge forward one character per step. If the incoming character already sits in the set, pop characters from the left until it doesn't. The window is valid after every step, so tracking its maximum size answers the problem. Each character enters and leaves the window at most once — linear time.",
  complexity: { time: "O(n)", space: "O(min(n, alphabet))" },
  python: `def longest_unique(s: str) -> int:
    inside: set[str] = set()
    left = 0
    best = 0
    for right, ch in enumerate(s):
        while ch in inside:
            inside.remove(s[left])
            left += 1
        inside.add(ch)
        best = max(best, right - left + 1)
    return best`,
  java: `public int longestUnique(String s) {
    java.util.HashSet<Character> inside = new java.util.HashSet<>();
    int left = 0;
    int best = 0;
    for (int right = 0; right < s.length(); right++) {
        char ch = s.charAt(right);
        while (inside.contains(ch)) {
            inside.remove(s.charAt(left));
            left++;
        }
        inside.add(ch);
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
  cpp: `int longestUnique(const std::string& s) {
    std::unordered_set<char> inside;
    int left = 0;
    int best = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        char ch = s[right];
        while (inside.find(ch) != inside.end()) {
            inside.erase(s[left]);
            left++;
        }
        inside.insert(ch);
        best = std::max(best, right - left + 1);
    }
    return best;
}`,
  walkthrough: [
    {
      cells: {
        values: ["a", "b", "c", "a", "b"],
        marks: { 0: "window" },
        labels: { 0: "L·R" },
      },
      caption: '"abcab": window starts as just "a".',
    },
    {
      cells: {
        values: ["a", "b", "c", "a", "b"],
        marks: { 0: "window", 1: "window", 2: "window" },
        labels: { 0: "L", 2: "R" },
      },
      caption: 'Grow right: "abc" — all unique, best = 3.',
    },
    {
      cells: {
        values: ["a", "b", "c", "a", "b"],
        marks: { 0: "compare", 1: "window", 2: "window", 3: "compare" },
        labels: { 0: "L", 3: "R" },
      },
      caption: "Incoming 'a' already inside → rule broken.",
    },
    {
      cells: {
        values: ["a", "b", "c", "a", "b"],
        marks: { 1: "window", 2: "window", 3: "window" },
        labels: { 1: "L", 3: "R" },
      },
      caption: "Shrink left past the old 'a'. Window \"bca\" — clean again.",
    },
    {
      cells: {
        values: ["a", "b", "c", "a", "b"],
        marks: { 2: "window", 3: "window", 4: "window" },
        labels: { 2: "L", 4: "R" },
      },
      caption: "Incoming 'b' evicts the old 'b' the same way. Best stays 3.",
    },
    {
      cells: {
        values: ["a", "b", "c", "a", "b"],
        marks: { 0: "done", 1: "done", 2: "done" },
      },
      caption:
        "Answer 3. Each character enters and leaves the window once — O(n).",
    },
  ],
  alternatives: [
    {
      name: "Brute force",
      summary: "Test every substring for uniqueness with a set.",
      complexity: { time: "O(n³)", space: "O(n)" },
      python: `def longest_unique(s: str) -> int:
    best = 0
    for i in range(len(s)):
        for j in range(i, len(s)):
            window = s[i : j + 1]
            if len(set(window)) == len(window):
                best = max(best, len(window))
    return best`,
      java: `public int longestUnique(String s) {
    int best = 0;
    for (int i = 0; i < s.length(); i++) {
        for (int j = i; j < s.length(); j++) {
            String window = s.substring(i, j + 1);
            java.util.Set<Character> set = new java.util.HashSet<>();
            for (char c : window.toCharArray()) set.add(c);
            if (set.size() == window.length()) best = Math.max(best, window.length());
        }
    }
    return best;
}`,
      cpp: `int longestUnique(const std::string& s) {
    int best = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        for (int j = i; j < (int)s.size(); j++) {
            std::string window = s.substr(i, j - i + 1);
            std::unordered_set<char> set;
            for (char c : window) set.insert(c);
            if ((int)set.size() == (int)window.length()) best = std::max(best, (int)window.length());
        }
    }
    return best;
}`,
    },
    {
      name: "Last-seen jump",
      whyNow:
        "Testing every substring re-reads characters it has already checked. Remembering where each character last appeared lets the left edge jump straight past a repeat instead of rediscovering it.",
      summary:
        "Refinement of the window: remember each character's last index and jump the left edge straight past a duplicate instead of shrinking one step at a time. Same O(n), fewer operations per character.",
      complexity: { time: "O(n)", space: "O(min(n, alphabet))" },
      python: `def longest_unique(s: str) -> int:
    last: dict[str, int] = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best`,
      java: `public int longestUnique(String s) {
    Map<Character, Integer> last = new HashMap<>();
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        char ch = s.charAt(right);
        if (last.containsKey(ch) && last.get(ch) >= left) {
            left = last.get(ch) + 1;
        }
        last.put(ch, right);
        best = Math.max(best, right - left + 1);
    }
    return best;
}
`,
      cpp: `int longestUnique(const string& s) {
    unordered_map<char, int> last;
    int left = 0, best = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        char ch = s[right];
        auto it = last.find(ch);
        if (it != last.end() && it->second >= left) {
            left = it->second + 1;
        }
        last[ch] = right;
        best = max(best, right - left + 1);
    }
    return best;
}
`,
    },
  ],
}
