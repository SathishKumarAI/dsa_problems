import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "anagram-positions",
  title: "Where Every Anagram Hides",
  pattern: "sliding-window",
  difficulty: "medium",
  leetcode: "find-all-anagrams-in-a-string",
  brief:
    "List every start index where a window of the text is an anagram of the pattern.",
  statement:
    "Given a text and a pattern, return the start index of every substring of the text that is an anagram of the pattern — the same letters in any order.",
  constraints: [
    "1 <= text length, pattern length <= 3 · 10^4, lowercase letters only",
    "the windows all have the same length as the pattern, so there are at most (text length − pattern length + 1) of them",
    "an anagram is about COUNTS, not order, so two windows differing only in arrangement are both answers",
    "windows overlap — consecutive answers are normal, and 'aaaa' with pattern 'aa' answers three times",
    "when the pattern is longer than the text there are no windows at all, and the answer is empty",
  ],
  examples: [
    {
      input: 'text = "cbaebabacd", pattern = "abc"',
      output: "[0, 6]",
      note: '"cba" at 0 and "bac" at 6.',
    },
    {
      input: 'text = "abab", pattern = "ab"',
      output: "[0, 1, 2]",
      note: "Overlapping windows all count.",
    },
    {
      input: 'text = "aa", pattern = "aaa"',
      output: "[]",
      note: "No window is long enough to hold the pattern.",
    },
  ],
  hints: [
    "Every candidate has exactly the pattern's length, so this is a fixed-size window sliding along the text.",
    "Comparing two letter counts decides one window. The question is how to get the next window's counts without recounting.",
    "Sliding by one adds one letter and removes one letter — two updates. And a full 26-way comparison per step can be replaced by a single counter of how many letters currently match.",
  ],
  whyNow:
    "Comparing the two count tables at every step is a fixed 26 comparisons, which is cheap but still repeats work the update already knew about: a slide changes exactly two letters, so at most two of the 26 verdicts can change. Carrying a count of how many letters currently match turns each step into two increments and a single equality test — the answer is 'match count is 26', and the alphabet never gets walked again.",
  arc: "Anagram means multiset, and multiset means counts — once that substitution is made, every rung is an argument about how much of the counting to redo. Sorting each window redoes all of it; recounting each window redoes k characters; sliding the tally redoes two; and tracking how many letters AGREE redoes nothing at all, because only a letter whose count changed can change its verdict. That last step is the one worth stealing: keep a summary of the comparison rather than recomputing the comparison, and update the summary exactly where the data changed. It is the same move that turns the minimum-window-substring check from 26 comparisons into one integer, and knowing the fixed-width window shape — enter one, leave one, test — covers a whole family of string problems.",
  approach:
    "Count the pattern's letters, then run a window of that width over the text keeping a live count for the window and a counter of how many of the 26 letters agree with the pattern. Sliding adds the incoming letter and removes the outgoing one, adjusting the agreement counter only for those two letters — a letter's verdict can flip only when its own count changes. A window is an anagram exactly when all 26 letters agree.",
  complexity: { time: "O(n)", space: "O(1)" },
  python: `def anagram_positions(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    if k > len(text):
        return []
    want = [0] * 26
    have = [0] * 26
    for ch in pattern:
        want[ord(ch) - 97] += 1
    agree = sum(1 for i in range(26) if want[i] == have[i])
    out: list[int] = []

    def touch(letter: int, delta: int) -> None:
        nonlocal agree
        if have[letter] == want[letter]:
            agree -= 1          # it agreed before the change, so it may not after
        have[letter] += delta
        if have[letter] == want[letter]:
            agree += 1

    for i, ch in enumerate(text):
        touch(ord(ch) - 97, 1)
        if i >= k:
            touch(ord(text[i - k]) - 97, -1)
        if i >= k - 1 and agree == 26:
            out.append(i - k + 1)
    return out`,
  java: `public List<Integer> anagramPositions(String text, String pattern) {
    List<Integer> out = new ArrayList<>();
    int k = pattern.length();
    if (k > text.length()) return out;
    int[] want = new int[26];
    int[] have = new int[26];
    for (int i = 0; i < k; i++) want[pattern.charAt(i) - 'a']++;
    int agree = 0;
    for (int i = 0; i < 26; i++) if (want[i] == have[i]) agree++;
    for (int i = 0; i < text.length(); i++) {
        int in = text.charAt(i) - 'a';
        if (have[in] == want[in]) agree--;
        have[in]++;
        if (have[in] == want[in]) agree++;
        if (i >= k) {
            int outLetter = text.charAt(i - k) - 'a';
            if (have[outLetter] == want[outLetter]) agree--;
            have[outLetter]--;
            if (have[outLetter] == want[outLetter]) agree++;
        }
        if (i >= k - 1 && agree == 26) out.add(i - k + 1);
    }
    return out;
}`,
  cpp: `vector<int> anagramPositions(string text, string pattern) {
    vector<int> out;
    int k = (int)pattern.size();
    if (k > (int)text.size()) return out;
    vector<int> want(26, 0), have(26, 0);
    for (char ch : pattern) want[ch - 'a']++;
    int agree = 0;
    for (int i = 0; i < 26; i++) if (want[i] == have[i]) agree++;
    for (int i = 0; i < (int)text.size(); i++) {
        int in = text[i] - 'a';
        if (have[in] == want[in]) agree--;
        have[in]++;
        if (have[in] == want[in]) agree++;
        if (i >= k) {
            int gone = text[i - k] - 'a';
            if (have[gone] == want[gone]) agree--;
            have[gone]--;
            if (have[gone] == want[gone]) agree++;
        }
        if (i >= k - 1 && agree == 26) out.push_back(i - k + 1);
    }
    return out;
}`,
  walkthrough: [
    {
      cells: {
        values: ["c", "b", "a", "e", "b", "a", "b", "a", "c", "d"],
        marks: { 0: "window", 1: "window", 2: "window" },
        labels: { 0: "start 0" },
      },
      caption:
        'Pattern "abc" wants one a, one b and one c. The first window "cba" has exactly that: all 26 letters agree, so index 0 is an answer.',
    },
    {
      cells: {
        values: ["c", "b", "a", "e", "b", "a", "b", "a", "c", "d"],
        marks: { 1: "window", 2: "window", 3: "focus", 0: "compare" },
        labels: { 3: "in: e", 0: "out: c" },
      },
      caption:
        "Sliding by one adds 'e' and removes 'c'. Only those two letters can change their verdict — 'e' now has one too many and 'c' one too few, so agreement drops to 24.",
    },
    {
      cells: {
        values: ["c", "b", "a", "e", "b", "a", "b", "a", "c", "d"],
        marks: { 4: "window", 5: "window", 6: "window" },
      },
      caption:
        'Windows "bab" and friends keep the counter below 26: two b\'s and no c means two letters disagree. No comparison of the whole alphabet is ever made.',
    },
    {
      cells: {
        values: ["c", "b", "a", "e", "b", "a", "b", "a", "c", "d"],
        marks: { 6: "window", 7: "window", 8: "window" },
        labels: { 6: "start 6" },
      },
      caption:
        'At index 6 the window is "bac" — the same multiset as "abc", so the counter is back to 26 and 6 joins the answer.',
    },
    {
      cells: {
        values: ["a", "b", "a", "b"],
        marks: { 0: "done", 1: "done", 2: "done" },
        labels: { 0: "0,1,2" },
      },
      caption:
        'The overlap case "abab" with "ab": three windows, all anagrams. Nothing is skipped after a hit — the window advances by one, always.',
    },
  ],
  alternatives: [
    {
      name: "Sort every window",
      summary:
        "Sort the pattern once, then sort each window of the text and compare the two strings. The definition of an anagram, typed directly.",
      complexity: { time: "O(n · k log k)", space: "O(k)" },
      python: `def anagram_positions(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    target = sorted(pattern)
    out: list[int] = []
    for start in range(len(text) - k + 1):
        if sorted(text[start : start + k]) == target:
            out.append(start)
    return out`,
      java: `public List<Integer> anagramPositions(String text, String pattern) {
    List<Integer> out = new ArrayList<>();
    int k = pattern.length();
    char[] target = pattern.toCharArray();
    Arrays.sort(target);
    for (int start = 0; start + k <= text.length(); start++) {
        char[] window = text.substring(start, start + k).toCharArray();
        Arrays.sort(window);
        if (Arrays.equals(window, target)) out.add(start);
    }
    return out;
}`,
      cpp: `vector<int> anagramPositions(string text, string pattern) {
    vector<int> out;
    int k = (int)pattern.size();
    string target = pattern;
    sort(target.begin(), target.end());
    for (int start = 0; start + k <= (int)text.size(); start++) {
        string window = text.substr(start, k);
        sort(window.begin(), window.end());
        if (window == target) out.push_back(start);
    }
    return out;
}`,
    },
    {
      name: "Count every window from scratch",
      summary:
        "Replace sorting with counting: build a 26-slot tally for the pattern once, and a fresh tally for each window, then compare the two tallies.",
      complexity: { time: "O(n · k)", space: "O(1)" },
      whyNow:
        "Sorting a window costs k log k to answer a question that does not care about order at all — and it throws the sorted string away immediately. A tally of 26 counts decides the same thing in k steps, and two tallies compare in a fixed 26.",
      python: `def anagram_positions(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    want = [0] * 26
    for ch in pattern:
        want[ord(ch) - 97] += 1
    out: list[int] = []
    for start in range(len(text) - k + 1):
        have = [0] * 26
        for ch in text[start : start + k]:
            have[ord(ch) - 97] += 1
        if have == want:
            out.append(start)
    return out`,
      java: `public List<Integer> anagramPositions(String text, String pattern) {
    List<Integer> out = new ArrayList<>();
    int k = pattern.length();
    int[] want = new int[26];
    for (int i = 0; i < k; i++) want[pattern.charAt(i) - 'a']++;
    for (int start = 0; start + k <= text.length(); start++) {
        int[] have = new int[26];
        for (int i = start; i < start + k; i++) have[text.charAt(i) - 'a']++;
        if (Arrays.equals(have, want)) out.add(start);
    }
    return out;
}`,
      cpp: `vector<int> anagramPositions(string text, string pattern) {
    vector<int> out;
    int k = (int)pattern.size();
    vector<int> want(26, 0);
    for (char ch : pattern) want[ch - 'a']++;
    for (int start = 0; start + k <= (int)text.size(); start++) {
        vector<int> have(26, 0);
        for (int i = start; i < start + k; i++) have[text[i] - 'a']++;
        if (have == want) out.push_back(start);
    }
    return out;
}`,
    },
    {
      name: "Slide the tally, compare all 26",
      summary:
        "Keep one tally and update it as the window moves — add the entering letter, remove the leaving one — then compare the two tallies at each position.",
      complexity: { time: "O(26n)", space: "O(1)" },
      whyNow:
        "Two neighbouring windows share all but two letters, yet the per-window tally recounts every one of the k characters. Updating the tally instead of rebuilding it makes each step two operations, which is where the k disappears from the running time.",
      python: `def anagram_positions(text: str, pattern: str) -> list[int]:
    k = len(pattern)
    if k > len(text):
        return []
    want = [0] * 26
    have = [0] * 26
    for ch in pattern:
        want[ord(ch) - 97] += 1
    out: list[int] = []
    for i, ch in enumerate(text):
        have[ord(ch) - 97] += 1
        if i >= k:
            have[ord(text[i - k]) - 97] -= 1
        if i >= k - 1 and have == want:
            out.append(i - k + 1)
    return out`,
      java: `public List<Integer> anagramPositions(String text, String pattern) {
    List<Integer> out = new ArrayList<>();
    int k = pattern.length();
    if (k > text.length()) return out;
    int[] want = new int[26];
    int[] have = new int[26];
    for (int i = 0; i < k; i++) want[pattern.charAt(i) - 'a']++;
    for (int i = 0; i < text.length(); i++) {
        have[text.charAt(i) - 'a']++;
        if (i >= k) have[text.charAt(i - k) - 'a']--;
        if (i >= k - 1 && Arrays.equals(have, want)) out.add(i - k + 1);
    }
    return out;
}`,
      cpp: `vector<int> anagramPositions(string text, string pattern) {
    vector<int> out;
    int k = (int)pattern.size();
    if (k > (int)text.size()) return out;
    vector<int> want(26, 0), have(26, 0);
    for (char ch : pattern) want[ch - 'a']++;
    for (int i = 0; i < (int)text.size(); i++) {
        have[text[i] - 'a']++;
        if (i >= k) have[text[i - k] - 'a']--;
        if (i >= k - 1 && have == want) out.push_back(i - k + 1);
    }
    return out;
}`,
    },
  ],
}
