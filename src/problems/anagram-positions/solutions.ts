// anagram-positions — the ladder: every way in, worst first.
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

export const approach = "Count the pattern's letters, then run a window of that width over the text keeping a live count for the window and a counter of how many of the 26 letters agree with the pattern. Sliding adds the incoming letter and removes the outgoing one, adjusting the agreement counter only for those two letters — a letter's verdict can flip only when its own count changes. A window is an anagram exactly when all 26 letters agree."

export const whyNow = "Comparing the two count tables at every step is a fixed 26 comparisons, which is cheap but still repeats work the update already knew about: a slide changes exactly two letters, so at most two of the 26 verdicts can change. Carrying a count of how many letters currently match turns each step into two increments and a single equality test — the answer is 'match count is 26', and the alphabet never gets walked again."

export const arc = "Anagram means multiset, and multiset means counts — once that substitution is made, every rung is an argument about how much of the counting to redo. Sorting each window redoes all of it; recounting each window redoes k characters; sliding the tally redoes two; and tracking how many letters AGREE redoes nothing at all, because only a letter whose count changed can change its verdict. That last step is the one worth stealing: keep a summary of the comparison rather than recomputing the comparison, and update the summary exactly where the data changed. It is the same move that turns the minimum-window-substring check from 26 comparisons into one integer, and knowing the fixed-width window shape — enter one, leave one, test — covers a whole family of string problems."

export const complexity = { time: "O(n)", space: "O(1)" }

export const python = `def anagram_positions(text: str, pattern: str) -> list[int]:
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
    return out`

export const java = `public List<Integer> anagramPositions(String text, String pattern) {
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
}`

export const cpp = `vector<int> anagramPositions(string text, string pattern) {
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
}`

export const alternatives: Solution[] = [
  {
    name: "Sort every window",
    summary:
      "Sort the pattern once, then sort each window of the text and compare the two strings. It is the definition of an anagram typed straight out, and it re-sorts k characters at every one of the n positions, even though consecutive windows differ by a single letter at each end.",
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
      "Replace the sorting with counting: build a 26-slot tally of the pattern once, then a fresh tally for each window of the text and compare. That drops the log factor, and it still rebuilds the whole window tally from nothing at every position instead of editing the one it already had.",
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
      "Keep one tally and edit it as the window moves, adding the entering letter and subtracting the leaving one, then compare the two 26-slot tallies. The update is constant now; the comparison is still 26 slots per step, re-checking 24 counts that could not have changed since the previous move.",
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
]
