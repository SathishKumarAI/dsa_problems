import type { Problem } from "../../types.ts"

export const problem: Problem = {
  id: "word-break",
  title: "Can the Sentence Be Cut Into Words?",
  pattern: "dp",
  difficulty: "medium",
  leetcode: "word-break",
  brief: "Split a string entirely into dictionary words.",
  statement:
    "Given a string and a list of words, decide whether the string can be segmented into a sequence of one or more of those words. A word may be reused any number of times.",
  constraints: [
    "1 <= s.length <= 300, and 1 <= words.length <= 1000",
    "all strings are lowercase English letters",
    "words may be REUSED, so a dictionary of one word can still cover a long string",
    "the whole string must be consumed — a leftover tail means false",
  ],
  examples: [
    { input: 's = "leetcode", words = ["leet", "code"]', output: "true" },
    {
      input: 's = "applepenapple", words = ["apple", "pen"]',
      output: "true",
      note: "apple is used twice.",
    },
    {
      input: 's = "catsandog", words = ["cats", "dog", "sand", "and", "cat"]',
      output: "false",
      note: '"cats and og" and "cat sand og" both dead-end.',
    },
  ],
  hints: [
    "Define one boolean per position: can the string up to here be segmented?",
    "Position i is reachable if some earlier reachable position j is followed by a dictionary word ending at i.",
    "Position 0 is reachable by taking nothing, which seeds everything else.",
  ],
  whyNow:
    "The greedy version — take the longest matching word and continue — fails on inputs like catsandog, where an early long match ruins a later split. Backtracking fixes that but re-solves the same suffix along every path that reaches it. One boolean per position asks each question once, and reachability is exactly what the later positions need.",
  arc: "Three ideas stack here. Greedy is wrong first: taking the longest matching word and continuing dies on catsandog, where an early long match ruins a later split, and that counterexample is worth keeping. Backtracking fixes correctness and then re-solves the same suffix along every path that reaches it, which is the familiar exponential. The real move is storing reachability rather than the split itself — two different segmentations ending at the same position are interchangeable from there on, so one boolean per position holds everything the later positions need. Entry 0 is true because the empty prefix needs nothing, and the last entry is the answer. Know the double loop, for each end looking back at every reachable start and testing the text between, and know the dictionary belongs in a set because that inner test is the hot line. Word-break-II asks for the actual sentences, and there the boolean table can no longer stand alone.",
  approach:
    "Keep a boolean per position, where entry i means the first i characters can be segmented. Entry 0 is true, since the empty prefix needs nothing. For each position, look back at every earlier reachable position and check whether the text between them is a dictionary word; one hit is enough to mark the position reachable. The last entry is the answer. Storing reachability rather than the actual split is what collapses the exponential search — two different segmentations that end at the same place are interchangeable from there on.",
  complexity: { time: "O(n^2 · k)", space: "O(n)" },
  python: `def word_break(s: str, words: list[str]) -> bool:
    allowed = set(words)
    reachable = [False] * (len(s) + 1)
    reachable[0] = True
    for i in range(1, len(s) + 1):
        for j in range(i):
            if reachable[j] and s[j:i] in allowed:
                reachable[i] = True
                break
    return reachable[len(s)]`,
  java: `public boolean wordBreak(String s, String[] words) {
    Set<String> allowed = new HashSet<>(Arrays.asList(words));
    boolean[] reachable = new boolean[s.length() + 1];
    reachable[0] = true;
    for (int i = 1; i <= s.length(); i++)
        for (int j = 0; j < i; j++)
            if (reachable[j] && allowed.contains(s.substring(j, i))) {
                reachable[i] = true;
                break;
            }
    return reachable[s.length()];
}`,
  cpp: `bool wordBreak(const string& s, const vector<string>& words) {
    set<string> allowed(words.begin(), words.end());
    vector<bool> reachable(s.size() + 1, false);
    reachable[0] = true;
    for (int i = 1; i <= (int)s.size(); i++)
        for (int j = 0; j < i; j++)
            if (reachable[j] && allowed.count(s.substr(j, i - j))) {
                reachable[i] = true;
                break;
            }
    return reachable[s.size()];
}`,
  alternatives: [
    {
      name: "Backtrack over every split",
      summary:
        "Try each dictionary word as a prefix and recurse on what is left. Exponential in the worst case, and the waste is that the same suffix is re-tested after every different way of segmenting the text before it — whether the tail can be broken up has nothing to do with how the head was cut.",
      complexity: { time: "O(2^n)", space: "O(n)" },
      python: `def walk(s: str, at: int, allowed: set[str]) -> bool:
    if at == len(s):
        return True
    for end in range(at + 1, len(s) + 1):
        if s[at:end] in allowed and walk(s, end, allowed):
            return True
    return False


def word_break(s: str, words: list[str]) -> bool:
    return walk(s, 0, set(words))`,
      java: `public boolean walk(String s, int at, Set<String> allowed) {
    if (at == s.length()) return true;
    for (int end = at + 1; end <= s.length(); end++)
        if (allowed.contains(s.substring(at, end)) && walk(s, end, allowed)) return true;
    return false;
}

public boolean wordBreak(String s, String[] words) {
    return walk(s, 0, new HashSet<>(Arrays.asList(words)));
}`,
      cpp: `bool walk(const string& s, int at, const set<string>& allowed) {
    if (at == (int)s.size()) return true;
    for (int end = at + 1; end <= (int)s.size(); end++)
        if (allowed.count(s.substr(at, end - at)) && walk(s, end, allowed)) return true;
    return false;
}

bool wordBreak(const string& s, const vector<string>& words) {
    set<string> allowed(words.begin(), words.end());
    return walk(s, 0, allowed);
}`,
    },
  ],
}
