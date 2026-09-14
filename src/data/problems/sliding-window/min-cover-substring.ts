import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "min-cover-substring",
  title: "Smallest Covering Window",
  pattern: "sliding-window",
  difficulty: "hard",
  leetcode: "minimum-window-substring",
  brief: "Shortest substring of s containing every character of t.",
  statement:
    "Given strings s and t, return the shortest contiguous substring of s that contains every character of t, counting multiplicity. Return an empty string if none exists.",
  constraints: [
    "1 <= s.length, t.length <= 10^5",
    "s and t are upper and lower case English letters",
    "duplicates in t must each be covered",
    "return the empty string when no window covers t; the answer is unique",
  ],
  examples: [
    { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
    {
      input: 's = "a", t = "aa"',
      output: '""',
      note: "Two a's needed, one available.",
    },
  ],
  hints: [
    "Grow right until the window covers t; then you have a candidate, but maybe a fat one.",
    "While covered, shrink from the left to find the tightest version before growing again.",
    'Track "how many required characters are fully satisfied" as one integer so cover-checks are O(1), not a map comparison.',
  ],
  whyNow:
    "Comparing counters for every candidate substring re-counts characters that never changed. A window updated one character at a time keeps a single count of how many are satisfied and reads the answer off it.",
  arc: "The hardest window in the set, and the structure is what makes it manageable: grow the right edge until the window is valid, then shrink the left edge while it STAYS valid, recording the best as you shrink. Validity is the part to engineer — comparing full count tables per step is correct but wasteful, so the window carries a single number for 'how many required characters are currently satisfied', updated only when a character's own count crosses its requirement. That summary-instead-of-recompute move is the same one that makes the anagram window cheap. Rehearse duplicates in the pattern, which is where a presence-based set silently answers the wrong question.",
  approach:
    "Count the characters t needs. Slide the right edge, decrementing needs; when a character's need hits zero it is satisfied, tracked by a single counter. Once all are satisfied, advance the left edge while coverage holds, updating the best window each step; the first left-move that breaks coverage resumes right-expansion. Every index enters and leaves the window once.",
  complexity: { time: "O(|s| + |t|)", space: "O(alphabet)" },
  python: `from collections import Counter

def min_window(s: str, t: str) -> str:
    if not t or len(t) > len(s):
        return ""
    need = Counter(t)
    missing = len(t)
    best = (float("inf"), 0, 0)  # (length, start, end)
    left = 0
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1
    length, i, j = best
    return "" if length == float("inf") else s[i : j + 1]`,
  java: `public String minWindow(String s, String t) {
    if (t == null || t.length() == 0 || t.length() > s.length()) return "";
    int[] need = new int[256];
    for (int i = 0; i < t.length(); i++) need[t.charAt(i)]++;
    int missing = t.length();
    int bestLen = Integer.MAX_VALUE, bestStart = 0, bestEnd = 0;
    int left = 0;
    for (int right = 0; right < s.length(); right++) {
        char ch = s.charAt(right);
        if (need[ch] > 0) missing--;
        need[ch]--;
        while (missing == 0) {
            if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestStart = left; bestEnd = right; }
            char leftCh = s.charAt(left);
            need[leftCh]++;
            if (need[leftCh] > 0) missing++;
            left++;
        }
    }
    return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestEnd + 1);
}`,
  cpp: `string minWindow(const string& s, const string& t){
    if(t.empty() || t.size()>s.size()) return "";
    vector<int> need(256,0);
    for(char c: t) need[(unsigned char)c]++;
    int missing = t.size();
    int bestLen = INT_MAX, bestStart=0, bestEnd=0;
    int left=0;
    for(int right=0;right<(int)s.size();right++){
        char ch=s[right];
        if(need[(unsigned char)ch]>0) missing--;
        need[(unsigned char)ch]--;
        while(missing==0){
            if(right-left+1<bestLen){ bestLen=right-left+1; bestStart=left; bestEnd=right; }
            char leftCh=s[left];
            need[(unsigned char)leftCh]++;
            if(need[(unsigned char)leftCh]>0) missing++;
            left++;
        }
    }
    return bestLen==INT_MAX? "": s.substr(bestStart, bestEnd-bestStart+1);
}`,
  alternatives: [
    {
      name: "Brute force",
      summary:
        "Check every substring: does it contain all of t's characters (with multiplicity)? Counter comparison per candidate makes it brutally slow, but it defines correctness.",
      complexity: { time: "O(n² · alphabet)", space: "O(alphabet)" },
      python: `from collections import Counter

def min_window(s: str, t: str) -> str:
    need = Counter(t)
    best = ""
    for i in range(len(s)):
        for j in range(i, len(s)):
            window = Counter(s[i : j + 1])
            if all(window[c] >= need[c] for c in need):
                if not best or j - i + 1 < len(best):
                    best = s[i : j + 1]
                break  # longer j only makes it fatter
    return best`,
      java: `public String minWindow(String s, String t) {
    HashMap<Character,Integer> need = new HashMap<>();
    for (int i = 0; i < t.length(); i++) {
        char c = t.charAt(i);
        need.put(c, need.getOrDefault(c, 0) + 1);
    }
    String best = "";
    for (int i = 0; i < s.length(); i++) {
        for (int j = i; j < s.length(); j++) {
            HashMap<Character,Integer> window = new HashMap<>();
            for (int k = i; k <= j; k++) {
                char c = s.charAt(k);
                window.put(c, window.getOrDefault(c, 0) + 1);
            }
            boolean ok = true;
            for (Map.Entry<Character,Integer> e : need.entrySet()) {
                if (window.getOrDefault(e.getKey(), 0) < e.getValue()) { ok = false; break; }
            }
            if (ok) {
                if (best.isEmpty() || j - i + 1 < best.length()) {
                    best = s.substring(i, j + 1);
                }
                break;
            }
        }
    }
    return best;
}
`,
      cpp: `string minWindow(const string& s, const string& t) {
    unordered_map<char,int> need;
    for (int i = 0; i < (int)t.size(); ++i) {
        char c = t[i];
        need[c]++;
    }
    string best = "";
    for (int i = 0; i < (int)s.size(); ++i) {
        for (int j = i; j < (int)s.size(); ++j) {
            unordered_map<char,int> window;
            for (int k = i; k <= j; ++k) {
                char c = s[k];
                window[c]++;
            }
            bool ok = true;
            for (auto &p : need) {
                if (window[p.first] < p.second) { ok = false; break; }
            }
            if (ok) {
                if (best.empty() || j - i + 1 < (int)best.size()) {
                    best = s.substr(i, j - i + 1);
                }
                break;
            }
        }
    }
    return best;
}
`,
    },
  ],
}
