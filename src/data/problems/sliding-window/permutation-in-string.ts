import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "permutation-in-string",
  title: "Does One String Hide the Other's Letters?",
  pattern: "sliding-window",
  difficulty: "medium",
  leetcode: "permutation-in-string",
  brief: "Is some rearrangement of s1 a substring of s2?",
  statement:
    "Given two lowercase strings s1 and s2, return true if s2 contains a contiguous substring that is a rearrangement of s1.",
  constraints: [
    "1 <= s1.length, s2.length <= 10^4",
    "both strings are lowercase English letters",
    "the match must be CONTIGUOUS — scattered letters in the right numbers do not count",
    "if s1 is longer than s2 no window can exist, which is a free early exit",
  ],
  examples: [
    {
      input: 's1 = "ab", s2 = "eidbaooo"',
      output: "true",
      note: '"ba" sits at index 3.',
    },
    {
      input: 's1 = "ab", s2 = "eidboaoo"',
      output: "false",
      note: "The a and b are there, but never adjacent.",
    },
  ],
  hints: [
    "A rearrangement of s1 has exactly s1's length. So the window you are looking for has a length you already know.",
    "A fixed-width window means one letter enters and one leaves on every step — you never have to recount the middle.",
    "Track how many of the 26 counts currently match. Only the two letters that changed can flip a match on or off.",
  ],
  whyNow:
    "Comparing the whole tally at every position is 26 comparisons per step, which is a constant but a real one — and it re-reads counts that did not change. Carrying a single number, how many letters currently agree, means each step touches only the two letters that moved and answers in constant work.",
  approach:
    "Both windows have the same fixed width, so slide a window of s1's length across s2: add the entering letter, drop the leaving one. Rather than compare 26 counts each time, keep a running count of how many letters are in agreement, and adjust it only for the two letters that changed — a letter can cross into or out of agreement exactly once per move. When all 26 agree, the window is a rearrangement.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def check_inclusion(s1: str, s2: str) -> bool:
    if len(s1) > len(s2):
        return False
    need = [0] * 26
    have = [0] * 26
    for i in range(len(s1)):
        need[ord(s1[i]) - 97] += 1
        have[ord(s2[i]) - 97] += 1
    agree = sum(1 for i in range(26) if need[i] == have[i])
    for right in range(len(s1), len(s2)):
        if agree == 26:
            return True
        enter = ord(s2[right]) - 97
        have[enter] += 1
        if have[enter] == need[enter]:
            agree += 1
        elif have[enter] == need[enter] + 1:
            agree -= 1
        leave = ord(s2[right - len(s1)]) - 97
        have[leave] -= 1
        if have[leave] == need[leave]:
            agree += 1
        elif have[leave] == need[leave] - 1:
            agree -= 1
    return agree == 26`,
  java: `public boolean checkInclusion(String s1, String s2) {
    if (s1.length() > s2.length()) return false;
    int[] need = new int[26];
    int[] have = new int[26];
    for (int i = 0; i < s1.length(); i++) {
        need[s1.charAt(i) - 'a']++;
        have[s2.charAt(i) - 'a']++;
    }
    int agree = 0;
    for (int i = 0; i < 26; i++) {
        if (need[i] == have[i]) agree++;
    }
    for (int right = s1.length(); right < s2.length(); right++) {
        if (agree == 26) return true;
        int enter = s2.charAt(right) - 'a';
        have[enter]++;
        if (have[enter] == need[enter]) agree++;
        else if (have[enter] == need[enter] + 1) agree--;
        int leave = s2.charAt(right - s1.length()) - 'a';
        have[leave]--;
        if (have[leave] == need[leave]) agree++;
        else if (have[leave] == need[leave] - 1) agree--;
    }
    return agree == 26;
}`,
  cpp: `bool checkInclusion(const string& s1, const string& s2) {
    if (s1.size() > s2.size()) return false;
    vector<int> need(26, 0), have(26, 0);
    for (size_t i = 0; i < s1.size(); i++) {
        need[s1[i] - 'a']++;
        have[s2[i] - 'a']++;
    }
    int agree = 0;
    for (int i = 0; i < 26; i++) {
        if (need[i] == have[i]) agree++;
    }
    for (size_t right = s1.size(); right < s2.size(); right++) {
        if (agree == 26) return true;
        int enter = s2[right] - 'a';
        have[enter]++;
        if (have[enter] == need[enter]) agree++;
        else if (have[enter] == need[enter] + 1) agree--;
        int leave = s2[right - s1.size()] - 'a';
        have[leave]--;
        if (have[leave] == need[leave]) agree++;
        else if (have[leave] == need[leave] - 1) agree--;
    }
    return agree == 26;
}`,
  walkthrough: [
    {
      cells: { values: ["e", "i", "d", "b", "a", "o", "o", "o"] },
      caption:
        's1 = "ab", so the window is exactly 2 wide. It never changes size.',
    },
    {
      cells: {
        values: ["e", "i", "d", "b", "a", "o", "o", "o"],
        marks: { 0: "window", 1: "window" },
      },
      caption: '"ei" — neither letter is needed. Not all 26 counts agree.',
    },
    {
      cells: {
        values: ["e", "i", "d", "b", "a", "o", "o", "o"],
        marks: { 1: "window", 2: "window" },
      },
      caption:
        '"id": d entered, e left. Only those two counts were touched — the other 24 were not re-read.',
    },
    {
      cells: {
        values: ["e", "i", "d", "b", "a", "o", "o", "o"],
        marks: { 2: "window", 3: "window" },
      },
      caption: '"db": b now matches its needed count, so agreement rises.',
    },
    {
      cells: {
        values: ["e", "i", "d", "b", "a", "o", "o", "o"],
        marks: { 3: "focus", 4: "focus" },
        labels: { 3: "L", 4: "R" },
      },
      caption:
        '"ba": a enters and d leaves; now all 26 counts agree → true. Contiguous, which is the whole point.',
    },
    {
      cells: {
        values: ["e", "i", "d", "b", "a", "o", "o", "o"],
        marks: { 3: "done", 4: "done" },
      },
      caption:
        'Compare with "eidboaoo": the same letters exist but never sit side by side, so no window ever agrees.',
    },
  ],
  alternatives: [
    {
      name: "Sort every window",
      summary:
        "Take each substring of s1's length, sort its letters, and compare against the sorted s1.",
      complexity: { time: "O(n · k log k)", space: "O(k)" },
      python: `def check_inclusion(s1: str, s2: str) -> bool:
    target = sorted(s1)
    k = len(s1)
    for start in range(len(s2) - k + 1):
        if sorted(s2[start : start + k]) == target:
            return True
    return False`,
      java: `public boolean checkInclusion(String s1, String s2) {
    char[] target = s1.toCharArray();
    Arrays.sort(target);
    int k = s1.length();
    for (int start = 0; start + k <= s2.length(); start++) {
        char[] window = s2.substring(start, start + k).toCharArray();
        Arrays.sort(window);
        if (Arrays.equals(window, target)) return true;
    }
    return false;
}`,
      cpp: `bool checkInclusion(const string& s1, const string& s2) {
    string target = s1;
    sort(target.begin(), target.end());
    int k = (int)s1.size();
    for (int start = 0; start + k <= (int)s2.size(); start++) {
        string window = s2.substr(start, k);
        sort(window.begin(), window.end());
        if (window == target) return true;
    }
    return false;
}`,
    },
    {
      name: "Compare all 26 counts each step",
      summary:
        "Slide a fixed-width window keeping a letter tally, and after every move compare the whole 26-slot tally against s1's.",
      whyNow:
        "Sorting rebuilds the window from scratch at every position, when only one letter entered and one left. Carrying the tally makes each move constant work — the comparison is still 26 slots, but the counting is no longer redone.",
      complexity: { time: "O(26 · n)", space: "O(1)" },
      python: `def check_inclusion(s1: str, s2: str) -> bool:
    if len(s1) > len(s2):
        return False
    need = [0] * 26
    have = [0] * 26
    for ch in s1:
        need[ord(ch) - 97] += 1
    for i, ch in enumerate(s2):
        have[ord(ch) - 97] += 1
        if i >= len(s1):
            have[ord(s2[i - len(s1)]) - 97] -= 1
        if have == need:
            return True
    return False`,
      java: `public boolean checkInclusion(String s1, String s2) {
    if (s1.length() > s2.length()) return false;
    int[] need = new int[26];
    int[] have = new int[26];
    for (int i = 0; i < s1.length(); i++) need[s1.charAt(i) - 'a']++;
    for (int i = 0; i < s2.length(); i++) {
        have[s2.charAt(i) - 'a']++;
        if (i >= s1.length()) have[s2.charAt(i - s1.length()) - 'a']--;
        if (Arrays.equals(have, need)) return true;
    }
    return false;
}`,
      cpp: `bool checkInclusion(const string& s1, const string& s2) {
    if (s1.size() > s2.size()) return false;
    vector<int> need(26, 0), have(26, 0);
    for (char ch : s1) need[ch - 'a']++;
    for (size_t i = 0; i < s2.size(); i++) {
        have[s2[i] - 'a']++;
        if (i >= s1.size()) have[s2[i - s1.size()] - 'a']--;
        if (have == need) return true;
    }
    return false;
}`,
    },
  ],
}
