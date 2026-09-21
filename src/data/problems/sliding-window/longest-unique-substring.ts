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
  // THE FIVE FIELDS (docs/PROBLEM-PAGE-PLAYBOOK.md).
  unlocks: [
    {
      constraint: "0 <= s.length <= 5 * 10^4",
      what: "Note the ZERO: the empty string is legal input and its answer is 0, which the cubic rung gets right by accident and a hand-rolled window can get wrong by starting its bookkeeping at 1. At the other end, 5\u00b710\u2074 characters makes the cubic rung about 10^14 operations \u2014 not slow, impossible \u2014 so this bound is what forces a window rather than a search.",
      figure: {
        kind: "quantities",
        unit: "ops",
        items: [
          {
            label: "every substring, checked for repeats",
            value: 1e14,
            tone: "bad",
          },
          { label: "one window pass", value: 5e4, tone: "good" },
        ],
      },
    },
    {
      constraint: "s holds letters, digits, symbols and spaces",
      what: "The alphabet is NOT 26 here, which is why this page\u2019s space bound is O(min(n, alphabet)) rather than O(1): the set inside the window can hold as many distinct characters as the input has. It also means a fixed 26-slot array is the wrong container \u2014 the one case where copying the tally trick from the anagram problems silently indexes out of range.",
    },
    {
      constraint: "the answer is a contiguous substring, not a subsequence",
      what: "The word that decides the whole approach. Contiguous is what makes a WINDOW meaningful: the candidate is always one span, so it can be maintained by moving two edges. For a subsequence the same question is a different problem entirely, and no window applies.",
      figure: {
        kind: "cells",
        values: ["a", "b", "c", "a", "b", "b"],
        caption:
          "the answer is 3, from the substring abc. The subsequence abc\u2026 could be longer, and is not what is being asked.",
      },
    },
  ],
  checks: [
    {
      ask: 's = "abcabcbb". What is the answer?',
      options: ["8", "3", "4", "2"],
      answer: 1,
      because:
        "The longest span with no repeated character is abc, which is 3. Doing this one by hand is what makes the window\u2019s job concrete: it is looking for the longest span it can hold before a repeat forces the left edge forward.",
    },
    {
      ask: "The window\u2019s right edge reads a character already inside the window. What has to happen?",
      options: [
        "The window resets to empty",
        "The left edge moves forward far enough to exclude the earlier copy",
        "The right edge stops",
        "The character is skipped",
      ],
      answer: 1,
      because:
        "The window must hold only distinct characters, so the earlier copy has to leave. Resetting to empty would be correct but would re-read characters and lose the linear bound \u2014 the left edge only ever moves forward.",
    },
    {
      ask: "Why can the left edge never be allowed to move BACKWARDS?",
      options: [
        "Because the answer would be too small",
        "Because a stale last-seen index from before the current window would drag it back, re-admitting a repeat and breaking the one-pass bound",
        "Because the string is immutable",
        "It can \u2014 moving it back is how the window shrinks",
      ],
      answer: 1,
      because:
        "This is the guard every last-seen window needs: the jump is a MAXIMUM against the current left edge. Without it a character last seen long before the window still moves the edge, and the window stops meaning what the code assumes it means.",
    },
  ],
  reading: [
    {
      title: "Longest Substring Without Duplicates \u2014 NeetCode",
      href: "https://neetcode.io/problems/longest-substring-without-duplicates",
      kind: "course",
      note: "Both window rungs on video \u2014 the set-and-shrink one and the last-seen jump \u2014 with the difference between them made explicit.",
    },
    {
      title:
        "Longest substring without repeating characters \u2014 GeeksforGeeks",
      href: "https://www.geeksforgeeks.org/dsa/length-of-the-longest-substring-without-repeating-characters/",
      kind: "reference",
      note: "The same ladder in four languages, and a clear write-up of why the left edge jump needs the maximum guard.",
    },
  ],
  costWhy:
    "O(n) time: the right edge advances exactly once per character, and the left edge only ever moves forward, so across the whole run the two edges make at most 2n moves between them \u2014 the inner while loop is not a nested loop for this reason, which is the single most misread thing about window bounds. Each step does a constant amount of work: one set lookup, one insertion, one removal. The space is the set, which holds the characters currently inside the window: at most the size of the window, and at most the size of the alphabet, which is why the bound is O(min(n, alphabet)) rather than O(1) \u2014 this input is not restricted to 26 letters.",
  arc: "Every rung is a different answer to 'where should the window's left edge go when a repeat appears?' Recomputing from scratch is cubic; a set with a shrinking left edge is linear but steps the edge one at a time; remembering each character's LAST INDEX lets the edge jump straight past the previous occurrence. The jump is what makes it one pass with no inner loop. The detail that bites is that the left edge must never move backwards — a stale last-index from before the current window would drag it back — so the jump is always a maximum against the current edge. That guard is the same one every 'last seen' window needs, and it is the first thing to check when a window solution fails on repeats.",
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
    HashSet<Character> inside = new HashSet<>();
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
  cpp: `int longestUnique(const string& s) {
    unordered_set<char> inside;
    int left = 0;
    int best = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        char ch = s[right];
        while (inside.find(ch) != inside.end()) {
            inside.erase(s[left]);
            left++;
        }
        inside.insert(ch);
        best = max(best, right - left + 1);
    }
    return best;
}`,
  alternatives: [
    {
      name: "Brute force",
      costWhy:
        "O(n\u00b3) time and O(n) space. There are about n\u00b2/2 substrings, and checking one for repeats is a pass over it \u2014 O(n) \u2014 so the total is cubic: roughly 10^14 operations at the 5\u00b710\u2074 ceiling, which is not slow but impossible. It is worth writing once because it is the definition of the answer, and everything faster is an argument about which of these substrings can be skipped.",
      summary:
        "Take every start, extend to every end, and rebuild a set from scratch to test that stretch for repeats. Three nested costs — n starts, n ends, and up to n characters re-examined per pair — which is cubic on a 5*10^4 string. The waste is that the set is thrown away and rebuilt for a substring overlapping the last one almost entirely.",
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
            Set<Character> set = new HashSet<>();
            for (char c : window.toCharArray()) set.add(c);
            if (set.size() == window.length()) best = Math.max(best, window.length());
        }
    }
    return best;
}`,
      cpp: `int longestUnique(const string& s) {
    int best = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        for (int j = i; j < (int)s.size(); j++) {
            string window = s.substr(i, j - i + 1);
            unordered_set<char> set;
            for (char c : window) set.insert(c);
            if ((int)set.size() == (int)window.length()) best = max(best, (int)window.length());
        }
    }
    return best;
}`,
    },
    {
      name: "Last-seen jump",
      costWhy:
        "O(n) time and O(min(n, alphabet)) space, and it is the same bound as the set-and-shrink window above it \u2014 which is exactly the point of keeping both. Instead of stepping the left edge one character at a time until the repeat leaves, it jumps straight past the previous occurrence, so the left edge makes at most n moves rather than up to n per shrink. Same class, fewer operations, and it replaces a while loop with a single maximum \u2014 the guard that keeps the edge from moving backwards.",
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
