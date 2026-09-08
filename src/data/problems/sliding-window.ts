import type { Problem } from "../types.ts"

export const slidingWindow: Problem[] = [
  {
    id: "best-trade",
    title: "Single Buy/Sell Profit",
    pattern: "sliding-window",
    difficulty: "easy",
    leetcode: "best-time-to-buy-and-sell-stock",
    brief: "Max profit from one buy and one later sell.",
    statement:
      "Given prices where prices[i] is a stock's price on day i, pick one day to buy and a later day to sell so profit is maximised. Return the profit, or 0 if no profitable trade exists.",
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4",
      "the sell day must come after the buy day",
      "no profitable pair means a profit of 0, not a negative number",
    ],
    examples: [
      {
        input: "prices = [7, 1, 5, 3, 6, 4]",
        output: "5",
        note: "Buy at 1, sell at 6.",
      },
      {
        input: "prices = [5, 4, 3]",
        output: "0",
        note: "Prices only fall — don't trade.",
      },
    ],
    hints: [
      "For each sell day, the best buy day is simply the cheapest price seen so far.",
      "One pass: carry the running minimum and the running best profit.",
      "Selling before buying is impossible by construction — the minimum you compare against always comes from earlier days.",
    ],
    whyNow:
      "Every buy/sell pair asks the same question over and over. Walking once while remembering the cheapest day so far answers it with two numbers and no nested loop.",
    approach:
      "Scan left to right holding two numbers: the lowest price seen so far and the best profit so far. Each day, profit-if-sold-today is price minus that minimum; update both trackers. This is a shrunk sliding window: the left edge is always the historical minimum.",
    complexity: { time: "O(n)", space: "O(1)" },
    python: `def max_profit(prices: list[int]) -> int:
    lowest = float("inf")
    best = 0
    for p in prices:
        lowest = min(lowest, p)
        best = max(best, p - lowest)
    return best`,
    java: `public int maxProfit(int[] prices) {
    int lowest = Integer.MAX_VALUE;
    int best = 0;
    for (int p : prices) {
        lowest = Math.min(lowest, p);
        best = Math.max(best, p - lowest);
    }
    return best;
}`,
    cpp: `int maxProfit(const vector<int>& prices) {
    int lowest = INT_MAX;
    int best = 0;
    for (int p : prices) {
        if (p < lowest) lowest = p;
        int profit = p - lowest;
        if (profit > best) best = profit;
    }
    return best;
}`,
    walkthrough: [
      {
        cells: { values: [7, 1, 5, 3, 6, 4] },
        caption:
          "Track two numbers while scanning: lowest so far, best profit so far.",
      },
      {
        cells: { values: [7, 1, 5, 3, 6, 4], marks: { 0: "focus" } },
        caption: "Day 0: lowest = 7, best = 0.",
      },
      {
        cells: { values: [7, 1, 5, 3, 6, 4], marks: { 1: "focus" } },
        caption: "Day 1: price 1 < 7 → new lowest. Selling today would lose.",
      },
      {
        cells: {
          values: [7, 1, 5, 3, 6, 4],
          marks: { 1: "window", 2: "focus" },
        },
        caption: "Day 2: 5 − 1 = 4 → best = 4.",
      },
      {
        cells: {
          values: [7, 1, 5, 3, 6, 4],
          marks: { 1: "window", 4: "focus" },
        },
        caption:
          "Day 4: 6 − 1 = 5 → best = 5. Day 3 (profit 2) didn't beat it.",
      },
      {
        cells: { values: [7, 1, 5, 3, 6, 4], marks: { 1: "done", 4: "done" } },
        caption: "Answer 5: buy at 1, sell at 6. One pass, two variables.",
      },
    ],
    alternatives: [
      {
        name: "Brute force",
        summary: "Try every buy/sell day pair with the sell strictly later.",
        complexity: { time: "O(n²)", space: "O(1)" },
        python: `def max_profit(prices: list[int]) -> int:
    best = 0
    for i in range(len(prices)):
        for j in range(i + 1, len(prices)):
            best = max(best, prices[j] - prices[i])
    return best`,
        java: `public int maxProfit(int[] prices) {
    int best = 0;
    for (int i = 0; i < prices.length; i++) {
        for (int j = i + 1; j < prices.length; j++) {
            best = Math.max(best, prices[j] - prices[i]);
        }
    }
    return best;
}`,
        cpp: `int maxProfit(const vector<int>& prices) {
    int best = 0;
    for (int i = 0; i < (int)prices.size(); i++) {
        for (int j = i + 1; j < (int)prices.size(); j++) {
            best = max(best, prices[j] - prices[i]);
        }
    }
    return best;
}`,
      },
    ],
  },
  {
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
  },
  {
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
    walkthrough: [
      {
        text: "s = ADOBECODEBANC   t = ABC\n\nneed: {A:1, B:1, C:1}   missing = 3",
        caption: "Count what t requires.",
      },
      {
        text: "A D O B E C O D E B A N C\n└────────┘\nADOBEC — first covering window\n\nmissing = 0, length 6",
        caption: "Grow right until every requirement is met.",
      },
      {
        text: "A D O B E C O D E B A N C\n  └──────┘? shrink test:\ndrop A → missing = 1 → stop\n\nbest so far: ADOBEC (6)",
        caption: "Shrink left while still covered; first break stops it.",
      },
      {
        text: "continue right ... reach second B, then A:\n\nA D O B E C O D E B A N C\n          └───────┘\nCODEBA covers again — shrink → ODEBA? no C...\nshrink stops at C O D E B A (6)",
        caption:
          "Window re-covers as later duplicates arrive; keep tightening.",
      },
      {
        text: 'reach final C:\n\nA D O B E C O D E B A N C\n                  └─────┘\nBANC — length 4. Shrink breaks at B.\n\nanswer: "BANC"',
        caption: "Best window found: 4. Each index enters/leaves once — O(n).",
      },
    ],
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
    java.util.HashMap<Character,Integer> need = new java.util.HashMap<>();
    for (int i = 0; i < t.length(); i++) {
        char c = t.charAt(i);
        need.put(c, need.getOrDefault(c, 0) + 1);
    }
    String best = "";
    for (int i = 0; i < s.length(); i++) {
        for (int j = i; j < s.length(); j++) {
            java.util.HashMap<Character,Integer> window = new java.util.HashMap<>();
            for (int k = i; k <= j; k++) {
                char c = s.charAt(k);
                window.put(c, window.getOrDefault(c, 0) + 1);
            }
            boolean ok = true;
            for (java.util.Map.Entry<Character,Integer> e : need.entrySet()) {
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
  },
]
