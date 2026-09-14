// permutation-in-string — the ladder: every way in, worst first.
//
// Each rung carries the weakness in the one below it. The KEYS on
// `alternatives` are load-bearing where a journey exists: `lib/ladder.ts`
// merges an alternative with the act that shares its key, and `from:` in the
// journey must then name that key rather than an array index.
//
// Two arcs, and they are not duplicates. The one here is the short paragraph
// the PROBLEM page renders under the ladder; `arc.ts` holds the long one the
// teaching document ends on. Changing either does not oblige the other.

import type { Solution } from "../../data/types.ts"

export const approach = "Both windows have the same fixed width, so slide a window of s1's length across s2: add the entering letter, drop the leaving one. Rather than compare 26 counts each time, keep a running count of how many letters are in agreement, and adjust it only for the two letters that changed — a letter can cross into or out of agreement exactly once per move. When all 26 agree, the window is a rearrangement."

export const whyNow = "Comparing the whole tally at every position is 26 comparisons per step, which is a constant but a real one — and it re-reads counts that did not change. Carrying a single number, how many letters currently agree, means each step touches only the two letters that moved and answers in constant work."

export const arc = "A fixed-width window, which is the easiest kind: enter one character, leave one character, test. The ladder then argues only about the test — sorting each window, comparing 26 counts, or keeping a running count of how many letters currently match so the test is one integer comparison. Take the general habit: when a check is repeated over sliding data, look for a summary that can be updated incrementally instead of recomputed. And note the difference from find-all-anagrams, which is the same machinery returning every index instead of stopping at the first hit; if you can write one, you can write the other by changing the return."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def check_inclusion(s1: str, s2: str) -> bool:
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
    return agree == 26`

export const java = `public boolean checkInclusion(String s1, String s2) {
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
}`

export const cpp = `bool checkInclusion(const string& s1, const string& s2) {
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
}`

export const alternatives: Solution[] = [
  {
    name: "Sort every window",
    summary:
      "Slide a window of s1's length across s2, sort its letters, and compare against sorted s1. It leans on the cleanest definition of an anagram, same letters in any order, and pays k log k at every one of the n positions, re-sorting a window that differs from the previous one by exactly two letters.",
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
      "Keep a running letter tally and edit it as the window slides, then compare the whole 26-slot tally against s1's after every move. The counting is now constant per move, but the comparison is not: all 26 slots are re-checked each step even though only two of them could possibly have changed.",
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
]
